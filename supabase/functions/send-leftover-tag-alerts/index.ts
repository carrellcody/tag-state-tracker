import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SPECIES = [
  { code: "elk", label: "Elk", file: "elk_Current_Leftover_Tags.csv", url: "https://tallotags.com/Elk-Leftovers" },
  { code: "deer", label: "Deer", file: "deer_Current_Leftover_Tags.csv", url: "https://tallotags.com/Deer-Leftovers" },
  { code: "ant", label: "Pronghorn", file: "ant_Current_Leftover_Tags.csv", url: "https://tallotags.com/Antelope-Leftovers" },
];

const CPW_LEFTOVER_URL = "https://cpw.state.co.us/leftover-list";
const LOGO_URL = "https://tallotags.com/longbluename.png";
const PRIMARY = "#598749";

function parseCSV(text: string): Record<string, string>[] {
  const clean = text.replace(/^\uFEFF/, "").replace(/\u00A0/g, " ");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const splitLine = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') { cur += '"'; i++; }
        else q = !q;
      } else if (ch === "," && !q) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

function findKey(row: Record<string, string>, candidates: string[]): string | null {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const hit = keys.find((k) => k.toLowerCase() === c.toLowerCase());
    if (hit) return hit;
  }
  return null;
}

async function loadSpeciesRows(file: string) {
  const { data, error } = await supabase.storage.from("csv-data").download(file);
  if (error || !data) {
    console.warn(`Could not download ${file}:`, error?.message);
    return null;
  }
  const text = await data.text();
  const rows = parseCSV(text);
  if (rows.length === 0) return { rows: [], tagKey: null, unitKey: null, seasonKey: null };
  const sample = rows[0];
  const tagKey = findKey(sample, ["Tag", "TagCode", "Tag Code", "Hunt Code", "HuntCode"]);
  const unitKey = findKey(sample, ["Unit", "Units", "Hunt Unit", "GMU"]);
  const seasonKey = findKey(sample, ["Season", "Season Description", "SeasonDescription", "Hunt"]);
  return { rows, tagKey, unitKey, seasonKey };
}

