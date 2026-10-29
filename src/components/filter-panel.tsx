import type { ReactNode } from "react";

/**
 * Filters panel (CSS-only toggle, no JS).
 * Phones: a "Filters" bar that sticks under the header; tapping it opens the filters as a bottom sheet over a dimmed page.
 * From lg: a sidebar that stays next to the results while scrolling.
 */
export function FilterPanel({ id, title, count, children }: { id: string; title: string; count: number; children: ReactNode }) {
  return (
    <aside className="sticky top-16 z-30 -mx-4 has-[>.peer:checked]:z-[60] bg-white px-4 py-2 sm:-mx-8 sm:px-8 lg:static lg:z-auto lg:m-0 lg:bg-transparent lg:p-0">
      <input type="checkbox" id={id} className="peer sr-only" />
      <label
        htmlFor={id}
        className="flex h-12 cursor-pointer items-center justify-between rounded-xl border border-ink/15 bg-white px-4 font-semibold lg:hidden"
      >
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
          {title}
          {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] text-white">{count}</span>}
        </span>
        <svg viewBox="0 0 24 24" className="size-[18px] shrink-0 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </label>
      {/* Tapping the dimmed page closes the sheet */}
      <label htmlFor={id} className="fixed inset-0 z-40 hidden bg-ink-900/40 peer-checked:block lg:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-50 hidden max-h-[85dvh] space-y-4 overflow-y-auto rounded-t-[20px] bg-white p-5 pb-8 peer-checked:block lg:sticky lg:top-24 lg:z-auto lg:block lg:max-h-[calc(100dvh-7rem)] lg:rounded-[18px] lg:border lg:border-ink/10 lg:pb-5">
        {children}
      </div>
    </aside>
  );
}
