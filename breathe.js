(() => {
  const circle = document.getElementById("breathCircle");
  const label  = document.getElementById("breathLabel");
  const timeEl = document.getElementById("timeDisplay");

  const startBtn = document.getElementById("startBtn");
  const stopBtn  = document.getElementById("stopBtn");
  const completedPill = document.getElementById("completedPill");

  const modeSelect = document.getElementById("modeSelect");
  const minutesSelect = document.getElementById("minutesSelect");
  const minutesField = document.getElementById("minutesField");

  // Breath pattern (kept simple + calming)
  const INHALE_MS = 4000;
  const EXHALE_MS = 6000;

  let running = false;
  let phaseTimer = null;
  let tickTimer = null;

  let startTime = 0;         // for stopwatch
  let endTime = 0;           // for timer
  let mode = "timer";

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function fmt(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${pad(m)}:${pad(s)}`;
  }

  function setModeUI() {
    mode = modeSelect.value;
    minutesField.style.display = (mode === "timer") ? "block" : "none";
    timeEl.textContent = (mode === "timer")
      ? fmt(Number(minutesSelect.value) * 60 * 1000)
      : "00:00";
  }

  function clearTimers() {
    if (phaseTimer) { clearTimeout(phaseTimer); phaseTimer = null; }
    if (tickTimer)  { clearInterval(tickTimer); tickTimer = null; }
  }

  function setCompleted(on) {
    completedPill.style.display = on ? "inline-flex" : "none";
  }

  function resetVisual() {
    circle.classList.remove("inhale", "exhale");
    label.textContent = "Ready";
  }

  function inhale() {
    if (!running) return;
    label.textContent = "Inhale";
    circle.classList.remove("exhale");
    // restart animation reliably
    void circle.offsetWidth;
    circle.classList.add("inhale");
    phaseTimer = setTimeout(exhale, INHALE_MS);
  }

  function exhale() {
    if (!running) return;
    label.textContent = "Exhale";
    circle.classList.remove("inhale");
    void circle.offsetWidth;
    circle.classList.add("exhale");
    phaseTimer = setTimeout(inhale, EXHALE_MS);
  }

  function startTicking() {
    if (tickTimer) clearInterval(tickTimer);

    tickTimer = setInterval(() => {
      if (!running) return;

      if (mode === "stopwatch") {
        const elapsed = Date.now() - startTime;
        timeEl.textContent = fmt(elapsed);
        return;
      }

      // timer
      const remaining = endTime - Date.now();
      timeEl.textContent = fmt(remaining);

      if (remaining <= 0) {
        finishSession();
      }
    }, 250);
  }

  function finishSession() {
    running = false;
    clearTimers();
    resetVisual();
    label.textContent = "Completed";
    setCompleted(true);

    // for timer mode ensure 00:00
    if (mode === "timer") timeEl.textContent = "00:00";
  }

  function startSession() {
    if (running) return;

    setCompleted(false);
    resetVisual();

    mode = modeSelect.value;

    running = true;

    if (mode === "stopwatch") {
      startTime = Date.now();
      timeEl.textContent = "00:00";
    } else {
      const mins = Number(minutesSelect.value || "5");
      const duration = mins * 60 * 1000;
      endTime = Date.now() + duration;
      timeEl.textContent = fmt(duration);
    }

    inhale();
    startTicking();
  }

  function stopSession() {
    if (!running) return;
    running = false;
    clearTimers();
    resetVisual();
    label.textContent = "Stopped";
    setCompleted(false);

    // keep the last shown time as-is (feels natural)
  }

  // Events
  modeSelect.addEventListener("change", () => {
    setModeUI();
  });

  minutesSelect.addEventListener("change", () => {
    if (!running && modeSelect.value === "timer") {
      timeEl.textContent = fmt(Number(minutesSelect.value) * 60 * 1000);
    }
  });

  startBtn.addEventListener("click", startSession);
  stopBtn.addEventListener("click", stopSession);

  // Init
  setModeUI();
})();
