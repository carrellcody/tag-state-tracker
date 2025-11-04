import { useState, useMemo, useEffect } from 'react';
import { useCsvData } from '@/hooks/useCsvData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

const ROWS_PER_PAGE = 100;

export function OTCElkTable() {
  const { data: harvestData, loading, error } = useCsvData('/data/elkHarvest25.csv');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [otcSeason, setOtcSeason] = useState('Archery Either Sex');
  const [unitSearch, setUnitSearch] = useState('');
  const [minSuccessRate, setMinSuccessRate] = useState('');
  const [minPublicLand, setMinPublicLand] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('otcElkFavorites');
    if (saved) setFavorites(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    localStorage.setItem('otcElkFavorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const toggleFavorite = (unit: string) => {
    const key = `${unit}-${otcSeason}`;
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(key)) {
        newFavs.delete(key);
      } else {
        newFavs.add(key);
      }
      return newFavs;
    });
  };

  const filteredData = useMemo(() => {
    return harvestData.filter((row: any) => {
      // Only show OTC units
      if (!row.OTC) return false;
      
      if (showFavoritesOnly) {
        const key = `${row.Unit}-${otcSeason}`;
        if (!favorites.has(key)) return false;
      }
      
      // Filter by OTC season - check if the season is present in the OTC value
      if (!row.OTC || !String(row.OTC).includes(otcSeason)) return false;
      
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
  }, [harvestData, otcSeason, unitSearch, minSuccessRate, minPublicLand, showFavoritesOnly, favorites]);

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

  if (loading) return <div className="p-8 text-center">Loading OTC elk data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const visibleColumns = ["Unit", "Bulls", "Total Antlerless Harvest", "Total Hunters", "Percent Success", "percent_public", "Acres Public", "Hunters Density Per Public Sq. Mile"];
  const headerLabels: Record<string, string> = {
    "Unit": "Unit",
    "Bulls": "Bulls",
    "Total Antlerless Harvest": "Antlerless",
    "Total Hunters": "Total Hunters",
    "Percent Success": "Success %",
    "percent_public": "Public %",
    "Acres Public": "Public Acres",
    "Hunters Density Per Public Sq. Mile": "Hunter Density/Square Mile (x1000)"
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
      <aside className="w-full lg:w-64 bg-card p-4 rounded-lg border space-y-4 overflow-y-auto">
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
          <Label>OTC Season</Label>
          <RadioGroup value={otcSeason} onValueChange={setOtcSeason}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Archery Either Sex" id="otc-archery-either" />
              <Label htmlFor="otc-archery-either">Archery Either Sex (Resident Only)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Archery Antlerless" id="otc-archery-antlerless" />
              <Label htmlFor="otc-archery-antlerless">Archery Antlerless (Resident Only)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Second Season Antlered" id="otc-second" />
              <Label htmlFor="otc-second">Second Season Antlered</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Third Season Antlered" id="otc-third" />
              <Label htmlFor="otc-third">Third Season Antlered</Label>
            </div>
          </RadioGroup>
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
            setOtcSeason('Archery Either Sex');
          }}
        >
          Clear Filters
        </Button>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{sortedData.length} OTC units match your criteria</p>
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-card relative">
            <thead className="sticky top-0 gradient-primary z-10">
              <tr>
                <th className="border border-border p-2 text-left text-primary-foreground w-12"></th>
                {visibleColumns.map((col) => (
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
            </thead>
            <tbody>
              {paginatedData.map((row: any, idx: number) => {
                const favKey = `${row.Unit}-${otcSeason}`;
                const isFavorited = favorites.has(favKey);
                return (
                  <tr key={idx} className="hover:bg-accent">
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

        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </main>
    </div>
  );
}