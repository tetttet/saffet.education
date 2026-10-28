import type { ReactNode } from "react";
import { label } from "@/lib/format";

type Item = { value: string; count?: number };

/** Single-choice filter rendered as a checkbox-style list (radio inputs, so one value per key). */
export function FilterList({
  name,
  title,
  allLabel,
  value,
  items,
  map,
  visible = 6,
  moreLabel,
}: {
  name: string;
  title: string;
  allLabel: string;
  value?: string;
  items: Item[];
  map?: Record<string, string>;
  visible?: number;
  moreLabel?: string;
}) {
  const option = (v: string, text: ReactNode, count?: number) => (
    <label key={v || "all"} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-ink hover:bg-surface">
      <input type="radio" name={name} value={v} defaultChecked={(value ?? "") === v} className="peer sr-only" />
      <span className="grid size-[18px] shrink-0 place-items-center rounded-[5px] border-[1.5px] border-[#c9ccd3] bg-white text-white peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30">
        <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
      </span>
      <span className="flex-1">{text}</span>
      {count != null && <span className="text-xs text-ink-400">{count.toLocaleString("en-US")}</span>}
    </label>
  );
  const head = items.slice(0, visible);
  const tail = items.slice(visible);
  // Keep the selected option visible even when it sits in the collapsed tail.
  const openTail = tail.some((i) => i.value === value);

  return (
    <fieldset className="border-t border-line pt-4">
      <legend className="sr-only">{title}</legend>
      <p className="mb-2 text-sm font-bold text-ink">{title}</p>
      {option("", allLabel)}
      {head.map((i) => option(i.value, map ? label(map, i.value) : i.value, i.count))}
      {tail.length > 0 && (
        <details open={openTail} className="group">
          <summary className="cursor-pointer list-none px-1 py-1.5 text-sm font-semibold text-brand group-open:hidden">
            {moreLabel} ({tail.length}) ⌄
          </summary>
          {tail.map((i) => option(i.value, map ? label(map, i.value) : i.value, i.count))}
        </details>
      )}
    </fieldset>
  );
}
