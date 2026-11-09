"use client";

import { useState, type FormEvent } from "react";

interface DoctorProfileData {
  id: string;
  specialization: string;
  qualifications: string | null;
  experienceYears: number;
  consultationFee: number;
  homeVisitFee: number | null;
  bio: string | null;
  hospitalAffiliation: string | null;
  location: string | null;
  availableDays: string[];
  availableTimeSlots: string[];
  slotDurationMinutes: number;
  blockedDates: string[];
}

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STANDARD_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export default function DoctorAvailabilityManager({
  initialProfile,
}: {
  initialProfile: DoctorProfileData;
}) {
  const [profile, setProfile] = useState<DoctorProfileData>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [consultationFee, setConsultationFee] = useState(profile.consultationFee);
  const [homeVisitFee, setHomeVisitFee] = useState(profile.homeVisitFee || profile.consultationFee + 300);
  const [bio, setBio] = useState(profile.bio || "");
  const [hospitalAffiliation, setHospitalAffiliation] = useState(profile.hospitalAffiliation || "");
  const [location, setLocation] = useState(profile.location || "Dhaka");
  const [availableDays, setAvailableDays] = useState<string[]>(
    profile.availableDays.length > 0 ? profile.availableDays : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  );
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(
    profile.availableTimeSlots.length > 0 ? profile.availableTimeSlots : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
  );
  const [blockedDates, setBlockedDates] = useState<string[]>(profile.blockedDates || []);
  const [newBlockedDate, setNewBlockedDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  function toggleDay(day: string) {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function toggleSlot(slot: string) {
    setAvailableTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot).sort() : [...prev, slot].sort()
    );
  }

  function addBlockedDate() {
    if (!newBlockedDate || blockedDates.includes(newBlockedDate)) return;
    setBlockedDates((prev) => [...prev, newBlockedDate].sort());
    setNewBlockedDate("");
  }

  function removeBlockedDate(dateToRemove: string) {
    setBlockedDates((prev) => prev.filter((d) => d !== dateToRemove));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationFee: Number(consultationFee),
          homeVisitFee: Number(homeVisitFee),
          bio,
          hospitalAffiliation,
          location,
          availableDays,
          availableTimeSlots,
          blockedDates,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update availability schedule.");

      setMessage({ text: "Profile and availability schedule successfully saved!", isError: false });
      setIsEditing(false);
      setProfile((prev) => ({
        ...prev,
        consultationFee: Number(consultationFee),
        homeVisitFee: Number(homeVisitFee),
        bio,
        hospitalAffiliation,
        location,
        availableDays,
        availableTimeSlots,
        blockedDates,
      }));
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Save failed", isError: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#16C9E8]" />
            Schedule & Availability Management
          </h2>
          <p className="text-xs text-[#8794AD] mt-0.5">
            Configure working days, consultation slots, visit fees, and holiday blocks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setIsEditing(!isEditing); setMessage(null); }}
          className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-white transition"
        >
          {isEditing ? "Close Editor" : "Edit Schedule & Fees"}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-xl text-xs font-semibold ${
            message.isError
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      {!isEditing ? (
        /* Read-only view */
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Video Consultation Fee</span>
              <p className="text-lg font-black text-[#65DFF0] mt-1">৳{profile.consultationFee}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Home Visit Fee</span>
              <p className="text-lg font-black text-indigo-400 mt-1">৳{profile.homeVisitFee || profile.consultationFee + 300}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hospital Affiliation</span>
              <p className="text-sm font-bold text-white mt-1 truncate">{profile.hospitalAffiliation || "DoctorForHome Network"}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Active Working Days</h3>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((d) => (
                <span
                  key={d}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    profile.availableDays.includes(d)
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-white/5 text-slate-500 border-white/5 opacity-50"
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Available Daily Time Slots</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.availableTimeSlots.map((slot) => (
                <span key={slot} className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2.5 py-1 rounded-lg font-mono">
                  {slot}
                </span>
              ))}
            </div>
          </div>

          {profile.blockedDates && profile.blockedDates.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2">Blocked Dates / Holidays</h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.blockedDates.map((d) => (
                  <span key={d} className="text-xs bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2.5 py-1 rounded-lg font-mono">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSave} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Video Consultation Fee (BDT)
              </label>
              <input
                type="number"
                min="0"
                required
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full bg-[#162044] border border-blue-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Home Visit Consultation Fee (BDT)
              </label>
              <input
                type="number"
                min="0"
                required
                value={homeVisitFee}
                onChange={(e) => setHomeVisitFee(Number(e.target.value))}
                className="w-full bg-[#162044] border border-blue-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Hospital Affiliation
              </label>
              <input
                type="text"
                value={hospitalAffiliation}
                onChange={(e) => setHospitalAffiliation(e.target.value)}
                placeholder="e.g. Square Hospital, Dhaka"
                className="w-full bg-[#162044] border border-blue-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dhaka, Bangladesh"
                className="w-full bg-[#162044] border border-blue-900/60 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Professional Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short description of your clinical experience and areas of care..."
              className="w-full bg-[#162044] border border-blue-900/60 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          {/* Working Days Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Available Days of the Week
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_DAYS.map((day) => {
                const checked = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-left transition ${
                      checked
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30"
                    }`}
                  >
                    <span>{checked ? "✓ " : "+ "}</span>{day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Slots */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Toggle Available Time Slots
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {STANDARD_SLOTS.map((slot) => {
                const checked = availableTimeSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`py-2 px-1 text-center font-mono rounded-xl border text-xs font-bold transition ${
                      checked
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                        : "bg-white/5 border-white/10 text-slate-500 hover:border-white/30"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Blocked Dates */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Block Unavailable Dates / Holidays
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="bg-[#162044] border border-blue-900/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={addBlockedDate}
                disabled={!newBlockedDate}
                className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                + Block Date
              </button>
            </div>
            {blockedDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blockedDates.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-mono"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => removeBlockedDate(d)}
                      className="text-rose-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-extrabold hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Availability & Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
