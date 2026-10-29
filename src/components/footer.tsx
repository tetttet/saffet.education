import Link from "next/link";
import { Logo } from "./logo";
import { CountUp } from "./motion";
import { getI18n } from "@/i18n/server";
import { totals } from "@/lib/data";
import { reveal } from "@/lib/reveal";
import { site, whatsappLink } from "@/lib/site";

export async function Footer() {
  const { t, locale, href } = await getI18n();
  const h = t.home;
  const columns = [
    {
      title: t.footer.explore,
      links: [
        { href: href("/programs"), label: t.footer.allPrograms },
        { href: href("/universities"), label: t.nav.universities },
        { href: href("/programs?language=English"), label: t.footer.english },
        { href: href("/programs?degree=Master%27s+Degree"), label: t.footer.masters },
      ],
    },
    {
      title: t.footer.cities,
      links: Object.entries(t.labels.city).map(([en, name]) => ({ href: href(`/universities?city=${en}`), label: name })),
    },
    {
      title: t.footer.students,
      links: [
        { href: href("/#how"), label: t.nav.how },
        { href: href("/#faq"), label: t.footer.faq },
        { href: href("/apply"), label: t.footer.apply },
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

      <footer className="mt-14 border-t border-ink/10 bg-[#f3f5f9] text-ink sm:mt-20">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-8 lg:px-16">
          <div className="grid gap-10 py-14 md:grid-cols-[1.6fr_repeat(4,1fr)]">
            <div className="space-y-5">
              <Logo href={href("/")} />
              <p className="max-w-xs text-[13px] leading-relaxed text-muted">{t.footer.tagline}</p>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-[13px] font-semibold text-ink">{col.title}</h3>
                <ul className="space-y-2.5 text-[13px] text-muted">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="transition hover:text-brand">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="mb-4 text-[13px] font-semibold text-ink">{t.footer.contacts}</h3>
              <ul className="space-y-2.5 text-[13px] text-muted">
                <li><a className="transition hover:text-brand" href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a></li>
                <li><a className="transition hover:text-brand" href={whatsappLink(t.whatsapp.hello)} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
                <li><a className="transition hover:text-brand" href={site.telegram} target="_blank" rel="noopener noreferrer">Telegram</a></li>
                <li><a className="transition hover:text-brand" href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a className="transition hover:text-brand" href={`mailto:${site.email}`}>{site.email}</a></li>
              </ul>
            </div>
          </div>

          {/* Notice */}
          <div className="border-t border-ink/10 py-6">
            <p className="max-w-4xl text-xs leading-relaxed text-muted">
              <b className="font-semibold text-ink">{t.footer.noticeTitle}.</b> {t.footer.notice} {t.footer.note}
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-ink/10 py-6 text-xs text-muted sm:flex-row sm:justify-between">
            <span>© {site.name}</span>
            <a className="transition hover:text-brand" href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
