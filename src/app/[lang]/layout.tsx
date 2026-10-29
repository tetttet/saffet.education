import type { Metadata } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import { RevealObserver } from "@/components/motion";
import { fill, locales } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { catalogueVars, ogImage } from "@/lib/metadata";
import { site } from "@/lib/site";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"] });
const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"] });
// Space Grotesk has no Cyrillic, so Russian and Kazakh headings fall back to Manrope.
const manrope = Manrope({ variable: "--font-manrope", subsets: ["cyrillic", "cyrillic-ext"], weight: ["500", "600", "700", "800"] });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Defaults for every page; pages set their own canonical, alternates and share card through pageMetadata().
export async function generateMetadata(): Promise<Metadata> {
  const i18n = await getI18n();
  const { t, locale } = i18n;
  const description = fill(t.meta.description, catalogueVars(i18n));
  const images = [ogImage(locale)];
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: `%s · ${site.name}` },
    description,
    applicationName: site.name,
    openGraph: { type: "website", siteName: site.name, title: t.meta.title, description, images },
    twitter: { card: "summary_large_image", title: t.meta.title, description, images },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale } = await getI18n();
  return (
    // data-scroll-behavior: Next turns off the smooth scroll from globals.css while navigating, so a new page lands exactly at the top.
    <html lang={locale} data-brand="sky" data-scroll-behavior="smooth" className={`${inter.variable} ${space.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
