## Problem

The Hunt Code link disappeared on all draw tables after uploading the new `ant26code_pages.csv` / `elk26code_pages.csv` / `deer26code_pages.csv`. The link only renders when `huntCodeMap[row.Tag]` returns a truthy `Page` — so the lookup is returning empty for every row.

The current lookup is strict:

```ts
codePages.forEach((row) => {
  if (row.HuntCode && row.Page) map[row.HuntCode] = row.Page;
});
// later: const pageNum = huntCodeMap[row.Tag];
```

Even though you confirmed the headers are `HuntCode` and `Page`, the lookup can still silently fail from any of:
- whitespace / casing differences between `row.Tag` in the draw CSV and `HuntCode` in the code_pages CSV
- a Windows BOM or non-breaking space inside data cells (we strip headers but not values)
- a numeric `Page` column being read as `0` for some rows (falsy)
- a delimiter mismatch (tab vs comma) leaving the row as one big field

## Plan

1. **Make the lookup tolerant** in all three draw tables (`ElkDrawTableNew.tsx`, `AntelopeDrawTableNew.tsx`, `DeerDrawTableNew.tsx`):
   - Normalize keys with `String(row.HuntCode ?? '').replace(/\uFEFF/g,'').replace(/\u00A0/g,' ').trim().toUpperCase()`.
   - Accept any non-empty `Page` (including `"0"` if present) by checking `!= null && String(...).trim() !== ''`.
   - Look up using the same normalization on `row.Tag`.
   - Render the link whenever `pageNum` is a non-empty string.

2. **Add a one-time dev console log** in each table (gated on `import.meta.env.DEV`) printing:
   - `codePages.length`, the keys of the first row, and the size of `huntCodeMap`.
   This will immediately reveal if the file is parsing as 0 rows, missing the expected columns, or producing an empty map — and we can remove it once confirmed working.

3. **Bump `CSV_VERSION`** in `src/utils/csvVersion.ts` from `"3"` to `"4"` so the edge function's 5-minute cache and any browser cache are bypassed for the new files.

No backend, schema, or styling changes. Scope is limited to the three Draw `*New.tsx` tables and the CSV version constant.

## Verification

After the change, open the Elk/Pronghorn/Deer Draw pages and confirm:
- Hunt Code cells render as clickable links again.
- The dev console shows a non-zero `huntCodeMap` size and the expected first-row keys (`HuntCode`, `Page`).

If the map is still empty after normalization, the console log will tell us exactly what's in the CSV so we can adjust (e.g., a renamed column or wrong delimiter).