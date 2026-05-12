import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UnitTagSubtableProps {
  tagsCsv: string;
  fullData: any[];
}

const statsColumns = [
  "Tag",
  "Drawn_out_level",
  "Chance_at_DOL",
  "Total Hunters",
  "Percent Success",
];

const subColumns = [...statsColumns, "Dates"];

const subLabels: Record<string, string> = {
  "Tag": "Tag",
  "Drawn_out_level": "Drawn out level",
  "Chance_at_DOL": "Odds to draw at drawn out level",
  "Dates": "2026 Hunt Dates",
  "Total Hunters": "Total Hunters",
  "Percent Success": "Percent Success",
};

export function UnitTagSubtable({ tagsCsv, fullData }: UnitTagSubtableProps) {
  const { user } = useAuth();
  const [stateResidency, setStateResidency] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setStateResidency(null);
      return;
    }
    supabase
      .from("profiles")
      .select("state_residency")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setStateResidency(data?.state_residency ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const desiredClass = useMemo(() => {
    const s = (stateResidency || "").trim().toLowerCase();
    if (!user || !s) return "A_R";
    return s === "colorado" || s === "co" ? "A_R" : "A_NR";
  }, [user, stateResidency]);

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
    return fullData.filter(
      (r: any) =>
        set.has(String(r.Tag || "").trim()) &&
        String(r.Class || "").trim() === desiredClass
    );
  }, [tags, fullData, desiredClass]);

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
