const circle = document.getElementById("circle");
const text = document.getElementById("breatheText");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

let interval;
let phase = 0;
let running = false;

const phases = [
  { label: "Inhale", scale: 1.2, duration: 4000 },
  { label: "Hold", scale: 1.2, duration: 2000 },
  { label: "Exhale", scale: 1.0, duration: 4000 }
];

function runCycle() {
  const current = phases[phase];
  text.textContent = current.label;
  circle.style.transform = `scale(${current.scale})`;

  phase = (phase + 1) % phases.length;

  interval = setTimeout(runCycle, current.duration);
}

startBtn.addEventListener("click", () => {
  if (running) return;
  running = true;
  phase = 0;
  runCycle();
});

pauseBtn.addEventListener("click", () => {
  running = false;
  clearTimeout(interval);
  text.textContent = "Paused";
});

resetBtn.addEventListener("click", () => {
  running = false;
  clearTimeout(interval);
  text.textContent = "Ready";
  circle.style.transform = "scale(1)";
});
