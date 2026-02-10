(() => {
  const THEME_KEY = "enigma_theme_v1";

  function applyTheme(isNight) {
    document.body.classList.toggle("night", isNight);
    const btn = document.getElementById("themeFab");
    if (btn) btn.textContent = isNight ? "☀️" : "🌙";
  }

  function readTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === "night";
    } catch {
      return false;
    }
  }

  function writeTheme(isNight) {
    try {
      localStorage.setItem(THEME_KEY, isNight ? "night" : "day");
    } catch {}
  }

  // Apply on load
  applyTheme(readTheme());

  // Toggle button
  const fab = document.getElementById("themeFab");
  if (fab) {
    fab.addEventListener("click", () => {
      const next = !document.body.classList.contains("night");
      applyTheme(next);
      writeTheme(next);
    });
  }
})();
