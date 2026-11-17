"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { localeNames, localeShort, locales, type Locale } from "@/i18n/config";

type NavItem = { href: string; label: string };

type Props = {
  locale: Locale;
  nav: NavItem[];
  brand: string;
  ctaLabel: string;
  ctaHref: string;
  labels: { open: string; close: string; language: string; skip: string };
};

function switchLocalePath(pathname: string, target: Locale) {
  const parts = pathname.split("/");
  parts[1] = target;
  return parts.join("/") || `/${target}`;
}

export function SiteHeader({ locale, nav, brand, ctaLabel, ctaHref, labels }: Props) {
  const pathname = usePathname() || `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  // menus remember the page they were opened on, so they close automatically after navigation
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const [langAt, setLangAt] = useState<string | null>(null);
  const open = menuAt === pathname;
  const langOpen = langAt === pathname;
  const setOpen = (v: boolean | ((p: boolean) => boolean)) =>
    setMenuAt((typeof v === "function" ? v(open) : v) ? pathname : null);
  const setLangOpen = (v: boolean | ((p: boolean) => boolean)) =>
    setLangAt((typeof v === "function" ? v(langOpen) : v) ? pathname : null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangAt(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLangAt(null);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? "py-2 shadow-[0_4px_20px_rgba(0,0,0,0.06)]" : "py-3 shadow-sm"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        {labels.skip}
      </a>
      <div className="container-x flex items-center gap-4">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2 sm:gap-2.5" aria-label={brand}>
          <Image src="/images/brand/emblem-transparent.png" alt="" width={44} height={44} priority className="size-9 sm:size-11" />
          <span className="text-[15px] font-extrabold tracking-wide whitespace-nowrap text-ink sm:text-lg">XALQARO TA&apos;LIM</span>
        </Link>

        <nav className="mx-auto hidden xl:block" aria-label="Main">
          <ul className="flex items-center gap-1 font-medium">
            {nav.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`rounded-full px-3 py-2 whitespace-nowrap transition-colors hover:text-primary ${
                    isActive(item.href) ? "text-primary" : "text-ink/80"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 xl:ml-0">
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
              aria-haspopup="menu"
              aria-label={labels.language}
              className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate-200 sm:px-3.5"
            >
              <i className="bi bi-globe2" aria-hidden />
              {localeShort[locale]}
              <i className={`bi bi-chevron-down hidden text-xs transition-transform sm:inline ${langOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {langOpen && (
              <ul
                role="menu"
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl bg-white py-2 shadow-[0_1rem_3rem_rgba(0,0,0,0.15)]"
              >
                {locales.map((l) => (
                  <li key={l} role="none">
                    <Link
                      role="menuitem"
                      href={switchLocalePath(pathname, l)}
                      hrefLang={l}
                      lang={l === "uz-cyrl" ? "uz-Cyrl" : l}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition hover:bg-primary hover:text-white ${
                        l === locale ? "text-primary" : "text-ink"
                      }`}
                    >
                      {localeNames[l]}
                      <span className="text-xs opacity-60">{localeShort[l]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ctaLabel}
            title={ctaLabel}
            className="btn-primary hidden px-5 py-2.5 text-sm whitespace-nowrap md:inline-flex xl:px-3.5 2xl:px-5"
          >
            <i className="bi bi-telegram" aria-hidden />
            {/* on 1280–1535px the full menu is visible, so the button shows only its icon */}
            <span className="xl:hidden 2xl:inline">{ctaLabel}</span>
          </a>

          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full text-3xl text-ink xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? labels.close : labels.open}
          >
            <i className={`bi ${open ? "bi-x-lg text-2xl" : "bi-list"}`} aria-hidden />
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-slate-100 bg-white xl:hidden" aria-label="Mobile">
          <ul className="container-x flex flex-col py-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-xl px-3 py-3 font-medium ${
                    isActive(item.href) ? "bg-primary-50 text-primary" : "text-ink hover:bg-surface"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 md:hidden">
              <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                <i className="bi bi-telegram" aria-hidden /> {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
