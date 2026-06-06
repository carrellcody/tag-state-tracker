import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_PRO_PRODUCT_ID = "prod_TQEkp6iEC7tmTK";

const BodySchema = z.object({
  target: z.string().trim().min(3).max(320),
  action: z.enum(["grant", "revoke"]),
  product_id: z.string().trim().min(1).max(100).optional(),
});

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const log = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ADMIN-GRANT-SUB] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;
    log("Caller authenticated", { callerId });

    const { data: isAdmin, error: roleErr } = await supabaseAdmin.rpc(
      "has_role",
      { _user_id: callerId, _role: "admin" },
    );
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const { target, action, product_id } = parsed.data;

    // Resolve target -> profile row
    const isUuid = UUID_RE.test(target);
    const query = supabaseAdmin
      .from("profiles")
      .select("id, email")
      .limit(1);
    const { data: profileRows, error: lookupErr } = isUuid
      ? await query.eq("id", target)
      : await query.eq("email", target.toLowerCase());

    if (lookupErr) {
      log("Lookup error", lookupErr);
      return new Response(JSON.stringify({ error: lookupErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!profileRows || profileRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "No profile found for that user" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const targetUserId = profileRows[0].id;

    const update =
      action === "grant"
        ? {
            subscription_status: "active",
            product_id: product_id || DEFAULT_PRO_PRODUCT_ID,
            subscription_manual_override: true,
            subscription_end: null,
          }
        : {
            subscription_status: "inactive",
            product_id: null,
            subscription_manual_override: false,
            subscription_end: null,
          };

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update(update)
      .eq("id", targetUserId)
      .select(
        "id, email, subscription_status, product_id, subscription_manual_override, subscription_end",
      )
      .single();

    if (updateErr) {
      log("Update error", updateErr);
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("Updated profile", { action, targetUserId });
    return new Response(
      JSON.stringify({ success: true, profile: updated }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
