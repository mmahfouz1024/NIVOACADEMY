import clsx from "clsx";

export function cn(...args: Parameters<typeof clsx>) {
  return clsx(...args);
}

const TZ = "Africa/Cairo";

export function formatPrice(n: number) {
  if (!n) return "مجاني";
  return `${n.toLocaleString("ar-EG")} ج.م`;
}

export function formatMoney(n: number) {
  return `${n.toLocaleString("ar-EG")} ج.م`;
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("ar-EG", {
    timeZone: TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(d: Date | string) {
  return new Date(d).toLocaleString("ar-EG", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatNumber(n: number) {
  return n.toLocaleString("ar-EG");
}

/** Slug that keeps Arabic + latin letters and digits. */
export function slugify(input: string) {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return s || `course-${Math.random().toString(36).slice(2, 8)}`;
}

export function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function discountPercent(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** Cairo-time value for <input type="datetime-local"> */
export function toLocalInput(d: Date) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return parts.replace(" ", "T");
}

/** Parse a datetime-local string as Cairo time → UTC Date. */
export function fromLocalInput(s: string) {
  // Determine Cairo offset for that wall-clock date.
  const naive = new Date(`${s}:00Z`);
  const asCairo = new Date(naive.toLocaleString("en-US", { timeZone: TZ }));
  const asUtc = new Date(naive.toLocaleString("en-US", { timeZone: "UTC" }));
  const offset = asCairo.getTime() - asUtc.getTime();
  return new Date(naive.getTime() - offset);
}
