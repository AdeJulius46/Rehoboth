import { describe, expect, it } from "vitest";
import { formatNaira } from "@/lib/currency";

describe("formatNaira", () => {
  it("formats a number as NGN currency", () => {
    expect(formatNaira(12450000)).toBe("₦12,450,000.00");
  });

  it("formats a numeric string", () => {
    expect(formatNaira("1000")).toBe("₦1,000.00");
  });
});
