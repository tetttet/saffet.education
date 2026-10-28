import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties, type ReactNode } from "react";
import { UniCover } from "@/components/cards";
import { CountUp } from "@/components/motion";
import { ProgramRow } from "@/components/program-row";
import { IconPin } from "@/components/icons";
import { fill } from "@/i18n/config";
import { getI18n, type I18n } from "@/i18n/server";
import { getUniversity, programsOf, universities, universityTexts, type Program } from "@/lib/data";
import { hue, initials, label, num, plural, usd } from "@/lib/format";
import { uniImage, uniLogo } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";
import { reveal } from "@/lib/reveal";
import { LogoCover, LogoTile } from "@/components/uni-logo";
import { whatsappLink } from "@/lib/site";
import { Picture } from "@/components/picture";

export function generateStaticParams() {
  return universities.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/universities/[slug]">): Promise<Metadata> {
  const { t, locale } = await getI18n();
  const uni = getUniversity((await params).slug);
  if (!uni) notFound();
  return pageMetadata({
    locale,
    path: `/universities/${uni.slug}`,
    title: fill(t.university.metaTitle, { name: uni.name }),
    description: fill(t.university.metaDescription, {
      name: uni.name,
      city: label(t.labels.city, uni.city),
      programs: plural(uni.stats.programs, locale, t.home.programsWords),
      min: usd(uni.stats.tuitionMin),
    }),
  });
}

function feeRange(list: Program[], onRequest: string) {
  const fees = list.map((p) => p.fee).filter((n): n is number => n != null);
  if (!fees.length) return onRequest;
  const min = Math.min(...fees), max = Math.max(...fees);
  return min === max ? usd(min) : `${usd(min)} – ${usd(max)}`;
}

function groupBy(list: Program[], key: "degree" | "language" | "field") {
  const m = new Map<string, Program[]>();
  for (const p of list) m.set(p[key], [...(m.get(p[key]) ?? []), p]);
  return [...m].sort((a, b) => b[1].length - a[1].length);
}

export default async function UniversityPage({ params }: PageProps<"/[lang]/universities/[slug]">) {
  const i18n = await getI18n();
  return (
    <Suspense fallback={<div className="h-[520px] animate-pulse bg-surface" />}>
      {params.then(({ slug }) => <University slug={slug} i18n={i18n} />)}
    </Suspense>
  );
}

const d = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;
// 3D pictures (Microsoft Fluent Emoji, MIT) for the document list, in the order of `university.documents`.
const documentImages = ["diploma", "passport", "school", "language", "photos"];

function Heading({ id, children, action, plain = false }: { id?: string; children: ReactNode; action?: ReactNode; plain?: boolean }) {
  return (
    <div id={id} className={`flex scroll-mt-32 flex-wrap items-end justify-between gap-x-6 gap-y-2 ${plain ? "" : "border-t border-ink/15 pt-5"}`}>
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] sm:text-2xl">{children}</h2>
      {action}
    </div>
  );
}

