

## Fix: Elk Draw Subtable "Antlerless" Column

**Root Cause:** The elk harvest CSV (`elkHarvest25.csv`) has a column named `Antlerless`, but the code in `ElkDrawTable.tsx` references `harvestRow['Total Antlerless Harvest']`, which does not exist.

**Fix:** Change the column accessor on line 877 of `ElkDrawTable.tsx` from:
```
harvestRow['Total Antlerless Harvest']
```
to:
```
harvestRow['Antlerless']
```

This is a one-line change that will correctly pull the Antlerless harvest data from the CSV.

