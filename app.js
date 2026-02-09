/* =========================================================
   Enigma Wellbeing • app.js (FULL STABLE BUILD)
   - Safe init per page (won't break other pages)
   - Theme toggle
   - Back always Home
   - Word of the Day (tile + modal + word.html display)
   - Breathe (timer/stopwatch/vibration) + fixed buttons
   - Quotes (local set + search/random + save)
   - Music (mood chips + links + minutes tracking)
   - Yoga (mood chips + links)
   - Resources (filters + favourites)
   - Help (more places + categories)
   - Progress summary
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* =========================
     NAV
  ========================= */
  window.enigmaHome = () => (location.href = "index.html");
  window.enigmaBack = () => (location.href = "index.html");

  /* =========================
     DATE + STORAGE HELPERS
  ========================= */
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
    applyTheme();
  }

  function initTheme() {
    const btn = $("themeFab");
    if (btn) btn.addEventListener("click", toggleTheme);
    applyTheme();
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

  // You asked to include words from word.html list too.
  // If you have a larger word list elsewhere, paste/extend it here safely.
  const WOTD = [
    { w: "Forgiveness", d: "Releasing resentment so you can move forward lighter." },
    { w: "Honesty", d: "Choosing truth with kindness—to yourself and others." },
    { w: "Trust", d: "Allowing confidence in yourself, others, or the process." },
    { w: "Responsibility", d: "Owning your choices and responding with intention." },
    { w: "Flexibility", d: "Adapting without losing your centre." },
    { w: "Boldness", d: "Taking brave steps even when you feel unsure." },
    { w: "Discipline", d: "Doing what helps you—even when motivation fades." },
    { w: "Acceptance", d: "Letting reality be what it is—so you can respond wisely." },
    { w: "Serenity", d: "A quiet steadiness, even when life is loud." },
    { w: "Compassion", d: "Meeting struggle with warmth instead of judgement." },
    { w: "Integrity", d: "Aligning actions with values—even in small moments." },
    { w: "Courage", d: "Feeling fear and still choosing what matters." },
    { w: "Balance", d: "Making space for rest, effort, joy, and recovery." },
    { w: "Patience", d: "Letting growth take the time it takes." },
    { w: "Joy", d: "Noticing what feels bright—even briefly." },
    { w: "Clarity", d: "Seeing what matters most, without the noise." },
    { w: "Gentleness", d: "Soft strength—especially with yourself." },
    { w: "Growth", d: "Tiny steps that add up over time." },
    { w: "Boundaries", d: "Protecting your energy with respect and care." },
    { w: "Hope", d: "A small light you can carry today." }
  ];

  function pickWotd() {
    const rand = mulberry32(seedFromToday());
    const i = Math.floor(rand() * WOTD.length);
    return WOTD[i] || WOTD[0];
  }

  function showWotdModal(word, desc) {
    const modal = $("wotdModal");
    const backdrop = $("wotdBackdrop");
    const closeBtn = $("wotdCloseBtn");
    const mw = $("wotdModalWord");
    const md = $("wotdModalDesc");
    if (!modal || !mw || !md) return;

    mw.textContent = word;
    md.textContent = desc;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    const close = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    };

    backdrop && backdrop.addEventListener("click", close, { once: true });
    closeBtn && closeBtn.addEventListener("click", close, { once: true });

    window.addEventListener(
      "keydown",
      function esc(e) {
        if (e.key === "Escape") close();
      },
      { once: true }
    );
  }

  function initWotdHomeTile() {
    const wEl = $("wotdWord");
    const dEl = $("wotdDesc");
    const infoBtn = $("wotdInfoBtn");
    const tile = $("wotdTile");
    if (!wEl || !dEl || !tile) return;

    const { w, d } = pickWotd();
    wEl.textContent = w;
    dEl.textContent = d;

    tile.addEventListener("click", (e) => {
      if (e.target && e.target.id === "wotdInfoBtn") return;
      e.preventDefault();
      showWotdModal(w, d);
    });

    infoBtn &&
      infoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showWotdModal(w, d);
      });
  }

  function initWotdPage() {
    // for word.html page
    const bigWord = $("wotdWordBig");
    const bigDesc = $("wotdDescBig");
    if (!bigWord || !bigDesc) return;

    const { w, d } = pickWotd();
    bigWord.textContent = w;
    bigDesc.textContent = d;
  }

  /* =========================
     DISTRACTION (HOME TOOL)
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
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?",
    "What is a ‘good enough’ goal for today?",
    "Name 3 colours you can spot around you."
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
     BREATHE (FIXED)
     inhale = retract (breath-inhale)
     exhale = expand  (breath-exhale)
  ========================= */
  function initBreathe() {
    if (!$("breathePage")) return;

    const phaseEl = $("breathPhase");
    const tipEl = $("breathTip");
    const circle = $("breatheCircle");

    const startBtn = $("breathStartBtn");
    const stopBtn = $("breathStopBtn");
    const completeBtn = $("breathCompleteBtn");

    if (!phaseEl || !tipEl || !circle || !startBtn || !stopBtn || !completeBtn) return;

    const modeSelect = $("breathModeSelect");
    const durationSelect = $("breathDurationSelect");
    const durationRow = $("breathDurationRow");
    const timerLabel = $("breathTimerLabel");
    const stopwatchLabel = $("breathStopwatchLabel");
    const vibrateToggle = $("breathVibrateToggle");

    const INHALE = 5, HOLD = 1, EXHALE = 6;

    let running = false;
    let t1 = null, t2 = null, t3 = null, t4 = null;
    let clockInt = null;

    let timerEndAt = 0;
    let stopwatchStartAt = 0;

    function vibrate(ms) {
      try {
        if (vibrateToggle && vibrateToggle.checked && navigator.vibrate) navigator.vibrate(ms);
      } catch {}
    }

    function fmtTime(totalSec) {
      totalSec = Math.max(0, Math.floor(totalSec));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}:${String(s).padStart(2, "0")}`;
    }

    function clearTimers() {
      [t1, t2, t3, t4].forEach((x) => x && clearTimeout(x));
      t1 = t2 = t3 = t4 = null;
      if (clockInt) clearInterval(clockInt);
      clockInt = null;
    }

    function setVisual(state) {
      circle.classList.remove("breath-inhale", "breath-exhale");
      if (state === "inhale") circle.classList.add("breath-inhale"); // retract
      if (state === "exhale") circle.classList.add("breath-exhale"); // expand
    }

    function setText(title, tip) {
      phaseEl.textContent = title;
      tipEl.textContent = tip || title;
    }

    function updateModeUI() {
      if (!modeSelect || !timerLabel || !stopwatchLabel) return;

      const isTimer = modeSelect.value === "timer";
      if (durationRow) durationRow.style.display = isTimer ? "" : "none";
      timerLabel.style.display = isTimer ? "" : "none";
      stopwatchLabel.style.display = isTimer ? "none" : "";

      timerLabel.textContent = "Time: —";
      stopwatchLabel.textContent = "Stopwatch: 0:00";
    }

    function startClock() {
      if (!timerLabel && !stopwatchLabel) return;

      if (clockInt) clearInterval(clockInt);
      clockInt = setInterval(() => {
        if (!running) return;
        const now = Date.now();

        if (modeSelect && modeSelect.value === "timer") {
          const remaining = Math.ceil((timerEndAt - now) / 1000);
          if (timerLabel) timerLabel.textContent = `Time: ${fmtTime(remaining)}`;
          if (remaining <= 0) completeSession();
        } else {
          const elapsed = Math.floor((now - stopwatchStartAt) / 1000);
          if (stopwatchLabel) stopwatchLabel.textContent = `Stopwatch: ${fmtTime(elapsed)}`;
        }
      }, 250);
    }

    function breatheLoop() {
      if (!running) return;

      // inhale
      setVisual("inhale");
      setText("Breathe in", "Breathe in slowly…");
      vibrate(10);

      t1 = setTimeout(() => {
        if (!running) return;

        setText("Hold", "Hold gently…");
        vibrate(6);

        t2 = setTimeout(() => {
          if (!running) return;

          // exhale
          setVisual("exhale");
          setText("Breathe out", "Breathe out gently…");
          vibrate(10);

          t3 = setTimeout(() => {
            if (!running) return;

            setText("Hold", "Soften your shoulders…");
            vibrate(6);

            t4 = setTimeout(() => {
              if (!running) return;
              breatheLoop();
            }, HOLD * 1000);

          }, EXHALE * 1000);

        }, HOLD * 1000);

      }, INHALE * 1000);
    }

    function stopSession() {
      running = false;
      clearTimers();

      setVisual("hold");
      setText("Ready", "Tap Start to begin.");

      startBtn.disabled = false;
      stopBtn.disabled = true;

      if (timerLabel) timerLabel.textContent = "Time: —";
      if (stopwatchLabel) stopwatchLabel.textContent = "Stopwatch: 0:00";
    }

    function completeSession() {
      const log = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });

      let addMin = 1;
      if (modeSelect && durationSelect) {
        if (modeSelect.value === "timer") {
          addMin = Math.max(1, parseInt(durationSelect.value || "1", 10));
        } else {
          const elapsedSec = (Date.now() - stopwatchStartAt) / 1000;
          addMin = Math.max(1, Math.round(elapsedSec / 60));
        }
      }

      log.totalMin = (log.totalMin || 0) + addMin;
      log.byDay = log.byDay || {};
      log.byDay[todayKey()] = (log.byDay[todayKey()] || 0) + addMin;
      writeJSON("enigmaBreatheLog", log);

      vibrate([30, 60, 30]);

      stopSession();
      setText("Completed ✅", "Nice work. Tap Start any time.");
    }

    function startSession() {
      if (running) return;
      running = true;

      const now = Date.now();

      if (modeSelect && durationSelect && timerLabel && stopwatchLabel) {
        if (modeSelect.value === "timer") {
          const mins = Math.max(1, parseInt(durationSelect.value || "1", 10));
          timerEndAt = now + mins * 60 * 1000;
          timerLabel.textContent = `Time: ${fmtTime(mins * 60)}`;
        } else {
          stopwatchStartAt = now;
          stopwatchLabel.textContent = "Stopwatch: 0:00";
        }
        startClock();
      }

      startBtn.disabled = true;
      stopBtn.disabled = false;

      breatheLoop();
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startSession();
    });

    stopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      stopSession();
    });

    completeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      completeSession();
    });

    modeSelect && modeSelect.addEventListener("change", updateModeUI);

    stopSession();
    updateModeUI();
  }

  /* =========================
     QUOTES (local + save)
  ========================= */
  const QUOTES = [
    { t: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" },
    { t: "It always seems impossible until it’s done.", a: "Nelson Mandela" },
    { t: "Progress, not perfection.", a: "Unknown" },
    { t: "Breathe. This is a moment, not your whole life.", a: "Unknown" },
    { t: "You have survived 100% of your hardest days.", a: "Unknown" },
    { t: "Make peace with your pace.", a: "Unknown" },
    { t: "Gentle is still strong.", a: "Unknown" },
    { t: "The only way out is through.", a: "Robert Frost" },
    { t: "Wherever you go, there you are.", a: "Jon Kabat-Zinn" },
    { t: "Rest is productive.", a: "Unknown" },
    { t: "Not everything you think is true.", a: "Unknown" },
    { t: "Do the next right thing.", a: "Unknown" },
    { t: "Act as if what you do makes a difference. It does.", a: "William James" },
    { t: "Your calm is a superpower.", a: "Unknown" },
    { t: "Slow progress is still progress.", a: "Unknown" },
    { t: "You are not behind. You are on your path.", a: "Unknown" }
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
        status && (status.textContent = "Tip: type a word like “calm”, “hope”, “courage”…");
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

    searchBtn && searchBtn.addEventListener("click", doSearch);
    randomBtn && randomBtn.addEventListener("click", random);
    viewSavedBtn && viewSavedBtn.addEventListener("click", viewSaved);
    clearSavedBtn && clearSavedBtn.addEventListener("click", clearSaved);

    updateSavedCount();
    render(QUOTES.slice(0, 12));
  }

  /* =========================
     MUSIC (chips + links + minutes)
  ========================= */
  const MUSIC_TRACKS = [
    { mood: "Anxious", label: "Calm breathing music", url: "https://www.youtube.com/results?search_query=calm+breathing+music" },
    { mood: "Stressed", label: "Relaxing piano", url: "https://www.youtube.com/results?search_query=relaxing+piano" },
    { mood: "Focus", label: "Lo-fi focus mix", url: "https://www.youtube.com/results?search_query=lofi+focus+music" },
    { mood: "Sleep", label: "Sleep music", url: "https://www.youtube.com/results?search_query=sleep+music+relaxing" },
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
      todayEl && (todayEl.textContent = String(s.todayMin || 0));
      totalEl && (totalEl.textContent = String(s.totalMin || 0));
      statusEl && (statusEl.textContent = s.sessionStart ? "Session running…" : "No active session.");
    }

    const moods = ["All", "Anxious", "Stressed", "Focus", "Sleep"];
    let active = "All";

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

    startBtn &&
      startBtn.addEventListener("click", () => {
        const s = syncDay(load());
        if (s.sessionStart) return;
        s.sessionStart = Date.now();
        save(s);
        renderMinutes();
      });

    endBtn &&
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

    renderTracks();
    renderMinutes();
  }

  /* =========================
     YOGA (chips + links)
  ========================= */
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

  /* =========================
     RESOURCES (filters + favourites)
     Needs in resources.html:
       #resourceChips, #resourcesList
  ========================= */
  const RESOURCES = [
    { id:"nhs-mental", cat:"UK", title:"NHS – Mental health", desc:"Info + support routes in the UK", url:"https://www.nhs.uk/mental-health/" },
    { id:"mind", cat:"UK", title:"Mind", desc:"Mental health charity (support + info)", url:"https://www.mind.org.uk/" },
    { id:"samaritans", cat:"Crisis (UK)", title:"Samaritans", desc:"24/7 listening support", url:"https://www.samaritans.org/" },
    { id:"shout", cat:"Crisis (UK)", title:"Shout", desc:"UK crisis text support", url:"https://www.giveusashout.org/" },
    { id:"bpd-everything", cat:"BPD", title:"BPD – overview", desc:"Understand symptoms and support options", url:"https://www.nhs.uk/mental-health/conditions/borderline-personality-disorder/" },
    { id:"dbt", cat:"BPD", title:"DBT skills basics", desc:"Learn DBT skill areas (overview)", url:"https://dialecticalbehaviortherapy.com/" },
    { id:"grounding", cat:"Tools", title:"Grounding techniques", desc:"Simple grounding steps for spirals", url:"https://www.getselfhelp.co.uk/" }
  ];

  function initResources() {
    const chipsEl = $("resourceChips");
    const listEl = $("resourcesList");
    if (!chipsEl || !listEl) return;

    const FAV_KEY = "enigma_resource_favs_v1";
    const cats = ["All", "★ Favourites", ...Array.from(new Set(RESOURCES.map(r => r.cat))).sort((a,b)=>a.localeCompare(b))];
    let active = "All";

    function loadFavs() { return readJSON(FAV_KEY, []); }
    function saveFavs(ids) { writeJSON(FAV_KEY, ids); }

    function renderChips() {
      chipsEl.innerHTML = "";
      cats.forEach(c => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (c === active ? " active" : "");
        b.textContent = c;
        b.addEventListener("click", () => {
          active = c;
          renderChips();
          renderList();
        });
        chipsEl.appendChild(b);
      });
    }

    function matches(r, favIds) {
      if (active === "All") return true;
      if (active === "★ Favourites") return favIds.includes(r.id);
      return r.cat === active;
    }

    function renderList() {
      const favIds = loadFavs();
      const filtered = RESOURCES.filter(r => matches(r, favIds));
      listEl.innerHTML = "";

      if (!filtered.length) {
        listEl.innerHTML = `<div class="gentle-text">No resources for this filter.</div>`;
        return;
      }

      filtered.forEach(r => {
        const isFav = favIds.includes(r.id);

        const row = document.createElement("div");
        row.className = "resource-item";

        const left = document.createElement("a");
        left.href = r.url;
        left.target = "_blank";
        left.rel = "noopener";
        left.style.flex = "1";
        left.innerHTML = `
          <div class="resource-title">${escapeHtml(r.title)}</div>
          <div class="resource-desc">${escapeHtml(r.desc)}</div>
        `;

        const fav = document.createElement("button");
        fav.type = "button";
        fav.className = "fav-btn" + (isFav ? " active" : "");
        fav.textContent = isFav ? "♥" : "♡";
        fav.style.minWidth = "52px";

        fav.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const cur = loadFavs();
          const idx = cur.indexOf(r.id);
          if (idx >= 0) cur.splice(idx, 1);
          else cur.push(r.id);
          saveFavs(cur);
          renderChips();
          renderList();
        });

        row.appendChild(left);
        row.appendChild(fav);
        listEl.appendChild(row);
      });
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, s => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
      }[s]));
    }

    renderChips();
    renderList();
  }

  /* =========================
     HELP (more places)
     Needs in help.html: #helpChips, #helpList
  ========================= */
  const HELP_PLACES = [
    { id:"uk-999", cat:"Urgent", title:"Emergency", desc:"If you’re in immediate danger, call your local emergency number.", action:"Call emergency services" },
    { id:"uk-samaritans", cat:"UK (24/7)", title:"Samaritans", desc:"24/7 listening support.", url:"https://www.samaritans.org/" },
    { id:"uk-shout", cat:"UK (Text)", title:"Shout", desc:"UK crisis text support.", url:"https://www.giveusashout.org/" },
    { id:"uk-nhs-111", cat:"UK", title:"NHS 111", desc:"Non-emergency medical help.", url:"https://111.nhs.uk/" },
    { id:"uk-mind", cat:"UK", title:"Mind", desc:"Support + info.", url:"https://www.mind.org.uk/" },
    { id:"uk-rink", cat:"UK", title:"Rethink Mental Illness", desc:"Info and support.", url:"https://www.rethink.org/" },
    { id:"uk-anxietyuk", cat:"UK", title:"Anxiety UK", desc:"Support for anxiety conditions.", url:"https://www.anxietyuk.org.uk/" },
    { id:"bpd", cat:"BPD", title:"BPD information (NHS)", desc:"Overview and help routes.", url:"https://www.nhs.uk/mental-health/conditions/borderline-personality-disorder/" },
    { id:"dbt-skills", cat:"BPD", title:"DBT skills overview", desc:"Core DBT skill areas.", url:"https://dialecticalbehaviortherapy.com/" },
    { id:"selfhelp", cat:"Tools", title:"Self-help worksheets", desc:"Practical tools and worksheets.", url:"https://www.getselfhelp.co.uk/" }
  ];

  function initHelp() {
    const chipsEl = $("helpChips");
    const listEl = $("helpList");
    if (!chipsEl || !listEl) return;

    const cats = ["All", ...Array.from(new Set(HELP_PLACES.map(h => h.cat))).sort((a,b)=>a.localeCompare(b))];
    let active = "All";

    function renderChips() {
      chipsEl.innerHTML = "";
      cats.forEach(c => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (c === active ? " active" : "");
        b.textContent = c;
        b.addEventListener("click", () => {
          active = c;
          renderChips();
          renderList();
        });
        chipsEl.appendChild(b);
      });
    }

    function renderList() {
      const filtered = active === "All" ? HELP_PLACES : HELP_PLACES.filter(h => h.cat === active);
      listEl.innerHTML = "";

      filtered.forEach(h => {
        const row = document.createElement("div");
        row.className = "resource-item";

        const left = document.createElement("div");
        left.style.flex = "1";
        left.innerHTML = `
          <div class="resource-title">${escapeHtml(h.title)}</div>
          <div class="resource-desc">${escapeHtml(h.desc)}</div>
        `;

        const go = document.createElement("a");
        go.className = "resource-go";
        go.style.minWidth = "52px";
        go.style.textAlign = "right";

        if (h.url) {
          go.href = h.url;
          go.target = "_blank";
          go.rel = "noopener";
          go.textContent = "Open";
        } else {
          go.href = "javascript:void(0)";
          go.textContent = "—";
        }

        row.appendChild(left);
        row.appendChild(go);
        listEl.appendChild(row);
      });
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, s => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
      }[s]));
    }

    renderChips();
    renderList();
  }

  /* =========================
     PROGRESS
     Works with:
       progress.html spans:
       #pBreathedToday #pMusicToday #pSavedQuotes #pMusicTotal
  ========================= */
  function initProgress() {
    const page = $("progressPage") || $("progressWrap");
    if (!page) return;

    const pBreathedToday = $("pBreathedToday") || $("progressBreatheToday");
    const pMusicToday = $("pMusicToday") || $("progressMusicToday");
    const pSavedQuotes = $("pSavedQuotes") || $("progressSavedQuotes");
    const pMusicTotal = $("pMusicTotal") || $("progressMusicMin");
    const pBreatheTotal = $("progressBreatheMin"); // optional

    const b = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });
    const m = readJSON("enigmaMusic", { totalMin: 0, today: todayKey(), todayMin: 0 });
    const s = readJSON("enigmaSavedQuotes", []);

    const breathedToday = Number((b.byDay && b.byDay[todayKey()]) || 0);
    const breatheTotal = Number(b.totalMin || 0);

    const musicToday = m.today === todayKey() ? Number(m.todayMin || 0) : 0;
    const musicTotal = Number(m.totalMin || 0);

    pBreathedToday && (pBreathedToday.textContent = String(breathedToday));
    pMusicToday && (pMusicToday.textContent = String(musicToday));
    pSavedQuotes && (pSavedQuotes.textContent = String(s.length || 0));
    pMusicTotal && (pMusicTotal.textContent = String(musicTotal));
    pBreatheTotal && (pBreatheTotal.textContent = String(breatheTotal));
  }

  /* =========================
     BOOT (safe)
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    try { initTheme(); } catch {}

    try { initWotdHomeTile(); } catch {}
    try { initWotdPage(); } catch {}

    try { initDistraction(); } catch {}
    try { initBreathe(); } catch {}

    try { initQuotes(); } catch {}
    try { initMusic(); } catch {}
    try { initYoga(); } catch {}

    try { initResources(); } catch {}
    try { initHelp(); } catch {}

    try { initProgress(); } catch {}
  });

})();
