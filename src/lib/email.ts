/**
 * Email service provider for DoctorForHome.
 * Supports SMTP (Gmail, SendGrid, etc.) via Nodemailer, Resend API, and local console logging.
 */
import nodemailer from "nodemailer";

interface SendOtpParams {
  to: string;
  otp: string;
  purpose?: string;
}

export interface SendOtpResult {
  delivered: boolean;
  method: "smtp" | "resend" | "console";
  message: string;
  error?: string;
}

export async function sendOtpEmail({ to, otp, purpose = "Password Reset" }: SendOtpParams): Promise<SendOtpResult> {
  const timestamp = new Date().toISOString();
  console.log(`\n======================================================`);
  console.log(`[DOCTORFORHOME EMAIL SERVICE] ${timestamp}`);
  console.log(`To: ${to}`);
  console.log(`Subject: Your DoctorForHome Verification Code`);
  console.log(`Purpose: ${purpose}`);
  console.log(`YOUR 6-DIGIT VERIFICATION CODE: >>> ${otp} <<<`);
  console.log(`This code expires in 5 minutes.`);
  console.log(`======================================================\n`);

  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || "DoctorForHome <no-reply@doctorforhome.com>";
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0284c7; margin: 0; font-size: 24px;">DoctorForHome</h2>
        <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Telemedicine Platform</span>
      </div>
      <p style="font-size: 15px; color: #334155;">Hello,</p>
      <p style="font-size: 15px; color: #475569;">You requested a 6-digit verification code for <strong>${purpose}</strong>.</p>
      <div style="background: #f0fdf4; border: 1px dashed #22c55e; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #15803d; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #64748b;">This code will expire in <strong>5 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center;">© ${new Date().getFullYear()} DoctorForHome Telemedicine Platform. All rights reserved.</p>
    </div>
  `;

  // 1. Try Custom SMTP (e.g. Gmail with App Password, SendGrid, Mailgun)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = Number(process.env.SMTP_PORT) || 465;
      const secure = process.env.SMTP_SECURE === "true" || port === 465;

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `${otp} is your DoctorForHome verification code`,
        text: `Your verification code for ${purpose} is: ${otp}. It will expire in 5 minutes.`,
        html: htmlBody,
      });

      console.log(`[EMAIL SERVICE] Successfully sent email to ${to} via SMTP (${process.env.SMTP_HOST})`);
      return { delivered: true, method: "smtp", message: `Verification code sent to ${to}` };
    } catch (smtpErr) {
      console.error("[EMAIL SERVICE] SMTP Delivery Failed:", smtpErr instanceof Error ? smtpErr.message : smtpErr);
    }
  }

  // 2. Try Resend REST API
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject: `${otp} is your DoctorForHome verification code`,
          html: htmlBody,
        }),
      });

      if (response.ok) {
        console.log(`[EMAIL SERVICE] Successfully sent email to ${to} via Resend`);
        return { delivered: true, method: "resend", message: `Verification code sent to ${to}` };
      } else {
        const errorText = await response.text();
        console.warn(`[EMAIL SERVICE] Resend API responded with ${response.status}:`, errorText);
      }
    } catch (resendErr) {
      console.warn("[EMAIL SERVICE] Resend delivery error:", resendErr);
    }
  }

  // 3. Fallback: Local development console mode
  return {
    delivered: false,
    method: "console",
    message: `[Dev Mode] Verification code logged to terminal: ${otp}`,
  };
}
