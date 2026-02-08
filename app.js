/* =========================================================
   Enigma Wellbeing • app.js (FULL STABLE)
   - Back button ALWAYS goes Home
   - Theme toggle
   - WOTD separate page + home mini tile
   - Distraction stable
   - Breathe: Timer + Stopwatch + vibration, inhale retract, exhale expand
   - Quotes (more) + saved
   - Yoga + Music chips
   - Resources (includes BPD) + Books (genre)
   - Progress
========================================================= */

(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);

  /* ============ NAV ============ */
  window.enigmaHome = function () { location.href = "index.html"; };
  window.enigmaBack = function () { location.href = "index.html"; };

  /* ============ DATE/STORE ============ */
  function todayKey() { return new Date().toISOString().split("T")[0]; }
  function readJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  }
  function writeJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  /* ============ THEME ============ */
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
   WORD OF THE DAY — FINAL
========================= */

const WOTD = [
  {
    w: "Harmony",
    d: "Finding calm alignment within and around you.",
    a: "I allow my thoughts and feelings to exist in balance."
  },
  {
    w: "Gentleness",
    d: "Soft strength — especially with yourself.",
    a: "I treat myself with patience and care."
  },
  {
    w: "Clarity",
    d: "Seeing what matters most without the noise.",
    a: "I let go of what distracts me from what matters."
  },
  {
    w: "Balance",
    d: "Making space for rest, effort, and recovery.",
    a: "I honour both rest and action."
  },
  {
    w: "Patience",
    d: "Letting growth take the time it takes.",
    a: "I trust my timing."
  },
  {
    w: "Courage",
    d: "Feeling fear and still choosing what matters.",
    a: "I am brave in small, meaningful ways."
  },
  {
    w: "Compassion",
    d: "Meeting struggle with warmth instead of judgement.",
    a: "I respond to difficulty with kindness."
  },
  {
    w: "Acceptance",
    d: "Allowing things to be as they are.",
    a: "I stop fighting what I cannot change."
  },
  {
    w: "Resilience",
    d: "Bending without breaking.",
    a: "I recover, even when things are hard."
  },
  {
    w: "Presence",
    d: "Being here — not where your thoughts pull you.",
    a: "I return to this moment."
  }
];

function dateKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function seededIndex(key) {
  let n = Number(key.replace(/-/g, ""));
  n = Math.sin(n) * 10000;
  return Math.floor((n - Math.floor(n)) * WOTD.length);
}

function getWOTD(offset = 0) {
  const key = dateKey(offset);
  return { ...WOTD[seededIndex(key)], key };
}

function getSavedWords() {
  return JSON.parse(localStorage.getItem("enigmaSavedWords") || "[]");
}

function toggleSave(wordObj) {
  let saved = getSavedWords();
  const exists = saved.find(w => w.key === wordObj.key);
  if (exists) {
    saved = saved.filter(w => w.key !== wordObj.key);
  } else {
    saved.unshift(wordObj);
  }
  localStorage.setItem("enigmaSavedWords", JSON.stringify(saved));
  return !exists;
}

