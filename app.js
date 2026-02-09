/* =========================================================
   Enigma Wellbeing • app.js (STABLE)
   - Theme toggle (all pages)
   - Back always Home
   - Breathe buttons always work + animation works
   - Resources (NHS only) boxed links
   - Help boxed links + grounding/tiny plan
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
     STORAGE HELPERS
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
     BREATHE (buttons always work)
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

      // inhale (retract)
      setVisual("inhale");
      setText("Breathe in", "Breathe in slowly…");
      vibrate(10);

      t1 = setTimeout(() => {
        if (!running) return;

        setText("Hold", "Hold gently…");
        vibrate(6);

        t2 = setTimeout(() => {
          if (!running) return;

          // exhale (expand)
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

    // listeners
    startBtn.addEventListener("click", (e) => { e.preventDefault(); startSession(); });
    stopBtn.addEventListener("click", (e) => { e.preventDefault(); stopSession(); });
    completeBtn.addEventListener("click", (e) => { e.preventDefault(); completeSession(); });
    if (modeSelect) modeSelect.addEventListener("change", updateModeUI);

    // init
    stopSession();
    updateModeUI();
  }

  /* =========================
     RESOURCES (NHS ONLY) boxed links
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

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  function initResources() {
    const page = $("resourcesPage");
    if (!page) return;

    // You can keep your existing HTML, just ensure there’s:
    // <div id="resourcesList"></div>
    renderLinkBoxes("resourcesList", NHS_RESOURCES);
  }

  /* =========================
     HELP page boxed links
  ========================= */
  const NHS_HELP_LINKS = [
    { title: "NHS urgent mental health help", desc: "What to do if you need urgent support right now.", url: "https://www.nhs.uk/mental-health/get-urgent-help-for-mental-health/" },
    { title: "If you feel you might act", desc: "Advice on staying safe and getting urgent help.", url: "https://www.nhs.uk/mental-health/get-urgent-help-for-mental-health/" },
    { title: "NHS Talking Therapies", desc: "Self-refer for anxiety/depression support.", url: "https://www.nhs.uk/service-search/mental-health/find-an-nhs-talking-therapies-service/" }
  ];

  function initHelp() {
    const page = $("helpPage");
    if (!page) return;

    // if you add <div id="helpLinks"></div> in help.html
    renderLinkBoxes("helpLinks", NHS_HELP_LINKS);
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
