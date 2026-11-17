import type { Metadata } from "next";
import Link from "next/link";
import { CoverCard, PageHero } from "@/components/ui";
import { getMessages, t } from "@/i18n/dictionary";
import { getCountries, getUniversitiesByCountry, localizedName } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return pageMetadata({ locale, path: "/universities", title: t(m, "universities_title"), description: t(m, "universities_desc") });
}

export default async function UniversitiesPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const countries = getCountries();
  return (
    <>
      <PageHero
        title={t(m, "universities_title")}
        subtitle={t(m, "universities_desc")}
        crumbs={[{ href: `/${locale}`, label: t(m, "breadcrumb_home") }, { label: t(m, "nav_universities") }]}
      >
        <ul className="mt-8 flex flex-wrap gap-2">
          {countries.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur hover:bg-white hover:text-ink">
                {c.name[locale]}
              </a>
            </li>
          ))}
        </ul>
      </PageHero>
      <div className="py-16">
        {countries.map((c) => {
          const unis = getUniversitiesByCountry(c.id);
          if (!unis.length) return null;
          return (
            <section key={c.id} id={c.id} className="container-x mb-16 scroll-mt-28" aria-labelledby={`h-${c.id}`}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 id={`h-${c.id}`} className="text-2xl font-bold text-ink sm:text-3xl">
                  {c.name[locale]}
                </h2>
                <Link href={`/${locale}/countries/${c.id}`} className="shrink-0 font-semibold text-primary hover:underline">
                  {t(m, "universities_count", { n: unis.length })} <i className="bi bi-arrow-right" aria-hidden />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {unis.map((u) => (
                  <CoverCard key={u.id} href={`/${locale}/universities/${u.id}`} image={u.cover} title={localizedName(u, locale)} badge={u.city} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
