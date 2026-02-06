/* =========================================================
   Enigma Wellbeing • app.js (FULL)
   - Theme (night mode)
   - Back navigation
   - Breathe (EXHALE expands, INHALE retracts)
   - Quotes (local save)
   - Music (moods + minutes)
   - Yoga (moods + links)
   - Word of the day (daily + modal + ? button)
   - Distraction (typing required to count as answered)
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
     BREATHE (EXHALE expands)
  ========================= */
  function initBreathe(){
    const page = $("breathePage");
    if (!page) return;

    const circle = $("breatheCircle");
    const phase  = $("breathPhase");
    const tip    = $("breathTip");
    const start  = $("breathStartBtn");
    const stop   = $("breathStopBtn");

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

      // ✅ INHALE = retract (as requested)
      circle.classList.add("inhale");
      circle.classList.remove("exhale");
      setText("Inhale", "Breathe in slowly…");

      t1 = setTimeout(() => {
        if (!running) return;

        // ✅ EXHALE = expand (as requested)
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

    reset();
  }

  /* =========================
     WORD OF THE DAY
  ========================= */
  const WOTD_TIP =
    "Using these words as affirmations means you can repeat them to yourself, write them down, or think about them regularly to help cultivate those qualities within yourself.";

  const WOTD_WORDS = [
    { w:"Forgiveness", d:"Letting go of what weighs you down so you can move forward." },
    { w:"Honesty", d:"Choosing truth with kindness — with yourself and others." },
    { w:"Trust", d:"Allowing space for safety, patience, and steady belief." },
    { w:"Responsibility", d:"Owning your choices with care and self-respect." },
    { w:"Flexibility", d:"Bending without breaking — adapting gently to change." },
    { w:"Boldness", d:"Taking a brave step, even when it feels uncomfortable." },
    { w:"Discretion", d:"Choosing what to share and what to keep private with wisdom." },
    { w:"Discipline", d:"Small steady actions that protect your goals and wellbeing." },
    { w:"Detail", d:"Noticing the small things that help you feel grounded." },
    { w:"Prosperity", d:"Allowing good things — time, energy, support — to grow." },
    { w:"Acceptance", d:"Making peace with what is, so you can choose what’s next." },
    { w:"Surrender", d:"Releasing control of what you can’t change." },
    { w:"Sincerity", d:"Showing up as real — honest feelings, honest effort." },
    { w:"Serenity", d:"A calm centre you can return to, even when life is loud." },
    { w:"Humility", d:"Strength without ego — staying open to learning." },
    { w:"Sensitivity", d:"Honouring your feelings as signals, not problems." },
    { w:"Compassion", d:"Speaking to yourself the way you would to someone you love." },
    { w:"Leadership", d:"Guiding with calm, care, and steadiness." },
    { w:"Integrity", d:"Matching your actions to your values." },
    { w:"Action", d:"One small step that makes things feel more possible." },
    { w:"Courage", d:"Feeling fear and choosing to move anyway." },
    { w:"Creativity", d:"Letting ideas and playfulness soften the mind." },
    { w:"Gentleness", d:"Doing things softly — especially with yourself." },
    { w:"Clarity", d:"Finding the next right step, not the whole staircase." },
    { w:"Balance", d:"Making room for effort and rest." },
    { w:"Fun", d:"Letting joy count — even in small moments." },
    { w:"Commitment", d:"Staying connected to what matters to you." },
    { w:"Patience", d:"Allowing time to do its quiet work." },
    { w:"Freedom", d:"Creating space where you can breathe and be yourself." },
    { w:"Reflection", d:"Pausing to understand and choose wisely." },
    { w:"Giving", d:"Sharing care — including care for yourself." },
    { w:"Enthusiasm", d:"A spark of energy that helps you begin." },
    { w:"Joy", d:"Letting lightness exist, even briefly." },
    { w:"Satisfaction", d:"Noticing what is enough and what is working." },
    { w:"Grace", d:"Soft strength — doing your best without harshness." },
    { w:"Simplicity", d:"Choosing what matters and letting go of the rest." },
    { w:"Communication", d:"Saying what you need clearly and kindly." },
    { w:"Appropriateness", d:"Choosing what fits the moment with care." },
    { w:"Strength", d:"Quiet resilience — you’re still here." },
    { w:"Love", d:"Warmth, connection, and belonging." },
    { w:"Tenderness", d:"Treating yourself gently when you’re vulnerable." },
    { w:"Perseverance", d:"Keeping going — especially through small steps." },
    { w:"Reliability", d:"Being someone you can count on — including to yourself." },
    { w:"Initiative", d:"Starting before you feel fully ready." },
    { w:"Confidence", d:"Trusting you can handle what comes next." },
    { w:"Authenticity", d:"Being real — no performance required." },
    { w:"Harmony", d:"Letting things work together rather than clash." },
    { w:"Pleasure", d:"Allowing comfort and enjoyment without guilt." },
    { w:"Risk", d:"A thoughtful leap toward growth." },
    { w:"Efficiency", d:"Doing what matters with less drain." },
    { w:"Spontaneity", d:"Letting the day contain something light and unexpected." },
    { w:"Fulfilment", d:"Living in a way that feels meaningful to you." }
  ];

  function seededIndexFromDate(len){
    // stable daily pick without API calls
    const day = todayKey();
    let h = 0;
    for (let i = 0; i < day.length; i++){
      h = (h * 31 + day.charCodeAt(i)) >>> 0;
    }
    return h % len;
  }

  function initWOTD(){
    const tile = $("wotdTile");
    const wordEl = $("wotdWord");
    const descEl = $("wotdDesc");
    const infoBtn = $("wotdInfoBtn");

    const modal = $("wotdModal");
    const backdrop = $("wotdBackdrop");
    const closeBtn = $("wotdCloseBtn");
    const mWord = $("wotdModalWord");
    const mDesc = $("wotdModalDesc");

    if (!tile || !wordEl || !descEl || !infoBtn || !modal || !backdrop || !closeBtn || !mWord || !mDesc) return;

    const idx = seededIndexFromDate(WOTD_WORDS.length);
    const item = WOTD_WORDS[idx];

    wordEl.textContent = item.w;
    descEl.textContent = item.d;

    mWord.textContent = item.w;
    mDesc.textContent = item.d;

    function open(){
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    }
    function close(){
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    }

    // clicking tile opens modal (but ignore clicking the ? button itself)
    tile.addEventListener("click", (e)=>{
      const t = e.target;
      if (t && t.id === "wotdInfoBtn") return;
      open();
    });

    infoBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      open();
    });

    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    // ESC close (desktop)
    document.addEventListener("keydown", (e)=>{
      if (e.key === "Escape") close();
    });
  }

  /* =========================
     DISTRACTION (HOME, SINGLE TILE)
     - Next requires typing (counts as answered)
     - Skip does not count
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
    "What’s a film or series that feels comforting?",
    "What’s one smell that instantly relaxes you?",
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?",
    "What would your ‘calm alter ego’ do next?",
    "What’s one gentle stretch you can do right now?",
    "What is a ‘good enough’ goal for today?",
    "What’s a comforting word or phrase you like?",
    "What’s one thing you can forgive yourself for today?"
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
    const countEl = $("distractionAnsweredCount");
    const inputWrap = $("distractionInputWrap");
    const input = $("distractionInput");

    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");

    if (!qEl || !countEl || !inputWrap || !input || !startBtn || !nextBtn || !skipBtn || !endBtn) return;

    const SESSION_KEY = "enigmaDistractionSessionV2";

    function load(){
      try{
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || s.day !== todayKey()) return null;
        return s;
      }catch{
        return null;
      }
    }

    function save(s){
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }

    function clear(){
      localStorage.removeItem(SESSION_KEY);
    }

    function setMode(running){
      inputWrap.style.display = running ? "" : "none";
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display = running ? "" : "none";
      skipBtn.style.display = running ? "" : "none";
      endBtn.style.display = running ? "" : "none";
    }

    function render(s){
      qEl.textContent = s.questions[s.i] || "Take one slow breath in… and out.";
      countEl.textContent = String(s.answered || 0);
      setMode(true);
      input.value = "";
      input.focus();
    }

    function newSession(){
      const questions = shuffleArray(DISTRACTION_QUESTIONS).slice(0, 12); // short to avoid scrolling
      const s = { day: todayKey(), questions, i: 0, answered: 0 };
      save(s);
      render(s);
    }

    function advance(s){
      if (s.i >= s.questions.length - 1){
        // end automatically
        clear();
        setMode(false);
        qEl.textContent = "Nice work ✅ You can stop here or start again.";
        return;
      }
      s.i += 1;
      save(s);
      render(s);
    }

    // Start
    startBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      newSession();
    });

    // Next (requires typing)
    nextBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = load() || (newSession(), load());
      if (!s) return;

      const txt = (input.value || "").trim();
      if (!txt){
        // gentle nudge
        qEl.textContent = "Type anything (even one word) — or tap Skip.";
        return;
      }

      s.answered = (s.answered || 0) + 1;
      save(s);
      advance(s);
    });

    // Skip (does not count)
    skipBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = load() || (newSession(), load());
      if (!s) return;
      advance(s);
    });

    // End
    endBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = load();
      clear();
      setMode(false);
      qEl.textContent = s ? `Ended. Answered ${s.answered || 0}.` : "Ended.";
      countEl.textContent = s ? String(s.answered || 0) : "0";
    });

    // Resume if active
    const existing = load();
    if (existing){
      render(existing);
    }else{
      setMode(false);
      qEl.textContent = "Tap Start to begin.";
      countEl.textContent = "0";
    }
  }

  /* =========================
     MUSIC / YOGA / QUOTES / PROGRESS
     (kept minimal here — your pages will still work)
  ========================= */

  // Quotes: your quotes.html is already tile-based in CSS;
  // app logic can be extended later if needed.

  function initMusic(){
    // only run if musicList exists
    const list = $("musicList");
    const chipsWrap = $("moodChips");
    if (!list || !chipsWrap) return;

    const MUSIC_MOODS = ["All","Anxious","Stressed","Focus","Sleep"];
    const TRACKS = [
      {t:"Calm breathing music",m:"Anxious",u:"https://www.youtube.com/watch?v=odADwWzHR24"},
      {t:"Lo-fi focus mix",m:"Focus",u:"https://www.youtube.com/watch?v=jfKfPfyJRdk"},
      {t:"Sleep music",m:"Sleep",u:"https://www.youtube.com/watch?v=DWcJFNfaw9c"},
      {t:"Relaxing piano",m:"Stressed",u:"https://www.youtube.com/watch?v=1ZYbU82GVz4"},
      {t:"Ocean waves",m:"Sleep",u:"https://www.youtube.com/watch?v=eKFTSSKCzWA"}
    ];

    let mood = localStorage.getItem("enigmaMusicMood") || "All";

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

    function renderTracks(){
      list.innerHTML = "";
      TRACKS.filter(x => mood === "All" || x.m === mood).forEach(x=>{
        const a = document.createElement("a");
        a.href = x.u;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "music-btn";
        a.innerHTML = `<span>${x.t}</span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    renderChips();
    renderTracks();
  }

  function initYoga(){
    const chipsWrap = $("yogaMoodChips");
    const list = $("yogaVideoList");
    if (!chipsWrap || !list) return;

    const YOGA_MOODS = ["All","Anxiety","Stress","Sleep","Morning","Stiff body"];
    const YOGA_VIDEOS = [
      { t:"10 min Yoga for Anxiety", m:"Anxiety", u:"https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
      { t:"15 min Gentle Yoga for Stress", m:"Stress", u:"https://www.youtube.com/results?search_query=15+minute+gentle+yoga+for+stress" },
      { t:"Yoga for Sleep (wind down)", m:"Sleep", u:"https://www.youtube.com/results?search_query=yoga+for+sleep+bedtime" },
      { t:"Morning Yoga (wake up)", m:"Morning", u:"https://www.youtube.com/results?search_query=morning+yoga+10+minutes" },
      { t:"Yoga for stiff back/hips", m:"Stiff body", u:"https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" },
      { t:"Gentle yoga (all levels)", m:"All", u:"https://www.youtube.com/results?search_query=gentle+yoga+all+levels" }
    ];

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
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded",()=>{
    applyTheme();
    initTheme();
    initBreathe();

    // Home features:
    initWOTD();
    initDistraction();

    // Other pages:
    initMusic();
    initYoga();
  });

})();
