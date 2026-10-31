import type { Metadata } from "next";
import Image from "next/image";
import { LeadForm } from "@/components/lead-form";
import { getI18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/metadata";

// An ad landing page: it gets a share card for messengers but stays out of search results.
export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  return pageMetadata({ locale, path: "/form", title: t.leadForm.metaTitle, description: t.leadForm.metaDescription, noindex: true });
}

/** Bare landing form for ads: logo and the form only. It sits outside (site), so no header or footer. */
export default async function FormPage() {
  const { t } = await getI18n();
  return (
    <main className="min-h-svh flex-1 bg-[#f3f5f9] px-4 pt-8 pb-10 sm:pt-14">
      <div className="mx-auto max-w-115">
        <Image src="/logo.png" alt="Saffet Education" width={800} height={251} priority sizes="210px" className="mx-auto h-14 w-auto sm:h-16" />
        {/* "Design" is left out: "Arts & Design" already covers it */}
        <LeadForm t={t.leadForm} fields={Object.entries(t.labels.field).filter(([k]) => k !== "Design").map(([, v]) => v)} />
      </div>
    </main>
  );
}
