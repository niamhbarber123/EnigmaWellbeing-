/* =========================================================
   Enigma • app.js (WORKING + DISTRACTION FIXED)
   - Theme (night mode)
   - Back navigation
   - Breathe animation (Start/Stop)
   - Quotes (save)
   - Music (moods + links + minutes)
   - Yoga (moods + video links)
   - Distraction (typing required + Skip allowed + End + answered-only counter)
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
     QUOTES (basic save)
  ========================= */
  const QUOTES = [
    {q:"Nothing can dim the light that shines from within.",a:"Maya Angelou"},
    {q:"No one can make you feel inferior without your consent.",a:"Eleanor Roosevelt"},
    {q:"Well-behaved women seldom make history.",a:"Laurel Thatcher Ulrich"},
    {q:"My peace is my priority.",a:"Affirmation"}
  ];

  function initQuotes(){
    const grid = $("quoteGrid");
    if (!grid) return;

    const saved = new Set(JSON.parse(localStorage.getItem("enigmaQuotes") || "[]"));
    grid.innerHTML = "";

    QUOTES.forEach(item=>{
      const tile = document.createElement("div");
      tile.className = "quote-tile" + (saved.has(item.q) ? " saved" : "");
      tile.innerHTML = `
        <div style="font-weight:900;color:#5a4b7a; line-height:1.35;">“${item.q}”</div>
        <small>— ${item.a}</small>
        <button class="quote-save-btn ${saved.has(item.q) ? "saved" : ""}" type="button">
          ${saved.has(item.q) ? "💜 Saved" : "💜 Save"}
        </button>
      `;

      tile.querySelector("button").addEventListener("click", (e)=>{
        e.preventDefault();
        if (saved.has(item.q)) saved.delete(item.q);
        else saved.add(item.q);
        localStorage.setItem("enigmaQuotes", JSON.stringify([...saved]));
        initQuotes();
      }, { passive:false });

      grid.appendChild(tile);
    });
  }

  /* =========================
     MUSIC (moods + links + minutes)
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
     DISTRACTION (typing required)
     - Next requires typed text
     - Skip doesn't count
     - Progress counts ANSWERED only
     - End finishes any time
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
    "What would your ‘calm alter ego’ do next?"
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
    const answeredCountEl = $("distractionAnsweredCount");
    const input = $("distractionInput");
    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");

    // Must match your NEW index.html ids
    if (!qEl || !answeredCountEl || !input || !startBtn || !nextBtn || !skipBtn || !endBtn) return;

    const SESSION_KEY = "enigmaDistractionSessionV2";
    const ANSWERS_KEY = "enigmaDistractionAnswersV2";

    function setButtons(running){
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display  = running ? "" : "none";
      skipBtn.style.display  = running ? "" : "none";
      endBtn.style.display   = running ? "" : "none";
      input.disabled = !running;
      if (!running) input.value = "";
      refreshNextEnabled();
    }

    function refreshNextEnabled(){
      const hasText = (input.value || "").trim().length > 0;
      nextBtn.disabled = !hasText;
      nextBtn.style.opacity = hasText ? "1" : "0.55";
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

    function getQuestion(s){
      const idx = s.order[s.i];
      return DISTRACTION_QUESTIONS[idx] || "Take one slow breath in… and out.";
    }

    function updateUI(s){
      qEl.textContent = getQuestion(s);
      answeredCountEl.textContent = String(s.answered || 0);
      input.value = "";
      input.focus({ preventScroll:true });
      setButtons(true);
    }

    function saveAnswer(question, answer){
      const store = JSON.parse(localStorage.getItem(ANSWERS_KEY) || "[]");
      store.unshift({ day: todayKey(), q: question, a: answer, t: Date.now() });
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(store.slice(0, 120)));
    }

    function startNew(){
      const max = Math.min(20, DISTRACTION_QUESTIONS.length);
      const order = shuffleArray([...Array(DISTRACTION_QUESTIONS.length).keys()]).slice(0, max);

      const s = { day: todayKey(), order, i: 0, answered: 0 };
      saveSession(s);
      updateUI(s);
    }

    function nextQuestion(s){
      if (s.i >= s.order.length - 1){
        endSession(s, "You reached the end of the questions ✅");
        return;
      }
      s.i += 1;
      saveSession(s);
      updateUI(s);
    }

    function endSession(s, message){
      clearSession();
      setButtons(false);
      qEl.textContent = message || "Session ended.";
      answeredCountEl.textContent = String(s?.answered || 0);
    }

    input.addEventListener("input", refreshNextEnabled);

    startBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      startNew();
    }, { passive:false });

    nextBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      if (!s) return startNew();

      const ans = (input.value || "").trim();
      if (!ans){
        alert("Please type something or press Skip.");
        return;
      }

      const q = getQuestion(s);
      saveAnswer(q, ans);

      s.answered = (s.answered || 0) + 1;
      saveSession(s);

      nextQuestion(s);
    }, { passive:false });

    skipBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      if (!s) return startNew();
      // skip DOES NOT count
      nextQuestion(s);
    }, { passive:false });

    endBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      endSession(s || { answered: Number(answeredCountEl.textContent||0) }, "Session ended. You can start again any time 💜");
    }, { passive:false });

    // resume session
    const existing = loadSession();
    if (existing){
      updateUI(existing);
    }else{
      setButtons(false);
      qEl.textContent = "Tap Start to begin.";
      answeredCountEl.textContent = "0";
    }
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded",()=>{
    applyTheme();
    initTheme();
    initBreathe();
    initQuotes();
    initMusic();
    initYoga();
    initDistraction();
  });

})();
