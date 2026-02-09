(() => {
  const startBtn = document.getElementById("startDistraction");
  const answeredCountEl = document.getElementById("answeredCount");

  const questionCard = document.getElementById("questionCard");
  const questionTitle = document.getElementById("questionTitle");
  const questionText = document.getElementById("questionText");

  const answerBox = document.getElementById("answerBox");
  const submitAnswer = document.getElementById("submitAnswer");
  const skipQuestion = document.getElementById("skipQuestion");
  const endBtn = document.getElementById("endDistraction");

  // Simple set of gentle prompts (edit/add freely)
  const QUESTIONS = [
    "What is the smallest next step you can take in the next 2 minutes?",
    "What would you say to a friend who felt like this?",
    "Name 3 things you can see right now.",
    "What is one thing you can do to make your body a little more comfortable?",
    "What’s one helpful thought that feels believable (not perfect — just kinder)?",
    "What is one thing that can wait until tomorrow?",
    "What is one thing you’ve already handled before that proves you can cope?",
    "If this feeling had a colour or shape, what would it be?",
    "What would “good enough” look like right now?"
  ];

  let idx = 0;
  let answered = 0;

  function updateAnswered() {
    answeredCountEl.textContent = String(answered);
  }

  function showQuestion() {
    questionCard.style.display = "";
    questionTitle.textContent = `Question ${idx + 1}`;
    questionText.textContent = QUESTIONS[idx];
    answerBox.value = "";
    answerBox.focus();
  }

  function nextQuestion(countAnswer) {
    if (countAnswer) answered += 1;
    updateAnswered();

    idx += 1;
    if (idx >= QUESTIONS.length) {
      finish();
      return;
    }
    showQuestion();
  }

  function finish() {
    questionTitle.textContent = "Done";
    questionText.textContent = "Nice work. You showed up for yourself.";
    answerBox.style.display = "none";
    submitAnswer.style.display = "none";
    skipQuestion.style.display = "none";
    endBtn.textContent = "Close";
  }

  startBtn.addEventListener("click", () => {
    idx = 0;
    answered = 0;
    updateAnswered();

    // reset UI
    answerBox.style.display = "";
    submitAnswer.style.display = "";
    skipQuestion.style.display = "";
    endBtn.textContent = "Finish";

    showQuestion();
  });

  submitAnswer.addEventListener("click", () => {
    const hasText = (answerBox.value || "").trim().length > 0;
    if (!hasText) {
      // If empty, treat as skip (matches your rule)
      nextQuestion(false);
      return;
    }
    nextQuestion(true);
  });

  skipQuestion.addEventListener("click", () => nextQuestion(false));

  endBtn.addEventListener("click", () => {
    // If already finished, just hide the card
    if (questionTitle.textContent === "Done") {
      questionCard.style.display = "none";
      return;
    }
    finish();
  });

  updateAnswered();
})();
