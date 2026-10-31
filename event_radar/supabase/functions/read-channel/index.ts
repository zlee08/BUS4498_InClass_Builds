// Week 10 GroupMe reader. Keep the access token in Supabase Secrets.
// The reader remembers message IDs so a polling run does not submit duplicates.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function serverKey() {
  const named = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (named) {
    try { return JSON.parse(named).default || ""; } catch (_) { /* use legacy fallback */ }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS });
  // Match the Week 10 builder's secret names. Keep the older alias working too.
  const token = Deno.env.get("GROUPME_TOKEN") || Deno.env.get("GROUPME_ACCESS_TOKEN");
  const groupId = Deno.env.get("GROUPME_GROUP_ID");
  const botId = Deno.env.get("GROUPME_BOT_ID");
  if (request.method === "GET") {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, serverKey(), { auth: { persistSession: false } });
    const { data: last } = await db.from("channel_messages").select("message_id,processed_at").eq("source", "groupme").not("processed_at", "is", null).order("processed_at", { ascending: false }).limit(1).maybeSingle();
    const { count } = await db.from("channel_messages").select("id", { count: "exact", head: true }).eq("source", "groupme").not("processed_at", "is", null);
    const url = new URL(request.url);
    if (url.searchParams.get("check") === "groupme" && token && groupId) {
      const checkResponse = await fetch(`https://api.groupme.com/v3/groups/${encodeURIComponent(groupId)}/messages?limit=1`, { headers: { "X-Access-Token": token, "Accept": "application/json" } });
      const checkData = await checkResponse.json().catch(() => ({}));
      const tokenWorks = checkResponse.status !== 401 && checkResponse.status !== 403;
      return reply(200, {
        ok: true,
        ready: true,
        bot: Boolean(botId),
        groupme: { token_works: tokenWorks, group_found: checkResponse.ok, message: checkResponse.ok ? "GroupMe can read this group." : String(checkData?.meta?.errors?.[0] || "GroupMe could not read this group.") },
        last_message_id: last?.message_id || "",
        read_count: count || 0,
        last_run: last?.processed_at || "",
      });
    }
    return reply(200, { ok: true, ready: Boolean(token && groupId), bot: Boolean(botId), last_message_id: last?.message_id || "", read_count: count || 0, last_run: last?.processed_at || "", message: token && groupId ? "The GroupMe reader is configured." : "Add GROUPME_TOKEN and GROUPME_GROUP_ID in Supabase Secrets." });
  }
  if (request.method !== "POST") return reply(405, { ok: false, message: "Use POST to read the channel." });
  if (!token || !groupId) return reply(503, { ok: false, message: "The GroupMe reader is missing its Supabase Secrets." });

  try {
    let limit = 20;
    try { limit = Math.min(100, Math.max(1, Number((await request.json()).limit || 20))); } catch (_) { /* default */ }
    const groupResponse = await fetch(`https://api.groupme.com/v3/groups/${encodeURIComponent(groupId)}/messages?limit=${limit}`, {
      headers: { "X-Access-Token": token, "Accept": "application/json" },
    });
    const groupData = await groupResponse.json();
    if (!groupResponse.ok) return reply(502, { ok: false, message: "GroupMe did not return the channel messages." });

    const db = createClient(Deno.env.get("SUPABASE_URL")!, serverKey(), { auth: { persistSession: false } });
    const secretKey = serverKey();
    const functionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/submit-event`;
    const messages = [...(groupData.response?.messages || [])].reverse();
    const processed: Array<Record<string, unknown>> = [];
    for (const message of messages) {
      const messageId = String(message.id || "");
      const text = String(message.text || "").trim();
      if (!messageId || !text) continue;
      const { data: seen } = await db.from("channel_messages").select("id").eq("source", "groupme").eq("message_id", messageId).maybeSingle();
      if (seen) continue;
      const senderName = String(message.name || "").slice(0, 120);
      const { data: saved } = await db.from("channel_messages").insert({ source: "groupme", message_id: messageId, sender_name: senderName, message_text: text }).select("id").single();
      if (!saved) continue;
      const agentResponse = await fetch(functionUrl, { method: "POST", headers: { apikey: secretKey, "Content-Type": "application/json" }, body: JSON.stringify({ announcement: text, sender_name: senderName, source: "groupme", source_message_id: messageId }) });
      const result = await agentResponse.json().catch(() => ({ ok: false, message: `submit-event returned ${agentResponse.status}` }));
      await db.from("channel_messages").update({ processed_at: new Date().toISOString(), response_status: String(result.status || result.message || "error") }).eq("id", saved.id);
      processed.push({ message_id: messageId, sender_name: senderName, status: result.status || "error" });
    }
    return reply(200, { ok: true, processed, message: processed.length ? `Processed ${processed.length} new GroupMe message(s).` : "No new GroupMe messages." });
  } catch (error) {
    console.error(error);
    return reply(500, { ok: false, message: "The GroupMe reader failed. Check the function logs." });
  }
});