function initWOTD() {
  let offset = 0;

  const els = {
    word: document.getElementById("wotdWord"),
    desc: document.getElementById("wotdDesc"),
    bigWord: document.getElementById("wotdWordBig"),
    bigDesc: document.getElementById("wotdDescBig"),
    affirm: document.getElementById("wotdAffirm"),
    save: document.getElementById("wotdSaveBtn"),
    prev: document.getElementById("wotdPrevBtn"),
    next: document.getElementById("wotdNextBtn")
  };

  function render() {
    const data = getWOTD(offset);

    if (els.word) els.word.textContent = data.w;
    if (els.desc) els.desc.textContent = data.d;

    if (els.bigWord) els.bigWord.textContent = data.w;
    if (els.bigDesc) els.bigDesc.textContent = data.d;
    if (els.affirm) els.affirm.textContent = data.a;

    if (els.save) {
      const saved = getSavedWords().some(w => w.key === data.key);
      els.save.textContent = saved ? "Saved 💜" : "Save 💜";
      els.save.classList.toggle("saved", saved);
      els.save.onclick = () => {
        toggleSave(data);
        render();
      };
    }

    document.body.classList.remove("fade");
    void document.body.offsetWidth;
    document.body.classList.add("fade");
  }

  els.prev && (els.prev.onclick = () => { offset--; render(); });
  els.next && (els.next.onclick = () => { offset++; render(); });

  render();
}
  /* ============ DISTRACTION ============ */
  const DISTRACTION_QUESTIONS = [
    "Name 5 things you can see right now.",
    "Name 4 things you can feel (touch/texture).",
    "Name 3 things you can hear.",
    "Name 2 things you can smell.",
    "Name 1 thing you can taste (or would like to taste).",
    "What colour feels calming to you today?",
    "What’s a tiny ‘safe’ plan for the next 10 minutes?",
    "What’s one kind thing you’d say to a friend feeling this way?",
    "What’s your favourite cosy drink?",
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?",
    "What is a ‘good enough’ goal for today?"
  ];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  function initDistraction() {
    if (!$("distractionCard")) return;

    const qEl = $("distractionQuestion");
    const answeredEl = $("distractionAnsweredCount");
    const inputWrap = $("distractionInputWrap");
    const input = $("distractionInput");
    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");
    if (!qEl||!answeredEl||!inputWrap||!input||!startBtn||!nextBtn||!skipBtn||!endBtn) return;

    const KEY = "enigmaDistractionSessionV3";

    function setRunning(r) {
      startBtn.style.display = r ? "none" : "";
      nextBtn.style.display = r ? "" : "none";
      skipBtn.style.display = r ? "" : "none";
      endBtn.style.display  = r ? "" : "none";
      inputWrap.style.display = r ? "" : "none";
      if (!r) input.value = "";
    }

    function load() {
      const s = readJSON(KEY, null);
      if (!s || s.day !== todayKey()) return null;
      if (!Array.isArray(s.order)) return null;
      return s;
    }
    function save(s){ writeJSON(KEY,s); }
    function clear(){ localStorage.removeItem(KEY); }

    function currentQ(s){
      const idx = s.order[s.i];
      return DISTRACTION_QUESTIONS[idx] || "Take one slow breath in… and out.";
    }
    function render(s){
      qEl.textContent = currentQ(s);
      answeredEl.textContent = String(s.answered||0);
      input.value = "";
      setRunning(true);
    }
    function startNew(){
      const order = shuffle([...Array(DISTRACTION_QUESTIONS.length).keys()]);
      const s = { day: todayKey(), order, i: 0, answered: 0 };
      save(s); render(s);
    }
    function advance(s){
      if (s.i >= s.order.length-1){
        qEl.textContent = "You’re done. Take a slow breath.";
        setRunning(false);
        clear();
        return;
      }
      s.i += 1;
      save(s);
      render(s);
    }

    startBtn.addEventListener("click", (e)=>{ e.preventDefault(); startNew(); });
    nextBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = load() || (startNew(), load());
      if (!s) return;
      const text = (input.value||"").trim();
      if (!text){
        input.focus();
        qEl.textContent = "Type any answer (even one word) — or tap Skip.";
        setTimeout(()=>{ const s2=load(); if(s2) qEl.textContent=currentQ(s2); }, 900);
        return;
      }
      s.answered += 1;
      save(s);
      advance(s);
    });
    skipBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const s = load() || (startNew(), load());
      if (!s) return;
      advance(s);
    });
    endBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      clear();
      setRunning(false);
      qEl.textContent = "Ended. You can start again any time.";
      answeredEl.textContent = "0";
    });

    const existing = load();
    if (existing) render(existing);
    else { setRunning(false); qEl.textContent="Tap Start to begin."; answeredEl.textContent="0"; }
  }

  /* ============ VIBRATE ============ */
  function vibrate(pattern){
    try{ if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
  }

  /* ============ BREATHE ============ */
  function fmtTime(sec){
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec/60);
    const s = sec%60;
    return `${m}:${String(s).padStart(2,"0")}`;
  }

  function initBreathe(){
    if (!$("breathePage")) return;

    const phaseEl = $("breathPhase");
    const tipEl = $("breathTip");
    const circle = $("breatheCircle");
    const startBtn = $("breathStartBtn");
    const stopBtn = $("breathStopBtn");
    const completeBtn = $("breathCompleteBtn");
    const modeSelect = $("breathModeSelect");
    const durationRow = $("breathDurationRow");
    const durationSelect = $("breathDurationSelect");
    const timerLabel = $("breathTimerLabel");
    const stopwatchLabel = $("breathStopwatchLabel");
    const vibrateToggle = $("breathVibrateToggle");

    if(!phaseEl||!tipEl||!circle||!startBtn||!stopBtn||!completeBtn||!modeSelect||!durationSelect||!timerLabel||!stopwatchLabel||!durationRow) return;

    let running=false, rafId=null;

    const inhaleSec=5, exhaleSec=6, holdSec=1;
    let phase="ready";
    let phaseEndsAt=0;
    let mode = modeSelect.value || "timer";
    let endAt=0, startAt=0;

    function wantsVibe(){ return !!(vibrateToggle && vibrateToggle.checked); }

    function setPhase(p,text){
      phase=p;
      phaseEl.textContent=text;
      tipEl.textContent=text;

      circle.classList.remove("breath-inhale","breath-exhale");
      if (p==="inhale") circle.classList.add("breath-inhale");  // retract
      if (p==="exhale") circle.classList.add("breath-exhale");  // expand

      if (wantsVibe()) vibrate(20);
    }

    function updateModeUI(){
      mode = modeSelect.value || "timer";
      const isTimer = mode==="timer";
      durationRow.style.display = isTimer ? "" : "none";
      timerLabel.style.display = isTimer ? "" : "none";
      stopwatchLabel.style.display = isTimer ? "none" : "";
    }

    modeSelect.addEventListener("change", ()=>{
      updateModeUI();
      if(!running){
        timerLabel.textContent="Time: —";
        stopwatchLabel.textContent="Stopwatch: 0:00";
      }
    });

    function startSession(){
      if(running) return;
      running=true;
      updateModeUI();

      const now=Date.now();
      if(mode==="timer"){
        const minutes = parseInt(durationSelect.value||"1",10);
        const totalSec = Math.max(1, minutes)*60;
        endAt = now + totalSec*1000;
        timerLabel.textContent = `Time: ${fmtTime(totalSec)}`;
      } else {
        startAt = now;
        stopwatchLabel.textContent = "Stopwatch: 0:00";
      }

      setPhase("inhale","Breathe in");
      phaseEndsAt = now + inhaleSec*1000;

      startBtn.disabled=true;
      stopBtn.disabled=false;

      tick();
    }

    function stopSession(label){
      running=false;
      if(rafId) cancelAnimationFrame(rafId);
      rafId=null;
      circle.classList.remove("breath-inhale","breath-exhale");
      phaseEl.textContent = label || "Ready";
      tipEl.textContent = "Tap Start to begin.";
      startBtn.disabled=false;
      stopBtn.disabled=true;
    }

    function completeSession(){
      const log = readJSON("enigmaBreatheLog",{totalMin:0,byDay:{}});
      let addMin=1;

      if(mode==="timer"){
        addMin = parseInt(durationSelect.value||"1",10);
      } else {
        const elapsedSec = (Date.now()-startAt)/1000;
        addMin = Math.max(1, Math.round(elapsedSec/60));
      }

      log.totalMin = (log.totalMin||0)+addMin;
      log.byDay = log.byDay || {};
      log.byDay[todayKey()] = (log.byDay[todayKey()]||0)+addMin;
      writeJSON("enigmaBreatheLog",log);

      if(wantsVibe()) vibrate([40,60,40]);
      stopSession("Completed ✅");
      setTimeout(()=>{ phaseEl.textContent="Ready"; tipEl.textContent="Tap Start to begin."; }, 900);
    }

    let holdAfterExhale=false;

    function tick(){
      if(!running) return;
      const now=Date.now();

      if(mode==="timer"){
        const remainingSec = Math.ceil((endAt-now)/1000);
        timerLabel.textContent = `Time: ${fmtTime(remainingSec)}`;
        if(remainingSec<=0){ completeSession(); return; }
      } else {
        const elapsedSec = Math.floor((now-startAt)/1000);
        stopwatchLabel.textContent = `Stopwatch: ${fmtTime(elapsedSec)}`;
      }

      if(now>=phaseEndsAt){
        if(phase==="inhale"){
          setPhase("hold","Hold");
          holdAfterExhale=false;
          phaseEndsAt = now + holdSec*1000;
        } else if(phase==="hold" && !holdAfterExhale){
          setPhase("exhale","Breathe out");
          phaseEndsAt = now + exhaleSec*1000;
        } else if(phase==="exhale"){
          setPhase("hold","Hold");
          holdAfterExhale=true;
          phaseEndsAt = now + holdSec*1000;
        } else if(phase==="hold" && holdAfterExhale){
          setPhase("inhale","Breathe in");
          holdAfterExhale=false;
          phaseEndsAt = now + inhaleSec*1000;
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    startBtn.addEventListener("click",(e)=>{ e.preventDefault(); startSession(); });
    stopBtn.addEventListener("click",(e)=>{ e.preventDefault(); stopSession("Ready"); });
    completeBtn.addEventListener("click",(e)=>{ e.preventDefault(); completeSession(); });

    startBtn.disabled=false;
    stopBtn.disabled=true;
    updateModeUI();
    timerLabel.textContent="Time: —";
    stopwatchLabel.textContent="Stopwatch: 0:00";
  }

  /* ============ QUOTES ============ */
  const QUOTES = [
    { t:"Start where you are. Use what you have. Do what you can.", a:"Arthur Ashe" },
    { t:"You do not have to see the whole staircase—just take the first step.", a:"Martin Luther King Jr." },
    { t:"It always seems impossible until it’s done.", a:"Nelson Mandela" },
    { t:"Small steps every day.", a:"Unknown" },
    { t:"Breathe. This is just a moment, not your whole life.", a:"Unknown" },
    { t:"You have survived 100% of your hardest days.", a:"Unknown" },
    { t:"Progress, not perfection.", a:"Unknown" },
    { t:"Feelings are visitors. Let them come and go.", a:"Rumi" },
    { t:"Nothing can dim the light that shines from within.", a:"Maya Angelou" },
    { t:"Act as if what you do makes a difference. It does.", a:"William James" },
    { t:"Be kind to yourself. You’re doing the best you can.", a:"Unknown" },
    { t:"Make peace with your pace.", a:"Unknown" },
    { t:"Slow progress is still progress.", a:"Unknown" },
    { t:"Rest is productive.", a:"Unknown" },
    { t:"The only way out is through.", a:"Robert Frost" },
    { t:"This too shall pass.", a:"Persian proverb" },
    { t:"Wherever you go, there you are.", a:"Jon Kabat-Zinn" },
    { t:"What you practice grows stronger.", a:"Unknown" },
    { t:"Gentle is still strong.", a:"Unknown" },
    { t:"You are not behind. You are on your path.", a:"Unknown" },
    { t:"Do the next right thing.", a:"Unknown" },
    { t:"One day at a time.", a:"Unknown" },
    { t:"Your calm is a superpower.", a:"Unknown" },
    { t:"You can be nervous and do it anyway.", a:"Unknown" }
  ];

  function getSavedQuotes(){ return readJSON("enigmaSavedQuotes", []); }
  function setSavedQuotes(list){ writeJSON("enigmaSavedQuotes", list); }

  function initQuotes(){
    const grid = $("quoteGrid");
    if(!grid) return;

    const searchInput = $("quoteSearch");
    const searchBtn = $("quoteSearchBtn");
    const randomBtn = $("quoteRandomBtn");
    const viewSavedBtn = $("viewSavedBtn");
    const clearSavedBtn = $("clearSavedBtn");
    const savedCount = $("savedCount");
    const status = $("quoteStatus");

    function updateSavedCount(){
      if(savedCount) savedCount.textContent = String(getSavedQuotes().length);
    }

    function render(list){
      grid.innerHTML="";
      const saved = getSavedQuotes();

      list.forEach((q)=>{
        const tile=document.createElement("div");
        tile.className="quote-tile";

        const text=document.createElement("div");
        text.className="quote-text";
        text.textContent=`"${q.t}"`;

        const meta=document.createElement("div");
        meta.className="quote-meta";

        const author=document.createElement("div");
        author.className="quote-author";
        author.textContent=`— ${q.a}`;

        const btn=document.createElement("button");
        btn.className="quote-save-btn";
        btn.type="button";

        const key = `${q.t}|||${q.a}`;
        const isSaved = saved.some(s=>s.key===key);
        btn.classList.toggle("saved", isSaved);
        btn.textContent = isSaved ? "Saved 💜" : "💜 Save";

        btn.addEventListener("click", ()=>{
          const current=getSavedQuotes();
          const exists=current.some(s=>s.key===key);
          if(exists) setSavedQuotes(current.filter(s=>s.key!==key));
          else setSavedQuotes([{key,...q}, ...current]);
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

    function search(){
      const q=(searchInput?searchInput.value:"").trim().toLowerCase();
      if(!q){
        if(status) status.textContent="Tip: try “calm”, “hope”, “courage”…";
        render(QUOTES.slice(0,12));
        return;
      }
      const hits=QUOTES.filter(x=>x.t.toLowerCase().includes(q) || x.a.toLowerCase().includes(q));
      if(status) status.textContent = hits.length ? `Showing ${hits.length} result(s).` : "No results — try another word.";
      render(hits.slice(0,40));
    }

    function random(){
      const pick = QUOTES[Math.floor(Math.random()*QUOTES.length)];
      if(status) status.textContent="Random quote:";
      render([pick]);
    }

    function viewSaved(){
      const s=getSavedQuotes();
      if(status) status.textContent = s.length ? "Your saved quotes:" : "No saved quotes yet.";
      render(s.map(({t,a})=>({t,a})));
    }

    function clearSaved(){
      setSavedQuotes([]);
      updateSavedCount();
      if(status) status.textContent="Saved quotes deleted.";
      render(QUOTES.slice(0,12));
    }

    if(searchBtn) searchBtn.addEventListener("click", search);
    if(randomBtn) randomBtn.addEventListener("click", random);
    if(viewSavedBtn) viewSavedBtn.addEventListener("click", viewSaved);
    if(clearSavedBtn) clearSavedBtn.addEventListener("click", clearSaved);

    updateSavedCount();
    render(QUOTES.slice(0,12));
  }

  /* ============ MUSIC ============ */
  const MUSIC_TRACKS = [
    { mood:"Anxious", label:"Calm breathing music", url:"https://www.youtube.com/results?search_query=calm+breathing+music" },
    { mood:"Stressed", label:"Relaxing piano", url:"https://www.youtube.com/results?search_query=relaxing+piano" },
    { mood:"Focus", label:"Lo-fi focus mix", url:"https://www.youtube.com/results?search_query=lofi+focus+music" },
    { mood:"Sleep", label:"Sleep music", url:"https://www.youtube.com/results?search_query=sleep+music+relaxing" },
    { mood:"Sleep", label:"Ocean waves", url:"https://www.youtube.com/results?search_query=ocean+waves+sleep" }
  ];

  function initMusic(){
    const moodRow=$("musicMoodRow");
    const list=$("musicList");
    if(!moodRow||!list) return;

    const startBtn=$("musicStartBtn");
    const endBtn=$("musicEndBtn");
    const todayEl=$("musicTodayMin");
    const totalEl=$("musicTotalMin");
    const statusEl=$("musicStatus");

    const KEY="enigmaMusicV2";
    function load(){ return readJSON(KEY,{today:todayKey(),todayMin:0,totalMin:0,sessionStart:0}); }
    function save(s){ writeJSON(KEY,s); }
    function syncDay(s){
      if(s.today!==todayKey()){
        s.today=todayKey(); s.todayMin=0; s.sessionStart=0;
      }
      return s;
    }
    function renderMinutes(){
      const s=syncDay(load()); save(s);
      if(todayEl) todayEl.textContent=String(s.todayMin||0);
      if(totalEl) totalEl.textContent=String(s.totalMin||0);
      if(statusEl) statusEl.textContent=s.sessionStart?"Session running…":"No active session.";
    }

    const moods=["All","Anxious","Stressed","Focus","Sleep"];
    let active="All";

    function makeChip(name){
      const b=document.createElement("button");
      b.className="chip";
      b.type="button";
      b.textContent=name;
      if(name===active) b.classList.add("active");
      b.addEventListener("click",()=>{
        active=name;
        [...moodRow.querySelectorAll(".chip")].forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        renderTracks();
      });
      return b;
    }

    function renderTracks(){
      list.innerHTML="";
      const tracks = active==="All" ? MUSIC_TRACKS : MUSIC_TRACKS.filter(t=>t.mood===active);
      tracks.forEach((t)=>{
        const a=document.createElement("a");
        a.className="list-btn";
        a.href=t.url;
        a.target="_blank";
        a.rel="noopener";
        a.innerHTML=`<span>${t.label}</span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    moodRow.innerHTML="";
    moods.forEach(m=>moodRow.appendChild(makeChip(m)));

    if(startBtn){
      startBtn.addEventListener("click",()=>{
        const s=syncDay(load());
        if(s.sessionStart) return;
        s.sessionStart=Date.now();
        save(s); renderMinutes();
      });
    }

    if(endBtn){
      endBtn.addEventListener("click",()=>{
        const s=syncDay(load());
        if(!s.sessionStart) return;
        const mins=Math.max(1, Math.round((Date.now()-s.sessionStart)/60000));
        s.sessionStart=0;
        s.todayMin=(s.todayMin||0)+mins;
        s.totalMin=(s.totalMin||0)+mins;
        save(s); renderMinutes();
      });
    }

    renderTracks();
    renderMinutes();
  }

  /* ============ YOGA ============ */
  const YOGA_VIDEOS = [
    { mood:"Anxiety", label:"10 min Yoga for Anxiety", url:"https://www.youtube.com/results?search_query=10+minute+yoga+for+anxiety" },
    { mood:"Stress", label:"15 min Gentle Yoga for Stress", url:"https://www.youtube.com/results?search_query=gentle+yoga+for+stress+15+minutes" },
    { mood:"Sleep", label:"Yoga for Sleep (wind down)", url:"https://www.youtube.com/results?search_query=yoga+for+sleep+wind+down" },
    { mood:"Morning", label:"Morning Yoga (wake up)", url:"https://www.youtube.com/results?search_query=morning+yoga+wake+up" },
    { mood:"Stiff body", label:"Yoga for stiff back/hips", url:"https://www.youtube.com/results?search_query=yoga+for+stiff+back+hips" }
  ];

  function initYoga(){
    const moodRow=$("yogaMoodRow");
    const list=$("yogaList");
    if(!moodRow||!list) return;

    const moods=["All","Anxiety","Stress","Sleep","Morning","Stiff body"];
    let active="All";

    function makeChip(name){
      const b=document.createElement("button");
      b.className="chip";
      b.type="button";
      b.textContent=name;
      if(name===active) b.classList.add("active");
      b.addEventListener("click",()=>{
        active=name;
        [...moodRow.querySelectorAll(".chip")].forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        renderVideos();
      });
      return b;
    }

    function renderVideos(){
      list.innerHTML="";
      const vids = active==="All" ? YOGA_VIDEOS : YOGA_VIDEOS.filter(v=>v.mood===active);
      vids.forEach((v)=>{
        const a=document.createElement("a");
        a.className="list-btn";
        a.href=v.url;
        a.target="_blank";
        a.rel="noopener";
        a.innerHTML=`<span>${v.label}</span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    moodRow.innerHTML="";
    moods.forEach(m=>moodRow.appendChild(makeChip(m)));
    renderVideos();
  }

  /* ============ RESOURCES (NHS links) ============ */
  const RESOURCES = [
    { topic:"Anxiety", title:"Anxiety", desc:"Symptoms, causes and treatment.", url:"https://www.nhs.uk/mental-health/conditions/anxiety-disorders/overview/" },
    { topic:"Depression", title:"Depression", desc:"Signs, support and treatment options.", url:"https://www.nhs.uk/mental-health/conditions/clinical-depression/overview/" },
    { topic:"Panic disorder", title:"Panic disorder", desc:"Panic attacks and coping support.", url:"https://www.nhs.uk/mental-health/conditions/panic-disorder/overview/" },
    { topic:"OCD", title:"OCD", desc:"Obsessive compulsive disorder information.", url:"https://www.nhs.uk/mental-health/conditions/obsessive-compulsive-disorder-ocd/overview/" },
    { topic:"PTSD", title:"PTSD", desc:"Post-traumatic stress disorder support.", url:"https://www.nhs.uk/mental-health/conditions/post-traumatic-stress-disorder-ptsd/overview/" },
    { topic:"Eating disorders", title:"Eating disorders", desc:"Information and how to get help.", url:"https://www.nhs.uk/mental-health/conditions/eating-disorders/overview/" },
    { topic:"Self-harm", title:"Self-harm", desc:"Support and what to do next.", url:"https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/self-harm/" },
    { topic:"Stress", title:"Stress", desc:"Tips and support to manage stress.", url:"https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-manage-stress/" },
    { topic:"BPD", title:"Borderline personality disorder (BPD)", desc:"Symptoms and treatment.", url:"https://www.nhs.uk/mental-health/conditions/borderline-personality-disorder/overview/" }
  ];

  function initResources(){
    const moodRow=$("resTopicRow");
    const list=$("resList");
    if(!moodRow||!list) return;

    const topics=["All","Anxiety","Depression","Panic disorder","OCD","PTSD","Eating disorders","Self-harm","Stress","BPD"];
    let active="All";

    function makeChip(name){
      const b=document.createElement("button");
      b.className="chip";
      b.type="button";
      b.textContent=name;
      if(name===active) b.classList.add("active");
      b.addEventListener("click",()=>{
        active=name;
        [...moodRow.querySelectorAll(".chip")].forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        renderItems();
      });
      return b;
    }

    function renderItems(){
      list.innerHTML="";
      const items = active==="All" ? RESOURCES : RESOURCES.filter(r=>r.topic===active);
      items.forEach((r)=>{
        const a=document.createElement("a");
        a.className="list-btn";
        a.href=r.url;
        a.target="_blank";
        a.rel="noopener";
        a.innerHTML=`<span><strong>${r.title}</strong><span class="list-sub">${r.desc}</span></span><span>▶</span>`;
        list.appendChild(a);
      });
    }

    moodRow.innerHTML="";
    topics.forEach(t=>moodRow.appendChild(makeChip(t)));
    renderItems();
  }

  /* ============ BOOKS (genre) ============ */
  const BOOKS = [
    { genre:"Anxiety", title:"Hope and Help for Your Nerves", author:"Claire Weekes", desc:"Classic practical guidance for anxiety." },
    { genre:"Anxiety", title:"Dare", author:"Barry McDonagh", desc:"A modern approach to panic and anxiety." },
    { genre:"Depression", title:"Feeling Good", author:"David D. Burns", desc:"CBT-based tools for mood." },
    { genre:"Mindfulness", title:"Wherever You Go, There You Are", author:"Jon Kabat-Zinn", desc:"Mindfulness foundations." },
    { genre:"Trauma", title:"The Body Keeps the Score", author:"Bessel van der Kolk", desc:"Understanding trauma’s effects." },
    { genre:"Self-esteem", title:"The Gifts of Imperfection", author:"Brené Brown", desc:"Letting go of who you “should” be." },
    { genre:"Stress", title:"Why Has Nobody Told Me This Before?", author:"Julie Smith", desc:"Accessible mental health tools." }
  ];

  function initBooks(){
    const row=$("bookGenreRow");
    const list=$("bookList");
    if(!row||!list) return;

    const genres=["All","Anxiety","Depression","Mindfulness","Trauma","Self-esteem","Stress"];
    let active="All";

    function makeChip(name){
      const b=document.createElement("button");
      b.className="chip";
      b.type="button";
      b.textContent=name;
      if(name===active) b.classList.add("active");
      b.addEventListener("click",()=>{
        active=name;
        [...row.querySelectorAll(".chip")].forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        renderItems();
      });
      return b;
    }

    function renderItems(){
      list.innerHTML="";
      const items = active==="All" ? BOOKS : BOOKS.filter(x=>x.genre===active);
      items.forEach((b)=>{
        const div=document.createElement("div");
        div.className="card";
        div.innerHTML=`
          <div class="section-title" style="font-size:20px;">${b.title}</div>
          <div class="gentle-text" style="margin-top:4px;"><b>${b.author}</b> • ${b.genre}</div>
          <div class="gentle-text" style="margin-top:8px;">${b.desc}</div>
        `;
        list.appendChild(div);
      });
    }

    row.innerHTML="";
    genres.forEach(g=>row.appendChild(makeChip(g)));
    renderItems();
  }

  /* ============ PROGRESS ============ */
  function initProgress(){
    if(!$("progressPage")) return;

    const pBreathedToday=$("pBreathedToday");
    const pMusicToday=$("pMusicToday");
    const pSavedQuotes=$("pSavedQuotes");
    const pMusicTotal=$("pMusicTotal");

    const b = readJSON("enigmaBreatheLog",{totalMin:0,byDay:{}});
    const m = readJSON("enigmaMusicV2",{today:todayKey(),todayMin:0,totalMin:0});
    const s = readJSON("enigmaSavedQuotes",[]);

    const breatheToday = Number((b.byDay && b.byDay[todayKey()]) || 0);
    const musicToday = (m.today===todayKey()) ? Number(m.todayMin||0) : 0;

    if(pBreathedToday) pBreathedToday.textContent=String(breatheToday);
    if(pMusicToday) pMusicToday.textContent=String(musicToday);
    if(pSavedQuotes) pSavedQuotes.textContent=String(s.length||0);
    if(pMusicTotal) pMusicTotal.textContent=String(Number(m.totalMin||0));
  }

  /* ============ BOOT ============ */
  document.addEventListener("DOMContentLoaded", ()=>{
    try{ applyTheme(); }catch{}
    try{ initTheme(); }catch{}

    try{ initWotdHomeTile(); }catch{}
    try{ initWotdPage(); }catch{}
     document.addEventListener("DOMContentLoaded", () => {
  try { initWOTD(); } catch {}
});
    try{ initDistraction(); }catch{}
    try{ initBreathe(); }catch{}
    try{ initQuotes(); }catch{}
    try{ initMusic(); }catch{}
    try{ initYoga(); }catch{}
    try{ initResources(); }catch{}
    try{ initBooks(); }catch{}
    try{ initProgress(); }catch{}
     document.addEventListener("DOMContentLoaded", () => {
  try { initWOTD(); } catch {}
});
  });
})();
