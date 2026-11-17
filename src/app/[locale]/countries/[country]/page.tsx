import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoverCard, CtaBox, PageHero } from "@/components/ui";
import { locales } from "@/i18n/config";
import { getMessages, t } from "@/i18n/dictionary";
import { getCountries, getCountry, getScholarships, getUniversitiesByCountry, localizedName } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => getCountries().map((c) => ({ locale, country: c.id })));
}

type Props = { params: Promise<{ locale: string; country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const country = getCountry((await params).country);
  if (!country) return {};
  const m = getMessages(locale);
  const unis = getUniversitiesByCountry(country.id);
  return pageMetadata({
    locale,
    path: `/countries/${country.id}`,
    title: t(m, "universities_in", { country: country.name[locale] }),
    description: `${t(m, "universities_in", { country: country.name[locale] })}: ${unis.map((u) => localizedName(u, locale)).join(", ")}`,
    image: country.cover,
  });
}

export default async function CountryPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const country = getCountry((await params).country);
  if (!country) notFound();
  const m = getMessages(locale);
  const unis = getUniversitiesByCountry(country.id);
  const scholarships = getScholarships().filter((s) => s.country === country.id);

  return (
    <>
      <PageHero
        title={t(m, "universities_in", { country: country.name[locale] })}
        subtitle={t(m, "universities_count", { n: unis.length })}
        image={country.cover}
        crumbs={[
          { href: `/${locale}`, label: t(m, "breadcrumb_home") },
          { href: `/${locale}/countries`, label: t(m, "nav_countries") },
          { label: country.name[locale] },
        ]}
      />
      <section className="py-16">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {unis.map((u) => (
              <CoverCard
                key={u.id}
                href={`/${locale}/universities/${u.id}`}
                image={u.cover}
                title={localizedName(u, locale)}
                badge={u.city}
                meta={u.name[locale] && u.name[locale] !== u.nativeName ? u.nativeName : undefined}
              />
            ))}
          </div>

          {scholarships.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-bold text-ink">{t(m, "scholarships_title")}</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {scholarships.map((s) => (
                  <CoverCard key={s.id} href={`/${locale}/scholarships/${s.id}`} image={s.cover} title={localizedName(s, locale)} />
                ))}
              </div>
            </div>
          )}

          <CtaBox locale={locale} desc={t(m, "countries_desc")} />
        </div>
      </section>
    </>
  );
}
