import Link from "next/link";
import type { CSSProperties } from "react";
import { IconCheck, IconFile, IconPlane, IconSearch, IconShield } from "./icons";
import { getI18n } from "@/i18n/server";
import { reveal } from "@/lib/reveal";
import { whatsappLink } from "@/lib/site";
import { Picture } from "./picture";

const stepIcons = [IconSearch, IconShield, IconFile, IconPlane];

/** Seconds the line takes to draw from one step to the next once the list scrolls into view; each node lights up as it arrives. */
const STEP = 0.45;

/**
 * "How it works": the four steps on a vertical line (on desktop exactly at the page centre, steps filling the right half) that draws itself when the list scrolls into view
 * (the reveal script adds data-shown to the [data-reveal] list), next to the student card they lead to.
 */
export async function HowItWorks() {
  const { t, href } = await getI18n();
  const h = t.home;
  const c = h.stepsCard;
  const last = h.steps.length - 1;

  return (
    <section id="how" className="container-page scroll-mt-24 py-12 sm:py-16 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
        <div className="lg:sticky lg:top-28 lg:self-start lg:pr-16">
          <div {...reveal}>
            <p className="font-mono text-sm text-ink-600 sm:text-[15px]">{h.stepsEyebrow}</p>
            <h2 className="section-title mt-3">{h.stepsTitle}</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{h.stepsText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={href("/apply")} className="btn-primary group">
                {h.stepsCta} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a href={whatsappLink(t.whatsapp.hello)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1da851] px-6 py-3 text-[15px] font-bold text-white shadow-[0_8px_18px_#1da85133] transition hover:bg-[#178f45]">
                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
                </svg>
                {h.stepsWhatsapp}
              </a>
            </div>
          </div>

          {/* The goal of the four steps: a student card that floats, with a light sweeping across it. */}
          <div {...reveal} style={{ "--d": "0.15s" } as CSSProperties} className="mt-12 hidden pl-2 sm:block" aria-hidden>
            <div className="w-full max-w-[380px] -rotate-3 animate-[float-y_6s_ease-in-out_infinite] motion-reduce:animate-none">
              <div className="relative aspect-[1.586] overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#2f7bff,#0360eb_45%,#1a237e)] p-5 text-white shadow-[0_24px_50px_-20px_#0360eb99]">
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shine_4s_ease-in-out_infinite] motion-reduce:hidden" />
                <div className="absolute -top-16 -right-16 size-48 rounded-full bg-white/10" />
                <div className="relative flex items-center justify-between">
                  <p className="font-display text-[15px] font-bold tracking-tight">Saffet Education</p>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-brand uppercase">{c.title}</span>
                </div>
                <div className="relative mt-5 flex gap-4">
                  <Picture src="/promo/student-blue.jpg" sizes="68px" className="h-[84px] w-[68px] shrink-0 rounded-lg object-cover object-[50%_18%] ring-2 ring-white/40" />
                  <dl className="min-w-0 space-y-2 text-[13px]">
                    <div>
                      <dt className="text-[10px] tracking-wider text-white/60 uppercase">{c.nameLabel}</dt>
                      <dd className="font-semibold">{c.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] tracking-wider text-white/60 uppercase">{c.uniLabel}</dt>
                      <dd className="font-semibold">{c.uni}</dd>
                    </div>
                  </dl>
                </div>
                <div className="absolute inset-x-5 bottom-4 flex items-end justify-between">
                  <p className="font-mono text-[11px] tracking-widest text-white/70">TR · 0001 2027</p>
                  <span className="h-6 w-20 bg-[repeating-linear-gradient(90deg,#fff_0_2px,transparent_2px_4px,#fff_4px_5px,transparent_5px_8px)] opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ol {...reveal} className="group/steps relative lg:-ml-6">
          {h.steps.map((s, i) => {
            const Icon = stepIcons[i];
            const final = i === last;
            const delay = { transitionDelay: `${0.3 + i * (STEP + 0.2)}s` };
            return (
              <li key={s.title} className="group/step relative pb-10 pl-[76px] last:pb-0 sm:pb-12">
                {/* Grey track down to the next node, and the line that draws along it before that node lights up */}
                {!final && (
                  <span className="absolute top-14 bottom-2 left-[23px] w-[2px] rounded-full bg-ink/10" aria-hidden>
                    <span
                      className={`absolute inset-0 origin-top scale-y-0 rounded-full transition-transform ease-in-out group-data-shown/steps:scale-y-100 motion-reduce:transition-none ${
                        i === last - 1 ? "bg-gradient-to-b from-brand to-sun" : "bg-brand"
                      }`}
                      style={{ transitionDuration: `${STEP}s`, transitionDelay: `${0.3 + i * (STEP + 0.2) + 0.2}s` }}
                    />
                  </span>
                )}
                {/* Node: appears and fills in as the line reaches it */}
                <span className="absolute top-0 left-0 grid size-12 place-items-center">
                  {final && <span className="absolute -inset-1.5 rounded-full bg-sun/35 opacity-0 group-data-shown/steps:animate-[glow-pulse_2.4s_ease-in-out_infinite] motion-reduce:hidden" style={{ animationDelay: `${0.3 + i * (STEP + 0.2)}s` }} />}
                  <span
                    style={delay}
                    className={`relative grid size-12 scale-50 place-items-center rounded-full border-2 opacity-0 transition duration-500 ease-out group-data-shown/steps:scale-100 group-data-shown/steps:opacity-100 motion-reduce:transition-none ${
                      final
                        ? "border-sun bg-sun text-white"
                        : "border-brand bg-white text-brand group-hover/step:bg-brand group-hover/step:text-white"
                    }`}
                  >
                    <Icon className="size-[22px]" />
                  </span>
                </span>

                <div
                  style={delay}
                  className="translate-x-4 opacity-0 transition duration-700 ease-out group-data-shown/steps:translate-x-0 group-data-shown/steps:opacity-100 motion-reduce:transition-none"
                >
                  <p className="pt-0.5 font-mono text-xs text-ink-400">
                    {h.stepLabel} {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1.5 font-display text-xl font-bold text-ink transition-colors group-hover/step:text-brand sm:text-2xl">{s.title}</h3>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">{s.text}</p>
                  <p
                    className={`mt-3.5 inline-flex items-start gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-semibold ${
                      final ? "bg-sun/15 text-[#a35f00]" : "bg-brand-soft text-brand"
                    }`}
                  >
                    <IconCheck className="mt-px size-4 shrink-0" />
                    {s.result}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
