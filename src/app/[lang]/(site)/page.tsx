import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { HeroSearch } from "@/components/hero-search";
import { HeroSlides } from "@/components/hero-slides";
import { HomePromos } from "@/components/home-promos";
import { FaqList } from "@/components/faq-list";
import { HowItWorks } from "@/components/how-it-works";
import { CountUp } from "@/components/motion";
import { CityArt } from "@/components/city-art";
import { FieldArt, fieldArtBg } from "@/components/field-art";
import { PopularUnis } from "@/components/popular-unis";
import { fill } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { facet, totals, universities } from "@/lib/data";
import { uniImage, uniLogo } from "@/lib/images";
import { hue, initials, label, num, plural, usd } from "@/lib/format";
import { catalogueVars, pageMetadata } from "@/lib/metadata";
import { reveal } from "@/lib/reveal";
import { site, whatsappLink } from "@/lib/site";
import { Picture } from "@/components/picture";

/** Free photos from Unsplash, in /public/hero. Order matches `heroSlides` in the dictionaries. */
const heroPhotos = ["/hero/galata.jpg", "/hero/students.jpg", "/hero/maiden-tower.jpg", "/hero/ortakoy.jpg"];

/** The four biggest fields get a tile with an animated drawing (components/field-art.tsx); the rest are listed as text. */
const featuredFields = ["Medicine & Health", "Business & Management", "Engineering", "Computer Science & IT"];

/** Animation delay as a CSS variable, used by .enter and [data-reveal]. */
const d = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await getI18n();
  const { t, locale } = i18n;
  return pageMetadata({ locale, path: "/", title: { absolute: t.meta.title }, description: fill(t.meta.description, catalogueVars(i18n)) });
}

