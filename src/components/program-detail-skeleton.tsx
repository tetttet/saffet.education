import { Bone } from "./skeleton";
import type { I18n } from "@/i18n/server";

// Text lines are given the real line heights (font size × leading) and a shorter bone inside, so the page keeps its rhythm.
const line = "flex items-center";

/** Section title over a hairline: real text, it does not depend on the programme. */
function Heading({ children }: { children: string }) {
  return (
    <div className="border-t border-ink/15 pt-5">
      <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{children}</h2>
    </div>
  );
}

/** Facts strip under the hero (fee, duration, language, level, intake), shared with the university page. */
export function FactsSkeleton({ className = "-mt-12" }: { className?: string }) {
  return (
    <div className={`container-page relative z-10 ${className}`}>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-ink/[0.07] bg-ink/[0.07] shadow-[0_10px_28px_-22px_rgb(11_22_48/0.22)] md:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`bg-white px-5 py-4 sm:py-5 ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}>
            <div className={`${line} h-[24.75px] sm:h-[27.5px]`}><Bone className={`h-[18px] sm:h-5 ${["w-24", "w-16", "w-20", "w-24", "w-28"][i]}`} /></div>
            <div className={`${line} mt-1 h-[19.5px]`}><Bone className="h-3 w-20" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** /programs/[id] while loading: hero band with photo, facts strip, requirements and steps on the left, price card on the right. */
export function ProgramDetailSkeleton({ i18n }: { i18n: I18n }) {
  const { t } = i18n;
  return (
    <div aria-busy aria-hidden>
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#eaf1ff_0%,#f3f7ff_65%,#fafcff_100%)]">
        <div className="hero-dots pointer-events-none absolute inset-y-0 right-0 w-2/3" />
        <div className="container-page relative pt-8 pb-24 sm:pt-10 lg:pb-28">
          <div className={`${line} h-[19.5px] gap-2`}>
            <Bone className="h-3 w-14" />
            <Bone className="h-3 w-20" />
            <Bone className="h-3 w-40" />
          </div>

          <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_460px] lg:items-center lg:gap-14">
            <div>
              {/* The real university link is inline-flex on a text baseline, so its line box is 63.5px with the logo at the bottom */}
              <div className="flex h-[63.5px] items-end gap-3">
                <Bone className="size-14 rounded-2xl" />
                <div>
                  <div className={`${line} h-[19px]`}><Bone className="h-3.5 w-48" /></div>
                  <div className={`${line} h-[16px]`}><Bone className="h-3 w-32" /></div>
                </div>
              </div>
              <div className="mt-7 flex h-[23.5px] gap-2">
                <Bone className="h-full w-24" />
                <Bone className="h-full w-32" />
              </div>
              {/* Two title lines at the h1's size: clamp(28px, 4.6vw, 56px) with leading 1.04 */}
              <div className="mt-4 space-y-0">
                {["w-[90%]", "w-[55%]"].map((w) => (
                  <div key={w} className={`${line} h-[calc(clamp(28px,4.6vw,56px)*1.04)]`}>
                    <Bone className={`h-[calc(clamp(28px,4.6vw,56px)*0.78)] rounded-lg ${w}`} />
                  </div>
                ))}
              </div>
              {i18n.locale !== "en" && <div className={`${line} mt-2 h-[22.5px]`}><Bone className="h-3.5 w-56" /></div>}
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-y-3 sm:[&>div+div]:border-l sm:[&>div+div]:border-ink/10 sm:[&>div+div]:pl-6">
                {["w-44", "w-24", "w-28"].map((w, i) => (
                  <div key={w} className={i === 0 ? "col-span-2" : ""}>
                    <div className={`${line} h-[19.5px]`}><Bone className="h-3 w-16" /></div>
                    <div className={`${line} mt-0.5 h-[22.5px]`}><Bone className={`h-4 ${w}`} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Bone className="h-[46.5px] w-52 rounded-full" />
                <Bone className="h-4 w-32" />
              </div>
            </div>
            <Bone className="h-56 rounded-[22px] sm:h-72 lg:h-[320px]" />
          </div>
        </div>
      </section>

      <FactsSkeleton />

      <div className="container-page mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="min-w-0 space-y-14">
          <section>
            <Heading>{t.program.aboutTitle}</Heading>
            <div className="mt-5 max-w-2xl">
              {["w-full", "w-[97%]", "w-[94%]", "w-[98%]", "w-[45%]"].map((w, i) => (
                <div key={i} className={`${line} h-[24.4px] sm:h-[26px]`}><Bone className={`h-3.5 ${w}`} /></div>
              ))}
            </div>
            <p className="mt-7 text-[13px] text-muted">{t.program.curriculum}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["w-36", "w-28", "w-44", "w-32", "w-40", "w-24"].map((w) => (
                <Bone key={w} className={`h-8 rounded-full ${w}`} />
              ))}
            </div>
            <p className="mt-7 text-[13px] text-muted">{t.program.careers}</p>
            <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
              {["w-40", "w-48", "w-36", "w-44", "w-32"].map((w) => (
                <div key={w} className="flex h-[43.5px] items-center gap-3 border-b border-line">
                  <Bone className="size-1.5 rounded-full" />
                  <Bone className={`h-3.5 ${w}`} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <Heading>{t.program.reqTitle}</Heading>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["w-[70%]", "w-[55%]", "w-[75%]", "w-[50%]"].map((w) => (
                // Same height as a real requirement card (picture tile, padding and border)
                <div key={w} className="flex h-[89px] items-center gap-4 rounded-[14px] border border-ink/10 p-3.5 pr-4">
                  <Bone className="size-14 shrink-0 rounded-xl" />
                  <Bone className={`h-3.5 ${w}`} />
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-muted">{t.program.reqNote}</p>
            <div className="mt-5 flex items-center justify-between rounded-[14px] border border-ink/10 px-4 py-3.5 text-[15px] font-semibold text-ink">
              {t.program.rulesTitle}
              <Bone className="size-4 rounded-full" />
            </div>
          </section>

          {/* The steps are the same on every programme page, so they are shown as they are. */}
          <section>
            <Heading>{t.program.stepsTitle}</Heading>
            <ol className="mt-6">
              {t.home.steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[36px_1fr] gap-x-4 pb-8 last:pb-0 sm:gap-x-5">
                  <span className="grid size-9 place-items-center rounded-full border border-ink/15 bg-white font-display text-[15px] font-semibold text-ink">{i + 1}</span>
                  <div className="pt-1.5">
                    <h3 className="font-display text-[17px] font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-muted sm:text-[15px]">{s.text}</p>
                    <p className="mt-3 inline-block rounded-md bg-ink-50 px-2.5 py-1 text-[13px] text-ink-600">{s.result}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="order-first lg:sticky lg:top-28 lg:order-none lg:self-start">
          <div className="overflow-hidden rounded-[18px] border border-ink/10 bg-white">
            <div className="flex h-[49px] items-center justify-between gap-3 border-b border-line px-6">
              <span className="flex items-center gap-2"><Bone className="size-2.5 rounded-full" /><Bone className="h-3.5 w-28" /></span>
              <Bone className="h-3 w-20" />
            </div>
            <div className="p-6">
              <p className="text-[13px] text-muted">{t.program.pricePerYear}</p>
              <div className={`${line} mt-2 h-5 gap-2`}><Bone className="h-3 w-14" /><Bone className="h-4 w-10" /></div>
              <div className={`${line} mt-1 h-9 sm:h-11`}><Bone className="h-8 w-40 rounded-lg sm:h-10" /></div>
              <div className={`${line} mt-3 h-5`}><Bone className="h-3.5 w-36" /></div>
              <div className="mt-6 grid gap-2">
                <Bone className="h-[46.5px] rounded-full" />
                <Bone className="h-[46.5px] rounded-full" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
