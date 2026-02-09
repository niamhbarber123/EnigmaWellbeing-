/* ======================================================
   Enigma Wellbeing – app.js (STABLE BASE)
   Works across ALL pages
====================================================== */

(function () {
  "use strict";

  /* =====================
     Helpers
  ===================== */
  const $ = (id) => document.getElementById(id);

  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /* =====================
     Navigation
  ===================== */
  window.enigmaBack = function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  /* =====================
     Theme Toggle
  ===================== */
  function applyTheme() {
    const theme = localStorage.getItem("enigmaTheme") || "light";
    document.body.classList.toggle("night", theme === "night");
  }

  function toggleTheme() {
    const isNight = document.body.classList.toggle("night");
    localStorage.setItem("enigmaTheme", isNight ? "night" : "light");
  }

  function initTheme() {
    const btn = $("themeFab");
    if (!btn) return;
    btn.addEventListener("click", toggleTheme);
  }

  /* =====================
     WORD OF THE DAY
  ===================== */
  const WORDS = [
    { w: "Calm", d: "A quiet steadiness within yourself." },
    { w: "Balance", d: "Making space for rest and effort." },
    { w: "Compassion", d: "Meeting yourself with kindness." },
    { w: "Clarity", d: "Seeing what matters most." },
    { w: "Patience", d: "Allowing things to unfold in time." },
    { w: "Courage", d: "Moving forward even when afraid." },
    { w: "Acceptance", d: "Letting things be as they are." },
    { w: "Gentleness", d: "Soft strength, not weakness." },
    { w: "Hope", d: "Believing change is possible." },
    { w: "Trust", d: "Confidence in yourself and the process." }
  ];

  function pickWord() {
    const index = new Date().getDate() % WORDS.length;
    return WORDS[index];
  }

  function initWOTD() {
    const smallWord = $("wotdWord");
    const smallDesc = $("wotdDesc");
    const bigWord = $("wotdWordBig");
    const bigDesc = $("wotdDescBig");

    if (!smallWord && !bigWord) return;

    const { w, d } = pickWord();

    if (smallWord) smallWord.textContent = w;
    if (smallDesc) smallDesc.textContent = d;
    if (bigWord) bigWord.textContent = w;
    if (bigDesc) bigDesc.textContent = d;
  }

  /* =====================
     BREATHE (Simple + Stable)
  ===================== */
  function initBreathe() {
    const circle = $("breatheCircle");
    const phase = $("breathPhase");
    const startBtn = $("breathStartBtn");
    const stopBtn = $("breathStopBtn");

    if (!circle || !startBtn || !stopBtn || !phase) return;

    let running = false;
    let inhale = true;
    let timer;

    function step() {
      if (!running) return;
      inhale = !inhale;
      phase.textContent = inhale ? "Breathe in" : "Breathe out";
      circle.style.transform = inhale ? "scale(0.75)" : "scale(1.15)";
      timer = setTimeout(step, 4000);
    }

    startBtn.onclick = () => {
      if (running) return;
      running = true;
      inhale = false;
      step();
    };

    stopBtn.onclick = () => {
      running = false;
      clearTimeout(timer);
      phase.textContent = "Ready";
      circle.style.transform = "scale(1)";
    };
  }

  /* =====================
     QUOTES
  ===================== */
  const QUOTES = [
    "You are doing better than you think.",
    "One step at a time is still progress.",
    "This feeling will pass.",
    "Rest is productive.",
    "You are allowed to go slowly."
  ];

  function initQuotes() {
    const grid = $("quoteGrid");
    if (!grid) return;

    grid.innerHTML = "";
    QUOTES.forEach((q) => {
      const div = document.createElement("div");
      div.className = "card";
      div.textContent = q;
      grid.appendChild(div);
    });
  }

  /* =====================
     MUSIC (Minutes Only)
  ===================== */
  function initMusic() {
    const todayEl = $("musicTodayMin");
    const totalEl = $("musicTotalMin");
    const startBtn = $("musicStartBtn");
    const endBtn = $("musicEndBtn");

    if (!todayEl || !totalEl || !startBtn || !endBtn) return;

    const KEY = "enigmaMusic";
    let data = readJSON(KEY, { today: todayKey(), todayMin: 0, totalMin: 0, start: null });

    function syncDay() {
      if (data.today !== todayKey()) {
        data.today = todayKey();
        data.todayMin = 0;
        data.start = null;
      }
    }

    function render() {
      todayEl.textContent = data.todayMin;
      totalEl.textContent = data.totalMin;
    }

    startBtn.onclick = () => {
      syncDay();
      if (!data.start) {
        data.start = Date.now();
        writeJSON(KEY, data);
      }
    };

    endBtn.onclick = () => {
      if (!data.start) return;
      const mins = Math.max(1, Math.round((Date.now() - data.start) / 60000));
      data.start = null;
      data.todayMin += mins;
      data.totalMin += mins;
      writeJSON(KEY, data);
      render();
    };

    render();
  }

  /* =====================
     PROGRESS
  ===================== */
  function initProgress() {
    const breatheToday = $("pBreathedToday");
    const musicToday = $("pMusicToday");
    const musicTotal = $("pMusicTotal");

    if (!musicToday && !musicTotal) return;

    const music = readJSON("enigmaMusic", { todayMin: 0, totalMin: 0 });

    if (musicToday) musicToday.textContent = music.todayMin || 0;
    if (musicTotal) musicTotal.textContent = music.totalMin || 0;
    if (breatheToday) breatheToday.textContent = "Yes";
  }

  /* =====================
     INIT
  ===================== */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    initTheme();
    initWOTD();
    initBreathe();
    initQuotes();
    initMusic();
    initProgress();
  });

})();
