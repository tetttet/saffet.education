"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { localeNames, locales, type Locale } from "@/i18n/config";

/** Round flag for each locale, drawn inline so it stays sharp and needs no requests. */
function Flag({ locale, className = "size-5" }: { locale: Locale; className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-ink-900/10 ${className}`} aria-hidden>
      <svg viewBox="0 0 30 30" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
        {locale === "ru" && (
          <>
            <rect width="30" height="10" fill="#fff" />
            <rect y="10" width="30" height="10" fill="#0039a6" />
            <rect y="20" width="30" height="10" fill="#d52b1e" />
          </>
        )}
        {locale === "az" && (
          <>
            <rect width="30" height="10" fill="#00b5e2" />
            <rect y="10" width="30" height="10" fill="#ef3340" />
            <rect y="20" width="30" height="10" fill="#509e2f" />
            <circle cx="14" cy="15" r="3.4" fill="#fff" />
            <circle cx="14.9" cy="15" r="2.75" fill="#ef3340" />
            <path d="m18.4 13.6.37.9.97.07-.74.62.23.95-.83-.51-.83.51.23-.95-.74-.62.97-.07z" fill="#fff" />
          </>
        )}
        {locale === "en" && (
          <>
            <rect width="30" height="30" fill="#012169" />
            <path d="M0 0l30 30M30 0 0 30" stroke="#fff" strokeWidth="6" />
            <path d="M0 0l30 30M30 0 0 30" stroke="#c8102e" strokeWidth="2" />
            <path d="M15 0v30M0 15h30" stroke="#fff" strokeWidth="10" />
            <path d="M15 0v30M0 15h30" stroke="#c8102e" strokeWidth="6" />
          </>
        )}
        {locale === "tr" && (
          <>
            <rect width="30" height="30" fill="#e30a17" />
            <circle cx="12.5" cy="15" r="6" fill="#fff" />
            <circle cx="14" cy="15" r="4.8" fill="#e30a17" />
            <path d="M16.80 15.00 18.67 14.32 18.73 12.34 19.96 13.91 21.87 13.35 20.75 15.00 21.87 16.65 19.96 16.09 18.73 17.66 18.67 15.68z" fill="#fff" />
          </>
        )}
        {locale === "kk" && (
          <>
            <rect width="30" height="30" fill="#00afca" />
            <circle cx="15" cy="13" r="4" fill="#fec50c" />
            <circle cx="15" cy="13" r="6.2" fill="none" stroke="#fec50c" strokeWidth="1.2" strokeDasharray="1.4 1.2" />
            <path d="M8 21.5c3 1.6 4.8.6 7 .6s4-1 7-.6c-2.2 1.8-4.6 2.3-7 2.3s-4.8-.5-7-2.3z" fill="#fec50c" />
          </>
        )}
        {locale === "zh" && (
          <>
            <rect width="30" height="30" fill="#de2910" />
            <path d="m10 6.5 1.18 3.63h3.82l-3.09 2.24 1.18 3.63L10 13.76 6.91 16l1.18-3.63L5 10.13h3.82z" fill="#ffde00" />
            <circle cx="16.5" cy="6" r="1" fill="#ffde00" />
            <circle cx="18.5" cy="9" r="1" fill="#ffde00" />
            <circle cx="18.5" cy="12.5" r="1" fill="#ffde00" />
            <circle cx="16.5" cy="15.5" r="1" fill="#ffde00" />
          </>
        )}
        {locale === "es" && (
          <>
            <rect width="30" height="30" fill="#aa151b" />
            <rect y="7.5" width="30" height="15" fill="#f1bf00" />
          </>
        )}
        {locale === "fr" && (
          <>
            <rect width="10" height="30" fill="#002654" />
            <rect x="10" width="10" height="30" fill="#fff" />
            <rect x="20" width="10" height="30" fill="#ce1126" />
          </>
        )}
      </svg>
    </span>
  );
}

/** Flag dropdown. Swaps the first path segment and keeps the query string. */
export function LanguageSwitcher({ locale, label, compact = false }: { locale: Locale; label: string; compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function change(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    const { pathname, search, hash } = window.location;
    router.push(`/${next}${pathname.replace(/^\/[^/]+/, "")}${search}${hash}`);
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`flex h-10 items-center gap-2 rounded-full border bg-white pr-2.5 pl-2 text-[13px] font-bold tracking-wide text-ink transition ${open ? "border-brand/40 ring-3 ring-brand-soft" : "border-line hover:border-ink/20"}`}
      >
        <Flag locale={locale} className="size-6" />
        {!compact && <span>{locale.toUpperCase()}</span>}
        <svg viewBox="0 0 24 24" className={`size-3 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <ul
        role="listbox"
        aria-label={label}
        className={`absolute right-0 top-[calc(100%+8px)] z-50 w-48 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-lift transition duration-200 ease-out ${open ? "visible scale-100 opacity-100" : "invisible scale-95 -translate-y-1 opacity-0"}`}
      >
        {locales.map((l) => {
          const on = l === locale;
          return (
            <li key={l} role="option" aria-selected={on}>
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                onClick={() => change(l)}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm font-semibold transition ${on ? "bg-brand-soft text-brand" : "text-ink hover:bg-surface"}`}
              >
                <Flag locale={l} className="size-6" />
                <span className="flex-1">{localeNames[l]}</span>
                {on && (
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
