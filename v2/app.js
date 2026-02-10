(() => {
  const THEME_KEY = "enigma_theme_v2";

  function applyTheme(isNight) {
    document.body.classList.toggle("night", isNight);
    try { localStorage.setItem(THEME_KEY, isNight ? "night" : "day"); } catch {}
    const fab = document.getElementById("themeFab");
    if (fab) fab.textContent = isNight ? "☀️" : "🌙";
  }

  function getSavedTheme() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return v === "night";
    } catch {
      return false;
    }
  }

  function initTheme() {
    applyTheme(getSavedTheme());

    const fab = document.getElementById("themeFab");
    if (fab) {
      fab.addEventListener("click", () => {
        const isNight = !document.body.classList.contains("night");
        applyTheme(isNight);
      });
    }
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
})();
