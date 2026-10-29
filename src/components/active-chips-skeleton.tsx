"use client";

import { useSearchParams } from "next/navigation";
import { Bone } from "./skeleton";

const FILTERS = ["q", "city", "degree", "language", "field", "uni", "max", "open"];

/** The removable filter chips row of /programs while it loads: one chip per filter value in the URL, so the list below starts where it will stay. */
export function ActiveChipsSkeleton() {
  const params = useSearchParams();
  const values = FILTERS.flatMap((k) => params.getAll(k).filter(Boolean));
  if (!values.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {values.map((v, i) => (
        <Bone key={i} className="h-[30px] rounded-full" style={{ width: Math.min(220, 48 + v.length * 7) }} />
      ))}
      <Bone className="h-4 w-16" />
    </div>
  );
}
