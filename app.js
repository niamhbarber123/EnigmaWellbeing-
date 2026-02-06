/* =========================================================
   Enigma Wellbeing • app.js (FULL WORKING)
   - Theme (night mode)
   - Back navigation
   - Breathe animation (Start/Stop) + inhale/exhale colours
   - Quotes (motivational) search + random + save
   - Music (moods + links + minutes)
   - Yoga (moods + video links)
   - Word of the day (daily affirmation word + description + tooltip)
   - Distraction (typed answers required to count + skip + end + answered tracker)
   - Progress (fills progress page)
========================================================= */

(function () {
  "use strict";

  function $(id){ return document.getElementById(id); }

  window.enigmaBack = function(){
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  function todayKey(){
    return new Date().toISOString().split("T")[0];
  }

  /* =========================
     THEME
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
     BREATHE
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
      setText("Breathe in", "Breathe in slowly…");

      t1 = setTimeout(() => {
        if (!running) return;

        circle.classList.add("exhale");
        circle.classList.remove("inhale");
        setText("Breathe out", "Breathe out gently…");

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
     MUSIC
  ========================= */
  const MUSIC_MOODS = ["All","Anxious","Stressed","Focus","Sleep"];

  const TRACKS = [
    {t:"Calm breathing music",m:"Anxious",u:"https://www.youtube.com/watch?v=odADwWzHR24"},
    {t:"Lo-fi focus mix",m:"Focus",u:"https://www.youtube.com/watch?v=jfKfPfyJRdk"},
    {t:"Sleep music",m:"Sleep",u:"https://www.youtube.com/watch?v=DWcJFNfaw9c"},
    {t:"Relaxing piano",m:"Stressed",u:"https://www.youtube.com/watch?v=1ZYbU82GVz4"},
    {t:"Ocean waves",m:"Sleep",u:"https://www.youtube.com/watch?v=eKFTSSKCzWA"}
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
     YOGA
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
     WORD OF THE DAY (daily affirmation word)
  ========================= */
  const WOTD = [
    { w:"Forgiveness", d:"I release what weighs me down and make space for peace." },
    { w:"Honesty", d:"I speak and live with truth, kindness, and clarity." },
    { w:"Trust", d:"I trust myself and take one steady step forward." },
    { w:"Responsibility", d:"I choose what I can control and let the rest soften." },
    { w:"Flexibility", d:"I can adapt with calm and keep my balance." },
    { w:"Boldness", d:"I show up for my life with courage and heart." },
    { w:"Discretion", d:"I choose my words wisely and protect my peace." },
    { w:"Discipline", d:"Small steady actions create big change." },
    { w:"Detail", d:"I notice the small things that support my wellbeing." },
    { w:"Prosperity", d:"I welcome good things and use them wisely." },
    { w:"Acceptance", d:"I allow this moment to be what it is — then choose my next step." },
    { w:"Surrender", d:"I loosen my grip and let life breathe." },
    { w:"Sincerity", d:"I am genuine, grounded, and true to myself." },
    { w:"Serenity", d:"I return to calm, again and again." },
    { w:"Humility", d:"I stay open to learning and growing." },
    { w:"Sensitivity", d:"I honour my feelings and care for them gently." },
    { w:"Compassion", d:"I treat myself with the same kindness I offer others." },
    { w:"Leadership", d:"I guide myself with courage and care." },
    { w:"Integrity", d:"My actions match my values." },
    { w:"Action", d:"One small step is still progress." },
    { w:"Courage", d:"I can do hard things — gently." },
    { w:"Creativity", d:"I allow new ideas and play to enter my day." },
    { w:"Gentleness", d:"Softness is strength." },
    { w:"Clarity", d:"I choose the next right thing." },
    { w:"Balance", d:"I can rest and still move forward." },
    { w:"Fun", d:"Joy belongs in my life too." },
    { w:"Commitment", d:"I keep promises to myself." },
    { w:"Patience", d:"I give myself time." },
    { w:"Freedom", d:"I loosen fear’s grip and choose what matters." },
    { w:"Reflection", d:"I pause to understand and choose wisely." },
    { w:"Giving", d:"I offer kindness without losing myself." },
    { w:"Enthusiasm", d:"I welcome energy and possibility." },
    { w:"Joy", d:"I notice what is good right now." },
    { w:"Satisfaction", d:"I allow ‘enough’ to be enough." },
    { w:"Grace", d:"I soften around imperfection." },
    { w:"Simplicity", d:"I let it be easy where it can be." },
    { w:"Communication", d:"I express what I need with calm honesty." },
    { w:"Appropriateness", d:"I choose what fits this moment with wisdom." },
    { w:"Strength", d:"I am stronger than this feeling." },
    { w:"Love", d:"I am worthy of care and connection." },
    { w:"Tenderness", d:"I handle myself gently today." },
    { w:"Perseverance", d:"I keep going — one step at a time." },
    { w:"Reliability", d:"I can count on myself." },
    { w:"Initiative", d:"I begin — even if it’s small." },
    { w:"Confidence", d:"I trust my ability to cope." },
    { w:"Authenticity", d:"I don’t have to pretend to be okay." },
    { w:"Harmony", d:"I choose peace in my body and mind." },
    { w:"Pleasure", d:"I allow small comforts to matter." },
    { w:"Risk", d:"I can try, even with uncertainty." },
    { w:"Efficiency", d:"I focus on what helps most." },
    { w:"Spontaneity", d:"I allow lightness and surprise." },
    { w:"Fulfilment", d:"I build a life that feels meaningful to me." }
  ];

  function dateSeedNumber(){
    // stable daily number from YYYY-MM-DD
    const k = todayKey().replaceAll("-", "");
    let n = 0;
    for (let i=0;i<k.length;i++) n = (n*31 + k.charCodeAt(i)) >>> 0;
    return n;
  }

  function initWordOfDay(){
    const wordEl = $("wotdWord");
    const wordBig = $("wotdWordBig");
    const descEl = $("wotdDesc");
    const card = $("wotdCard");
    const openBtn = $("wotdOpenBtn");
    const closeBtn = $("wotdCloseBtn");
    const helpBtn = $("wotdHelpBtn");
    const tip = $("wotdTip");

    if (!wordEl || !openBtn) return; // home only

    const pick = WOTD[ dateSeedNumber() % WOTD.length ];
    wordEl.textContent = pick.w;
    if (wordBig) wordBig.textContent = pick.w;
    if (descEl) descEl.textContent = pick.d;

    openBtn.addEventListener("click", ()=>{
      if (!card) return;
      card.style.display = (card.style.display === "none" ? "" : "none");
      if (tip) tip.style.display = "none";
    });

    if (closeBtn && card){
      closeBtn.addEventListener("click", ()=>{
        card.style.display = "none";
        if (tip) tip.style.display = "none";
      });
    }

    if (helpBtn && tip){
      helpBtn.addEventListener("click", (e)=>{
        e.stopPropagation();
        tip.style.display = (tip.style.display === "none" ? "" : "none");
      });
    }
  }

  /* =========================
     QUOTES (motivational + search + random)
     Uses Quotable API (works from GitHub Pages)
  ========================= */
  const QUOTE_FALLBACK = [
    { q:"Start where you are. Use what you have. Do what you can.", a:"Arthur Ashe" },
    { q:"It always seems impossible until it’s done.", a:"Nelson Mandela" },
    { q:"Small steps every day.", a:"Unknown" },
    { q:"Progress, not perfection.", a:"Unknown" },
    { q:"You’ve survived 100% of your hardest days.", a:"Unknown" }
  ];

  function getSavedQuotes(){
    const raw = localStorage.getItem("enigmaQuotes");
    try{
      const a = JSON.parse(raw || "[]");
      return Array.isArray(a) ? a : [];
    }catch{
      return [];
    }
  }

  function setSavedQuotes(arr){
    localStorage.setItem("enigmaQuotes", JSON.stringify(arr));
  }

  function isSavedQuote(saved, q, a){
    return saved.some(x => x.q === q && x.a === a);
  }

  function toggleSaveQuote(q, a){
    const saved = getSavedQuotes();
    const idx = saved.findIndex(x => x.q === q && x.a === a);
    if (idx >= 0) saved.splice(idx, 1);
    else saved.push({q, a});
    setSavedQuotes(saved);
    return saved;
  }

  function renderQuotes(grid, list){
    const saved = getSavedQuotes();
    grid.innerHTML = "";

    list.forEach(item=>{
      const tile = document.createElement("div");
      tile.className = "quote-tile";

      const savedNow = isSavedQuote(saved, item.q, item.a);

      tile.innerHTML = `
        <div class="quote-text">“${item.q}”</div>
        <div class="quote-meta">
          <div class="quote-author">— ${item.a || "Unknown"}</div>
          <button class="quote-save-btn ${savedNow ? "saved" : ""}" type="button">
            ${savedNow ? "💜 Saved" : "💜 Save"}
          </button>
        </div>
      `;

      tile.querySelector("button").addEventListener("click", (e)=>{
        e.preventDefault();
        toggleSaveQuote(item.q, item.a || "Unknown");
        // rerender quickly
        renderQuotes(grid, list);
        const savedCount = $("savedCount");
        if (savedCount) savedCount.textContent = String(getSavedQuotes().length);
      });

      grid.appendChild(tile);
    });
  }

  async function fetchQuoteSearch(query){
    const url = `https://api.quotable.io/search/quotes?query=${encodeURIComponent(query)}&limit=12`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Quote search failed");
    const data = await res.json();
    const results = (data && data.results) ? data.results : [];
    return results.map(r => ({ q: r.content, a: r.author }));
  }

  async function fetchRandomQuote(){
    const url = `https://api.quotable.io/random?tags=motivational|inspirational|wisdom|happiness|life`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Random quote failed");
    const r = await res.json();
    return { q: r.content, a: r.author };
  }

  function initQuotes(){
    const grid = $("quoteGrid");
    if (!grid) return;

    const searchInput = $("quoteSearch");
    const searchBtn = $("quoteSearchBtn");
    const randomBtn = $("quoteRandomBtn");
    const viewSavedBtn = $("viewSavedBtn");
    const clearSavedBtn = $("clearSavedBtn");
    const status = $("quoteStatus");
    const savedCount = $("savedCount");

    function updateSavedCount(){
      if (savedCount) savedCount.textContent = String(getSavedQuotes().length);
    }

    async function doSearch(){
      const q = (searchInput?.value || "").trim();
      if (!q){
        status && (status.textContent = "Type something to search (e.g. courage, hope).");
        return;
      }
      status && (status.textContent = "Searching…");
      try{
        const results = await fetchQuoteSearch(q);
        if (!results.length){
          status && (status.textContent = "No results found — try a different word.");
          renderQuotes(grid, QUOTE_FALLBACK);
        }else{
          status && (status.textContent = `Showing results for “${q}”.`);
          renderQuotes(grid, results);
        }
      }catch{
        status && (status.textContent = "Couldn’t reach the quote service. Showing offline quotes.");
        renderQuotes(grid, QUOTE_FALLBACK);
      }
      updateSavedCount();
    }

    async function doRandom(){
      status && (status.textContent = "Finding something motivational…");
      try{
        const one = await fetchRandomQuote();
        renderQuotes(grid, [one]);
        status && (status.textContent = "Random quote loaded.");
      }catch{
        renderQuotes(grid, QUOTE_FALLBACK);
        status && (status.textContent = "Offline mode — showing saved set.");
      }
      updateSavedCount();
    }

    searchBtn && searchBtn.addEventListener("click", (e)=>{ e.preventDefault(); doSearch(); });
    randomBtn && randomBtn.addEventListener("click", (e)=>{ e.preventDefault(); doRandom(); });

    // Enter key searches
    if (searchInput){
      searchInput.addEventListener("keydown", (e)=>{
        if (e.key === "Enter"){
          e.preventDefault();
          doSearch();
        }
      });
    }

    viewSavedBtn && viewSavedBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const saved = getSavedQuotes();
      if (!saved.length){
        status && (status.textContent = "No saved quotes yet — tap 💜 to save one.");
        renderQuotes(grid, QUOTE_FALLBACK);
      }else{
        status && (status.textContent = "Showing saved quotes.");
        renderQuotes(grid, saved);
      }
      updateSavedCount();
    });

    clearSavedBtn && clearSavedBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      if (!confirm("Delete all saved quotes?")) return;
      setSavedQuotes([]);
      status && (status.textContent = "Saved quotes cleared.");
      renderQuotes(grid, QUOTE_FALLBACK);
      updateSavedCount();
    });

    // initial load: random
    updateSavedCount();
    doRandom();
  }

  /* =========================
     DISTRACTION (typing required to count)
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
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?",
    "What would your ‘calm alter ego’ do next?",
    "Pick an animal—what would it say to reassure you?",
    "What’s one gentle stretch you can do right now?"
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
    const input = $("distractionInput");
    const answeredCountEl = $("distractionAnsweredCount");
    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");
    const hint = $("distractionHint");

    if (!qEl || !input || !answeredCountEl || !startBtn || !nextBtn || !skipBtn || !endBtn) return;

    const SESSION_KEY = "enigmaDistractionSession2";
    const ANSWER_TOTAL_KEY = "enigmaDistractionAnsweredTotal";

    function setButtons(running){
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display = running ? "" : "none";
      skipBtn.style.display = running ? "" : "none";
      endBtn.style.display  = running ? "" : "none";
      input.style.display   = running ? "" : "none";
      hint.style.display    = running ? "" : "none";
    }

    function loadSession(){
      try{
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || s.day !== todayKey()) return null;
        if (!Array.isArray(s.order) || typeof s.i !== "number") return null;
        return s;
      }catch{
        return null;
      }
    }

    function saveSession(s){ localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
    function clearSession(){ localStorage.removeItem(SESSION_KEY); }

    function currentQuestion(s){
      const idx = s.order[s.i];
      return DISTRACTION_QUESTIONS[idx] || "Take one slow breath in… and out.";
    }

    function updateUI(s){
      qEl.textContent = currentQuestion(s);
      answeredCountEl.textContent = String(s.answered);
      input.value = "";
      input.focus({preventScroll:true});
      setButtons(true);
    }

    function startNew(){
      const order = shuffleArray([...Array(DISTRACTION_QUESTIONS.length).keys()]);
      const s = { day: todayKey(), order, i: 0, answered: 0 };
      saveSession(s);
      updateUI(s);
    }

    function endSession(s){
      // store answered total for progress
      const total = Number(localStorage.getItem(ANSWER_TOTAL_KEY) || 0) + Number(s.answered || 0);
      localStorage.setItem(ANSWER_TOTAL_KEY, String(total));

      clearSession();
      setButtons(false);
      qEl.textContent = "Done ✅";
      answeredCountEl.textContent = String(s.answered || 0);
    }

    function nextQuestion(s){
      if (s.i >= s.order.length - 1){
        endSession(s);
        return;
      }
      s.i += 1;
      saveSession(s);
      updateUI(s);
    }

    startBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      startNew();
    });

    nextBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      if (!s) return startNew();

      const val = (input.value || "").trim();
      if (!val){
        hint.textContent = "Please type anything (even one word) — or press Skip.";
        return;
      }

      hint.textContent = "Next requires typing. Skip if you’d rather not answer.";
      s.answered += 1;
      saveSession(s);
      nextQuestion(s);
    });

    skipBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      if (!s) return startNew();
      hint.textContent = "Next requires typing. Skip if you’d rather not answer.";
      nextQuestion(s);
    });

    endBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      if (!s){
        setButtons(false);
        qEl.textContent = "Tap Start to begin.";
        return;
      }
      endSession(s);
    });

    // resume
    const existing = loadSession();
    if (existing){
      setButtons(true);
      updateUI(existing);
    }else{
      setButtons(false);
      qEl.textContent = "Tap Start to begin.";
      answeredCountEl.textContent = "0";
      input.style.display = "none";
      hint.style.display = "none";
    }
  }

  /* =========================
     PROGRESS
  ========================= */
  function initProgress(){
    const page = $("progressPage");
    if (!page) return;

    const today = todayKey();

    const breatheStore = JSON.parse(localStorage.getItem("enigmaBreatheCompletes") || "{}");
    const breathedToday = Number(breatheStore[today] || 0);

    const musicStore = JSON.parse(localStorage.getItem("enigmaMusicMinutes") || "{}");
    const musicToday = Number(musicStore[today] || 0);
    const musicTotal = Object.values(musicStore).reduce((a,v)=>a + Number(v||0), 0);

    const savedQuotes = getSavedQuotes();
    const savedQuotesCount = Array.isArray(savedQuotes) ? savedQuotes.length : 0;

    const distractAnsweredTotal = Number(localStorage.getItem("enigmaDistractionAnsweredTotal") || 0);

    $("pBreathedToday") && ($("pBreathedToday").textContent = String(breathedToday));
    $("pMusicToday")   && ($("pMusicToday").textContent   = String(musicToday));
    $("pMusicTotal")   && ($("pMusicTotal").textContent   = String(musicTotal));
    $("pSavedQuotes")  && ($("pSavedQuotes").textContent  = String(savedQuotesCount));
    $("pDistractAnswered") && ($("pDistractAnswered").textContent = String(distractAnsweredTotal));
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded",()=>{
    applyTheme();
    initTheme();
    initBreathe();
    initMusic();
    initYoga();
    initQuotes();
    initWordOfDay();
    initDistraction();
    initProgress();
  });

})();
