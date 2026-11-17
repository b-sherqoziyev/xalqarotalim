import type { Metadata } from "next";
import Image from "next/image";
import { ContactFormBlock } from "@/components/ContactSection";
import { Markdown } from "@/components/Markdown";
import { FallbackNotice, PageHero } from "@/components/ui";
import { getMessages, t } from "@/i18n/dictionary";
import { getDoc, getMediaSize, getSettings } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { excerpt, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const doc = getDoc("pages", "translations", locale);
  return pageMetadata({
    locale,
    path: "/translations",
    title: t(m, "translations_title"),
    description: (doc && excerpt(doc.body)) ?? doc?.front.description ?? t(m, "serv_trans_desc"),
    keywords: doc?.front.keywords,
  });
}

export default async function TranslationsPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const s = getSettings();
  const doc = getDoc("pages", "translations", locale);
  const cover = doc?.front.cover;
  const size = cover ? getMediaSize(cover) : undefined;

  return (
    <>
      <PageHero
        title={doc?.front.title || t(m, "translations_title")}
        subtitle={t(m, "serv_trans_desc")}
        crumbs={[{ href: `/${locale}`, label: t(m, "breadcrumb_home") }, { label: t(m, "nav_translations") }]}
      />
      <section className="py-16">
        <div className="container-x grid items-start gap-12 lg:grid-cols-[1fr_420px]">
          <div>
            {doc?.isFallback && <FallbackNotice locale={locale} shown={doc.locale} />}
            <div className="grid items-center gap-8 sm:grid-cols-[200px_1fr]">
              {cover && (
                <Image
                  src={cover}
                  alt=""
                  width={size?.width ?? 400}
                  height={size?.height ?? 400}
                  className="mx-auto h-auto w-48 sm:w-full"
                />
              )}
              {doc && <Markdown source={doc.body} />}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href={s.managers.translations} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <i className="bi bi-telegram" aria-hidden /> {t(m, "btn_telegram")}
              </a>
              <a href={`tel:${s.phones[1].replace(/\s/g, "")}`} className="btn-outline">
                <i className="bi bi-telephone-fill" aria-hidden /> {s.phones[1]}
              </a>
            </div>
          </div>
          <ContactFormBlock locale={locale} />
        </div>
      </section>
    </>
  );
}
