import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ContactDetails, ContactFormBlock } from "@/components/ContactSection";
import { Markdown } from "@/components/Markdown";
import { CountryCard, CoverCard, ListLink, SectionHeading } from "@/components/ui";
import { getMessages, t, type MessageKey } from "@/i18n/dictionary";
import {
  getCountries,
  getDoc,
  getNews,
  getScholarships,
  getSettings,
  getUniversities,
  getUniversitiesByCountry,
  localizedName,
} from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const s = getSettings();
  const doc = getDoc("pages", "home", locale);
  return {
    ...pageMetadata({ locale, path: "", description: m.hero_desc, keywords: doc?.front.keywords }),
    title: { absolute: `${s.siteName} — ${s.tagline[locale]}` },
  };
}

export default async function HomePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const s = getSettings();
  const about = getDoc("pages", "home", locale);
  const countries = getCountries();
  const stats = [
    ...s.stats.map((x) => ({ value: x.value, label: t(m, x.label as MessageKey) })),
    { value: String(getUniversities().length), label: t(m, "stat_universities") },
    { value: String(countries.length), label: t(m, "stat_countries") },
  ];
  const statColors = ["border-primary text-primary", "border-success text-success", "border-accent text-accent", "border-ink text-ink"];

  const services = [
    { icon: "bi-mortarboard", color: "bg-primary/10 text-primary", title: t(m, "serv_uni_title"), desc: t(m, "serv_uni_desc"), href: `/${locale}/countries` },
    { icon: "bi-file-earmark-text", color: "bg-success/10 text-success", title: t(m, "serv_trans_title"), desc: t(m, "serv_trans_desc"), href: `/${locale}/translations` },
    { icon: "bi-passport", color: "bg-accent/15 text-accent", title: t(m, "serv_visa_title"), desc: t(m, "serv_visa_desc"), href: `/${locale}/contacts` },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden pt-24 pb-16 text-white">
        <Image src="/images/brand/hero.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.4)_100%)]" />
        <div className="container-x text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <i className="bi bi-globe-americas" aria-hidden /> {s.tagline[locale]}
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">{t(m, "hero_title")}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">{t(m, "hero_desc")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/countries`} className="btn-primary px-8 py-4 text-lg">
              {t(m, "btn_view_countries")} <i className="bi bi-arrow-right" aria-hidden />
            </Link>
            <a href={s.managers.education} target="_blank" rel="noopener noreferrer" className="btn-glass px-8 py-4 text-lg">
              <i className="bi bi-telegram" aria-hidden /> {t(m, "btn_consultation")}
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-surface py-20" aria-labelledby="about-title">
        <div className="container-x grid items-start gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">{t(m, "about_label")}</span>
            <h2 id="about-title" className="mt-2 mb-6 text-3xl font-bold text-ink sm:text-4xl">
              {t(m, "about_title")}
            </h2>
            {about && <Markdown source={about.body} />}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:sticky lg:top-28">
            {stats.map((st, i) => (
              <div key={i} className={`card border-t-4 p-7 text-center ${statColors[i % statColors.length]}`}>
                <div className="text-5xl font-bold">{st.value}</div>
                <div className="mt-2 font-medium text-muted">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20" aria-labelledby="services-title">
        <div className="container-x">
          <SectionHeading id="services-title" eyebrow={t(m, "services_label")} title={t(m, "services_title")} />
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((sv) => (
              <Link key={sv.title} href={sv.href} className="group card card-hover p-8">
                <span className={`icon-box mb-6 ${sv.color}`}>
                  <i className={`bi ${sv.icon}`} aria-hidden />
                </span>
                <h3 className="mb-3 text-xl font-bold text-ink group-hover:text-primary">{sv.title}</h3>
                <p className="text-muted">{sv.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section id="countries" className="bg-surface py-20" aria-labelledby="countries-title">
        <div className="container-x">
          <SectionHeading id="countries-title" eyebrow={t(m, "dest_label")} title={t(m, "dest_title")} desc={t(m, "countries_desc")} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((c) => (
              <CountryCard
                key={c.id}
                href={`/${locale}/countries/${c.id}`}
                image={c.cover}
                title={c.name[locale]}
                count={t(m, "universities_count", { n: getUniversitiesByCountry(c.id).length })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Scholarships */}
      <section className="py-20" aria-labelledby="sch-title">
        <div className="container-x">
          <SectionHeading id="sch-title" eyebrow={t(m, "scholarships_label")} title={t(m, "scholarships_title")} desc={t(m, "scholarships_desc")} />
          <div className="grid gap-6 md:grid-cols-3">
            {getScholarships().map((sc) => (
              <CoverCard key={sc.id} href={`/${locale}/scholarships/${sc.id}`} image={sc.cover} title={localizedName(sc, locale)} />
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="bg-surface py-20" aria-labelledby="news-title">
        <div className="container-x">
          <SectionHeading id="news-title" eyebrow={t(m, "news_label")} title={t(m, "news_title")} />
          <div className="grid gap-4 md:grid-cols-2">
            {getNews()
              .slice(0, 6)
              .map((n) => (
                <ListLink key={n.id} href={`/${locale}/news/${n.id}`} title={localizedName(n, locale)} />
              ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={`/${locale}/news`} className="btn-outline">
              {t(m, "btn_all_news")} <i className="bi bi-arrow-right" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-20" aria-labelledby="projects-title">
        <div className="container-x">
          <SectionHeading id="projects-title" eyebrow={t(m, "projects_label")} title={t(m, "projects_title")} desc={t(m, "projects_desc")} />
          <div className="grid gap-6 md:grid-cols-2">
            <Link href={`/${locale}/translations`} className="group card card-hover flex gap-5 p-8">
              <span className="icon-box bg-success/10 text-success">
                <i className="bi bi-translate" aria-hidden />
              </span>
              <span>
                <span className="block text-xl font-bold text-ink group-hover:text-primary">{t(m, "project_translations_title")}</span>
                <span className="mt-2 block text-muted">{t(m, "project_translations_desc")}</span>
              </span>
            </Link>
            <div className="card flex gap-5 p-8">
              <span className="icon-box bg-accent/15 text-accent">
                <i className="bi bi-airplane" aria-hidden />
              </span>
              <span>
                <span className="block text-xl font-bold text-ink">{t(m, "project_tourism_title")}</span>
                <span className="mt-3 inline-flex rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-[#9a6700]">
                  {t(m, "project_tourism_status")}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-surface py-20" aria-labelledby="contact-title">
        <div className="container-x">
          <SectionHeading id="contact-title" eyebrow={t(m, "contact_label")} title={t(m, "contact_title")} />
          <div className="grid gap-10 lg:grid-cols-2">
            <ContactDetails locale={locale} />
            <ContactFormBlock locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
