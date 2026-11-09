const stats = [
  { value: "500+",  label: "Certified Doctors" },
  { value: "50K+",  label: "Home Visits Done" },
  { value: "4.9★",  label: "Average Rating" },
  { value: "24/7",  label: "Support Available" },
];

export default function StatsStrip() {
  return (
    <section className="bg-blue-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-3xl md:text-4xl font-extrabold text-green-400">{value}</p>
            <p className="text-blue-200 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
