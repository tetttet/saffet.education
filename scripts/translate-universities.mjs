// Translates each university's "About" and "Accommodation" texts (English in the source data) into the
// site's other languages with Google Translate's free endpoint, and saves them to
// src/data/university-translations.json. Run after `npm run data`:
//   npm run translate                           only new or changed texts
//   npm run translate -- --force                everything again
//   npm run translate -- kadir-has-university   one university
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "src", "data");
const outFile = join(dataDir, "university-translations.json");

// Site locale -> Google Translate language code.
const LANGUAGES = { ru: "ru", az: "az", tr: "tr", kk: "kk", zh: "zh-CN", es: "es", fr: "fr" };
const FIELDS = ["description", "housing"];

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

const universities = JSON.parse(readFileSync(join(dataDir, "universities.json"), "utf8"));
const saved = existsSync(outFile) ? JSON.parse(readFileSync(outFile, "utf8")) : {};

// A text is translated again only when its English source changes.
const hash = (text) => createHash("sha1").update(text).digest("hex").slice(0, 12);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translate(text, to) {
  for (let attempt = 1; ; attempt++) {
    const url = `https://translate.googleapis.com/translate_a/single?${new URLSearchParams({ client: "gtx", sl: "en", tl: to, dt: "t", q: text })}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.ok) {
      // [[["translated sentence", "source sentence", ...], ...], ...]
      const data = await res.json();
      return data[0].map((part) => part[0]).join("").trim();
    }
    if (attempt >= 4) throw new Error(`HTTP ${res.status}`);
    await sleep(2000 * attempt); // 429 or a hiccup: wait and retry
  }
}

let done = 0;
const failed = [];
for (const u of universities) {
  if (only.length && !only.includes(u.slug)) continue;
  for (const field of FIELDS) {
    const text = u[field]?.trim();
    if (!text) continue;
    const prev = saved[u.slug]?.[field];
    if (!force && prev?.source === hash(text) && Object.keys(LANGUAGES).every((l) => prev[l])) continue;
    try {
      const entry = { source: hash(text) };
      for (const [locale, code] of Object.entries(LANGUAGES)) {
        entry[locale] = await translate(text, code);
        await sleep(300);
      }
      (saved[u.slug] ??= {})[field] = entry;
      writeFileSync(outFile, JSON.stringify(saved, null, 2) + "\n"); // after each text, so an interrupted run keeps its work
      console.log(`✓ ${u.slug} · ${field}`);
      done++;
    } catch (error) {
      failed.push(`${u.slug} · ${field}`);
      console.error(`✗ ${u.slug} · ${field}: ${error.message}`);
    }
  }
}
console.log(`Done: ${done} translated, ${failed.length} failed.${failed.length ? " Run again to retry them." : ""}`);
if (failed.length) process.exitCode = 1;
