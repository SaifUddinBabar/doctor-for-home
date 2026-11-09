"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Doctor } from "@/types/doctor";

// ── Specialty colour map ──────────────────────────────────────────────────────
const specialtyColors: Record<string, { bg: string; text: string; dot: string }> = {
  "General Physician": { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"   },
  "Cardiology":        { bg: "bg-rose-100",    text: "text-rose-700",   dot: "bg-rose-500"   },
  "Pediatrics":        { bg: "bg-green-100",   text: "text-green-700",  dot: "bg-green-500"  },
  "Dermatology":       { bg: "bg-orange-100",  text: "text-orange-700", dot: "bg-orange-500" },
  "Neurology":         { bg: "bg-purple-100",  text: "text-purple-700", dot: "bg-purple-500" },
  "Orthopedics":       { bg: "bg-yellow-100",  text: "text-yellow-700", dot: "bg-yellow-500" },
  "Gynecology":        { bg: "bg-pink-100",    text: "text-pink-700",   dot: "bg-pink-500"   },
};

// ── Avatar gradient map ───────────────────────────────────────────────────────
const avatarGradients = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-rose-400 to-rose-600",
  "from-orange-400 to-orange-600",
  "from-teal-400 to-teal-600",
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating) ? "text-yellow-400" : "text-slate-200"
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

export default function DoctorCard({ doctor, index }: DoctorCardProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPending, setBookingPending] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const colors = specialtyColors[doctor.specialty] ?? {
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-500",
  };
  const gradient = avatarGradients[index % avatarGradients.length];
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
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* ── Card header ── */}
      <div className="relative bg-gradient-to-br from-blue-50 to-sky-100 px-6 pt-6 pb-4">
        {/* Availability badge */}
        <div className="absolute top-4 right-4">
          {doctor.available ? (
            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              Busy
            </span>
          )}
        </div>

        {/* Avatar */}
        <div
          className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-md mb-4 ring-4 ring-white`}
        >
          <span className="text-white text-xl font-extrabold tracking-wide">
            {doctor.avatar}
          </span>
        </div>

        {/* Name + specialty */}
        <h3 className="font-bold text-blue-900 text-lg leading-tight">{doctor.name}</h3>

        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-2 ${colors.bg} ${colors.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
          {doctor.specialty}
        </span>
      </div>

      {/* ── Card body ── */}
      <div className="px-6 py-4 flex flex-col flex-1 gap-3">
        {bookingSuccess && (
          <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            Appointment booked successfully!
          </p>
        )}
        {/* Rating row */}
        <div className="flex items-center gap-2">
          <StarRating rating={doctor.rating} />
          <span className="text-sm font-bold text-slate-700">{doctor.rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({doctor.reviewCount} reviews)</span>
        </div>

        {/* Meta info grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {/* Experience */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{doctor.experience} yrs exp.</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{doctor.location}</span>
          </div>

          {/* Languages */}
          <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>{doctor.languages.join(", ")}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{doctor.bio}</p>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Next slot + fee */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Next available</p>
            <p className="text-xs font-semibold text-green-600">{doctor.nextSlot}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Visit fee</p>
            <p className="text-lg font-extrabold text-blue-900">${doctor.fee}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/find-a-doctor/${doctor.id}`}
            className="flex-1 text-center text-sm font-semibold text-blue-600 border-2 border-blue-200 hover:bg-blue-50 py-2.5 rounded-xl transition-colors"
          >
            View Profile
          </Link>
          <button
            type="button"
            onClick={() => { setBookingSuccess(false); setBookingError(""); setBookingOpen(true); }}
            className="flex-1 text-sm font-bold text-white bg-green-500 hover:bg-green-600 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setBookingOpen(false); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`booking-title-${doctor.id}`}
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-green-600">Home visit request</p>
                <h2 id={`booking-title-${doctor.id}`} className="mt-1 text-2xl font-bold text-blue-950">Book Appointment</h2>
                <p className="mt-1 text-sm text-slate-500">with {doctor.name}</p>
              </div>
              <button type="button" onClick={() => setBookingOpen(false)} aria-label="Close booking form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <form onSubmit={submitBooking} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Patient Name
                <input name="patientName" required autoComplete="name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Phone Number
                <input name="phone" type="tel" required autoComplete="tel" pattern="[+0-9() .-]{7,20}" title="Enter a valid phone number" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Full Address
                <textarea name="address" required autoComplete="street-address" rows={3} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Date
                  <input name="date" type="date" required min={minDate} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Time
                  <input name="time" type="time" required className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
              </div>
              {bookingError && <p role="alert" className="text-sm text-red-600">{bookingError}</p>}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setBookingOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={bookingPending} className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-wait disabled:opacity-60">
                  {bookingPending ? "Submitting…" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