function buildEmailHtml(opts: {
  firstName?: string;
  sections: Array<{
    label: string;
    url: string;
    matches: Array<{ tag: string; unit: string; season: string }>;
  }>;
}) {
  const { firstName, sections } = opts;
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  const sectionHtml = sections.map((s) => {
    const rows = s.matches.map((m) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:monospace;font-weight:600;color:${PRIMARY};">${m.tag}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;">${m.unit || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;">${m.season || "—"}</td>
      </tr>`).join("");
    return `
      <div style="margin:24px 0;">
        <h3 style="color:${PRIMARY};margin:0 0 8px 0;font-size:18px;">${s.label} — ${s.matches.length} match${s.matches.length === 1 ? "" : "es"}</h3>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-radius:6px;overflow:hidden;">
          <thead>
            <tr style="background:#f6f8f4;">
              <th align="left" style="padding:10px 12px;font-size:13px;color:#555;">Tag Code</th>
              <th align="left" style="padding:10px 12px;font-size:13px;color:#555;">Unit</th>
              <th align="left" style="padding:10px 12px;font-size:13px;color:#555;">Season</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:10px;">
          <a href="${s.url}" style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:600;">View ${s.label} Leftovers</a>
        </div>
      </div>`;
  }).join("");

  return `
  <div style="background:#f4f6f1;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <div style="background:${PRIMARY};padding:20px;text-align:center;">
        <img src="${LOGO_URL}" alt="Tallo Tags" style="max-height:48px;" />
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 12px 0;font-size:16px;">${greeting}</p>
        <p style="margin:0 0 8px 0;font-size:15px;line-height:1.5;">
          Good news — one or more of the tags on your alert list just showed up on this week's Colorado leftover lists.
        </p>
        ${sectionHtml}
        <div style="margin:28px 0 8px 0;padding:16px;background:#f6f8f4;border-left:4px solid ${PRIMARY};border-radius:4px;">
          <p style="margin:0 0 8px 0;font-size:14px;">
            You can also view the official leftover list directly from Colorado Parks &amp; Wildlife:
          </p>
          <a href="${CPW_LEFTOVER_URL}" style="color:${PRIMARY};font-weight:600;">Official CPW Leftover List →</a>
        </div>
        <p style="margin:24px 0 0 0;font-size:13px;color:#666;">
          Tags get scooped up fast — log into your CPW account to grab one before it's gone.
        </p>
      </div>
      <div style="padding:16px 24px;background:#fafafa;border-top:1px solid #eee;text-align:center;font-size:12px;color:#888;">
        <a href="https://tallotags.com/profile#tag-alerts" style="color:${PRIMARY};text-decoration:none;">Manage your tag alerts</a>
        &nbsp;·&nbsp;
        <a href="https://tallotags.com" style="color:${PRIMARY};text-decoration:none;">tallotags.com</a>
      </div>
    </div>
  </div>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const providedSecret = body?.secret || req.headers.get("x-cron-secret");
    if (providedSecret !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const runId = crypto.randomUUID();
    console.log(`[${runId}] Starting leftover-tag alert run`);

    // Load all species CSVs in parallel
    const speciesData = await Promise.all(
      SPECIES.map(async (sp) => ({ sp, data: await loadSpeciesRows(sp.file) }))
    );

    // Build a normalized lookup: tagCode (uppercase) -> { species, unit, season }
    type Match = { speciesCode: string; speciesLabel: string; url: string; tag: string; unit: string; season: string };
    const tagIndex = new Map<string, Match[]>();
    for (const { sp, data } of speciesData) {
      if (!data || !data.tagKey) continue;
      for (const row of data.rows) {
        const tag = (row[data.tagKey] || "").trim();
        if (!tag) continue;
        const key = tag.toUpperCase();
        const match: Match = {
          speciesCode: sp.code,
          speciesLabel: sp.label,
          url: sp.url,
          tag,
          unit: data.unitKey ? row[data.unitKey] || "" : "",
          season: data.seasonKey ? row[data.seasonKey] || "" : "",
        };
        const arr = tagIndex.get(key) || [];
        arr.push(match);
        tagIndex.set(key, arr);
      }
    }
    console.log(`[${runId}] Indexed ${tagIndex.size} unique tag codes from leftover CSVs`);

    // Get every user with at least one tag alert
    const { data: alerts, error: alertsErr } = await supabase
      .from("tag_alerts")
      .select("user_id, tag_code");
    if (alertsErr) throw alertsErr;

    // Group alerts by user
    const byUser = new Map<string, string[]>();
    for (const a of alerts || []) {
      const arr = byUser.get(a.user_id) || [];
      arr.push(a.tag_code);
      byUser.set(a.user_id, arr);
    }
    console.log(`[${runId}] ${byUser.size} users have tag alerts`);

    let sentCount = 0;
    let skippedCount = 0;

    for (const [userId, codes] of byUser.entries()) {
      // Find matches across species
      const userMatches: Match[] = [];
      for (const code of codes) {
        const hits = tagIndex.get(code.trim().toUpperCase());
        if (hits) userMatches.push(...hits);
      }
      if (userMatches.length === 0) {
        skippedCount++;
        continue;
      }

      // Lookup profile email + name + receive_emails preference
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, first_name, receive_emails")
        .eq("id", userId)
        .maybeSingle();

      if (!profile?.email) {
        skippedCount++;
        continue;
      }
      if (profile.receive_emails === false) {
        skippedCount++;
        continue;
      }

      // Group by species
      const sections = SPECIES
        .map((sp) => ({
          label: sp.label,
          url: sp.url,
          matches: userMatches
            .filter((m) => m.speciesCode === sp.code)
            .map((m) => ({ tag: m.tag, unit: m.unit, season: m.season })),
        }))
        .filter((s) => s.matches.length > 0);

      const html = buildEmailHtml({ firstName: profile.first_name || undefined, sections });
      const totalMatches = userMatches.length;
      const subject = `🎯 ${totalMatches} of your tag alert${totalMatches === 1 ? "" : "s"} just hit the leftover list`;

      try {
        await resend.emails.send({
          from: "Tallo Tags <alerts@tallotags.com>",
          to: [profile.email],
          reply_to: "tallotags@gmail.com",
          subject,
          html,
        });
        sentCount++;
        await supabase.from("leftover_alert_log").insert({
          run_id: runId,
          user_id: userId,
          recipient_email: profile.email,
          match_count: totalMatches,
          matched_codes: userMatches.map((m) => ({ tag: m.tag, species: m.speciesCode, unit: m.unit, season: m.season })),
          status: "sent",
        });
      } catch (sendErr: any) {
        console.error(`[${runId}] Send failed for ${profile.email}:`, sendErr?.message);
        await supabase.from("leftover_alert_log").insert({
          run_id: runId,
          user_id: userId,
          recipient_email: profile.email,
          match_count: totalMatches,
          matched_codes: userMatches.map((m) => ({ tag: m.tag, species: m.speciesCode })),
          status: "failed",
          error_message: String(sendErr?.message || sendErr),
        });
      }
    }

    console.log(`[${runId}] Done. sent=${sentCount} skipped=${skippedCount}`);
    return new Response(
      JSON.stringify({ success: true, run_id: runId, sent: sentCount, skipped: skippedCount, users_with_alerts: byUser.size }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: any) {
    console.error("send-leftover-tag-alerts error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
