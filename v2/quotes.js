(() => {
  const quotesList = document.getElementById("quotesList");
  const savedCountEl = document.getElementById("savedCount");
  const queryEl = document.getElementById("quoteQuery");
  const dailyEl = document.getElementById("dailyQuote");

  const searchBtn = document.getElementById("searchBtn");
  const randomBtn = document.getElementById("randomBtn");
  const showSavedBtn = document.getElementById("showSavedBtn");
  const deleteSavedBtn = document.getElementById("deleteSavedBtn");

  const SAVED_KEY = "enigma_saved_quotes_v2";

  function getSavedQuotes() {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; }
    catch { return []; }
  }

  function setSavedQuotes(arr) {
    localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
    savedCountEl.textContent = String(arr.length);
  }

  function updateSavedCount() {
    savedCountEl.textContent = String(getSavedQuotes().length);
  }

  function todayKey(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  // Lots more quotes (safe + calm + non-lyrical)
  const QUOTES = [
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "You do not have to see the whole staircase—just take the first step.", author: "Martin Luther King Jr." },
    { text: "Almost everything will work again if you unplug it for a few minutes… including you.", author: "Anne Lamott" },
    { text: "Do what you can, with what you’ve got, where you are.", author: "Theodore Roosevelt" },
    { text: "Slow is smooth, and smooth is fast.", author: "Common saying" },
    { text: "Your mind is a powerful place. Don’t let it become a battleground.", author: "Unknown" },
    { text: "Breathe. You’re going to be okay.", author: "Unknown" },
    { text: "Feelings are visitors. Let them come and go.", author: "Rumi (attributed)" },
    { text: "You can be both a masterpiece and a work in progress.", author: "Unknown" },
    { text: "One small step is still a step.", author: "Unknown" },
    { text: "This is hard, and you’re doing it anyway.", author: "Unknown" },
    { text: "Nothing changes if nothing changes.", author: "Unknown" },
    { text: "Be where your feet are.", author: "Unknown" },
    { text: "You don’t have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { text: "The present moment is the only time over which we have dominion.", author: "Thích Nhất Hạnh" },
    { text: "When you can’t look on the bright side, I will sit with you in the dark.", author: "Unknown" },
    { text: "You are allowed to take up space.", author: "Unknown" },
    { text: "Rest is productive.", author: "Unknown" },
    { text: "If it’s mentionable, it’s manageable.", author: "Fred Rogers" },
    { text: "The time to relax is when you don’t have time for it.", author: "Sydney J. Harris" },
    { text: "You have survived 100% of your worst days.", author: "Unknown" },
    { text: "Little by little, a little becomes a lot.", author: "Tanzanian proverb" },
    { text: "Everything you want is on the other side of consistency.", author: "Unknown" },
    { text: "Do not believe everything you think.", author: "Unknown" },
    { text: "What is coming is better than what is gone.", author: "Arabic proverb" },
    { text: "Your pace is still a pace.", author: "Unknown" },
    { text: "Sometimes courage is just showing up.", author: "Unknown" },
    { text: "Small steps every day.", author: "Unknown" },
    { text: "You can start again at any time.", author: "Unknown" }
  ];

  function pickDailyQuote() {
    const key = "enigma_daily_quote_v1";
    const today = todayKey();

    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      if (stored && stored.day === today && stored.quote) return stored.quote;
    } catch {}

    // deterministic pick using day string
    let hash = 0;
    for (let i = 0; i < today.length; i++) hash = ((hash << 5) - hash) + today.charCodeAt(i);
    const idx = Math.abs(hash) % QUOTES.length;

    const chosen = QUOTES[idx];
    try {
      localStorage.setItem(key, JSON.stringify({ day: today, quote: chosen }));
    } catch {}
    return chosen;
  }

  function renderQuoteTile(q, { showSave = true } = {}) {
    const card = document.createElement("article");
    card.className = "card quote-tile";

    const p = document.createElement("p");
    p.className = "quote-text";
    p.textContent = `“${q.text}”`;

    const author = document.createElement("div");
    author.className = "quote-author";
    author.textContent = `— ${q.author}`;

    card.appendChild(p);
    card.appendChild(author);

    if (showSave) {
      const actions = document.createElement("div");
      actions.style.marginTop = "12px";

      const save = document.createElement("button");
      save.type = "button";
      save.className = "save-link";
      save.innerHTML = `<span class="heart">💜</span> Save`;

      save.addEventListener("click", () => {
        const saved = getSavedQuotes();
        const exists = saved.some(x => x.text === q.text && x.author === q.author);
        if (!exists) {
          saved.push(q);
          setSavedQuotes(saved);
        }
      });

      actions.appendChild(save);
      card.appendChild(actions);
    }

    return card;
  }

  function renderDaily() {
    if (!dailyEl) return;
    dailyEl.innerHTML = "";
    const q = pickDailyQuote();
    dailyEl.appendChild(renderQuoteTile(q, { showSave: true }));
  }

  function renderQuotes(quotes) {
    quotesList.innerHTML = "";
    quotes.forEach(q => quotesList.appendChild(renderQuoteTile(q, { showSave: true })));
  }

  function renderSaved() {
    quotesList.innerHTML = "";
    const saved = getSavedQuotes();

    if (!saved.length) {
      const empty = document.createElement("div");
      empty.className = "card";
      empty.innerHTML = `<div class="section-title">Saved</div><div class="gentle-text" style="margin-top:6px;">No saved quotes yet.</div>`;
      quotesList.appendChild(empty);
      return;
    }

    saved.forEach(q => quotesList.appendChild(renderQuoteTile(q, { showSave: false })));
  }

  // Events
  searchBtn.addEventListener("click", () => {
    const q = (queryEl.value || "").trim().toLowerCase();
    if (!q) {
      renderQuotes(QUOTES);
      return;
    }
    const filtered = QUOTES.filter(item =>
      item.text.toLowerCase().includes(q) || item.author.toLowerCase().includes(q)
    );
    renderQuotes(filtered);
  });

  randomBtn.addEventListener("click", () => {
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    renderQuotes([random]);
  });

  showSavedBtn.addEventListener("click", renderSaved);

  deleteSavedBtn.addEventListener("click", () => {
    setSavedQuotes([]);
    renderQuotes(QUOTES);
  });

  // Init
  updateSavedCount();
  renderDaily();
  renderQuotes(QUOTES);
})();
