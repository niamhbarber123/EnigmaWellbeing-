// app.js (FULL) — Enigma Wellbeing
(() => {
  const THEME_KEY = "enigma_theme_v1"; // "night" | "day"

  function applyTheme(mode) {
    const night = mode === "night";
    document.body.classList.toggle("night", night);

    const fab = document.getElementById("themeFab");
    if (fab) fab.textContent = night ? "☀️" : "🌙";
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "night" || saved === "day") return saved;

    // default to system preference if nothing saved
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
  });
})();
