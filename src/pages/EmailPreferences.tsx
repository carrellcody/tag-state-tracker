import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";
import Layout from "@/components/Layout";

interface EmailPreference {
  id?: string;
  species: string;
  draw_reminders: boolean;
  new_data_alerts: boolean;
  reminder_days_before: number;
}

export default function EmailPreferences() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<EmailPreference[]>([
    { species: "deer", draw_reminders: true, new_data_alerts: true, reminder_days_before: 7 },
    { species: "elk", draw_reminders: true, new_data_alerts: true, reminder_days_before: 7 },
    { species: "antelope", draw_reminders: true, new_data_alerts: true, reminder_days_before: 7 },
  ]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchPreferences();
  }, [user, navigate]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("email_preferences")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setPreferences(prev => prev.map(pref => {
          const existing = data.find(d => d.species === pref.species);
          return existing ? {
            id: existing.id,
            species: existing.species,
            draw_reminders: existing.draw_reminders,
            new_data_alerts: existing.new_data_alerts,
            reminder_days_before: existing.reminder_days_before,
          } : pref;
        }));
      }
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
      toast({
        title: "Error",
        description: "Failed to load email preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const operations = preferences.map(async (pref) => {
        if (pref.id) {
          // Update existing
          return supabase
            .from("email_preferences")
            .update({
              draw_reminders: pref.draw_reminders,
              new_data_alerts: pref.new_data_alerts,
              reminder_days_before: pref.reminder_days_before,
            })
            .eq("id", pref.id);
        } else {
          // Insert new
          return supabase
            .from("email_preferences")
            .insert({
              user_id: user?.id,
              species: pref.species,
              draw_reminders: pref.draw_reminders,
              new_data_alerts: pref.new_data_alerts,
              reminder_days_before: pref.reminder_days_before,
            });
        }
      });

      const results = await Promise.all(operations);
      const hasError = results.some(r => r.error);

      if (hasError) {
        throw new Error("Failed to save some preferences");
      }

      toast({
        title: "Success",
        description: "Email preferences saved successfully",
      });

      await fetchPreferences();
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save email preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (species: string, field: keyof EmailPreference, value: any) => {
    setPreferences(prev => prev.map(pref =>
      pref.species === species ? { ...pref, [field]: value } : pref
    ));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Email Notifications
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your email notification preferences for draw dates and new data
          </p>
        </div>

        <div className="space-y-6">
          {preferences.map((pref) => (
            <Card key={pref.species}>
              <CardHeader>
                <CardTitle className="capitalize">{pref.species}</CardTitle>
                <CardDescription>
                  Configure notifications for {pref.species} hunting data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`${pref.species}-draw`}>Draw Date Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified before draw dates
                    </p>
                  </div>
                  <Switch
                    id={`${pref.species}-draw`}
                    checked={pref.draw_reminders}
                    onCheckedChange={(checked) =>
                      updatePreference(pref.species, "draw_reminders", checked)
                    }
                  />
                </div>

                {pref.draw_reminders && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor={`${pref.species}-days`}>Reminder Timing</Label>
                    <Select
                      value={pref.reminder_days_before.toString()}
                      onValueChange={(value) =>
                        updatePreference(pref.species, "reminder_days_before", parseInt(value))
                      }
                    >
                      <SelectTrigger id={`${pref.species}-days`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day before</SelectItem>
                        <SelectItem value="3">3 days before</SelectItem>
                        <SelectItem value="7">7 days before</SelectItem>
                        <SelectItem value="14">14 days before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`${pref.species}-data`}>New Data Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new draw or harvest data is available
                    </p>
                  </div>
                  <Switch
                    id={`${pref.species}-data`}
                    checked={pref.new_data_alerts}
                    onCheckedChange={(checked) =>
                      updatePreference(pref.species, "new_data_alerts", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
