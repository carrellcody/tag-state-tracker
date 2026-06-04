ALTER TABLE public.profiles DISABLE TRIGGER USER;
UPDATE public.profiles SET subscription_manual_override = true, subscription_status = 'active', product_id = 'prod_TQEkp6iEC7tmTK', subscription_end = NULL WHERE id = '6e16bb65-7de4-43a7-9355-8cd4d5383407';
ALTER TABLE public.profiles ENABLE TRIGGER USER;