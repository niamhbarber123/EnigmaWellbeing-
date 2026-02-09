/* =========================================================
   Enigma Wellbeing • app.js (FINAL STABLE)
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
     DATE + STORAGE
  ========================= */
  const todayKey = () => new Date().toISOString().split("T")[0];

  const readJSON = (k, f) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? f; }
    catch { return f; }
  };

  const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  /* =========================
     THEME
  ========================= */
  function applyTheme() {
    const night = localStorage.getItem("enigmaTheme") === "night";
    document.body.classList.toggle("night", night);
    const btn = $("themeFab");
    if (btn) btn.textContent = night ? "☀️" : "🌙";
  }

  function initTheme() {
    const btn = $("themeFab");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const night = document.body.classList.toggle("night");
      localStorage.setItem("enigmaTheme", night ? "night" : "light");
      btn.textContent = night ? "☀️" : "🌙";
    });
  }

  /* =========================
     WORD OF THE DAY
  ========================= */
  const WOTD = [
    ["Acceptance","Letting reality be what it is."],
    ["Compassion","Meeting struggle with kindness."],
    ["Courage","Choosing what matters despite fear."],
    ["Balance","Making room for rest and effort."],
    ["Patience","Letting growth take its time."],
    ["Trust","Allowing yourself to be supported."],
    ["Gentleness","Soft strength with yourself."]
  ];

  function initWOTD() {
    const w = $("wotdWord");
    const d = $("wotdDesc");
    if (!w || !d) return;
    const i = new Date().getDate() % WOTD.length;
    w.textContent = WOTD[i][0];
    d.textContent = WOTD[i][1];
  }

  /* =========================
     DISTRACTION
  ========================= */
  const QUESTIONS = [
    "Name 5 things you can see.",
    "Name 4 things you can feel.",
    "Name 3 things you can hear.",
    "Name 2 things you can smell.",
    "Name 1 thing you can taste."
  ];

  function initDistraction() {
    const q = $("distractionQuestion");
    const start = $("distractionStartBtn");
    if (!q || !start) return;

    start.addEventListener("click", () => {
      q.textContent = QUESTIONS[Math.floor(Math.random()*QUESTIONS.length)];
    });
  }

  /* =========================
     BREATHE (FIXED)
  ========================= */
  function initBreathe() {
    const circle = $("breatheCircle");
    const start = $("breathStartBtn");
    const stop = $("breathStopBtn");
    const phase = $("breathPhase");
    if (!circle || !start || !stop || !phase) return;

    let running = false;
    let timer = null;

    function inhale() {
      phase.textContent = "Breathe in";
      circle.classList.remove("breath-exhale");
      circle.classList.add("breath-inhale");
    }

    function exhale() {
      phase.textContent = "Breathe out";
      circle.classList.remove("breath-inhale");
      circle.classList.add("breath-exhale");
    }

    function loop() {
      if (!running) return;
      inhale();
      timer = setTimeout(() => {
        if (!running) return;
        exhale();
        timer = setTimeout(loop, 6000);
      }, 5000);
    }

    start.addEventListener("click", () => {
      if (running) return;
      running = true;
      loop();
    });

    stop.addEventListener("click", () => {
      running = false;
      clearTimeout(timer);
      phase.textContent = "Ready";
      circle.classList.remove("breath-inhale","breath-exhale");
    });
  }

  /* =========================
     QUOTES
  ========================= */
  const QUOTES = [
    ["You are allowed to rest.","Unknown"],
    ["Progress, not perfection.","Unknown"],
    ["Be kind to yourself.","Unknown"]
  ];

  function initQuotes() {
    const grid = $("quoteGrid");
    if (!grid) return;
    grid.innerHTML = "";
    QUOTES.forEach(q => {
      const d = document.createElement("div");
      d.className = "quote-tile";
      d.innerHTML = `<div class="quote-text">"${q[0]}"</div><div class="quote-author">— ${q[1]}</div>`;
      grid.appendChild(d);
    });
  }

  /* =========================
     MUSIC
  ========================= */
  const MUSIC = [
    ["Calm","https://www.youtube.com/results?search_query=calming+music"],
    ["Sleep","https://www.youtube.com/results?search_query=sleep+music"],
    ["Focus","https://www.youtube.com/results?search_query=focus+music"]
  ];

  function initMusic() {
    const row = $("musicMoodRow");
    const list = $("musicList");
    if (!row || !list) return;

    MUSIC.forEach(([m,u]) => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = m;
      b.onclick = () => {
        list.innerHTML = `<a class="music-btn" href="${u}" target="_blank">${m} ▶</a>`;
      };
      row.appendChild(b);
    });
  }

  /* =========================
     YOGA
  ========================= */
  const YOGA = [
    ["Relax","https://www.youtube.com/results?search_query=gentle+yoga"],
    ["Stress","https://www.youtube.com/results?search_query=yoga+for+stress"],
    ["Sleep","https://www.youtube.com/results?search_query=yoga+for+sleep"]
  ];

  function initYoga() {
    const row = $("yogaChips");
    const list = $("yogaList");
    if (!row || !list) return;

    YOGA.forEach(([m,u]) => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = m;
      b.onclick = () => {
        list.innerHTML = `<a class="music-btn" href="${u}" target="_blank">${m} ▶</a>`;
      };
      row.appendChild(b);
    });
  }

  /* =========================
     RESOURCES (NHS ONLY)
  ========================= */
  const NHS = [
    ["NHS Mental Health","https://www.nhs.uk/mental-health/"],
    ["NHS Anxiety","https://www.nhs.uk/mental-health/conditions/anxiety/"],
    ["NHS Depression","https://www.nhs.uk/mental-health/conditions/depression/"],
    ["NHS BPD","https://www.nhs.uk/mental-health/conditions/borderline-personality-disorder/"]
  ];

  function initResources() {
    const list = $("resourcesList");
    if (!list) return;
    list.innerHTML = "";
    NHS.forEach(([t,u]) => {
      const d = document.createElement("div");
      d.className = "resource-item";
      d.innerHTML = `<a href="${u}" target="_blank">${t} →</a>`;
      list.appendChild(d);
    });
  }

  /* =========================
     PROGRESS
  ========================= */
  function initProgress() {
    const b = $("progressBreatheMin");
    if (b) b.textContent = readJSON("enigmaBreatheLog",{totalMin:0}).totalMin;
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    initTheme();
    initWOTD();
    initDistraction();
    initBreathe();
    initQuotes();
    initMusic();
    initYoga();
    initResources();
    initProgress();
  });

})();
