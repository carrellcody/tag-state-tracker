import { useState, useMemo, useEffect } from 'react';
import { useCsvData } from '@/hooks/useCsvData';
import { useFavorites } from '@/hooks/useFavorites';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Star, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { TableWrapper } from './TableWrapper';
import { useIsMobile } from '@/hooks/use-mobile';
import { TableHeaderHelp } from './TableHeaderHelp';

const ROWS_PER_PAGE = 50;

export function AntelopeHarvestTable() {
  const { data, loading, error } = useCsvData('/data/antHarvest25.csv');
  const { favorites, toggleFavorite, clearAllFavorites } = useFavorites('antelope_harvest');
  const isMobile = useIsMobile();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showMobileFilters, setShowMobileFilters] = useState(true);
  
  const [unitSearch, setUnitSearch] = useState('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>(['All manners of take']);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPreviousYearStats, setShowPreviousYearStats] = useState(false);

  useEffect(() => {
    if (favorites.size === 0 && showFavoritesOnly) {
      setShowFavoritesOnly(false);
    }
  }, [favorites.size, showFavoritesOnly]);


  const handleToggleFavorite = (unit: string, category: string) => {
    const key = `${unit}-${category}`;
    toggleFavorite(key);
  };

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilters(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const visibleCategories = [
    "All manners of take",
    "All Rifle Seasons",
    "All Archery Seasons",
    "All Muzzleloader Seasons",
    "All Private Land Only Seasons",
  ];

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    data.forEach((row: any) => {
      if (row.Category && row.Category !== 'NA') cats.add(row.Category);
    });
    return Array.from(cats).sort((a, b) => {
      const aIdx = visibleCategories.indexOf(a);
      const bIdx = visibleCategories.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [data]);
  const [minSuccessRate, setMinSuccessRate] = useState('');
  const [minPublicLand, setMinPublicLand] = useState('');

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [unitSearch, categoryFilters, minSuccessRate, minPublicLand, showFavoritesOnly]);

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      if (row.Category === 'NA') return false;
      if (showFavoritesOnly) {
        const key = `${row.Unit}-${row.Category}`;
        if (!favorites.has(key)) return false;
      }
      if (unitSearch) {
        const searchTerms = unitSearch.split(',').map(s => s.trim()).filter(Boolean);
        if (!searchTerms.some(term => row.Unit?.toLowerCase().includes(term.toLowerCase()))) return false;
      }
      if (categoryFilters.length > 0 && !categoryFilters.includes(row.Category)) return false;
      if (minSuccessRate && parseFloat(row['Percent Success'] || 0) < parseFloat(minSuccessRate)) return false;
      if (minPublicLand && parseFloat(row.percent_public || 0) < parseFloat(minPublicLand)) return false;
      return true;
    });
  }, [data, unitSearch, categoryFilters, minSuccessRate, minPublicLand, showFavoritesOnly, favorites]);

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

  if (loading) return <div className="p-8 text-center">Loading antelope harvest data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const baseColumns = ["Unit", "Category", "Bucks", "Antlerless", "Total Harvest", "Total Hunters"];
  const previousYearColumns = ["PS23", "PS22"];
  const successColumn = ["Percent Success"];
  const remainingColumns = ["percent_public", "Acres Public", "Hunters Density Per Public Sq. Mile"];
  
  const visibleColumns = showPreviousYearStats 
    ? [...baseColumns, "PS22", "PS23", ...successColumn, "threeyearsuccess", "slope", ...remainingColumns]
    : [...baseColumns, ...successColumn, ...remainingColumns];

  const headerLabels: Record<string, string> = {
    "Unit": "Unit",
    "Category": "Category",
    "Bucks": "Bucks",
    "Antlerless": "Doe/Fawn",
    "Total Harvest": "Total Harvest",
    "Total Hunters": "Hunters",
    "PS22": "2022 Success %",
    "PS23": "2023 Success %",
    "Percent Success": "2024 Success %",
    "percent_public": "Public %",
    "Acres Public": "Public Acres",
    "Hunters Density Per Public Sq. Mile": "Hunters/Public Sq. Mile"
  };

  const headerHelpText: Record<string, string> = {
    "Unit": "",
    "Category": "",
    "Bucks": "",
    "Antlerless": "",
    "Total Harvest": "",
    "Total Hunters": "",
    "Percent Success": "",
    "percent_public": "",
    "Acres Public": "",
    "Hunters Density Per Public Sq. Mile": ""
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
          <Label>Search Units</Label>
          <Input placeholder="e.g. 3, 10, 5" value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Min Success Rate %</Label>
          <Input type="number" placeholder="e.g. 30" value={minSuccessRate} onChange={(e) => setMinSuccessRate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Min Public Land %</Label>
          <Input type="number" placeholder="e.g. 50" value={minPublicLand} onChange={(e) => setMinPublicLand(e.target.value)} />
        </div>

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
          <Label>Category</Label>
          <div className="space-y-2">
            {(showMoreCategories ? allCategories : visibleCategories).map((cat, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox 
                  id={`ant-cat-${idx}`}
                  checked={categoryFilters.includes(cat)}
                  onCheckedChange={() => toggleCategoryFilter(cat)}
                />
                <Label htmlFor={`ant-cat-${idx}`} className="text-xs cursor-pointer">{cat}</Label>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setShowMoreCategories(!showMoreCategories)}
          >
            {showMoreCategories ? 'Show Less' : 'More'}
          </Button>
        </div>

          <Button variant="outline" className="w-full" onClick={() => {
            setUnitSearch(''); setCategoryFilters([]); setMinSuccessRate(''); setMinPublicLand('');
          }}>Clear Filters</Button>

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
            <p className="text-sm text-muted-foreground">{sortedData.length} units match</p>
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
              {showPreviousYearStats ? (
                <>
                  <tr>
                    <th className="border border-border p-2 text-left text-primary-foreground w-12" rowSpan={2}></th>
                    {baseColumns.map((col) => (
                      <th
                        key={col}
                        className="border border-border p-2 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground relative"
                        rowSpan={2}
                        onClick={() => handleSort(col)}
                      >
                        <TableHeaderHelp label="" helpText={headerHelpText[col]} />
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
                        className="border border-border p-2 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground relative"
                        rowSpan={2}
                        onClick={() => handleSort(col)}
                      >
                        <TableHeaderHelp label="" helpText={headerHelpText[col]} />
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
                        className="border border-border p-2 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground relative"
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          {col === "PS22" ? "2022" : col === "PS23" ? "2023" : col === "Percent Success" ? "2024" : col === "threeyearsuccess" ? "3-Year Average" : "Trend"}
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
                      className="border border-border p-2 text-left cursor-pointer hover:bg-primary/90 text-primary-foreground relative"
                      onClick={() => handleSort(col)}
                    >
                      <TableHeaderHelp label="" helpText={headerHelpText[col]} />
                      <div className="flex items-center gap-1">
                        {headerLabels[col] || col}
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
                const favKey = `${row.Unit}-${row.Category}`;
                const isFavorited = favorites.has(favKey);
                return (
                  <tr key={idx} className="group hover:bg-accent">
                    <td className="border border-border p-2 text-center">
                      <Star
                        className={`w-5 h-5 cursor-pointer ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        onClick={() => handleToggleFavorite(row.Unit, row.Category)}
                      />
                    </td>
                    {visibleColumns.map((col) => (
                    <td key={col} className="border border-border p-2">
                      {col === 'Unit' && row.onx && !isMobile ? (
                        <a href={row.onx} target="_blank" rel="noopener noreferrer" className="text-primary-dark group-hover:text-white hover:underline">
                          {row[col] ?? ''}
                        </a>
                      ) : col === 'Unit' ? (
                        <span className="text-primary-dark group-hover:text-white">{row[col] ?? ''}</span>
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
                        row[col] ?? ''
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
