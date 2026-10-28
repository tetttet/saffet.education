import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AutoSubmitForm } from "@/components/auto-submit-form";
import { FilterList } from "@/components/filter-list";
import { FilterPanel } from "@/components/filter-panel";
import { ProgramRow } from "@/components/program-row";
import { IconSearch } from "@/components/icons";
import { fill } from "@/i18n/config";
import { getI18n, type I18n } from "@/i18n/server";
import { facet, getUniversity, searchPrograms, universities, type ProgramQuery } from "@/lib/data";
import { label, num } from "@/lib/format";
import { catalogueVars, pageMetadata } from "@/lib/metadata";

// Filtered and paged views share the catalogue's canonical URL.
export async function generateMetadata(): Promise<Metadata> {
  const i18n = await getI18n();
  const { t, locale } = i18n;
  return pageMetadata({ locale, path: "/programs", title: t.programs.metaTitle, description: fill(t.programs.metaDescription, catalogueVars(i18n)) });
}

const KEYS = ["q", "city", "degree", "language", "field", "uni", "max", "open", "sort"] as const;

export default async function ProgramsPage({ searchParams }: PageProps<"/[lang]/programs">) {
  const i18n = await getI18n();
  const t = i18n.t.programs;
  return (
    <>
      <section className="container-page pt-12 pb-8 sm:pt-16">
        <p className="font-mono text-sm text-ink-600 sm:text-[15px]">{t.eyebrow}</p>
        <h1 className="section-title mt-3">
          {t.titleStart} {t.titleMarker}
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{t.lead}</p>
      </section>
      <Suspense fallback={<ResultsSkeleton />}>
        {searchParams.then((sp) => (
          <Results
            i18n={i18n}
            query={Object.fromEntries([...KEYS, "page"].map((k) => [k, typeof sp[k] === "string" ? sp[k] : undefined]))}
          />
        ))}
      </Suspense>
    </>
  );
}

function Results({ query, i18n }: { query: ProgramQuery; i18n: I18n }) {
  const { t: dict, locale, href: localHref } = i18n;
  const t = dict.programs;
  const labels = dict.labels;
  const { total, page, pages, items } = searchPrograms(query, locale);
  const active = KEYS.filter((k) => k !== "sort" && query[k]);

  const href = (patch: Partial<ProgramQuery>) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...query, ...patch })) if (v) next.set(k, v);
    const s = next.toString();
    return localHref(s ? `/programs?${s}` : "/programs");
  };

  const chipText = (k: (typeof KEYS)[number]) => {
    const v = query[k]!;
    switch (k) {
      case "city": return label(labels.city, v);
      case "degree": return label(labels.degree, v);
      case "language": return label(labels.language, v);
      case "field": return label(labels.field, v);
      case "uni": return getUniversity(v)?.name ?? v;
      case "max": return fill(t.upTo, { price: `$${Number(v).toLocaleString("en-US")}` });
      case "open": return t.open;
      default: return `«${v}»`;
    }
  };

  return (
    <AutoSubmitForm action={localHref("/programs")} className="container-page grid gap-6 pt-2 lg:grid-cols-[290px_1fr] lg:gap-8">
      <FilterPanel id="program-filters" title={t.filters} count={active.length}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
              {t.filters}
              {active.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] text-white">{active.length}</span>}
            </span>
            <Link href={localHref("/programs")} className="text-sm font-semibold text-brand">{dict.common.reset}</Link>
          </div>
          <FilterList name="city" title={t.city} allLabel={t.filtersAll} value={query.city} items={facet("city")} map={labels.city} />
          <FilterList name="degree" title={t.level} allLabel={t.filtersAll} value={query.degree} items={facet("degree")} map={labels.degree} />
          <FilterList name="language" title={t.language} allLabel={t.filtersAll} value={query.language} items={facet("language")} map={labels.language} visible={3} moreLabel={t.showMore} />
          <FilterList name="field" title={t.field} allLabel={t.filtersAll} value={query.field} items={facet("field")} map={labels.field} visible={5} moreLabel={t.showMore} />
          <div className="border-t border-line pt-4">
            <p className="mb-2 text-sm font-bold">{t.university}</p>
            <select name="uni" defaultValue={query.uni ?? ""} className="field field-sm">
              <option value="">{t.filtersAll}</option>
              {[...universities].sort((a, b) => a.name.localeCompare(b.name)).map((u) => (
                <option key={u.slug} value={u.slug}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="border-t border-line pt-4">
            <p className="mb-2 text-sm font-bold">{t.maxPrice}</p>
            <select name="max" defaultValue={query.max ?? ""} className="field field-sm">
              <option value="">{t.anyPrice}</option>
              {[3000, 5000, 7500, 10000, 15000, 20000].map((n) => (
                <option key={n} value={n}>${n.toLocaleString("en-US")}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2.5 border-t border-line pt-4 text-sm">
            <input type="checkbox" name="open" value="1" defaultChecked={!!query.open} className="size-[18px] accent-brand" />
            {t.onlyOpen}
          </label>
          <label htmlFor="program-filters" className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[9px] bg-brand text-sm font-semibold text-white lg:hidden">{t.show}</label>
      </FilterPanel>

      <section className="min-w-0 space-y-5">
        <label className="flex h-12 items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 transition-colors focus-within:border-brand">
          <IconSearch className="size-5 shrink-0 text-ink-400" />
          <input name="q" type="search" defaultValue={query.q} placeholder={t.searchTop} autoComplete="off" className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{fill(t.found, { n: num(total, locale) })}</p>
          <select name="sort" defaultValue={query.sort ?? ""} aria-label={t.sortLabel} className="field field-sm w-auto cursor-pointer rounded-full">
            <option value="">{t.sortDefault}</option>
            <option value="fee-asc">{t.sortCheap}</option>
            <option value="fee-desc">{t.sortExpensive}</option>
            <option value="name">{t.sortName}</option>
          </select>
        </div>

        {active.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {active.map((k) => (
              <Link key={k} href={href({ [k]: undefined, page: undefined })} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-sm font-medium hover:border-brand/40 hover:text-brand">
                {chipText(k)} <span aria-hidden>×</span>
              </Link>
            ))}
            <Link href={localHref("/programs")} className="text-sm text-ink-400 hover:text-ink">{dict.common.reset}</Link>
          </div>
        )}

        {items.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-[18px] border border-dashed border-ink/15 p-14 text-center">
            <IconSearch className="size-7 text-ink-400" />
            <div className="font-display text-xl font-bold">{t.emptyTitle}</div>
            <p className="text-sm text-ink-600">{t.emptyText}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((p) => (
              <ProgramRow key={p.id} p={p} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="flex items-center justify-center gap-2 pt-4" aria-label={t.pages}>
            {page > 1 && <Link href={href({ page: String(page - 1) })} className="btn-ghost">{t.prev}</Link>}
            <span className="px-3 text-sm text-ink-600">{fill(t.pageOf, { page, pages })}</span>
            {page < pages && <Link href={href({ page: String(page + 1) })} className="btn-ghost">{t.next}</Link>}
          </nav>
        )}
      </section>
    </AutoSubmitForm>
  );
}

function ResultsSkeleton() {
  return (
    <div className="container-page grid gap-6 pt-2 lg:grid-cols-[290px_1fr] lg:gap-8">
      <div className="h-[40rem] animate-pulse rounded-[18px] bg-surface" />
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-[18px] bg-surface" />
        ))}
      </div>
    </div>
  );
}
