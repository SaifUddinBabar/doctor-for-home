import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";
const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function runPhase2Tests() {
  console.log("==================================================");
  console.log("DOCTORFORHOME — PHASE 2 AUTOMATED INTEGRATION TESTS");
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

  try {
    // ----------------------------------------------------
    // SETUP: Helper to login and get session cookie
    // ----------------------------------------------------
    async function login(email, password) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const cookie = res.headers.get("set-cookie") || "";
      const data = await res.json();
      return { status: res.status, cookie, user: data.user };
    }

    // ----------------------------------------------------
    // SECTION 1: Doctor Search & Discovery (Database Backed)
    // ----------------------------------------------------
    console.log("--- 1. Testing Doctor Search & Discovery ---");

    const searchRes = await fetch(`${BASE_URL}/api/doctors`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200, "GET /api/doctors returns HTTP 200");
    assert(Array.isArray(searchData.doctors), "Doctors returned as array");
    assert(searchData.doctors.length > 0, `Database has ${searchData.doctors.length} approved doctors`);
    assert(
      searchData.doctors.every((d) => d.verificationStatus === "APPROVED"),
      "All publicly returned doctors have verificationStatus === 'APPROVED'"
    );
    assert(
      searchData.doctors.every((d) => !!d.bmdcNumber),
      "All doctors have BMDC registration numbers displayed"
    );

    // Search by text
    const textSearchRes = await fetch(`${BASE_URL}/api/doctors?search=Cardiology`);
    const textSearchData = await textSearchRes.json();
    assert(
      textSearchData.doctors.some((d) => d.specialty.includes("Cardiology") || d.name.includes("Cardiology")),
      "Doctor text search matches 'Cardiology'"
    );

    // Filter by specialty
    const specialtyRes = await fetch(`${BASE_URL}/api/doctors?specialty=Pediatrics`);
    const specialtyData = await specialtyRes.json();
    assert(
      specialtyData.doctors.every((d) => d.specialty === "Pediatrics"),
      "Specialty filter strictly returns Pediatrics doctors"
    );

    // Sorting by fee
    const sortFeeRes = await fetch(`${BASE_URL}/api/doctors?sort=fee_asc`);
    const sortFeeData = await sortFeeRes.json();
    const fees = sortFeeData.doctors.map((d) => d.fee);
    const isSortedFee = fees.every((f, i) => i === 0 || f >= fees[i - 1]);
    assert(isSortedFee, "Sort by fee_asc produces correctly ordered prices");

    // Individual doctor profile
    const sampleDoctor = searchData.doctors[0];
    const singleDoctorRes = await fetch(`${BASE_URL}/api/doctors/${sampleDoctor.id}`);
    const singleDoctorData = await singleDoctorRes.json();
    assert(singleDoctorRes.status === 200, `GET /api/doctors/${sampleDoctor.id} returns 200`);
    assert(singleDoctorData.doctor.id === sampleDoctor.id, "Correct doctor profile retrieved");
    assert(Array.isArray(singleDoctorData.doctor.availableDays), "Doctor availableDays parsed as array");
    assert(Array.isArray(singleDoctorData.doctor.availableTimeSlots), "Doctor availableTimeSlots parsed as array");

    // Security: Unapproved doctor profile is hidden from public
    const pendingDoctor = await prisma.doctorProfile.findFirst({
      where: { verificationStatus: "PENDING" },
    });
    if (pendingDoctor) {
      const pendingRes = await fetch(`${BASE_URL}/api/doctors/${pendingDoctor.id}`);
      assert(pendingRes.status === 403, "Public access to PENDING doctor profile is rejected with 403");
    }

    // ----------------------------------------------------
    // SECTION 2: Doctor Profile & Availability Management
    // ----------------------------------------------------
    console.log("\n--- 2. Testing Doctor Profile & Availability Management ---");

    // Login as a doctor
    const doctorLogin = await login("drsarahmitchell@doctorforhome.com", "DoctorPassword123!");
    assert(doctorLogin.status === 200, "Doctor login successful");

    // Doctor retrieves their own profile
    const docProfileRes = await fetch(`${BASE_URL}/api/doctor/profile`, {
      headers: { Cookie: doctorLogin.cookie },
    });
    const docProfileData = await docProfileRes.json();
    assert(docProfileRes.status === 200, "Doctor GET /api/doctor/profile returns 200");
    assert(docProfileData.profile.bmdcNumber?.startsWith("BMDC-A-"), "Profile contains valid BMDC number");

    // Doctor updates availability & consultation fees
    const updateRes = await fetch(`${BASE_URL}/api/doctor/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorLogin.cookie,
      },
      body: JSON.stringify({
        consultationFee: 750,
        homeVisitFee: 1200,
        bio: "Updated clinical specialist bio for testing.",
        availableDays: ["Monday", "Wednesday", "Friday"],
        availableTimeSlots: ["10:00", "11:00", "14:00", "16:00"],
        blockedDates: ["2026-12-25"],
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, "Doctor PATCH /api/doctor/profile returns 200");
    assert(updateData.profile.consultationFee === 750, "Consultation fee updated in database to 750");

    // Security: Doctor cannot self-approve or modify verification status
    const exploitRes = await fetch(`${BASE_URL}/api/doctor/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorLogin.cookie,
      },
      body: JSON.stringify({
        verificationStatus: "SUSPENDED",
      }),
    });
    assert(exploitRes.status === 403, "Doctor attempting to modify verificationStatus is rejected with 403");

    // Security: Doctor cannot alter BMDC number
    const bmdcExploitRes = await fetch(`${BASE_URL}/api/doctor/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: doctorLogin.cookie,
      },
      body: JSON.stringify({
        bmdcNumber: "BMDC-FAKE-99999",
      }),
    });
    assert(bmdcExploitRes.status === 403, "Doctor attempting to alter BMDC number is rejected with 403");

    // ----------------------------------------------------
    // SECTION 3: Appointment Booking & Slot Conflict Prevention
    // ----------------------------------------------------
    console.log("\n--- 3. Testing Appointment Booking & Slot Conflict Prevention ---");

    // Register / login a patient
    const patientEmail = `p2.patient.${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Rahim Patient",
        email: patientEmail,
        password: "PatientPass123!",
        role: "Patient",
      }),
    });
    const patientLogin = await login(patientEmail, "PatientPass123!");
    assert(patientLogin.status === 200, "Patient registered and logged in");

    // Doctor profile updated earlier works on Monday, Wednesday, Friday at 10:00, 11:00, 14:00, 16:00
    // Blocked on 2026-12-25 (which is a Friday)

    // A) Past date rejection
    const pastBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: patientLogin.cookie },
      body: JSON.stringify({
        doctorId: docProfileData.profile.id,
        patientName: "Rahim Patient",
        phone: "+8801711223344",
        date: "2020-01-01",
        time: "10:00",
      }),
    });
    assert(pastBookingRes.status === 400, "Booking for past date is rejected with 400");

    // B) Blocked date rejection (2026-12-25)
    const blockedBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: patientLogin.cookie },
      body: JSON.stringify({
        doctorId: docProfileData.profile.id,
        patientName: "Rahim Patient",
        phone: "+8801711223344",
        date: "2026-12-25",
        time: "10:00",
      }),
    });
    assert(blockedBookingRes.status === 400, "Booking on doctor's blocked date (holiday) is rejected with 400");

    // C) Unavailable day rejection (Pick a Sunday, e.g. 2026-11-15 is Sunday)
    const unavailableDayRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: patientLogin.cookie },
      body: JSON.stringify({
        doctorId: docProfileData.profile.id,
        patientName: "Rahim Patient",
        phone: "+8801711223344",
        date: "2026-11-15", // Sunday
        time: "10:00",
      }),
    });
    assert(unavailableDayRes.status === 400, "Booking on day doctor does not practice (Sunday) is rejected with 400");

    // D) Valid booking on an allowed day (2026-11-16 is a Monday)
    // Clean up any appointment from previous test runs to allow idempotent re-testing
    await prisma.appointment.deleteMany({
      where: {
        doctorId: docProfileData.profile.id,
        scheduledDate: "2026-11-16",
        scheduledTime: "10:00",
      },
    });

    const validBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: patientLogin.cookie },
      body: JSON.stringify({
        doctorId: docProfileData.profile.id,
        patientName: "Rahim Patient",
        phone: "+8801711223344",
        address: "Dhanmondi 27, Dhaka",
        date: "2026-11-16", // Monday
        time: "10:00",
        appointmentType: "Online Consultation",
      }),
    });
    const validBookingData = await validBookingRes.json();
    assert(validBookingRes.status === 201, "Valid appointment booking returns 201 Created");
    assert(validBookingData.status === "PENDING", "Initial appointment status is PENDING");
    const testAppointmentId = validBookingData.appointmentId;
    assert(!!testAppointmentId, "Appointment ID returned upon booking");

    // E) DOUBLE BOOKING PREVENTION: same doctor + date + time slot
    const doubleBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: patientLogin.cookie },
      body: JSON.stringify({
        doctorId: docProfileData.profile.id,
        patientName: "Second Patient",
        phone: "+8801811223344",
        date: "2026-11-16",
        time: "10:00",
      }),
    });
    assert(doubleBookingRes.status === 409, "Double booking same slot returns HTTP 409 Conflict");

    // ----------------------------------------------------
    // SECTION 4: Appointment Status Synchronization & Workflow
    // ----------------------------------------------------
    console.log("\n--- 4. Testing Appointment Status Synchronization & Workflow ---");

    // Doctor checks appointments
    const docApptsRes = await fetch(`${BASE_URL}/api/appointments`, {
      headers: { Cookie: doctorLogin.cookie },
    });
    const docApptsData = await docApptsRes.json();
    const createdApt = docApptsData.appointments.find((a) => a.id === testAppointmentId);
    assert(!!createdApt, "Doctor sees incoming pending appointment request");

    // Doctor accepts -> CONFIRMED
    const confirmRes = await fetch(`${BASE_URL}/api/appointments/${testAppointmentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: doctorLogin.cookie },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    const confirmData = await confirmRes.json();
    assert(confirmRes.status === 200, "Doctor can transition PENDING -> CONFIRMED");
    assert(confirmData.appointment.status === "CONFIRMED", "Appointment status updated to CONFIRMED");

    // Verify patient received in-app notification
    const patientNotifsRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Cookie: patientLogin.cookie },
    });
    const patientNotifsData = await patientNotifsRes.json();
    assert(
      patientNotifsData.notifications.some((n) => n.title.includes("CONFIRMED")),
      "Patient received in-app notification upon doctor confirming appointment"
    );

    // Doctor completes consultation -> COMPLETED
    const completeRes = await fetch(`${BASE_URL}/api/appointments/${testAppointmentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: doctorLogin.cookie },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    assert(completeRes.status === 200, "Doctor can transition CONFIRMED -> COMPLETED");

    // Patient cancellation workflow on another appointment
    const secondBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: patientLogin.cookie },
      body: JSON.stringify({
        doctorId: docProfileData.profile.id,
        patientName: "Rahim Patient",
        phone: "+8801711223344",
        date: "2026-11-16",
        time: "11:00",
      }),
    });
    const secondBookingData = await secondBookingRes.json();
    const secondAptId = secondBookingData.appointmentId;

    // Patient cancels their own appointment
    const cancelRes = await fetch(`${BASE_URL}/api/appointments/${secondAptId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: patientLogin.cookie },
      body: JSON.stringify({ status: "CANCELLED", reason: "Patient had schedule conflict" }),
    });
    assert(cancelRes.status === 200, "Patient can cancel their pending appointment");

    // Security: Patient cannot confirm appointments
    const illegalConfirmRes = await fetch(`${BASE_URL}/api/appointments/${secondAptId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: patientLogin.cookie },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    assert(illegalConfirmRes.status === 403, "Patient cannot confirm appointments (403 Forbidden)");

    // ----------------------------------------------------
    // SECTION 5: Email OTP-Based Password Recovery
    // ----------------------------------------------------
    console.log("\n--- 5. Testing Email OTP Password Recovery ---");

    // Request OTP for patient
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: patientEmail }),
    });
    assert(forgotRes.status === 200, "POST /api/auth/forgot-password returns 200");

    // Check user record has otpHash and otpExpires in DB
    const patientUser = await prisma.user.findUnique({
      where: { email: patientEmail },
    });
    assert(!!patientUser?.otpHash, "OTP hash stored securely in database");
    assert(!!patientUser?.otpExpires && patientUser.otpExpires > new Date(), "OTP expiry set to future (5 min)");

    // Cooldown test: Immediate second request within 60s
    const cooldownRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: patientEmail }),
    });
    assert(cooldownRes.status === 429, "Rate limiter enforces 60-second cooldown (HTTP 429)");

    // Test Invalid OTP rejection
    const invalidOtpRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: patientEmail,
        otp: "000000",
        newPassword: "BrandNewPassword123!",
      }),
    });
    assert(invalidOtpRes.status === 400, "Incorrect OTP code rejected with HTTP 400");

    // Now generate a known OTP directly into DB to test successful reset
    const testOtp = "789123";
    const testOtpHash = crypto.createHash("sha256").update(testOtp).digest("hex");
    await prisma.user.update({
      where: { id: patientUser.id },
      data: {
        otpHash: testOtpHash,
        otpExpires: new Date(Date.now() + 5 * 60 * 1000),
        otpAttempts: 0,
      },
    });

    // Reset password with valid OTP
    const resetSuccessRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: patientEmail,
        otp: testOtp,
        newPassword: "BrandNewPassword123!",
      }),
    });
    assert(resetSuccessRes.status === 200, "Reset password with valid OTP returns 200");

    // Verify user can login with NEW password
    const newLoginRes = await login(patientEmail, "BrandNewPassword123!");
    assert(newLoginRes.status === 200, "Login with new password succeeds");

    // Verify OLD password fails
    const oldLoginRes = await login(patientEmail, "PatientPass123!");
    assert(oldLoginRes.status === 401, "Login with old password fails (401)");

    // ----------------------------------------------------
    // SECTION 6: Notification Center APIs
    // ----------------------------------------------------
    console.log("\n--- 6. Testing Notification Center ---");

    const notifsRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Cookie: newLoginRes.cookie },
    });
    const notifsData = await notifsRes.json();
    assert(notifsRes.status === 200, "GET /api/notifications returns 200");
    assert(typeof notifsData.unreadCount === "number", "Unread count returned as number");

    // Mark all notifications read
    const markAllRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: newLoginRes.cookie },
      body: JSON.stringify({ all: true }),
    });
    assert(markAllRes.status === 200, "PATCH /api/notifications (all: true) returns 200");

    const recheckNotifsRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Cookie: newLoginRes.cookie },
    });
    const recheckData = await recheckNotifsRes.json();
    assert(recheckData.unreadCount === 0, "All notifications successfully marked as read (unreadCount === 0)");

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log(`PHASE 2 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution exception:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase2Tests();
