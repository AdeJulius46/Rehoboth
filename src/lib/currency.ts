const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

export function formatNaira(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return nairaFormatter.format(value);
}
