import Image from "next/image";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getMediaSize } from "@/lib/content";

/** Turns a YouTube / Google Maps URL into an embeddable URL; anything else is not embedded. */
function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return `https://www.youtube-nocookie.com${u.pathname}`;
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
    }
    if (host === "google.com" && u.pathname.startsWith("/maps/embed")) return u.toString();
  } catch {
    /* not a URL */
  }
  return null;
}

const components: Components = {
  a({ href = "", children }) {
    if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return <a href={href}>{children}</a>;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    if (typeof src !== "string" || !src) return null;
    const size = getMediaSize(src);
    if (!size) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt ?? ""} loading="lazy" className="h-auto max-w-full" />;
    }
    return (
      <Image
        src={src}
        alt={alt ?? ""}
        width={size.width}
        height={size.height}
        sizes="(max-width: 860px) 100vw, 820px"
        className="h-auto w-full max-w-full"
      />
    );
  },
  table({ children }) {
    return (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    );
  },
  // content documents start at h2 (the page title is the only h1)
  h1({ children }) {
    return <h2>{children}</h2>;
  },
};

/** Renders a Markdown document. Supports the custom line `::embed[url]` for YouTube videos. */
export function Markdown({ source }: { source: string }) {
  const parts = source.split(/^::embed\[(.+)\]\s*$/m);
  return (
    <div className="content">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const url = toEmbedUrl(part);
          if (!url) return null;
          return (
            <div key={i} className="embed">
              <iframe
                src={url}
                title="video"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          );
        }
        return part.trim() ? (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={components}>
            {part}
          </ReactMarkdown>
        ) : null;
      })}
    </div>
  );
}
