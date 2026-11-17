"use server";

import { z } from "zod";

export type ContactState = { status: "idle" | "success" | "invalid" | "error" };

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{6,20}$/),
  email: z.union([z.literal(""), z.email().max(150)]).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  page: z.string().max(300).optional().default(""),
  locale: z.string().max(10).optional().default(""),
  // honeypot: real people never fill this hidden field
  website: z.string().max(0).optional().default(""),
});

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}

/**
 * Sends a lead from the website to the team's Telegram chat.
 * Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables (set them in Vercel).
 */
export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    // honeypot filled → pretend success so bots learn nothing
    if (formData.get("website")) return { status: "success" };
    return { status: "invalid" };
  }
  const { name, phone, email, message, page, locale } = parsed.data;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[contact] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID is not configured");
    return { status: "error" };
  }

  const text = [
    "<b>🆕 Yangi ariza — xalqarotalim.uz</b>",
    `<b>Ism:</b> ${escapeHtml(name)}`,
    `<b>Telefon:</b> ${escapeHtml(phone)}`,
    email ? `<b>E-pochta:</b> ${escapeHtml(email)}` : "",
    message ? `<b>Xabar:</b> ${escapeHtml(message)}` : "",
    page ? `<b>Sahifa:</b> ${escapeHtml(page)}` : "",
    locale ? `<b>Til:</b> ${escapeHtml(locale)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[contact] telegram error", res.status, await res.text().catch(() => ""));
      return { status: "error" };
    }
    return { status: "success" };
  } catch (e) {
    console.error("[contact] telegram request failed", e);
    return { status: "error" };
  }
}
