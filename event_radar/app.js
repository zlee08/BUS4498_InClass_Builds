import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const isConfigured = SUPABASE_URL.includes("supabase.co") && !SUPABASE_URL.includes("YOUR_PROJECT") && SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_") && !SUPABASE_PUBLISHABLE_KEY.includes("REPLACE_ME");
const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
const $ = (id) => document.getElementById(id);
const state = { events: [], session: null };

function setStatus(message, tone = "") {
  const node = $("status");
  node.textContent = message;
  node.dataset.tone = tone;
}

function formatDate(value) {
  if (!value) return "Date to be announced";
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function formatTime(value) {
  if (!value) return "Time to be announced";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function categoryLabel(value) {
  return { workshop: "Workshop", social: "Social", career: "Career", arts: "Arts & culture", sports: "Sports", other: "Other" }[value] || "Event";
}

function renderEvents() {
  const query = $("search").value.trim().toLowerCase();
  const category = $("category-filter").value;
  const visible = state.events.filter((event) => {
    const haystack = `${event.title} ${event.summary || ""} ${event.location || ""}`.toLowerCase();
    return (category === "all" || event.category === category) && (!query || haystack.includes(query));
  });
  const grid = $("event-grid");
  grid.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.events.length ? "No approved events match that search." : "No approved events yet. Be the first to send one in.";
    grid.append(empty);
    return;
  }
  for (const event of visible) grid.append(createEventCard(event));
}

function createEventCard(event) {
  const card = document.createElement("article");
  card.className = "event-card";
  const image = document.createElement("div");
  image.className = "event-card-image";
  if (event.flyer_path && supabase) {
    const { data } = supabase.storage.from("event-flyers").getPublicUrl(event.flyer_path);
    const img = document.createElement("img");
    img.src = data.publicUrl;
    img.alt = `${event.title} flyer`;
    image.append(img);
  } else image.textContent = "✦";
  const content = document.createElement("div");
  content.className = "event-card-content";
  const tag = document.createElement("div");
  tag.className = "tag";
  tag.textContent = categoryLabel(event.category);
  const title = document.createElement("h3");
  title.textContent = event.title;
  const summary = document.createElement("p");
  summary.textContent = event.summary || "More details coming soon.";
  const meta = document.createElement("div");
  meta.className = "event-meta";
  meta.append(`${formatDate(event.event_date)} · ${formatTime(event.starts_at)}`);
  meta.append(document.createElement("br"));
  meta.append(event.location || "Location to be announced");
  content.append(tag, title, summary, meta);
  card.append(image, content);
  return card;
}

async function loadEvents() {
  if (!supabase) {
    setStatus("Add the Supabase URL and publishable key to event_radar/config.js to load live events.", "warning");
    renderEvents();
    return;
  }
  setStatus("Loading approved events…");
  const { data, error } = await supabase.from("events").select("id,title,summary,event_date,starts_at,location,category,flyer_path").eq("status", "approved").order("event_date", { ascending: true });
  if (error) {
    setStatus(`Could not load events: ${error.message}`, "error");
    return;
  }
  state.events = data || [];
  setStatus("");
  renderEvents();
}

async function submitEvent(form) {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const formData = new FormData(form);
  const date = formData.get("event_date");
  const startTime = formData.get("start_time");
  const startsAt = startTime ? `${date}T${startTime}:00` : null;
  const postText = [formData.get("title"), formData.get("description"), `Date: ${date}`, startsAt ? `Start time: ${startTime}` : "", `Location: ${formData.get("location")}`].filter(Boolean).join("\n");
  const { data, error } = await supabase.functions.invoke("process-event", { body: { post_text: postText, title: formData.get("title"), description: formData.get("description"), event_date: date, starts_at: startsAt, location: formData.get("location"), category: formData.get("category") } });
  if (error) throw error;
  if (data?.duplicate) throw new Error("That event looks like a duplicate of an existing submission.");
  return data;
}

async function refreshSession() {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  state.session = data.session;
}

function renderModeratorView() {
  const signedIn = Boolean(state.session);
  $("auth-view").hidden = signedIn;
  $("dashboard-view").hidden = !signedIn;
  if (signedIn) loadModeratorEvents();
}

async function loadModeratorEvents() {
  const container = $("moderator-events");
  container.textContent = "Loading submissions…";
  const { data, error } = await supabase.from("events").select("id,title,summary,event_date,starts_at,location,category,status,flyer_path").order("created_at", { ascending: false });
  if (error) { container.textContent = error.message; return; }
  container.replaceChildren();
  if (!data?.length) { container.textContent = "No submissions yet."; return; }
  for (const event of data) {
    const row = document.createElement("article");
    row.className = "moderator-event";
    const title = document.createElement("h3"); title.textContent = event.title;
    const details = document.createElement("p"); details.textContent = `${event.status} · ${formatDate(event.event_date)} · ${event.location || "No location"}`;
    const actions = document.createElement("div"); actions.className = "moderator-event-actions";
    if (event.status === "pending") {
      for (const status of ["approved", "rejected"]) {
        const button = document.createElement("button"); button.className = status === "approved" ? "button button-small button-primary" : "button button-small button-ghost"; button.type = "button"; button.textContent = status === "approved" ? "Approve" : "Reject";
        button.addEventListener("click", () => updateEventStatus(event.id, status)); actions.append(button);
      }
    }
    if (event.status === "approved") {
      const upload = document.createElement("input"); upload.type = "file"; upload.accept = "image/*"; upload.setAttribute("aria-label", `Upload flyer for ${event.title}`); upload.addEventListener("change", (e) => uploadFlyer(event, e.target.files[0])); actions.append(upload);
    }
    row.append(title, details, actions); container.append(row);
  }
}

async function updateEventStatus(id, status) {
  const { error } = await supabase.from("events").update({ status, moderated_at: new Date().toISOString() }).eq("id", id);
  if (error) alert(error.message); else { await loadModeratorEvents(); await loadEvents(); }
}

async function uploadFlyer(event, file) {
  if (!file) return;
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const path = `${event.id}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("event-flyers").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) { alert(uploadError.message); return; }
  const { error } = await supabase.from("events").update({ flyer_path: path }).eq("id", event.id);
  if (error) alert(error.message); else { await loadModeratorEvents(); await loadEvents(); }
}

$("search").addEventListener("input", renderEvents);
$("category-filter").addEventListener("change", renderEvents);
$("submit-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = $("submit-status");
  status.textContent = "The event agent is preparing your card…";
  try {
    await submitEvent(event.currentTarget);
    event.currentTarget.reset();
    status.textContent = "Submitted for moderator review. Thanks for helping the radar grow.";
  } catch (error) { status.textContent = error.message || "Submission failed. Try again."; }
});

$("moderator-toggle").addEventListener("click", () => { $("moderator-dialog").showModal(); renderModeratorView(); });
$("dialog-close").addEventListener("click", () => $("moderator-dialog").close());
$("sign-in-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const { data, error } = await supabase.auth.signInWithPassword({ email: formData.get("email"), password: formData.get("password") });
  if (error) { $("auth-status").textContent = error.message; return; }
  state.session = data.session; $("auth-status").textContent = ""; renderModeratorView();
});
$("sign-out").addEventListener("click", async () => { await supabase.auth.signOut(); state.session = null; renderModeratorView(); });

if (supabase) supabase.auth.onAuthStateChange((_event, session) => { state.session = session; renderModeratorView(); });
await refreshSession();
await loadEvents();
