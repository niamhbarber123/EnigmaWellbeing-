(() => {
  const quotesList = document.getElementById("quotesList");
  const savedCountEl = document.getElementById("savedCount");
  const queryEl = document.getElementById("quoteQuery");
  const resultsTitle = document.getElementById("resultsTitle");

  const searchBtn = document.getElementById("searchBtn");
  const randomBtn = document.getElementById("randomBtn");
  const showSavedBtn = document.getElementById("showSavedBtn");
  const deleteSavedBtn = document.getElementById("deleteSavedBtn");

  const SAVED_KEY = "enigma_saved_quotes_v1";

  function getSavedQuotes() {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; }
    catch { return []; }
  }

  function setSavedQuotes(arr) {
    localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
    updateSavedCount();
  }

  function updateSavedCount() {
    savedCountEl.textContent = String(getSavedQuotes().length);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  // ✅ Bigger set (short, calming, practical)
  const QUOTES = [
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
    { text: "You do not have to see the whole staircase—just take the first step.", author: "Martin Luther King Jr." },
    { text: "Breathe. This is just a moment. Not your whole life.", author: "Unknown" },
    { text: "Feelings are visitors. Let them come and go.", author: "Mooji" },
    { text: "Nothing is permanent in this world, not even our troubles.", author: "Charlie Chaplin" },
    { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" },
    { text: "Small steps still move you forward.", author: "Unknown" },
    { text: "Your calm is your power.", author: "Unknown" },
    { text: "Do the next right thing.", author: "Unknown" },
    { text: "You can’t calm the storm, so stop trying. What you can do is calm yourself.", author: "Timber Hawkeye" },
    { text: "Be gentle with yourself. You’re doing the best you can.", author: "Unknown" },
    { text: "If you get tired, learn to rest, not to quit.", author: "Banksy (attributed)" },
    { text: "This too shall pass.", author: "Persian proverb" },
    { text: "Keep going. Everything you need will come to you at the perfect time.", author: "Unknown" },
    { text: "You are not your thoughts.", author: "Unknown" },
    { text: "Talk to yourself like someone you love.", author: "Brené Brown (paraphrased)" },
    { text: "The struggle ends when gratitude begins.", author: "Neale Donald Walsch" },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "When you can’t control what’s happening, control the way you respond.", author: "Unknown" },
    { text: "Make peace with the pace of your healing.", author: "Unknown" },
    { text: "You’ve survived 100% of your hardest days.", author: "Unknown" },
    { text: "Let your breath anchor you.", author: "Unknown" },
    { text: "Wherever you are, be there totally.", author: "Eckhart Tolle" },
    { text: "Your mind will believe what you tell it. Feed it hope.", author: "Unknown" },
    { text: "Sometimes the bravest thing is to rest.", author: "Unknown" },
    { text: "Be where your feet are.", author: "Unknown" },
    { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
    { text: "You are not behind. You are on your own path.", author: "Unknown" },
    { text: "One day at a time.", author: "Unknown" },
    { text: "Courage doesn’t always roar.", author: "Mary Anne Radmacher" },
    { text: "It’s okay to have a bad day. It’s not okay to give up.", author: "Unknown" },
    { text: "Let go of what you can’t control.", author: "Unknown" },
    { text: "Keep your face always toward the sunshine.", author: "Walt Whitman" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" }
  ];

  // UI state
  let showingSaved = false;

  function isSaved(q) {
    const saved = getSavedQuotes();
    return saved.some(x => x.text === q.text && x.author === q.author);
  }

  function saveQuote(q) {
    const saved = getSavedQuotes();
    const exists = saved.some(x => x.text === q.text && x.author === q.author);
    if (!exists) {
      saved.push(q);
      setSavedQuotes(saved);
    }
  }

  function removeSaved(q) {
    const saved = getSavedQuotes().filter(x => !(x.text === q.text && x.author === q.author));
    setSavedQuotes(saved);
  }

  function renderQuotes(list) {
    quotesList.innerHTML = "";

    if (!list.length) {
      quotesList.innerHTML = `<div class="gentle-text">No quotes found.</div>`;
      return;
    }

    list.forEach(q => {
      const card = document.createElement("div");
      card.className = "card quote-tile";
      card.style.marginTop = "12px";

      const text = document.createElement("p");
      text.className = "quote-text";
      text.innerHTML = `“${escapeHtml(q.text)}”`;

      const author = document.createElement("div");
      author.className = "quote-author";
      author.textContent = `— ${q.author}`;

      const actions = document.createElement("div");
      actions.className = "quote-actions";

      const savedNow = isSaved(q);

      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "save-link";
      saveBtn.innerHTML = `<span class="heart">💜</span>${savedNow ? "Saved" : "Save"}`;

      saveBtn.addEventListener("click", () => {
        if (isSaved(q)) {
          removeSaved(q);
        } else {
          saveQuote(q);
        }
        // refresh current view
        if (showingSaved) {
          renderSaved();
        } else {
          renderQuotes(list);
        }
      });

      actions.appendChild(saveBtn);
      card.appendChild(text);
      card.appendChild(author);
      card.appendChild(actions);

      quotesList.appendChild(card);
    });
  }

  function renderTodayPicks() {
    showingSaved = false;
    showSavedBtn.textContent = "Show saved";
    resultsTitle.textContent = "Today’s picks";

    // pick 6 random without duplicates
    const shuffled = [...QUOTES].sort(() => Math.random() - 0.5);
    renderQuotes(shuffled.slice(0, 6));
  }

  function renderSaved() {
    showingSaved = true;
    showSavedBtn.textContent = "Show all";
    resultsTitle.textContent = "Saved quotes";
    renderQuotes(getSavedQuotes());
  }

  // Search
  searchBtn.addEventListener("click", () => {
    const q = (queryEl.value || "").trim().toLowerCase();
    showingSaved = false;
    showSavedBtn.textContent = "Show saved";
    resultsTitle.textContent = q ? "Search results" : "Today’s picks";

    if (!q) return renderTodayPicks();

    const filtered = QUOTES.filter(item =>
      item.text.toLowerCase().includes(q) || item.author.toLowerCase().includes(q)
    );

    renderQuotes(filtered);
  });

  // Random single
  randomBtn.addEventListener("click", () => {
    showingSaved = false;
    showSavedBtn.textContent = "Show saved";
    resultsTitle.textContent = "Random";
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    renderQuotes([random]);
  });

  // Toggle saved
  showSavedBtn.addEventListener("click", () => {
    if (showingSaved) renderTodayPicks();
    else renderSaved();
  });

  // Delete saved
  deleteSavedBtn.addEventListener("click", () => {
    setSavedQuotes([]);
    if (showingSaved) renderSaved();
  });

  // Enter key triggers search
  queryEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn.click();
  });

  // init
  updateSavedCount();
  renderTodayPicks();
})();
