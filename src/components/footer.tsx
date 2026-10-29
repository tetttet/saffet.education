import Link from "next/link";
import { IconInstagram, IconMail, IconPhone, IconWhatsApp } from "./icons";
import { Logo } from "./logo";
import { CountUp } from "./motion";
import { getI18n } from "@/i18n/server";
import { totals } from "@/lib/data";
import { reveal } from "@/lib/reveal";
import { site, whatsappLink } from "@/lib/site";

export async function Footer() {
  const { t, locale, href } = await getI18n();
  const h = t.home;
  const linkClass = "block max-w-70 text-[14px] leading-tight text-[#3a3a3a] transition-opacity hover:opacity-70";
  const columns: { title: string; links: { href: string; label: string; external?: boolean; icon?: React.ReactNode }[] }[] = [
    {
      title: t.footer.explore,
      links: [
        { href: href("/programs"), label: t.footer.allPrograms },
        { href: href("/universities"), label: t.nav.universities },
        { href: href("/programs?language=English"), label: t.footer.english },
        { href: href("/programs?degree=Master%27s+Degree"), label: t.footer.masters },
        { href: href("/#how"), label: t.nav.how },
        { href: href("/#faq"), label: t.footer.faq },
        { href: href("/apply"), label: t.footer.apply },
      ],
    },
    {
      title: t.footer.cities,
      links: Object.entries(t.labels.city).map(([en, name]) => ({ href: href(`/universities?city=${en}`), label: name })),
    },
    {
      title: t.footer.contacts,
      links: [
        { href: `tel:${site.phone.replace(/\s/g, "")}`, label: site.phone, external: true, icon: <IconPhone className="size-[18px] text-ink-600" /> },
        { href: whatsappLink(t.whatsapp.hello), label: "WhatsApp", external: true, icon: <IconWhatsApp className="size-[18px] text-[#25d366]" /> },
        { href: site.instagram, label: "Instagram", external: true, icon: <IconInstagram className="size-[18px] text-[#e1306c]" /> },
        { href: `mailto:${site.email}`, label: site.email, external: true, icon: <IconMail className="size-[18px] text-ink-600" /> },
      ],
    },
  ];

  const openShare = Math.round((totals.open / totals.programs) * 100);

  return (
    <>
      {/* Navy banner above the footer: text on the left, a ring chart cut off by the card edges on the right. */}
      <section className="mx-auto mt-14 w-full max-w-[1380px] px-4 sm:mt-20 sm:px-8 lg:px-16">
        <div {...reveal} className="group/cta relative overflow-hidden rounded-[24px] bg-[#00235b] text-white">
          <div className="relative z-10 px-6 pt-8 pb-60 sm:max-w-[60%] sm:px-9 sm:py-7 lg:py-8">
            <h2 className="font-display text-[20px] leading-snug font-semibold sm:text-[26px]">
              {h.ctaTitleStart} {h.ctaTitleMarker}
            </h2>
            <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-white/85 sm:text-[17px]">{h.ctaText}</p>
            <Link href={href("/programs")} className="group mt-6 inline-flex items-center gap-2 text-[15px] font-semibold">
              {h.ctaSearch}
              <svg viewBox="0 0 24 24" className="size-[18px] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          {/* Ring: light track, a blue-to-green arc that draws itself on reveal, dotted inner ring, navy centre with the number */}
          <div className="absolute -right-10 -bottom-14 size-[280px] sm:top-1/2 sm:-right-5 sm:bottom-auto sm:size-[250px] sm:-translate-y-1/2" aria-hidden>
            <svg viewBox="0 0 220 220" className="size-full">
              <defs>
                <linearGradient id="cta-ring" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#00d49a" />
                  <stop offset="0.45" stopColor="#17b4d2" />
                  <stop offset="1" stopColor="#3d7bff" />
                </linearGradient>
              </defs>
              <circle cx="110" cy="110" r="107" fill="none" stroke="#14c9a4" strokeWidth="1.2" />
              <circle cx="110" cy="110" r="73" fill="none" stroke="#e8eef8" strokeWidth="58" />
              <circle
                cx="110"
                cy="110"
                r="73"
                fill="none"
                stroke="url(#cta-ring)"
                strokeWidth="58"
                pathLength="100"
                strokeDasharray={`${openShare} 100`}
                strokeDashoffset={openShare}
                transform={`rotate(${(100 - openShare) * 3.6 - 90} 110 110)`}
                className="transition-[stroke-dashoffset] duration-[1600ms] ease-out group-data-shown/cta:[stroke-dashoffset:0] motion-reduce:transition-none"
              />
              <circle cx="110" cy="110" r="66" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0.1 4.2" />
              <circle cx="110" cy="110" r="44" fill="#00235b" />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-[28px] leading-none font-bold sm:text-[34px]">
                  <CountUp value={openShare} locale={locale} />%
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-wide text-white/70">{h.ctaStatLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer laid out like 4pupils: logo + tagline and fine print on the left, three link columns on the right. */}
      <footer className="mt-14 w-full bg-[#f0f0f0] text-[#2f2f2f] sm:mt-20">
        <div className="mx-auto max-w-[1380px] px-4 pt-14 pb-16 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-20">
            <div className="flex h-full max-w-180 flex-col">
              <div className="space-y-3">
                <Logo href={href("/")} />
                <p className="max-w-sm text-[12px] leading-snug text-[#8b8b8b]">{t.footer.tagline}</p>
              </div>

              <div className="mt-auto max-w-160 space-y-6 pt-10 text-[11px] leading-[1.45] text-[#444]">
                <p>{t.footer.about}</p>
                <p>
                  <b className="font-semibold">{t.footer.noticeTitle}.</b> {t.footer.notice} {t.footer.note} © 2026 {site.name}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
              {columns.map((col) => (
                <div key={col.title} className="min-w-0">
                  <h3 className="mb-6 text-[16px] leading-none font-medium text-[#7d7d7d]">{col.title}</h3>
                  <ul className="space-y-3">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        {l.external ? (
                          <a
                            href={l.href}
                            className={`${l.icon ? linkClass.replace("block", "flex items-center gap-2.5") : linkClass} break-words`}
                            {...(l.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                          >
                            {l.icon && <span className="shrink-0">{l.icon}</span>}
                            <span className="min-w-0">{l.label}</span>
                          </a>
                        ) : (
                          <Link href={l.href} className={linkClass}>{l.label}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
