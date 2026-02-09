(() => {
  // ===== Grab elements (must match your breathe.html) =====
  const circle = document.getElementById("breathCircle");
  const timeText = document.getElementById("timeText");

  const modeSelect = document.getElementById("modeSelect");
  const minutesSelect = document.getElementById("minutesSelect");
  const minutesField = document.getElementById("minutesField");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  const completedPill = document.getElementById("completedPill");

  // Safety: if key elements are missing, don’t crash
  if (!circle || !timeText || !modeSelect || !minutesSelect || !startBtn || !pauseBtn || !resetBtn) return;

  // ===== Timing for breathing phases (seconds) =====
  const INHALE_SEC = 4;
  const HOLD_SEC   = 2;  // ✅ hold added
  const EXHALE_SEC = 6;

  // ===== State =====
  let running = false;
  let paused = false;
  let intervalId = null;

  // mode
  let mode = "timer";        // "timer" or "stopwatch"
  let remainingSec = 60;     // timer
  let elapsedSec = 0;        // stopwatch

  // breathing phase
  let phase = "inhale";      // inhale | hold | exhale
  let phaseLeft = INHALE_SEC;

  // ===== Helpers =====
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmt(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${pad(m)}:${pad(r)}`;
  }

  function setCompleted(on) {
    if (!completedPill) return;
    completedPill.style.display = on ? "inline-flex" : "none";
  }

  function setCirclePhase(nextPhase) {
    phase = nextPhase;
    if (phase === "inhale") phaseLeft = INHALE_SEC;
    if (phase === "hold")   phaseLeft = HOLD_SEC;
    if (phase === "exhale") phaseLeft = EXHALE_SEC;

    circle.classList.remove("inhale", "hold", "exhale");

    // restart animations reliably
    void circle.offsetWidth;

    circle.classList.add(phase);
  }

  function resetBreathingVisual() {
    circle.classList.remove("inhale", "hold", "exhale");
    phase = "inhale";
    phaseLeft = INHALE_SEC;
  }

  function updateModeUI() {
    mode = modeSelect.value;

    // show/hide minutes dropdown
    minutesField.style.display = (mode === "timer") ? "" : "none";

    if (!running) {
      // reset display when not running
      if (mode === "timer") {
        const mins = Number(minutesSelect.value || 1);
        remainingSec = mins * 60;
        timeText.textContent = fmt(remainingSec);
      } else {
        elapsedSec = 0;
        timeText.textContent = fmt(elapsedSec);
      }
      setCompleted(false);
    }
  }

  function tickBreathing() {
    phaseLeft -= 1;
    if (phaseLeft > 0) return;

    // move to next phase
    if (phase === "inhale") setCirclePhase("hold");
    else if (phase === "hold") setCirclePhase("exhale");
    else setCirclePhase("inhale");
  }

  function tickClock() {
    if (mode === "stopwatch") {
      elapsedSec += 1;
      timeText.textContent = fmt(elapsedSec);
      return;
    }

    // timer mode
    remainingSec -= 1;
    timeText.textContent = fmt(remainingSec);

    if (remainingSec <= 0) {
      finishSession();
    }
  }

  function startInterval() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (!running || paused) return;

      tickBreathing();
      tickClock();
    }, 1000);
  }

  function startSession() {
    if (running && !paused) return;

    if (!running) {
      // fresh start
      setCompleted(false);
      paused = false;
      running = true;

      // init clock
      if (modeSelect.value === "timer") {
        const mins = Number(minutesSelect.value || 1);
        remainingSec = mins * 60;
        timeText.textContent = fmt(remainingSec);
      } else {
        elapsedSec = 0;
        timeText.textContent = fmt(elapsedSec);
      }

      // init breathing
      setCirclePhase("inhale");
      pauseBtn.textContent = "Pause";
      startInterval();
      return;
    }

    // resume
    paused = false;
    pauseBtn.textContent = "Pause";
    startInterval();
  }

  function togglePause() {
    if (!running) return;

    paused = !paused;

    if (paused) {
      pauseBtn.textContent = "Resume";
      // stop interval + freeze animation (keep circle as-is)
      clearInterval(intervalId);
      intervalId = null;
    } else {
      pauseBtn.textContent = "Pause";
      startInterval();
    }
  }

  function resetSession() {
    running = false;
    paused = false;

    clearInterval(intervalId);
    intervalId = null;

    pauseBtn.textContent = "Pause";
    setCompleted(false);

    // reset breathing
    resetBreathingVisual();

    // reset clock display based on mode
    updateModeUI();
  }

  function finishSession() {
    running = false;
    paused = false;

    clearInterval(intervalId);
    intervalId = null;

    // stop animation
    resetBreathingVisual();

    // show completion pill
    setCompleted(true);

    // lock timer at 00:00
    timeText.textContent = "00:00";

    pauseBtn.textContent = "Pause";
  }

  // ===== Events =====
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

  // ===== Init =====
  updateModeUI();
  resetSession();
})();
