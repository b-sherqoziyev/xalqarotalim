import type { NextConfig } from "next";
import legacyRedirects from "./content/redirects.json";

/**
 * Old Flexbe URLs (e.g. /ru/2024_9_kent_istanbul/) permanently redirect to the new pages,
 * so links from Google, Telegram posts and bookmarks keep working.
 */
const redirects = legacyRedirects
  .filter((r) => r.source !== "/")
  .map((r) => ({
    source: r.source.replace(/\/+$/, ""),
    destination: r.destination,
    permanent: true,
  }))
  // an old URL that equals a new page (e.g. /ru, /en) must not redirect to itself
  .filter((r) => r.source !== r.destination);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    globalNotFound: true,
  },
  // content/ is read with fs at build time; keep it in the server bundle as well
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return redirects;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
