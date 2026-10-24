# Club Event Radar handoff

## What works now

- The public site is live at https://zlee08.github.io/BUS4498_InClass_Builds/ and forwards to the event radar app.
- The website can accept an announcement, submit it to the Supabase Edge Function, and show whether it was published, waiting, rejected, or a duplicate.
- Published events appear in the event board in date order.
- The moderator sign-in section can review waiting posts and approve or reject them.
- The database and AI agent are set up to catch duplicate events, enforce posting rules, and keep most public reads read-only.

## Where files live

- Repository: `zlee08/BUS4498_InClass_Builds`
- Supabase project: the student’s `event-radar` project at `https://hcrbchevcghfitpzzmpo.supabase.co`
- Top-level redirect page: `index.html`
- App folder: `event_radar/`
  - `event_radar/index.html` — page structure
  - `event_radar/app.js` — fetch calls, rendering, sign-in, moderator review
  - `event_radar/config.js` — public Supabase URL and publishable key
  - `event_radar/style.css` — page design and layout
  - `event_radar/context/posting-rules.md` — posting rules used by the AI
  - `event_radar/context/campus-places.md` — valid campus place references
  - `event_radar/supabase/functions/submit-event/index.ts` — AI agent/Edge Function
  - `event_radar/supabase/migrations/` — database changes, one SQL file per stage
  - `event_radar/test/sample-announcements.md` — sample posts and expected results
  - `event_radar/AGENTS.md` — build instructions for the assistant
  - `event_radar/HANDOFF.md` — this document

## Secret names only

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_SECRET_KEY`
- `HOLD_ALL_POSTS`

Set these in Supabase → Edge Functions → Secrets. Do not paste any secret values into this repo or chat. The public site should only use the project URL and the publishable key.

## How to test

Try one post at a time from the website or the sample tests.

- Clean event post (sample A): should publish and show a complete event card with date, time, place, and summary.
- Rule-breaking post (sample D): should go to waiting status for moderator review and not publish as-is.
- Not-an-event post (sample F): should be rejected as a sale, not an event.
- Flyer upload (if stage 7 is active): should show the flyer, wait for moderator review, and then publish only after approval.

## What’s next

- Finish any edge-case cleanup around moderation and duplicate detection.
- Review waiting posts consistently to keep event quality high.
- Add a nightly archive or cleanup for past events if the project needs it.
- Improve the AI prompt and rules if some posts are still vague or inconsistent.
- Keep validating that the public site only reads published rows and never has database write access.

## How we take turns

- Download the latest version before you start (`git pull`).
- Tell the other teammate before editing the same files or the same stage.
- Work in small chunks and leave a short note about what changed.
- Upload your finished work when you stop (`git push`).
- If a change affects the app, the database, or Supabase secrets, say so before the next person continues.
