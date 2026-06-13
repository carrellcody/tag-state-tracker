import { useState, useMemo, useEffect } from "react";
import { useCsvData } from "@/hooks/useCsvData";
import { CSV_VERSION } from "@/utils/csvVersion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";
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
  ResNR?: string;
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

// Sex UI option -> CSV value
const SEX_OPTIONS: { value: string; label: string; match: string | null }[] = [
  { value: "All", label: "All", match: null },
  { value: "Either", label: "Either", match: "Either" },
  { value: "Male", label: "Male", match: "Ram" },
  { value: "Female", label: "Female", match: "Ewe" },
];

const WEAPON_OPTIONS: { value: string; label: string; match: string | null }[] = [
  { value: "Any", label: "Any", match: null },
  { value: "Archery", label: "Archery", match: "Archery" },
  { value: "Rifle", label: "Rifle", match: "Rifle" },
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
  const [sexFilter, setSexFilter] = usePersistedState<string[]>("sheepDraw_sexFilter", ["All"]);
  const [weaponFilter, setWeaponFilter] = usePersistedState<string[]>("sheepDraw_weaponFilter", ["Any"]);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
    const sexMatches = sexFilter.includes("All")
      ? null
      : SEX_OPTIONS.filter((o) => sexFilter.includes(o.value) && o.match)
          .map((o) => o.match!.toLowerCase());
    const weaponMatches = weaponFilter.includes("Any")
      ? null
      : WEAPON_OPTIONS.filter((o) => weaponFilter.includes(o.value) && o.match)
          .map((o) => o.match!.toLowerCase());

    return data.filter((row) => {
      if (unitSearch.trim()) {
        const terms = unitSearch.split(",").map((s) => s.trim()).filter(Boolean);
        const unit = String(row.Unit ?? "").trim();
        if (!terms.some((t) => unit === t)) return false;
      }
      const pts = toNum(row.points);
      if (pts === null || pts < minPoints || pts > maxPoints) return false;

      if (sexMatches && sexMatches.length > 0) {
        const v = String(row.sex ?? "").trim().toLowerCase();
        if (!sexMatches.includes(v)) return false;
      }
      if (weaponMatches && weaponMatches.length > 0) {
        const v = String(row.weapon ?? "").trim().toLowerCase();
        if (!weaponMatches.includes(v)) return false;
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

  const toggleSex = (value: string, checked: boolean) => {
    if (value === "All") {
      setSexFilter(checked ? ["All"] : []);
    } else {
      const next = checked
        ? [...sexFilter.filter((s) => s !== "All"), value]
        : sexFilter.filter((s) => s !== value);
      setSexFilter(next.length === 0 ? ["All"] : next);
    }
  };

  const toggleWeapon = (value: string, checked: boolean) => {
    if (value === "Any") {
      setWeaponFilter(checked ? ["Any"] : []);
    } else {
      const next = checked
        ? [...weaponFilter.filter((s) => s !== "Any"), value]
        : weaponFilter.filter((s) => s !== value);
      setWeaponFilter(next.length === 0 ? ["Any"] : next);
    }
  };

  const clearFilters = () => {
    setUnitSearch("");
    setMinPoints(0);
    setMaxPoints(pointsBounds.max);
    setSexFilter(["All"]);
    setWeaponFilter(["Any"]);
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

      <div className="flex flex-col lg:flex-row gap-4 h-full">
        <aside
          className={`w-full lg:w-64 bg-card p-4 rounded-lg border space-y-4 overflow-y-auto ${
            !showMobileFilters ? "hidden" : "block"
          } md:block`}
        >
          <Button
            onClick={() => setShowMobileFilters(false)}
            className="w-full mb-4 md:hidden shadow-[0_4px_0_0_hsl(180,30%,45%)] hover:shadow-[0_2px_0_0_hsl(180,30%,45%)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all"
          >
            Apply filters and view data
          </Button>
          <h3 className="font-semibold text-lg">Filters</h3>

          <div className="space-y-2">
            <Label>Search Units</Label>
            <Input
              placeholder="e.g. S1, S32"
              value={unitSearch}
              onChange={(e) => setUnitSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Minimum Bonus Points: {minPoints}</Label>
            <input
              type="range"
              min={pointsBounds.min}
              max={pointsBounds.max}
              value={minPoints}
              onChange={(e) => setMinPoints(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Bonus Points: {maxPoints}</Label>
            <input
              type="range"
              min={pointsBounds.min}
              max={pointsBounds.max}
              value={maxPoints}
              onChange={(e) => setMaxPoints(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Sex</Label>
            <div className="space-y-1">
              {SEX_OPTIONS.map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`sheep-sex-${value}`}
                    checked={sexFilter.includes(value)}
                    onChange={(e) => toggleSex(value, e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor={`sheep-sex-${value}`} className="cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Weapon</Label>
            <div className="space-y-1">
              {WEAPON_OPTIONS.map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`sheep-weapon-${value}`}
                    checked={weaponFilter.includes(value)}
                    onChange={(e) => toggleWeapon(value, e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor={`sheep-weapon-${value}`} className="cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={clearFilters}>
            Clear Filters
          </Button>

          <Button
            onClick={() => setShowMobileFilters(false)}
            className="w-full mt-4 md:hidden shadow-[0_4px_0_0_hsl(180,30%,45%)] hover:shadow-[0_2px_0_0_hsl(180,30%,45%)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all"
          >
            Apply filters and view data
          </Button>
        </aside>

        <main
          className={`flex-1 overflow-hidden flex flex-col ${
            showMobileFilters ? "hidden" : "flex"
          } md:flex`}
        >
          <Button
            onClick={() => setShowMobileFilters(true)}
            className="mb-4 md:hidden"
            variant="outline"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {sorted.length} tag{sorted.length === 1 ? "" : "s"} match
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">Loading sheep draw data...</div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">Error: {error}</div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="w-full border-collapse bg-card">
                <thead className="sticky top-0 gradient-primary z-10">
                  <tr>
                    {COLUMNS.map((c) => (
                      <th
                        key={c.key as string}
                        className="border border-border p-2 text-left text-primary-foreground"
                      >
                        <div
                          className="cursor-pointer flex items-center gap-1"
                          onClick={() => handleSort(c.key as string)}
                        >
                          <span>{c.label}</span>
                          {sortColumn === c.key &&
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
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={COLUMNS.length}
                        className="border border-border p-8 text-center text-muted-foreground"
                      >
                        No matching tags.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((row, i) => (
                      <tr key={i} className="group hover:bg-accent">
                        {COLUMNS.map((c) => (
                          <td
                            key={c.key as string}
                            className="border border-border p-2"
                          >
                            {c.key === "Tag" ? (
                              <span className="text-primary-dark group-hover:text-primary">
                                {String(row[c.key] ?? "")}
                              </span>
                            ) : (
                              String(row[c.key] ?? "")
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
