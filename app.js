/* =========================================================
   Enigma Wellbeing • app.js
   - Theme toggle (🌙/☀️)
   - Back navigation
   - Breathe: Timer + Stopwatch (inhale retracts, exhale expands)
   - Safe init (won't crash if a page doesn't have elements)
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

  /* =========================
     THEME
  ========================= */
  function setThemeIcon() {
    const btn = $("themeFab");
    if (!btn) return;
    const isNight = document.body.classList.contains("night");
    btn.textContent = isNight ? "☀️" : "🌙";
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
     BREATHE (Timer + Stopwatch)
     - inhale retracts
     - exhale expands
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

    const modeTimerBtn = $("breathModeTimerBtn");
    const modeStopwatchBtn = $("breathModeStopwatchBtn");
    const timerWrap = $("breathTimerWrap");
    const stopwatchWrap = $("breathStopwatchWrap");
    const durationSelect = $("breathDuration");

    if (!phaseEl || !tipEl || !circle || !startBtn || !stopBtn || !completeBtn) return;

    // Slower rhythm
    const INHALE_MS = 6000;
    const EXHALE_MS = 6000;

    const MODE_KEY = "enigmaBreatheMode";
    const DEFAULT_MODE = localStorage.getItem(MODE_KEY) || "timer"; // "timer" | "stopwatch"

    let mode = DEFAULT_MODE;
    let running = false;
    let tickTimer = null;
    let phaseTimer = null;

    let phase = "ready"; // "ready" | "inhale" | "exhale"
    let remainingSec = 60; // timer mode
    let elapsedSec = 0;    // stopwatch mode

    function setMode(newMode) {
      mode = newMode;
      localStorage.setItem(MODE_KEY, mode);

      const isTimer = mode === "timer";
      if (modeTimerBtn && modeStopwatchBtn) {
        modeTimerBtn.classList.toggle("active", isTimer);
        modeStopwatchBtn.classList.toggle("active", !isTimer);
      }

      if (timerWrap) timerWrap.style.display = isTimer ? "" : "none";
      if (stopwatchWrap) stopwatchWrap.style.display = isTimer ? "none" : "";
      renderTip();
    }

    function fmt(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${String(s).padStart(2, "0")}`;
    }

    function renderTip() {
      if (!running) {
        tipEl.textContent = "Tap Start to begin.";
        return;
      }

      if (mode === "timer") {
        tipEl.textContent = `Time left: ${fmt(remainingSec)}`;
      } else {
        tipEl.textContent = `Stopwatch: ${fmt(elapsedSec)}`;
      }
    }

    function setCirclePhase(p) {
      // Important: INHALE = retract, EXHALE = expand
      circle.classList.remove("inhale", "exhale");

      if (p === "inhale") {
        phaseEl.textContent = "Breathe in";
        // retract on inhale -> use EXHALE class if your CSS expand is inhale
        // but your CSS currently expands on .inhale and shrinks on .exhale,
        // so we swap classes here to achieve the behaviour you want:
        circle.classList.add("exhale"); // shrink/retract
        circle.style.transitionDuration = `${INHALE_MS / 1000}s`;
      }

      if (p === "exhale") {
        phaseEl.textContent = "Breathe out";
        circle.classList.add("inhale"); // expand
        circle.style.transitionDuration = `${EXHALE_MS / 1000}s`;
      }
    }

    function clearTimers() {
      if (tickTimer) clearInterval(tickTimer);
      if (phaseTimer) clearTimeout(phaseTimer);
      tickTimer = null;
      phaseTimer = null;
    }

    function stopSession(message) {
      running = false;
      clearTimers();
      phase = "ready";
      phaseEl.textContent = "Ready";
      circle.classList.remove("inhale", "exhale");
      tipEl.textContent = message || "Stopped.";
    }

    function bumpBreatheCompleted() {
      const key = "enigmaBreatheCompletedByDay";
      let data = {};
      try { data = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
      const k = todayKey();
      data[k] = (data[k] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(data));
    }

    function startRhythmLoop() {
      // inhale then exhale repeatedly
      function nextPhase() {
        if (!running) return;

        if (phase === "ready" || phase === "exhale") {
          phase = "inhale";
          setCirclePhase("inhale");
          phaseTimer = setTimeout(nextPhase, INHALE_MS);
          return;
        }

        if (phase === "inhale") {
          phase = "exhale";
          setCirclePhase("exhale");
          phaseTimer = setTimeout(nextPhase, EXHALE_MS);
          return;
        }
      }

      nextPhase();
    }

    function startSession() {
      if (running) return;

      running = true;
      elapsedSec = 0;

      if (mode === "timer") {
        const chosen = parseInt((durationSelect && durationSelect.value) || "60", 10);
        remainingSec = Number.isFinite(chosen) ? chosen : 60;
      } else {
        remainingSec = 0;
      }

      renderTip();
      startRhythmLoop();

      tickTimer = setInterval(() => {
        if (!running) return;

        if (mode === "timer") {
          remainingSec = Math.max(0, remainingSec - 1);
          renderTip();

          if (remainingSec <= 0) {
            stopSession("Done. Nice work.");
            bumpBreatheCompleted();
          }
        } else {
          elapsedSec += 1;
          renderTip();
        }
      }, 1000);
    }

    // UI events
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startSession();
    });

    stopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      stopSession("Stopped.");
    });

    completeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      bumpBreatheCompleted();
      stopSession("Completed ✅ Saved to progress.");
    });

    if (modeTimerBtn) {
      modeTimerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (running) stopSession("Switched mode.");
        setMode("timer");
      });
    }

    if (modeStopwatchBtn) {
      modeStopwatchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (running) stopSession("Switched mode.");
        setMode("stopwatch");
      });
    }

    // Default mode on load
    setMode(mode);
    stopSession("Tap Start to begin.");
  }

  /* =========================
     BOOT (safe)
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    try { applyTheme(); } catch (e) {}
    try { initTheme(); } catch (e) {}
    try { initBreathe(); } catch (e) {}
  });

})();
