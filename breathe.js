(() => {
  const circle = document.getElementById("breathCircle");
  const breathLabel = document.getElementById("breathLabel");
  const timeEl = document.getElementById("timeDisplay");
  const topTitle = document.getElementById("topTitle");
  const topHint = document.getElementById("topHint");

  const modeSelect = document.getElementById("modeSelect");
  const minutesSelect = document.getElementById("minutesSelect");
  const minutesField = document.getElementById("minutesField");
  const patternSelect = document.getElementById("patternSelect");
  const vibrationToggle = document.getElementById("vibrationToggle");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const completedPill = document.getElementById("completedPill");

  if (!circle || !breathLabel || !timeEl || !modeSelect || !minutesSelect || !patternSelect) return;

  const PATTERNS = {
    calm:  { inhale: 4000, hold1: 0,    exhale: 6000, hold2: 0 },
    box:   { inhale: 4000, hold1: 4000, exhale: 4000, hold2: 4000 },
    "478": { inhale: 4000, hold1: 7000, exhale: 8000, hold2: 0 }
  };

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

  function setModeUI(){
    mode = modeSelect.value;
    minutesField.style.display = (mode === "timer") ? "grid" : "none";

    if (!running && !paused) {
      const mins = Number(minutesSelect.value || "1");
      timeEl.textContent = (mode === "timer")
        ? `Time: ${fmt(mins * 60 * 1000)}`
        : "Time: 00:00";

      topTitle.textContent = "Ready";
      topHint.textContent = "Choose your settings below, then tap Start.";
      breathLabel.textContent = "Ready";
      setCompleted(false);
    }
  }

  function currentRemaining(){
    if (mode === "stopwatch") {
      const elapsed = Date.now() - startTime - pausedAccum;
      return { label: `Time: ${fmt(elapsed)}`, done: false };
    }
    const remaining = endTime - Date.now() + pausedAccum;
    return { label: `Time: ${fmt(remaining)}`, done: remaining <= 0 };
  }

  function startTicking(){
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      if (!running || paused) return;
      const r = currentRemaining();
      timeEl.textContent = r.label;
      if (r.done) finish();
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

  function animateInhale(ms){
    breathLabel.textContent = "Inhale";
    topTitle.textContent = "Inhale";
    circle.classList.remove("exhale");
    void circle.offsetWidth;
    circle.style.animationDuration = `${ms}ms`;
    circle.classList.add("inhale");
    vibrate(10);
  }

  function animateExhale(ms){
    breathLabel.textContent = "Exhale";
    topTitle.textContent = "Exhale";
    circle.classList.remove("inhale");
    void circle.offsetWidth;
    circle.style.animationDuration = `${ms}ms`;
    circle.classList.add("exhale");
    vibrate([10, 30, 10]);
  }

  function setHold(text){
    breathLabel.textContent = text;
    topTitle.textContent = text;
    circle.classList.remove("inhale", "exhale");
  }

  function cycle(){
    if (!running || paused) return;

    const p = PATTERNS[patternSelect.value] || PATTERNS.calm;

    // inhale
    animateInhale(p.inhale);
    phaseTimer = setTimeout(() => {
      if (!running || paused) return;

      // hold1
      if (p.hold1 > 0) {
        setHold("Hold");
        phaseTimer = setTimeout(() => {
          if (!running || paused) return;

          // exhale
          animateExhale(p.exhale);
          phaseTimer = setTimeout(() => {
            if (!running || paused) return;

            // hold2
            if (p.hold2 > 0) {
              setHold("Hold");
              phaseTimer = setTimeout(cycle, p.hold2);
            } else {
              cycle();
            }
          }, p.exhale);

        }, p.hold1);
      } else {
        // exhale directly
        animateExhale(p.exhale);
        phaseTimer = setTimeout(() => {
          if (!running || paused) return;

          if (p.hold2 > 0) {
            setHold("Hold");
            phaseTimer = setTimeout(cycle, p.hold2);
          } else {
            cycle();
          }
        }, p.exhale);
      }
    }, p.inhale);
  }

  function start(){
    if (running) return;

    setCompleted(false);
    paused = false;
    pausedAccum = 0;

    mode = modeSelect.value;
    running = true;

    circle.classList.remove("inhale", "exhale");
    circle.style.animationDuration = "";

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
    cycle();
    startTicking();
  }

  function pause(){
    if (!running) return;

    paused = !paused;

    if (paused) {
      pausedAt = Date.now();
      clearTimers();
      circle.classList.remove("inhale", "exhale");
      breathLabel.textContent = "Paused";
      topTitle.textContent = "Paused";
      topHint.textContent = "Tap Resume to continue.";
      pauseBtn.textContent = "Resume";
      return;
    }

    pausedAccum += (Date.now() - pausedAt);
    pauseBtn.textContent = "Pause";
    topHint.textContent = "Breathe with the circle.";
    cycle();
    startTicking();
  }

  function reset(){
    running = false;
    paused = false;
    pausedAccum = 0;
    clearTimers();

    circle.classList.remove("inhale", "exhale");
    pauseBtn.textContent = "Pause";

    topTitle.textContent = "Ready";
    topHint.textContent = "Choose your settings below, then tap Start.";
    breathLabel.textContent = "Ready";

    const mins = Number(minutesSelect.value || "1");
    timeEl.textContent = (modeSelect.value === "timer")
      ? `Time: ${fmt(mins * 60 * 1000)}`
      : "Time: 00:00";

    setCompleted(false);
  }

  modeSelect.addEventListener("change", () => { if (!running) setModeUI(); });
  minutesSelect.addEventListener("change", () => { if (!running) setModeUI(); });
  patternSelect.addEventListener("change", () => { if (running && !paused) { clearTimers(); cycle(); } });

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);

  setModeUI();
})();
