// Enigma Wellbeing — shared helpers (root)

const THEME_KEY = "enigma_theme_v2";

export function applySavedTheme() {
  const t = localStorage.getItem(THEME_KEY);
  document.body.classList.toggle("dark", t === "dark");
}

export function wireThemeButton() {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  });
}

export function wireBackButton() {
  const el = document.querySelector("[data-back]");
  if (!el) return;

  el.addEventListener("click", (e) => {
    if (history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js", { scope: "./" });
    } catch {
      // silent
    }
  });
}
