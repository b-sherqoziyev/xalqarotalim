export const locales = ["uz", "uz-cyrl", "ru", "en", "tr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";

/** BCP 47 tags for <html lang> and hreflang */
export const htmlLang: Record<Locale, string> = {
  uz: "uz",
  "uz-cyrl": "uz-Cyrl",
  ru: "ru",
  en: "en",
  tr: "tr",
};

export const localeNames: Record<Locale, string> = {
  uz: "O'zbekcha",
  "uz-cyrl": "Ўзбекча",
  ru: "Русский",
  en: "English",
  tr: "Türkçe",
};

export const localeShort: Record<Locale, string> = {
  uz: "UZ",
  "uz-cyrl": "ЎЗ",
  ru: "RU",
  en: "EN",
  tr: "TR",
};

/** When a text does not exist in the requested language, the first available one from this list is shown. */
export const fallbackOrder: Record<Locale, Locale[]> = {
  uz: ["uz", "uz-cyrl", "ru", "en", "tr"],
  "uz-cyrl": ["uz-cyrl", "uz", "ru", "en", "tr"],
  ru: ["ru", "uz", "en", "uz-cyrl", "tr"],
  en: ["en", "ru", "uz", "tr", "uz-cyrl"],
  tr: ["tr", "en", "uz", "ru", "uz-cyrl"],
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Pick the best value from a partially translated record. */
export function pickLocalized<T>(
  record: Partial<Record<Locale, T>> | undefined,
  locale: Locale,
): { value: T; locale: Locale } | undefined {
  if (!record) return undefined;
  for (const l of fallbackOrder[locale]) {
    const v = record[l];
    if (v !== undefined && v !== null && v !== "") return { value: v, locale: l };
  }
  return undefined;
}
