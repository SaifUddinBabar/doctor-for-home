import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import crypto from "node:crypto";

const COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_MINUTES = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // To prevent user enumeration attacks in production, respond with success message
    if (!user) {
      return NextResponse.json({
        message: "If an account with this email exists, a 6-digit verification code has been sent.",
        userNotFound: true,
      });
    }

    // Check cooldown (60 seconds)
    if (user.otpLastSent) {
      const elapsedSeconds = Math.floor((Date.now() - user.otpLastSent.getTime()) / 1000);
      if (elapsedSeconds < COOLDOWN_SECONDS) {
        const remaining = COOLDOWN_SECONDS - elapsedSeconds;
        return NextResponse.json(
          { error: `Please wait ${remaining} seconds before requesting another verification code.` },
          { status: 429 }
        );
      }
    }

    // Generate secure 6-digit numeric OTP (100000 - 999999)
    const otpNumber = crypto.randomInt(100000, 1000000);
    const otp = otpNumber.toString();

    // Hash OTP using SHA-256
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpHash,
        otpExpires,
        otpAttempts: 0,
        otpLastSent: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_OTP_REQUESTED",
        targetResource: `User:${user.id}`,
        details: JSON.stringify({ email }),
      },
    });

    // Send email OTP (via SMTP, Resend, or local fallback)
    const emailResult = await sendOtpEmail({
      to: email,
      otp,
      purpose: "Password Reset",
    });

    const isRealEmailSent = emailResult.delivered;

    return NextResponse.json({
      message: isRealEmailSent
        ? `A 6-digit verification code has been sent to ${email}. Check your inbox and spam folder.`
        : "A 6-digit verification code has been generated.",
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      deliveryMethod: emailResult.method,
      isRealEmailSent,
      // Provide devOtp when real email delivery is not configured, allowing smooth localhost testing
      devOtp: isRealEmailSent ? undefined : otp,
    });
  } catch (err) {
    console.error("POST /api/auth/forgot-password error:", err);
    return NextResponse.json({ error: "Failed to process password reset request." }, { status: 500 });
  }
}
