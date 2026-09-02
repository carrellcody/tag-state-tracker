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

## Fix plan

1. **Cache CSVs in the client for the session.** Add a shared in-memory + `sessionStorage` cache in `src/hooks/useCsvData.ts`, keyed by filename plus the existing `CSV_VERSION`. Repeat visits to a table become instant, and back/forward navigation stops refetching.
2. **Let public files be cached by the CDN.** In `supabase/functions/serve-csv/index.ts`, return `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` for files in `PUBLIC_FILES` (Pronghorn tables, leftovers), keeping `private` only for gated files. This removes the round trip entirely for repeat loads of public data.
3. **Stream instead of buffering.** Return the storage object's body directly rather than `await data.text()`, so bytes start reaching the browser immediately instead of after the whole file is in function memory.
4. **Skip the redundant auth work.** Read the user id from the JWT claims once and run the admin-role and profile lookups in parallel instead of sequentially, cutting one round trip from every gated request.
5. **Parse without blocking the UI.** Enable Papa Parse's worker mode (or chunked parsing) in `useCsvData` so a large file no longer stalls rendering, and keep the loading skeleton visible until parsing completes.
6. **Measure before/after.** Load the Deer, Elk, and Leftovers pages and record the function response time and time-to-table for each so we can confirm the improvement rather than assume it.

## Technical notes

- Files touched: `src/hooks/useCsvData.ts`, `supabase/functions/serve-csv/index.ts`.
- No schema changes, no migrations, no compute resize.
- Cache invalidation stays tied to the existing `CSV_VERSION` value in `src/utils/csvVersion.ts`, so bumping it after an admin CSV upload continues to force fresh data everywhere.
- Gated files keep exactly the same access rules (sign-in, Pro, admin bypass); only public files gain shared caching.
