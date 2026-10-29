"use client";

import { useEffect, useRef, useState } from "react";

// Below lg the tabs don't fit and scroll sideways, so there they follow the page; on desktop they stay plain links.
const MOBILE = "(max-width: 1023.98px)";
// A section counts as current once its heading passes under the site header (64px) and this bar (~54px).
const LINE = 130;

/**
 * Section links of a university page, sticky under the header.
 * On phones and tablets the tab of the section being read is underlined and slid into view as the page scrolls.
 */
export function SectionTabs({ tabs }: { tabs: [id: string, label: string][] }) {
  const [active, setActive] = useState(tabs[0]?.[0]);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE);
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = tabs[0]?.[0];
      for (const [id] of tabs) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= LINE) current = id;
      }
      // The last section may be too short to reach the line: at the very bottom it is the current one.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = tabs.at(-1)?.[0] ?? current;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const toggle = () => {
      window.removeEventListener("scroll", onScroll);
      if (mq.matches) {
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
      }
    };
    toggle();
    mq.addEventListener("change", toggle);
    return () => {
      mq.removeEventListener("change", toggle);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [tabs]);

  // Keep the current tab centred in the sideways-scrolling bar.
  useEffect(() => {
    const bar = nav.current;
    const link = bar?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!bar || !link || !window.matchMedia(MOBILE).matches) return;
    bar.scrollTo({ left: link.offsetLeft - (bar.clientWidth - link.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav ref={nav} className="container-page flex gap-7 overflow-x-auto text-[15px] font-semibold whitespace-nowrap [scrollbar-width:none]">
      {tabs.map(([id, text]) => (
        <a
          key={id}
          href={`#${id}`}
          data-tab={id}
          data-active={id === active || undefined}
          className="border-b-2 border-transparent py-3.5 text-ink-600 transition-colors hover:border-brand hover:text-ink max-lg:data-active:border-brand max-lg:data-active:text-ink"
        >
          {text}
        </a>
      ))}
    </nav>
  );
}
