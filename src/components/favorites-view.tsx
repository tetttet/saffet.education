"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import { fill, localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ru";
import { COMPARE_LIMIT, removeFavorites, toggleCompared, useCompared, useFavorites } from "@/lib/favorites";
import { usd } from "@/lib/format";
import { FavoriteButton, HeartIcon } from "./favorite-button";
import { Picture } from "./picture";

type Item = {
  id: string;
  name: string;
  uni: string;
  uniSlug: string;
  city: string;
  degree: string;
  field: string;
  language: string;
  duration: string;
  years: number | null;
  fee: number | null;
  feeOfficial: number | null;
  discount: number | null;
  open: boolean;
  deadline: string | null;
  intakes: string | null;
  image: string | null;
};

type Labels = Record<
  "university" | "city" | "level" | "language" | "duration" | "fee" | "perYear" | "onRequest" | "intake" | "deadline" | "askConsultant" | "open" | "closed" | "apply",
  string
>;

/** The button of the header: same shape and gradient. */
const primary = "btn-shine inline-flex items-center justify-center rounded-[9px] bg-linear-to-br from-[var(--brand-glow,#2a7dff)] to-brand-deep px-5 text-center text-[14px] font-bold text-white shadow-[0_8px_18px_color-mix(in_srgb,var(--color-brand)_20%,transparent)] transition hover:brightness-110";

const total = (p: Item) => (p.fee != null && p.years ? p.fee * p.years : null);

/** The smallest value of a row, marked in the table when the programs differ. */
function lowest(values: (number | null)[]) {
  const known = values.filter((n): n is number => n != null);
  return known.length > 1 && new Set(known).size > 1 ? Math.min(...known) : null;
}

