/* =========================================================
   Enigma Wellbeing • app.js (FULL WORKING)
   - Theme toggle (+ moon/sun icon swap)
   - Back navigation
   - Word of the Day (daily deterministic pick + description + modal)
   - Breathe (Start/Stop + timer duration + slower phases + inhale small / exhale big)
   - Quotes (search via Quotable API + random + save)
   - Music (moods + links + session minutes)
   - Yoga (moods + links)
   - Distraction (typed answers required for Next; skip allowed; progress = answered only)
   - Progress page stats
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* =========================
     Back
  ========================= */
  window.enigmaBack = function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  /* =========================
     Date key
  ========================= */
  function todayKey() {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  }

  /* =========================
     Deterministic RNG (for WOTD)
  ========================= */
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFromToday() {
    const s = todayKey().split("-").join("");
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 20260101;
  }

  /* =========================
     THEME (moon <-> sun)
  ========================= */
  function updateThemeFabIcon() {
    const btn = $("themeFab");
    if (!btn) return;
    btn.textContent = document.body.classList.contains("night") ? "☀️" : "🌙";
  }

  function applyTheme() {
    const t = localStorage.getItem("enigmaTheme") || "light";
    document.body.classList.toggle("night", t === "night");
    updateThemeFabIcon();
  }

  function toggleTheme() {
    const night = document.body.classList.toggle("night");
    localStorage.setItem("enigmaTheme", night ? "night" : "light");
    updateThemeFabIcon();
  }

  function initTheme() {
    const btn = $("themeFab");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  /* =========================
     WORD OF THE DAY
  ========================= */
  const WOTD = [
    { w: "Forgiveness", d: "Releasing resentment so you can move forward lighter." },
    { w: "Honesty", d: "Choosing truth with kindness—to yourself and others." },
    { w: "Trust", d: "Allowing confidence in yourself, others, or the process." },
    { w: "Responsibility", d: "Owning your choices and responding with intention." },
    { w: "Flexibility", d: "Adapting without losing your centre." },
    { w: "Boldness", d: "Taking brave steps even when you feel unsure." },
    { w: "Discretion", d: "Using good judgement about what to share and when." },
    { w: "Discipline", d: "Doing what helps you—even when motivation fades." },
    { w: "Detail", d: "Noticing the small things that improve the whole." },
    { w: "Prosperity", d: "Growing resources and wellbeing in a healthy way." },
    { w: "Acceptance", d: "Letting reality be what it is—so you can respond wisely." },
    { w: "Surrender", d: "Loosening the grip on what you can’t control." },
    { w: "Sincerity", d: "Being genuine—your real self is enough." },
    { w: "Serenity", d: "A quiet steadiness, even when life is loud." },
    { w: "Humility", d: "Staying grounded and open to learning." },
    { w: "Sensitivity", d: "Noticing feelings and needs—yours and others’." },
    { w: "Compassion", d: "Meeting struggle with warmth instead of judgement." },
    { w: "Leadership", d: "Guiding with care, clarity, and example." },
    { w: "Integrity", d: "Aligning actions with values—even in small moments." },
    { w: "Action", d: "One doable step—progress over perfection." },
    { w: "Courage", d: "Feeling fear and still choosing what matters." },
    { w: "Creativity", d: "Letting new ideas and possibilities appear." },
    { w: "Gentleness", d: "Soft strength—especially with yourself." },
    { w: "Clarity", d: "Seeing what matters most, without the noise." },
    { w: "Balance", d: "Making space for rest, effort, joy, and recovery." },
    { w: "Fun", d: "Allowing lightness—your nervous system needs it." },
    { w: "Commitment", d: "Staying with what you choose, one day at a time." },
    { w: "Patience", d: "Letting growth take the time it takes." },
    { w: "Freedom", d: "Creating room to breathe, choose, and be yourself." },
    { w: "Reflection", d: "Looking back kindly to learn and reset." },
    { w: "Giving", d: "Offering support without emptying yourself." },
    { w: "Enthusiasm", d: "Inviting energy and interest into the day." },
    { w: "Joy", d: "Noticing what feels bright—even briefly." },
    { w: "Satisfaction", d: "Letting ‘enough’ be enough." },
    { w: "Grace", d: "Moving with softness through imperfect moments." },
    { w: "Simplicity", d: "Reducing the load—one less thing at a time." },
    { w: "Communication", d: "Sharing clearly, listening carefully." },
    { w: "Appropriateness", d: "Matching your response to the moment wisely." },
    { w: "Strength", d: "Endurance, boundaries, and quiet resilience." },
    { w: "Love", d: "Choosing care—for yourself and others." },
    { w: "Tenderness", d: "Being gentle with what’s sensitive." },
    { w: "Perseverance", d: "Keeping going, especially on the slow days." },
    { w: "Reliability", d: "Being steady and consistent—small promises kept." },
    { w: "Initiative", d: "Starting before you feel ready." },
    { w: "Confidence", d: "Trusting your ability to figure things out." },
    { w: "Authenticity", d: "Being real—no performance required." },
    { w: "Harmony", d: "Finding calm alignment within and around you." },
    { w: "Pleasure", d: "Letting good moments count." },
    { w: "Risk", d: "Trying something new, gently and safely." },
    { w: "Efficiency", d: "Using energy wisely—not doing everything." },
    { w: "Spontaneity", d: "Letting life surprise you in kind ways." },
    { w: "Fulfilment", d: "A sense of meaning—built over time." }
  ];

  function pickWotd() {
    const rand = mulberry32(seedFromToday());
    const i = Math.floor(rand() * WOTD.length);
    return WOTD[i] || { w: "Serenity", d: "A quiet steadiness, even when life is loud." };
  }

  function openWotdModal(word, desc) {
    const modal = $("wotdModal");
    const backdrop = $("wotdBackdrop");
    const closeBtn = $("wotdCloseBtn");
    const mw = $("wotdModalWord");
    const md = $("wotdModalDesc");

    if (!modal || !mw || !md) return;

    mw.textContent = word;
    md.textContent = desc;

    modal.classList.add("show");
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");

    const close = () => {
      modal.classList.remove("show");
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    };

    if (backdrop) backdrop.addEventListener("click", close, { once: true });
    if (closeBtn) closeBtn.addEventListener("click", close, { once: true });

    window.addEventListener(
      "keydown",
      function esc(e) {
        if (e.key === "Escape") {
          close();
          window.removeEventListener("keydown", esc);
        }
      }
    );
  }

  function initWotd() {
    const tile = $("wotdTile");
    const wEl = $("wotdWord");
    const dEl = $("wotdDesc");
    const infoBtn = $("wotdInfoBtn");
    if (!tile || !wEl || !dEl) return;

    const { w, d } = pickWotd();
    wEl.textContent = w;
    dEl.textContent = d;

    tile.addEventListener("click", (e) => {
      if (e.target && e.target.id === "wotdInfoBtn") return;
      e.preventDefault();
      openWotdModal(w, d);
    });

    if (infoBtn) {
      infoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openWotdModal(w, d);
      });
    }
  }

  /* =========================
     BREATHE (timer + slower + inhale small / exhale big)
  ========================= */
  function initBreathe() {
    const page = $("breathePage");
    if (!page) return;

    const circle = $("breatheCircle");
    const phase = $("breathPhase");
    const tip = $("breathTip");
    const startBtn = $("breathStartBtn");
    const stopBtn = $("breathStopBtn");
    const doneBtn = $("breathCompleteBtn");

    const durationSel = $("breathDuration");
    const timeLeftEl = $("breathTimeLeft");

    if (!circle || !phase || !tip || !startBtn || !stopBtn) return;

    // Slower breathing (seconds)
    const INHALE_MS = 5500;
    const EXHALE_MS = 5500;

    let running = false;
    let t1 = null;
    let t2 = null;

    let countdownTimer = null;
    let endAt = null;

    function setText(p, m) {
      phase.textContent = p;
      tip.textContent = m;
    }

    function clearTimers() {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      t1 = t2 = null;
    }

    function clearCountdown() {
      if (countdownTimer) clearInterval(countdownTimer);
      countdownTimer = null;
      endAt = null;
      if (timeLeftEl) timeLeftEl.textContent = "";
    }

    function stopAll(showMsg) {
      running = false;
      clearTimers();
      clearCountdown();
      circle.classList.remove("inhale", "exhale");
      if (showMsg) setText("Ready", showMsg);
      else setText("Ready", "Tap Start to begin.");
    }

    function getDurationSeconds() {
      if (!durationSel) return 60;
      const v = parseInt(durationSel.value, 10);
      return Number.isFinite(v) ? v : 60;
    }

    function startCountdown() {
      const seconds = getDurationSeconds();
      endAt = Date.now() + seconds * 1000;

      function renderTime() {
        if (!timeLeftEl || !endAt) return;
        const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
        const m = String(Math.floor(left / 60));
        const s = String(left % 60).padStart(2, "0");
        timeLeftEl.textContent = `Time left: ${m}:${s}`;

        if (left <= 0) {
          // Auto stop + save one complete
          stopAll("Nice work. You finished ✅");
          saveBreatheComplete();
        }
      }

      renderTime();
      countdownTimer = setInterval(renderTime, 300);
    }

    function cycle() {
      if (!running) return;

      // ✅ INHALE = smaller (retract)
      circle.classList.add("inhale");
      circle.classList.remove("exhale");
      setText("Breathe in", "Inhale gently…");

      t1 = setTimeout(() => {
        if (!running) return;

        // ✅ EXHALE = bigger (expand)
        circle.classList.add("exhale");
        circle.classList.remove("inhale");
        setText("Breathe out", "Exhale slowly…");

        t2 = setTimeout(() => {
          if (!running) return;
          cycle();
        }, EXHALE_MS);
      }, INHALE_MS);
    }

    function saveBreatheComplete() {
      const key = "enigmaBreatheCompletes";
      const store = JSON.parse(localStorage.getItem(key) || "{}");
      const day = todayKey();
      store[day] = (store[day] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(store));
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (running) return;
      running = true;
      startCountdown();
      cycle();
    });

    stopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      stopAll("Tap Start to begin.");
    });

    if (doneBtn) {
      doneBtn.addEventListener("click", (e) => {
        e.preventDefault();
        saveBreatheComplete();
        doneBtn.textContent = "Saved ✅";
        setTimeout(() => (doneBtn.textContent = "Completed ✅"), 1100);
      });
    }

    stopAll("Tap Start to begin.");
  }

  /* =========================
     QUOTES (Quotable API + save)
  ========================= */
  const QUOTE_SAVE_KEY = "enigmaSavedQuotesV2";

  function loadSavedQuotes() {
    try {
      return JSON.parse(localStorage.getItem(QUOTE_SAVE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveSavedQuotes(arr) {
    localStorage.setItem(QUOTE_SAVE_KEY, JSON.stringify(arr));
  }

  function isSameQuote(a, b) {
    return a && b && a.content === b.content && (a.author || "") === (b.author || "");
  }

  async function fetchQuotesSearch(query) {
    const url = "https://api.quotable.io/search/quotes?query=" + encodeURIComponent(query) + "&limit=12";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Quote search failed");
    const data = await res.json();
    return (data.results || []).map((x) => ({ content: x.content, author: x.author || "Unknown" }));
  }

  async function fetchRandomMotivational() {
    // A few tags that usually work well
    const url = "https://api.quotable.io/random?tags=motivational|inspirational|wisdom|success|happiness";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Random quote failed");
    const x = await res.json();
    return [{ content: x.content, author: x.author || "Unknown" }];
  }

  function renderQuotes(list, savedSet) {
    const grid = $("quoteGrid");
    if (!grid) return;
    grid.innerHTML = "";

    list.forEach((q) => {
      const tile = document.createElement("div");
      tile.className = "quote-tile";

      const saved = savedSet.some((s) => isSameQuote(s, q));

      tile.innerHTML = `
        <div class="quote-text">“${q.content}”</div>
        <small>— ${q.author || "Unknown"}</small>
        <button class="quote-save-btn ${saved ? "saved" : ""}" type="button">
          ${saved ? "💜 Saved" : "💜 Save"}
        </button>
      `;

      tile.querySelector("button").addEventListener("click", (e) => {
        e.preventDefault();
        const current = loadSavedQuotes();

        const exists = current.some((s) => isSameQuote(s, q));
        let next;
        if (exists) next = current.filter((s) => !isSameQuote(s, q));
        else next = [{ content: q.content, author: q.author || "Unknown" }, ...current];

        saveSavedQuotes(next);
        initQuotes(); // refresh count + view state
      });

      grid.appendChild(tile);
    });
  }

  async function initQuotes() {
    const grid = $("quoteGrid");
    if (!grid) return;

    const input = $("quoteSearch");
    const searchBtn = $("quoteSearchBtn");
    const randomBtn = $("quoteRandomBtn");
    const viewSavedBtn = $("viewSavedBtn");
    const clearSavedBtn = $("clearSavedBtn");
    const savedCount = $("savedCount");
    const status = $("quoteStatus");

    const saved = loadSavedQuotes();
    if (savedCount) savedCount.textContent = String(saved.length);

    async function showSearch() {
      const q = (input ? input.value : "").trim();
      if (!q) {
        if (status) status.textContent = "Type something to search (e.g. courage, hope, Mandela).";
        return;
      }
      if (status) status.textContent = "Searching…";
      try {
        const results = await fetchQuotesSearch(q);
        if (status) status.textContent = results.length ? "Results:" : "No results found. Try another word.";
        renderQuotes(results, loadSavedQuotes());
      } catch {
        if (status) status.textContent = "Couldn’t load quotes right now. Try again.";
      }
    }

    async function showRandom() {
      if (status) status.textContent = "Loading a random quote…";
      try {
        const results = await fetchRandomMotivational();
        if (status) status.textContent = "Random motivational quote:";
        renderQuotes(results, loadSavedQuotes());
      } catch {
        if (status) status.textContent = "Couldn’t load a random quote right now. Try again.";
      }
    }

    function showSaved() {
      const s = loadSavedQuotes();
      if (savedCount) savedCount.textContent = String(s.length);
      if (status) status.textContent = s.length ? "Saved quotes:" : "No saved quotes yet.";
      renderQuotes(s, s);
    }

    function clearSaved() {
      saveSavedQuotes([]);
      if (savedCount) savedCount.textContent = "0";
      if (status) status.textContent = "Deleted saved quotes.";
      renderQuotes([], []);
    }

    if (searchBtn) searchBtn.onclick = showSearch;
    if (randomBtn) randomBtn.onclick = showRandom;
    if (viewSavedBtn) viewSavedBtn.onclick = showSaved;
    if (clearSavedBtn) clearSavedBtn.onclick = clearSaved;

    // default view
    if (status) status.textContent = "Tip: only the 💜 button saves.";
  }

  /* =========================
     MUSIC (moods + links + minutes)
  ========================= */
  const MUSIC_MOODS = ["All", "Anxious", "Stressed", "Focus", "Sleep"];

  const TRACKS = [
    { t: "Calm breathing music", m: "Anxious", u: "https://www.youtube.com/watch?v=odADwWzHR24" },
    { t: "Lo-fi focus mix", m: "Focus", u: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
    { t: "Sleep music", m: "Sleep", u: "https://www.youtube.com/watch?v=DWcJFNfaw9c" },
    { t: "Relaxing piano", m: "Stressed", u: "https://www.youtube.com/watch?v=1ZYbU82GVz4" },
    { t: "Ocean waves", m: "Sleep", u: "https://www.youtube.com/watch?v=eKFTSSKCzWA" }
  ];

  function initMusic() {
    const chipsWrap = $("moodChips");
    const list = $("musicList");
    if (!chipsWrap || !list) return;

    const minsTodayEl = $("minsToday");
    const minsTotalEl = $("minsTotal");
    const startBtn = $("startListenBtn");
    const endBtn = $("endListenBtn");
    const status = $("listenStatus");

    let mood = localStorage.getItem("enigmaMusicMood") || "All";
    let start = null;

    function renderTracks() {
      list.innerHTML = "";
      TRACKS.filter((x) => mood === "All" || x.m === mood).forEach((x) => {
        const a = document.createElement("a");
        a.href = x.u;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "music-btn";
        a.innerHTML = `<span>${x.t}</span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    function renderChips() {
      chipsWrap.innerHTML = "";
      MUSIC_MOODS.forEach((m) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (m === mood ? " active" : "");
        b.textContent = m;
        b.addEventListener("click", () => {
          mood = m;
          localStorage.setItem("enigmaMusicMood", mood);
          renderChips();
          renderTracks();
        });
        chipsWrap.appendChild(b);
      });
    }

    function loadMinutes() {
      const day = todayKey();
      const store = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");
      const today = Number(store[day] || 0);
      const total = Object.values(store).reduce((a, v) => a + Number(v || 0), 0);

      if (minsTodayEl) minsTodayEl.textContent = String(today);
      if (minsTotalEl) minsTotalEl.textContent = String(total);
    }

    function saveMinutes(addMins) {
      const day = todayKey();
      const store = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");
      store[day] = Number(store[day] || 0) + addMins;
      localStorage.setItem("enigmaMusicMinutes", JSON.stringify(store));
    }

    if (startBtn && status) {
      startBtn.addEventListener("click", () => {
        if (start) return;
        start = Date.now();
        status.textContent = "Listening… tap End session when finished.";
      });
    }

    if (endBtn && status) {
      endBtn.addEventListener("click", () => {
        if (!start) return;
        const mins = Math.max(1, Math.round((Date.now() - start) / 60000));
        start = null;
        saveMinutes(mins);
        loadMinutes();
        status.textContent = `Saved ${mins} min ✅`;
        setTimeout(() => (status.textContent = "No active session."), 1400);
      });
    }

    renderChips();
    renderTracks();
    loadMinutes();
  }

  /* =========================
     YOGA (moods + video links)
  ========================= */
  const YOGA_MOODS = ["All", "Anxiety", "Stress", "Sleep", "Morning", "Stiff body"];
  const YOGA_VIDEOS = [
    { t: "10 min Yoga for Anxiety", m: "Anxiety", u: "https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
    { t: "15 min Gentle Yoga for Stress", m: "Stress", u: "https://www.youtube.com/results?search_query=15+minute+gentle+yoga+for+stress" },
    { t: "Yoga for Sleep (wind down)", m: "Sleep", u: "https://www.youtube.com/results?search_query=yoga+for+sleep+bedtime" },
    { t: "Morning Yoga (wake up)", m: "Morning", u: "https://www.youtube.com/results?search_query=morning+yoga+10+minutes" },
    { t: "Yoga for stiff back/hips", m: "Stiff body", u: "https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" },
    { t: "Gentle yoga (all levels)", m: "All", u: "https://www.youtube.com/results?search_query=gentle+yoga+all+levels" }
  ];

  function initYoga() {
    const chipsWrap = $("yogaMoodChips");
    const list = $("yogaVideoList");
    if (!chipsWrap || !list) return;

    let mood = localStorage.getItem("enigmaYogaMood") || "All";

    function render() {
      chipsWrap.innerHTML = "";
      YOGA_MOODS.forEach((m) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (m === mood ? " active" : "");
        b.textContent = m;
        b.addEventListener("click", () => {
          mood = m;
          localStorage.setItem("enigmaYogaMood", mood);
          render();
        });
        chipsWrap.appendChild(b);
      });

      list.innerHTML = "";
      YOGA_VIDEOS.filter((x) => mood === "All" || x.m === mood || x.m === "All").forEach((x) => {
        const a = document.createElement("a");
        a.href = x.u;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "music-btn";
        a.innerHTML = `<span>${x.t}</span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    render();
  }

  /* =========================
     DISTRACTION (typed answers required for Next)
  ========================= */
  const DISTRACTION_QUESTIONS = [
    "Name 5 things you can see right now.",
    "Name 4 things you can feel (touch/texture).",
    "Name 3 things you can hear.",
    "Name 2 things you can smell.",
    "Name 1 thing you can taste (or would like to taste).",
    "If you could teleport anywhere for 10 minutes, where would you go?",
    "What colour feels calming to you today?",
    "What’s a tiny ‘safe’ plan for the next 10 minutes?",
    "What’s one kind thing you’d say to a friend feeling this way?",
    "What’s your favourite cosy drink?",
    "If today had a soundtrack, what would it be called?",
    "If you could design a calm room, what 3 items are in it?",
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?",
    "What would your ‘calm alter ego’ do next?",
    "What’s the softest thing you own?",
    "Name 3 colours you can spot around you.",
    "What’s one gentle stretch you can do right now?",
    "What is a ‘good enough’ goal for today?",
    "What’s one small thing you can do to be kind to yourself right now?"
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function initDistraction() {
    const card = $("distractionCard");
    if (!card) return;

    const qEl = $("distractionQuestion");
    const answeredEl = $("distractionAnsweredCount");

    const inputWrap = $("distractionInputWrap");
    const input = $("distractionInput");

    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");

    if (!qEl || !answeredEl || !startBtn || !nextBtn || !skipBtn || !endBtn || !inputWrap || !input) return;

    const KEY = "enigmaDistractionSessionV2";

    function setRunning(running) {
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display = running ? "" : "none";
      skipBtn.style.display = running ? "" : "none";
      endBtn.style.display = running ? "" : "none";
      inputWrap.style.display = running ? "" : "none";
      if (!running) input.value = "";
    }

    function load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || s.day !== todayKey()) return null;
        if (!Array.isArray(s.order) || typeof s.i !== "number" || typeof s.answered !== "number") return null;
        return s;
      } catch {
        return null;
      }
    }

    function save(s) {
      localStorage.setItem(KEY, JSON.stringify(s));
    }

    function clear() {
      localStorage.removeItem(KEY);
    }

    function currentQ(s) {
      const idx = s.order[s.i];
      return DISTRACTION_QUESTIONS[idx] || "Take one slow breath in… and out.";
    }

    function render(s) {
      qEl.textContent = currentQ(s);
      answeredEl.textContent = String(s.answered);
      input.value = "";
      setRunning(true);
    }

    function startNew() {
      const order = shuffle([...Array(DISTRACTION_QUESTIONS.length).keys()]);
      const s = { day: todayKey(), order, i: 0, answered: 0 };
      save(s);
      render(s);
    }

    function advance(s) {
      if (s.i >= s.order.length - 1) {
        qEl.textContent = "You’re done. Take a slow breath.";
        setRunning(false);
        clear();
        return;
      }
      s.i += 1;
      save(s);
      render(s);
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startNew();
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = load() || (startNew(), load());
      if (!s) return;

      const text = (input.value || "").trim();
      if (!text) {
        input.focus();
        qEl.textContent = "Type any answer (even one word) — or tap Skip.";
        setTimeout(() => {
          const s2 = load();
          if (s2) qEl.textContent = currentQ(s2);
        }, 900);
        return;
      }

      s.answered += 1;
      save(s);
      advance(s);
    });

    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = load() || (startNew(), load());
      if (!s) return;
      advance(s);
    });

    endBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clear();
      setRunning(false);
      qEl.textContent = "Ended. You can start again any time.";
    });

    const existing = load();
    if (existing) {
      render(existing);
    } else {
      setRunning(false);
      qEl.textContent = "Tap Start to begin.";
      answeredEl.textContent = "0";
    }
  }

  /* =========================
     PROGRESS
  ========================= */
  function initProgress() {
    const page = $("progressPage");
    if (!page) return;

    const day = todayKey();

    // breathed today
    const breatheStore = JSON.parse(localStorage.getItem("enigmaBreatheCompletes") || "{}");
    const breathedToday = Number(breatheStore[day] || 0);

    // music minutes
    const musicStore = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");
    const musicToday = Number(musicStore[day] || 0);
    const musicTotal = Object.values(musicStore).reduce((a, v) => a + Number(v || 0), 0);

    // saved quotes
    const savedQuotes = loadSavedQuotes().length;

    const pB = $("pBreathedToday");
    const pMT = $("pMusicToday");
    const pSQ = $("pSavedQuotes");
    const pMTotal = $("pMusicTotal");

    if (pB) pB.textContent = String(breathedToday);
    if (pMT) pMT.textContent = String(musicToday);
    if (pSQ) pSQ.textContent = String(savedQuotes);
    if (pMTotal) pMTotal.textContent = String(musicTotal);
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    initTheme();

    // Home
    initWotd();
    initDistraction();

    // Pages
    initBreathe();
    initQuotes();
    initMusic();
    initYoga();
    initProgress();
  });
})();
