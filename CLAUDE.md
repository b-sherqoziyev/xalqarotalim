# CLAUDE.md — xalqarotalim.uz

Claude uchun loyiha xotirasi. Har yangi sessiyada avval shu faylni o'qi.
Biror qaror o'zgarsa yoki yangi narsa qo'shilsa — shu faylni ham yangila.

## Egasi bilan ishlash qoidalari

- Javoblar **o'zbek tilida (lotin)**, qisqa va aniq.
- Egasi — dasturchi. Windows, WebStorm, Node 22 (fnm orqali, `.node-version`).
- Fayllarni o'zgartirishdan oldin `git status` bilan tekshir: egasi o'zi tahrirlagan bo'lsa, ustidan yozma.

### Git: har bir amaldan keyin commit

- **Har bir tugallangan amal — alohida commit.** Butun vazifa oxirida bitta katta commit EMAS.
  Maqsad: tarixda aynan nima o'zgargani bitta-bitta ko'rinsin, kerak bo'lsa bittasini qaytarish oson bo'lsin.
  Misol: "header tuzatildi" → commit; "forma xabari o'zgardi" → commit; "yangi universitet qo'shildi" → commit.
- Bitta commit = bitta mantiqiy o'zgarish. Faqat shu o'zgarishga tegishli fayllarni qo'sh
  (`git add <fayllar>`, `git add .` emas).
- Commit oldidan: `npm run check` (yoki hech bo'lmasa `npx tsc --noEmit && npx eslint`) xatosiz o'tsin.
  Buzilgan holatni commit qilma.
- Xabar formati — o'zbekcha, `<Qism>: <nima o'zgardi>`. Mavjud tarixdagidek:
  `Header: kichik telefon va 1280px ekranlarga moslashtirildi`, `Forma: arizalarni bir nechta Telegram chatga yuborish`.
- Muallif — mavjud commitlardagi egasining ismi/emaili (o'zingdan ism to'qima). Muhitda git identity bo'lmasa — so'ra.
- Git'ni ishlata olmaydigan muhitda (masalan, fayllar oraliq papka orqali ko'chirilsa) har bir amaldan keyin
  shu amal uchun tayyor `git add … && git commit -m "…"` buyrug'ini ber — egasi bajaradi.
- **Push faqat egasi aytganda.** Push = Vercel production deploy. Env o'zgarsa — Vercel'da **Redeploy** kerak.

## Loyiha

Xorijda ta'lim bo'yicha konsalting markazi sayti. 2026-11 da Flexbe'dan to'liq ko'chirildi.
Domen: `xalqarotalim.uz` (Vercel, NS: `ns1/ns2.vercel-dns.com`). Repo: `github.com/b-sherqoziyev/xalqarotalim`.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind CSS 4 · zod 4 ·
gray-matter + react-markdown + remark-gfm · `@fontsource-variable/inter` · `bootstrap-icons` (`<i className="bi bi-...">`).

**Asosiy qarorlar (o'zgartirishdan oldin o'yla):**
- To'liq statik sayt (SSG). `cacheComponents` **o'chiq**; har dinamik route'da `generateStaticParams` + `dynamicParams = false`.
  Ma'lumotlar bazasi yo'q — kontent `content/` papkada, build vaqtida `fs` bilan o'qiladi.
- Yagona dinamik qism — ariza formasi (Server Action → Telegram).
- i18n — o'zimizniki, kutubxonasiz: `src/i18n/`. Tillar: `uz` (standart), `uz-cyrl`, `ru`, `en`, `tr`.
  URL doim til bilan: `/uz/...`. `/` → `src/proxy.ts` brauzer tiliga qarab yo'naltiradi (Next 16 da middleware = proxy).
- Next 16: `params` — Promise (`await params`). API shubhali bo'lsa `node_modules/next/dist/docs/` ni o'qi.

## Buyruqlar

```
npm run dev        # localhost:3000
npm run check      # tsc + eslint + next build — push oldidan
npm run build && npm start
```

## Tuzilish

```
content/                        ← BARCHA MA'LUMOT (CRUD shu yerda)
  settings.json                 telefonlar, email, manzil, ish vaqti, ijtimoiy tarmoqlar, xarita, managers, stats
  countries/<id>.json           9 davlat: name (5 til, hammasi majburiy), cover, order
  universities/<id>/index.json  country, city, nativeName, order, name{til}, cover, legacy{til: eski URL}
  universities/<id>/<til>.md    front matter (title, description, keywords, legacyUrl) + Markdown matn
  scholarships/<id>/…, news/<id>/…   xuddi shunday
  pages/home|contacts|translations/<til>.md
  media.json                    rasm o'lchamlari + eski Flexbe ID (next/image uchun)
  redirects.json                eski Flexbe URL → yangi URL (next.config.ts da 301)
public/images/<collection>/<id>/<flexbeId>.webp   rasmlar (shared/ — bir nechta joyda ishlatilgan)
public/images/brand/            logo, emblem, hero, og.jpg;  public/images/countries/<id>.webp
src/lib/schema.ts               zod sxemalar — kontent shakli shu yerda belgilanadi
src/lib/content.ts              kontentni o'qish + tekshirish (xato → build to'xtaydi, aniq xabar bilan)
src/lib/seo.ts                  pageMetadata (canonical, hreflang, OG), excerpt
src/i18n/messages/<til>.json    UI matnlar. Yangi kalit → 5 ta faylning HAMMASIGA qo'sh (TS tekshiradi)
src/components/                 SiteHeader (client), SiteFooter, Markdown, Article, ContactForm (client), ui.tsx
src/app/[locale]/…              sahifalar: /, countries, countries/[country], universities, universities/[id],
                                scholarships, scholarships/[id], news, news/[id], translations, contacts
