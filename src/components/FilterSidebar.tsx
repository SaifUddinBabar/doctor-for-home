"use client";

interface FilterSidebarProps {
  specialties: string[];
  locations: string[];
  selectedSpecialties: string[];
  selectedLocations: string[];
  onSpecialtyChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onClearAll: () => void;
  totalActive: number;
}

function FilterGroup({
  title,
  icon,
  items,
  selected,
  onChange,
  colorClass = "text-[#16C9E8]",
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  selected: string[];
  onChange: (val: string) => void;
  colorClass?: string;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A2AEC3] mb-3">
        {icon}
        {title}
      </h3>
      <div className="space-y-1.5">
        {items.map((item) => {
          const checked = selected.includes(item);
          return (
            <label
              key={item}
              className={`flex items-center gap-3 cursor-pointer group rounded-xl px-3 py-2 transition-all ${
                checked
                  ? "bg-[#16C9E8]/10 border border-[#16C9E8]/30 text-white"
                  : "hover:bg-white/5 text-[#B9C4D7] border border-transparent"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                  checked
                    ? "border-[#16C9E8] bg-[#16C9E8] text-[#080D23]"
                    : "border-white/20 bg-white/5 group-hover:border-[#16C9E8]/50"
                }`}
              >
                {checked && (
                  <svg className="w-2.5 h-2.5 text-[#080D23]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={() => onChange(item)}
              />
              <span className={`text-xs ${checked ? `font-bold ${colorClass}` : "text-[#B9C4D7]"}`}>
                {item}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterSidebar({
  specialties,
  locations,
  selectedSpecialties,
  selectedLocations,
  onSpecialtyChange,
  onLocationChange,
  onClearAll,
  totalActive,
}: FilterSidebarProps) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-[#0E1733] p-6 shadow-xl sticky top-24">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#16C9E8]/10 flex items-center justify-center text-[#16C9E8]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.586a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
            </svg>
          </div>
          <h2 className="font-extrabold text-white text-base">Filter Physicians</h2>
          {totalActive > 0 && (
            <span className="bg-[#16C9E8] text-[#080D23] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {totalActive}
            </span>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="border-t border-white/10 pt-5">
          <FilterGroup
            title="Specialty"
            icon={
              <svg className="w-4 h-4 text-[#16C9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            items={specialties}
            selected={selectedSpecialties}
            onChange={onSpecialtyChange}
            colorClass="text-[#16C9E8]"
          />
        </div>

        <div className="border-t border-white/10 pt-5">
          <FilterGroup
            title="City / Division"
            icon={
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            items={locations}
            selected={selectedLocations}
            onChange={onLocationChange}
            colorClass="text-emerald-400"
          />
        </div>

        {/* ── BMDC Verified Guarantee Box ── */}
        <div className="border-t border-white/10 pt-5">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
              <span>🛡️</span> BMDC Verified Only
            </span>
            <p className="text-[11px] text-[#A2AEC3] leading-relaxed">
              Every doctor displayed is pre-screened &amp; approved against Bangladesh Medical Council credentials.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
