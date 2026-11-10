"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Doctor } from "@/types/doctor";

// ── Specialty colour map ──────────────────────────────────────────────────────
const specialtyColors: Record<string, { bg: string; text: string; border: string }> = {
  "General Physician": { bg: "bg-cyan-500/10",   text: "text-cyan-400",   border: "border-cyan-500/30"   },
  "Cardiology":        { bg: "bg-rose-500/10",   text: "text-rose-400",   border: "border-rose-500/30"   },
  "Pediatrics":        { bg: "bg-emerald-500/10",text: "text-emerald-400",border: "border-emerald-500/30"},
  "Dermatology":       { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/30"  },
  "Neurology":         { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  "Orthopedics":       { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  "Gynecology":        { bg: "bg-pink-500/10",   text: "text-pink-400",   border: "border-pink-500/30"   },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating) ? "text-amber-400" : "text-slate-600"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

interface DoctorCardProps {
  doctor: Doctor;
  index: number;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPending, setBookingPending] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const colors = specialtyColors[doctor.specialty] ?? {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
  };

  const now = new Date();
  const minDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingPending(true);
    setBookingError("");

    const formData = new FormData(event.currentTarget);
    const booking = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      patientName: formData.get("patientName"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      date: formData.get("date"),
      time: formData.get("time"),
      appointmentType: formData.get("appointmentType") || "Online Consultation",
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to book this appointment.");

      setBookingOpen(false);
      setBookingSuccess(true);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "Unable to book this appointment.");
    } finally {
      setBookingPending(false);
    }
  }

  return (
    <div className="group rounded-3xl border border-white/10 bg-[#0E1733] shadow-xl hover:shadow-2xl hover:border-[#16C9E8]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col text-white relative">
      {/* ── Card header ── */}
      <div className="relative bg-gradient-to-br from-[#171A3B] to-[#0D1530] px-6 pt-6 pb-4 border-b border-white/5">
        {/* Availability / BMDC badge */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            BMDC Verified
          </span>
          {doctor.bmdcNumber && (
            <span className="text-[10px] text-[#8794AD] font-mono">
              {doctor.bmdcNumber}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#16C9E8] via-[#398BF2] to-[#DF48C7] rounded-2xl flex items-center justify-center shadow-lg mb-3 ring-2 ring-white/10 text-white font-black text-xl">
          {doctor.avatar}
        </div>

        {/* Name + specialty */}
        <h3 className="font-extrabold text-white text-lg leading-tight group-hover:text-[#16C9E8] transition-colors">
          {doctor.name}
        </h3>
        {doctor.qualifications && (
          <p className="text-xs text-[#8794AD] font-medium mt-0.5 truncate">{doctor.qualifications}</p>
        )}

        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-2 border ${colors.bg} ${colors.text} ${colors.border}`}
        >
          <span>✦</span> {doctor.specialty}
        </span>
      </div>

      {/* ── Card body ── */}
      <div className="px-6 py-4 flex flex-col flex-1 gap-3">
        {bookingSuccess && (
          <p role="status" className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300">
            ✓ Appointment requested successfully! Check dashboard.
          </p>
        )}

        {/* Rating row */}
        <div className="flex items-center gap-2">
          <StarRating rating={doctor.rating || 4.9} />
          <span className="text-sm font-bold text-white">{(doctor.rating || 4.9).toFixed(1)}</span>
          <span className="text-xs text-[#8794AD]">({doctor.reviewCount || 100}+ reviews)</span>
        </div>

        {/* Meta info grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Experience */}
          <div className="flex items-center gap-1.5 text-[#B9C4D7]">
            <svg className="w-4 h-4 text-[#16C9E8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{doctor.experience} yrs experience</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-[#B9C4D7]">
            <svg className="w-4 h-4 text-[#DF48C7] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{doctor.location || "Dhaka"}</span>
          </div>

          {/* Hospital affiliation */}
          {doctor.hospital && (
            <div className="flex items-center gap-1.5 text-[#8794AD] col-span-2 text-xs truncate">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="truncate">{doctor.hospital}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        <p className="text-xs text-[#8794AD] leading-relaxed line-clamp-2">{doctor.bio}</p>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Next slot + fee */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#8794AD] uppercase font-bold tracking-wider">Fee</p>
            <p className="text-base font-black text-[#16C9E8]">৳{doctor.fee}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#8794AD] uppercase font-bold tracking-wider">Available Days</p>
            <p className="text-xs font-semibold text-emerald-400">
              {doctor.availableDays && doctor.availableDays.length > 0
                ? `${doctor.availableDays.length} days / week`
                : "Mon - Fri"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/find-a-doctor/${doctor.id}`}
            className="flex-1 text-center text-xs font-bold text-white border border-white/15 bg-white/5 hover:bg-white/10 py-2.5 rounded-xl transition-all"
          >
            View Profile
          </Link>
          <button
            type="button"
            onClick={() => { setBookingSuccess(false); setBookingError(""); setBookingOpen(true); }}
            className="flex-1 text-xs font-black text-[#080D23] bg-gradient-to-r from-[#16C9E8] to-[#398BF2] hover:opacity-95 py-2.5 rounded-xl transition-all shadow-md shadow-cyan-500/20"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Booking Dialog Modal */}
      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-md p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setBookingOpen(false); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`booking-title-${doctor.id}`}
            className="my-auto w-full max-w-lg rounded-3xl border border-white/10 bg-[#0E1733] p-6 shadow-2xl sm:p-8 text-white relative"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#16C9E8] uppercase tracking-wider">
                  <span>⚡</span> Fast Scheduling
                </span>
                <h2 id={`booking-title-${doctor.id}`} className="mt-1 text-xl sm:text-2xl font-black text-white">Book Consultation</h2>
                <p className="mt-1 text-xs text-[#8794AD]">with {doctor.name} ({doctor.specialty})</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingOpen(false)}
                aria-label="Close booking form"
                className="rounded-xl p-2 text-[#8794AD] hover:bg-white/10 hover:text-white transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <form onSubmit={submitBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Consultation Type</label>
                <select name="appointmentType" defaultValue="Online Consultation" className="w-full rounded-xl border border-white/15 bg-[#162044] px-3.5 py-2.5 text-sm text-white font-medium outline-none focus:border-[#16C9E8]">
                  <option value="Online Consultation">Online Video Consultation (৳{doctor.fee})</option>
                  <option value="Home Visit">In-person Home Visit (৳{doctor.homeVisitFee || doctor.fee + 300})</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Patient Full Name</label>
                <input name="patientName" required autoComplete="name" placeholder="e.g. Mohammad Babar" className="w-full rounded-xl border border-white/15 bg-[#162044] px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-[#16C9E8]" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input name="phone" type="tel" required autoComplete="tel" pattern="[+0-9() .-]{7,20}" placeholder="+8801XXXXXXXXX" className="w-full rounded-xl border border-white/15 bg-[#162044] px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-[#16C9E8]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Address / City</label>
                  <input name="address" required placeholder="Dhanmondi, Dhaka" className="w-full rounded-xl border border-white/15 bg-[#162044] px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-[#16C9E8]" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Appointment Date</label>
                  <input name="date" type="date" required min={minDate} className="w-full rounded-xl border border-white/15 bg-[#162044] px-3 py-2.5 text-sm text-white outline-none focus:border-[#16C9E8] [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Select Time Slot</label>
                  <select name="time" required className="w-full rounded-xl border border-white/15 bg-[#162044] px-3 py-2.5 text-sm text-white outline-none focus:border-[#16C9E8]">
                    <option value="">-- Choose Slot --</option>
                    {(doctor.availableTimeSlots && doctor.availableTimeSlots.length > 0
                      ? doctor.availableTimeSlots
                      : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
                    ).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              {bookingError && <p role="alert" className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">{bookingError}</p>}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setBookingOpen(false)} className="rounded-xl border border-white/15 px-5 py-2.5 text-xs font-bold text-[#8794AD] hover:bg-white/5 hover:text-white transition">Cancel</button>
                <button type="submit" disabled={bookingPending} className="rounded-xl bg-gradient-to-r from-[#16C9E8] to-[#398BF2] px-6 py-2.5 text-xs font-black text-[#080D23] hover:opacity-95 disabled:opacity-60 shadow-lg shadow-cyan-500/20 transition">
                  {bookingPending ? "Submitting..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
