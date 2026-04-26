CREATE TABLE public.tag_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag_code)
);

ALTER TABLE public.tag_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tag alerts"
  ON public.tag_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tag alerts"
  ON public.tag_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tag alerts"
  ON public.tag_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_tag_alerts_user ON public.tag_alerts(user_id);
CREATE INDEX idx_tag_alerts_code ON public.tag_alerts(tag_code);