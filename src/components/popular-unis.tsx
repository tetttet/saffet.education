"use client";

import Link from "next/link";
import { LogoTile } from "./uni-logo";
import type { Logo } from "@/lib/images";
import { reveal } from "@/lib/reveal";
import { useState, type CSSProperties } from "react";
import { Picture } from "./picture";

export type PopularUni = {
  slug: string;
  href: string;
  name: string;
  image?: string;
  /** City and founding year, already formatted. */
  meta: string;
  note: string;
  programs: string;
  english: string;
  initials: string;
  hue: number;
  logo?: Logo;
};

/** Seconds each university stays in the large card. */
const DURATION = 6;
/** Where each photo drifts to during its slow zoom, so consecutive universities move differently. */
const drift = ["-3%, -2%", "3%, -1%", "-2%, 2%", "2%, 2%", "-3%, 1%", "3%, 2%"];
/** Caption lines fade out together and rise in one after another (each line adds its own delay). */
const rise =
  "translate-y-3.5 opacity-0 transition duration-400 ease-out group-data-active/cap:translate-y-0 group-data-active/cap:opacity-100 group-data-active/cap:duration-700 motion-reduce:transition-none";

/**
 * Large photo card that cycles through the popular universities, next to a list of the same universities.
 * Same mechanics as HeroSlides: the active row's progress line drives the timer, so hovering pauses it,
 * and with reduced motion the line doesn't animate and the first university simply stays.
 */
export function PopularUnis({ unis }: { unis: PopularUni[] }) {
  const [active, setActive] = useState(0);
  const next = () => setActive((i) => (i + 1) % unis.length);
  const current = unis[active];

  return (
    <div className="group/rot grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
      <Link
        href={current.href}
        {...reveal}
        className="group relative h-[400px] overflow-hidden rounded-[18px] bg-ink-900 sm:h-[480px] lg:h-auto lg:min-h-[540px]"
      >
        {unis.map((u, i) => (
          <div key={u.slug} data-active={i === active || undefined} className="hero-slide absolute inset-0" aria-hidden={i !== active}>
            {u.image ? (
              <Picture
                src={u.image}
                sizes="(min-width: 1024px) 55vw, 100vw"
                loading={i === 0 ? "eager" : "lazy"}
                className="absolute inset-0 size-full object-cover"
                style={{ "--drift": drift[i % drift.length], "--dur": `${DURATION + 2}s` } as CSSProperties}
              />
            ) : (
              <div className="absolute inset-0" style={{ background: `radial-gradient(70% 90% at 90% 0%, hsl(${u.hue} 70% 50% / 0.55), transparent 65%), #0a1633` }} />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <p className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 font-mono text-[12px] text-ink tabular-nums backdrop-blur sm:top-5 sm:left-5">
          {String(active + 1).padStart(2, "0")} / {String(unis.length).padStart(2, "0")}
        </p>
        <span
          className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100 sm:top-5 sm:right-5"
          aria-hidden
        >
          →
        </span>

        {/* All captions sit in one grid cell; the active one slides up line by line. */}
        <div className="absolute inset-x-0 bottom-0 grid p-6 text-white sm:p-8">
          {unis.map((u, i) => (
            <div key={u.slug} data-active={i === active || undefined} className="group/cap pointer-events-none [grid-area:1/1] self-end" aria-hidden={i !== active}>
              <p className={`${rise} group-data-active/cap:delay-200 font-mono text-[11px] text-white/65 sm:text-xs`}>{u.meta}</p>
              <h3 className={`${rise} group-data-active/cap:delay-[280ms] mt-2 font-display text-2xl leading-tight font-bold tracking-tight sm:text-4xl`}>{u.name}</h3>
              <p className={`${rise} group-data-active/cap:delay-[360ms] mt-3 max-w-md text-[14px] leading-relaxed text-white/80 sm:text-[15px]`}>{u.note}</p>
              <p className={`${rise} group-data-active/cap:delay-[440ms] mt-4 font-mono text-[11px] text-white/65 sm:text-xs`}>
                {u.programs} · {u.english}
              </p>
            </div>
          ))}
        </div>
      </Link>

      <ol className="flex flex-col">
        {unis.map((u, i) => {
          const on = i === active;
          return (
            <li key={u.slug} {...reveal} style={{ "--d": `${i * 0.06}s` } as CSSProperties} className="relative border-b border-ink/10 first:border-t lg:flex-1">
              <Link
                href={u.href}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-current={on || undefined}
                className={`group flex h-full items-center gap-4 py-4 transition-opacity duration-500 sm:gap-5 sm:py-5 ${on ? "" : "lg:opacity-55 lg:hover:opacity-100"}`}
              >
                <span className={`hidden w-6 shrink-0 font-mono text-xs transition-colors sm:block ${on ? "text-brand" : "text-ink-400"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {u.image ? (
                  <Picture
                    src={u.image}
                    sizes="64px"
                    className={`size-14 shrink-0 rounded-xl object-cover transition duration-500 sm:size-16 ${on ? "scale-105 shadow-card" : ""}`}
                  />
                ) : (
                  <LogoTile logo={u.logo} initials={u.initials} hue={u.hue} className="size-14 rounded-xl p-1.5 sm:size-16" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className={`font-display text-[16px] leading-snug font-semibold transition-colors sm:text-lg ${on ? "text-brand" : "text-ink group-hover:text-brand"}`}>{u.name}</h3>
                  <p className="mt-1 text-[13px] leading-snug text-muted sm:text-sm">{u.note}</p>
                  <p className="mt-1.5 font-mono text-[11px] text-ink-400 sm:hidden">
                    {u.programs} · {u.english}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="font-display text-[15px] font-semibold text-ink">{u.programs}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{u.english}</p>
                </div>
              </Link>
              {/* Timer line over the row's bottom border */}
              {on && (
                <span
                  key={active}
                  className="hero-progress absolute inset-x-0 -bottom-px h-[2px] origin-left rounded-full bg-brand group-hover/rot:[animation-play-state:paused]"
                  style={{ animationDuration: `${DURATION}s` }}
                  onAnimationEnd={next}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
