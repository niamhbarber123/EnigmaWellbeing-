(() => {
  const KEY = "enigma_checkins_v1";

  const qEl = document.getElementById("checkinQuestion");
  const noteEl = document.getElementById("checkinNote");
  const saveBtn = document.getElementById("saveCheckin");
  const newBtn = document.getElementById("newQuestion");
  const statusEl = document.getElementById("checkinStatus");

  if (!qEl || !noteEl || !saveBtn || !newBtn || !statusEl) return;

  const QUESTIONS = [
    "What feels heavy today?",
    "What do you need more of right now?",
    "What’s one thing that’s taking up space in your mind?",
    "What would feel slightly kinder for you today?",
    "Is there one small thing you can let go of for now?",
    "What are you carrying that isn’t yours to carry alone?",
    "What would help you feel 1% safer right now?",
    "If a friend felt this way, what would you say to them?"
  ];

  function pickQuestion() {
    qEl.textContent = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  saveBtn.addEventListener("click", () => {
    const entry = {
      at: Date.now(),
      question: qEl.textContent || "",
      note: noteEl.value || ""
    };
    const arr = load();
    arr.unshift(entry);
    save(arr);

    statusEl.textContent = "Saved ✅";
    window.enigmaTrack && window.enigmaTrack("checkin_saved");
  });

  newBtn.addEventListener("click", () => {
    pickQuestion();
    statusEl.textContent = "";
  });

  pickQuestion();
})();
