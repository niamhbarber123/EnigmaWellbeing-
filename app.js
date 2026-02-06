/* =========================================================
   Enigma Wellbeing • app.js (FULL)
   - Theme toggle (moon ↔ sun)
   - Back navigation
   - Word of the Day (deterministic daily pick + modal)
   - Distraction tool
   - Breathe (timer OR stopwatch + reversed inhale/exhale + slower)
   - Music (chips + button list)
   - Yoga (chips + button list)
   - Quotes (local list + search + save)
   - Progress (reads local stats)
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* =========================
     BACK
  ========================= */
  window.enigmaBack = function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  /* =========================
     DATE HELPERS
  ========================= */
  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  function seedFromToday() {
    const s = todayKey().replaceAll("-", "");
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 20260101;
  }

  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* =========================
     THEME (moon ↔ sun)
  ========================= */
  function setThemeIcon() {
    const btn = $("themeFab");
    if (!btn) return;
    btn.textContent = document.body.classList.contains("night") ? "☀️" : "🌙";
  }

  function applyTheme() {
    const t = localStorage.getItem("enigmaTheme") || "light";
    document.body.classList.toggle("night", t === "night");
    setThemeIcon();
  }

  function toggleTheme() {
    const night = document.body.classList.toggle("night");
    localStorage.setItem("enigmaTheme", night ? "night" : "light");
    setThemeIcon();
  }

  function initTheme() {
    const btn = $("themeFab");
    if (btn) btn.addEventListener("click", toggleTheme);
    setThemeIcon();
  }

  /* =========================
     WORD OF THE DAY (WOTD)
  ========================= */
  const WOTD = [
    { w: "Forgiveness", d: "Releasing resentment so you can move forward lighter." },
    { w: "Honesty", d: "Choosing truth with kindness—to yourself and others." },
    { w: "Trust", d: "Allowing confidence in yourself, others, or the process." },
    { w: "Responsibility", d: "Owning your choices and responding with intention." },
    { w: "Flexibility", d: "Adapting without losing your centre." },
    { w: "Boldness", d: "Taking brave steps even when you feel unsure." },
    { w: "Discipline", d: "Doing what helps you—even when motivation fades." },
    { w: "Compassion", d: "Meeting struggle with warmth instead of judgement." },
    { w: "Integrity", d: "Aligning actions with values—even in small moments." },
    { w: "Courage", d: "Feeling fear and still choosing what matters." },
    { w: "Gentleness", d: "Soft strength—especially with yourself." },
    { w: "Clarity", d: "Seeing what matters most, without the noise." },
    { w: "Balance", d: "Making space for rest, effort, joy, and recovery." },
    { w: "Patience", d: "Letting growth take the time it takes." },
    { w: "Simplicity", d: "Choosing what matters and letting go of the rest." },
    { w: "Confidence", d: "Trusting your ability to figure things out." },
    { w: "Authenticity", d: "Being real—no performance required." },
    { w: "Joy", d: "Noticing what feels bright—even briefly." },
    { w: "Grace", d: "Moving with softness through imperfect moments." },
    { w: "Strength", d: "Endurance, boundaries, and quiet resilience." }
  ];

  function pickWotd() {
    const rand = mulberry32(seedFromToday());
    const i = Math.floor(rand() * WOTD.length);
    return WOTD[i] || { w: "Serenity", d: "A quiet steadiness, even when life is loud." };
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

    window.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") {
        close();
        window.removeEventListener("keydown", esc);
      }
    });
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
    "What’s a tiny ‘safe’ plan for the next 10 minutes?",
    "What colour feels calming to you today?",
    "What’s one kind thing you’d say to a friend feeling this way?",
    "What’s the smallest next step you can take?",
    "What’s one small win you’ve had this week?"
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
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || s.day !== todayKey()) return null;
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
      let s = load();
      if (!s) {
        startNew();
        s = load();
      }
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
      let s = load();
      if (!s) {
        startNew();
        s = load();
      }
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
     BREATHE (timer OR stopwatch)
  ========================= */
  function formatMMSS(totalSec) {
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

    const timerSelect = $("breathLength");
    const modeSelect = $("breathMode");
    const timerReadout = $("breathTimer");

    if (!phaseEl || !tipEl || !circle || !startBtn || !stopBtn || !completeBtn) return;

    // Slower + reversed:
    // INHALE = retract (smaller), EXHALE = expand (bigger)
    // (Your CSS classes are inhale/exhale; we apply them reversed.)
    const INHALE_MS = 5200;
    const EXHALE_MS = 5200;
    const HOLD_MS = 600;

    let running = false;
    let interval = null;
    let cycleTimeout = null;

    // timer/stopwatch
    let mode = "timer"; // timer | stopwatch
    let totalSec = 60;
    let elapsedSec = 0;

    function setButtons(isRunning) {
      startBtn.disabled = isRunning;
      stopBtn.disabled = !isRunning;
    }

    function setTimerText() {
      if (!timerReadout) return;
      if (mode === "timer") timerReadout.textContent = `Time left: ${formatMMSS(Math.max(0, totalSec - elapsedSec))}`;
      else timerReadout.textContent = `Elapsed: ${formatMMSS(elapsedSec)}`;
    }

    function clearAll() {
      if (interval) clearInterval(interval);
      if (cycleTimeout) clearTimeout(cycleTimeout);
      interval = null;
      cycleTimeout = null;
    }

    function stopSession(message) {
      running = false;
      clearAll();
      circle.classList.remove("inhale", "exhale");
      phaseEl.textContent = "Ready";
      tipEl.textContent = message || "Tap Start to begin.";
      elapsedSec = 0;
      setTimerText();
      setButtons(false);
    }

    function markBreathedToday() {
      // simple daily counter for progress page
      const key = "enigmaBreatheDone_" + todayKey();
      const n = parseInt(localStorage.getItem(key) || "0", 10);
      localStorage.setItem(key, String((Number.isFinite(n) ? n : 0) + 1));
    }

    function finishSession() {
      stopSession("Nice work. Completed ✅");
      markBreathedToday();
    }

    function startTicker() {
      setTimerText();
      interval = setInterval(() => {
        if (!running) return;

        elapsedSec += 1;
        setTimerText();

        if (mode === "timer") {
          if (elapsedSec >= totalSec) finishSession();
        }
      }, 1000);
    }

    function breatheCycle() {
      if (!running) return;

      // INHALE phase (but visually retract) => apply "exhale" class for smaller
      phaseEl.textContent = "Breathe in";
      circle.classList.remove("inhale", "exhale");
      circle.classList.add("exhale"); // smaller
      tipEl.textContent = "In… slowly";

      cycleTimeout = setTimeout(() => {
        if (!running) return;

        // small hold
        phaseEl.textContent = "Hold";
        tipEl.textContent = "Hold…";
        cycleTimeout = setTimeout(() => {
          if (!running) return;

          // EXHALE phase (but visually expand) => apply "inhale" class for bigger
          phaseEl.textContent = "Breathe out";
          circle.classList.remove("inhale", "exhale");
          circle.classList.add("inhale"); // bigger
          tipEl.textContent = "Out… gently";

          cycleTimeout = setTimeout(() => {
            if (!running) return;

            // hold
            phaseEl.textContent = "Hold";
            tipEl.textContent = "Hold…";
            cycleTimeout = setTimeout(() => {
              if (!running) return;
              breatheCycle();
            }, HOLD_MS);

          }, EXHALE_MS);

        }, HOLD_MS);
      }, INHALE_MS);
    }

    function readSettings() {
      if (modeSelect) mode = modeSelect.value || "timer";

      if (timerSelect) {
        const v = (timerSelect.value || "60").trim();
        const parsed = parseInt(v, 10);
        totalSec = Number.isFinite(parsed) ? parsed : 60;
      } else {
        totalSec = 60;
      }
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (running) return;

      readSettings();
      running = true;
      elapsedSec = 0;

      setButtons(true);
      startTicker();
      breatheCycle();
    });

    stopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      stopSession("Stopped. Tap Start to begin again.");
    });

    completeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      finishSession();
    });

    // if dropdowns exist, update readout on change
    if (timerSelect) timerSelect.addEventListener("change", () => { readSettings(); setTimerText(); });
    if (modeSelect) modeSelect.addEventListener("change", () => { readSettings(); setTimerText(); });

    // initial state
    setButtons(false);
    readSettings();
    setTimerText();
  }

  /* =========================
     MUSIC
  ========================= */
  const MUSIC_TRACKS = [
    { mood: "All", title: "Calm breathing music", url: "https://www.youtube.com/results?search_query=calm+breathing+music" },
    { mood: "Focus", title: "Lo-fi focus mix", url: "https://www.youtube.com/results?search_query=lofi+focus+mix" },
    { mood: "Sleep", title: "Sleep music", url: "https://www.youtube.com/results?search_query=sleep+music+8+hours" },
    { mood: "Stressed", title: "Relaxing piano", url: "https://www.youtube.com/results?search_query=relaxing+piano" },
    { mood: "Anxious", title: "Ocean waves", url: "https://www.youtube.com/results?search_query=ocean+waves+relaxing" }
  ];

  function initMusic() {
    const moodWrap = $("moodChips");
    const list = $("musicList");
    if (!moodWrap || !list) return;

    const moods = ["All", "Anxious", "Stressed", "Focus", "Sleep"];
    let active = "All";

    function renderChips() {
      moodWrap.innerHTML = "";
      moods.forEach((m) => {
        const b = document.createElement("button");
        b.className = "chip" + (m === active ? " active" : "");
        b.type = "button";
        b.textContent = m;
        b.addEventListener("click", () => {
          active = m;
          renderChips();
          renderList();
        });
        moodWrap.appendChild(b);
      });
    }

    function renderList() {
      list.innerHTML = "";
      const items = MUSIC_TRACKS.filter(t => active === "All" ? true : t.mood === active);

      items.forEach((t) => {
        const a = document.createElement("a");
        a.className = "music-btn";
        a.href = t.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `<span>${t.title}</span><span>▶</span>`;
        list.appendChild(a);
      });

      if (items.length === 0) {
        const p = document.createElement("div");
        p.className = "gentle-text";
        p.textContent = "No tracks for this mood yet.";
        list.appendChild(p);
      }
    }

    renderChips();
    renderList();

    // minutes listened is handled if those ids exist
    initListeningCounter();
  }

  function initListeningCounter() {
    const minsTodayEl = $("minsToday");
    const minsTotalEl = $("minsTotal");
    const startBtn = $("startListenBtn");
    const endBtn = $("endListenBtn");
    const statusEl = $("listenStatus");
    if (!minsTodayEl || !minsTotalEl || !startBtn || !endBtn || !statusEl) return;

    const KEY = "enigmaListenSession";
    const TOTAL_KEY = "enigmaListenTotalMin";
    const TODAY_KEY = "enigmaListenTodayMin_" + todayKey();

    function readNum(k) {
      const n = parseInt(localStorage.getItem(k) || "0", 10);
      return Number.isFinite(n) ? n : 0;
    }

    function writeNum(k, v) {
      localStorage.setItem(k, String(v));
    }

    function render() {
      minsTodayEl.textContent = String(readNum(TODAY_KEY));
      minsTotalEl.textContent = String(readNum(TOTAL_KEY));
    }

    function loadSession() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || typeof s.startedAt !== "number") return null;
        return s;
      } catch {
        return null;
      }
    }

    function saveSession(s) {
      localStorage.setItem(KEY, JSON.stringify(s));
    }

    function clearSession() {
      localStorage.removeItem(KEY);
    }

    function setActive(active) {
      statusEl.textContent = active ? "Session active…" : "No active session.";
    }

    startBtn.addEventListener("click", () => {
      if (loadSession()) return;
      saveSession({ startedAt: Date.now() });
      setActive(true);
    });

    endBtn.addEventListener("click", () => {
      const s = loadSession();
      if (!s) return;

      const ms = Date.now() - s.startedAt;
      const mins = Math.max(0, Math.round(ms / 60000));

      writeNum(TOTAL_KEY, readNum(TOTAL_KEY) + mins);
      writeNum(TODAY_KEY, readNum(TODAY_KEY) + mins);

      clearSession();
      setActive(false);
      render();
    });

    const existing = loadSession();
    setActive(!!existing);
    render();
  }

  /* =========================
     YOGA
  ========================= */
  const YOGA_VIDEOS = [
    { mood: "All", title: "10 min Yoga for Anxiety", url: "https://www.youtube.com/results?search_query=10+min+yoga+for+anxiety" },
    { mood: "Stress", title: "15 min Gentle Yoga for Stress", url: "https://www.youtube.com/results?search_query=15+min+gentle+yoga+for+stress" },
    { mood: "Sleep", title: "Yoga for Sleep (wind down)", url: "https://www.youtube.com/results?search_query=yoga+for+sleep+wind+down" },
    { mood: "Morning", title: "Morning Yoga (wake up)", url: "https://www.youtube.com/results?search_query=morning+yoga+wake+up" },
    { mood: "Stiff body", title: "Yoga for stiff back/hips", url: "https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" },
    { mood: "All", title: "Gentle yoga (all levels)", url: "https://www.youtube.com/results?search_query=gentle+yoga+all+levels" }
  ];

  function initYoga() {
    const moodWrap = $("yogaChips") || $("moodChips");
    const list = $("yogaList") || $("videoList");
    if (!moodWrap || !list) return;

    const moods = ["All", "Anxiety", "Stress", "Sleep", "Morning", "Stiff body"];
    let active = "All";

    function renderChips() {
      moodWrap.innerHTML = "";
      moods.forEach((m) => {
        const b = document.createElement("button");
        b.className = "chip" + (m === active ? " active" : "");
        b.type = "button";
        b.textContent = m;
        b.addEventListener("click", () => {
          active = m;
          renderChips();
          renderList();
        });
        moodWrap.appendChild(b);
      });
    }

    function renderList() {
      list.innerHTML = "";
      const items = YOGA_VIDEOS.filter(v => active === "All" ? true : v.mood === active);

      items.forEach((v) => {
        const a = document.createElement("a");
        a.className = "music-btn";
        a.href = v.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `<span>${v.title}</span><span>▶</span>`;
        list.appendChild(a);
      });

      if (items.length === 0) {
        const p = document.createElement("div");
        p.className = "gentle-text";
        p.textContent = "No videos for this mood yet.";
        list.appendChild(p);
      }
    }

    renderChips();
    renderList();
  }

  /* =========================
     QUOTES (local)
  ========================= */
  const QUOTES = [
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "You do not have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
    { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
    { text: "Small steps every day.", author: "Unknown" },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "Feelings are visitors. Let them come and go.", author: "Mooji" },
    { text: "You’ve survived 100% of your hardest days.", author: "Unknown" }
  ];

  function initQuotes() {
    const grid = $("quoteGrid");
    const searchInput = $("quoteSearch");
    const searchBtn = $("quoteSearchBtn");
    const randomBtn = $("quoteRandomBtn");
    const savedBtn = $("viewSavedBtn");
    const clearBtn = $("clearSavedBtn");
    const savedCount = $("savedCount");
    const status = $("quoteStatus");
    if (!grid) return;

    const SAVE_KEY = "enigmaSavedQuotesV1";

    function loadSaved() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    }

    function saveSaved(arr) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(arr));
    }

    function updateCount() {
      if (!savedCount) return;
      savedCount.textContent = String(loadSaved().length);
    }

    function render(list) {
      grid.innerHTML = "";
      if (!list || list.length === 0) {
        const p = document.createElement("div");
        p.className = "gentle-text";
        p.textContent = "No quotes found.";
        grid.appendChild(p);
        return;
      }

      const saved = loadSaved();
      list.forEach((q) => {
        const tile = document.createElement("div");
        tile.className = "quote-tile";

        const qt = document.createElement("div");
        qt.className = "quote-text";
        qt.textContent = `“${q.text}”`;

        const meta = document.createElement("div");
        meta.className = "quote-meta";

        const author = document.createElement("div");
        author.className = "quote-author";
        author.textContent = `— ${q.author}`;

        const btn = document.createElement("button");
        btn.className = "quote-save-btn";
        btn.type = "button";

        const isSaved = saved.some(s => s.text === q.text && s.author === q.author);
        btn.classList.toggle("saved", isSaved);
        btn.textContent = isSaved ? "💜 Saved" : "💜 Save";

        btn.addEventListener("click", () => {
          const cur = loadSaved();
          const exists = cur.some(s => s.text === q.text && s.author === q.author);
          const next = exists ? cur.filter(s => !(s.text === q.text && s.author === q.author)) : [...cur, q];
          saveSaved(next);
          updateCount();
          render(list);
        });

        meta.appendChild(author);
        meta.appendChild(btn);

        tile.appendChild(qt);
        tile.appendChild(meta);
        grid.appendChild(tile);
      });
    }

    function search() {
      const term = (searchInput?.value || "").trim().toLowerCase();
      if (!term) {
        status && (status.textContent = "Type a word to search.");
        render(QUOTES);
        return;
      }
      const res = QUOTES.filter(q =>
        q.text.toLowerCase().includes(term) || q.author.toLowerCase().includes(term)
      );
      status && (status.textContent = `Found ${res.length} result(s).`);
      render(res);
    }

    function randomOne() {
      const r = Math.floor(Math.random() * QUOTES.length);
      render([QUOTES[r]]);
      status && (status.textContent = "Random quote.");
    }

    function showSaved() {
      const saved = loadSaved();
      render(saved);
      status && (status.textContent = "Showing saved quotes.");
    }

    function clearSaved() {
      saveSaved([]);
      updateCount();
      render(QUOTES);
      status && (status.textContent = "Saved quotes deleted.");
    }

    searchBtn && searchBtn.addEventListener("click", search);
    randomBtn && randomBtn.addEventListener("click", randomOne);
    savedBtn && savedBtn.addEventListener("click", showSaved);
    clearBtn && clearBtn.addEventListener("click", clearSaved);

    updateCount();
    render(QUOTES);
  }

  /* =========================
     PROGRESS
  ========================= */
  function initProgress() {
    const page = $("progressPage");
    if (!page) return;

    const breathedToday = $("pBreathedToday");
    const musicToday = $("pMusicToday");
    const savedQuotes = $("pSavedQuotes");
    const musicTotal = $("pMusicTotal");

    const breatheKey = "enigmaBreatheDone_" + todayKey();
    const musicTodayKey = "enigmaListenTodayMin_" + todayKey();
    const musicTotalKey = "enigmaListenTotalMin";
    const quoteSaveKey = "enigmaSavedQuotesV1";

    function readNum(k) {
      const n = parseInt(localStorage.getItem(k) || "0", 10);
      return Number.isFinite(n) ? n : 0;
    }

    function readSavedCount() {
      try {
        const raw = localStorage.getItem(quoteSaveKey);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr.length : 0;
      } catch {
        return 0;
      }
    }

    breathedToday && (breathedToday.textContent = String(readNum(breatheKey)));
    musicToday && (musicToday.textContent = String(readNum(musicTodayKey)));
    musicTotal && (musicTotal.textContent = String(readNum(musicTotalKey)));
    savedQuotes && (savedQuotes.textContent = String(readSavedCount()));
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    try { applyTheme(); } catch {}
    try { initTheme(); } catch {}

    // ✅ This was missing before → fixes WOTD stuck Loading
    try { initWotd(); } catch {}

    try { initDistraction(); } catch {}
    try { initBreathe(); } catch {}
    try { initMusic(); } catch {}
    try { initYoga(); } catch {}
    try { initQuotes(); } catch {}
    try { initProgress(); } catch {}
  });

})();
