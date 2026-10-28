import type { CSSProperties, ReactNode } from "react";

/**
 * Hand-drawn style line illustrations for the study fields.
 * Every stroke with `art-draw` draws itself (and every `art-fill` patch fades in), holds, then wipes away on a loop (see globals.css);
 * `--d` staggers the strokes so a picture builds up piece by piece.
 */

const ink = "#1f2b4a";

/** One drawn stroke. pathLength=1 lets the CSS animate any path with the same dash values. */
function Stroke({ d, color = ink, width = 2.5, delay = 0, cap = "round" }: { d: string; color?: string; width?: number; delay?: number; cap?: "round" | "butt" }) {
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap={cap}
      strokeLinejoin="round"
      className="art-draw"
      style={{ "--d": `${delay}s` } as CSSProperties}
    />
  );
}

/** Soft colour patch under the lines; fades in with the drawing and out with it. */
function Fill({ d, color, delay = 0.6, opacity = 0.16 }: { d: string; color: string; delay?: number; opacity?: number }) {
  return <path d={d} fill={color} fillOpacity={opacity} className="art-fill" style={{ "--d": `${delay}s` } as CSSProperties} />;
}

/** Gear outline: a ring with square-ish teeth, centred on (cx, cy). */
function gear(cx: number, cy: number, r: number, teeth: number) {
  const out = r + r * 0.28;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / teeth / 2;
    const p = (rad: number, a: number) => `${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
    d += `${i === 0 ? "M" : "L"}${p(r, a0)} L${p(out, a0 + 0.08)} L${p(out, a1 - 0.08)} L${p(r, a1)} `;
    d += `A${r} ${r} 0 0 1 ${p(r, a0 + (Math.PI * 2) / teeth)} `;
  }
  return d + "Z";
}

const scenes: Record<string, { bg: string; accent: string; art: (accent: string) => ReactNode }> = {
  "Medicine & Health": {
    bg: "#fbebe7",
    accent: "#d95a52",
    art: (a) => (
      <>
        <Fill d="M100 132C62 104 40 84 40 62c0-16 12-28 27-28 14 0 25 9 33 22 8-13 19-22 33-22 15 0 27 12 27 28 0 22-22 42-60 70Z" color={a} />
        <Stroke d="M100 132C62 104 40 84 40 62c0-16 12-28 27-28 14 0 25 9 33 22 8-13 19-22 33-22 15 0 27 12 27 28 0 22-22 42-60 70Z" />
        <Stroke d="M18 86h46l9-20 13 40 11-30 8 10h77" color={a} width={3} delay={0.5} />
        <Stroke d="M168 18v18M159 27h18" color={a} width={3} delay={1.1} />
      </>
    ),
  },
  "Business & Management": {
    bg: "#fdf1e0",
    accent: "#e08a24",
    art: (a) => (
      <>
        <Fill d="M44 92l30-20 28 8 52-48V134H44Z" color={a} opacity={0.12} delay={1.3} />
        <Stroke d="M28 22v112h150" />
        <Stroke d="M52 134v-26" color={a} width={12} cap="butt" delay={0.35} />
        <Stroke d="M82 134v-40" color={a} width={12} cap="butt" delay={0.5} />
        <Stroke d="M112 134v-56" color={a} width={12} cap="butt" delay={0.65} />
        <Stroke d="M142 134v-76" color={a} width={12} cap="butt" delay={0.8} />
        <Stroke d="M44 92l30-20 28 8 52-48" delay={1.1} />
        <Stroke d="M140 32h14v14" delay={1.5} />
      </>
    ),
  },
  Engineering: {
    bg: "#e7effc",
    accent: "#2f6fd8",
    art: (a) => (
      <>
        <g className="art-spin">
          <Fill d={gear(78, 78, 30, 10)} color={a} />
          <Stroke d={gear(78, 78, 30, 10)} />
          <Stroke d="M88 78a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" color={a} width={3} delay={0.4} />
        </g>
        <g className="art-spin art-spin-reverse">
          <Fill d={gear(136, 50, 18, 8)} color={a} opacity={0.24} delay={0.8} />
          <Stroke d={gear(136, 50, 18, 8)} delay={0.3} />
          <Stroke d="M142 50a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" color={a} width={3} delay={0.6} />
        </g>
        <Stroke d="M26 140h150M40 140v-7M60 140v-4M80 140v-7M100 140v-4M120 140v-7M140 140v-4M160 140v-7" color={a} width={2.5} delay={0.9} />
      </>
    ),
  },
  "Computer Science & IT": {
    bg: "#e6f3ec",
    accent: "#2e8a64",
    art: (a) => (
      <>
        <Fill d="M26 44h148v76a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10Z" color={a} opacity={0.1} />
        <Fill d="M36 26h128a10 10 0 0 1 10 10v8H26v-8a10 10 0 0 1 10-10Z" color={a} opacity={0.22} delay={0.5} />
        <Stroke d="M36 26h128a10 10 0 0 1 10 10v84a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10V36a10 10 0 0 1 10-10Z" />
        <Stroke d="M26 44h148" delay={0.3} />
        <Stroke d="M40 35h.1M50 35h.1M60 35h.1" width={5} delay={0.45} />
        <Stroke d="M72 68 54 86l18 18" color={a} width={3.5} delay={0.7} />
        <Stroke d="M128 68l18 18-18 18" color={a} width={3.5} delay={0.85} />
        <Stroke d="M108 62 92 110" width={3} delay={1} />
        <rect x="152" y="112" width="8" height="3" rx="1.5" fill={a} className="art-blink" />
      </>
    ),
  },
};

/** Background colour for a field's tile. */
export const fieldArtBg = (field: string) => scenes[field]?.bg ?? "#eef4ff";

export function FieldArt({ field, className = "" }: { field: string; className?: string }) {
  const scene = scenes[field];
  if (!scene) return null;
  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden>
      {scene.art(scene.accent)}
    </svg>
  );
}
