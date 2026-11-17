import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  const base = getSettings().siteUrl;
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
