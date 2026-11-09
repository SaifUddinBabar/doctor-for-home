import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-sky-50 to-green-50 overflow-hidden">
      {/* ── Decorative background blobs ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-green-100 rounded-full translate-y-1/2 -translate-x-1/4 opacity-50 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        {/* ── Left: Text content ── */}
        <div className="animate-fade-in-up">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            <span>🏠</span> Healthcare at Your Doorstep
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-900 leading-tight mb-6">
            Expert Doctors,
            <br />
            <span className="text-green-500">Right at Home.</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
            Skip the waiting room. Connect with certified physicians and specialists who come to you —
            available <strong>7 days a week</strong>, within hours.
          </p>

          {/* ── CTA Buttons ── */}
          <div className="flex flex-wrap gap-4 mb-10" id="book">
            <Link
              href="#book"
              className="pulse-cta inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-base transition-all shadow-lg hover:shadow-green-200 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book a Home Visit
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full text-base transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              How It Works
            </Link>
          </div>

          {/* ── Trust badges ── */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            {[
              "500+ Verified Doctors",
              "Same-Day Visits",
              "4.9★ Rated",
            ].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5">
                <span className="text-green-500 font-bold">✓</span>
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Doctor card illustration ── */}
        <div className="animate-fade-in-up animate-delay-300 flex justify-center">
          <div className="relative w-72 h-auto">
            {/* Main card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-7 flex flex-col items-center gap-5">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center ring-4 ring-white shadow-md">
                <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
                  <circle cx="24" cy="17" r="8" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" />
                  <path d="M12 42c0-7 5.4-12 12-12s12 5 12 12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <rect x="30" y="26" width="14" height="10" rx="2" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1.8" />
                  <path d="M37 29v4M35 31h4" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>

              <div className="text-center">
                <p className="font-bold text-blue-900 text-base">Dr. Sarah Mitchell</p>
                <p className="text-sm text-slate-500">General Physician • 12 yrs exp.</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-slate-400 ml-1">(4.9)</span>
                </div>
              </div>

              {/* Availability */}
              <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-green-700 font-semibold flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                  Available Today
                </p>
                <p className="text-sm font-bold text-green-600 mt-0.5">Next slot: 2:30 PM</p>
              </div>

              <Link
                href="#book"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold text-sm py-3 rounded-xl transition-colors text-center"
              >
                Book This Doctor
              </Link>
            </div>

            {/* Floating rating badge */}
            <div className="absolute -top-4 -right-4 bg-white border border-blue-100 rounded-2xl shadow-lg px-3 py-2 text-xs font-semibold text-blue-700 flex items-center gap-1">
              <span className="text-yellow-400 text-sm">★</span> 4.9 / 5.0
            </div>

            {/* Floating home-visit badge */}
            <div className="absolute -bottom-4 -left-4 bg-white border border-green-100 rounded-2xl shadow-lg px-3 py-2 text-xs font-semibold text-green-700 flex items-center gap-1">
              🏠 Home Visit
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
