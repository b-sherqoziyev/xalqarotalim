import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { htmlLang, isLocale, locales } from "@/i18n/config";
import { getMessages, t } from "@/i18n/dictionary";
import { getSettings } from "@/lib/content";
import { navItems } from "@/lib/nav";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const s = getSettings();
  return {
    metadataBase: new URL(s.siteUrl),
    title: { default: `${s.siteName} — ${s.tagline[locale]}`, template: `%s | ${s.siteName}` },
    description: getMessages(locale).hero_desc,
    applicationName: s.siteName,
    formatDetection: { telephone: true, email: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0d6efd",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  const s = getSettings();
  const nav = navItems(locale);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: s.siteName,
    url: s.siteUrl,
    logo: `${s.siteUrl}/images/brand/logo.webp`,
    email: s.email,
    telephone: s.phones,
    address: { "@type": "PostalAddress", streetAddress: s.address[locale], addressLocality: "Tashkent", addressCountry: "UZ" },
    sameAs: s.socials.map((x) => x.url),
  };

  return (
    <html lang={htmlLang[locale]}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader
          locale={locale}
          nav={nav}
          brand={s.siteName}
          ctaLabel={t(m, "btn_consultation")}
          ctaHref={s.managers.education}
          labels={{
            open: t(m, "menu_open"),
            close: t(m, "menu_close"),
            language: t(m, "language"),
            skip: t(m, "skip_to_content"),
          }}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} nav={nav} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
