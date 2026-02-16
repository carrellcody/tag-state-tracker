import { useState, useMemo, useEffect } from 'react';
import { useCsvData } from '@/hooks/useCsvData';
import { CSV_VERSION } from '@/utils/csvVersion';
import { useFavorites } from '@/hooks/useFavorites';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Star, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePersistedState } from '@/hooks/usePersistedState';

const ROWS_PER_PAGE = 50;
const FIXED_SEASON = 'Whitetail Only Late Rifle Season';

export function OTCDeerTable() {
  const { data: harvestData, loading, error } = useCsvData(`/data/DeerOTC24.csv?v=${CSV_VERSION}`);
  const { favorites, toggleFavorite: toggleFavoriteRaw, clearAllFavorites } = useFavorites('otc_deer');
  const isMobile = useIsMobile();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showMobileFilters, setShowMobileFilters] = useState(true);
  
  const [unitSearch, setUnitSearch] = usePersistedState('otcDeer_unitSearch', '');
  const [minSuccessRate, setMinSuccessRate] = usePersistedState('otcDeer_minSuccessRate', '');
  const [minPublicLand, setMinPublicLand] = usePersistedState('otcDeer_minPublicLand', '');
  const [showFavoritesOnly, setShowFavoritesOnly] = usePersistedState('otcDeer_showFavoritesOnly', false);
  const [showPreviousYearStats, setShowPreviousYearStats] = usePersistedState('otcDeer_showPreviousYearStats', false);

  useEffect(() => {
    if (favorites.size === 0 && showFavoritesOnly) {
      setShowFavoritesOnly(false);
    }
  }, [favorites.size, showFavoritesOnly]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [unitSearch, minSuccessRate, minPublicLand, showFavoritesOnly]);

  const toggleFavorite = (unit: string) => {
    const key = `${unit}-${FIXED_SEASON}`;
    toggleFavoriteRaw(key);
  };

  const filteredData = useMemo(() => {
    return harvestData.filter((row: any) => {
      // Only show OTC units
      if (!row.OTCCat) return false;
      
      if (showFavoritesOnly) {
        const key = `${row.Unit}-${FIXED_SEASON}`;
        if (!favorites.has(key)) return false;
      }
      
      // Filter by OTC season - check if the fixed season is present in the OTCCat value
      const otcCatValue = String(row.OTCCat);
      if (!otcCatValue.includes(FIXED_SEASON)) return false;
      
      // Unit search
      if (unitSearch) {
        const searchUnits = unitSearch.split(',').map(u => u.trim().toLowerCase());
        const unitStr = String(row.Unit || '').toLowerCase();
        if (!searchUnits.some(u => unitStr === u)) return false;
      }
      
      // Minimum success rate
      if (minSuccessRate && parseFloat(row['Percent Success'] || 0) < parseFloat(minSuccessRate)) {
        return false;
      }
      
      // Minimum public land
      if (minPublicLand && parseFloat(row.percent_public || 0) < parseFloat(minPublicLand)) {
        return false;
      }
      
      return true;
    });
  }, [harvestData, unitSearch, minSuccessRate, minPublicLand, showFavoritesOnly, favorites]);

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

  if (loading) return <div className="p-8 text-center">Loading OTC deer data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const baseColumns = ["Unit", "OTCCat", "Category", "Bucks", "Total Antlerless Harvest", "Total Hunters"];
  const successColumn = ["Percent Success"];
  const remainingColumns = ["percent_public", "Acres Public", "Hunters Density Per Public Sq. Mile"];
  
  const visibleColumns = showPreviousYearStats 
    ? [...baseColumns, "PS22", "PS23", ...successColumn, "threeyearsuccess", "slope", ...remainingColumns]
    : [...baseColumns, ...successColumn, ...remainingColumns];

  const headerLabels: Record<string, string> = {
    "Unit": "Unit",
    "OTCCat": "OTC Category",
    "Category": "Harvest Category",
    "Bucks": "Bucks",
    "Total Antlerless Harvest": "Antlerless",
    "Total Hunters": "Total Hunters",
    "PS22": "2022",
    "PS23": "2023",
    "Percent Success": "2024",
    "threeyearsuccess": "3-Year Average",
    "slope": "Trend",
    "percent_public": "Public %",
    "Acres Public": "Public Acres",
    "Hunters Density Per Public Sq. Mile": "Hunter Density/Public Sq. Mile (x1000)"
  };

  // Calculate percentile-based min/max for hunter density color scaling
  const densityValues = sortedData
    .map((row: any) => parseFloat(row['Hunters Density Per Public Sq. Mile'] || 0))
    .filter((val: number) => !isNaN(val) && val > 0)
    .sort((a, b) => a - b);
  
  const getPercentile = (arr: number[], percentile: number) => {
    const index = Math.floor(arr.length * percentile);
    return arr[index] || 0;
  };
  
  const p10 = getPercentile(densityValues, 0.10);
  const p90 = getPercentile(densityValues, 0.90);

  const getDensityColor = (value: string | number) => {
    const numValue = parseFloat(String(value || 0));
    if (isNaN(numValue) || densityValues.length === 0) return '';
    
    let normalized;
    if (numValue <= p10) {
      normalized = 0; // Greenest
    } else if (numValue >= p90) {
      normalized = 1; // Reddest
    } else {
      // Scale within the middle 80%
      normalized = (numValue - p10) / (p90 - p10);
    }
    
    // Green (low) to Red (high) using pastel colors
    const hue = 120 - (normalized * 120); // 120 = green, 0 = red
    return `hsl(${hue}, 60%, 85%)`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {(!isMobile || showMobileFilters) && (
      <>
      <aside className="w-full lg:w-64 bg-card p-4 rounded-lg border space-y-4 overflow-y-auto">
        {isMobile && (
          <Button 
            onClick={() => setShowMobileFilters(false)} 
            className="w-full mb-4 shadow-[0_4px_0_0_hsl(180,30%,45%)] hover:shadow-[0_2px_0_0_hsl(180,30%,45%)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all"
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
            <Label>Show previous year stats</Label>
            <Switch
              checked={showPreviousYearStats}
              onCheckedChange={setShowPreviousYearStats}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>OTC Season</Label>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">{FIXED_SEASON}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Search for specific units</Label>
          <Input
            placeholder="Separate units by commas"
            value={unitSearch}
            onChange={(e) => setUnitSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum success rate</Label>
          <Input
            type="number"
            placeholder="Min Success Rate"
            value={minSuccessRate}
            onChange={(e) => setMinSuccessRate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Percent Public Land</Label>
          <Input
            type="number"
            placeholder="Min Public %"
            value={minPublicLand}
            onChange={(e) => setMinPublicLand(e.target.value)}
          />
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            setUnitSearch('');
            setMinSuccessRate('');
            setMinPublicLand('');
          }}
        >
          Clear Filters
        </Button>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={clearAllFavorites}
          disabled={favorites.size === 0}
        >
          Clear Favorites ({favorites.size})
        </Button>

        {isMobile && (
          <Button 
            onClick={() => setShowMobileFilters(false)} 
            className="w-full shadow-[0_4px_0_0_hsl(180,30%,45%)] hover:shadow-[0_2px_0_0_hsl(180,30%,45%)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all"
          >
            Apply filters and view data
          </Button>
        )}
      </aside>
      </>
      )}

      {(!isMobile || !showMobileFilters) && (
      <main className="flex-1 overflow-auto">
        {isMobile && (
          <Button 
            onClick={() => setShowMobileFilters(true)} 
            className="mb-4 w-full"
            variant="outline"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        )}

        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{sortedData.length} OTC units match your criteria</p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-card relative">
            <thead className="sticky top-0 gradient-primary z-10">
              {showPreviousYearStats ? (
                <>
                  <tr>
                    <th className="border border-border p-2 text-left text-primary-foreground w-12" rowSpan={2}></th>
                    {baseColumns.map((col) => (
                      <th
                        key={col}
                        className="border border-border p-2 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground"
                        rowSpan={2}
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          {headerLabels[col] || col}
                          {sortColumn === col && (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="border border-border p-2 text-center text-primary-foreground" colSpan={5}>
                      Percent Success
                    </th>
                    {remainingColumns.map((col) => (
                      <th
                        key={col}
                        className="border border-border p-2 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground"
                        rowSpan={2}
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          {headerLabels[col] || col}
                          {sortColumn === col && (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {["PS22", "PS23", "Percent Success", "threeyearsuccess", "slope"].map((col) => (
                      <th
                        key={col}
                        className="border border-border p-2 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          {headerLabels[col] || col}
                          {sortColumn === col && (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </>
              ) : (
                <tr>
                  <th className="border border-border p-2 text-left text-primary-foreground w-12"></th>
                  {visibleColumns.map((col) => (
                    <th
                      key={col}
                      className="border border-border p-2 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground"
                      onClick={() => handleSort(col)}
                    >
                      <div className="flex items-center gap-1">
                        {col === "Percent Success" ? "Success %" : (headerLabels[col] || col)}
                        {sortColumn === col && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {paginatedData.map((row: any, idx: number) => {
                const favKey = `${row.Unit}-${FIXED_SEASON}`;
                const isFavorited = favorites.has(favKey);
                return (
                  <tr key={idx} className="group hover:bg-accent">
                    <td className="border border-border p-2 text-center">
                      <Star
                        className={`w-5 h-5 cursor-pointer ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        onClick={() => toggleFavorite(row.Unit)}
                      />
                    </td>
                    {visibleColumns.map((col) => (
                    <td 
                      key={col} 
                      className="border border-border p-2"
                      style={col === 'Hunters Density Per Public Sq. Mile' ? { backgroundColor: getDensityColor(row[col]) } : {}}
                    >
                      {col === 'Unit' && row.onx && !isMobile ? (
                        <a href={row.onx} target="_blank" rel="noopener noreferrer" className="text-primary-dark group-hover:text-white hover:underline">
                          {row[col] || ''}
                        </a>
                      ) : col === 'Unit' ? (
                        <span className="text-primary-dark group-hover:text-white">{row[col] || ''}</span>
                      ) : col === 'slope' ? (
                        (() => {
                          const slopeVal = parseFloat(row[col]);
                          if (isNaN(slopeVal) || slopeVal === 0) return null;
                          return slopeVal > 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          );
                        })()
                      ) : (
                        row[col] || ''
                      )}
                    </td>
                    ))}
                  </tr>
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
