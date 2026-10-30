// Club Event Radar: the chat-channel reader for GroupMe (Supabase Edge Function "read-channel").
// A scheduled job calls it every minute (and GroupMe's bot callback can call it right away).
// It reads the group's new messages, sends each one to the AI agent (submit-event),
// and posts the agent's decision back to the group. The bookmark in channel_cursor
// makes sure no message is read twice.

import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const SOURCE = "groupme";
const GROUPME_API = "https://api.groupme.com/v3";
const MAX_MESSAGES = 20;
const THREAD_SECONDS = 10 * 60;
const MAX_THREAD = 4;
const MAX_REPLY_CHARS = 1000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, content-type, authorization, x-client-info",
};

type GroupMeMessage = {
  id: string;
  created_at: number;
  user_id: string;
  sender_id: string;
  sender_type: string;
  name: string;
  text: string | null;
  system: boolean;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function secretKey(): string {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keys) {
    try {
      const parsed = JSON.parse(keys);
      if (parsed?.default) return parsed.default;
    } catch {
      // Fall through to the older variable.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

// The key the reader uses to call the agent: the publishable key the scheduled job sent,
// or the project's own publishable key.
function publishableKey(req: Request): string {
  const sent = req.headers.get("apikey") ?? "";
  if (sent.startsWith("sb_publishable_")) return sent;
  const keys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (keys) {
    try {
      const parsed = JSON.parse(keys);
      if (parsed?.default) return parsed.default;
    } catch {
      // Fall through to the older variable.
    }
  }
  return Deno.env.get("SUPABASE_ANON_KEY") ?? sent;
}

function settings() {
  return {
    token: Deno.env.get("GROUPME_TOKEN") ?? "",
    groupId: Deno.env.get("GROUPME_GROUP_ID") ?? "",
    botId: Deno.env.get("GROUPME_BOT_ID") ?? "",
  };
}

// Reads one page of the group's messages. GroupMe answers 304 when there is nothing new.
async function groupMessages(params: Record<string, string>): Promise<GroupMeMessage[]> {
  const { token, groupId } = settings();
  const query = new URLSearchParams({ ...params, limit: String(MAX_MESSAGES) });
  const response = await fetch(`${GROUPME_API}/groups/${encodeURIComponent(groupId)}/messages?${query}`, {
    headers: { "X-Access-Token": token },
  });
  if (response.status === 304) return [];
  if (!response.ok) throw new Error(`GroupMe answered ${response.status} when reading messages.`);
  const data = await response.json();
  return (data?.response?.messages ?? []) as GroupMeMessage[];
}

function oldestFirst(messages: GroupMeMessage[]): GroupMeMessage[] {
  return [...messages].sort((a, b) =>
    a.created_at - b.created_at || (BigInt(a.id) < BigInt(b.id) ? -1 : BigInt(a.id) > BigInt(b.id) ? 1 : 0)
  );
}

// Skip the bot's own replies, GroupMe's system messages, and photos without text.
function isReadable(message: GroupMeMessage): boolean {
  return message.sender_type !== "bot" && message.sender_type !== "system" && !message.system &&
    typeof message.text === "string" && message.text.trim().length > 0;
}

// The same sender's messages from the 10 minutes before this one (at most 4, oldest first).
async function threadFor(message: GroupMeMessage): Promise<string[]> {
  const earlier = await groupMessages({ before_id: message.id });
  return oldestFirst(earlier)
    .filter((m) =>
      isReadable(m) && m.sender_id === message.sender_id && message.created_at - m.created_at <= THREAD_SECONDS
    )
    .slice(-MAX_THREAD)
    .map((m) => (m.text ?? "").trim());
}

async function postToGroup(text: string): Promise<boolean> {
  const { botId } = settings();
  if (!botId) return false;
  const response = await fetch(`${GROUPME_API}/bots/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bot_id: botId, text: text.slice(0, MAX_REPLY_CHARS) }),
  });
  if (!response.ok) console.error(`GroupMe answered ${response.status} when posting the reply.`);
  return response.ok;
}

function when(event: { event_date?: string | null; start_time?: string | null }): string {
  const parts: string[] = [];
  if (event?.event_date) {
    parts.push(new Date(event.event_date + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
    }));
  }
  if (event?.start_time) {
    const [h, m] = event.start_time.split(":").map(Number);
    parts.push(`${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`);
  }
  return parts.join(", ");
}

// The agent's decision in one or two plain lines for the group.
// deno-lint-ignore no-explicit-any
function replyText(name: string, result: any): string {
  if (!result?.ok) return `Event Radar couldn't read ${name}'s post: ${result?.message ?? "something went wrong."}`;
  const title = result.event?.title ? `“${result.event.title}”` : "the event";
  const date = result.event ? when(result.event) : "";
  const reasons = (result.reasons ?? []).join(" ");
  switch (result.status) {
    case "published":
      return result.replaced
        ? `✅ Updated on Event Radar: ${title}${date ? ` (${date})` : ""}. It replaces the earlier post.`
        : `✅ On Event Radar: ${title}${date ? ` (${date})` : ""}.`;
    case "waiting":
      return `⏳ ${title} is waiting for a moderator. ${reasons}`.trim();
    case "rejected":
      return `Not posted: ${reasons || "this doesn't look like an event."}`;
    case "duplicate":
      return "Already on Event Radar (same date, start time, and place).";
    default:
      return result.message ?? "";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const { token, groupId, botId } = settings();
  const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", secretKey(), { auth: { persistSession: false } });

  try {
    if (req.method === "GET") {
      // ?check=groupme asks GroupMe whether the token, the group, and the bot work. Results only, never values.
      if (new URL(req.url).searchParams.get("check") === "groupme") {
        const result = { ok: true, token: false, group: false, bot: null as boolean | null, message: "" };
        if (!token || !groupId) {
          result.message = "Add GROUPME_TOKEN and GROUPME_GROUP_ID in Supabase → Edge Functions → Secrets.";
          return json(result);
        }
        const me = await fetch(`${GROUPME_API}/users/me`, { headers: { "X-Access-Token": token } });
        result.token = me.ok;
        if (me.ok) {
          const group = await fetch(`${GROUPME_API}/groups/${encodeURIComponent(groupId)}`, {
            headers: { "X-Access-Token": token },
          });
          result.group = group.ok;
          if (botId) {
            const bots = await fetch(`${GROUPME_API}/bots`, { headers: { "X-Access-Token": token } });
            const list = bots.ok ? (await bots.json())?.response ?? [] : [];
            result.bot = list.some((b: { bot_id: string; group_id: string }) => b.bot_id === botId && b.group_id === groupId);
          }
        }
        result.message = !result.token
          ? "GroupMe didn't accept the token."
          : !result.group
          ? "The token works, but GroupMe can't find that group (or the token's account isn't in it)."
          : result.bot === false
          ? "The token and the group work, but the bot isn't in this group, so replies won't be posted."
          : result.bot === null
          ? "The token and the group work. No bot is set, so the reader won't reply in the group."
          : "The token, the group, and the bot all work.";
        return json(result);
      }

      const { data: cursor } = await db.from("channel_cursor").select("last_id, read_count").eq("source", SOURCE)
        .maybeSingle();
      return json({
        ok: true,
        ready: Boolean(token && groupId && secretKey()),
        last_message_id: cursor?.last_id || null,
        read_count: cursor?.read_count ?? 0,
        bot: Boolean(botId),
      });
    }

    if (req.method !== "POST") {
      return json({ ok: false, message: "Use POST to read new messages." }, 405);
    }
    if (!token || !groupId) {
      return json({ ok: false, message: "Add GROUPME_TOKEN and GROUPME_GROUP_ID in Supabase → Edge Functions → Secrets." }, 503);
    }

    // The bookmark. On the first run, remember the newest message and stop: never read old history.
    const { data: cursor, error: cursorError } = await db
      .from("channel_cursor")
      .select("last_id, read_count")
      .eq("source", SOURCE)
      .maybeSingle();
    if (cursorError) throw new Error(`Couldn't read the bookmark: ${cursorError.message}`);
    if (!cursor?.last_id) {
      const newest = oldestFirst(await groupMessages({})).pop();
      const { error } = await db.from("channel_cursor").upsert({
        source: SOURCE,
        last_id: newest?.id ?? "0",
        read_count: 0,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(`Couldn't save the bookmark: ${error.message}`);
      return json({ ok: true, first_run: true, read: 0, last_message_id: newest?.id ?? "0" });
    }

    const messages = oldestFirst(await groupMessages({ after_id: cursor.last_id }));
    const agentUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/submit-event`;
    const apikey = publishableKey(req);
    let lastId = cursor.last_id;
    let readCount = cursor.read_count ?? 0;
    let sent = 0;

    for (const message of messages) {
      if (isReadable(message)) {
        const thread = await threadFor(message);
        const response = await fetch(agentUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey },
          body: JSON.stringify({
            announcement: (message.text ?? "").trim().slice(0, 2000),
            source: SOURCE,
            source_id: message.id,
            source_name: message.name ?? "",
            thread,
          }),
        });
        const result = await response.json().catch(() => ({ ok: false, message: `the agent answered ${response.status}.` }));
        if (!result?.already_read) {
          const reply = replyText(message.name || "someone", result);
          if (reply && await postToGroup(reply)) sent++;
        }
      }
      // Move the bookmark past every message read, including skipped ones.
      lastId = message.id;
      readCount++;
      const { error } = await db.from("channel_cursor").update({
        last_id: lastId,
        read_count: readCount,
        updated_at: new Date().toISOString(),
      }).eq("source", SOURCE);
      if (error) throw new Error(`Couldn't move the bookmark: ${error.message}`);
    }

    return json({ ok: true, read: messages.length, replies: sent, last_message_id: lastId });
  } catch (error) {
    console.error(error);
    return json({ ok: false, message: "The reader couldn't finish. Check the function logs." }, 500);
  }
});
