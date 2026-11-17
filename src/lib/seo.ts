import type { Metadata } from "next";
import { htmlLang, locales, type Locale } from "@/i18n/config";
import { getSettings } from "./content";

type PageMetaInput = {
  locale: Locale;
  /** path without the locale prefix, e.g. "/universities/istanbul-kent" ("" for home) */
  path: string;
  title?: string;
  description?: string;
  image?: string | null;
  keywords?: string;
  /** languages in which the page really has its own content (default: all) */
  available?: readonly Locale[];
  /** language of the text actually shown, when it differs from `locale` */
  sourceLocale?: Locale;
};

export function clip(text: string | undefined, max = 180): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

/** First real paragraph of a Markdown document, as plain text (for meta descriptions). */
export function excerpt(md: string): string | undefined {
  for (const block of md.split(/\n\s*\n/)) {
    const b = block.trim();
    if (!b || /^(#|!\[|\||::|- |\d+\. |\*\*[^*]+\*\*$)/.test(b)) continue;
    const text = b
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`>#]/g, "")
      .replace(/\\/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 40) return text;
  }
  return undefined;
}

export function pageMetadata(input: PageMetaInput): Metadata {
  const { locale, path, title, description, image, keywords } = input;
  const available = input.available ?? locales;
  const isFallback = Boolean(input.sourceLocale && input.sourceLocale !== locale);
  const canonicalLocale = isFallback ? input.sourceLocale! : locale;
  const languages: Record<string, string> = {};
  for (const l of available) languages[htmlLang[l]] = `/${l}${path}`;
  if (available.includes("uz")) languages["x-default"] = `/uz${path}`;
  const settings = getSettings();
  const desc = clip(description);

  return {
    title,
    description: desc,
    keywords: keywords || undefined,
    alternates: { canonical: `/${canonicalLocale}${path}`, languages },
    robots: isFallback ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title: title ?? settings.siteName,
      description: desc,
      url: `/${locale}${path}`,
      locale: htmlLang[locale].replace("-", "_"),
      images: [{ url: image || "/images/brand/og.jpg" }],
    },
    twitter: { card: "summary_large_image" },
  };
}
