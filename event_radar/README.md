# Club Event Radar

This folder is the individual Event Radar build for BUS 4498. It includes a static GitHub Pages site, a Supabase migration, and the `process-event` Edge Function that turns a submission into a reviewable event card.

## Setup checklist

1. Create the Supabase project named `event-radar`.
2. Run `supabase/migrations/20261023000000_event_radar.sql` in the Supabase SQL Editor.
3. In `config.js`, replace the two placeholders with the project URL and `sb_publishable_...` key from Supabase Settings → API Keys. These are the only values that belong in the browser repository.
4. Deploy `supabase/functions/process-event/index.ts` as the `process-event` Edge Function. The included `supabase/config.toml` keeps it publicly callable because the submission form is public; the function validates its input and uses the service key only inside Supabase.
5. Add these Supabase Edge Function Secrets. Choose one provider:
   - OpenAI: `AI_PROVIDER=openai`, `AI_MODEL=gpt-4o-mini`, `OPENAI_API_KEY=...`
   - Claude: `AI_PROVIDER=anthropic`, `AI_MODEL=claude-3-5-haiku-latest`, `ANTHROPIC_API_KEY=...`
6. In Supabase Auth, create the moderator account manually, then turn off new user sign-ups. The RLS policies treat authenticated accounts as moderators for this class prototype.
7. Publish the `event_radar` folder with GitHub Pages. Open the Pages URL and test the public feed, submission form, moderator sign-in, approval, and flyer upload.

## Security notes

`config.js` may contain only the Supabase URL and publishable key. Never commit `sb_secret_...`, a legacy service-role key, database passwords, or AI keys. The SQL enables RLS so anonymous visitors can read approved events only; moderator operations require an authenticated session. The Edge Function reads its AI and server keys from Supabase Secrets.

## Individual scope

This build intentionally leaves the teammate-only repository exchange and the partner-specific “Free food only” button for the collaboration step.
