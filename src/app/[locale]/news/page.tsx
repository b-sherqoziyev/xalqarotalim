import type { Metadata } from "next";
import { CoverCard, PageHero } from "@/components/ui";
import { getMessages, t } from "@/i18n/dictionary";
import { getNews, localizedName } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return pageMetadata({ locale, path: "/news", title: t(m, "news_title"), description: t(m, "news_desc") });
}

export default async function NewsPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <>
      <PageHero
        title={t(m, "news_title")}
        subtitle={t(m, "news_desc")}
        crumbs={[{ href: `/${locale}`, label: t(m, "breadcrumb_home") }, { label: t(m, "nav_news") }]}
      />
      <section className="py-16">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {getNews().map((n) => (
            <CoverCard
              key={n.id}
              href={`/${locale}/news/${n.id}`}
              image={n.cover}
              title={localizedName(n, locale)}
              meta={n.date ? <time dateTime={n.date}>{n.date}</time> : undefined}
            />
          ))}
        </div>
      </section>
    </>
  );
}
