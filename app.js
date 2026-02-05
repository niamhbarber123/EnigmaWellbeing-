/* ========= Utilities ========= */
function isoToday(){ return new Date().toISOString().split("T")[0]; }
function escapeHtml(str){
  return (str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

/* ========= Back Arrow ========= */
function enigmaBack(){
  if (window.history.length > 1) window.history.back();
  else window.location.href = "/Enigma-/index.html";
}

/* ========= Night Mode ========= */
function applyThemeFromStorage(){
  const saved = localStorage.getItem("enigmaTheme"); // "night" | "day" | null
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useNight = saved ? (saved === "night") : prefersDark;
  document.body.classList.toggle("night", useNight);
  updateThemeIcon();
}
function updateThemeIcon(){
  const btn = document.getElementById("themeFab");
  if (!btn) return;
  btn.textContent = document.body.classList.contains("night") ? "☀️" : "🌙";
}
function toggleTheme(){
  const isNight = document.body.classList.toggle("night");
  localStorage.setItem("enigmaTheme", isNight ? "night" : "day");
  updateThemeIcon();
}
function wireThemeFab(){
  const btn = document.getElementById("themeFab");
  if (!btn) return;

  const handler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  btn.type = "button";
  btn.addEventListener("click", handler, { passive:false });
  btn.addEventListener("touchend", handler, { passive:false });
}

/* ========= Quotes ========= */
const ENIGMA_QUOTES = [
  { q:"No one can make you feel inferior without your consent.", a:"Eleanor Roosevelt" },
  { q:"Do the best you can until you know better. Then when you know better, do better.", a:"Maya Angelou" },
  { q:"Think like a queen. A queen is not afraid to fail.", a:"Oprah Winfrey" },
  { q:"You do not find the happy life. You make it.", a:"Camilla Eyring Kimball" },
  { q:"Nothing is impossible. The word itself says ‘I’m possible!’", a:"Audrey Hepburn" },
  { q:"I raise up my voice—not so I can shout, but so that those without a voice can be heard.", a:"Malala Yousafzai" },
  { q:"Above all, be the heroine of your life, not the victim.", a:"Nora Ephron" },
  { q:"The most common way people give up their power is by thinking they don’t have any.", a:"Alice Walker" },
  { q:"You are your best thing.", a:"Toni Morrison" },
  { q:"Courage is like a muscle. We strengthen it by use.", a:"Ruth Gordon" },
  { q:"If you have knowledge, let others light their candles in it.", a:"Margaret Fuller" },
  { q:"I can be changed by what happens to me. But I refuse to be reduced by it.", a:"Maya Angelou" },
  { q:"I am not afraid… I was born to do this.", a:"Joan of Arc" },
  { q:"If you don’t risk anything, you risk even more.", a:"Erica Jong" }
];

function getSavedQuotes(){
  return JSON.parse(localStorage.getItem("enigmaSavedQuotes") || "[]");
}
function setSavedQuotes(arr){
  localStorage.setItem("enigmaSavedQuotes", JSON.stringify(arr));
}
function toggleQuoteSave(q, a, tile){
  const item = `${q} — ${a}`;
  let saved = getSavedQuotes();
  if (saved.includes(item)){
    saved = saved.filter(x => x !== item);
    tile?.classList.remove("saved");
  } else {
    saved.push(item);
    tile?.classList.add("saved");
  }
  setSavedQuotes(saved);

  if (document.getElementById("savedQuotesList")) renderSavedQuotes();
}
function renderQuotes(){
  const grid = document.getElementById("quoteGrid");
  if (!grid) return;

  const saved = getSavedQuotes();
  grid.innerHTML = "";
  ENIGMA_QUOTES.forEach(({q,a}) => {
    const tile = document.createElement("div");
    tile.className = "quote-tile";
    tile.innerHTML = `${escapeHtml(q)}<small>— ${escapeHtml(a)}</small>`;
    if (saved.includes(`${q} — ${a}`)) tile.classList.add("saved");

    const tap = (e)=>{ e.preventDefault(); toggleQuoteSave(q,a,tile); };
    tile.addEventListener("click", tap, { passive:false });
    tile.addEventListener("touchend", tap, { passive:false });

    grid.appendChild(tile);
  });
}
function renderSavedQuotes(){
  const list = document.getElementById("savedQuotesList");
  if (!list) return;

  const saved = getSavedQuotes();
  list.innerHTML = "";

  if (saved.length === 0){
    const c = document.createElement("div");
    c.className = "card";
    c.textContent = "No saved quotes yet 💜";
    list.appendChild(c);
    return;
  }

  const top = document.createElement("div");
  top.className = "card";
  top.innerHTML = `
    <div style="font-weight:900; color:#5a4b7a;">Saved quotes</div>
    <div style="height:10px;"></div>
    <button class="primary" type="button" style="background:#f4c2c2; color:#5a4b7a;" onclick="clearAllSavedQuotes()">Clear all</button>
  `;
  list.appendChild(top);

  saved.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div style="white-space:pre-wrap;">${escapeHtml(item)}</div>
      <div style="height:10px;"></div>
      <button class="primary" type="button" style="background:#ffeaa6; color:#5a4b7a;" onclick='deleteSavedQuote(${JSON.stringify(item)})'>Delete</button>
    `;
    list.appendChild(card);
  });
}
function deleteSavedQuote(item){
  let saved = getSavedQuotes();
  saved = saved.filter(x => x !== item);
  setSavedQuotes(saved);
  renderSavedQuotes();
  renderQuotes();
}
function clearAllSavedQuotes(){
  if (!confirm("Clear all saved quotes?")) return;
  setSavedQuotes([]);
  renderSavedQuotes();
  renderQuotes();
}

/* ========= Breathe (wording sync) ========= */
let __breathTimers = [];
function clearBreathTimers(){
  __breathTimers.forEach(t => clearTimeout(t));
  __breathTimers = [];
}
function setBreathText(text){
  const el = document.getElementById("breathText");
  if (el) el.textContent = text;
}
function startBreathingSynced(){
  const circle = document.querySelector(".breathe-circle");
  const textEl = document.getElementById("breathText");
  if (!circle || !textEl) return;

  function scheduleCycle(){
    clearBreathTimers();
    setBreathText("Inhale");
    __breathTimers.push(setTimeout(()=>setBreathText("Hold"), 4000));
    __breathTimers.push(setTimeout(()=>setBreathText("Exhale"), 6000));
  }

  scheduleCycle();
  circle.addEventListener("animationiteration", scheduleCycle);
  document.addEventListener("visibilitychange", ()=>{ if(!document.hidden) scheduleCycle(); });
}
function completeBreathe(){
  localStorage.setItem("enigmaBreatheDone", isoToday());
  alert("Well done 🌬️ Take that calm with you.");
}

/* ========= Journal (simple) ========= */
function getJournalEntries(){
  return JSON.parse(localStorage.getItem("enigmaJournalEntries") || "[]");
}
function renderJournal(){
  const list = document.getElementById("journalList");
  if (!list) return;

  const entries = getJournalEntries();
  list.innerHTML = "";

  if (entries.length === 0){
    const c = document.createElement("div");
    c.className = "card";
    c.textContent = "No entries yet. Your words are safe here 💜";
    list.appendChild(c);
    return;
  }

  entries.forEach((e, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div style="font-weight:900; color:#5a4b7a; margin-bottom:8px;">${escapeHtml(e.date)}</div>
      <div style="white-space:pre-wrap;">${escapeHtml(e.text)}</div>
      <div style="height:10px;"></div>
      <button class="primary" type="button" style="background:#f4c2c2; color:#5a4b7a;" onclick="deleteJournalEntry(${i})">Delete</button>
    `;
    list.appendChild(card);
  });
}
function saveJournalEntry(){
  const t = document.getElementById("journalText");
  const msg = document.getElementById("journalMsg");
  if (!t) return;
  const text = t.value.trim();
  if (!text){
    if (msg) msg.textContent = "Write a little first 💜";
    return;
  }
  const entries = getJournalEntries();
  entries.unshift({ date: new Date().toLocaleString(), text });
  localStorage.setItem("enigmaJournalEntries", JSON.stringify(entries));
  t.value = "";
  if (msg) msg.textContent = "Saved ✨";
  renderJournal();
}
function deleteJournalEntry(i){
  const entries = getJournalEntries();
  entries.splice(i, 1);
  localStorage.setItem("enigmaJournalEntries", JSON.stringify(entries));
  renderJournal();
}

