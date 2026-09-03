import { toCsv, type CsvValue } from "@/lib/csv";

export type ReportCsvData = {
  days: number;
  stats: { totalRevenue: number; totalOrders: number; totalExpenses: number; netProfit: number };
  trend: { date: string; revenue: number }[];
  categories: { category: string; value: number }[];
  topProducts: { name: string; unitsSold: number; totalSales: number; percentage: number }[];
};

/**
 * Lay the report out as one CSV with a labelled block per table.
 *
 * Amounts are written as bare numbers rather than formatted naira so they stay
 * usable in spreadsheet formulas. Only the sales trend is scoped to the chosen
 * period — every other figure on the page is all-time — so the headings say
 * which is which.
 */
export function buildReportCsv(data: ReportCsvData, generatedAt = new Date()): string {
  const rows: CsvValue[][] = [];

  rows.push(["Rehoboth Report"]);
  rows.push(["Generated", generatedAt.toISOString()]);
  rows.push([]);

  rows.push(["Summary (all time)"]);
  rows.push(["Metric", "Value"]);
  rows.push(["Total Revenue (NGN)", data.stats.totalRevenue]);
  rows.push(["Total Orders", data.stats.totalOrders]);
  rows.push(["Total Expenses (NGN)", data.stats.totalExpenses]);
  rows.push(["Net Profit (NGN)", data.stats.netProfit]);
  rows.push([]);

  rows.push([`Daily Revenue (last ${data.days} days)`]);
  rows.push(["Date", "Revenue (NGN)"]);
  for (const point of data.trend) {
    rows.push([point.date, point.revenue]);
  }
  rows.push([]);

  rows.push(["Sales by Category (all time)"]);
  rows.push(["Category", "Revenue (NGN)"]);
  for (const category of data.categories) {
    rows.push([category.category, category.value]);
  }
  rows.push([]);

  rows.push(["Top Selling Products (all time)"]);
  rows.push(["Product", "Units Sold", "Total Sales (NGN)", "% of Revenue"]);
  for (const product of data.topProducts) {
    rows.push([product.name, product.unitsSold, product.totalSales, product.percentage]);
  }

  return toCsv(rows);
}
