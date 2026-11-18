"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "@/app/actions/contact";

type Labels = {
  title: string;
  desc: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  submit: string;
  sending: string;
  successTitle: string;
  successDesc: string;
  error: string;
  invalid: string;
  call: string;
  telegram: string;
};

export function ContactForm({
  labels,
  phone,
  telegram,
}: {
  labels: Labels;
  phone: string;
  telegram: string;
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { status: "idle" });

  if (state.status === "success") {
    return (
      <div className="card flex flex-col items-center p-10 text-center" role="status">
        <span className="icon-box mb-5 bg-success/10 text-success">
          <i className="bi bi-check2-circle" aria-hidden />
        </span>
        <h3 className="text-2xl font-bold text-ink">{labels.successTitle}</h3>
        <p className="mt-2 text-muted">{labels.successDesc}</p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15";

  return (
    <form action={action} className="card p-6 sm:p-8" noValidate={false}>
      <h3 className="text-2xl font-bold text-ink">{labels.title}</h3>
      <p className="mt-1 mb-6 text-muted">{labels.desc}</p>

      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink">{labels.name}</span>
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink">{labels.phone}</span>
          <input
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="+998 __ ___ __ __"
            pattern="[+\d][\d\s()\-]{6,20}"
            className={field}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink">{labels.email}</span>
          <input name="email" type="email" maxLength={150} autoComplete="email" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink">{labels.message}</span>
          <textarea name="message" rows={3} maxLength={2000} className={field} />
        </label>
      </div>

      {(state.status === "error" || state.status === "invalid") && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.status === "invalid" ? labels.invalid : labels.error}
          {state.status === "error" && (
            <span className="mt-2 flex flex-wrap gap-3 font-semibold">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="underline">
                {labels.call}: {phone}
              </a>
              <a href={telegram} target="_blank" rel="noopener noreferrer" className="underline">
                {labels.telegram}
              </a>
            </span>
          )}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary mt-6 w-full disabled:opacity-70">
        {pending ? (
          <>
            <i className="bi bi-arrow-repeat animate-spin" aria-hidden /> {labels.sending}
          </>
        ) : (
          <>
            <i className="bi bi-send-fill" aria-hidden /> {labels.submit}
          </>
        )}
      </button>
    </form>
  );
}
