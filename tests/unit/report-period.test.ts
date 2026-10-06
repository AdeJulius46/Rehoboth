import { describe, expect, it } from "vitest";

import { resolveReportRange, showsNetProfit } from "@/features/reports/period";

describe("showsNetProfit", () => {
  it("is off for today and this week", () => {
    expect(showsNetProfit(resolveReportRange({ period: "today" }))).toBe(false);
    expect(showsNetProfit(resolveReportRange({ period: "week" }))).toBe(false);
  });

  it("is on for this month and this year", () => {
    expect(showsNetProfit(resolveReportRange({}))).toBe(true);
    expect(showsNetProfit(resolveReportRange({ period: "year" }))).toBe(true);
  });

  it("is on for custom ranges of a month or more, off for shorter ones", () => {
    const range = (from: string, to: string) => resolveReportRange({ period: "custom", from, to });
    expect(showsNetProfit(range("2026-01-01", "2026-01-31"))).toBe(true);
    expect(showsNetProfit(range("2026-01-01", "2026-01-10"))).toBe(false);
  });
});
