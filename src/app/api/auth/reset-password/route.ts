import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import crypto from "node:crypto";

const MAX_OTP_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, 6-digit OTP code, and new password are required." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Verification code must be exactly 6 digits." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.otpHash || !user.otpExpires) {
      return NextResponse.json(
        { error: "No active verification code found for this email. Please request a new code." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > user.otpExpires) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpHash: null, otpExpires: null },
      });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check attempts limit
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpHash: null, otpExpires: null },
      });
      return NextResponse.json(
        { error: "Too many failed attempts. This verification code has been invalidated. Please request a new code." },
        { status: 429 }
      );
    }

    // Compare hashed OTP using timingSafeEqual
    const computedHash = crypto.createHash("sha256").update(otp).digest("hex");
    const storedHash = user.otpHash;

    const isMatch =
      computedHash.length === storedHash.length &&
      crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));

    if (!isMatch) {
      const updatedAttempts = user.otpAttempts + 1;
      const remainingAttempts = Math.max(0, MAX_OTP_ATTEMPTS - updatedAttempts);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpAttempts: updatedAttempts,
          ...(remainingAttempts === 0 ? { otpHash: null, otpExpires: null } : {}),
        },
      });

      return NextResponse.json(
        {
          error: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`,
          attemptsRemaining: remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP matched! Update password and clear OTP fields
    const newPasswordHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        otpHash: null,
        otpExpires: null,
        otpAttempts: 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_SUCCESS",
        targetResource: `User:${user.id}`,
        details: JSON.stringify({ email }),
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Password Changed Successfully",
        message: "Your DoctorForHome account password was recently reset. If this was not you, please contact support immediately.",
        type: "WARNING",
      },
    });

    return NextResponse.json({
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("POST /api/auth/reset-password error:", err);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
