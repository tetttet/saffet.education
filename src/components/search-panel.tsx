"use client";

import Form from "next/form";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { IconSearch } from "./icons";

type Option = { value: string; label: string };
type Tab = "programs" | "universities";

export type SearchPanelProps = {
  programsAction: string;
  universitiesAction: string;
  advancedHref: string;
  counts: Record<Tab, string>;
  labels: {
    tabPrograms: string;
    tabUniversities: string;
    faculty: string;
    university: string;
    city: string;
    level: string;
    language: string;
    type: string;
    anyFaculty: string;
    anyUniversity: string;
    anyCity: string;
    anyLevel: string;
    anyLanguage: string;
    anyType: string;
    submit: string;
    trending: string;
    advanced: string;
  };
  fields: Option[];
  universities: Option[];
  cities: Option[];
  levels: Option[];
  languages: Option[];
  types: Option[];
  trending: { label: string; href: string }[];
};

/**
 * Hero search, second take: text tabs with a sliding underline and one segmented bar of labelled
 * selects (hairline dividers come from the 1px gap over the line-colored background).
 */
export function SearchPanel(props: SearchPanelProps) {
  const { labels: l } = props;
  const [tab, setTab] = useState<Tab>("programs");
  // Fields only slide in after a tab switch, not on first render.
  const [switched, setSwitched] = useState(false);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[tab];
      if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tab]);

  const segment = (name: string, title: string, placeholder: string, options: Option[], className = "") => (
    <div className={`relative bg-white transition-colors hover:bg-ink-50 focus-within:bg-brand-soft/60 ${className}`}>
      <span className="pointer-events-none absolute top-2.5 left-4 text-[11px] font-semibold tracking-[0.08em] text-ink-400 uppercase">{title}</span>
      <select name={name} defaultValue="" aria-label={title} className="seg-select">
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  const grid = `${switched ? "tab-swap " : ""}grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line`;
  const tabs: { id: Tab; label: string }[] = [
    { id: "programs", label: l.tabPrograms },
    { id: "universities", label: l.tabUniversities },
  ];

  return (
    <div className="rounded-2xl border border-ink/10 bg-white shadow-[0_28px_60px_-36px_rgb(11_22_48/0.45)]">
      <div className="flex items-end justify-between gap-4 border-b border-line px-5 sm:px-7">
        <div className="relative flex gap-7 sm:gap-9" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setSwitched(true);
                setTab(t.id);
              }}
              className={`flex items-baseline gap-2 pt-4 pb-3.5 text-[15px] font-semibold whitespace-nowrap transition-colors duration-300 sm:text-base ${tab === t.id ? "text-ink" : "text-ink-400 hover:text-ink-600"}`}
            >
              {t.label}
              <span className={`font-mono text-[12px] font-medium transition-colors duration-300 ${tab === t.id ? "text-brand" : "text-ink-400"}`}>{props.counts[t.id]}</span>
            </button>
          ))}
          {bar && <span aria-hidden className="tab-bar absolute -bottom-px h-[2px] rounded-full bg-brand" style={{ left: bar.left, width: bar.width }} />}
        </div>
        <Link href={props.advancedHref} className="hidden pb-3.5 text-[13px] font-semibold text-ink-600 transition-colors hover:text-brand sm:block">
          {l.advanced} →
        </Link>
      </div>

      <div className="p-3 sm:p-4">
        {tab === "programs" ? (
          <Form key="p" action={props.programsAction} style={{ "--dx": "-16px" } as CSSProperties} className={`${grid} lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]`}>
            {segment("field", l.faculty, l.anyFaculty, props.fields, "col-span-2 lg:col-span-1")}
            {segment("city", l.city, l.anyCity, props.cities)}
            {segment("degree", l.level, l.anyLevel, props.levels)}
            {segment("language", l.language, l.anyLanguage, props.languages)}
            <SubmitButton label={l.submit} />
          </Form>
        ) : (
          <Form key="u" action={props.universitiesAction} style={{ "--dx": "16px" } as CSSProperties} className={`${grid} lg:grid-cols-[2.5fr_1fr_1fr_auto]`}>
            {segment("q", l.university, l.anyUniversity, props.universities, "col-span-2 lg:col-span-1")}
            {segment("city", l.city, l.anyCity, props.cities)}
            {segment("type", l.type, l.anyType, props.types)}
            <SubmitButton label={l.submit} className="col-span-2 lg:col-span-1" />
          </Form>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 border-t border-line px-5 py-3.5 text-[13px] sm:px-7">
        <span className="mr-2 text-ink-400">{l.trending}</span>
        {props.trending.map((t, i) => (
          <span key={t.label} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden className="text-ink-400">·</span>}
            <Link href={t.href} className="font-medium text-ink-600 underline-offset-4 transition-colors hover:text-brand hover:underline">
              {t.label}
            </Link>
          </span>
        ))}
        <Link href={props.advancedHref} className="ml-auto font-semibold text-ink-600 hover:text-brand sm:hidden">
          {l.advanced} →
        </Link>
      </div>
    </div>
  );
}

function SubmitButton({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`bg-white p-2 ${className}`}>
      <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-7 text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark lg:h-full">
        <IconSearch className="size-[17px]" />
        {label}
      </button>
    </div>
  );
}
