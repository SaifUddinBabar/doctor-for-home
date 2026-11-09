import Link from "next/link";

const questions = [
  {
    question: "How do virtual consultations work?",
    answer: "Choose Video Consultation in the appointment form and send a request. The provider will need to confirm the appointment details; the form does not create an instant video call.",
  },
  {
    question: "Is my health data secure and private?",
    answer: "Please share only the information needed to arrange your request, and avoid including sensitive personal details in the optional notes. The site does not claim a specific security certification.",
  },
  {
    question: "Can I get prescriptions through telemedicine?",
    answer: "A licensed clinician decides whether a prescription is appropriate after an evaluation. This site does not currently connect prescriptions to a pharmacy.",
  },
  {
    question: "Do you offer home visits for medical care?",
    answer: "Yes. Browse the doctor directory, review each profile's location and availability, and send a Home Visit request for a preferred date and time.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "Doctor profiles display listed visit fees. Online payment processing is not configured on this site, so confirm payment arrangements with the provider before your appointment.",
  },
  {
    question: "Is telemedicine available 24/7?",
    answer: "You can submit an appointment request at any time. Actual provider availability varies, so check the doctor's profile and wait for confirmation. For emergencies, contact your local emergency service.",
  },
];

export default function FaqSection() {
  return (
    <section className="relative bg-[#080D23] py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-20 xl:px-10">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <span className="section-eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-[#DF48C7]" /> FAQS</span>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-.04em] text-white sm:text-4xl lg:text-[46px]">Questions?<br />We&apos;ve got answers</h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#A2AEC3]">Everything you need to know about requesting care through DoctorForHome.</p>
          <div className="mt-8 rounded-2xl border border-white/[.08] bg-[#111B32]/70 p-5">
            <p className="text-sm font-semibold text-white">Still have questions?</p>
            <p className="mt-1.5 text-xs leading-5 text-[#929FB4]">Use the appointment form to tell us what kind of care you&apos;re looking for.</p>
            <Link href="#contact" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#45D5EA] transition hover:text-white">Contact Support <span aria-hidden="true">→</span></Link>
          </div>
        </div>

        <div className="space-y-3">
          {questions.map(({ question, answer }, index) => (
            <details key={question} className="faq-item group rounded-2xl border border-white/[.08] bg-[#111B32]/70 transition-colors open:border-[#398BF2]/30 open:bg-[#111B32]">
              <summary className="flex min-h-[68px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16C9E8] sm:px-6">
                <span className="flex items-center gap-4 text-sm font-semibold text-[#E8EDF6] sm:text-[15px]">
                  <span className="text-[10px] font-bold tracking-wider text-[#77859D]">0{index + 1}</span>{question}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#9EABC0] transition group-open:rotate-45 group-open:border-[#398BF2]/40 group-open:text-[#52D9EC]" aria-hidden="true">+</span>
              </summary>
              <div className="faq-content"><div><p className="px-5 pb-5 pl-[54px] text-[13px] leading-6 text-[#9EABC0] sm:px-6 sm:pb-6 sm:pl-[66px]">{answer}</p></div></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
