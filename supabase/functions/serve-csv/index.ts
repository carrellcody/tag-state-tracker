import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_FILES = new Set([
  "DeerDraw25Subtable.csv",
  "DeerOTC25.csv",
  "ant25code_pages.csv",
  "deer25code_pages.csv",
  "elk25code_pages.csv",
  "elkOTC24.csv",
  "gmu_public_land.csv",
  "DeerHarvest24.csv",
  "DeerOTC24.csv",
  "FullDeer25Final.csv",
  "FullDeer26Final.csv",
  "FullDeer26FinalNewHarv.csv",
  "Fullant25Final.csv",
  "Fullant26Final.csv",
  "Fullelk25Final.csv",
  "Fullelk26Final.csv",
  "antHarvest25.csv",
  "antOTC24.csv",
  "elkHarvest25.csv",
  "ElkDraw25Subtable.csv",
  "elkHarvest24.csv",
  "elkOTC25.csv",
  "AntDraw25Subtable.csv",
  "antHarvest24.csv",
  "antOTC25Test.csv",
  "antOTC25.csv",
]);

const PRO_PRODUCT_IDS = new Set([
  "prod_TQEkp6iEC7tmTK",
  "prod_Tlkqena8Ul3Ezu",
]);

const jsonResponse = (body: Record<string, string>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get("file");

    if (!filename || !ALLOWED_FILES.has(filename)) {
      return jsonResponse({ error: "Invalid file" }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;
    if (claimsError || !userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data: roleRow } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("subscription_status, subscription_manual_override, product_id")
        .eq("id", userId)
        .single();

      const hasActiveProSubscription =
        !profileError &&
        profile?.subscription_status === "active" &&
        (profile.subscription_manual_override === true || PRO_PRODUCT_IDS.has(profile.product_id ?? ""));

      if (!hasActiveProSubscription) {
        return jsonResponse({ error: "Subscription required" }, 403);
      }
    }

    const { data, error } = await adminClient.storage
      .from("csv-data")
      .download(filename);

    if (error || !data) {
      console.error("Storage download error:", error);
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = await data.text();

    return new Response(text, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("serve-csv error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
