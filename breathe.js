(() => {
  const circle = document.getElementById("breathCircle");
  const breathLabel = document.getElementById("breathLabel");
  const timeEl = document.getElementById("timeDisplay");
  const topTitle = document.getElementById("topTitle");
  const topHint = document.getElementById("topHint");

  const modeSelect = document.getElementById("modeSelect");
  const minutesSelect = document.getElementById("minutesSelect");
  const minutesField = document.getElementById("minutesField");
  const vibrationToggle = document.getElementById("vibrationToggle");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const completedPill = document.getElementById("completedPill");

  if (!circle || !breathLabel || !timeEl || !modeSelect || !minutesSelect) return;

  const INHALE_MS = 4000;
  const EXHALE_MS = 6000;

  let running = false;
  let paused = false;

  let phaseTimer = null;
  let tickTimer = null;

  let mode = "timer";
  let endTime = 0;
  let startTime = 0;
  let pausedAt = 0;
  let pausedAccum = 0;

  function pad(n){ return String(n).padStart(2, "0"); }
  function fmt(ms){
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${pad(m)}:${pad(s)}`;
  }

  function vibrate(pattern){
    try{
      if (!vibrationToggle?.checked) return;
      if (navigator.vibrate) navigator.vibrate(pattern);
    }catch{}
  }

  function clearTimers(){
    if (phaseTimer) { clearTimeout(phaseTimer); phaseTimer = null; }
    if (tickTimer)  { clearInterval(tickTimer); tickTimer = null; }
  }

  function setCompleted(on){
    if (!completedPill) return;
    completedPill.style.display = on ? "inline-flex" : "none";
  }

  function inhale(){
    if (!running || paused) return;
    topTitle.textContent = "Inhale";
    breathLabel.textContent = "Inhale";
    circle.classList.remove("exhale");
    void circle.offsetWidth;
    circle.classList.add("inhale");
    vibrate(10);
    phaseTimer = setTimeout(exhale, INHALE_MS);
  }

  function exhale(){
    if (!running || paused) return;
    topTitle.textContent = "Exhale";
    breathLabel.textContent = "Exhale";
    circle.classList.remove("inhale");
    void circle.offsetWidth;
    circle.classList.add("exhale");
    vibrate([10, 30, 10]);
    phaseTimer = setTimeout(inhale, EXHALE_MS);
  }

  function startTicking(){
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      if (!running || paused) return;

      if (mode === "stopwatch") {
        const elapsed = Date.now() - startTime - pausedAccum;
        timeEl.textContent = `Time: ${fmt(elapsed)}`;
        return;
      }

      const remaining = endTime - Date.now() + pausedAccum;
      timeEl.textContent = `Time: ${fmt(remaining)}`;
      if (remaining <= 0) finish();
    }, 250);
  }

  function finish(){
    running = false;
    paused = false;
    clearTimers();
    circle.classList.remove("inhale", "exhale");

    topTitle.textContent = "Completed";
    topHint.textContent = "Nice work.";
    breathLabel.textContent = "Completed";
    timeEl.textContent = "Time: 00:00";
    pauseBtn.textContent = "Pause";
    setCompleted(true);
    vibrate([50, 70, 50]);
  }

  function setModeUI(){
    mode = modeSelect.value;
    minutesField.style.display = (mode === "timer") ? "grid" : "none";

    if (!running && !paused) {
      topTitle.textContent = "Ready";
      topHint.textContent = "Tap Start to begin.";
      breathLabel.textContent = "Ready";
      setCompleted(false);

      if (mode === "timer") {
        const mins = Number(minutesSelect.value || "1");
        timeEl.textContent = `Time: ${fmt(mins * 60 * 1000)}`;
      } else {
        timeEl.textContent = "Time: 00:00";
      }
    }
  }

  function start(){
    if (running) return;

    setCompleted(false);
    paused = false;
    pausedAccum = 0;
    mode = modeSelect.value;
    running = true;

    circle.classList.remove("inhale", "exhale");

    if (mode === "stopwatch") {
      startTime = Date.now();
      timeEl.textContent = "Time: 00:00";
    } else {
      const mins = Number(minutesSelect.value || "1");
      const duration = mins * 60 * 1000;
      endTime = Date.now() + duration;
      timeEl.textContent = `Time: ${fmt(duration)}`;
    }

    topHint.textContent = "Breathe with the circle.";
    inhale();
    startTicking();
  }

  function pause(){
    if (!running) return;

    paused = !paused;

    if (paused) {
      pausedAt = Date.now();
      clearTimers();
      circle.classList.remove("inhale", "exhale");
      topTitle.textContent = "Paused";
      topHint.textContent = "Tap Resume to continue.";
      breathLabel.textContent = "Paused";
      pauseBtn.textContent = "Resume";
      return;
    }

    pausedAccum += (Date.now() - pausedAt);
    pauseBtn.textContent = "Pause";
    topHint.textContent = "Breathe with the circle.";
    inhale();
    startTicking();
  }

  function reset(){
    running = false;
    paused = false;
    pausedAccum = 0;
    clearTimers();
    circle.classList.remove("inhale", "exhale");
    pauseBtn.textContent = "Pause";
    setCompleted(false);

    topTitle.textContent = "Ready";
    topHint.textContent = "Tap Start to begin.";
    breathLabel.textContent = "Ready";

    if (modeSelect.value === "timer") {
      const mins = Number(minutesSelect.value || "1");
      timeEl.textContent = `Time: ${fmt(mins * 60 * 1000)}`;
    } else {
      timeEl.textContent = "Time: 00:00";
    }
  }

  modeSelect.addEventListener("change", () => { if (!running) setModeUI(); });
  minutesSelect.addEventListener("change", () => { if (!running) setModeUI(); });

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);

  setModeUI();
})();
