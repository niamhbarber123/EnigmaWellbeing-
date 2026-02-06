/* =========================================================
   Enigma Wellbeing • app.js (FULL)
   - Theme toggle (🌙 light / ☀️ night)
   - Back navigation
   - Breathe: timer + time select + pace select + inhale smaller / exhale bigger
   - Word of the Day: daily deterministic + description + modal
   - Distraction: typed answers required for Next; skip allowed; answered count only
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // ---------- Back ----------
  window.enigmaBack = function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  // ---------- Date key ----------
  function todayKey() {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  }

  // ---------- Deterministic RNG ----------
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

  /* =========================
     THEME (🌙 / ☀️)
  ========================= */
  function setThemeIcon() {
    const btn = $("themeFab");
    if (!btn) return;
    const isNight = document.body.classList.contains("night");
    btn.textContent = isNight ? "☀️" : "🌙";
    btn.setAttribute("aria-label", isNight ? "Switch to light mode" : "Switch to night mode");
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
     BREATHE (timer + pace)
  ========================= */
  function formatMMSS(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }

  function initBreathe() {
    const page = $("breathePage");
    if (!page) return;

    const circle = $("breatheCircle");
    const phaseEl = $("breathPhase");
    const tipEl = $("breathTip");
    const startBtn = $("breathStartBtn");
    const stopBtn = $("breathStopBtn");
    const doneBtn = $("breathCompleteBtn");

    const sessionSel = $("breathSessionSelect");
    const paceSel = $("breathPaceSelect");
    const timeLeftEl = $("breathTimeLeft");

    if (!circle || !phaseEl || !tipEl || !startBtn || !stopBtn || !sessionSel || !paceSel || !timeLeftEl) return;

    let running = false;
    let tCycle = null;
    let tTick = null;

    let paceSec = Number(paceSel.value || 5);
    let sessionTotal = Number(sessionSel.value || 60);
    let remaining = sessionTotal;

    function applyPaceCSS() {
      paceSec = Number(paceSel.value || 5);
      document.documentElement.style.setProperty("--breath-sec", `${paceSec}s`);
    }

    function clearTimers() {
      if (tCycle) clearTimeout(tCycle);
      if (tTick) clearInterval(tTick);
      tCycle = null;
      tTick = null;
    }

    function setText(phase, tip) {
      phaseEl.textContent = phase;
      tipEl.textContent = tip;
    }

    function resetUI() {
      clearTimers();
      circle.classList.remove("inhale", "exhale");
      sessionTotal = Number(sessionSel.value || 60);
      remaining = sessionTotal;
      timeLeftEl.textContent = formatMMSS(remaining);
      setText("Ready", "Tap Start to begin.");
    }

    function saveBreatheCompletion() {
      const key = "enigmaBreatheCompletes";
      const obj = JSON.parse(localStorage.getItem(key) || "{}");
      const day = todayKey();
      obj[day] = (obj[day] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(obj));
    }

    function stopSession(message) {
      running = false;
      clearTimers();
      circle.classList.remove("inhale", "exhale");
      if (message) {
        setText("Done ✅", message);
      } else {
        resetUI();
      }
    }

    function startCountdown() {
      timeLeftEl.textContent = formatMMSS(remaining);

      tTick = setInterval(() => {
        if (!running) return;
        remaining -= 1;
        timeLeftEl.textContent = formatMMSS(remaining);

        if (remaining <= 0) {
          saveBreatheCompletion();
          stopSession("Nice work. You can start again anytime.");
        }
      }, 1000);
    }

    // ✅ inhale = SMALL, exhale = BIG
    function cycle() {
      if (!running) return;

      // Inhale (retract smaller)
      circle.classList.add("inhale");
      circle.classList.remove("exhale");
      setText("Inhale", "Breathe in slowly…");

      tCycle = setTimeout(() => {
        if (!running) return;

        // Exhale (expand bigger)
        circle.classList.add("exhale");
        circle.classList.remove("inhale");
        setText("Exhale", "Breathe out gently…");

        tCycle = setTimeout(() => {
          if (!running) return;
          cycle();
        }, paceSec * 1000);

      }, paceSec * 1000);
    }

    // Update preview when not running
    sessionSel.addEventListener("change", () => {
      if (running) return;
      resetUI();
    });

    paceSel.addEventListener("change", () => {
      applyPaceCSS();
      if (!running) resetUI();
    });

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (running) return;

      applyPaceCSS();
      sessionTotal = Number(sessionSel.value || 60);
      remaining = sessionTotal;

      running = true;
      clearTimers();
      startCountdown();
      cycle();
    });

    stopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      stopSession();
    });

    if (doneBtn) {
      doneBtn.addEventListener("click", (e) => {
        e.preventDefault();
        saveBreatheCompletion();
        doneBtn.textContent = "Saved ✅";
        setTimeout(() => (doneBtn.textContent = "Completed ✅"), 1200);
      });
    }

    applyPaceCSS();
    resetUI();
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
    { w: "Compassion", d: "Meeting struggle with warmth instead of judgement." },
    { w: "Integrity", d: "Aligning actions with values—even in small moments." },
    { w: "Courage", d: "Feeling fear and still choosing what matters." },
    { w: "Gentleness", d: "Soft strength—especially with yourself." },
    { w: "Clarity", d: "Seeing what matters most, without the noise." },
    { w: "Balance", d: "Making space for rest, effort, joy, and recovery." },
    { w: "Joy", d: "Noticing what feels bright—even briefly." },
    { w: "Simplicity", d: "Reducing the load—one less thing at a time." }
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
    "What’s one kind thing you’d say to a friend feeling this way?"
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

    function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); }
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
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    try { applyTheme(); } catch(e) {}
    try { initTheme(); } catch(e) {}
    try { initBreathe(); } catch(e) {}
    try { initWotd(); } catch(e) {}
    try { initDistraction(); } catch(e) {}
  });

})();
