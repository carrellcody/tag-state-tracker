
-- Enable extensions for scheduled HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Log table for leftover-tag alert sends
CREATE TABLE IF NOT EXISTS public.leftover_alert_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL,
  user_id UUID,
  recipient_email TEXT NOT NULL,
  match_count INTEGER NOT NULL DEFAULT 0,
  matched_codes JSONB,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leftover_alert_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view leftover alert log"
ON public.leftover_alert_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS leftover_alert_log_run_id_idx ON public.leftover_alert_log(run_id);
CREATE INDEX IF NOT EXISTS leftover_alert_log_created_at_idx ON public.leftover_alert_log(created_at DESC);
