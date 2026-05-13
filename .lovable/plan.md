## Email template tweaks

Edit `supabase/functions/send-leftover-tag-alerts/index.ts`:

1. **Add "Available Tags" column** — read from CSV column literally named `Available Tags` (case-insensitive match, fallback variants: `AvailableTags`, `Available`). Display its value in a new column in the email table.
2. **Remove "Unit" and "Season" columns** from both the email table header and rows. Stop reading those CSV keys.
3. **Copy fix** — change "this week's Colorado leftover lists." to "this week's Colorado leftover list."
4. **Test mode sample data** — update the hardcoded sample matches to include `availableTags` (e.g., "3", "1", "2") instead of unit/season so the test preview reflects the new layout.

Final email table columns: **Tag Code | Available Tags**.

Redeploy the edge function after the edit.