(() => {
  const KEY = "enigma_theme_v2";
  const btn = document.getElementById("themeFab");

  function applyTheme(mode){
    document.body.classList.toggle("night", mode === "night");
    if (btn) btn.textContent = (mode === "night") ? "☀️" : "🌙";
  }

  function getSaved(){
    try { return localStorage.getItem(KEY) || "day"; }
    catch { return "day"; }
  }

  function setSaved(mode){
    try { localStorage.setItem(KEY, mode); } catch {}
  }

  // init
  const saved = getSaved();
  applyTheme(saved);

  // click
  if (btn){
    btn.addEventListener("click", () => {
      const nowNight = !document.body.classList.contains("night");
      const mode = nowNight ? "night" : "day";
      applyTheme(mode);
      setSaved(mode);
    });
  }
})();
