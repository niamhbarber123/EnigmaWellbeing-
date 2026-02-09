(() => {
  const searchInput = document.getElementById("quoteSearch");
  const searchBtn = document.getElementById("searchBtn");
  const randomBtn = document.getElementById("randomBtn");
  const listEl = document.getElementById("quotesList");
  const savedCountEl = document.getElementById("savedCount");
  const deleteBtn = document.getElementById("deleteSavedBtn");

  if (!listEl) return;

  /* =========================
     QUOTES DATA
     ========================= */

  const QUOTES = [
    { text: "You don’t have to do everything today.", author: "Unknown" },
    { text: "Slow progress is still progress.", author: "Unknown" },
    { text: "Nothing you feel is wrong.", author: "Unknown" },
    { text: "This feeling will change.", author: "Unknown" },
    { text: "You are allowed to rest.", author: "Unknown" },

    { text: "You are safe in this moment.", author: "Unknown" },
    { text: "Breathe. You’ve survived this before.", author: "Unknown" },
    { text: "One small step is enough.", author: "Unknown" },
    { text: "You don’t need to solve everything right now.", author: "Unknown" },

    { text: "Feelings are visitors. Let them come and go.", author: "Rumi" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },

    { text: "Your nervous system is doing its best to protect you.", author: "Unknown" },
    { text: "Anxiety is uncomfortable, not dangerous.", author: "Claire Weekes" },
    { text: "You can ride this wave.", author: "Unknown" },

    { text: "Healing is not linear.", author: "Unknown" },
    { text: "You are not behind.", author: "Unknown" },
    { text: "Rest is productive.", author: "Unknown" },

    { text: "You don’t need permission to take care of yourself.", author: "Unknown" },
    { text: "Gentle is still strong.", author: "Unknown" },
    { text: "Your pace is valid.", author: "Unknown" },

    { text: "This moment does not define you.", author: "Unknown" },
    { text: "You are learning how to feel safe again.", author: "Unknown" },
    { text: "Be patient with yourself.", author: "Unknown" },

    { text: "You can pause without quitting.", author: "Unknown" },
    { text: "Small steps still move you forward.", author: "Unknown" },
    { text: "You are doing better than you think.", author: "Unknown" },

    { text: "You don’t need to fight your thoughts.", author: "Unknown" },
    { text: "Let your breath anchor you.", author: "Unknown" },
    { text: "This is hard — and you are still here.", author: "Unknown" },

    { text: "You are allowed to feel without fixing.", author: "Unknown" },
    { text: "Nothing is required of you right now.", author: "Unknown" },
    { text: "Calm can return.", author: "Unknown" }
  ];

  /* =========================
     STORAGE
     ========================= */

  const SAVE_KEY = "enigma_saved_quotes_v1";

  function loadSaved() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveSaved(arr) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(arr));
    updateSavedCount();
  }

  function updateSavedCount() {
    savedCountEl.textContent = loadSaved().length;
  }

  /* =========================
     RENDER
     ========================= */

  function render(quotes) {
    listEl.innerHTML = "";

    if (!quotes.length) {
      listEl.innerHTML = `<div class="gentle-text">No quotes found.</div>`;
      return;
    }

    const saved = loadSaved();

    quotes.forEach(q => {
      const card = document.createElement("div");
      card.className = "card quote-tile";

      const isSaved = saved.some(s => s.text === q.text);

      card.innerHTML = `
        <p class="quote-text">“${q.text}”</p>
        <div class="quote-author">— ${q.author}</div>
        <div class="quote-actions">
          <span class="save-link" data-text="${q.text}">
            <span class="heart">${isSaved ? "💜" : "🤍"}</span>
            ${isSaved ? "Saved" : "Save"}
          </span>
        </div>
      `;

      listEl.appendChild(card);
    });

    document.querySelectorAll(".save-link").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.dataset.text;
        let saved = loadSaved();

        if (saved.some(s => s.text === text)) {
          saved = saved.filter(s => s.text !== text);
        } else {
          const q = QUOTES.find(x => x.text === text);
          if (q) saved.push(q);
        }

        saveSaved(saved);
        render(quotes);
      });
    });
  }

  /* =========================
     ACTIONS
     ========================= */

  searchBtn.addEventListener("click", () => {
    const q = searchInput.value.toLowerCase();
    render(
      QUOTES.filter(x =>
        x.text.toLowerCase().includes(q) ||
        x.author.toLowerCase().includes(q)
      )
    );
  });

  randomBtn.addEventListener("click", () => {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    render([q]);
  });

  deleteBtn.addEventListener("click", () => {
    if (!confirm("Delete all saved quotes?")) return;
    saveSaved([]);
    render(QUOTES);
  });

  /* =========================
     INIT
     ========================= */

  updateSavedCount();
  render(QUOTES);
})();
