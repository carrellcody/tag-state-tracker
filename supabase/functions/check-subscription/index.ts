import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");

    let payload: any;
    try {
      const [, body] = token.split(".");
      payload = JSON.parse(atob(body));
    } catch (_err) {
      throw new Error("Invalid authentication token");
    }

    const userId = payload.sub as string | undefined;
    const email = payload.email as string | undefined;
    if (!userId || !email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId, email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    // Try to use existing Stripe customer ID from profile first
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      logStep("Error fetching profile", { message: profileError.message });
    }

    let customerId = profile?.stripe_customer_id as string | null;

    // If we don't have a stored customer ID, try multiple fallbacks
    if (!customerId) {
      // First try email lookup
      const customers = await stripe.customers.list({ email, limit: 1 });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found Stripe customer by email", { customerId });
      } else {
        // Fallback: search for recent checkout sessions with this user's client_reference_id
        logStep("No customer found by email, searching checkout sessions by client_reference_id", { userId });
        
        const sessions = await stripe.checkout.sessions.list({
          limit: 10,
        });
        
        const userSession = sessions.data.find(
          (s: { client_reference_id?: string | null; customer?: string | object | null; payment_status?: string }) => 
            s.client_reference_id === userId && s.customer && s.payment_status === 'paid'
        );
        
        if (userSession?.customer) {
          customerId = typeof userSession.customer === 'string' 
            ? userSession.customer 
            : userSession.customer.id;
          logStep("Found Stripe customer via checkout session client_reference_id", { customerId, sessionId: userSession.id });
        }
      }

      if (!customerId) {
        logStep("No customer found by any method, updating unsubscribed state");

        await supabaseClient
          .from('profiles')
          .update({
            subscription_status: 'inactive',
            product_id: null,
            subscription_end: null,
          })
          .eq('id', userId);

        return new Response(
          JSON.stringify({ subscribed: false }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      // Persist the Stripe customer ID for future checks
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
      logStep("Persisted Stripe customer ID to profile", { customerId });
    } else {
      logStep("Using existing Stripe customer id from profile", { customerId });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      if (subscription.current_period_end) {
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      }
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      productId = subscription.items.data[0].price.product as string;
      logStep("Determined subscription tier", { productId });
      
      // Update profile
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          product_id: productId,
          subscription_end: subscriptionEnd
        })
        .eq('id', userId);
    } else {
      logStep("No active subscription found");
      
      // Update profile
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'inactive',
          product_id: null,
          subscription_end: null
        })
        .eq('id', userId);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
