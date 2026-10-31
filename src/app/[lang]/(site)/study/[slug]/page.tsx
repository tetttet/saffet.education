import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { absoluteUrl, breadcrumbs, JsonLd } from "@/components/json-ld";
import { PageHead } from "@/components/page-head";
import { ProgramRow } from "@/components/program-row";
import { ProgramsSkeleton } from "@/components/programs-skeleton";
import { fill, localize } from "@/i18n/config";
import { getI18n, type I18n } from "@/i18n/server";
import { programs, searchPrograms, universities } from "@/lib/data";
import { label, num, plural, usd } from "@/lib/format";
import { catalogueLink, getLanding, landings, type Landing } from "@/lib/landings";
import { pageMetadata } from "@/lib/metadata";
import { reveal } from "@/lib/reveal";

const SHOWN = 12;

export function generateStaticParams() {
  return landings.map(({ slug }) => ({ slug }));
}

/** The real figures of a landing page, quoted in its description and intro. */
function landingVars(landing: Landing, { t, locale }: I18n) {
  const list = programs.filter((p) => p[landing.key] === landing.value);
  const unis = new Set(list.map((p) => p.uni));
  const fees = list.map((p) => p.fee).filter((n): n is number => n != null);
  return {
    list,
    unis,
    vars: {
      title: t.landing.titles[landing.slug],
      programs: plural(list.length, locale, t.home.programsWords),
      unis: plural(unis.size, locale, t.home.unisWords),
      min: usd(Math.min(...fees)),
      english: num(list.filter((p) => p.language === "English").length, locale),
    },
  };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/study/[slug]">): Promise<Metadata> {
  const i18n = await getI18n();
  const landing = getLanding((await params).slug);
  if (!landing) notFound();
  const { vars } = landingVars(landing, i18n);
  return pageMetadata({
    locale: i18n.locale,
    path: `/study/${landing.slug}`,
    title: fill(i18n.t.landing.metaTitle, vars),
    description: fill(i18n.t.landing.metaDescription, vars),
  });
}

export default async function LandingPage({ params }: PageProps<"/[lang]/study/[slug]">) {
  const i18n = await getI18n();
  return (
    <Suspense fallback={<ProgramsSkeleton />}>
      {params.then(({ slug }) => <LandingContent slug={slug} i18n={i18n} />)}
    </Suspense>
  );
}

function LandingContent({ slug, i18n }: { slug: string; i18n: I18n }) {
  const landing = getLanding(slug);
  if (!landing) notFound();
  const { t: dict, locale, href } = i18n;
  const t = dict.landing;
  const { list, unis, vars } = landingVars(landing, i18n);
  const items = searchPrograms({ [landing.key]: [landing.value] }, locale).items.slice(0, SHOWN);
  const perUni = (slug: string) => list.filter((p) => p.uni === slug).length;
  const topUnis = universities.filter((u) => unis.has(u.slug)).sort((a, b) => perUni(b.slug) - perUni(a.slug)).slice(0, 6);
  const related = landings.filter((l) => l.key === landing.key && l.slug !== landing.slug);
  const catalogue = `/programs?${new URLSearchParams({ [landing.key]: landing.value })}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbs(locale, [[dict.nav.home, "/"], [dict.nav.programs, "/programs"], [vars.title, `/study/${landing.slug}`]]),
          {
            "@type": "ItemList",
            name: vars.title,
            numberOfItems: items.length,
            itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(localize(locale, `/programs/${p.id}`)) })),
          },
        ]}
      />
      <div className="container-page pt-8">
        <nav className="flex flex-wrap items-center gap-x-2 text-[13px] text-ink-600">
          <Link href={href("/")} className="transition-colors hover:text-ink">{dict.nav.home}</Link>
          <span aria-hidden className="text-ink-400/50">/</span>
          <Link href={href("/programs")} className="transition-colors hover:text-ink">{dict.nav.programs}</Link>
          <span aria-hidden className="text-ink-400/50">/</span>
          <span className="truncate text-ink">{vars.title}</span>
        </nav>
      </div>
      <PageHead t={{ eyebrow: label(dict.labels[landing.key], landing.value), titleStart: vars.title, titleMarker: "", lead: fill(t.lead, vars) }} />

      <div className="container-page space-y-12">
        <section {...reveal}>
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{t.topUnis}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {topUnis.map((u) => (
              <li key={u.slug}>
                <Link href={href(`/universities/${u.slug}`)} className="inline-block rounded-full bg-ink-50 px-3.5 py-1.5 text-sm text-ink transition-colors hover:text-brand">
                  {u.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{t.programsTitle}</h2>
            <Link href={href(catalogue)} className="text-sm font-semibold text-brand">{fill(t.allPrograms, { n: num(list.length, locale) })} →</Link>
          </div>
          <div className="mt-5 space-y-4">
            {items.map((p) => <ProgramRow key={p.id} p={p} />)}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={href(catalogue)} className="btn-primary">{fill(t.allPrograms, { n: num(list.length, locale) })}</Link>
            <Link href={href("/apply")} className="btn-ghost">{dict.nav.consult}</Link>
          </div>
        </section>

        <section {...reveal}>
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{t.explore}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {related.map((l) => (
              <li key={l.slug}>
                <Link href={href(catalogueLink(l.key, l.value))} className="inline-block rounded-full border border-ink/15 px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-brand/40 hover:text-brand">
                  {t.titles[l.slug]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
