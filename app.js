/* =========================================================
   Enigma Wellbeing • app.js (FULL + IMPROVED)
   - Theme (night mode)
   - Back navigation
   - Word of the Day (daily deterministic + home tile + word page)
   - Breathe (smooth inhale/exhale + color changes + bigger centered text)
   - Quotes (motivational list + save + search within app)
   - Music (moods + links + minutes)
   - Yoga (moods + video links)
   - Distraction (random questions + REQUIRED typing to count answered + skip + end)
========================================================= */

(function () {
  "use strict";

  /* =========================
     Helpers
  ========================= */
  function $(id) { return document.getElementById(id); }

  window.enigmaBack = function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  function safeJSONParse(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
  }

  /* =========================
     THEME (Night mode)
  ========================= */
  function applyTheme() {
    const t = localStorage.getItem("enigmaTheme") || "light";
    document.body.classList.toggle("night", t === "night");
  }

  function toggleTheme() {
    const night = document.body.classList.toggle("night");
    localStorage.setItem("enigmaTheme", night ? "night" : "light");
  }

  function initTheme() {
    const btn = $("themeFab");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  /* =========================
     WORD OF THE DAY (Affirmations)
     - deterministic selection per day
     - shows on home tile (#wotdHomeWord)
     - shows on word page (#wotdWordBig, #wotdDescBig)
  ========================= */
  function initWordOfDay() {
    const WORDS = [
      { w: "Forgiveness", d: "I release what weighs me down and allow myself to heal." },
      { w: "Honesty", d: "I speak and live with truth, kindly and clearly." },
      { w: "Trust", d: "I can rely on myself and take one steady step at a time." },
      { w: "Responsibility", d: "I own my choices with care and self-respect." },
      { w: "Flexibility", d: "I can adapt gently when plans change." },
      { w: "Boldness", d: "I show up even when it feels uncomfortable." },
      { w: "Discretion", d: "I choose what to share with wisdom and care." },
      { w: "Discipline", d: "Small consistent actions support my wellbeing." },
      { w: "Detail", d: "I notice what matters without getting stuck in perfection." },
      { w: "Prosperity", d: "I welcome growth, opportunity, and abundance." },
      { w: "Acceptance", d: "I allow this moment to be what it is." },
      { w: "Surrender", d: "I let go of what I cannot control and soften my grip." },
      { w: "Sincerity", d: "I show up with genuine intention." },
      { w: "Serenity", d: "I invite calm into my thoughts and body." },
      { w: "Humility", d: "I learn, listen, and grow with openness." },
      { w: "Sensitivity", d: "My feelings matter; I treat them with kindness." },
      { w: "Compassion", d: "I offer myself warmth and understanding." },
      { w: "Leadership", d: "I guide myself with courage and care." },
      { w: "Integrity", d: "I align my actions with my values." },
      { w: "Action", d: "One small step forward is enough today." },
      { w: "Courage", d: "I can do hard things gently." },
      { w: "Creativity", d: "I let ideas flow without judgement." },
      { w: "Gentleness", d: "Softness is strength." },
      { w: "Clarity", d: "I choose what matters most right now." },
      { w: "Balance", d: "I can hold effort and rest together." },
      { w: "Fun", d: "I allow myself lightness and play." },
      { w: "Commitment", d: "I keep promises to myself in small ways." },
      { w: "Patience", d: "I can take my time; progress is still progress." },
      { w: "Freedom", d: "I release pressure and make room to breathe." },
      { w: "Reflection", d: "I pause to understand and choose wisely." },
      { w: "Giving", d: "I share kindness while also caring for myself." },
      { w: "Enthusiasm", d: "I welcome energy and hope into today." },
      { w: "Joy", d: "I notice small moments of goodness." },
      { w: "Satisfaction", d: "What I do today can be enough." },
      { w: "Grace", d: "I treat myself with softness, even when I slip." },
      { w: "Simplicity", d: "Less can feel lighter and clearer." },
      { w: "Communication", d: "I express my needs with calm honesty." },
      { w: "Appropriateness", d: "I choose what fits this moment with care." },
      { w: "Strength", d: "I am steadier than I feel right now." },
      { w: "Love", d: "I am worthy of love and gentle support." },
      { w: "Tenderness", d: "I can be kind to myself today." },
      { w: "Perseverance", d: "I keep going—slowly, steadily." },
      { w: "Reliability", d: "I can depend on myself, one step at a time." },
      { w: "Initiative", d: "I begin with one small action." },
      { w: "Confidence", d: "I trust my ability to figure things out." },
      { w: "Authenticity", d: "I can be myself without shrinking." },
      { w: "Harmony", d: "I seek peace in my space and choices." },
      { w: "Pleasure", d: "I allow small comforts without guilt." },
      { w: "Risk", d: "I can try, even if it’s not perfect." },
      { w: "Efficiency", d: "I focus on what matters most." },
      { w: "Spontaneity", d: "I can allow unexpected good moments." },
      { w: "Fulfilment", d: "I build a life that feels meaningful to me." }
    ];

    // Deterministic “daily” selection
    function daySeed() {
      const d = new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      let h = 0;
      for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
      return h;
    }

    const idx = daySeed() % WORDS.length;
    const chosen = WORDS[idx];

    const mini = $("wotdHomeWord");
    if (mini) mini.textContent = chosen.w;

    const big = $("wotdWordBig");
    const desc = $("wotdDescBig");
    if (big) big.textContent = chosen.w;
    if (desc) desc.textContent = chosen.d;
  }

  /* =========================
     BREATHE (improved)
     - changes circle color inhale/exhale
     - makes phase text bigger + centered under circle
  ========================= */
  function initBreathe() {
    const page = $("breathePage");
    if (!page) return;

    const circle = $("breatheCircle");
    const phase = $("breathPhase");
    const tip = $("breathTip");
    const start = $("breathStartBtn");
    const stop = $("breathStopBtn");
    const done = $("breathCompleteBtn");

    if (!circle || !phase || !tip || !start || !stop) return;

    // Make phase text bigger & centered under circle (no CSS edit required)
    phase.style.textAlign = "center";
    phase.style.fontSize = "22px";
    phase.style.marginBottom = "10px";
    phase.style.fontWeight = "900";

    // Tip centered too
    tip.style.textAlign = "center";

    let running = false;
    let t1 = null;
    let t2 = null;

    function setText(p, m) {
      phase.textContent = p;
      tip.textContent = m;
    }

    function clearTimers() {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      t1 = t2 = null;
    }

    function setColor(mode) {
      // Use inline gradient so you don't need extra CSS classes
      if (mode === "inhale") {
        circle.style.background = "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.92), rgba(107,79,163,0.80))";
      } else if (mode === "exhale") {
        circle.style.background = "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.92), rgba(46,139,139,0.78))";
      } else {
        circle.style.background = "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.92), rgba(124,96,170,0.65))";
      }
    }

    function reset() {
      clearTimers();
      circle.classList.remove("inhale", "exhale");
      setColor("idle");
      setText("Ready", "Tap Start to begin.");
    }

    function cycle() {
      if (!running) return;

      circle.classList.add("inhale");
      circle.classList.remove("exhale");
      setColor("inhale");
      setText("Breathe in", "Inhale slowly…");

      t1 = setTimeout(() => {
        if (!running) return;

        circle.classList.add("exhale");
        circle.classList.remove("inhale");
        setColor("exhale");
        setText("Breathe out", "Exhale gently…");

        t2 = setTimeout(() => {
          if (!running) return;
          cycle();
        }, 4000);
      }, 4000);
    }

    start.addEventListener("click", (e) => {
      e.preventDefault();
      if (running) return;
      running = true;
      cycle();
    }, { passive: false });

    stop.addEventListener("click", (e) => {
      e.preventDefault();
      running = false;
      reset();
    }, { passive: false });

    if (done) {
      done.addEventListener("click", (e) => {
        e.preventDefault();
        const key = "enigmaBreatheCompletes";
        const obj = safeJSONParse(localStorage.getItem(key) || "{}", {});
        const day = todayKey();
        obj[day] = (obj[day] || 0) + 1;
        localStorage.setItem(key, JSON.stringify(obj));
        done.textContent = "Saved ✅";
        setTimeout(() => done.textContent = "Completed ✅", 1200);
      }, { passive: false });
    }

    reset();
  }

  /* =========================
     QUOTES (motivational + save + search)
     - offline list (fast + reliable)
     - search filters by text/author
  ========================= */
  const QUOTES = [
    { q: "You are capable of amazing things.", a: "Unknown" },
    { q: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" },
    { q: "Courage doesn’t always roar.", a: "Mary Anne Radmacher" },
    { q: "Progress, not perfection.", a: "Unknown" },
    { q: "Your future needs you. Your past doesn’t.", a: "Unknown" },
    { q: "Feelings are visitors. Let them come and go.", a: "Rumi" },
    { q: "Do the best you can until you know better.", a: "Maya Angelou" },
    { q: "You don’t have to see the whole staircase. Just take the first step.", a: "Martin Luther King Jr." },
    { q: "This too shall pass.", a: "Unknown" },
    { q: "Small steps every day.", a: "Unknown" },
    { q: "Breathe. You’re going to be okay.", a: "Unknown" },
    { q: "Keep going. Everything you need will come to you.", a: "Unknown" },
    { q: "Believe you can and you’re halfway there.", a: "Theodore Roosevelt" },
    { q: "The only way out is through.", a: "Robert Frost" },
    { q: "Make peace with your pace.", a: "Unknown" }
  ];

  function initQuotes() {
    const grid = $("quoteGrid");
    if (!grid) return;

    const search = $("quoteSearch");
    const toggleSavedOnlyBtn = $("toggleSavedOnlyBtn");
    const viewSavedBtn = $("viewSavedBtn");
    const clearSavedBtn = $("clearSavedBtn");
    const savedCount = $("savedCount");

    const STORAGE_KEY = "enigmaQuotesSaved";
    let savedOnly = false;

    function getSavedSet() {
      return new Set(safeJSONParse(localStorage.getItem(STORAGE_KEY) || "[]", []));
    }

    function setSavedSet(set) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    }

    function matchesSearch(item, term) {
      if (!term) return true;
      const t = term.toLowerCase();
      return (item.q.toLowerCase().includes(t) || item.a.toLowerCase().includes(t));
    }

    function render() {
      const saved = getSavedSet();
      const term = search ? (search.value || "").trim() : "";

      if (savedCount) savedCount.textContent = String(saved.size);

      grid.innerHTML = "";

      const list = QUOTES
        .filter(it => matchesSearch(it, term))
        .filter(it => !savedOnly || saved.has(it.q));

      if (!list.length) {
        grid.innerHTML = `<div class="gentle-text" style="padding:10px 4px;">No quotes found.</div>`;
        return;
      }

      list.forEach(item => {
        const tile = document.createElement("div");
        const isSaved = saved.has(item.q);
        tile.className = "quote-tile" + (isSaved ? " saved" : "");
        tile.innerHTML = `
          <div style="font-weight:900;color:#5a4b7a; line-height:1.35;">“${item.q}”</div>
          <small>— ${item.a}</small>
          <button class="quote-save-btn ${isSaved ? "saved" : ""}" type="button">
            ${isSaved ? "💜 Saved" : "💜 Save"}
          </button>
        `;

        tile.querySelector("button").addEventListener("click", (e) => {
          e.preventDefault();
          const s = getSavedSet();
          if (s.has(item.q)) s.delete(item.q);
          else s.add(item.q);
          setSavedSet(s);
          render();
        }, { passive: false });

        grid.appendChild(tile);
      });
    }

    if (search) {
      search.addEventListener("input", () => render());
    }

    if (toggleSavedOnlyBtn) {
      toggleSavedOnlyBtn.addEventListener("click", () => {
        savedOnly = !savedOnly;
        toggleSavedOnlyBtn.classList.toggle("active", savedOnly);
        toggleSavedOnlyBtn.textContent = savedOnly ? "Showing saved only" : "Show saved only";
        render();
      });
    }

    if (viewSavedBtn) {
      viewSavedBtn.addEventListener("click", () => {
        savedOnly = true;
        toggleSavedOnlyBtn?.classList.add("active");
        toggleSavedOnlyBtn && (toggleSavedOnlyBtn.textContent = "Showing saved only");
        render();
      });
    }

    if (clearSavedBtn) {
      clearSavedBtn.addEventListener("click", () => {
        if (!confirm("Delete all saved quotes?")) return;
        localStorage.removeItem(STORAGE_KEY);
        render();
      });
    }

    render();
  }

  /* =========================
     MUSIC (moods + links + minutes)
  ========================= */
  const MUSIC_MOODS = ["All", "Anxious", "Stressed", "Focus", "Sleep"];
  const TRACKS = [
    { t: "Calm breathing music", m: "Anxious", u: "https://www.youtube.com/watch?v=odADwWzHR24" },
    { t: "Lo-fi focus mix", m: "Focus", u: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
    { t: "Sleep music", m: "Sleep", u: "https://www.youtube.com/watch?v=DWcJFNfaw9c" },
    { t: "Relaxing piano", m: "Stressed", u: "https://www.youtube.com/watch?v=1ZYbU82GVz4" },
    { t: "Ocean waves", m: "Sleep", u: "https://www.youtube.com/watch?v=eKFTSSKCzWA" }
  ];

  function initMusic() {
    const page = $("musicPage");
    if (!page) return;

    const chipsWrap = $("moodChips");
    const list = $("musicList");
    const minsTodayEl = $("minsToday");
    const minsTotalEl = $("minsTotal");
    const startBtn = $("startListenBtn");
    const endBtn = $("endListenBtn");
    const status = $("listenStatus");

    if (!chipsWrap || !list) return;

    let mood = localStorage.getItem("enigmaMusicMood") || "All";
    let start = null;

    function renderTracks() {
      list.innerHTML = "";
      TRACKS
        .filter(x => mood === "All" || x.m === mood)
        .forEach(x => {
          const a = document.createElement("a");
          a.href = x.u;
          a.target = "_blank";
          a.rel = "noopener";
          a.className = "music-btn";
          a.innerHTML = `<span>${x.t}</span><span>▶</span>`;
          list.appendChild(a);
        });
    }

    function renderChips() {
      chipsWrap.innerHTML = "";
      MUSIC_MOODS.forEach(m => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (m === mood ? " active" : "");
        b.textContent = m;
        b.addEventListener("click", () => {
          mood = m;
          localStorage.setItem("enigmaMusicMood", mood);
          renderChips();
          renderTracks();
        });
        chipsWrap.appendChild(b);
      });
    }

    function loadMinutes() {
      const day = todayKey();
      const store = safeJSONParse(localStorage.getItem("enigmaMusicMinutes") || "{}", {});
      const today = Number(store[day] || 0);
      const total = Object.values(store).reduce((a, v) => a + Number(v || 0), 0);
      if (minsTodayEl) minsTodayEl.textContent = String(today);
      if (minsTotalEl) minsTotalEl.textContent = String(total);
    }

    function saveMinutes(addMins) {
      const day = todayKey();
      const store = safeJSONParse(localStorage.getItem("enigmaMusicMinutes") || "{}", {});
      store[day] = Number(store[day] || 0) + addMins;
      localStorage.setItem("enigmaMusicMinutes", JSON.stringify(store));
    }

    if (startBtn && status) {
      startBtn.addEventListener("click", () => {
        if (start) return;
        start = Date.now();
        status.textContent = "Listening… tap End session when finished.";
      });
    }

    if (endBtn && status) {
      endBtn.addEventListener("click", () => {
        if (!start) return;
        const mins = Math.max(1, Math.round((Date.now() - start) / 60000));
        start = null;
        saveMinutes(mins);
        loadMinutes();
        status.textContent = `Saved ${mins} min ✅`;
        setTimeout(() => status.textContent = "No active session.", 1400);
      });
    }

    renderChips();
    renderTracks();
    loadMinutes();
  }

  /* =========================
     YOGA (moods + video links)
  ========================= */
  const YOGA_MOODS = ["All", "Anxiety", "Stress", "Sleep", "Morning", "Stiff body"];
  const YOGA_VIDEOS = [
    { t: "10 min Yoga for Anxiety", m: "Anxiety", u: "https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
    { t: "15 min Gentle Yoga for Stress", m: "Stress", u: "https://www.youtube.com/results?search_query=15+minute+gentle+yoga+for+stress" },
    { t: "Yoga for Sleep (wind down)", m: "Sleep", u: "https://www.youtube.com/results?search_query=yoga+for+sleep+bedtime" },
    { t: "Morning Yoga (wake up)", m: "Morning", u: "https://www.youtube.com/results?search_query=morning+yoga+10+minutes" },
    { t: "Yoga for stiff back/hips", m: "Stiff body", u: "https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" },
    { t: "Gentle yoga (all levels)", m: "All", u: "https://www.youtube.com/results?search_query=gentle+yoga+all+levels" }
  ];

  function initYoga() {
    const page = $("yogaPage");
    if (!page) return;

    const chipsWrap = $("yogaMoodChips");
    const list = $("yogaVideoList");
    if (!chipsWrap || !list) return;

    let mood = localStorage.getItem("enigmaYogaMood") || "All";

    function render() {
      chipsWrap.innerHTML = "";
      YOGA_MOODS.forEach(m => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (m === mood ? " active" : "");
        b.textContent = m;
        b.addEventListener("click", () => {
          mood = m;
          localStorage.setItem("enigmaYogaMood", mood);
          render();
        });
        chipsWrap.appendChild(b);
      });

      list.innerHTML = "";
      YOGA_VIDEOS
        .filter(x => mood === "All" || x.m === mood || x.m === "All")
        .forEach(x => {
          const a = document.createElement("a");
          a.href = x.u;
          a.target = "_blank";
          a.rel = "noopener";
          a.className = "music-btn";
          a.innerHTML = `<span>${x.t}</span><span>▶</span>`;
          list.appendChild(a);
        });
    }

    render();
  }

  /* =========================
     DISTRACTION (home)
     - Next requires typing to count as answered
     - Skip does NOT count
     - End finishes session
     Needs these IDs on home:
       distractionCard, distractionQuestion, distractionAnsweredCount,
       distractionInput, distractionHint,
       distractionStartBtn, distractionNextBtn, distractionSkipBtn, distractionEndBtn
  ========================= */
  const DISTRACTION_QUESTIONS = [
    "Name 5 things you can see right now.",
    "Name 4 things you can feel (touch/texture).",
    "Name 3 things you can hear.",
    "Name 2 things you can smell.",
    "Name 1 thing you can taste (or would like to taste).",
    "If you could teleport anywhere for 10 minutes, where would you go?",
    "What colour feels calming to you today?",
    "What’s a tiny ‘safe’ plan for the next 10 minutes?",
    "What’s something you did recently that you’re glad you did?",
    "What’s one kind thing you’d say to a friend feeling this way?",
    "What’s your favourite cosy drink?",
    "If today had a soundtrack, what would it be called?",
    "What’s a film or series that feels comforting?",
    "If you could design a calm room, what 3 items are in it?",
    "What’s one smell that instantly relaxes you?",
    "What’s your favourite season and why?",
    "What’s a place you’ve been that felt peaceful?",
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?",
    "What’s your favourite snack combination?",
    "What would your ‘calm alter ego’ do next?",
    "Pick an animal—what would it say to reassure you?",
    "What’s the softest thing you own?",
    "What’s one song you know all the words to?",
    "What’s a hobby you’d like to try one day?"
  ];

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function initDistraction() {
    const card = $("distractionCard");
    if (!card) return;

    const qEl = $("distractionQuestion");
    const answeredCountEl = $("distractionAnsweredCount");
    const input = $("distractionInput");
    const hint = $("distractionHint");

    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");

    if (!qEl || !answeredCountEl || !input || !startBtn || !nextBtn || !skipBtn || !endBtn) return;

    const SESSION_KEY = "enigmaDistractionSessionV2";

    function setButtons(running) {
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display = running ? "" : "none";
      skipBtn.style.display = running ? "" : "none";
      endBtn.style.display = running ? "" : "none";
      input.disabled = !running;
      input.style.opacity = running ? "1" : "0.6";
      if (hint) hint.style.display = running ? "" : "none";
    }

    function loadSession() {
      const s = safeJSONParse(localStorage.getItem(SESSION_KEY) || "null", null);
      if (!s || s.day !== todayKey()) return null;
      if (!Array.isArray(s.order) || typeof s.i !== "number") return null;
      return s;
    }

    function saveSession(s) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }

    function clearSession() {
      localStorage.removeItem(SESSION_KEY);
    }

    function currentQuestion(s) {
      const idx = s.order[s.i];
      return DISTRACTION_QUESTIONS[idx] || "Take one slow breath in… and out.";
    }

    function updateUI(s) {
      qEl.textContent = currentQuestion(s);
      answeredCountEl.textContent = String(s.answered || 0);
      input.value = "";
      input.focus({ preventScroll: true });
      setButtons(true);
    }

    function startNew() {
      const max = Math.min(20, DISTRACTION_QUESTIONS.length);
      const order = shuffleArray([...Array(DISTRACTION_QUESTIONS.length).keys()]).slice(0, max);
      const s = { day: todayKey(), order, i: 0, answered: 0 };
      saveSession(s);
      updateUI(s);
    }

    function advance(s) {
      if (s.i >= s.order.length - 1) {
        endFlow(s);
        return;
      }
      s.i += 1;
      saveSession(s);
      updateUI(s);
    }

    function endFlow(s) {
      clearSession();
      setButtons(false);
      qEl.textContent = "All done ✅";
      if (hint) hint.style.display = "none";
      input.value = "";
      input.blur();
    }

    function nextClicked() {
      const s = loadSession() || null;
      if (!s) { startNew(); return; }

      const val = (input.value || "").trim();
      if (!val) {
        // gentle prompt (requires typing to count answered)
        if (hint) hint.textContent = "Type any answer (even one word) to count as answered — or tap Skip.";
        input.focus({ preventScroll: true });
        return;
      }

      // answered counts ONLY when typed
      s.answered = Number(s.answered || 0) + 1;
      saveSession(s);
      if (hint) hint.textContent = "Next requires typing. Skip if you’d rather not answer.";
      advance(s);
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startNew();
    }, { passive: false });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      nextClicked();
    }, { passive: false });

    // Enter key also triggers Next
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        nextClicked();
      }
    });

    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = loadSession();
      if (!s) { startNew(); return; }
      if (hint) hint.textContent = "Next requires typing. Skip if you’d rather not answer.";
      advance(s);
    }, { passive: false });

    endBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = loadSession();
      endFlow(s || { answered: Number(answeredCountEl.textContent || 0) });
    }, { passive: false });

    // Resume existing session
    const existing = loadSession();
    if (existing) updateUI(existing);
    else {
      setButtons(false);
      qEl.textContent = "Tap Start to begin.";
      answeredCountEl.textContent = "0";
      input.value = "";
      if (hint) hint.style.display = "none";
    }
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    initTheme();
    initWordOfDay();
    initBreathe();
    initQuotes();
    initMusic();
    initYoga();
    initDistraction();
  });

})();
