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
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/find-a-doctor" className="hover:text-blue-600">Find a Doctor</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{doctor?.name || "Doctor Profile"}</span>
          </div>

          {loading && (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm animate-pulse space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 bg-slate-200 rounded-2xl" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-24 bg-slate-100 rounded-xl" />
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-3xl p-12 text-center border border-red-100 shadow-sm">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Doctor Profile Not Available</h2>
              <p className="text-slate-500 mb-6">{error}</p>
              <Link
                href="/find-a-doctor"
                className="inline-block bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
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
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 text-xs font-bold px-4 py-2 rounded-bl-2xl uppercase tracking-wider">
                    {doctor.specialty}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-md shrink-0 ring-4 ring-blue-50">
                      {doctor.avatar}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{doctor.name}</h1>
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          BMDC Certified
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium text-sm">{doctor.qualifications}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">Registration No: {doctor.bmdcNumber}</p>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-center my-6">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Experience</p>
                      <p className="text-base font-bold text-slate-800">{doctor.experience} Years</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Online Fee</p>
                      <p className="text-base font-bold text-blue-600">৳{doctor.fee}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Home Visit</p>
                      <p className="text-base font-bold text-indigo-600">৳{doctor.homeVisitFee || doctor.fee + 300}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Rating</p>
                      <p className="text-base font-bold text-yellow-500">★ {(doctor.rating || 4.9).toFixed(1)}</p>
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">About Doctor</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
                  </div>

                  {/* Affiliation & Location */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Affiliated Hospital: <strong>{doctor.hospital || "Square Hospital, Dhaka"}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Practicing City: <strong>{doctor.location || "Dhaka"}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Schedule & Working Days Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Weekly Availability Schedule
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                      const isAvailable = doctor.availableDays?.includes(day);
                      return (
                        <span
                          key={day}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
                          }`}
                        >
                          {day} {isAvailable ? "✓" : "—"}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500">
                    Consultation Slot Duration: <strong>{doctor.slotDurationMinutes || 30} minutes</strong>
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Appointment Booking */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-xl sticky top-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-slate-900">Schedule Appointment</h2>
                    <p className="text-xs text-slate-500 mt-1">Direct booking with live schedule verification</p>
                  </div>

                  {bookingSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Booking Confirmed!</h3>
                      <p className="text-sm text-slate-600">
                        Your appointment request has been submitted to Dr. {doctor.name} for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
                      </p>
                      <div className="pt-4 flex flex-col gap-2">
                        <Link
                          href="/dashboard/patient"
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md"
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
                          className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                        >
                          Book another appointment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      {/* Consultation Type Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Consultation Format
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAppointmentType("Online Consultation")}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-left flex flex-col ${
                              appointmentType === "Online Consultation"
                                ? "bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-100"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span>Video Consultation</span>
                            <span className="text-blue-600 font-extrabold mt-0.5">৳{doctor.fee}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAppointmentType("Home Visit")}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-left flex flex-col ${
                              appointmentType === "Home Visit"
                                ? "bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-100"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span>In-person Home Visit</span>
                            <span className="text-indigo-600 font-extrabold mt-0.5">৳{doctor.homeVisitFee || doctor.fee + 300}</span>
                          </button>
                        </div>
                      </div>

                      {/* Select Date */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Select Date
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
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {dateValidationMessage && (
                          <p className="text-xs text-rose-600 font-semibold mt-1">{dateValidationMessage}</p>
                        )}
                      </div>

                      {/* Time Slots */}
                      {selectedDate && !dateValidationMessage && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Available Time Slot
                          </label>
                          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                            {availableSlotsWithStatus.map(({ time, isBooked }) => (
                              <button
                                key={time}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setSelectedTime(time)}
                                className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition ${
                                  isBooked
                                    ? "bg-slate-100 text-slate-400 line-through cursor-not-allowed border border-dashed border-slate-200"
                                    : selectedTime === time
                                    ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300"
                                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                              >
                                {time}
                                {isBooked && <span className="block text-[9px] text-slate-400">Booked</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Patient Details */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Patient Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mohammad Babar"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label>
                          <input
                            type="tel"
                            required
                            placeholder="+8801700000000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                          <input
                            type="email"
                            placeholder="patient@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {appointmentType === "Home Visit" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Home Address</label>
                          <input
                            type="text"
                            required
                            placeholder="House, Road, Area, Dhaka"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Symptoms / Notes (Optional)</label>
                        <textarea
                          rows={2}
                          placeholder="Brief description of current medical concerns..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                        />
                      </div>

                      {bookingError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                          {bookingError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={bookingPending || !selectedDate || !selectedTime || !!dateValidationMessage}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
    </>
  );
}
