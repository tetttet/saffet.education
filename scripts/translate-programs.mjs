// Translates the English texts of the program pages (overview, curriculum, careers, entry and language rules,
// documents, faculty) into the site's other languages with Google Translate's free endpoint, and saves them to
// src/data/program-translations/<locale>.json as { hash of the English text: translation }. One text repeats
// across many programs, so each is translated once. Run after `npm run data`:
//   npm run translate:programs                           only new or changed texts
//   npm run translate:programs -- --force                everything again
//   npm run translate:programs -- ru kk                  only these languages
//   npm run translate:programs -- istanbul-medipol-university   one university
// Safe to stop: finished batches are saved, and the next run carries on from there.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "src", "data");
const detailsDir = join(dataDir, "details");
const outDir = join(dataDir, "program-translations");

// Site locale -> Google Translate language code.
const LANGUAGES = { ru: "ru", az: "az", tr: "tr", kk: "kk", zh: "zh-CN", es: "es", fr: "fr" };
const MAX_CHARS = 4500; // per request
const MAX_TEXTS = 60; // per request
const SAVE_EVERY = 20; // requests

const args = process.argv.slice(2);
const force = args.includes("--force");
const names = args.filter((a) => !a.startsWith("--"));
const onlyLocales = names.filter((a) => a in LANGUAGES);
const onlyUnis = names.filter((a) => !(a in LANGUAGES));

// Must match programText() in src/lib/data.ts.
const hash = (text) => createHash("sha1").update(text).digest("hex").slice(0, 12);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Every distinct English text, by hash. */
function collectTexts() {
  const texts = new Map();
  const add = (text) => {
    const clean = text?.trim();
    if (clean) texts.set(hash(clean), clean);
  };
  for (const file of readdirSync(detailsDir)) {
    if (onlyUnis.length && !onlyUnis.includes(basename(file, ".json"))) continue;
    for (const d of Object.values(JSON.parse(readFileSync(join(detailsDir, file), "utf8")))) {
      for (const text of [d.overview, d.entry, d.language, ...d.curriculum, ...d.careers, ...d.documents]) add(text);
    }
  }
  for (const p of JSON.parse(readFileSync(join(dataDir, "programs.json"), "utf8"))) {
    if (!onlyUnis.length || onlyUnis.includes(p.uni)) add(p.faculty);
  }
  return texts;
}

/** Splits texts into requests small enough for the endpoint. */
function batches(items) {
  const out = [];
  let batch = [];
  let size = 0;
  for (const item of items) {
    if (batch.length && (batch.length >= MAX_TEXTS || size + item[1].length > MAX_CHARS)) {
      out.push(batch);
      batch = [];
      size = 0;
    }
    batch.push(item);
    size += item[1].length;
  }
  if (batch.length) out.push(batch);
  return out;
}

/** Translates several texts in one POST; the answer is an array in the same order. */
async function translate(texts, to) {
  const url = `https://translate.googleapis.com/translate_a/t?${new URLSearchParams({ client: "gtx", sl: "en", tl: to })}`;
  const body = new URLSearchParams(texts.map((q) => ["q", q]));
  for (let attempt = 1; ; attempt++) {
    let problem;
    try {
      const res = await fetch(url, { method: "POST", body, headers: { "User-Agent": "Mozilla/5.0" } });
      if (res.ok) {
        const data = await res.json();
        const result = texts.length === 1 && typeof data === "string" ? [data] : data;
        if (Array.isArray(result) && result.length === texts.length && result.every((t) => typeof t === "string" && t.trim())) {
          return result.map((t) => t.trim());
        }
        problem = "unexpected answer";
      } else {
        problem = `HTTP ${res.status}`;
      }
    } catch (error) {
      problem = error.message;
    }
    if (attempt >= 8) throw new Error(problem);
    const wait = 15000 * attempt;
    console.error(`  ${problem}, waiting ${wait / 1000}s`);
    await sleep(wait); // 429 or a hiccup: back off and retry
  }
}

mkdirSync(outDir, { recursive: true });
const texts = collectTexts();
console.log(`${texts.size} distinct texts`);

let failed = false;
for (const [locale, code] of Object.entries(LANGUAGES)) {
  if (onlyLocales.length && !onlyLocales.includes(locale)) continue;
  const file = join(outDir, `${locale}.json`);
  const saved = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  const save = () => writeFileSync(file, JSON.stringify(saved, null, 0) + "\n");
  const todo = batches([...texts].filter(([key]) => force || !saved[key]));
  console.log(`${locale}: ${todo.reduce((n, b) => n + b.length, 0)} to translate in ${todo.length} requests`);
  try {
    for (const [i, batch] of todo.entries()) {
      const result = await translate(batch.map(([, text]) => text), code);
      batch.forEach(([key], j) => (saved[key] = result[j]));
      if ((i + 1) % SAVE_EVERY === 0) {
        save();
        console.log(`  ${locale}: ${i + 1}/${todo.length}`);
      }
      await sleep(250);
    }
    // Texts that left the source data are dropped on a full run.
    if (!onlyUnis.length) for (const key of Object.keys(saved)) if (!texts.has(key)) delete saved[key];
    save();
    console.log(`✓ ${locale}`);
  } catch (error) {
    save();
    failed = true;
    console.error(`✗ ${locale}: ${error.message}. Run again to carry on.`);
    break; // the endpoint is refusing us, so the next language would fail too
  }
}
if (failed) process.exitCode = 1;
