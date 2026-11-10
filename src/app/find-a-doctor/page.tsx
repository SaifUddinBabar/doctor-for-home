"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DoctorCard from "@/components/DoctorCard";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import type { Doctor } from "@/types/doctor";

type SortKey = "rating" | "fee_asc" | "fee_desc" | "experience";

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Highest Rated",    value: "rating"      },
  { label: "Fee: Low to High", value: "fee_asc"     },
  { label: "Fee: High to Low", value: "fee_desc"    },
  { label: "Most Experienced", value: "experience"  },
];

const DEFAULT_SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "General Physician",
  "Gynecology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
];

const DEFAULT_LOCATIONS = ["Chittagong", "Dhaka", "Sylhet"];

export default function FindADoctorPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allSpecialties, setAllSpecialties] = useState<string[]>(DEFAULT_SPECIALTIES);
  const [allLocations, setAllLocations] = useState<string[]>(DEFAULT_LOCATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch doctors dynamically from database API
  const fetchDoctors = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/doctors");
      if (!res.ok) {
        throw new Error("Failed to load doctors catalog.");
      }
      const data = await res.json();
      if (!isMountedRef.current) return;

      const fetchedDoctors: Doctor[] = data.doctors || [];
      setDoctors(fetchedDoctors);

      // Extract unique specialties and locations dynamically
      const specialtiesSet = new Set<string>();
      const locationsSet = new Set<string>();

      fetchedDoctors.forEach((d) => {
        if (d.specialty) specialtiesSet.add(d.specialty);
        if (d.location) locationsSet.add(d.location);
      });

      if (specialtiesSet.size > 0) setAllSpecialties(Array.from(specialtiesSet));
      if (locationsSet.size > 0) setAllLocations(Array.from(locationsSet));
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Unable to reach doctors service.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDoctors(true);
  }, [fetchDoctors]);

  // Toggle filter handlers
  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  }

  function toggleLocation(location: string) {
    setSelectedLocations((prev) =>
      prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]
    );
  }

  function clearAll() {
    setSelectedSpecialties([]);
    setSelectedLocations([]);
    setQuery("");
  }

  // Filtered & sorted doctor list
  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();

    return doctors
      .filter((d) => {
        const matchQuery =
          !q ||
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          (d.location && d.location.toLowerCase().includes(q)) ||
          (d.hospital && d.hospital.toLowerCase().includes(q)) ||
          (d.bmdcNumber && d.bmdcNumber.toLowerCase().includes(q)) ||
          (d.bio && d.bio.toLowerCase().includes(q));

        const matchSpecialty =
          selectedSpecialties.length === 0 || selectedSpecialties.includes(d.specialty);

        const matchLocation =
          selectedLocations.length === 0 || (d.location && selectedLocations.includes(d.location));

        return matchQuery && matchSpecialty && matchLocation;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "rating":     return (b.rating || 4.9) - (a.rating || 4.9);
          case "fee_asc":    return a.fee - b.fee;
          case "fee_desc":   return b.fee - a.fee;
          case "experience": return b.experience - a.experience;
        }
      });
  }, [doctors, query, selectedSpecialties, selectedLocations, sortKey]);

  const activeFilterCount = selectedSpecialties.length + selectedLocations.length;

  return (
    <div className="min-h-screen bg-[#080D23] text-white">
      <Navbar />

      <main>
        {/* ── Page Header Banner ── */}
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#170E3A] via-[#111936] to-[#0E2042] py-12">
          {/* Ambient Glows */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#16C9E8]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#DF48C7]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex items-center gap-2 text-[#8794AD] text-xs sm:text-sm mb-4">
              <Link href="/" className="hover:text-[#16C9E8] transition-colors">Home</Link>
              <span className="text-white/20">/</span>
              <span className="text-white font-semibold">Find a Doctor</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#16C9E8]/30 bg-[#16C9E8]/10 px-3 py-1 text-xs font-bold text-[#16C9E8] uppercase tracking-wider mb-3">
                  <span>✦</span> Clinical Directory
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Find a Doctor</h1>
                <p className="text-[#A2AEC3] text-sm md:text-base max-w-xl mt-2 leading-relaxed">
                  Connect with BMDC-verified certified medical practitioners for home visits &amp; secure video consultations.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <div>
                  <span className="block text-xs font-extrabold text-white">Live BMDC Verification</span>
                  <span className="block text-[11px] text-emerald-300 font-mono">Real-time Physician Database</span>
                </div>
              </div>
            </div>

            {/* ── Specialty Quick-Picks ── */}
            {allSpecialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {allSpecialties.map((sp) => {
                  const isSelected = selectedSpecialties.includes(sp);
                  return (
                    <button
                      key={sp}
                      onClick={() => toggleSpecialty(sp)}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#16C9E8] to-[#398BF2] text-[#080D23] border-transparent shadow-lg shadow-cyan-500/20"
                          : "border-white/15 bg-white/5 text-[#B9C4D7] hover:border-[#16C9E8] hover:text-white"
                      }`}
                    >
                      {sp}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* ── Search Bar ── */}
          <div className="mb-8">
            <SearchBar
              value={query}
              onChange={setQuery}
              resultCount={filteredDoctors.length}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Filter Sidebar (desktop) ── */}
            <div className="hidden lg:block w-72 shrink-0">
              <FilterSidebar
                specialties={allSpecialties}
                locations={allLocations}
                selectedSpecialties={selectedSpecialties}
                selectedLocations={selectedLocations}
                onSpecialtyChange={toggleSpecialty}
                onLocationChange={toggleLocation}
                onClearAll={clearAll}
                totalActive={activeFilterCount}
              />
            </div>

            {/* ── Doctor Grid Area ── */}
            <div className="flex-1 min-w-0">
              {/* Sort + Mobile Filter Toggle Bar */}
              <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                {/* Mobile Filter Button */}
                <button
                  className="lg:hidden flex items-center gap-2 text-xs font-bold text-[#16C9E8] bg-[#0E1733] border border-white/15 px-4 py-2.5 rounded-xl shadow-md hover:bg-white/5 transition-all"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.586a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
                  </svg>
                  Filter Doctors
                  {activeFilterCount > 0 && (
                    <span className="bg-[#16C9E8] text-[#080D23] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8794AD] shrink-0">Sort by:</label>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="text-xs font-bold text-white border border-white/15 rounded-xl px-3.5 py-2.5 bg-[#162044] focus:outline-none focus:border-[#16C9E8] cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#162044] text-white">{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile Filter Panel */}
              {mobileFiltersOpen && (
                <div className="lg:hidden mb-6">
                  <FilterSidebar
                    specialties={allSpecialties}
                    locations={allLocations}
                    selectedSpecialties={selectedSpecialties}
                    selectedLocations={selectedLocations}
                    onSpecialtyChange={toggleSpecialty}
                    onLocationChange={toggleLocation}
                    onClearAll={clearAll}
                    totalActive={activeFilterCount}
                  />
                </div>
              )}

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedSpecialties.map((sp) => (
                    <span
                      key={sp}
                      className="inline-flex items-center gap-1.5 bg-[#16C9E8]/10 text-[#16C9E8] border border-[#16C9E8]/30 text-xs font-bold px-3 py-1.5 rounded-full"
                    >
                      {sp}
                      <button onClick={() => toggleSpecialty(sp)} className="hover:text-white transition">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  {selectedLocations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-full"
                    >
                      📍 {loc}
                      <button onClick={() => toggleLocation(loc)} className="hover:text-white transition">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Initial Loading Skeleton */}
              {isLoading && doctors.length === 0 && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="rounded-3xl border border-white/10 bg-[#0E1733] p-6 animate-pulse space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4" />
                          <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2 py-4">
                        <div className="h-3 bg-white/5 rounded w-full" />
                        <div className="h-3 bg-white/5 rounded w-5/6" />
                      </div>
                      <div className="h-10 bg-white/10 rounded-xl mt-4" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {!isLoading && error && doctors.length === 0 && (
                <div className="rounded-3xl border border-rose-500/20 bg-[#0E1733] py-16 text-center p-6 shadow-2xl">
                  <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Unable to Load Doctors</h3>
                  <p className="text-[#A2AEC3] text-sm mb-6 max-w-sm mx-auto">{error}</p>
                  <button
                    onClick={() => fetchDoctors(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#16C9E8] to-[#398BF2] text-[#080D23] font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-95 transition"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Doctors Grid */}
              {filteredDoctors.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {filteredDoctors.map((doctor, idx) => (
                    <DoctorCard key={String(doctor.id)} doctor={doctor} index={idx} />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredDoctors.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-[#0E1733] py-20 text-center shadow-xl p-6">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5 text-[#8794AD]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No verified doctors found</h3>
                  <p className="text-[#A2AEC3] text-sm mb-6 max-w-xs mx-auto">
                    Try adjusting your search keywords or resetting your active filters.
                  </p>
                  <button
                    onClick={clearAll}
                    className="text-xs font-bold text-[#16C9E8] border border-[#16C9E8]/30 bg-[#16C9E8]/10 px-6 py-2.5 rounded-full hover:bg-[#16C9E8]/20 transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
