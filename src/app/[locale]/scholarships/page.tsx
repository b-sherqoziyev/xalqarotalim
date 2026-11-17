import type { Metadata } from "next";
import { CoverCard, PageHero } from "@/components/ui";
import { getMessages, t } from "@/i18n/dictionary";
import { getScholarships, localizedName } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return pageMetadata({ locale, path: "/scholarships", title: t(m, "scholarships_title"), description: t(m, "scholarships_desc") });
}

export default async function ScholarshipsPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return (
    <>
      <PageHero
        title={t(m, "scholarships_title")}
        subtitle={t(m, "scholarships_desc")}
        crumbs={[{ href: `/${locale}`, label: t(m, "breadcrumb_home") }, { label: t(m, "nav_scholarships") }]}
      />
      <section className="py-16">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {getScholarships().map((s) => (
            <CoverCard key={s.id} href={`/${locale}/scholarships/${s.id}`} image={s.cover} title={localizedName(s, locale)} />
          ))}
        </div>
      </section>
    </>
  );
}
