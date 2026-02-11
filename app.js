/* =========================
   Enigma Wellbeing v2 app.js
   - Night mode toggle (persists)
   - Back button helper
   - Double-tap helper
   ========================= */

const THEME_KEY = "enigma_theme_v2";

export function applySavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") document.body.classList.add("dark");
}

export function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
}

export function wireThemeButton() {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;
  btn.addEventListener("click", toggleTheme);
}

export function wireBackButton() {
  const back = document.querySelector("[data-back]");
  if (!back) return;
  back.addEventListener("click", (e) => {
    e.preventDefault();
    // If there is history, go back. Otherwise go home.
    if (window.history.length > 1) window.history.back();
    else window.location.href = "index.html";
  });
}

/* Double tap/click helper for mobile + desktop */
export function onDoubleTap(el, fn, thresholdMs = 320) {
  let last = 0;
  el.addEventListener("click", () => {
    const now = Date.now();
    if (now - last < thresholdMs) fn();
    last = now;
  });
}

/* Simple format mm:ss */
export function fmt(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}
