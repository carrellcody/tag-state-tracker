import { useState, useMemo, useEffect, Fragment } from "react";
import { useCsvData } from "@/hooks/useCsvData";
import { CSV_VERSION } from "@/utils/csvVersion";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, Star, Filter, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useIsMobile } from "@/hooks/use-mobile";
import { TableHeaderHelp } from './TableHeaderHelp';
import { usePersistedState } from "@/hooks/usePersistedState";
const ROWS_PER_PAGE = 50;

function normalizeCsvKey(key: string) {
  return key.replace(/^\uFEFF/, '').replace(/[\u00A0]/g, ' ').trim().toLowerCase();
}

function getHybridCellValue(row: any): string {
  if (!row) return '';
  const direct = row.hybrid ?? row.Hybrid;
  if (direct != null) return String(direct).replace(/[\u00A0]/g, ' ').trim();
  const hybridKey = Object.keys(row).find((k) => normalizeCsvKey(k) === 'hybrid');
  return String(hybridKey ? row[hybridKey] : '').replace(/[\u00A0]/g, ' ').trim();
}

function isHybridEligible(row: any) {
  return getHybridCellValue(row) === 'Hybrid';
}

export function AntelopeDrawTableNew() {
  const { data, loading, error } = useCsvData(`/data/Fullant26Final.csv?v=${CSV_VERSION}`);
  const { data: subtableData } = useCsvData(`/data/AntDraw25Subtable.csv?v=${CSV_VERSION}`);
  const { data: codePages } = useCsvData(`/data/ant25code_pages.csv?v=${CSV_VERSION}`);
  const { favorites, toggleFavorite, clearAllFavorites } = useFavorites("antelope_draw_new");
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(true);
  const [unitSearch, setUnitSearch] = usePersistedState("antelopeDrawNew_unitSearch", "");
  const [sexFilter, setSexFilter] = usePersistedState<string[]>("antelopeDrawNew_sexFilter", ["All"]);
  const [seasonWeapons, setSeasonWeapons] = usePersistedState<string[]>("antelopeDrawNew_seasonWeapons", ["Any"]);
  const [hunterClass, setHunterClass] = usePersistedState("antelopeDrawNew_hunterClass", "A_R");
  const [hunterClassManuallyChanged, setHunterClassManuallyChanged] = usePersistedState("antelopeDrawNew_hunterClassManuallyChanged", false);
  const [ploFilter, setPloFilter] = usePersistedState("antelopeDrawNew_ploFilter", "all");
  const [rfwFilter, setRfwFilter] = usePersistedState("antelopeDrawNew_rfwFilter", "all");
  const [minPoints, setMinPoints] = usePersistedState("antelopeDrawNew_minPoints", 0);
  const [maxPoints, setMaxPoints] = usePersistedState("antelopeDrawNew_maxPoints", 32);
  const [userPreferencePoints, setUserPreferencePoints] = usePersistedState("antelopeDrawNew_userPreferencePoints", 0);
  const [pointsInitialized, setPointsInitialized] = usePersistedState("antelopeDrawNew_pointsInitialized", false);
  const [showNoApplicants, setShowNoApplicants] = usePersistedState("antelopeDrawNew_showNoApplicants", "no");
  const [listFilter, setListFilter] = usePersistedState<string[]>("antelopeDrawNew_listFilter", ["Any"]);
  const [showFavoritesOnly, setShowFavoritesOnly] = usePersistedState("antelopeDrawNew_showFavoritesOnly", false);
  const [showPreviousYears, setShowPreviousYears] = usePersistedState("antelopeDrawNew_showPreviousYears", false);
  const [showNoPointsOnly, setShowNoPointsOnly] = usePersistedState("antelopeDrawNew_showNoPointsOnly", false);
  const [showHybridOnly, setShowHybridOnly] = usePersistedState("antelopeDrawNew_showHybridOnly", false);
  const [showNewTags, setShowNewTags] = usePersistedState("antelopeDrawNew_showNewTags", true);
  const [showHybridHelp, setShowHybridHelp] = useState(false);

  useEffect(() => {
    if (favorites.size === 0 && showFavoritesOnly) {
      setShowFavoritesOnly(false);
    }
  }, [favorites.size, showFavoritesOnly]);

  useEffect(() => {
    setCurrentPage(1);
  }, [unitSearch, sexFilter, seasonWeapons, hunterClass, ploFilter, rfwFilter, minPoints, maxPoints, showNoApplicants, listFilter, showFavoritesOnly, showPreviousYears, showNoPointsOnly, showHybridOnly, showNewTags]);

  useEffect(() => {
    const loadPreferencePoints = async () => {
      if (!user) return;
      try {
        const { data: profile, error } = await supabase.from("profiles").select("antelope_preference_points, state_residency").eq("id", user.id).maybeSingle();
        if (error) { console.error("Error loading antelope preference points:", error); return; }
        if (profile) {
          const points = profile.antelope_preference_points || 0;
          if (!pointsInitialized) {
            setUserPreferencePoints(points);
            setMaxPoints(points);
            setPointsInitialized(true);
          }
          const sessionKey = `hunterClass_autoSet_antelopeNew_${user.id}`;
          const alreadySet = sessionStorage.getItem(sessionKey);
          if (!alreadySet && !hunterClassManuallyChanged) {
            const residency = profile.state_residency || '';
            if (residency.toLowerCase() === 'colorado') { setHunterClass('A_R'); }
            else if (residency) { setHunterClass('A_NR'); }
            sessionStorage.setItem(sessionKey, 'true');
          }
        }
      } catch (error) { console.error("Error loading antelope preference points:", error); }
    };
    loadPreferencePoints();
  }, [user, hunterClassManuallyChanged, pointsInitialized]);

  useEffect(() => {
    if (hunterClass === "A_NR" || hunterClass === "Y_NR") { setRfwFilter("none"); }
  }, [hunterClass]);

  const huntCodeMap = useMemo(() => {
    const map: Record<string, string> = {};
    codePages.forEach((row: any) => { if (row.HuntCode && row.Page) map[row.HuntCode] = row.Page; });
    return map;
  }, [codePages]);

  // Build subtable lookup: unit number -> array of subtable rows
  const subtableByUnit = useMemo(() => {
    const map: Record<string, any> = {};
    subtableData.forEach((row: any) => {
      const unit = String(row.Unit || '').trim();
      if (unit) {
        if (!map[unit]) map[unit] = row;
      }
    });
    return map;
  }, [subtableData]);

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      const isNewTag = String(row.New || '').trim() === 'New';
      const bypassPoints = showNewTags && isNewTag;
      if (showHybridOnly && !isHybridEligible(row)) return false;
      if (!bypassPoints && showNoPointsOnly && row.nopoints !== 'Y') return false;
      if (showFavoritesOnly && !favorites.has(row.Tag)) return false;
      if (unitSearch) {
        const searchTerms = unitSearch.split(",").map(s => s.trim()).filter(Boolean);
        const units = String(row["Valid GMUs"] || "").split(",").map(u => u.trim());
        if (!searchTerms.some(term => units.some(unit => unit === term))) return false;
      }
      if (!sexFilter.includes("All")) {
        const sexMap: Record<string, string> = { Either: "E", Male: "M", Female: "F" };
        const matchesSex = sexFilter.some(filter => row.Sex === sexMap[filter]);
        if (!matchesSex) return false;
      }
      if (!seasonWeapons.includes("Any")) {
        const sw = row.SeasonWeapon || "";
        const matchesFilter = seasonWeapons.some(filter => {
          if (filter === "A") return sw.includes("A");
          if (filter === "M") return sw.includes("M");
          if (filter === "O1R") return sw.includes("O1R");
          if (filter === "O2R") return sw.includes("O2R");
          if (filter === "O3R") return sw.includes("O3R");
          if (filter === "O4R") return sw.includes("O4R");
          if (filter === "E") return sw.includes("E");
          if (filter === "L") return sw.includes("L");
          if (filter === "Other") {
            return !sw.includes("A") && !sw.includes("M") && !sw.includes("O1R") && !sw.includes("O2R") && !sw.includes("O3R") && !sw.includes("O4R") && !sw.includes("E") && !sw.includes("L");
          }
          return false;
        });
        if (!matchesFilter) return false;
      }
      if (hunterClass !== "all" && row.Class !== hunterClass) return false;
      if (ploFilter === "only" && row.PLO !== "Yes") return false;
      if (ploFilter === "none" && row.PLO === "Yes") return false;
      if (rfwFilter === "only" && row.RFW !== "Yes") return false;
      if (rfwFilter === "none" && row.RFW === "Yes") return false;
      if (!showHybridOnly && !showNoPointsOnly && !bypassPoints) {
        const dolStr = String(row.Drawn_out_level || "").trim();
        const isLeftoverOrChoice = dolStr === "Leftover" || dolStr.startsWith("Choice");
        const dol = isLeftoverOrChoice ? 0 : parseFloat(dolStr || "0");
        if (isNaN(dol) || dol < minPoints || dol > maxPoints) return false;
      }
      if (showNoApplicants === "no" && row.NoApps === "Yes") return false;
      if (!listFilter.includes("Any")) {
        const list = row.List || "";
        const matchesList = listFilter.some(filter => list === filter);
        if (!matchesList) return false;
      }
      return true;
    });
  }, [data, unitSearch, sexFilter, seasonWeapons, hunterClass, ploFilter, rfwFilter, minPoints, maxPoints, showNoApplicants, listFilter, showFavoritesOnly, favorites, showNoPointsOnly, showHybridOnly, showNewTags]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      const aStr = String(aVal || "").toLowerCase();
      const bStr = String(bVal || "").toLowerCase();
      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedData.slice(start, start + ROWS_PER_PAGE);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);

  const handleSort = (column: string) => {
    if (sortColumn === column) { setSortDirection(sortDirection === "asc" ? "desc" : "asc"); }
    else { setSortColumn(column); setSortDirection("asc"); }
  };

  const toggleRow = (index: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  if (loading) return <div className="p-8 text-center">Loading antelope draw data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const visibleColumns = showPreviousYears
    ? ["Tag", "List", "Valid GMUs", "Dates", "Quota", "Drawn_out_level23", "Chance_at_DOL23", "Drawn_out_level24", "Chance_at_DOL24", "Drawn_out_level", "Chance_at_DOL", "slope", "Chance_with_First_choice", "Sex", "Weapon", "Percent Success", "Total Hunters", "Total_Acres", "Public_Acres", "Public_Percent", "Hunters_per_Public_Acre", "Notes"]
    : ["Tag", "List", "Valid GMUs", "Dates", "Quota", "Drawn_out_level", "Chance_at_DOL", "Chance_with_First_choice", "Sex", "Weapon", "Percent Success", "Total Hunters", "Total_Acres", "Public_Acres", "Public_Percent", "Hunters_per_Public_Acre", "Notes"];

  const headerLabels: Record<string, string> = {
    Tag: "Hunt Code",
    List: "List",
    "Valid GMUs": "Valid Units",
    Dates: "2026 Dates",
    Quota: "Total tag quota",
    Drawn_out_level23: "Drawn Out Level",
    Chance_at_DOL23: "Chance at DOL",
    Drawn_out_level24: "Drawn Out Level",
    Chance_at_DOL24: "Chance at DOL",
    Drawn_out_level: "Drawn Out Level",
    Chance_with_First_choice: "Chance with your preference points",
    Chance_at_DOL: "Chance at DOL",
    slope: "Three Year Trend",
    Sex: "Sex",
    Weapon: "Weapon",
    Notes: "Notes",
    "Percent Success": "Harvest Success Rate",
    "Total Hunters": "Total Hunters",
    "Total_Acres": "Total Acres",
    "Public_Acres": "Public Acres",
    "Public_Percent": "Percent Public Land",
    "Hunters_per_Public_Acre": "Hunters per public acre",
  };

  const yearGroupedColumns = {
    '2023': ['Drawn_out_level23', 'Chance_at_DOL23'],
    '2024': ['Drawn_out_level24', 'Chance_at_DOL24'],
    '2025': ['Drawn_out_level', 'Chance_at_DOL']
  };

  const nonGroupedColumnsBefore = ['Tag', 'List', 'Valid GMUs', 'Dates', 'Quota'];
  const nonGroupedColumnsAfter = showPreviousYears
    ? ['slope', 'Chance_with_First_choice', 'Sex', 'Weapon', 'Percent Success', 'Total Hunters', 'Total_Acres', 'Public_Acres', 'Public_Percent', 'Hunters_per_Public_Acre', 'Notes']
    : ['Chance_with_First_choice', 'Sex', 'Weapon', 'Percent Success', 'Total Hunters', 'Total_Acres', 'Public_Acres', 'Public_Percent', 'Hunters_per_Public_Acre', 'Notes'];

  const helpText: Record<string, string> = {
    Tag: "This is the hunt code that you would enter when applying for this license. Click on the hyperlink to take you to the detailed draw stats about this code from the CPW. Click the dropdown arrow to show the harvest statistics for all units that can be hunted with this tag.",
    List: "Tag \"List\" tells you if you can draw more than one tag of a particular type.",
    "Valid GMUs": "These are the units that can legally be hunted if you hold the license for the associated hunt code",
    Drawn_out_level23: "Minimum points needed to have a chance at drawing in the 2023 draw.",
    Chance_at_DOL23: "Odds of drawing with the Drawn Out Level points in 2023.",
    Drawn_out_level24: "Minimum points needed to have a chance at drawing in the 2024 draw.",
    Chance_at_DOL24: "Odds of drawing with the Drawn Out Level points in 2024.",
    Drawn_out_level: "Minimum points needed to have a chance at drawing in the 2025 draw.",
    Chance_at_DOL: "Odds of drawing with the Drawn Out Level points in 2025.",
    slope: "Trend of points required over the last three draws. Green down = easier, Red up = harder.",
    Chance_with_First_choice: "Your odds of drawing with your preference points if this were your first choice in the 2025 draw."
  };

  const renderTrendArrow = (value: any) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) return <span className="text-muted-foreground">-</span>;
    const magnitude = Math.abs(numValue);
    const size = Math.min(Math.max(magnitude * 8, 16), 48);
    const isPositive = numValue > 0;
    return <div className="flex items-center justify-center">
      {isPositive ? <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-red-500"><path d="M12 4L20 20H4L12 4Z" fill="currentColor" /></svg>
        : <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-green-500"><path d="M12 20L4 4H20L12 20Z" fill="currentColor" /></svg>}
    </div>;
  };

  return <div className="flex flex-col lg:flex-row gap-4 h-full">
    <aside className={`w-full lg:w-64 bg-card p-4 rounded-lg border space-y-4 overflow-y-auto ${!showMobileFilters ? 'hidden' : 'block'} md:block`}>
      <Button onClick={() => setShowMobileFilters(false)} className="w-full mb-4 md:hidden shadow-[0_4px_0_0_hsl(180,30%,45%)] hover:shadow-[0_2px_0_0_hsl(180,30%,45%)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
        Apply filters and view data
      </Button>
      <h3 className="font-semibold text-lg">Filters</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Show Favorites Only</Label>
          <Switch checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} disabled={favorites.size === 0} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>See previous year draw results</Label>
          <Switch checked={showPreviousYears} onCheckedChange={setShowPreviousYears} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm leading-tight">Show tags that don't require burning your preference points (Leftover / Choice 2-4)</Label>
          <Switch checked={showNoPointsOnly} onCheckedChange={setShowNoPointsOnly} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Search Units</Label>
        <Input placeholder="e.g. 10, 1, 15" value={unitSearch} onChange={e => setUnitSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Your Pronghorn Preference Points</Label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{userPreferencePoints}</span>
          <span className="text-xs text-muted-foreground">(Set in your profile)</span>
        </div>
      </div>

      <div className={`space-y-2 ${showNoPointsOnly || showHybridOnly ? 'opacity-50' : ''}`}>
        <Label>Minimum Preference Points: {minPoints}</Label>
        <input type="range" min="0" max="32" value={minPoints} onChange={e => setMinPoints(Number(e.target.value))} className="w-full" disabled={showNoPointsOnly || showHybridOnly} />
      </div>

      <div className={`space-y-2 ${showNoPointsOnly || showHybridOnly ? 'opacity-50' : ''}`}>
        <Label>Maximum Preference Points: {maxPoints}</Label>
        <input type="range" min="0" max="32" value={maxPoints} onChange={e => setMaxPoints(Number(e.target.value))} className="w-full" disabled={showNoPointsOnly || showHybridOnly} />
      </div>

      <div className="space-y-2">
        <Label>Hunter Class</Label>
        <RadioGroup value={hunterClass} onValueChange={(value) => { setHunterClass(value); setHunterClassManuallyChanged(true); }}>
          <div className="flex items-center space-x-2"><RadioGroupItem value="A_R" id="antelopeNew-class-ar" /><Label htmlFor="antelopeNew-class-ar">Resident Adult</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="A_NR" id="antelopeNew-class-anr" /><Label htmlFor="antelopeNew-class-anr">Non-Resident Adult</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="Y_R" id="antelopeNew-class-yr" /><Label htmlFor="antelopeNew-class-yr">Resident Youth</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="Y_NR" id="antelopeNew-class-ynr" /><Label htmlFor="antelopeNew-class-ynr">Non-Resident Youth</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="L_U" id="antelopeNew-class-lu" /><Label htmlFor="antelopeNew-class-lu">Landowner Unrestricted</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="L_R" id="antelopeNew-class-lr" /><Label htmlFor="antelopeNew-class-lr">Landowner Restricted</Label></div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Sex</Label>
        <div className="space-y-1">
          {[{ value: "All", label: "All" }, { value: "Either", label: "Either" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }].map(({ value, label }) =>
            <div key={value} className="flex items-center space-x-2">
              <input type="checkbox" id={`antelopeNew-sex-${value}`} checked={sexFilter.includes(value)} onChange={e => {
                if (value === "All") { setSexFilter(e.target.checked ? ["All"] : []); }
                else { const newSex = e.target.checked ? [...sexFilter.filter(s => s !== "All"), value] : sexFilter.filter(s => s !== value); setSexFilter(newSex.length === 0 ? ["All"] : newSex); }
              }} className="rounded" />
              <Label htmlFor={`antelopeNew-sex-${value}`} className="cursor-pointer">{label}</Label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Weapon/Season</Label>
        <div className="space-y-1">
          {[{ value: "A", label: "Archery" }, { value: "M", label: "Muzzleloader" }, { value: "O1R", label: "First Rifle" }, { value: "O2R", label: "Second Rifle" }, { value: "O3R", label: "Third Rifle" }, { value: "O4R", label: "Fourth Rifle" }, { value: "E", label: "Early Rifle" }, { value: "L", label: "Late Rifle" }, { value: "Other", label: "Other" }, { value: "Any", label: "Any" }].map(({ value, label }) =>
            <div key={value} className="flex items-center space-x-2">
              <input type="checkbox" id={`antelopeNew-season-${value}`} checked={seasonWeapons.includes(value)} onChange={e => {
                if (value === "Any") { setSeasonWeapons(e.target.checked ? ["Any"] : []); }
                else { const newSeasons = e.target.checked ? [...seasonWeapons.filter(s => s !== "Any"), value] : seasonWeapons.filter(s => s !== value); setSeasonWeapons(newSeasons.length === 0 ? ["Any"] : newSeasons); }
              }} className="rounded" />
              <Label htmlFor={`antelopeNew-season-${value}`} className="cursor-pointer">{label}</Label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>List</Label>
        <div className="space-y-1">
          {[{ value: "Any", label: "Any" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }].map(({ value, label }) =>
            <div key={value} className="flex items-center space-x-2">
              <input type="checkbox" id={`antelopeNew-list-${value}`} checked={listFilter.includes(value)} onChange={e => {
                if (value === "Any") { setListFilter(e.target.checked ? ["Any"] : []); }
                else { const newList = e.target.checked ? [...listFilter.filter(l => l !== "Any"), value] : listFilter.filter(l => l !== value); setListFilter(newList.length === 0 ? ["Any"] : newList); }
              }} className="rounded" />
              <Label htmlFor={`antelopeNew-list-${value}`} className="cursor-pointer">{label}</Label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>PLO Tags</Label>
        <RadioGroup value={ploFilter} onValueChange={setPloFilter}>
          <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="antelopeNew-plo-all" /><Label htmlFor="antelopeNew-plo-all">Show all tags</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="only" id="antelopeNew-plo-only" /><Label htmlFor="antelopeNew-plo-only">Show only PLO tags</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="antelopeNew-plo-none" /><Label htmlFor="antelopeNew-plo-none">Don't show PLO tags</Label></div>
        </RadioGroup>
      </div>

      {hunterClass !== "A_NR" && hunterClass !== "Y_NR" && <div className="space-y-2">
        <Label>RFW Tags</Label>
        <RadioGroup value={rfwFilter} onValueChange={setRfwFilter}>
          <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="antelopeNew-rfw-all" /><Label htmlFor="antelopeNew-rfw-all">Show all tags</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="only" id="antelopeNew-rfw-only" /><Label htmlFor="antelopeNew-rfw-only">Show only RFW tags</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="antelopeNew-rfw-none" /><Label htmlFor="antelopeNew-rfw-none">Don't show RFW tags</Label></div>
        </RadioGroup>
      </div>}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label className="text-sm leading-tight">Show all tags eligible for hybrid draw</Label>
            <button type="button" onClick={() => setShowHybridHelp(true)} className="p-0.5 rounded hover:bg-muted transition-colors" aria-label="Help for hybrid draw">
              <HelpCircle className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
          <Switch checked={showHybridOnly} onCheckedChange={setShowHybridOnly} />
        </div>
      </div>
      <Dialog open={showHybridHelp} onOpenChange={setShowHybridHelp}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-xl">Hybrid Draw</DialogTitle></DialogHeader>
          <p className="text-muted-foreground leading-relaxed">Tags eligible for the hybrid draw are highly desirable tags, typically requiring 10 or more resident preference points. A small number of these tags are set aside to give those with greater than 5 points a chance at drawing.</p>
          <div className="flex justify-end mt-4"><DialogClose asChild><Button size="lg" className="px-8">Close</Button></DialogClose></div>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        <Label>Show tags with no applicants?</Label>
        <RadioGroup value={showNoApplicants} onValueChange={setShowNoApplicants}>
          <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="antelopeNew-no-apps-yes" /><Label htmlFor="antelopeNew-no-apps-yes">Yes</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="antelopeNew-no-apps-no" /><Label htmlFor="antelopeNew-no-apps-no">No</Label></div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm leading-tight">View New Tags?</Label>
          <Switch checked={showNewTags} onCheckedChange={setShowNewTags} />
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={() => {
        setUnitSearch(""); setSexFilter(["All"]); setSeasonWeapons(["Any"]); setHunterClass("A_R");
        setPloFilter("all"); setRfwFilter("all"); setMinPoints(0); setMaxPoints(32);
        setShowNoApplicants("no"); setListFilter(["Any"]);
      }}>Clear Filters</Button>

      <Button variant="outline" className="w-full" onClick={clearAllFavorites} disabled={favorites.size === 0}>
        Clear Favorites ({favorites.size})
      </Button>

      <Button onClick={() => setShowMobileFilters(false)} className="w-full mt-4 md:hidden shadow-[0_4px_0_0_hsl(180,30%,45%)] hover:shadow-[0_2px_0_0_hsl(180,30%,45%)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
        Apply filters and view data
      </Button>
    </aside>

    <main className={`flex-1 overflow-hidden flex flex-col ${showMobileFilters ? 'hidden' : 'flex'} md:flex`}>
      <Button onClick={() => setShowMobileFilters(true)} className="mb-4 md:hidden" variant="outline">
        <Filter className="w-4 h-4 mr-2" />Filters
      </Button>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-sm text-muted-foreground">{sortedData.length} tags match</p>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse bg-card">
          <thead className="sticky top-0 gradient-primary z-10">
            <tr>
              <th rowSpan={2} className="border border-border p-2 text-left text-primary-foreground w-12"></th>
              {nonGroupedColumnsBefore.map(col => (
                <th key={col} rowSpan={2} className="border border-border p-2 text-left text-primary-foreground relative">
                  <div className="flex items-center gap-1">
                    <div className="cursor-pointer flex items-center gap-1" onClick={() => handleSort(col)}>
                      <TableHeaderHelp label={headerLabels[col] || col} helpText={helpText[col]} />
                      {sortColumn === col && (sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </div>
                </th>
              ))}
              {showPreviousYears && (
                <>
                  <th colSpan={2} className="border border-border p-2 text-center text-primary-foreground font-bold">2023</th>
                  <th colSpan={2} className="border border-border p-2 text-center text-primary-foreground font-bold">2024</th>
                </>
              )}
              <th colSpan={2} className="border border-border p-2 text-center text-primary-foreground font-bold">2025</th>
              {nonGroupedColumnsAfter.map(col => (
                <th key={col} rowSpan={2} className="border border-border p-2 text-left text-primary-foreground relative">
                  <div className="flex items-center gap-1">
                    <div className="cursor-pointer flex items-center gap-1" onClick={() => handleSort(col)}>
                      <TableHeaderHelp label={headerLabels[col] || col} helpText={helpText[col]} />
                      {sortColumn === col && (sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
            <tr>
              {showPreviousYears && (
                <>
                  {yearGroupedColumns['2023'].map(col => (
                    <th key={col} className="border border-border p-2 text-left text-primary-foreground relative">
                      <div className="flex items-center gap-1">
                        <div className="cursor-pointer flex items-center gap-1" onClick={() => handleSort(col)}>
                          <TableHeaderHelp label={headerLabels[col] || col} helpText={helpText[col]} />
                          {sortColumn === col && (sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </div>
                      </div>
                    </th>
                  ))}
                  {yearGroupedColumns['2024'].map(col => (
                    <th key={col} className="border border-border p-2 text-left text-primary-foreground relative">
                      <div className="flex items-center gap-1">
                        <div className="cursor-pointer flex items-center gap-1" onClick={() => handleSort(col)}>
                          <TableHeaderHelp label={headerLabels[col] || col} helpText={helpText[col]} />
                          {sortColumn === col && (sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </div>
                      </div>
                    </th>
                  ))}
                </>
              )}
              {yearGroupedColumns['2025'].map(col => (
                <th key={col} className="border border-border p-2 text-left text-primary-foreground relative">
                  <div className="flex items-center gap-1">
                    <div className="cursor-pointer flex items-center gap-1" onClick={() => handleSort(col)}>
                      <TableHeaderHelp label={headerLabels[col] || col} helpText={helpText[col]} />
                      {sortColumn === col && (sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row: any, idx: number) => {
              const isExpanded = expandedRows.has(idx);
              const huntCode = row.Tag;
              const isFavorited = favorites.has(huntCode);
              const pageNum = huntCodeMap[huntCode];
              const pdfUrl = "https://cpw.widen.net/s/t6tnqjg55q/postdrawrecapreport_pronghorn-25_05102025_1540";
              // Get valid GMU numbers from the row
              const validGmus = String(row["Valid GMUs"] || "").split(",").map(u => u.trim()).filter(Boolean);
              // Find matching subtable rows
              const matchingSubtableRows = validGmus.map(gmu => subtableByUnit[gmu]).filter(Boolean);

              return <Fragment key={idx}>
                <tr className="group hover:bg-accent cursor-pointer" onClick={() => toggleRow(idx)}>
                  <td className="border border-border p-2 text-center" onClick={e => e.stopPropagation()}>
                    <Star className={`w-5 h-5 cursor-pointer ${isFavorited ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} onClick={() => toggleFavorite(huntCode)} />
                  </td>
                  {visibleColumns.map(col => {
                    let cellValue = row[col] || "";
                    if (col === "Chance_with_First_choice") {
                      const dolStr = String(row.Drawn_out_level || "").trim();
                      const isLeftoverOrChoice = dolStr === "Leftover" || dolStr.startsWith("Choice");
                      if (isLeftoverOrChoice) { cellValue = "100%"; }
                      else {
                        const dol = parseFloat(dolStr || "0");
                        if (!isNaN(dol)) {
                          if (userPreferencePoints > dol) cellValue = "100%";
                          else if (userPreferencePoints < dol) cellValue = "0%";
                          else cellValue = row.Chance_at_DOL || "";
                        }
                      }
                    }
                    const isHybrid = isHybridEligible(row);
                    const isHybridHighlightColumn = ['Drawn_out_level', 'Chance_at_DOL', 'Drawn_out_level23', 'Chance_at_DOL23', 'Drawn_out_level24', 'Chance_at_DOL24'].includes(col);
                    const hybridHighlightClass = isHybrid && isHybridHighlightColumn ? 'bg-hybrid-highlight' : '';

                    return <td key={col} className={`border border-border p-2 ${hybridHighlightClass}`} style={col === "Valid GMUs" || col === "Notes" ? { maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } : {}}>
                      {col === "Tag" ? <div className="flex items-center gap-2 text-primary-dark group-hover:text-primary">
                        <span>{isExpanded ? "▼" : "▶"}</span>
                        {pageNum ? <a href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${pdfUrl}.pdf#page=${pageNum}`} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={e => e.stopPropagation()}>{huntCode}</a> : huntCode}
                      </div> : col === "slope" ? renderTrendArrow(row[col]) : col === "Valid GMUs" || col === "Notes" ? <span title={row[col] || ""}>{row[col] || ""}</span> : cellValue}
                    </td>;
                  })}
                </tr>
                {isExpanded && matchingSubtableRows.length > 0 && <tr>
                  <td colSpan={visibleColumns.length + 1} className="border border-border p-4 bg-primary-foreground text-popover-foreground">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary">
                          <th className="border p-1 bg-accent">Unit</th>
                          <th className="border p-1 bg-accent">Acres</th>
                          <th className="border p-1 bg-accent">Public Acres</th>
                          <th className="border p-1 bg-accent">DAU</th>
                          <th className="border p-1 bg-accent">DAU Population Estimate</th>
                          <th className="border p-1 bg-accent">DAU Buck:Doe ratio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchingSubtableRows.map((subRow: any) => {
                          const unitVal = String(subRow.Unit || '');
                          const onxUrl = subRow.onx;
                          return <tr key={unitVal}>
                            <td className="border p-1 text-primary-dark">
                              {onxUrl && !isMobile ? <a href={onxUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{unitVal}</a> : unitVal}
                            </td>
                            <td className="border p-1">{subRow.Acres || ''}</td>
                            <td className="border p-1">{subRow['Acres Public'] || ''}</td>
                            <td className="border p-1">{subRow.DAU || ''}</td>
                            <td className="border p-1">{subRow['Population'] || ''}</td>
                            <td className="border p-1">{subRow['Buck/Doe Ratio'] || ''}</td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  </td>
                </tr>}
              </Fragment>;
            })}
          </tbody>
        </table>
      </div>
    </main>
  </div>;
}
