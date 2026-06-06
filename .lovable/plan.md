# Grant Pro Access to charles.jerniganii@gmail.com

## Why your update is failing

The `profiles` table has a `BEFORE UPDATE` trigger (`prevent_profile_subscription_self_update`) that **raises an exception** any time `subscription_status`, `product_id`, `subscription_end`, `subscription_manual_override`, `stripe_customer_id`, or promo fields change — unless the caller is `service_role` or has the `admin` role.

That trigger fires regardless of RLS, so editing the row from the Lovable Cloud table editor (which runs as `authenticated`, not `service_role`) will always throw `Not allowed to modify subscription-related or identity fields`. That's the error you're seeing.

The right way to grant comp access to this user is to run a service-role UPDATE that also flips on `subscription_manual_override`, so the next `check-subscription` call won't immediately sync Stripe back over the top and downgrade them.

## Plan

1. Run a service-role UPDATE on `public.profiles` for id `5241f557-cf2d-461a-bf0d-eb9e7d0fbf1b`:
   - `subscription_status = 'active'`
   - `product_id = 'prod_TQEkp6iEC7tmTK'` (Pro tier, per project memory)
   - `subscription_manual_override = true` (so `check-subscription` returns these values verbatim and never overwrites them from Stripe)
   - `subscription_end = NULL` (manual grants are open-ended; the override flag is what gates access)
2. Verify with a read query that the row now shows `subscription_status = 'active'` and `subscription_manual_override = true`.
3. Ask the user to refresh their browser (or sign out / back in) so `AuthContext` re-runs `check-subscription` and picks up Pro entitlements.

## Notes / alternatives

- If you'd rather this user pay through Stripe normally, the fix instead is to have them complete checkout — do **not** edit the row by hand; the trigger is doing its job.
- If you want a reusable admin UI for comp grants, that's a separate, larger change (admin page + edge function running as service role). Say the word and I'll plan it.
- I will **not** modify the trigger or RLS — they're protecting against privilege escalation and should stay.
