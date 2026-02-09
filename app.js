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

  // Theme init
  applyTheme(loadTheme());

  // Theme toggle
  const themeBtn = document.getElementById("themeFab");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const nowNight = !document.body.classList.contains("night");
      applyTheme(nowNight);
      saveTheme(nowNight);
    });
  }

  // Auto-active bottom nav
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".bottom-nav a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) a.classList.add("active");
    else a.classList.remove("active");
  });
})();
