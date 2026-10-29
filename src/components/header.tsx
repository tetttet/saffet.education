import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "./logo";
import { NavLinks, NavList } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { LanguageSwitcher } from "./language-switcher";
import { ProgramsMenu } from "./programs-menu";
import { getI18n } from "@/i18n/server";
import { navItems, site, whatsappLink } from "@/lib/site";

export async function Header() {
  const { t, locale, href } = await getI18n();
  const links = navItems.map((item) => ({ href: href(item.href), label: t.nav[item.key] }));
  const consult = { href: href("/apply"), label: t.nav.consult };
  const menus = { [href("/programs")]: <ProgramsMenu /> };

  return (
    <header className="header-scroll sticky top-0 z-40 border-b border-line">
      {/* Blur on its own layer: backdrop-filter on the header itself would trap the fixed mobile menu inside it */}
      <span className="absolute inset-0 -z-10 bg-white/96 backdrop-blur-md" aria-hidden />
      <div className="mx-auto flex h-16 max-w-345 items-center justify-between gap-4 px-4 sm:px-8 lg:px-16">
        <div className="flex items-center gap-8">
          <Logo href={href("/")} />
          <nav className="hidden h-16 items-stretch lg:flex">
            <Suspense fallback={<NavList links={links} menus={menus} />}>
              <NavLinks links={links} menus={menus} />
            </Suspense>
          </nav>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} label={t.nav.language} />
          <Link
            href={consult.href}
            className="btn-shine inline-flex h-10 items-center rounded-[9px] bg-linear-to-br from-[var(--brand-glow,#2a7dff)] to-brand-deep px-5 text-[14px] font-bold text-white shadow-[0_8px_18px_color-mix(in_srgb,var(--color-brand)_20%,transparent)] transition hover:brightness-110"
          >
            {consult.label}
          </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher locale={locale} label={t.nav.language} compact />
          <MobileNav
            links={links}
            cta={consult}
            openLabel={t.nav.openMenu}
            closeLabel={t.nav.closeMenu}
            contactsLabel={t.footer.contacts}
            whatsapp={{ href: whatsappLink(t.whatsapp.hello), label: t.whatsapp.label }}
            phone={site.phone}
          />
        </div>
      </div>
    </header>
  );
}
