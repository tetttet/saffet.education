import Link from "next/link";
import type { Program, University } from "@/lib/data";
import { ArrowDot, Chip } from "./ui";
import { IconPin } from "./icons";
import { fill } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { hue, initials, label, usd, usdShort, years } from "@/lib/format";
import { uniImage, uniLogo } from "@/lib/images";
import { programName } from "@/lib/program-names";
import { LogoTile } from "./uni-logo";
import { Picture } from "./picture";

/**
 * Campus photo from /public/universities/<slug>.jpg, or a generated cover when there is none.
 * Fills its box: pass a positioned className such as "absolute inset-0" or "relative size-full".
 */
export function UniCover({
  uni,
  className = "relative size-full",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority,
}: {
  uni: University;
  className?: string;
  /** How wide the cover shows on screen, for picking the photo file. */
  sizes?: string;
  priority?: boolean;
}) {
  const h = hue(uni.slug);
  const image = uniImage(uni.slug);
  const logo = uniLogo(uni.slug);
  return (
    <div className={`overflow-hidden ${className}`}>
      {image ? (
        <Picture src={image} alt={uni.name} sizes={sizes} priority={priority} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
        style={{
          // Same dark base for every university, tinted by one soft glow so the grid looks consistent.
          background: `radial-gradient(70% 90% at 90% 0%, hsl(${h} 70% 50% / 0.55), transparent 65%), radial-gradient(60% 80% at 0% 100%, #0360eb40, transparent 60%), #0a1633`,
        }}
      >
        <svg className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <pattern id={`p-${uni.slug}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="#ffffff" strokeOpacity="0.06" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#p-${uni.slug})`} />
        </svg>
        {logo ? (
          <LogoTile logo={logo} initials="" hue={h} className="absolute top-1/2 right-[8%] size-[min(42%,9rem)] -translate-y-1/2 rounded-2xl p-[6%] ring-white/20" />
        ) : (
          <span
            className="absolute -right-2 -bottom-9 font-display text-[8rem] leading-none font-bold text-transparent select-none"
            style={{ WebkitTextStroke: "1.5px rgb(255 255 255 / 0.16)" }}
          >
            {initials(uni.name)}
          </span>
        )}
      </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1525]/75 via-[#0b1525]/15 to-transparent" />
    </div>
  );
}

export function UniMonogram({ uni, size = "md" }: { uni: University; size?: "md" | "lg" }) {
  const h = hue(uni.slug);
  const s = size === "lg" ? "size-[88px] text-2xl rounded-2xl" : "size-11 text-sm rounded-xl";
  return (
    <span
      className={`grid shrink-0 place-items-center bg-white font-display font-bold tracking-tight shadow-card ring-1 ring-ink-900/5 ${s}`}
      style={{ color: `hsl(${h} 55% 34%)` }}
    >
      {initials(uni.name)}
    </span>
  );
}

export async function UniversityCard({ uni }: { uni: University }) {
  const { t, href } = await getI18n();
  return (
    <Link href={href(`/universities/${uni.slug}`)} className="card card-hover group flex flex-col overflow-hidden">
      <div className="relative h-[150px]">
        <UniCover uni={uni} className="relative size-full" />
        <span className="chip absolute top-3 left-3 bg-white/90 text-ink-900 backdrop-blur">
          <IconPin className="size-3.5" />
          {label(t.labels.city, uni.city)}
        </span>
        <h3 className="absolute inset-x-4 bottom-3 font-display text-lg leading-snug font-bold text-white">{uni.name}</h3>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs font-semibold text-ink-400">
          {label(t.labels.type, uni.type)}
          {uni.founded ? ` · ${fill(t.common.since, { year: uni.founded })}` : ""}
        </p>
        <p className="text-sm text-ink-600">
          <b className="text-ink">{uni.stats.programs}</b> {t.universities.cardPrograms} · {t.common.from}{" "}
          <b className="text-ink">{usdShort(uni.stats.tuitionMin)}</b>
          {t.common.perYear}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-ink group-hover:text-brand">{t.universities.viewPrograms}</span>
          <ArrowDot />
        </div>
      </div>
    </Link>
  );
}

export async function ProgramCard({ p }: { p: Program }) {
  const { t, locale, href } = await getI18n();
  return (
    <Link href={href(`/programs/${p.id}`)} className="card card-hover group flex flex-col gap-3 p-5">
      <div className="flex flex-wrap gap-1.5">
        <Chip tone="dark">{label(t.labels.degree, p.degree)}</Chip>
        <Chip>{label(t.labels.language, p.language)}</Chip>
        {p.discount ? <Chip tone="accent">−{Math.round(p.discount)}%</Chip> : null}
      </div>
      <div>
        <h3 className="font-display text-[17px] leading-snug font-bold group-hover:text-brand">{programName(p.name, locale)}</h3>
        <p className="mt-1 text-sm text-ink-600">
          {p.uniName} · {label(t.labels.city, p.city)}
        </p>
      </div>
      <div className="mt-auto flex items-end justify-between border-t border-line pt-3">
        <div className="text-xs font-semibold text-ink-400">
          {label(t.labels.field, p.field)}
          <br />
          {years(p.years, t.years)}
        </div>
        <div className="text-right">
          {p.feeOfficial && p.fee && p.feeOfficial > p.fee ? (
            <div className="text-xs text-ink-400 line-through">{usd(p.feeOfficial)}</div>
          ) : null}
          <div className="font-display text-lg font-bold">
            {usd(p.fee, t.common.onRequest)}
            {p.fee != null && <span className="text-xs font-medium text-ink-400">{t.common.perYear}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
