import Link from "next/link";
import type { Program } from "@/lib/data";
import { IconClock, IconGlobe, IconPin } from "./icons";
import { getI18n } from "@/i18n/server";
import { hue, initials, label, usd, years } from "@/lib/format";
import { uniImage, uniLogo } from "@/lib/images";
import { programName } from "@/lib/program-names";
import { LogoCover } from "./uni-logo";
import { Picture } from "./picture";

/**
 * Wide result row: university photo on the left, programme details in the middle, price on the right.
 * `compact` drops the price column and puts the price under the details, for half-width grids.
 * `hideUni` leaves out the photo and university line, for lists on that university's own page.
 */
export async function ProgramRow({ p, compact = false, hideUni = false }: { p: Program; compact?: boolean; hideUni?: boolean }) {
  const { t, locale, href } = await getI18n();
  const image = uniImage(p.uni);
  const h = hue(p.uni);
  const discounted = p.feeOfficial && p.fee && p.feeOfficial > p.fee;
  return (
    <Link
      href={href(`/programs/${p.id}`)}
      className="group flex flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-white transition-colors duration-300 hover:border-ink/25 sm:flex-row"
    >
      {!hideUni && (
        <div className={`relative h-36 shrink-0 overflow-hidden bg-ink-50 sm:h-auto ${compact ? "sm:w-40" : "sm:w-48"}`}>
          {image ? (
            <Picture src={image} sizes="(min-width: 640px) 192px, 100vw" className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
          ) : (
            <LogoCover logo={uniLogo(p.uni)} initials={initials(p.uniName)} hue={h} size="sm" />
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
          <span className="rounded-md bg-brand-soft px-2 py-0.5 font-semibold text-brand">{label(t.labels.degree, p.degree)}</span>
          <span className="text-muted">{label(t.labels.field, p.field)}</span>
          {compact && p.discount ? <span className="ml-auto rounded-md bg-sun/15 px-2 py-0.5 text-xs font-semibold text-[#a35f00]">−{Math.round(p.discount)}%</span> : null}
        </p>
        <h3 className="font-display text-lg leading-snug font-semibold text-ink transition-colors group-hover:text-brand">{programName(p.name, locale)}</h3>
        {!hideUni && (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <IconPin className="size-4 shrink-0" />
            <span className="truncate">
              {p.uniName} · {label(t.labels.city, p.city)}
            </span>
          </p>
        )}
        <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[13px] text-ink-600">
          <span className="inline-flex items-center gap-1.5">
            <IconGlobe className="size-4 text-ink-400" />
            {label(t.labels.language, p.language)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock className="size-4 text-ink-400" />
            {years(p.years, t.years)}
          </span>
        </p>
        {compact && (
          <div className="mt-2 flex items-end justify-between gap-4 border-t border-ink/10 pt-3">
            <Price p={p} perYear={t.common.perYear} onRequest={t.common.onRequest} discounted={Boolean(discounted)} />
            <More label={t.program.details} />
          </div>
        )}
      </div>

      {!compact && (
        <div className="flex shrink-0 items-end justify-between gap-4 border-t border-ink/10 p-5 sm:w-48 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:border-l sm:text-right">
          <div>
            {p.discount ? <span className="mb-1.5 inline-block rounded-md bg-sun/15 px-2 py-0.5 text-xs font-semibold text-[#a35f00]">−{Math.round(p.discount)}%</span> : null}
            <Price p={p} perYear={t.common.perYear} onRequest={t.common.onRequest} discounted={Boolean(discounted)} />
          </div>
          <More label={t.program.details} />
        </div>
      )}
    </Link>
  );
}

function Price({ p, perYear, onRequest, discounted }: { p: Program; perYear: string; onRequest: string; discounted: boolean }) {
  return (
    <div>
      {discounted ? <div className="text-xs text-ink-400 line-through">{usd(p.feeOfficial)}</div> : null}
      <div className="font-display text-xl font-bold text-ink">
        {usd(p.fee, onRequest)}
        {p.fee != null && <span className="text-xs font-medium text-muted">{perYear}</span>}
      </div>
    </div>
  );
}

function More({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand">
      {label}
      <svg viewBox="0 0 24 24" className="size-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}
