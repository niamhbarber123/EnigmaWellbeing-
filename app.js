/* =========================================================
   Enigma Wellbeing • app.js (STABLE)
   - Back always goes Home
   - Theme toggle
   - Word of the Day
   - Distraction
   - Breathe
   - Quotes (save)
   - Yoga + Music
   - Books + Resources (expanded)
   - Journal (save/view/delete)
   - Progress
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* =========================
     NAV (Back always Home)
  ========================= */
  window.enigmaHome = function () { location.href = "index.html"; };
  window.enigmaBack = function () { location.href = "index.html"; };

  /* =========================
     STORAGE HELPERS
  ========================= */
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function writeJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  /* =========================
     THEME
  ========================= */
  function applyTheme() {
    const t = localStorage.getItem("enigmaTheme") || "light";
    const night = t === "night";
    document.body.classList.toggle("night", night);
    const btn = $("themeFab");
    if (btn) btn.textContent = night ? "☀️" : "🌙";
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
     WORD OF THE DAY
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

  const WOTD = [
    { w:"Forgiveness", d:"Releasing resentment so you can move forward lighter." },
    { w:"Honesty", d:"Choosing truth with kindness—to yourself and others." },
    { w:"Trust", d:"Allowing confidence in yourself, others, or the process." },
    { w:"Responsibility", d:"Owning your choices and responding with intention." },
    { w:"Flexibility", d:"Adapting without losing your centre." },
    { w:"Boldness", d:"Taking brave steps even when you feel unsure." },
    { w:"Discretion", d:"Using good judgement about what to share and when." },
    { w:"Discipline", d:"Doing what helps you—even when motivation fades." },
    { w:"Detail", d:"Noticing the small things that improve the whole." },
    { w:"Prosperity", d:"Growing resources and wellbeing in a healthy way." },
    { w:"Acceptance", d:"Letting reality be what it is—so you can respond wisely." },
    { w:"Surrender", d:"Loosening the grip on what you can’t control." },
    { w:"Sincerity", d:"Being genuine—your real self is enough." },
    { w:"Serenity", d:"A quiet steadiness, even when life is loud." },
    { w:"Humility", d:"Staying grounded and open to learning." },
    { w:"Sensitivity", d:"Noticing feelings and needs—yours and others’." },
    { w:"Compassion", d:"Meeting struggle with warmth instead of judgement." },
    { w:"Integrity", d:"Aligning actions with values—even in small moments." },
    { w:"Clarity", d:"Seeing what matters most, without the noise." },
    { w:"Balance", d:"Making space for rest, effort, joy, and recovery." }
  ];

  function pickWotd() {
    const rand = mulberry32(seedFromToday());
    const i = Math.floor(rand() * WOTD.length);
    return WOTD[i] || WOTD[0];
  }

  function initWotdPage() {
    const page = $("wordPage");
    if (!page) return;
    const wBig = $("wotdWordBig");
    const dBig = $("wotdDescBig");
    if (!wBig || !dBig) return;
    const { w, d } = pickWotd();
    wBig.textContent = w;
    dBig.textContent = d;
  }

  /* =========================
     VIBRATION
  ========================= */
  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
  }

  /* =========================
     BREATHE
  ========================= */
  function fmtTime(totalSec) {
    totalSec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2,"0")}`;
  }

function initBreathe() {
  const page = $("breathePage");
  if (!page) return;

  const phaseEl = $("breathPhase");
  const tipEl = $("breathTip");
  const circle = $("breatheCircle");

  const startBtn = $("breathStartBtn");
  const stopBtn = $("breathStopBtn");
  const completeBtn = $("breathCompleteBtn");

  const modeSelect = $("breathModeSelect");         // timer / stopwatch
  const durationSelect = $("breathDurationSelect"); // minutes
  const durationRow = $("breathDurationRow");

  const timerLabel = $("breathTimerLabel");
  const stopwatchLabel = $("breathStopwatchLabel");

  const vibrateToggle = $("breathVibrateToggle");

  if (!phaseEl || !tipEl || !circle || !startBtn || !stopBtn || !completeBtn) return;

  // ---- timings (seconds) ----
  const INHALE = 5;
  const HOLD = 1;
  const EXHALE = 6;

  // ---- state ----
  let running = false;
  let tA = null;
  let tB = null;

  // timer/stopwatch
  let mode = modeSelect ? (modeSelect.value || "timer") : "timer";
  let timerEndAt = 0;
  let stopwatchStartAt = 0;
  let clockInt = null;

  function vibrate(ms) {
    try {
      if (vibrateToggle && vibrateToggle.checked && navigator.vibrate) navigator.vibrate(ms);
    } catch {}
  }

  function fmtTime(totalSec) {
    totalSec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function clearTimers() {
    if (tA) clearTimeout(tA);
    if (tB) clearTimeout(tB);
    tA = tB = null;

    if (clockInt) clearInterval(clockInt);
    clockInt = null;
  }

  function setVisual(state) {
    // state: "inhale" | "hold" | "exhale"
    circle.classList.remove("breath-inhale", "breath-exhale");
    if (state === "inhale") circle.classList.add("breath-inhale"); // retract
    if (state === "exhale") circle.classList.add("breath-exhale"); // expand
  }

  function setText(title, tip) {
    phaseEl.textContent = title;
    tipEl.textContent = tip || title;
  }

  function updateModeUI() {
    if (!modeSelect || !durationSelect || !timerLabel || !stopwatchLabel) return;

    mode = modeSelect.value || "timer";
    const isTimer = mode === "timer";

    if (durationRow) durationRow.style.display = isTimer ? "" : "none";
    timerLabel.style.display = isTimer ? "" : "none";
    stopwatchLabel.style.display = isTimer ? "none" : "";

    // reset labels
    timerLabel.textContent = "Time: —";
    stopwatchLabel.textContent = "Stopwatch: 0:00";
  }

  function startClock() {
    if (!timerLabel || !stopwatchLabel) return;

    clearInterval(clockInt);
    clockInt = setInterval(() => {
      if (!running) return;

      const now = Date.now();
      if (mode === "timer") {
        const remaining = Math.ceil((timerEndAt - now) / 1000);
        timerLabel.textContent = `Time: ${fmtTime(remaining)}`;
        if (remaining <= 0) {
          completeSession();
        }
      } else {
        const elapsed = Math.floor((now - stopwatchStartAt) / 1000);
        stopwatchLabel.textContent = `Stopwatch: ${fmtTime(elapsed)}`;
      }
    }, 250);
  }

  function breatheLoop() {
    if (!running) return;

    // Inhale (retract)
    setVisual("inhale");
    setText("Breathe in", "Breathe in slowly…");
    vibrate(15);

    tA = setTimeout(() => {
      if (!running) return;

      // Hold
      setVisual("hold");
      setText("Hold", "Hold gently…");
      vibrate(10);

      tB = setTimeout(() => {
        if (!running) return;

        // Exhale (expand)
        setVisual("exhale");
        setText("Breathe out", "Breathe out gently…");
        vibrate(15);

        tA = setTimeout(() => {
          if (!running) return;

          // Hold (after exhale)
          setVisual("hold");
          setText("Hold", "Let your shoulders soften…");
          vibrate(10);

          tB = setTimeout(() => {
            if (!running) return;
            breatheLoop();
          }, HOLD * 1000);

        }, EXHALE * 1000);

      }, HOLD * 1000);

    }, INHALE * 1000);
  }

  function startSession() {
    if (running) return;
    running = true;

    updateModeUI();

    // init timer/stopwatch
    const now = Date.now();
    if (modeSelect && durationSelect && timerLabel && stopwatchLabel) {
      mode = modeSelect.value || "timer";
      if (mode === "timer") {
        const mins = Math.max(1, parseInt(durationSelect.value || "1", 10));
        timerEndAt = now + mins * 60 * 1000;
        timerLabel.textContent = `Time: ${fmtTime(mins * 60)}`;
      } else {
        stopwatchStartAt = now;
        stopwatchLabel.textContent = "Stopwatch: 0:00";
      }
      startClock();
    }

    startBtn.disabled = true;
    stopBtn.disabled = false;

    breatheLoop();
  }

  function stopSession() {
    running = false;
    clearTimers();
    setVisual("hold");
    setText("Ready", "Tap Start to begin.");
    startBtn.disabled = false;
    stopBtn.disabled = true;

    if (timerLabel) timerLabel.textContent = "Time: —";
    if (stopwatchLabel) stopwatchLabel.textContent = "Stopwatch: 0:00";
  }

  function completeSession() {
    // save minutes to breathe log (so progress can use it)
    const log = readJSON("enigmaBreatheLog", { totalMin: 0, byDay: {} });
    let addMin = 1;

    if (modeSelect && durationSelect) {
      const m = modeSelect.value || "timer";
      if (m === "timer") addMin = Math.max(1, parseInt(durationSelect.value || "1", 10));
      else {
        const elapsedSec = (Date.now() - stopwatchStartAt) / 1000;
        addMin = Math.max(1, Math.round(elapsedSec / 60));
      }
    }

    log.totalMin = (log.totalMin || 0) + addMin;
    log.byDay = log.byDay || {};
    log.byDay[todayKey()] = (log.byDay[todayKey()] || 0) + addMin;
    writeJSON("enigmaBreatheLog", log);

    vibrate([30, 60, 30]);

    stopSession();
    setText("Completed ✅", "Nice work. Tap Start any time.");
  }

  // Wire controls
  startBtn.addEventListener("click", (e) => { e.preventDefault(); startSession(); });
  stopBtn.addEventListener("click", (e) => { e.preventDefault(); stopSession(); });

  completeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!running) {
      // still let them log a quick completion
      completeSession();
      return;
    }
    completeSession();
  });

  if (modeSelect) modeSelect.addEventListener("change", updateModeUI);

  // Init
  stopSession();
  updateModeUI();
}

    stopBtn.disabled = true;
    updateModeUI();
    if (timerLabel) timerLabel.textContent = "Time: —";
    if (stopwatchLabel) stopwatchLabel.textContent = "Stopwatch: 0:00";
  }

  /* =========================
     QUOTES
  ========================= */
  const QUOTES = [
    { t:"Start where you are. Use what you have. Do what you can.", a:"Arthur Ashe" },
    { t:"You do not have to see the whole staircase—just take the first step.", a:"Martin Luther King Jr." },
    { t:"It always seems impossible until it’s done.", a:"Nelson Mandela" },
    { t:"Progress, not perfection.", a:"Unknown" },
    { t:"You have survived 100% of your hardest days.", a:"Unknown" },
    { t:"Gentle is still strong.", a:"Unknown" },
    { t:"Make peace with your pace.", a:"Unknown" },
    { t:"Do the next right thing.", a:"Unknown" }
  ];

  function getSavedQuotes() { return readJSON("enigmaSavedQuotes", []); }
  function setSavedQuotes(list) { writeJSON("enigmaSavedQuotes", list); }

  function initQuotes() {
    const grid = $("quoteGrid");
    if (!grid) return;

    const searchInput = $("quoteSearch");
    const searchBtn = $("quoteSearchBtn");
    const randomBtn = $("quoteRandomBtn");
    const viewSavedBtn = $("viewSavedBtn");
    const clearSavedBtn = $("clearSavedBtn");
    const savedCount = $("savedCount");
    const status = $("quoteStatus");

    function updateSavedCount() {
      if (savedCount) savedCount.textContent = String(getSavedQuotes().length);
    }

    function render(list) {
      grid.innerHTML = "";
      const saved = getSavedQuotes();

      list.forEach((q) => {
        const tile = document.createElement("div");
        tile.className = "quote-tile";

        const text = document.createElement("div");
        text.className = "quote-text";
        text.textContent = `“${q.t}”`;

        const meta = document.createElement("div");
        meta.className = "quote-meta";

        const author = document.createElement("div");
        author.className = "quote-author";
        author.textContent = `— ${q.a}`;

        const btn = document.createElement("button");
        btn.className = "quote-save-btn";
        btn.type = "button";

        const key = `${q.t}|||${q.a}`;
        const isSaved = saved.some((s) => s.key === key);
        btn.classList.toggle("saved", isSaved);
        btn.textContent = isSaved ? "Saved 💜" : "💜 Save";

        btn.addEventListener("click", () => {
          const current = getSavedQuotes();
          const exists = current.some((s) => s.key === key);
          if (exists) setSavedQuotes(current.filter((s) => s.key !== key));
          else setSavedQuotes([{ key, ...q }, ...current]);
          updateSavedCount();
          render(list);
        });

        meta.appendChild(author);
        meta.appendChild(btn);

        tile.appendChild(text);
        tile.appendChild(meta);
        grid.appendChild(tile);
      });

      updateSavedCount();
    }

    function search() {
      const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
      if (!q) {
        if (status) status.textContent = "Tip: type a word like “calm”, “hope”, “courage”…";
        render(QUOTES);
        return;
      }
      const hits = QUOTES.filter((x) => x.t.toLowerCase().includes(q) || x.a.toLowerCase().includes(q));
      if (status) status.textContent = hits.length ? `Showing ${hits.length} result(s).` : "No results — try another word.";
      render(hits);
    }

    function random() {
      const pick = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      if (status) status.textContent = "Random quote:";
      render([pick]);
    }

    function viewSaved() {
      const s = getSavedQuotes();
      if (status) status.textContent = s.length ? "Your saved quotes:" : "No saved quotes yet.";
      render(s.map(({ t, a }) => ({ t, a })));
    }

    function clearSaved() {
      setSavedQuotes([]);
      updateSavedCount();
      if (status) status.textContent = "Saved quotes deleted.";
      render(QUOTES);
    }

    searchBtn && searchBtn.addEventListener("click", search);
    randomBtn && randomBtn.addEventListener("click", random);
    viewSavedBtn && viewSavedBtn.addEventListener("click", viewSaved);
    clearSavedBtn && clearSavedBtn.addEventListener("click", clearSaved);

    updateSavedCount();
    render(QUOTES);
  }

  /* =========================
     MUSIC
  ========================= */
  const MUSIC_TRACKS = [
    { mood:"Anxious", label:"Calm breathing music", url:"https://www.youtube.com/results?search_query=calm+breathing+music" },
    { mood:"Focus", label:"Lo-fi focus mix", url:"https://www.youtube.com/results?search_query=lofi+focus+music" },
    { mood:"Sleep", label:"Sleep music", url:"https://www.youtube.com/results?search_query=sleep+music+relaxing" },
    { mood:"Stressed", label:"Relaxing piano", url:"https://www.youtube.com/results?search_query=relaxing+piano" },
    { mood:"Sleep", label:"Ocean waves", url:"https://www.youtube.com/results?search_query=ocean+waves+sleep" },
    { mood:"Anxious", label:"432hz calm music", url:"https://www.youtube.com/results?search_query=432hz+calm+music" },
    { mood:"Focus", label:"Brown noise for focus", url:"https://www.youtube.com/results?search_query=brown+noise+focus" },
    { mood:"Sleep", label:"Rain sounds", url:"https://www.youtube.com/results?search_query=rain+sounds+sleep" }
  ];

  function initMusic() {
    const moodRow = $("musicMoodRow");
    const list = $("musicList");
    if (!moodRow || !list) return;

    const startBtn = $("musicStartBtn");
    const endBtn = $("musicEndBtn");
    const todayEl = $("musicTodayMin");
    const totalEl = $("musicTotalMin");
    const statusEl = $("musicStatus");

    const KEY = "enigmaMusic";
    function load(){ return readJSON(KEY, { today: todayKey(), todayMin:0, totalMin:0, sessionStart:0 }); }
    function save(s){ writeJSON(KEY, s); }
    function syncDay(s){
      if (s.today !== todayKey()){ s.today = todayKey(); s.todayMin = 0; s.sessionStart = 0; }
      return s;
    }

    const moods = ["All","Anxious","Stressed","Focus","Sleep"];
    let active = "All";

    function renderChips(){
      moodRow.innerHTML = "";
      moods.forEach(m=>{
        const b = document.createElement("button");
        b.className = "chip" + (m===active ? " active" : "");
        b.type = "button";
        b.textContent = m;
        b.addEventListener("click", ()=>{
          active = m;
          renderChips();
          renderTracks();
        });
        moodRow.appendChild(b);
      });
    }

    function renderTracks(){
      list.innerHTML = "";
      const tracks = (active === "All") ? MUSIC_TRACKS : MUSIC_TRACKS.filter(t=>t.mood===active);
      tracks.forEach(t=>{
        const a = document.createElement("a");
        a.className = "music-btn";
        a.href = t.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `<span>${t.label}</span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    function renderMinutes(){
      const s = syncDay(load()); save(s);
      if (todayEl) todayEl.textContent = String(s.todayMin || 0);
      if (totalEl) totalEl.textContent = String(s.totalMin || 0);
      if (statusEl) statusEl.textContent = s.sessionStart ? "Session running…" : "No active session.";
    }

    startBtn && startBtn.addEventListener("click", ()=>{
      const s = syncDay(load());
      if (s.sessionStart) return;
      s.sessionStart = Date.now();
      save(s);
      renderMinutes();
    });

    endBtn && endBtn.addEventListener("click", ()=>{
      const s = syncDay(load());
      if (!s.sessionStart) return;
      const mins = Math.max(1, Math.round((Date.now() - s.sessionStart)/60000));
      s.sessionStart = 0;
      s.todayMin = (s.todayMin||0) + mins;
      s.totalMin = (s.totalMin||0) + mins;
      save(s);
      renderMinutes();
    });

    renderChips();
    renderTracks();
    renderMinutes();
  }

  /* =========================
     YOGA
  ========================= */
  const YOGA_VIDEOS = [
    { mood:"Anxiety", label:"10 min Yoga for Anxiety", url:"https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
    { mood:"Stress", label:"15 min Gentle Yoga for Stress", url:"https://www.youtube.com/results?search_query=gentle+yoga+for+stress+15+minutes" },
    { mood:"Sleep", label:"Yoga for Sleep (wind down)", url:"https://www.youtube.com/results?search_query=yoga+for+sleep+wind+down" },
    { mood:"Morning", label:"Morning Yoga (wake up)", url:"https://www.youtube.com/results?search_query=morning+yoga+wake+up" },
    { mood:"Stiff body", label:"Yoga for stiff back/hips", url:"https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" },
    { mood:"All", label:"Gentle yoga (all levels)", url:"https://www.youtube.com/results?search_query=gentle+yoga+all+levels" },
    { mood:"Anxiety", label:"Somatic yoga for anxiety", url:"https://www.youtube.com/results?search_query=somatic+yoga+for+anxiety" },
    { mood:"Sleep", label:"Bedtime stretches", url:"https://www.youtube.com/results?search_query=bedtime+stretches+sleep" }
  ];

  function initYoga(){
    const moodRow = $("yogaMoodRow");
    const list = $("yogaList");
    if (!moodRow || !list) return;

    const moods = ["All","Anxiety","Stress","Sleep","Morning","Stiff body"];
    let active = "All";

    function renderChips(){
      moodRow.innerHTML = "";
      moods.forEach(m=>{
        const b = document.createElement("button");
        b.className = "chip" + (m===active ? " active" : "");
        b.type = "button";
        b.textContent = m;
        b.addEventListener("click", ()=>{
          active = m;
          renderChips();
          renderVideos();
        });
        moodRow.appendChild(b);
      });
    }

    function renderVideos(){
      list.innerHTML = "";
      const vids = (active === "All")
        ? YOGA_VIDEOS
        : YOGA_VIDEOS.filter(v=>v.mood===active);

      vids.forEach(v=>{
        const a = document.createElement("a");
        a.className = "music-btn";
        a.href = v.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = `<span>${v.label}</span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    renderChips();
    renderVideos();
  }

  /* =========================
     BOOKS + RESOURCES (EXPANDED)
  ========================= */
  const BOOKS = [
    // BPD / DBT
    { genre:"BPD", title:"I Hate You—Don’t Leave Me", meta:"Kreisman & Straus", desc:"Understanding BPD patterns and relationships." },
    { genre:"BPD", title:"The Borderline Personality Disorder Workbook", meta:"Daniel J. Fox", desc:"Skills + exercises for emotional stability." },
    { genre:"BPD", title:"Stop Walking on Eggshells", meta:"Paul T. Mason & Randi Kreger", desc:"Boundaries and support in difficult relationships." },
    { genre:"DBT", title:"DBT Skills Training Handouts & Worksheets", meta:"Marsha M. Linehan", desc:"Mindfulness, distress tolerance, emotion regulation." },
    { genre:"DBT", title:"The Dialectical Behavior Therapy Skills Workbook", meta:"McKay, Wood & Brantley", desc:"Practical DBT skills for everyday life." },

    // Trauma
    { genre:"Trauma", title:"The Body Keeps the Score", meta:"Bessel van der Kolk", desc:"How trauma impacts mind and body." },
    { genre:"Trauma", title:"Complex PTSD: From Surviving to Thriving", meta:"Pete Walker", desc:"Tools for healing complex trauma." },
    { genre:"Trauma", title:"What Happened to You?", meta:"Bruce Perry & Oprah Winfrey", desc:"A compassionate lens on experiences and healing." },

    // Anxiety / Panic
    { genre:"Anxiety", title:"DARE", meta:"Barry McDonagh", desc:"A practical approach to anxiety and panic." },
    { genre:"Anxiety", title:"Hope and Help for Your Nerves", meta:"Dr Claire Weekes", desc:"Classic reassurance for panic and anxiety." },

    // Depression / Mood
    { genre:"Depression", title:"Feeling Good", meta:"David D. Burns", desc:"CBT tools to challenge low mood thoughts." },
    { genre:"Depression", title:"The Upward Spiral", meta:"Alex Korb", desc:"Small changes that lift mood over time." },

    // ADHD / Focus
    { genre:"ADHD", title:"Driven to Distraction", meta:"Hallowell & Ratey", desc:"Understanding ADHD and how to cope." },
    { genre:"ADHD", title:"ADHD 2.0", meta:"Hallowell & Ratey", desc:"Modern tools for attention and wellbeing." },

    // Sleep
    { genre:"Sleep", title:"Why We Sleep", meta:"Matthew Walker", desc:"Sleep science and how to improve it." },
    { genre:"Sleep", title:"Say Good Night to Insomnia", meta:"Gregg D. Jacobs", desc:"CBT-I methods for better sleep." },

    // Self-compassion / Mindfulness
    { genre:"Self-compassion", title:"Self-Compassion", meta:"Kristin Neff", desc:"Kindness toward yourself that actually helps." },
    { genre:"Mindfulness", title:"Wherever You Go, There You Are", meta:"Jon Kabat-Zinn", desc:"Mindfulness in everyday life." },
    { genre:"Mindfulness", title:"The Happiness Trap", meta:"Russ Harris", desc:"ACT tools for difficult thoughts and feelings." },

    // Relationships
    { genre:"Relationships", title:"Attached", meta:"Levine & Heller", desc:"Attachment styles and healthier love." },
    { genre:"Relationships", title:"Nonviolent Communication", meta:"Marshall Rosenberg", desc:"Clear, kind communication skills." },

    // Grief
    { genre:"Grief", title:"It’s OK That You’re Not OK", meta:"Megan Devine", desc:"Grief support without toxic positivity." }
  ];

  const RESOURCES = [
    // NHS / UK
    { genre:"BPD", title:"NHS: Borderline Personality Disorder", desc:"Symptoms and getting help.", url:"https://www.nhs.uk/mental-health/conditions/borderline-personality-disorder/" },
    { genre:"Anxiety", title:"NHS: Anxiety disorders", desc:"Overview and support routes.", url:"https://www.nhs.uk/mental-health/conditions/generalised-anxiety-disorder/" },
    { genre:"Depression", title:"NHS: Clinical depression", desc:"Symptoms and treatments.", url:"https://www.nhs.uk/mental-health/conditions/clinical-depression/" },

    // Crisis
    { genre:"Crisis", title:"Samaritans (UK)", desc:"Call 116 123 • 24/7", url:"https://www.samaritans.org/" },
    { genre:"Crisis", title:"Shout 85258 (UK)", desc:"Text SHOUT to 85258 • 24/7", url:"https://giveusashout.org/" },

    // Charities
    { genre:"BPD", title:"Mind (BPD / EUPD info)", desc:"Support and guidance.", url:"https://www.mind.org.uk/" },
    { genre:"Anxiety", title:"Anxiety UK", desc:"Support, info and resources.", url:"https://www.anxietyuk.org.uk/" },
    { genre:"Depression", title:"Mind: Depression", desc:"Depression information and help.", url:"https://www.mind.org.uk/information-support/types-of-mental-health-problems/depression/" },
    { genre:"Trauma", title:"Mind: Trauma", desc:"Trauma information and support.", url:"https://www.mind.org.uk/information-support/types-of-mental-health-problems/trauma/" },

    // Skills
    { genre:"DBT", title:"DBT Self-Help", desc:"Free DBT skills resources.", url:"https://dbtselfhelp.com/" },
    { genre:"Mindfulness", title:"NHS: Mindfulness", desc:"Intro + simple practices.", url:"https://www.nhs.uk/mental-health/self-help/tips-and-support/mindfulness/" },
    { genre:"Sleep", title:"NHS: Sleep and tiredness", desc:"Tips for better sleep.", url:"https://www.nhs.uk/live-well/sleep-and-tiredness/" }
  ];

  function initGenreList(pageId, chipId, listId, items, renderer){
    const page = $(pageId);
    if (!page) return;

    const chips = $(chipId);
    const list = $(listId);
    if (!chips || !list) return;

    const genres = ["All", ...Array.from(new Set(items.map(x=>x.genre)))];
    let active = "All";

    function renderChips(){
      chips.innerHTML = "";
      genres.forEach(g=>{
        const b = document.createElement("button");
        b.className = "chip" + (g===active ? " active" : "");
        b.type = "button";
        b.textContent = g;
        b.addEventListener("click", ()=>{
          active = g;
          renderChips();
          renderList();
        });
        chips.appendChild(b);
      });
    }

    function renderList(){
      list.innerHTML = "";
      const filtered = (active==="All") ? items : items.filter(x=>x.genre===active);
      filtered.forEach(x=> list.appendChild(renderer(x)) );
    }

    renderChips();
    renderList();
  }

  function initBooks(){
    initGenreList("booksPage","booksGenres","booksList",BOOKS,(b)=>{
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <div class="section-title" style="font-size:16px;margin-bottom:6px;">${b.title}</div>
        <div class="gentle-text" style="margin-top:0;"><b>${b.meta}</b> • ${b.genre}</div>
        <div class="gentle-text">${b.desc}</div>
      `;
      return div;
    });
  }

  function initResources(){
    initGenreList("resourcesPage","resourcesGenres","resourcesList",RESOURCES,(r)=>{
      const a = document.createElement("a");
      a.className = "music-btn";
      a.href = r.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `<span>${r.title} <span style="opacity:.7;font-weight:800;">(${r.genre})</span></span><span>↗</span>`;
      return a;
    });
  }

  /* =========================
     JOURNAL (SAVE / VIEW / DELETE)
  ========================= */
  function initJournal() {
    const page = $("journalPage");
    if (!page) return;

    const text = $("journalText");
    const saveBtn = $("journalSaveBtn");
    const viewBtn = $("journalViewBtn");
    const delAllBtn = $("journalDeleteAllBtn");
    const status = $("journalStatus");

    const savedCard = $("journalSavedCard");
    const savedList = $("journalSavedList");

    const KEY = "enigmaJournalEntries";

    function loadEntries() {
      return readJSON(KEY, []);
    }

    function saveEntries(entries) {
      writeJSON(KEY, entries);
    }

    function setStatus(msg) {
      if (status) status.textContent = msg;
    }

    function renderSaved() {
      if (!savedCard || !savedList) return;
      const entries = loadEntries();

      if (!entries.length) {
        savedCard.style.display = "none";
        return;
      }

      savedCard.style.display = "";
      savedList.innerHTML = "";

      entries.forEach((e, idx) => {
        const wrap = document.createElement("div");
        wrap.className = "card";
        wrap.style.margin = "12px 0";
        wrap.style.padding = "14px";

        const top = document.createElement("div");
        top.style.display = "flex";
        top.style.justifyContent = "space-between";
        top.style.alignItems = "center";
        top.style.gap = "10px";

        const title = document.createElement("div");
        title.className = "section-title";
        title.style.fontSize = "15px";
        title.style.margin = "0";
        title.textContent = `${e.date} • Entry ${entries.length - idx}`;

        const del = document.createElement("button");
        del.className = "tool-btn danger";
        del.type = "button";
        del.style.minWidth = "120px";
        del.style.padding = "10px 12px";
        del.style.borderRadius = "14px";
        del.textContent = "Delete";
        del.addEventListener("click", () => {
          const next = loadEntries().filter((_, i) => i !== idx);
          saveEntries(next);
          setStatus("Entry deleted.");
          renderSaved();
        });

        top.appendChild(title);
        top.appendChild(del);

        const body = document.createElement("div");
        body.className = "gentle-text";
        body.style.marginTop = "10px";
        body.style.whiteSpace = "pre-wrap";
        body.style.display = "none";
        body.textContent = e.text;

        wrap.appendChild(top);
        wrap.appendChild(body);

        wrap.addEventListener("click", (ev) => {
          // don’t toggle when clicking the delete button
          if (ev.target === del) return;
          body.style.display = body.style.display === "none" ? "" : "none";
        });

        savedList.appendChild(wrap);
      });
    }

    saveBtn && saveBtn.addEventListener("click", () => {
      const value = (text ? text.value : "").trim();
      if (!value) {
        setStatus("Write something first, then tap Save.");
        return;
      }
      const entries = loadEntries();
      entries.unshift({ date: todayKey(), text: value });
      saveEntries(entries);

      if (text) text.value = "";
      setStatus("Saved ✅");
      renderSaved();
    });

    viewBtn && viewBtn.addEventListener("click", () => {
      const entries = loadEntries();
      if (!entries.length) {
        setStatus("No saved entries yet.");
        return;
      }
      setStatus("Showing saved entries below.");
      renderSaved();
      // scroll to saved card
      if (savedCard) savedCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    delAllBtn && delAllBtn.addEventListener("click", () => {
      if (!confirm("Delete all journal entries? This cannot be undone.")) return;
      localStorage.removeItem(KEY);
      setStatus("All entries deleted.");
      if (savedCard) savedCard.style.display = "none";
    });

    renderSaved();
  }

  /* =========================
     PROGRESS
  ========================= */
  function initProgress(){
    const page = $("progressPage");
    if (!page) return;

    const pBreathedToday = $("pBreathedToday");
    const pMusicToday = $("pMusicToday");
    const pSavedQuotes = $("pSavedQuotes");
    const pMusicTotal = $("pMusicTotal");
    const pBreatheTotal = $("pBreatheTotal");

    const b = readJSON("enigmaBreatheLog", { totalMin:0, byDay:{} });
    const m = readJSON("enigmaMusic", { today: todayKey(), todayMin:0, totalMin:0, sessionStart:0 });
    const s = readJSON("enigmaSavedQuotes", []);

    const breathedToday = Number((b.byDay && b.byDay[todayKey()]) || 0);
    const breatheTotal = Number(b.totalMin || 0);

    const musicToday = (m.today === todayKey()) ? Number(m.todayMin || 0) : 0;
    const musicTotal = Number(m.totalMin || 0);

    if (pBreathedToday) pBreathedToday.textContent = String(breathedToday);
    if (pBreatheTotal) pBreatheTotal.textContent = String(breatheTotal);

    if (pMusicToday) pMusicToday.textContent = String(musicToday);
    if (pMusicTotal) pMusicTotal.textContent = String(musicTotal);

    if (pSavedQuotes) pSavedQuotes.textContent = String(s.length || 0);
  }

  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    initTheme();

    initWotdPage();
    initBreathe();
    initQuotes();
    initMusic();
    initYoga();
    initBooks();
    initResources();
    initJournal();
    initProgress();
  });
})();
