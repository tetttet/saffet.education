import { Suspense } from "react";
import { ActiveChipsSkeleton } from "./active-chips-skeleton";
import { Bone } from "./skeleton";
import { facet } from "@/lib/data";

// Rows and lines below are given the exact heights of the real ones (FilterList, ProgramRow), so bones of any size sit inside them.
const box = "size-[18px] shrink-0 rounded-[5px]";
const filterRow = "flex h-8 items-center gap-2.5 px-1";
const title = "mb-2 flex h-5 items-center";

/** One FilterList while loading: title, the "All" row, the visible options and the "show more" line, row for row. */
function FilterGroup({ rows, more }: { rows: number; more: boolean }) {
  return (
    <div className="border-t border-line pt-4">
      <div className={title}><Bone className="h-3.5 w-24" /></div>
      {Array.from({ length: rows + 1 }, (_, i) => (
        <div key={i} className={filterRow}>
          <Bone className={box} />
          <Bone className={`h-3.5 ${i === 0 ? "w-12" : ["w-28", "w-20", "w-32", "w-24"][i % 4]}`} />
          {i > 0 && <Bone className="ml-auto h-3 w-8" />}
        </div>
      ))}
      {more && <div className={filterRow}><Bone className="h-3.5 w-36" /></div>}
    </div>
  );
}

/** A select under a bold label (university, max price). */
function SelectGroup() {
  return (
    <div className="border-t border-line pt-4">
      <div className={title}><Bone className="h-3.5 w-28" /></div>
      <div className="flex h-11 items-center justify-between rounded-[10px] border border-[#e3e6ea] bg-white px-[0.9rem]">
        <Bone className="h-3.5 w-16" />
        <Bone className="size-3 rounded-sm" />
      </div>
    </div>
  );
}

const Icon = () => <Bone className="size-4 shrink-0 rounded-full" />;

/** One ProgramRow while loading: photo, degree badge + field, title, university line, language and years, price column. `hideUni` as on ProgramRow; `discount` adds the badge and struck-out price. */
export function ProgramRowSkeleton({ hideUni = false, discount = true }: { hideUni?: boolean; discount?: boolean }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-white sm:flex-row">
      {!hideUni && <Bone className="h-36 shrink-0 rounded-none sm:h-auto sm:w-48" />}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
        <div className="flex h-[23.5px] items-center gap-2">
          <Bone className="h-full w-24" />
          <Bone className="h-3 w-28" />
        </div>
        <div className="flex h-[24.75px] items-center"><Bone className="h-[18px] w-[min(420px,85%)]" /></div>
        {!hideUni && (
          <div className="flex h-5 items-center gap-1.5">
            <Icon />
            <Bone className="h-3.5 w-[min(260px,70%)]" />
          </div>
        )}
        <div className="mt-auto flex h-[23.5px] items-center gap-4 pt-1">
          <span className="flex items-center gap-1.5"><Icon /><Bone className="h-3 w-16" /></span>
          <span className="flex items-center gap-1.5"><Icon /><Bone className="h-3 w-12" /></span>
        </div>
      </div>
      <div className="flex shrink-0 items-end justify-between gap-4 border-t border-ink/10 p-5 sm:w-48 sm:flex-col sm:items-end sm:border-t-0 sm:border-l">
        <div className="flex flex-col items-end">
          {/* The real discount badge is inline-block, so its line is 23.5px tall, not 20 */}
          {discount && (
            <>
              <div className="mb-1.5 h-[23.5px]"><Bone className="h-5 w-11" /></div>
              <div className="flex h-4 items-center"><Bone className="h-2.5 w-12" /></div>
            </>
          )}
          <div className="flex h-7 items-center"><Bone className="h-5 w-24" /></div>
        </div>
        <div className="flex h-5 items-center"><Bone className="h-3.5 w-24" /></div>
      </div>
    </div>
  );
}

/**
 * /programs results while loading: the filter sidebar (a "Filters" bar on phones) and the result list,
 * built from the same boxes as the real page so nothing shifts when it arrives.
 * Each filter group gets exactly as many rows as the real one shows (visible counts as in programs/page.tsx).
 */
export function ProgramsSkeleton({ rows = 5 }: { rows?: number }) {
  const group = (key: "city" | "degree" | "language" | "field", visible = 6) => {
    const n = facet(key).length;
    return <FilterGroup rows={Math.min(n, visible)} more={n > visible} />;
  };
  return (
    <div className="container-page grid gap-6 pt-2 lg:grid-cols-[290px_1fr] lg:gap-8" aria-busy aria-hidden>
      <aside className="-mx-4 px-4 py-2 sm:-mx-8 sm:px-8 lg:m-0 lg:p-0">
        <div className="flex h-12 items-center justify-between rounded-xl border border-ink/15 bg-white px-4 lg:hidden">
          <span className="flex items-center gap-2"><Icon /><Bone className="h-4 w-20" /></span>
          <Bone className="size-[18px] rounded-full" />
        </div>
        <div className="hidden space-y-4 overflow-hidden rounded-[18px] border border-ink/10 bg-white p-5 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)]">
          <div className="flex h-6 items-center justify-between">
            <span className="flex items-center gap-2"><Icon /><Bone className="h-4 w-20" /></span>
            <Bone className="h-3.5 w-16" />
          </div>
          {group("city")}
          {group("degree")}
          {group("language", 3)}
          {group("field", 5)}
          <SelectGroup />
          <SelectGroup />
          <div className="flex h-[37px] items-center gap-2.5 border-t border-line pt-4">
            <Bone className={box} />
            <Bone className="h-3.5 w-44" />
          </div>
        </div>
      </aside>

      <section className="min-w-0 space-y-5">
        <div className="flex h-12 items-center gap-3 rounded-xl border border-ink/15 bg-white px-4">
          <Bone className="size-5 rounded-full" />
          <Bone className="h-3.5 w-56" />
        </div>
        <div className="flex h-11 items-center justify-between gap-3">
          <Bone className="h-4 w-40" />
          <Bone className="h-11 w-44 rounded-full" />
        </div>
        <Suspense>
          <ActiveChipsSkeleton />
        </Suspense>
        <div className="space-y-4">
          {Array.from({ length: rows }, (_, i) => (
            <ProgramRowSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
