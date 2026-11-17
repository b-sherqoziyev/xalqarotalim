import type { Metadata } from "next";
import { CountryCard, PageHero } from "@/components/ui";
import { getMessages, t } from "@/i18n/dictionary";
import { getCountries, getUniversitiesByCountry } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return pageMetadata({ locale, path: "/countries", title: t(m, "dest_title"), description: t(m, "countries_desc") });
}

export default async function CountriesPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <>
      <PageHero
        title={t(m, "dest_title")}
        subtitle={t(m, "countries_desc")}
        crumbs={[{ href: `/${locale}`, label: t(m, "breadcrumb_home") }, { label: t(m, "nav_countries") }]}
      />
      <section className="py-16">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {getCountries().map((c) => (
            <CountryCard
              key={c.id}
              href={`/${locale}/countries/${c.id}`}
              image={c.cover}
              title={c.name[locale]}
              count={t(m, "universities_count", { n: getUniversitiesByCountry(c.id).length })}
            />
          ))}
        </div>
      </section>
    </>
  );
}
