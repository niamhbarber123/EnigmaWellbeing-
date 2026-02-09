(() => {
  /* =========================
     BREATHE — Enigma Wellbeing
     ========================= */

  // ----- Elements -----
  const circle = document.getElementById("breathCircle");
  const timeText = document.getElementById("timeText");

  const modeSelect = document.getElementById("modeSelect");
  const minutesSelect = document.getElementById("minutesSelect");
  const minutesField = document.getElementById("minutesField");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  const completedPill = document.getElementById("completedPill");

  // Safety
  if (
    !circle || !timeText ||
    !modeSelect || !minutesSelect || !minutesField ||
    !startBtn || !pauseBtn || !resetBtn
  ) return;

  // ----- Breathing timing (seconds) -----
  const INHALE_SEC = 4;
  const HOLD_SEC   = 2;
  const EXHALE_SEC = 6;

  // ----- State -----
  let running = false;
  let paused = false;
  let intervalId = null;

  let mode = "timer";        // timer | stopwatch
  let remainingSec = 60;
  let elapsedSec = 0;

  let phase = "inhale";      // inhale | hold | exhale
  let phaseLeft = INHALE_SEC;

  // ----- Helpers -----
  function pad(n){ return String(n).padStart(2, "0"); }

  function fmt(sec){
    const s = Math.max(0, Math.floor(sec));
    return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  }

  function todayKey(){
    return new Date().toISOString().slice(0, 10);
  }

  function setCompleted(on){
    if (!completedPill) return;
    completedPill.style.display = on ? "inline-flex" : "none";
  }

  function clearCircle(){
    circle.classList.remove("inhale", "hold", "exhale");
  }

  function setPhase(p){
    phase = p;
    phaseLeft =
      p === "inhale" ? INHALE_SEC :
      p === "hold"   ? HOLD_SEC :
                       EXHALE_SEC;

    clearCircle();
    void circle.offsetWidth; // restart animation
    circle.classList.add(p);
  }

  function resetVisual(){
    clearCircle();
    phase = "inhale";
    phaseLeft = INHALE_SEC;
  }

  // ----- Mode UI -----
  function updateModeUI(){
    mode = modeSelect.value;
    minutesField.style.display = mode === "timer" ? "" : "none";

    if (!running) {
      if (mode === "timer") {
        remainingSec = Number(minutesSelect.value || 1) * 60;
        timeText.textContent = fmt(remainingSec);
      } else {
        elapsedSec = 0;
        timeText.textContent = fmt(0);
      }
      setCompleted(false);
    }
  }

  // ----- Tick logic -----
  function tickBreathing(){
    phaseLeft -= 1;
    if (phaseLeft > 0) return;

    if (phase === "inhale") setPhase("hold");
    else if (phase === "hold") setPhase("exhale");
    else setPhase("inhale");
  }

  function tickClock(){
    if (mode === "stopwatch") {
      elapsedSec += 1;
      timeText.textContent = fmt(elapsedSec);
      return;
    }

    remainingSec -= 1;
    timeText.textContent = fmt(remainingSec);

    if (remainingSec <= 0) finishSession();
  }

  function startInterval(){
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (!running || paused) return;
      tickBreathing();
      tickClock();
    }, 1000);
  }

  // ----- Controls -----
  function startSession(){
    if (running && !paused) return;

    if (!running) {
      running = true;
      paused = false;
      setCompleted(false);

      if (mode === "timer") {
        remainingSec = Number(minutesSelect.value || 1) * 60;
        timeText.textContent = fmt(remainingSec);
      } else {
        elapsedSec = 0;
        timeText.textContent = fmt(0);
      }

      setPhase("inhale");
      pauseBtn.textContent = "Pause";
      startInterval();
      return;
    }

    paused = false;
    pauseBtn.textContent = "Pause";
    startInterval();
  }

  function togglePause(){
    if (!running) return;

    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";

    if (paused) {
      clearInterval(intervalId);
      intervalId = null;
    } else {
      startInterval();
    }
  }

  function resetSession(){
    running = false;
    paused = false;

    clearInterval(intervalId);
    intervalId = null;

    pauseBtn.textContent = "Pause";
    setCompleted(false);
    resetVisual();
    updateModeUI();
  }

  // ----- Finish + Progress logging -----
  function finishSession(){
    running = false;
    paused = false;

    clearInterval(intervalId);
    intervalId = null;
    resetVisual();

    // ✅ log breathe minutes (timer only)
    if (mode === "timer") {
      const mins = Number(minutesSelect.value || 1);
      const KEY = "enigma_breathe_minutes_v1";

      let store;
      try {
        store = JSON.parse(localStorage.getItem(KEY)) || { total: 0, byDay: {} };
      } catch {
        store = { total: 0, byDay: {} };
      }

      const day = todayKey();
      store.byDay[day] = Number(store.byDay[day] || 0) + mins;
      store.total = Number(store.total || 0) + mins;

      localStorage.setItem(KEY, JSON.stringify(store));
    }

    setCompleted(true);
    timeText.textContent = "00:00";
    pauseBtn.textContent = "Pause";
  }

  // ----- Events -----
  startBtn.addEventListener("click", startSession);
  pauseBtn.addEventListener("click", togglePause);
  resetBtn.addEventListener("click", resetSession);

  modeSelect.addEventListener("change", () => {
    resetSession();
    updateModeUI();
  });

  minutesSelect.addEventListener("change", () => {
    if (modeSelect.value === "timer") {
      resetSession();
      updateModeUI();
    }
  });

  // ----- Init -----
  updateModeUI();
  resetSession();
})();
