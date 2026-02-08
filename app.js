/* =========================================================
   Enigma Wellbeing • app.js (FULL STABLE)
   - Back button ALWAYS goes Home
   - Theme toggle (moon/sun)
   - Word of the Day (daily deterministic) -> home + word.html
   - Distraction (typed answers required for Next; Skip allowed)
   - Breathe (Timer + Stopwatch + Vibration; inhale retracts; exhale expands)
   - Quotes (bigger local set; search/random/saved)
   - Yoga + Music (moods + links + minutes)
   - Progress (simple stats)
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* =========================
     NAV (Back always Home)
  ========================= */
  window.enigmaHome = function () { location.href = "index.html"; };
  window.enigmaBack = function () { location.href = "index.html"; };

  /* =========================
     DATE
  ========================= */
  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  /* =========================
     STORAGE
  ========================= */
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function writeJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  /* =========================
     THEME
  ========================= */
  function applyTheme() {
    const t = localStorage.getItem("enigmaTheme") || "light";
    const night = t === "night";
    document.body.classList.toggle("night", night);

    const btn = $("themeFab");
    if (btn) btn.textContent = night ? "☀️" : "🌙";
  }

  function toggleTheme() {
    const night = document.body.classList.toggle("night");
    localStorage.setItem("enigmaTheme", night ? "night" : "light");
    const btn = $("themeFab");
    if (btn) btn.textContent = night ? "☀️" : "🌙";
  }

  function initTheme() {
    const btn = $("themeFab");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  /* =========================
     WORD OF THE DAY
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
    const s = todayKey().replaceAll("-", "");
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 20260101;
  }

  // Full set (from your earlier request – affirmations list)
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

  function initWotdHome() {
    const el = $("wotdWord");
    if (!el) return;
    const { w } = pickWotd();
    el.textContent = w;
  }

  function initWotdPage() {
    const wordBig = $("wotdWordBig");
    const descBig = $("wotdDescBig");
    if (!wordBig || !descBig) return;
    const { w, d } = pickWotd();
    wordBig.textContent = w;
    descBig.textContent = d;
  }

  /* =========================
     DISTRACTION
  ========================= */
  const DISTRACTION_QUESTIONS = [
    "Name 5 things you can see right now.",
    "Name 4 things you can feel (touch/texture).",
    "Name 3 things you can hear.",
    "Name 2 things you can smell.",
    "Name 1 thing you can taste (or would like to taste).",
    "What colour feels calming to you today?",
    "What’s a tiny ‘safe’ plan for the next 10 minutes?",
    "What’s one kind thing you’d say to a friend feeling this way?",
    "What’s your favourite cosy drink?",
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?",
    "What is a ‘good enough’ goal for today?"
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
      const s = readJSON(KEY, null);
      if (!s || s.day !== todayKey()) return null;
      if (!Array.isArray(s.order) || typeof s.i !== "number" || typeof s.answered !== "number") return null;
      return s;
    }

    function save(s) { writeJSON(KEY, s); }
    function clear() { localStorage.removeItem(KEY); }

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
      answeredEl.textContent = "0";
    });

    const existing = load();
    if (existing) render(existing);
    else {
      setRunning(false);
      qEl.textContent = "Tap Start to begin.";
      answeredEl.textContent = "0";
    }
  }

  /* =========================
     VIBRATION
  ========================= */
  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
  }

  /* =========================
     BREATHE (Timer + Stopwatch)
     inhale retracts / exhale expands
  ========================= */
  function fmtTime(totalSec) {
    totalSec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function initBreathe() {
    const page = $("breathePage");
    if (!page) return;

    const phaseEl = $("breathPhase");
    const tipEl = $("breathTip");
    const circle = $("breatheCircle");

    const startBtn = $("breathStartBtn");
    const stopBtn = $("breathStopBtn");
    const completeBtn = $("breathCompleteBtn");

    const modeSelect = $("breathModeSelect");
    const durationSelect = $("breathDurationSelect");
    const durationRow = $("breathDurationRow");
    const timerLabel = $("breathTimerLabel");
    const stopwatchLabel = $("breathStopwatchLabel");
    const vibrateToggle = $("breathVibrateToggle");

    if (!phaseEl || !tipEl || !circle || !startBtn || !stopBtn || !completeBtn ||
        !modeSelect || !durationSelect || !timerLabel || !stopwatchLabel || !durationRow) return;

    let running = false;
    let rafId = null;

    const inhaleSec = 5;
    const exhaleSec = 6;
    const holdSec = 1;

    let state = "ready"; // inhale | hold1 | exhale | hold2
    let stateEndsAt = 0;

    let mode = modeSelect.value || "timer";
    let endAt = 0;
    let startAt = 0;

    function wantsVibe() {
      return !!(vibrateToggle && vibrateToggle.checked);
    }

    function setVisual(p) {
      circle.classList.remove("breath-inhale", "breath-exhale");
      if (p === "inhale") circle.classList.add("breath-inhale"); // retract
      if (p === "exhale") circle.classList.add("breath-exhale"); // expand
    }

    function setText(phaseText, tipText) {
      phaseEl.textContent = phaseText;
      tipEl.textContent = tipText || phaseText;
    }

    function updateModeUI() {
      mode = modeSelect.value || "timer";
      const isTimer = mode === "timer";
      durationRow.style.display = isTimer ? "" : "none";
      timerLabel.style.display = isTimer ? "" : "none";
      stopwatchLabel.style.display = isTimer ? "none" : "";
    }

    modeSelect.addEventListener("change", () => {
      updateModeUI();
      if (!running) {
        timerLabel.textContent = "Time: —";
        stopwatchLabel.textContent = "Stopwatch: 0:00";
      }
    });

    function startSession() {
      if (running) return;
      running = true;

      updateModeUI();
      const now = Date.now();

      if (mode === "timer") {
        const minutes = Math.max(1, parseInt(durationSelect.value || "1", 10));
        endAt = now + minutes * 60 * 1000;
        timerLabel.textContent = `Time: ${fmtTime(minutes * 60)}`;
      } else {
        startAt = now;
        stopwatchLabel.textContent = "Stopwatch: 0:00";
      }

      state = "inhale";
      setVisual("inhale");
      setText("Breathe in", "Breathe in");
      stateEndsAt = now + inhaleSec * 1000;

      startBtn.disabled = true;
      stopBtn.disabled = false;

      if (wantsVibe()) vibrate(20);
      tick();
    }

    function stopSession() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;

      circle.classList.remove("breath-inhale", "breath-exhale");
      setText("Ready", "Tap Start to begin.");

      startBtn.disabled = false;
      stopBtn.disabled = true;
    }

    function logBreathingMinutes(minutes) {
      const log = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });
      log.totalMin = Number(log.totalMin || 0) + minutes;
      log.byDay = log.byDay || {};
      log.byDay[todayKey()] = Number(log.byDay[todayKey()] || 0) + minutes;
      writeJSON("enigmaBreatheLog", log);
    }

    function completeSession() {
      let addMin = 1;
      if (mode === "timer") addMin = Math.max(1, parseInt(durationSelect.value || "1", 10));
      else {
        const elapsedSec = (Date.now() - startAt) / 1000;
        addMin = Math.max(1, Math.round(elapsedSec / 60));
      }

      logBreathingMinutes(addMin);
      if (wantsVibe()) vibrate([30, 60, 30]);

      stopSession();
      setText("Completed ✅", `Saved ${addMin} min ✅`);
      setTimeout(() => setText("Ready", "Tap Start to begin."), 1000);
    }

    function tick() {
      if (!running) return;
      const now = Date.now();

      if (mode === "timer") {
        const remainingSec = Math.ceil((endAt - now) / 1000);
        timerLabel.textContent = `Time: ${fmtTime(remainingSec)}`;
        if (remainingSec <= 0) {
          completeSession();
          return;
        }
      } else {
        const elapsedSec = Math.floor((now - startAt) / 1000);
        stopwatchLabel.textContent = `Stopwatch: ${fmtTime(elapsedSec)}`;
      }

      if (now >= stateEndsAt) {
        if (state === "inhale") {
          state = "hold1";
          setVisual(null);
          setText("Hold", "Hold");
          stateEndsAt = now + holdSec * 1000;
          if (wantsVibe()) vibrate(15);
        } else if (state === "hold1") {
          state = "exhale";
          setVisual("exhale");
          setText("Breathe out", "Breathe out");
          stateEndsAt = now + exhaleSec * 1000;
          if (wantsVibe()) vibrate(20);
        } else if (state === "exhale") {
          state = "hold2";
          setVisual(null);
          setText("Hold", "Hold");
          stateEndsAt = now + holdSec * 1000;
          if (wantsVibe()) vibrate(15);
        } else if (state === "hold2") {
          state = "inhale";
          setVisual("inhale");
          setText("Breathe in", "Breathe in");
          stateEndsAt = now + inhaleSec * 1000;
          if (wantsVibe()) vibrate(20);
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    startBtn.addEventListener("click", (e) => { e.preventDefault(); startSession(); });
    stopBtn.addEventListener("click", (e) => { e.preventDefault(); stopSession(); });
    completeBtn.addEventListener("click", (e) => { e.preventDefault(); completeSession(); });

    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateModeUI();
    timerLabel.textContent = "Time: —";
    stopwatchLabel.textContent = "Stopwatch: 0:00";
  }

  /* =========================
     QUOTES
  ========================= */
  const QUOTES = [
    { t: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" },
    { t: "You do not have to see the whole staircase—just take the first step.", a: "Martin Luther King Jr." },
    { t: "It always seems impossible until it’s done.", a: "Nelson Mandela" },
    { t: "You have survived 100% of your hardest days.", a: "Unknown" },
    { t: "Progress, not perfection.", a: "Unknown" },
    { t: "The only way out is through.", a: "Robert Frost" },
    { t: "This too shall pass.", a: "Persian proverb" },
    { t: "Not everything you think is true.", a: "Unknown" },
    { t: "Gentle is still strong.", a: "Unknown" },
    { t: "Slow progress is still progress.", a: "Unknown" },
    { t: "Rest is productive.", a: "Unknown" },
    { t: "Make peace with your pace.", a: "Unknown" },
    { t: "Nothing can dim the light that shines from within.", a: "Maya Angelou" },
    { t: "Act as if what you do makes a difference. It does.", a: "William James" },
    { t: "Courage starts with showing up and letting ourselves be seen.", a: "Brené Brown" },
    { t: "You are allowed to be both a masterpiece and a work in progress.", a: "Sophia Bush" },
    { t: "One day at a time.", a: "Unknown" },
    { t: "Your calm is a superpower.", a: "Unknown" },
    { t: "Do the next right thing.", a: "Unknown" },
    { t: "Breathe. This is just a moment, not your whole life.", a: "Unknown" },
    { t: "Wherever you go, there you are.", a: "Jon Kabat-Zinn" },
    { t: "Simplicity is the ultimate sophistication.", a: "Leonardo da Vinci" },
    { t: "What you practice grows stronger.", a: "Unknown" },
    { t: "You can be nervous and do it anyway.", a: "Unknown" }
  ];

  function getSavedQuotes() { return readJSON("enigmaSavedQuotes", []); }
  function setSavedQuotes(list) { writeJSON("enigmaSavedQuotes", list); }

  function initQuotes() {
    const grid = $("quoteGrid");
    if (!grid) return;

    const searchInput = $("quoteSearch");
    const searchBtn = $("quoteSearchBtn");
    const randomBtn = $("quoteRandomBtn");
    const viewSavedBtn = $("viewSavedBtn");
    const clearSavedBtn = $("clearSavedBtn");
    const savedCount = $("savedCount");
    const status = $("quoteStatus");

    function updateSavedCount() {
      if (savedCount) savedCount.textContent = String(getSavedQuotes().length);
    }

    function render(list) {
      grid.innerHTML = "";
      const saved = getSavedQuotes();

      list.forEach((q) => {
        const tile = document.createElement("div");
        tile.className = "quote-tile";

        const text = document.createElement("div");
        text.className = "quote-text";
        text.textContent = `"${q.t}"`;

        const meta = document.createElement("div");
        meta.className = "quote-meta";

        const author = document.createElement("div");
        author.className = "quote-author";
        author.textContent = `— ${q.a}`;

        const btn = document.createElement("button");
        btn.className = "quote-save-btn";
        btn.type = "button";

        const key = `${q.t}|||${q.a}`;
        const isSaved = saved.some((s) => s.key === key);
        btn.classList.toggle("saved", isSaved);
        btn.textContent = isSaved ? "Saved 💜" : "💜 Save";

        btn.addEventListener("click", () => {
          const current = getSavedQuotes();
          const exists = current.some((s) => s.key === key);
          if (exists) setSavedQuotes(current.filter((s) => s.key !== key));
          else setSavedQuotes([{ key, ...q }, ...current]);
          updateSavedCount();
          render(list);
        });

        meta.appendChild(author);
        meta.appendChild(btn);
        tile.appendChild(text);
        tile.appendChild(meta);
        grid.appendChild(tile);
      });

      updateSavedCount();
    }

    function doSearch() {
      const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
      if (!q) {
        if (status) status.textContent = "Tip: type a word like “calm”, “hope”, “courage”…";
        render(QUOTES.slice(0, 12));
        return;
      }
      const hits = QUOTES.filter((x) => x.t.toLowerCase().includes(q) || x.a.toLowerCase().includes(q));
      if (status) status.textContent = hits.length ? `Showing ${hits.length} result(s).` : "No results — try another word.";
      render(hits.slice(0, 30));
    }

    function random() {
      const pick = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      if (status) status.textContent = "Random quote:";
      render([pick]);
    }

    function viewSaved() {
      const s = getSavedQuotes();
      if (status) status.textContent = s.length ? "Your saved quotes:" : "No saved quotes yet.";
      render(s.map(({ t, a }) => ({ t, a })));
    }

    function clearSaved() {
      setSavedQuotes([]);
      updateSavedCount();
      if (status) status.textContent = "Saved quotes deleted.";
      render(QUOTES.slice(0, 12));
    }

    if (searchBtn) searchBtn.addEventListener("click", doSearch);
    if (randomBtn) randomBtn.addEventListener("click", random);
    if (viewSavedBtn) viewSavedBtn.addEventListener("click", viewSaved);
    if (clearSavedBtn) clearSavedBtn.addEventListener("click", clearSaved);

    updateSavedCount();
    render(QUOTES.slice(0, 12));
  }

  /* =========================
     MUSIC
  ========================= */
  const MUSIC_TRACKS = [
    { mood: "Anxious", label: "Calm breathing music", url: "https://www.youtube.com/results?search_query=calm+breathing+music" },
    { mood: "Focus", label: "Lo-fi focus mix", url: "https://www.youtube.com/results?search_query=lofi+focus+music" },
    { mood: "Sleep", label: "Sleep music", url: "https://www.youtube.com/results?search_query=sleep+music+relaxing" },
    { mood: "Stressed", label: "Relaxing piano", url: "https://www.youtube.com/results?search_query=relaxing+piano" },
    { mood: "Sleep", label: "Ocean waves", url: "https://www.youtube.com/results?search_query=ocean+waves+sleep" }
  ];

  function initMusic() {
    const moodRow = $("musicMoodRow");
    const list = $("musicList");
    if (!moodRow || !list) return;

    const startBtn = $("musicStartBtn");
    const endBtn = $("musicEndBtn");
    const todayEl = $("musicTodayMin");
    const totalEl = $("musicTotalMin");
    const statusEl = $("musicStatus");

    const KEY = "enigmaMusic";

    function load() {
      return readJSON(KEY, { today: todayKey(), todayMin: 0, totalMin: 0, sessionStart: 0 });
    }
    function save(s) { writeJSON(KEY, s); }

    function syncDay(s) {
      if (s.today !== todayKey()) {
        s.today = todayKey();
        s.todayMin = 0;
        s.sessionStart = 0;
      }
      return s;
    }

    function renderMinutes() {
      const s = syncDay(load());
      save(s);
      if (todayEl) todayEl.textContent = String(s.todayMin || 0);
      if (totalEl) totalEl.textContent = String(s.totalMin || 0);
      if (statusEl) statusEl.textContent = s.sessionStart ? "Session running…" : "No active session.";
    }

    const moods = ["All", "Anxious", "Stressed", "Focus", "Sleep"];
    let active = "All";

    function renderTracks() {
      list.innerHTML = "";
      const tracks = active === "All" ? MUSIC_TRACKS : MUSIC_TRACKS.filter((t) => t.mood === active);
      tracks.forEach((t) => {
        const a = document.createElement("a");
        a.className = "music-btn";
        a.href = t.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `<span>${t.label}</span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    function makeChip(name) {
      const b = document.createElement("button");
      b.className = "chip" + (name === active ? " active" : "");
      b.type = "button";
      b.textContent = name;
      b.addEventListener("click", () => {
        active = name;
        [...moodRow.querySelectorAll(".chip")].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        renderTracks();
      });
      return b;
    }

    moodRow.innerHTML = "";
    moods.forEach((m) => moodRow.appendChild(makeChip(m)));

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        const s = syncDay(load());
        if (s.sessionStart) return;
        s.sessionStart = Date.now();
        save(s);
        renderMinutes();
      });
    }

    if (endBtn) {
      endBtn.addEventListener("click", () => {
        const s = syncDay(load());
        if (!s.sessionStart) return;
        const mins = Math.max(1, Math.round((Date.now() - s.sessionStart) / 60000));
        s.sessionStart = 0;
        s.todayMin = (s.todayMin || 0) + mins;
        s.totalMin = (s.totalMin || 0) + mins;
        save(s);
        renderMinutes();
      });
    }

    renderTracks();
    renderMinutes();
  }

  /* =========================
     YOGA
  ========================= */
  const YOGA_VIDEOS = [
    { mood: "Anxiety", label: "10 min Yoga for Anxiety", url: "https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
    { mood: "Stress", label: "15 min Gentle Yoga for Stress", url: "https://www.youtube.com/results?search_query=gentle+yoga+for+stress+15+minutes" },
    { mood: "Sleep", label: "Yoga for Sleep (wind down)", url: "https://www.youtube.com/results?search_query=yoga+for+sleep+wind+down" },
    { mood: "Morning", label: "Morning Yoga (wake up)", url: "https://www.youtube.com/results?search_query=morning+yoga+wake+up" },
    { mood: "Stiff body", label: "Yoga for stiff back/hips", url: "https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" },
    { mood: "All", label: "Gentle yoga (all levels)", url: "https://www.youtube.com/results?search_query=gentle+yoga+all+levels" }
  ];

  function initYoga() {
    const moodRow = $("yogaMoodRow");
    const list = $("yogaList");
    if (!moodRow || !list) return;

    const moods = ["All", "Anxiety", "Stress", "Sleep", "Morning", "Stiff body"];
    let active = "All";

    function renderVideos() {
      list.innerHTML = "";
      const vids = active === "All"
        ? YOGA_VIDEOS
        : YOGA_VIDEOS.filter((v) => v.mood === active);

      vids.forEach((v) => {
        const a = document.createElement("a");
        a.className = "music-btn";
        a.href = v.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `<span>${v.label}</span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    function makeChip(name) {
      const b = document.createElement("button");
      b.className = "chip" + (name === active ? " active" : "");
      b.type = "button";
      b.textContent = name;
      b.addEventListener("click", () => {
        active = name;
        [...moodRow.querySelectorAll(".chip")].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        renderVideos();
      });
      return b;
    }

    moodRow.innerHTML = "";
    moods.forEach((m) => moodRow.appendChild(makeChip(m)));
    renderVideos();
  }

  /* =========================
     PROGRESS
  ========================= */
  function initProgress() {
    const page = $("progressPage");
    if (!page) return;

    const pBreathedToday = $("pBreathedToday");
    const pMusicToday = $("pMusicToday");
    const pSavedQuotes = $("pSavedQuotes");
    const pMusicTotal = $("pMusicTotal");

    const breatheLog = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });
    const music = readJSON("enigmaMusic", { totalMin: 0, today: todayKey(), todayMin: 0 });
    const saved = readJSON("enigmaSavedQuotes", []);

    const breathedToday = Number((breatheLog.byDay && breatheLog.byDay[todayKey()]) || 0);
    const musicToday = (music.today === todayKey()) ? Number(music.todayMin || 0) : 0;

    if (pBreathedToday) pBreathedToday.textContent = String(breathedToday);
    if (pMusicToday) pMusicToday.textContent = String(musicToday);

    if (pSavedQuotes) pSavedQuotes.textContent = String(saved.length || 0);
    if (pMusicTotal) pMusicTotal.textContent = String(Number(music.totalMin || 0));
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    initTheme();

    initWotdHome();
    initWotdPage();

    initDistraction();
    initBreathe();
    initQuotes();
    initMusic();
    initYoga();
    initProgress();
  });
})();
