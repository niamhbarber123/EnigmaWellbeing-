(function () {
  const THEME_KEY = "enigma_theme"; // "night" or "day"

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

  function wireBackButtonsToHome() {
    const backs = document.querySelectorAll(".back-btn");
    backs.forEach((el) => {
      // if it's an <a>, ensure it links home
      if (el.tagName.toLowerCase() === "a") {
        el.setAttribute("href", "index.html");
        return;
      }

      // if it's a <button>, force home navigation
      el.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "index.html";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Theme button
    const themeBtn = document.getElementById("themeFab");
    if (themeBtn) {
      themeBtn.classList.add("theme-toggle-top");
      applyTheme(getSavedTheme());
      updateThemeIcon(themeBtn);

      themeBtn.addEventListener("click", () => {
        const isNight = document.body.classList.toggle("night");
        setSavedTheme(isNight ? "night" : "day");
        updateThemeIcon(themeBtn);
      });
    } else {
      applyTheme(getSavedTheme());
    }

    // Back button always to home
    wireBackButtonsToHome();
  });
})();
