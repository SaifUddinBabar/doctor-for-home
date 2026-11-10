"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Doctor } from "@/types/doctor";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [appointmentType, setAppointmentType] = useState<"Online Consultation" | "Home Visit">("Online Consultation");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  const [bookingPending, setBookingPending] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState("");

  useEffect(() => {
    async function loadDoctor() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/doctors/${doctorId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Doctor not found or unavailable.");
        }
        const data = await res.json();
        setDoctor(data.doctor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doctor profile.");
      } finally {
        setLoading(false);
      }
    }

    if (doctorId) {
      loadDoctor();
    }
  }, [doctorId]);

  // Today in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  }, []);

  // Check if selected date is on an allowed day and not blocked
  const dateValidationMessage = useMemo(() => {
    if (!selectedDate || !doctor) return null;
    if (selectedDate < todayStr) return "Cannot select a past date.";

    if (doctor.blockedDates && doctor.blockedDates.includes(selectedDate)) {
      return "Dr. is on leave or unavailable on this date.";
    }

    if (doctor.availableDays && doctor.availableDays.length > 0) {
      const parsed = new Date(`${selectedDate}T00:00:00.000Z`);
      const dayName = DAYS_OF_WEEK[parsed.getUTCDay()];
      if (!doctor.availableDays.includes(dayName)) {
        return `Dr. is not available on ${dayName}s. Works on: ${doctor.availableDays.join(", ")}.`;
      }
    }

    return null;
  }, [selectedDate, doctor, todayStr]);

  // Available slots for selected date
  const availableSlotsWithStatus = useMemo(() => {
    if (!doctor) return [];
    const slots = doctor.availableTimeSlots && doctor.availableTimeSlots.length > 0
      ? doctor.availableTimeSlots
      : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

    const bookedForDate = (doctor.bookedSlots && doctor.bookedSlots[selectedDate]) || [];

    return slots.map((time) => ({
      time,
      isBooked: bookedForDate.includes(time),
    }));
  }, [doctor, selectedDate]);

  async function handleBookingSubmit(e: FormEvent) {
    e.preventDefault();
    setBookingPending(true);
    setBookingError("");

    if (!selectedDate || !selectedTime) {
      setBookingError("Please select both a consultation date and a time slot.");
      setBookingPending(false);
      return;
    }

    if (dateValidationMessage) {
      setBookingError(dateValidationMessage);
      setBookingPending(false);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor?.id,
          patientName,
          phone,
          email,
          address: address || "Dhaka, Bangladesh",
          date: selectedDate,
          time: selectedTime,
          appointmentType,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to complete booking.");
      }

      setCreatedAppointmentId(data.appointmentId);
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to book appointment.");
    } finally {
      setBookingPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080D23] text-white">
      <Navbar />

      <main className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8794AD] mb-8">
            <Link href="/" className="hover:text-[#16C9E8] transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <Link href="/find-a-doctor" className="hover:text-[#16C9E8] transition-colors">Find a Doctor</Link>
            <span className="text-white/20">/</span>
            <span className="text-white font-semibold truncate">{doctor?.name || "Doctor Profile"}</span>
          </div>

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-[#0E1733] p-10 shadow-2xl animate-pulse space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/10 rounded-2xl" />
                <div className="space-y-3 flex-1">
                  <div className="h-7 bg-white/10 rounded-xl w-1/3" />
                  <div className="h-4 bg-white/5 rounded-lg w-1/4" />
                </div>
              </div>
              <div className="h-24 bg-white/5 rounded-2xl" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl border border-rose-500/20 bg-[#0E1733] p-12 text-center shadow-2xl max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Doctor Profile Unavailable</h2>
              <p className="text-[#A2AEC3] text-sm mb-6">{error}</p>
              <Link
                href="/find-a-doctor"
                className="inline-block bg-gradient-to-r from-[#16C9E8] to-[#398BF2] text-[#080D23] font-black px-6 py-3 rounded-xl hover:opacity-95 transition shadow-lg shadow-cyan-500/20"
              >
                Browse All Doctors
              </Link>
            </div>
          )}

          {!loading && doctor && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Doctor Profile Overview */}
              <div className="lg:col-span-7 space-y-6">
                {/* Profile Card */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#121B3B] via-[#0E1733] to-[#0A1026] p-6 sm:p-8 shadow-2xl">
                  {/* Subtle Background Glows */}
                  <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#16C9E8]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-[#DF48C7]/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Specialty Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DF48C7]/30 bg-[#DF48C7]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#DF48C7]">
                      <span>✦</span> {doctor.specialty}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      BMDC Certified
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#16C9E8] via-[#398BF2] to-[#DF48C7] rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0 ring-4 ring-white/10">
                      {doctor.avatar}
                    </div>

                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{doctor.name}</h1>
                      <p className="text-[#A2AEC3] font-medium text-sm mt-1">{doctor.qualifications}</p>
                      <p className="text-xs font-mono text-[#8794AD] mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16C9E8]" />
                        BMDC Reg: <strong className="text-slate-300">{doctor.bmdcNumber}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-white/10 my-6 bg-white/[0.02] rounded-2xl px-3 sm:px-4 text-center">
                    <div className="p-2">
                      <p className="text-[11px] text-[#8794AD] uppercase font-bold tracking-wider">Experience</p>
                      <p className="text-base sm:text-lg font-black text-white mt-0.5">{doctor.experience} Years</p>
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] text-[#8794AD] uppercase font-bold tracking-wider">Online Fee</p>
                      <p className="text-base sm:text-lg font-black text-[#16C9E8] mt-0.5">৳{doctor.fee}</p>
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] text-[#8794AD] uppercase font-bold tracking-wider">Home Visit</p>
                      <p className="text-base sm:text-lg font-black text-[#DF48C7] mt-0.5">৳{doctor.homeVisitFee || doctor.fee + 300}</p>
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] text-[#8794AD] uppercase font-bold tracking-wider">Rating</p>
                      <p className="text-base sm:text-lg font-black text-amber-300 mt-0.5 flex items-center justify-center gap-1">
                        <span>★</span> {(doctor.rating || 4.9).toFixed(1)}
                      </p>
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xs font-bold text-[#16C9E8] uppercase tracking-wider flex items-center gap-2">
                      <span>🩺</span> About Physician
                    </h3>
                    <p className="text-sm text-[#B9C4D7] leading-relaxed">{doctor.bio}</p>
                  </div>

                  {/* Affiliation & Location */}
                  <div className="space-y-3 bg-[#162044]/60 border border-white/10 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-[#B9C4D7]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#16C9E8]/10 text-[#16C9E8]">
                        🏥
                      </span>
                      <span>Affiliated Hospital: <strong className="text-white">{doctor.hospital || "Square Hospital, Dhaka"}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-[#B9C4D7]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#DF48C7]/10 text-[#DF48C7]">
                        📍
                      </span>
                      <span>Practicing City: <strong className="text-white">{doctor.location || "Dhaka"}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Schedule & Working Days Card */}
                <div className="rounded-3xl border border-white/10 bg-[#0E1733] p-6 sm:p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="text-[#16C9E8]">📅</span> Weekly Availability Schedule
                    </h3>
                    <span className="text-[11px] font-mono text-[#16C9E8] bg-[#16C9E8]/10 px-2.5 py-0.5 rounded-full border border-[#16C9E8]/20">
                      Slot: {doctor.slotDurationMinutes || 30} mins
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                      const isAvailable = doctor.availableDays?.includes(day);
                      return (
                        <span
                          key={day}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                            isAvailable
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : "bg-white/5 text-slate-500 border-white/5 opacity-50"
                          }`}
                        >
                          {day} {isAvailable ? "✓" : "—"}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[#8794AD]">
                    Patients can book appointments according to verified schedule. All bookings receive direct confirmation from the doctor.
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Appointment Booking */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-[#16C9E8]/30 bg-gradient-to-b from-[#111936] to-[#0A1026] p-6 sm:p-8 shadow-2xl sticky top-24">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#16C9E8]/30 bg-[#16C9E8]/10 px-3 py-1 text-[11px] font-bold text-[#16C9E8] uppercase tracking-wider mb-2">
                      <span>⚡</span> Fast Scheduling
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">Book Consultation</h2>
                    <p className="text-xs text-[#8794AD] mt-1">Direct booking with live schedule & conflict verification</p>
                  </div>

                  {bookingSuccess ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Booking Confirmed!</h3>
                      <p className="text-xs sm:text-sm text-[#B9C4D7] leading-relaxed">
                        Your appointment request has been submitted to Dr. <strong className="text-white">{doctor.name}</strong> for <strong className="text-[#16C9E8]">{selectedDate}</strong> at <strong className="text-[#16C9E8]">{selectedTime}</strong>.
                      </p>
                      <div className="pt-4 flex flex-col gap-2">
                        <Link
                          href="/dashboard/patient"
                          className="w-full py-3.5 bg-gradient-to-r from-[#16C9E8] to-[#398BF2] text-[#080D23] font-black rounded-xl text-sm transition shadow-lg shadow-cyan-500/20 hover:opacity-95 text-center"
                        >
                          View in Patient Dashboard
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setBookingSuccess(false);
                            setSelectedDate("");
                            setSelectedTime("");
                          }}
                          className="w-full py-2.5 text-xs text-[#8794AD] hover:text-white font-semibold transition"
                        >
                          Book another appointment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      {/* Consultation Type Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                          Consultation Format
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAppointmentType("Online Consultation")}
                            className={`py-3 px-3 rounded-2xl border text-xs font-bold transition text-left flex flex-col ${
                              appointmentType === "Online Consultation"
                                ? "bg-[#16C9E8]/10 border-[#16C9E8] text-white shadow-lg shadow-cyan-500/10 ring-1 ring-[#16C9E8]"
                                : "bg-white/5 border-white/10 text-[#8794AD] hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span>Video Consultation</span>
                            <span className="text-[#16C9E8] font-extrabold text-sm mt-0.5">৳{doctor.fee}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAppointmentType("Home Visit")}
                            className={`py-3 px-3 rounded-2xl border text-xs font-bold transition text-left flex flex-col ${
                              appointmentType === "Home Visit"
                                ? "bg-[#DF48C7]/10 border-[#DF48C7] text-white shadow-lg shadow-pink-500/10 ring-1 ring-[#DF48C7]"
                                : "bg-white/5 border-white/10 text-[#8794AD] hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span>Home Visit</span>
                            <span className="text-[#DF48C7] font-extrabold text-sm mt-0.5">৳{doctor.homeVisitFee || doctor.fee + 300}</span>
                          </button>
                        </div>
                      </div>

                      {/* Select Date */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                          Consultation Date
                        </label>
                        <input
                          type="date"
                          required
                          min={todayStr}
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime("");
                          }}
                          className="w-full bg-[#162044] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#16C9E8] focus:ring-1 focus:ring-[#16C9E8] [color-scheme:dark]"
                        />
                        {dateValidationMessage && (
                          <p className="text-xs text-rose-400 font-semibold mt-1.5 flex items-center gap-1">
                            <span>⚠️</span> {dateValidationMessage}
                          </p>
                        )}
                      </div>

                      {/* Time Slots */}
                      {selectedDate && !dateValidationMessage && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                            Select Time Slot
                          </label>
                          <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 rounded-xl bg-black/20 border border-white/5">
                            {availableSlotsWithStatus.map(({ time, isBooked }) => (
                              <button
                                key={time}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setSelectedTime(time)}
                                className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition ${
                                  isBooked
                                    ? "bg-white/5 text-slate-600 line-through cursor-not-allowed border border-white/5"
                                    : selectedTime === time
                                    ? "bg-gradient-to-r from-[#16C9E8] to-[#398BF2] text-[#080D23] font-black shadow-md shadow-cyan-500/25"
                                    : "bg-[#162044] text-slate-200 border border-white/10 hover:border-[#16C9E8] hover:text-white"
                                }`}
                              >
                                {time}
                                {isBooked && <span className="block text-[8px] text-slate-500">Booked</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Patient Details */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Patient Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mohammad Babar"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full bg-[#162044] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#16C9E8]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Phone</label>
                          <input
                            type="tel"
                            required
                            placeholder="+8801700000000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-[#162044] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#16C9E8]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email</label>
                          <input
                            type="email"
                            placeholder="patient@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#162044] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#16C9E8]"
                          />
                        </div>
                      </div>

                      {appointmentType === "Home Visit" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Home Address</label>
                          <input
                            type="text"
                            required
                            placeholder="House, Road, Area, Dhaka"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-[#162044] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#16C9E8]"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Symptoms / Notes (Optional)</label>
                        <textarea
                          rows={2}
                          placeholder="Brief description of current medical concerns..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full bg-[#162044] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#16C9E8] resize-none"
                        />
                      </div>

                      {bookingError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold">
                          {bookingError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={bookingPending || !selectedDate || !selectedTime || !!dateValidationMessage}
                        className="w-full py-3.5 bg-gradient-to-r from-[#16C9E8] to-[#398BF2] hover:opacity-95 text-[#080D23] font-black rounded-xl text-sm transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        {bookingPending ? "Submitting Booking..." : `Confirm Booking • ৳${appointmentType === "Online Consultation" ? doctor.fee : (doctor.homeVisitFee || doctor.fee + 300)}`}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
