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

  // Optional: vibration toggle (kept harmless; browsers may ignore)
  const vibrationToggle = document.getElementById("vibrationToggle");

  // Calm pattern
  const INHALE_MS = 4000;
  const EXHALE_MS = 6000;

  let running = false;
  let phaseTimer = null;
  let tickTimer = null;

  let startTime = 0; // stopwatch
  let endTime = 0;   // timer
  let mode = "timer";

  function pad(n){ return String(n).padStart(2, "0"); }

  function fmt(ms){
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${pad(m)}:${pad(s)}`;
  }

  function setCompleted(on){
    completedPill.style.display = on ? "inline-flex" : "none";
  }

  function clearTimers(){
    if (phaseTimer) { clearTimeout(phaseTimer); phaseTimer = null; }
    if (tickTimer)  { clearInterval(tickTimer); tickTimer = null; }
  }

  function resetVisual(){
    circle.classList.remove("inhale", "exhale");
    label.textContent = "Ready";
    timeEl.textContent = "Time: —";
  }

  function maybeVibrate(pattern){
    try{
      if (!vibrationToggle || !vibrationToggle.checked) return;
      if (navigator.vibrate) navigator.vibrate(pattern);
    }catch{}
  }

  function inhale(){
    if (!running) return;
    label.textContent = "Ready";
    maybeVibrate(20);
    circle.classList.remove("exhale");
    void circle.offsetWidth;
    circle.classList.add("inhale");
    phaseTimer = setTimeout(exhale, INHALE_MS);
  }

  function exhale(){
    if (!running) return;
    label.textContent = "Ready";
    maybeVibrate([15, 40, 15]);
    circle.classList.remove("inhale");
    void circle.offsetWidth;
    circle.classList.add("exhale");
    phaseTimer = setTimeout(inhale, EXHALE_MS);
  }

  function startTicking(){
    if (tickTimer) clearInterval(tickTimer);

    tickTimer = setInterval(() => {
      if (!running) return;

      if (mode === "stopwatch") {
        const elapsed = Date.now() - startTime;
        timeEl.textContent = `Time: ${fmt(elapsed)}`;
        return;
      }

      const remaining = endTime - Date.now();
      timeEl.textContent = `Time: ${fmt(remaining)}`;

      if (remaining <= 0) finishSession();
    }, 250);
  }

  function finishSession(){
    running = false;
    clearTimers();
    circle.classList.remove("inhale", "exhale");
    label.textContent = "Ready";
    timeEl.textContent = "Time: 00:00";
    setCompleted(true);
    maybeVibrate([60, 80, 60]);
  }

  function setModeUI(){
    mode = modeSelect.value;
    minutesField.style.display = (mode === "timer") ? "grid" : "none";

    if (!running) {
      if (mode === "timer") {
        const mins = Number(minutesSelect.value || "1");
        timeEl.textContent = `Time: ${fmt(mins * 60 * 1000)}`;
      } else {
        timeEl.textContent = "Time: 00:00";
      }
    }
  }

  function startSession(){
    if (running) return;

    setCompleted(false);
    circle.classList.remove("inhale", "exhale");

    mode = modeSelect.value;
    running = true;

    if (mode === "stopwatch") {
      startTime = Date.now();
      timeEl.textContent = "Time: 00:00";
    } else {
      const mins = Number(minutesSelect.value || "1");
      const duration = mins * 60 * 1000;
      endTime = Date.now() + duration;
      timeEl.textContent = `Time: ${fmt(duration)}`;
    }

    inhale();
    startTicking();
  }

  function stopSession(){
    if (!running) return;
    running = false;
    clearTimers();
    circle.classList.remove("inhale", "exhale");
    label.textContent = "Ready";
    setCompleted(false);
  }

  // Events
  modeSelect.addEventListener("change", setModeUI);
  minutesSelect.addEventListener("change", setModeUI);

  startBtn.addEventListener("click", startSession);
  stopBtn.addEventListener("click", stopSession);

  // Init
  setModeUI();
})();
