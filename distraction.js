(() => {
  const startBtn = document.getElementById("startDistraction");
  const introCard = document.getElementById("introCard");

  const card = document.getElementById("questionCard");
  const titleEl = document.getElementById("questionTitle");
  const textEl = document.getElementById("questionText");
  const answerBox = document.getElementById("answerBox");

  const nextBtn = document.getElementById("submitAnswer");
  const skipBtn = document.getElementById("skipQuestion");
  const endBtn = document.getElementById("endDistraction");

  const count1 = document.getElementById("answeredCount");
  const count2 = document.getElementById("answeredCount2");

  if (!startBtn || !introCard || !card || !titleEl || !textEl || !answerBox || !nextBtn || !skipBtn || !endBtn) return;

  const KEY = "enigma_distraction_answered_v1";

  const QUESTIONS = [
    { t: "Grounding", q: "Name 3 things you can see right now." },
    { t: "Body", q: "Where do you feel tension? What could soften by 1%?" },
    { t: "Breath", q: "Take one slow breath in… and out. What do you notice?" },
    { t: "Reality check", q: "What’s a fact right now (not a fear)?" },
    { t: "Kindness", q: "If a friend felt this way, what would you say to them?" },
    { t: "Next step", q: "What is one tiny next step you can do in the next 5 minutes?" },
    { t: "Permission", q: "What are you allowed to let go of for today?" },
    { t: "Support", q: "Who could you message — even just to say “hi”?" },
    { t: "Safety", q: "What helps you feel 1% safer or calmer?" },
    { t: "Time", q: "Will this matter in a week? If not, what matters today?" }
  ];

  let idx = 0;
  let answered = 0;

  function loadAnswered() {
    try { return Number(localStorage.getItem(KEY) || "0"); }
    catch { return 0; }
  }
  function saveAnswered(n) {
    try { localStorage.setItem(KEY, String(n)); } catch {}
  }

  function setCounts() {
    if (count1) count1.textContent = String(answered);
    if (count2) count2.textContent = String(answered);
  }

  function showQuestion() {
    const item = QUESTIONS[idx % QUESTIONS.length];
    titleEl.textContent = item.t;
    textEl.textContent = item.q;
    answerBox.value = "";
    answerBox.focus();
    setCounts();
  }

  function start() {
    introCard.style.display = "none";
    card.style.display = "";
    idx = 0;
    answered = 0;
    showQuestion();
  }

  function next(countIt) {
    const txt = (answerBox.value || "").trim();
    if (countIt && txt.length) {
      answered += 1;
      saveAnswered(loadAnswered() + 1);
    }
    idx += 1;
    showQuestion();
  }

  function finish() {
    card.style.display = "none";
    introCard.style.display = "";
    // Keep answered count visible in intro card
    if (count1) count1.textContent = String(answered);
  }

  startBtn.addEventListener("click", start);
  nextBtn.addEventListener("click", () => next(true));
  skipBtn.addEventListener("click", () => next(false));
  endBtn.addEventListener("click", finish);

  // Init
  answered = 0;
  setCounts();
})();
