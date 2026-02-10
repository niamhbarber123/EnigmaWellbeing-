(() => {
  const circle = document.getElementById("ovCircle");
  const phaseEl = document.getElementById("ovPhase");
  const timeEl = document.getElementById("ovTime");
  const startBtn = document.getElementById("ovStart");
  const stopBtn = document.getElementById("ovStop");
  const promptEl = document.getElementById("ovPrompt");

  if (!circle || !phaseEl || !timeEl || !startBtn || !stopBtn || !promptEl) return;

  const PROMPTS = [
    "Name 3 things you can see. 2 things you can feel. 1 thing you can hear.",
    "Where are your feet right now? Press them gently into the floor.",
    "What is one tiny thing you can do next—water, window, message, shower?",
    "If this feeling is a wave, you can ride it. You only need the next breath."
  ];
  promptEl.textContent = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  let running = false;
  let t = 60;

  const INH = 4, HLD = 2, EXH = 6;
  let phase = "ready";
  let phaseLeft = 0;
  let id = null;

  function setText(txt) {
    phaseEl.classList.add("fade-text");
    phaseEl.classList.add("is-fading");
    setTimeout(() => {
      phaseEl.textContent = txt;
      requestAnimationFrame(() => phaseEl.classList.remove("is-fading"));
    }, 140);
  }

  function setPhase(p) {
    phase = p;
    circle.classList.remove("inhale", "hold", "exhale");
    void circle.offsetWidth;

    if (p === "inhale") { circle.classList.add("inhale"); phaseLeft = INH; setText("Inhale"); }
    if (p === "hold")   { circle.classList.add("hold");   phaseLeft = HLD; setText("Hold"); }
    if (p === "exhale") { circle.classList.add("exhale"); phaseLeft = EXH; setText("Exhale"); }
    if (p === "ready")  { phaseLeft = 0; setText("Ready"); }
  }

  function stop() {
    running = false;
    clearInterval(id);
    id = null;
    t = 60;
    timeEl.textContent = "00:60";
    setPhase("ready");
  }

  function tick() {
    if (!running) return;

    t -= 1;
    timeEl.textContent = `00:${String(Math.max(0, t)).padStart(2, "0")}`;

    phaseLeft -= 1;
    if (phaseLeft <= 0) {
      if (phase === "inhale") setPhase("hold");
      else if (phase === "hold") setPhase("exhale");
      else setPhase("inhale");
    }

    if (t <= 0) {
      window.enigmaTrack && window.enigmaTrack("overwhelmed_done");
      stop();
      setText("Done");
    }
  }

  startBtn.addEventListener("click", () => {
    if (running) return;
    running = true;
    t = 60;
    timeEl.textContent = "00:60";
    setPhase("inhale");
    id = setInterval(tick, 1000);
  });

  stopBtn.addEventListener("click", stop);

  setPhase("ready");
})();
