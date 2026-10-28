import type { ImgHTMLAttributes } from "react";
import manifest from "@/lib/photo-manifest.json";

type Entry = { w: number; h: number; v: string; widths: number[]; formats: string[] };
const photos: Record<string, Entry> = manifest;

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes"> & {
  /** Original path in /public, e.g. "/hero/galata.jpg". */
  src: string;
  /** How wide the photo shows on screen, e.g. "(min-width: 1024px) 33vw, 100vw". The browser picks the file from it. */
  sizes: string;
  /** Above the fold: load right away and ahead of other images. */
  priority?: boolean;
};

/**
 * Drop-in for <img> that serves the light AVIF/WebP copies made by `npm run images` (public/_opt),
 * at the width the screen needs. Photos without copies fall back to a plain lazy <img>.
 */
export function Picture({ src, sizes, priority = false, alt = "", ...img }: Props) {
  const entry = photos[src];
  const loading = priority ? "eager" : (img.loading ?? "lazy");
  const fetchPriority = priority ? "high" : img.fetchPriority;
  // eslint-disable-next-line @next/next/no-img-element
  if (!entry) return <img src={src} alt={alt} decoding="async" {...img} loading={loading} fetchPriority={fetchPriority} />;

  const base = src.slice(0, src.lastIndexOf("."));
  const set = (format: string) => entry.widths.map((w) => `/_opt${base}-${w}.${entry.v}.${format} ${w}w`).join(", ");
  return (
    <picture className="contents">
      {entry.formats.map((f) => (
        <source key={f} type={`image/${f}`} srcSet={set(f)} sizes={sizes} />
      ))}
      <img src={src} alt={alt} width={entry.w} height={entry.h} decoding="async" {...img} loading={loading} fetchPriority={fetchPriority} />
    </picture>
  );
}
