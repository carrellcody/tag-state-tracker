import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SuccessRateYearChartProps {
  row: Record<string, any>;
}

const parsePercent = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  const value = String(val).trim();
  if (!value) return null;

  const parsed = Number.parseFloat(value.replace(/[%,$\s]/g, ""));
  if (Number.isNaN(parsed)) return null;

  return parsed <= 1 && !value.includes("%") ? parsed * 100 : parsed;
};

const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

export function SuccessRateYearChart({ row }: SuccessRateYearChartProps) {
  const data = [
    { year: "2022", successRate: parsePercent(row.PS22Avg) },
    { year: "2023", successRate: parsePercent(row.PS23Avg) },
    { year: "2024", successRate: parsePercent(row.PS24Avg) },
    { year: "2025", successRate: parsePercent(row["Percent Success"]) },
  ];

  const values = data
    .map((point) => point.successRate)
    .filter((value): value is number => value !== null);

  if (values.length === 0) return null;

  const maxValue = Math.max(...values);
  const yMax = Math.max(10, Math.ceil(maxValue / 10) * 10);

  return (
    <div className="w-full min-w-0">
      <div className="mb-2 text-center text-sm font-semibold">Success Rate by Year</div>
      <div className="h-[200px] w-full rounded-md bg-card p-2">
        <div className="relative h-full w-full pl-10">
          <div className="absolute left-0 top-1/2 w-40 -translate-x-8 -translate-y-1/2 -rotate-90 text-center text-sm font-medium text-muted-foreground">
            Success Rate
          </div>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 24, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tickMargin={10} interval={0} />
              <YAxis
                width={76}
                domain={[0, yMax]}
                allowDecimals={false}
                tickFormatter={(value: number) => `${value}%`}
                padding={{ bottom: 15 }}
              />
              <Tooltip
                formatter={(value: number | string) => {
                  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
                  return [Number.isNaN(parsed) ? value : formatPercent(parsed), "Success Rate"];
                }}
              />
              <Line
                type="linear"
                dataKey="successRate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}