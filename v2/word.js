(() => {
  const WORD_KEY = "enigma_word_of_day_v1";
  const SAVED_KEY = "enigma_saved_words_v1";

  const titleEl = document.getElementById("wordTitle");
  const subEl = document.getElementById("wordSub");
  const newBtn = document.getElementById("newWordBtn");
  const saveBtn = document.getElementById("saveWordBtn");
  const msgEl = document.getElementById("savedMsg");

  const WORDS = [
    { word: "Calm",     line: "I can soften my breath and return to the present." },
    { word: "Steady",   line: "I can take one small step, and then another." },
    { word: "Safe",     line: "In this moment, I am okay. I can seek support." },
    { word: "Gentle",   line: "I can treat myself like someone I care about." },
    { word: "Brave",    line: "I can feel fear and still choose what helps me." },
    { word: "Enough",   line: "I do not have to earn rest. I am already enough." },
    { word: "Grounded", line: "I can notice what I see, hear, feel, and come back." },
    { word: "Hope",     line: "This feeling will shift. I can ride the wave." }
  ];

  function todayStamp() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }

  function pickWord() {
    const idx = Math.floor(Math.random() * WORDS.length);
    return WORDS[idx];
  }

  function render(w) {
    titleEl.textContent = w.word;
    subEl.textContent = w.line;
  }

  function getSavedWords() {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; }
    catch { return []; }
  }

  function setSavedWords(arr) {
    localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
  }

  function setMessage(text) {
    msgEl.style.display = "block";
    msgEl.textContent = text;
    setTimeout(() => { msgEl.style.display = "none"; }, 1800);
  }

  function loadToday() {
    const raw = localStorage.getItem(WORD_KEY);
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        if (obj && obj.stamp === todayStamp() && obj.word) {
          render(obj.word);
          return;
        }
      } catch {}
    }
    const w = pickWord();
    localStorage.setItem(WORD_KEY, JSON.stringify({ stamp: todayStamp(), word: w }));
    render(w);
  }

  newBtn.addEventListener("click", () => {
    const w = pickWord();
    localStorage.setItem(WORD_KEY, JSON.stringify({ stamp: todayStamp(), word: w }));
    render(w);
    setMessage("New word loaded.");
  });

  saveBtn.addEventListener("click", () => {
    const current = { word: titleEl.textContent, line: subEl.textContent };
    const saved = getSavedWords();
    const exists = saved.some(x => x.word === current.word && x.line === current.line);
    if (!exists) saved.unshift(current);
    setSavedWords(saved);
    setMessage("Saved.");
  });

  loadToday();
})();
