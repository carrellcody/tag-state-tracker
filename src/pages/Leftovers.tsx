import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getTierFromProductId, canAccessElk } from "@/utils/subscriptionTiers";
import { SEOHead } from "@/components/SEOHead";
import TagAlertsSection from "@/components/TagAlertsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell } from "lucide-react";
import { usePersistedState } from "@/hooks/usePersistedState";

const SPECIES_OPTIONS = [
  { value: "deer", label: "Deer" },
  { value: "elk", label: "Elk" },
  { value: "antelope", label: "Pronghorn" },
];

const SEASON_WEAPON_OPTIONS = [
  { value: "Any", label: "Any" },
  { value: "Archery", label: "Archery" },
  { value: "Muzzleloader", label: "Muzzleloader" },
  { value: "Rifle 1", label: "Rifle 1" },
  { value: "Rifle 2", label: "Rifle 2" },
  { value: "Rifle 3", label: "Rifle 3" },
  { value: "Rifle 4", label: "Rifle 4" },
  { value: "Plains Rifle", label: "Plains Rifle" },
  { value: "Late Rifle", label: "Late Rifle" },
];

const SEX_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "buck", label: "Buck / Bull" },
  { value: "antlerless", label: "Doe / Cow / Fawn" },
  { value: "either", label: "Either Sex" },
];

const LIST_OPTIONS = [
  { value: "any", label: "Any List" },
  { value: "A", label: "List A" },
  { value: "B", label: "List B" },
  { value: "C", label: "List C" },
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
  const [species, setSpecies] = usePersistedState<string[]>("leftovers_species", ["deer", "elk", "antelope"]);
  const [seasonWeapons, setSeasonWeapons] = usePersistedState<string[]>("leftovers_seasonWeapons", ["Any"]);
  const [sexFilter, setSexFilter] = usePersistedState<string>("leftovers_sex", "any");
  const [listFilter, setListFilter] = usePersistedState<string>("leftovers_list", "any");
  const [ploFilter, setPloFilter] = usePersistedState<string>("leftovers_plo", "any");
  const [minSuccessRate, setMinSuccessRate] = usePersistedState<number>("leftovers_minSuccess", 0);
  const [filterToMyTags, setFilterToMyTags] = useState(false);

  const toggleSpecies = (val: string, checked: boolean) => {
    setSpecies(checked ? [...species, val] : species.filter(s => s !== val));
  };

  const toggleSeasonWeapon = (val: string, checked: boolean) => {
    if (val === "Any") {
      setSeasonWeapons(["Any"]);
      return;
    }
    const next = checked
      ? [...seasonWeapons.filter(s => s !== "Any"), val]
      : seasonWeapons.filter(s => s !== val);
    setSeasonWeapons(next.length === 0 ? ["Any"] : next);
  };

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
        {/* Left column: Tag Alerts + Filters */}
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
                onClick={() => setFilterToMyTags(v => !v)}
              >
                <Bell className="mr-2 h-4 w-4" />
                {filterToMyTags ? "Showing my tag list" : "Filter for my tag list"}
              </Button>

              {/* Species */}
              <div className="space-y-2">
                <Label>Species</Label>
                <div className="space-y-2">
                  {SPECIES_OPTIONS.map(opt => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`leftovers-species-${opt.value}`}
                        checked={species.includes(opt.value)}
                        onCheckedChange={c => toggleSpecies(opt.value, c === true)}
                      />
                      <Label htmlFor={`leftovers-species-${opt.value}`} className="cursor-pointer font-normal">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Season / Weapon */}
              <div className="space-y-2">
                <Label>Season / Weapon</Label>
                <div className="grid grid-cols-2 gap-y-1.5">
                  {SEASON_WEAPON_OPTIONS.map(opt => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`leftovers-season-${opt.value}`}
                        checked={seasonWeapons.includes(opt.value)}
                        onChange={e => toggleSeasonWeapon(opt.value, e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`leftovers-season-${opt.value}`} className="cursor-pointer font-normal text-sm">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sex */}
              <div className="space-y-2">
                <Label>Sex</Label>
                <RadioGroup value={sexFilter} onValueChange={setSexFilter}>
                  {SEX_OPTIONS.map(opt => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`leftovers-sex-${opt.value}`} />
                      <Label htmlFor={`leftovers-sex-${opt.value}`} className="cursor-pointer font-normal">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* List */}
              <div className="space-y-2">
                <Label>List</Label>
                <RadioGroup value={listFilter} onValueChange={setListFilter}>
                  {LIST_OPTIONS.map(opt => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`leftovers-list-${opt.value}`} />
                      <Label htmlFor={`leftovers-list-${opt.value}`} className="cursor-pointer font-normal">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* PLO */}
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

              {/* Min Success Rate */}
              <div className="space-y-2">
                <Label>Minimum success rate: {minSuccessRate}%</Label>
                <Slider
                  value={[minSuccessRate]}
                  onValueChange={v => setMinSuccessRate(v[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Table area (coming soon) */}
        <div>
          <Card className="h-full min-h-[400px]">
            <CardContent className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <Bell className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2">Secondary draw / leftover list is coming soon!</h2>
                <p className="text-muted-foreground">
                  Stay tuned and sign up for tag alerts to get alerted when your favorite tags become available.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
