import { useState, useMemo, useEffect, Fragment } from 'react';
import { useCsvData } from '@/hooks/useCsvData';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Star, Filter } from 'lucide-react';
import { TableWrapper } from './TableWrapper';
import { useIsMobile } from '@/hooks/use-mobile';

const ROWS_PER_PAGE = 50;

export function ElkDrawTable() {
  const { data, loading, error } = useCsvData('/data/Fullelk25Final.csv');
  const { data: harvestData } = useCsvData('/data/elkHarvest25.csv');
  const { data: codePages } = useCsvData('/data/elk25code_pages.csv');
  const { favorites, toggleFavorite } = useFavorites('elk_draw');
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(true);
  
  const [unitSearch, setUnitSearch] = useState('');
  const [sexFilter, setSexFilter] = useState<string[]>(['All']);
  const [seasonWeapons, setSeasonWeapons] = useState<string[]>(['Any']);
  const [hunterClass, setHunterClass] = useState('A_R');
  const [ploFilter, setPloFilter] = useState('all');
  const [rfwFilter, setRfwFilter] = useState('all');
  const [minPoints, setMinPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(32);
  const [userPreferencePoints, setUserPreferencePoints] = useState(0);
  const [showNoApplicants, setShowNoApplicants] = useState('no');
  const [listFilter, setListFilter] = useState<string[]>(['Any']);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPreviousYears, setShowPreviousYears] = useState(false);

  // Load user's elk preference points from profile
  useEffect(() => {
    const loadPreferencePoints = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('elk_preference_points')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading elk preference points:', error);
          return;
        }

        if (profile) {
          const points = profile.elk_preference_points || 0;
          setUserPreferencePoints(points);
          setMaxPoints(points);
        }
      } catch (error) {
        console.error('Error loading elk preference points:', error);
      }
    };

    loadPreferencePoints();
  }, [user]);

  // Auto-hide RFW for non-residents
  useEffect(() => {
    if (hunterClass === 'A_NR' || hunterClass === 'Y_NR') {
      setRfwFilter('none');
    }
  }, [hunterClass]);

  const huntCodeMap = useMemo(() => {
    const map: Record<string, string> = {};
    codePages.forEach((row: any) => {
      if (row.HuntCode && row.Page) map[row.HuntCode] = row.Page;
    });
    return map;
  }, [codePages]);

  const harvestByUnit = useMemo(() => {
    const map: Record<string, any> = {};
    harvestData.forEach((row: any) => {
      if (row.harvestunit) map[row.harvestunit] = row;
    });
    return map;
  }, [harvestData]);

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      if (showFavoritesOnly && !favorites.has(row.Tag)) return false;
      if (unitSearch) {
        const searchTerms = unitSearch.split(',').map(s => s.trim()).filter(Boolean);
        const units = String(row['Valid GMUs'] || '').split(',').map(u => u.trim());
        if (!searchTerms.some(term => units.some(unit => unit === term))) return false;
      }
      
      if (!sexFilter.includes('All')) {
        const sexMap: Record<string, string> = { 'Either': 'E', 'Male': 'M', 'Female': 'F' };
        const matchesSex = sexFilter.some(filter => row.Sex === sexMap[filter]);
        if (!matchesSex) return false;
      }
      
      // Season/Weapon filter (checkboxes)
      if (!seasonWeapons.includes('Any')) {
        const sw = row.SeasonWeapon || '';
        const matchesFilter = seasonWeapons.some(filter => {
          if (filter === 'A') return sw.includes('A');
          if (filter === 'M') return sw.includes('M');
          if (filter === 'O1R') return sw.includes('O1R');
          if (filter === 'O2R') return sw.includes('O2R');
          if (filter === 'O3R') return sw.includes('O3R');
          if (filter === 'O4R') return sw.includes('O4R');
          if (filter === 'E') return sw.includes('E');
          if (filter === 'L') return sw.includes('L');
          if (filter === 'Other') {
            return !sw.includes('A') && !sw.includes('M') && !sw.includes('O1R') && !sw.includes('O2R') && !sw.includes('O3R') && !sw.includes('O4R') && !sw.includes('E') && !sw.includes('L');
          }
          return false;
        });
        if (!matchesFilter) return false;
      }
      
      // Hunter Class filter
      if (hunterClass !== 'all' && row.Class !== hunterClass) return false;
      
      // PLO filter
      if (ploFilter === 'only' && row.PLO !== 'Yes') return false;
      if (ploFilter === 'none' && row.PLO === 'Yes') return false;
      
      // RFW filter
      if (rfwFilter === 'only' && row.RFW !== 'Yes') return false;
      if (rfwFilter === 'none' && row.RFW === 'Yes') return false;
      
      // Points sliders
      const dolStr = String(row.Drawn_out_level || '').trim();
      const isLeftoverOrChoice = dolStr === 'Leftover' || dolStr.startsWith('Choice');
      const dol = isLeftoverOrChoice ? 0 : parseFloat(dolStr || '0');
      if (isNaN(dol) || dol < minPoints || dol > maxPoints) return false;
      
      // No applicants filter
      if (showNoApplicants === 'no' && row.NoApps === 'Yes') return false;
      
      // List filter
      if (!listFilter.includes('Any')) {
        const list = row.List || '';
        const matchesList = listFilter.some(filter => list === filter);
        if (!matchesList) return false;
      }
      
      return true;
    });
  }, [data, unitSearch, sexFilter, seasonWeapons, hunterClass, ploFilter, rfwFilter, minPoints, maxPoints, showNoApplicants, listFilter, showFavoritesOnly, favorites]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedData.slice(start, start + ROWS_PER_PAGE);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  if (loading) return <div className="p-8 text-center">Loading elk draw data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const visibleColumns = showPreviousYears 
    ? ["Tag", "List", "Valid GMUs", "Drawn_out_level23", "Chance_at_DOL23", "Drawn_out_level24", "Chance_at_DOL24", "Drawn_out_level", "Chance_at_DOL", "slope", "Chance_with_First_choice", "Sex", "Weapon", "Notes"]
    : ["Tag", "List", "Valid GMUs", "Drawn_out_level", "Chance_with_First_choice", "Chance_at_DOL", "Sex", "Weapon", "Notes"];
  
  const headerLabels: Record<string, string> = {
    "Tag": "Hunt Code",
    "List": "List",
    "Valid GMUs": "Valid Units",
    "Drawn_out_level23": "Drawn Out Level 2023",
    "Chance_at_DOL23": "Chance at Drawn Out Level 2023",
    "Drawn_out_level24": "Drawn Out Level 2024",
    "Chance_at_DOL24": "Chance at Drawn Out Level 2024",
    "Drawn_out_level": "Drawn Out Level (Minimum points required)",
    "Chance_with_First_choice": "Chance with your preference points",
    "Chance_at_DOL": "Chance at Drawn Out Level",
    "slope": "Three Year Trend",
    "Sex": "Sex",
    "Weapon": "Weapon",
    "Notes": "Notes"
  };

  const renderTrendArrow = (value: any) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) return <span className="text-muted-foreground">-</span>;
    
    const magnitude = Math.abs(numValue);
    const size = Math.min(Math.max(magnitude * 8, 16), 48);
    const isPositive = numValue > 0;
    
    return (
      <div className="flex items-center justify-center">
        {isPositive ? (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-red-500">
            <path d="M12 4L20 20H4L12 4Z" fill="currentColor" />
          </svg>
        ) : (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-green-500">
            <path d="M12 20L4 4H20L12 20Z" fill="currentColor" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {(!isMobile || showMobileFilters) && (
        <aside className="w-full lg:w-64 bg-card p-4 rounded-lg border space-y-4 overflow-y-auto">
          {isMobile && (
            <Button 
              onClick={() => setShowMobileFilters(false)} 
              className="w-full mb-4"
            >
              Apply filters and view data
            </Button>
          )}
          <h3 className="font-semibold text-lg">Filters</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Show Favorites Only</Label>
            <Switch
              checked={showFavoritesOnly}
              onCheckedChange={setShowFavoritesOnly}
              disabled={favorites.size === 0}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>See previous year draw results</Label>
            <Switch
              checked={showPreviousYears}
              onCheckedChange={setShowPreviousYears}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Search Units</Label>
          <Input placeholder="e.g. 10, 20, 5" value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="elk-user-pp">Your Elk Preference Points</Label>
          <Input
            id="elk-user-pp"
            type="number"
            min="0"
            max="32"
            value={userPreferencePoints}
            onChange={(e) => setUserPreferencePoints(Math.max(0, Math.min(32, parseInt(e.target.value) || 0)))}
            placeholder="Enter your PP"
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Preference Points: {minPoints}</Label>
          <input type="range" min="0" max="32" value={minPoints} onChange={(e) => setMinPoints(Number(e.target.value))} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label>Maximum Preference Points: {maxPoints}</Label>
          <input type="range" min="0" max="32" value={maxPoints} onChange={(e) => setMaxPoints(Number(e.target.value))} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label>Hunter Class</Label>
          <RadioGroup value={hunterClass} onValueChange={setHunterClass}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A_R" id="elk-class-ar" />
              <Label htmlFor="elk-class-ar">Resident Adult</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A_NR" id="elk-class-anr" />
              <Label htmlFor="elk-class-anr">Non-Resident Adult</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Y_R" id="elk-class-yr" />
              <Label htmlFor="elk-class-yr">Resident Youth</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Y_NR" id="elk-class-ynr" />
              <Label htmlFor="elk-class-ynr">Non-Resident Youth</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="L_U" id="elk-class-lu" />
              <Label htmlFor="elk-class-lu">Landowner Unrestricted</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="L_R" id="elk-class-lr" />
              <Label htmlFor="elk-class-lr">Landowner Restricted</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>PLO Tags</Label>
          <RadioGroup value={ploFilter} onValueChange={setPloFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="elk-plo-all" />
              <Label htmlFor="elk-plo-all">Show all tags</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="only" id="elk-plo-only" />
              <Label htmlFor="elk-plo-only">Show only PLO tags</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="elk-plo-none" />
              <Label htmlFor="elk-plo-none">Don't show PLO tags</Label>
            </div>
          </RadioGroup>
        </div>

        {hunterClass !== 'A_NR' && hunterClass !== 'Y_NR' && (
          <div className="space-y-2">
            <Label>RFW Tags</Label>
            <RadioGroup value={rfwFilter} onValueChange={setRfwFilter}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="elk-rfw-all" />
                <Label htmlFor="elk-rfw-all">Show all tags</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="only" id="elk-rfw-only" />
                <Label htmlFor="elk-rfw-only">Show only RFW tags</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="elk-rfw-none" />
                <Label htmlFor="elk-rfw-none">Don't show RFW tags</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="space-y-2">
          <Label>Sex</Label>
          <div className="space-y-1">
            {[
              { value: 'All', label: 'All' },
              { value: 'Either', label: 'Either' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' }
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`elk-sex-${value}`}
                  checked={sexFilter.includes(value)}
                  onChange={(e) => {
                    if (value === 'All') {
                      setSexFilter(e.target.checked ? ['All'] : []);
                    } else {
                      const newSex = e.target.checked
                        ? [...sexFilter.filter(s => s !== 'All'), value]
                        : sexFilter.filter(s => s !== value);
                      setSexFilter(newSex.length === 0 ? ['All'] : newSex);
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor={`elk-sex-${value}`} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Weapon/Season</Label>
          <div className="space-y-1">
            {[
              { value: 'A', label: 'Archery' },
              { value: 'M', label: 'Muzzleloader' },
              { value: 'O1R', label: 'First Rifle' },
              { value: 'O2R', label: 'Second Rifle' },
              { value: 'O3R', label: 'Third Rifle' },
              { value: 'O4R', label: 'Fourth Rifle' },
              { value: 'E', label: 'Early Rifle' },
              { value: 'L', label: 'Late Rifle' },
              { value: 'Other', label: 'Other' },
              { value: 'Any', label: 'Any' }
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`elk-season-${value}`}
                  checked={seasonWeapons.includes(value)}
                  onChange={(e) => {
                    if (value === 'Any') {
                      setSeasonWeapons(e.target.checked ? ['Any'] : []);
                    } else {
                      const newSeasons = e.target.checked
                        ? [...seasonWeapons.filter(s => s !== 'Any'), value]
                        : seasonWeapons.filter(s => s !== value);
                      setSeasonWeapons(newSeasons.length === 0 ? ['Any'] : newSeasons);
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor={`elk-season-${value}`} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>List</Label>
          <div className="space-y-1">
            {[
              { value: 'Any', label: 'Any' },
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' }
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`elk-list-${value}`}
                  checked={listFilter.includes(value)}
                  onChange={(e) => {
                    if (value === 'Any') {
                      setListFilter(e.target.checked ? ['Any'] : []);
                    } else {
                      const newList = e.target.checked
                        ? [...listFilter.filter(l => l !== 'Any'), value]
                        : listFilter.filter(l => l !== value);
                      setListFilter(newList.length === 0 ? ['Any'] : newList);
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor={`elk-list-${value}`} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Show tags with no applicants?</Label>
          <RadioGroup value={showNoApplicants} onValueChange={setShowNoApplicants}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="elk-no-apps-yes" />
              <Label htmlFor="elk-no-apps-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="elk-no-apps-no" />
              <Label htmlFor="elk-no-apps-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <Button variant="outline" className="w-full" onClick={() => {
          setUnitSearch(''); setSexFilter(['All']); setSeasonWeapons(['Any']); 
          setHunterClass('A_R'); setPloFilter('all'); setRfwFilter('all'); setMinPoints(0); setMaxPoints(32); setShowNoApplicants('no'); setListFilter(['Any']);
        }}>Clear Filters</Button>

        {isMobile && (
          <Button 
            onClick={() => setShowMobileFilters(false)} 
            className="w-full mt-4"
          >
            Apply filters and view data
          </Button>
        )}
      </aside>
      )}

      {(!isMobile || !showMobileFilters) && (
        <main className="flex-1 overflow-hidden flex flex-col">
          {isMobile && (
            <Button 
              onClick={() => setShowMobileFilters(true)} 
              className="mb-4"
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
          <div className="mb-4 flex justify-between items-center">
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
                <th className="border border-border p-2 text-left text-primary-foreground w-12"></th>
                {visibleColumns.map((col) => (
                  <th key={col} className="border border-border p-2 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground" onClick={() => handleSort(col)}>
                    <div className="flex items-center gap-1">
                      {headerLabels[col] || col}
                      {sortColumn === col && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row: any, idx: number) => {
                const isExpanded = expandedRow === idx;
                const huntCode = row.Tag;
                const isFavorited = favorites.has(huntCode);
                const pageNum = huntCodeMap[huntCode];
                const pdfUrl = "https://cpw.widen.net/s/p2hln8gpxf/postdrawrecapreport_elk-25_05172025_0612";
                const harvestUnits = String(row.harvestunit || '').split(',').map(u => u.trim()).filter(Boolean);

                return (
                  <Fragment key={idx}>
                    <tr className="hover:bg-accent cursor-pointer" onClick={() => toggleRow(idx)}>
                      <td className="border border-border p-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <Star
                          className={`w-5 h-5 cursor-pointer ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                          onClick={() => toggleFavorite(huntCode)}
                        />
                      </td>
                      {visibleColumns.map((col) => {
                        let cellValue = row[col] || '';
                        
                        // Dynamic calculation for Chance_with_First_choice based on user's preference points
                        if (col === 'Chance_with_First_choice') {
                          const dol = parseFloat(row.Drawn_out_level || 0);
                          if (userPreferencePoints > dol) {
                            cellValue = '100%';
                          } else if (userPreferencePoints < dol) {
                            cellValue = '0%';
                          } else {
                            cellValue = row.Chance_at_DOL || '';
                          }
                        }
                        
                        return (
                          <td key={col} className="border border-border p-2" style={col === 'Valid GMUs' || col === 'Notes' ? { maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {}}>
                            {col === 'Tag' ? (
                              <div className="flex items-center gap-2">
                                <span>{isExpanded ? '▼' : '▶'}</span>
                                {pageNum ? (
                                  <a href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${pdfUrl}.pdf#page=${pageNum}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                    {huntCode}
                                  </a>
                                ) : huntCode}
                              </div>
                            ) : col === 'slope' ? (
                              renderTrendArrow(row[col])
                            ) : (col === 'Valid GMUs' || col === 'Notes') ? (
                              <span title={row[col] || ''}>{row[col] || ''}</span>
                            ) : cellValue}
                          </td>
                        );
                      })}
                    </tr>
                    {isExpanded && harvestUnits.length > 0 && (
                      <tr>
                        <td colSpan={visibleColumns.length} className="border border-border p-4 bg-muted">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-secondary">
                                <th className="border p-1">Unit</th>
                                <th className="border p-1">Harvest Category</th>
                                <th className="border p-1">Bulls</th>
                                <th className="border p-1">Antlerless</th>
                                <th className="border p-1">Total Hunters</th>
                                <th className="border p-1">Success %</th>
                                <th className="border p-1">Public %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {harvestUnits.map((unit) => {
                                const harvestRow = harvestByUnit[unit];
                                if (!harvestRow) return null;
                                return (
                                  <tr key={unit}>
                                    <td className="border p-1">
                                      {harvestRow.onx ? (
                                        <a href={harvestRow.onx} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                          {harvestRow.Unit}
                                        </a>
                                      ) : (
                                        harvestRow.Unit
                                      )}
                                    </td>
                                    <td className="border p-1">{harvestRow.Category}</td>
                                    <td className="border p-1">{harvestRow.Bulls}</td>
                                    <td className="border p-1">{harvestRow['Total Antlerless Harvest']}</td>
                                    <td className="border p-1">{harvestRow['Total Hunters']}</td>
                                    <td className="border p-1">{harvestRow['Percent Success']}</td>
                                    <td className="border p-1">{harvestRow.percent_public}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
      )}
    </div>
  );
}
