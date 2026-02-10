(() => {
  const stepEl = document.getElementById("calmStep");
  const hintEl = document.getElementById("calmHint");
  const nextBtn = document.getElementById("nextStep");
  const restartBtn = document.getElementById("restartSteps");
  if (!stepEl || !hintEl || !nextBtn || !restartBtn) return;

  const STEPS = [
    { step: "Put both feet on the floor. Press your toes down gently.", hint: "Notice one thing you can see." },
    { step: "Place one hand on your chest, one on your belly.", hint: "Feel the rise and fall for 3 breaths." },
    { step: "Name 5 things you can see.", hint: "Take your time. Slow your eyes down." },
    { step: "Name 4 things you can touch.", hint: "Texture, temperature, pressure." },
    { step: "Name 3 things you can hear.", hint: "Near sounds first, then far." },
    { step: "Name 2 things you can smell.", hint: "Or 2 things you like the smell of." },
    { step: "Name 1 thing you can taste.", hint: "Or a taste you’d like right now." },
    { step: "Say to yourself: “This is a moment. It will pass.”", hint: "Speak gently — like you would to a friend." }
  ];

  let i = 0;
  function render(){
    const item = STEPS[i];
    stepEl.textContent = item.step;
    hintEl.textContent = item.hint;
  }

  nextBtn.addEventListener("click", () => {
    i = (i + 1) % STEPS.length;
    render();
  });

  restartBtn.addEventListener("click", () => {
    i = 0;
    render();
  });

  render();
})();
