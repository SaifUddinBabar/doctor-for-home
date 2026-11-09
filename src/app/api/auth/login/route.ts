import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, verifyPassword, type UserRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please provide your email and password." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Please provide your email and password." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password || password.length > 128) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctorProfile: true,
      },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const userRole = user.role as UserRole;
    const dashboardUrl =
      userRole === "Admin"
        ? "/dashboard/admin"
        : userRole === "Doctor"
        ? "/dashboard/doctor"
        : "/dashboard/patient";

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        doctorVerificationStatus: user.doctorProfile?.verificationStatus ?? null,
      },
      redirectUrl: dashboardUrl,
    });

    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken({ id: user.id, name: user.name, email: user.email, role: userRole }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      }
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Unable to process login. Please try again." }, { status: 500 });
  }
}
