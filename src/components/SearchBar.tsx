"use client";

import { useCallback, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1733] p-4 shadow-xl md:p-5">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          onChange(inputRef.current?.value ?? value);
        }}
        className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      >
        {/* ── Search input ── */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#8794AD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            aria-label="Search doctors"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search by doctor name, specialty, hospital, or city…"
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-white/10 bg-[#162044] text-sm text-white placeholder-[#8794AD] focus:outline-none focus:border-[#16C9E8] focus:ring-1 focus:ring-[#16C9E8] transition-all"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-3 flex items-center text-[#8794AD] hover:text-white"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Search button ── */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#16C9E8] to-[#398BF2] hover:opacity-95 text-[#080D23] font-black px-6 py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-cyan-500/20 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </form>

      {/* ── Result count ── */}
      <p className="text-xs text-[#8794AD] mt-3 pl-1 flex items-center gap-2">
        {resultCount === 0 ? (
          <span className="text-rose-400 font-medium">No verified doctors match your criteria. Try clearing some filters.</span>
        ) : (
          <>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#16C9E8]" />
            Showing{" "}
            <strong className="text-[#16C9E8] font-bold">{resultCount}</strong>{" "}
            verified physician{resultCount !== 1 ? "s" : ""} available for video consultations &amp; home visits
          </>
        )}
      </p>
    </div>
  );
}
