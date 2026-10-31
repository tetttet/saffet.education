import { localize, type Locale } from "@/i18n/config";
import { site } from "@/lib/site";

/** Structured data for search engines. `<` is escaped so a text in the data cannot close the script tag. */
export function JsonLd({ data }: { data: object | object[] }) {
  const graph = [data].flat().map((item) => ({ "@context": "https://schema.org", ...item }));
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />;
}

export const absoluteUrl = (path: string) => new URL(path, site.url).toString();

/** The path of links above a page: pairs of name and app path, the page itself last. */
export function breadcrumbs(locale: Locale, items: [name: string, path: string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: absoluteUrl(localize(locale, path)),
    })),
  };
}
