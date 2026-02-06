/* =========================================================
   Enigma Wellbeing • app.js
   - Theme toggle (🌙/☀️)
   - Back navigation
   - Breathe: Timer + Stopwatch (inhale retracts, exhale expands)
   - Yoga: mood chips + video buttons
   - Music: mood chips + track buttons
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
    return new Date().toISOString().split("T")[0];
  }

  /* =========================
     THEME
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
    const DEFAULT_MODE = localStorage.getItem(MODE_KEY) || "timer";

    let mode = DEFAULT_MODE;
    let running = false;
    let tickTimer = null;
    let phaseTimer = null;

    let phase = "ready";
    let remainingSec = 60;
    let elapsedSec = 0;

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
      if (mode === "timer") tipEl.textContent = `Time left: ${fmt(remainingSec)}`;
      else tipEl.textContent = `Stopwatch: ${fmt(elapsedSec)}`;
    }

    function setCirclePhase(p) {
      circle.classList.remove("inhale", "exhale");

      // You want: inhale retracts, exhale expands.
      // Your CSS expands on .inhale and shrinks on .exhale,
      // so we intentionally swap which class we apply.
      if (p === "inhale") {
        phaseEl.textContent = "Breathe in";
        circle.classList.add("exhale"); // shrink/retract
        circle.style.transitionDuration = `${INHALE_MS / 1000}s`;
      } else {
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
      function nextPhase() {
        if (!running) return;

        if (phase === "ready" || phase === "exhale") {
          phase = "inhale";
          setCirclePhase("inhale");
          phaseTimer = setTimeout(nextPhase, INHALE_MS);
          return;
        }

        phase = "exhale";
        setCirclePhase("exhale");
        phaseTimer = setTimeout(nextPhase, EXHALE_MS);
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

    startBtn.addEventListener("click", (e) => { e.preventDefault(); startSession(); });
    stopBtn.addEventListener("click", (e) => { e.preventDefault(); stopSession("Stopped."); });

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

    setMode(mode);
    stopSession("Tap Start to begin.");
  }

  /* =========================
     YOGA (Fix: chips + separate tile buttons)
  ========================= */
  function initYoga() {
    const page = $("yogaPage");
    if (!page) return;

    const chipsEl = $("yogaMoodChips");
    const listEl = $("yogaList");
    if (!chipsEl || !listEl) return;

    const VIDEOS = [
      { mood: "Anxiety", title: "10 min Yoga for Anxiety", url: "https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
      { mood: "Stress", title: "15 min Gentle Yoga for Stress", url: "https://www.youtube.com/results?search_query=15+minute+gentle+yoga+for+stress" },
      { mood: "Sleep", title: "Yoga for Sleep (wind down)", url: "https://www.youtube.com/results?search_query=yoga+for+sleep+wind+down" },
      { mood: "Morning", title: "Morning Yoga (wake up)", url: "https://www.youtube.com/results?search_query=morning+yoga+wake+up" },
      { mood: "Stiff body", title: "Yoga for stiff back/hips", url: "https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" },
      { mood: "All", title: "Gentle yoga (all levels)", url: "https://www.youtube.com/results?search_query=gentle+yoga+all+levels" },
    ];

    const MOODS = ["All", "Anxiety", "Stress", "Sleep", "Morning", "Stiff body"];
    let active = "All";

    function renderChips() {
      chipsEl.innerHTML = "";
      MOODS.forEach((m) => {
        const b = document.createElement("button");
        b.className = "chip" + (m === active ? " active" : "");
        b.type = "button";
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
      listEl.innerHTML = "";
      const items = active === "All" ? VIDEOS : VIDEOS.filter(v => v.mood === active);

      items.forEach((v) => {
        const a = document.createElement("a");
        a.className = "music-btn";
        a.href = v.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.innerHTML = `<span>${v.title}</span><span>▶</span>`;
        listEl.appendChild(a);
      });

      if (!items.length) {
        const div = document.createElement("div");
        div.className = "gentle-text";
        div.textContent = "No videos for that mood yet.";
        listEl.appendChild(div);
      }
    }

    renderChips();
    renderList();
  }

  /* =========================
     MUSIC (Restore: chips + separate tile buttons)
  ========================= */
  function initMusic() {
    const page = $("soundsPage");
    if (!page) return;

    const chipsEl = $("moodChips");
    const listEl = $("musicList");
    if (!chipsEl || !listEl) return;

    const TRACKS = [
      { mood: "Anxious", title: "Calm breathing music", url: "https://www.youtube.com/results?search_query=calm+breathing+music" },
      { mood: "Focus", title: "Lo-fi focus mix", url: "https://www.youtube.com/results?search_query=lofi+focus+mix" },
      { mood: "Sleep", title: "Sleep music", url: "https://www.youtube.com/results?search_query=sleep+music" },
      { mood: "Stressed", title: "Relaxing piano", url: "https://www.youtube.com/results?search_query=relaxing+piano" },
      { mood: "All", title: "Ocean waves", url: "https://www.youtube.com/results?search_query=ocean+waves+relaxing" },
    ];

    const MOODS = ["All", "Anxious", "Stressed", "Focus", "Sleep"];
    let active = "All";

    function renderChips() {
      chipsEl.innerHTML = "";
      MOODS.forEach((m) => {
        const b = document.createElement("button");
        b.className = "chip" + (m === active ? " active" : "");
        b.type = "button";
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
      listEl.innerHTML = "";
      const items = active === "All" ? TRACKS : TRACKS.filter(t => t.mood === active || t.mood === "All");

      items.forEach((t) => {
        const a = document.createElement("a");
        a.className = "music-btn";
        a.href = t.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.innerHTML = `<span>${t.title}</span><span>▶</span>`;
        listEl.appendChild(a);
      });
    }

    renderChips();
    renderList();
  }

  /* =========================
     BOOT (safe)
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    try { applyTheme(); } catch (e) {}
    try { initTheme(); } catch (e) {}
    try { initBreathe(); } catch (e) {}
    try { initYoga(); } catch (e) {}
    try { initMusic(); } catch (e) {}
  });

})();
