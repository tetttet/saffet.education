"use client";

import { useState, type CSSProperties } from "react";
import { Picture } from "./picture";

export type HeroSlide = { src: string; title: string; text: string };

/** Seconds each photo stays on screen. */
const DURATION = 6;
/** Where each photo drifts to during its slow zoom, so consecutive scenes move differently. */
const drift = ["-3%, -2%", "3%, -1%", "-2%, 2%", "2%, 2%"];

/**
 * Photo scenes that crossfade with a slow zoom, plus story-style progress bars.
 * The bar's animation drives the timer, so hovering pauses both; with reduced motion the bar
 * doesn't animate (see globals.css), so the first photo simply stays.
 */
export function HeroSlides({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const next = () => setActive((i) => (i + 1) % slides.length);

  return (
    <div className="hero-slides group/slides absolute inset-0">
      {slides.map((s, i) => (
        <div key={s.src} data-active={i === active || undefined} className="hero-slide absolute inset-0" aria-hidden={i !== active}>
          <Picture
            src={s.src}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={i === 0}
            className="absolute inset-0 size-full object-cover"
            style={{ "--drift": drift[i % drift.length], "--dur": `${DURATION + 2}s` } as CSSProperties}
          />
        </div>
      ))}

      {/* Shade at the top for the progress bars and caption */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/0 via-45% to-black/0" />

      <div className="absolute inset-x-5 top-4 sm:inset-x-6 sm:top-5">
        <div className="flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={s.title}
              aria-current={i === active || undefined}
              onClick={() => setActive(i)}
              className="group/bar relative h-6 flex-1 cursor-pointer"
            >
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition group-hover/bar:bg-white/40">
                {i < active && <span className="absolute inset-0 bg-white" />}
                {i === active && (
                  <span
                    key={active}
                    className="hero-progress absolute inset-0 origin-left bg-white"
                    style={{ animationDuration: `${DURATION}s` }}
                    onAnimationEnd={next}
                  />
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-start justify-between gap-4 text-white">
          <div className="relative h-[46px] flex-1 overflow-hidden">
            {slides.map((s, i) => (
              <div key={s.src} data-active={i === active || undefined} className="hero-caption absolute inset-0">
                <p className="text-[15px] leading-tight font-semibold">{s.title}</p>
                <p className="mt-0.5 text-[13px] text-white/75">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="pt-0.5 font-mono text-xs text-white/75 tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  );
}
