import Link from "next/link";

// Shown when notFound() is called inside a language section.
// The visitor's language is not known here, so the text is short and bilingual.
export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center pt-28 pb-16">
      <div className="container-x text-center">
        <p className="text-7xl font-extrabold text-primary">404</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">Sahifa topilmadi · Страница не найдена</h1>
        <p className="mt-3 text-muted">Page not found</p>
        <Link href="/uz" className="btn-primary mt-8">
          <i className="bi bi-house-door-fill" aria-hidden /> Bosh sahifa
        </Link>
      </div>
    </section>
  );
}
