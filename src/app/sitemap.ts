import type { MetadataRoute } from "next";
import { htmlLang, locales, type Locale } from "@/i18n/config";
import { getCountries, getDoc, getNews, getScholarships, getSettings, getUniversities, type Collection } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSettings().siteUrl;
  const entries: MetadataRoute.Sitemap = [];

  const add = (path: string, available: readonly Locale[], priority: number) => {
    const languages: Record<string, string> = {};
    for (const l of available) languages[htmlLang[l]] = `${base}/${l}${path}`;
    for (const l of available) {
      entries.push({ url: `${base}/${l}${path}`, priority, alternates: { languages } });
    }
  };
  const availableOf = (col: Collection, id: string) => getDoc(col, id, "uz")?.available ?? [];

  add("", locales, 1);
  for (const p of ["/countries", "/universities", "/scholarships", "/news", "/translations", "/contacts"]) add(p, locales, 0.8);
  for (const c of getCountries()) add(`/countries/${c.id}`, locales, 0.8);
  // only languages with real (not fallback) text are listed
  for (const u of getUniversities()) add(`/universities/${u.id}`, availableOf("universities", u.id), 0.7);
  for (const s of getScholarships()) add(`/scholarships/${s.id}`, availableOf("scholarships", s.id), 0.7);
  for (const n of getNews()) add(`/news/${n.id}`, availableOf("news", n.id), 0.6);
  return entries;
}
