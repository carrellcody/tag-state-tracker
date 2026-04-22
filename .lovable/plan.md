

## Issue

The OTCDeerNew table's "DAU Deer Density" and "DAU Buck Density" columns are blank because the code references column keys that don't exist in the CSV.

The CSV header (`DeerDraw25Subtable.csv`) actually contains:
- `DAUAnimalDensity`
- `DAUBuckDensity`

But `OTCDeerTableNew.tsx` (and `DeerUnitsTable.tsx`) reference:
- `AnimalDAUDensity` ❌
- `BuckDensity` ❌

So `row[col]` returns `undefined` and the cell renders empty.

## Fix

Update the column keys in two files to match the actual CSV headers.

### `src/components/tables/OTCDeerTableNew.tsx`
- `visibleColumns`: replace `'AnimalDAUDensity'` → `'DAUAnimalDensity'` and `'BuckDensity'` → `'DAUBuckDensity'`.
- `headerLabels`: rename keys accordingly (labels stay the same: "DAU Deer Density (Population/Acres)" and "DAU Buck Density (Deer Density x Buck:Doe ratio)").

### `src/components/tables/DeerUnitsTable.tsx`
- `COLUMNS`: rename `AnimalDAUDensity` → `DAUAnimalDensity` and `BuckDensity` → `DAUBuckDensity` (labels unchanged).
- `formatCell`: update the matching `if (key === ...)` numeric-formatting branch to the new keys so values display with `.toFixed(4)`.

### Note on numeric formatting
Raw values are tiny (e.g. `8.376e-4`). After the fix, OTCDeerTableNew will display them in scientific notation since it renders `row[col]` directly. If you want them shown like DeerUnitsTable does (`0.0008`), I can also apply a `.toFixed(4)` formatter in OTCDeerTableNew — let me know if you want that included.

