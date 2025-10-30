import { useState, useMemo } from 'react';
import { useCsvData } from '@/hooks/useCsvData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ROWS_PER_PAGE = 100;

export function DeerHarvestTable() {
  const { data, loading, error } = useCsvData('/data/DeerHarvest25.csv');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [unitSearch, setUnitSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minSuccessRate, setMinSuccessRate] = useState('');
  const [minPublicLand, setMinPublicLand] = useState('');

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      if (unitSearch && !row.Unit?.toLowerCase().includes(unitSearch.toLowerCase())) {
        return false;
      }
      if (categoryFilter !== 'all' && row.Category !== categoryFilter) {
        return false;
      }
      if (minSuccessRate && parseFloat(row['Percent Success'] || 0) < parseFloat(minSuccessRate)) {
        return false;
      }
      if (minPublicLand && parseFloat(row.percent_public || 0) < parseFloat(minPublicLand)) {
        return false;
      }
      return true;
    });
  }, [data, unitSearch, categoryFilter, minSuccessRate, minPublicLand]);

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

  if (loading) return <div className="p-8 text-center">Loading deer harvest data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const visibleColumns = ["Unit", "Category", "Bucks", "Antlerless", "Total Harvest", "Total Hunters", "Percent Success", "percent_public", "Hunters Density Per Sq. Mile"];
  const headerLabels: Record<string, string> = {
    "Unit": "Unit",
    "Category": "Category",
    "Bucks": "Bucks",
    "Antlerless": "Antlerless",
    "Total Harvest": "Total Harvest",
    "Total Hunters": "Total Hunters",
    "Percent Success": "Success %",
    "percent_public": "Public %",
    "Hunters Density Per Sq. Mile": "Hunters/Sq Mi"
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <aside className="w-full lg:w-64 bg-card p-4 rounded-lg border space-y-4 overflow-y-auto">
        <h3 className="font-semibold text-lg">Filters</h3>
        
        <div className="space-y-2">
          <Label>Search Units</Label>
          <Input
            placeholder="e.g. 201"
            value={unitSearch}
            onChange={(e) => setUnitSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Min Success Rate %</Label>
          <Input
            type="number"
            placeholder="e.g. 20"
            value={minSuccessRate}
            onChange={(e) => setMinSuccessRate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Min Public Land %</Label>
          <Input
            type="number"
            placeholder="e.g. 50"
            value={minPublicLand}
            onChange={(e) => setMinPublicLand(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <RadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="cat-all" />
              <Label htmlFor="cat-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="High Country" id="cat-high" />
              <Label htmlFor="cat-high">High Country</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Plains" id="cat-plains" />
              <Label htmlFor="cat-plains">Plains</Label>
            </div>
          </RadioGroup>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            setUnitSearch('');
            setCategoryFilter('all');
            setMinSuccessRate('');
            setMinPublicLand('');
          }}
        >
          Clear Filters
        </Button>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{sortedData.length} units match</p>
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-card">
            <thead className="sticky top-0 bg-secondary z-10">
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={col}
                    className="border border-border p-2 text-left cursor-pointer hover:bg-secondary-hover"
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
              {paginatedData.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-accent">
                  {visibleColumns.map((col) => (
                    <td key={col} className="border border-border p-2">
                      {row[col] || ''}
                    </td>
                  ))}
                </tr>
              ))}
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
