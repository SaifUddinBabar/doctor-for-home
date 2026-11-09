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
  colorClass = "text-blue-600",
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
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item) => {
          const checked = selected.includes(item);
          return (
            <label
              key={item}
              className={`flex items-center gap-3 cursor-pointer group rounded-lg px-3 py-2 transition-colors ${
                checked ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                  checked
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-300 group-hover:border-blue-300"
                }`}
              >
                {checked && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
              <span className={`text-sm ${checked ? `font-semibold ${colorClass}` : "text-slate-600"}`}>
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
    <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-fit sticky top-24">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.586a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
            </svg>
          </div>
          <h2 className="font-bold text-blue-900 text-base">Filters</h2>
          {totalActive > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalActive}
            </span>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="border-t border-slate-100 pt-5">
          <FilterGroup
            title="Specialty"
            icon={
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            items={specialties}
            selected={selectedSpecialties}
            onChange={onSpecialtyChange}
            colorClass="text-blue-600"
          />
        </div>

        <div className="border-t border-slate-100 pt-5">
          <FilterGroup
            title="Location"
            icon={
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            items={locations}
            selected={selectedLocations}
            onChange={onLocationChange}
            colorClass="text-green-600"
          />
        </div>

        {/* ── Availability quick-filter ── */}
        <div className="border-t border-slate-100 pt-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-xs font-semibold text-green-700 mb-2">🟢 Show Available Only</p>
            <p className="text-xs text-green-600">Toggle available doctors (coming soon)</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
