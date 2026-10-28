import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, localize, type Locale } from "./config";
import ru from "./dictionaries/ru";
import az from "./dictionaries/az";
import en from "./dictionaries/en";
import tr from "./dictionaries/tr";
import kk from "./dictionaries/kk";
import zh from "./dictionaries/zh";
import es from "./dictionaries/es";
import fr from "./dictionaries/fr";

const dictionaries = { ru, az, tr, kk, en, zh, es, fr };

/** Current locale from the [lang] root segment, its dictionary and a link helper. */
export async function getI18n() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return i18nFor(locale);
}

export function i18nFor(locale: Locale) {
  return {
    locale,
    t: dictionaries[locale],
    href: (path: string) => localize(locale, path),
  };
}

export type I18n = ReturnType<typeof i18nFor>;
