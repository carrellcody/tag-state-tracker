# Fix Season / Weapon filter on the Leftovers page

## What the filter does today

The filter reads the `SeasonWeapon` column of `leftovers26.csv`. Actual values in that file are always 3 characters, e.g. `O1R`, `P5A`, `L2R`, `O1M`:

- character 1 = season type (`O` regular, `P` private-land-only, `L` late, `V`, `S`)
- character 2 = season number (`1`-`6`)
- character 3 = weapon (`R` rifle, `A` archery, `M` muzzleloader, `X`)

Current matching logic:

```text
1st Rifle  -> SeasonWeapon === "O1"   never matches (values are 3 chars)
2nd Rifle  -> SeasonWeapon === "O2"   never matches
3rd Rifle  -> SeasonWeapon === "O3"   never matches
Archery    -> contains "A"            matches, but also matches season-type letters
Muzzleloader -> contains "M"
Late Rifle -> contains "L"
RFW        -> contains "W"            no such value exists in the file
Youth      -> contains "K"            no such value exists in the file
```

So the three rifle options return zero rows, and the letter-contains checks are loose.

## Fix

Match on position, not substring:

- 1st / 2nd / 3rd Rifle: weapon char is `R` and season number is `1` / `2` / `3` (any season type, so `O1R`, `P1R`, `V1R` all count as 1st rifle).
- Archery: weapon char is `A`. Muzzleloader: weapon char is `M`.
- Late Rifle: season-type char is `L`.
- Remove the RFW and Youth options, since no rows in `leftovers26.csv` carry those codes (RFW tags are already covered by the separate PLO filter).

Also add options that currently have no representation: seasons 4 and 5 rifle exist in the data (`O4R`, `O5R`, `P5R`, `P6R`), so add "4th Rifle" and "5th Rifle" so those rows are reachable.

## Technical notes

- Single file: `src/pages/Leftovers.tsx` — rewrite `matchSeasonWeapon` to parse the code by index and use the `Weapon` column as a fallback, and update `SEASON_WEAPON_OPTIONS`.
- Bump the persisted-state key for `leftovers_seasonWeapons` so stale saved selections (e.g. "RFW") don't leave users with a broken filter.
