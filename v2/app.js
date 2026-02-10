/* =========================
   Enigma Wellbeing v2 — app.js
   Theme + tiny helpers
   ========================= */

(() => {
  const THEME_KEY = "enigma_theme_v2"; // "night" | "day"

  function applyTheme(mode) {
    const isNight = mode === "night";
    document.body.classList.toggle("night", isNight);

    const fab = document.getElementById("themeFab");
    if (fab) fab.textContent = isNight ? "☀️" : "🌙";
  }

  function loadTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "night" || saved === "day") return saved;
    } catch {}
    // default = day
    return "day";
  }

  function saveTheme(mode) {
    try { localStorage.setItem(THEME_KEY, mode); } catch {}
  }

  function toggleTheme() {
    const nowNight = !document.body.classList.contains("night");
    const next = nowNight ? "night" : "day";
    applyTheme(next);
    saveTheme(next);
  }

  // Init when DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(loadTheme());

    const fab = document.getElementById("themeFab");
    if (fab) fab.addEventListener("click", toggleTheme);

    // Optional: if you ever use a back button as <button data-back>
    const back = document.querySelector("[data-back]");
    if (back) {
      back.addEventListener("click", () => {
        if (history.length > 1) history.back();
        else location.href = "index.html";
      });
    }
  });
})();
