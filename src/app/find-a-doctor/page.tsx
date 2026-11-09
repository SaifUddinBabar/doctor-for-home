"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DoctorCard from "@/components/DoctorCard";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import doctorsData from "@/data/doctors.json";
import type { Doctor } from "@/types/doctor";

const doctors = doctorsData as Doctor[];

// Derive unique filter options from the data
const ALL_SPECIALTIES = [...new Set(doctors.map((d) => d.specialty))].sort();
const ALL_LOCATIONS   = [...new Set(doctors.map((d) => d.location))].sort();

type SortKey = "rating" | "fee_asc" | "fee_desc" | "experience";

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Highest Rated",    value: "rating"      },
  { label: "Fee: Low to High", value: "fee_asc"     },
  { label: "Fee: High to Low", value: "fee_desc"    },
  { label: "Most Experienced", value: "experience"  },
];

export default function FindADoctorPage() {
  const [query,               setQuery]               = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLocations,   setSelectedLocations]   = useState<string[]>([]);
  const [sortKey,             setSortKey]             = useState<SortKey>("rating");
  const [mobileFiltersOpen,   setMobileFiltersOpen]   = useState(false);

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

  /* ── Filtered + sorted doctor list ──────────────────────────────────────── */
  const filteredDoctors = useMemo(() => {
    const q = query.toLowerCase().trim();

    return doctors
      .filter((d) => {
        const matchQuery =
          !q ||
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.languages.some((language) => language.toLowerCase().includes(q)) ||
          d.bio.toLowerCase().includes(q);

        const matchSpecialty =
          selectedSpecialties.length === 0 || selectedSpecialties.includes(d.specialty);

        const matchLocation =
          selectedLocations.length === 0 || selectedLocations.includes(d.location);

        return matchQuery && matchSpecialty && matchLocation;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "rating":     return b.rating     - a.rating;
          case "fee_asc":    return a.fee         - b.fee;
          case "fee_desc":   return b.fee         - a.fee;
          case "experience": return b.experience  - a.experience;
        }
      });
  }, [query, selectedSpecialties, selectedLocations, sortKey]);

  const activeFilterCount = selectedSpecialties.length + selectedLocations.length;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        {/* ── Page header ── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white">Find a Doctor</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Find a Doctor</h1>
            <p className="text-blue-200 text-base md:text-lg max-w-xl">
              Browse our network of certified specialists — all available for same-day home visits.
            </p>

            {/* ── Specialty quick-picks ── */}
            <div className="flex flex-wrap gap-2 mt-5">
              {ALL_SPECIALTIES.map((sp) => (
                <button
                  key={sp}
                  onClick={() => toggleSpecialty(sp)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    selectedSpecialties.includes(sp)
                      ? "bg-white text-blue-700 border-white"
                      : "border-blue-400 text-blue-100 hover:border-white hover:text-white"
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
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
                specialties={ALL_SPECIALTIES}
                locations={ALL_LOCATIONS}
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
                    specialties={ALL_SPECIALTIES}
                    locations={ALL_LOCATIONS}
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

              {/* ── Grid ── */}
              {filteredDoctors.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredDoctors.map((doctor, idx) => (
                    <DoctorCard key={doctor.id} doctor={doctor} index={idx} />
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No doctors found</h3>
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
