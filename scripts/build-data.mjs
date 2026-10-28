// Builds compact JSON for the site from ../turkey_universities/sitconnect_turkey/<city>/*.json,
// plus programs that only the universities' own sites list (scripts/official-additions.json).
// Run: npm run data
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "..", "turkey_universities", "sitconnect_turkey");
const out = join(root, "src", "data");
const cities = ["istanbul", "ankara", "izmir", "antalya", "trabzon"];

const universities = [];
const programs = [];
// Long texts per program, written to src/data/details/<uni>.json and read only by the program page.
const details = {};

const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : typeof v === "string" && v.trim() ? v.split("\n").map((s) => s.trim()).filter(Boolean) : []);

for (const city of cities) {
  const uFile = join(src, city, "universities.json");
  const pFile = join(src, city, "programs.json");
  if (!existsSync(uFile) || !existsSync(pFile)) continue;

  for (const u of JSON.parse(readFileSync(uFile, "utf8")).universities) {
    universities.push({
      slug: u.slug,
      name: u.name,
      alternateName: u.alternate_name ?? null,
      city: u.city,
      type: u.type ?? null,
      founded: u.founded ?? null,
      ranking: u.ranking ?? null,
      website: u.website ?? null,
      livingCost: u.living_cost_estimate ?? null,
      lat: u.latitude ?? null,
      lng: u.longitude ?? null,
      description: u.description ?? null,
      address: u.address ?? null,
      students: u.students ?? null,
      internationalStudents: u.international_students ?? null,
      housing: u.accommodation?.description ?? null,
      stats: {
        programs: u.stats?.programs_active ?? 0,
        byDegree: u.stats?.by_degree ?? {},
        byLanguage: u.stats?.by_language ?? {},
        byField: u.stats?.by_field ?? {},
        tuitionMin: u.stats?.tuition_usd_per_year?.min ?? null,
        tuitionMax: u.stats?.tuition_usd_per_year?.max ?? null,
      },
    });
  }

  for (const p of JSON.parse(readFileSync(pFile, "utf8")).programs) {
    const t = { ...p.tuition };
    const a = p.application ?? {};
    // Source typos like $12 with a "99.9%" discount: fall back to the list price.
    if (t.discount_percent > 90 && t.currency === "USD" && t.official) {
      t.usd_per_year = t.official;
      t.discount_percent = null;
    }
    // Fees under $300 a year are source typos (e.g. 3,500 TRY at Medipol); show "on request" instead.
    if (t.usd_per_year != null && t.usd_per_year < 300) {
      t.usd_per_year = null;
      t.discount_percent = null;
    }
    programs.push({
      id: p.id,
      name: p.name,
      uni: p.university.slug,
      uniName: p.university.name,
      city: p.city,
      degree: p.degree ?? "Other",
      language: p.language ?? "Not specified",
      faculty: p.faculty ?? null,
      field: p.field ?? "Other",
      years: p.duration_years ?? null,
      fee: t.usd_per_year ?? null,
      feeOfficial: t.currency === "USD" ? (t.official ?? null) : null,
      discount: t.discount_percent ?? null,
      open: Boolean(a.accepting_applications),
      deadline: a.deadline_at ?? null,
      intakes: a.intakes ?? null,
    });

    const r = p.requirements ?? {};
    (details[p.university.slug] ??= {})[p.id] = {
      overview: p.overview ?? p.description ?? null,
      curriculum: list(p.curriculum),
      careers: list(p.career_prospects),
      entry: r.entry ?? null,
      language: [r.language, r.english].filter(Boolean).join("\n\n") || null,
      documents: list(r.required_documents),
    };
  }
}

// Programs found on a university's own site but missing from SIT Connect. The list is curated by hand
// (names differ between the two sources), so only real gaps are added. Deadline and intakes are
// copied from the same university's programs of the same level.
const additions = JSON.parse(readFileSync(join(root, "scripts", "official-additions.json"), "utf8"));
for (const a of additions) {
  const u = universities.find((x) => x.slug === a.uni);
  if (!u) throw new Error(`official-additions.json: unknown university ${a.uni}`);
  const sibling = programs.find((p) => p.uni === a.uni && p.degree === a.degree && p.deadline) ?? programs.find((p) => p.uni === a.uni && p.deadline);
  programs.push({
    id: `of-${a.officialId}`,
    name: a.name,
    uni: u.slug,
    uniName: u.name,
    city: u.city,
    degree: a.degree,
    language: a.language,
    faculty: a.faculty,
    field: a.field ?? "Other",
    years: a.years,
    fee: a.fee,
    feeOfficial: null,
    discount: null,
    open: sibling?.open ?? false,
    deadline: sibling?.deadline ?? null,
    intakes: sibling?.intakes ?? null,
  });
}

// Recompute stats from the final program list: tuition ranges use the cleaned fees (the source stats
// keep typos like $12) and the counts include the added programs.
const countBy = (list, key) => list.reduce((m, p) => ((m[p[key]] = (m[p[key]] ?? 0) + 1), m), {});
for (const u of universities) {
  const own = programs.filter((p) => p.uni === u.slug);
  const fees = own.filter((p) => p.fee != null).map((p) => p.fee);
  u.stats.programs = own.length;
  u.stats.byDegree = countBy(own, "degree");
  u.stats.byLanguage = countBy(own, "language");
  u.stats.byField = countBy(own, "field");
  u.stats.tuitionMin = fees.length ? Math.min(...fees) : null;
  u.stats.tuitionMax = fees.length ? Math.max(...fees) : null;
}

mkdirSync(out, { recursive: true });
writeFileSync(join(out, "universities.json"), JSON.stringify(universities));
writeFileSync(join(out, "programs.json"), JSON.stringify(programs));
const detailsDir = join(out, "details");
rmSync(detailsDir, { recursive: true, force: true });
mkdirSync(detailsDir);
for (const [slug, byId] of Object.entries(details)) writeFileSync(join(detailsDir, `${slug}.json`), JSON.stringify(byId));
console.log(`universities: ${universities.length}, programs: ${programs.length} (${additions.length} from official sites)`);
