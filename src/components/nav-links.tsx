"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

type NavLink = { href: string; label: string };
/** Dropdown panels keyed by the link href they belong to. */
type Menus = Partial<Record<string, ReactNode>>;

/** Desktop menu with an underline under the section the visitor is in. */
export function NavLinks({ links, menus }: { links: NavLink[]; menus?: Menus }) {
  const pathname = usePathname();
  return <NavList links={links} menus={menus} pathname={pathname} active={(href) => !href.includes("#") && pathname.startsWith(href)} />;
}

/**
 * Same menu without the active state, used as the server-rendered fallback.
 * It must not read the URL itself (that would block prerendering outside Suspense), so NavLinks passes the path in.
 */
export function NavList({
  links,
  menus = {},
  active = () => false,
  pathname = "",
}: {
  links: NavLink[];
  menus?: Menus;
  active?: (href: string) => boolean;
  pathname?: string;
}) {
  // Remember the page the menu was opened on, so it closes by itself after navigation.
  const [state, setState] = useState<{ href: string; path: string } | null>(null);
  const openHref = state?.path === pathname ? state.href : null;
  const setOpenHref = (href: string | null) => setState(href ? { href, path: pathname } : null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setState(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Small delays so the panel doesn't flicker when the pointer crosses the gap.
  const show = (href: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenHref(href), openHref ? 0 : 90);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenHref(null), 160);
  };

  return (
    <>
      {links.map((item) => {
        const on = active(item.href);
        const menu = menus[item.href];
        const open = openHref === item.href;
        const link = (
          <Link
            href={item.href}
            aria-current={on ? "page" : undefined}
            onClick={() => setOpenHref(null)}
            className={`relative flex items-center gap-1 px-[13px] text-sm font-semibold transition hover:text-brand ${on || open ? "text-brand" : "text-ink"}`}
          >
            {item.label}
            {menu && (
              <svg viewBox="0 0 24 24" className={`size-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            )}
            {on && <span className="absolute inset-x-[13px] bottom-0 h-[3px] rounded-t-full bg-brand" aria-hidden />}
          </Link>
        );
        if (!menu) return <span key={item.href} className="flex">{link}</span>;

        return (
          <div
            key={item.href}
            className="flex"
            onMouseEnter={() => show(item.href)}
            onMouseLeave={hide}
            onFocus={() => show(item.href)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && hide()}
          >
            {link}
            <div
              data-open={open || undefined}
              className={`mega-panel absolute inset-x-0 top-full z-40 flex justify-center px-4 pt-2 sm:px-8 lg:px-16 ${open ? "visible" : "invisible"}`}
            >
              {/* Same width as the header's content, so the panel lines up with the logo and the consultation button */}
              <div className="w-full max-w-[1252px] overflow-hidden rounded-[20px] border border-ink/10 bg-white shadow-[0_24px_48px_-28px_#0b163033]">
                {menu}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
