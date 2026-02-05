/* =========================================================
   Enigma Wellbeing • app.js (FULL WORKING)
   - Theme (night mode)
   - Back navigation
   - Breathe animation (Start/Stop) + inhale/exhale colour classes
   - Quotes (motivational only, local save)
   - Music (moods + tracks render as button links + minutes)
   - Yoga (moods + video links render as button links)
   - Word of the Day (affirmations) + tooltip
   - Distraction (typed answer required to count as answered; skip allowed; End)
   - Progress page (styled + pulls from localStorage)
========================================================= */

(function () {
  "use strict";

  /* =========================
     Helpers
  ========================= */
  const $ = (id) => document.getElementById(id);

  window.enigmaBack = function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  /* =========================
     THEME (Night mode)
  ========================= */
  function applyTheme() {
    const t = localStorage.getItem("enigmaTheme") || "light";
    document.body.classList.toggle("night", t === "night");
    const btn = $("themeFab");
    if (btn) btn.textContent = (t === "night") ? "☀️" : "🌙";
  }

  function toggleTheme() {
    const night = document.body.classList.toggle("night");
    localStorage.setItem("enigmaTheme", night ? "night" : "light");
    const btn = $("themeFab");
    if (btn) btn.textContent = night ? "☀️" : "🌙";
  }

  function initTheme() {
    const btn = $("themeFab");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  /* =========================
     BREATHE (reliable + colour swap)
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

    function cycle() {
      if (!running) return;

      // INHALE
      circle.classList.add("inhale");
      circle.classList.remove("exhale");
      setText("Breathe in", "Slow and steady…");

      t1 = setTimeout(() => {
        if (!running) return;

        // EXHALE
        circle.classList.add("exhale");
        circle.classList.remove("inhale");
        setText("Breathe out", "Gently let go…");

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
        const obj = JSON.parse(localStorage.getItem(key) || "{}");
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
     QUOTES (motivational only + save)
     NOTE: "search the internet" is not possible from a static GitHub page
     without an API. This keeps it fast & offline.
  ========================= */
  const QUOTES = [
    { q: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" },
    { q: "You do not have to see the whole staircase, just take the first step.", a: "Martin Luther King Jr." },
    { q: "Courage doesn’t always roar. Sometimes it’s the quiet voice saying ‘try again tomorrow.’", a: "Mary Anne Radmacher" },
    { q: "It always seems impossible until it’s done.", a: "Nelson Mandela" },
    { q: "Feelings are visitors. Let them come and go.", a: "Mooji" },
    { q: "Small steps every day.", a: "Unknown" },
    { q: "You’ve survived 100% of your hardest days.", a: "Unknown" },
    { q: "Breathe. This is just a moment.", a: "Unknown" },
    { q: "Progress, not perfection.", a: "Unknown" },
    { q: "Keep going. You’re doing better than you think.", a: "Unknown" }
  ];

  function initQuotes() {
    const grid = $("quoteGrid");
    if (!grid) return;

    const search = $("quoteSearch");
    const savedCount = $("savedCount");
    const toggleSavedOnlyBtn = $("toggleSavedOnlyBtn");
    const viewSavedBtn = $("viewSavedBtn");
    const clearSavedBtn = $("clearSavedBtn");

    const saved = new Set(JSON.parse(localStorage.getItem("enigmaQuotes") || "[]"));

    let savedOnly = localStorage.getItem("enigmaSavedOnly") === "1";

    function render() {
      const q = (search?.value || "").trim().toLowerCase();

      let items = QUOTES.slice();

      if (savedOnly) items = items.filter(x => saved.has(x.q));
      if (q) items = items.filter(x => (x.q + " " + x.a).toLowerCase().includes(q));

      grid.innerHTML = "";
      items.forEach(item => {
        const tile = document.createElement("div");
        tile.className = "quote-tile" + (saved.has(item.q) ? " saved" : "");
        tile.innerHTML = `
          <div style="font-weight:900;color:#5a4b7a; line-height:1.35;">“${item.q}”</div>
          <small>— ${item.a}</small>
          <button class="quote-save-btn ${saved.has(item.q) ? "saved" : ""}" type="button">
            ${saved.has(item.q) ? "💜 Saved" : "💜 Save"}
          </button>
        `;
        tile.querySelector("button").addEventListener("click", (e) => {
          e.preventDefault();
          if (saved.has(item.q)) saved.delete(item.q);
          else saved.add(item.q);
          localStorage.setItem("enigmaQuotes", JSON.stringify([...saved]));
          updateHeaderBits();
          render();
        }, { passive: false });

        grid.appendChild(tile);
      });

      if (!items.length) {
        grid.innerHTML = `<div class="gentle-text">No matches. Try a different search.</div>`;
      }
    }

    function updateHeaderBits() {
      if (savedCount) savedCount.textContent = String(saved.size);
      if (toggleSavedOnlyBtn) toggleSavedOnlyBtn.textContent = savedOnly ? "Show all" : "Show saved only";
    }

    if (search) search.addEventListener("input", render);

    if (toggleSavedOnlyBtn) {
      toggleSavedOnlyBtn.addEventListener("click", () => {
        savedOnly = !savedOnly;
        localStorage.setItem("enigmaSavedOnly", savedOnly ? "1" : "0");
        updateHeaderBits();
        render();
      });
    }

    if (viewSavedBtn) {
      viewSavedBtn.addEventListener("click", () => {
        savedOnly = true;
        localStorage.setItem("enigmaSavedOnly", "1");
        updateHeaderBits();
        render();
      });
    }

    if (clearSavedBtn) {
      clearSavedBtn.addEventListener("click", () => {
        if (!confirm("Delete all saved quotes?")) return;
        saved.clear();
        localStorage.setItem("enigmaQuotes", "[]");
        updateHeaderBits();
        render();
      });
    }

    updateHeaderBits();
    render();
  }

  /* =========================
     MUSIC (render as button links)
     IMPORTANT FIX: don't rely on #musicPage existing.
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
    const chipsWrap = $("moodChips");
    const list = $("musicList");
    if (!chipsWrap || !list) return; // FIX: render only if ids exist

    const minsTodayEl = $("minsToday");
    const minsTotalEl = $("minsTotal");
    const startBtn = $("startListenBtn");
    const endBtn = $("endListenBtn");
    const status = $("listenStatus");

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

      if (!list.children.length) {
        list.innerHTML = `<div class="gentle-text">No tracks for this mood yet.</div>`;
      }
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
        setTimeout(() => status.textContent = "No active session.", 1400);
      });
    }

    renderChips();
    renderTracks();
    loadMinutes();
  }

  /* =========================
     YOGA (render as button links)
     FIX: don't rely on #yogaPage existing.
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
     WORD OF THE DAY (affirmations)
  ========================= */
  const AFFIRMATIONS = [
    { w:"Forgiveness", d:"Letting go of what weighs you down so you can move forward lighter." },
    { w:"Honesty", d:"Choosing truth with kindness—especially with yourself." },
    { w:"Trust", d:"Believing in steady steps even when you can’t see the whole path." },
    { w:"Responsibility", d:"Owning your choices with care, not shame." },
    { w:"Flexibility", d:"Adjusting without breaking—soft strength in motion." },
    { w:"Boldness", d:"Taking a brave step even with a shaky voice." },
    { w:"Discretion", d:"Knowing what to share, and what to keep safe." },
    { w:"Discipline", d:"Small consistent actions that support your future self." },
    { w:"Detail", d:"Noticing the small things that improve the whole picture." },
    { w:"Prosperity", d:"Growth that includes peace, wellbeing, and enough." },
    { w:"Acceptance", d:"Allowing what is, so you can choose what’s next." },
    { w:"Surrender", d:"Releasing control of what you can’t carry." },
    { w:"Sincerity", d:"Showing up real—no performance needed." },
    { w:"Serenity", d:"A calm centre you can return to." },
    { w:"Humility", d:"Confidence without needing to be above anyone." },
    { w:"Sensitivity", d:"A thoughtful awareness—your care is a strength." },
    { w:"Compassion", d:"Meeting yourself with the same gentleness you give others." },
    { w:"Leadership", d:"Guiding with steadiness and care." },
    { w:"Integrity", d:"Being the same person in private and in public." },
    { w:"Action", d:"One small move that shifts your day." },
    { w:"Courage", d:"Feeling fear and choosing yourself anyway." },
    { w:"Creativity", d:"Making space for new possibilities." },
    { w:"Gentleness", d:"Softness that protects your energy." },
    { w:"Clarity", d:"Seeing what matters most—one step at a time." },
    { w:"Balance", d:"Not perfect—just supported." },
    { w:"Fun", d:"Letting joy be allowed, even in small doses." },
    { w:"Commitment", d:"Staying with what matters, kindly." },
    { w:"Patience", d:"Trusting the pace of growth." },
    { w:"Freedom", d:"Breathing room in your choices and your mind." },
    { w:"Reflection", d:"Pausing to understand and choose wisely." },
    { w:"Giving", d:"Offering from fullness, not emptiness." },
    { w:"Enthusiasm", d:"A spark that helps you begin." },
    { w:"Joy", d:"A small light you can notice and protect." },
    { w:"Satisfaction", d:"Letting ‘enough’ be enough." },
    { w:"Grace", d:"Soft landing, even when things aren’t perfect." },
    { w:"Simplicity", d:"Less noise, more ease." },
    { w:"Communication", d:"Clear words that reduce worry." },
    { w:"Appropriateness", d:"Choosing what fits the moment with care." },
    { w:"Strength", d:"Steady presence, not constant pushing." },
    { w:"Love", d:"Warmth you can offer yourself too." },
    { w:"Tenderness", d:"A gentle touch in thought and action." },
    { w:"Perseverance", d:"Continuing—even slowly—still counts." },
    { w:"Reliability", d:"Being someone you can count on, including for yourself." },
    { w:"Initiative", d:"Starting before you feel fully ready." },
    { w:"Confidence", d:"Quiet belief built by practice." },
    { w:"Authenticity", d:"Being you—without shrinking." },
    { w:"Harmony", d:"Things working together, not fighting each other." },
    { w:"Pleasure", d:"Allowing small good moments." },
    { w:"Risk", d:"Trying with care—growth lives here." },
    { w:"Efficiency", d:"Saving energy for what matters." },
    { w:"Spontaneity", d:"A playful yes to the moment." },
    { w:"Fulfilment", d:"A sense of meaning built over time." }
  ];

  function seededIndex(seedStr, mod) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) % mod;
  }

  function initWordOfDay() {
    const wEl = $("wotdWord");
    const dEl = $("wotdDesc");
    const tipBtn = $("wotdTipBtn");
    const tipBox = $("wotdTipBox");
    if (!wEl || !dEl) return;

    const idx = seededIndex(todayKey(), AFFIRMATIONS.length);
    const item = AFFIRMATIONS[idx];

    wEl.textContent = item.w;
    dEl.textContent = item.d;

    if (tipBtn && tipBox) {
      tipBtn.addEventListener("click", () => {
        tipBox.classList.toggle("show");
      });
    }
  }

  /* =========================
     DISTRACTION (typed answer required to count as answered)
  ========================= */
  const DISTRACTION_QUESTIONS = [
    "Name 5 things you can see right now.",
    "Name 4 things you can feel (touch/texture).",
    "Name 3 things you can hear.",
    "Name 2 things you can smell.",
    "Name 1 thing you can taste (or would like to taste).",
    "What colour feels calming to you today?",
    "If your thoughts were weather, what’s the forecast?",
    "What’s a tiny ‘safe’ plan for the next 10 minutes?",
    "What’s one kind thing you’d say to a friend right now?",
    "What’s something you’re proud of that no one sees?",
    "What would a perfect ‘quiet morning’ look like?",
    "Name 3 colours you can spot around you.",
    "What’s a comforting word or phrase you like?",
    "What’s one gentle thing you can do with your hands right now?",
    "What’s one thing that is NOT urgent right now?"
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
    const answeredEl = $("distractionAnsweredCount");
    const input = $("distractionInput");
    const hint = $("distractionHint");

    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");

    if (!qEl || !answeredEl || !input || !startBtn || !nextBtn || !skipBtn || !endBtn) return;

    const SESSION_KEY = "enigmaDistractionSessionV2";

    function setButtons(running) {
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display = running ? "" : "none";
      skipBtn.style.display = running ? "" : "none";
      endBtn.style.display = running ? "" : "none";
    }

    function loadSession() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || s.day !== todayKey()) return null;
        if (!Array.isArray(s.order) || typeof s.i !== "number") return null;
        return s;
      } catch {
        return null;
      }
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
      answeredEl.textContent = String(s.answered);
      input.value = "";
      if (hint) hint.textContent = "Next requires typing. Skip if you’d rather not answer.";
      setButtons(true);
      input.focus();
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
        // finished
        clearSession();
        setButtons(false);
        qEl.textContent = "All done ✅";
        if (hint) hint.textContent = `Answered: ${s.answered}. Tap Start anytime.`;
        input.value = "";
        return;
      }
      s.i += 1;
      saveSession(s);
      updateUI(s);
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startNew();
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = loadSession() || (startNew(), loadSession());
      if (!s) return;

      const val = input.value.trim();
      if (!val) {
        if (hint) hint.textContent = "Type anything (even one word) to count as answered — or press Skip.";
        input.focus();
        return;
      }

      s.answered += 1;
      saveSession(s);
      advance(s);
    });

    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = loadSession() || (startNew(), loadSession());
      if (!s) return;
      // skip does NOT count
      advance(s);
    });

    endBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = loadSession();
      clearSession();
      setButtons(false);
      qEl.textContent = "Ended ✅";
      if (hint) hint.textContent = `Answered: ${s ? s.answered : 0}. You can start again anytime.`;
      input.value = "";
    });

    // resume
    const existing = loadSession();
    if (existing) updateUI(existing);
    else {
      setButtons(false);
      qEl.textContent = "Tap Start to begin.";
      answeredEl.textContent = "0";
    }
  }

  /* =========================
     PROGRESS (styled page)
  ========================= */
  function initProgress() {
    const wrap = $("progressPage");
    if (!wrap) return;

    const savedQuotes = JSON.parse(localStorage.getItem("enigmaQuotes") || "[]");
    const breatheObj = JSON.parse(localStorage.getItem("enigmaBreatheCompletes") || "{}");
    const musicObj = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");

    const day = todayKey();
    const breathedToday = Number(breatheObj[day] || 0);
    const musicToday = Number(musicObj[day] || 0);
    const musicTotal = Object.values(musicObj).reduce((a, v) => a + Number(v || 0), 0);

    $("pSavedQuotes") && ($("pSavedQuotes").textContent = String(savedQuotes.length));
    $("pBreathedToday") && ($("pBreathedToday").textContent = String(breathedToday));
    $("pMusicToday") && ($("pMusicToday").textContent = String(musicToday));
    $("pMusicTotal") && ($("pMusicTotal").textContent = String(musicTotal));
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    initTheme();
    initBreathe();
    initQuotes();
    initMusic();
    initYoga();
    initWordOfDay();
    initDistraction();
    initProgress();
  });

})();
