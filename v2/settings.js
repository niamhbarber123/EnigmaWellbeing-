(() => {
  const paceButtons = Array.from(document.querySelectorAll("[data-pace]"));
  const paceMsg = document.getElementById("paceMsg");
  const reduceMotionEl = document.getElementById("reduceMotion");

  const PACE_KEY = "enigma_breathe_pace_v2";          // slow | standard | fast
  const MOTION_KEY = "enigma_reduce_motion_v2";       // "1" or "0"

  function getPace(){
    try { return localStorage.getItem(PACE_KEY) || "standard"; }
    catch { return "standard"; }
  }
  function setPace(v){
    try { localStorage.setItem(PACE_KEY, v); } catch {}
  }

  function getReduce(){
    try { return (localStorage.getItem(MOTION_KEY) || "0") === "1"; }
    catch { return false; }
  }
  function setReduce(on){
    try { localStorage.setItem(MOTION_KEY, on ? "1" : "0"); } catch {}
  }

  function paceLabel(p){
    if (p === "slow") return "Slow pace selected.";
    if (p === "fast") return "Fast pace selected.";
    return "Standard pace selected.";
  }

  function renderPace(){
    const pace = getPace();
    paceButtons.forEach(b => {
      const isActive = b.getAttribute("data-pace") === pace;
      b.classList.toggle("active", isActive);
    });
    if (paceMsg) paceMsg.textContent = paceLabel(pace);
  }
const pills = document.querySelectorAll(".pill");
const KEY = "enigma_breath_pace";

const saved = localStorage.getItem(KEY) || "standard";
setActive(saved);

pills.forEach(pill => {
  pill.addEventListener("click", () => {
    localStorage.setItem(KEY, pill.dataset.pace);
    setActive(pill.dataset.pace);
  });
});

function setActive(pace) {
  pills.forEach(p =>
    p.classList.toggle("active", p.dataset.pace === pace)
  );
}
  paceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const p = btn.getAttribute("data-pace") || "standard";
      setPace(p);
      renderPace();
    });
  });

  if (reduceMotionEl){
    reduceMotionEl.checked = getReduce();
    reduceMotionEl.addEventListener("change", () => {
      setReduce(reduceMotionEl.checked);
    });
  }

  renderPace();
})();
