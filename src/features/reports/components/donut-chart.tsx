"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { formatNaira } from "@/lib/currency";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: { label: string; value: number }[];
  centerLabel: string;
  centerValue: number;
}) {
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="flex items-center gap-6">
      <div className="relative size-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={hasData ? data : [{ label: "No data", value: 1 }]}
              dataKey="value"
              nameKey="label"
              innerRadius={62}
              outerRadius={90}
              strokeWidth={2}
              stroke="var(--card)"
            >
              {(hasData ? data : [{ label: "No data", value: 1 }]).map((entry, index) => (
                <Cell key={entry.label} fill={hasData ? COLORS[index % COLORS.length] : "var(--muted)"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-muted-foreground">{centerLabel}</p>
          <p className="text-lg font-semibold text-foreground">{formatNaira(centerValue)}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        {data.map((entry, index) => (
          <div key={entry.label} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-muted-foreground">{entry.label}</span>
            <span className="font-medium text-foreground">{formatNaira(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
