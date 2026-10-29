import { PageHead } from "@/components/page-head";
import { UniversityBrowserSkeleton } from "@/components/university-skeleton";
import { getI18n } from "@/i18n/server";

// The heading is static text, so the loading screen shows the real one; only the results are placeholders.
export default async function Loading() {
  const { t } = await getI18n();
  return (
    <>
      <PageHead t={t.universities} />
      <UniversityBrowserSkeleton />
    </>
  );
}
