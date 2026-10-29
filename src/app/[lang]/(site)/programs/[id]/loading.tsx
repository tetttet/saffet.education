import { ProgramDetailSkeleton } from "@/components/program-detail-skeleton";
import { getI18n } from "@/i18n/server";

export default async function Loading() {
  return <ProgramDetailSkeleton i18n={await getI18n()} />;
}
