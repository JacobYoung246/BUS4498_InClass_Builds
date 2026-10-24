// Club Event Radar: the website.
// Reads published events from Supabase and sends new announcements to the AI agent (the submit-event Edge Function).
// User text is always shown with textContent, never innerHTML.

(function () {
  const config = window.EVENT_RADAR_CONFIG || {};
  const AGENT_URL = config.supabaseUrl + "/functions/v1/submit-event";
  const PUBLIC_COLUMNS = "id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary, flyer_url";
  // Only show photos stored in this project's flyers bucket.
  const FLYER_PREFIX = config.supabaseUrl + "/storage/v1/object/public/flyers/";
  const MAX_FLYER_BYTES = 5 * 1024 * 1024;

  const db = window.supabase.createClient(config.supabaseUrl, config.publishableKey);

  const form = document.getElementById("post-form");
  const textarea = document.getElementById("announcement");
  const flyerInput = document.getElementById("flyer");
  const postButton = document.getElementById("post-button");
  const result = document.getElementById("result");
  const board = document.getElementById("board");
  const refreshButton = document.getElementById("refresh");
  const chips = document.querySelectorAll(".chip");

  let events = [];
  let filter = "all";

  // ---------- small helpers ----------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // "2026-10-29" -> a local Date (no time-zone shift).
  function parseDate(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // "19:00:00" -> "7:00 PM"
  function formatTime(hms) {
    if (!hms) return "";
    const [h, m] = hms.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ":" + String(m).padStart(2, "0") + " " + suffix;
  }

  function whenText(event) {
    const parts = [];
    if (event.event_date) {
      parts.push(parseDate(event.event_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    } else {
      parts.push("Date to be announced");
    }
    if (event.start_time) {
      let time = formatTime(event.start_time);
      if (event.end_time) time += " to " + formatTime(event.end_time);
      parts.push(time);
    }
    return parts.join(" · ");
  }

  // ---------- event cards ----------

  function eventCard(event) {
    const li = el("li", "event");

    let date;
    if (event.event_date) {
      const d = parseDate(event.event_date);
      date = el("div", "date");
      date.append(
        el("span", "mon", d.toLocaleDateString("en-US", { month: "short" })),
        el("span", "day", String(d.getDate()))
      );
    } else {
      date = el("div", "date tba");
      date.append(el("span", "day", "TBA"));
    }

    const body = el("div", "event-body");
    body.append(el("p", "when", whenText(event)));
    body.append(el("h3", "", event.title || "Untitled event"));

    const place = [event.place_name, event.place_detail].filter(Boolean).join(", ");
    const meta = [event.club, place].filter(Boolean).join(" · ");
    if (meta) body.append(el("p", "meta", meta));
    if (event.summary) body.append(el("p", "summary", event.summary));

    const tags = el("p", "tags");
    if (event.cost) tags.append(el("span", "tag", event.cost));
    if (event.free_food) tags.append(el("span", "tag food", "🍕 Free food"));
    if (tags.children.length) body.append(tags);

    li.append(date, body);

    if (event.flyer_url && event.flyer_url.startsWith(FLYER_PREFIX)) {
      const img = el("img", "flyer");
      img.src = event.flyer_url;
      img.alt = "Flyer for " + (event.title || "this event");
      img.loading = "lazy";
      li.append(img);
    }
    return li;
  }

  function renderBoard() {
    const shown = filter === "food" ? events.filter((e) => e.free_food) : events;
    board.replaceChildren();
    if (shown.length === 0) {
      board.append(el("li", "empty", filter === "food" ? "No free-food events right now." : "No events yet. Post the first one!"));
      return;
    }
    shown.forEach((event) => board.append(eventCard(event)));
  }

  async function loadEvents() {
    refreshButton.disabled = true;
    const { data, error } = await db
      .from("events")
      .select(PUBLIC_COLUMNS)
      .eq("status", "published")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });
    refreshButton.disabled = false;

    if (error) {
      board.replaceChildren(el("li", "empty", "Couldn't load events right now. Please try Refresh in a minute."));
      console.error(error);
      return;
    }
    events = data || [];
    renderBoard();
  }

  // ---------- the agent's answer ----------

  const LABELS = {
    published: "Published",
    waiting: "Waiting for a moderator",
    rejected: "Not posted",
    duplicate: "Already posted",
    error: "Something went wrong",
  };

  function showResult(kind, message, reasons) {
    result.className = "result " + kind;
    result.replaceChildren(el("p", "result-label", LABELS[kind] || LABELS.error));
    if (message) result.append(el("p", "", message));
    if (reasons && reasons.length) {
      const list = el("ul", "reasons");
      reasons.forEach((reason) => list.append(el("li", "", reason)));
      result.append(list);
    }
    result.hidden = false;
  }

  form.addEventListener("submit", async (submitEvent) => {
    submitEvent.preventDefault();
    const text = textarea.value.trim();
    if (!text) {
      showResult("error", "Please paste the announcement text first.");
      return;
    }
    const flyer = flyerInput.files[0] || null;
    if (flyer && !["image/jpeg", "image/png"].includes(flyer.type)) {
      showResult("error", "The photo must be a JPG or PNG.");
      return;
    }
    if (flyer && flyer.size > MAX_FLYER_BYTES) {
      showResult("error", "The photo is too big. Please use a JPG or PNG under 5 MB.");
      return;
    }

    postButton.disabled = true;
    postButton.textContent = "The agent is reading your post…";

    try {
      const body = new FormData();
      body.append("announcement", text);
      if (flyer) body.append("flyer", flyer);
      const response = await fetch(AGENT_URL, {
        method: "POST",
        headers: { apikey: config.publishableKey },
        body,
      });
      const answer = await response.json().catch(() => ({ ok: false }));

      if (!answer.ok) {
        showResult("error", answer.message || "The agent didn't answer. Please try again in a minute.");
      } else {
        showResult(answer.status, answer.message, answer.reasons);
        if (answer.status === "published") {
          textarea.value = "";
          flyerInput.value = "";
          loadEvents();
        } else if (answer.status === "rejected" || answer.status === "duplicate" || flyer) {
          textarea.value = "";
          flyerInput.value = "";
        }
      }
    } catch (error) {
      console.error(error);
      showResult("error", "Couldn't reach the agent. Check your internet connection and try again.");
    } finally {
      postButton.disabled = false;
      postButton.textContent = "Send to the agent";
    }
  });

  // ---------- list controls ----------

  refreshButton.addEventListener("click", loadEvents);

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filter = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      renderBoard();
    });
  });

  loadEvents();
})();
