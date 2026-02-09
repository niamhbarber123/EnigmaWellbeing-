(() => {
  const circle = document.getElementById("breatheCircle");
  const phaseEl = document.getElementById("breathePhase");
  const timerEl = document.getElementById("breatheTimer");
  const timeReadout = document.getElementById("timeReadout");

  const lengthSel = document.getElementById("lengthSel");
  const vibrateChk = document.getElementById("vibrateChk");

  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const completedPill = document.getElementById("completedPill");

  let running = false;
  let endAt = 0;
  let raf = 0;

  // Gentle cycle: inhale 4s, hold 2s, exhale 6s
  const phases = [
    { name: "Inhale", ms: 4000, big: true, vibrate: 20 },
    { name: "Hold",   ms: 2000, big: true,  vibrate: 0 },
    { name: "Exhale", ms: 6000, big: false, vibrate: 20 },
  ];

  function formatMMSS(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function setPhase(name, big, doVibrateMs) {
    phaseEl.textContent = name;
    circle.classList.toggle("is-big", !!big);

    if (vibrateChk.checked && navigator.vibrate && doVibrateMs > 0) {
      navigator.vibrate(doVibrateMs);
    }
  }

  function loop(now) {
    if (!running) return;

    const remaining = endAt - Date.now();
    timerEl.textContent = `Time: ${formatMMSS(remaining)}`;
    timeReadout.textContent = formatMMSS(remaining);

    if (remaining <= 0) {
      stop(true);
      return;
    }

    // figure out where we are in the cycle
    const cycleMs = phases.reduce((a, p) => a + p.ms, 0);
    const t = (Date.now() % cycleMs);

    let acc = 0;
    for (const p of phases) {
      acc += p.ms;
      if (t <= acc) {
        // set phase state
        setPhase(p.name, p.big, p.vibrate);
        break;
      }
    }

    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    completedPill.style.display = "none";

    const mins = Number(lengthSel.value || "1");
    endAt = Date.now() + mins * 60_000;
    running = true;

    setPhase("Inhale", true, 20);
    raf = requestAnimationFrame(loop);
  }

  function stop(completed) {
    running = false;
    cancelAnimationFrame(raf);

    setPhase("Ready", false, 0);
    timerEl.textContent = "Time: —";
    timeReadout.textContent = "—";

    if (completed) {
      completedPill.style.display = "inline-flex";
    }
  }

  startBtn.addEventListener("click", start);
  stopBtn.addEventListener("click", () => stop(false));

  // initial
  stop(false);
})();
