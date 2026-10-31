import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites-view";
import { PageHead } from "@/components/page-head";
import { getI18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/metadata";

// Each visitor's own list, so it stays out of search results and the sitemap.
export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  return pageMetadata({ locale, path: "/favorites", title: t.favorites.title, description: t.favorites.lead, noindex: true });
}

export default async function FavoritesPage() {
  const { t, locale } = await getI18n();
  const f = t.favorites;
  return (
    <>
      <PageHead t={{ eyebrow: t.nav.favorites, titleStart: f.title, titleMarker: "", lead: f.lead }} />
      <FavoritesView
        locale={locale}
        t={f}
        labels={{
          university: t.programs.university,
          city: t.programs.city,
          level: t.program.level,
          language: t.program.language,
          duration: t.program.duration,
          fee: t.program.fee,
          perYear: t.common.perYear,
          onRequest: t.common.onRequest,
          intake: t.program.intake,
          deadline: t.program.deadline,
          askConsultant: t.program.askConsultant,
          open: t.program.open,
          closed: t.program.closed,
          apply: t.program.apply,
        }}
      />
    </>
  );
}
