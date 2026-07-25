## Plan

1. **Replace the currently linked Google Maps connection**
   - The published page is still loading the restricted key in the Maps script, and Google returns `RefererNotAllowedMapError` for `https://tallotags.com/unit_map`.
   - The workspace now has an unlinked custom connection named **Cody's Google Maps Platform** and a different Google Maps connection currently linked to the project.
   - I’ll unlink the currently linked connection and link the custom one so the app builds with your custom-domain key.

2. **Verify the frontend is reading the new browser key env var**
   - Confirm `UnitMap.tsx` continues to load Maps from `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` and no stale key is hardcoded.
   - If needed, adjust only the map loader fallback/error handling so failures show a clear message instead of endless “Loading map…”.

3. **Fix the GeoJSON ring error seen in the live console**
   - The live page also reports: `first and last positions are not equal` while loading map data.
   - I’ll validate the map GeoJSON files and repair any unclosed polygon rings so the public land / GMU overlays don’t break after the API key issue is fixed.

4. **Republish and verify the live site**
   - Publish a new build so the new browser key is baked into the production bundle.
   - Re-check `https://tallotags.com/unit_map` and confirm the Maps script no longer uses the old restricted key and the map renders successfully.