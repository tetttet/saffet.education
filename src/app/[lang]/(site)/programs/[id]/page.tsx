import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties, type ReactNode } from "react";
import { absoluteUrl, breadcrumbs, JsonLd } from "@/components/json-ld";
import { CountUp } from "@/components/motion";
import { ProgramRow } from "@/components/program-row";
import { ProgramDetailSkeleton } from "@/components/program-detail-skeleton";
import { IconPin } from "@/components/icons";
import { fill, intlLocale } from "@/i18n/config";
import { getI18n, type I18n } from "@/i18n/server";
import { getProgram, getProgramDetails, getUniversity, programText, similarPrograms } from "@/lib/data";
import { date, hue, initials, intakes, label, usd, usdShort, years } from "@/lib/format";
import { uniImage, uniLogo } from "@/lib/images";
import { programName } from "@/lib/program-names";
import { pageMetadata } from "@/lib/metadata";
import { reveal } from "@/lib/reveal";
import { LogoCover, LogoTile } from "@/components/uni-logo";
import { whatsappLink } from "@/lib/site";
import { Picture } from "@/components/picture";

export async function generateMetadata({ params }: PageProps<"/[lang]/programs/[id]">): Promise<Metadata> {
  const { t, locale } = await getI18n();
  const p = getProgram((await params).id);
  if (!p) notFound();
  // Degree and language names are common nouns in these languages, written in lower case mid-sentence.
  const tag = (s: string) => (["ru", "kk", "az", "es", "fr"].includes(locale) ? s.toLocaleLowerCase(intlLocale[locale]) : s);
  const degree = tag(label(t.labels.degree, p.degree));
  const language = tag(label(t.labels.language, p.language));
  const name = programName(p.name, locale);
  const facts = [
    degree,
    fill(t.program.metaLanguage, { language }),
    p.years != null && years(p.years, t.years),
    p.fee != null ? fill(t.program.metaFee, { fee: usd(p.fee) }) : t.program.metaFeeOnRequest,
  ]
    .filter(Boolean)
    .join(locale === "zh" ? "，" : ", ");
  return pageMetadata({
    locale,
    path: `/programs/${p.id}`,
    // Degree and language keep titles apart: many universities run one programme at several levels and in two languages.
    title: fill(t.program.metaTitle, { name, degree, language, uni: p.uniName }),
    description: fill(t.program.metaDescription, { name, uni: p.uniName, city: label(t.labels.city, p.city), facts }),
  });
}

export default async function ProgramPage({ params }: PageProps<"/[lang]/programs/[id]">) {
  const i18n = await getI18n();
  return (
    <Suspense fallback={<ProgramDetailSkeleton i18n={i18n} />}>
      {params.then(({ id }) => <Program id={id} i18n={i18n} />)}
    </Suspense>
  );
}

const d = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/** Language of teaching as a language code, for structured data. */
const courseLanguages: Record<string, string> = { English: "en", Turkish: "tr", Arabic: "ar", Russian: "ru", German: "de" };

/** Campus photo, or the university's logo on a soft tint when there is none (same fallback as the catalog rows). */
function Photo({ slug, name, className, sizes, priority }: { slug: string; name: string; className: string; sizes: string; priority?: boolean }) {
  const image = uniImage(slug);
  const h = hue(slug);
  return (
    <div className={`relative overflow-hidden bg-ink-50 ${className}`}>
      {image ? (
        <Picture src={image} alt={name} sizes={sizes} priority={priority} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
      ) : (
        <LogoCover logo={uniLogo(slug)} initials={initials(name)} hue={h} size="lg" />
      )}
    </div>
  );
}

/** Section title over a hairline, as in the points on the home page. */
function Heading({ children }: { children: string }) {
  return (
    <div className="border-t border-ink/15 pt-5">
      <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{children}</h2>
    </div>
  );
}

