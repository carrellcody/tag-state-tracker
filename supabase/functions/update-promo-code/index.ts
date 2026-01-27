import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-PROMO-CODE] ${step}${detailsStr}`);
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
    
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");
    logStep("Session ID received", { session_id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Retrieve the checkout session (promo codes are represented as discounts)
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['discounts', 'discounts.promotion_code', 'discounts.coupon'],
    });
    logStep("Checkout session retrieved", { 
      payment_status: session.payment_status,
      customer: session.customer,
      has_discounts: !!session.discounts?.length
    });
    
    // Verify the session belongs to this user via metadata OR client_reference_id
    const sessionUserId = session.metadata?.user_id || session.client_reference_id;
    if (sessionUserId !== user.id) {
      throw new Error("Session does not belong to this user");
    }

    // Sync stripe_customer_id if checkout completed.
    // NOTE: 100% off promo codes can result in `no_payment_required`.
    const checkoutCompleted =
      session.payment_status === "paid" || session.payment_status === "no_payment_required";

    if (checkoutCompleted && session.customer) {
      const updateData: Record<string, string | null> = {
        stripe_customer_id: session.customer as string,
      };

      // Extract promo code from session discounts
      // Stripe stores applied promo codes in session.discounts array
      let promoCode: string | null = null;
      
      if (session.discounts && session.discounts.length > 0) {
        const discount = session.discounts[0];
        logStep("Discount found on session", { discount });
        
        // The discount object contains the promotion_code ID
        // We need to retrieve the actual code string
        if (discount.promotion_code) {
          const promoCodeId = typeof discount.promotion_code === 'string' 
            ? discount.promotion_code 
            : discount.promotion_code.id;
          
          // Retrieve the promotion code to get the actual code string
          const promotionCode = await stripe.promotionCodes.retrieve(promoCodeId);
          promoCode = promotionCode.code;
          logStep("Promotion code retrieved", { promoCodeId, code: promoCode });
        } else if (discount.coupon) {
          // Fallback: if only coupon is present (not a promotion code)
          const couponId = typeof discount.coupon === 'string' 
            ? discount.coupon 
            : discount.coupon.id;
          promoCode = `COUPON:${couponId}`;
          logStep("Coupon found (no promo code)", { couponId });
        }
      }

      if (promoCode) {
        updateData.promo_code_used = promoCode;
        updateData.promo_code_applied_at = new Date().toISOString();
        logStep("Updating profile with promo code", { promo_code: promoCode });
      }

      const { error } = await supabaseClient
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        logStep("Error updating profile", { error: error.message });
        throw error;
      }

      logStep("Profile updated successfully", { 
        promo_code: promoCode,
        stripe_customer_id: session.customer
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          promo_code: promoCode,
          stripe_customer_id: session.customer
        }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    logStep("Payment not completed or no customer", { 
      payment_status: session.payment_status,
      customer: session.customer 
    });

    return new Response(
      JSON.stringify({ success: true, promo_code: null, stripe_customer_id: null }), 
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