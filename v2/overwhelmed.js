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
    "Press your feet gently into the floor. Notice the support underneath you.",
    "What is one tiny thing you can do next—water, window, message, shower?",
    "If this feeling is a wave, you can ride it. You only need the next breath."
  ];
  promptEl.textContent = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  // 60 seconds total
  const TOTAL = 60;

  // Breathing timing
  const INH = 4, HLD = 2, EXH = 6;

  let running = false;
  let t = TOTAL;
  let phase = "ready";
  let phaseLeft = 0;
  let id = null;

  function fmt(sec){
    const s = Math.max(0, Math.floor(sec));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  }

  function setTextFaded(txt){
    phaseEl.classList.add("fade-text");
    phaseEl.classList.add("is-fading");
    setTimeout(() => {
      phaseEl.textContent = txt;
      requestAnimationFrame(() => phaseEl.classList.remove("is-fading"));
    }, 140);
  }

  function setPhase(p){
    phase = p;

    circle.classList.remove("inhale","hold","exhale");
    void circle.offsetWidth;

    if (p === "inhale") { circle.classList.add("inhale"); phaseLeft = INH; setTextFaded("Inhale"); }
    else if (p === "hold") { circle.classList.add("hold"); phaseLeft = HLD; setTextFaded("Hold"); }
    else if (p === "exhale") { circle.classList.add("exhale"); phaseLeft = EXH; setTextFaded("Exhale"); }
    else { phaseLeft = 0; setTextFaded("Ready"); }
  }

  function stop(){
    running = false;
    clearInterval(id);
    id = null;
    t = TOTAL;
    timeEl.textContent = fmt(t);
    setPhase("ready");
  }

  function tick(){
    if (!running) return;

    t -= 1;
    timeEl.textContent = fmt(t);

    phaseLeft -= 1;
    if (phaseLeft <= 0) {
      if (phase === "inhale") setPhase("hold");
      else if (phase === "hold") setPhase("exhale");
      else setPhase("inhale");
    }

    if (t <= 0) {
      running = false;
      clearInterval(id);
      id = null;
      setPhase("ready");
      setTextFaded("Done");
      window.enigmaTrack && window.enigmaTrack("overwhelmed_done");
    }
  }

  // Init UI
  timeEl.textContent = fmt(t);
  setPhase("ready");

  startBtn.addEventListener("click", () => {
    if (running) return;
    running = true;
    t = TOTAL;
    timeEl.textContent = fmt(t);
    setPhase("inhale");
    clearInterval(id);
    id = setInterval(tick, 1000);
  });

  stopBtn.addEventListener("click", stop);
})();