function Program({ id, i18n }: { id: string; i18n: I18n }) {
  const p = getProgram(id);
  if (!p) notFound();
  const { t: dict, locale, href } = i18n;
  const name = programName(p.name, locale);
  const t = dict.program;
  const labels = dict.labels;
  const uni = getUniversity(p.uni);
  const saving = p.feeOfficial && p.fee && p.feeOfficial > p.fee ? p.feeOfficial - p.fee : null;
  const deadline = date(p.deadline, locale);
  const duration = years(p.years, dict.years);
  const graduate = p.degree === "Master's Degree" || p.degree === "PhD / Doctorate";
  // 3D pictures are Microsoft Fluent Emoji (MIT), stored in /public/requirements.
  const requirements = [
    graduate ? { text: t.reqDiploma, img: "diploma" } : { text: t.reqSchool, img: "school" },
    { text: t.reqPassport, img: "passport" },
    { text: p.language === "English" ? t.reqEnglish : t.reqTurkish, img: "language" },
    { text: t.reqPhotos, img: "photos" },
  ];

  const facts = [
    { k: t.fee, v: usd(p.fee, dict.common.onRequest), sub: p.fee != null ? dict.common.perYear : null },
    { k: t.duration, v: duration },
    { k: t.language, v: label(labels.language, p.language) },
    { k: t.level, v: label(labels.degree, p.degree) },
    { k: t.intake, v: intakes(p.intakes, locale) ?? "—" },
  ];
  // Shown right under the title; the field is already a tag above it and the application status sits on the photo.
  const details = [
    { k: t.faculty, v: p.faculty ? programText(p.faculty, locale) : "—" },
    { k: t.mode, v: t.fullTime },
    { k: t.deadline, v: deadline ?? t.askConsultant },
  ];
  const similar = similarPrograms(p);
  const info = getProgramDetails(p, locale);
  const rules = info ? [
    { k: t.entryRules, v: info.entry },
    { k: t.languageRules, v: info.language },
  ].filter((r) => r.v) : [];
  const total = p.fee != null && p.years ? p.fee * p.years : null;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbs(locale, [[dict.nav.home, "/"], [dict.nav.programs, "/programs"], [name, `/programs/${p.id}`]]),
          {
            "@type": "Course",
            name,
            description: info?.overview ?? `${name} — ${p.uniName}`,
            url: absoluteUrl(`/${locale}/programs/${p.id}`),
            provider: { "@type": "CollegeOrUniversity", name: p.uniName, url: absoluteUrl(`/${locale}/universities/${p.uni}`) },
            educationalCredentialAwarded: label(labels.degree, p.degree),
            ...(courseLanguages[p.language] && { inLanguage: courseLanguages[p.language] }),
            ...(p.fee != null && { offers: { "@type": "Offer", category: "Paid", price: Math.round(p.fee), priceCurrency: "USD" } }),
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "Onsite",
              location: { "@type": "Place", name: p.uniName, address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "TR" } },
            },
          },
        ]}
      />
      {/* Soft blue band with a dotted corner; the facts card overlaps its lower edge. */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#eaf1ff_0%,#f3f7ff_65%,#fafcff_100%)]">
        <div aria-hidden className="hero-dots pointer-events-none absolute inset-y-0 right-0 w-2/3" />
        <div className="container-page relative pt-8 pb-24 sm:pt-10 lg:pb-28">
          <nav className="enter flex flex-wrap items-center gap-x-2 text-[13px] text-ink-600">
            <Link href={href("/")} className="transition-colors hover:text-ink">{dict.nav.home}</Link>
            <span aria-hidden className="text-ink-400/50">/</span>
            <Link href={href("/programs")} className="transition-colors hover:text-ink">{dict.nav.programs}</Link>
            <span aria-hidden className="text-ink-400/50">/</span>
            <span className="truncate text-ink">{name}</span>
          </nav>

          <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_460px] lg:items-center lg:gap-14">
            <div>
              <Link href={href(`/universities/${p.uni}`)} style={d(0.05)} className="enter group inline-flex items-center gap-3">
                <LogoTile logo={uniLogo(p.uni)} initials={initials(p.uniName)} hue={hue(p.uni)} className="size-14 rounded-2xl p-1.5" />
                <span className="leading-tight">
                  <span className="block text-[15px] font-semibold text-ink transition-colors group-hover:text-brand">{p.uniName}</span>
                  <span className="flex items-center gap-1 text-[13px] text-ink-600">
                    <IconPin className="size-3.5" />
                    {label(labels.city, p.city)}, {dict.common.turkey}
                  </span>
                </span>
              </Link>
              <p style={d(0.1)} className="enter mt-7 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="rounded-md bg-brand px-2 py-0.5 font-semibold text-white">{label(labels.degree, p.degree)}</span>
                <span className="rounded-md bg-white px-2 py-0.5 font-medium text-ink-600 ring-1 ring-ink/10">{label(labels.field, p.field)}</span>
              </p>
              <h1 style={d(0.15)} className="enter mt-4 font-display text-[clamp(28px,4.6vw,56px)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance">
                {name}
              </h1>
              {name !== p.name && (
                <p lang="en" style={d(0.17)} className="enter mt-2 text-[15px] text-ink-600">
                  {p.name}
                </p>
              )}
              <dl style={d(0.18)} className="enter mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-[15px] sm:flex sm:flex-wrap sm:gap-y-3 sm:[&>div+div]:border-l sm:[&>div+div]:border-ink/10 sm:[&>div+div]:pl-6">
                {details.map((x, i) => (
                  <div key={x.k} className={i === 0 ? "col-span-2" : ""}>
                    <dt className="text-[13px] text-ink-600">{x.k}</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{x.v}</dd>
                  </div>
                ))}
              </dl>
              <div style={d(0.2)} className="enter mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href={href(`/apply?program=${p.id}`)} className="btn-primary btn-shine group" style={{ boxShadow: "none" }}>
                  {t.apply}
                  <Arrow />
                </Link>
                <Link href={href(`/universities/${p.uni}`)} className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink transition-colors hover:text-brand">
                  {t.aboutUni}
                  <Arrow />
                </Link>
              </div>
            </div>

            <div style={d(0.25)} className="enter relative">
              <Photo slug={p.uni} name={p.uniName} className="photo-in h-56 rounded-[22px] sm:h-72 lg:h-[320px]" sizes="(min-width: 1024px) 50vw, 100vw" priority />
              {saving && p.discount ? (
                <div className="float absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl bg-white py-3 pr-5 pl-3 ring-1 ring-ink/10 sm:-left-6">
                  <span className="grid size-12 place-items-center rounded-xl bg-sun font-display text-[15px] font-bold text-ink-900">−{Math.round(p.discount)}%</span>
                  <span className="leading-tight">
                    <span className="block text-[13px] text-muted">{t.pricePerYear}</span>
                    <span className="font-display text-lg font-semibold text-ink">
                      <span className="mr-1.5 text-sm font-medium text-ink-400 line-through">{usd(p.feeOfficial)}</span>
                      {usd(p.fee)}
                    </span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page relative z-10 -mt-12">
        <dl style={d(0.3)} className="enter grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-ink/[0.07] bg-ink/[0.07] shadow-[0_10px_28px_-22px_rgb(11_22_48/0.22)] md:grid-cols-5">
          {facts.map((f, i) => (
            <div key={f.k} className={`flex flex-col-reverse justify-end bg-white px-5 py-4 sm:py-5 ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}>
              <dt className="mt-1 text-[13px] text-muted">{f.k}</dt>
              <dd className={`font-display text-lg leading-snug font-semibold tracking-[-0.01em] sm:text-xl ${i === 0 ? "text-brand" : "text-ink"}`}>
                {f.v}
                {f.sub && <span className="text-xs font-medium text-muted">{f.sub}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="container-page mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="min-w-0 space-y-14">
          {info?.overview && (
            <section {...reveal}>
              <Heading>{t.aboutTitle}</Heading>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-600 sm:text-[16px]">{info.overview}</p>
              {info.curriculum.length > 0 && (
                <>
                  <h3 className="mt-7 text-[13px] text-muted">{t.curriculum}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {info.curriculum.map((c) => (
                      <li key={c} className="rounded-full bg-ink-50 px-3.5 py-1.5 text-sm text-ink">{c}</li>
                    ))}
                  </ul>
                </>
              )}
              {info.careers.length > 0 && (
                <>
                  <h3 className="mt-7 text-[13px] text-muted">{t.careers}</h3>
                  <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
                    {info.careers.map((c) => (
                      <li key={c} className="flex items-center gap-3 border-b border-line py-2.5 text-[15px]">
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          <section {...reveal}>
            <Heading>{t.reqTitle}</Heading>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {requirements.map((r, i) => (
                <li
                  key={r.text}
                  {...reveal}
                  style={d(i * 0.06)}
                  className="group flex items-center gap-4 rounded-[14px] border border-ink/10 p-3.5 pr-4 text-[14px] leading-snug sm:text-[15px] transition-colors hover:border-ink/25"
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-ink-50">
                    <Picture
                      sizes="40px"
                      src={`/requirements/${r.img}.png`}
                      alt=""
                      loading="lazy"
                      className="size-10 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:-rotate-6"
                    />
                  </span>
                  {r.text}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[13px] leading-relaxed text-muted">{t.reqNote}</p>
            {info && (rules.length > 0 || info.documents.length > 0) && (
              <details className="group/rules mt-5 rounded-[14px] border border-ink/10">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {t.rulesTitle}
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted transition-transform group-open/rules:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div className="space-y-5 border-t border-ink/10 px-4 py-4 text-[14px] leading-relaxed text-ink-600 sm:text-[15px]">
                  {rules.map((r) => (
                    <div key={r.k}>
                      <h3 className="font-semibold text-ink">{r.k}</h3>
                      <p className="mt-1 whitespace-pre-line">{r.v}</p>
                    </div>
                  ))}
                  {info.documents.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-ink">{t.documentsList}</h3>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {info.documents.map((doc) => <li key={doc}>{doc}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            )}
          </section>

          <section {...reveal}>
            <Heading>{t.stepsTitle}</Heading>
            {/* A plain numbered timeline; the connecting line draws itself downward as the list scrolls in. */}
            <ol className="mt-6">
              {dict.home.steps.map((s, i, all) => (
                <li key={s.title} className="relative grid grid-cols-[36px_1fr] gap-x-4 pb-8 last:pb-0 sm:gap-x-5">
                  {i < all.length - 1 && (
                    <span aria-hidden style={d(0.15 + i * 0.2)} className="grow-line absolute top-10 bottom-1 left-[17.5px] w-px bg-ink/15" />
                  )}
                  <span className="grid size-9 place-items-center rounded-full border border-ink/15 bg-white font-display text-[15px] font-semibold text-ink">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-display text-[17px] font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-muted sm:text-[15px]">{s.text}</p>
                    <p className="mt-3 inline-block rounded-md bg-ink-50 px-2.5 py-1 text-[13px] text-ink-600">{s.result}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {p.fee != null && (
            <section {...reveal}>
              <Heading>{t.costTitle}</Heading>
              <div className="mt-5 rounded-[18px] border border-ink/10">
                <dl className="px-5 sm:px-6">
                  {saving && p.feeOfficial ? (
                    <>
                      <CostRow label={t.officialPrice}>
                        <span className="text-ink-400 line-through">{usd(p.feeOfficial)}</span>
                      </CostRow>
                      <CostRow
                        label={
                          <span className="flex items-center gap-2">
                            {t.discountRow}
                            {p.discount ? <span className="rounded-md bg-sun/15 px-1.5 py-0.5 text-xs font-semibold text-[#a35f00]">−{Math.round(p.discount)}%</span> : null}
                          </span>
                        }
                      >
                        <span className="font-semibold text-success">−{usd(saving)}</span>
                      </CostRow>
                    </>
                  ) : null}
                  <CostRow label={<span className="font-semibold text-ink">{t.yourPrice}</span>}>
                    <span className="font-display text-xl font-semibold text-ink">
                      {usd(p.fee)}
                      <span className="text-xs font-medium text-muted">{dict.common.perYear}</span>
                    </span>
                  </CostRow>
                </dl>
                {total ? (
                  <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 rounded-b-[18px] border-t border-ink/10 bg-ink-50/70 px-5 py-5 sm:px-6">
                    <div>
                      <p className="text-[13px] text-muted">{fill(t.totalPrice, { years: duration })}</p>
                      {saving && p.years ? <p className="mt-1 text-sm font-semibold text-success">{fill(t.totalSaving, { n: usd(saving * p.years) })}</p> : null}
                    </div>
                    <p className="font-display text-[26px] leading-none font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                      <CountUp value={total} locale="en" prefix="$" />
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {uni && (
            <section {...reveal}>
              <Heading>{t.aboutUni}</Heading>
              <Link
                href={href(`/universities/${uni.slug}`)}
                className="group mt-5 flex flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-white transition-colors duration-300 hover:border-ink/25 sm:flex-row"
              >
                <Photo slug={uni.slug} name={uni.name} className="h-40 shrink-0 sm:h-auto sm:w-44 xl:w-56" sizes="(min-width: 640px) 224px, 100vw" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="font-display text-lg leading-snug font-semibold transition-colors group-hover:text-brand">{uni.name}</h3>
                    <p className="text-sm text-muted">
                      {label(labels.city, uni.city)} · {label(labels.type, uni.type)}
                      {uni.founded ? ` · ${fill(dict.common.since, { year: uni.founded })}` : ""}
                    </p>
                    {uni.ranking && <p className="text-[13px] text-ink-600">{uni.ranking}</p>}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-brand">
                      {t.aboutUni}
                      <Arrow />
                    </span>
                  </div>
                  <dl className="grid grid-cols-3 border-t border-ink/10 text-center sm:text-left">
                    {[
                      { v: <CountUp value={uni.stats.programs} locale="en" />, k: t.uniPrograms },
                      {
                        v: uni.stats.tuitionMin != null && uni.stats.tuitionMax != null && uni.stats.tuitionMax > uni.stats.tuitionMin
                          ? `${usdShort(uni.stats.tuitionMin)}–${usdShort(uni.stats.tuitionMax)}`
                          : usdShort(uni.stats.tuitionMin),
                        k: t.uniTuition,
                      },
                      { v: Object.keys(uni.stats.byLanguage).length, k: t.uniLanguages },
                    ].map((s, i) => (
                      <div key={s.k} className={`px-3 py-3.5 sm:px-4 xl:px-5 ${i > 0 ? "border-l border-ink/10" : ""}`}>
                        <dd className="font-display text-base font-semibold whitespace-nowrap text-ink sm:text-lg">{s.v}</dd>
                        <dt className="mt-0.5 text-[12px] leading-tight text-muted">{s.k}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              </Link>
            </section>
          )}
        </div>

        <aside style={d(0.3)} className="enter order-first lg:sticky lg:top-28 lg:order-none lg:self-start">
          <div className="overflow-hidden rounded-[18px] border border-ink/10 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-3.5 text-sm">
              <span className="flex items-center gap-2 font-semibold text-ink">
                <StatusDot open={p.open} />
                {p.open ? t.open : t.closed}
              </span>
              {deadline && <span className="text-muted">{fill(t.until, { date: deadline })}</span>}
            </div>
            <div className="p-6">
              <p className="text-[13px] text-muted">{t.pricePerYear}</p>
              {saving ? (
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-ink-400 line-through">{usd(p.feeOfficial)}</span>
                  {p.discount ? <span className="rounded-md bg-sun/15 px-1.5 py-0.5 text-xs font-semibold text-[#a35f00]">−{Math.round(p.discount)}%</span> : null}
                </p>
              ) : null}
              <p className="mt-1 font-display text-[36px] leading-none sm:text-[44px] font-semibold tracking-[-0.03em] text-ink">{usd(p.fee, dict.common.onRequest)}</p>
              {saving ? <p className="mt-3 text-sm font-semibold text-success">{fill(t.saving, { n: usd(saving) })}</p> : null}
              <div className="mt-6 grid gap-2">
                <Link href={href(`/apply?program=${p.id}`)} className="btn-primary btn-shine w-full" style={{ boxShadow: "none" }}>{t.apply}</Link>
                <a
                  href={whatsappLink(fill(dict.whatsapp.aboutProgram, { program: p.name, uni: p.uniName }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#1fbe5b] w-full"
                >
                  <WhatsAppIcon />
                  {t.askWhatsapp}
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="container-page mt-20">
        <div {...reveal} className="relative overflow-hidden rounded-[22px] bg-ink-900 text-white">
          <Photo slug={p.uni} name="" className="!absolute inset-y-0 right-0 hidden w-[55%] opacity-40 [mask-image:linear-gradient(to_left,#000_20%,transparent)] lg:block" sizes="55vw" />
          <div className="relative max-w-2xl p-7 sm:p-12">
            <h2 className="font-display text-[clamp(24px,3vw,36px)] leading-tight font-semibold tracking-[-0.02em] text-balance">{t.ctaTitle}</h2>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/70 sm:text-[15px]">{t.ctaText}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={href(`/apply?program=${p.id}`)} className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-ink-900 transition-colors hover:bg-brand-soft">
                {t.apply}
                <Arrow />
              </Link>
              <a
                href={whatsappLink(fill(dict.whatsapp.aboutProgram, { program: p.name, uni: p.uniName }))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#1fbe5b]"
              >
                <WhatsAppIcon />
                {t.askWhatsapp}
              </a>
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="container-page mt-20">
          <div {...reveal} className="flex flex-wrap items-end justify-between gap-4 border-t border-ink/15 pt-5">
            <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{t.similar}</h2>
            <Link href={href("/programs")} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 transition-colors hover:text-brand">
              {dict.footer.allPrograms}
              <Arrow />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {similar.map((s, i) => (
              <div key={s.id} {...reveal} style={d(i * 0.08)}>
                <ProgramRow p={s} compact />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** One line of the price breakdown, divided from the next by a dashed rule. */
function CostRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-ink/15 py-4 text-[15px] last:border-b-0">
      <dt className="text-ink-600">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

/** Green dot with a soft ping while applications are open, grey when closed. */
function StatusDot({ open }: { open: boolean }) {
  return (
    <span className="relative flex size-2.5">
      {open && <span className="absolute inset-0 animate-ping rounded-full bg-success/50" />}
      <span className={`relative size-2.5 rounded-full ${open ? "bg-success" : "bg-ink-400"}`} />
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
