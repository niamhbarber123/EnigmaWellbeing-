(() => {
  const btn = document.getElementById("themeFab");
  const KEY = "enigma_theme_v2";

  function applyTheme(theme) {
    document.body.classList.toggle("night", theme === "night");
    if (btn) btn.textContent = (theme === "night") ? "☀️" : "🌙";
  }

  function loadTheme() {
    try { return localStorage.getItem(KEY) || "day"; }
    catch { return "day"; }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(KEY, theme); } catch {}
  }

  // init
  const current = loadTheme();
  applyTheme(current);

  if (btn) {
    btn.addEventListener("click", () => {
      const next = document.body.classList.contains("night") ? "day" : "night";
      saveTheme(next);
      applyTheme(next);
    });
  }
})();
