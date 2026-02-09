/* =========================================================
   Enigma Wellbeing • app.js (STABLE)
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* =========================
     NAV
  ========================= */
  window.enigmaHome = () => location.href = "index.html";
  window.enigmaBack = () => location.href = "index.html";

  /* =========================
     STORAGE HELPERS
  ========================= */
  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }
  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function writeJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  /* =========================
     THEME
  ========================= */
  function applyTheme() {
    const night = localStorage.getItem("enigmaTheme") === "night";
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
     BREATHE (FIXED)
  ========================= */
  function initBreathe() {
    if (!$("breathePage")) return;

    const circle = $("breatheCircle");
    const phase = $("breathPhase");
    const tip = $("breathTip");

    const startBtn = $("breathStartBtn");
    const stopBtn = $("breathStopBtn");
    const completeBtn = $("breathCompleteBtn");

    const modeSelect = $("breathModeSelect");
    const durationSelect = $("breathDurationSelect");
    const durationRow = $("breathDurationRow");
    const timerLabel = $("breathTimerLabel");
    const stopwatchLabel = $("breathStopwatchLabel");
    const vibrateToggle = $("breathVibrateToggle");

    let running = false;
    let t1, t2, clock;
    let timerEnd = 0;
    let stopwatchStart = 0;

    const INHALE = 5, HOLD = 1, EXHALE = 6;

    function vibrate(ms) {
      if (vibrateToggle?.checked && navigator.vibrate) navigator.vibrate(ms);
    }

    function clearTimers() {
      clearTimeout(t1); clearTimeout(t2); clearInterval(clock);
    }

    function setVisual(state) {
      circle.classList.remove("breath-inhale", "breath-exhale");
      if (state === "inhale") circle.classList.add("breath-inhale");
      if (state === "exhale") circle.classList.add("breath-exhale");
    }

    function loop() {
      if (!running) return;

      setVisual("inhale");
      phase.textContent = "Breathe in";
      tip.textContent = "Breathe in slowly…";
      vibrate(10);

      t1 = setTimeout(() => {
        if (!running) return;

        phase.textContent = "Hold";
        t2 = setTimeout(() => {
          if (!running) return;

          setVisual("exhale");
          phase.textContent = "Breathe out";
          tip.textContent = "Breathe out gently…";
          vibrate(10);

          t1 = setTimeout(loop, EXHALE * 1000);

        }, HOLD * 1000);

      }, INHALE * 1000);
    }

    function startSession() {
      if (running) return;
      running = true;

      startBtn.disabled = true;
      stopBtn.disabled = false;

      const now = Date.now();
      if (modeSelect?.value === "timer") {
        const mins = parseInt(durationSelect?.value || "1", 10);
        timerEnd = now + mins * 60000;
        timerLabel.textContent = `Time: ${mins}:00`;
      } else {
        stopwatchStart = now;
        stopwatchLabel.textContent = "Stopwatch: 0:00";
      }

      clock = setInterval(() => {
        if (!running) return;
        const now = Date.now();

        if (modeSelect?.value === "timer") {
          const sec = Math.ceil((timerEnd - now) / 1000);
          timerLabel.textContent = `Time: ${Math.max(0, sec)}s`;
          if (sec <= 0) completeSession();
        } else {
          const sec = Math.floor((now - stopwatchStart) / 1000);
          stopwatchLabel.textContent = `Stopwatch: ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2,"0")}`;
        }
      }, 500);

      loop();
    }

    function stopSession() {
      running = false;
      clearTimers();
      setVisual("hold");
      phase.textContent = "Ready";
      tip.textContent = "Tap Start to begin.";
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }

    function completeSession() {
      stopSession();
      phase.textContent = "Completed ✅";
      tip.textContent = "Nice work.";
      vibrate([30, 60, 30]);
    }

    startBtn.addEventListener("click", startSession);
    stopBtn.addEventListener("click", stopSession);
    completeBtn.addEventListener("click", completeSession);

    modeSelect?.addEventListener("change", () => {
      const timer = modeSelect.value === "timer";
      durationRow.style.display = timer ? "" : "none";
      timerLabel.style.display = timer ? "" : "none";
      stopwatchLabel.style.display = timer ? "none" : "";
    });

    stopSession();
  }

  /* =========================
     INIT ALL (THIS WAS MISSING)
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initBreathe();
  });

})();