src/app/actions/contact.ts      forma → Telegram
scripts/migration/              Flexbe → content ko'chirish skriptlari (tarix; qayta ishlatish shart emas)
xalqarotalim-export/            eski saytning to'liq arxivi (raw HTML, original rasmlar) — git'da YO'Q
```

## Kontent qoidalari

- id = papka nomi = `index.json` dagi `id` (kichik lotin, raqam, `-`). Mos kelmasa build xato beradi.
- Til fayli bo'lmasa: sahifa baribir hamma tilda ochiladi, `fallbackOrder` bo'yicha boshqa tildagi matn,
  sariq ogohlantirish + `noindex` + canonical asl tilga. Sitemap'ga faqat haqiqiy tillar kiradi.
- Universitet nomi tilda bo'lmasa — `nativeName` ko'rsatiladi (`localizedName()`).
- Markdown: oddiy GFM (jadval, ro'yxat, rasm). YouTube: alohida qatorda `::embed[https://youtu.be/ID]`.
  Ichki havolalar `/uz/universities/...` ko'rinishida.
- Rasm yo'li `public/` dagi faylga mos bo'lishi shart (build tekshiradi). Yangi rasm → WebP, kengligi ≤1600px,
  `content/media.json` ga width/height qo'shish tavsiya (bo'lmasa oddiy `<img>` bilan chiqadi).
- Universitet o'chirilsa va eski URL Google'da bo'lsa — `content/redirects.json` ga yozuv qo'sh.

## Ariza formasi (Telegram)

- Env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (Vercel: Production + Preview). Namuna: `.env.example`.
- `TELEGRAM_CHAT_ID` — vergul bilan bir nechta ID (adminlar va/yoki guruh `-100…`). Har biriga yuboriladi,
  bittasi ishlamasa ham qolganlariga boradi. Shaxsiy chat uchun admin avval botda Start bosgan bo'lishi kerak.
- Xabar formati: sarlavha, Ism, Telefon, E-pochta (bo'lsa), xabar matni `<blockquote>` da. Sahifa/til yuborilmaydi (egasi so'rovi).
- Maydonlar: name, phone, email (ixtiyoriy), message; honeypot `website`. Env bo'lmasa — xato + telefon/Telegram taklifi.
- "Bepul maslahat" / "Telegram orqali yozish" → `settings.managers.education` (@Yoqub_TA).
  Tarjima sahifasi → `managers.translations` (@Sultonim_Bolam). Kanal (@XalqaroTalimMarkazi) — socials ichida.

## Dizayn

Egasining `xizmatlar-site` namunasi asosida: Bootstrap uslubi, Inter, ko'k `#0d6efd` (primary),
logodagi sariq `#f0a91a` (accent), `rounded-2xl` kartalar, pill tugmalar (`btn-primary`, `btn-outline`,
`btn-glass`, `btn-light`), qora overlay'li hero, to'q footer. Tokenlar: `src/app/globals.css` (`@theme`, `@utility`).
Uzun matn uslubi: `.content` klassi. Header 1280px dan to'liq menyu, undan kichikda ☰.
Responsive 360px…1920px da tekshirilgan (gorizontal skroll yo'q; jadvallar o'z ichida suriladi).

## Ochiq masalalar

- Statistika "5+ yil", "1000+ talaba" (`settings.stats`) — `xizmatlar-site` dan olingan, egasi tasdiqlashi kerak.
- Tarjimalar to'liq emas (Yevropa universitetlari asosan ru/en; Turkiya — uz/uz-cyrl/ru; tr juda kam).
- Eski matnlarda bo'shliqsiz yopishgan so'zlar bor (masalan "УШБУГРАНТГАМУРОЖААТ…") — qo'lda tuzatiladi.
- Vercel Domains: hozir `xalqarotalim.uz` → `www` ga 308. Canonical/sitemap `https://xalqarotalim.uz` (www'siz) —
  `www` → apex qilish tavsiya etilgan (yoki `settings.siteUrl` ni www ga o'zgartirish).
- Flexbe yopilishidan oldin CRM'dagi eski arizalarni eksport qilish (egasi qiladi).
- Ko'chirilmagan: `/01/`–`/04/`, `/11/`, `/12/`, `/page_96364/` — bo'sh Flexbe shablon sahifalari (arxivda bor, redirect qilingan).
