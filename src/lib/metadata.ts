// Head tags shared by every page: canonical link, hreflang alternates, Open Graph and Twitter cards.
import type { Metadata } from "next";
import { intlLocale, locales, localize, type Locale } from "@/i18n/config";
import type { I18n } from "@/i18n/server";
import { totals } from "@/lib/data";
import { num, plural, usd } from "@/lib/format";
import { site } from "@/lib/site";

/** 1200×630 link-preview card in the page's language: logo, slogan, headline, photo. Built by `npm run og`. */
export const ogImage = (locale: Locale) => ({ url: `/og/${locale}.jpg`, width: 1200, height: 630, alt: site.name });

/** "kk" -> "kk_KZ", "az" -> "az_AZ": the language_TERRITORY form Open Graph expects. */
const ogLocale = (locale: Locale) => {
  const parts = intlLocale[locale].split("-");
  return `${parts[0]}_${parts.at(-1)}`;
};

/**
 * Same path in every language, plus x-default: the unprefixed path, which the proxy sends to the
 * visitor's language.
 */
export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(locales.map((l) => [l, localize(l, path)])),
    "x-default": path,
  };
}

type PageMeta = {
  locale: Locale;
  /** App path without the locale, e.g. "/programs". */
  path: string;
  /** Page title; the layout adds " · Saffet Education" unless it is `{ absolute }`. */
  title: string | { absolute: string };
  description: string;
  /** Kept out of search results (ad landing pages). */
  noindex?: boolean;
};

export function pageMetadata({ locale, path, title, description, noindex }: PageMeta): Metadata {
  const url = localize(locale, path);
  const shareTitle = typeof title === "string" ? title : title.absolute;
  const images = [ogImage(locale)];
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: ogLocale(locale),
      alternateLocale: locales.filter((l) => l !== locale).map(ogLocale),
      url,
      title: shareTitle,
      description,
      images,
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}

/** Catalogue figures the home and catalogue descriptions quote. */
export function catalogueVars({ t, locale }: I18n) {
  return {
    programsCount: plural(totals.programs, locale, t.home.programsWords),
    unisCount: plural(totals.universities, locale, t.home.unisWords),
    unis: num(totals.universities, locale),
    min: usd(totals.minFee),
  };
}
