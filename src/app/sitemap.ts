import type { MetadataRoute } from "next";
import { localize, locales, type Locale } from "@/i18n/config";
import { programs, universities } from "@/lib/data";
import { languageAlternates } from "@/lib/metadata";
import { site } from "@/lib/site";

// One sitemap per language (/sitemap/ru.xml, ...), each entry listing its versions in the other languages.
// The ad landing page /form is left out on purpose.
export async function generateSitemaps() {
  return locales.map((id) => ({ id }));
}

const absolute = (path: string) => new URL(path, site.url).toString();

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const locale = (await id) as Locale;
  const paths = [
    "/",
    "/programs",
    "/universities",
    "/apply",
    ...universities.map((u) => `/universities/${u.slug}`),
    ...programs.map((p) => `/programs/${p.id}`),
  ];
  return paths.map((path) => ({
    url: absolute(localize(locale, path)),
    alternates: { languages: Object.fromEntries(Object.entries(languageAlternates(path)).map(([lang, href]) => [lang, absolute(href)])) },
  }));
}
