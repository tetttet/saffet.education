import type { Metadata } from "next";
import { Suspense } from "react";
import { UniversityBrowser } from "@/components/university-browser";
import { fill } from "@/i18n/config";
import { getI18n, type I18n } from "@/i18n/server";
import { universities } from "@/lib/data";
import { hue, initials, label, usdShort } from "@/lib/format";
import { uniImage, uniLogo } from "@/lib/images";
import { catalogueVars, pageMetadata } from "@/lib/metadata";

// Filtered views share the list's canonical URL.
export async function generateMetadata(): Promise<Metadata> {
  const i18n = await getI18n();
  const { t, locale } = i18n;
  return pageMetadata({ locale, path: "/universities", title: t.universities.metaTitle, description: fill(t.universities.metaDescription, catalogueVars(i18n)) });
}

export default async function UniversitiesPage({ searchParams }: PageProps<"/[lang]/universities">) {
  const i18n = await getI18n();
  const t = i18n.t.universities;
  return (
    <>
      <section className="container-page pt-12 pb-8 sm:pt-16">
        <p className="font-mono text-sm text-ink-600 sm:text-[15px]">{t.eyebrow}</p>
        <h1 className="section-title mt-3">
          {t.titleStart} {t.titleMarker}
        </h1>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted sm:text-[15px]">{t.lead}</p>
      </section>
      <Suspense fallback={<div className="container-page h-96" />}>
        {searchParams.then((sp) => (
          <Browser
            i18n={i18n}
            initial={{
              q: typeof sp.q === "string" ? sp.q : "",
              city: [sp.city ?? []].flat().filter(Boolean),
              type: typeof sp.type === "string" ? sp.type : "",
              sort: typeof sp.sort === "string" ? sp.sort : "",
            }}
          />
        ))}
      </Suspense>
    </>
  );
}

function Browser({ i18n, initial }: { i18n: I18n; initial: { q: string; city: string[]; type: string; sort: string } }) {
  const { t: dict, href } = i18n;
  const t = dict.universities;
  const cities = Object.keys(dict.labels.city)
    .map((value) => ({ value, label: label(dict.labels.city, value), count: universities.filter((u) => u.city === value).length }))
    .filter((c) => c.count > 0);

  return (
    <UniversityBrowser
      initial={initial}
      cities={cities}
      unis={universities.map((u) => ({
        slug: u.slug,
        href: href(`/universities/${u.slug}`),
        name: u.name,
        alternateName: u.alternateName,
        city: u.city,
        cityLabel: label(dict.labels.city, u.city),
        type: u.type,
        meta: [label(dict.labels.city, u.city), label(dict.labels.type, u.type), u.founded ? fill(dict.common.since, { year: u.founded }) : ""].filter(Boolean).join(" · "),
        programs: u.stats.programs,
        english: u.stats.byLanguage.English ?? 0,
        fee: u.stats.tuitionMin != null ? `${dict.common.from} ${usdShort(u.stats.tuitionMin)}` : dict.common.onRequest,
        tuitionMin: u.stats.tuitionMin,
        image: uniImage(u.slug),
        initials: initials(u.name),
        logo: uniLogo(u.slug),
        hue: hue(u.slug),
      }))}
      s={{
        placeholder: t.namePlaceholder,
        clear: t.clear,
        allCities: t.allCities,
        types: t.typeFilters,
        sort: t.sort,
        sortPrograms: t.sortPrograms,
        sortCheap: t.sortCheap,
        sortName: t.sortName,
        count: t.count,
        reset: t.resetFilters,
        empty: t.empty,
        statPrograms: t.statPrograms,
        statEnglish: t.statEnglish,
        statFee: t.statFee,
        view: t.viewPrograms,
      }}
    />
  );
}
