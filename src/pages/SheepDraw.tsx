import { useState, useMemo, useEffect } from "react";
import { useCsvData } from "@/hooks/useCsvData";
import { CSV_VERSION } from "@/utils/csvVersion";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SEOHead } from "@/components/SEOHead";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePersistedState } from "@/hooks/usePersistedState";

const ROWS_PER_PAGE = 50;

type SheepRow = {
  Tag?: string;
  Unit?: string;
  points?: string;
  applicants?: string;
  draw_odds_pct?: string;
  Successful?: string;
  population?: string;
  sex?: string;
  weapon?: string;
  [k: string]: any;
};

const COLUMNS: { key: keyof SheepRow; label: string }[] = [
  { key: "Tag", label: "Tag" },
  { key: "Unit", label: "Unit" },
  { key: "points", label: "Bonus Points" },
  { key: "applicants", label: "Applicants" },
  { key: "draw_odds_pct", label: "Draw odds for an individual" },
  { key: "Successful", label: "2025 Successful applicants" },
  { key: "population", label: "2025 Population estimates" },
];

const toNum = (v: any) => {
  const n = parseFloat(String(v ?? "").replace(/[,%$\s]/g, ""));
  return isNaN(n) ? null : n;
};

export default function SheepDraw() {
  const { data, loading, error } = useCsvData<SheepRow>(
    `/data/sheepfinal26.csv?v=${CSV_VERSION}`
  );
  const isMobile = useIsMobile();
  const [showMobileFilters, setShowMobileFilters] = useState(true);

  const [unitSearch, setUnitSearch] = usePersistedState("sheepDraw_unitSearch", "");
  const [minPoints, setMinPoints] = usePersistedState("sheepDraw_minPoints", 0);
  const [maxPoints, setMaxPoints] = usePersistedState("sheepDraw_maxPoints", 30);
  const [sexFilter, setSexFilter] = usePersistedState<string[]>("sheepDraw_sexFilter", []);
  const [weaponFilter, setWeaponFilter] = usePersistedState<string[]>("sheepDraw_weaponFilter", []);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sexOptions = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => {
      const v = String(r.sex ?? "").trim();
      if (v) s.add(v);
    });
    return Array.from(s).sort();
  }, [data]);

  const weaponOptions = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => {
      const v = String(r.weapon ?? "").trim();
      if (v) s.add(v);
    });
    return Array.from(s).sort();
  }, [data]);

  const pointsBounds = useMemo(() => {
    let max = 0;
    data.forEach((r) => {
      const n = toNum(r.points);
      if (n !== null && n > max) max = n;
    });
    return { min: 0, max: Math.max(max, 30) };
  }, [data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [unitSearch, minPoints, maxPoints, sexFilter, weaponFilter]);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (unitSearch.trim()) {
        const terms = unitSearch.split(",").map((s) => s.trim()).filter(Boolean);
        const unit = String(row.Unit ?? "").trim();
        if (!terms.some((t) => unit === t)) return false;
      }
      const pts = toNum(row.points);
      if (pts === null || pts < minPoints || pts > maxPoints) return false;

      if (sexFilter.length > 0) {
        if (!sexFilter.includes(String(row.sex ?? "").trim())) return false;
      }
      if (weaponFilter.length > 0) {
        if (!weaponFilter.includes(String(row.weapon ?? "").trim())) return false;
      }
      return true;
    });
  }, [data, unitSearch, minPoints, maxPoints, sexFilter, weaponFilter]);

  const sorted = useMemo(() => {
    if (!sortColumn) return filtered;
    return [...filtered].sort((a: any, b: any) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];
      const an = toNum(av);
      const bn = toNum(bv);
      if (an !== null && bn !== null) return sortDirection === "asc" ? an - bn : bn - an;
      const as = String(av ?? "").toLowerCase();
      const bs = String(bv ?? "").toLowerCase();
      if (as < bs) return sortDirection === "asc" ? -1 : 1;
      if (as > bs) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const paginated = useMemo(
    () => sorted.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE),
    [sorted, currentPage]
  );

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const toggleArrayValue = (
    arr: string[],
    val: string,
    setter: (v: string[]) => void
  ) => {
    if (arr.includes(val)) setter(arr.filter((v) => v !== val));
    else setter([...arr, val]);
  };

  return (
    <div className="container mx-auto pt-2 pb-10 h-auto lg:h-[calc(100vh-8rem)]">
      <SEOHead
        title="Colorado Bighorn Sheep Draw Odds 2026 | TalloTags"
        description="Colorado bighorn sheep draw odds, applicants, success and population estimates for 2026."
        canonicalPath="/sheep-draw"
      />
      <div className="mb-2 px-1">
        <h1 className="text-3xl font-bold mb-1">Colorado Bighorn Sheep Draw Odds</h1>
        <p className="text-muted-foreground text-sm">
          Hunt codes, bonus points, applicants, draw odds, and population estimates for the 2026 sheep draw.
        </p>
      </div>

      {isMobile && (
        <div className="mb-2 px-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters((v) => !v)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showMobileFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 h-full">
        <aside
          className={`w-full lg:w-64 bg-card p-4 rounded-lg border space-y-5 overflow-y-auto ${
            !showMobileFilters ? "hidden" : "block"
          } md:block`}
        >
          <div>
            <Label htmlFor="unit-search" className="text-sm font-semibold">
              Unit search
            </Label>
            <Input
              id="unit-search"
              placeholder="e.g. S1, S32"
              value={unitSearch}
              onChange={(e) => setUnitSearch(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separate for multiple units.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Minimum bonus points: {minPoints}
            </Label>
            <Slider
              value={[minPoints]}
              min={pointsBounds.min}
              max={pointsBounds.max}
              step={1}
              onValueChange={(v) => setMinPoints(v[0])}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Maximum bonus points: {maxPoints}
            </Label>
            <Slider
              value={[maxPoints]}
              min={pointsBounds.min}
              max={pointsBounds.max}
              step={1}
              onValueChange={(v) => setMaxPoints(v[0])}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Sex</Label>
            {sexOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">No options yet.</p>
            )}
            {sexOptions.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  id={`sex-${opt}`}
                  checked={sexFilter.includes(opt)}
                  onCheckedChange={() => toggleArrayValue(sexFilter, opt, setSexFilter)}
                />
                <Label htmlFor={`sex-${opt}`} className="text-sm font-normal cursor-pointer">
                  {opt}
                </Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Weapon</Label>
            {weaponOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">No options yet.</p>
            )}
            {weaponOptions.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  id={`weapon-${opt}`}
                  checked={weaponFilter.includes(opt)}
                  onCheckedChange={() =>
                    toggleArrayValue(weaponFilter, opt, setWeaponFilter)
                  }
                />
                <Label
                  htmlFor={`weapon-${opt}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {opt}
                </Label>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="p-8 text-center">Loading sheep draw data...</div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">Error: {error}</div>
          ) : (
            <>
              <div className="flex-1 overflow-auto border rounded-lg bg-card">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      {COLUMNS.map((c) => (
                        <TableHead
                          key={c.key as string}
                          onClick={() => handleSort(c.key as string)}
                          className="cursor-pointer select-none whitespace-nowrap"
                        >
                          <span className="inline-flex items-center gap-1">
                            {c.label}
                            {sortColumn === c.key &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              ))}
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={COLUMNS.length} className="text-center py-8 text-muted-foreground">
                          No matching tags.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((row, i) => (
                        <TableRow key={i}>
                          {COLUMNS.map((c) => (
                            <TableCell key={c.key as string} className="whitespace-nowrap">
                              {String(row[c.key] ?? "")}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-2 px-1 text-sm">
                <span className="text-muted-foreground">
                  {sorted.length} result{sorted.length === 1 ? "" : "s"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
