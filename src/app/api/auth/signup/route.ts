import { NextResponse } from "next/server";
import { createSessionToken, hashPassword, SESSION_COOKIE, SESSION_MAX_AGE, type UserRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please provide valid registration details." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Please provide valid registration details." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role as string;

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Please provide a valid full name (under 100 characters)." }, { status: 400 });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (!password || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
  }
  if (!["Patient", "Doctor", "Admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
  }

  // Admin key check
  if (role === "Admin") {
    const adminKey = typeof body.adminKey === "string" ? body.adminKey.trim() : "";
    const expectedKey = process.env.ADMIN_REGISTRATION_KEY ?? "admin-secret-register-key-2026";
    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized: Invalid Admin Registration Key." }, { status: 403 });
    }
  }

  // Doctor-specific validations
  let specialization = "";
  let bmdcNumber = "";
  let qualifications = "";
  let experienceYears = 0;
  let consultationFee = 0;

  if (role === "Doctor") {
    specialization = typeof body.specialization === "string" ? body.specialization.trim() : "General Physician";
    bmdcNumber = typeof body.bmdcNumber === "string" ? body.bmdcNumber.trim() : "";
    qualifications = typeof body.qualifications === "string" ? body.qualifications.trim() : "MBBS";
    experienceYears = typeof body.experienceYears === "number" ? body.experienceYears : Number(body.experienceYears) || 0;
    consultationFee = typeof body.consultationFee === "number" ? body.consultationFee : Number(body.consultationFee) || 500;

    if (!bmdcNumber || bmdcNumber.length < 3) {
      return NextResponse.json(
        { error: "BMDC Registration Number is required for doctor registration." },
        { status: 400 }
      );
    }

    const existingBmdc = await prisma.doctorProfile.findUnique({
      where: { bmdcNumber },
    });
    if (existingBmdc) {
      return NextResponse.json(
        { error: "A doctor profile with this BMDC Registration Number already exists." },
        { status: 409 }
      );
    }
  }

  // Check email collision
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  try {
    const userRole = role as UserRole;
    const passwordHash = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: userRole,
        passwordHash,
        phone: typeof body.phone === "string" ? body.phone.trim() : null,
        emailVerified: true,
      },
    });

    if (userRole === "Patient") {
      await prisma.patientProfile.create({
        data: {
          userId: newUser.id,
          gender: typeof body.gender === "string" ? body.gender : null,
          address: typeof body.address === "string" ? body.address : null,
        },
      });
    } else if (userRole === "Doctor") {
      await prisma.doctorProfile.create({
        data: {
          userId: newUser.id,
          specialization: specialization || "General Physician",
          bmdcNumber,
          qualifications: qualifications || "MBBS",
          experienceYears,
          consultationFee,
          verificationStatus: "PENDING",
        },
      });
    }

    // Determine redirect dashboard
    const dashboardUrl =
      userRole === "Admin"
        ? "/dashboard/admin"
        : userRole === "Doctor"
        ? "/dashboard/doctor"
        : "/dashboard/patient";

    const response = NextResponse.json(
      {
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: userRole },
        redirectUrl: dashboardUrl,
      },
      { status: 201 }
    );

    response.cookies.set(SESSION_COOKIE, createSessionToken({ id: newUser.id, name: newUser.name, email: newUser.email, role: userRole }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during registration. Please try again." }, { status: 500 });
  }
}
