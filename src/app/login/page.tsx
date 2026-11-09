"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
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
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-12 sm:py-16">
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-blue-900/10 md:grid-cols-2">
          <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-700 to-blue-950 p-10 text-white md:flex">
            <Link href="/" className="text-lg font-extrabold">Doctors<span className="text-green-300">4Home</span></Link>
            <div className="py-12">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Care, made closer</p>
              <h1 className="text-4xl font-extrabold leading-tight">Healthcare that meets you at home.</h1>
              <p className="mt-5 max-w-sm leading-relaxed text-blue-100">Sign in to manage your appointments and connect with your care team.</p>
            </div>
            <p className="text-sm text-blue-200">Trusted home visits, when you need them.</p>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-8 md:hidden"><p className="text-sm font-bold text-blue-700">Doctors<span className="text-green-600">4Home</span></p></div>
            <p className="text-sm font-semibold text-green-600">Your care starts here</p>
            <h2 className="mt-2 text-3xl font-extrabold text-blue-950">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p className="mt-2 text-sm text-slate-500">{mode === "login" ? "Sign in to continue to your dashboard." : "Join Doctors4Home as a patient or doctor."}</p>

            <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1" aria-label="Choose login or signup">
              {(["login", "signup"] as const).map((option) => (
                <button key={option} type="button" onClick={() => { setMode(option); setError(""); }} className={`rounded-lg py-2.5 text-sm font-bold capitalize transition-colors ${mode === option ? "bg-white text-blue-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {option === "login" ? "Login" : "Sign up"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <label className="block text-sm font-semibold text-slate-700">Full name
                  <input name="name" type="text" required maxLength={100} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Your name" />
                </label>
              )}
              <label className="block text-sm font-semibold text-slate-700">Email address
                <input name="email" type="email" required maxLength={254} autoComplete="email" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="you@example.com" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Password
                <input name="password" type="password" required minLength={8} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="At least 8 characters" />
              </label>
              {mode === "signup" && (
                <label className="block text-sm font-semibold text-slate-700">I am a
                  <select name="role" defaultValue="Patient" required className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                  </select>
                </label>
              )}
              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={pending} className="w-full rounded-xl bg-blue-700 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">
                {pending ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-slate-400">By continuing, you agree to use this service responsibly.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
