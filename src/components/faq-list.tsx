"use client";

import { useState } from "react";

export type FaqItem = { q: string; a: string };

/** Plain accordion: each answer opens smoothly by animating grid rows from 0fr to 1fr, and stays in the HTML. */
export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));

  return (
    <ul className="border-t border-ink/10">
      {items.map((f, i) => {
        const on = open.includes(i);
        return (
          <li key={f.q} className="border-b border-ink/10">
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => toggle(i)}
                className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
              >
                <span className="font-display text-[17px] leading-snug font-semibold text-ink transition-colors group-hover:text-brand sm:text-lg">{f.q}</span>
                <span className={`shrink-0 text-2xl leading-none font-light text-ink-400 transition-transform duration-300 ${on ? "rotate-45" : ""}`} aria-hidden>
                  +
                </span>
              </button>
            </h3>
            <div
              id={`faq-${i}`}
              role="region"
              className={`grid transition-[grid-template-rows] duration-400 ease-out motion-reduce:transition-none ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className={`max-w-2xl pb-5 text-[15px] leading-relaxed text-muted transition-opacity duration-400 ${on ? "opacity-100" : "opacity-0"}`}>{f.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
