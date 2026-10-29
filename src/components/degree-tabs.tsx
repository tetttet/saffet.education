"use client";

import { useState, type ReactNode } from "react";

/** Left column of study levels that switches the panel on the right on hover or focus.
 *  The last hovered level stays shown, so the pointer can travel over to its programmes. */
export function DegreeTabs({ heading, footer, items, initial }: { heading: ReactNode; footer: ReactNode; initial?: string; items: { key: string; trigger: ReactNode; panel: ReactNode }[] }) {
  const [active, setActive] = useState(initial ?? items[0]?.key);
  const current = items.find((i) => i.key === active) ?? items[0];

  return (
    <div className="grid grid-cols-[300px_1fr]">
      <div className="flex flex-col border-r border-ink/10 p-5">
        {heading}
        <ul className="mt-2 flex flex-col">
          {items.map((i) => (
            <li key={i.key} data-active={i.key === current?.key || undefined} onMouseEnter={() => setActive(i.key)} onFocus={() => setActive(i.key)}>
              {i.trigger}
            </li>
          ))}
        </ul>
        {footer}
      </div>
      <div key={current?.key} className="mega-swap p-5">
        {current?.panel}
      </div>
    </div>
  );
}
