import type { Locale } from "./config";
import uz from "./messages/uz.json";
import uzCyrl from "./messages/uz-cyrl.json";
import ru from "./messages/ru.json";
import en from "./messages/en.json";
import tr from "./messages/tr.json";

export type Messages = typeof uz;
export type MessageKey = keyof Messages;

const dictionaries: Record<Locale, Messages> = {
  uz,
  "uz-cyrl": uzCyrl,
  ru,
  en,
  tr,
};

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

/** Translate a key and replace {placeholders}. */
export function t(
  messages: Messages,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let text: string = messages[key] ?? dictionaries.uz[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
