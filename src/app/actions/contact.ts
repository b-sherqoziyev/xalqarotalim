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
  // honeypot: real people never fill this hidden field
  website: z.string().max(0).optional().default(""),
});

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}

/**
 * Sends a lead from the website to the team's Telegram chat(s).
 * Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables (set them in Vercel).
 * TELEGRAM_CHAT_ID may hold several ids separated by commas — every chat gets the message.
 */
export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    // honeypot filled → pretend success so bots learn nothing
    if (formData.get("website")) return { status: "success" };
    return { status: "invalid" };
  }
  const { name, phone, email, message } = parsed.data;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(/[,;\s]+/)
    .map((id) => id.trim())
    .filter(Boolean);
  if (!token || chatIds.length === 0) {
    console.error("[contact] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID is not configured");
    return { status: "error" };
  }

  const text = [
    "<b>🆕 Yangi ariza — xalqarotalim.uz</b>",
    `<b>Ism:</b> ${escapeHtml(name)}`,
    `<b>Telefon:</b> ${escapeHtml(phone)}`,
    email ? `<b>E-pochta:</b> ${escapeHtml(email)}` : "",
    // the visitor's message is shown as a quote, separated from the contact details
    message ? `<blockquote>${escapeHtml(message)}</blockquote>` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const sendTo = async (chatId: string) => {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`chat ${chatId}: ${res.status} ${await res.text().catch(() => "")}`);
    }
  };

  // every admin gets the lead; one unreachable chat does not block the others
  const results = await Promise.allSettled(chatIds.map(sendTo));
  for (const r of results) {
    if (r.status === "rejected") console.error("[contact] telegram error", r.reason);
  }
  return results.some((r) => r.status === "fulfilled") ? { status: "success" } : { status: "error" };
}
