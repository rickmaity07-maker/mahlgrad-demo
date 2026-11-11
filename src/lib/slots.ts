import type { DayHours } from "./types";

const TZ = "Europe/Berlin";
export const LEAD_MINUTES = 10;
const STEP_MINUTES = 15;

/** Current weekday and minutes-since-midnight in Berlin. */
export function berlinNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));
export const toHm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export function openNow(hours: DayHours[], now = new Date()) {
  const { day, minutes } = berlinNow(now);
  const today = hours.find((h) => h.day === day);
  return !!today && !today.closed && minutes >= toMin(today.open) && minutes < toMin(today.close);
}

/**
 * Pickup slots for today ("HH:MM", Berlin time): every 15 minutes from now + lead time until closing.
 * In demo mode the shop is treated as open all day so the flow can always be shown.
 */
export function pickupSlots(hours: DayHours[], demo: boolean, now = new Date()) {
  const { day, minutes } = berlinNow(now);
  const today = hours.find((h) => h.day === day);
  let open = today && !today.closed ? toMin(today.open) : null;
  let close = today && !today.closed ? toMin(today.close) : null;
  if (demo) {
    open = 0;
    close = 24 * 60 - 1;
  }
  if (open === null || close === null) return [];
  const earliest = Math.max(open, minutes + LEAD_MINUTES);
  const first = Math.ceil(earliest / STEP_MINUTES) * STEP_MINUTES;
  const slots: string[] = [];
  for (let m = first; m < close && slots.length < 48; m += STEP_MINUTES) slots.push(toHm(m));
  return slots;
}

/** Turn a Berlin "HH:MM" today into an absolute Date (handles DST by measuring the offset). */
export function slotToDate(hm: string, now = new Date()) {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const asUtc = new Date(`${ymd}T${hm}:00Z`);
  const berlinHm = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(asUtc);
  const offset = toMin(berlinHm) - toMin(hm);
  const wrapped = ((offset + 12 * 60) % (24 * 60)) - 12 * 60;
  return new Date(asUtc.getTime() - wrapped * 60_000);
}

export function formatTime(iso: string, lang: "de" | "en") {
  return new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}
