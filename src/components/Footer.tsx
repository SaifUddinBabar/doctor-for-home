import Link from "next/link";

const footerLinks = {
  Company: ["About Us", "Careers", "Press", "Blog"],
  Services: ["General Physician", "Pediatrics", "Cardiology", "All Specialties"],
  Support: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-blue-200">
      {/* ── Main footer grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-green-400 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth={2.5}>
                <path d="M12 7v10M7 12h10" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-extrabold text-xl text-white">
              Doctors<span className="text-green-400">4Home</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed mb-5 text-blue-300">
            Bringing world-class healthcare to your doorstep. Certified doctors, same-day visits.
          </p>
          {/* Social icons */}
          <div className="flex gap-3">
            {["twitter", "facebook", "instagram", "linkedin"].map((s) => (
              <Link
                key={s}
                href="#"
                className="w-9 h-9 bg-blue-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label={s}
              >
                <span className="text-xs font-bold text-blue-300 capitalize">{s[0].toUpperCase()}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{heading}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-blue-300 hover:text-white transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-blue-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-blue-400">
          <p>© 2026 Doctors4Home, Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-blue-300">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
