const circle = document.getElementById("breathCircle");
const label = document.getElementById("breathLabel");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const completedPill = document.getElementById("completedPill");

let running = false;
let timer = null;

function inhale(){
  if(!running) return;
  label.textContent = "Inhale";
  circle.classList.remove("exhale");
  circle.classList.add("inhale");

  timer = setTimeout(exhale, 4000);
}

function exhale(){
  if(!running) return;
  label.textContent = "Exhale";
  circle.classList.remove("inhale");
  circle.classList.add("exhale");

  timer = setTimeout(inhale, 6000);
}

startBtn.addEventListener("click", () => {
  if(running) return;
  running = true;
  completedPill.style.display = "none";
  inhale();
});

stopBtn.addEventListener("click", () => {
  running = false;
  clearTimeout(timer);
  circle.classList.remove("inhale", "exhale");
  label.textContent = "Completed";
  completedPill.style.display = "inline-flex";
});
