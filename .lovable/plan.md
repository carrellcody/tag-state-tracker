# Speed up data-page loads

## First, your usage question

Other projects in your account do not share resources with this one. Each project gets its own backend instance, so the projects you created elsewhere cannot slow this app down.

I checked this project's backend health directly:

- Database and connection pooler: up, 0 restarts
- Memory: 29% used; connections 10 of 90 (low); pool clients 1 of 400 (low)
- Data disk: 15% used; database size 836 MB
- Slowest queries: all sub-millisecond on average (the heaviest is a profile subscription update at 1.3 ms mean)

So the backend is not overloaded, and a bigger instance would not help. The slowness is in how the data pages fetch their CSV files.

## What is actually slow

Every table page loads its data through the `serve-csv` backend function:

1. The browser waits for the auth session, then calls the function.
2. The function cold-starts, checks auth/subscription (two extra database lookups for gated files), downloads the whole CSV from storage into memory, converts it to text, and returns it.
3. The response is marked `private, max-age=300`, so it is never cached by the CDN and public files get no shared caching at all.
4. On the client, nothing is cached between page navigations — going Deer -> Elk -> back to Deer refetches and re-parses everything from scratch.
5. Parsing happens synchronously on the main thread, so large files also freeze the UI briefly.

With files this size, that stack means several seconds on each visit, and it gets worse as the CSVs grow.

## Fix plan (approved scope)

1. **Cache CSVs in memory only, for the current page load.** Add a module-level in-memory cache in `src/hooks/useCsvData.ts`, keyed by filename plus the existing `CSV_VERSION`. Nothing is written to `sessionStorage` or `localStorage`, and nothing survives a page refresh, so a user can never be served yesterday's table. This only prevents refetching the same file while the user clicks between pages in one visit — the exact staleness problem we fixed before stays fixed. Bumping `CSV_VERSION` after an admin upload also changes the key, so even within one visit new data wins.
2. **Skipped by request.** Public files keep `Cache-Control: private` — no CDN or shared caching for any file.
3. **Stream instead of buffering.** In `supabase/functions/serve-csv/index.ts`, return the storage object's body directly rather than `await data.text()`, so bytes start reaching the browser immediately instead of after the whole file is buffered in function memory.
4. **Skip the redundant auth work.** Read the user id from the JWT claims once, then run the admin-role and profile lookups in parallel instead of sequentially, cutting a round trip from every gated request.
5. **Parse without blocking the UI.** Enable Papa Parse's worker mode in `useCsvData` so a large file no longer stalls rendering, with the loading skeleton visible until parsing completes.
6. **Measure before/after.** Load the Deer, Elk, and Leftovers pages and record function response time and time-to-table so the improvement is confirmed, not assumed.

## Technical notes

- Files touched: `src/hooks/useCsvData.ts`, `supabase/functions/serve-csv/index.ts`.
- No schema changes, no migrations, no compute resize.
- Cache scope: a plain JS `Map` in the hook's module, cleared on every full page load. Key = `filename + CSV_VERSION`. No persistent storage is involved anywhere in this change.
- All access rules stay identical (public / signed-in / Pro / admin bypass) and all responses stay `private`.

