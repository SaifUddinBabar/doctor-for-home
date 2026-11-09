const stats = [
  { value: "500+", label: "Certified Doctors", accent: "text-[#42D9EC]" },
  { value: "50K+", label: "Home Visits Done", accent: "text-[#A987FF]" },
  { value: "4.9", label: "Average Rating", accent: "text-[#EB71D4]" },
];

export default function StatsStrip() {
  return (
    <div aria-label="Platform statistics" className="mt-11 grid max-w-[520px] grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/[.08] bg-white/[.035] py-4 backdrop-blur-sm sm:py-5">
      {stats.map(({ value, label, accent }) => (
        <div key={label} className="px-3 text-center sm:px-5">
          <p className={`text-2xl font-extrabold tracking-tight sm:text-[28px] ${accent}`}>{value}</p>
          <p className="mt-1.5 text-[9px] leading-4 text-[#98A5BA] sm:text-[11px]">{label}</p>
        </div>
      ))}
    </div>
  );
}
