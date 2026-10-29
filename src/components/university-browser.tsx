"use client";

import Link from "next/link";
import { LogoCover } from "./uni-logo";
import type { Logo } from "@/lib/images";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type SVGProps } from "react";
import { Picture } from "./picture";

export type BrowserUni = {
  slug: string;
  href: string;
  name: string;
  alternateName: string | null;
  city: string;
  cityLabel: string;
  type: string | null;
  meta: string;
  programs: number;
  english: number;
  fee: string;
  tuitionMin: number | null;
  image?: string;
  initials: string;
  hue: number;
  logo?: Logo;
};

type Strings = {
  placeholder: string;
  clear: string;
  allCities: string;
  types: Record<string, string>;
  sort: string;
  sortPrograms: string;
  sortCheap: string;
  sortName: string;
  count: string;
  reset: string;
  empty: string;
  statPrograms: string;
  statEnglish: string;
  statFee: string;
  view: string;
};

type Query = { q: string; city: string[]; type: string; sort: string };

const icon = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const Search = (p: SVGProps<SVGSVGElement>) => <svg {...icon} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
const Close = (p: SVGProps<SVGSVGElement>) => <svg {...icon} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
const Pin = (p: SVGProps<SVGSVGElement>) => <svg {...icon} {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></svg>;
const Arrow = (p: SVGProps<SVGSVGElement>) => <svg {...icon} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Chevron = (p: SVGProps<SVGSVGElement>) => <svg {...icon} {...p}><path d="m6 9 6 6 6-6" /></svg>;

/**
 * Universities catalogue that filters as you type or click, with no submit button.
 * The query is mirrored into the URL (replaceState) so a filtered list can be shared,
 * and cards glide to their new places when the order changes (FLIP with the Web Animations API).
 */
export function UniversityBrowser({ unis, cities, initial, s }: { unis: BrowserUni[]; cities: { value: string; label: string; count: number }[]; initial: Query; s: Strings }) {
  const [q, setQ] = useState(initial.q);
  // Several cities can be chosen at once; none means all.
  const [city, setCity] = useState(initial.city);
  const toggleCity = (v: string) => setCity((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]));
  const [type, setType] = useState(initial.type);
  const [sort, setSort] = useState(initial.sort);

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return unis
      .filter(
        (u) =>
          (!needle || u.name.toLocaleLowerCase().includes(needle) || u.alternateName?.toLocaleLowerCase().includes(needle)) &&
          (!city.length || city.includes(u.city)) &&
          (!type || u.type === type),
      )
      .sort((a, b) =>
        sort === "price"
          ? (a.tuitionMin ?? Infinity) - (b.tuitionMin ?? Infinity)
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : b.programs - a.programs,
      );
  }, [unis, q, city, type, sort]);

  // Keep the URL in step with the filters, without a navigation.
  useEffect(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    city.forEach((c) => p.append("city", c));
    if (type) p.set("type", type);
    if (sort) p.set("sort", sort);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, city, type, sort]);

  // FLIP: remember where each card was, then animate from there to its new place; new cards fade in.
  const cards = useRef(new Map<string, HTMLElement>());
  const last = useRef(new Map<string, { x: number; y: number }>());
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, { x: number; y: number }>();
    cards.current.forEach((el, slug) => {
      const now = { x: el.offsetLeft, y: el.offsetTop };
      next.set(slug, now);
      if (reduce) return;
      const was = last.current.get(slug);
      if (!was) {
        el.animate([{ opacity: 0, transform: "translateY(12px) scale(0.98)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" });
      } else if (was.x !== now.x || was.y !== now.y) {
        el.animate([{ transform: `translate(${was.x - now.x}px, ${was.y - now.y}px)` }, { transform: "none" }], { duration: 480, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" });
      }
    });
    last.current = next;
  }, [list]);

  const types = Object.keys(s.types);
  const filtered = Boolean(q.trim() || city.length || type);
  const chip = (on: boolean) =>
    `inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors ${
      on ? "border-brand bg-brand-soft text-brand" : "border-ink/12 bg-white text-ink hover:border-ink/30"
    }`;

  return (
    <div className="container-page">
      <div className="space-y-4 border-b border-ink/10 pb-6">
        <label className="flex h-12 items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 transition-colors focus-within:border-brand">
          <Search className="size-5 shrink-0 text-ink-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={s.placeholder}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label={s.clear} className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-400 transition hover:bg-surface hover:text-ink">
              <Close className="size-4" />
            </button>
          )}
        </label>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Cities scroll sideways on phones instead of wrapping into many lines */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
            <button type="button" onClick={() => setCity([])} aria-pressed={!city.length} className={chip(!city.length)}>
              {s.allCities}
            </button>
            {cities.map((c) => {
              const on = city.includes(c.value);
              return (
                <button key={c.value} type="button" onClick={() => toggleCity(c.value)} aria-pressed={on} className={chip(on)}>
                  {c.label}
                  <span className={`text-xs ${on ? "text-brand/70" : "text-ink-400"}`}>{c.count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-ink/12 bg-white p-0.5" role="radiogroup">
              {types.map((k) => {
                const v = k === "all" ? "" : k;
                const on = type === v;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setType(v)}
                    className={`h-8 cursor-pointer rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors ${on ? "bg-brand-soft text-brand" : "text-ink-600 hover:text-ink"}`}
                  >
                    {s.types[k]}
                  </button>
                );
              })}
            </div>
            <label className="relative">
              <span className="sr-only">{s.sort}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 cursor-pointer appearance-none rounded-full border border-ink/12 bg-white pr-9 pl-4 text-sm font-medium text-ink outline-none transition-colors hover:border-ink/30 focus:border-brand"
              >
                <option value="">{s.sortPrograms}</option>
                <option value="price">{s.sortCheap}</option>
                <option value="name">{s.sortName}</option>
              </select>
              <Chevron className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-400" />
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-5">
        <p className="text-sm text-muted">{s.count.replace("{n}", String(list.length))}</p>
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCity([]);
              setType("");
            }}
            className="cursor-pointer text-sm font-semibold text-brand hover:underline"
          >
            {s.reset}
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="rounded-[18px] border border-dashed border-ink/15 px-6 py-16 text-center text-muted">{s.empty}</p>
      ) : (
        <ul className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((u) => (
            <li
              key={u.slug}
              ref={(el) => {
                if (el) cards.current.set(u.slug, el);
                else cards.current.delete(u.slug);
              }}
            >
              <UniCard u={u} s={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UniCard({ u, s }: { u: BrowserUni; s: Strings }) {
  return (
    <Link href={u.href} className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-white transition-colors duration-300 hover:border-ink/25">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-50">
        {u.image ? (
          <Picture src={u.image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        ) : (
          <LogoCover logo={u.logo} initials={u.initials} hue={u.hue} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-[13px] text-muted">
          <Pin className="size-4 shrink-0" />
          {u.meta}
        </p>
        <h3 className="mt-2 mb-5 font-display text-lg leading-snug font-semibold text-ink transition-colors group-hover:text-brand">{u.name}</h3>

        <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-ink/10 pt-4 text-[12px] sm:gap-3 sm:text-[13px]">
          <div>
            <dt className="text-muted">{s.statPrograms}</dt>
            <dd className="mt-0.5 font-semibold text-ink">{u.programs}</dd>
          </div>
          <div>
            <dt className="text-muted">{s.statEnglish}</dt>
            <dd className="mt-0.5 font-semibold text-ink">{u.english}</dd>
          </div>
          <div>
            <dt className="text-muted">{s.statFee}</dt>
            <dd className="mt-0.5 font-semibold text-ink">{u.fee}</dd>
          </div>
        </dl>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
          {s.view}
          <Arrow className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
