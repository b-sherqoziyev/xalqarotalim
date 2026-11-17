import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 — Xalqaro Ta'lim",
  robots: { index: false },
};

const links = [
  { href: "/uz", label: "O'zbekcha" },
  { href: "/uz-cyrl", label: "Ўзбекча" },
  { href: "/ru", label: "Русский" },
  { href: "/en", label: "English" },
  { href: "/tr", label: "Türkçe" },
];

export default function GlobalNotFound() {
  return (
    <html lang="uz">
      <body className="flex min-h-dvh items-center justify-center bg-surface p-6">
        <main className="card max-w-lg p-10 text-center">
          <p className="text-7xl font-extrabold text-primary">404</p>
          <h1 className="mt-4 text-2xl font-bold text-ink">Sahifa topilmadi · Страница не найдена · Page not found</h1>
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {links.map((l) => (
              <li key={l.href}>
                {/* plain <a>: this page is rendered outside the app router */}
                <a href={l.href} className="btn-outline px-4 py-2 text-sm">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}
