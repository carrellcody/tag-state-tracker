# Fix Season / Weapon filter on the Leftovers page

## What the filter does today

The filter reads the `SeasonWeapon` column of `leftovers26.csv`. Actual values are always 3 characters, e.g. `O1R`, `P5A`, `L2R`, `O1M`:

- character 1 = season type (`O` regular, `P` private-land-only, `L` late, `V`, `S`)
- character 2 = season number (`1`-`6`)
- character 3 = weapon (`R` rifle, `A` archery, `M` muzzleloader, `X`)

Current matching logic compares the rifle options against the whole string (`SeasonWeapon === "O1"`), which never matches a 3-character value — so 1st, 2nd and 3rd Rifle always return zero rows.

## Fix

New matching rules:

- 1st Rifle: `SeasonWeapon` contains `1R`
- 2nd Rifle: contains `2R`
- 3rd Rifle: contains `3R`
- 4th Rifle (new option): contains `4R`
- Archery: weapon character is `A`
- Muzzleloader: weapon character is `M`
- Late Rifle: season-type character is `L`
- RFW: contains `W` (kept for future data)
- Youth: contains `K` (kept for future data)
- Other (new option): any row that matches none of the rules above — e.g. `O5R`, `P5R`, `P6R`, `O2X`, `P5X`

Option order in the panel: Any, Archery, Muzzleloader, 1st Rifle, 2nd Rifle, 3rd Rifle, 4th Rifle, Late Rifle, RFW, Youth Rifle, Other.

## Technical notes

- Single file: `src/pages/Leftovers.tsx` — rewrite `matchSeasonWeapon` with the rules above, implementing "Other" as the negation of the concrete rules, and add the two new entries to `SEASON_WEAPON_OPTIONS`.
- Bump the persisted-state key for `leftovers_seasonWeapons` so stale saved selections don't stick.
