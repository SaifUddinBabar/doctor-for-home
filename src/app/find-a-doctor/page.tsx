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
      const res = await fetch(`/api/doctors?sort=${sortKey}`);
      if (!res.ok) {
        throw new Error("Unable to load verified doctors list.");
      }
      const data = await res.json();
      if (!isMountedRef.current) return;

      if (Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
      }
      if (data.filterOptions) {
        if (Array.isArray(data.filterOptions.specialties) && data.filterOptions.specialties.length > 0) {
          setAllSpecialties(data.filterOptions.specialties);
        }
        if (Array.isArray(data.filterOptions.locations) && data.filterOptions.locations.length > 0) {
          setAllLocations(data.filterOptions.locations);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load doctors");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [sortKey]);

  useEffect(() => {
    fetchDoctors(doctors.length === 0);
  }, [fetchDoctors, doctors.length]);

  /* ── Toggle helpers ──────────────────────────────────────────────────────── */
  const toggleSpecialty = useCallback((val: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  }, []);

  const toggleLocation = useCallback((val: string) => {
    setSelectedLocations((prev) =>
      prev.includes(val) ? prev.filter((l) => l !== val) : [...prev, val]
    );
  }, []);

  const clearAll = useCallback(() => {
    setSelectedSpecialties([]);
    setSelectedLocations([]);
    setQuery("");
  }, []);

  /* ── Filtered + sorted doctor list (instant client-side sort & filter) ──── */
  const filteredDoctors = useMemo(() => {
    const q = query.toLowerCase().trim();

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
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        {/* ── Page header ── */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white">Find a Doctor</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Find a Doctor</h1>
                <p className="text-blue-200 text-base md:text-lg max-w-xl">
                  Connect with BMDC-verified certified medical practitioners for home visits &amp; video consultations.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                <span className="text-sm font-semibold text-emerald-300">Live Database Verified</span>
              </div>
            </div>

            {/* ── Specialty quick-picks ── */}
            {allSpecialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {allSpecialties.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => toggleSpecialty(sp)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      selectedSpecialties.includes(sp)
                        ? "bg-white text-blue-800 border-white shadow-sm"
                        : "border-blue-400/60 text-blue-100 hover:border-white hover:text-white"
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Main content area ── */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* ── Search bar ── */}
          <div className="mb-6">
            <SearchBar
              value={query}
              onChange={setQuery}
              resultCount={filteredDoctors.length}
            />
          </div>

          <div className="flex gap-6">
            {/* ── Filter sidebar (desktop) ── */}
            <div className="hidden lg:block w-64 shrink-0">
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

            {/* ── Doctor grid ── */}
            <div className="flex-1 min-w-0">
              {/* Sort + Mobile filter toggle bar */}
              <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                {/* Mobile filter button */}
                <button
                  className="lg:hidden flex items-center gap-2 text-sm font-semibold text-blue-700 bg-white border border-blue-200 px-4 py-2 rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.586a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-sm text-slate-500 shrink-0">Sort by:</label>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="text-sm font-semibold text-slate-700 border-2 border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile filter panel */}
              {mobileFiltersOpen && (
                <div className="lg:hidden mb-5">
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

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {selectedSpecialties.map((sp) => (
                    <span
                      key={sp}
                      className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      {sp}
                      <button onClick={() => toggleSpecialty(sp)} className="hover:text-blue-900">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  {selectedLocations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      📍 {loc}
                      <button onClick={() => toggleLocation(loc)} className="hover:text-green-900">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Initial Loading Skeleton (only on very first load when zero doctors exist) */}
              {isLoading && doctors.length === 0 && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2 py-4">
                        <div className="h-3 bg-slate-100 rounded w-full" />
                        <div className="h-3 bg-slate-100 rounded w-5/6" />
                      </div>
                      <div className="h-10 bg-slate-200 rounded-xl mt-4" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {!isLoading && error && doctors.length === 0 && (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm py-16 text-center p-6">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Unable to Load Doctors</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">{error}</p>
                  <button
                    onClick={() => fetchDoctors(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Grid or Empty */}
              {filteredDoctors.length > 0 && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredDoctors.map((doctor, idx) => (
                    <DoctorCard key={String(doctor.id)} doctor={doctor} index={idx} />
                  ))}
                </div>
              )}

              {!isLoading && filteredDoctors.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No verified doctors found</h3>
                  <p className="text-slate-500 text-sm mb-5 max-w-xs mx-auto">
                    Try adjusting your search query or clearing the active filters.
                  </p>
                  <button
                    onClick={clearAll}
                    className="text-sm font-semibold text-blue-600 border-2 border-blue-200 px-5 py-2 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
