(() => {
  const modeSelect = document.getElementById("modeSelect");
  const minutesSelect = document.getElementById("minutesSelect");
  const minutesField = document.getElementById("minutesField");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  const timeDisplay = document.getElementById("timeDisplay");
  const breathCircle = document.getElementById("breathCircle");
  const breathLabel = document.getElementById("breathLabel"); // kept for compatibility
  const completedPill = document.getElementById("completedPill");

  let intervalId = null;
  let running = false;

  // modes
  // timer: counts down from selected minutes
  // stopwatch: counts up from 0
  let mode = "timer";

  // time state (seconds)
  let remaining = 60; // for timer
  let elapsed = 0;    // for stopwatch

  // breathing animation state
  const inhaleSec = 4;
  const exhaleSec = 6;
  let breathPhase = "inhale"; // inhale/exhale
  let phaseLeft = inhaleSec;

  function fmt(sec) {
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function updateModeUI() {
    mode = modeSelect.value;

    if (mode === "stopwatch") {
      minutesField.style.display = "none";
      timeDisplay.textContent = `Time: ${fmt(elapsed)}`;
    } else {
      minutesField.style.display = "";
      const mins = Number(minutesSelect.value || 1);
      remaining = mins * 60;
      timeDisplay.textContent = `Time: ${fmt(remaining)}`;
    }

    completedPill.style.display = "none";
  }

  function setCirclePhase(phase) {
    breathPhase = phase;
    phaseLeft = (phase === "inhale") ? inhaleSec : exhaleSec;

    breathCircle.classList.remove("inhale", "exhale");
    // restart animation reliably
    void breathCircle.offsetWidth;
    breathCircle.classList.add(phase);

    // keep label updated internally (hidden via CSS)
    if (breathLabel) breathLabel.textContent = phase === "inhale" ? "Inhale" : "Exhale";
  }

  function tickBreath() {
    phaseLeft -= 1;
    if (phaseLeft <= 0) {
      setCirclePhase(breathPhase === "inhale" ? "exhale" : "inhale");
    }
  }

  function tickTimer() {
    remaining -= 1;
    timeDisplay.textContent = `Time: ${fmt(remaining)}`;
    if (remaining <= 0) {
      stop(true);
    }
  }

  function tickStopwatch() {
    elapsed += 1;
    timeDisplay.textContent = `Time: ${fmt(elapsed)}`;
  }

  function start() {
    if (running) return;
    running = true;
    completedPill.style.display = "none";

    // Set initial time display
    if (mode === "timer") {
      if (remaining <= 0) {
        const mins = Number(minutesSelect.value || 1);
        remaining = mins * 60;
      }
      timeDisplay.textContent = `Time: ${fmt(remaining)}`;
    } else {
      timeDisplay.textContent = `Time: ${fmt(elapsed)}`;
    }

    // start breathing animation cycle
    setCirclePhase(breathPhase || "inhale");

    intervalId = window.setInterval(() => {
      tickBreath();
      if (mode === "timer") tickTimer();
      else tickStopwatch();
    }, 1000);
  }

  function stop(completed = false) {
    running = false;
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;

    breathCircle.classList.remove("inhale", "exhale");

    if (completed) {
      completedPill.style.display = "";
    }
  }

  function reset() {
    stop(false);
    elapsed = 0;

    const mins = Number(minutesSelect.value || 1);
    remaining = mins * 60;

    // reset breath state
    breathPhase = "inhale";
    phaseLeft = inhaleSec;

    completedPill.style.display = "none";
    timeDisplay.textContent = `Time: ${fmt(mode === "timer" ? remaining : elapsed)}`;
  }

  // Events
  modeSelect.addEventListener("change", () => {
    reset();
    updateModeUI();
  });

  minutesSelect.addEventListener("change", () => {
    reset();
    updateModeUI();
  });

  startBtn.addEventListener("click", start);

  pauseBtn.addEventListener("click", () => {
    if (!running) return;
    stop(false);
  });

  resetBtn.addEventListener("click", reset);

  // init
  updateModeUI();
  reset();
})();
