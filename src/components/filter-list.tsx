import Link from "next/link";
import { label } from "@/lib/format";

type Item = { value: string; count?: number };

const Box = ({ on }: { on?: boolean }) => (
  <span
    className={`grid size-[18px] shrink-0 place-items-center rounded-[5px] border-[1.5px] text-white peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30 ${on ? "border-brand bg-brand" : "border-[#c9ccd3] bg-white"}`}
  >
    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
  </span>
);

/** Multi-choice filter: a checkbox per value, so several can be on at once. "All" clears the group. */
export function FilterList({
  name,
  title,
  allLabel,
  values = [],
  clearHref,
  items,
  map,
  visible = 6,
  moreLabel,
}: {
  name: string;
  title: string;
  allLabel: string;
  values?: string[];
  /** Current URL without this filter, for the "All" row. */
  clearHref: string;
  items: Item[];
  map?: Record<string, string>;
  visible?: number;
  moreLabel?: string;
}) {
  const row = "flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-ink hover:bg-surface";
  const option = (i: Item) => (
    <label key={i.value} className={row}>
      <input type="checkbox" name={name} value={i.value} defaultChecked={values.includes(i.value)} className="peer sr-only" />
      <Box />
      <span className="flex-1">{map ? label(map, i.value) : i.value}</span>
      {i.count != null && <span className="text-xs text-ink-400">{i.count.toLocaleString("en-US")}</span>}
    </label>
  );
  const head = items.slice(0, visible);
  const tail = items.slice(visible);
  // Keep selected options visible even when they sit in the collapsed tail.
  const openTail = tail.some((i) => values.includes(i.value));

  return (
    // Remount when the selection changes from outside (a removed chip, "All"), so the boxes match the URL.
    <fieldset key={values.join("|")} className="border-t border-line pt-4">
      <legend className="sr-only">{title}</legend>
      <p className="mb-2 text-sm font-bold text-ink">{title}</p>
      <Link href={clearHref} replace scroll={false} aria-current={values.length ? undefined : "true"} className={row}>
        <Box on={!values.length} />
        <span className="flex-1">{allLabel}</span>
      </Link>
      {head.map(option)}
      {tail.length > 0 && (
        <details open={openTail} className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1 px-1 py-1.5 text-sm font-semibold text-brand group-open:hidden">
            {moreLabel} ({tail.length})
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          {tail.map(option)}
        </details>
      )}
    </fieldset>
  );
}
