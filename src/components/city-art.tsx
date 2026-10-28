import { hue } from "@/lib/format";
import { Picture } from "./picture";

/** Sky colours per city: [top, middle, horizon, sun]. */
const palettes: Record<string, [string, string, string, string]> = {
  Istanbul: ["#2b2d5c", "#c4506a", "#ffb36b", "#ffe0a3"],
  Ankara: ["#1f3a68", "#4f7fb8", "#c9d9ee", "#fff4d6"],
  Izmir: ["#0f4c5c", "#2f8f9d", "#f6c28b", "#fff1c9"],
  Antalya: ["#0b6e8a", "#38b2c9", "#ffd29a", "#fff6d8"],
  Trabzon: ["#1e3d3a", "#3f7f6e", "#d7e6c8", "#fffbe6"],
};

/** Generated city cover: gradient sky, sun and two skyline layers. Swap for a real photo via `image`. */
export function CityArt({ city, image, className = "" }: { city: string; image?: string; className?: string }) {
  const [top, mid, low, sun] = palettes[city] ?? palettes.Istanbul;
  const seed = hue(city);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {image ? (
        <Picture src={image} sizes="(min-width: 1024px) 25vw, 50vw" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="size-full transition-transform duration-500 group-hover:scale-105" style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${low} 100%)` }}>
          <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full" aria-hidden>
            <circle cx={70 + (seed % 160)} cy="78" r="20" fill={sun} opacity="0.95" />
            <circle cx={70 + (seed % 160)} cy="78" r="34" fill={sun} opacity="0.18" />
            <path d={skyline(seed + 3, 78, 30)} fill={top} opacity="0.35" />
            <path d={skyline(seed, 98, 26)} fill="#0b1525" opacity="0.78" />
          </svg>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1525]/45 via-transparent to-transparent" />
    </div>
  );
}

/** Deterministic skyline: rectangles with occasional domes and minarets. */
function skyline(seed: number, base: number, spread: number) {
  let s = seed + 11;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let d = "M0 150V130";
  let x = 0;
  while (x < 300) {
    const w = 12 + rnd() * 22;
    const top = base + rnd() * spread;
    if (rnd() > 0.72) {
      d += `H${x}V${top + 8}a${w / 2} ${w / 2} 0 0 1 ${w} 0V150`;
      d += `M${x + w + 2} 150V${top - 22}l2.5 -10 2.5 10V150`;
      x += w + 7;
    } else {
      d += `H${x}V${top}H${x + w}V150`;
      x += w;
    }
  }
  return d + "H300Z";
}
