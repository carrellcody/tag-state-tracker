## Changes to `src/pages/Leftovers.tsx`

### 1. Sticky table header
- On the `TableHeader`'s `TableHead` cells, add `sticky top-0 z-10 bg-background` so column names remain visible while the table body scrolls inside its existing `overflow-auto` container.

### 2. Pagination (100 rows per page, matching draw pages)
- Add `const PAGE_SIZE = 100` and `const [page, setPage] = useState(1)`.
- Reset `page` to 1 whenever any filter input changes (via `useEffect` on the filter dependency list, mirroring the draw tables).
- Derive `totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))` and `pagedRows = filteredRows.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)`.
- Render `pagedRows` in the table body instead of `filteredRows`.
- Below the table, add a pagination bar styled the same as the draw tables: "Previous" button (disabled when `page === 1`), "Page X of Y" text, "Next" button (disabled when `page === totalPages`). Update the row-count line to read "Showing N–M of T tags".

### 3. Banner restyle and copy update
- Replace the `Card` classes `border-primary/30 bg-primary/5` with thicker border + light green background (e.g. `border-2 border-primary bg-[hsl(var(--primary)/0.12)]` using the existing primary token; no hardcoded colors).
- Remove the large "Welcome" / "Learn More" `CardTitle` heading. Keep only the collapse/expand button, right-aligned, in the header row.
- Replace the `bannerText` string with the new three-paragraph copy. Render as three `<p>` blocks with `space-y-2`. In the first paragraph, wrap "Welcome to the leftover page!" in `<strong>` so only that phrase is bold.
- When collapsed, show a compact one-line label (e.g. "Learn more about leftover tags") next to the expand button so the user can still find it; expanding restores the full text.

### Out of scope
No changes to filters, data loading, or other pages.
