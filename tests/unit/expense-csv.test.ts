import { describe, expect, it } from "vitest";

import { buildExpenseCsv } from "@/features/expenses/csv";
import type { ExpenseExportRow } from "@/features/expenses/queries";

const rows: ExpenseExportRow[] = [
  {
    number: "EXP-2026-00001",
    date: new Date("2026-09-03T00:00:00.000Z"),
    category: "Office Rent",
    description: "Lagos office, September",
    vendor: "Landmark Properties, Ltd",
    amount: 450000,
    paymentMethod: "TRANSFER",
    status: "APPROVED",
    paidByName: "Frankie Goyette",
  },
  {
    number: "EXP-2026-00002",
    date: new Date("2026-09-10T00:00:00.000Z"),
    category: "Supplies",
    description: 'A4 paper, 500ct"',
    vendor: null,
    amount: 12000,
    paymentMethod: null,
    status: "PENDING",
    paidByName: null,
  },
];

describe("buildExpenseCsv", () => {
  const csv = buildExpenseCsv(rows);
  const lines = csv.split("\r\n");

  it("writes a header row", () => {
    expect(lines[0]).toBe(
      "Expense ID,Date,Category,Description,Vendor,Amount (NGN),Payment Method,Status,Paid By",
    );
  });

  it("writes amounts as bare numbers so spreadsheets can sum them", () => {
    expect(lines[1]).toContain(",450000,");
    expect(csv).not.toContain("₦");
  });

  it("maps status to its display label", () => {
    expect(lines[1]).toContain("Paid");
    expect(lines[2]).toContain("Pending");
  });

  it("escapes a vendor name containing a comma", () => {
    expect(lines[1]).toContain('"Landmark Properties, Ltd"');
  });

  it("renders null vendor/payment method/paid-by as empty fields", () => {
    expect(lines[2]).toBe('EXP-2026-00002,2026-09-10,Supplies,"A4 paper, 500ct""",,12000,,Pending,');
  });

  it("formats the date as a plain ISO day", () => {
    expect(lines[1]).toContain("2026-09-03");
  });
});
