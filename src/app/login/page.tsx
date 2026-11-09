"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type AuthMode = "login" | "signup";
type RoleOption = "Patient" | "Doctor" | "Admin";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<RoleOption>("Patient");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const fields = new FormData(event.currentTarget);
    const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const payload = Object.fromEntries(fields.entries());

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Authentication failed.");

      const targetDashboard = data.redirectUrl ?? "/dashboard";
      router.push(targetDashboard);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080D23] text-white">
      <Navbar />

      <main className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-[#080D23] via-[#0E1733] to-[#120B2E] px-4 py-12 sm:py-16">
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0E1733] shadow-2xl md:grid-cols-2">
          {/* Left Hero Card */}
          <section className="hidden flex-col justify-between bg-gradient-to-br from-[#0F1C3F] via-[#111A38] to-[#26104A] p-10 text-white md:flex">
            <Link href="/" className="text-lg font-extrabold flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#16C9E8] to-[#398BF2]">
                ✚
              </span>
              <span>Doctor<span className="text-[#65DFF0]">For</span>Home</span>
            </Link>

            <div className="py-12">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#65DFF0]">
                TELEMEDICINE PLATFORM
              </p>
              <h1 className="text-4xl font-extrabold leading-tight">
                Healthcare that meets you at home.
              </h1>
              <p className="mt-5 max-w-sm leading-relaxed text-[#A2AEC3] text-sm">
                Sign in to manage appointments, access digital prescriptions, review clinical records, and conduct verified consultations.
              </p>
            </div>

            <div className="border-t border-white/10 pt-4 text-xs text-[#8794AD] flex items-center justify-between">
              <span>Patients · BMDC Doctors · Admin</span>
              <span className="text-emerald-400 font-bold">✓ Secure Portal</span>
            </div>
          </section>

          {/* Right Form Card */}
          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-6 md:hidden">
              <p className="text-lg font-bold text-white">Doctor<span className="text-[#65DFF0]">For</span>Home</p>
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-[#65DFF0]">
              {mode === "login" ? "Account Access" : "Platform Registration"}
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold text-white">
              {mode === "login" ? "Sign in to portal" : "Create your account"}
            </h2>
            <p className="mt-1 text-xs text-[#A2AEC3]">
              {mode === "login"
                ? "Sign in with your registered email and password."
                : "Register as a patient, licensed doctor, or administrator."}
            </p>

            {/* Mode Switch Tabs */}
            <div className="mt-6 grid grid-cols-2 rounded-xl bg-white/5 p-1 text-xs" aria-label="Choose login or signup">
              {(["login", "signup"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setMode(option);
                    setError("");
                  }}
                  className={`rounded-lg py-2 text-xs font-bold capitalize transition-colors ${
                    mode === option
                      ? "bg-[#16C9E8] text-[#080D23] shadow-sm"
                      : "text-[#A2AEC3] hover:text-white"
                  }`}
                >
                  {option === "login" ? "Login" : "Sign up"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-3.5 text-xs">
              {mode === "signup" && (
                <>
                  <label className="block font-semibold text-[#CBD5E5]">
                    Full Name
                    <input
                      name="name"
                      type="text"
                      required
                      maxLength={100}
                      autoComplete="name"
                      className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white font-normal outline-none transition focus:border-[#16C9E8] focus:ring-1 focus:ring-[#16C9E8]"
                      placeholder="e.g. Dr. Ayesha Rahman or John Doe"
                    />
                  </label>

                  <label className="block font-semibold text-[#CBD5E5]">
                    Account Role
                    <select
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as RoleOption)}
                      required
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#121B3A] px-3.5 py-2.5 text-white font-normal outline-none focus:border-[#16C9E8]"
                    >
                      <option value="Patient">Patient</option>
                      <option value="Doctor">Doctor (Licensed BMDC Physician)</option>
                      <option value="Admin">System Administrator</option>
                    </select>
                  </label>

                  {/* Doctor-Specific Professional Fields */}
                  {role === "Doctor" && (
                    <div className="rounded-xl border border-[#16C9E8]/30 bg-[#16C9E8]/5 p-3.5 space-y-3">
                      <p className="text-[11px] font-bold text-[#65DFF0] uppercase tracking-wider">
                        Doctor Credentials (BMDC Verification)
                      </p>

                      <label className="block font-semibold text-[#CBD5E5]">
                        BMDC Registration Number *
                        <input
                          name="bmdcNumber"
                          type="text"
                          required
                          placeholder="e.g. BMDC-A-45892"
                          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white font-mono focus:border-[#16C9E8] outline-none"
                        />
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="block font-semibold text-[#CBD5E5]">
                          Specialization
                          <select
                            name="specialization"
                            defaultValue="General Physician"
                            className="mt-1 w-full rounded-lg border border-white/15 bg-[#121B3A] px-3 py-2 text-white outline-none"
                          >
                            <option value="General Physician">General Physician</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Gynecology">Gynecology</option>
                          </select>
                        </label>

                        <label className="block font-semibold text-[#CBD5E5]">
                          Qualifications
                          <input
                            name="qualifications"
                            type="text"
                            defaultValue="MBBS, FCPS"
                            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="block font-semibold text-[#CBD5E5]">
                          Experience (Years)
                          <input
                            name="experienceYears"
                            type="number"
                            min="0"
                            max="60"
                            defaultValue="5"
                            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none"
                          />
                        </label>

                        <label className="block font-semibold text-[#CBD5E5]">
                          Consultation Fee (BDT)
                          <input
                            name="consultationFee"
                            type="number"
                            min="0"
                            defaultValue="500"
                            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Admin Registration Secret Key Field */}
                  {role === "Admin" && (
                    <div className="rounded-xl border border-[#DF48C7]/30 bg-[#DF48C7]/5 p-3.5 space-y-2">
                      <p className="text-[11px] font-bold text-[#DF48C7] uppercase tracking-wider">
                        Administrator Authorization
                      </p>
                      <label className="block font-semibold text-[#CBD5E5]">
                        Admin Registration Secret Key *
                        <input
                          name="adminKey"
                          type="password"
                          required
                          placeholder="Enter admin secret key"
                          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#DF48C7]"
                        />
                      </label>
                    </div>
                  )}
                </>
              )}

              <label className="block font-semibold text-[#CBD5E5]">
                Email Address
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white font-normal outline-none transition focus:border-[#16C9E8] focus:ring-1 focus:ring-[#16C9E8]"
                  placeholder="name@example.com"
                />
              </label>

              <label className="block font-semibold text-[#CBD5E5]">
                <div className="flex items-center justify-between">
                  <span>Password</span>
                  {mode === "login" && (
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-semibold text-[#16C9E8] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white font-normal outline-none transition focus:border-[#16C9E8] focus:ring-1 focus:ring-[#16C9E8]"
                  placeholder="At least 8 characters"
                />
              </label>

              {error && (
                <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-gradient-to-r from-[#16C9E8] via-[#398BF2] to-[#9560F5] py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
              >
                {pending ? "Authenticating..." : mode === "login" ? "Sign In" : "Register Account"}
              </button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-4 text-center">
              <p className="text-[11px] text-[#8794AD]">
                Default Admin Login: <strong className="text-white">admin@doctorforhome.com</strong> / <strong className="text-white">AdminPassword123!</strong>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
