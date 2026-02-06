/* =========================================================
   Enigma Wellbeing • app.js (FULL + WORKING)
   - Theme toggle
   - Back navigation
   - Breathe (Start/Stop)  ✅ inhale retracts / exhale expands
   - Word of the Day (daily deterministic + description + modal)
   - Distraction (typing required for Next; Skip allowed; progress = answered only)
   - Quotes (motivational + save)
   - Music (moods + minutes)
   - Yoga (moods + links)
   - Progress (basic totals)
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* =========================
     Back
  ========================= */
  window.enigmaBack = function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  /* =========================
     Date key
  ========================= */
  function todayKey() {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  }

  /* =========================
     Deterministic RNG (Word of Day)
  ========================= */
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFromToday() {
    const s = todayKey().replaceAll("-", "");
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 20260101;
  }

  /* =========================
     THEME
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
     BREATHE (Start/Stop works)
     NOTE: CSS controls the visuals.
     Requested swap:
       - inhale => retract (smaller)
       - exhale => expand (bigger)
  ========================= */
  function initBreathe() {
    const page = $("breathePage");
    if (!page) return;

    const circle = $("breatheCircle");
    const phase = $("breathPhase");
    const tip = $("breathTip");
    const startBtn = $("breathStartBtn");
    const stopBtn = $("breathStopBtn");
    const doneBtn = $("breathCompleteBtn");

    if (!circle || !phase || !tip || !startBtn || !stopBtn) return;

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

    function reset() {
      clearTimers();
      circle.classList.remove("inhale", "exhale");
      setText("Ready", "Tap Start to begin.");
    }

    // inhale: retract (small)
    // exhale: expand (big)
    function cycle() {
      if (!running) return;

      circle.classList.add("inhale");
      circle.classList.remove("exhale");
      setText("Inhale", "Breathe in slowly…");

      t1 = setTimeout(() => {
        if (!running) return;

        circle.classList.add("exhale");
        circle.classList.remove("inhale");
        setText("Exhale", "Breathe out gently…");

        t2 = setTimeout(() => {
          if (!running) return;
          cycle();
        }, 4000);
      }, 4000);
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (running) return;
      running = true;
      cycle();
    });

    stopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      running = false;
      reset();
    });

    if (doneBtn) {
      doneBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const key = "enigmaBreatheCompletes";
        const store = JSON.parse(localStorage.getItem(key) || "{}");
        const day = todayKey();
        store[day] = (store[day] || 0) + 1;
        localStorage.setItem(key, JSON.stringify(store));
        doneBtn.textContent = "Saved ✅";
        setTimeout(() => (doneBtn.textContent = "Completed ✅"), 1200);
      });
    }

    reset();
  }

  /* =========================
     WORD OF THE DAY
  ========================= */
  const WOTD = [
    { w: "Forgiveness", d: "Releasing resentment so you can move forward lighter." },
    { w: "Honesty", d: "Choosing truth with kindness—to yourself and others." },
    { w: "Trust", d: "Allowing confidence in yourself, others, or the process." },
    { w: "Responsibility", d: "Owning your choices and responding with intention." },
    { w: "Flexibility", d: "Adapting without losing your centre." },
    { w: "Boldness", d: "Taking brave steps even when you feel unsure." },
    { w: "Discretion", d: "Using good judgement about what to share and when." },
    { w: "Discipline", d: "Doing what helps you—even when motivation fades." },
    { w: "Detail", d: "Noticing the small things that improve the whole." },
    { w: "Prosperity", d: "Growing resources and wellbeing in a healthy way." },
    { w: "Acceptance", d: "Letting reality be what it is—so you can respond wisely." },
    { w: "Surrender", d: "Loosening the grip on what you can’t control." },
    { w: "Sincerity", d: "Being genuine—your real self is enough." },
    { w: "Serenity", d: "A quiet steadiness, even when life is loud." },
    { w: "Humility", d: "Staying grounded and open to learning." },
    { w: "Sensitivity", d: "Noticing feelings and needs—yours and others’." },
    { w: "Compassion", d: "Meeting struggle with warmth instead of judgement." },
    { w: "Leadership", d: "Guiding with care, clarity, and example." },
    { w: "Integrity", d: "Aligning actions with values—even in small moments." },
    { w: "Action", d: "One doable step—progress over perfection." },
    { w: "Courage", d: "Feeling fear and still choosing what matters." },
    { w: "Creativity", d: "Letting new ideas and possibilities appear." },
    { w: "Gentleness", d: "Soft strength—especially with yourself." },
    { w: "Clarity", d: "Seeing what matters most, without the noise." },
    { w: "Balance", d: "Making space for rest, effort, joy, and recovery." },
    { w: "Fun", d: "Allowing lightness—your nervous system needs it." },
    { w: "Commitment", d: "Staying with what you choose, one day at a time." },
    { w: "Patience", d: "Letting growth take the time it takes." },
    { w: "Freedom", d: "Creating room to breathe, choose, and be yourself." },
    { w: "Reflection", d: "Looking back kindly to learn and reset." },
    { w: "Giving", d: "Offering support without emptying yourself." },
    { w: "Enthusiasm", d: "Inviting energy and interest into the day." },
    { w: "Joy", d: "Noticing what feels bright—even briefly." },
    { w: "Satisfaction", d: "Letting ‘enough’ be enough." },
    { w: "Grace", d: "Moving with softness through imperfect moments." },
    { w: "Simplicity", d: "Reducing the load—one less thing at a time." },
    { w: "Communication", d: "Sharing clearly, listening carefully." },
    { w: "Appropriateness", d: "Matching your response to the moment wisely." },
    { w: "Strength", d: "Endurance, boundaries, and quiet resilience." },
    { w: "Love", d: "Choosing care—for yourself and others." },
    { w: "Tenderness", d: "Being gentle with what’s sensitive." },
    { w: "Perseverance", d: "Keeping going, especially on the slow days." },
    { w: "Reliability", d: "Being steady and consistent—small promises kept." },
    { w: "Initiative", d: "Starting before you feel ready." },
    { w: "Confidence", d: "Trusting your ability to figure things out." },
    { w: "Authenticity", d: "Being real—no performance required." },
    { w: "Harmony", d: "Finding calm alignment within and around you." },
    { w: "Pleasure", d: "Letting good moments count." },
    { w: "Risk", d: "Trying something new, gently and safely." },
    { w: "Efficiency", d: "Using energy wisely—not doing everything." },
    { w: "Spontaneity", d: "Letting life surprise you in kind ways." },
    { w: "Fulfilment", d: "A sense of meaning—built over time." }
  ];

  function pickWotd() {
    const seed = seedFromToday();
    const rand = mulberry32(seed);
    const i = Math.floor(rand() * WOTD.length);
    return WOTD[i] || { w: "Serenity", d: "A quiet steadiness, even when life is loud." };
  }

  function showWotdModal(word, desc) {
    const modal = $("wotdModal");
    const backdrop = $("wotdBackdrop");
    const closeBtn = $("wotdCloseBtn");
    const mw = $("wotdModalWord");
    const md = $("wotdModalDesc");

    if (!modal || !mw || !md) return;

    mw.textContent = word;
    md.textContent = desc;

    modal.style.display = "block";
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    const close = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      modal.style.display = "none";
    };

    if (backdrop) backdrop.addEventListener("click", close, { once: true });
    if (closeBtn) closeBtn.addEventListener("click", close, { once: true });

    window.addEventListener(
      "keydown",
      function esc(e) {
        if (e.key === "Escape") {
          close();
          window.removeEventListener("keydown", esc);
        }
      },
      { once: true }
    );
  }

  function initWotd() {
    const wEl = $("wotdWord");
    const dEl = $("wotdDesc");
    const infoBtn = $("wotdInfoBtn");
    const tile = $("wotdTile");

    if (!wEl || !dEl || !tile) return;

    const { w, d } = pickWotd();
    wEl.textContent = w;
    dEl.textContent = d;

    tile.addEventListener("click", (e) => {
      if (e.target && e.target.id === "wotdInfoBtn") return;
      e.preventDefault();
      showWotdModal(w, d);
    });

    if (infoBtn) {
      infoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showWotdModal(w, d);
      });
    }
  }

  /* =========================
     DISTRACTION (typed answers required)
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
    "What’s one kind thing you’d say to a friend feeling this way?",
    "What’s your favourite cosy drink?",
    "If today had a soundtrack, what would it be called?",
    "If you could design a calm room, what 3 items are in it?",
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?",
    "What would your ‘calm alter ego’ do next?",
    "What’s the softest thing you own?",
    "Name 3 colours you can spot around you.",
    "What’s one gentle stretch you can do right now?",
    "What is a ‘good enough’ goal for today?",
    "What’s one small thing you can do to be kind to yourself right now?"
  ];

  function shuffle(arr) {
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
    const answeredEl = $("distractionAnsweredCount");

    const inputWrap = $("distractionInputWrap");
    const input = $("distractionInput");

    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");

    if (!qEl || !answeredEl || !startBtn || !nextBtn || !skipBtn || !endBtn || !inputWrap || !input) return;

    const KEY = "enigmaDistractionSessionV2";

    function setRunning(running) {
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display = running ? "" : "none";
      skipBtn.style.display = running ? "" : "none";
      endBtn.style.display = running ? "" : "none";
      inputWrap.style.display = running ? "" : "none";
      if (!running) input.value = "";
    }

    function load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || s.day !== todayKey()) return null;
        if (!Array.isArray(s.order) || typeof s.i !== "number" || typeof s.answered !== "number") return null;
        return s;
      } catch {
        return null;
      }
    }

    function save(s) {
      localStorage.setItem(KEY, JSON.stringify(s));
    }

    function clear() {
      localStorage.removeItem(KEY);
    }

    function currentQ(s) {
      const idx = s.order[s.i];
      return DISTRACTION_QUESTIONS[idx] || "Take one slow breath in… and out.";
    }

    function render(s) {
      qEl.textContent = currentQ(s);
      answeredEl.textContent = String(s.answered);
      input.value = "";
      setRunning(true);
    }

    function startNew() {
      const order = shuffle([...Array(DISTRACTION_QUESTIONS.length).keys()]);
      const s = { day: todayKey(), order, i: 0, answered: 0 };
      save(s);
      render(s);
    }

    function advance(s) {
      if (s.i >= s.order.length - 1) {
        qEl.textContent = "You’re done. Take a slow breath.";
        answeredEl.textContent = String(s.answered);
        setRunning(false);
        clear();
        return;
      }
      s.i += 1;
      save(s);
      render(s);
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startNew();
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      let s = load();
      if (!s) {
        startNew();
        s = load();
      }
      if (!s) return;

      const text = (input.value || "").trim();
      if (!text) {
        input.focus();
        const original = qEl.textContent;
        qEl.textContent = "Type any answer (even one word) — or tap Skip.";
        setTimeout(() => {
          const s2 = load();
          if (s2) qEl.textContent = currentQ(s2);
          else qEl.textContent = original;
        }, 900);
        return;
      }

      s.answered += 1;
      save(s);
      advance(s);
    });

    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      let s = load();
      if (!s) {
        startNew();
        s = load();
      }
      if (!s) return;
      advance(s);
    });

    endBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = load();
      clear();
      setRunning(false);
      qEl.textContent = "Ended. You can start again any time.";
      answeredEl.textContent = String(s?.answered ?? 0);
    });

    const existing = load();
    if (existing) {
      render(existing);
    } else {
      setRunning(false);
      qEl.textContent = "Tap Start to begin.";
      answeredEl.textContent = "0";
    }
  }

  /* =========================
     QUOTES (motivational + save)
  ========================= */
  const MOTIVATIONAL_QUOTES = [
    { q: "Do what you can, with what you have, where you are.", a: "Theodore Roosevelt" },
    { q: "It always seems impossible until it’s done.", a: "Nelson Mandela" },
    { q: "Courage is grace under pressure.", a: "Ernest Hemingway" },
    { q: "You are stronger than you think.", a: "Unknown" },
    { q: "Small steps every day.", a: "Unknown" },
    { q: "Whether you think you can or you think you can’t, you’re right.", a: "Henry Ford" },
    { q: "Act as if what you do makes a difference. It does.", a: "William James" },
    { q: "The future depends on what you do today.", a: "Mahatma Gandhi" },
    { q: "Everything you’ve ever wanted is on the other side of fear.", a: "George Addair" },
    { q: "Fall seven times, stand up eight.", a: "Japanese Proverb" }
  ];

  function initQuotes() {
    const grid = $("quoteGrid");
    if (!grid) return;

    const searchInput = $("quoteSearch");
    const searchBtn = $("quoteSearchBtn");
    const randomBtn = $("quoteRandomBtn");
    const status = $("quoteStatus");
    const savedCount = $("savedCount");
    const viewSavedBtn = $("viewSavedBtn");
    const clearSavedBtn = $("clearSavedBtn");

    const SAVED_KEY = "enigmaSavedQuotesV1";

    function loadSaved() {
      try {
        return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      } catch {
        return [];
      }
    }

    function saveSaved(arr) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
    }

    function setSavedCount() {
      if (!savedCount) return;
      savedCount.textContent = String(loadSaved().length);
    }

    function isSaved(item, saved) {
      return saved.some((x) => x.q === item.q && x.a === item.a);
    }

    function render(list) {
      const saved = loadSaved();
      grid.innerHTML = "";

      list.forEach((item) => {
        const tile = document.createElement("div");
        tile.className = "quote-tile";

        const savedAlready = isSaved(item, saved);

        tile.innerHTML = `
          <div class="quote-text">“${item.q}”</div>
          <small>— ${item.a || "Unknown"}</small>
          <button class="quote-save-btn ${savedAlready ? "saved" : ""}" type="button">
            ${savedAlready ? "💜 Saved" : "💜 Save"}
          </button>
        `;

        const btn = tile.querySelector("button");
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const now = loadSaved();
          const exists = isSaved(item, now);

          const next = exists
            ? now.filter((x) => !(x.q === item.q && x.a === item.a))
            : [{ q: item.q, a: item.a || "Unknown" }, ...now].slice(0, 200);

          saveSaved(next);
          setSavedCount();
          render(list);
        });

        grid.appendChild(tile);
      });

      setSavedCount();
    }

    function randomMotivational() {
      const pick = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      render([pick]);
      if (status) status.textContent = "Random motivational quote.";
    }

    function doSearch() {
      const q = (searchInput?.value || "").trim().toLowerCase();
      if (!q) {
        render(MOTIVATIONAL_QUOTES);
        if (status) status.textContent = "Showing motivational quotes.";
        return;
      }
      const filtered = MOTIVATIONAL_QUOTES.filter(
        (x) => x.q.toLowerCase().includes(q) || (x.a || "").toLowerCase().includes(q)
      );
      render(filtered.length ? filtered : [{ q: "No matches found. Try a different word.", a: "Enigma" }]);
      if (status) status.textContent = filtered.length ? `Results for "${q}".` : `No results for "${q}".`;
    }

    if (searchBtn) searchBtn.addEventListener("click", (e) => { e.preventDefault(); doSearch(); });
    if (randomBtn) randomBtn.addEventListener("click", (e) => { e.preventDefault(); randomMotivational(); });

    if (viewSavedBtn) {
      viewSavedBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const saved = loadSaved();
        render(saved.length ? saved : [{ q: "No saved quotes yet.", a: "Enigma" }]);
        if (status) status.textContent = "Showing saved quotes.";
      });
    }

    if (clearSavedBtn) {
      clearSavedBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!confirm("Delete all saved quotes?")) return;
        saveSaved([]);
        setSavedCount();
        render(MOTIVATIONAL_QUOTES);
        if (status) status.textContent = "Saved quotes deleted.";
      });
    }

    render(MOTIVATIONAL_QUOTES);
  }

  /* =========================
     MUSIC (moods + minutes)
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
    const page = $("musicList");
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
      TRACKS.filter((x) => mood === "All" || x.m === mood).forEach((x) => {
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
      MUSIC_MOODS.forEach((m) => {
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
      const store = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");
      const today = Number(store[day] || 0);
      const total = Object.values(store).reduce((a, v) => a + Number(v || 0), 0);

      if (minsTodayEl) minsTodayEl.textContent = String(today);
      if (minsTotalEl) minsTotalEl.textContent = String(total);
    }

    function saveMinutes(addMins) {
      const day = todayKey();
      const store = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");
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
        setTimeout(() => (status.textContent = "No active session."), 1400);
      });
    }

    renderChips();
    renderTracks();
    loadMinutes();
  }

  /* =========================
     YOGA (moods + links)
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
    const chipsWrap = $("yogaMoodChips");
    const list = $("yogaVideoList");
    if (!chipsWrap || !list) return;

    let mood = localStorage.getItem("enigmaYogaMood") || "All";

    function render() {
      chipsWrap.innerHTML = "";
      YOGA_MOODS.forEach((m) => {
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
      YOGA_VIDEOS.filter((x) => mood === "All" || x.m === mood || x.m === "All").forEach((x) => {
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
     PROGRESS
  ========================= */
  function initProgress() {
    const page = $("progressPage");
    if (!page) return;

    const day = todayKey();

    const breatheStore = JSON.parse(localStorage.getItem("enigmaBreatheCompletes") || "{}");
    const breathedToday = Number(breatheStore[day] || 0);

    const musicStore = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");
    const musicToday = Number(musicStore[day] || 0);
    const musicTotal = Object.values(musicStore).reduce((a, v) => a + Number(v || 0), 0);

    let savedQuotes = [];
    try { savedQuotes = JSON.parse(localStorage.getItem("enigmaSavedQuotesV1") || "[]"); } catch { savedQuotes = []; }

    const pBreathedToday = $("pBreathedToday");
    const pMusicToday = $("pMusicToday");
    const pSavedQuotes = $("pSavedQuotes");
    const pMusicTotal = $("pMusicTotal");

    if (pBreathedToday) pBreathedToday.textContent = String(breathedToday);
    if (pMusicToday) pMusicToday.textContent = String(musicToday);
    if (pSavedQuotes) pSavedQuotes.textContent = String(savedQuotes.length);
    if (pMusicTotal) pMusicTotal.textContent = String(musicTotal);
  }

  /* =========================
     BOOT (safe)
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    try { applyTheme(); } catch (e) {}
    try { initTheme(); } catch (e) {}

    try { initBreathe(); } catch (e) {}
    try { initWotd(); } catch (e) {}
    try { initDistraction(); } catch (e) {}

    try { initQuotes(); } catch (e) {}
    try { initMusic(); } catch (e) {}
    try { initYoga(); } catch (e) {}
    try { initProgress(); } catch (e) {}
  });

})();
