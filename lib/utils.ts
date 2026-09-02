import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export function randomSuffix(len = 5): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len);
}

/** Accepts a jsonb array (from Postgres), a legacy JSON string, or null. */
export function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === "string");
  }
  if (typeof value === "string" && value) {
    try {
      const v = JSON.parse(value);
      return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Normalised tag list ready to store in a jsonb column. */
export function serializeTags(tags: string[]): string[] {
  return Array.from(
    new Set(tags.map((t) => t.trim()).filter(Boolean)),
  ).slice(0, 12);
}

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  const week = 7 * day;
  if (abs < hour) return RELATIVE.format(Math.round(diff / min), "minute");
  if (abs < day) return RELATIVE.format(Math.round(diff / hour), "hour");
  if (abs < week) return RELATIVE.format(Math.round(diff / day), "day");
  return RELATIVE.format(Math.round(diff / week), "week");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function locationLabel(opts: {
  city?: string | null;
  country?: string | null;
  onlineAvailable?: boolean;
}): string {
  const parts: string[] = [];
  if (opts.city) parts.push(opts.city);
  if (opts.country) parts.push(opts.country);
  const place = parts.join(", ");
  if (place && opts.onlineAvailable) return `${place} · Online`;
  if (place) return place;
  return "Online";
}
