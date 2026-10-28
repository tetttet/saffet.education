import Link from "next/link";
import type { CSSProperties } from "react";
import { IconCap, IconGlobe, IconMoney, IconTrophy } from "./icons";
import { fill } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { totals } from "@/lib/data";
import { reveal } from "@/lib/reveal";
import { Picture } from "./picture";

/** Quick ways into the catalogue, in the same order as `promo.choices` in the dictionaries. */
const choices = [
  { icon: IconCap, query: "degree=Bachelor's Degree" },
  { icon: IconTrophy, query: "degree=Master's Degree" },
  { icon: IconGlobe, query: "language=English" },
  { icon: IconMoney, query: "max=3000&sort=fee-asc" },
];

/** Dots of the little "constellation" next to the photo on the dark banner: [x, y] in a 260×260 box. */
const stars: [number, number][] = [[30, 60], [70, 150], [118, 96], [150, 200], [60, 230], [200, 40]];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Wordmark({ tag }: { tag?: string }) {
  return (
    <p className="flex items-center gap-1.5 font-display text-[16px] leading-none font-bold tracking-tight whitespace-nowrap text-white sm:gap-2 sm:text-[22px]">
      Saffet Education
      {tag && <span className="rounded-[5px] bg-white px-1.5 py-1 text-[9px] font-extrabold tracking-wide text-brand uppercase sm:text-[11px]">{tag}</span>}
    </p>
  );
}

/** Two promo banners (free shortlist, discounts) and a "what brings you here" bar. */
export async function HomePromos() {
  const { t, href } = await getI18n();
  const p = t.home.promo;

  return (
    <section className="mx-auto max-w-[1380px] space-y-5 px-4 py-6 sm:px-8 sm:py-10 lg:px-16">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Dark banner: free shortlist */}
        <div {...reveal} className="relative h-[250px] overflow-hidden rounded-[24px] bg-[#0d1117] sm:h-[280px]">
          <div className="relative z-10 flex h-full max-w-[64%] flex-col gap-3.5 p-5 sm:max-w-[55%] sm:gap-4 sm:px-9 sm:py-7">
            <Wordmark />
            <p className="text-[15px] leading-snug font-medium text-white sm:text-[21px]">{p.aTitle}</p>
            <Link href={href("/apply")} className="group mt-auto inline-flex h-10 w-fit items-center gap-1.5 rounded-lg whitespace-nowrap sm:h-11 sm:gap-2 bg-white px-3.5 text-[13px] font-semibold text-brand transition hover:bg-brand-soft sm:px-5 sm:text-[15px]">
              {p.aAction}
              <Arrow />
            </Link>
          </div>

          {/* Big brand circle with the photo, a small constellation and a round badge */}
          <div className="absolute top-0 right-0 bottom-0 w-[40%] sm:w-[48%]" aria-hidden>
            <div className="absolute -right-16 -bottom-24 size-[300px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#4a8bff,#0360eb_45%,#1a237e)] sm:size-[340px]" />
            <svg viewBox="0 0 260 260" className="absolute top-6 -left-6 size-[200px] sm:size-[240px]">
              <path d="M30 60 118 96 70 150 150 200M118 96 200 40M70 150 60 230" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
              {stars.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4.5} fill="#fff" className="twinkle" style={{ "--d": `${i * 0.6}s` } as CSSProperties} />
              ))}
            </svg>
            <div className="absolute right-6 bottom-0 h-[78%] w-[62%] overflow-hidden rounded-t-full sm:right-10">
              <Picture src="/promo/library.jpg" sizes="(min-width: 640px) 320px, 160px" className="size-full object-cover object-[50%_18%]" />
            </div>
            <span className="absolute top-5 right-4 grid size-[64px] place-items-center rounded-full bg-sun text-center font-display text-[11px] leading-tight font-extrabold text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.3)] ring-4 ring-[#0d1117] sm:right-6 sm:size-[86px] sm:text-sm">
              {p.badge}
              <svg viewBox="0 0 24 24" className="spin-slow absolute -top-2 -right-1 size-7 text-white" fill="currentColor">
                <path d="M12 2c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7Z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Blue banner: discounts */}
        <div {...reveal} style={{ "--d": "0.08s" } as CSSProperties} className="relative h-[250px] overflow-hidden rounded-[24px] bg-brand sm:h-[280px]">
          <div className="relative z-10 flex h-full max-w-[64%] flex-col gap-3.5 p-5 sm:max-w-[55%] sm:gap-4 sm:px-9 sm:py-7">
            <Wordmark tag={p.bTag} />
            <p className="text-[15px] leading-snug font-medium text-white sm:text-[21px]">
              {fill(p.bTitle, { n: totals.maxDiscount, u: totals.discountUnis })}
            </p>
            <Link href={href("/programs")} className="group mt-auto inline-flex h-10 w-fit items-center gap-1.5 rounded-lg whitespace-nowrap sm:h-11 sm:gap-2 bg-white px-3.5 text-[13px] font-semibold text-brand transition hover:bg-brand-soft sm:px-5 sm:text-[15px]">
              {p.bAction}
              <Arrow />
            </Link>
          </div>

          {/* Warm fan shapes behind an arched photo (static) */}
          <div className="absolute top-0 right-0 bottom-0 w-[38%] sm:w-[46%]" aria-hidden>
            <svg viewBox="0 0 300 280" preserveAspectRatio="xMaxYMax slice" className="absolute inset-0 size-full">
              <path d="M20 280 150 30Q235 -5 300 30V280Z" fill="#ff5fa8" />
              <path d="M150 280 245 70Q285 80 300 120V280Z" fill="#ffb54d" />
            </svg>
            <div className="absolute right-6 bottom-0 h-[86%] w-[64%] overflow-hidden rounded-t-full ring-4 ring-white/90 sm:right-10">
              <Picture src="/promo/student-blue.jpg" sizes="(min-width: 640px) 320px, 160px" className="size-full object-cover object-[50%_30%]" />
            </div>
          </div>
        </div>
      </div>

      {/* What brings you here */}
      <div {...reveal} className="flex flex-col gap-4 rounded-[24px] bg-[#eef4ff] p-5 sm:p-7 2xl:flex-row 2xl:items-center 2xl:gap-8 2xl:px-10">
        <p className="shrink-0 font-display text-xl font-semibold text-ink sm:text-2xl">{p.choiceTitle}</p>
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {choices.map(({ icon: Icon, query }, i) => (
            <Link
              key={query}
              href={href(`/programs?${query.replaceAll("'", "%27").replaceAll(" ", "%20")}`)}
              className="group flex items-center gap-3 rounded-2xl border border-ink/12 bg-white p-2 pr-4 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white sm:size-12">
                <Icon className="size-[22px]" />
              </span>
              <span className="min-w-0 text-[13px] leading-tight font-semibold text-ink group-hover:text-brand sm:text-[14px]">{p.choices[i]}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
