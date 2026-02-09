(() => {
  const KEY = "enigma_night_mode";

  function apply(isNight) {
    document.body.classList.toggle("night", !!isNight);
    const btn = document.getElementById("themeFab");
    if (btn) btn.textContent = isNight ? "☀️" : "🌙";
  }

  function load() {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  }

  function save(isNight) {
    try {
      localStorage.setItem(KEY, isNight ? "1" : "0");
    } catch {}
  }

  // initial
  const initial = load();
  apply(initial);

  // hook button
  const btn = document.getElementById("themeFab");
  if (btn) {
    btn.addEventListener("click", () => {
      const next = !document.body.classList.contains("night");
      apply(next);
      save(next);
    });
  }
})();
