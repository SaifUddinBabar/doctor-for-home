"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP + New Password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Dev OTP support for local development without external SMTP setup
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isRealEmailSent, setIsRealEmailSent] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Request OTP
  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to request verification code.");
      }

      if (data.userNotFound) {
        setError(`No account found with email "${email}". Please enter the email you registered with or create a new account.`);
        return;
      }

      setMessage(data.message || "A 6-digit verification code has been generated.");
      setIsRealEmailSent(Boolean(data.isRealEmailSent));

      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }

      setCooldown(60);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process request.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Submit OTP & Reset Password
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setMessage(data.message || "Password reset successfully!");
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#080D23] text-white flex flex-col justify-center py-16 px-4">
        <div className="max-w-md w-full mx-auto">
          {/* Card Container */}
          <div className="bg-[#0f1738] border border-blue-900/50 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tight">Password Recovery</h1>
              <p className="text-xs text-slate-400 mt-2">
                {step === 1 && "Enter your registered email to receive a 6-digit OTP code."}
                {step === 2 && `Enter the 6-digit OTP code sent for ${email} and choose a new password.`}
                {step === 3 && "Your password has been securely updated."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold">
                {error}
              </div>
            )}

            {/* Dev Mode OTP Banner */}
            {step === 2 && devOtp && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <span>⚡</span> Verification Code (Local Demo)
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold rounded-lg text-[11px] transition border border-amber-400/40"
                  >
                    Auto-Fill Code
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Your 6-digit code is:</span>
                  <span className="text-xl font-mono font-black tracking-widest text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    {devOtp}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Real SMTP is not configured yet in <code className="text-amber-200">.env.local</code>. The code is shown here for testing and logged in your terminal.
                </p>
              </div>
            )}

            {message && step !== 3 && !devOtp && (
              <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold">
                {message}
              </div>
            )}

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor.or.patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#162044] border border-blue-900/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>
            )}

            {/* Step 2: Enter OTP & Set New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold bg-[#162044] border border-blue-900/60 rounded-xl px-4 py-3 text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 text-center">
                    {isRealEmailSent
                      ? "Check your inbox and spam folder. Code expires in 5 minutes."
                      : "Valid for 5 minutes. (Also visible in server terminal)"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#162044] border border-blue-900/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#162044] border border-blue-900/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
                >
                  {loading ? "Updating Password..." : "Reset Password"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    disabled={cooldown > 0}
                    onClick={handleRequestOtp}
                    className="text-xs text-cyan-400 hover:underline disabled:text-slate-500 disabled:no-underline font-semibold"
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive the code? Resend OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Password Changed!</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Your password has been successfully reset. You can now securely sign in to your DoctorForHome account.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="block w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-lg shadow-cyan-500/20"
                >
                  Proceed to Login
                </Link>
              </div>
            )}

            {/* Back to Login Footer */}
            {step !== 3 && (
              <div className="mt-8 pt-6 border-t border-blue-900/40 text-center">
                <Link href="/login" className="text-xs text-slate-400 hover:text-cyan-400 font-semibold transition">
                  ← Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
