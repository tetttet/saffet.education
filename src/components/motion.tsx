"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { num } from "@/lib/format";

/**
 * Turns on scroll reveal for every element with `data-reveal` (also ones added
 * later by client navigation). Without JS, nothing is hidden. Put `data-reveal` on
 * elements by spreading `reveal` from "@/lib/reveal": data-shown can land on them
 * before they hydrate, and that object tells React to expect it.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    // <html> has already hydrated when this effect runs, so this attribute never trips the hydration check.
    root.dataset.revealJs = "";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.shown = "";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not([data-shown])").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}

/** Counts up to `value` once it scrolls into view. */
export function CountUp({ value, locale, prefix = "", duration = 1400 }: { value: number; locale: Locale; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      setN(0);
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {num(n, locale)}
    </span>
  );
}
