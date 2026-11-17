# xalqarotalim.uz — yangi sayt

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. Barcha sahifalar build vaqtida tayyor HTML'ga aylanadi
(SSG), ma'lumotlar bazasi yo'q — sayt Vercel CDN'idan beriladi va "qulab tushmaydi".
Yagona dinamik qism — ariza formasi (Telegram'ga yuboradi).

## Ishga tushirish

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # typecheck + lint + production build (deploydan oldin)
```

Node.js 20.9 yoki undan yangi versiya kerak.

## Papkalar

```
content/                     ← SAYTNING BARCHA MA'LUMOTLARI (shu yerda tahrirlanadi)
  settings.json              telefonlar, manzil, ijtimoiy tarmoqlar, xarita, statistika
  countries/<id>.json        davlatlar (5 tilda nomi, rasm, tartib)
  universities/<id>/
    index.json               universitet: davlat, shahar, asl nomi, tillardagi nomi, rasm
    uz.md uz-cyrl.md ru.md en.md tr.md   matn (qaysi tilda bor bo'lsa)
  scholarships/<id>/         grantlar (xuddi shu tuzilish)
  news/<id>/                 yangiliklar (xuddi shu tuzilish)
  pages/home|contacts|translations/<til>.md
  media.json                 rasmlar o'lchami va eski Flexbe ID'si (avtomatik)
  redirects.json             eski Flexbe URL → yangi URL (301)
public/images/               rasmlar (WebP), papka = obyekt id'si, fayl nomi = Flexbe ID
src/
  app/[locale]/...           sahifalar (uz, uz-cyrl, ru, en, tr)
  components/                UI komponentlar
  i18n/messages/<til>.json   interfeys matnlari (tugmalar, sarlavhalar)
  lib/content.ts             kontentni o'qish va tekshirish
  lib/schema.ts              kontent sxemasi (zod)
scripts/migration/           Flexbe'dan ko'chirish skriptlari (tarix uchun)
xalqarotalim-export/         eski saytning to'liq arxivi (git'ga kirmaydi)
```

## Kontent bilan ishlash (CRUD)

Har bir obyekt — alohida papka. Build paytida hamma fayl tekshiriladi: xato bo'lsa build to'xtaydi
va qaysi faylda nima noto'g'ri ekani yoziladi, ya'ni buzilgan sahifa saytga chiqmaydi.

**Yangi universitet qo'shish**

1. `content/universities/yangi-id/` papka yarating (id: kichik lotin harflari, raqam, `-`).
2. `index.json`:
   ```json
   {
     "id": "yangi-id",
     "country": "turkey",
     "city": "İstanbul",
     "nativeName": "İstanbul ... Üniversitesi",
     "order": 19,
     "name": { "uz": "...", "ru": "..." },
     "cover": "/images/universities/yangi-id/cover.webp",
     "legacy": {}
   }
   ```
3. Rasmni `public/images/universities/yangi-id/` ga qo'ying.
4. Matnni `uz.md` (va boshqa tillar) ga yozing:
   ```md
   ---
   title: "Universitet nomi"
   description: "Qisqa tavsif (Google uchun)"
   ---

   Matn... Jadvallar, ro'yxatlar, rasmlar oddiy Markdown'da.
   ::embed[https://youtu.be/VIDEO_ID]
   ```
5. `npm run dev` — sahifa `/uz/universities/yangi-id` da paydo bo'ladi, davlat sahifasi, sitemap va
   menyular avtomatik yangilanadi.

**Tahrirlash** — `.md` yoki `index.json` ni o'zgartiring. **O'chirish** — papkani o'chiring
(eski manzilni saqlash kerak bo'lsa `content/redirects.json` ga yozuv qo'shing).

**Tarjima yo'q bo'lsa** — sahifa baribir barcha tillarda ochiladi, mavjud tildagi matn ko'rsatiladi,
ogohlantirish chiqadi va Google'ga `noindex` beriladi. Tarjima qo'shish uchun shunchaki `en.md` kabi
fayl yarating.

## Deploy (Vercel)

1. Loyihani GitHub'ga push qiling.
2. vercel.com → **Add New Project** → repozitoriyni tanlang (sozlamalar avtomatik aniqlanadi).
3. **Settings → Environment Variables**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (`.env.example` ga qarang).
   Ular bo'lmasa forma "yuborilmadi" deydi va telefon/Telegram'ni taklif qiladi.
4. Hamma narsa tekshirilgach, **Settings → Domains** ga `xalqarotalim.uz` ni qo'shing va DNS'ni
   Vercel ko'rsatgan qiymatlarga o'zgartiring. Shundan keyin Flexbe sayti o'chadi —
   eski URL'lar `redirects.json` orqali yangi sahifalarga yo'naltiriladi.

## Ko'chirish haqida

- Manba: Flexbe'dagi 155 sahifa (5 til) + 178 original rasm, 2026-11-17 holatida.
- 148 sahifa yangi modelga o'tkazildi: 47 universitet, 3 grant, 8 yangilik, 3 sahifa.
- 7 ta sahifa (`/01/`–`/04/`, `/11/`, `/12/`, `/page_96364/`) to'ldirilmagan Flexbe shabloni edi
  ("Услуга 1", "Цитаты" va h.k.) — ko'chirilmadi, lekin arxivda bor va redirect qilingan.
- Har bir sahifadagi har bir so'z yangi fayllarda borligi avtomatik tekshirilgan
  (`scripts/migration/check_migration.py`).
- Sahifalar oxiridagi takroriy "Batafsil ma'lumot: +998 ...", "Bizni ijtimoiy tarmoqlarda kuzating"
  qatorlari olib tashlandi — ular endi har sahifadagi "O'qishga topshirish" blokida va footerda.
- Eski saytdagi ba'zi matnlarda so'zlar orasida bo'sh joy yo'q edi
  (masalan, "УШБУГРАНТГАМУРОЖААТ..."). Ular o'zgartirilmagan — `.md` faylda qo'lda tuzatish mumkin.
