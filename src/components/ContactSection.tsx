import type { Locale } from "@/i18n/config";
import { getMessages, t } from "@/i18n/dictionary";
import { getSettings } from "@/lib/content";
import { ContactForm } from "./ContactForm";
import { SocialIcon } from "./SocialIcon";

export function ContactFormBlock({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const s = getSettings();
  return (
    <ContactForm
      locale={locale}
      phone={s.phones[0]}
      telegram={s.managers.education}
      labels={{
        title: t(m, "form_title"),
        desc: t(m, "form_desc"),
        name: t(m, "form_name"),
        phone: t(m, "form_phone"),
        email: t(m, "form_email"),
        message: t(m, "form_message"),
        submit: t(m, "form_submit"),
        sending: t(m, "form_sending"),
        successTitle: t(m, "form_success_title"),
        successDesc: t(m, "form_success_desc"),
        error: t(m, "form_error"),
        invalid: t(m, "form_invalid"),
        call: t(m, "btn_call"),
        telegram: t(m, "btn_telegram"),
      }}
    />
  );
}

export function ContactDetails({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const s = getSettings();
  const rows = [
    { icon: "bi-geo-alt-fill", label: t(m, "contact_address"), value: s.address[locale], href: s.mapLink, external: true },
    ...s.phones.map((p) => ({ icon: "bi-telephone-fill", label: t(m, "contact_phone"), value: p, href: `tel:${p.replace(/\s/g, "")}`, external: false })),
    { icon: "bi-envelope-fill", label: t(m, "contact_email"), value: s.email, href: `mailto:${s.email}`, external: false },
    { icon: "bi-clock-fill", label: t(m, "contact_hours"), value: s.workingHours[locale], href: undefined, external: false },
  ];
  return (
    <div>
      <ul className="grid gap-4">
        {rows.map((r, i) => (
          <li key={i} className="card flex items-start gap-4 p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
              <i className={`bi ${r.icon}`} aria-hidden />
            </span>
            <span>
              <span className="block text-sm text-muted">{r.label}</span>
              {r.href ? (
                <a
                  href={r.href}
                  {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="font-semibold text-ink hover:text-primary"
                >
                  {r.value}
                </a>
              ) : (
                <span className="font-semibold text-ink">{r.value}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <h3 className="mt-8 mb-3 font-bold text-ink">{t(m, "contact_socials")}</h3>
      <ul className="flex flex-wrap gap-2.5">
        {s.socials.map((so) => (
          <li key={so.id}>
            <a
              href={so.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={so.label}
              title={so.label}
              className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-lg text-primary transition hover:bg-primary hover:text-white"
            >
              <SocialIcon id={so.id} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
