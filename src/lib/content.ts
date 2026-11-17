/**
 * Content layer: reads everything under /content at build time, validates it with zod
 * and exposes typed helpers. Any broken file stops the build with a clear message,
 * so a mistake in the content can never reach the live site.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { fallbackOrder, locales, pickLocalized, type Locale } from "@/i18n/config";
import {
  countrySchema,
  docFrontmatterSchema,
  mediaSchema,
  newsSchema,
  scholarshipSchema,
  settingsSchema,
  universitySchema,
  type Country,
  type DocFrontmatter,
  type NewsItem,
  type Scholarship,
  type Settings,
  type University,
} from "./schema";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const PUBLIC = path.join(ROOT, "public");

export type Collection = "universities" | "scholarships" | "news" | "pages";

export type Doc = {
  /** language of the text actually shown */
  locale: Locale;
  /** true when the requested language was missing and another one is shown */
  isFallback: boolean;
  /** languages in which this document really exists */
  available: Locale[];
  front: DocFrontmatter;
  body: string;
};

class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`[content] ${path.relative(ROOT, file)}: ${message}`);
  }
}

function readJson<T>(file: string, schema: z.ZodType<T>): T {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    throw new ContentError(file, `JSON o'qib bo'lmadi — ${(e as Error).message}`);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ContentError(file, z.prettifyError(parsed.error));
  }
  return parsed.data;
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort();
}

function assertPublicFile(file: string, publicPath: string | null | undefined) {
  if (!publicPath) return;
  if (!fs.existsSync(path.join(PUBLIC, publicPath))) {
    throw new ContentError(file, `rasm topilmadi: public${publicPath}`);
  }
}

const IMAGE_IN_MD = /!\[[^\]]*\]\(([^)\s]+)\)/g;

function readDoc(file: string): { front: DocFrontmatter; body: string } {
  const src = fs.readFileSync(file, "utf8");
  const { data, content } = matter(src);
  const parsed = docFrontmatterSchema.safeParse(data);
  if (!parsed.success) throw new ContentError(file, z.prettifyError(parsed.error));
  for (const m of content.matchAll(IMAGE_IN_MD)) {
    if (m[1].startsWith("/")) assertPublicFile(file, m[1]);
  }
  assertPublicFile(file, parsed.data.cover);
  return { front: parsed.data, body: content.trim() };
}

type Store = {
  settings: Settings;
  countries: Country[];
  universities: University[];
  scholarships: Scholarship[];
  news: NewsItem[];
  docs: Map<string, Partial<Record<Locale, { front: DocFrontmatter; body: string }>>>;
  media: z.infer<typeof mediaSchema>;
};

function loadCollection<T extends { id: string }>(
  name: Exclude<Collection, "pages">,
  schema: z.ZodType<T>,
  docs: Store["docs"],
): T[] {
  const dir = path.join(CONTENT, name);
  return listDirs(dir).map((id) => {
    const folder = path.join(dir, id);
    const metaFile = path.join(folder, "index.json");
    const meta = readJson(metaFile, schema);
    if (meta.id !== id) throw new ContentError(metaFile, `"id" (${meta.id}) papka nomi (${id}) bilan bir xil bo'lishi kerak`);
    const byLocale: Partial<Record<Locale, { front: DocFrontmatter; body: string }>> = {};
    for (const l of locales) {
      const f = path.join(folder, `${l}.md`);
      if (fs.existsSync(f)) byLocale[l] = readDoc(f);
    }
    if (Object.keys(byLocale).length === 0) {
      throw new ContentError(folder, "kamida bitta til fayli (masalan uz.md) bo'lishi kerak");
    }
    const cover = (meta as { cover?: string | null }).cover;
    assertPublicFile(metaFile, cover);
    docs.set(`${name}/${id}`, byLocale);
    return meta;
  });
}

function load(): Store {
  const docs: Store["docs"] = new Map();
  const settings = readJson(path.join(CONTENT, "settings.json"), settingsSchema);
  const media = readJson(path.join(CONTENT, "media.json"), mediaSchema);

  const countryDir = path.join(CONTENT, "countries");
  const countries = fs
    .readdirSync(countryDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const file = path.join(countryDir, f);
      const c = readJson(file, countrySchema);
      if (`${c.id}.json` !== f) throw new ContentError(file, `"id" fayl nomi bilan bir xil bo'lishi kerak`);
      assertPublicFile(file, c.cover);
      return c;
    })
    .sort((a, b) => a.order - b.order);

  const countryIds = new Set(countries.map((c) => c.id));
  const universities = loadCollection("universities", universitySchema, docs);
  for (const u of universities) {
    if (!countryIds.has(u.country)) {
      throw new ContentError(path.join(CONTENT, "universities", u.id, "index.json"), `noma'lum davlat: "${u.country}"`);
    }
  }
  const scholarships = loadCollection("scholarships", scholarshipSchema, docs);
  const news = loadCollection("news", newsSchema, docs);

  for (const id of listDirs(path.join(CONTENT, "pages"))) {
    const byLocale: Partial<Record<Locale, { front: DocFrontmatter; body: string }>> = {};
    for (const l of locales) {
      const f = path.join(CONTENT, "pages", id, `${l}.md`);
      if (fs.existsSync(f)) byLocale[l] = readDoc(f);
    }
    docs.set(`pages/${id}`, byLocale);
  }

  return {
    settings,
    media,
    countries,
    universities: universities.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
    scholarships: scholarships.sort((a, b) => a.order - b.order),
    news: news.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.order - b.order),
    docs,
  };
}

let store: Store | undefined;
function db(): Store {
  if (!store) store = load();
  return store;
}

// ------------------------------------------------------------------ public API
export const getSettings = () => db().settings;
export const getCountries = () => db().countries;
export const getCountry = (id: string) => db().countries.find((c) => c.id === id);
export const getUniversities = () => db().universities;
export const getUniversity = (id: string) => db().universities.find((u) => u.id === id);
export const getUniversitiesByCountry = (country: string) =>
  db().universities.filter((u) => u.country === country);
export const getScholarships = () => db().scholarships;
export const getScholarship = (id: string) => db().scholarships.find((s) => s.id === id);
export const getNews = () => db().news;
export const getNewsItem = (id: string) => db().news.find((n) => n.id === id);

export function getMediaSize(src: string): { width: number; height: number } | undefined {
  const m = db().media[src];
  return m && m.width > 0 ? { width: m.width, height: m.height } : undefined;
}

export function getDoc(collection: Collection, id: string, locale: Locale): Doc | undefined {
  const all = db().docs.get(`${collection}/${id}`);
  if (!all) return undefined;
  const available = locales.filter((l) => all[l]);
  for (const l of fallbackOrder[locale]) {
    const d = all[l];
    if (d) return { locale: l, isFallback: l !== locale, available, front: d.front, body: d.body };
  }
  return undefined;
}

export function localizedName(
  item: { name: Partial<Record<Locale, string>>; nativeName?: string },
  locale: Locale,
): string {
  // a missing translation is better replaced by the native name than by a foreign language
  return item.name[locale] ?? item.nativeName ?? pickLocalized(item.name, locale)?.value ?? "";
}
