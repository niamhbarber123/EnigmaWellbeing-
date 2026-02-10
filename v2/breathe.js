const circle = document.getElementById("circle");
const phaseText = document.getElementById("phase");
const clock = document.getElementById("clock");

const modeSelect = document.getElementById("mode");
const lengthSelect = document.getElementById("length");

const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

let timer;
let running = false;
let timeLeft = 60;
let elapsed = 0;

const pace = localStorage.getItem("enigma_breath_pace") || "standard";

const timings = {
  slow: [5, 3, 5],
  standard: [4, 2, 4],
  fast: [3, 1, 3]
};

let [inhale, hold, exhale] = timings[pace];

function updateClock() {
  const t =
    modeSelect.value === "timer" ? timeLeft : elapsed;
  const m = Math.floor(t / 60);
  const s = String(t % 60).padStart(2, "0");
  clock.textContent = `${m}:${s}`;
}

function cycleBreath() {
  phaseText.textContent = "Inhale";
  circle.classList.add("expand");

  setTimeout(() => {
    phaseText.textContent = "Hold";
  }, inhale * 1000);

  setTimeout(() => {
    phaseText.textContent = "Exhale";
    circle.classList.remove("expand");
  }, (inhale + hold) * 1000);
}

startBtn.onclick = () => {
  if (running) return;
  running = true;

  timeLeft = Number(lengthSelect.value);
  elapsed = 0;
  updateClock();

  cycleBreath();
  setInterval(cycleBreath, (inhale + hold + exhale) * 1000);

  timer = setInterval(() => {
    if (modeSelect.value === "timer") {
      timeLeft--;
      if (timeLeft <= 0) resetBtn.click();
    } else {
      elapsed++;
    }
    updateClock();
  }, 1000);
};

pauseBtn.onclick = () => {
  clearInterval(timer);
  running = false;
};

resetBtn.onclick = () => {
  clearInterval(timer);
  running = false;
  phaseText.textContent = "Ready";
  circle.classList.remove("expand");
  updateClock();
};
