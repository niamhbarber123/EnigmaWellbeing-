/* =========================================================
   Enigma Wellbeing • app.js (STABLE)
   Fixes:
   - Breathe Start button always works (no early-return)
   - Breathe animation: inhale retracts, exhale expands
   - Timer + Stopwatch + vibration (optional)
   - Back button always goes Home
   - Theme toggle
   - Word of the Day (daily deterministic + modal)
   - Distraction tool
   - Quotes (local set + save)
   - Music + Yoga (chips + links + minutes for music)
   - Progress stats
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
     DATE + STORAGE
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

  const WOTD = [
    { w: "Forgiveness", d: "Releasing resentment so you can move forward lighter." },
    { w: "Honesty", d: "Choosing truth with kindness—to yourself and others." },
    { w: "Trust", d: "Allowing confidence in yourself, others, or the process." },
    { w: "Responsibility", d: "Owning your choices and responding with intention." },
    { w: "Flexibility", d: "Adapting without losing your centre." },
    { w: "Boldness", d: "Taking brave steps even when you feel unsure." },
    { w: "Discipline", d: "Doing what helps you—even when motivation fades." },
    { w: "Prosperity", d: "Growing resources and wellbeing in a healthy way." },
    { w: "Acceptance", d: "Letting reality be what it is—so you can respond wisely." },
    { w: "Serenity", d: "A quiet steadiness, even when life is loud." },
    { w: "Compassion", d: "Meeting struggle with warmth instead of judgement." },
    { w: "Integrity", d: "Aligning actions with values—even in small moments." },
    { w: "Courage", d: "Feeling fear and still choosing what matters." },
    { w: "Creativity", d: "Letting new ideas and possibilities appear." },
    { w: "Balance", d: "Making space for rest, effort, joy, and recovery." },
    { w: "Patience", d: "Letting growth take the time it takes." },
    { w: "Joy", d: "Noticing what feels bright—even briefly." },
    { w: "Fulfilment", d: "A sense of meaning—built over time." }
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

    if (backdrop) backdrop.addEventListener("click", close, { once: true });
    if (closeBtn) closeBtn.addEventListener("click", close, { once: true });

    window.addEventListener(
      "keydown",
      function esc(e) {
        if (e.key === "Escape") close();
      },
      { once: true }
    );
  }

  function initWotd() {
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

    if (infoBtn) {
      infoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showWotdModal(w, d);
      });
    }
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
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?"
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
     BREATHE (FIXED - Start always works)
     inhale = retract (breath-inhale)
     exhale = expand  (breath-exhale)
  ========================= */
  function initBreathe() {
    const page = $("breathePage");
    if (!page) return;

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
    let t1 = null, t2 = null;
    let timerEndAt = 0;
    let stopwatchStartAt = 0;
    let clockInt = null;

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
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      t1 = t2 = null;
      if (clockInt) clearInterval(clockInt);
      clockInt = null;
    }

    function setVisual(state) {
      circle.classList.remove("breath-inhale", "breath-exhale");
      if (state === "inhale") circle.classList.add("breath-inhale");
      if (state === "exhale") circle.classList.add("breath-exhale");
    }

    function setText(title, tip) {
      phaseEl.textContent = title;
      tipEl.textContent = tip || title;
    }

    function updateModeUI() {
      if (!modeSelect || !timerLabel || !stopwatchLabel) return;

      const isTimer = (modeSelect.value || "timer") === "timer";
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

        if (modeSelect && (modeSelect.value || "timer") === "timer") {
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

      setVisual("inhale");
      setText("Breathe in", "Breathe in slowly…");
      vibrate(12);

      t1 = setTimeout(() => {
        if (!running) return;

        setVisual("hold");
        setText("Hold", "Hold gently…");
        vibrate(8);

        t2 = setTimeout(() => {
          if (!running) return;

          setVisual("exhale");
          setText("Breathe out", "Breathe out gently…");
          vibrate(12);

          t1 = setTimeout(() => {
            if (!running) return;

            setVisual("hold");
            setText("Hold", "Let your shoulders soften…");
            vibrate(8);

            t2 = setTimeout(() => {
              if (!running) return;
              breatheLoop();
            }, HOLD * 1000);

          }, EXHALE * 1000);

        }, HOLD * 1000);

      }, INHALE * 1000);
    }

    function startSession() {
      if (running) return;
      running = true;

      const now = Date.now();
      if (modeSelect && durationSelect && timerLabel && stopwatchLabel) {
        const mode = modeSelect.value || "timer";
        if (mode === "timer") {
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
        const m = modeSelect.value || "timer";
        if (m === "timer") addMin = Math.max(1, parseInt(durationSelect.value || "1", 10));
        else {
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

    startBtn.addEventListener("click", (e) => { e.preventDefault(); startSession(); });
    stopBtn.addEventListener("click", (e) => { e.preventDefault(); stopSession(); });
    completeBtn.addEventListener("click", (e) => { e.preventDefault(); completeSession(); });

    if (modeSelect) modeSelect.addEventListener("change", updateModeUI);

    stopSession();
    updateModeUI();
  }

  /* =========================
     QUOTES (local + save)
  ========================= */
  const QUOTES = [
    { t: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" },
    { t: "It always seems impossible until it’s done.", a: "Nelson Mandela" },
    { t: "You do not have to see the whole staircase—just take the first step.", a: "Martin Luther King Jr." },
    { t: "Progress, not perfection.", a: "Unknown" },
    { t: "Breathe. This is a moment, not your whole life.", a: "Unknown" },
    { t: "You have survived 100% of your hardest days.", a: "Unknown" },
    { t: "Nothing can dim the light that shines from within.", a: "Maya Angelou" },
    { t: "The only way out is through.", a: "Robert Frost" },
    { t: "Slow progress is still progress.", a: "Unknown" },
    { t: "Rest is productive.", a: "Unknown" },
    { t: "Make peace with your pace.", a: "Unknown" },
    { t: "Gentle is still strong.", a: "Unknown" }
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

    function search() {
      const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
      if (!q) {
        status && (status.textContent = "Tip: type a word like “calm”, “hope”, “courage”…");
        render(QUOTES);
        return;
      }
      const hits = QUOTES.filter((x) => x.t.toLowerCase().includes(q) || x.a.toLowerCase().includes(q));
      status && (status.textContent = hits.length ? `Showing ${hits.length} result(s).` : "No results — try another word.");
      render(hits);
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
      render(QUOTES);
    }

    if (searchBtn) searchBtn.addEventListener("click", search);
    if (randomBtn) randomBtn.addEventListener("click", random);
    if (viewSavedBtn) viewSavedBtn.addEventListener("click", viewSaved);
    if (clearSavedBtn) clearSavedBtn.addEventListener("click", clearSaved);

    updateSavedCount();
    render(QUOTES);
  }

  /* =========================
     MUSIC (chips + links + minutes)
  ========================= */
  const MUSIC_TRACKS = [
    { mood: "Anxious", label: "Calm breathing music", url: "https://www.youtube.com/results?search_query=calm+breathing+music" },
    { mood: "Focus", label: "Lo-fi focus mix", url: "https://www.youtube.com/results?search_query=lofi+focus+music" },
    { mood: "Sleep", label: "Sleep music", url: "https://www.youtube.com/results?search_query=sleep+music+relaxing" },
    { mood: "Stressed", label: "Relaxing piano", url: "https://www.youtube.com/results?search_query=relaxing+piano" }
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
    moods.forEach((m) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (m === active ? " active" : "");
      b.textContent = m;
      b.addEventListener("click", () => {
        active = m;
        [...moodRow.querySelectorAll(".chip")].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        renderTracks();
      });
      moodRow.appendChild(b);
    });

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
     YOGA (chips + links)
  ========================= */
  const YOGA_VIDEOS = [
    { mood: "Anxiety", label: "10 min Yoga for Anxiety", url: "https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
    { mood: "Stress", label: "15 min Gentle Yoga for Stress", url: "https://www.youtube.com/results?search_query=gentle+yoga+for+stress+15+minutes" },
    { mood: "Sleep", label: "Yoga for Sleep (wind down)", url: "https://www.youtube.com/results?search_query=yoga+for+sleep+wind+down" },
    { mood: "Morning", label: "Morning Yoga (wake up)", url: "https://www.youtube.com/results?search_query=morning+yoga+wake+up" },
    { mood: "All", label: "Gentle yoga (all levels)", url: "https://www.youtube.com/results?search_query=gentle+yoga+all+levels" }
  ];

  function initYoga() {
    const moodRow = $("yogaMoodRow");
    const list = $("yogaList");
    if (!moodRow || !list) return;

    const moods = ["All", "Anxiety", "Stress", "Sleep", "Morning"];
    let active = "All";

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
    moods.forEach((m) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (m === active ? " active" : "");
      b.textContent = m;
      b.addEventListener("click", () => {
        active = m;
        [...moodRow.querySelectorAll(".chip")].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        renderVideos();
      });
      moodRow.appendChild(b);
    });

    renderVideos();
  }

  /* =========================
     PROGRESS (supports both ID styles)
  ========================= */
  function initProgress() {
    const page = $("progressPage") || $("progressWrap");
    if (!page) return;

    const b = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });
    const m = readJSON("enigmaMusic", { totalMin: 0, today: todayKey(), todayMin: 0 });
    const s = readJSON("enigmaSavedQuotes", []);

    const breatheToday = Number((b.byDay && b.byDay[todayKey()]) || 0);
    const breatheTotal = Number(b.totalMin || 0);
    const musicToday = (m.today === todayKey()) ? Number(m.todayMin || 0) : 0;
    const musicTotal = Number(m.totalMin || 0);

    // old IDs
    if ($("pBreathedToday")) $("pBreathedToday").textContent = String(breatheToday);
    if ($("pMusicToday")) $("pMusicToday").textContent = String(musicToday);
    if ($("pSavedQuotes")) $("pSavedQuotes").textContent = String(s.length || 0);
    if ($("pMusicTotal")) $("pMusicTotal").textContent = String(musicTotal);

    // newer IDs (if you use them)
    if ($("progressBreatheToday")) $("progressBreatheToday").textContent = String(breatheToday);
    if ($("progressBreatheMin")) $("progressBreatheMin").textContent = String(breatheTotal);
    if ($("progressMusicToday")) $("progressMusicToday").textContent = String(musicToday);
    if ($("progressMusicMin")) $("progressMusicMin").textContent = String(musicTotal);
    if ($("progressSavedQuotes")) $("progressSavedQuotes").textContent = String(s.length || 0);
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    try { applyTheme(); } catch {}
    try { initTheme(); } catch {}

    // home widgets
    try { initWotd(); } catch {}
    try { initDistraction(); } catch {}

    // pages
    try { initBreathe(); } catch {}
    try { initQuotes(); } catch {}
    try { initMusic(); } catch {}
    try { initYoga(); } catch {}
    try { initProgress(); } catch {}
  });

})();
