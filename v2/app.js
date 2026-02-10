(() => {
  const KEY = "enigma_theme";
  const btn = document.getElementById("themeFab");

  function apply(theme) {
    document.body.classList.toggle("night", theme === "night");
    if (btn) btn.textContent = theme === "night" ? "☀️" : "🌙";
  }

  // init
  const saved = localStorage.getItem(KEY) || "day";
  apply(saved);

  if (btn) {
    btn.addEventListener("click", () => {
      const isNight = document.body.classList.contains("night");
      const next = isNight ? "day" : "night";
      localStorage.setItem(KEY, next);
      apply(next);
    });
  }
})();
