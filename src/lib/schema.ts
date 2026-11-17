import { z } from "zod";
import { locales } from "@/i18n/config";

const localeEnum = z.enum(locales);

/** Text that exists in some (not necessarily all) languages */
export const localizedText = z.partialRecord(localeEnum, z.string().trim().min(1));
/** Text that must exist in every language */
export const fullyLocalizedText = z.record(localeEnum, z.string().trim().min(1));

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id faqat kichik lotin harflari, raqam va '-' dan iborat bo'lishi kerak");

const imagePath = z
  .string()
  .regex(/^\/images\/[\w\-./]+\.(webp|png|jpe?g|svg|avif)$/, "rasm yo'li /images/... ko'rinishida bo'lishi kerak");

const legacyUrls = z.partialRecord(localeEnum, z.string().startsWith("/"));

export const countrySchema = z.object({
  id: slug,
  order: z.number().int().positive(),
  name: fullyLocalizedText,
  cover: imagePath,
});

export const universitySchema = z.object({
  id: slug,
  country: slug,
  city: z.string().min(1),
  nativeName: z.string().min(1),
  order: z.number().int().positive(),
  name: localizedText,
  cover: imagePath.nullable(),
  legacy: legacyUrls.default({}),
});

export const scholarshipSchema = z.object({
  id: slug,
  country: slug,
  order: z.number().int().positive(),
  name: localizedText,
  cover: imagePath.nullable(),
  legacy: legacyUrls.default({}),
});

export const newsSchema = z.object({
  id: slug,
  order: z.number().int().positive(),
  /** optional publication date, YYYY-MM-DD */
  date: z.iso.date().optional(),
  name: localizedText,
  cover: imagePath.nullable(),
  legacy: legacyUrls.default({}),
});

/** Front matter of every content/<collection>/<id>/<locale>.md file */
export const docFrontmatterSchema = z.object({
  title: z.string().default(""),
  seoTitle: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  legacyUrl: z.string().optional(),
  cover: imagePath.nullable().optional(),
});

export const settingsSchema = z.object({
  siteName: z.string(),
  siteUrl: z.url(),
  phones: z.array(z.string()).min(1),
  email: z.email(),
  telegram: z.url(),
  whatsapp: z.url(),
  managers: z.object({ education: z.url(), translations: z.url() }),
  socials: z.array(z.object({ id: z.string(), label: z.string(), url: z.url() })),
  mapEmbed: z.url(),
  mapLink: z.url(),
  tagline: fullyLocalizedText,
  address: fullyLocalizedText,
  workingHours: fullyLocalizedText,
  stats: z.array(z.object({ value: z.string(), label: z.string() })),
});

export const mediaSchema = z.record(
  z.string(),
  z.object({ width: z.number(), height: z.number(), legacyId: z.string().optional() }),
);

export const redirectsSchema = z.array(
  z.object({ source: z.string().startsWith("/"), destination: z.string().startsWith("/") }),
);

export type Country = z.infer<typeof countrySchema>;
export type University = z.infer<typeof universitySchema>;
export type Scholarship = z.infer<typeof scholarshipSchema>;
export type NewsItem = z.infer<typeof newsSchema>;
export type DocFrontmatter = z.infer<typeof docFrontmatterSchema>;
export type Settings = z.infer<typeof settingsSchema>;
