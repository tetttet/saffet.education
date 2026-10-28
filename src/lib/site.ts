// Contact details. Replace placeholders with real ones.
export const site = {
  name: "Saffet Education",
  // Public address used in canonical links, hreflang, Open Graph and the sitemap.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://saffet.education",
  phone: "+90 500 000 00 00",
  whatsapp: "905000000000",
  email: "info@saffet.education",
  instagram: "https://instagram.com/",
  telegram: "https://t.me/",
  // City photos in /public/cities (free photos from Unsplash). Cities missing here get a drawn cover.
  cityImages: {
    Istanbul: "/cities/istanbul.jpg",
    Ankara: "/cities/ankara.jpg",
    Izmir: "/cities/izmir.jpg",
    Antalya: "/cities/antalya.jpg",
    Trabzon: "/cities/trabzon.jpg",
  } as Record<string, string>,
};

export const navItems = [
  { href: "/programs", key: "programs" },
  { href: "/universities", key: "universities" },
  { href: "/#how", key: "how" },
  { href: "/#cities", key: "cities" },
] as const;

export const whatsappLink = (text: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
