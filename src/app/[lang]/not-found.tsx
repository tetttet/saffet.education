import { ButtonLink } from "@/components/ui";
import { SiteFrame } from "@/components/site-frame";
import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";

// Next adds noindex to 404 responses on its own.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.notFound.title };
}

// Lives outside (site) so it also catches unknown URLs (sent here by [...missing]), hence its own header and footer.
export default async function NotFound() {
  const { t, href } = await getI18n();
  return (
    <SiteFrame>
      <div className="container-page py-24 text-center">
        <div className="font-display text-6xl font-extrabold sm:text-7xl text-brand">404</div>
        <h1 className="mt-4 font-display text-2xl font-bold">{t.notFound.title}</h1>
        <p className="mt-2 text-muted">{t.notFound.text}</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href={href("/programs")}>{t.notFound.search}</ButtonLink>
          <ButtonLink href={href("/")} variant="outline">{t.notFound.home}</ButtonLink>
        </div>
      </div>
    </SiteFrame>
  );
}
