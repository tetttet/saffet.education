"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, type ComponentProps } from "react";

type NavLink = { href: string; label: string };

/**
 * Full-height menu sheet for phones and tablets: sections, contacts and the consultation button.
 * Reading the URL outside Suspense would block prerendering, so the server renders it without the active section.
 */
export function MobileNav(props: Omit<ComponentProps<typeof Sheet>, "pathname">) {
  return (
    <Suspense fallback={<Sheet {...props} pathname="" />}>
      <SheetWithPath {...props} />
    </Suspense>
  );
}

function SheetWithPath(props: Omit<ComponentProps<typeof Sheet>, "pathname">) {
  return <Sheet {...props} pathname={usePathname()} />;
}

function Sheet({
  links,
  cta,
  openLabel,
  closeLabel,
  contactsLabel,
  whatsapp,
  phone,
  pathname,
}: {
  links: NavLink[];
  cta: NavLink;
  openLabel: string;
  closeLabel: string;
  contactsLabel: string;
  whatsapp: NavLink;
  phone: string;
  pathname: string;
}) {
  // Remember the page the menu was opened on, so it closes by itself after navigation.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const close = () => setOpenOn(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    // Lock scrolling on <html>: it sets overflow-x itself (globals.css), so overflow on <body> alone has no effect.
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    root.dataset.menuOpen = "";
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = overflow;
      delete root.dataset.menuOpen;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div>
      <button
        type="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
        className="grid size-10 place-items-center rounded-xl border border-line text-ink transition hover:border-ink/20"
      >
        {/* Two bars that fold into a cross */}
        <span className="relative block h-2.5 w-[18px]" aria-hidden>
          <span className={`absolute left-0 h-[1.75px] w-full rounded-full bg-current transition duration-300 ${open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 h-[1.75px] w-full rounded-full bg-current transition duration-300 ${open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"}`} />
        </span>
      </button>

      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-white transition duration-200 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <nav className="px-5 pt-2">
          {links.map((item) => {
            const on = !item.href.includes("#") && pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                aria-current={on ? "page" : undefined}
                className={`flex items-center justify-between border-b border-line py-[18px] text-[22px] font-semibold tracking-[-0.01em] ${on ? "text-brand" : "text-ink"}`}
              >
                {item.label}
                {on && <span className="size-1.5 rounded-full bg-brand" aria-hidden />}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 pt-8 text-[15px]">
          <p className="text-muted">{contactsLabel}</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-[18px] font-semibold text-ink">
              {phone}
            </a>
            <a
              href={whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={whatsapp.label}
              title={whatsapp.label}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-[#25d366] text-white transition hover:scale-105"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-auto px-5 pt-6 pb-[max(20px,env(safe-area-inset-bottom))]">
          <Link href={cta.href} onClick={close} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-[16px] font-semibold text-white transition hover:bg-brand-dark">
            {cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
