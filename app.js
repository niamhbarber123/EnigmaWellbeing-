(function () {
  const THEME_KEY = "enigma_theme"; // "night" or "day"

  function ensureThemeButton() {
    let btn = document.getElementById("themeFab");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "themeFab";
      btn.type = "button";
      btn.className = "theme-toggle-top";
      btn.setAttribute("aria-label", "Toggle night mode");
      document.body.prepend(btn);
    } else {
      btn.classList.add("theme-toggle-top");
    }
    return btn;
  }

  function ensureBackButton() {
    const isHome = document.body.classList.contains("home");
    let back = document.querySelector(".home-back");

    if (isHome) {
      if (back) back.remove();
      return;
    }

    if (!back) {
      back = document.createElement("a");
      back.className = "home-back";
      back.href = "index.html";
      back.setAttribute("aria-label", "Back to Home");
      back.textContent = "←";
      document.body.prepend(back);
    } else {
      back.href = "index.html";
    }
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
    ensureBackButton();

    applyTheme(getSavedTheme());
    updateThemeIcon(themeBtn);

    themeBtn.addEventListener("click", () => {
      const isNight = document.body.classList.toggle("night");
      setSavedTheme(isNight ? "night" : "day");
      updateThemeIcon(themeBtn);
    });
  });
})();
