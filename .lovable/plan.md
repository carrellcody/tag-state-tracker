

## Replace CSV Data Files

Copy the three uploaded CSV files to replace the existing ones in `public/data/`:

1. `user-uploads://FullDeer26Final.csv` -> `public/data/FullDeer26Final.csv`
2. `user-uploads://Fullelk26Final.csv` -> `public/data/Fullelk26Final.csv`
3. `user-uploads://Fullant26Final.csv` -> `public/data/Fullant26Final.csv`

After copying, bump `CSV_VERSION` in `src/utils/csvVersion.ts` from `"2"` to `"3"` so the cache-busting parameter forces browsers to fetch the new files.

