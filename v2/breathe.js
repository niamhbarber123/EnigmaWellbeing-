(() => {
  const circle = document.getElementById("breathCircle");
  const timeText = document.getElementById("timeText");
  const phaseText = document.getElementById("phaseText");

  const modeSelect = document.getElementById("modeSelect");
  const minutesSelect = document.getElementById("minutesSelect");
  const minutesField = document.getElementById("minutesField");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const completedPill = document.getElementById("completedPill");

  if (!circle || !timeText || !phaseText || !modeSelect || !minutesSelect || !minutesField || !startBtn || !pauseBtn || !resetBtn) return;

  // Breathing phases (seconds)
  const INHALE_SEC = 4;
  const HOLD_SEC   = 2;
  const EXHALE_SEC = 6;

  let running = false;
  let paused = false;
  let intervalId = null;

  let mode = "timer";       // timer | stopwatch
  let remainingSec = 60;
  let elapsedSec = 0;

  let phase = "ready";      // ready | inhale | hold | exhale
  let phaseLeft = 0;

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

  function setPhaseLabel(p) {
    if (p === "inhale") phaseText.textContent = "Inhale";
    else if (p === "hold") phaseText.textContent = "Hold";
    else if (p === "exhale") phaseText.textContent = "Exhale";
    else phaseText.textContent = "Ready";
  }

  function setCirclePhase(next) {
    phase = next;

    if (phase === "inhale") phaseLeft = INHALE_SEC;
    if (phase === "hold")   phaseLeft = HOLD_SEC;
    if (phase === "exhale") phaseLeft = EXHALE_SEC;

    setPhaseLabel(phase);

    circle.classList.remove("inhale", "hold", "exhale");
    // restart animation reliably
    void circle.offsetWidth;
    if (phase === "inhale") circle.classList.add("inhale");
    if (phase === "hold")   circle.classList.add("hold");
    if (phase === "exhale") circle.classList.add("exhale");
  }

  function resetBreathingVisual() {
    circle.classList.remove("inhale", "hold", "exhale");
    phase = "ready";
    phaseLeft = 0;
    setPhaseLabel("ready");
  }

  function updateModeUI() {
    mode = modeSelect.value;

    // show/hide timer length
    minutesField.style.display = (mode === "timer") ? "" : "none";

    if (!running) {
      if (mode === "timer") {
        const mins = Number(minutesSelect.value || 1);
        remainingSec = mins * 60;
        timeText.textContent = fmt(remainingSec);
      } else {
        elapsedSec = 0;
        timeText.textContent = fmt(elapsedSec);
      }
      setCompleted(false);
      resetBreathingVisual();
    }
  }

  function tickBreathing() {
    if (phase === "ready") return;

    phaseLeft -= 1;
    if (phaseLeft > 0) return;

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

    remainingSec -= 1;
    timeText.textContent = fmt(remainingSec);

    if (remainingSec <= 0) finishSession();
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
      setCompleted(false);
      paused = false;
      running = true;

      if (modeSelect.value === "timer") {
        const mins = Number(minutesSelect.value || 1);
        remainingSec = mins * 60;
        timeText.textContent = fmt(remainingSec);
      } else {
        elapsedSec = 0;
        timeText.textContent = fmt(elapsedSec);
      }

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
    resetBreathingVisual();
    updateModeUI();
  }

  function finishSession() {
    running = false;
    paused = false;

    clearInterval(intervalId);
    intervalId = null;

    resetBreathingVisual();
    setCompleted(true);
    timeText.textContent = "00:00";
    pauseBtn.textContent = "Pause";
  }

  // Events
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

  // Init
  updateModeUI();
  resetSession();
})();
