## Problem

The `/unit_map` page shows "Google Maps browser key is not configured" because the Google Maps Platform connector isn't linked to this project yet. The code expects `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`, which gets injected automatically once the connector is connected.

## Plan

1. Link the Lovable-managed Google Maps Platform connector to the project (no API key needed from you — Lovable provides it).
2. Restart the dev preview so the new env variable is picked up.
3. Verify the map loads at `/unit_map` with Colorado satellite imagery, GMU boundaries, and unit-number labels.

## Notes

- The managed key is referrer-restricted to `*.lovable.app` / `*.lovableproject.com`, so it will work in preview and on `tag-state-tracker.lovable.app`.
- On your custom domains (`tallotags.com`, `taggout.com`) the managed key will not work — you'd need your own Google Cloud API key with those domains in the referrer allowlist. Let me know if you want to set that up now or later.
- No code changes are required; `UnitMap.tsx` is already wired to the expected env variable.
