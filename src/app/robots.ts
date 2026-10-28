import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: locales.map((l) => `${site.url}/sitemap/${l}.xml`),
  };
}
