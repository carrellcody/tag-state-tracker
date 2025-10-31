import { useState, useMemo, useEffect } from 'react';
import { useCsvData } from '@/hooks/useCsvData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ROWS_PER_PAGE = 100;

export function AntelopeDrawTable() {
  const { data, loading, error } = useCsvData('/data/Fullant25Final.csv');
  const { data: harvestData } = useCsvData('/data/antHarvest25.csv');
  const { data: codePages } = useCsvData('/data/ant25code_pages.csv');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  const [unitSearch, setUnitSearch] = useState('');
  const [sexFilter, setSexFilter] = useState('all');
  const [seasonWeapons, setSeasonWeapons] = useState<string[]>(['Any']);
  const [hunterClass, setHunterClass] = useState('A_R');
  const [ploFilter, setPloFilter] = useState('all');
  const [rfwFilter, setRfwFilter] = useState('all');
  const [minPoints, setMinPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(20);
  const [showNoApplicants, setShowNoApplicants] = useState('no');

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
      if (row.Unit) map[row.Unit] = row;
    });
    return map;
  }, [harvestData]);

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      if (unitSearch) {
        const searchTerms = unitSearch.split(',').map(s => s.trim()).filter(Boolean);
        const units = String(row['Valid GMUs'] || '').split(',').map(u => u.trim());
        if (!searchTerms.some(term => units.some(unit => unit === term))) return false;
      }
      
      if (sexFilter !== 'all') {
        const sexMap: Record<string, string> = { 'Either': 'E', 'Male': 'M', 'Female': 'F' };
        if (row.Sex !== sexMap[sexFilter]) return false;
      }
      
      // Season/Weapon filter (checkboxes) - Antelope version
      if (!seasonWeapons.includes('Any')) {
        const sw = row.SeasonWeapon || '';
        const matchesFilter = seasonWeapons.some(filter => {
          if (filter === 'A') return sw.includes('A');
          if (filter === 'M') return sw.includes('M');
          if (filter === 'R') return sw.includes('R');
          if (filter === 'Other') {
            return !sw.includes('A') && !sw.includes('M') && !sw.includes('R');
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
      const dol = parseFloat(row.Drawn_out_level || 0);
      if (dol < minPoints || dol > maxPoints) return false;
      
      // No applicants filter
      if (showNoApplicants === 'no' && row.NoApps === 'Yes') return false;
      
      return true;
    });
  }, [data, unitSearch, sexFilter, seasonWeapons, hunterClass, ploFilter, rfwFilter, minPoints, maxPoints, showNoApplicants]);

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

  if (loading) return <div className="p-8 text-center">Loading antelope draw data...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error}</div>;

  const visibleColumns = ["Tag", "Valid GMUs", "Drawn_out_level", "Chance_with_First_choice", "Chance_at_DOL", "Sex", "Weapon", "Notes"];
  const headerLabels: Record<string, string> = {
    "Tag": "Hunt Code",
    "Valid GMUs": "Valid Units",
    "Drawn_out_level": "Min Points",
    "Chance_with_First_choice": "% 1st Choice",
    "Chance_at_DOL": "% at Draw",
    "Sex": "Sex",
    "Weapon": "Weapon",
    "Notes": "Notes"
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <aside className="w-full lg:w-64 bg-card p-4 rounded-lg border space-y-4 overflow-y-auto">
        <h3 className="font-semibold text-lg">Filters</h3>
        
        <div className="space-y-2">
          <Label>Search Units</Label>
          <Input placeholder="e.g. 3, 5, 10" value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Minimum Preference Points: {minPoints}</Label>
          <input type="range" min="0" max="20" value={minPoints} onChange={(e) => setMinPoints(Number(e.target.value))} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label>Maximum Preference Points: {maxPoints}</Label>
          <input type="range" min="0" max="20" value={maxPoints} onChange={(e) => setMaxPoints(Number(e.target.value))} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label>Hunter Class</Label>
          <RadioGroup value={hunterClass} onValueChange={setHunterClass}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A_R" id="ant-class-ar" />
              <Label htmlFor="ant-class-ar">Resident Adult</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A_NR" id="ant-class-anr" />
              <Label htmlFor="ant-class-anr">Non-Resident Adult</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Y_R" id="ant-class-yr" />
              <Label htmlFor="ant-class-yr">Resident Youth</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Y_NR" id="ant-class-ynr" />
              <Label htmlFor="ant-class-ynr">Non-Resident Youth</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="L_U" id="ant-class-lu" />
              <Label htmlFor="ant-class-lu">Landowner Unrestricted</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="L_R" id="ant-class-lr" />
              <Label htmlFor="ant-class-lr">Landowner Restricted</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>PLO Tags</Label>
          <RadioGroup value={ploFilter} onValueChange={setPloFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="ant-plo-all" />
              <Label htmlFor="ant-plo-all">Show all tags</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="only" id="ant-plo-only" />
              <Label htmlFor="ant-plo-only">Show only PLO tags</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="ant-plo-none" />
              <Label htmlFor="ant-plo-none">Don't show PLO tags</Label>
            </div>
          </RadioGroup>
        </div>

        {hunterClass !== 'A_NR' && hunterClass !== 'Y_NR' && (
          <div className="space-y-2">
            <Label>RFW Tags</Label>
            <RadioGroup value={rfwFilter} onValueChange={setRfwFilter}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="ant-rfw-all" />
                <Label htmlFor="ant-rfw-all">Show all tags</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="only" id="ant-rfw-only" />
                <Label htmlFor="ant-rfw-only">Show only RFW tags</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="ant-rfw-none" />
                <Label htmlFor="ant-rfw-none">Don't show RFW tags</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="space-y-2">
          <Label>Sex</Label>
          <RadioGroup value={sexFilter} onValueChange={setSexFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="ant-sex-all" />
              <Label htmlFor="ant-sex-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Either" id="ant-sex-either" />
              <Label htmlFor="ant-sex-either">Either</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Male" id="ant-sex-male" />
              <Label htmlFor="ant-sex-male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Female" id="ant-sex-female" />
              <Label htmlFor="ant-sex-female">Female</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Weapon/Season</Label>
          <div className="space-y-1">
            {[
              { value: 'A', label: 'Archery' },
              { value: 'M', label: 'Muzzleloader' },
              { value: 'R', label: 'Rifle' },
              { value: 'Other', label: 'Other' },
              { value: 'Any', label: 'Any' }
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`ant-season-${value}`}
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
                <Label htmlFor={`ant-season-${value}`} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Show tags with no applicants?</Label>
          <RadioGroup value={showNoApplicants} onValueChange={setShowNoApplicants}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="ant-no-apps-yes" />
              <Label htmlFor="ant-no-apps-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="ant-no-apps-no" />
              <Label htmlFor="ant-no-apps-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <Button variant="outline" className="w-full" onClick={() => {
          setUnitSearch(''); setSexFilter('all'); setSeasonWeapons(['Any']); 
          setHunterClass('A_R'); setPloFilter('all'); setRfwFilter('all'); setMinPoints(0); setMaxPoints(20); setShowNoApplicants('no');
        }}>Clear Filters</Button>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{sortedData.length} tags match</p>
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-card">
            <thead className="sticky top-0 bg-secondary z-10">
              <tr>
                {visibleColumns.map((col) => (
                  <th key={col} className="border border-border p-2 text-left cursor-pointer hover:bg-secondary-hover" onClick={() => handleSort(col)}>
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
                const pageNum = huntCodeMap[huntCode];
                const pdfUrl = "https://cpw.widen.net/s/abcdefghi/postdrawrecapreport_antelope-25";
                const harvestUnits = String(row.harvestunit || '').split(',').map(u => u.trim()).filter(Boolean);

                return (
                  <>
                    <tr key={idx} className="hover:bg-accent cursor-pointer" onClick={() => toggleRow(idx)}>
                      {visibleColumns.map((col) => (
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
                          ) : (col === 'Valid GMUs' || col === 'Notes') ? (
                            <span title={row[col] || ''}>{row[col] || ''}</span>
                          ) : (row[col] || '')}
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
                                    <td className="border p-1">
                                      {harvestRow.onx ? (
                                        <a href={harvestRow.onx} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                          {harvestRow.Unit}
                                        </a>
                                      ) : (
                                        harvestRow.Unit
                                      )}
                                    </td>
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
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
        </div>
      </main>
    </div>
  );
}