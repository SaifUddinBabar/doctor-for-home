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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
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
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            placeholder="Search by doctor, specialty, location, or language…"
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-slate-700 placeholder:text-slate-400 transition-all bg-slate-50 focus:bg-white"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Search button ── */}
        <button type="submit" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm shadow-sm shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </form>

      {/* ── Result count ── */}
      <p className="text-xs text-slate-400 mt-3 pl-1">
        {resultCount === 0 ? (
          <span className="text-red-400 font-medium">No doctors found. Try a different search.</span>
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-blue-600">{resultCount}</span>{" "}
            doctor{resultCount !== 1 ? "s" : ""} available for home visits
          </>
        )}
      </p>
    </div>
  );
}
