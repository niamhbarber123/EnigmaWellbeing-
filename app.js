(() => {
  const btn = document.getElementById("themeFab");
  const KEY = "enigma_theme";

  function apply(theme){
    document.body.classList.toggle("night", theme === "night");
    if(btn) btn.textContent = theme === "night" ? "☀️" : "🌙";
  }

  const saved = localStorage.getItem(KEY) || "day";
  apply(saved);

  if(btn){
    btn.onclick = () => {
      const next = document.body.classList.contains("night") ? "day" : "night";
      localStorage.setItem(KEY, next);
      apply(next);
    };
  }
})();
