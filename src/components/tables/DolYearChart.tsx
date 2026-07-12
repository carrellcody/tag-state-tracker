import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DolYearChartProps {
  row: Record<string, any>;
}

const parseDol = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (!s) return null;
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = parseFloat(m[0]);
  return isNaN(n) ? null : n;
};

const formatDol = (v: number): string => {
  if (v === -1) return "Choice 2";
  if (v === -2) return "Choice 3";
  if (v === -3) return "Choice 4";
  if (v === -4) return "Leftovers";
  return String(v);
};

export function DolYearChart({ row }: DolYearChartProps) {
  const data = [
    { year: "2023", dol: parseDol(row.DOLE23) },
    { year: "2024", dol: parseDol(row.DOLE24) },
    { year: "2025", dol: parseDol(row.DOLE25) },
    { year: "2026", dol: parseDol(row.DOLE26) },
  ];

  const anyData = data.some((d) => d.dol !== null);
  if (!anyData) return null;

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold mb-2">Drawn Out Level by Year</div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              tickFormatter={(v: number) => formatDol(v)}
              label={{ value: "Drawn Out Level", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
            />
            <Tooltip formatter={(v: any) => (typeof v === "number" ? formatDol(v) : v)} />
            <Line
              type="linear"
              dataKey="dol"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
