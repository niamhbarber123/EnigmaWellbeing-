(() => {
  const THEME_KEY = "enigma_theme_v1";

  function applyTheme(isNight) {
    document.body.classList.toggle("night", !!isNight);
    const btn = document.getElementById("themeFab");
    if (btn) btn.textContent = isNight ? "☀️" : "🌙";
  }

  function loadTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === "night";
    } catch {
      return false;
    }
  }

  function saveTheme(isNight) {
    try {
      localStorage.setItem(THEME_KEY, isNight ? "night" : "day");
    } catch {}
  }

  // Wait until DOM is ready (works even if defer fails somewhere)
  function init() {
    applyTheme(loadTheme());

    const themeBtn = document.getElementById("themeFab");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const nowNight = !document.body.classList.contains("night");
        applyTheme(nowNight);
        saveTheme(nowNight);
      });
    }

    // Auto-mark active bottom nav (safe if nav exists)
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".bottom-nav a").forEach(a => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      a.classList.toggle("active", href === path);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
