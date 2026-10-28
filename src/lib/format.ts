// Formatting shared by server and client components. Translated labels live in src/i18n.
import { intlLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ru";

export const label = (map: Record<string, string>, key: string | null | undefined) =>
  key ? (map[key] ?? key) : "—";

export const usd = (n: number | null | undefined, onRequest = "—") =>
  n == null ? onRequest : "$" + Math.round(n).toLocaleString("en-US");

export const usdShort = (n: number | null | undefined) =>
  n == null ? "—" : n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `$${Math.round(n)}`;

// Thousands separators as ICU prints them. Hardcoded instead of read from Intl: browsers may lack a
// locale's data (kk-KZ gives "5,225" there but "5 225" in Node), and a client component would then
// render different text than the server did.
const GROUP: Record<Locale, string> = { ru: " ", az: ".", tr: ".", kk: " ", en: ",", zh: ",", es: ".", fr: " " };

/** Whole number with thousands separators, the same on the server and in every browser. */
export function num(n: number, locale: Locale) {
  const digits = String(Math.abs(Math.round(n)));
  // Spanish leaves four-digit numbers ungrouped: "5225", "52.250".
  const grouped = locale === "es" && digits.length <= 4 ? digits : digits.replace(/\B(?=(\d{3})+$)/g, GROUP[locale]);
  return (n < 0 ? "-" : "") + grouped;
}

export const date = (iso: string | null, locale: Locale) =>
  iso
    ? new Date(iso).toLocaleDateString(intlLocale[locale], { day: "numeric", month: "long", year: "numeric" })
    : null;

/** "1 вуз" / "2 вуза" / "5 вузов", picking the word form by the language's plural rules. */
export function plural(n: number, locale: Locale, words: { one: string; few?: string; many?: string; other: string }) {
  const form = new Intl.PluralRules(intlLocale[locale]).select(n) as keyof typeof words;
  return `${num(n, locale)} ${words[form] ?? words.other}`;
}

/** "2 года" / "2 years" / "2 il" using the dictionary's plural words. */
export function years(n: number | null, words: Dictionary["years"]) {
  if (n == null) return "—";
  // Fractions take the "few" form in Russian: "1.5 года", not "1.5 лет".
  if (!Number.isInteger(n)) return `${n} ${words.few}`;
  const m10 = n % 10, m100 = n % 100;
  const word = m10 === 1 && m100 !== 11 ? words.one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? words.few : words.many;
  return `${n} ${n === 1 ? words.one : word}`;
}

/** Two-letter monogram: "Istanbul Aydin University" -> "IA", "Acıbadem University" -> "AC". */
export function initials(name: string) {
  const words = name.replace(/University|Üniversitesi/gi, "").split(/[\s-]+/).filter(Boolean);
  const letters = words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? name).slice(0, 2);
  return letters.toLocaleUpperCase("tr-TR");
}

/** Stable hue from a string, used for card covers instead of photos. */
export function hue(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Intake months come from the data in English ("January, August"); this names them in the page language. */
export function intakes(value: string | null | undefined, locale: Locale) {
  if (!value) return null;
  const month = new Intl.DateTimeFormat(intlLocale[locale], { month: "long" });
  return value
    .split(",")
    .map((m) => m.trim())
    .map((m) => {
      const i = MONTHS.indexOf(m);
      if (i < 0) return m;
      const name = month.format(new Date(2000, i, 1));
      return name.charAt(0).toLocaleUpperCase(intlLocale[locale]) + name.slice(1);
    })
    .join(", ");
}
