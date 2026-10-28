import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const dir = join(process.cwd(), "public", "universities");
const cache = new Map<string, string>();

/** URL of /public/universities/<slug>.<ext> if that photo exists, otherwise undefined. Only found photos are cached, so a newly added one shows up without a restart. */
export function uniImage(slug: string) {
  if (!cache.has(slug)) {
    const ext = EXTENSIONS.find((e) => existsSync(join(dir, `${slug}.${e}`)));
    if (ext) cache.set(slug, `/universities/${slug}.${ext}`);
  }
  return cache.get(slug);
}

export type Logo = { src: string; dark: boolean };

const LOGO_EXTENSIONS = ["svg", "png", "webp", "jpg"];
const logoDir = join(dir, "logos");
// White logos made for dark site headers; they sit on a dark tile.
const DARK_LOGOS = new Set(["istanbul-nisantasi-university", "istanbul-galata-university"]);
const logoCache = new Map<string, Logo>();

/** University logo from /public/universities/logos/<slug>.<ext> (trimmed and resized from the source data), or undefined. */
export function uniLogo(slug: string): Logo | undefined {
  if (!logoCache.has(slug)) {
    const ext = LOGO_EXTENSIONS.find((e) => existsSync(join(logoDir, `${slug}.${e}`)));
    if (ext) logoCache.set(slug, { src: `/universities/logos/${slug}.${ext}`, dark: DARK_LOGOS.has(slug) });
  }
  return logoCache.get(slug);
}
