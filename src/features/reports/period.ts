export type ReportPeriodKey = "today" | "week" | "month" | "custom";

export type ReportRange = {
  key: ReportPeriodKey;
  /** Midnight at the start of the first day. */
  start: Date;
  /** Midnight after the last day (exclusive). */
  end: Date;
  /** Human-readable label, used in the CSV export. */
  label: string;
};

const MAX_CUSTOM_DAYS = 366;

/** YYYY-MM-DD in local time, matching what <input type="date"> produces. */
export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Turn the `period`, `from` and `to` search params into a date range.
 * Defaults to the current month; an incomplete or invalid custom range falls back to it too.
 */
export function resolveReportRange(params: { period?: string; from?: string; to?: string }): ReportRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (params.period === "today") {
    return { key: "today", start: today, end: addDays(today, 1), label: `Today (${toDateKey(today)})` };
  }

  if (params.period === "week") {
    // Weeks run Monday to Sunday.
    const start = addDays(today, -((today.getDay() + 6) % 7));
    const end = addDays(start, 7);
    return { key: "week", start, end, label: `This week (${toDateKey(start)} to ${toDateKey(addDays(end, -1))})` };
  }

  if (params.period === "custom") {
    let from = parseDateKey(params.from);
    let to = parseDateKey(params.to);
    if (from && to) {
      if (from > to) [from, to] = [to, from];
      if (addDays(from, MAX_CUSTOM_DAYS) <= to) to = addDays(from, MAX_CUSTOM_DAYS - 1);
      return {
        key: "custom",
        start: from,
        end: addDays(to, 1),
        label: `${toDateKey(from)} to ${toDateKey(to)}`,
      };
    }
  }

  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const monthName = today.toLocaleString("en-US", { month: "long", year: "numeric" });
  return { key: "month", start, end, label: `This month (${monthName})` };
}
