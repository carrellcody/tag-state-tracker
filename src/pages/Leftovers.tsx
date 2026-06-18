import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getTierFromProductId, canAccessElk } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";
import TagAlertsSection from "@/components/TagAlertsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Loader2 } from "lucide-react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useCsvData } from "@/hooks/useCsvData";
import { CSV_VERSION } from "@/utils/csvVersion";

const SPECIES_OPTIONS = [
  { value: "D", label: "Deer" },
  { value: "E", label: "Elk" },
  { value: "A", label: "Pronghorn" },
];

// value = matcher fn key
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

const COLUMNS: { key: string; label: string }[] = [
  { key: "Tag", label: "Tag" },
  { key: "rem", label: "Remaining Tags" },
  { key: "Valid_GMUs", label: "Valid GMUs" },
  { key: "Dates", label: "Dates" },
  { key: "List", label: "List" },
  { key: "Percent_Success", label: "Harvest Success Rate" },
  { key: "Public_Acres", label: "Public Acres" },
  { key: "Public_Percent", label: "Percent Public Land" },
  { key: "Drawn_out_level_A_R", label: "Drawn out level (Resident)" },
  { key: "Drawn_out_level_A_NR", label: "Drawn out level (Non-resident)" },
];

export default function Leftovers() {
  const { subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  const hasAccess = canAccessElk(currentTier);
  useEffect(() => {
    if (!loading && !hasAccess) {
      navigate("/subscription");
    }
  }, [hasAccess, loading, navigate]);

  const [species, setSpecies] = usePersistedState<string[]>("leftovers_species_v2", ["D", "E", "A"]);
  const [seasonWeapons, setSeasonWeapons] = usePersistedState<string[]>("leftovers_seasonWeapons", ["Any"]);
  const [sexFilter, setSexFilter] = usePersistedState<string[]>("leftovers_sex_v2", ["M", "F", "E"]);
  const [listFilter, setListFilter] = usePersistedState<string>("leftovers_list", "any");
  const [ploFilter, setPloFilter] = usePersistedState<string>("leftovers_plo", "any");
  const [minSuccessRate, setMinSuccessRate] = usePersistedState<number>("leftovers_minSuccess", 0);
  const [filterToMyTags, setFilterToMyTags] = useState(false);

  const { data, loading: csvLoading, error } = useCsvData<Record<string, string>>(
    `/data/secondarydraw26.csv?v=${CSV_VERSION}`
  );

  const toggleSpecies = (val: string, checked: boolean) => {
    setSpecies(checked ? [...species, val] : species.filter((s) => s !== val));
  };

  const toggleSex = (val: string, checked: boolean) => {
    setSexFilter(checked ? [...sexFilter, val] : sexFilter.filter((s) => s !== val));
  };

  const toggleSeasonWeapon = (val: string, checked: boolean) => {
    if (val === "Any") {
      setSeasonWeapons(["Any"]);
      return;
    }
    const next = checked
      ? [...seasonWeapons.filter((s) => s !== "Any"), val]
      : seasonWeapons.filter((s) => s !== val);
    setSeasonWeapons(next.length === 0 ? ["Any"] : next);
  };

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
      return true;
    });
  }, [data, species, sexFilter, listFilter, ploFilter, minSuccessRate, seasonWeapons]);

  if (loading || !hasAccess) return null;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <SEOHead
        title="Colorado Secondary & Leftover Tags | TalloTags"
        description="Colorado secondary and leftover draw tags across deer, elk, and pronghorn — set up tag alerts and browse upcoming leftover lists."
        canonicalPath="/leftovers"
      />

      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Secondary / Leftover Tags</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Combined leftover tag list across all species. Set up tag alerts to be notified when a tag you want goes on the list.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        <div className="space-y-4">
          <TagAlertsSection />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription>Narrow the leftover list</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Button
                variant={filterToMyTags ? "default" : "outline"}
                className="w-full"
                onClick={() => setFilterToMyTags((v) => !v)}
              >
                <Bell className="mr-2 h-4 w-4" />
                {filterToMyTags ? "Showing my tag list" : "Filter for my tag list"}
              </Button>

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
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-2 sm:p-4">
              {csvLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-destructive text-sm">
                  Failed to load leftover tag data.
                </div>
              ) : (
                <div className="overflow-auto max-h-[calc(100vh-12rem)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {COLUMNS.map((c) => (
                          <TableHead key={c.key} className="whitespace-nowrap">{c.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={COLUMNS.length} className="text-center text-muted-foreground py-8">
                            No tags match the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRows.map((row, i) => (
                          <TableRow key={i}>
                            {COLUMNS.map((c) => (
                              <TableCell key={c.key} className="whitespace-nowrap py-2">
                                {row[c.key] ?? ""}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <div className="text-xs text-muted-foreground mt-2 px-2">
                    Showing {filteredRows.length} of {data.length} tags
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
