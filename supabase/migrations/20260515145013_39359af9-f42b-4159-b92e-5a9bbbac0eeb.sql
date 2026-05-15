CREATE OR REPLACE FUNCTION public.prevent_profile_subscription_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.subscription_end IS DISTINCT FROM OLD.subscription_end
     OR NEW.subscription_manual_override IS DISTINCT FROM OLD.subscription_manual_override
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.product_id IS DISTINCT FROM OLD.product_id
     OR NEW.promo_code_used IS DISTINCT FROM OLD.promo_code_used
     OR NEW.promo_code_applied_at IS DISTINCT FROM OLD.promo_code_applied_at
     OR NEW.id IS DISTINCT FROM OLD.id
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Not allowed to modify subscription-related or identity fields';
  END IF;

  RETURN NEW;
END;
$function$;