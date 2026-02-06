/* =========================================================
   ENIGMA WELLBEING — FULL APP.JS
   Stable, readable, calm-focused build
========================================================= */

(function () {
  "use strict";

  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);

  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  function addMinutes(key, seconds) {
    const mins = Math.ceil(seconds / 60);
    const today = todayKey();
    const data = JSON.parse(localStorage.getItem(key) || "{}");
    data[today] = (data[today] || 0) + mins;
    localStorage.setItem(key, JSON.stringify(data));
  }

  function calculateStreak(key) {
    const data = JSON.parse(localStorage.getItem(key) || "{}");
    const days = Object.keys(data).sort();
    if (!days.length) return 0;

    let streak = 1;
    for (let i = days.length - 1; i > 0; i--) {
      const d1 = new Date(days[i]);
      const d2 = new Date(days[i - 1]);
      if (d1 - d2 === 86400000) streak++;
      else break;
    }
    return streak;
  }

  /* -------------------------------------------------------
     BACK BUTTON
  ------------------------------------------------------- */
  window.enigmaBack = function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  /* -------------------------------------------------------
     THEME (FIXED + ACCESSIBLE)
  ------------------------------------------------------- */
  function applyTheme() {
    const mode = localStorage.getItem("enigmaTheme") || "light";
    document.body.classList.toggle("night", mode === "night");
    const icon = $("themeFab");
    if (icon) icon.textContent = mode === "night" ? "☀️" : "🌙";
  }

  function toggleTheme() {
    const night = !document.body.classList.contains("night");
    localStorage.setItem("enigmaTheme", night ? "night" : "light");
    applyTheme();
  }

  function initTheme() {
    const btn = $("themeFab");
    if (btn) btn.addEventListener("click", toggleTheme);
    applyTheme();
  }

  /* -------------------------------------------------------
     WORD OF THE DAY (FIXED)
  ------------------------------------------------------- */
  const WOTD = [
    { w: "Calm", d: "A steady state that can be returned to." },
    { w: "Gentleness", d: "Soft strength, especially with yourself." },
    { w: "Patience", d: "Letting things unfold in their own time." },
    { w: "Presence", d: "Being here, not elsewhere." },
    { w: "Safety", d: "Your body feeling allowed to rest." },
    { w: "Enough", d: "You don’t need to do more to be worthy." },
    { w: "Release", d: "Letting go of what you’re holding." }
  ];

  function pickWotd() {
    const seed = parseInt(todayKey().replace(/-/g, ""), 10);
    return WOTD[seed % WOTD.length];
  }

  function initWotd() {
    const wordEl = $("wotdWord");
    const descEl = $("wotdDesc");
    if (!wordEl || !descEl) return;

    const { w, d } = pickWotd();
    wordEl.textContent = w;
    descEl.textContent = d;
  }

  /* -------------------------------------------------------
     BREATHE (TIMER + STOPWATCH + VIBRATION)
  ------------------------------------------------------- */
  function initBreathe() {
    const circle = $("breatheCircle");
    const phase = $("breathPhase");
    const tip = $("breathTip");
    const startBtn = $("breathStartBtn");
    const stopBtn = $("breathStopBtn");
    if (!circle || !startBtn || !stopBtn) return;

    let running = false;
    let inhale = true;
    let elapsed = 0;
    let timer = null;
    let counter = null;

    const affirmations = [
      "You showed up for yourself 💜",
      "Your body thanks you.",
      "Calm is something you practiced.",
      "Even one minute matters.",
      "You’re allowed to slow down."
    ];

    function vibrate(pattern) {
      if (navigator.vibrate) navigator.vibrate(pattern);
    }

    function start() {
      if (running) return;
      running = true;
      phase.textContent = "Inhale";
      tip.textContent = "Breathe in…";

      counter = setInterval(() => elapsed++, 1000);

      timer = setInterval(() => {
        inhale = !inhale;
        if (inhale) {
          phase.textContent = "Inhale";
          tip.textContent = "Breathe in…";
          circle.style.transform = "scale(0.7)";
          vibrate(25);
        } else {
          phase.textContent = "Exhale";
          tip.textContent = "Breathe out…";
          circle.style.transform = "scale(1)";
          vibrate([15, 30, 15]);
        }
      }, 4500);
    }

    function stop() {
      if (!running) return;
      running = false;
      clearInterval(timer);
      clearInterval(counter);

      addMinutes("enigmaBreathing", elapsed);
      elapsed = 0;

      phase.textContent = "Completed";
      tip.textContent =
        affirmations[Math.floor(Math.random() * affirmations.length)];
      circle.style.transform = "scale(0.85)";
    }

    startBtn.addEventListener("click", start);
    stopBtn.addEventListener("click", stop);
  }

  /* -------------------------------------------------------
     QUOTES (MORE + READABLE)
  ------------------------------------------------------- */
  const QUOTES = [
    { q: "Start where you are. Use what you have.", a: "Arthur Ashe" },
    { q: "You are allowed to move slowly.", a: "Unknown" },
    { q: "Small steps still move you forward.", a: "Unknown" },
    { q: "Rest is productive.", a: "Unknown" },
    { q: "This feeling will pass.", a: "Unknown" },
    { q: "One calm breath at a time.", a: "Unknown" },
    { q: "You are not behind.", a: "Unknown" }
  ];

  function initQuotes() {
    const grid = $("quoteGrid");
    if (!grid) return;

    grid.innerHTML = "";
    QUOTES.forEach((q) => {
      const tile = document.createElement("div");
      tile.className = "quote-tile";
      tile.innerHTML = `
        <div class="quote-text">"${q.q}"</div>
        <small>— ${q.a}</small>
        <button class="quote-save-btn">💜 Save</button>
      `;
      grid.appendChild(tile);
    });
  }

  /* -------------------------------------------------------
     YOGA + MUSIC (MINUTES TRACKED)
  ------------------------------------------------------- */
  let yogaStart = null;
  let musicStart = null;

  window.startYoga = () => (yogaStart = Date.now());
  window.endYoga = () => {
    if (!yogaStart) return;
    addMinutes("enigmaYoga", (Date.now() - yogaStart) / 1000);
    yogaStart = null;
  };

  window.startMusic = () => (musicStart = Date.now());
  window.endMusic = () => {
    if (!musicStart) return;
    addMinutes("enigmaMusic", (Date.now() - musicStart) / 1000);
    musicStart = null;
  };

  /* -------------------------------------------------------
     PROGRESS
  ------------------------------------------------------- */
  function initProgress() {
    const today = todayKey();

    function load(key, el) {
      const data = JSON.parse(localStorage.getItem(key) || "{}");
      if (el) el.textContent = data[today] || 0;
    }

    load("enigmaBreathing", $("breatheToday"));
    load("enigmaYoga", $("yogaToday"));
    load("enigmaMusic", $("musicToday"));

    const streak = Math.max(
      calculateStreak("enigmaBreathing"),
      calculateStreak("enigmaYoga"),
      calculateStreak("enigmaMusic")
    );

    if ($("calmStreak")) $("calmStreak").textContent = streak;
  }

  /* -------------------------------------------------------
     BOOT
  ------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initWotd();
    initBreathe();
    initQuotes();
    initProgress();
  });
})();
