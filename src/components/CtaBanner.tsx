export default function CtaBanner() {
  return (
    <section id="emergency" className="border-y border-rose-300/10 bg-gradient-to-r from-[#2A1428] via-[#20152C] to-[#111B32] py-8 sm:py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 sm:px-8 md:flex-row md:items-center md:gap-5 xl:px-10">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-300/15 bg-rose-300/[.08] text-rose-200">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true"><path d="M12 3 2.8 19a1.3 1.3 0 0 0 1.1 2h16.2a1.3 1.3 0 0 0 1.1-2L12 3Z" /><path d="M12 9v4m0 3h.01" strokeLinecap="round" /></svg>
        </span>
        <div>
          <h2 className="text-sm font-bold text-white sm:text-base">Need emergency care?</h2>
          <p className="mt-1 text-xs leading-5 text-[#B6A9BC] sm:text-sm">For severe or life-threatening symptoms, contact your local emergency service now. Do not wait for an online appointment or chat response.</p>
        </div>
      </div>
    </section>
  );
}
