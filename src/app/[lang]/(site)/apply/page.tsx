import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplyForm } from "@/components/apply-form";
import { getI18n } from "@/i18n/server";
import { getProgram, getUniversity, universities } from "@/lib/data";
import { label } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { reveal } from "@/lib/reveal";
import { site, whatsappLink } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  return pageMetadata({ locale, path: "/apply", title: t.apply.metaTitle, description: t.apply.metaDescription });
}

/** Free consultation: what we do as a plain numbered list on the left, the request form on the right. */
export default async function ApplyPage({ searchParams }: PageProps<"/[lang]/apply">) {
  const { t } = await getI18n();
  const a = t.apply;
  const unis = Object.keys(t.labels.city)
    .map((city) => ({
      city: label(t.labels.city, city),
      names: universities.filter((u) => u.city === city).map((u) => u.name).sort((x, y) => x.localeCompare(y)),
    }))
    .filter((g) => g.names.length);
  return (
    <section className="container-page grid gap-10 pt-12 sm:pt-16 lg:grid-cols-[1fr_1.05fr] lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-0">
      <div {...reveal}>
        <p className="font-mono text-sm text-ink-600 sm:text-[15px]">{a.eyebrow}</p>
        <h1 className="section-title mt-3">
          {a.titleStart} {a.titleMarker}
        </h1>
        <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-muted sm:text-[15px]">{a.lead}</p>
      </div>

      {/* On phones the form comes right after the heading; on desktop it sits in the right column */}
      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <Suspense fallback={<div className="h-[36rem] rounded-[20px] bg-[#f3f5f9]" />}>
          {searchParams.then((sp) => {
            const program = typeof sp.program === "string" ? getProgram(sp.program) : undefined;
            const uni = typeof sp.uni === "string" ? getUniversity(sp.uni) : undefined;
            const interest = program ? `${program.name} — ${program.uniName}` : (uni?.name ?? "");
            return <ApplyForm interest={interest} t={a.form} levels={Object.values(t.labels.degree)} defaultLevel={t.labels.degree["Bachelor's Degree"]} unis={unis} />;
          })}
        </Suspense>
      </div>

      <div className="lg:pt-10">
        <ol className="border-t border-ink/10">
          {a.list.map((item, i) => (
            <li key={item} className="flex items-baseline gap-5 border-b border-ink/10 py-4">
              <span className="w-6 shrink-0 font-mono text-xs text-ink-400">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[15px] font-medium text-ink">{item}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <p className="text-sm font-semibold text-ink">{a.preferWriting}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={whatsappLink(t.whatsapp.hello)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-[9px] bg-[#1da851] px-5 text-sm font-semibold text-white transition hover:bg-[#178f45]"
            >
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={site.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-[9px] border border-ink/15 px-5 text-sm font-semibold text-ink transition hover:border-ink/35"
            >
              Telegram
            </a>
            <a href={`mailto:${site.email}`} className="text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-brand hover:decoration-brand">
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
