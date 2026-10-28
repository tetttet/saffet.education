import Link from "next/link";
import { UniCover } from "./cards";
import { IconBriefcase, IconCap, IconFlask, IconTrophy } from "./icons";
import { fill } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { facet, featuredPrograms, getUniversity, totals } from "@/lib/data";
import { label, num, plural, usd } from "@/lib/format";
import { programName } from "@/lib/program-names";

const degreeIcons = {
  "Bachelor's Degree": IconCap,
  "Master's Degree": IconTrophy,
  "Associate Degree": IconBriefcase,
  "PhD / Doctorate": IconFlask,
};

/** Contents of the "Programmes" dropdown: study levels on the left, four highlighted programmes on the right. */
export async function ProgramsMenu() {
  const { t, locale, href } = await getI18n();
  const degrees = facet("degree").filter((d) => d.value in degreeIcons);
  const featured = featuredPrograms();

  return (
    <div className="grid grid-cols-[300px_1fr]">
      <div className="flex flex-col border-r border-ink/10 p-5">
        <p className="px-3 text-[11px] font-bold tracking-[0.12em] text-ink-400 uppercase">{t.nav.menuDegrees}</p>
        <ul className="mt-2 flex flex-col">
          {degrees.map((d) => {
            const Icon = degreeIcons[d.value as keyof typeof degreeIcons];
            return (
              <li key={d.value}>
                <Link
                  href={href(`/programs?degree=${encodeURIComponent(d.value)}`)}
                  className="group/item flex h-12 items-center gap-3 rounded-xl px-3 transition-colors hover:bg-brand-soft"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface text-ink-600 transition-colors group-hover/item:bg-white group-hover/item:text-brand">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink group-hover/item:text-brand">{label(t.labels.degree, d.value)}</span>
                  <span className="text-xs text-ink-400 tabular-nums">{num(d.count, locale)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href={href("/programs")} className="group/all mt-auto flex items-center justify-between gap-3 border-t border-ink/10 px-3 pt-4">
          <span>
            <span className="block text-sm font-semibold text-brand">{t.nav.menuAll}</span>
            <span className="mt-0.5 block text-xs text-muted">
              {fill(t.nav.menuAllText, { n: plural(totals.programs, locale, t.home.programsWords), u: totals.universities })}
            </span>
          </span>
          <span className="text-brand transition-transform group-hover/all:translate-x-1" aria-hidden>
            →
          </span>
        </Link>
      </div>

      <div className="p-5">
        <p className="text-[11px] font-bold tracking-[0.12em] text-ink-400 uppercase">{t.nav.menuPopular}</p>
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {featured.map((p, i) => {
            const uni = getUniversity(p.uni);
            return (
              <li key={p.id} className="mega-item" style={{ "--d": `${0.04 + i * 0.05}s` } as React.CSSProperties}>
                <Link
                  href={href(`/programs/${p.id}`)}
                  className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-ink/10 bg-white transition-colors duration-300 hover:border-ink/25"
                >
                  <div className="relative h-[128px] overflow-hidden">
                    {uni && <UniCover uni={uni} className="absolute inset-0" sizes="300px" />}
                    {p.discount ? (
                      <span className="absolute top-2.5 left-2.5 rounded-md bg-sun px-2 py-0.5 text-[11px] font-semibold text-ink-900">−{Math.round(p.discount)}%</span>
                    ) : null}
                    <span className="absolute inset-x-3 bottom-2 truncate text-[11px] font-semibold text-white/85">
                      {label(t.labels.field, p.field)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <strong className="line-clamp-2 min-h-[2.5em] font-display text-[14px] leading-snug font-semibold group-hover:text-brand">{programName(p.name, locale)}</strong>
                    <span className="mt-1 line-clamp-1 text-xs text-ink-600">
                      {p.uniName} · {label(t.labels.city, p.city)}
                    </span>
                    <span className="mt-auto flex items-baseline gap-1.5 pt-2.5">
                      <b className="font-display text-[15px]">{usd(p.fee)}</b>
                      <span className="text-[11px] text-ink-400">{t.common.perYear}</span>
                      {p.feeOfficial && p.fee && p.feeOfficial > p.fee ? (
                        <span className="ml-auto text-[11px] text-ink-400 line-through">{usd(p.feeOfficial)}</span>
                      ) : null}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
