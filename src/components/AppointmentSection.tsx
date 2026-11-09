"use client";

import { useEffect, useState, type FormEvent } from "react";

const appointmentTypes = ["Video Consultation", "Home Visit", "In-Clinic", "Diagnostic Test"] as const;
type AppointmentType = (typeof appointmentTypes)[number];

function AppointmentTypeIcon({ index }: { index: number }) {
  const common = { className: "mr-2 inline-block h-4 w-4 align-[-3px] text-[#49D1E7]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (index === 0) return <svg {...common}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></svg>;
  if (index === 1) return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /></svg>;
  if (index === 2) return <svg {...common}><path d="M4 21h16M6 21V7l6-4 6 4v14M9 10h.01M15 10h.01M10 21v-5h4v5" /></svg>;
  return <svg {...common}><path d="M9 3h6m-5 0v5L5 19a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5-11V3M8 15h8" /></svg>;
}

export default function AppointmentSection() {
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("Home Visit");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setMinDate(new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10));
  }, []);

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess("");
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      appointmentType,
      patientName: formData.get("patientName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      date: formData.get("date"),
      time: formData.get("time"),
      notes: formData.get("notes"),
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "We could not submit your request. Please try again.");
      setSuccess("Your appointment request was submitted successfully.");
      form.reset();
      setAppointmentType("Home Visit");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not submit your request. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="appointment" className="relative overflow-hidden bg-[#0B142A] py-20 sm:py-28">
      <div aria-hidden="true" className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#16C9E8]/[.07] blur-[120px]" />
      <div aria-hidden="true" className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#DF48C7]/[.07] blur-[120px]" />
      <div className="relative mx-auto max-w-[1040px] px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-[#24D6A0]" /> BOOK APPOINTMENT</span>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-.04em] text-white sm:text-4xl lg:text-[48px]">Your health journey<br className="hidden sm:block" /> starts here</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#A2AEC3] sm:text-base">Schedule a consultation with a healthcare professional at a time that works for you.</p>
        </div>

        <div className="booking-frame mt-10 rounded-[28px] p-px sm:mt-14">
          <form onSubmit={submitAppointment} className="rounded-[27px] bg-[#111B32] p-5 sm:p-8 lg:p-10">
            <fieldset>
              <legend className="text-xs font-semibold text-[#CBD5E5]">Appointment type</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {appointmentTypes.map((type, index) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={appointmentType === type}
                    onClick={() => setAppointmentType(type)}
                    className={`min-h-12 rounded-xl border px-3 text-[11px] font-semibold transition sm:text-xs ${appointmentType === type ? "border-[#398BF2]/70 bg-gradient-to-r from-[#398BF2]/20 to-[#9560F5]/20 text-white shadow-[inset_0_0_0_1px_rgba(57,139,242,.15)]" : "border-white/[.08] bg-white/[.025] text-[#94A1B6] hover:border-white/20 hover:text-white"}`}
                  >
                    <AppointmentTypeIcon index={index} />{type}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-7 grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <label className="form-label">Full Name
                <input name="patientName" type="text" required maxLength={100} autoComplete="name" placeholder="John Doe" className="form-input" />
              </label>
              <label className="form-label">Email Address
                <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="john@example.com" className="form-input" />
              </label>
              <label className="form-label">Phone
                <input name="phone" type="tel" required pattern="[+0-9() .-]{7,20}" title="Enter a valid phone number" autoComplete="tel" placeholder="+1 (555) 000-0000" className="form-input" />
              </label>
              <label className="form-label">Date
                <input name="date" type="date" required min={minDate} className="form-input form-date" />
              </label>
              <label className="form-label">Time
                <input name="time" type="time" required className="form-input form-date" />
              </label>
              <label className="form-label sm:col-span-2">Additional Notes <span className="font-normal text-[#75839B]">(Optional)</span>
                <textarea name="notes" rows={4} maxLength={1000} placeholder="Tell us about your health concerns or any specific requirements..." className="form-input min-h-28 resize-y" />
              </label>
            </div>

            {error && <p role="alert" className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/[.08] px-4 py-3 text-sm text-rose-200">{error}</p>}
            {success && <p role="status" className="mt-5 rounded-xl border border-[#24D6A0]/20 bg-[#24D6A0]/[.08] px-4 py-3 text-sm text-[#86E9C1]">{success}</p>}

            <div className="mt-7 flex flex-col items-center gap-3">
              <button type="submit" disabled={pending} className="min-h-14 w-full rounded-xl bg-gradient-to-r from-[#16C9E8] via-[#398BF2] to-[#9560F5] px-6 text-sm font-bold text-white shadow-[0_10px_30px_rgba(57,139,242,.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(149,96,245,.25)] disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-[280px]">
                {pending ? "Sending request…" : "Confirm Appointment"}
              </button>
              <p className="text-center text-[10px] leading-5 text-[#78869D]">Submitting this form sends an appointment request. A time is not confirmed until a provider follows up.</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
