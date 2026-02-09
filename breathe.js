(() => {
  const circle = document.getElementById("breathCircle");
  const timeText = document.getElementById("timeText");
  const phaseLabel = document.getElementById("phaseLabel");

  const modeSelect = document.getElementById("modeSelect");
  const minutesSelect = document.getElementById("minutesSelect");
  const minutesField = document.getElementById("minutesField");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const completedPill = document.getElementById("completedPill");

  if (!circle || !timeText || !modeSelect || !minutesSelect || !startBtn || !pauseBtn || !resetBtn) return;

  // Phases
  const INHALE_SEC = 4;
  const HOLD_SEC   = 2;
  const EXHALE_SEC = 6;

  let running = false;
  let paused = false;
  let intervalId = null;

  let mode = "timer";
  let remainingSec = 60;
  let elapsedSec = 0;

  let phase = "inhale";
  let phaseLeft = INHALE_SEC;

  function pad(n){ return String(n).padStart(2,"0"); }
  function fmt(sec){
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${pad(m)}:${pad(r)}`;
  }

  function setCompleted(on){
    if (!completedPill) return;
    completedPill.style.display = on ? "block" : "none";
  }

  function setPhase(next){
    phase = next;
    if (phase === "inhale") { phaseLeft = INHALE_SEC; if (phaseLabel) phaseLabel.textContent = "Inhale"; }
    if (phase === "hold")   { phaseLeft = HOLD_SEC;   if (phaseLabel) phaseLabel.textContent = "Hold"; }
    if (phase === "exhale") { phaseLeft = EXHALE_SEC; if (phaseLabel) phaseLabel.textContent = "Exhale"; }

    circle.classList.remove("inhale","hold","exhale");
    void circle.offsetWidth; // restart CSS animation
    circle.classList.add(phase);
  }

  function resetVisual(){
    circle.classList.remove("inhale","hold","exhale");
    if (phaseLabel) phaseLabel.textContent = "Ready";
    phase = "inhale";
    phaseLeft = INHALE_SEC;
  }

  function updateModeUI(){
    mode = modeSelect.value;
    minutesField.style.display = (mode === "timer") ? "" : "none";

    if (!running){
      if (mode === "timer"){
        const mins = Number(minutesSelect.value || 1);
        remainingSec = mins * 60;
        timeText.textContent = fmt(remainingSec);
      } else {
        elapsedSec = 0;
        timeText.textContent = fmt(elapsedSec);
      }
      setCompleted(false);
      resetVisual();
    }
  }

  function tickBreathing(){
    phaseLeft -= 1;
    if (phaseLeft > 0) return;

    if (phase === "inhale") setPhase("hold");
    else if (phase === "hold") setPhase("exhale");
    else setPhase("inhale");
  }

  function tickClock(){
    if (mode === "stopwatch"){
      elapsedSec += 1;
      timeText.textContent = fmt(elapsedSec);
      return;
    }

    remainingSec -= 1;
    timeText.textContent = fmt(remainingSec);

    if (remainingSec <= 0){
      finish();
    }
  }

  function startInterval(){
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (!running || paused) return;
      tickBreathing();
      tickClock();
    }, 1000);
  }

  function start(){
    if (running && !paused) return;

    if (!running){
      running = true;
      paused = false;
      setCompleted(false);

      if (modeSelect.value === "timer"){
        const mins = Number(minutesSelect.value || 1);
        remainingSec = mins * 60;
        timeText.textContent = fmt(remainingSec);
      } else {
        elapsedSec = 0;
        timeText.textContent = fmt(elapsedSec);
      }

      setPhase("inhale");
      pauseBtn.textContent = "Pause";
      startInterval();
      return;
    }

    // resume
    paused = false;
    pauseBtn.textContent = "Pause";
    startInterval();
  }

  function togglePause(){
    if (!running) return;
    paused = !paused;

    if (paused){
      pauseBtn.textContent = "Resume";
      clearInterval(intervalId);
      intervalId = null;
    } else {
      pauseBtn.textContent = "Pause";
      startInterval();
    }
  }

  function reset(){
    running = false;
    paused = false;
    clearInterval(intervalId);
    intervalId = null;

    pauseBtn.textContent = "Pause";
    setCompleted(false);
    updateModeUI();
  }

  function finish(){
    running = false;
    paused = false;
    clearInterval(intervalId);
    intervalId = null;

    resetVisual();
    setCompleted(true);
    timeText.textContent = "00:00";
    pauseBtn.textContent = "Pause";
  }

  // Events
  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", togglePause);
  resetBtn.addEventListener("click", reset);

  modeSelect.addEventListener("change", () => { reset(); updateModeUI(); });
  minutesSelect.addEventListener("change", () => { if (modeSelect.value === "timer"){ reset(); updateModeUI(); } });

  // Init
  updateModeUI();
})();
