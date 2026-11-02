import "server-only";
import { db } from "./db";
import { DEFAULT_SETTINGS } from "./constants";

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.setting.findMany();
  const out: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export function whatsappLink(number: string, text = "") {
  const n = number.replace(/\D/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