export function FavoritesView({ locale, t, labels }: { locale: Locale; t: Dictionary["favorites"]; labels: Labels }) {
  const ids = useFavorites();
  const compared = useCompared();
  const [items, setItems] = useState<Record<string, Item>>({});
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<"list" | "select" | "compare">("list");
  const confirm = useRef<HTMLDialogElement>(null);
  const table = useRef<HTMLDivElement>(null);
  const href = (path: string) => localize(locale, path);
  const heart = { add: t.add, remove: t.remove };

  const missing = useMemo(() => ids.filter((id) => !items[id]), [ids, items]);
  const missingKey = missing.join(",");
  useEffect(() => {
    if (!missingKey) return;
    let stale = false;
    fetch(`${localize(locale, "/favorites/data")}?ids=${missingKey}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<Item[]>;
      })
      .then((found) => {
        if (stale) return;
        setFailed(false);
        setItems((prev) => ({ ...prev, ...Object.fromEntries(found.map((p) => [p.id, p])) }));
        // Programs that left the catalogue would otherwise stay in the count for ever.
        const gone = missingKey.split(",").filter((id) => !found.some((p) => p.id === id));
        if (gone.length) removeFavorites(gone);
      })
      .catch(() => {
        if (!stale) setFailed(true);
      });
    return () => {
      stale = true;
    };
  }, [missingKey, locale, attempt]);

  const saved = ids.flatMap((id) => items[id] ?? []);
  const chosen = compared.flatMap((id) => items[id] ?? []);
  const showTable = mode === "compare" && chosen.length > 1;

  // The table opens above the list: bring it into view so its columns land on screen.
  useEffect(() => {
    if (showTable) table.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showTable]);

  if (!ids.length) {
    return (
      <section className="container-page">
        <div className="grid place-items-center gap-3 rounded-[18px] border border-dashed border-ink/15 px-6 py-14 text-center">
          <HeartIcon filled={false} className="size-9 text-ink-400" />
          <h2 className="font-display text-xl font-bold">{t.emptyTitle}</h2>
          <p className="max-w-sm text-sm leading-relaxed text-ink-600">{t.emptyText}</p>
          <Link href={href("/programs")} className={`${primary} mt-2 h-11`}>{t.browse}</Link>
        </div>
      </section>
    );
  }

  if (failed && !saved.length) {
    return (
      <section className="container-page">
        <p className="text-sm text-ink-600">{t.loadError}</p>
        <button type="button" onClick={() => setAttempt(attempt + 1)} className="btn-ghost mt-3">{t.retry}</button>
      </section>
    );
  }

  if (!saved.length) {
    return (
      <section className="container-page space-y-3" aria-busy>
        {ids.slice(0, 3).map((id) => <div key={id} className="h-32 animate-pulse rounded-[18px] bg-ink-50" />)}
      </section>
    );
  }

  return (
    <div className="container-page">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{fill(t.saved, { n: saved.length })}</h2>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => confirm.current?.showModal()} className="text-sm font-semibold text-ink-600 transition-colors hover:text-[#e11d48]">{t.clear}</button>
            {mode === "list" && saved.length > 1 && <button type="button" onClick={() => setMode("select")} className={`${primary} h-10`}>{t.compareStart}</button>}
          </div>
        </div>
        {saved.length < 2 && <p className="mt-2 text-[13px] text-muted">{t.compareNeedMore}</p>}

        {mode !== "list" && (
          <div className="sticky top-20 z-20 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-brand/20 bg-brand-soft px-4 py-3">
            <p className="text-sm font-medium text-ink">{fill(t.selectHint, { n: COMPARE_LIMIT, chosen: chosen.length })}</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMode("list")} className="text-sm font-semibold text-ink-600 transition-colors hover:text-ink">{showTable ? t.compareClose : t.compareCancel}</button>
              {!showTable && <button type="button" disabled={chosen.length < 2} onClick={() => setMode("compare")} className={`${primary} h-10 disabled:cursor-not-allowed disabled:opacity-45`}>{t.compareShow}</button>}
            </div>
          </div>
        )}

        {showTable && (
          <div ref={table} className="scroll-mt-40">
            <h2 className="mt-8 font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{t.compareTitle}</h2>
            <CompareTable items={chosen} t={t} labels={labels} locale={locale} />
          </div>
        )}

        <ul className="mt-6 grid gap-3 lg:grid-cols-2">
          {saved.map((p) => {
            const on = compared.includes(p.id);
            const full = !on && compared.length >= COMPARE_LIMIT;
            return (
              <li key={p.id} className="relative flex gap-4 rounded-[18px] border border-ink/10 bg-white p-3.5 pr-14">
                <div className="relative hidden size-24 shrink-0 overflow-hidden rounded-xl bg-ink-50 sm:block">
                  {p.image && <Picture src={p.image} sizes="96px" className="absolute inset-0 size-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-muted">{p.degree} · {p.language}</p>
                  <Link href={href(`/programs/${p.id}`)} className="mt-0.5 block font-display text-[16px] leading-snug font-semibold text-ink transition-colors hover:text-brand">{p.name}</Link>
                  <p className="mt-1 truncate text-[13px] text-ink-600">{p.uni} · {p.city}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <span className="font-display font-bold text-ink">
                      {usd(p.fee, labels.onRequest)}
                      {p.fee != null && <span className="text-xs font-medium text-muted">{labels.perYear}</span>}
                    </span>
                    {mode !== "list" && (
                      <label className={`inline-flex items-center gap-2 text-[13px] font-medium ${full ? "cursor-not-allowed text-ink-400" : "cursor-pointer text-ink"}`}>
                        <input type="checkbox" checked={on} disabled={full} onChange={() => toggleCompared(p.id)} className="size-[18px] accent-brand" />
                        {t.compareToggle}
                      </label>
                    )}
                  </div>
                </div>
                <FavoriteButton id={p.id} labels={heart} className="absolute top-3 right-3 size-9" />
              </li>
            );
          })}
        </ul>
      </section>

      <ConfirmClear ref={confirm} t={t} count={saved.length} onConfirm={() => removeFavorites(ids)} />
    </div>
  );
}

/** Asks before the whole list goes. A click on the dimmed area outside the card counts as "cancel". */
function ConfirmClear({ ref, t, count, onConfirm }: { ref: Ref<HTMLDialogElement>; t: Dictionary["favorites"]; count: number; onConfirm: () => void }) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="clear-title"
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="confirm m-auto w-[min(calc(100vw-32px),400px)] rounded-[22px] bg-white p-0 text-ink shadow-[0_24px_60px_-20px_rgb(11_22_48/0.45)] backdrop:bg-ink-900/45 backdrop:backdrop-blur-[2px]"
    >
      <form method="dialog" className="p-6 text-center sm:p-7">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#ffe9ee]">
          <HeartIcon filled className="size-7" />
        </span>
        <h2 id="clear-title" className="mt-4 font-display text-xl font-bold">{t.clearTitle}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{fill(t.clearText, { n: count })}</p>
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button autoFocus className="h-11 rounded-[9px] border border-ink/15 text-[14px] font-semibold text-ink transition hover:bg-ink-50">{t.clearCancel}</button>
          <button onClick={onConfirm} className="h-11 rounded-[9px] bg-[#e11d48] text-[14px] font-semibold text-white transition hover:brightness-110">{t.clearConfirm}</button>
        </div>
      </form>
    </dialog>
  );
}

/** Columns land one after another. */
const column = (i: number) => ({ "--d": `${i * 0.22}s` }) as CSSProperties;

function CompareTable({ items, t, labels, locale }: { items: Item[]; t: Dictionary["favorites"]; labels: Labels; locale: Locale }) {
  const href = (path: string) => localize(locale, path);
  const bestFee = lowest(items.map((p) => p.fee));
  const bestTotal = lowest(items.map(total));
  const best = <span className="mt-1.5 block w-fit rounded-full bg-[#15803d] px-2 py-0.5 text-[11px] font-semibold text-white">{t.cheapest}</span>;

  const rows: { k: string; v: (p: Item) => ReactNode; best?: (p: Item) => boolean }[] = [
    { k: labels.university, v: (p) => <Link href={href(`/universities/${p.uniSlug}`)} className="font-medium text-ink hover:text-brand">{p.uni}</Link> },
    { k: labels.city, v: (p) => p.city },
    { k: labels.level, v: (p) => p.degree },
    { k: t.field, v: (p) => p.field },
    { k: labels.language, v: (p) => p.language },
    { k: labels.duration, v: (p) => p.duration },
    {
      k: labels.fee,
      best: (p) => p.fee === bestFee,
      v: (p) => (
        <>
          <span className="font-display text-[17px] font-bold text-ink">{usd(p.fee, labels.onRequest)}</span>
          {p.fee != null && <span className="text-xs text-muted">{labels.perYear}</span>}
          {p.fee === bestFee && best}
        </>
      ),
    },
    { k: t.official, v: (p) => (p.feeOfficial && p.fee && p.feeOfficial > p.fee ? <span className="text-ink-400 line-through">{usd(p.feeOfficial)}</span> : "—") },
    { k: t.discount, v: (p) => (p.discount ? `−${Math.round(p.discount)}%` : "—") },
    {
      k: t.total,
      best: (p) => total(p) === bestTotal,
      v: (p) => (
        <>
          <span className="font-semibold text-ink">{usd(total(p))}</span>
          {total(p) === bestTotal && best}
        </>
      ),
    },
    { k: labels.intake, v: (p) => p.intakes ?? "—" },
    { k: labels.deadline, v: (p) => p.deadline ?? labels.askConsultant },
    { k: t.status, v: (p) => <span className={p.open ? "font-medium text-success" : "text-ink-400"}>{p.open ? labels.open : labels.closed}</span> },
  ];

  return (
    <div className="mt-4 overflow-x-auto rounded-[18px] border border-ink/10 bg-white">
      <table className="w-full min-w-max border-collapse text-left text-[14px]">
        <thead>
          <tr className="align-top">
            <th scope="col" className="sticky left-0 z-10 w-24 min-w-24 border-b border-ink/10 bg-white p-2.5 sm:w-44 sm:min-w-44 sm:p-4"><span className="sr-only">{t.compareTitle}</span></th>
            {items.map((p, i) => (
              <th key={p.id} scope="col" style={column(i)} className="compare-in w-40 max-w-60 min-w-36 border-b border-l border-ink/10 p-2.5 font-normal sm:w-52 sm:min-w-44 sm:p-4">
                <Link href={href(`/programs/${p.id}`)} className="block font-display text-[15px] leading-snug font-semibold text-ink transition-colors hover:text-brand">{p.name}</Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.k} className="align-top">
              <th scope="row" className="sticky left-0 z-10 border-b border-ink/10 bg-white p-2.5 text-[12px] font-medium break-words text-muted sm:p-4 sm:text-[13px]">{row.k}</th>
              {items.map((p, i) => <td key={p.id} style={column(i)} className={`compare-in border-b border-l border-ink/10 p-2.5 sm:p-4 ${row.best?.(p) ? "bg-[#dcfce7] text-ink" : "text-ink-600"}`}>{row.v(p)}</td>)}
            </tr>
          ))}
          <tr>
            <th scope="row" className="sticky left-0 z-10 bg-white p-3 sm:p-4"><span className="sr-only">{labels.apply}</span></th>
            {items.map((p, i) => (
              <td key={p.id} style={column(i)} className="compare-in border-l border-ink/10 p-3 sm:p-4">
                <Link href={href(`/apply?program=${p.id}`)} className={`${primary} min-h-10 py-2 text-[13px] whitespace-normal`}>{labels.apply}</Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