/* ========= Sounds ========= */
let currentAudio = null;
function playSound(src){
  stopSound();
  currentAudio = new Audio(src);
  currentAudio.loop = true;
  currentAudio.volume = parseFloat(localStorage.getItem("enigmaSoundVol") || "0.6");
  currentAudio.play().catch(()=>{});
  updateSoundUI(true);
}
function stopSound(){
  if (currentAudio){
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  updateSoundUI(false);
}
function setSoundVolume(v){
  const vol = Math.max(0, Math.min(1, parseFloat(v)));
  localStorage.setItem("enigmaSoundVol", String(vol));
  if (currentAudio) currentAudio.volume = vol;
}
function updateSoundUI(isPlaying){
  const st = document.getElementById("soundStatus");
  if (st) st.textContent = isPlaying ? "Playing" : "Not playing";
}

/* ========= Tap-to-Colour Game (FULL) ========= */
const ENIGMA_GAME_KEY = "enigmaColourGameV3";
let enigmaColourMode = "number";
let enigmaCurrentDesign = "mandala";
let enigmaSelectedColour = "#d9d2ff";
let enigmaSelectedNumber = 1;
let enigmaUndoStack = [];

const ENIGMA_COLOURS = [
  { n: 1,  c: "#d9d2ff" }, { n: 2,  c: "#b8a6d9" }, { n: 3,  c: "#efe9f8" }, { n: 4,  c: "#b8e0d2" },
  { n: 5,  c: "#8fcfbf" }, { n: 6,  c: "#a8d8ff" }, { n: 7,  c: "#7fb5e6" }, { n: 8,  c: "#ffd5c7" },
  { n: 9,  c: "#f4c2c2" }, { n: 10, c: "#ffeaa6" }, { n: 11, c: "#d6c9ef" }, { n: 12, c: "#cfd9d6" },
  { n: 13, c: "#ffffff" }, { n: 14, c: "#f2eff8" }, { n: 15, c: "#cbbfff" }, { n: 16, c: "#9ad0d6" }
];

function blankTemplate(){ return Array.from({ length: 14 }, () => Array.from({ length: 14 }, () => 0)); }
function ringTemplate(){
  const t = blankTemplate();
  const cx=6.5, cy=6.5;
  for (let r=0;r<14;r++){
    for (let c=0;c<14;c++){
      const dx=r-cx, dy=c-cy;
      const d=Math.sqrt(dx*dx+dy*dy);
      if (d < 6.6 && d > 1.8){
        const band = Math.max(1, Math.min(8, Math.floor(d)));
        t[r][c] = band;
      }
    }
  }
  return t;
}
function tplMandala(){
  const t = ringTemplate();
  for (let r=0;r<14;r++){
    for (let c=0;c<14;c++){
      if (t[r][c] !== 0){
        if ((r+c) % 4 === 0) t[r][c] = 11;
        if ((r*c) % 11 === 0) t[r][c] = 2;
      }
    }
  }
  for (let r=5;r<=8;r++){
    for (let c=5;c<=8;c++){
      t[r][c] = 3;
    }
  }
  return t;
}
function tplFlower(){
  const t = blankTemplate();
  const cx=6.5, cy=6.5;
  for (let r=0;r<14;r++){
    for (let c=0;c<14;c++){
      const dx=r-cx, dy=c-cy;
      const d=Math.sqrt(dx*dx+dy*dy);
      if (d < 6.2){
        if (d < 2.2) t[r][c] = 10;
        else if (Math.abs(dx*dy) < 6) t[r][c] = 1;
        else t[r][c] = 11;
      }
    }
  }
  return t;
}
function tplButterfly(){
  const t = blankTemplate();
  for (let r=2;r<12;r++){
    for (let c=1;c<13;c++){
      const left = c < 7;
      const wing = left ? (7-c) : (c-6);
      const height = Math.abs(r-6.5);
      if (wing >= 1 && wing <= 5 && height <= 4.8){
        if (wing >= 4) t[r][c] = 6;
        else if (height < 1.2) t[r][c] = 8;
        else t[r][c] = 4;
      }
    }
  }
  for (let r=3;r<11;r++){ t[r][6] = 12; t[r][7] = 12; }
  return t;
}
function tplWaves(){
  const t = blankTemplate();
  for (let r=2;r<12;r++){
    for (let c=1;c<13;c++){
      const wave = 6 + 2*Math.sin((c/12)*Math.PI*2);
      if (Math.abs(r - wave) < 1.2) t[r][c] = 16;
      if (r > wave && r < wave+3) t[r][c] = 6;
      if (r >= wave+3) t[r][c] = 7;
    }
  }
  return t;
}
function tplHeart(){
  const t = blankTemplate();
  for (let r=2;r<12;r++){
    for (let c=1;c<13;c++){
      const x = (c-6.5)/6;
      const y = (r-6.5)/6;
      const a = x*x + y*y - 0.3;
      const heart = a*a*a - x*x*y*y*y;
      if (heart <= 0) t[r][c] = (r < 6) ? 9 : 8;
    }
  }
  return t;
}
function tplSunrise(){
  const t = blankTemplate();
  for (let r=1;r<13;r++){
    for (let c=1;c<13;c++){
      t[r][c] = (r > 8) ? 7 : 14;
    }
  }
  const cx=6.5, cy=8.5;
  for (let r=2;r<12;r++){
    for (let c=1;c<13;c++){
      const dx=r-cx, dy=c-cy;
      const d=Math.sqrt(dx*dx+dy*dy);
      if (d < 3.2 && r <= 8) t[r][c] = 10;
    }
  }
  for (let r=2;r<9;r++){
    for (let c=1;c<13;c++){
      if (t[r][c] === 14 && Math.abs(c-6.5) < 4) t[r][c] = 3;
      if (t[r][c] === 14 && Math.abs(c-6.5) < 2) t[r][c] = 11;
    }
  }
  return t;
}

const designs = [
  { id:"mandala",  name:"Mandala",  desc:"Balanced calm",   template: tplMandala() },
  { id:"flower",   name:"Flower",   desc:"Soft petals",     template: tplFlower() },
  { id:"butterfly",name:"Butterfly",desc:"Light & hopeful", template: tplButterfly() },
  { id:"waves",    name:"Waves",    desc:"Flow gently",     template: tplWaves() },
  { id:"heart",    name:"Heart",    desc:"Self kindness",   template: tplHeart() },
  { id:"sunrise",  name:"Sunrise",  desc:"New start",       template: tplSunrise() }
];

function getGameData(){ return JSON.parse(localStorage.getItem(ENIGMA_GAME_KEY) || "{}"); }
function setGameData(data){ localStorage.setItem(ENIGMA_GAME_KEY, JSON.stringify(data)); }
function getDesignSave(){ const data = getGameData(); return data[enigmaCurrentDesign] || {}; }
function setDesignSave(saveObj){ const data = getGameData(); data[enigmaCurrentDesign]=saveObj; setGameData(data); }
function setSaveMsg(msg){ const el=document.getElementById("saveMsg"); if(el) el.textContent = msg; }

function setColourMode(mode){
  enigmaColourMode = mode;
  localStorage.setItem("enigmaColourMode", mode);

  const nb=document.getElementById("modeNumberBtn");
  const fb=document.getElementById("modeFreeBtn");
  if(nb && fb){
    nb.classList.toggle("active", mode==="number");
    fb.classList.toggle("active", mode==="free");
  }

  setSaveMsg(mode==="number"
    ? "Colour-by-number: pick a number, then tap matching tiles."
    : "Free colour: pick any colour and tap tiles."
  );
  renderColourBoard();
}

function initColourGame(){
  const grid=document.getElementById("grid");
  const palette=document.getElementById("palette");
  const designGrid=document.getElementById("designGrid");
  if(!grid || !palette || !designGrid) return;

  const lastDesign = localStorage.getItem("enigmaLastDesignV3");
  if(lastDesign && designs.some(d=>d.id===lastDesign)) enigmaCurrentDesign = lastDesign;

  const lastMode = localStorage.getItem("enigmaColourMode");
  if(lastMode==="free" || lastMode==="number") enigmaColourMode = lastMode;

  palette.innerHTML="";
  ENIGMA_COLOURS.forEach((item, idx)=>{
    const chip=document.createElement("div");
    chip.className="palette-chip" + (idx===0 ? " active" : "");
    chip.style.background=item.c;

    const num=document.createElement("div");
    num.className="palette-num";
    num.textContent=String(item.n);
    chip.appendChild(num);

    const choose=(e)=>{
      if(e){ e.preventDefault(); }
      document.querySelectorAll(".palette-chip").forEach(c=>c.classList.remove("active"));
      chip.classList.add("active");
      enigmaSelectedColour=item.c;
      enigmaSelectedNumber=item.n;
      setSaveMsg(enigmaColourMode==="number"
        ? `Selected number ${item.n}. Tap tiles showing ${item.n}.`
        : "Selected colour."
      );
    };

    chip.addEventListener("click", choose, { passive:false });
    chip.addEventListener("touchend", choose, { passive:false });

    palette.appendChild(chip);
  });

  designGrid.innerHTML="";
  designs.forEach(d=>{
    const tile=document.createElement("div");
    tile.className="design-tile" + (d.id===enigmaCurrentDesign ? " active" : "");

    const prev=document.createElement("div");
    prev.className="design-preview";
    const flat=d.template.flat();
    for(let i=0;i<100;i++){
      const dot=document.createElement("div");
      const v=flat[Math.floor((i/100)*flat.length)] || 0;
      dot.className="preview-dot" + (v===0 ? " off" : "");
      prev.appendChild(dot);
    }

    const txt=document.createElement("div");
    txt.innerHTML=`<div class="design-title">${d.name}</div><div class="design-sub">${d.desc}</div>`;

    tile.appendChild(prev);
    tile.appendChild(txt);

    const pick=(e)=>{
      if(e){ e.preventDefault(); }
      enigmaCurrentDesign=d.id;
      localStorage.setItem("enigmaLastDesignV3", d.id);
      document.querySelectorAll(".design-tile").forEach(t=>t.classList.remove("active"));
      tile.classList.add("active");
      enigmaUndoStack=[];
      renderColourBoard();
      setSaveMsg("Design loaded ✨");
    };

    tile.addEventListener("click", pick, { passive:false });
    tile.addEventListener("touchend", pick, { passive:false });

    designGrid.appendChild(tile);
  });

  document.getElementById("modeNumberBtn")?.classList.toggle("active", enigmaColourMode==="number");
  document.getElementById("modeFreeBtn")?.classList.toggle("active", enigmaColourMode==="free");

  renderColourBoard();
  setSaveMsg(enigmaColourMode==="number"
    ? "Colour-by-number: pick a number, then tap matching tiles."
    : "Free colour: pick any colour and tap tiles."
  );
}

function renderColourBoard(){
  const grid=document.getElementById("grid");
  if(!grid) return;

  const design=designs.find(d=>d.id===enigmaCurrentDesign);
  const tpl=design ? design.template : blankTemplate();
  const save=getDesignSave();

  grid.innerHTML="";
  for(let r=0;r<14;r++){
    for(let c=0;c<14;c++){
      const key=`${r},${c}`;
      const number=tpl[r][c];

      const cell=document.createElement("div");
      cell.className="cell";

      if(number===0){
        cell.style.background="transparent";
        cell.style.boxShadow="none";
        cell.style.pointerEvents="none";
        grid.appendChild(cell);
        continue;
      }

      if(save[key]){
        cell.style.background=save[key];
        cell.classList.add("filled");
      }

      const label=document.createElement("div");
      label.className="num";
      label.textContent=String(number);
      cell.appendChild(label);

      const paint=(e)=>{
        if(e){ e.preventDefault(); }

        const prev=save[key] || "";
        enigmaUndoStack.push({ key, prev });

        if(enigmaColourMode==="number" && number!==enigmaSelectedNumber){
          setSaveMsg(`That tile is ${number}. Select colour ${number} to fill it.`);
          return;
        }

        const newColour=enigmaSelectedColour || "";
        if(newColour){
          save[key]=newColour;
          cell.style.background=newColour;
          cell.classList.add("filled");
        } else {
          delete save[key];
          cell.style.background="";
          cell.classList.remove("filled");
        }

        setDesignSave(save);
      };

      cell.addEventListener("click", paint, { passive:false });
      cell.addEventListener("touchend", paint, { passive:false });

      grid.appendChild(cell);
    }
  }
}

function enigmaUndo(){
  const last=enigmaUndoStack.pop();
  if(!last) return;

  const save=getDesignSave();
  if(last.prev) save[last.key]=last.prev;
  else delete save[last.key];

  setDesignSave(save);
  renderColourBoard();
  setSaveMsg("Undone ↩︎");
}
function enigmaEraser(){
  enigmaSelectedColour="";
  setSaveMsg("Eraser selected 🧼 Tap a tile to clear it.");
}
function enigmaClear(){
  if(!confirm("Clear this design?")) return;
  setDesignSave({});
  enigmaUndoStack=[];
  renderColourBoard();
  setSaveMsg("Cleared ✨");
}
function markColouringComplete(){
  localStorage.setItem("enigmaColourComplete", new Date().toISOString());
  setSaveMsg("Completed 🎉 Well done — take a calm breath.");
}

/* ========= Boot ========= */
document.addEventListener("DOMContentLoaded", ()=>{
  applyThemeFromStorage();
  wireThemeFab();

  renderQuotes();
  renderSavedQuotes();
  renderJournal();
  startBreathingSynced();

  // iPhone reliability: init game after a tick
  setTimeout(()=>{ try{ initColourGame(); }catch(e){} }, 0);

  // sound slider value
  const vol=document.getElementById("soundVol");
  if(vol){
    vol.value = localStorage.getItem("enigmaSoundVol") || "0.6";
    updateSoundUI(false);
  }
}
/* =========================
   Enigma core helpers
========================= */
function isoToday(){ return new Date().toISOString().split("T")[0]; }

function enigmaBack(){
  if (window.history.length > 1) window.history.back();
  else window.location.href = "/Enigma-/index.html";
}

/* =========================
   Theme (moon top-right)
========================= */
function updateThemeIcon(){
  const btn = document.getElementById("themeFab");
  if (!btn) return;
  btn.textContent = document.body.classList.contains("night") ? "☀️" : "🌙";
}
function applyThemeFromStorage(){
  const saved = localStorage.getItem("enigmaTheme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useNight = saved ? (saved === "night") : prefersDark;
  document.body.classList.toggle("night", useNight);
  updateThemeIcon();
}
function toggleTheme(){
  const isNight = document.body.classList.toggle("night");
  localStorage.setItem("enigmaTheme", isNight ? "night" : "day");
  updateThemeIcon();
}

/* =========================
   Sounds
========================= */
let currentAudio = null;

function playSound(src){
  stopSound();
  currentAudio = new Audio(src);
  currentAudio.loop = true;
  currentAudio.volume = parseFloat(localStorage.getItem("enigmaSoundVol") || "0.6");
  currentAudio.play().then(()=> {
    const st = document.getElementById("soundStatus");
    if (st) st.textContent = "Playing";
  }).catch(()=>{
    alert("That sound file isn’t found yet. Upload the MP3 into /audio/ in your repo.");
  });
}

function stopSound(){
  if (currentAudio){
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  const st = document.getElementById("soundStatus");
  if (st) st.textContent = "Not playing";
}

function setSoundVolume(v){
  const vol = Math.max(0, Math.min(1, parseFloat(v)));
  localStorage.setItem("enigmaSoundVol", String(vol));
  if (currentAudio) currentAudio.volume = vol;
}

/* =========================
   Tap to Colour (fix)
========================= */
const ENIGMA_GAME_KEY = "enigmaColourGameV3";
let enigmaColourMode = "number";
let enigmaCurrentDesign = "mandala";
let enigmaSelectedColour = "#d9d2ff";
let enigmaSelectedNumber = 1;
let enigmaUndoStack = [];

const ENIGMA_COLOURS = [
  { n: 1,  c: "#d9d2ff" }, { n: 2,  c: "#b8a6d9" }, { n: 3,  c: "#efe9f8" }, { n: 4,  c: "#b8e0d2" },
  { n: 5,  c: "#8fcfbf" }, { n: 6,  c: "#a8d8ff" }, { n: 7,  c: "#7fb5e6" }, { n: 8,  c: "#ffd5c7" },
  { n: 9,  c: "#f4c2c2" }, { n: 10, c: "#ffeaa6" }, { n: 11, c: "#d6c9ef" }, { n: 12, c: "#cfd9d6" },
  { n: 13, c: "#ffffff" }, { n: 14, c: "#f2eff8" }, { n: 15, c: "#cbbfff" }, { n: 16, c: "#9ad0d6" }
];

function blankTemplate(){ return Array.from({ length: 14 }, () => Array.from({ length: 14 }, () => 0)); }
function ringTemplate(){
  const t = blankTemplate();
  const cx=6.5, cy=6.5;
  for (let r=0;r<14;r++){
    for (let c=0;c<14;c++){
      const dx=r-cx, dy=c-cy;
      const d=Math.sqrt(dx*dx+dy*dy);
      if (d < 6.6 && d > 1.8){
        const band = Math.max(1, Math.min(8, Math.floor(d)));
        t[r][c] = band;
      }
    }
  }
  return t;
}
function tplMandala(){
  const t = ringTemplate();
  for (let r=0;r<14;r++){
    for (let c=0;c<14;c++){
      if (t[r][c] !== 0){
        if ((r+c) % 4 === 0) t[r][c] = 11;
        if ((r*c) % 11 === 0) t[r][c] = 2;
      }
    }
  }
  for (let r=5;r<=8;r++) for (let c=5;c<=8;c++) t[r][c] = 3;
  return t;
}
function tplFlower(){
  const t = blankTemplate();
  const cx=6.5, cy=6.5;
  for (let r=0;r<14;r++){
    for (let c=0;c<14;c++){
      const dx=r-cx, dy=c-cy;
      const d=Math.sqrt(dx*dx+dy*dy);
      if (d < 6.2){
        if (d < 2.2) t[r][c] = 10;
        else if (Math.abs(dx*dy) < 6) t[r][c] = 1;
        else t[r][c] = 11;
      }
    }
  }
  return t;
}
function tplButterfly(){
  const t = blankTemplate();
  for (let r=2;r<12;r++){
    for (let c=1;c<13;c++){
      const left = c < 7;
      const wing = left ? (7-c) : (c-6);
      const height = Math.abs(r-6.5);
      if (wing >= 1 && wing <= 5 && height <= 4.8){
        if (wing >= 4) t[r][c] = 6;
        else if (height < 1.2) t[r][c] = 8;
        else t[r][c] = 4;
      }
    }
  }
  for (let r=3;r<11;r++){ t[r][6] = 12; t[r][7] = 12; }
  return t;
}
function tplWaves(){
  const t = blankTemplate();
  for (let r=2;r<12;r++){
    for (let c=1;c<13;c++){
      const wave = 6 + 2*Math.sin((c/12)*Math.PI*2);
      if (Math.abs(r - wave) < 1.2) t[r][c] = 16;
      if (r > wave && r < wave+3) t[r][c] = 6;
      if (r >= wave+3) t[r][c] = 7;
    }
  }
  return t;
}
function tplHeart(){
  const t = blankTemplate();
  for (let r=2;r<12;r++){
    for (let c=1;c<13;c++){
      const x = (c-6.5)/6;
      const y = (r-6.5)/6;
      const a = x*x + y*y - 0.3;
      const heart = a*a*a - x*x*y*y*y;
      if (heart <= 0) t[r][c] = (r < 6) ? 9 : 8;
    }
  }
  return t;
}
function tplSunrise(){
  const t = blankTemplate();
  for (let r=1;r<13;r++) for (let c=1;c<13;c++) t[r][c] = (r > 8) ? 7 : 14;
  const cx=6.5, cy=8.5;
  for (let r=2;r<12;r++){
    for (let c=1;c<13;c++){
      const dx=r-cx, dy=c-cy;
      const d=Math.sqrt(dx*dx+dy*dy);
      if (d < 3.2 && r <= 8) t[r][c] = 10;
    }
  }
  for (let r=2;r<9;r++){
    for (let c=1;c<13;c++){
      if (t[r][c] === 14 && Math.abs(c-6.5) < 4) t[r][c] = 3;
      if (t[r][c] === 14 && Math.abs(c-6.5) < 2) t[r][c] = 11;
    }
  }
  return t;
}

const designs = [
  { id:"mandala",  name:"Mandala",  desc:"Balanced calm",   template: tplMandala() },
  { id:"flower",   name:"Flower",   desc:"Soft petals",     template: tplFlower() },
  { id:"butterfly",name:"Butterfly",desc:"Light & hopeful", template: tplButterfly() },
  { id:"waves",    name:"Waves",    desc:"Flow gently",     template: tplWaves() },
  { id:"heart",    name:"Heart",    desc:"Self kindness",   template: tplHeart() },
  { id:"sunrise",  name:"Sunrise",  desc:"New start",       template: tplSunrise() }
];

function getGameData(){ return JSON.parse(localStorage.getItem(ENIGMA_GAME_KEY) || "{}"); }
function setGameData(data){ localStorage.setItem(ENIGMA_GAME_KEY, JSON.stringify(data)); }
function getDesignSave(){ const data=getGameData(); return data[enigmaCurrentDesign] || {}; }
function setDesignSave(saveObj){ const data=getGameData(); data[enigmaCurrentDesign]=saveObj; setGameData(data); }
function setSaveMsg(msg){ const el=document.getElementById("saveMsg"); if (el) el.textContent = msg; }

function setColourMode(mode){
  enigmaColourMode = mode;
  localStorage.setItem("enigmaColourMode", mode);
  document.getElementById("modeNumberBtn")?.classList.toggle("active", mode==="number");
  document.getElementById("modeFreeBtn")?.classList.toggle("active", mode==="free");
  setSaveMsg(mode==="number"
    ? "Colour-by-number: pick a number, then tap matching tiles."
    : "Free colour: pick any colour and tap tiles."
  );
  renderColourBoard();
}

function initColourGame(){
  const grid=document.getElementById("grid");
  const palette=document.getElementById("palette");
  const designGrid=document.getElementById("designGrid");
  if(!grid || !palette || !designGrid) return;

  const lastDesign = localStorage.getItem("enigmaLastDesignV3");
  if(lastDesign && designs.some(d=>d.id===lastDesign)) enigmaCurrentDesign = lastDesign;

  const lastMode = localStorage.getItem("enigmaColourMode");
  if(lastMode==="free" || lastMode==="number") enigmaColourMode = lastMode;

  // palette
  palette.innerHTML="";
  ENIGMA_COLOURS.forEach((item, idx)=>{
    const chip=document.createElement("div");
    chip.className="palette-chip" + (idx===0 ? " active" : "");
    chip.style.background=item.c;

    const num=document.createElement("div");
    num.className="palette-num";
    num.textContent=String(item.n);
    chip.appendChild(num);

    const choose=(e)=>{
      if(e){ e.preventDefault(); }
      document.querySelectorAll(".palette-chip").forEach(c=>c.classList.remove("active"));
      chip.classList.add("active");
      enigmaSelectedColour=item.c;
      enigmaSelectedNumber=item.n;
      setSaveMsg(enigmaColourMode==="number"
        ? `Selected number ${item.n}. Tap tiles showing ${item.n}.`
        : "Selected colour."
      );
    };

    chip.addEventListener("click", choose, { passive:false });
    chip.addEventListener("touchend", choose, { passive:false });
    palette.appendChild(chip);
  });

  // designs
  designGrid.innerHTML="";
  designs.forEach(d=>{
    const tile=document.createElement("div");
    tile.className="design-tile" + (d.id===enigmaCurrentDesign ? " active" : "");

    const prev=document.createElement("div");
    prev.className="design-preview";
    const flat=d.template.flat();
    for(let i=0;i<100;i++){
      const dot=document.createElement("div");
      const v=flat[Math.floor((i/100)*flat.length)] || 0;
      dot.className="preview-dot" + (v===0 ? " off" : "");
      prev.appendChild(dot);
    }

    const txt=document.createElement("div");
    txt.innerHTML=`<div class="design-title">${d.name}</div><div class="design-sub">${d.desc}</div>`;

    tile.appendChild(prev);
    tile.appendChild(txt);

    const pick=(e)=>{
      if(e){ e.preventDefault(); }
      enigmaCurrentDesign=d.id;
      localStorage.setItem("enigmaLastDesignV3", d.id);
      document.querySelectorAll(".design-tile").forEach(t=>t.classList.remove("active"));
      tile.classList.add("active");
      enigmaUndoStack=[];
      renderColourBoard();
      setSaveMsg("Design loaded ✨");
    };

    tile.addEventListener("click", pick, { passive:false });
    tile.addEventListener("touchend", pick, { passive:false });
    designGrid.appendChild(tile);
  });

  document.getElementById("modeNumberBtn")?.classList.toggle("active", enigmaColourMode==="number");
  document.getElementById("modeFreeBtn")?.classList.toggle("active", enigmaColourMode==="free");

  renderColourBoard();
  setSaveMsg(enigmaColourMode==="number"
    ? "Colour-by-number: pick a number, then tap matching tiles."
    : "Free colour: pick any colour and tap tiles."
  );
}

function renderColourBoard(){
  const grid=document.getElementById("grid");
  if(!grid) return;

  const design=designs.find(d=>d.id===enigmaCurrentDesign);
  const tpl=design ? design.template : blankTemplate();
  const save=getDesignSave();

  grid.innerHTML="";
  for(let r=0;r<14;r++){
    for(let c=0;c<14;c++){
      const key=`${r},${c}`;
      const number=tpl[r][c];

      const cell=document.createElement("div");
      cell.className="cell";

      if(number===0){
        cell.style.background="transparent";
        cell.style.boxShadow="none";
        cell.style.pointerEvents="none";
        grid.appendChild(cell);
        continue;
      }

      if(save[key]){
        cell.style.background=save[key];
        cell.classList.add("filled");
      }

      const label=document.createElement("div");
      label.className="num";
      label.textContent=String(number);
      cell.appendChild(label);

      const paint=(e)=>{
        if(e){ e.preventDefault(); }
        const prev=save[key] || "";
        enigmaUndoStack.push({ key, prev });

        if(enigmaColourMode==="number" && number!==enigmaSelectedNumber){
          setSaveMsg(`That tile is ${number}. Select colour ${number} to fill it.`);
          return;
        }

        const newColour=enigmaSelectedColour || "";
        if(newColour){
          save[key]=newColour;
          cell.style.background=newColour;
          cell.classList.add("filled");
        } else {
          delete save[key];
          cell.style.background="";
          cell.classList.remove("filled");
        }

        setDesignSave(save);
      };

      cell.addEventListener("click", paint, { passive:false });
      cell.addEventListener("touchend", paint, { passive:false });

      grid.appendChild(cell);
    }
  }
}

function enigmaUndo(){
  const last=enigmaUndoStack.pop();
  if(!last) return;
  const save=getDesignSave();
  if(last.prev) save[last.key]=last.prev; else delete save[last.key];
  setDesignSave(save);
  renderColourBoard();
  setSaveMsg("Undone ↩︎");
}
function enigmaEraser(){
  enigmaSelectedColour="";
  setSaveMsg("Eraser selected 🧼 Tap a tile to clear it.");
}
function enigmaClear(){
  if(!confirm("Clear this design?")) return;
  setDesignSave({});
  enigmaUndoStack=[];
  renderColourBoard();
  setSaveMsg("Cleared ✨");
}
function markColouringComplete(){
  localStorage.setItem("enigmaColourComplete", isoToday());
  setSaveMsg("Completed 🎉 Well done — take a calm breath.");
}

/* =========================
   Progress
========================= */
function safeParse(key, fallback){
  try{ return JSON.parse(localStorage.getItem(key) || ""); }catch(e){ return fallback; }
}
function calcStreak(){
  // streak based on any “done” action today (breathe or colour complete or journal entry)
  const doneDates = new Set();

  const b = localStorage.getItem("enigmaBreatheDone");
  if (b) doneDates.add(b);

  const c = localStorage.getItem("enigmaColourComplete");
  if (c) doneDates.add(c);

  const entries = safeParse("enigmaJournalEntries", []);
  entries.forEach(e=>{
    if (e && e.date){
      // date stored as locale string; fallback: count as a day anyway if present today
      // (keeps it simple; streak still works mainly via breathe/colour)
    }
  });

  // streak stored as last active date
  const last = localStorage.getItem("enigmaLastActive");
  const today = isoToday();

  let streak = parseInt(localStorage.getItem("enigmaStreak") || "0", 10);
  if (!last){
    streak = 1;
  } else {
    const lastDate = new Date(last);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000*60*60*24));
    if (diffDays === 0){
      // keep
    } else if (diffDays === 1){
      streak += 1;
    } else {
      streak = 1;
    }
  }

  localStorage.setItem("enigmaLastActive", today);
  localStorage.setItem("enigmaStreak", String(streak));
  return streak;
}

function renderProgress(){
  const streakLine = document.getElementById("streakLine");
  const streakSub = document.getElementById("streakSub");
  const todaySummary = document.getElementById("todaySummary");
  const totalsSummary = document.getElementById("totalsSummary");
  if(!streakLine || !todaySummary || !totalsSummary) return;

  const streak = calcStreak();
  streakLine.textContent = `${streak} day streak`;
  streakSub.textContent = "A tiny step counts. Keep it gentle.";

  const today = isoToday();
  const breatheDone = localStorage.getItem("enigmaBreatheDone") === today;
  const colourDone = localStorage.getItem("enigmaColourComplete") === today;

  const savedQuotes = safeParse("enigmaSavedQuotes", []);
  const journalEntries = safeParse("enigmaJournalEntries", []);

  todaySummary.innerHTML =
    `🌬️ Breathe: <b>${breatheDone ? "Done" : "Not yet"}</b><br>` +
    `🎨 Colour: <b>${colourDone ? "Done" : "Not yet"}</b><br>`;

  totalsSummary.innerHTML =
    `📖 Journal entries: <b>${journalEntries.length}</b><br>` +
    `💬 Saved quotes: <b>${savedQuotes.length}</b><br>`;
}

/* =========================
   Boot
========================= */
document.addEventListener("DOMContentLoaded", ()=>{
  applyThemeFromStorage();

  const btn = document.getElementById("themeFab");
  if(btn){
    btn.addEventListener("click", (e)=>{ e.preventDefault(); toggleTheme(); }, { passive:false });
    btn.addEventListener("touchend", (e)=>{ e.preventDefault(); toggleTheme(); }, { passive:false });
  }

  const vol = document.getElementById("soundVol");
  if(vol){
    vol.value = localStorage.getItem("enigmaSoundVol") || "0.6";
    const st = document.getElementById("soundStatus");
    if (st) st.textContent = "Not playing";
  }

  // Game init (only runs on game page)
  try{ initColourGame(); }catch(e){}

  // Progress init (only runs on progress page)
  try{ renderProgress(); }catch(e){}
});                         
// ---- Breathe completion marker ----
function markBreatheDone(){
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("enigmaBreatheDone", today);
  const msg = document.getElementById("breatheDoneMsg");
  if(msg) msg.textContent = "Saved ✅ Well done.";
}

// ---- Ensure colour game starts on game.html ----
document.addEventListener("DOMContentLoaded", () => {
  try{
    // If game page elements exist, initialise
    if(document.getElementById("grid") && document.getElementById("palette") && document.getElementById("designGrid")){
      if(typeof initColourGame === "function"){
        initColourGame();
      }
    }
  }catch(e){}
});
