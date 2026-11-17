import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { CoverCard } from "@/components/ui";
import { locales } from "@/i18n/config";
import { getMessages, t } from "@/i18n/dictionary";
import { getCountry, getDoc, getUniversities, getUniversitiesByCountry, getUniversity, localizedName } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { excerpt, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => getUniversities().map((u) => ({ locale, id: u.id })));
}

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const uni = getUniversity((await params).id);
  const doc = uni && getDoc("universities", uni.id, locale);
  if (!uni || !doc) return {};
  return pageMetadata({
    locale,
    path: `/universities/${uni.id}`,
    title: localizedName(uni, locale),
    description: excerpt(doc.body) ?? doc.front.description,
    keywords: doc.front.keywords,
    image: uni.cover,
    available: doc.available,
    sourceLocale: doc.locale,
  });
}

export default async function UniversityPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const uni = getUniversity((await params).id);
  if (!uni) notFound();
  const doc = getDoc("universities", uni.id, locale);
  if (!doc) notFound();
  const m = getMessages(locale);
  const country = getCountry(uni.country)!;
  const name = localizedName(uni, locale);
  const others = getUniversitiesByCountry(uni.country).filter((u) => u.id !== uni.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: uni.nativeName,
    alternateName: name !== uni.nativeName ? name : undefined,
    address: { "@type": "PostalAddress", addressLocality: uni.city, addressCountry: country.name.en },
  };

  return (
    <>
      <Article
        locale={locale}
        doc={doc}
        title={name}
        cover={uni.cover}
        heroImage={country.cover}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
            {name !== uni.nativeName && <span className="italic">{uni.nativeName}</span>}
            <span className="inline-flex items-center gap-1.5">
              <i className="bi bi-geo-alt-fill text-accent" aria-hidden /> {uni.city}, {country.name[locale]}
            </span>
          </span>
        }
        crumbs={[
          { href: `/${locale}`, label: t(m, "breadcrumb_home") },
          { href: `/${locale}/countries`, label: t(m, "nav_countries") },
          { href: `/${locale}/countries/${country.id}`, label: country.name[locale] },
          { label: name },
        ]}
        after={
          others.length > 0 && (
            <section className="mx-auto mt-16 max-w-[1200px]" aria-labelledby="others">
              <h2 id="others" className="mb-6 text-2xl font-bold text-ink">
                {t(m, "other_universities")}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((u) => (
                  <CoverCard key={u.id} href={`/${locale}/universities/${u.id}`} image={u.cover} title={localizedName(u, locale)} badge={u.city} />
                ))}
              </div>
            </section>
          )
        }
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
