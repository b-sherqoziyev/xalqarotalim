import type { Metadata } from "next";
import { ContactDetails, ContactFormBlock } from "@/components/ContactSection";
import { Markdown } from "@/components/Markdown";
import { FallbackNotice, PageHero } from "@/components/ui";
import { getMessages, t } from "@/i18n/dictionary";
import { getDoc, getSettings } from "@/lib/content";
import { resolveLocale } from "@/lib/params";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const s = getSettings();
  return pageMetadata({ locale, path: "/contacts", title: t(m, "nav_contacts"), description: `${s.address[locale]} · ${s.phones.join(", ")}` });
}

export default async function ContactsPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  const s = getSettings();
  const doc = getDoc("pages", "contacts", locale);

  return (
    <>
      <PageHero
        title={doc?.front.title || t(m, "contact_title")}
        subtitle={s.tagline[locale]}
        crumbs={[{ href: `/${locale}`, label: t(m, "breadcrumb_home") }, { label: t(m, "nav_contacts") }]}
      />
      <section className="py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <ContactDetails locale={locale} />
          <div id="form" className="scroll-mt-28">
            <ContactFormBlock locale={locale} />
          </div>
        </div>
      </section>
      <section className="bg-surface py-16">
        <div className="container-x grid items-start gap-10 lg:grid-cols-2">
          <div>
            {doc?.isFallback && <FallbackNotice locale={locale} shown={doc.locale} />}
            {doc && <Markdown source={doc.body} />}
          </div>
          <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)] lg:sticky lg:top-28">
            <iframe
              src={s.mapEmbed}
              title={t(m, "contact_map")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[420px] w-full border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
