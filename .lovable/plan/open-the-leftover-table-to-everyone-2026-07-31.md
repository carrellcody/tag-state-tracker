# Open the leftover table to everyone

Anyone visiting `/leftovers` will see the full leftover tag table and filters, no account needed. Tag Alerts stay Pro-only exactly as they are today.

## Changes

1. **Backend CSV access** — `leftovers26.csv` currently requires a signed-in user in the `serve-csv` function. Move it to the public list so it loads without a session.
2. **Leftovers page** — remove the "Sign up for a free account to view the leftover tag list" gate so the table always renders; the CSV fetch no longer depends on being signed in.
3. **Tag Alerts** — untouched. Non-Pro users still see the greyed-out button and the Pro upgrade popup with promo code 50TALLO.

## Technical notes

- `supabase/functions/serve-csv/index.ts`: add `leftovers26.csv` to `PUBLIC_FILES`, remove it from `SIGNED_IN_FILES`; redeploy the function.
- `src/pages/Leftovers.tsx`: drop the `isSignedIn` branch around the table and load the CSV URL unconditionally.
