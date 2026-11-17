import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getMessages, t } from "@/i18n/dictionary";
import { getSettings } from "@/lib/content";
import { SocialIcon } from "./SocialIcon";

export function SiteFooter({ locale, nav }: { locale: Locale; nav: { href: string; label: string }[] }) {
  const m = getMessages(locale);
  const s = getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink pt-16 text-white" id="contact-footer">
      <div className="container-x grid gap-12 pb-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link href={`/${locale}`} className="mb-5 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-white">
              <Image src="/images/brand/emblem-transparent.png" alt="" width={40} height={40} className="size-10" />
            </span>
            <span className="text-xl font-extrabold tracking-wide">XALQARO TA&apos;LIM</span>
          </Link>
          <p className="mb-6 max-w-md text-white/60">{s.tagline[locale]}</p>
          <ul className="flex flex-wrap gap-2.5">
            {s.socials.map((so) => (
              <li key={so.id}>
                <a
                  href={so.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={so.label}
                  title={so.label}
                  className="flex size-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-white hover:bg-white hover:text-ink"
                >
                  <SocialIcon id={so.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h2 className="mb-5 text-lg font-bold">{t(m, "contact_title")}</h2>
          <ul className="flex flex-col gap-3.5 text-white/60">
            <li className="flex gap-3">
              <i className="bi bi-geo-alt-fill mt-0.5 text-primary" aria-hidden />
              <a href={s.mapLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {s.address[locale]}
              </a>
            </li>
            {s.phones.map((p) => (
              <li key={p} className="flex gap-3">
                <i className="bi bi-telephone-fill text-primary" aria-hidden />
                <a href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-white">
                  {p}
                </a>
              </li>
            ))}
            <li className="flex gap-3">
              <i className="bi bi-envelope-fill text-primary" aria-hidden />
              <a href={`mailto:${s.email}`} className="hover:text-white">
                {s.email}
              </a>
            </li>
            <li className="flex gap-3">
              <i className="bi bi-clock-fill text-primary" aria-hidden />
              <span>{s.workingHours[locale]}</span>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="mb-5 text-lg font-bold">{t(m, "footer_links")}</h2>
          <ul className="flex flex-col gap-2.5 text-white/60">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex items-center gap-1.5 hover:text-white">
                  <i className="bi bi-arrow-right-short text-xl text-primary" aria-hidden />
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-sm text-white/50">
        &copy; {year} {s.siteName}. {t(m, "footer_rights")}.
      </div>
    </footer>
  );
}
