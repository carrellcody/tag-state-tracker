import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DrawReminderRequest {
  species: string;
  huntCode: string;
  drawDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { species, huntCode, drawDate }: DrawReminderRequest = await req.json();
    
    console.log(`Sending draw reminder for ${species} hunt ${huntCode}, draw date: ${drawDate}`);

    // Get all users who want reminders for this species
    const { data: preferences, error: prefError } = await supabase
      .from("email_preferences")
      .select("user_id, reminder_days_before")
      .eq("species", species)
      .eq("draw_reminders", true);

    if (prefError) {
      console.error("Error fetching preferences:", prefError);
      throw prefError;
    }

    if (!preferences || preferences.length === 0) {
      console.log("No users subscribed to draw reminders for this species");
      return new Response(
        JSON.stringify({ message: "No subscribers" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user emails from profiles
    const userIds = preferences.map(p => p.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    // Send emails to all subscribers
    const emailPromises = profiles?.map(async (profile) => {
      try {
        const emailResult = await resend.emails.send({
          from: "TaggOut Notifications <notifications@taggout.com>",
          to: [profile.email],
          subject: `Draw Date Reminder: ${species.toUpperCase()} Hunt ${huntCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2c5f2d;">Draw Date Approaching!</h1>
              <p>This is a reminder that the draw date for your selected hunt is coming up:</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Species:</strong> ${species.toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>Hunt Code:</strong> ${huntCode}</p>
                <p style="margin: 5px 0;"><strong>Draw Date:</strong> ${new Date(drawDate).toLocaleDateString()}</p>
              </div>
              <p>Make sure you've submitted your application before the deadline!</p>
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                You're receiving this email because you opted in to draw date reminders for ${species} hunts.
                <br>To manage your email preferences, visit your TaggOut account settings.
              </p>
            </div>
          `,
        });
        console.log(`Email sent to ${profile.email}:`, emailResult);
        return emailResult;
      } catch (error) {
        console.error(`Error sending email to ${profile.email}:`, error);
        return null;
      }
    }) || [];

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ message: `Sent ${emailPromises.length} reminders` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-draw-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