export default async function Home() {
  const { t, locale, href } = await getI18n();
  const h = t.home;
  const vars = {
    programs: num(totals.programs, locale),
    programsCount: plural(totals.programs, locale, h.programsWords),
    unis: totals.universities,
    english: num(totals.english, locale),
    min: usd(totals.minFee),
  };
  const cities = facet("city");
  const fieldCounts = new Map(facet("field").map((f) => [f.value, f.count]));
  const fields = featuredFields.map((value) => ({ value, count: fieldCounts.get(value) ?? 0 }));
  const otherFields = facet("field").filter((f) => !featuredFields.includes(f.value));
  const popular = [...universities].sort((a, b) => b.stats.programs - a.stats.programs).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f2f4f8]">
        <div className="relative mx-auto grid max-w-[1380px] px-4 pb-24 sm:px-8 lg:min-h-[620px] lg:grid-cols-[44%_56%] lg:px-16 lg:pb-0">
          <div className="relative z-10 pt-10 pb-8 lg:pt-[78px] lg:pr-12 lg:pb-40">
            <p style={d(0)} className="enter text-[13px] font-semibold text-brand">{h.brandMessage}</p>
            <h1 style={d(0.08)} className="enter mt-4 max-w-[640px] font-display text-[clamp(28px,4.5vw,50px)] leading-[1.05] font-bold tracking-[-0.025em] text-ink">
              {h.titleStart} <span className="highlight">{h.titleMarker}</span> {h.titleEnd}
            </h1>
            <p style={d(0.16)} className="enter mt-5 max-w-[515px] text-[14px] leading-[1.7] sm:text-[15px] sm:leading-[1.72] text-muted">{fill(h.lead, vars)}</p>
            <dl style={d(0.24)} className="enter mt-8 grid grid-cols-3 gap-4 border-t border-ink/10 pt-6 sm:flex sm:gap-x-10">
              <div>
                <dt className="text-xs text-muted">{h.statPrograms}</dt>
                <dd className="mt-1 font-display text-lg font-bold sm:text-2xl"><CountUp value={totals.programs} locale={locale} /></dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{h.statFrom}</dt>
                <dd className="mt-1 font-display text-lg font-bold sm:text-2xl">
                  {vars.min}
                  <span className="text-xs font-medium text-muted sm:text-sm">{t.common.perYear}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{h.statIntake}</dt>
                <dd className="mt-1 flex items-center gap-2 font-display text-lg font-bold sm:text-2xl">
                  <span className="size-2 rounded-full bg-success" aria-hidden />
                  {h.statOpen}
                </dd>
              </div>
            </dl>
          </div>
          {/* Large photo slideshow; on desktop the search card overlaps its lower edge. */}
          <div style={d(0.2)} className="enter relative h-[min(92vw,420px)] sm:h-[460px] lg:h-auto">
            <div className="absolute inset-0 overflow-hidden rounded-[20px] bg-ink-900 lg:top-8 lg:bottom-10">
              <HeroSlides slides={heroPhotos.map((src, i) => ({ src, ...h.heroSlides[i] }))} />
            </div>
          </div>
        </div>
      </section>

      {/* Search card overlapping the hero */}
      <section style={d(0.3)} className="enter relative z-20 mx-auto -mt-28 max-w-[1380px] px-4 sm:px-8 lg:px-[42px]">
        <HeroSearch />
      </section>

      {/* What we do for the student: four short numbered points, no icons, with a running highlight. */}
      <section className="mx-auto max-w-[1380px] px-4 pt-14 pb-12 sm:px-8 lg:px-16">
        <ol className="grid grid-cols-2 gap-x-5 gap-y-7 sm:gap-x-8 lg:grid-cols-4">
          {h.perks.map((p, i) => (
            <li key={p.title} {...reveal} style={{ ...d(i * 0.08), "--i": i } as CSSProperties} className="perk relative border-t border-ink/15 pt-4">
              {/* A brand-colored line runs across the points one after another, on a loop. */}
              <span className="perk-line absolute inset-x-0 -top-[2px] h-[3px] rounded-full bg-brand shadow-[0_0_12px_color-mix(in_srgb,var(--color-brand)_50%,transparent)]" aria-hidden />
              <span className="perk-num font-mono text-xs text-ink-400">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="perk-title mt-2.5 font-display text-[15px] leading-snug font-semibold text-ink sm:text-lg">{p.title}</h2>
              <p className="mt-1.5 max-w-[300px] text-[13px] leading-relaxed text-muted sm:text-sm">{p.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <HomePromos />

      {/* Quiet running list of partner universities: names only, like a press strip. */}
      <section className="pt-2 pb-10" aria-label={h.unisEyebrow}>
        <div className="border-y border-ink/10">
          <div className="marquee overflow-hidden py-5">
            <div className="marquee-track flex w-max">
              {[...universities, ...universities].map((u, i) => (
                <Link
                  key={`${u.slug}-${i}`}
                  href={href(`/universities/${u.slug}`)}
                  aria-hidden={i >= universities.length}
                  tabIndex={i >= universities.length ? -1 : undefined}
                  className="group flex shrink-0 items-baseline gap-2 pr-10"
                >
                  <span className="font-display text-[17px] font-semibold sm:text-[19px] tracking-tight text-ink/40 transition-colors group-hover:text-ink">
                    {u.name.replace(/\s*University\b/, "")}
                  </span>
                  <span className="text-[10px] font-semibold tracking-[0.14em] text-ink/30 uppercase transition-colors group-hover:text-brand">
                    {label(t.labels.city, u.city)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cities: real photos, the city name and a short honest note on top of each. */}
      <section id="cities" className="container-page scroll-mt-24 py-10 sm:py-14">
        <div {...reveal} className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-xl">
            <p className="font-mono text-sm text-ink-600 sm:text-[15px]">{h.citiesEyebrow}</p>
            <h2 className="section-title mt-3">
              {h.citiesTitleStart} {h.citiesTitleMarker}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted sm:text-[15px]">{h.citiesText}</p>
          </div>
          <Link href={href("/universities")} className="group text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-brand hover:decoration-brand">
            {h.citiesAction} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Istanbul large on the left, the other four cities in a 2×2 grid next to it. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:h-[560px] lg:grid-cols-4 lg:grid-rows-2">
          {cities.map((c, i) => {
            const unis = universities.filter((u) => u.city === c.value).length;
            const feature = i === 0;
            const image = site.cityImages[c.value];
            return (
              <Link
                key={c.value}
                href={href(`/universities?city=${c.value}`)}
                {...reveal}
                style={d(i * 0.08)}
                className={`group relative overflow-hidden rounded-[18px] bg-ink-900 ${feature ? "col-span-2 h-[340px] sm:h-[420px] lg:row-span-2 lg:h-auto" : "h-[210px] sm:h-[260px] lg:h-auto"}`}
              >
                {image ? (
                  <Picture
                    src={image}
                    alt={label(t.labels.city, c.value)}
                    sizes={feature ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                ) : (
                  <div className="absolute inset-0"><CityArt city={c.value} className="size-full" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                <div className={`absolute inset-x-0 bottom-0 text-white ${feature ? "p-6 sm:p-8" : "p-4 sm:p-5"}`}>
                  <h3 className={`font-display leading-none font-bold tracking-tight ${feature ? "text-3xl sm:text-5xl" : "text-xl sm:text-2xl"}`}>
                    {label(t.labels.city, c.value)}
                  </h3>
                  <p className={`mt-2 text-white/80 ${feature ? "max-w-md text-[14px] leading-relaxed sm:text-[15px]" : "hidden text-[13px] leading-snug sm:block"}`}>
                    {h.cityNotes[c.value]}
                  </p>
                  <p className="mt-3 font-mono text-[11px] text-white/65 sm:text-xs">
                    {fill(h.cityStats, { unis: plural(unis, locale, h.unisWords), programs: plural(c.count, locale, h.programsWords) })}
                  </p>
                </div>
                <span
                  className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Subjects: four tiles with self-drawing illustrations, then the other fields as a list. */}
      <section className="container-page py-10 sm:py-14">
        <div {...reveal} className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-xl">
            <p className="font-mono text-sm text-ink-600 sm:text-[15px]">{h.fieldsEyebrow}</p>
            <h2 className="section-title mt-3">{h.fieldsTitle}</h2>
          </div>
          <Link href={href("/programs")} className="group text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-brand hover:decoration-brand">
            {h.fieldsAction} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {fields.map((f, i) => (
            <Link
              key={f.value}
              {...reveal}
              href={href(`/programs?field=${encodeURIComponent(f.value)}`)}
              className="group relative flex flex-col overflow-hidden rounded-[18px] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-hover sm:aspect-[4/5] sm:p-5 lg:aspect-[5/6]"
              style={{ ...d(i * 0.07), backgroundColor: fieldArtBg(f.value) }}
            >
              <span className="w-fit rounded-full bg-white/80 px-3 py-1 text-[12px] font-semibold text-ink sm:text-[14px]">
                {plural(f.count, locale, h.programsWords)}
              </span>
              <FieldArt field={f.value} className="mx-auto my-3 h-24 w-full max-w-[230px] transition-transform duration-500 group-hover:scale-105 sm:my-2 sm:h-auto sm:flex-1" />
              <div>
                <h3 className="font-display text-[15px] leading-tight font-bold text-ink hyphens-auto sm:text-xl">{label(t.labels.field, f.value)}</h3>
                <p className="mt-1 text-[12px] leading-snug text-ink-600 sm:text-[13px]">{h.fieldCareers[f.value]}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* The other fields: a plain list with counts, same thin-line style as the numbered points */}
        <ul className="mt-6 grid grid-cols-2 gap-x-5 sm:gap-x-8 lg:grid-cols-4">
          {otherFields.map((f, i) => (
            <li key={f.value} {...reveal} style={d((i % 4) * 0.05)}>
              <Link
                href={href(`/programs?field=${encodeURIComponent(f.value)}`)}
                className="group flex h-full flex-col justify-between gap-0.5 border-b border-ink/10 py-3 transition-colors hover:border-brand sm:flex-row sm:items-baseline sm:gap-3 sm:py-3.5"
              >
                <span className="text-[14px] leading-snug font-semibold text-ink transition-colors group-hover:text-brand sm:text-[15px]">{label(t.labels.field, f.value)}</span>
                <span className="shrink-0 text-[12px] text-muted sm:text-[13px]">{plural(f.count, locale, h.programsWords)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Popular universities: a large photo card that cycles through them, next to the list with a short note each. */}
      <section className="container-page py-10 sm:py-14">
        <div {...reveal} className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-xl">
            <p className="font-mono text-sm text-ink-600 sm:text-[15px]">{h.unisEyebrow}</p>
            <h2 className="section-title mt-3">
              {h.unisTitleStart} {h.unisTitleMarker}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted sm:text-[15px]">{h.unisText}</p>
          </div>
          <Link href={href("/universities")} className="group text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-brand hover:decoration-brand">
            {fill(h.unisAction, { n: totals.universities })} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <PopularUnis
          unis={popular.map((u) => ({
            slug: u.slug,
            href: href(`/universities/${u.slug}`),
            name: u.name,
            image: uniImage(u.slug),
            meta: `${label(t.labels.city, u.city)}${u.founded ? ` · ${fill(t.common.since, { year: u.founded })}` : ""}`,
            note: h.unisNotes[u.slug] ?? "",
            programs: plural(u.stats.programs, locale, h.programsWords),
            english: fill(h.unisEnglish, { n: u.stats.byLanguage.English ?? 0 }),
            initials: initials(u.name),
            logo: uniLogo(u.slug),
            hue: hue(u.slug),
          }))}
        />
      </section>

      <HowItWorks />

      {/* FAQ: heading on the left, a plain list of questions on the right. */}
      <section id="faq" className="container-page scroll-mt-24 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <div {...reveal} className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="section-title">{h.faqTitle}</h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted sm:text-[15px]">{h.faqText}</p>
            <a
              href={whatsappLink(t.whatsapp.hello)}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-block text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-brand hover:decoration-brand"
            >
              {h.faqAsk} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
          <div {...reveal} style={d(0.05)}>
            <FaqList items={h.faq.map((f) => ({ q: f.q, a: fill(f.a, vars) }))} />
          </div>
        </div>
      </section>
    </>
  );
}
