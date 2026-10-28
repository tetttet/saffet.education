// Shared by proxy, server and client code: keep it free of server-only imports.
export const locales = ["ru", "az", "tr", "kk", "en", "zh", "es", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  az: "Azərbaycan",
  tr: "Türkçe",
  kk: "Қазақша",
  en: "English",
  zh: "中文",
  es: "Español",
  fr: "Français",
};
export const intlLocale: Record<Locale, string> = {
  ru: "ru-RU",
  az: "az-Latn-AZ",
  tr: "tr-TR",
  kk: "kk-KZ",
  en: "en-GB",
  zh: "zh-CN",
  es: "es-ES",
  fr: "fr-FR",
};

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** Prefix an app path with the locale: ("az", "/programs") -> "/az/programs". */
export const localize = (locale: Locale, path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`);

/** Replace {name} placeholders. */
export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
