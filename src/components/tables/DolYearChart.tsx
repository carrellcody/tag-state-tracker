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
  if (v <= -5) return "";
  return String(v);
};

export function DolYearChart({ row }: DolYearChartProps) {
  const data = [
    {
      year: "2023",
      dol: parseDol(row.DOLE23),
      chance: row.Chance_at_DOL23,
      dolLabel: row.Drawn_out_level23,
    },
    {
      year: "2024",
      dol: parseDol(row.DOLE24),
      chance: row.Chance_at_DOL24,
      dolLabel: row.Drawn_out_level24,
    },
    {
      year: "2025",
      dol: parseDol(row.DOLE25),
      chance: row.Chance_at_DOL25,
      dolLabel: row.Drawn_out_level25,
    },
    {
      year: "2026",
      dol: parseDol(row.DOLE26),
      chance: row.Chance_at_DOL,
      dolLabel: row.Drawn_out_level,
    },
  ];

  const values = data.map((d) => d.dol).filter((v): v is number => v !== null);
  if (values.length === 0) return null;

  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const yMin = Math.floor(minV);
  const yMax = Math.ceil(maxV);

  const ticks: number[] = [];
  for (let i = yMin; i <= yMax; i++) ticks.push(i);

  return (
    <div className="mt-4 w-full md:w-1/2 mx-auto">
      <div className="text-sm font-semibold mb-2 text-center">Drawn Out Level by Year</div>
      <div className="bg-card rounded-md p-2" style={{ width: "100%", height: 200 }}>
        <div className="relative h-full w-full pl-10">
          <div className="absolute left-0 top-1/2 w-40 -translate-x-8 -translate-y-1/2 -rotate-90 text-center text-sm font-medium text-muted-foreground">
            Drawn Out Level
          </div>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 24, bottom: 35 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tickMargin={10} interval={0} />
            <YAxis
              yAxisId="left"
              orientation="left"
              width={76}
              domain={[yMin, yMax]}
              ticks={ticks}
              allowDecimals={false}
              tickFormatter={(v: number) => formatDol(v)}
              padding={{ bottom: 15 }}
            />
            <Tooltip
              formatter={(_v: any, _n: any, item: any) => {
                const p = item?.payload || {};
                const chance = p.chance ?? "";
                const dolLabel = p.dolLabel ?? "";
                return [`${chance} at ${dolLabel}`, "Odds"];
              }}
            />
            <Line
              yAxisId="left"
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
    </div>
  );
}
