// =========================
// Quotes logic
// =========================

const quotesList = document.getElementById("quotesList");
const savedCountEl = document.getElementById("savedCount");
const queryEl = document.getElementById("quoteQuery");

const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const deleteSavedBtn = document.getElementById("deleteSavedBtn");

const SAVED_KEY = "enigma_saved_quotes";

function getSavedQuotes() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch {
    return [];
  }
}

function setSavedQuotes(arr) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
  savedCountEl.textContent = String(arr.length);
}

function updateSavedCount() {
  savedCountEl.textContent = String(getSavedQuotes().length);
}

updateSavedCount();

// ✅ More quotes (short, safe, calming)
const DEMO_QUOTES = [
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "You do not have to see the whole staircase—just take the first step.", author: "Martin Luther King Jr." },
  { text: "Slow is smooth. Smooth is fast.", author: "Proverb" },
  { text: "Your breath is an anchor you can return to.", author: "Unknown" },
  { text: "Do one thing. Then the next.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "Feelings are visitors. Let them come and go.", author: "Rumi (attributed)" },
  { text: "You have survived 100% of your hardest days.", author: "Unknown" },
  { text: "Small steps still move you forward.", author: "Unknown" },
  { text: "Rest is productive.", author: "Unknown" },
  { text: "Be where your feet are.", author: "Unknown" },
  { text: "If it’s worth doing, it’s worth doing gently.", author: "Unknown" },
  { text: "This is hard — and you can do hard things.", author: "Unknown" },
  { text: "You can begin again, as many times as you need.", author: "Unknown" }
];

function renderQuotes(quotes) {
  quotesList.innerHTML = "";

  quotes.forEach((q) => {
    const tile = document.createElement("article");
    tile.className = "quote-item";

    const p = document.createElement("p");
    p.className = "quote-text";
    p.textContent = `“${q.text}”`;

    const author = document.createElement("div");
    author.className = "quote-author";
    author.textContent = `— ${q.author}`;

    const saveBtn = document.createElement("button");
    saveBtn.className = "quote-save";
    saveBtn.type = "button";
    saveBtn.innerHTML = `<span class="heart">💜</span> Save`;

    saveBtn.addEventListener("click", () => {
      const saved = getSavedQuotes();
      const exists = saved.some(x => x.text === q.text && x.author === q.author);
      if (!exists) {
        saved.push(q);
        setSavedQuotes(saved);
      }
    });

    tile.appendChild(p);
    tile.appendChild(author);
    tile.appendChild(saveBtn);

    quotesList.appendChild(tile);
  });
}

searchBtn.addEventListener("click", () => {
  const q = (queryEl.value || "").trim().toLowerCase();
  if (!q) {
    renderQuotes(DEMO_QUOTES);
    return;
  }
  const filtered = DEMO_QUOTES.filter(item =>
    item.text.toLowerCase().includes(q) || item.author.toLowerCase().includes(q)
  );
  renderQuotes(filtered);
});

randomBtn.addEventListener("click", () => {
  const random = DEMO_QUOTES[Math.floor(Math.random() * DEMO_QUOTES.length)];
  renderQuotes([random]);
});

deleteSavedBtn.addEventListener("click", () => {
  setSavedQuotes([]);
});

// initial
renderQuotes(DEMO_QUOTES);
