import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { locales } from "@/i18n/config";
import { getMessages, t } from "@/i18n/dictionary";
import { getDoc, getScholarship, getScholarships, localizedName } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { excerpt, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => getScholarships().map((s) => ({ locale, id: s.id })));
}

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const item = getScholarship((await params).id);
  const doc = item && getDoc("scholarships", item.id, locale);
  if (!item || !doc) return {};
  return pageMetadata({
    locale,
    path: `/scholarships/${item.id}`,
    title: localizedName(item, locale),
    description: excerpt(doc.body) ?? doc.front.description,
    keywords: doc.front.keywords,
    image: item.cover,
    available: doc.available,
    sourceLocale: doc.locale,
  });
}

export default async function ScholarshipPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const item = getScholarship((await params).id);
  if (!item) notFound();
  const doc = getDoc("scholarships", item.id, locale);
  if (!doc) notFound();
  const m = getMessages(locale);
  const name = localizedName(item, locale);
  return (
    <Article
      locale={locale}
      doc={doc}
      title={name}
      cover={item.cover}
      crumbs={[
        { href: `/${locale}`, label: t(m, "breadcrumb_home") },
        { href: `/${locale}/scholarships`, label: t(m, "nav_scholarships") },
        { label: name },
      ]}
    />
  );
}
