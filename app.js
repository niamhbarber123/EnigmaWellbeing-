(function () {
  const THEME_KEY = "enigma_theme"; // "night" or "day"

  function ensureThemeButton() {
    let btn = document.getElementById("themeFab");
    if (!btn) return null;
    btn.classList.add("theme-toggle-top");
    return btn;
  }

  function applyTheme(theme) {
    if (theme === "night") document.body.classList.add("night");
    else document.body.classList.remove("night");
  }

  function getSavedTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "night" ? "night" : "day";
  }

  function setSavedTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  function updateThemeIcon(btn) {
    const isNight = document.body.classList.contains("night");
    btn.textContent = isNight ? "☀️" : "🌙";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const themeBtn = ensureThemeButton();
    applyTheme(getSavedTheme());
    if (themeBtn) updateThemeIcon(themeBtn);

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const isNight = document.body.classList.toggle("night");
        setSavedTheme(isNight ? "night" : "day");
        updateThemeIcon(themeBtn);
      });
    }
  });
})();
