(() => {
  const circle = document.getElementById("breathCircle");
  const phaseText = document.getElementById("phaseText");
  const timeText = document.getElementById("timeText");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (!circle || !phaseText || !timeText || !startBtn || !pauseBtn || !resetBtn) return;

    const pace = (() => {
    try { return localStorage.getItem("enigma_breathe_pace_v2") || "standard"; }
    catch { return "standard"; }
  })();

  const reduceMotion = (() => {
    try { return (localStorage.getItem("enigma_reduce_motion_v2") || "0") === "1"; }
    catch { return false; }
  })();

  // Slow / Standard / Fast profiles
  const profiles = {
    slow:     { inhale: 5, hold: 2, exhale: 7 },
    standard: { inhale: 4, hold: 2, exhale: 6 },
    fast:     { inhale: 3, hold: 1, exhale: 4 }
  };

  const INHALE = profiles[pace].inhale;
  const HOLD   = profiles[pace].hold;
  const EXHALE = profiles[pace].exhale;

  // If reduced motion, don’t animate scale
  if (reduceMotion) circle.classList.remove("inhale","hold","exhale");

  let running = false;
  let paused = false;
  let intervalId = null;

  let totalLeft = 60;
  let phase = "ready";
  let phaseLeft = INHALE;

  const pad = n => String(n).padStart(2,"0");
  const fmt = sec => `${pad(Math.floor(sec/60))}:${pad(sec%60)}`;

  function setPhase(p){
    phase = p;

    if (p === "inhale"){ phaseLeft = INHALE; phaseText.textContent = "Inhale"; }
    if (p === "hold"){ phaseLeft = HOLD; phaseText.textContent = "Hold"; }
    if (p === "exhale"){ phaseLeft = EXHALE; phaseText.textContent = "Exhale"; }

    circle.classList.remove("inhale","hold","exhale");
    void circle.offsetWidth; // restart animation reliably
    if (p !== "ready") circle.classList.add(p);
  }

  function tick(){
    if (!running || paused) return;

    totalLeft -= 1;
    timeText.textContent = fmt(Math.max(0,totalLeft));

    phaseLeft -= 1;
    if (phaseLeft <= 0){
      if (phase === "inhale") setPhase("hold");
      else if (phase === "hold") setPhase("exhale");
      else setPhase("inhale");
    }

    if (totalLeft <= 0){
      finish();
    }
  }

  function start(){
    if (running && !paused) return;

    if (!running){
      running = true;
      paused = false;
      totalLeft = 60;
      timeText.textContent = fmt(totalLeft);
      setPhase("inhale");
      pauseBtn.textContent = "Pause";
      clearInterval(intervalId);
      intervalId = setInterval(tick, 1000);
      return;
    }

    // resume
    paused = false;
    pauseBtn.textContent = "Pause";
    clearInterval(intervalId);
    intervalId = setInterval(tick, 1000);
  }

  function togglePause(){
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  }

  function reset(){
    running = false;
    paused = false;
    clearInterval(intervalId);
    intervalId = null;

    circle.classList.remove("inhale","hold","exhale");
    phaseText.textContent = "Ready";
    totalLeft = 60;
    timeText.textContent = fmt(totalLeft);
    pauseBtn.textContent = "Pause";
  }

  function finish(){
    running = false;
    paused = false;
    clearInterval(intervalId);
    intervalId = null;

    circle.classList.remove("inhale","hold","exhale");
    phaseText.textContent = "Done";
    timeText.textContent = "00:00";
    pauseBtn.textContent = "Pause";
  }

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", togglePause);
  resetBtn.addEventListener("click", reset);

  reset();
})();
