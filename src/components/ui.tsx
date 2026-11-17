import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { localeNames, type Locale } from "@/i18n/config";
import { getMessages, t } from "@/i18n/dictionary";
import { getSettings } from "@/lib/content";

export function SectionHeading({ eyebrow, title, desc, id }: { eyebrow: string; title: string; desc?: string; id?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
        {title}
      </h2>
      {desc && <p className="mt-4 text-lg text-muted">{desc}</p>}
    </div>
  );
}

export type Crumb = { href?: string; label: string };

export function PageHero({
  title,
  subtitle,
  crumbs,
  image = "/images/brand/hero.webp",
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  crumbs: Crumb[];
  image?: string | null;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink pt-28 pb-14 text-white sm:pt-32 sm:pb-16">
      <Image
        src={image || "/images/brand/hero.webp"}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover opacity-90"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.45)_100%)]" />
      <div className="container-x">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/70">
          <ol className="flex flex-wrap items-center gap-1.5">
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && <i className="bi bi-chevron-right text-[0.7rem]" aria-hidden />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-white">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-white">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="max-w-4xl text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <div className="mt-4 max-w-3xl text-lg text-white/80">{subtitle}</div>}
        {children}
      </div>
    </section>
  );
}

export function FallbackNotice({ locale, shown }: { locale: Locale; shown: Locale }) {
  const m = getMessages(locale);
  return (
    <p className="mb-8 flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4 text-ink">
      <i className="bi bi-translate mt-0.5 text-xl text-accent" aria-hidden />
      <span>{t(m, "fallback_notice", { lang: localeNames[shown] })}</span>
    </p>
  );
}

export function CtaBox({ locale, title, desc }: { locale: Locale; title?: string; desc?: string }) {
  const m = getMessages(locale);
  const s = getSettings();
  return (
    <aside className="mt-14 rounded-2xl border border-primary/25 bg-surface p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
      <h2 className="mb-3 text-2xl font-bold text-primary">{title ?? t(m, "cta_title")}</h2>
      <p className="mx-auto mb-7 max-w-2xl text-lg text-muted">{desc ?? t(m, "cta_desc")}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href={`tel:${s.phones[0].replace(/\s/g, "")}`} className="btn-primary">
          <i className="bi bi-telephone-fill" aria-hidden /> {t(m, "btn_call")}
        </a>
        <a href={s.managers.education} target="_blank" rel="noopener noreferrer" className="btn-outline">
          <i className="bi bi-telegram" aria-hidden /> {t(m, "btn_telegram")}
        </a>
        <Link href={`/${locale}/contacts#form`} className="btn-outline">
          <i className="bi bi-pencil-square" aria-hidden /> {t(m, "btn_contact_form")}
        </Link>
      </div>
    </aside>
  );
}

export function CoverCard({
  href,
  image,
  title,
  meta,
  badge,
}: {
  href: string;
  image: string | null;
  title: string;
  meta?: ReactNode;
  badge?: string;
}) {
  return (
    <Link href={href} className="group card card-hover flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-5xl text-primary/30">
            <i className="bi bi-mortarboard" aria-hidden />
          </div>
        )}
        {badge && (
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink shadow">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug font-bold text-ink transition-colors group-hover:text-primary">{title}</h3>
        {meta && <div className="mt-2 text-sm text-muted">{meta}</div>}
      </div>
    </Link>
  );
}

export function CountryCard({ href, image, title, count }: { href: string; image: string; title: string; count: string }) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
      <div className="relative h-64">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(to_top,rgba(0,0,0,0.8)_0%,transparent_100%)] p-6">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <span className="mt-1 text-sm font-medium text-white/80">{count}</span>
      </div>
    </Link>
  );
}

export function ListLink({ href, title, icon = "bi-newspaper" }: { href: string; title: string; icon?: string }) {
  return (
    <Link
      href={href}
      className="group card flex h-full items-center justify-between gap-4 border-l-4 border-primary p-5 transition-colors"
    >
      <span className="font-medium text-ink transition-colors group-hover:text-primary">{title}</span>
      <i className={`bi ${icon} shrink-0 text-2xl text-primary`} aria-hidden />
    </Link>
  );
}
