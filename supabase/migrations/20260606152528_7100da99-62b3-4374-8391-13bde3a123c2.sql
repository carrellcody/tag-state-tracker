ALTER TABLE public.profiles DISABLE TRIGGER USER;
UPDATE public.profiles
  SET subscription_status='active',
      product_id='prod_TQEkp6iEC7tmTK',
      subscription_manual_override=true,
      subscription_end=NULL
  WHERE id='5241f557-cf2d-461a-bf0d-eb9e7d0fbf1b';
ALTER TABLE public.profiles ENABLE TRIGGER USER;