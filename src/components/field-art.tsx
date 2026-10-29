import type { CSSProperties, ReactNode } from "react";

/**
 * Hand-drawn illustrations for the study fields, in a stop-motion sketchbook style:
 * thick ink lines that draw themselves in jerky steps, flat colour patches printed slightly off the lines,
 * and a "boiling" wobble on every line (a displacement filter whose noise changes a few times a second).
 * Every stroke with `art-draw` draws, holds, then wipes away on a loop (see globals.css); `--d` staggers the strokes.
 */

const ink = "#141413";

/** One drawn stroke. pathLength=1 lets the CSS animate any path with the same dash values. */
function Stroke({ d, color = ink, width = 3.6, delay = 0, cap = "round" }: { d: string; color?: string; width?: number; delay?: number; cap?: "round" | "butt" }) {
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

/** Flat colour patch, printed a little off the line work like a misregistered print; pops in once the outline is drawn. */
function Fill({ d, color, delay = 0.9, dx = 5, dy = 4 }: { d: string; color: string; delay?: number; dx?: number; dy?: number }) {
  // The offset sits on a wrapper: the CSS pop animation sets `transform` on the path and would override it.
  return (
    <g transform={`translate(${dx} ${dy})`}>
      <path d={d} fill={color} className="art-fill" style={{ "--d": `${delay}s` } as CSSProperties} />
    </g>
  );
}

/** Gear outline: a ring with square-ish teeth, centred on (cx, cy). */
function gear(cx: number, cy: number, r: number, teeth: number) {
  const out = r + r * 0.3;
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

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${r * 2} 0 ${r} ${r} 0 0 1 ${r * 2} 0Z`;

const scenes: Record<string, { bg: string; accent: string; soft: string; art: (accent: string, soft: string) => ReactNode }> = {
  "Medicine & Health": {
    bg: "#fbebe7",
    accent: "#d4483e",
    soft: "#f4a698",
    art: (a, s) => {
      const heart = "M100 130C64 104 42 84 42 62c0-16 12-28 27-28 14 0 24 9 31 21 7-12 17-21 31-21 15 0 27 12 27 28 0 22-22 42-58 68Z";
      return (
        <>
          <Fill d={heart} color={s} />
          <Stroke d={heart} />
          <Stroke d="M14 86h48l9-22 13 44 11-32 8 10h83" color={a} width={4} delay={0.7} />
          <Stroke d="M170 16v20M160 26h20" color={a} width={4} delay={1.3} />
          <Stroke d="M30 30l7 7M24 48h9M40 18l2 9" width={3} delay={1.55} />
        </>
      );
    },
  },
  "Business & Management": {
    bg: "#fdf1e0",
    accent: "#d9771a",
    soft: "#f7c47c",
    art: (a, s) => (
      <>
        {[
          [46, 108],
          [76, 92],
          [106, 76],
          [136, 56],
        ].map(([x, y], i) => (
          <Fill key={x} d={`M${x} ${y}h20v${134 - y}h-20Z`} color={s} delay={0.75 + i * 0.12} dx={4} dy={0} />
        ))}
        <Stroke d="M26 18v116h156" />
        {[
          [46, 108],
          [76, 92],
          [106, 76],
          [136, 56],
        ].map(([x, y], i) => (
          <Stroke key={x} d={`M${x} 134V${y}h20v${134 - y}`} width={3.2} delay={0.3 + i * 0.12} />
        ))}
        <Stroke d="M40 84l32-22 28 8 54-46" color={a} width={4} delay={1.15} />
        <Stroke d="M138 22h18v18" color={a} width={4} delay={1.5} />
        <Stroke d="M62 30c5 0 8 2.5 8 6.5s-3 6.5-8 6.5-8 2.5-8 6.5 3 6.5 8 6.5M62 25v36" width={3} delay={1.7} />
      </>
    ),
  },
  Engineering: {
    bg: "#e7effc",
    accent: "#2f6fd8",
    soft: "#a9c6f5",
    art: (a, s) => (
      <>
        <g className="art-tick">
          <Fill d={gear(76, 76, 30, 10)} color={s} dx={0} dy={0} />
          <Stroke d={gear(76, 76, 30, 10)} />
          <Stroke d={circle(76, 76, 10)} color={a} width={4} delay={0.45} />
        </g>
        <g className="art-tick art-tick-reverse">
          <Fill d={gear(136, 46, 18, 8)} color={s} delay={1} dx={0} dy={0} />
          <Stroke d={gear(136, 46, 18, 8)} delay={0.3} />
          <Stroke d={circle(136, 46, 6)} color={a} width={4} delay={0.6} />
        </g>
        <Stroke d="M24 140h154" delay={0.8} />
        <Stroke d="M38 140v-8M56 140v-5M74 140v-8M92 140v-5M110 140v-8M128 140v-5M146 140v-8M164 140v-5" color={a} width={3} delay={1} />
        <Stroke d="M150 96l22 22M172 96l-22 22" width={3} delay={1.4} />
      </>
    ),
  },
  "Computer Science & IT": {
    bg: "#e6f3ec",
    accent: "#23885c",
    soft: "#9fd9bb",
    art: (a, s) => (
      <>
        <Fill d="M36 24h128a10 10 0 0 1 10 10v10H26V34a10 10 0 0 1 10-10Z" color={s} delay={0.6} dx={0} dy={0} />
        <Stroke d="M36 24h128a10 10 0 0 1 10 10v84a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10V34a10 10 0 0 1 10-10Z" />
        <Stroke d="M26 44h148" delay={0.3} />
        <Stroke d="M40 34h.1M51 34h.1M62 34h.1" width={5.5} delay={0.45} />
        <Stroke d="M72 66 52 86l20 20" color={a} width={4.5} delay={0.75} />
        <Stroke d="M128 66l20 20-20 20" color={a} width={4.5} delay={0.9} />
        <Stroke d="M109 60 91 112" width={4} delay={1.05} />
        <Stroke d="M64 146h72" delay={1.3} />
        <rect x="150" y="110" width="9" height="4" rx="2" fill={a} className="art-blink" />
      </>
    ),
  },
};

/** Background colour for a field's tile. */
export const fieldArtBg = (field: string) => scenes[field]?.bg ?? "#eef4ff";

export function FieldArt({ field, className = "" }: { field: string; className?: string }) {
  const scene = scenes[field];
  if (!scene) return null;
  const id = `boil-${field.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden>
      {/* Line boil: new noise every 120ms nudges the strokes, so they wobble like hand-drawn animation frames. */}
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="1" result="noise">
          <animate attributeName="seed" values="1;5;9;13" dur="0.48s" calcMode="discrete" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <g className="art-boil" style={{ filter: `url(#${id})` }}>
        {scene.art(scene.accent, scene.soft)}
      </g>
    </svg>
  );
}
