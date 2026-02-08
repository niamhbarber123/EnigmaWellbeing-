/* =========================================================
   Enigma Wellbeing • app.js (STABLE CONSISTENT BUILD)
   - Back button ALWAYS goes Home
   - Theme toggle (moon/sun)
   - Word of the Day (daily deterministic, on wotd.html page)
   - Distraction (typed answers required for Next; Skip allowed)
   - Breathe (Timer dropdown + Stopwatch dropdown; optional vibration; minutes tracked)
   - Quotes (bigger local set; search/random/saved; night readable via CSS)
   - Yoga + Music (render lists + mood chips + session tracking)
   - Progress (reads same keys and displays correctly)
   - Resources (topics + NHS links incl. BPD)
   - Books (genre tabs)
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* =========================
     NAV (Back always Home)
  ========================= */
  window.enigmaHome = function () {
    location.href = "index.html";
  };
  window.enigmaBack = function () {
    location.href = "index.html";
  };

  /* =========================
     DATE HELPERS
  ========================= */
  function todayKey() {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  }

  /* =========================
     SAFE STORAGE
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
     WOTD (deterministic daily)
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

  const WOTD = [
    { w: "Harmony", d: "Finding calm alignment within and around you." },
    { w: "Simplicity", d: "Reducing the load—one less thing at a time." },
    { w: "Courage", d: "Feeling fear and still choosing what matters." },
    { w: "Compassion", d: "Meeting struggle with warmth instead of judgement." },
    { w: "Clarity", d: "Seeing what matters most, without the noise." },
    { w: "Patience", d: "Letting growth take the time it takes." },
    { w: "Integrity", d: "Aligning actions with values—even in small moments." },
    { w: "Gentleness", d: "Soft strength—especially with yourself." },
    { w: "Balance", d: "Making space for rest, effort, joy, and recovery." },
    { w: "Acceptance", d: "Letting reality be what it is—so you can respond wisely." },
    { w: "Serenity", d: "A quiet steadiness, even when life is loud." },
    { w: "Authenticity", d: "Being real—no performance required." },
    { w: "Reflection", d: "Looking back kindly to learn and reset." },
    { w: "Strength", d: "Endurance, boundaries, and quiet resilience." },
    { w: "Freedom", d: "Creating room to breathe, choose, and be yourself." },
    { w: "Joy", d: "Noticing what feels bright—even briefly." }
  ];

  function pickWotd() {
    const rand = mulberry32(seedFromToday());
    const i = Math.floor(rand() * WOTD.length);
    return WOTD[i] || WOTD[0];
  }

  function initWotdPage() {
    const page = $("wotdPage");
    if (!page) return;

    const wordEl = $("wotdWordBig");
    const descEl = $("wotdDescBig");
    const dateEl = $("wotdDate");

    const { w, d } = pickWotd();
    if (wordEl) wordEl.textContent = w;
    if (descEl) descEl.textContent = d;
    if (dateEl) dateEl.textContent = todayKey();
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

    function save(s) {
      writeJSON(KEY, s);
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

    function finish() {
      qEl.textContent = "Nice work. Take one slow breath.";
      setRunning(false);
      clear();
    }

    function advance(s) {
      if (s.i >= s.order.length - 1) {
        finish();
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
    if (existing) {
      render(existing);
    } else {
      setRunning(false);
      qEl.textContent = "Tap Start to begin.";
      answeredEl.textContent = "0";
    }
  }

  /* =========================
     VIBRATION (optional)
  ========================= */
  function vibrate(ms) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch {
      // ignore
    }
  }

  /* =========================
     BREATHE (Timer + Stopwatch)
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

    if (!phaseEl || !tipEl || !circle || !startBtn || !stopBtn || !completeBtn) return;
    if (!modeSelect || !durationSelect || !durationRow || !timerLabel || !stopwatchLabel) return;

    let running = false;
    let rafId = null;

    // cycle (seconds)
    const inhaleSec = 5;
    const holdSec = 1;
    const exhaleSec = 6;

    // state machine:
    // 0 inhale, 1 hold, 2 exhale, 3 hold
    let step = 0;
    let stepEndsAt = 0;

    // timer/stopwatch
    let mode = modeSelect.value || "timer";
    let endAt = 0;
    let startAt = 0;

    function wantsVibe() {
      return !!(vibrateToggle && vibrateToggle.checked);
    }

    function setVisualForStep(s) {
      circle.classList.remove("breath-inhale", "breath-exhale");

      if (s === 0) {
        // inhale = smaller (retract)
        circle.classList.add("breath-inhale");
      } else if (s === 2) {
        // exhale = larger (expand)
        circle.classList.add("breath-exhale");
      }
    }

    function setTextForStep(s) {
      if (s === 0) {
        phaseEl.textContent = "Breathe in";
        tipEl.textContent = "Breathe in";
      } else if (s === 1 || s === 3) {
        phaseEl.textContent = "Hold";
        tipEl.textContent = "Hold";
      } else if (s === 2) {
        phaseEl.textContent = "Breathe out";
        tipEl.textContent = "Breathe out";
      }
      if (wantsVibe()) vibrate(15);
    }

    function stepDurationSec(s) {
      if (s === 0) return inhaleSec;
      if (s === 1) return holdSec;
      if (s === 2) return exhaleSec;
      return holdSec;
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
        const minutes = parseInt(durationSelect.value || "1", 10);
        const totalSec = Math.max(1, minutes) * 60;
        endAt = now + totalSec * 1000;
        timerLabel.textContent = `Time: ${fmtTime(totalSec)}`;
      } else {
        startAt = now;
        stopwatchLabel.textContent = "Stopwatch: 0:00";
      }

      step = 0;
      setVisualForStep(step);
      setTextForStep(step);
      stepEndsAt = now + stepDurationSec(step) * 1000;

      startBtn.disabled = true;
      stopBtn.disabled = false;

      tick();
    }

    function stopSession(resetLabel) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;

      circle.classList.remove("breath-inhale", "breath-exhale");
      phaseEl.textContent = resetLabel || "Ready";
      tipEl.textContent = "Tap Start to begin.";

      startBtn.disabled = false;
      stopBtn.disabled = true;
    }

    function logBreathingMinutes(addMin) {
      const log = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });
      log.totalMin = (log.totalMin || 0) + addMin;
      log.byDay = log.byDay || {};
      log.byDay[todayKey()] = (log.byDay[todayKey()] || 0) + addMin;
      writeJSON("enigmaBreatheLog", log);
    }

    function completeSession() {
      let addMin = 1;

      if (mode === "timer") {
        addMin = Math.max(1, parseInt(durationSelect.value || "1", 10));
      } else {
        const elapsedSec = (Date.now() - startAt) / 1000;
        addMin = Math.max(1, Math.round(elapsedSec / 60));
      }

      logBreathingMinutes(addMin);

      if (wantsVibe()) vibrate([20, 40, 20]);

      stopSession("Completed ✅");
      setTimeout(() => {
        phaseEl.textContent = "Ready";
        tipEl.textContent = "Tap Start to begin.";
      }, 900);
    }

    function tick() {
      if (!running) return;
      const now = Date.now();

      // timer/stopwatch label
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

      // step transitions
      if (now >= stepEndsAt) {
        step = (step + 1) % 4;
        setVisualForStep(step);
        setTextForStep(step);
        stepEndsAt = now + stepDurationSec(step) * 1000;
      }

      rafId = requestAnimationFrame(tick);
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startSession();
    });

    stopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      stopSession("Ready");
    });

    completeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      completeSession();
    });

    // default state
    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateModeUI();
    timerLabel.textContent = "Time: —";
    stopwatchLabel.textContent = "Stopwatch: 0:00";
  }

  /* =========================
     QUOTES (Local set)
  ========================= */
  const QUOTES = [
    { t: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" },
    { t: "You do not have to see the whole staircase—just take the first step.", a: "Martin Luther King Jr." },
    { t: "It always seems impossible until it’s done.", a: "Nelson Mandela" },
    { t: "Small steps every day.", a: "Unknown" },
    { t: "Breathe. This is just a moment, not your whole life.", a: "Unknown" },
    { t: "You have survived 100% of your hardest days.", a: "Unknown" },
    { t: "Progress, not perfection.", a: "Unknown" },
    { t: "Feelings are visitors. Let them come and go.", a: "Rumi" },
    { t: "Nothing can dim the light that shines from within.", a: "Maya Angelou" },
    { t: "Do the next right thing.", a: "Unknown" },
    { t: "Act as if what you do makes a difference. It does.", a: "William James" },
    { t: "Be kind to yourself. You’re doing the best you can.", a: "Unknown" },
    { t: "Make peace with your pace.", a: "Unknown" },
    { t: "Your calm is a superpower.", a: "Unknown" },
    { t: "The only way out is through.", a: "Robert Frost" },
    { t: "This too shall pass.", a: "Persian proverb" },
    { t: "What you practice grows stronger.", a: "Unknown" },
    { t: "You can be nervous and do it anyway.", a: "Unknown" },
    { t: "Slow progress is still progress.", a: "Unknown" },
    { t: "Rest is productive.", a: "Unknown" },
    { t: "Gentle is still strong.", a: "Unknown" },
    { t: "You are not behind. You are on your path.", a: "Unknown" },
    { t: "One day at a time.", a: "Unknown" },
    { t: "Wherever you go, there you are.", a: "Jon Kabat-Zinn" },
    { t: "Simplicity is the ultimate sophistication.", a: "Leonardo da Vinci" },
    { t: "Not everything you think is true.", a: "Unknown" },
    { t: "When you can’t control what’s happening, control how you respond.", a: "Unknown" },
    { t: "Courage starts with showing up and letting ourselves be seen.", a: "Brené Brown" },
    { t: "You are allowed to be both a masterpiece and a work in progress.", a: "Sophia Bush" },
    { t: "If you get tired, learn to rest, not to quit.", a: "Banksy (attributed)" },
    { t: "Even the darkest night will end and the sun will rise.", a: "Victor Hugo" },
    { t: "Do what you can, with what you have, where you are.", a: "Theodore Roosevelt" },
    { t: "The body benefits from movement, and the mind benefits from stillness.", a: "Sakyong Mipham" },
    { t: "Sometimes the most productive thing you can do is rest.", a: "Unknown" },
    { t: "You don’t have to do it all. You just have to do the next thing.", a: "Unknown" },
    { t: "You are stronger than you think.", a: "Unknown" }
  ];

  function getSavedQuotes() {
    return readJSON("enigmaSavedQuotes", []);
  }
  function setSavedQuotes(list) {
    writeJSON("enigmaSavedQuotes", list);
  }

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
      if (!savedCount) return;
      savedCount.textContent = String(getSavedQuotes().length);
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

    function search() {
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

    if (searchBtn) searchBtn.addEventListener("click", search);
    if (randomBtn) randomBtn.addEventListener("click", random);
    if (viewSavedBtn) viewSavedBtn.addEventListener("click", viewSaved);
    if (clearSavedBtn) clearSavedBtn.addEventListener("click", clearSaved);

    updateSavedCount();
    render(QUOTES.slice(0, 12));
  }

  /* =========================
     MUSIC (mood chips + links + minutes)
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
    function save(s) {
      writeJSON(KEY, s);
    }
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

    function renderChips() {
      moodRow.innerHTML = "";
      moods.forEach((m) => {
        const b = document.createElement("button");
        b.className = "chip";
        b.type = "button";
        b.textContent = m;
        if (m === active) b.classList.add("active");
        b.addEventListener("click", () => {
          active = m;
          renderChips();
          renderTracks();
        });
        moodRow.appendChild(b);
      });
    }

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

    renderChips();
    renderTracks();
    renderMinutes();
  }

  /* =========================
     YOGA (mood chips + links)
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

    function renderChips() {
      moodRow.innerHTML = "";
      moods.forEach((m) => {
        const b = document.createElement("button");
        b.className = "chip";
        b.type = "button";
        b.textContent = m;
        if (m === active) b.classList.add("active");
        b.addEventListener("click", () => {
          active = m;
          renderChips();
          renderVideos();
        });
        moodRow.appendChild(b);
      });
    }

    function renderVideos() {
      list.innerHTML = "";
      const vids = active === "All"
        ? YOGA_VIDEOS.filter((v) => v.mood !== "All").concat(YOGA_VIDEOS.filter((v) => v.mood === "All"))
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

    renderChips();
    renderVideos();
  }

  /* =========================
     PROGRESS (matches your progress.html IDs)
  ========================= */
  function initProgress() {
    const page = $("progressPage");
    if (!page) return;

    const pBreathedToday = $("pBreathedToday");
    const pMusicToday = $("pMusicToday");
    const pSavedQuotes = $("pSavedQuotes");
    const pMusicTotal = $("pMusicTotal");

    const b = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });
    const m = readJSON("enigmaMusic", { totalMin: 0, today: todayKey(), todayMin: 0 });
    const s = readJSON("enigmaSavedQuotes", []);

    const breathedToday = Number((b.byDay && b.byDay[todayKey()]) || 0);
    const musicToday = (m.today === todayKey()) ? Number(m.todayMin || 0) : 0;

    if (pBreathedToday) pBreathedToday.textContent = String(breathedToday);
    if (pMusicToday) pMusicToday.textContent = String(musicToday);
    if (pSavedQuotes) pSavedQuotes.textContent = String(s.length || 0);
    if (pMusicTotal) pMusicTotal.textContent = String(Number(m.totalMin || 0));
  }

  /* =========================
     RESOURCES (topic chips)
  ========================= */
  const RESOURCES = [
    { topic: "Anxiety", title: "Anxiety", desc: "Symptoms, causes and treatment.", url: "https://www.nhs.uk/mental-health/conditions/anxiety/" },
    { topic: "Depression", title: "Depression", desc: "Signs, support and treatment options.", url: "https://www.nhs.uk/mental-health/conditions/clinical-depression/" },
    { topic: "Panic disorder", title: "Panic disorder", desc: "Panic attacks and coping support.", url: "https://www.nhs.uk/mental-health/conditions/panic-disorder/" },
    { topic: "OCD", title: "OCD", desc: "Obsessive compulsive disorder info.", url: "https://www.nhs.uk/mental-health/conditions/obsessive-compulsive-disorder-ocd/" },
    { topic: "PTSD", title: "PTSD", desc: "Trauma support and treatment.", url: "https://www.nhs.uk/mental-health/conditions/post-traumatic-stress-disorder-ptsd/" },
    { topic: "Eating disorders", title: "Eating disorders", desc: "Support and symptoms.", url: "https://www.nhs.uk/mental-health/conditions/eating-disorders/" },
    { topic: "Self-harm", title: "Self-harm", desc: "Support and guidance.", url: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/self-harm/" },
    { topic: "Stress", title: "Stress", desc: "Understanding stress and coping.", url: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/tips-to-reduce-stress/" },

    // ✅ NEW: BPD
    { topic: "BPD", title: "Borderline personality disorder (BPD)", desc: "Symptoms, support, and treatment.", url: "https://www.nhs.uk/mental-health/conditions/borderline-personality-disorder/" }
  ];

  function initResources() {
    const page = $("resourcesPage");
    if (!page) return;

    const row = $("resourceTopicRow");
    const list = $("resourceList");
    if (!row || !list) return;

    const topics = ["All", "Anxiety", "Depression", "Panic disorder", "OCD", "PTSD", "Eating disorders", "Self-harm", "Stress", "BPD"];
    let active = "All";

    function renderChips() {
      row.innerHTML = "";
      topics.forEach((t) => {
        const b = document.createElement("button");
        b.className = "chip";
        b.type = "button";
        b.textContent = t;
        if (t === active) b.classList.add("active");
        b.addEventListener("click", () => {
          active = t;
          renderChips();
          renderList();
        });
        row.appendChild(b);
      });
    }

    function renderList() {
      list.innerHTML = "";
      const items = active === "All" ? RESOURCES : RESOURCES.filter((x) => x.topic === active);
      items.forEach((x) => {
        const a = document.createElement("a");
        a.className = "resource-item";
        a.href = x.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `
          <div class="resource-left">
            <div class="resource-title">${x.title}</div>
            <div class="resource-desc">${x.desc}</div>
          </div>
          <div class="resource-go">▶</div>
        `;
        list.appendChild(a);
      });
    }

    renderChips();
    renderList();
  }

  /* =========================
     BOOKS (genre tabs)
  ========================= */
  const BOOKS = [
    { g: "All", t: "The Comfort Book", a: "Matt Haig", d: "Short comforting reflections." },
    { g: "All", t: "Atomic Habits", a: "James Clear", d: "Small habits, big change." },

    { g: "Anxiety", t: "Dare", a: "Barry McDonagh", d: "Practical approach to anxiety and panic." },
    { g: "Anxiety", t: "Hope and Help for Your Nerves", a: "Claire Weekes", d: "Classic calm guidance for nerves." },

    { g: "Depression", t: "Feeling Good", a: "David D. Burns", d: "CBT tools and reframing." },

    { g: "Trauma", t: "The Body Keeps the Score", a: "Bessel van der Kolk", d: "Understanding trauma’s effects." },

    { g: "Mindfulness", t: "Wherever You Go, There You Are", a: "Jon Kabat-Zinn", d: "Mindfulness made accessible." },

    { g: "Sleep", t: "Why We Sleep", a: "Matthew Walker", d: "Sleep science and habits." }
  ];

  function initBooks() {
    const page = $("booksPage");
    if (!page) return;

    const row = $("booksGenreRow");
    const list = $("booksList");
    if (!row || !list) return;

    const genres = ["All", "Anxiety", "Depression", "Trauma", "Mindfulness", "Sleep"];
    let active = "All";

    function renderChips() {
      row.innerHTML = "";
      genres.forEach((g) => {
        const b = document.createElement("button");
        b.className = "chip";
        b.type = "button";
        b.textContent = g;
        if (g === active) b.classList.add("active");
        b.addEventListener("click", () => {
          active = g;
          renderChips();
          renderList();
        });
        row.appendChild(b);
      });
    }

    function renderList() {
      list.innerHTML = "";
      const items = active === "All" ? BOOKS : BOOKS.filter((x) => x.g === active);
      items.forEach((x) => {
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `
          <div class="book-title">${x.t}</div>
          <div class="book-meta">by ${x.a}</div>
          <div class="book-desc">${x.d}</div>
        `;
        list.appendChild(div);
      });
    }

    renderChips();
    renderList();
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    try { applyTheme(); } catch {}
    try { initTheme(); } catch {}

    try { initDistraction(); } catch {}
    try { initBreathe(); } catch {}
    try { initQuotes(); } catch {}
    try { initMusic(); } catch {}
    try { initYoga(); } catch {}
    try { initProgress(); } catch {}
    try { initResources(); } catch {}
    try { initBooks(); } catch {}
    try { initWotdPage(); } catch {}
  });
})();
