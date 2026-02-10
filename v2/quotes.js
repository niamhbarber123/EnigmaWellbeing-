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
    if (savedCountEl) savedCountEl.textContent = String(arr.length);
  }

  function updateSavedCount() {
    if (!savedCountEl) return;
    savedCountEl.textContent = String(getSavedQuotes().length);
  }

  function todayKey(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  // =========================
  // LOTS MORE QUOTES
  // (non-lyrical, grounding)
  // =========================
  const QUOTES = [
    // --- Core classics / well-known ---
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "You do not have to see the whole staircase—just take the first step.", author: "Martin Luther King Jr." },
    { text: "Almost everything will work again if you unplug it for a few minutes… including you.", author: "Anne Lamott" },
    { text: "Do what you can, with what you’ve got, where you are.", author: "Theodore Roosevelt" },
    { text: "If it’s mentionable, it’s manageable.", author: "Fred Rogers" },
    { text: "The present moment is the only time over which we have dominion.", author: "Thích Nhất Hạnh" },
    { text: "No mud, no lotus.", author: "Thích Nhất Hạnh" },
    { text: "Between stimulus and response there is a space.", author: "Viktor E. Frankl" },
    { text: "When we are no longer able to change a situation, we are challenged to change ourselves.", author: "Viktor E. Frankl" },
    { text: "You are not a drop in the ocean. You are the entire ocean in a drop.", author: "Rumi (attributed)" },
    { text: "Feelings are visitors. Let them come and go.", author: "Rumi (attributed)" },
    { text: "Be patient with all that is unresolved in your heart.", author: "Rainer Maria Rilke" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "The wound is the place where the light enters you.", author: "Rumi (attributed)" },
    { text: "If you are going through hell, keep going.", author: "Winston Churchill (attributed)" },
    { text: "We can do hard things.", author: "Glennon Doyle" },
    { text: "Courage doesn’t always roar.", author: "Mary Anne Radmacher" },
    { text: "This too shall pass.", author: "Proverb" },
    { text: "Little by little, a little becomes a lot.", author: "Tanzanian proverb" },

    // --- Practical grounding / mental health-friendly ---
    { text: "You don’t have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { text: "Do not believe everything you think.", author: "Unknown" },
    { text: "Name it to tame it.", author: "Dan Siegel (popularized)" },
    { text: "One thing at a time.", author: "Unknown" },
    { text: "Right now is enough.", author: "Unknown" },
    { text: "Breathe. You’re going to be okay.", author: "Unknown" },
    { text: "Small steps count.", author: "Unknown" },
    { text: "Your pace is still a pace.", author: "Unknown" },
    { text: "Your best looks different every day.", author: "Unknown" },
    { text: "This is hard, and you’re doing it anyway.", author: "Unknown" },
    { text: "If you can do it for one minute, you can do it for the next.", author: "Unknown" },
    { text: "You can start again at any time.", author: "Unknown" },
    { text: "Be where your feet are.", author: "Unknown" },
    { text: "You are allowed to take up space.", author: "Unknown" },
    { text: "Rest is productive.", author: "Unknown" },
    { text: "You have survived 100% of your worst days.", author: "Unknown" },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "Gentle is still strong.", author: "Unknown" },
    { text: "A calm mind is a superpower.", author: "Unknown" },
    { text: "You are not behind.", author: "Unknown" },
    { text: "Your feelings are valid, and they are not forever.", author: "Unknown" },
    { text: "Even a pause is progress.", author: "Unknown" },
    { text: "You don’t have to do it all—just the next right thing.", author: "Unknown" },
    { text: "Let today be simple.", author: "Unknown" },
    { text: "Make space for what you need.", author: "Unknown" },
    { text: "You can be both a masterpiece and a work in progress.", author: "Unknown" },

    // --- Anxiety / overwhelm specific ---
    { text: "Anxiety is a wave. You can learn to surf it.", author: "Unknown" },
    { text: "The mind makes a good servant but a poor master.", author: "Unknown" },
    { text: "What you feel is information, not instruction.", author: "Unknown" },
    { text: "You don’t have to fight the feeling to move forward.", author: "Unknown" },
    { text: "Slow down to speed up.", author: "Unknown" },
    { text: "Take it breath by breath.", author: "Unknown" },
    { text: "When you feel overwhelmed, reduce the moment.", author: "Unknown" },
    { text: "Find one thing you can do, then do it gently.", author: "Unknown" },
    { text: "Your nervous system is trying to protect you.", author: "Unknown" },
    { text: "You can feel anxious and still be safe.", author: "Unknown" },
    { text: "Thoughts are not facts.", author: "Unknown" },
    { text: "It’s okay to ask for help.", author: "Unknown" },

    // --- Self-compassion / kindness ---
    { text: "Talk to yourself like someone you love.", author: "Brené Brown (paraphrased)" },
    { text: "Be gentle with yourself. You’re doing the best you can.", author: "Unknown" },
    { text: "You deserve the same kindness you give others.", author: "Unknown" },
    { text: "You don’t need to earn rest.", author: "Unknown" },
    { text: "Healing is not linear.", author: "Unknown" },
    { text: "You are learning, not failing.", author: "Unknown" },
    { text: "It’s okay to be a work in progress.", author: "Unknown" },
    { text: "You can hold two truths: this is hard, and you can handle it.", author: "Unknown" },
    { text: "Give yourself permission to be human.", author: "Unknown" },
    { text: "Your worth is not measured by productivity.", author: "Unknown" },
    { text: "You are enough, as you are.", author: "Unknown" },

    // --- Motivation / resilience ---
    { text: "Nothing changes if nothing changes.", author: "Unknown" },
    { text: "Consistency beats intensity.", author: "Unknown" },
    { text: "One small step is still a step.", author: "Unknown" },
    { text: "Sometimes courage is just showing up.", author: "Unknown" },
    { text: "Small steps every day.", author: "Unknown" },
    { text: "You can do hard things.", author: "Unknown" },
    { text: "Begin again.", author: "Unknown" },
    { text: "Not every day is good, but there is good in every day.", author: "Unknown" },
    { text: "Do the next right thing.", author: "Unknown" },
    { text: "Keep it simple.", author: "Unknown" },
    { text: "Your future needs you.", author: "Unknown" },
    { text: "You are growing in ways you cannot yet see.", author: "Unknown" },
    { text: "The smallest step forward is still forward.", author: "Unknown" },
    { text: "You don’t have to be fearless—just willing.", author: "Unknown" },

    // --- Calm / mindfulness ---
    { text: "Let it be.", author: "Unknown" },
    { text: "Return to the breath.", author: "Unknown" },
    { text: "Notice. Breathe. Soften.", author: "Unknown" },
    { text: "The body is a safe place to come home to.", author: "Unknown" },
    { text: "Inhale peace. Exhale tension.", author: "Unknown" },
    { text: "Quiet is medicine.", author: "Unknown" },
    { text: "This moment is yours.", author: "Unknown" },
    { text: "You can come back to yourself.", author: "Unknown" },
    { text: "The pause is powerful.", author: "Unknown" },
    { text: "Less rush. More presence.", author: "Unknown" },
    { text: "You can do this slowly.", author: "Unknown" },

    // --- Boundaries / self-care ---
    { text: "Saying no is a complete sentence.", author: "Unknown" },
    { text: "You can’t pour from an empty cup.", author: "Unknown" },
    { text: "Protect your peace.", author: "Unknown" },
    { text: "You are allowed to rest without guilt.", author: "Unknown" },
    { text: "Choose what chooses you.", author: "Unknown" },
    { text: "You don’t owe anyone your exhaustion.", author: "Unknown" },

    // --- Hope / perspective ---
    { text: "Where there is breath, there is hope.", author: "Unknown" },
    { text: "Hard days are not a hard life.", author: "Unknown" },
    { text: "This chapter is not your whole story.", author: "Unknown" },
    { text: "The sun will rise, and we will try again.", author: "Unknown" },
    { text: "You are not alone.", author: "Unknown" },
    { text: "What is coming is better than what is gone.", author: "Arabic proverb" },
    { text: "Some days you just survive. That is enough.", author: "Unknown" },
    { text: "Hope is a practice.", author: "Unknown" },

    // --- Short “pocket” lines (great for random) ---
    { text: "Softly does it.", author: "Unknown" },
    { text: "One breath at a time.", author: "Unknown" },
    { text: "Not now.", author: "Unknown" },
    { text: "Try again tomorrow.", author: "Unknown" },
    { text: "Stay with the moment.", author: "Unknown" },
    { text: "You’re doing better than you think.", author: "Unknown" },
    { text: "Keep going gently.", author: "Unknown" },
    { text: "Make it smaller.", author: "Unknown" },
    { text: "You can handle this moment.", author: "Unknown" },
    { text: "Feel it. Name it. Breathe.", author: "Unknown" },

    // --- Extra big set (more variety) ---
    { text: "You don’t need to have it all figured out to take the next step.", author: "Unknown" },
    { text: "Sometimes the most productive thing you can do is rest.", author: "Unknown" },
    { text: "Focus on what you can control.", author: "Unknown" },
    { text: "Take the pressure off.", author: "Unknown" },
    { text: "Be kind to the person you are becoming.", author: "Unknown" },
    { text: "You’re allowed to slow down.", author: "Unknown" },
    { text: "You can feel a feeling without acting on it.", author: "Unknown" },
    { text: "Let your breath anchor you.", author: "Unknown" },
    { text: "It’s okay to pause.", author: "Unknown" },
    { text: "Try a softer approach.", author: "Unknown" },
    { text: "You don’t need to do it perfectly to do it well.", author: "Unknown" },
    { text: "You are more than what you produce.", author: "Unknown" },
    { text: "The goal is not to be calm all the time—the goal is to return.", author: "Unknown" },
    { text: "You can begin again without shame.", author: "Unknown" },
    { text: "Your needs matter.", author: "Unknown" },
    { text: "You can ask for support and still be strong.", author: "Unknown" },
    { text: "Not everything needs a reaction.", author: "Unknown" },
    { text: "It’s a bad moment, not a bad life.", author: "Unknown" },
    { text: "Let the day be what it is.", author: "Unknown" },
    { text: "You have time.", author: "Unknown" },
    { text: "You are allowed to be new at things.", author: "Unknown" },
    { text: "Choose peace over performance.", author: "Unknown" },
    { text: "You don’t have to earn care.", author: "Unknown" },
    { text: "Your presence is enough.", author: "Unknown" },
    { text: "Make room for joy, even small.", author: "Unknown" },
    { text: "You are doing your best with what you know today.", author: "Unknown" },
    { text: "Your breath is always with you.", author: "Unknown" },
    { text: "When in doubt, return to basics: water, food, rest.", author: "Unknown" },
    { text: "Give yourself grace.", author: "Unknown" },
    { text: "Your brain is trying to help. Thank it, then choose again.", author: "Unknown" },
    { text: "You can take breaks and still make progress.", author: "Unknown" },
    { text: "Your life does not need to look like anyone else’s.", author: "Unknown" },
    { text: "You’re allowed to take it slow.", author: "Unknown" },
    { text: "This is a season. Seasons change.", author: "Unknown" },
    { text: "Let yourself be supported.", author: "Unknown" },
    { text: "Your body deserves gentleness.", author: "Unknown" },
    { text: "You can choose a calmer thought.", author: "Unknown" },
    { text: "Try: 'What would I say to a friend?'", author: "Unknown" },
    { text: "You are learning how to live with a sensitive nervous system.", author: "Unknown" },
    { text: "Even if you do nothing else, breathe.", author: "Unknown" },
    { text: "You don’t have to do it alone.", author: "Unknown" },
    { text: "It’s okay to need reassurance.", author: "Unknown" },
    { text: "The next step can be tiny.", author: "Unknown" },
    { text: "You can carry this gently.", author: "Unknown" },
    { text: "There is no rush.", author: "Unknown" },
    { text: "You can release what is not yours to carry.", author: "Unknown" },
    { text: "Let the breath soften your shoulders.", author: "Unknown" },
    { text: "Be curious, not judgmental.", author: "Unknown" },
    { text: "Peace is a practice.", author: "Unknown" },
    { text: "You are allowed to protect your energy.", author: "Unknown" },
    { text: "You can do one thing.", author: "Unknown" },
    { text: "Today, choose what supports you.", author: "Unknown" },
    { text: "It’s okay to feel messy and still move forward.", author: "Unknown" },
    { text: "Your softness is not a weakness.", author: "Unknown" },
    { text: "You belong here.", author: "Unknown" },
    { text: "This moment is survivable.", author: "Unknown" },
    { text: "You can reset.", author: "Unknown" },
    { text: "You can start small.", author: "Unknown" },
    { text: "Nothing needs to be solved right now.", author: "Unknown" },
    { text: "You are safe in this breath.", author: "Unknown" },
    { text: "Let go of the 'shoulds.'", author: "Unknown" },
    { text: "Focus on the next five minutes.", author: "Unknown" },
    { text: "Keep your world gentle today.", author: "Unknown" },
    { text: "You can be scared and still be brave.", author: "Unknown" },
    { text: "Be proud of how far you’ve come.", author: "Unknown" }
  ];

  // Optional: de-dupe (in case you add more later)
  function dedupeQuotes(list) {
    const seen = new Set();
    const out = [];
    for (const q of list) {
      const key = `${q.text}|||${q.author}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(q);
    }
    return out;
  }
  const QUOTES_UNIQ = dedupeQuotes(QUOTES);

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
    const idx = Math.abs(hash) % QUOTES_UNIQ.length;

    const chosen = QUOTES_UNIQ[idx];
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

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "save-link";

    function isSaved() {
      return getSavedQuotes().some(
        x => x.text === q.text && x.author === q.author
      );
    }

    function updateButton() {
      if (isSaved()) {
        btn.innerHTML = `<span class="heart">🤍</span> Unsave`;
      } else {
        btn.innerHTML = `<span class="heart">💜</span> Save`;
      }
    }

    btn.addEventListener("click", () => {
      let saved = getSavedQuotes();

      if (isSaved()) {
        saved = saved.filter(
          x => !(x.text === q.text && x.author === q.author)
        );
      } else {
        saved.push(q);
      }

      setSavedQuotes(saved);
      updateButton();
    });

    updateButton();
    actions.appendChild(btn);
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
    if (!quotesList) return;
    quotesList.innerHTML = "";
    quotes.forEach(q => quotesList.appendChild(renderQuoteTile(q, { showSave: true })));
  }

  function renderSaved() {
    if (!quotesList) return;
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

  // ===== Events (guard if missing buttons) =====
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const q = (queryEl?.value || "").trim().toLowerCase();
      if (!q) {
        renderQuotes(QUOTES_UNIQ);
        return;
      }
      const filtered = QUOTES_UNIQ.filter(item =>
        item.text.toLowerCase().includes(q) || item.author.toLowerCase().includes(q)
      );
      renderQuotes(filtered);
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const random = QUOTES_UNIQ[Math.floor(Math.random() * QUOTES_UNIQ.length)];
      renderQuotes([random]);
    });
  }

  if (showSavedBtn) showSavedBtn.addEventListener("click", renderSaved);

  if (deleteSavedBtn) {
    deleteSavedBtn.addEventListener("click", () => {
      setSavedQuotes([]);
      renderQuotes(QUOTES_UNIQ);
    });
  }

  // Init
  updateSavedCount();
  renderDaily();
  renderQuotes(QUOTES_UNIQ);
})();
