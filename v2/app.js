(() => {
  const KEY = "enigma_v2_night";

  function apply(isNight) {
    document.body.classList.toggle("night", !!isNight);
    const btn = document.getElementById("themeFab");
    if (btn) btn.textContent = isNight ? "☀️" : "🌙";
  }

  function readPref() {
    try { return localStorage.getItem(KEY) === "1"; }
    catch { return false; }
  }

  function writePref(isNight) {
    try { localStorage.setItem(KEY, isNight ? "1" : "0"); }
    catch {}
  }

  document.addEventListener("DOMContentLoaded", () => {
    // apply saved preference on every page
    apply(readPref());

    const btn = document.getElementById("themeFab");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const next = !document.body.classList.contains("night");
      writePref(next);
      apply(next);
    });
  });
})();
