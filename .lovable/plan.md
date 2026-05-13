## Current status

**Already built and deployed:**
- Backend function that scans the three weekly CSVs, finds matches against each user's saved tag alerts, and sends one branded email per matching user (only users who have at least one tag alert AND at least one match get an email).
- Send log table (`leftover_alert_log`) for auditing every send.
- Weekly schedule: Mondays at 8am Mountain Time.

**One bug to fix before going live:** The scheduled job is currently passing the wrong secret value, so the Monday-morning run would be rejected. Need to fix the way the cron passes its secret (move it into Vault and read it from SQL).

## CSV names to upload on `/admin/upload`

Upload to the existing `csv-data` bucket using these exact filenames:

- `elk_Current_Leftover_Tags.csv`
- `deer_Current_Leftover_Tags.csv`
- `ant_Current_Leftover_Tags.csv`

Each file must contain a column named **`Tag`** or **`TagCode`**. If columns named `Unit` and `Season` exist, those values will appear next to each matched code in the email. Other columns are ignored.

## From address

I'm using **`Tallo Tags <alerts@tallotags.com>`** with reply-to `tallotags@gmail.com`. Your contact form already sends from `@tallotags.com` successfully, so this domain is verified in Resend — using it gives much better inbox placement than `onboarding@resend.dev`. Let me know if you'd rather switch.

## What I'll add in this step

1. **Fix the cron secret** — store `CRON_SECRET` in Vault so the scheduled SQL job can read and forward it.
2. **Admin dashboard controls** on `/admin` (admin-only):
   - **"Send all alerts now"** button — runs the same job the cron runs. Triggers a real send to every user with matches.
   - **"Send test to me"** button — generates a sample email using fake matches and sends it to the admin's own email address only. No log row, no real users touched.
   - **Recent runs panel** — shows the last 20 rows from `leftover_alert_log` (run ID, recipient, match count, status, time).
3. **Backend support** — extend the alert function to accept `mode: "test"` (sends sample email to caller only) alongside the existing real-send mode. Both still require admin auth or the cron secret.

## Technical details

- Vault: `INSERT INTO vault.secrets (name, secret) VALUES ('cron_secret', '<value>')` then update the cron SQL to `SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret'`.
- Admin buttons call the function with `supabase.functions.invoke('send-leftover-tag-alerts', { body: { mode: 'real' | 'test', secret: <CRON_SECRET fetched from a small admin-only RPC OR from a thin wrapper edge function that injects it server-side> } })`. Cleaner: change the function to accept either `x-cron-secret` header OR a logged-in admin JWT (verify with `has_role(uid, 'admin')`). I'll go with the JWT-admin path for the buttons so the secret never has to round-trip to the browser.
- "Send test to me" path: function looks up the caller's profile email, builds an email with hardcoded sample matches across all three species, sends only to that address, returns success.
- Recent runs panel: simple `select * from leftover_alert_log order by created_at desc limit 20` — already covered by the existing admin RLS policy on that table.

## Out of scope for this step

- Per-user "send only to user X" picker (can add later if useful).
- Editable email template in the admin UI (template stays in code).
