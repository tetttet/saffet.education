import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import universitiesJson from "@/data/universities.json";
import programsJson from "@/data/programs.json";
import translationsJson from "@/data/university-translations.json";
import type { Locale } from "@/i18n/config";
import { programName } from "@/lib/program-names";

export type University = {
  slug: string;
  name: string;
  alternateName: string | null;
  city: string;
  type: string | null;
  founded: number | null;
  ranking: string | null;
  website: string | null;
  livingCost: string | null;
  lat: number | null;
  lng: number | null;
  /** Texts below come from the source in English. */
  description: string | null;
  address: string | null;
  students: number | null;
  internationalStudents: number | null;
  housing: string | null;
  stats: {
    programs: number;
    byDegree: Record<string, number>;
    byLanguage: Record<string, number>;
    byField: Record<string, number>;
    tuitionMin: number | null;
    tuitionMax: number | null;
  };
};

export type Program = {
  id: string;
  name: string;
  uni: string;
  uniName: string;
  city: string;
  degree: string;
  language: string;
  faculty: string | null;
  field: string;
  years: number | null;
  fee: number | null;
  feeOfficial: number | null;
  discount: number | null;
  open: boolean;
  deadline: string | null;
  intakes: string | null;
};

/** Long English texts for a program page; programs added from official sites have none. */
export type ProgramDetails = {
  overview: string | null;
  curriculum: string[];
  careers: string[];
  entry: string | null;
  language: string | null;
  documents: string[];
};

export const universities = universitiesJson as unknown as University[];
export const programs = programsJson as unknown as Program[];

const uniBySlug = new Map(universities.map((u) => [u.slug, u]));
const programById = new Map(programs.map((p) => [p.id, p]));

export const getUniversity = (slug: string) => uniBySlug.get(slug);

type Translated = Partial<Record<Locale, string>> & { source: string };
const translations = translationsJson as Record<string, Partial<Record<"description" | "housing", Translated>>>;

/** "About" and "Accommodation" texts in the page language (scripts/translate-universities.mjs), English until translated. */
export function universityTexts(u: University, locale: Locale) {
  const t = translations[u.slug] ?? {};
  return {
    description: u.description ? (t.description?.[locale] ?? u.description) : null,
    housing: u.housing ? (t.housing?.[locale] ?? u.housing) : null,
  };
}
export const getProgram = (id: string) => programById.get(id);
export const programsOf = (slug: string) => programs.filter((p) => p.uni === slug);

// Details live in one file per university (about 10 MB in all), read on first use instead of bundled.
const detailsDir = join(process.cwd(), "src", "data", "details");
const detailsCache = new Map<string, Record<string, ProgramDetails>>();

export function getProgramDetails(p: Program): ProgramDetails | null {
  if (!detailsCache.has(p.uni)) {
    const file = join(detailsDir, `${p.uni}.json`);
    detailsCache.set(p.uni, existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {});
  }
  return detailsCache.get(p.uni)![p.id] ?? null;
}

/** Distinct values of a program field, most frequent first. */
export function facet<K extends "city" | "degree" | "language" | "field">(key: K) {
  const counts = new Map<string, number>();
  for (const p of programs) counts.set(p[key], (counts.get(p[key]) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
}

export const totals = {
  universities: universities.length,
  programs: programs.length,
  english: programs.filter((p) => p.language === "English").length,
  open: programs.filter((p) => p.open).length,
  minFee: Math.min(...programs.map((p) => p.fee ?? Infinity)),
  maxDiscount: Math.round(Math.max(...programs.map((p) => p.discount ?? 0))),
  discountUnis: new Set(programs.filter((p) => p.discount).map((p) => p.uni)).size,
};

export type ProgramQuery = {
  q?: string;
  city?: string;
  degree?: string;
  language?: string;
  field?: string;
  uni?: string;
  max?: string;
  open?: string;
  sort?: string;
  page?: string;
};

export const PAGE_SIZE = 24;

// Matches the English name, the name in the page language and the university.
export function searchPrograms(query: ProgramQuery, locale: Locale) {
  const q = query.q?.trim().toLocaleLowerCase();
  const max = Number(query.max) || null;
  let list = programs.filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q) || p.uniName.toLowerCase().includes(q) || programName(p.name, locale).toLocaleLowerCase().includes(q)) &&
      (!query.city || p.city === query.city) &&
      (!query.degree || p.degree === query.degree) &&
      (!query.language || p.language === query.language) &&
      (!query.field || p.field === query.field) &&
      (!query.uni || p.uni === query.uni) &&
      (!max || (p.fee !== null && p.fee <= max)) &&
      (!query.open || p.open),
  );

  const byFee = (dir: 1 | -1) => (a: Program, b: Program) =>
    ((a.fee ?? Infinity) - (b.fee ?? Infinity)) * dir;
  if (query.sort === "fee-asc") list = list.sort(byFee(1));
  else if (query.sort === "fee-desc") list = list.sort(byFee(-1));
  else if (query.sort === "name") list = list.sort((a, b) => programName(a.name, locale).localeCompare(programName(b.name, locale), locale));

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(query.page) || 1), pages);
  return {
    total: list.length,
    page,
    pages,
    items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  };
}

/** One open English bachelor's per popular field, biggest discount first, each from a different university. */
export function featuredPrograms() {
  const fields = ["Medicine & Health", "Computer Science & IT", "Engineering", "Business & Management"];
  const used = new Set<string>();
  return fields.flatMap((field) => {
    const pick = programs
      .filter((p) => p.field === field && p.open && p.fee && p.language === "English" && p.degree === "Bachelor's Degree" && !used.has(p.uni))
      .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0) || a.fee! - b.fee!)[0];
    if (!pick) return [];
    used.add(pick.uni);
    return [pick];
  });
}

export function similarPrograms(p: Program, limit = 6) {
  return programs
    .filter((x) => x.id !== p.id && x.field === p.field && x.degree === p.degree)
    .sort((a, b) => Number(b.city === p.city) - Number(a.city === p.city))
    .slice(0, limit);
}
