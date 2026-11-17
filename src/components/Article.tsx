import Image from "next/image";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getMediaSize, type Doc } from "@/lib/content";
import { Markdown } from "./Markdown";
import { CtaBox, FallbackNotice, PageHero, type Crumb } from "./ui";

/** Shared layout for university, scholarship and news pages. */
export function Article({
  locale,
  doc,
  title,
  subtitle,
  crumbs,
  cover,
  heroImage,
  after,
  cta = true,
}: {
  locale: Locale;
  doc: Doc;
  title: string;
  subtitle?: ReactNode;
  crumbs: Crumb[];
  cover?: string | null;
  heroImage?: string | null;
  after?: ReactNode;
  cta?: boolean;
}) {
  const size = cover ? getMediaSize(cover) : undefined;
  return (
    <>
      <PageHero title={title} subtitle={subtitle} crumbs={crumbs} image={heroImage} />
      <div className="container-x py-12 sm:py-16">
        <article className="mx-auto max-w-[860px]" lang={doc.isFallback ? doc.locale : undefined}>
          {doc.isFallback && <FallbackNotice locale={locale} shown={doc.locale} />}
          {cover && (
            <div className="mb-10 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
              <Image
                src={cover}
                alt={title}
                width={size?.width ?? 1200}
                height={size?.height ?? 675}
                priority
                sizes="(max-width: 900px) 100vw, 860px"
                className="h-auto max-h-[520px] w-full object-cover"
              />
            </div>
          )}
          <Markdown source={doc.body} />
          {cta && <CtaBox locale={locale} />}
        </article>
        {after}
      </div>
    </>
  );
}
