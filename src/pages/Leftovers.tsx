import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
const PAGE_SIZE = 100;
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/SEOHead";
import TagAlertsSection from "@/components/TagAlertsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Minus, Plus, AlertTriangle } from "lucide-react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useCsvData } from "@/hooks/useCsvData";
import { CSV_VERSION } from "@/utils/csvVersion";

const SPECIES_OPTIONS = [
  { value: "D", label: "Deer" },
  { value: "E", label: "Elk" },
  { value: "A", label: "Pronghorn" },
];

const SEASON_WEAPON_OPTIONS = [
  { value: "Any", label: "Any" },
  { value: "Archery", label: "Archery" },
  { value: "Muzzleloader", label: "Muzzleloader" },
  { value: "Rifle 1", label: "1st Rifle" },
  { value: "Rifle 2", label: "2nd Rifle" },
  { value: "Rifle 3", label: "3rd Rifle" },
  { value: "Late Rifle", label: "Late Rifle" },
  { value: "RFW", label: "Ranching for Wildlife" },
  { value: "Youth", label: "Youth Rifle" },
];

const matchSeasonWeapon = (sw: string, selected: string[]): boolean => {
  if (selected.includes("Any") || selected.length === 0) return true;
  const v = (sw || "").toUpperCase();
  return selected.some((s) => {
    switch (s) {
      case "Archery": return v.includes("A");
      case "Muzzleloader": return v.includes("M");
      case "Rifle 1": return v === "O1";
      case "Rifle 2": return v === "O2";
      case "Rifle 3": return v === "O3";
      case "Late Rifle": return v.includes("L");
      case "RFW": return v.includes("W");
      case "Youth": return v.includes("K");
      default: return false;
    }
  });
};

const SEX_OPTIONS = [
  { value: "M", label: "Buck / Bull" },
  { value: "F", label: "Doe / Cow / Fawn" },
  { value: "E", label: "Either Sex" },
];

const LIST_OPTIONS = [
  { value: "any", label: "Any List" },
  { value: "A", label: "List A" },
  { value: "B", label: "List B" },
  { value: "C", label: "List C" },
];

const COLUMNS: { key: string; label: string; className?: string }[] = [
  { key: "Tag", label: "Tag" },
  { key: "rem", label: "Remaining Tags" },
  { key: "Valid_GMUs", label: "Valid GMUs" },
  { key: "Dates", label: "Dates", className: "w-28 whitespace-normal" },
  { key: "List", label: "List" },
  { key: "Percent_Success", label: "Harvest Success Rate" },
  { key: "Public_Acres", label: "Public Acres" },
  { key: "Public_Percent", label: "Percent Public Land" },
  { key: "Drawn_out_level_A_R", label: "Drawn out level (Resident)" },
  { key: "Drawn_out_level_A_NR", label: "Drawn out level (Non-resident)" },
];

const TAG_REGEX = /^[A-Za-z]{2}\d{3}[A-Za-z]\d[A-Za-z]$/;

