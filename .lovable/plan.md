## Goal

Fix outdated deer draw statistics on `/deer-draw` by pointing the table at the up-to-date `FullDeer26Final.csv` instead of the stale `FullDeer26FinalNewHarv.csv`.

## Why the data is wrong today

- `/deer-draw` → `DeerDrawNew` → `DeerDrawTableNew` currently fetches `FullDeer26FinalNewHarv.csv` (last updated 2026-05-14).
- `FullDeer26Final.csv` (updated 2026-06-18) holds the correct, current draw stats.
- Verified row `DM035O3R` / `A_NR`: NewHarv = `1 Pref Points` (wrong), Final = `2 Pref Points` (correct).

## Column differences to reconcile

`FullDeer26Final.csv` is missing three columns the new table currently uses:

| Column | Used for | Resolution |
|---|---|---|
| `Quota` | Displayed as "Total tag quota" column | Remove from `visibleColumns`, `headerLabels`, `nonGroupedColumnsBefore`, and the row-rendering switch |
| `Choice 1 Applicants` | Not referenced in the table — only present in subtable file | No change |
| `New` | "View New Tags" toggle (bypasses point filters for new tags) | Remove the toggle + state + filter logic since the source no longer marks new tags |

Columns that `Final` adds and the table can keep using as-is: `Drawn_out_level23/24/25`, `Chance_at_DOL23/24/25`, `DOAAdult*_1` (not currently rendered). The existing "Previous years" toggle already references the `25`/`24`/`23` columns, which now actually exist in the new source.

## Changes

`src/components/tables/DeerDrawTableNew.tsx`
1. Line 37 — change fetch URL:
   ```ts
   const { data, loading, error } = useCsvData(`/data/FullDeer26Final.csv?v=${CSV_VERSION}`);
   ```
2. Remove `Quota` from `visibleColumns` (lines 247-248), `headerLabels` (line 256), and `nonGroupedColumnsBefore` (line 285).
3. Remove the `Quota` cell from the row-cell renderer further down in the same file (the `switch`/`if` branch that outputs `row.Quota`).
4. Remove the "View New Tags" feature:
   - Delete `showNewTags` state (line 69) and its dependency in the page-reset effect (line 80).
   - Delete the `isNewTag` / `bypassPoints` lines (148-149) and any branches relying on `bypassPoints` (lines 186, 191).
   - Remove the toggle UI in the filter sidebar.
5. Bump `CSV_VERSION` in `src/utils/csvVersion.ts` from `"4"` to `"5"` so browsers re-fetch immediately after deploy.

## Out of scope

- `/deer-draw-old` (the legacy `DeerDrawTable`) already uses `FullDeer26Final.csv` and is unaffected.
- Elk and Pronghorn draw pages — not part of this report.
- Re-uploading `FullDeer26FinalNewHarv.csv` — no longer needed; the file becomes unused on `/deer-draw` (still listed in `serve-csv` allow-list, harmless to leave).
