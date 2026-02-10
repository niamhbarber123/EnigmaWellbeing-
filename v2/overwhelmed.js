(() => {
  const steps = document.querySelectorAll(".step");
  let current = 0;
  let chosenFeeling = "";

  const validations = {
    "😰 Anxious": "Feeling anxious can be really frightening. You’re not weak for feeling this way.",
    "😵 Overstimulated": "Too much at once can overwhelm anyone. It makes sense that you feel like this.",
    "💥 Panicky": "Panic can feel intense and sudden. You’re not in danger right now.",
    "😶 Numb": "Feeling numb is often a sign you’ve been carrying too much.",
    "😢 Tearful": "Tears are a release. It’s okay to let them come.",
    "😡 Angry": "Anger often shows that something important matters to you."
  };

  function showStep(i) {
    steps.forEach(s => s.classList.remove("active"));
    steps[i].classList.add("active");
    current = i;
  }

  // Continue buttons
  document.querySelectorAll("[data-next]").forEach(btn => {
    btn.addEventListener("click", () => showStep(current + 1));
  });

  // Feeling selection
  document.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      chosenFeeling = btn.textContent.trim();
      document.getElementById("validationText").textContent =
        validations[chosenFeeling] || "That makes sense. You’re not alone in this.";
      showStep(2);
    });
  });

  // Grounding buttons
  document.querySelectorAll(".ground-btn").forEach(btn => {
    btn.addEventListener("click", () => showStep(4));
  });

  // Init
  showStep(0);
})();
