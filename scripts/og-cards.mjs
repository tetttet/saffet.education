// Builds the link-preview cards public/og/<locale>.jpg (1200×630): logo, the home page's slogan and
// headline on the left, a student photo on the right. Texts come from the dictionaries, so run it again
// after changing them or the photo. Needs internet: fonts are fetched from Google Fonts, cut down to
// the characters on each card.
// Run: npm run og
import { mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";
import { locales } from "../src/i18n/config.ts";
import { site } from "../src/lib/site.ts";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "public", "og");
mkdirSync(out, { recursive: true });

const W = 1200, H = 630, BAR = 8, PANEL = 660;
const colors = { brand: "#0360eb", ink: "#0b1630", muted: "#47526b", sun: "#ff9e1b", paper: "#fbfcfe" };
const dataUrl = (buffer, type) => `data:${type};base64,${buffer.toString("base64")}`;

// The student stands right of centre in the source photo; crop around her to the panel's shape.
const photo = dataUrl(
  await sharp(join(root, "public", "promo", "student-blue.jpg"))
    .extract({ left: 330, top: 0, width: 730, height: 733 })
    .resize(W - PANEL, H - BAR, { fit: "cover", position: "top" })
    .jpeg({ quality: 90 })
    .toBuffer(),
  "image/jpeg",
);
const logo = dataUrl(readFileSync(join(root, "public", "logo.png")), "image/png");

/** One weight of a Google font, holding only the glyphs in `text`; null if the family has none of them. */
async function googleFont(family, weight, text) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`).then((r) => (r.ok ? r.text() : ""));
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) return null;
  return { name: family, weight, style: "normal", data: await fetch(url).then((r) => r.arrayBuffer()) };
}

// Same faces as the site: Space Grotesk headings, Manrope where it lacks Cyrillic, Inter for text.
const display = '"Space Grotesk", "Manrope", "Inter", "Noto Sans SC"';
const body = '"Inter", "Noto Sans SC"';

for (const locale of locales) {
  const { default: t } = await import(`../src/i18n/dictionaries/${locale}.ts`);
  const eyebrow = t.home.brandMessage;
  // The headline breaks where the hero's does: after its first part ("Диплом Турции —" / "без лишних шагов").
  const headline = [t.home.titleStart, [t.home.titleMarker, t.home.titleEnd].filter(Boolean).join(" ")];
  const items = [t.nav.universities, t.nav.programs, t.nav.consult];
  const domain = new URL(site.url).host;
  const text = [eyebrow, eyebrow.toLocaleUpperCase(locale), ...headline, ...items, "·", domain].join("");
  const fonts = (
    await Promise.all([
      googleFont("Space Grotesk", 700, text),
      googleFont("Manrope", 700, text),
      googleFont("Inter", 500, text),
      googleFont("Inter", 600, text),
      ...(locale === "zh" ? [googleFont("Noto Sans SC", 500, text), googleFont("Noto Sans SC", 700, text)] : []),
    ])
  ).filter(Boolean);

  const card = h(
    "div",
    { style: { width: W, height: H, display: "flex", position: "relative", background: colors.paper } },
    h(
      "div",
      { style: { width: PANEL, height: H - BAR, display: "flex", flexDirection: "column", padding: "58px 64px 52px" } },
      h("img", { src: logo, width: 178, height: 56 }),
      h("div", { style: { marginTop: 74, fontFamily: body, fontWeight: 600, fontSize: 19, letterSpacing: 2.2, color: colors.brand } }, eyebrow.toLocaleUpperCase(locale)),
      h(
        "div",
        { style: { marginTop: 18, display: "flex", flexDirection: "column", fontFamily: display, fontWeight: 700, fontSize: 56, lineHeight: 1.08, letterSpacing: -1.4, color: colors.ink } },
        ...headline.map((line) => h("div", null, line)),
      ),
      // Each item stays whole; a long one moves to the next line instead of breaking in the middle.
      h(
        "div",
        { style: { marginTop: 22, display: "flex", flexWrap: "wrap", fontFamily: body, fontWeight: 500, fontSize: 23, lineHeight: 1.35, color: colors.muted } },
        ...items.map((item, i) => h("div", { style: { whiteSpace: "nowrap", marginRight: 8 } }, i < items.length - 1 ? `${item} ·` : item)),
      ),
      h(
        "div",
        { style: { marginTop: "auto", display: "flex", alignItems: "center" } },
        h("div", { style: { width: 34, height: 3, borderRadius: 2, background: colors.sun, marginRight: 14 } }),
        h("div", { style: { fontFamily: body, fontWeight: 600, fontSize: 21, color: colors.ink } }, domain),
      ),
    ),
    h("img", { src: photo, width: W - PANEL, height: H - BAR }),
    h("div", { style: { position: "absolute", left: 0, bottom: 0, width: W, height: BAR, background: colors.brand } }),
  );

  const png = Buffer.from(await new ImageResponse(card, { width: W, height: H, fonts }).arrayBuffer());
  // JPEG keeps the file well under the ~300 KB WhatsApp accepts for previews.
  await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(join(out, `${locale}.jpg`));
  console.log(`og/${locale}.jpg`, fonts.map((f) => `${f.name} ${f.weight}`).join(", "));
}
