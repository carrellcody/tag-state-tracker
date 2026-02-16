

## Prevent CSV Caching Issues for End Users

### Problem
When CSV filenames change (e.g., from `25` to `26` versions), browsers may serve stale cached versions of old files. Since the filenames themselves changed this time, existing users won't have caching issues now -- but for future CSV updates where the filename stays the same, stale data could be served.

### Solution
Add a cache-busting version parameter to all CSV file paths across the application. This ensures browsers always fetch fresh data when you update the CSV contents.

### Changes

**1. Create a central CSV version constant** (`src/utils/csvVersion.ts`)
- Define a single `CSV_VERSION` string (e.g., `"v2"`) that gets appended as a query parameter to all CSV URLs
- When you update CSV data in the future, just bump this version number

**2. Update all 9 table components** to append `?v=${CSV_VERSION}` to their CSV paths:
- `AntelopeDrawTable.tsx` -- `/data/Fullant26Final.csv?v=2`
- `DeerDrawTable.tsx` -- `/data/FullDeer26Final.csv?v=2`
- `ElkDrawTable.tsx` -- `/data/Fullelk26Final.csv?v=2`
- `AntelopeHarvestTable.tsx` -- harvest CSV path
- `DeerHarvestTable.tsx` -- harvest CSV path
- `ElkHarvestTable.tsx` -- harvest CSV path
- `OTCAntelopeTable.tsx` -- OTC CSV path
- `OTCDeerTable.tsx` -- OTC CSV path
- `OTCElkTable.tsx` -- OTC CSV path

**3. Update the draw page titles** from "2025" to "2026" to match the new data:
- `AntelopeDraw.tsx` -- Update heading and SEO metadata
- `DeerDraw.tsx` -- Update heading and SEO metadata
- `ElkDraw.tsx` -- Update heading and SEO metadata

### How It Works
Browsers treat `/data/file.csv?v=2` as a different URL from `/data/file.csv?v=1`, so updating the version number forces a fresh download. This is a standard cache-busting technique.

### Future Workflow
Whenever you update CSV data, just change the version in the single `csvVersion.ts` file -- all tables will automatically fetch fresh data.

