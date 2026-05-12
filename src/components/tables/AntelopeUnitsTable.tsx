import { Fragment, useMemo, useState, useEffect } from "react";
import { useCsvData } from "@/hooks/useCsvData";
import { CSV_VERSION } from "@/utils/csvVersion";
import { UnitTagSubtable } from "@/components/tables/UnitTagSubtable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TableHeaderHelp } from "@/components/tables/TableHeaderHelp";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useIsMobile } from "@/hooks/use-mobile";

const ROWS_PER_PAGE = 50;

const visibleColumns = ['Unit', 'Acres', 'Acres Public', 'DAU', 'Population', 'DAUAnimalDensity', 'Buck/Doe Ratio', 'DAUBuckDensity', 'Total_Harvest_estimate', 'Success_DAU'];

const headerLabels: Record<string, string> = {
  'Unit': 'Unit',
  'Acres': 'Acres',
  'Acres Public': 'Public Acres',
  'DAU': 'DAU',
  'Population': 'Population Estimate',
  'DAUAnimalDensity': 'Pronghorn Density (Population/Acres)',
  'Buck/Doe Ratio': 'Buck:Doe ratio',
  'DAUBuckDensity': 'Normalized Buck Density (0-1)',
  'Total_Harvest_estimate': 'Harvest',
  'Success_DAU': '% Success',
};

const groupedColumns = ['Population', 'DAUAnimalDensity', 'Buck/Doe Ratio', 'DAUBuckDensity', 'Total_Harvest_estimate', 'Success_DAU'];
const ungroupedColumns = visibleColumns.filter((c) => !groupedColumns.includes(c));

const headerHelp: Record<string, string> = {
  'DAUBuckDensity': 'Results are normalized to the maximum value, so 1 is the maximum buck density, and 0 is the lowest. Results are calculated by multiplying the DAU population by the buck:doe ratio and dividing by the total acreage of the DAU',
};

function parseNumeric(val: any): number {
  if (val == null) return NaN;
  const n = parseFloat(String(val).replace(/[%,$\s]/g, ""));
  return isNaN(n) ? NaN : n;
}

export function AntelopeUnitsTable() {
  const { data, loading, error } = useCsvData(`/data/AntDraw25Subtable.csv?v=${CSV_VERSION}`);
  const { data: fullData } = useCsvData(`/data/Fullant26Final.csv?v=${CSV_VERSION}`);
  const isMobile = useIsMobile();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const [unitSearch, setUnitSearch] = usePersistedState("antelopeUnits_unitSearch", "");
  const [minPublicPercent, setMinPublicPercent] = usePersistedState("antelopeUnits_minPublicPercent", "");
  const [minBuckDoe, setMinBuckDoe] = usePersistedState("antelopeUnits_minBuckDoe", "");
  const [dauFilter, setDauFilter] = usePersistedState<string[]>("antelopeUnits_dauFilter", []);
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
        const bd = parseNumeric(row["Buck/Doe Ratio"]);
        if (isNaN(bd) || bd < minBD) return false;
      }
      if (Array.isArray(dauFilter) && dauFilter.length > 0) {
        if (!dauFilter.includes(String(row.DAU || "").trim())) return false;
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

  if (loading) return <div className="p-8 text-center">Loading antelope unit data...</div>;
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-normal">
                <span className="truncate">
                  {dauFilter.length === 0
                    ? "All DAUs"
                    : dauFilter.length === 1
                    ? dauFilter[0]
                    : `${dauFilter.length} selected`}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50 shrink-0 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 max-h-72 overflow-y-auto bg-popover z-50">
              <div className="flex items-center justify-between px-1 pb-2 border-b mb-1">
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setDauFilter(dauOptions)}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:underline"
                  onClick={() => setDauFilter([])}
                >
                  Clear
                </button>
              </div>
              {dauOptions.map((dau) => {
                const checked = dauFilter.includes(dau);
                return (
                  <label
                    key={dau}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        if (v) setDauFilter([...dauFilter, dau]);
                        else setDauFilter(dauFilter.filter((d) => d !== dau));
                      }}
                    />
                    <span>{dau}</span>
                  </label>
                );
              })}
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setUnitSearch("");
            setMinPublicPercent("");
            setMinBuckDoe("");
            setDauFilter([]);
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

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse bg-card relative">
            <thead className="sticky top-0 gradient-primary z-10">
              <tr>
                <th rowSpan={2} className="border border-border p-2 text-primary-foreground w-8"></th>
                {ungroupedColumns.map((col) => (
                  <th
                    key={col}
                    rowSpan={2}
                    onClick={() => handleSort(col)}
                    className="relative border border-border p-2 pr-6 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground"
                  >
                    <div className="flex items-center gap-1">
                      {headerHelp[col] ? (
                        <TableHeaderHelp label={headerLabels[col] || col} helpText={headerHelp[col]} />
                      ) : (
                        <span>{headerLabels[col] || col}</span>
                      )}
                      {sortColumn === col &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </div>
                  </th>
                ))}
                <th colSpan={groupedColumns.length} className="border border-border p-2 text-center text-primary-foreground">
                  DAU-Specific Statistics
                </th>
              </tr>
              <tr>
                {groupedColumns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="relative border border-border p-2 pr-6 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground"
                  >
                    <div className="flex items-center gap-1">
                      {headerHelp[col] ? (
                        <TableHeaderHelp label={headerLabels[col] || col} helpText={headerHelp[col]} />
                      ) : (
                        <span>{headerLabels[col] || col}</span>
                      )}
                      {sortColumn === col &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row: any, idx) => {
                const isExpanded = expandedRows.has(idx);
                return (
                  <Fragment key={idx}>
                    <tr className="group hover:bg-accent cursor-pointer" onClick={() => toggleRow(idx)}>
                      <td className="border border-border p-2 text-center text-primary-dark group-hover:text-primary select-none">
                        {isExpanded ? "▼" : "▶"}
                      </td>
                      {visibleColumns.map((col) => (
                        <td key={col} className="border border-border p-2">
                          {col === "Unit" && row.onx && !isMobile ? (
                            <a href={row.onx} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary-dark group-hover:text-primary hover:underline">
                              {row[col] || ""}
                            </a>
                          ) : col === "Unit" ? (
                            <span className="text-primary-dark group-hover:text-primary">
                              {row[col] || ""}
                            </span>
                          ) : col === "Success_DAU" && row[col] !== "" && row[col] != null && !isNaN(parseFloat(row[col])) ? (
                            `${(parseFloat(row[col]) * 100).toFixed(1)}%`
                          ) : (
                            row[col] || ""
                          )}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={visibleColumns.length + 1} className="border border-border p-4 bg-primary-foreground">
                          <UnitTagSubtable tagsCsv={row.Tag} fullData={fullData} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="border border-border p-8 text-center text-muted-foreground">
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
