import Link from "next/link";

interface ServiceCard {
  id: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  price: string;
  variant: "blue" | "green" | "rose";
  popular?: boolean;
  icon: React.ReactNode;
}

const services: ServiceCard[] = [
  {
    id: "general-physician",
    title: "General Physician",
    tagline: "Primary care, simplified.",
    description:
      "Comprehensive primary care for fevers, infections, chronic conditions, and overall wellness check-ups — all in the comfort of your home.",
    features: [
      "Diagnosis & Prescriptions",
      "Blood Pressure & Sugar Check",
      "Follow-up Consultations",
    ],
    price: "From $49",
    variant: "blue",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "pediatrics",
    title: "Pediatrics",
    tagline: "Gentle care for little ones.",
    description:
      "Specialized child healthcare for infants, toddlers, and teens. Gentle, expert care your little ones deserve, delivered at home.",
    features: [
      "Infant & Child Checkups",
      "Vaccination & Immunization",
      "Growth & Development Tracking",
    ],
    price: "From $59",
    variant: "green",
    popular: true,
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "cardiology",
    title: "Cardiology",
    tagline: "Expert heart care at home.",
    description:
      "Our board-certified cardiologists diagnose and manage cardiovascular conditions with clinical precision — without you leaving your home.",
    features: [
      "ECG & Heart Monitoring",
      "Hypertension Management",
      "Post-Surgery Follow-up",
    ],
    price: "From $79",
    variant: "rose",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
        <path d="M12 21.593c-.525-.445-6.75-5.68-6.75-10.093A4.5 4.5 0 0112 7.17a4.5 4.5 0 016.75 4.33c0 4.413-6.225 9.648-6.75 10.093z" />
      </svg>
    ),
  },
];

const variantStyles = {
  blue: {
    card: "bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-100 hover:border-blue-200",
    iconBg: "bg-blue-500",
    title: "text-blue-900",
    price: "text-blue-600",
    btn: "bg-blue-500 hover:bg-blue-600 text-white",
    tick: "text-green-500",
    feature: "text-slate-500",
    desc: "text-slate-600",
  },
  green: {
    card: "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    iconBg: "bg-white/20",
    title: "text-white",
    price: "text-white",
    btn: "bg-white text-green-600 hover:bg-green-50",
    tick: "text-white",
    feature: "text-green-100",
    desc: "text-green-100",
  },
  rose: {
    card: "bg-gradient-to-br from-red-50 to-rose-100 border border-red-100 hover:border-rose-200",
    iconBg: "bg-rose-500",
    title: "text-blue-900",
    price: "text-blue-600",
    btn: "bg-rose-500 hover:bg-rose-600 text-white",
    tick: "text-green-500",
    feature: "text-slate-500",
    desc: "text-slate-600",
  },
};

export default function ServicesSection() {
  return (
    <section id="services" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* ── Section header ── */}
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Our Specializations
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4">
            Top Specialized Services
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-base md:text-lg">
            World-class care in the comfort of your home. Our specialists are just a booking away.
          </p>
        </div>

        {/* ── Service cards grid ── */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((svc, i) => {
            const s = variantStyles[svc.variant];
            return (
              <div
                key={svc.id}
                className={`
                  relative rounded-3xl p-8 flex flex-col
                  hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer
                  animate-fade-in-up
                  ${s.card}
                `}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Popular badge */}
                {svc.popular && (
                  <div className="absolute top-5 right-5 bg-white/25 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ Most Popular
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 ${s.iconBg} rounded-2xl flex items-center justify-center mb-5 shadow-sm`}>
                  {svc.icon}
                </div>

                {/* Text */}
                <h3 className={`text-xl font-bold mb-1 ${s.title}`}>{svc.title}</h3>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 opacity-70 ${s.title}`}>
                  {svc.tagline}
                </p>
                <p className={`text-sm leading-relaxed mb-5 ${s.desc}`}>{svc.description}</p>

                {/* Features */}
                <ul className={`text-sm space-y-2 mb-7 flex-1 ${s.feature}`}>
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className={`font-bold text-base ${s.tick}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Footer row */}
                <div className="flex items-center justify-between mt-auto">
                  <span className={`font-bold text-lg ${s.price}`}>{svc.price}</span>
                  <Link
                    href={`#book-${svc.id}`}
                    className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-colors ${s.btn}`}
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── View all link ── */}
        <div className="text-center mt-12">
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            View all specializations
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
