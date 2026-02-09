/* =========================================================
   Enigma Wellbeing • app.js (STABLE)
   Includes:
   - Theme toggle (all pages)
   - Back always Home
   - Breathe (Start/Stop/Complete) + animation
   - Resources (NHS only) boxed links
   - Help boxed NHS links + grounding/tiny plan
   - Quotes: search/random + favourites + delete saved
   - Yoga: mood chips + boxed YouTube links
   - Music: mood chips + boxed links + minutes tracking
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* =========================
     NAV
  ========================= */
  window.enigmaHome = function () {
    location.href = "index.html";
  };
  window.enigmaBack = function () {
    location.href = "index.html";
  };

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

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
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
     LINK BOX RENDERER
  ========================= */
  function renderLinkBoxes(containerId, items) {
    const el = $(containerId);
    if (!el) return;

    el.classList.add("link-list");
    el.innerHTML = "";

    items.forEach((it) => {
      const a = document.createElement("a");
      a.className = "link-box";
      a.href = it.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `
        <div>
          <div class="lb-title">${escapeHtml(it.title)}</div>
          <div class="lb-desc">${escapeHtml(it.desc)}</div>
        </div>
        <div class="lb-arrow">›</div>
      `;
      el.appendChild(a);
    });
  }

  /* =========================
     NHS RESOURCES (NHS only)
  ========================= */
  const NHS_RESOURCES = [
    { title: "NHS mental health hub", desc: "Guides, conditions, and support options.", url: "https://www.nhs.uk/mental-health/" },
    { title: "Borderline personality disorder (BPD)", desc: "Symptoms, treatment, and where to get help.", url: "https://www.nhs.uk/mental-health/conditions/borderline-personality-disorder/" },
    { title: "Anxiety", desc: "Types of anxiety, symptoms, and treatment.", url: "https://www.nhs.uk/mental-health/conditions/anxiety/" },
    { title: "Depression", desc: "Advice, treatment, and self-help steps.", url: "https://www.nhs.uk/mental-health/conditions/clinical-depression/" },
    { title: "PTSD", desc: "Symptoms and treatment information.", url: "https://www.nhs.uk/mental-health/conditions/post-traumatic-stress-disorder-ptsd/" },
    { title: "OCD", desc: "Understanding OCD and getting support.", url: "https://www.nhs.uk/mental-health/conditions/obsessive-compulsive-disorder-ocd/" },
    { title: "Find NHS Talking Therapies", desc: "Self-referral and local services.", url: "https://www.nhs.uk/service-search/mental-health/find-an-nhs-talking-therapies-service/" },
    { title: "Get urgent help", desc: "If you need help now.", url: "https://www.nhs.uk/mental-health/get-urgent-help-for-mental-health/" }
  ];

  function initResources() {
    const page = $("resourcesPage");
    if (!page) return;
    renderLinkBoxes("resourcesList", NHS_RESOURCES);
  }

  /* =========================
     HELP (NHS links boxed)
  ========================= */
  const NHS_HELP_LINKS = [
    { title: "NHS urgent mental health help", desc: "What to do if you need urgent support right now.", url: "https://www.nhs.uk/mental-health/get-urgent-help-for-mental-health/" },
    { title: "If you feel you might act", desc: "Advice on staying safe and getting urgent help.", url: "https://www.nhs.uk/mental-health/get-urgent-help-for-mental-health/" },
    { title: "NHS Talking Therapies", desc: "Self-refer for anxiety/depression support.", url: "https://www.nhs.uk/service-search/mental-health/find-an-nhs-talking-therapies-service/" }
  ];

  function initHelp() {
    const page = $("helpPage");
    if (!page) return;
    renderLinkBoxes("helpLinks", NHS_HELP_LINKS);
  }

  /* =========================
     BREATHE
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
      if (state === "inhale") circle.classList.add("breath-inhale"); // retract
      if (state === "exhale") circle.classList.add("breath-exhale"); // expand
    }

    function setText(title, tip) {
      phaseEl.textContent = title;
      tipEl.textContent = tip || title;
    }

    function updateModeUI() {
      if (!modeSelect || !timerLabel || !stopwatchLabel) return;
      const mode = modeSelect.value || "timer";
      const isTimer = mode === "timer";

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

      setVisual("inhale");
      setText("Breathe in", "Breathe in slowly…");
      vibrate(10);

      t1 = setTimeout(() => {
        if (!running) return;

        setText("Hold", "Hold gently…");
        vibrate(6);

        t2 = setTimeout(() => {
          if (!running) return;

          setVisual("exhale");
          setText("Breathe out", "Breathe out gently…");
          vibrate(10);

          t1 = setTimeout(() => {
            if (!running) return;

            setText("Hold", "Let your shoulders soften…");
            vibrate(6);

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
      if (modeSelect && durationSelect) {
        const mode = modeSelect.value || "timer";
        if (mode === "timer") {
          const mins = Math.max(1, parseInt(durationSelect.value || "1", 10));
          timerEndAt = now + mins * 60 * 1000;
          if (timerLabel) timerLabel.textContent = `Time: ${fmtTime(mins * 60)}`;
        } else {
          stopwatchStartAt = now;
          if (stopwatchLabel) stopwatchLabel.textContent = "Stopwatch: 0:00";
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
        const mode = modeSelect.value || "timer";
        if (mode === "timer") addMin = Math.max(1, parseInt(durationSelect.value || "1", 10));
        else {
          const elapsedSec = (Date.now() - stopwatchStartAt) / 1000;
          addMin = Math.max(1, Math.round(elapsedSec / 60));
        }
      }

      log.totalMin = (log.totalMin || 0) + addMin;
      log.byDay = log.byDay || {};
      log.byDay[todayKey()] = (log.byDay[todayKey()] || 0) + addMin;
      writeJSON("enigmaBreatheLog", log);

      vibrate([20, 50, 20]);

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
     QUOTES (search + random + favourites)
     Requires these IDs on quotes.html:
     - quoteSearchInput
     - quoteSearchBtn
     - quoteRandomBtn
     - quoteResults
     - quoteSavedCount
     - quoteClearSavedBtn
========================= */
  const QUOTES = [
    { t: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" },
    { t: "It always seems impossible until it’s done.", a: "Nelson Mandela" },
    { t: "Feelings are like waves. We can’t stop them from coming, but we can choose which ones to surf.", a: "Jonatan Mårtensson" },
    { t: "Slow progress is still progress.", a: "Unknown" },
    { t: "You don’t have to see the whole staircase—just take the first step.", a: "Martin Luther King Jr." },
    { t: "Breathe. It’s just a bad day, not a bad life.", a: "Unknown" },
    { t: "This too shall pass.", a: "Persian proverb" },
    { t: "Small steps every day.", a: "Unknown" },
    { t: "You are allowed to rest.", a: "Unknown" },
    { t: "Do what you can, with what you have, where you are.", a: "Theodore Roosevelt" }
  ];

  const QUOTE_SAVED_KEY = "enigma_quote_saved_v1";

  function initQuotes() {
    const page = $("quotesPage");
    if (!page) return;

    const input = $("quoteSearchInput");
    const searchBtn = $("quoteSearchBtn");
    const randomBtn = $("quoteRandomBtn");
    const results = $("quoteResults");
    const savedCount = $("quoteSavedCount");
    const clearBtn = $("quoteClearSavedBtn");

    if (!results) return;

    function loadSaved() {
      return readJSON(QUOTE_SAVED_KEY, []);
    }

    function saveSaved(arr) {
      writeJSON(QUOTE_SAVED_KEY, arr);
      if (savedCount) savedCount.textContent = String(arr.length);
    }

    function isSaved(q) {
      const saved = loadSaved();
      return saved.some(x => x.t === q.t && x.a === q.a);
    }

    function render(list) {
      const saved = loadSaved();
      if (savedCount) savedCount.textContent = String(saved.length);

      results.innerHTML = "";
      list.forEach((q) => {
        const wrap = document.createElement("div");
        wrap.className = "book-item"; // reuse nice box style
        const savedNow = isSaved(q);

        wrap.innerHTML = `
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <div style="flex:1;">
              <div class="book-title">“${escapeHtml(q.t)}”</div>
              <div class="book-meta">— ${escapeHtml(q.a)}</div>
            </div>
            <button class="fav-btn ${savedNow ? "active" : ""}" type="button" aria-label="Save quote">
              ${savedNow ? "♥" : "♡"}
            </button>
          </div>
        `;

        const btn = wrap.querySelector("button");
        btn.addEventListener("click", () => {
          const current = loadSaved();
          const idx = current.findIndex(x => x.t === q.t && x.a === q.a);
          if (idx >= 0) current.splice(idx, 1);
          else current.push(q);
          saveSaved(current);
          render(list);
        });

        results.appendChild(wrap);
      });
    }

    function doSearch() {
      const q = (input ? input.value : "").trim().toLowerCase();
      const filtered = !q
        ? QUOTES
        : QUOTES.filter(x => x.t.toLowerCase().includes(q) || x.a.toLowerCase().includes(q));
      render(filtered);
    }

    function doRandom() {
      const pick = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      render([pick]);
    }

    if (searchBtn) searchBtn.addEventListener("click", (e) => { e.preventDefault(); doSearch(); });
    if (randomBtn) randomBtn.addEventListener("click", (e) => { e.preventDefault(); doRandom(); });
    if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });

    if (clearBtn) {
      clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem(QUOTE_SAVED_KEY);
        if (savedCount) savedCount.textContent = "0";
        doSearch();
      });
    }

    doSearch();
  }

  /* =========================
     YOGA (chips + boxed links)
     Requires IDs on yoga.html:
     - yogaChips
     - yogaList
========================= */
  const YOGA_ITEMS = [
    { mood: "All", title: "Yoga for Anxiety (10 min)", desc: "Gentle grounding flow.", url: "https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
    { mood: "Anxiety", title: "Yoga for Anxiety", desc: "Pick a calm short session.", url: "https://www.youtube.com/results?search_query=yoga+for+anxiety" },
    { mood: "Stress", title: "Yoga for Stress", desc: "Release tension.", url: "https://www.youtube.com/results?search_query=yoga+for+stress" },
    { mood: "Sleep", title: "Yoga for Sleep", desc: "Wind down before bed.", url: "https://www.youtube.com/results?search_query=bedtime+yoga+for+sleep" },
    { mood: "Morning", title: "Morning Yoga", desc: "Gentle wake-up flow.", url: "https://www.youtube.com/results?search_query=morning+yoga+gentle" },
    { mood: "Stiff body", title: "Yoga for a stiff back/hips", desc: "Loosen tight areas.", url: "https://www.youtube.com/results?search_query=yoga+for+stiff+hips+and+back" }
  ];

  function initYoga() {
    const page = $("yogaPage");
    if (!page) return;

    const chipsEl = $("yogaChips");
    const listEl = $("yogaList");
    if (!chipsEl || !listEl) return;

    const moods = ["All", "Anxiety", "Stress", "Sleep", "Morning", "Stiff body"];
    let active = "All";

    function renderChips() {
      chipsEl.innerHTML = "";
      moods.forEach(m => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (m === active ? " active" : "");
        b.textContent = m;
        b.addEventListener("click", () => {
          active = m;
          renderChips();
          renderList();
        });
        chipsEl.appendChild(b);
      });
    }

    function renderList() {
      const filtered = active === "All"
        ? YOGA_ITEMS.filter(x => x.mood !== "All")
        : YOGA_ITEMS.filter(x => x.mood === active);

      renderLinkBoxes("yogaList", filtered.map(x => ({
        title: x.title,
        desc: x.desc,
        url: x.url
      })));
    }

    renderChips();
    renderList();
  }

  /* =========================
     MUSIC (chips + boxed links + minutes)
     Requires IDs on sounds.html:
     - musicChips
     - musicList
     - musicStartBtn
     - musicEndBtn
     - musicTodayLabel
     - musicTotalLabel
========================= */
  const MUSIC_ITEMS = [
    { mood: "Anxious", title: "Calm breathing music", desc: "Soothing background sound.", url: "https://www.youtube.com/results?search_query=calm+breathing+music" },
    { mood: "Stressed", title: "Relaxing piano", desc: "Soft piano calming tracks.", url: "https://www.youtube.com/results?search_query=relaxing+piano+calming" },
    { mood: "Focus", title: "Lo-fi focus mix", desc: "Steady focus music.", url: "https://www.youtube.com/results?search_query=lofi+focus+mix" },
    { mood: "Sleep", title: "Sleep music", desc: "Gentle sleep sound.", url: "https://www.youtube.com/results?search_query=sleep+music+deep+sleep" },
    { mood: "Sleep", title: "Ocean waves", desc: "Nature sound for rest.", url: "https://www.youtube.com/results?search_query=ocean+waves+sleep" }
  ];

  const MUSIC_LOG_KEY = "enigmaMusicLog_v1";
  const MUSIC_SESSION_KEY = "enigmaMusicSession_v1";

  function initMusic() {
    const page = $("musicPage");
    if (!page) return;

    const chipsEl = $("musicChips");
    const listEl = $("musicList");
    const startBtn = $("musicStartBtn");
    const endBtn = $("musicEndBtn");
    const todayLabel = $("musicTodayLabel");
    const totalLabel = $("musicTotalLabel");

    if (!chipsEl || !listEl) return;

    const moods = ["All", "Anxious", "Stressed", "Focus", "Sleep"];
    let active = "All";

    function logObj() {
      return readJSON(MUSIC_LOG_KEY, { totalMin: 0, byDay: {} });
    }

    function saveLog(obj) {
      writeJSON(MUSIC_LOG_KEY, obj);
    }

    function refreshStats() {
      const log = logObj();
      const today = todayKey();
      const todayMin = (log.byDay && log.byDay[today]) ? log.byDay[today] : 0;
      if (todayLabel) todayLabel.textContent = `Today: ${todayMin} min`;
      if (totalLabel) totalLabel.textContent = `Total: ${log.totalMin || 0} min`;
    }

    function renderChips() {
      chipsEl.innerHTML = "";
      moods.forEach(m => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (m === active ? " active" : "");
        b.textContent = m;
        b.addEventListener("click", () => {
          active = m;
          renderChips();
          renderList();
        });
        chipsEl.appendChild(b);
      });
    }

    function renderList() {
      const filtered = active === "All"
        ? MUSIC_ITEMS
        : MUSIC_ITEMS.filter(x => x.mood === active);

      renderLinkBoxes("musicList", filtered.map(x => ({
        title: x.title,
        desc: x.desc,
        url: x.url
      })));
    }

    function startSession() {
      writeJSON(MUSIC_SESSION_KEY, { startedAt: Date.now() });
      if (startBtn) startBtn.disabled = true;
      if (endBtn) endBtn.disabled = false;
    }

    function endSession() {
      const s = readJSON(MUSIC_SESSION_KEY, null);
      localStorage.removeItem(MUSIC_SESSION_KEY);

      if (!s || !s.startedAt) {
        if (startBtn) startBtn.disabled = false;
        if (endBtn) endBtn.disabled = true;
        return;
      }

      const elapsedMin = Math.max(1, Math.round((Date.now() - s.startedAt) / 60000));

      const log = logObj();
      log.totalMin = (log.totalMin || 0) + elapsedMin;
      log.byDay = log.byDay || {};
      log.byDay[todayKey()] = (log.byDay[todayKey()] || 0) + elapsedMin;
      saveLog(log);

      if (startBtn) startBtn.disabled = false;
      if (endBtn) endBtn.disabled = true;

      refreshStats();
    }

    // init buttons
    const existingSession = readJSON(MUSIC_SESSION_KEY, null);
    if (startBtn) startBtn.addEventListener("click", (e) => { e.preventDefault(); startSession(); });
    if (endBtn) endBtn.addEventListener("click", (e) => { e.preventDefault(); endSession(); });

    if (existingSession && existingSession.startedAt) {
      if (startBtn) startBtn.disabled = true;
      if (endBtn) endBtn.disabled = false;
    } else {
      if (startBtn) startBtn.disabled = false;
      if (endBtn) endBtn.disabled = true;
    }

    renderChips();
    renderList();
    refreshStats();
  }

  /* =========================
     INIT ALL
  ========================= */
  function initAll() {
    applyTheme();
    initTheme();
    initBreathe();
    initResources();
    initHelp();
    initQuotes();
    initYoga();
    initMusic();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
