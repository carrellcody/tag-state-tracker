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

export function DolYearChart({ row }: DolYearChartProps) {
  const data = [
    { year: "2023", dol: parseDol(row.Drawn_out_level23 ?? row.DOLE23) },
    { year: "2024", dol: parseDol(row.Drawn_out_level24 ?? row.DOLE24) },
    { year: "2025", dol: parseDol(row.Drawn_out_level25 ?? row.DOLE25) },
    { year: "2026", dol: parseDol(row.Drawn_out_level ?? row.DOLE26) },
  ];

  const anyData = data.some((d) => d.dol !== null);
  if (!anyData) return null;

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold mb-2">Drawn Out Level by Year</div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              allowDecimals={false}
              label={{ value: "Drawn Out Level", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
            />
            <Tooltip />
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
