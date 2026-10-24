import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function getSecretKey() {
  const named = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (named) return JSON.parse(named).default;
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
}

function cleanJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("The AI response was not valid JSON.");
  return JSON.parse(candidate.slice(start, end + 1));
}

async function askOpenAI(prompt: string, apiKey: string, model: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, temperature: 0.1, response_format: { type: "json_object" }, messages: [{ role: "system", content: "You convert student event posts into concise structured event cards. Return JSON only." }, { role: "user", content: prompt }] }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "OpenAI request failed.");
  return cleanJson(body.choices?.[0]?.message?.content || "");
}

async function askAnthropic(prompt: string, apiKey: string, model: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" }, body: JSON.stringify({ model, max_tokens: 700, temperature: 0.1, system: "You convert student event posts into concise structured event cards. Return JSON only.", messages: [{ role: "user", content: prompt }] }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Anthropic request failed.");
  return cleanJson(body.content?.[0]?.text || "");
}

async function hash(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Use POST." }, 405);
  try {
    const input = await request.json();
    const title = String(input.title || "").trim();
    const description = String(input.description || input.post_text || "").trim();
    const eventDate = String(input.event_date || "").trim();
    const location = String(input.location || "").trim();
    if (!title || !description || !eventDate || !location) return json({ error: "Title, description, date, and location are required." }, 400);
    if (description.length > 2000) return json({ error: "Description is too long." }, 400);

    const provider = (Deno.env.get("AI_PROVIDER") || "openai").toLowerCase();
    const model = Deno.env.get("AI_MODEL") || (provider === "anthropic" ? "claude-3-5-haiku-latest" : "gpt-4o-mini");
    const apiKey = provider === "anthropic" ? Deno.env.get("ANTHROPIC_API_KEY") : Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return json({ error: `Missing ${provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"} Supabase Secret.` }, 500);
    const prompt = `Create an event card from this submission. Keep the summary under 240 characters. Use the provided date and location exactly. Return only JSON with keys: title, summary, category (one of workshop, social, career, arts, sports, other), is_free_food (boolean), confidence (number 0 to 1), starts_at (ISO timestamp or null).\n\nTitle: ${title}\nDate: ${eventDate}\nStart time: ${input.starts_at || "unknown"}\nLocation: ${location}\nCategory hint: ${input.category || "other"}\nDescription: ${description}`;
    const ai = provider === "anthropic" ? await askAnthropic(prompt, apiKey, model) : await askOpenAI(prompt, apiKey, model);
    const normalizedTitle = String(ai.title || title).trim().slice(0, 120);
    const normalizedSummary = String(ai.summary || description).trim().slice(0, 800);
    const contentHash = await hash(`${normalizedTitle.toLowerCase()}|${eventDate}|${location.toLowerCase()}`);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, getSecretKey()!);
    const { data: existing } = await supabase.from("events").select("id,title,status").eq("content_hash", contentHash).maybeSingle();
    if (existing) return json({ duplicate: true, existing }, 409);
    const startsAt = input.starts_at || ai.starts_at || null;
    const { data, error } = await supabase.from("events").insert({ title: normalizedTitle, summary: normalizedSummary, description, event_date: eventDate, starts_at: startsAt, location, category: ["workshop", "social", "career", "arts", "sports", "other"].includes(ai.category) ? ai.category : (input.category || "other"), is_free_food: Boolean(ai.is_free_food), status: "pending", content_hash: contentHash, ai_confidence: Number.isFinite(Number(ai.confidence)) ? Math.max(0, Math.min(1, Number(ai.confidence))) : null, ai_provider: provider, ai_model: model }).select("id,title,status").single();
    if (error) {
      if (error.code === "23505") return json({ duplicate: true, error: "A matching event was already submitted." }, 409);
      throw error;
    }
    return json({ event: data, message: "Submitted for moderator review." }, 201);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Unexpected function error." }, 500);
  }
});
