(() => {
  const quotesList = document.getElementById("quotesList");
  const savedCountEl = document.getElementById("savedCount");
  const queryEl = document.getElementById("quoteQuery");

  const searchBtn = document.getElementById("searchBtn");
  const randomBtn = document.getElementById("randomBtn");
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

  updateSavedCount();

  const QUOTES = [
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "You do not have to see the whole staircase—just take the first step.", author: "Martin Luther King Jr." },
    { text: "Between stimulus and response, there is a space. In that space is our power to choose our response.", author: "Viktor E. Frankl" },
    { text: "This too shall pass.", author: "Persian proverb" },
    { text: "Do one thing, then the next.", author: "Unknown" },
    { text: "Breathe. You’re going to be okay.", author: "Unknown" },
    { text: "Feelings are visitors. Let them come and go.", author: "Rumi" },
    { text: "You can’t stop the waves, but you can learn to surf.", author: "Jon Kabat-Zinn" },
    { text: "Small steps still move you forward.", author: "Unknown" },
    { text: "When you can’t control what’s happening, control the way you respond.", author: "Unknown" }
  ];

  function renderQuotes(list) {
    quotesList.innerHTML = "";

    list.forEach((q) => {
      const tile = document.createElement("article");
      tile.className = "card quote-tile";

      tile.innerHTML = `
        <p class="quote-text">“${escapeHtml(q.text)}”</p>
        <div class="quote-author">— ${escapeHtml(q.author)}</div>
        <div class="quote-actions">
          <button class="save-link" type="button"><span class="heart">💜</span> Save</button>
        </div>
      `;

      const btn = tile.querySelector(".save-link");
      btn.addEventListener("click", () => {
        const saved = getSavedQuotes();
        const exists = saved.some(x => x.text === q.text && x.author === q.author);
        if (!exists) {
          saved.push(q);
          setSavedQuotes(saved);
        }
      });

      quotesList.appendChild(tile);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  searchBtn.addEventListener("click", () => {
    const q = (queryEl.value || "").trim().toLowerCase();
    if (!q) return renderQuotes(QUOTES);

    const filtered = QUOTES.filter(item =>
      item.text.toLowerCase().includes(q) || item.author.toLowerCase().includes(q)
    );
    renderQuotes(filtered);
  });

  randomBtn.addEventListener("click", () => {
    const one = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    renderQuotes([one]);
  });

  deleteSavedBtn.addEventListener("click", () => {
    setSavedQuotes([]);
  });

  renderQuotes(QUOTES);
})();
