"use client";

import { useEffect } from "react";

const TEXT: Record<string, { title: string; desc: string; retry: string }> = {
  uz: { title: "Xatolik yuz berdi", desc: "Sahifani yuklashda muammo bo'ldi.", retry: "Qayta urinish" },
  "uz-cyrl": { title: "Хатолик юз берди", desc: "Саҳифани юклашда муаммо бўлди.", retry: "Қайта уриниш" },
  ru: { title: "Произошла ошибка", desc: "Не удалось загрузить страницу.", retry: "Повторить" },
  en: { title: "Something went wrong", desc: "The page could not be loaded.", retry: "Try again" },
  tr: { title: "Bir hata oluştu", desc: "Sayfa yüklenemedi.", retry: "Tekrar dene" },
};

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const locale = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "uz";
  const txt = TEXT[locale] ?? TEXT.uz;
  return (
    <section className="flex min-h-[70vh] items-center pt-28 pb-16">
      <div className="container-x text-center">
        <i className="bi bi-exclamation-triangle text-6xl text-accent" aria-hidden />
        <h1 className="mt-4 text-3xl font-bold text-ink">{txt.title}</h1>
        <p className="mt-3 text-muted">{txt.desc}</p>
        <button type="button" onClick={reset} className="btn-primary mt-8">
          <i className="bi bi-arrow-clockwise" aria-hidden /> {txt.retry}
        </button>
      </div>
    </section>
  );
}
