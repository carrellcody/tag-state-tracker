import { useMemo, useState, useEffect } from "react";
import { useCsvData } from "@/hooks/useCsvData";
import { CSV_VERSION } from "@/utils/csvVersion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePersistedState } from "@/hooks/usePersistedState";

const ROWS_PER_PAGE = 50;

const COLUMNS: { key: string; label: string }[] = [
  { key: "Unit", label: "Unit" },
  { key: "Acres", label: "Acres" },
  { key: "Acres Public", label: "Public Acres" },
  { key: "percent_public", label: "Percent Public" },
  { key: "DAU", label: "DAU #" },
  { key: "Herd Name", label: "Herd Name" },
  { key: "Post Hunt Estimate", label: "DAU Population" },
  { key: "DAUAnimalDensity", label: "DAU Deer Density (Population/Acres)" },
  { key: "Buck/ Doe ratio (per 100)", label: "DAU Buck:Doe ratio (per 100)" },
  { key: "DAUBuckDensity", label: "DAU Buck Density (Deer Density x Buck:Doe ratio)" },
];

function parseNumeric(val: any): number {
  if (val == null) return NaN;
  const n = parseFloat(String(val).replace(/[%,$\s]/g, ""));
  return isNaN(n) ? NaN : n;
}

function formatCell(key: string, val: any): string {
  if (val == null || val === "") return "-";
  const str = String(val).trim();
  if (key === "percent_public") {
    const n = parseNumeric(str);
    if (!isNaN(n)) {
      const pct = n <= 1 ? n * 100 : n;
      return `${pct.toFixed(1)}%`;
    }
  }
  if (key === "DAUAnimalDensity" || key === "DAUBuckDensity") {
    const n = parseNumeric(str);
    if (!isNaN(n)) return n.toFixed(4);
  }
  if (key === "Acres" || key === "Acres Public" || key === "Post Hunt Estimate") {
    const n = parseNumeric(str);
    if (!isNaN(n)) return n.toLocaleString();
  }
  return str;
}

export function DeerUnitsTable() {
  const { data, loading, error } = useCsvData(`/data/DeerDraw25Subtable.csv?v=${CSV_VERSION}`);

  const [unitSearch, setUnitSearch] = usePersistedState("deerUnits_unitSearch", "");
  const [minPublicPercent, setMinPublicPercent] = usePersistedState("deerUnits_minPublicPercent", "");
  const [minBuckDoe, setMinBuckDoe] = usePersistedState("deerUnits_minBuckDoe", "");
  const [dauFilter, setDauFilter] = usePersistedState("deerUnits_dauFilter", "all");
  const [showMobileFilters, setShowMobileFilters] = useState(true);

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [unitSearch, minPublicPercent, minBuckDoe, dauFilter]);

  const dauOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row: any) => {
      const dau = String(row.DAU || "").trim();
      if (dau) set.add(dau);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [data]);

  const filtered = useMemo(() => {
    const minPct = parseNumeric(minPublicPercent);
    const minBD = parseNumeric(minBuckDoe);
    return data.filter((row: any) => {
      if (unitSearch) {
        const terms = unitSearch.split(",").map((s) => s.trim()).filter(Boolean);
        if (terms.length > 0) {
          const unit = String(row.Unit || "").trim();
          if (!terms.some((t) => unit === t)) return false;
        }
      }
      if (!isNaN(minPct)) {
        const pubRaw = parseNumeric(row.percent_public);
        if (isNaN(pubRaw)) return false;
        const pubPct = pubRaw <= 1 ? pubRaw * 100 : pubRaw;
        if (pubPct < minPct) return false;
      }
      if (!isNaN(minBD)) {
        const bd = parseNumeric(row["Buck/ Doe ratio (per 100)"]);
        if (isNaN(bd) || bd < minBD) return false;
      }
      if (dauFilter !== "all") {
        if (String(row.DAU || "").trim() !== dauFilter) return false;
      }
      return true;
    });
  }, [data, unitSearch, minPublicPercent, minBuckDoe, dauFilter]);

  const sorted = useMemo(() => {
    if (!sortColumn) return filtered;
    return [...filtered].sort((a: any, b: any) => {
      const aN = parseNumeric(a[sortColumn]);
      const bN = parseNumeric(b[sortColumn]);
      if (!isNaN(aN) && !isNaN(bN)) return sortDirection === "asc" ? aN - bN : bN - aN;
      const aS = String(a[sortColumn] || "").toLowerCase();
      const bS = String(b[sortColumn] || "").toLowerCase();
      if (aS < bS) return sortDirection === "asc" ? -1 : 1;
      if (aS > bS) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortColumn, sortDirection]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return sorted.slice(start, start + ROWS_PER_PAGE);
  }, [sorted, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));

  const handleSort = (col: string) => {
    if (sortColumn === col) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading deer unit data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <aside
        className={`w-full lg:w-64 bg-card p-4 rounded-lg border space-y-4 overflow-y-auto ${
          !showMobileFilters ? "hidden" : "block"
        } md:block`}
      >
        <Button
          onClick={() => setShowMobileFilters(false)}
          className="w-full mb-4 md:hidden"
        >
          Apply filters and view data
        </Button>
        <h3 className="font-semibold text-lg">Filters</h3>

        <div className="space-y-2">
          <Label>Search Units</Label>
          <Input
            placeholder="e.g. 10, 1, 15"
            value={unitSearch}
            onChange={(e) => setUnitSearch(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Separate multiple units with commas.</p>
        </div>

        <div className="space-y-2">
          <Label>Minimum Public Land %</Label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 50"
            value={minPublicPercent}
            onChange={(e) => setMinPublicPercent(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Buck:Doe Ratio</Label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 25"
            value={minBuckDoe}
            onChange={(e) => setMinBuckDoe(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>DAU</Label>
          <Select value={dauFilter} onValueChange={setDauFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select DAU" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All DAUs</SelectItem>
              {dauOptions.map((dau) => (
                <SelectItem key={dau} value={dau}>
                  {dau}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setUnitSearch("");
            setMinPublicPercent("");
            setMinBuckDoe("");
            setDauFilter("all");
          }}
        >
          Reset Filters
        </Button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden mb-2">
          {!showMobileFilters && (
            <Button onClick={() => setShowMobileFilters(true)} variant="outline" className="w-full">
              Show Filters
            </Button>
          )}
        </div>

        <div className="mb-2 text-sm text-muted-foreground">
          Showing {paginated.length} of {sorted.length} units
        </div>

        <div className="flex-1 overflow-auto border rounded-lg bg-card">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-3 py-2 text-left font-semibold cursor-pointer hover:bg-muted/70 border-b align-top"
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {sortColumn === col.key &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row: any, idx) => (
                <tr key={idx} className="border-b hover:bg-blue-50 group">
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-3 py-2 align-top">
                      {formatCell(col.key, row[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-3 py-8 text-center text-muted-foreground">
                    No units match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
