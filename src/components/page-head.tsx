/** Heading of the catalogue pages (/programs, /universities); also shown as-is by their loading screens. */
export function PageHead({ t }: { t: { eyebrow: string; titleStart: string; titleMarker: string; lead: string } }) {
  return (
    <section className="container-page pt-12 pb-8 sm:pt-16">
      <p className="font-mono text-sm text-ink-600 sm:text-[15px]">{t.eyebrow}</p>
      <h1 className="section-title mt-3">
        {t.titleStart} {t.titleMarker}
      </h1>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted sm:text-[15px]">{t.lead}</p>
    </section>
  );
}
