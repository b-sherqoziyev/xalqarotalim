import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { ListLink } from "@/components/ui";
import { locales } from "@/i18n/config";
import { getMessages, t } from "@/i18n/dictionary";
import { getDoc, getNews, getNewsItem, localizedName } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { excerpt, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => getNews().map((n) => ({ locale, id: n.id })));
}

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const item = getNewsItem((await params).id);
  const doc = item && getDoc("news", item.id, locale);
  if (!item || !doc) return {};
  return pageMetadata({
    locale,
    path: `/news/${item.id}`,
    title: localizedName(item, locale),
    description: excerpt(doc.body) ?? doc.front.description,
    keywords: doc.front.keywords,
    image: item.cover,
    available: doc.available,
    sourceLocale: doc.locale,
  });
}

export default async function NewsItemPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const item = getNewsItem((await params).id);
  if (!item) notFound();
  const doc = getDoc("news", item.id, locale);
  if (!doc) notFound();
  const m = getMessages(locale);
  const name = localizedName(item, locale);
  const more = getNews().filter((n) => n.id !== item.id).slice(0, 4);
  return (
    <Article
      locale={locale}
      doc={doc}
      title={name}
      cover={item.cover}
      subtitle={item.date ? <time dateTime={item.date}>{item.date}</time> : undefined}
      crumbs={[
        { href: `/${locale}`, label: t(m, "breadcrumb_home") },
        { href: `/${locale}/news`, label: t(m, "nav_news") },
        { label: name },
      ]}
      after={
        <section className="mx-auto mt-16 max-w-[860px]" aria-labelledby="more-news">
          <h2 id="more-news" className="mb-6 text-2xl font-bold text-ink">
            {t(m, "news_title")}
          </h2>
          <div className="grid gap-4">
            {more.map((n) => (
              <ListLink key={n.id} href={`/${locale}/news/${n.id}`} title={localizedName(n, locale)} />
            ))}
          </div>
        </section>
      }
    />
  );
}
