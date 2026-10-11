/**
 * Digest schedule configuration and helpers.
 * Allows users to customize:
 *  1. Delivery time of day (e.g. 08:00, 12:00, 18:00, or custom)
 *  2. Frequency / number of emails per week (daily, weekdays, 3x/week, weekly, or custom 1-7)
 *  3. Number of highlights per email (e.g. 3, 5, 10)
 */

export type DigestCadence = "daily" | "weekdays" | "3x_week" | "weekly" | "custom";

export interface DigestSchedule {
  cadence: DigestCadence;
  time: string; // 24-hr format "HH:MM" (e.g. "08:00")
  emailsPerWeek: number; // 1 to 7
  highlightsPerEmail: number; // 1 to 10
  days: string[]; // ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  timezone?: string;
}

export const ALL_DAYS = [
  { id: "mon", label: "Mon", full: "Monday" },
  { id: "tue", label: "Tue", full: "Tuesday" },
  { id: "wed", label: "Wed", full: "Wednesday" },
  { id: "thu", label: "Thu", full: "Thursday" },
  { id: "fri", label: "Fri", full: "Friday" },
  { id: "sat", label: "Sat", full: "Saturday" },
  { id: "sun", label: "Sun", full: "Sunday" },
];

export const TIME_PRESETS = [
  { time: "08:00", label: "8:00 AM", desc: "Morning reflection with coffee" },
  { time: "12:00", label: "12:00 PM", desc: "Midday quiet break" },
  { time: "18:00", label: "6:00 PM", desc: "Evening commute & unwind" },
  { time: "21:00", label: "9:00 PM", desc: "Nightly contemplation" },
];

export const DEFAULT_DIGEST_SCHEDULE: DigestSchedule = {
  cadence: "daily",
  time: "08:00",
  emailsPerWeek: 7,
  highlightsPerEmail: 5,
  days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  timezone: "UTC",
};

/** Parse a raw database frequency string (supports legacy "daily"/"weekly" or new JSON). */
export function parseDigestSchedule(raw: string | null | undefined): DigestSchedule {
  if (!raw) return DEFAULT_DIGEST_SCHEDULE;

  if (raw === "daily") {
    return {
      ...DEFAULT_DIGEST_SCHEDULE,
      cadence: "daily",
      emailsPerWeek: 7,
      days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    };
  }

  if (raw === "weekly") {
    return {
      ...DEFAULT_DIGEST_SCHEDULE,
      cadence: "weekly",
      emailsPerWeek: 1,
      time: "09:00",
      days: ["sun"],
    };
  }

  try {
    const data = JSON.parse(raw);
    if (typeof data === "object" && data !== null) {
      let days = Array.isArray(data.days) && data.days.length > 0 ? data.days : [];
      let emailsPerWeek = typeof data.emailsPerWeek === "number" ? data.emailsPerWeek : 7;
      let cadence: DigestCadence = data.cadence || "daily";

      if (days.length === 0) {
        if (cadence === "daily") days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        else if (cadence === "weekdays") days = ["mon", "tue", "wed", "thu", "fri"];
        else if (cadence === "3x_week") days = ["mon", "wed", "fri"];
        else if (cadence === "weekly") days = ["sun"];
        else days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      }

      return {
        cadence,
        time: typeof data.time === "string" && data.time.includes(":") ? data.time : "08:00",
        emailsPerWeek: Math.max(1, Math.min(7, emailsPerWeek)),
        highlightsPerEmail: Math.max(1, Math.min(10, typeof data.highlightsPerEmail === "number" ? data.highlightsPerEmail : 5)),
        days,
        timezone: data.timezone || "UTC",
      };
    }
  } catch {
    // Non-JSON fallback
  }

  return DEFAULT_DIGEST_SCHEDULE;
}

/** Serialize a DigestSchedule into a storage string. */
export function serializeDigestSchedule(schedule: DigestSchedule): string {
  return JSON.stringify(schedule);
}

/** Convert "HH:MM" (24h) to "H:MM AM/PM". */
export function formatTimeDisplay(time: string): string {
  const parts = time.split(":");
  const h = parseInt(parts[0] || "8", 10);
  const m = parts[1] || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${ampm}`;
}

/** Human-friendly schedule description. */
export function formatScheduleSummary(schedule: DigestSchedule): string {
  const timeFormatted = formatTimeDisplay(schedule.time);
  const countStr = `${schedule.highlightsPerEmail} ${schedule.highlightsPerEmail === 1 ? "quote" : "quotes"}`;

  if (schedule.cadence === "daily" || schedule.emailsPerWeek === 7) {
    return `Every day at ${timeFormatted} · ${countStr} per email`;
  }
  if (schedule.cadence === "weekdays" || (schedule.emailsPerWeek === 5 && schedule.days.length === 5 && !schedule.days.includes("sat") && !schedule.days.includes("sun"))) {
    return `Weekdays at ${timeFormatted} · ${countStr} per email`;
  }
  if (schedule.cadence === "3x_week" || schedule.emailsPerWeek === 3) {
    return `3 days a week at ${timeFormatted} · ${countStr} per email`;
  }
  if (schedule.cadence === "weekly" || schedule.emailsPerWeek === 1) {
    const day = schedule.days[0] ? ALL_DAYS.find((d) => d.id === schedule.days[0])?.full ?? "Sunday" : "Sunday";
    return `Every ${day} at ${timeFormatted} · ${countStr} per email`;
  }

  return `${schedule.emailsPerWeek} emails a week at ${timeFormatted} · ${countStr} per email`;
}
