import { describe, expect, it } from "vitest";

import { csvField, toCsv } from "@/lib/csv";
import { buildReportCsv, type ReportCsvData } from "@/features/reports/csv";

const data: ReportCsvData = {
  days: 30,
  stats: { totalRevenue: 12450000, totalOrders: 620, totalExpenses: 450000, netProfit: 12000000 },
  trend: [
    { date: "2026-08-05", revenue: 125000 },
    { date: "2026-08-06", revenue: 0 },
  ],
  categories: [{ category: "Cement", value: 900000 }],
  topProducts: [
    { name: "Dangote Cement, 50kg", unitsSold: 120, totalSales: 900000, percentage: 42.5 },
    { name: 'Rod 12" heavy', unitsSold: 30, totalSales: 150000, percentage: 7.1 },
  ],
};

describe("csvField", () => {
  it("leaves plain values alone", () => {
    expect(csvField("Cement")).toBe("Cement");
    expect(csvField(1250)).toBe("1250");
  });

  it("quotes values containing a comma", () => {
    expect(csvField("Dangote Cement, 50kg")).toBe('"Dangote Cement, 50kg"');
  });

  it("doubles embedded quotes", () => {
    expect(csvField('Rod 12" heavy')).toBe('"Rod 12"" heavy"');
  });

  it("renders null and undefined as empty", () => {
    expect(csvField(null)).toBe("");
    expect(csvField(undefined)).toBe("");
  });
});

describe("toCsv", () => {
  it("joins rows with CRLF", () => {
    expect(toCsv([["a", "b"], [1, 2]])).toBe("a,b\r\n1,2");
  });
});

describe("buildReportCsv", () => {
  const csv = buildReportCsv(data, new Date("2026-09-03T10:00:00.000Z"));
  const lines = csv.split("\r\n");

  it("includes every section", () => {
    expect(csv).toContain("Summary (all time)");
    expect(csv).toContain("Daily Revenue (last 30 days)");
    expect(csv).toContain("Sales by Category (all time)");
    expect(csv).toContain("Top Selling Products (all time)");
  });

  it("writes amounts as bare numbers so spreadsheets can sum them", () => {
    expect(lines).toContain("Total Revenue (NGN),12450000");
    // No naira sign and no thousands separators anywhere in the data.
    expect(csv).not.toContain("₦");
    expect(csv).not.toContain("12,450,000");
  });

  it("escapes product names that contain commas or quotes", () => {
    expect(lines).toContain('"Dangote Cement, 50kg",120,900000,42.5');
    expect(lines).toContain('"Rod 12"" heavy",30,150000,7.1');
  });

  it("keeps zero-revenue days rather than dropping them", () => {
    expect(lines).toContain("2026-08-06,0");
  });

  it("stamps when it was generated", () => {
    expect(lines[1]).toBe("Generated,2026-09-03T10:00:00.000Z");
  });
});
