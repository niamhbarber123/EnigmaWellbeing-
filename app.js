/* =========================================================
   Enigma • app.js (WORKING + DISTRACTION)
   - Theme (night mode)
   - Back navigation
   - Breathe animation (Start/Stop)
   - Quotes (save)
   - Music (moods + links + minutes)
   - Yoga (moods + video links)
   - Distraction (random questions + next/skip/complete + localStorage)
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
     DISTRACTION (home questions)
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
    "What’s a hobby you’d like to try one day?",
    "Name 3 colours you can spot around you.",
    "What’s one thing you can tidy in 30 seconds?",
    "If your thoughts were weather, what’s the forecast—and what would help?",
    "What’s one gentle stretch you can do right now?",
    "What’s your favourite smell of soap/shower gel?",
    "What is a ‘good enough’ goal for today?",
    "What’s a nice word that starts with the same letter as your name?",
    "What’s your favourite comfy outfit?",
    "If you had a calm superpower, what would it be?",
    "What’s something you’ve learned about yourself recently?",
    "Name 5 foods you enjoy.",
    "Name 5 places you’d like to visit.",
    "What’s your favourite sound (rain, waves, fire, birds)?",
    "What’s a compliment you’ve received that you still remember?",
    "What’s a scent that reminds you of a good memory?",
    "If you could press pause on one thing, what would it be?",
    "What’s one boundary that helps you feel safe?",
    "What’s a comforting word or phrase you like?",
    "What’s your favourite warm light (candles, fairy lights, lamp)?",
    "What’s one thing you’ve overcome before?",
    "What’s one small thing your body is doing well right now?",
    "If you could message future-you, what would you say?",
    "What’s a colour that matches your mood?",
    "Name 3 people/characters who feel ‘safe’ to you.",
    "If you could swap tasks with someone for a day, what would you pick?",
    "What’s a gentle plan for tonight?",
    "What’s your favourite breakfast?",
    "What’s a smell you’d put in a candle?",
    "If you could rename today, what would you call it?",
    "What’s one simple thing you can do to be kind to yourself right now?",
    "What’s your favourite texture (fuzzy, smooth, cool)?",
    "Name 5 items you could pack for a calm picnic.",
    "What’s something you can do slowly on purpose (sip water, breathe, stretch)?",
    "If you could live inside a book/film for 1 hour, which one?",
    "What’s a nice word you like the sound of?",
    "What’s a tiny decision you can make to help future-you?",
    "What’s one thing that’s ‘not urgent’ right now?",
    "If you could give your brain a break button, what would it do?",
    "What would a perfect ‘quiet morning’ look like?",
    "What’s one thing you can put off until later?",
    "Name 3 things you appreciate about your home/space.",
    "If you could pet any animal right now, what would it be?",
    "What’s the most calming colour combination?",
    "If you could eat one meal forever, what would it be?",
    "What’s a gentle mantra you could repeat 3 times?",
    "What would you do if you had zero pressure for the next hour?",
    "What’s one thing you can forgive yourself for today?",
    "What’s something you’re proud of that no one sees?",
    "What’s one smell you wish existed?",
    "If your mind was a room, what would you change first?",
    "What’s a tiny treat you could give yourself later?",
    "Name 5 objects you could draw right now.",
    "What’s something you can do with your hands (fidget, fold, doodle)?",
    "What’s one thing you’d like to hear from someone today?",
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
    // Home page only
    const card = $("distractionCard");
    if (!card) return;

    const qEl = $("distractionQuestion");
    const meta = $("distractionMeta");
    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const completeBtn = $("distractionCompleteBtn");

    if (!qEl || !meta || !startBtn || !nextBtn || !skipBtn || !completeBtn) return;

    const SESSION_KEY = "enigmaDistractionSession";
    const COMPLETE_KEY = "enigmaDistractionCompletes";

    function setButtons(state){
      // state: "idle" | "running"
      const running = state === "running";
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display = running ? "" : "none";
      skipBtn.style.display = running ? "" : "none";
      completeBtn.style.display = running ? "" : "none";
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
      meta.textContent = `Question ${s.i + 1} of ${s.order.length} • Answered ${s.answered} • Skipped ${s.skipped}`;
      setButtons("running");
    }

    function startNew(){
      const max = Math.min(30, DISTRACTION_QUESTIONS.length); // 30-question session (nice length)
      const order = shuffleArray([...Array(DISTRACTION_QUESTIONS.length).keys()]).slice(0, max);

      const s = {
        day: todayKey(),
        order,
        i: 0,
        answered: 0,
        skipped: 0,
        startedAt: Date.now()
      };

      saveSession(s);
      updateUI(s);
    }

    function finish(s){
      // Save completion count per day
      const day = todayKey();
      const store = JSON.parse(localStorage.getItem(COMPLETE_KEY) || "{}");
      store[day] = (store[day] || 0) + 1;
      localStorage.setItem(COMPLETE_KEY, JSON.stringify(store));

      clearSession();
      setButtons("idle");

      qEl.textContent = "Nice work ✅";
      meta.textContent = `Completed. Answered ${s.answered} • Skipped ${s.skipped}. You can start again any time.`;
    }

    function advance(s){
      if (s.i >= s.order.length - 1){
        finish(s);
        return;
      }
      s.i += 1;
      saveSession(s);
      updateUI(s);
    }

    // Wire buttons
    startBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      startNew();
    }, { passive:false });

    nextBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      if (!s) return startNew();
      s.answered += 1;
      saveSession(s);
      advance(s);
    }, { passive:false });

    skipBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      if (!s) return startNew();
      s.skipped += 1;
      saveSession(s);
      advance(s);
    }, { passive:false });

    completeBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = loadSession();
      if (!s){
        qEl.textContent = "All done ✅";
        meta.textContent = "Tap Start whenever you want a new set of questions.";
        setButtons("idle");
        return;
      }
      finish(s);
    }, { passive:false });

    // Resume if there’s an active session today
    const existing = loadSession();
    if (existing){
      updateUI(existing);
    }else{
      setButtons("idle");
      qEl.textContent = "Tap Start to begin.";
      meta.textContent = "Ready when you are.";
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
