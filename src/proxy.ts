import { NextResponse, type NextRequest } from "next/server";

/**
 * Only runs for "/": sends the visitor to the language section that best matches the browser.
 * Every other URL is handled statically (pages + redirects from next.config.ts).
 */
const SUPPORTED: Record<string, string> = { uz: "uz", ru: "ru", en: "en", tr: "tr" };

function pickLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return "uz";
  const langs = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of langs) {
    if (tag.startsWith("uz") && tag.includes("cyrl")) return "uz-cyrl";
    const base = tag.split("-")[0];
    if (SUPPORTED[base]) return SUPPORTED[base];
  }
  return "uz";
}

export function proxy(request: NextRequest) {
  let locale = "uz";
  try {
    locale = pickLocale(request.headers.get("accept-language"));
  } catch {
    /* fall back to Uzbek */
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/"],
};
