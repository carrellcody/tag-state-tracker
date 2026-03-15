

## Plan: Move CSVs to Private Storage + Serve via Edge Function

### Overview
Move all CSV files from `public/data/` into a private storage bucket, create an edge function to serve them to authenticated users, and update the `useCsvData` hook to fetch through the edge function.

### Steps

**1. Create private storage bucket via SQL migration**
- Create a `csv-data` bucket with `public = false`
- Add RLS policy allowing only authenticated users to read from it

**2. Upload CSV files to the private bucket**
- All 19 CSV files from `public/data/` need to be uploaded to the `csv-data` bucket
- You'll need to do this manually through the backend storage UI after the bucket is created — I'll guide you through it

**3. Create `serve-csv` edge function**
- Validates the user's auth token
- Accepts a `filename` query parameter
- Validates filename against an allowlist of known CSV files (prevents path traversal)
- Fetches the file from the private `csv-data` bucket using the service role key
- Returns the raw CSV content with appropriate headers
- No subscription check — all authenticated users can access (tables already handle access gating)

**4. Update `useCsvData` hook**
- Instead of using PapaParse's `download: true` with a static path, fetch from the edge function URL with the user's auth token in the Authorization header
- Parse the response text with PapaParse locally
- Fall back gracefully if not authenticated

**5. Delete CSV files from `public/data/`**
- Remove all `.csv` files from the public directory
- Keep the `public/data/` folder if needed for non-sensitive assets, or remove it entirely

**6. Update `supabase/config.toml`**
- Add `[functions.serve-csv]` with `verify_jwt = false` (we validate manually in the function to return proper error messages)

### Files to create/modify
| File | Action |
|------|--------|
| SQL migration | Create `csv-data` private bucket + RLS |
| `supabase/functions/serve-csv/index.ts` | New edge function |
| `src/hooks/useCsvData.ts` | Update to fetch from edge function with auth |
| `public/data/*.csv` | Delete all 19 CSV files |

### Performance notes
- The edge function adds ~100-300ms on cold start, negligible on warm calls
- Browser caching via `Cache-Control` headers will make repeat visits fast
- PapaParse still handles parsing client-side, so table rendering speed is unchanged

### Workflow impact
- You'll continue pushing CSV files to GitHub as before, but they'll live outside `public/` (e.g., in a `data/` folder at root) for version control
- When you want to update live data, you'll upload the new CSV to the private storage bucket — I can build an admin upload page for this later if you'd like

