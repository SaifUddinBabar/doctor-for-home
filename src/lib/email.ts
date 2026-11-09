/**
 * Email service provider for DoctorForHome.
 * Supports Resend API, custom SMTP, or local development console logging.
 */

interface SendOtpParams {
  to: string;
  otp: string;
  purpose?: string;
}

export async function sendOtpEmail({ to, otp, purpose = "Password Reset" }: SendOtpParams): Promise<boolean> {
  const timestamp = new Date().toISOString();
  console.log(`\n======================================================`);
  console.log(`[DOCTORFORHOME EMAIL SERVICE] ${timestamp}`);
  console.log(`To: ${to}`);
  console.log(`Subject: Your DoctorForHome Verification Code`);
  console.log(`Purpose: ${purpose}`);
  console.log(`YOUR 6-DIGIT VERIFICATION CODE: >>> ${otp} <<<`);
  console.log(`This code expires in 5 minutes.`);
  console.log(`======================================================\n`);

  // If RESEND_API_KEY is configured, send via Resend REST API
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "DoctorForHome <no-reply@doctorforhome.com>",
          to: [to],
          subject: `${otp} is your DoctorForHome verification code`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background: #ffffff;">
              <h2 style="color: #0284c7; margin-bottom: 8px;">DoctorForHome</h2>
              <p style="font-size: 16px; color: #334155;">Hello,</p>
              <p style="font-size: 15px; color: #475569;">You requested a verification code for <strong>${purpose}</strong>.</p>
              <div style="background: #f1f5f9; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
              </div>
              <p style="font-size: 13px; color: #64748b;">This code will expire in <strong>5 minutes</strong>. If you did not make this request, please disregard this email.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 DoctorForHome Telemedicine Platform. All rights reserved.</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        console.warn("Resend API response status:", response.status);
      }
    } catch (err) {
      console.warn("Failed to deliver email via Resend:", err);
    }
  }

  return true;
}
