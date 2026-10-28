// Makes light copies of every site photo in public/_opt and writes src/lib/photo-manifest.json, which <Photo> reads.
// Each photo gets several widths in AVIF and WebP, so phones download a small file and desktops a sharp one.
// File names carry a hash of the source, so they can be cached forever and change when a photo is replaced.
// Incremental: files that already exist are skipped. Run with `npm run images` after adding or replacing photos.
import sharp from "sharp";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const outDir = join(pub, "_opt");
const manifestPath = join(root, "src", "lib", "photo-manifest.json");

// Which folders to process and how. Photos get AVIF (smallest) with WebP as the fallback;
// logos and document icons have sharp edges and transparency, so they stay WebP at high quality.
const groups = [
  { dirs: ["hero", "cities", "promo", "universities"], widths: [400, 640, 960, 1280, 1600], formats: { avif: { quality: 50, effort: 5 }, webp: { quality: 72, effort: 6 } } },
  { dirs: ["universities/logos"], widths: [160, 320], formats: { webp: { quality: 88, effort: 6, alphaQuality: 90 } } },
  { dirs: ["requirements"], widths: [96], formats: { webp: { quality: 85, effort: 6, alphaQuality: 90 } } },
];
const SOURCE = new Set([".jpg", ".jpeg", ".png"]);

const manifest = {};
const keep = new Set();
let made = 0;
let before = 0;
let after = 0;

for (const group of groups) {
  for (const dir of group.dirs) {
    const abs = join(pub, dir);
    if (!existsSync(abs)) continue;
    for (const file of readdirSync(abs)) {
      const src = join(abs, file);
      if (!statSync(src).isFile() || !SOURCE.has(extname(file).toLowerCase())) continue;

      const buf = readFileSync(src);
      const hash = createHash("sha1").update(buf).update(JSON.stringify(group)).digest("hex").slice(0, 8);
      const { width, height } = await sharp(buf).metadata();
      // Widths up to the original; the original width itself too when it is clearly larger than the last step.
      const widths = group.widths.filter((w) => w < width);
      if (!widths.length || width > widths.at(-1) * 1.15) widths.push(width);

      const path = "/" + relative(pub, src).split("\\").join("/");
      const base = path.slice(1, -extname(path).length);
      before += buf.length;

      for (const [format, options] of Object.entries(group.formats)) {
        for (const w of widths) {
          const name = `${base}-${w}.${hash}.${format}`;
          const out = join(outDir, name);
          keep.add(out);
          if (!existsSync(out)) {
            mkdirSync(dirname(out), { recursive: true });
            await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true })[format](options).toFile(out);
            made++;
          }
          if (w === widths.at(-1) && format === "webp") after += statSync(out).size;
        }
      }
      manifest[path] = { w: width, h: height, v: hash, widths, formats: Object.keys(group.formats) };
    }
  }
}

// Remove copies of photos that were replaced or deleted.
let removed = 0;
const sweep = (dir) => {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) sweep(p);
    else if (!keep.has(p)) (rmSync(p), removed++);
  }
};
sweep(outDir);

writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + "\n");
const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`${Object.keys(manifest).length} images, ${made} files made, ${removed} removed`);
console.log(`largest WebP: ${kb(after)} vs originals ${kb(before)}`);
