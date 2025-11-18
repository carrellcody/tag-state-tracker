import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2024-06-20" 
    });

    // Retrieve the checkout session to get metadata
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    // Verify the session belongs to this user
    if (session.metadata?.user_id !== user.id) {
      throw new Error("Session does not belong to this user");
    }

    // Only update if payment was successful and promo code exists
    if (session.payment_status === "paid" && session.metadata?.promo_code) {
      const { error } = await supabaseClient
        .from("profiles")
        .update({
          promo_code_used: session.metadata.promo_code,
          promo_code_applied_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          promo_code: session.metadata.promo_code 
        }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, promo_code: null }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in update-promo-code:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
