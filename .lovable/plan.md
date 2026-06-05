## /unit_map page

A new public page that shows Colorado satellite imagery with Game Management Unit (GMU) boundaries overlaid, and the unit number labeled at the center of each unit. Users can pan and zoom.

### Boundary data — what to send

Please zip and upload your shapefile bundle. A shapefile is actually a set of files that must travel together:

- `units.shp` (geometry)
- `units.dbf` (attributes — needs a column with the unit number, e.g. `GMUID` or `UNIT`)
- `units.shx` (index)
- `units.prj` (projection — important so I can reproject to WGS84/lat-lon for the web map)
- optional: `.cpg`

I'll convert that to a single optimized **GeoJSON** file (reprojected to EPSG:4326, simplified to keep the file small/fast), commit it under `public/data/colorado_gmu.geojson`, and load it client-side. If you happen to already have a GeoJSON export, send that instead and we skip the conversion.

Before sending, please tell me the **exact name of the attribute column that holds the unit number** so the labels render correctly.

### Page behavior

- Route: `/unit_map`, public (no auth gate), added to `App.tsx` above the catch-all.
- Google Maps JS API loaded via the existing Google Maps connector browser key (`VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`), async with `callback=initMap`, no `mapId`.
- Map initialized at Colorado center (~39.55, -105.78), zoom 7, `mapTypeId: 'hybrid'` (satellite + road/place labels). Standard zoom/pan controls enabled.
- GeoJSON loaded via `map.data.loadGeoJson('/data/colorado_gmu.geojson')`.
- Boundary style: semi-transparent fill, solid stroke in the brand mid-green (`#598749`), 1.5–2px. Hover state thickens the stroke.
- Unit number labels: for each feature, compute a label point (use `turf.pointOnFeature` or a simple centroid for convex units) and place a `google.maps.Marker` with a transparent icon and a styled `label` showing the unit number. Labels are kept readable with a white text-shadow / outline.
- Optional small refinement: hide labels below zoom 7 to avoid clutter (toggle marker visibility on `zoom_changed`).
- Click a unit → info window with the unit number (room to add more later).

### Technical section

Files to add/change:

- `src/pages/UnitMap.tsx` — the page component. Loads the Maps JS API once via a small loader effect, defines `window.initMap`, creates the map, loads the GeoJSON, styles features, generates centroid markers from the loaded features (inside the `addfeature` data event), wires click handler.
- `src/App.tsx` — import `UnitMap` and add `<Route path="/unit_map" element={<UnitMap />} />` above the `*` route.
- `public/data/colorado_gmu.geojson` — converted boundary data (added once you upload the shapefile).
- Add `@turf/turf` (or just `@turf/centroid` + `@turf/point-on-feature`) for reliable label placement inside concave polygons.

No backend, edge function, or DB changes — the GeoJSON is static and the map runs entirely client-side using the already-configured Google Maps connector.

### What I need from you to proceed

1. Zip and upload the shapefile bundle (`.shp`, `.dbf`, `.shx`, `.prj`, optional `.cpg`).
2. The attribute column name that holds the unit number.
3. Confirm you'd like me to also link `/unit_map` from the nav, or leave it as a direct URL only for now.
