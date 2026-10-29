import { UniversityDetailSkeleton } from "@/components/university-detail-skeleton";
import { getI18n } from "@/i18n/server";

export default async function Loading() {
  return <UniversityDetailSkeleton i18n={await getI18n()} />;
}
