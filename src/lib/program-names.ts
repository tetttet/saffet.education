import "server-only";
import namesJson from "@/data/program-names.json";
import type { Locale } from "@/i18n/config";

// Programme names come from the source data in English. src/data/program-names.json holds each name
// without its trailing notes, keyed in lower case, as [ru, az, tr, kk, zh, es, fr]; notes such as
// "(Thesis)" are translated from NOTES below, so they read the same on every programme.
const ORDER = ["ru", "az", "tr", "kk", "zh", "es", "fr"] as const;
const names = namesJson as Record<string, string[]>;

// [pattern, ru, az, tr, kk, zh, es, fr]; null keeps the note as it is.
const NOTES: [RegExp, ...(string | null)[]][] = [
  [/^(with\s+)?thesis$/i, "с диссертацией", "dissertasiya ilə", "Tezli", "диссертациямен", "论文型", "con tesis", "avec mémoire"],
  [/^(non|without)\s*[-–]?\s*thesis$/i, "без диссертации", "dissertasiyasız", "Tezsiz", "диссертациясыз", "非论文型", "sin tesis", "sans mémoire"],
  [/^turkish$/i, "на турецком", "türk dilində", "Türkçe", "түрік тілінде", "土耳其语授课", "en turco", "en turc"],
  [/^english$/i, "на английском", "ingilis dilində", "İngilizce", "ағылшын тілінде", "英语授课", "en inglés", "en anglais"],
  [/^russian$/i, "на русском", "rus dilində", "Rusça", "орыс тілінде", "俄语授课", "en ruso", "en russe"],
  [/^german$/i, "на немецком", "alman dilində", "Almanca", "неміс тілінде", "德语授课", "en alemán", "en allemand"],
  [/^arabic$/i, "на арабском", "ərəb dilində", "Arapça", "араб тілінде", "阿拉伯语授课", "en árabe", "en arabe"],
  [/^french$/i, "на французском", "fransız dilində", "Fransızca", "француз тілінде", "法语授课", "en francés", "en français"],
  [/^(english\s*&\s*turkish|combined\s+en\/tr)$/i, "на английском и турецком", "ingilis və türk dillərində", "İngilizce ve Türkçe", "ағылшын және түрік тілдерінде", "英语和土耳其语授课", "en inglés y turco", "en anglais et en turc"],
  [/^combined\s+ar\/tr$/i, "на арабском и турецком", "ərəb və türk dillərində", "Arapça ve Türkçe", "араб және түрік тілдерінде", "阿拉伯语和土耳其语授课", "en árabe y turco", "en arabe et en turc"],
  [/^distance\s+(learning|education)$/i, "дистанционно", "distant təhsil", "Uzaktan Eğitim", "қашықтан оқыту", "远程教育", "a distancia", "à distance"],
  [/^evening\s+(education|class)$/i, "вечерняя форма", "axşam təhsili", "İkinci Öğretim", "кешкі оқу", "夜间授课", "en horario de tarde", "cours du soir"],
  [/^combined(\s+phd)?$/i, "интегрированная докторантура", "inteqrasiya olunmuş doktorantura", "Bütünleşik Doktora", "біріктірілген докторантура", "本硕博连读", "doctorado integrado", "doctorat intégré"],
  [/^with\s+bachelor[’']s\s+degree$/i, "после бакалавриата", "bakalavr dərəcəsi ilə", "Lisans Derecesi ile", "бакалавр дәрежесімен", "本科直博", "con título de grado", "après la licence"],
  [/^joint\s+degree$/i, "совместная степень", "birgə dərəcə", "Ortak Diploma", "бірлескен дәреже", "联合学位", "título conjunto", "diplôme conjoint"],
  [/^interdisciplinary$/i, "междисциплинарная", "fənlərarası", "Disiplinlerarası", "пәнаралық", "跨学科", "interdisciplinario", "interdisciplinaire"],
  [/^\d+%\s*TR\s*-\s*\d+%\s*EN$/i, null, null, null, null, null, null, null],
];

const key = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const cache = new Map<string, string>();

/** Programme name in the page language; English, or the original for a name not yet translated. */
export function programName(name: string, locale: Locale) {
  const i = ORDER.indexOf(locale as (typeof ORDER)[number]);
  if (i < 0) return name;
  const cached = cache.get(`${locale}|${name}`);
  if (cached) return cached;

  // Peel known notes off the end: "Business Administration (English) (Non-Thesis)".
  const notes: string[] = [];
  let base = name.trim();
  for (;;) {
    const m = base.match(/^(.*\S)\s*\(([^()]+)\)$/);
    const row = m && NOTES.find(([re]) => re.test(m[2].trim()));
    if (!m || !row) break;
    notes.unshift((row[1 + i] as string | null) ?? m[2].trim());
    base = m[1];
  }
  const translated = names[key(base)]?.[i];
  // Chinese takes full-width brackets with no space before them.
  const tail = locale === "zh" ? notes.map((n) => `（${n}）`).join("") : notes.map((n) => ` (${n})`).join("");
  const result = translated ? translated + tail : name;
  cache.set(`${locale}|${name}`, result);
  return result;
}
