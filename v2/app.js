(() => {
  const KEY = "enigma_theme_v2"; // "night" | "day"

  function applyTheme(isNight) {
    document.body.classList.toggle("night", isNight);

    // Optional: swap icon to show current state
    const btn = document.getElementById("themeFab");
    if (btn) btn.textContent = isNight ? "☀️" : "🌙";
  }

  function loadTheme() {
    try {
      return localStorage.getItem(KEY) === "night";
    } catch {
      return false;
    }
  }

  function saveTheme(isNight) {
    try {
      localStorage.setItem(KEY, isNight ? "night" : "day");
    } catch {}
  }

  function init() {
    // Apply saved theme first
    applyTheme(loadTheme());

    // Wire up button (if it exists on this page)
    const btn = document.getElementById("themeFab");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isNight = !document.body.classList.contains("night");
      applyTheme(isNight);
      saveTheme(isNight);
    });
  }

  // Ensure DOM is ready (works with/without defer)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
