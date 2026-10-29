import { FactsSkeleton } from "./program-detail-skeleton";
import { ProgramRowSkeleton } from "./programs-skeleton";
import { Bone } from "./skeleton";
import type { I18n } from "@/i18n/server";

const line = "flex items-center";
const dark = "skeleton-dark";

/** /universities/[slug] while loading: dark hero, facts strip, section tabs, about and programmes on the left, summary and consult cards on the right. */
export function UniversityDetailSkeleton({ i18n }: { i18n: I18n }) {
  const { t: dict } = i18n;
  const t = dict.university;
  return (
    <div aria-busy aria-hidden>
      <section className="relative overflow-hidden bg-ink-900">
        <div className="container-page relative flex min-h-[460px] flex-col pt-8 pb-28 sm:min-h-[520px] lg:pb-32">
          <div className={`${line} h-[19.5px] gap-2`}>
            <Bone className={`${dark} h-3 w-14`} />
            <Bone className={`${dark} h-3 w-24`} />
            <Bone className={`${dark} h-3 w-40`} />
          </div>

          <div className="mt-auto max-w-3xl pt-16">
            <Bone className={`${dark} mb-5 size-20 rounded-2xl sm:size-24`} />
            {/* Every university has an alternate (Turkish) name over the title */}
            <div className={`${line} h-[22.5px]`}><Bone className={`${dark} h-3.5 w-52`} /></div>
            {/* One title line at the h1's size, clamp(28px, 5vw, 64px) with leading 1.02: most names fit on one */}
            <div className={`${line} mt-2 h-[calc(clamp(28px,5vw,64px)*1.02)]`}>
              <Bone className={`${dark} h-[calc(clamp(28px,5vw,64px)*0.78)] w-[min(620px,90%)] rounded-lg`} />
            </div>
            <div className={`${line} mt-4 h-[22.5px] gap-2`}>
              <Bone className={`${dark} size-4 rounded-full`} />
              <Bone className={`${dark} h-3.5 w-[min(380px,80%)]`} />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Bone className={`${dark} h-[48.5px] w-56 rounded-full`} />
              <Bone className={`${dark} h-[48.5px] w-44 rounded-full`} />
            </div>
          </div>
        </div>
      </section>

      <FactsSkeleton className="-mt-14" />

      {/* Section tabs: real labels, they are the same on every university page */}
      <div className="mt-10 border-b border-line bg-white/90">
        <div className="container-page flex gap-7 overflow-hidden text-[15px] font-semibold whitespace-nowrap text-ink-600">
          {[t.tabAbout, t.tabPrograms, t.tabFees, t.tabApply, t.tabSimilar].map((tab) => (
            <span key={tab} className="border-b-2 border-transparent py-3.5">{tab}</span>
          ))}
        </div>
      </div>

      <div className="container-page mt-12 grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-14">
        <div className="min-w-0 space-y-16">
          <section>
            <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{t.about}</h2>
            <div className="mt-5 max-w-2xl">
              {["w-full", "w-[96%]", "w-[92%]", "w-[98%]", "w-[60%]"].map((w, i) => (
                <div key={i} className={`${line} h-[24.4px] sm:h-[26px]`}><Bone className={`h-3.5 ${w}`} /></div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t border-ink/15 pt-5">
              <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] sm:text-2xl">{t.programsTitle}</h2>
              <div className={`${line} h-5`}><Bone className="h-3.5 w-36" /></div>
            </div>
            <p className="mt-6 text-[13px] text-muted">{t.fieldsTitle}</p>
            <div className="mt-2 grid sm:grid-cols-2 sm:gap-x-8">
              {["w-36", "w-28", "w-40", "w-32"].map((w, i) => (
                <div key={i} className="flex h-[47.5px] items-center justify-between gap-4 border-b border-line">
                  <Bone className={`h-3.5 ${w}`} />
                  <Bone className="h-3 w-8" />
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <ProgramRowSkeleton key={i} hideUni discount={false} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-[18px] border border-ink/10 bg-white px-6 pt-5 pb-2">
            <p className="text-[13px] text-muted">{t.short}</p>
            <div className="mt-1">
              {[t.city, t.type, t.founded, t.programs, t.students, t.living].map((k, i) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line py-3 text-[15px] last:border-b-0">
                  <span className="text-ink-600">{k}</span>
                  <span className={`${line} h-[22.5px]`}><Bone className={`h-3.5 ${["w-32", "w-20", "w-12", "w-10", "w-14", "w-24"][i]}`} /></span>
                </div>
              ))}
            </div>
            <p className="-mx-6 mt-1 border-t border-line px-6 py-3.5 text-sm font-semibold text-brand">{t.website}</p>
          </div>
          <div className="rounded-[18px] bg-[#00235b] p-6">
            <p className="font-display text-lg font-semibold text-white sm:text-xl">{t.consultTitle}</p>
            <div className="mt-2">
              {["w-full", "w-[90%]", "w-[55%]"].map((w) => (
                <div key={w} className={`${line} h-[22.75px] sm:h-[24.4px]`}><Bone className={`${dark} h-3 ${w}`} /></div>
              ))}
            </div>
            <div className="mt-6 grid gap-2">
              <Bone className={`${dark} h-[46.5px] rounded-full`} />
              <Bone className={`${dark} h-[46.5px] rounded-full`} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
