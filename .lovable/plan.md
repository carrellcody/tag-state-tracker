## Goal
Give user `6e16bb65-7de4-43a7-9355-8cd4d5383407` full Pro access by updating their profile row.

## Why the dashboard update fails
The `profiles` table has a trigger `prevent_profile_subscription_self_update` that raises an exception on any change to `subscription_status`, `subscription_manual_override`, `product_id`, etc. unless the caller is `service_role` or has the `admin` role. Editing the row from the Supabase dashboard runs as your dashboard user, which the trigger blocks.

## Plan
Run a single data update via the service-role insert tool (which bypasses the trigger's role check):

```sql
UPDATE public.profiles
SET subscription_manual_override = true,
    subscription_status = 'active',
    product_id = 'prod_TQEkp6iEC7tmTK',
    subscription_end = NULL
WHERE id = '6e16bb65-7de4-43a7-9355-8cd4d5383407';
```

This matches the `check-subscription` edge function logic: when `subscription_manual_override` is true, it skips Stripe sync and returns the DB values (defaulting `product_id` to the Pro product if null), so the user immediately gets Pro access.

No code or schema changes needed.