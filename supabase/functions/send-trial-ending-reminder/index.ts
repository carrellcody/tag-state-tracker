import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[TRIAL-REMINDER] ${step}${d}`);
};

// Send reminder when trial_end is between 2.5 and 3.5 days away (one cron cycle/day window)
const MIN_SECONDS = 2.5 * 24 * 60 * 60;
const MAX_SECONDS = 3.5 * 24 * 60 * 60;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: require CRON_SECRET header to invoke
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedSecret =
      req.headers.get("x-cron-secret") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!cronSecret || providedSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    logStep("Listing trialing subscriptions");
    const now = Math.floor(Date.now() / 1000);
    let sent = 0;
    let skipped = 0;
    let starting_after: string | undefined = undefined;

    while (true) {
      const page = await stripe.subscriptions.list({
        status: "trialing",
        limit: 100,
        starting_after,
      });

      for (const sub of page.data) {
        const trialEnd = sub.trial_end;
        if (!trialEnd) {
          skipped++;
          continue;
        }
        const delta = trialEnd - now;
        if (delta < MIN_SECONDS || delta > MAX_SECONDS) {
          skipped++;
          continue;
        }
        if (sub.metadata?.trial_reminder_sent === "true") {
          skipped++;
          continue;
        }

        // Look up the customer's email
        const customer = await stripe.customers.retrieve(sub.customer as string);
        if ((customer as any).deleted) {
          skipped++;
          continue;
        }
        const email = (customer as Stripe.Customer).email;
        if (!email) {
          skipped++;
          continue;
        }

        const trialEndDate = new Date(trialEnd * 1000).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        try {
          await resend.emails.send({
            from: "TalloTags <notifications@taggout.com>",
            to: [email],
            subject: "Your TalloTags Pro trial ends in 3 days",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
                <h1 style="color: #598749;">Your free trial ends soon</h1>
                <p>Just a heads-up — your 15-day TalloTags Pro free trial ends on <strong>${trialEndDate}</strong>.</p>
                <p>If you do nothing, your card on file will be charged for the annual Pro plan ($20/year) on that date and you'll keep full access to all Elk, Deer, and Pronghorn data.</p>
                <p>If you'd rather not continue, you can cancel anytime before then from your account page — you won't be charged.</p>
                <p style="margin-top: 24px;">
                  <a href="https://tallotags.com/profile"
                     style="background-color: #598749; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Manage subscription
                  </a>
                </p>
                <p style="margin-top: 30px; color: #666; font-size: 12px;">
                  Questions? Just reply to this email and we'll help out.
                </p>
              </div>
            `,
          });

          await stripe.subscriptions.update(sub.id, {
            metadata: { ...(sub.metadata || {}), trial_reminder_sent: "true" },
          });

          sent++;
          logStep("Reminder sent", { subId: sub.id, email });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          logStep("Send failed", { subId: sub.id, error: msg });
        }
      }

      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1]?.id;
      if (!starting_after) break;
    }

    logStep("Done", { sent, skipped });
    return new Response(JSON.stringify({ sent, skipped }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
