# Club Event Radar

A BUS 4498 practice build (Week 9, Friday Build 3). Club officers paste an announcement, an AI agent turns it into an event card and checks the posting rules, and the post is either published or held for a moderator.

## How it's hosted

| Part | What it does | Here |
|---|---|---|
| GitHub repository | Holds the code | This folder |
| GitHub Pages | Serves the public website | `index.html`, `style.css`, `app.js`, `config.js` |
| Supabase project | The backend | The database, the AI agent, the photos, the sign-in |
| Database table | Saves every post and its status | `events` |
| Edge Function | The AI agent | `supabase/functions/submit-event` |
| Secrets | Hold the AI key, which is never in this repository | Set in Supabase |
| Storage | Keeps flyer photos | The `flyers` bucket |
| Sign-in | Moderator accounts | Supabase Auth |

## Files

- `context/`: the posting rules and campus places (stable context).
- `test/`: sample posts, what should happen, and the test log.
- `supabase/migrations/`: the database changes, one per stage.
- `AGENTS.md` and `CLAUDE.md`: instructions for Claude Code and Codex.
- `HANDOFF.md`: handoff notes for a teammate.

Every club, event, and person in the sample posts is made up.

## Week 10 memory additions

- `supabase/migrations/20261030000100_club_list.sql` adds the moderator-managed club list. The agent matches aliases to official names and holds unknown clubs for review.
- `supabase/migrations/20261030000200_club_history.sql` adds private agent notes, recent event history, and processed chat-message IDs. The agent reads the latest ten earlier posts before deciding whether a new post is an update.
- `supabase/migrations/20261030000300_lessons.sql` adds moderator lessons. Only signed-in moderators can create or switch them off.
- `supabase/functions/read-channel/index.ts` reads new GroupMe messages. Set `GROUPME_TOKEN`, `GROUPME_GROUP_ID`, and optionally `GROUPME_BOT_ID` as Supabase Edge Function Secrets; never put these values in GitHub.

Apply the three new SQL files in order, deploy both Edge Functions, then add a club in Table Editor before testing a post from that club. In the moderator panel, add a lesson and submit a new post to confirm the agent uses it. A public post that says it is a lesson is treated as event data and cannot change the lessons table.
