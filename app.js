/* =========================================================
   Enigma • app.js (WORKING + LATEST CHANGES)
   Includes:
   - Theme (night mode)
   - Back navigation
   - Word of the Day (affirmations + description + help ?)
   - Breathe animation (Start/Stop + wording updates)
   - Quotes (save/unsave + search + saved-only + delete all)
   - Music (moods + links + minutes listened)
   - Yoga (moods + video links)
   - Distraction (typing required to count answered + next/skip/end + progress)
========================================================= */

(function () {
  "use strict";

  /* =========================
     Helpers
  ========================= */
  function $(id){ return document.getElementById(id); }

  window.enigmaBack = function(){
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  function todayKey(){
    return new Date().toISOString().split("T")[0];
  }

  /* =========================
     THEME (Night mode)
  ========================= */
  function applyTheme(){
    const t = localStorage.getItem("enigmaTheme") || "light";
    document.body.classList.toggle("night", t === "night");
  }

  function toggleTheme(){
    const night = document.body.classList.toggle("night");
    localStorage.setItem("enigmaTheme", night ? "night" : "light");
  }

  function initTheme(){
    const btn = $("themeFab");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  /* =========================
     WORD OF THE DAY (affirmations + help)
  ========================= */
  const AFFIRMATIONS = [
    { w:"Forgiveness", d:"I release what I can’t change and make space for peace." },
    { w:"Honesty", d:"I speak and act with truth and care." },
    { w:"Trust", d:"I can rely on myself and allow others to show up." },
    { w:"Responsibility", d:"I take ownership of what’s mine—calmly and clearly." },
    { w:"Flexibility", d:"I can adapt without losing myself." },
    { w:"Boldness", d:"I choose brave steps, even small ones." },
    { w:"Discretion", d:"I share with intention and protect my peace." },
    { w:"Discipline", d:"I follow through gently, one step at a time." },
    { w:"Detail", d:"I notice what matters and give it steady attention." },
    { w:"Prosperity", d:"I welcome growth, wellbeing, and abundance." },
    { w:"Acceptance", d:"I meet this moment as it is, without fighting it." },
    { w:"Surrender", d:"I let go of control and soften into the present." },
    { w:"Sincerity", d:"I show up as I truly am." },
    { w:"Serenity", d:"I invite quiet calm into my body and mind." },
    { w:"Humility", d:"I stay open to learning and grounded confidence." },
    { w:"Sensitivity", d:"My feelings give me information—and I handle them kindly." },

    { w:"Compassion", d:"I respond to myself with warmth and understanding." },
    { w:"Leadership", d:"I guide myself with clarity and care." },
    { w:"Integrity", d:"My values and actions align." },
    { w:"Action", d:"I take the next small step that helps." },
    { w:"Courage", d:"I can feel fear and still choose what matters." },
    { w:"Creativity", d:"I allow new ideas and gentle expression." },
    { w:"Gentleness", d:"Softness is strength. I don’t rush my healing." },
    { w:"Clarity", d:"I can choose one helpful thought at a time." },
    { w:"Balance", d:"I make room for rest and effort." },
    { w:"Fun", d:"I allow lightness and play without guilt." },
    { w:"Commitment", d:"I stay with what matters to me." },
    { w:"Patience", d:"I give myself time. Progress counts." },
    { w:"Freedom", d:"I release what weighs me down." },
    { w:"Reflection", d:"I pause to understand and choose wisely." },
    { w:"Giving", d:"I offer kindness without abandoning myself." },
    { w:"Enthusiasm", d:"I welcome light energy and hopeful momentum." },

    { w:"Joy", d:"I allow small moments of happiness to land." },
    { w:"Satisfaction", d:"I notice what’s already good enough today." },
    { w:"Grace", d:"I move through life with ease and self-forgiveness." },
    { w:"Simplicity", d:"I focus on what’s essential." },
    { w:"Communication", d:"I express my needs clearly and respectfully." },
    { w:"Appropriateness", d:"I choose what fits this moment with wisdom." },
    { w:"Strength", d:"I am resilient, even when I feel tender." },
    { w:"Love", d:"I am worthy of care, connection, and warmth." },
    { w:"Tenderness", d:"I treat myself softly, especially when it’s hard." },
    { w:"Perseverance", d:"I keep going—slowly, steadily, kindly." },
    { w:"Reliability", d:"I build trust by doing what I say I’ll do." },
    { w:"Initiative", d:"I begin—imperfectly—and that’s enough." },
    { w:"Confidence", d:"I trust my ability to cope and learn." },
    { w:"Authenticity", d:"I don’t shrink who I am to feel accepted." },
    { w:"Harmony", d:"I create alignment between my inner and outer world." },
    { w:"Pleasure", d:"I allow comfort and enjoyment without guilt." },
    { w:"Risk", d:"I can try, even if I’m not certain." },
    { w:"Efficiency", d:"I use my energy wisely and kindly." },
    { w:"Spontaneity", d:"I allow small, safe moments of freedom." },
    { w:"Fulfilment", d:"I build a life that feels meaningful to me." }
  ];

  function hashDayToIndex(dayStr, max){
    const digits = String(dayStr || "").replaceAll("-", "");
    let n = 0;
    for (let i = 0; i < digits.length; i++){
      n = (n * 31 + digits.charCodeAt(i)) >>> 0;
    }
    return max ? (n % max) : 0;
  }

  function initWordOfDay(){
    const wordEl = $("wotdWord");
    const defEl  = $("wotdDef");
    const helpBtn= $("wotdHelpBtn");

    if (!wordEl || !defEl) return;

    const day = todayKey();
    const idx = hashDayToIndex(day, AFFIRMATIONS.length);
    const pick = AFFIRMATIONS[idx];

    wordEl.textContent = pick.w;
    defEl.textContent = pick.d;

    if (helpBtn){
      helpBtn.addEventListener("click", ()=>{
        alert("Using these words as affirmations means you can repeat them to yourself, write them down, or think about them regularly to help cultivate those qualities within yourself.");
      });
    }
  }

  /* =========================
     BREATHE (reliable)
  ========================= */
  function initBreathe(){
    const page = $("breathePage");
    if (!page) return;

    const circle = $("breatheCircle");
    const phase  = $("breathPhase");
    const tip    = $("breathTip");
    const start  = $("breathStartBtn");
    const stop   = $("breathStopBtn");
    const done   = $("breathCompleteBtn");

    if (!circle || !phase || !tip || !start || !stop) return;

    let running = false;
    let t1 = null;
    let t2 = null;

    function setText(p, m){
      phase.textContent = p;
      tip.textContent = m;
    }

    function clearTimers(){
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      t1 = t2 = null;
    }

    function reset(){
      clearTimers();
      circle.classList.remove("inhale","exhale");
      setText("Ready", "Tap Start to begin.");
    }

    function cycle(){
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

    start.addEventListener("click", (e) => {
      e.preventDefault();
      if (running) return;
      running = true;
      cycle();
    }, { passive:false });

    stop.addEventListener("click", (e) => {
      e.preventDefault();
      running = false;
      reset();
    }, { passive:false });

    if (done){
      done.addEventListener("click", (e) => {
        e.preventDefault();
        const key = "enigmaBreatheCompletes";
        const obj = JSON.parse(localStorage.getItem(key) || "{}");
        const day = todayKey();
        obj[day] = (obj[day] || 0) + 1;
        localStorage.setItem(key, JSON.stringify(obj));
        done.textContent = "Saved ✅";
        setTimeout(()=> done.textContent = "Completed ✅", 1200);
      }, { passive:false });
    }

    reset();
  }

  /* =========================
     QUOTES (motivational + save/unsave + search + saved-only + delete)
     NOTE: True internet quote search is not possible from a static GitHub Pages site
           unless you use a quotes API (requires keys/CORS). This provides a strong
           built-in library + local search.
  ========================= */
  const QUOTES = [
    { q:"Do what you can, with what you have, where you are.", a:"Theodore Roosevelt" },
    { q:"It always seems impossible until it’s done.", a:"Nelson Mandela" },
    { q:"Whether you think you can or you think you can’t, you’re right.", a:"Henry Ford" },
    { q:"If you’re going through hell, keep going.", a:"Winston Churchill" },
    { q:"Believe you can and you’re halfway there.", a:"Theodore Roosevelt" },
    { q:"Act as if what you do makes a difference. It does.", a:"William James" },
    { q:"Success is not final, failure is not fatal: it is the courage to continue that counts.", a:"Winston Churchill" },
    { q:"Start where you are. Use what you have. Do what you can.", a:"Arthur Ashe" },
    { q:"The future depends on what you do today.", a:"Mahatma Gandhi" },
    { q:"You miss 100% of the shots you don’t take.", a:"Wayne Gretzky" },
    { q:"If you can dream it, you can do it.", a:"Walt Disney" },
    { q:"Hardships often prepare ordinary people for an extraordinary destiny.", a:"C.S. Lewis" },
    { q:"Your life does not get better by chance, it gets better by change.", a:"Jim Rohn" },
    { q:"Small steps every day.", a:"Affirmation" },
    { q:"Progress, not perfection.", a:"Affirmation" },
    { q:"You are capable of difficult things.", a:"Affirmation" },
    { q:"Breathe. You’re doing your best.", a:"Affirmation" },
    { q:"One day at a time.", a:"Affirmation" },
    { q:"This too shall pass.", a:"Affirmation" }
  ];

  function quoteId(item){
    return `${item.a}::${item.q}`;
  }

  function initQuotes(){
    const grid = $("quoteGrid");
    if (!grid) return;

    const searchEl = $("quoteSearch");
    const savedCountEl = $("savedCount");
    const toggleSavedOnlyBtn = $("toggleSavedOnlyBtn");
    const viewSavedBtn = $("viewSavedBtn");
    const clearSavedBtn = $("clearSavedBtn");

    let saved = new Set(JSON.parse(localStorage.getItem("enigmaSavedQuotesV3") || "[]"));
    let savedOnly = localStorage.getItem("enigmaQuotesSavedOnly") === "1";

    function updateSavedCount(){
      if (savedCountEl) savedCountEl.textContent = String(saved.size);
    }

    function render(){
      const q = (searchEl?.value || "").trim().toLowerCase();
      grid.innerHTML = "";

      let list = QUOTES.slice();

      if (savedOnly){
        list = list.filter(item => saved.has(quoteId(item)));
      }
      if (q){
        list = list.filter(item =>
          item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        );
      }

      list.forEach(item=>{
        const id = quoteId(item);
        const isSaved = saved.has(id);

        const tile = document.createElement("div");
        tile.className = "quote-tile" + (isSaved ? " saved" : "");
        tile.innerHTML = `
          <div style="font-weight:900;color:#5a4b7a; line-height:1.35;">“${item.q}”</div>
          <small>— ${item.a}</small>
          <button class="quote-save-btn ${isSaved ? "saved" : ""}" type="button">
            ${isSaved ? "💜 Saved" : "💜 Save"}
          </button>
        `;

        const btn = tile.querySelector("button");
        btn.addEventListener("click", (e)=>{
          e.preventDefault();
          if (saved.has(id)) saved.delete(id);
          else saved.add(id);
          localStorage.setItem("enigmaSavedQuotesV3", JSON.stringify(Array.from(saved)));
          updateSavedCount();
          render();
        }, { passive:false });

        grid.appendChild(tile);
      });

      updateSavedCount();
      if (toggleSavedOnlyBtn){
        toggleSavedOnlyBtn.textContent = savedOnly ? "Show all quotes" : "Show saved only";
      }
    }

    if (searchEl){
      searchEl.addEventListener("input", ()=> render());
    }

    if (toggleSavedOnlyBtn){
      toggleSavedOnlyBtn.addEventListener("click", ()=>{
        savedOnly = !savedOnly;
        localStorage.setItem("enigmaQuotesSavedOnly", savedOnly ? "1" : "0");
        render();
      });
    }

    if (viewSavedBtn){
      viewSavedBtn.addEventListener("click", ()=>{
        const arr = Array.from(saved);
        if (!arr.length) return alert("No saved quotes yet.");
        alert("Saved quotes:\n\n" + arr.map(x=> "• " + x.split("::")[1]).join("\n\n"));
      });
    }

    if (clearSavedBtn){
      clearSavedBtn.addEventListener("click", ()=>{
        if (!confirm("Delete all saved quotes?")) return;
        saved = new Set();
        localStorage.setItem("enigmaSavedQuotesV3", "[]");
        updateSavedCount();
        render();
      });
    }

    render();
  }

  /* =========================
     MUSIC (moods + links + minutes listened)
  ========================= */
  const MUSIC_MOODS = ["All","Anxious","Stressed","Focus","Sleep"];

  const TRACKS = [
    {t:"Calm breathing music",m:"Anxious",u:"https://www.youtube.com/watch?v=odADwWzHR24"},
    {t:"Lo-fi focus mix",m:"Focus",u:"https://www.youtube.com/watch?v=jfKfPfyJRdk"},
    {t:"Sleep music",m:"Sleep",u:"https://www.youtube.com/watch?v=DWcJFNfaw9c"},
    {t:"Relaxing piano",m:"Stressed",u:"https://www.youtube.com/watch?v=1ZYbU82GVz4"},
    {t:"Ocean waves",m:"Sleep",u:"https://www.youtube.com/watch?v=eKFTSSKCzWA"},
    {t:"Relaxing ambient (study)",m:"Focus",u:"https://www.youtube.com/watch?v=5qap5aO4i9A"},
    {t:"Nature sounds (forest)",m:"Stressed",u:"https://www.youtube.com/watch?v=OdIJ2x3nxzQ"}
  ];

  function initMusic(){
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

    function renderTracks(){
      list.innerHTML = "";
      TRACKS
        .filter(x => mood === "All" || x.m === mood)
        .forEach(x=>{
          const a = document.createElement("a");
          a.href = x.u;
          a.target = "_blank";
          a.rel = "noopener";
          a.className = "music-btn";
          a.innerHTML = `<span>${x.t}</span><span>▶</span>`;
          list.appendChild(a);
        });
    }

    function renderChips(){
      chipsWrap.innerHTML = "";
      MUSIC_MOODS.forEach(m=>{
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (m === mood ? " active" : "");
        b.textContent = m;
        b.addEventListener("click", ()=>{
          mood = m;
          localStorage.setItem("enigmaMusicMood", mood);
          renderChips();
          renderTracks();
        });
        chipsWrap.appendChild(b);
      });
    }

    function loadMinutes(){
      const day = todayKey();
      const store = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");
      const today = Number(store[day] || 0);
      const total = Object.values(store).reduce((a,v)=>a + Number(v||0), 0);

      if (minsTodayEl) minsTodayEl.textContent = String(today);
      if (minsTotalEl) minsTotalEl.textContent = String(total);
    }

    function saveMinutes(addMins){
      const day = todayKey();
      const store = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");
      store[day] = Number(store[day] || 0) + addMins;
      localStorage.setItem("enigmaMusicMinutes", JSON.stringify(store));
    }

    if (startBtn && status){
      startBtn.addEventListener("click", ()=>{
        if (start) return;
        start = Date.now();
        status.textContent = "Listening… tap End session when finished.";
      });
    }

    if (endBtn && status){
      endBtn.addEventListener("click", ()=>{
        if (!start) return;
        const mins = Math.max(1, Math.round((Date.now() - start) / 60000));
        start = null;
        saveMinutes(mins);
        loadMinutes();
        status.textContent = `Saved ${mins} min ✅`;
        setTimeout(()=> status.textContent = "No active session.", 1400);
      });
    }

    renderChips();
    renderTracks();
    loadMinutes();
  }

  /* =========================
     YOGA (moods + video links)
  ========================= */
  const YOGA_MOODS = ["All","Anxiety","Stress","Sleep","Morning","Stiff body"];
  const YOGA_VIDEOS = [
    { t:"10 min Yoga for Anxiety", m:"Anxiety", u:"https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
    { t:"15 min Gentle Yoga for Stress", m:"Stress", u:"https://www.youtube.com/results?search_query=15+minute+gentle+yoga+for+stress" },
    { t:"Yoga for Sleep (wind down)", m:"Sleep", u:"https://www.youtube.com/results?search_query=yoga+for+sleep+bedtime" },
    { t:"Morning Yoga (wake up)", m:"Morning", u:"https://www.youtube.com/results?search_query=morning+yoga+10+minutes" },
    { t:"Yoga for stiff back/hips", m:"Stiff body", u:"https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" },
    { t:"Gentle yoga (all levels)", m:"All", u:"https://www.youtube.com/results?search_query=gentle+yoga+all+levels" }
  ];

  function initYoga(){
    const page = $("yogaPage");
    if (!page) return;

    const chipsWrap = $("yogaMoodChips");
    const list = $("yogaVideoList");
    if (!chipsWrap || !list) return;

    let mood = localStorage.getItem("enigmaYogaMood") || "All";

    function render(){
      chipsWrap.innerHTML = "";
      YOGA_MOODS.forEach(m=>{
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (m === mood ? " active" : "");
        b.textContent = m;
        b.addEventListener("click", ()=>{
          mood = m;
          localStorage.setItem("enigmaYogaMood", mood);
          render();
        });
        chipsWrap.appendChild(b);
      });

      list.innerHTML = "";
      YOGA_VIDEOS
        .filter(x => mood === "All" || x.m === mood || x.m === "All")
        .forEach(x=>{
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
     DISTRACTION (typing required to count answered)
     Requirements:
     - Next requires typing (counts answered only)
     - Skip allowed (does NOT count)
     - End button ends session anytime
     - Progress tracker: answered only
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
    "What would your ‘calm alter ego’ do next?",
    "Pick an animal—what would it say to reassure you?",
    "What’s the softest thing you own?",
    "Name 3 colours you can spot around you.",
    "What’s one thing you can tidy in 30 seconds?",
    "If your thoughts were weather, what’s the forecast—and what would help?",
    "What’s one gentle stretch you can do right now?",
    "What is a ‘good enough’ goal for today?",
    "If you had a calm superpower, what would it be?",
    "Name 5 foods you enjoy.",
    "Name 5 places you’d like to visit.",
    "What’s one thing you can forgive yourself for today?",
    "What’s one gentle thing you can say to yourself right now?"
  ];

  function shuffleArray(arr){
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function initDistraction(){
    const card = $("distractionCard");
    if (!card) return;

    const qEl = $("distractionQuestion");
    const answeredEl = $("distractionAnsweredCount");
    const input = $("distractionInput");
    const hint = $("distractionHint");

    const startBtn = $("distractionStartBtn");
    const nextBtn  = $("distractionNextBtn");
    const skipBtn  = $("distractionSkipBtn");
    const endBtn   = $("distractionEndBtn");

    if (!qEl || !answeredEl || !input || !startBtn || !nextBtn || !skipBtn || !endBtn) return;

    const SESSION_KEY = "enigmaDistractionSessionV2";

    function setButtons(running){
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display  = running ? "" : "none";
      skipBtn.style.display  = running ? "" : "none";
      endBtn.style.display   = running ? "" : "none";
      input.style.display    = running ? "" : "none";
      if (hint) hint.style.display = running ? "" : "none";
    }

    function loadSession(){
      try{
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || s.day !== todayKey()) return null;
        if (!Array.isArray(s.order) || typeof s.i !== "number") return null;
        if (typeof s.answered !== "number") s.answered = 0;
        return s;
      }catch{
        return null;
      }
    }

    function saveSession(s){
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }

    function clearSession(){
      localStorage.removeItem(SESSION_KEY);
    }

    function currentQuestion(s){
      const idx = s.order[s.i];
      return DISTRACTION_QUESTIONS[idx] || "Take one slow breath in… and out.";
    }

    function updateUI(s){
      qEl.textContent = currentQuestion(s);
      answeredEl.textContent = String(s.answered);
      input.value = "";
      setButtons(true);
    }

    function startNew(){
      const max = Math.min(20, DISTRACTION_QUESTIONS.length);
      const order = shuffleArray([...Array(DISTRACTION_QUESTIONS.length).keys()]).slice(0, max);
      const s = { day: todayKey(), order, i: 0, answered: 0 };
      saveSession(s);
      updateUI(s);
      input.focus();
    }

    function nextQuestion(s){
      if (s.i >= s.order.length - 1){
        endSession(s, "Nice work ✅ You’ve finished today’s questions.");
        return;
      }
      s.i += 1;
      saveSession(s);
      updateUI(s);
      input.focus();
    }

    function endSession(s, msg){
      clearSession();
      setButtons(false);
      qEl.textContent = msg || "All done ✅";
      answeredEl.textContent = String(s?.answered || 0);
    }

    // Start
    startBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      startNew();
    }, { passive:false });

    // Next (requires typing)
    nextBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession() || null;
      if (!s) return startNew();

      const text = (input.value || "").trim();
      if (!text){
        if (hint) hint.textContent = "Type any answer (even one word) to go Next — or Skip.";
        input.focus();
        return;
      }

      s.answered += 1; // ONLY counts answered
      saveSession(s);
      if (hint) hint.textContent = "Next requires typing. Skip if you’d rather not answer.";
      nextQuestion(s);
    }, { passive:false });

    // Skip (does not count)
    skipBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession() || null;
      if (!s) return startNew();
      nextQuestion(s);
    }, { passive:false });

    // End
    endBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      endSession(s, "All done ✅ You can start again any time.");
    }, { passive:false });

    // Resume session if exists today
    const existing = loadSession();
    if (existing){
      updateUI(existing);
    } else {
      setButtons(false);
      qEl.textContent = "Tap Start to begin.";
      answeredEl.textContent = "0";
    }
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded",()=>{
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
