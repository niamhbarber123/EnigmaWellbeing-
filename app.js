/* =========================================================
   Enigma Wellbeing • app.js (FULL STABLE)
   - Back always goes Home
   - Theme toggle
   - Word of the day (home button -> word.html)
   - Distraction is its own page (distraction.html)
   - Breathe timer/stopwatch + vibration
   - Quotes saved/search/random
   - Yoga + Music chips + lists
   - Progress
   - Resources chips (incl BPD)
   - Books chips + genre filtering
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* NAV */
  window.enigmaHome = function () { location.href = "index.html"; };
  window.enigmaBack = function () { location.href = "index.html"; };

  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

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

  /* THEME */
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

  /* WORD OF THE DAY */
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

  /* ✅ Expanded WOTD list (you can add more anytime) */
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
    { w: "Joy", d: "Noticing what feels bright—even briefly." },
    { w: "Grounding", d: "Returning to what is real, here and now." },
    { w: "Hope", d: "A small light you can carry forward." },
    { w: "Kindness", d: "Softness that changes the day." },
    { w: "Resilience", d: "Bending without breaking—then coming back." },
    { w: "Self-respect", d: "Treating your needs as valid." },
    { w: "Calm", d: "A steady breath, a quieter mind." },
    { w: "Trust", d: "Letting yourself rely on support." }
  ];

  function pickWotd() {
    const rand = mulberry32(seedFromToday());
    const i = Math.floor(rand() * WOTD.length);
    return WOTD[i] || WOTD[0];
  }

  function initWordPage() {
    const bigW = $("wotdWordBig");
    const bigD = $("wotdDescBig");
    if (!bigW || !bigD) return;
    const { w, d } = pickWotd();
    bigW.textContent = w;
    bigD.textContent = d;
  }

  /* DISTRACTION (own page) */
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

  function initDistractionPage() {
    const qEl = $("distractionQuestion");
    const answeredEl = $("distractionAnsweredCount");
    const inputWrap = $("distractionInputWrap");
    const input = $("distractionInput");

    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");

    if (!qEl || !answeredEl || !startBtn || !nextBtn || !skipBtn || !endBtn || !inputWrap || !input) return;

    const KEY = "enigmaDistractionSessionV3";

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

    startBtn.addEventListener("click", (e) => { e.preventDefault(); startNew(); });

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

  /* VIBRATION */
  function vibrate(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch {}
  }

  /* BREATHE */
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

    if (!phaseEl || !tipEl || !circle || !startBtn || !stopBtn || !completeBtn || !modeSelect || !durationSelect || !timerLabel || !stopwatchLabel) return;

    let running = false;
    let rafId = null;

    const inhaleSec = 5;
    const exhaleSec = 6;
    const holdSec = 1;

    let phase = "ready";
    let phaseEndsAt = 0;

    let mode = modeSelect.value || "timer";
    let endAt = 0;
    let startAt = 0;

    function wantsVibe() {
      return !!(vibrateToggle && vibrateToggle.checked);
    }

    function applyBreathVisual(p) {
      circle.classList.remove("breath-inhale", "breath-exhale");
      if (p === "inhale") circle.classList.add("breath-inhale"); // retract
      if (p === "exhale") circle.classList.add("breath-exhale"); // expand
    }

    function setPhase(p, text) {
      phase = p;
      phaseEl.textContent = text;
      tipEl.textContent = text;
      applyBreathVisual(p);
      if (wantsVibe()) vibrate(15);
    }

    function updateModeUI() {
      mode = modeSelect.value || "timer";
      const isTimer = mode === "timer";
      if (durationRow) durationRow.style.display = isTimer ? "" : "none";
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

      setPhase("inhale", "Breathe in");
      phaseEndsAt = now + inhaleSec * 1000;

      startBtn.disabled = true;
      stopBtn.disabled = false;

      tick();
    }

    function stopSession(resetText) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;

      circle.classList.remove("breath-inhale", "breath-exhale");
      phaseEl.textContent = resetText || "Ready";
      tipEl.textContent = "Tap Start to begin.";

      startBtn.disabled = false;
      stopBtn.disabled = true;
    }

    function completeSession() {
      const log = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });

      let addMin = 0;
      if (mode === "timer") addMin = parseInt(durationSelect.value || "1", 10);
      else {
        const elapsedSec = (Date.now() - startAt) / 1000;
        addMin = Math.max(1, Math.round(elapsedSec / 60));
      }

      log.totalMin = (log.totalMin || 0) + addMin;
      log.byDay = log.byDay || {};
      log.byDay[todayKey()] = (log.byDay[todayKey()] || 0) + addMin;
      writeJSON("enigmaBreatheLog", log);

      if (wantsVibe()) vibrate([25, 50, 25]);

      stopSession("Completed ✅");
      setTimeout(() => {
        phaseEl.textContent = "Ready";
        tipEl.textContent = "Tap Start to begin.";
      }, 900);
    }

    function tick() {
      if (!running) return;
      const now = Date.now();

      if (mode === "timer") {
        const remainingSec = Math.ceil((endAt - now) / 1000);
        timerLabel.textContent = `Time: ${fmtTime(remainingSec)}`;
        if (remainingSec <= 0) { completeSession(); return; }
      } else {
        const elapsedSec = Math.floor((now - startAt) / 1000);
        stopwatchLabel.textContent = `Stopwatch: ${fmtTime(elapsedSec)}`;
      }

      if (now >= phaseEndsAt) {
        if (phase === "inhale") {
          setPhase("hold", "Hold");
          phaseEndsAt = now + holdSec * 1000;
        } else if (phase === "hold") {
          setPhase("exhale", "Breathe out");
          phaseEndsAt = now + exhaleSec * 1000;
        } else if (phase === "exhale") {
          setPhase("hold2", "Hold");
          phaseEndsAt = now + holdSec * 1000;
        } else {
          setPhase("inhale", "Breathe in");
          phaseEndsAt = now + inhaleSec * 1000;
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    startBtn.addEventListener("click", (e) => { e.preventDefault(); startSession(); });
    stopBtn.addEventListener("click", (e) => { e.preventDefault(); stopSession("Ready"); });
    completeBtn.addEventListener("click", (e) => { e.preventDefault(); completeSession(); });

    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateModeUI();
    timerLabel.textContent = "Time: —";
    stopwatchLabel.textContent = "Stopwatch: 0:00";
  }

  /* QUOTES */
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
    { t: "The only way out is through.", a: "Robert Frost" },
    { t: "This too shall pass.", a: "Persian proverb" },
    { t: "Gentle is still strong.", a: "Unknown" },
    { t: "Slow progress is still progress.", a: "Unknown" },
    { t: "Rest is productive.", a: "Unknown" },
    { t: "You are not behind. You are on your path.", a: "Unknown" },
    { t: "What you practice grows stronger.", a: "Unknown" },
    { t: "Not everything you think is true.", a: "Unknown" },
    { t: "Make peace with your pace.", a: "Unknown" },
    { t: "One day at a time.", a: "Unknown" },
    { t: "Do the next right thing.", a: "Unknown" }
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
        status && (status.textContent = "Tip: try “calm”, “hope”, “strong”…");
        render(QUOTES.slice(0, 12));
        return;
      }
      const hits = QUOTES.filter((x) => x.t.toLowerCase().includes(q) || x.a.toLowerCase().includes(q));
      status && (status.textContent = hits.length ? `Showing ${hits.length} result(s).` : "No results — try another word.");
      render(hits.slice(0, 30));
    }

    function random() {
      const pick = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      status && (status.textContent = "Random quote:");
      render([pick]);
    }

    function viewSaved() {
      const s = getSavedQuotes();
      status && (status.textContent = s.length ? "Your saved quotes:" : "No saved quotes yet.");
      render(s.map(({ t, a }) => ({ t, a })));
    }

    function clearSaved() {
      setSavedQuotes([]);
      updateSavedCount();
      status && (status.textContent = "Saved quotes deleted.");
      render(QUOTES.slice(0, 12));
    }

    searchBtn && searchBtn.addEventListener("click", search);
    randomBtn && randomBtn.addEventListener("click", random);
    viewSavedBtn && viewSavedBtn.addEventListener("click", viewSaved);
    clearSavedBtn && clearSavedBtn.addEventListener("click", clearSaved);

    updateSavedCount();
    render(QUOTES.slice(0, 12));
  }

  /* MUSIC */
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
    function load() { return readJSON(KEY, { today: todayKey(), todayMin: 0, totalMin: 0, sessionStart: 0 }); }
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

    function makeChip(name) {
      const b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.textContent = name;
      if (name === active) b.classList.add("active");
      b.addEventListener("click", () => {
        active = name;
        [...moodRow.querySelectorAll(".chip")].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        renderTracks();
      });
      return b;
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

  /* YOGA */
  const YOGA_VIDEOS = [
    { mood: "Anxiety", label: "10 min Yoga for Anxiety", url: "https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
    { mood: "Stress", label: "15 min Gentle Yoga for Stress", url: "https://www.youtube.com/results?search_query=gentle+yoga+for+stress+15+minutes" },
    { mood: "Sleep", label: "Yoga for Sleep (wind down)", url: "https://www.youtube.com/results?search_query=yoga+for+sleep+wind+down" },
    { mood: "Morning", label: "Morning Yoga (wake up)", url: "https://www.youtube.com/results?search_query=morning+yoga+wake+up" },
    { mood: "Stiff body", label: "Yoga for stiff back/hips", url: "https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" }
  ];

  function initYoga() {
    const moodRow = $("yogaMoodRow");
    const list = $("yogaList");
    if (!moodRow || !list) return;

    const moods = ["All", "Anxiety", "Stress", "Sleep", "Morning", "Stiff body"];
    let active = "All";

    function makeChip(name) {
      const b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.textContent = name;
      if (name === active) b.classList.add("active");
      b.addEventListener("click", () => {
        active = name;
        [...moodRow.querySelectorAll(".chip")].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        renderVideos();
      });
      return b;
    }

    function renderVideos() {
      list.innerHTML = "";
      const vids = active === "All" ? YOGA_VIDEOS : YOGA_VIDEOS.filter((v) => v.mood === active);
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

    moodRow.innerHTML = "";
    moods.forEach((m) => moodRow.appendChild(makeChip(m)));
    renderVideos();
  }

  /* RESOURCES (incl BPD) */
  const RESOURCES = [
    { topic: "Anxiety", title: "Anxiety", desc: "Symptoms, causes and treatment.", url: "https://www.nhs.uk/mental-health/conditions/generalised-anxiety-disorder/" },
    { topic: "Depression", title: "Depression", desc: "Support and treatment options.", url: "https://www.nhs.uk/mental-health/conditions/clinical-depression/" },
    { topic: "Panic disorder", title: "Panic disorder", desc: "Panic attacks and coping support.", url: "https://www.nhs.uk/mental-health/conditions/panic-disorder/" },
    { topic: "OCD", title: "OCD", desc: "Obsessive compulsive disorder information.", url: "https://www.nhs.uk/mental-health/conditions/obsessive-compulsive-disorder-ocd/" },
    { topic: "PTSD", title: "PTSD", desc: "Post-traumatic stress disorder support.", url: "https://www.nhs.uk/mental-health/conditions/post-traumatic-stress-disorder-ptsd/" },
    { topic: "Eating disorders", title: "Eating disorders", desc: "Information and help.", url: "https://www.nhs.uk/mental-health/conditions/eating-disorders/" },
    { topic: "Self-harm", title: "Self-harm", desc: "Support and advice.", url: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/self-harm/" },
    { topic: "Stress", title: "Stress", desc: "Stress management and support.", url: "https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-manage-stress/" },

    /* ✅ BPD */
    { topic: "BPD", title: "Borderline personality disorder (BPD)", desc: "Symptoms, treatment and support.", url: "https://www.nhs.uk/mental-health/conditions/borderline-personality-disorder/" },
    { topic: "BPD", title: "Talking therapies", desc: "How therapy can help.", url: "https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/" },
    { topic: "BPD", title: "DBT overview", desc: "Dialectical behaviour therapy basics.", url: "https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/types-of-talking-therapies/" }
  ];

  function initResources() {
    const chipRow = $("resourceTopicRow");
    const list = $("resourceList");
    if (!chipRow || !list) return;

    const topics = ["All", "Anxiety", "Depression", "Panic disorder", "OCD", "PTSD", "Eating disorders", "Self-harm", "Stress", "BPD"];
    let active = "All";

    function makeChip(name) {
      const b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.textContent = name;
      if (name === active) b.classList.add("active");
      b.addEventListener("click", () => {
        active = name;
        [...chipRow.querySelectorAll(".chip")].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        render();
      });
      return b;
    }

    function render() {
      list.innerHTML = "";
      const rows = active === "All" ? RESOURCES : RESOURCES.filter(r => r.topic === active);
      rows.forEach((r) => {
        const a = document.createElement("a");
        a.className = "resource-item";
        a.href = r.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `
          <div class="resource-left">
            <div class="resource-title">${r.title}</div>
            <div class="resource-desc">${r.desc}</div>
          </div>
          <div class="resource-go">▶</div>
        `;
        list.appendChild(a);
      });
    }

    chipRow.innerHTML = "";
    topics.forEach(t => chipRow.appendChild(makeChip(t)));
    render();
  }

  /* BOOKS + GENRE FILTERING */
  const BOOKS = [
    /* Anxiety / calm */
    { genre: "Anxiety", title: "Hope and Help for Your Nerves", author: "Claire Weekes", desc: "Classic anxiety recovery guidance." },
    { genre: "Anxiety", title: "Dare", author: "Barry McDonagh", desc: "Practical approach to panic/anxiety." },

    /* Depression / mood */
    { genre: "Mood", title: "Feeling Good", author: "David D. Burns", desc: "CBT tools for mood and thinking patterns." },

    /* Trauma */
    { genre: "Trauma", title: "The Body Keeps the Score", author: "Bessel van der Kolk", desc: "Trauma understanding and recovery." },

    /* Habits / self-help */
    { genre: "Habits", title: "Atomic Habits", author: "James Clear", desc: "Small changes that stick." },

    /* Mindfulness */
    { genre: "Mindfulness", title: "Wherever You Go, There You Are", author: "Jon Kabat-Zinn", desc: "Mindfulness basics." },

    /* ✅ BPD */
    { genre: "BPD", title: "The Dialectical Behavior Therapy Skills Workbook", author: "McKay, Wood & Brantley", desc: "DBT skills: distress tolerance, emotion regulation." },
    { genre: "BPD", title: "I Hate You—Don’t Leave Me", author: "Kreisman & Straus", desc: "Understanding BPD patterns and support." },
    { genre: "BPD", title: "Sometimes I Act Crazy", author: "Jerold J. Kreisman", desc: "Guidance for navigating BPD experiences." },
    { genre: "BPD", title: "Building a Life Worth Living", author: "Marsha M. Linehan", desc: "DBT creator’s story + therapy insights." }
  ];

  function initBooks() {
    const chipRow = $("bookGenreRow");
    const list = $("bookList");
    if (!chipRow || !list) return;

    const genres = ["All", "BPD", "Anxiety", "Mood", "Trauma", "Mindfulness", "Habits"];
    let active = "All";

    function makeChip(name) {
      const b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.textContent = name;
      if (name === active) b.classList.add("active");
      b.addEventListener("click", () => {
        active = name;
        [...chipRow.querySelectorAll(".chip")].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        render();
      });
      return b;
    }

    function render() {
      list.innerHTML = "";
      const rows = active === "All" ? BOOKS : BOOKS.filter(b => b.genre === active);
      rows.forEach((b) => {
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `
          <div class="book-title">${b.title}</div>
          <div class="book-meta">${b.author} • <b>${b.genre}</b></div>
          <div class="book-desc">${b.desc}</div>
        `;
        list.appendChild(div);
      });
    }

    chipRow.innerHTML = "";
    genres.forEach(g => chipRow.appendChild(makeChip(g)));
    render();
  }

  /* PROGRESS */
  function initProgress() {
    const breathedToday = $("pBreathedToday");
    const musicToday = $("pMusicToday");
    const savedQuotes = $("pSavedQuotes");
    const musicTotal = $("pMusicTotal");

    if (!breathedToday && !musicToday && !savedQuotes && !musicTotal) return;

    const b = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });
    const m = readJSON("enigmaMusic", { totalMin: 0, today: todayKey(), todayMin: 0 });
    const s = readJSON("enigmaSavedQuotes", []);

    const breatheTodayVal = Number((b.byDay && b.byDay[todayKey()]) || 0);
    const musicTodayVal = (m.today === todayKey()) ? Number(m.todayMin || 0) : 0;
    const musicTotalVal = Number(m.totalMin || 0);

    if (breathedToday) breathedToday.textContent = String(breatheTodayVal);
    if (musicToday) musicToday.textContent = String(musicTodayVal);
    if (savedQuotes) savedQuotes.textContent = String(s.length || 0);
    if (musicTotal) musicTotal.textContent = String(musicTotalVal);
  }

  /* BOOT */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    initTheme();

    initWordPage();
    initDistractionPage();
    initBreathe();
    initQuotes();
    initMusic();
    initYoga();
    initResources();
    initBooks();
    initProgress();
  });
})();
