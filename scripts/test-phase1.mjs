import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";
const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("==================================================");
  console.log("DOCTORFORHOME — PHASE 1 AUTOMATED INTEGRATION TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Database Migration Verification
  console.log("--- 1. Testing Existing User Migration ---");
  const migratedPatient = await prisma.user.findUnique({
    where: { email: "mdbabar4202@gmail.com" },
    include: { patientProfile: true },
  });
  assert(!!migratedPatient, "Migrated patient (mdbabar4202@gmail.com) exists in Prisma DB");
  assert(migratedPatient?.role === "Patient", "Migrated patient has role 'Patient'");
  assert(!!migratedPatient?.patientProfile, "Migrated patient has associated PatientProfile");

  const migratedDoctor = await prisma.user.findUnique({
    where: { email: "mdbabar2022@gmail.com" },
    include: { doctorProfile: true },
  });
  assert(!!migratedDoctor, "Migrated doctor (mdbabar2022@gmail.com) exists in Prisma DB");
  assert(migratedDoctor?.role === "Doctor", "Migrated doctor has role 'Doctor'");
  assert(!!migratedDoctor?.doctorProfile?.bmdcNumber, "Migrated doctor has BMDC Registration Number");

  // TEST 2: Patient Registration & Login over HTTP
  console.log("\n--- 2. Testing Patient Registration & Login ---");
  const testPatientEmail = `test.patient.${Date.now()}@example.com`;
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Jane Doe Patient",
      email: testPatientEmail,
      password: "Password123!",
      role: "Patient",
    }),
  });
  const signupData = await signupRes.json();
  assert(signupRes.status === 201, `Patient registration HTTP status 201 (got ${signupRes.status})`);
  assert(signupData.user?.email === testPatientEmail, "Patient registered with correct email");
  assert(signupData.redirectUrl === "/dashboard/patient", "Patient receives redirectUrl = /dashboard/patient");

  // Login with newly created patient
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testPatientEmail,
      password: "Password123!",
    }),
  });
  const loginCookie = loginRes.headers.get("set-cookie");
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, `Patient login HTTP status 200 (got ${loginRes.status})`);
  assert(loginData.user?.role === "Patient", "Patient login returns role 'Patient'");
  assert(loginData.redirectUrl === "/dashboard/patient", "Patient login returns redirectUrl = /dashboard/patient");
  assert(!!loginCookie && loginCookie.includes("doctors4home_session="), "HttpOnly session cookie set upon login");

  // TEST 3: Doctor Registration with BMDC Number
  console.log("\n--- 3. Testing Doctor Registration with BMDC ---");
  const testDoctorEmail = `test.doctor.${Date.now()}@example.com`;
  const testBmdc = `BMDC-A-${Math.floor(10000 + Math.random() * 89999)}`;
  const doctorSignupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Dr. Farhana Ahmed",
      email: testDoctorEmail,
      password: "DoctorPass123!",
      role: "Doctor",
      bmdcNumber: testBmdc,
      specialization: "Cardiology",
      qualifications: "MBBS, MD (Cardiology)",
      experienceYears: 8,
      consultationFee: 800,
    }),
  });
  const doctorSignupData = await doctorSignupRes.json();
  assert(doctorSignupRes.status === 201, `Doctor registration HTTP status 201 (got ${doctorSignupRes.status})`);
  assert(doctorSignupData.redirectUrl === "/dashboard/doctor", "Doctor receives redirectUrl = /dashboard/doctor");

  const doctorDbRecord = await prisma.user.findUnique({
    where: { email: testDoctorEmail },
    include: { doctorProfile: true },
  });
  assert(doctorDbRecord?.doctorProfile?.bmdcNumber === testBmdc, "Doctor BMDC number stored accurately in DB");
  assert(doctorDbRecord?.doctorProfile?.verificationStatus === "PENDING", "Doctor initial status is 'PENDING'");

  // TEST 4: Admin Authentication
  console.log("\n--- 4. Testing Admin Authentication ---");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@doctorforhome.com",
      password: "AdminPassword123!",
    }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  const adminLoginData = await adminLoginRes.json();
  assert(adminLoginRes.status === 200, "Admin login successful with HTTP 200");
  assert(adminLoginData.user?.role === "Admin", "Admin has role 'Admin'");
  assert(adminLoginData.redirectUrl === "/dashboard/admin", "Admin receives redirectUrl = /dashboard/admin");

  // Extract clean cookie for requests
  const adminCookieHeader = adminCookie ? adminCookie.split(";")[0] : "";
  const patientCookieHeader = loginCookie ? loginCookie.split(";")[0] : "";

  // TEST 5: Role-based Route Protection
  console.log("\n--- 5. Testing Role-based Route Protection ---");
  // Try accessing admin doctors API with patient cookie -> Should return 403
  const unauthorizedRes = await fetch(`${BASE_URL}/api/admin/doctors`, {
    headers: { Cookie: patientCookieHeader },
  });
  assert(unauthorizedRes.status === 403, `Patient blocked from Admin API with HTTP 403 (got ${unauthorizedRes.status})`);

  // Access with admin cookie -> Should return 200
  const authorizedRes = await fetch(`${BASE_URL}/api/admin/doctors`, {
    headers: { Cookie: adminCookieHeader },
  });
  const authorizedData = await authorizedRes.json();
  assert(authorizedRes.status === 200, `Admin successfully accesses Admin API with HTTP 200 (got ${authorizedRes.status})`);
  assert(Array.isArray(authorizedData.doctors), "Admin receives array of doctors");

  // TEST 6: Doctor Approval Workflow
  console.log("\n--- 6. Testing Doctor Approval Workflow ---");
  const doctorToApprove = doctorDbRecord.doctorProfile;
  const approveRes = await fetch(`${BASE_URL}/api/admin/doctors`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookieHeader,
    },
    body: JSON.stringify({
      doctorId: doctorToApprove.id,
      status: "APPROVED",
      notes: "BMDC verified against Bangladesh Medical and Dental Council Registry.",
    }),
  });
  const approveData = await approveRes.json();
  assert(approveRes.status === 200, `Doctor approval HTTP status 200 (got ${approveRes.status})`);
  assert(approveData.doctor?.verificationStatus === "APPROVED", "Doctor profile status updated to APPROVED");

  // Verify Audit Log was generated
  const auditLog = await prisma.auditLog.findFirst({
    where: { action: "DOCTOR_VERIFICATION_APPROVED" },
    orderBy: { createdAt: "desc" },
  });
  assert(!!auditLog, "AuditLog record created for doctor approval");

  // TEST 7: Appointment Database Persistence
  console.log("\n--- 7. Testing Appointment Persistence in Database ---");
  // Clean up any existing test appointment on that date/time to avoid intentional conflict check
  await prisma.appointment.deleteMany({
    where: { scheduledDate: "2026-11-20", scheduledTime: "15:00" },
  });
  const bookingRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appointmentType: "Home Visit",
      patientName: "Karim Ullah",
      email: "karim@example.com",
      phone: "+8801712345678",
      date: "2026-11-20",
      time: "15:00",
      notes: "Routine elderly health checkup at home",
    }),
  });
  const bookingData = await bookingRes.json();
  assert(bookingRes.status === 201, `Booking created with HTTP 201 (got ${bookingRes.status})`);
  assert(!!bookingData.appointmentId, `Database generated appointmentId: ${bookingData.appointmentId}`);

  const savedApt = await prisma.appointment.findUnique({
    where: { id: bookingData.appointmentId },
  });
  assert(!!savedApt, "Appointment record verified in SQLite database");
  assert(savedApt?.patientName === "Karim Ullah", "Appointment patientName stored correctly");
  assert(savedApt?.status === "PENDING", "Appointment initialized with status PENDING");

  // TEST 8: Groq AI Symptom Chatbot Verification
  console.log("\n--- 8. Testing Groq AI Chatbot Endpoint ---");
  const chatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", parts: [{ type: "text", text: "Hello, I have a mild headache" }] }],
    }),
  });
  assert(chatRes.status === 200, `Chat API returned HTTP 200 (got ${chatRes.status})`);
  const contentType = chatRes.headers.get("content-type") || "";
  assert(contentType.includes("text/event-stream") || contentType.includes("application/octet-stream"), "Chat API returned streaming response");

  // TEST 9: Dashboard Route Accessibility
  console.log("\n--- 9. Testing Dashboard Route Accessibility ---");
  const patientDashRes = await fetch(`${BASE_URL}/dashboard/patient`, {
    headers: { Cookie: patientCookieHeader },
  });
  assert(patientDashRes.status === 200, `Patient dashboard accessible for patient (HTTP ${patientDashRes.status})`);

  const adminDashRes = await fetch(`${BASE_URL}/dashboard/admin`, {
    headers: { Cookie: adminCookieHeader },
  });
  assert(adminDashRes.status === 200, `Admin dashboard accessible for admin (HTTP ${adminDashRes.status})`);

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
