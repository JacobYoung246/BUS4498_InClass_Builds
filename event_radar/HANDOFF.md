# Club Event Radar: handoff notes for Sanya

## 1. What works now

**Website:** https://jacobyoung246.github.io/BUS4498_InClass_Builds/event_radar/

- **Posting:** A club officer pastes an announcement, with an optional JPG or PNG flyer up to 5 MB. The AI agent turns it into an event card and checks the posting rules.
- **The answer:** Each post comes back as **Published**, **Waiting for a moderator** (with the reasons), **Not posted** (not an event), or **Already posted** (same date, start time, and place as a live post).
- **Rules the agent applies:** Posts with a photo always wait for a moderator. Phone numbers and payment handles are kept off the website.
- **The event list:** It shows published events, soonest first, with a **🍕 Free food** filter.
- **Moderators:** They sign in at the bottom of the page and **Approve** or **Reject** waiting posts. New sign-ups are turned off, so only accounts added in Supabase can sign in.

## 2. Where things live

- **GitHub repository:** `JacobYoung246/BUS4498_InClass_Builds`. This project is in the `event_radar/` folder. The top-level `index.html` forwards visitors to it.
- **Supabase project:** `event-radar`. Project URL: `https://uxffylbnvxxqrypjebdm.supabase.co`
- **Files that matter:**
  - `index.html`, `app.js`, `style.css`: the website. Keep `style.css` as it is.
  - `config.js`: the Project URL and the publishable key. Both are public.
  - `supabase/functions/submit-event/index.ts`: the AI agent, a Supabase **Edge Function**. It's deployed with **Verify JWT** turned off.
  - `supabase/migrations/`: the database changes, one file per stage, for the `events` table, the `flyers` storage bucket, and moderator access.
  - `context/posting-rules.md` and `context/campus-places.md`: the rules and place list. Copies are inside `index.ts`, so change both together.
  - `test/sample-announcements.md` and `test/sample-flyer.png`: test posts and what should happen.
  - `AGENTS.md`: the full build instructions for Claude Code or Codex.

## 3. Secrets

- **What's set:** `ANTHROPIC_API_KEY`, the AI key, in Supabase → **Edge Functions** → **Secrets**. Supabase also provides `SUPABASE_URL` and `SUPABASE_SECRET_KEYS` to the agent automatically.
- **Optional:** `HOLD_ALL_POSTS=true` makes every post wait. `ANTHROPIC_WORKSPACE_ID` is needed only if the AI key wasn't made inside a workspace.
- **You don't need any of the values.** Never put a secret key, an AI key, or the database password in a file or in chat.

## 4. How to test

Post these on the website (the text is in `test/sample-announcements.md`):

1. **Post A (Board Game Guild game night):** Published, Thursday, Oct 29, 7:00 PM to 10:00 PM, University Union (UU), Room 220, Free, 🍕 Free food. Post it again and it should say **Already posted**.
2. **Post D (house party with BYOB, Venmo, and a phone number):** **Waiting for a moderator**, flagged as off campus, alcohol, a personal payment handle, and a personal phone number. The phone number and Venmo handle stay off the card.
3. **Post F (textbook for sale):** **Not posted**, because it's a sale, not an event.

To test moderators, sign in under **Moderator sign-in**, approve the **Clothing Swap** flyer post, and check that it appears in the list with its photo.

## 5. What's next

- **Not tried yet:** The **Clothing Swap** flyer post and four other posts are still waiting. Approving from the website hasn't been tried yet.
- **Past events stay listed:** Nothing removes past events yet. The optional nightly clean-up in `AGENTS.md` would archive them each night.
- **No editing:** A club can't fix a waiting post (for example, add a missing place). It has to post again.
- **Leftover duplicate:** The repository has an extra copy of the starter kit in `event-radar-kit/`, plus `.DS_Store` files. They're safe to delete.
- **Supabase suggestion:** Turn on **leaked password protection** (Authentication → Sign In / Providers → Email).
- **Ideas:**
  - a way for clubs to edit a post
  - a Rejected list for moderators
  - an email to the club when its post is approved

## 6. How we take turns

1. **Before you start:** Tell the other person you're working on it, so we don't change the same files at once.
2. **Download first:** In GitHub Desktop, click **Fetch origin**, then **Pull origin**, so you have the latest version.
3. **Upload when you stop:** Commit with a short summary, click **Push origin**, and tell the other person you're done.
