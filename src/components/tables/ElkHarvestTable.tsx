import { useState, useMemo } from 'react';
import { useCsvData } from '@/hooks/useCsvData';
import { useFavorites } from '@/hooks/useFavorites';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Star, Filter } from 'lucide-react';
import { TableWrapper } from './TableWrapper';
import { useIsMobile } from '@/hooks/use-mobile';

const ROWS_PER_PAGE = 50;

export function ElkHarvestTable() {
  const { data, loading, error } = useCsvData('/data/elkHarvest25.csv');
  const { favorites, toggleFavorite } = useFavorites('elk_harvest');
  const isMobile = useIsMobile();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showMobileFilters, setShowMobileFilters] = useState(true);
  
  const [unitSearch, setUnitSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All manners of take');
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleToggleFavorite = (unit: string, category: string) => {
    const key = `${unit}-${category}`;
    toggleFavorite(key);
  };

  const visibleCategories = [
    "All manners of take",
    "Antlered Second Rifle Seasons (No PLO or Either-sex tags included)",
    "Antlered Third Rifle Seasons (No PLO or Either-sex tags included)",
    "Antlered Fourth Rifle Seasons (No PLO or Either-sex tags included)",
    "All Archery Seasons",
    "Antlered Muzzleloader",
    "Antlerless Muzzleloader"
  ];

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    data.forEach((row: any) => {
      if (row.Category) cats.add(row.Category);
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
      if (categoryFilter && row.Category !== categoryFilter) return false;
      if (minSuccessRate && parseFloat(row['Percent Success'] || 0) < parseFloat(minSuccessRate)) return false;
      if (minPublicLand && parseFloat(row.percent_public || 0) < parseFloat(minPublicLand)) return false;
      return true;
    });
  }, [data, unitSearch, categoryFilter, minSuccessRate, minPublicLand, showFavoritesOnly, favorites]);

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

  if (loading) return <div className="p-8 text-center">Loading elk harvest data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const visibleColumns = ["Unit", "Category", "Bulls", "Total Antlerless Harvest", "Total Harvest", "Total Hunters", "Percent Success", "percent_public", "Acres Public", "Hunters Density Per Public Sq. Mile"];
  const headerLabels: Record<string, string> = {
    "Unit": "Unit",
    "Category": "Category",
    "Bulls": "Bulls",
    "Total Antlerless Harvest": "Antlerless",
    "Total Harvest": "Total",
    "Total Hunters": "Hunters",
    "Percent Success": "Success %",
    "percent_public": "Public %",
    "Acres Public": "Public Acres",
    "Hunters Density Per Public Sq. Mile": "Hunters/Public Sq. Mile"
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
          <Input placeholder="e.g. 10, 1, 15" value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Min Success Rate %</Label>
          <Input type="number" placeholder="e.g. 20" value={minSuccessRate} onChange={(e) => setMinSuccessRate(e.target.value)} />
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
          <Label>Category</Label>
          <RadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
            {(showMoreCategories ? allCategories : visibleCategories).map((cat, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={cat} id={`elk-cat-${idx}`} />
                <Label htmlFor={`elk-cat-${idx}`} className="text-xs">{cat}</Label>
              </div>
            ))}
          </RadioGroup>
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
            setUnitSearch(''); setCategoryFilter('All manners of take'); setMinSuccessRate(''); setMinPublicLand('');
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
                const favKey = `${row.Unit}-${row.Category}`;
                const isFavorited = favorites.has(favKey);
                return (
                  <tr key={idx} className="hover:bg-accent">
                    <td className="border border-border p-2 text-center">
                      <Star
                        className={`w-5 h-5 cursor-pointer ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        onClick={() => handleToggleFavorite(row.Unit, row.Category)}
                      />
                    </td>
                    {visibleColumns.map((col) => (
                    <td key={col} className="border border-border p-2">
                      {col === 'Unit' && row.onx ? (
                        <a href={row.onx} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {row[col] || ''}
                        </a>
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
