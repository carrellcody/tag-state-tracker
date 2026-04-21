import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Count total users
    const { count: totalUsers } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Count active Stripe subscriptions
    let activeSubscriptions = 0;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      let hasMore = true;
      let startingAfter: string | undefined = undefined;
      while (hasMore) {
        const res: any = await stripe.subscriptions.list({
          status: "active",
          limit: 100,
          starting_after: startingAfter,
        });
        activeSubscriptions += res.data.length;
        hasMore = res.has_more;
        if (hasMore) startingAfter = res.data[res.data.length - 1].id;
      }
    }

    // List uploaded files in csv-data bucket
    const { data: files, error: filesError } = await adminClient.storage
      .from("csv-data")
      .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });

    if (filesError) console.error("List files error:", filesError);

    return new Response(
      JSON.stringify({
        totalUsers: totalUsers ?? 0,
        activeSubscriptions,
        files: (files ?? [])
          .filter((f) => f.name.endsWith(".csv"))
          .map((f) => ({
            name: f.name,
            size: f.metadata?.size ?? 0,
            updated_at: f.updated_at ?? f.created_at,
          })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("admin-stats error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
