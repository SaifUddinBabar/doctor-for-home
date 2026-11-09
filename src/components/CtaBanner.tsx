import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 py-20 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center text-white">
        <span className="inline-block bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
          Ready to get started?
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Your Health, Our Priority.
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          Book a certified doctor in under 2 minutes. Same-day home visits, 7 days a week.
          Your wellbeing is just one tap away.
        </p>
        <Link
          href="#book"
          className="inline-flex items-center gap-3 bg-white text-blue-700 font-extrabold px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform shadow-2xl hover:shadow-white/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Book a Home Visit Now
        </Link>
        <p className="mt-6 text-blue-200 text-sm">
          No registration fee · Cancel anytime · 100% satisfaction guaranteed
        </p>
      </div>
    </section>
  );
}
