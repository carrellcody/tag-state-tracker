Add a public-lands overlay to the Colorado GMU unit map using the uploaded `PADUS4_1Fee_StateCO.kmz`. The overlay will shade National Forest green, BLM yellow, and State Land blue.

## What I found in the file

The KMZ contains a single KML document with 6,582 placemarks. Each placemark has an HTML description table with these relevant fields:

| Field | Example values |
|-------|---------------|
| `Own_Name` | `BLM`, `USFS`, `SFW`, `SPR`, `SLB`, `NPS`, `FWS`, etc. |
| `d_Own_Name` | `Bureau of Land Management`, `Forest Service`, `State Fish and Wildlife`, etc. |
| `Own_Type` / `d_Own_Type` | `FED` / `Federal`, `STAT` / `State`, `LOC` / `Local Government`, etc. |
| `Des_Tp` / `d_Des_Tp` | `NF` / `National Forest`, `NP` / `National Park`, `SP` / `State Park`, etc. |

Proposed mapping for the overlay:

- **National Forest** → green: `Des_Tp === "NF"` OR `d_Des_Tp === "National Forest"` OR `Own_Name === "USFS"`
- **BLM** → yellow: `Own_Name === "BLM"` OR `d_Own_Name === "Bureau of Land Management"`
- **State Land** → blue: `Own_Type === "STAT"` OR `d_Own_Type === "State"`

If you want different definitions (e.g., only State Parks in blue, or include National Parks), let me know.

## Plan

1. **Convert and prepare the overlay data**
   - Extract `doc.kml` from the KMZ.
   - Convert KML → GeoJSON (using GDAL via `nix run nixpkgs#gdal`).
   - Filter the GeoJSON to keep only features matching National Forest, BLM, or State Land definitions.
   - Simplify geometries to keep the file small enough for web rendering (target < 5 MB; the raw KML is ~90 MB).
   - Add a `Land_Type` property to each feature (`National Forest`, `BLM`, `State Land`) so the client can style by a single key.
   - Save the result to `public/data/colorado_public_lands.geojson`.

2. **Render the overlay on the unit map**
   - In `src/pages/UnitMap.tsx`, load the new GeoJSON as a second `map.data` layer.
   - Apply a `setStyle` callback that colors each feature by `Land_Type`:
     - National Forest → green (`#22c55e`)
     - BLM → yellow (`#eab308`)
     - State Land → blue (`#3b82f6`)
   - Use lower opacity fills and thin outlines so unit boundaries and labels remain visible on top.
   - Keep the existing GMU boundary layer unchanged.

3. **Add a legend**
   - Add a small floating legend in the corner of the map showing the three colors and labels.
   - Use the existing Tailwind/shadcn styling tokens.

4. **Verify**
   - Confirm the GeoJSON loads without errors.
   - Confirm the overlay renders and the colors match the requested land types.
   - Confirm the GMU labels and click-to-identify-unit behavior still work.

## Open question

Do the land-type definitions above look right, or do you want to include/exclude any categories? For example:
- Should **National Parks** and **National Wildlife Refuges** also be shaded, or left out?
- Should **State Land** include all state-owned land, or only specific types like State Parks / State Wildlife Areas?

If you're happy with the proposed mapping, I can proceed.