import { useState, useMemo, useEffect } from 'react';
import { useCsvData } from '@/hooks/useCsvData';
import { CSV_VERSION } from '@/utils/csvVersion';
import { useFavorites } from '@/hooks/useFavorites';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Star, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePersistedState } from '@/hooks/usePersistedState';

const ROWS_PER_PAGE = 50;

export function OTCDeerTableNew() {
  const { data, loading, error } = useCsvData(`/data/DeerDraw25Subtable.csv?v=${CSV_VERSION}`);
  const { favorites, toggleFavorite: toggleFavoriteRaw, clearAllFavorites } = useFavorites('otc_deer_new');
  const isMobile = useIsMobile();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showMobileFilters, setShowMobileFilters] = useState(true);

  const [unitSearch, setUnitSearch] = usePersistedState('otcDeerNew_unitSearch', '');
  const [showFavoritesOnly, setShowFavoritesOnly] = usePersistedState('otcDeerNew_showFavoritesOnly', false);
  const [selectedSeason, setSelectedSeason] = usePersistedState('otcDeerNew_selectedSeason', '');
  const [minSuccessRate, setMinSuccessRate] = usePersistedState('otcDeerNew_minSuccessRate', '');
  const [minPublicLand, setMinPublicLand] = usePersistedState('otcDeerNew_minPublicLand', '');

  // Get unique OTC seasons from data
  const otcSeasons = useMemo(() => {
    const seasons = new Set<string>();
    data.forEach((row: any) => {
      const otcCat = String(row.OTCCat || '').trim();
      if (otcCat && otcCat !== 'NA') {
        seasons.add(otcCat);
      }
    });
    return Array.from(seasons).sort();
  }, [data]);

  // Auto-select first season if none selected
  useEffect(() => {
    if (!selectedSeason && otcSeasons.length > 0) {
      setSelectedSeason(otcSeasons[0]);
    }
  }, [otcSeasons, selectedSeason]);

  useEffect(() => {
    if (favorites.size === 0 && showFavoritesOnly) {
      setShowFavoritesOnly(false);
    }
  }, [favorites.size, showFavoritesOnly]);

  useEffect(() => {
    setCurrentPage(1);
  }, [unitSearch, showFavoritesOnly, selectedSeason, minSuccessRate, minPublicLand]);

  const toggleFavorite = (unit: string) => {
    const key = `${unit}-${selectedSeason}`;
    toggleFavoriteRaw(key);
  };

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      const otcCat = String(row.OTCCat || '').trim();
      if (!otcCat || otcCat === 'NA') return false;

      // Filter by selected season
      if (selectedSeason && !otcCat.includes(selectedSeason)) return false;

      if (showFavoritesOnly) {
        const key = `${row.Unit}-${selectedSeason}`;
        if (!favorites.has(key)) return false;
      }

      if (unitSearch) {
        const searchUnits = unitSearch.split(',').map(u => u.trim().toLowerCase());
        const unitStr = String(row.Unit || '').toLowerCase();
        if (!searchUnits.some(u => unitStr === u)) return false;
      }

      return true;
    });
  }, [data, unitSearch, showFavoritesOnly, favorites, selectedSeason]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const aNum = parseFloat(String(aVal || '').replace(/[, ]/g, ''));
      const bNum = parseFloat(String(bVal || '').replace(/[, ]/g, ''));
      if (!isNaN(aNum) && !isNaN(bNum)) return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
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
    if (sortColumn === column) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(column); setSortDirection('asc'); }
  };

  if (loading) return <div className="p-8 text-center">Loading OTC deer data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const visibleColumns = ['Unit', 'Acres', 'Acres Public', 'DAU', 'Post Hunt Estimate', 'Buck/ Doe ratio (per 100)', 'Total_Harvest_estimate', 'Success_DAU'];

  const headerLabels: Record<string, string> = {
    'Unit': 'Unit',
    'Acres': 'Acres',
    'Acres Public': 'Public Acres',
    'DAU': 'DAU',
    'Post Hunt Estimate': 'DAU Population Estimate',
    'Buck/ Doe ratio (per 100)': 'DAU Buck:Doe ratio',
    'Total_Harvest_estimate': 'DAU Harvest',
    'Success_DAU': 'DAU % Success',
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {(!isMobile || showMobileFilters) && (
        <aside className="w-full lg:w-64 bg-card p-4 rounded-lg border space-y-4 overflow-y-auto">
          {isMobile && (
            <Button onClick={() => setShowMobileFilters(false)} className="w-full mb-4 shadow-[0_4px_0_0_hsl(180,30%,45%)] hover:shadow-[0_2px_0_0_hsl(180,30%,45%)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
              Apply filters and view data
            </Button>
          )}
          <h3 className="font-semibold text-lg">Filters</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Show Favorites Only</Label>
              <Switch checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} disabled={favorites.size === 0} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>OTC Season</Label>
            <div className="space-y-1">
              {otcSeasons.map(season => (
                <div key={season} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`otcNew-season-${season}`}
                    name="otcSeason"
                    checked={selectedSeason === season}
                    onChange={() => setSelectedSeason(season)}
                    className="rounded"
                  />
                  <Label htmlFor={`otcNew-season-${season}`} className="cursor-pointer text-sm">{season}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Search for specific units</Label>
            <Input placeholder="Separate units by commas" value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} />
          </div>

          <Button variant="outline" className="w-full" onClick={() => { setUnitSearch(''); setSelectedSeason(otcSeasons[0] || ''); }}>
            Clear Filters
          </Button>

          <Button variant="outline" className="w-full" onClick={clearAllFavorites} disabled={favorites.size === 0}>
            Clear Favorites ({favorites.size})
          </Button>

          {isMobile && (
            <Button onClick={() => setShowMobileFilters(false)} className="w-full shadow-[0_4px_0_0_hsl(180,30%,45%)] hover:shadow-[0_2px_0_0_hsl(180,30%,45%)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
              Apply filters and view data
            </Button>
          )}
        </aside>
      )}

      {(!isMobile || !showMobileFilters) && (
        <main className="flex-1 overflow-auto">
          {isMobile && (
            <Button onClick={() => setShowMobileFilters(true)} className="mb-4 w-full" variant="outline">
              <Filter className="w-4 h-4 mr-2" />Filters
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
                  const favKey = `${row.Unit}-${selectedSeason}`;
                  const isFavorited = favorites.has(favKey);
                  return (
                    <tr key={idx} className="group hover:bg-accent">
                      <td className="border border-border p-2 text-center">
                        <Star className={`w-5 h-5 cursor-pointer ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} onClick={() => toggleFavorite(row.Unit)} />
                      </td>
                      {visibleColumns.map((col) => (
                        <td key={col} className="border border-border p-2">
                          {col === 'Unit' && row.onx && !isMobile ? (
                            <a href={row.onx} target="_blank" rel="noopener noreferrer" className="text-primary-dark group-hover:text-primary hover:underline">{row[col] || ''}</a>
                          ) : col === 'Unit' ? (
                            <span className="text-primary-dark group-hover:text-primary">{row[col] || ''}</span>
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
