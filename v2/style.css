(() => {
  const THEME_KEY = "enigma_theme_v1";
  const STATS_KEY = "enigma_stats_v1";

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function loadStats() {
    try {
      return JSON.parse(localStorage.getItem(STATS_KEY)) || { opens: {}, events: {} };
    } catch {
      return { opens: {}, events: {} };
    }
  }

  function saveStats(s) {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  }

  // Track helper (device-only)
  window.enigmaTrack = function (eventName) {
    const s = loadStats();
    const tk = todayKey();
    if (!s.events[tk]) s.events[tk] = {};
    s.events[tk][eventName] = (s.events[tk][eventName] || 0) + 1;
    saveStats(s);
  };

  function applyTheme(mode) {
    const night = mode === "night";
    document.body.classList.toggle("night", night);
    const fab = document.getElementById("themeFab");
    if (fab) fab.textContent = night ? "☀️" : "🌙";
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "night" || saved === "day") return saved;
    const prefersNight = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersNight ? "night" : "day";
  }

  function toggleTheme() {
    const isNight = document.body.classList.contains("night");
    const next = isNight ? "day" : "night";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(loadTheme());

    const fab = document.getElementById("themeFab");
    if (fab) fab.addEventListener("click", toggleTheme);

    // Track daily opens
    const s = loadStats();
    const tk = todayKey();
    s.opens[tk] = (s.opens[tk] || 0) + 1;
    saveStats(s);
  });
})();