export default function Leftovers() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isSignedIn = !!user;

  const [species, setSpecies] = usePersistedState<string[]>("leftovers_species_v2", ["D", "E", "A"]);
  const [seasonWeapons, setSeasonWeapons] = usePersistedState<string[]>("leftovers_seasonWeapons", ["Any"]);
  const [sexFilter, setSexFilter] = usePersistedState<string[]>("leftovers_sex_v2", ["M", "F", "E"]);
  const [listFilter, setListFilter] = usePersistedState<string>("leftovers_list", "any");
  const [ploFilter, setPloFilter] = usePersistedState<string>("leftovers_plo", "any");
  const [minSuccessRate, setMinSuccessRate] = usePersistedState<number>("leftovers_minSuccess", 0);
  const [unitSearch, setUnitSearch] = usePersistedState<string>("leftovers_unitSearch", "");
  const [tagSearch, setTagSearch] = usePersistedState<string>("leftovers_tagSearch", "");
  const [minDOL, setMinDOL] = usePersistedState<number>("leftovers_minDOL", 0);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [page, setPage] = useState(1);

  const { data, loading: csvLoading, error } = useCsvData<Record<string, string>>(
    isSignedIn ? `/data/secondarydraw26.csv?v=${CSV_VERSION}` : ""
  );

  const toggleSpecies = (val: string, checked: boolean) => {
    setSpecies(checked ? [...species, val] : species.filter((s) => s !== val));
  };
  const toggleSex = (val: string, checked: boolean) => {
    setSexFilter(checked ? [...sexFilter, val] : sexFilter.filter((s) => s !== val));
  };
  const toggleSeasonWeapon = (val: string, checked: boolean) => {
    if (val === "Any") { setSeasonWeapons(["Any"]); return; }
    const next = checked
      ? [...seasonWeapons.filter((s) => s !== "Any"), val]
      : seasonWeapons.filter((s) => s !== val);
    setSeasonWeapons(next.length === 0 ? ["Any"] : next);
  };

  // Compute max DOL_A_R from data
  const maxDOL = useMemo(() => {
    let max = 0;
    for (const row of data || []) {
      const v = parseFloat(row.Drawn_out_level_A_R);
      if (!isNaN(v) && v > max) max = v;
    }
    return Math.ceil(max) || 10;
  }, [data]);

  // Parse search inputs
  const unitTerms = useMemo(
    () => unitSearch.split(",").map(s => s.trim()).filter(Boolean),
    [unitSearch]
  );
  const tagTerms = useMemo(
    () => tagSearch.split(",").map(s => s.trim()).filter(Boolean),
    [tagSearch]
  );
  const invalidTagTerms = useMemo(
    () => tagTerms.filter(t => !TAG_REGEX.test(t)),
    [tagTerms]
  );

  const filteredRows = useMemo(() => {
    return (data || []).filter((row) => {
      if (species.length > 0 && !species.includes((row.Animal || "").trim())) return false;
      if (sexFilter.length > 0 && !sexFilter.includes((row.Sex || "").trim())) return false;
      if (listFilter !== "any" && (row.List || "").trim() !== listFilter) return false;
      const plo = (row.PLO || "").trim();
      if (ploFilter === "only" && plo !== "Yes") return false;
      if (ploFilter === "none" && plo !== "No") return false;
      const pct = parseFloat(row.Percent_Success);
      if (!isNaN(pct) && pct < minSuccessRate) return false;
      if (minSuccessRate > 0 && isNaN(pct)) return false;
      if (!matchSeasonWeapon((row.SeasonWeapon || "").trim(), seasonWeapons)) return false;

      if (unitTerms.length > 0) {
        const units = String(row.Valid_GMUs || "").split(",").map(u => u.trim());
        if (!unitTerms.some(term => units.some(u => u === term))) return false;
      }

      if (tagTerms.length > 0) {
        const tag = String(row.Tag || "").trim().toUpperCase();
        if (!tagTerms.some(t => tag === t.toUpperCase())) return false;
      }

      if (minDOL > 0) {
        const dol = parseFloat(row.Drawn_out_level_A_R);
        if (isNaN(dol) || dol < minDOL) return false;
      }

      return true;
    });
  }, [data, species, sexFilter, listFilter, ploFilter, minSuccessRate, seasonWeapons, unitTerms, tagTerms, minDOL]);

  useEffect(() => { setPage(1); }, [species, sexFilter, listFilter, ploFilter, minSuccessRate, seasonWeapons, unitSearch, tagSearch, minDOL]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const startIdx = filteredRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(safePage * PAGE_SIZE, filteredRows.length);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 h-auto lg:h-full lg:overflow-hidden flex flex-col">
      <SEOHead
        title="Colorado Secondary & Leftover Tags | TalloTags"
        description="Colorado secondary and leftover draw tags across deer, elk, and pronghorn — set up tag alerts and browse upcoming leftover lists."
        canonicalPath="/leftovers"
      />

      {/* Welcome banner */}
      <Card className="mb-4 border-2 border-primary bg-[hsl(var(--primary)/0.12)]">
        {bannerOpen ? (
          <CardContent className="p-2 text-base leading-relaxed">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <p><strong>Welcome to the leftover page!</strong> All leftover tags from the secondary draw or on the reissue lists will be updated here.</p>
                <p>Resissued tags are published weekly starting in August. To sign up for tag alerts so that you don't miss a tag you're looking for when it's published on the reissue list, sign up for tag alerts to get weekly emails letting you know if any tags you're interested in have been reissued.</p>
                <p>To enable tag alerts, <Link to="/subscription" className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium">sign up for our Pro account now</Link> for 50% off (only $10/year!), and also gain access to all tables for draw odds tables, harvest stats, and unit information.</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Collapse banner"
                onClick={() => setBannerOpen(false)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-2 text-base font-medium">
            <div className="flex items-start justify-between gap-2">
              <span>Learn more about leftover tags</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Expand banner"
                onClick={() => setBannerOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Secondary / Leftover Tags</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Combined leftover tag list across all species.
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto space-y-4">
          <TagAlertsSection />
          <Card>

            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription>Narrow the leftover list</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!isSignedIn ? (
                <div className="text-center space-y-3 py-4">
                  <p className="text-sm text-muted-foreground">
                    Create a free account to use filters and browse the leftover list.
                  </p>
                  <Button className="w-full" onClick={() => navigate("/auth")}>
                    Sign up for free
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="leftovers-unit-search">Search Units</Label>
                    <Input
                      id="leftovers-unit-search"
                      placeholder="e.g. 3, 5, 10"
                      value={unitSearch}
                      onChange={(e) => setUnitSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leftovers-tag-search">Search Tags</Label>
                    <Input
                      id="leftovers-tag-search"
                      placeholder="e.g. AM003O1R"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                    />
                    {invalidTagTerms.length > 0 && (
                      <p className="flex items-start gap-1 text-xs text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          Invalid tag format: {invalidTagTerms.join(", ")}. Tags should follow the format LLNNNLNL (e.g. AM003O1R).
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Species</Label>
                    <div className="space-y-2">
                      {SPECIES_OPTIONS.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`leftovers-species-${opt.value}`}
                            checked={species.includes(opt.value)}
                            onCheckedChange={(c) => toggleSpecies(opt.value, c === true)}
                          />
                          <Label htmlFor={`leftovers-species-${opt.value}`} className="cursor-pointer font-normal">
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Season / Weapon</Label>
                    <div className="grid grid-cols-2 gap-y-1.5">
                      {SEASON_WEAPON_OPTIONS.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`leftovers-season-${opt.value}`}
                            checked={seasonWeapons.includes(opt.value)}
                            onCheckedChange={(c) => toggleSeasonWeapon(opt.value, c === true)}
                          />
                          <Label htmlFor={`leftovers-season-${opt.value}`} className="cursor-pointer font-normal text-sm">
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Sex</Label>
                    <div className="space-y-2">
                      {SEX_OPTIONS.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`leftovers-sex-${opt.value}`}
                            checked={sexFilter.includes(opt.value)}
                            onCheckedChange={(c) => toggleSex(opt.value, c === true)}
                          />
                          <Label htmlFor={`leftovers-sex-${opt.value}`} className="cursor-pointer font-normal">
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>List</Label>
                    <RadioGroup value={listFilter} onValueChange={setListFilter}>
                      {LIST_OPTIONS.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value} id={`leftovers-list-${opt.value}`} />
                          <Label htmlFor={`leftovers-list-${opt.value}`} className="cursor-pointer font-normal">
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>PLO Tags</Label>
                    <RadioGroup value={ploFilter} onValueChange={setPloFilter}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="any" id="leftovers-plo-any" />
                        <Label htmlFor="leftovers-plo-any" className="cursor-pointer font-normal">Show all</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="only" id="leftovers-plo-only" />
                        <Label htmlFor="leftovers-plo-only" className="cursor-pointer font-normal">Show only PLO tags</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="leftovers-plo-none" />
                        <Label htmlFor="leftovers-plo-none" className="cursor-pointer font-normal">Don't show PLO tags</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum success rate: {minSuccessRate}%</Label>
                    <Slider
                      value={[minSuccessRate]}
                      onValueChange={(v) => setMinSuccessRate(v[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Minimum drawn out level (resident): {minDOL === 0 ? "Any" : minDOL}
                    </Label>
                    <Slider
                      value={[minDOL]}
                      onValueChange={(v) => setMinDOL(v[0])}
                      min={0}
                      max={maxDOL}
                      step={1}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:h-full lg:min-h-0 min-w-0">
          <Card className="lg:h-full flex flex-col min-w-0">
            <CardContent className="p-2 sm:p-4 flex-1 flex flex-col lg:min-h-0 min-w-0">
              {!isSignedIn ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <p className="text-muted-foreground">
                    Sign up for a free account to view the leftover tag list.
                  </p>
                  <Button onClick={() => navigate("/auth")}>Sign up for free</Button>
                </div>
              ) : csvLoading || loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-destructive text-sm">
                  Failed to load leftover tag data.
                </div>
              ) : (
                <div className="flex-1 flex flex-col lg:min-h-0 min-w-0">
                  <div className="flex-1 lg:min-h-0 min-w-0 w-full max-w-full overflow-auto border rounded-md">
                    <table className="min-w-max caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors">
                          {COLUMNS.map((c) => (
                            <th
                              key={c.key}
                              className={`h-10 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap sticky top-0 z-10 bg-background shadow-[inset_0_-1px_0_hsl(var(--border))] ${c.className || ""}`}
                            >
                              {c.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {filteredRows.length === 0 ? (
                          <tr className="border-b">
                            <td colSpan={COLUMNS.length} className="text-center text-muted-foreground py-8">
                              No tags match the current filters.
                            </td>
                          </tr>
                        ) : (
                          pagedRows.map((row, i) => (
                            <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                              {COLUMNS.map((c) => (
                                <td
                                  key={c.key}
                                  className={`px-4 py-2 align-middle ${c.className ? c.className : "whitespace-nowrap"}`}
                                >
                                  {row[c.key] ?? ""}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 px-2 flex-wrap">
                    <div className="text-xs text-muted-foreground">
                      Showing {startIdx}–{endIdx} of {filteredRows.length} tags
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage <= 1}
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {safePage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
