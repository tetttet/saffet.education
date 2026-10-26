// Builds compact JSON for the site from ../turkey_universities/sitconnect_turkey/<city>/*.json
// Run: npm run data
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "..", "turkey_universities", "sitconnect_turkey");
const out = join(root, "src", "data");
const cities = ["istanbul", "ankara", "izmir", "antalya", "trabzon"];

const universities = [];
const programs = [];

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
    const t = p.tuition ?? {};
    const a = p.application ?? {};
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
  }
}

mkdirSync(out, { recursive: true });
writeFileSync(join(out, "universities.json"), JSON.stringify(universities));
writeFileSync(join(out, "programs.json"), JSON.stringify(programs));
console.log(`universities: ${universities.length}, programs: ${programs.length}`);
