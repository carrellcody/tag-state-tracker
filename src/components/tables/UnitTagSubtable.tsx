import { useMemo } from "react";

interface UnitTagSubtableProps {
  tagsCsv: string;
  fullData: any[];
}

const subColumns = [
  "Tag",
  "Drawn_out_level",
  "Chance_at_DOL",
  "Dates",
  "Total Hunters",
  "Percent Success",
];

const subLabels: Record<string, string> = {
  "Tag": "Tag",
  "Drawn_out_level": "Drawn out level",
  "Chance_at_DOL": "Odds to draw at drawn out level",
  "Dates": "Dates",
  "Total Hunters": "Total Hunters",
  "Percent Success": "Percent Success",
};

export function UnitTagSubtable({ tagsCsv, fullData }: UnitTagSubtableProps) {
  const tags = useMemo(
    () =>
      String(tagsCsv || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsCsv]
  );

  const rows = useMemo(() => {
    if (tags.length === 0 || !fullData || fullData.length === 0) return [];
    const set = new Set(tags);
    return fullData.filter((r: any) => set.has(String(r.Tag || "").trim()));
  }, [tags, fullData]);

  if (rows.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No matching tag details available.
      </div>
    );
  }

  const formatPercent = (val: any) => {
    if (val === "" || val == null) return "";
    const n = parseFloat(String(val).replace(/[%,$\s]/g, ""));
    if (isNaN(n)) return String(val);
    return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          {subColumns.map((c) => (
            <th key={c} className="border p-1 bg-accent text-left">
              {subLabels[c]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r: any, i: number) => (
          <tr key={i}>
            {subColumns.map((c) => (
              <td key={c} className="border p-1">
                {c === "Percent Success" || c === "Chance_at_DOL"
                  ? formatPercent(r[c])
                  : r[c] || ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
