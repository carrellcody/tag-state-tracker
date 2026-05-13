## Goal

Every Monday at 8:00 AM Mountain Time, email each user whose saved tag codes (from `tag_alerts`) appear in the latest weekly leftover-tag CSVs. Skip users with zero matches.

## What you'll do (one-time)

1. Upload three CSVs weekly via the existing `/admin/upload` page into the `csv-data` bucket:
   - `elk_Current_Leftover_Tags.csv`
   - `deer_Current_Leftover_Tags.csv`
   - `ant_Current_Leftover_Tags.csv`
2. Each CSV must contain a `Tag` (or `TagCode`) column. Other columns shown in the email: `Unit`, `Season` (or `Hunt Code` / similar — I'll auto-detect a couple of common names; you can confirm exact headers when you upload the first one).
3. Paste the CPW leftover-list URL into the edge function constant on first deploy.

## Architecture

```text
pg_cron (Mon 15:00 UTC = 8am MT during MDT / 9am MT during MST)
   │
   ▼
net.http_post → edge function: send-leftover-tag-alerts
   │
   ├── Download 3 CSVs from csv-data storage bucket (service role)
   ├── Parse → build Set of tag codes per species + row metadata
   ├── Fetch all rows from tag_alerts joined with profiles (email + name)
   ├── For each user: intersect their codes with each species' set
   │      └── If any matches → enqueue email
   └── Send via Resend (existing RESEND_API_KEY)
          └── Log every send to email_send_log table for auditing
```

## Email content

- Branded header with Tallo Tags logo and mid-green accent
- Greeting: "Hi {first_name}, here are your saved tag codes that appeared on this week's Colorado leftover lists:"
- Per-species sections (only species with matches) showing a small table: **Tag Code | Unit | Season**
- Buttons: **View Elk Leftovers** / **Deer** / **Pronghorn** (only for species with matches), linking to `https://tallotags.com/{species}-leftovers`
- Link: **View official CPW leftover list** → CPW URL constant
- Footer link: **Manage your tag alerts** → `https://tallotags.com/profile#tag-alerts`
- From: `Tallo Tags <onboarding@resend.dev>`, Reply-To: `tallotags@gmail.com`

You'll be able to tweak any wording directly in the edge function template after I create it.

## DST note

Mountain Time shifts between MST (UTC−7) and MDT (UTC−6). Two clean options:

- **Single cron at 14:00 UTC** → 8am MDT in summer, 7am MST in winter (1 hr early in winter)
- **Single cron at 15:00 UTC** → 9am MDT in summer, 8am MST in winter (1 hr late in summer)

I'll default to **14:00 UTC** (8am during the active hunting season months — MDT runs March–November) unless you say otherwise.

## Technical details

**New edge function**: `supabase/functions/send-leftover-tag-alerts/index.ts`
- `verify_jwt = false` (called by cron) but validates a shared secret from request body
- Uses service role to read storage and `tag_alerts` + `profiles`
- Sends emails directly via Resend (matches existing `send-contact-email` pattern — no need for full email-queue infra for ~weekly low-volume sends)
- Inserts one row per send into `email_send_log` (creating the table if not present) so we can debug delivery

**Migration**:
- Enable `pg_cron` and `pg_net` extensions
- Create `email_send_log` table (id, user_id, recipient_email, match_count, status, error, sent_at)
- Schedule cron job `leftover-tag-alerts-weekly` for `0 14 * * 1` calling the edge function with the anon key + a `CRON_SECRET`

**New secret you'll add when prompted**: `CRON_SECRET` (random string I'll generate; protects the function from unauthenticated triggering).

**Manual test path**: An admin-only **"Send leftover alerts now"** button on `/admin/upload` so you can dry-run the job after each Monday upload without waiting for cron.

## Out of scope (for this plan)

- Per-user opt-out toggle (your existing `tag_alerts` rows imply opt-in; I won't add to `email_preferences` unless you ask)
- Bounce/complaint webhook handling (Resend dashboard already shows these)
- Custom domain / DKIM for tallotags.com (would improve deliverability — happy to add later)

## Open item

Send me the CPW leftover-list URL in your next message and I'll bake it in. I'll proceed with everything else as soon as you approve.
