import type { Locale } from "@/i18n/config";
import { getMessages, t } from "@/i18n/dictionary";

export function navItems(locale: Locale) {
  const m = getMessages(locale);
  return [
    { href: `/${locale}`, label: t(m, "nav_home") },
    { href: `/${locale}/countries`, label: t(m, "nav_countries") },
    { href: `/${locale}/universities`, label: t(m, "nav_universities") },
    { href: `/${locale}/scholarships`, label: t(m, "nav_scholarships") },
    { href: `/${locale}/news`, label: t(m, "nav_news") },
    { href: `/${locale}/translations`, label: t(m, "nav_translations") },
    { href: `/${locale}/contacts`, label: t(m, "nav_contacts") },
  ];
}
