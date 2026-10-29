import { Bone } from "./skeleton";

/** Mirrors UniversityBrowser box for box (search, city chips, type and sort, count, card grid) so nothing jumps when it arrives. */
export function UniversityBrowserSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="container-page" aria-busy aria-hidden>
      <div className="space-y-4 border-b border-ink/10 pb-6">
        <div className="flex h-12 items-center gap-3 rounded-xl border border-ink/15 bg-white px-4">
          <Bone className="size-5 rounded-full" />
          <Bone className="h-3.5 w-48" />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-2 overflow-hidden px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {["w-24", "w-28", "w-24", "w-20", "w-24", "w-24"].map((w, i) => (
              <Bone key={i} className={`h-9 shrink-0 rounded-full ${w}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-full border border-ink/12 bg-white p-0.5">
              {["w-14", "w-20", "w-22"].map((w, i) => (
                <Bone key={i} className={`h-8 rounded-full ${w}`} />
              ))}
            </div>
            <Bone className="h-9 w-40 rounded-full" />
          </div>
        </div>
      </div>

      <div className="py-5">
        <Bone className="my-0.5 h-4 w-32" />
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }, (_, i) => (
          <li key={i} className="flex flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-white">
            <Bone className="aspect-[16/10] rounded-none" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-1.5">
                <Bone className="size-4 rounded-full" />
                <Bone className="h-3 w-40" />
              </div>
              <Bone className="mt-3 h-5 w-[85%]" />
              <Bone className="mt-2 mb-6 h-5 w-[55%]" />
              <div className="mt-auto grid grid-cols-3 gap-3 border-t border-ink/10 pt-4">
                {[0, 1, 2].map((k) => (
                  <div key={k}>
                    <Bone className="h-3 w-[70%]" />
                    <Bone className="mt-2 h-3.5 w-[45%]" />
                  </div>
                ))}
              </div>
              <Bone className="mt-5 h-4 w-36" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
