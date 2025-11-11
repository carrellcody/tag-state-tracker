-- Create email preferences table
CREATE TABLE public.email_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  species TEXT NOT NULL CHECK (species IN ('deer', 'elk', 'antelope')),
  draw_reminders BOOLEAN NOT NULL DEFAULT true,
  new_data_alerts BOOLEAN NOT NULL DEFAULT true,
  reminder_days_before INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, species)
);

-- Create draw reminders tracking table
CREATE TABLE public.draw_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  species TEXT NOT NULL CHECK (species IN ('deer', 'elk', 'antelope')),
  hunt_code TEXT NOT NULL,
  draw_date DATE NOT NULL,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(species, hunt_code, draw_date)
);

-- Create data versions table to track when new data is added
CREATE TABLE public.data_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  species TEXT NOT NULL CHECK (species IN ('deer', 'elk', 'antelope')),
  data_type TEXT NOT NULL CHECK (data_type IN ('draw', 'harvest')),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version_hash TEXT NOT NULL,
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(species, data_type, version_hash)
);

-- Enable Row Level Security
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_preferences
CREATE POLICY "Users can view their own email preferences"
  ON public.email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email preferences"
  ON public.email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences"
  ON public.email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email preferences"
  ON public.email_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for draw_reminders (public read, service role write)
CREATE POLICY "Anyone can view draw reminders"
  ON public.draw_reminders FOR SELECT
  USING (true);

-- RLS Policies for data_versions (public read, service role write)
CREATE POLICY "Anyone can view data versions"
  ON public.data_versions FOR SELECT
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();