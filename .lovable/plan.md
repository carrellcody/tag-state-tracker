## Diagnosis

The published bundle at `tallotags.com` still embeds the **managed** Google Maps browser key `AIzaSyBmvJph4LmrbtW7skeczzpBIyb9WWzFKo4`. That key is restricted to `*.lovable.app` referrers, so on `tallotags.com` Google returns "This page didn't load Google Maps correctly."

Evidence:
- `.env` still contains `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY="AIzaSyBmvJph4LmrbtW7skeczzpBIyb9WWzFKo4"` — the managed key value.
- The live JS bundle (`assets/index-DFBN7KEb.js`) contains only that same key.
- The currently linked Google Maps connection appears to still be the managed one (the browser key value in `.env` did not change after the previous connect step).

Since this is a client-side Vite app, the browser key is inlined at build time, so we need the correct key in `.env` **and** a republish.

## Plan

1. **Disconnect the current Google Maps connection** (`standard_connectors--disconnect` on `std_01ktc60sjyfbd80eaee6h4b1zw`) so the stale managed key stops populating `.env`.
2. **Connect a fresh Google Maps connection** (`standard_connectors--connect` with `google_maps`) and, in the connect card, choose **Create new / custom** and paste the user's own Google API key (`@secret:GOOGLE_API_KEY`) — not the managed option. This should overwrite `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` in `.env` with the user's key.
3. **Verify** `.env` now shows the user's key (not `AIzaSyBmvJph4LmrbtW7skeczzpBIyb9WWzFKo4`).
4. **Republish** the site so the new key is baked into the JS bundle. After deploy, confirm `tallotags.com/unit_map` renders.

## Prerequisites the user must confirm in Google Cloud Console

On the API key referenced by `@secret:GOOGLE_API_KEY`, the HTTP-referrer allowlist must include:

- `https://tallotags.com/*`
- `https://*.tallotags.com/*`

And these APIs must be enabled on the same project:

- Maps JavaScript API
- Places API (New) (optional, only if browser autocomplete is used)

No changes are needed for `taggout.com` since you're not using it.

## No code changes

`src/pages/UnitMap.tsx` already reads `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`, so once `.env` is refreshed and the app is republished the map will render on the custom domain.
