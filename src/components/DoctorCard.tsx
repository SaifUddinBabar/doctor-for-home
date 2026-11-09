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
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* ── Card header ── */}
      <div className="relative bg-gradient-to-br from-blue-50 to-sky-100 px-6 pt-6 pb-4">
        {/* Availability / BMDC badge */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            BMDC Verified
          </span>
          {doctor.bmdcNumber && (
            <span className="text-[10px] text-slate-500 font-mono font-medium">
              {doctor.bmdcNumber}
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
        {doctor.qualifications && (
          <p className="text-xs text-slate-500 font-medium mt-0.5">{doctor.qualifications}</p>
        )}

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
            Appointment requested successfully! Check your dashboard.
          </p>
        )}
        {/* Rating row */}
        <div className="flex items-center gap-2">
          <StarRating rating={doctor.rating || 4.9} />
          <span className="text-sm font-bold text-slate-700">{(doctor.rating || 4.9).toFixed(1)}</span>
          <span className="text-xs text-slate-400">({doctor.reviewCount || 100}+ reviews)</span>
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
            <span className="truncate">{doctor.location || "Dhaka"}</span>
          </div>

          {/* Hospital affiliation */}
          {doctor.hospital && (
            <div className="flex items-center gap-1.5 text-slate-600 col-span-2 text-xs truncate">
              <svg className="w-4 h-4 text-cyan-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="truncate">{doctor.hospital}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{doctor.bio}</p>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Next slot + fee */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Consultation Fee</p>
            <p className="text-lg font-extrabold text-blue-900">৳{doctor.fee}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Available Days</p>
            <p className="text-xs font-semibold text-emerald-600">
              {doctor.availableDays && doctor.availableDays.length > 0
                ? `${doctor.availableDays.length} days/week`
                : "Mon - Fri"}
            </p>
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
            Book Now
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
                <p className="text-sm font-semibold text-green-600">Instant Appointment Booking</p>
                <h2 id={`booking-title-${doctor.id}`} className="mt-1 text-2xl font-bold text-blue-950">Book Consultation</h2>
                <p className="mt-1 text-sm text-slate-500">with {doctor.name} ({doctor.specialty})</p>
              </div>
              <button type="button" onClick={() => setBookingOpen(false)} aria-label="Close booking form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <form onSubmit={submitBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Consultation Type</label>
                <select name="appointmentType" defaultValue="Online Consultation" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium outline-none focus:border-blue-500">
                  <option value="Online Consultation">Online Video Consultation (৳{doctor.fee})</option>
                  <option value="Home Visit">In-person Home Visit (৳{doctor.homeVisitFee || doctor.fee + 300})</option>
                </select>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Patient Full Name
                <input name="patientName" required autoComplete="name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Phone Number
                <input name="phone" type="tel" required autoComplete="tel" pattern="[+0-9() .-]{7,20}" placeholder="+8801XXXXXXXXX" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Address / Location
                <input name="address" required placeholder="House, Road, Area, Dhaka" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Appointment Date
                  <input name="date" type="date" required min={minDate} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Select Time Slot
                  <select name="time" required className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">-- Choose Slot --</option>
                    {(doctor.availableTimeSlots && doctor.availableTimeSlots.length > 0
                      ? doctor.availableTimeSlots
                      : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
                    ).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
              {bookingError && <p role="alert" className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{bookingError}</p>}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setBookingOpen(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={bookingPending} className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-wait disabled:opacity-60 shadow">
                  {bookingPending ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
