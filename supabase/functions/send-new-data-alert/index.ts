import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NewDataAlertSchema = z.object({
  species: z.enum(['deer', 'elk', 'antelope']),
  dataType: z.enum(['draw', 'harvest'])
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate JWT and check admin role
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: hasAdminRole } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Validate input
    const requestBody = await req.json();
    const validationResult = NewDataAlertSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.format() 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { species, dataType } = validationResult.data;
    
    console.log(`Sending new data alert for ${species} ${dataType} data`);

    // Get all users who want new data alerts for this species
    const { data: preferences, error: prefError } = await supabase
      .from("email_preferences")
      .select("user_id")
      .eq("species", species)
      .eq("new_data_alerts", true);

    if (prefError) {
      console.error("Error fetching preferences:", prefError);
      throw prefError;
    }

    if (!preferences || preferences.length === 0) {
      console.log("No users subscribed to new data alerts for this species");
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
          subject: `New ${species.toUpperCase()} ${dataType.toUpperCase()} Data Available!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2c5f2d;">New Data Available!</h1>
              <p>Great news! New ${dataType} data has been added for ${species}.</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Species:</strong> ${species.toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>Data Type:</strong> ${dataType.toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <p>
                <a href="https://taggout.com/${species}-${dataType}" 
                   style="background-color: #2c5f2d; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                  View New Data
                </a>
              </p>
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                You're receiving this email because you opted in to new data alerts for ${species}.
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
      JSON.stringify({ message: `Sent ${emailPromises.length} alerts` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-new-data-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
