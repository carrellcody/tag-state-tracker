import { useState, useMemo } from 'react';
import { useCsvData } from '@/hooks/useCsvData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ROWS_PER_PAGE = 100;

export function DeerDrawTable() {
  const { data, loading, error } = useCsvData('/data/FullDeer25Final.csv');
  const { data: harvestData } = useCsvData('/data/DeerHarvest25.csv');
  const { data: codePages } = useCsvData('/data/deer25code_pages.csv');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  // Filters
  const [unitSearch, setUnitSearch] = useState('');
  const [sexFilter, setSexFilter] = useState('all');
  const [weaponFilter, setWeaponFilter] = useState('all');
  const [minPublicLand, setMinPublicLand] = useState('');
  const [maxDrawLevel, setMaxDrawLevel] = useState('');

  // Build hunt code to page mapping
  const huntCodeMap = useMemo(() => {
    const map: Record<string, string> = {};
    codePages.forEach((row: any) => {
      if (row.HuntCode && row.Page) {
        map[row.HuntCode] = row.Page;
      }
    });
    return map;
  }, [codePages]);

  // Build harvest lookup by unit
  const harvestByUnit = useMemo(() => {
    const map: Record<string, any> = {};
    harvestData.forEach((row: any) => {
      if (row.Unit) {
        map[row.Unit] = row;
      }
    });
    return map;
  }, [harvestData]);

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      if (unitSearch && !row['Valid GMUs']?.toLowerCase().includes(unitSearch.toLowerCase())) {
        return false;
      }
      if (sexFilter !== 'all' && row.Sex !== sexFilter) {
        return false;
      }
      if (weaponFilter !== 'all' && row.Weapon !== weaponFilter) {
        return false;
      }
      if (minPublicLand && parseFloat(row.Public_Percent || 0) < parseFloat(minPublicLand)) {
        return false;
      }
      if (maxDrawLevel && parseFloat(row.Drawn_out_level || 99) > parseFloat(maxDrawLevel)) {
        return false;
      }
      return true;
    });
  }, [data, unitSearch, sexFilter, weaponFilter, minPublicLand, maxDrawLevel]);

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

  if (loading) return <div className="p-8 text-center">Loading deer draw data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const visibleColumns = ["Tag", "Valid GMUs", "Drawn_out_level", "Chance_with_First_choice", "Chance_at_DOL", "Sex", "Weapon", "Notes"];
  const headerLabels: Record<string, string> = {
    "Tag": "Hunt Code",
    "Valid GMUs": "Valid Units",
    "Drawn_out_level": "Min Points to Draw",
    "Chance_with_First_choice": "% with 1st Choice",
    "Chance_at_DOL": "% at Draw Level",
    "Sex": "Sex",
    "Weapon": "Weapon",
    "Notes": "Notes"
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Sidebar Filters */}
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
          <Label>Min Public Land %</Label>
          <Input
            type="number"
            placeholder="e.g. 50"
            value={minPublicLand}
            onChange={(e) => setMinPublicLand(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Max Draw Level</Label>
          <Input
            type="number"
            placeholder="e.g. 5"
            value={maxDrawLevel}
            onChange={(e) => setMaxDrawLevel(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Sex</Label>
          <RadioGroup value={sexFilter} onValueChange={setSexFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="sex-all" />
              <Label htmlFor="sex-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Either" id="sex-either" />
              <Label htmlFor="sex-either">Either</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Male" id="sex-male" />
              <Label htmlFor="sex-male">Male</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Weapon</Label>
          <RadioGroup value={weaponFilter} onValueChange={setWeaponFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="weapon-all" />
              <Label htmlFor="weapon-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Rifle" id="weapon-rifle" />
              <Label htmlFor="weapon-rifle">Rifle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Muzzleloader" id="weapon-muzz" />
              <Label htmlFor="weapon-muzz">Muzzleloader</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Archery" id="weapon-arch" />
              <Label htmlFor="weapon-arch">Archery</Label>
            </div>
          </RadioGroup>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            setUnitSearch('');
            setSexFilter('all');
            setWeaponFilter('all');
            setMinPublicLand('');
            setMaxDrawLevel('');
          }}
        >
          Clear Filters
        </Button>
      </aside>

      {/* Main Table */}
      <main className="flex-1 overflow-auto">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{sortedData.length} tags match your criteria</p>
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
              {paginatedData.map((row: any, idx: number) => {
                const isExpanded = expandedRow === idx;
                const huntCode = row.Tag;
                const pageNum = huntCodeMap[huntCode];
                const pdfUrl = "https://cpw.widen.net/s/fm5zxrbhwz/postdrawrecapreport_deer-25_05102025_1540";
                const harvestUnits = String(row.harvestunit || '').split(',').map(u => u.trim()).filter(Boolean);

                return (
                  <>
                    <tr key={idx} className="hover:bg-accent cursor-pointer" onClick={() => toggleRow(idx)}>
                      {visibleColumns.map((col) => (
                        <td key={col} className="border border-border p-2">
                          {col === 'Tag' ? (
                            <div className="flex items-center gap-2">
                              <span>{isExpanded ? '▼' : '▶'}</span>
                              {pageNum ? (
                                <a
                                  href={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${pdfUrl}.pdf#page=${pageNum}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {huntCode}
                                </a>
                              ) : (
                                huntCode
                              )}
                            </div>
                          ) : (
                            row[col] || ''
                          )}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && harvestUnits.length > 0 && (
                      <tr>
                        <td colSpan={visibleColumns.length} className="border border-border p-4 bg-muted">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-secondary">
                                <th className="border p-1">Unit</th>
                                <th className="border p-1">Bucks</th>
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
                                    <td className="border p-1">{harvestRow.Unit}</td>
                                    <td className="border p-1">{harvestRow.Bucks}</td>
                                    <td className="border p-1">{harvestRow.Antlerless}</td>
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
                  </>
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
