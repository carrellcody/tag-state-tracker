# Admin "Grant Pro Access" Tool

Adds a small admin-only panel on `/admin` for granting and revoking Pro to any user by email or user ID, backed by a service-role edge function so it bypasses the `prevent_profile_subscription_self_update` trigger safely.

## Scope

- One new edge function: `admin-grant-subscription`
- One new section in the existing `AdminDashboard` page (already gated by `has_role(uid, 'admin')`)
- No DB schema changes, no policy changes, no trigger changes

## Edge function: `supabase/functions/admin-grant-subscription/index.ts`

- `verify_jwt = false` (default); validates JWT in code via `supabaseClient.auth.getUser(token)`
- Verifies the caller has `admin` role using the existing `has_role` SQL function (service-role client)
- Accepts JSON body (Zod-validated):
  - `target` — either a UUID or an email string
  - `action` — `"grant"` or `"revoke"`
  - optional `product_id` (defaults to `prod_TQEkp6iEC7tmTK`, the Pro tier)
- Resolves target → user id (lookup in `profiles` by id or email)
- Using the service-role client, updates `profiles`:
  - **grant**: `subscription_status='active'`, `product_id=<chosen>`, `subscription_manual_override=true`, `subscription_end=NULL`
  - **revoke**: `subscription_status='inactive'`, `product_id=NULL`, `subscription_manual_override=false`, `subscription_end=NULL`
- Service role bypasses the trigger's check (the trigger explicitly allows `auth.role()='service_role'`)
- Returns the updated profile snapshot
- Full CORS + structured error responses

## UI: new section in `src/pages/AdminDashboard.tsx`

A "Grant Pro Access" card containing:
- Text input: user email or user ID
- Two buttons: **Grant Pro** and **Revoke Pro**
- Calls `supabase.functions.invoke('admin-grant-subscription', { body: { target, action } })`
- Toast on success/error, shows the resulting status

No routing changes — `/admin` already exists and is admin-gated. Non-admins never see it.

## Security notes

- Trigger and RLS stay untouched — they continue protecting against privilege escalation
- Only authenticated users with `admin` role in `user_roles` can call the function; everyone else gets 403
- Granting still flips `subscription_manual_override=true` so `check-subscription` won't sync Stripe back over the comp

## Out of scope

- Bulk grants, expiring grants, audit log table — say the word and I'll add them in a follow-up
- Editing other profile fields from the admin panel