function University({ slug, i18n }: { slug: string; i18n: I18n }) {
  const uni = getUniversity(slug);
  if (!uni) notFound();
  const { t: dict, href, locale } = i18n;
  const t = dict.university;
  const texts = universityTexts(uni, locale);
  const labels = dict.labels;
  const list = programsOf(uni.slug);
  const english = list.filter((p) => p.language === "English").length;
  const similar = universities.filter((u) => u.slug !== uni.slug && u.city === uni.city).slice(0, 4);
  const cityName = label(labels.city, uni.city);
  // Living cost comes from the data as "$400–700 / month"; the unit is shown in the page language.
  const living = uni.livingCost ? uni.livingCost.replace(/\s*\/\s*month$/i, "") + t.perMonth : null;
  const whatsapp = whatsappLink(fill(dict.whatsapp.aboutUni, { uni: uni.name }));

  const facts = [
    { k: t.programs, v: <CountUp value={list.length} locale="en" /> },
    { k: t.english, v: <CountUp value={english} locale="en" /> },
    { k: t.tuitionFrom, v: usd(uni.stats.tuitionMin), accent: true },
    { k: t.living, v: living ?? "—" },
    { k: t.founded, v: uni.founded ?? "—" },
  ];
  const tabs = [
    ...(uni.description ? [["about", t.tabAbout]] : []),
    ["programs", t.tabPrograms],
    ["fees", t.tabFees],
    ["apply", t.tabApply],
    ...(similar.length ? [["similar", t.tabSimilar]] : []),
  ];

  return (
    <>
      {/* Campus photo across the full width, darkened toward the bottom-left where the text sits. */}
      <section className="relative isolate overflow-hidden bg-ink-900">
        <UniCover uni={uni} className="photo-in absolute inset-0" sizes="100vw" priority />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0b1525d9_0%,#0b152599_45%,#0b152526_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0b1525cc] to-transparent" />
        <div className="container-page relative flex min-h-[460px] flex-col pt-8 pb-28 sm:min-h-[520px] lg:pb-32">
          <nav className="enter flex flex-wrap items-center gap-x-2 text-[13px] text-white/70">
            <Link href={href("/")} className="transition-colors hover:text-white">{dict.nav.home}</Link>
            <span aria-hidden className="text-white/35">/</span>
            <Link href={href("/universities")} className="transition-colors hover:text-white">{dict.nav.universities}</Link>
            <span aria-hidden className="text-white/35">/</span>
            <span className="truncate text-white">{uni.name}</span>
          </nav>

          <div className="mt-auto grid gap-8 pt-16 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <LogoTile logo={uniLogo(uni.slug)} initials={initials(uni.name)} hue={hue(uni.slug)} className="enter mb-5 size-20 rounded-2xl p-2 shadow-lg ring-white/20 sm:size-24" style={d(0)} />
              {uni.alternateName && <p style={d(0.05)} className="enter text-[15px] text-white/70">{uni.alternateName}</p>}
              <h1 style={d(0.1)} className="enter mt-2 font-display text-[clamp(34px,5vw,64px)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance text-white">
                {uni.name}
              </h1>
              <p style={d(0.15)} className="enter mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-white/80">
                <IconPin className="size-4" />
                {cityName}, {dict.common.turkey}
                <span aria-hidden className="text-white/35">·</span>
                {fill(t.typeUniversity, { type: label(labels.type, uni.type) })}
                {uni.founded ? (
                  <>
                    <span aria-hidden className="text-white/35">·</span>
                    {fill(dict.common.since, { year: uni.founded })}
                  </>
                ) : null}
              </p>
              <div style={d(0.2)} className="enter mt-8 flex flex-wrap gap-3">
                <Link href={href(`/apply?uni=${uni.slug}`)} className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-ink-900 transition-colors hover:bg-brand-soft">
                  {t.applyWith}
                  <Arrow />
                </Link>
                <Link href={href(`/programs?uni=${uni.slug}`)} className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">
                  {fill(t.allPrograms, { n: list.length })}
                </Link>
              </div>
            </div>
            {uni.ranking && (
              <div style={d(0.25)} className="enter max-w-[300px] rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur-md">
                <p className="text-[13px] text-white/65">{t.ranking}</p>
                <p className="mt-1 text-[15px] leading-snug font-semibold">{uni.ranking}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-page relative z-10 -mt-14">
        <dl style={d(0.3)} className="enter grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-[#eceef2] bg-[#eceef2] shadow-[0_10px_28px_-22px_rgb(11_22_48/0.22)] md:grid-cols-5">
          {facts.map((f, i) => (
            <div key={f.k} className={`flex flex-col-reverse justify-end bg-white px-5 py-4 sm:py-5 ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}>
              <dt className="mt-1 text-[13px] text-muted">{f.k}</dt>
              <dd className={`font-display text-xl leading-snug font-semibold tracking-[-0.01em] ${f.accent ? "text-brand" : "text-ink"}`}>{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Section links stay under the header while scrolling. */}
      <div className="sticky top-16 z-30 mt-10 border-b border-line bg-white/90 backdrop-blur">
        <nav className="container-page flex gap-7 overflow-x-auto text-[15px] font-semibold whitespace-nowrap">
          {tabs.map(([id, text]) => (
            <a key={id} href={`#${id}`} className="border-b-2 border-transparent py-3.5 text-ink-600 transition-colors hover:border-brand hover:text-ink">
              {text}
            </a>
          ))}
        </nav>
      </div>

      <div className="container-page mt-12 grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-14">
        <div className="min-w-0 space-y-16">
          {texts.description && (
            <section {...reveal}>
              <Heading id="about" plain>{t.about}</Heading>
              <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-600">{texts.description}</p>
              {texts.housing && (
                <>
                  <h3 className="mt-7 font-display text-lg font-semibold">{t.housing}</h3>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-600">{texts.housing}</p>
                </>
              )}
            </section>
          )}

          <section {...reveal}>
            <Heading
              id="programs"
              action={
                <Link href={href(`/programs?uni=${uni.slug}`)} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 transition-colors hover:text-brand">
                  {fill(t.allPrograms, { n: list.length })}
                  <Arrow />
                </Link>
              }
            >
              {t.programsTitle}
            </Heading>
            <h3 className="mt-6 text-[13px] text-muted">{t.fieldsTitle}</h3>
            <ul className="mt-2 grid sm:grid-cols-2 sm:gap-x-8">
              {groupBy(list, "field").map(([f, ps]) => (
                <li key={f}>
                  <Link
                    href={href(`/programs?uni=${uni.slug}&field=${encodeURIComponent(f)}`)}
                    className="group flex items-center justify-between gap-4 border-b border-line py-3 text-[15px] transition-colors hover:text-brand"
                  >
                    <span className="font-medium">{label(labels.field, f)}</span>
                    <span className="flex items-center gap-2 text-sm text-muted group-hover:text-brand">
                      {ps.length}
                      <Arrow />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-4">
              {list.slice(0, 5).map((p, i) => (
                <div key={p.id} {...reveal} style={d(i * 0.06)}>
                  <ProgramRow p={p} hideUni />
                </div>
              ))}
            </div>
          </section>

          <section {...reveal}>
            <Heading id="fees">{t.feesTitle}</Heading>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { title: t.byLevel, groups: groupBy(list, "degree"), map: labels.degree },
                { title: t.byLanguage, groups: groupBy(list, "language"), map: labels.language },
              ].map(({ title, groups, map }) => (
                <div key={title} className="rounded-[18px] border border-ink/10 px-5 pt-4 pb-1">
                  <h3 className="text-[13px] text-muted">{title}</h3>
                  <ul className="mt-1">
                    {groups.map(([k, ps]) => (
                      <li key={k} className="flex items-baseline justify-between gap-4 border-b border-dashed border-ink/15 py-3.5 text-[15px] last:border-b-0">
                        <span>
                          {label(map, k)} <span className="text-sm text-ink-400">{ps.length}</span>
                        </span>
                        <span className="text-right font-semibold whitespace-nowrap text-ink">{feeRange(ps, dict.common.onRequest)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-muted">{t.feesNote}</p>
          </section>

          <section {...reveal}>
            <Heading id="apply">{t.applyTitle}</Heading>
            {/* A plain numbered timeline; the connecting line draws itself downward as the list scrolls in. */}
            <ol className="mt-6">
              {t.steps.map((s, i, all) => (
                <li key={s.title} className="relative grid grid-cols-[36px_1fr] gap-x-4 pb-7 last:pb-0 sm:gap-x-5">
                  {i < all.length - 1 && <span aria-hidden style={d(0.15 + i * 0.2)} className="grow-line absolute top-10 bottom-1 left-[17.5px] w-px bg-ink/15" />}
                  <span className="grid size-9 place-items-center rounded-full border border-ink/15 bg-white font-display text-[15px] font-semibold text-ink">{i + 1}</span>
                  <div className="pt-1.5">
                    <h3 className="font-display text-[17px] font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h3 className="mt-10 font-display text-lg font-semibold">{t.documentsTitle}</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {t.documents.map((doc, i) => (
                <li
                  key={doc}
                  {...reveal}
                  style={d(i * 0.06)}
                  className="group flex items-center gap-4 rounded-[14px] border border-ink/10 p-3.5 pr-4 text-[15px] leading-snug transition-colors hover:border-ink/25"
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-ink-50">
                    <Picture
                      sizes="40px"
                      src={`/requirements/${documentImages[i] ?? "school"}.png`}
                      alt=""
                      loading="lazy"
                      className="size-10 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:-rotate-6"
                    />
                  </span>
                  {doc}
                </li>
              ))}
            </ul>
          </section>

          {similar.length > 0 && (
            <section {...reveal}>
              <Heading id="similar">{fill(t.otherIn, { city: cityName })}</Heading>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {similar.map((u, i) => (
                  <Link
                    key={u.slug}
                    href={href(`/universities/${u.slug}`)}
                    {...reveal}
                    style={d(i * 0.06)}
                    className="group flex overflow-hidden rounded-[18px] border border-ink/10 bg-white transition-colors duration-300 hover:border-ink/25"
                  >
                    <Thumb slug={u.slug} name={u.name} />
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
                      <span className="font-display text-[16px] leading-snug font-semibold transition-colors group-hover:text-brand">{u.name}</span>
                      <span className="text-[13px] text-muted">{fill(t.otherStats, { n: u.stats.programs, min: usd(u.stats.tuitionMin) })}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-[18px] border border-ink/10 bg-white px-6 pt-5 pb-2">
            <h3 className="text-[13px] text-muted">{t.short}</h3>
            <dl className="mt-1">
              {[
                [t.city, `${cityName}, ${dict.common.turkey}`],
                [t.type, label(labels.type, uni.type)],
                [t.founded, uni.founded ?? "—"],
                [t.programs, list.length],
                ...(uni.students ? [[t.students, num(uni.students, i18n.locale)]] : []),
                ...(uni.internationalStudents ? [[t.intlStudents, num(uni.internationalStudents, i18n.locale)]] : []),
                [t.living, living ?? "—"],
                ...(uni.address ? [[t.address, uni.address]] : []),
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-4 border-b border-line py-3 text-[15px] last:border-b-0">
                  <dt className="text-ink-600">{k}</dt>
                  <dd className="text-right font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {uni.website && (
              <a href={uni.website} target="_blank" rel="noopener noreferrer" className="-mx-6 mt-1 block border-t border-line px-6 py-3.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft/50">
                {t.website}
              </a>
            )}
          </div>

          <div className="rounded-[18px] bg-[#00235b] p-6 text-white">
            <p className="font-display text-xl font-semibold">{t.consultTitle}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/70">{fill(t.consultText, { name: uni.name })}</p>
            <div className="mt-6 grid gap-2">
              <Link href={href(`/apply?uni=${uni.slug}`)} className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-ink-900 transition-colors hover:bg-brand-soft">
                {t.consultButton}
                <Arrow />
              </Link>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#22bf5c] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#1da851]"
              >
                <WhatsAppIcon />
                {dict.program.askWhatsapp}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

/** Small campus photo for the other-universities cards, or the logo on a soft tint when there is none. */
function Thumb({ slug, name }: { slug: string; name: string }) {
  const image = uniImage(slug);
  const h = hue(slug);
  return (
    <div className="relative w-28 shrink-0 overflow-hidden bg-ink-50 sm:w-32">
      {image ? (
        <Picture src={image} sizes="128px" className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
      ) : (
        <LogoCover logo={uniLogo(slug)} initials={initials(name)} hue={h} size="sm" />
      )}
    </div>
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
