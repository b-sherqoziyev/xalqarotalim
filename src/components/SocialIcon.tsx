const ICONS: Record<string, string> = {
  telegram: "bi-telegram",
  instagram: "bi-instagram",
  facebook: "bi-facebook",
  youtube: "bi-youtube",
  whatsapp: "bi-whatsapp",
  blog: "bi-rss-fill",
};

export function SocialIcon({ id }: { id: string }) {
  const icon = ICONS[id];
  if (icon) return <i className={`bi ${icon}`} aria-hidden />;
  // no Bootstrap icon for Odnoklassniki and similar networks — show short text instead
  return (
    <span aria-hidden className="text-xs font-bold uppercase">
      {id.slice(0, 2)}
    </span>
  );
}
