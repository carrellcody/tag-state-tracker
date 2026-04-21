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
]);

// Files that can be accessed without authentication (free tier content)
const PUBLIC_FILES = new Set([
  "Fullant26Final.csv",
  "antHarvest25.csv",
  "ant25code_pages.csv",
  "antOTC24.csv",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get filename from query params first to check if auth is needed
    const url = new URL(req.url);
    const filename = url.searchParams.get("file");

    if (!filename || !ALLOWED_FILES.has(filename)) {
      return new Response(JSON.stringify({ error: "Invalid file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPublicFile = PUBLIC_FILES.has(filename);

    // Validate auth for non-public files
    const authHeader = req.headers.get("Authorization");
    if (!isPublicFile) {
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch from private storage using service role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

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
