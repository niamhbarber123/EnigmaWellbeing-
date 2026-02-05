/* =========================
   Enigma - app.js (single source of truth)
   Works on iPhone Safari + GitHub Pages
========================= */

const ENIGMA = {
  version: "4001",
  keys: {
    theme: "enigmaTheme",
    savedQuotes: "enigmaSavedQuotesV2",
    breatheDone: "enigmaBreatheDone",
    colourComplete: "enigmaColourComplete",
    game: "enigmaColourGameV4",
    soundVol: "enigmaSoundVol",
    streak: "enigmaStreak",
    lastActive: "enigmaLastActive"
  }
};

function $(id){ return document.getElementById(id); }
function isoToday(){ return new Date().toISOString().split("T")[0]; }
function safeJSONParse(str, fallback){
  try{ return JSON.parse(str); }catch(e){ return fallback; }
}
function getJSON(key, fallback){
  return safeJSONParse(localStorage.getItem(key) || "", fallback);
}
function setJSON(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

/* =========================
   Navigation / back
========================= */
function enigmaBack(){
  if (window.history.length > 1) window.history.back();
  else window.location.href = "/Enigma-/index.html";
}
window.enigmaBack = enigmaBack;

/* =========================
   Theme (moon button)
========================= */
function updateThemeIcon(){
  const btn = $("themeFab");
  if (!btn) return;
  btn.textContent = document.body.classList.contains("night") ? "☀️" : "🌙";
}
function applyTheme(){
  const saved = localStorage.getItem(ENIGMA.keys.theme);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useNight = saved ? (saved === "night") : prefersDark;
  document.body.classList.toggle("night", useNight);
  updateThemeIcon();
}
function toggleTheme(){
  const isNight = document.body.classList.toggle("night");
  localStorage.setItem(ENIGMA.keys.theme, isNight ? "night" : "day");
  updateThemeIcon();
}
window.toggleTheme = toggleTheme;

/* =========================
   Breathe
========================= */
function markBreatheDone(){
  localStorage.setItem(ENIGMA.keys.breatheDone, isoToday());
  const msg = $("breatheDoneMsg");
  if (msg) msg.textContent = "Saved ✅ Well done.";
}
window.markBreatheDone = markBreatheDone;

function initBreathe(){
  const label = $("breatheLabel");
  const circle = $("breatheCircle");
  if (!label || !circle) return;

  // label loop: inhale 4s, hold 2s, exhale 4s = 10s
  function loop(){
    label.textContent = "Inhale";
    setTimeout(()=> label.textContent = "Hold", 4000);
    setTimeout(()=> label.textContent = "Exhale", 6000);
  }
  loop();
  setInterval(loop, 10000);
}

/* =========================
   Sounds
========================= */
let currentAudio = null;

function setSoundVolume(v){
  const vol = Math.max(0, Math.min(1, parseFloat(v)));
  localStorage.setItem(ENIGMA.keys.soundVol, String(vol));
  if (currentAudio) currentAudio.volume = vol;
}
window.setSoundVolume = setSoundVolume;

function playSound(src){
  stopSound();
  currentAudio = new Audio(src);
  currentAudio.loop = true;
  currentAudio.volume = parseFloat(localStorage.getItem(ENIGMA.keys.soundVol) || "0.6");

  currentAudio.play().then(()=>{
    const st = $("soundStatus");
    if (st) st.textContent = "Playing";
  }).catch(()=>{
    alert("Sound file not found yet. Upload the MP3 into /audio/ in your repo.");
    stopSound();
  });
}
window.playSound = playSound;

function stopSound(){
  if (currentAudio){
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  const st = $("soundStatus");
  if (st) st.textContent = "Not playing";
}
window.stopSound = stopSound;

function initSounds(){
  const vol = $("soundVol");
  if (vol){
    vol.value = localStorage.getItem(ENIGMA.keys.soundVol) || "0.6";
    vol.addEventListener("input", (e)=> setSoundVolume(e.target.value));
  }
}

/* =========================
   Quotes (tiles + save/unsave)
========================= */
const QUOTES = [
  { q:"I am not free while any woman is unfree, even when her shackles are very different from my own.", a:"Audre Lorde" },
  { q:"No one can make you feel inferior without your consent.", a:"Eleanor Roosevelt" },
  { q:"If you don’t like the road you’re walking, start paving another one.", a:"Dolly Parton" },
  { q:"Nothing can dim the light that shines from within.", a:"Maya Angelou" },
  { q:"You may encounter many defeats, but you must not be defeated.", a:"Maya Angelou" },
  { q:"I raise up my voice—not so that I can shout, but so that those without a voice can be heard.", a:"Malala Yousafzai" },
  { q:"I have learned over the years that when one’s mind is made up, this diminishes fear.", a:"Rosa Parks" },
  { q:"Power is not given to you. You have to take it.", a:"Beyoncé" },
  { q:"Well-behaved women seldom make history.", a:"Laurel Thatcher Ulrich" },
  { q:"You do not have to be perfect to be powerful.", a:"Unknown (commonly shared)" },
  { q:"I can and I will.", a:"Unknown (affirmation)" },
  { q:"My peace is my priority.", a:"Unknown (affirmation)" }
];

function quoteId(item){
  return `${item.a}::${item.q}`; // stable id
}

function initQuotes(){
  const grid = $("quoteGrid");
  if (!grid) return;

  const saved = new Set(getJSON(ENIGMA.keys.savedQuotes, []));
  const savedCount = $("savedCount");
  if (savedCount) savedCount.textContent = String(saved.size);

  grid.innerHTML = "";

  QUOTES.forEach(item=>{
    const id = quoteId(item);
    const tile = document.createElement("div");
    tile.className = "quote-tile" + (saved.has(id) ? " saved" : "");
    tile.setAttribute("role","button");
    tile.setAttribute("tabindex","0");

    tile.innerHTML = `
      <div style="font-weight:900;color:#5a4b7a; line-height:1.35;">“${item.q}”</div>
      <small>— ${item.a}</small>
    `;

    const toggle = (e)=>{
      e.preventDefault();
      if (saved.has(id)) saved.delete(id);
      else saved.add(id);

      setJSON(ENIGMA.keys.savedQuotes, Array.from(saved));
      tile.classList.toggle("saved", saved.has(id));
      if (savedCount) savedCount.textContent = String(saved.size);
    };

    tile.addEventListener("click", toggle, { passive:false });
    tile.addEventListener("touchend", toggle, { passive:false });

    grid.appendChild(tile);
  });

  const viewBtn = $("viewSavedBtn");
  if (viewBtn){
    viewBtn.onclick = ()=>{
      const list = Array.from(saved);
      if (!list.length) return alert("No saved quotes yet.");
      alert("Saved quotes:\n\n" + list.map(x=>x.split("::")[0]).join("\n"));
    };
  }

  const clearBtn = $("clearSavedBtn");
  if (clearBtn){
    clearBtn.onclick = ()=>{
      if (!confirm("Delete all saved quotes?")) return;
      setJSON(ENIGMA.keys.savedQuotes, []);
      initQuotes();
    };
  }
}

/* =========================
   Tap to Colour (simple, reliable)
   - renders designs
   - renders palette
   - renders a 14x14 grid
========================= */
let gameState = {
  designId: "mandala",
  mode: "number",
  selectedColour: "#d9d2ff",
  selectedNumber: 1,
  cells: {} // key "r,c" -> hex colour
};

const COLOURS = [
  {n:1,c:"#d9d2ff"},{n:2,c:"#b8a6d9"},{n:3,c:"#efe9f8"},{n:4,c:"#b8e0d2"},
  {n:5,c:"#8fcfbf"},{n:6,c:"#a8d8ff"},{n:7,c:"#7fb5e6"},{n:8,c:"#ffd5c7"},
  {n:9,c:"#f4c2c2"},{n:10,c:"#ffeaa6"},{n:11,c:"#d6c9ef"},{n:12,c:"#cfd9d6"},
  {n:13,c:"#ffffff"},{n:14,c:"#f2eff8"},{n:15,c:"#cbbfff"},{n:16,c:"#9ad0d6"}
];

const DESIGNS = [
  { id:"mandala", name:"Mandala", desc:"Balanced calm" },
  { id:"flower", name:"Flower", desc:"Soft petals" },
  { id:"waves", name:"Waves", desc:"Flow gently" },
  { id:"heart", name:"Heart", desc:"Self kindness" }
];

function loadGame(){
  const saved = getJSON(ENIGMA.keys.game, null);
  if (saved && typeof saved === "object") gameState = { ...gameState, ...saved };
}
function saveGame(){
  setJSON(ENIGMA.keys.game, gameState);
}
function setSaveMsg(msg){
  const el = $("saveMsg");
  if (el) el.textContent = msg;
}

function setColourMode(mode){
  gameState.mode = mode;
  saveGame();
  $("modeNumberBtn")?.classList.toggle("active", mode==="number");
  $("modeFreeBtn")?.classList.toggle("active", mode==="free");
  const hint = $("modeHint");
  if (hint){
    hint.textContent = mode==="number"
      ? "Pick a number colour, then tap matching numbered tiles."
      : "Pick any colour and tap tiles.";
  }
  setSaveMsg("Ready ✅");
  renderGrid();
}
window.setColourMode = setColourMode;

let undoStack = [];
function enigmaUndo(){
  const last = undoStack.pop();
  if (!last) return;
  if (last.prev) gameState.cells[last.key] = last.prev;
  else delete gameState.cells[last.key];
  saveGame();
  renderGrid();
  setSaveMsg("Undone ↩︎");
}
window.enigmaUndo = enigmaUndo;

function enigmaEraser(){
  gameState.selectedColour = "";
  saveGame();
  setSaveMsg("Eraser selected 🧼 Tap a tile to clear it.");
}
window.enigmaEraser = enigmaEraser;

function enigmaClear(){
  if (!confirm("Clear your colouring?")) return;
  gameState.cells = {};
  undoStack = [];
  saveGame();
  renderGrid();
  setSaveMsg("Cleared ✨");
}
window.enigmaClear = enigmaClear;

function markColouringComplete(){
  localStorage.setItem(ENIGMA.keys.colourComplete, isoToday());
  setSaveMsg("Completed 🎉 Saved for today.");
}
window.markColouringComplete = markColouringComplete;

// Creates a simple number pattern per design
function numberAt(r,c){
  if (gameState.designId === "waves"){
    return 6 + (r % 3); // 6..8
  }
  if (gameState.designId === "heart"){
    return ((r+c) % 8) + 1;
  }
  if (gameState.designId === "flower"){
    return ((r*2 + c) % 10) + 1;
  }
  // mandala default
  return ((r + c) % 12) + 1;
}

function renderDesigns(){
  const wrap = $("designGrid");
  if (!wrap) return;
  wrap.innerHTML = "";

  DESIGNS.forEach(d=>{
    const tile = document.createElement("div");
    tile.className = "design-tile" + (d.id===gameState.designId ? " active" : "");

    const prev = document.createElement("div");
    prev.className = "design-preview";
    for (let i=0;i<100;i++){
      const dot = document.createElement("div");
      dot.className = "preview-dot";
      if (i%7===0) dot.style.background = "rgba(90,75,122,0.22)";
      prev.appendChild(dot);
    }

    const text = document.createElement("div");
    text.innerHTML = `<div class="design-title">${d.name}</div><div class="design-sub">${d.desc}</div>`;

    tile.appendChild(prev);
    tile.appendChild(text);

    const pick = (e)=>{
      e.preventDefault();
      gameState.designId = d.id;
      undoStack = [];
      saveGame();
      document.querySelectorAll(".design-tile").forEach(x=>x.classList.remove("active"));
      tile.classList.add("active");
      renderGrid();
      setSaveMsg("Design loaded ✨");
    };

    tile.addEventListener("click", pick, { passive:false });
    tile.addEventListener("touchend", pick, { passive:false });
    wrap.appendChild(tile);
  });
}

function renderPalette(){
  const pal = $("palette");
  if (!pal) return;
  pal.innerHTML = "";

  COLOURS.forEach(col=>{
    const chip = document.createElement("div");
    chip.className = "palette-chip" + (col.c === gameState.selectedColour ? " active" : "");
    chip.style.background = col.c;

    const num = document.createElement("div");
    num.className = "palette-num";
    num.textContent = String(col.n);
    chip.appendChild(num);

    const choose = (e)=>{
      e.preventDefault();
      gameState.selectedColour = col.c;
      gameState.selectedNumber = col.n;
      saveGame();
      document.querySelectorAll(".palette-chip").forEach(x=>x.classList.remove("active"));
      chip.classList.add("active");
      setSaveMsg(gameState.mode==="number"
        ? `Selected ${col.n}. Tap tiles numbered ${col.n}.`
        : "Selected colour."
      );
    };

    chip.addEventListener("click", choose, { passive:false });
    chip.addEventListener("touchend", choose, { passive:false });

    pal.appendChild(chip);
  });
}

function renderGrid(){
  const grid = $("grid");
  if (!grid) return;
  grid.innerHTML = "";

  for (let r=0;r<14;r++){
    for (let c=0;c<14;c++){
      const key = `${r},${c}`;
      const num = numberAt(r,c);

      const cell = document.createElement("div");
      cell.className = "cell";

      const saved = gameState.cells[key];
      if (saved){
        cell.style.background = saved;
        cell.classList.add("filled");
      }

      const label = document.createElement("div");
      label.className = "num";
      label.textContent = String(num);
      cell.appendChild(label);

      const paint = (e)=>{
        e.preventDefault();
        const prev = gameState.cells[key] || "";
        undoStack.push({ key, prev });

        if (gameState.mode === "number" && num !== gameState.selectedNumber){
          setSaveMsg(`That tile is ${num}. Select ${num} to fill it.`);
          return;
        }

        if (!gameState.selectedColour){
          delete gameState.cells[key];
          cell.style.background = "";
          cell.classList.remove("filled");
        } else {
          gameState.cells[key] = gameState.selectedColour;
          cell.style.background = gameState.selectedColour;
          cell.classList.add("filled");
        }
        saveGame();
      };

      cell.addEventListener("click", paint, { passive:false });
      cell.addEventListener("touchend", paint, { passive:false });

      grid.appendChild(cell);
    }
  }
}

function initGame(){
  // If the key elements aren’t present, don’t run.
  if (!$("designGrid") || !$("palette") || !$("grid")) return;

  loadGame();
  renderDesigns();
  renderPalette();
  renderGrid();

  // Mode buttons
  $("modeNumberBtn")?.addEventListener("click", ()=> setColourMode("number"));
  $("modeFreeBtn")?.addEventListener("click", ()=> setColourMode("free"));

  // Set initial active state
  $("modeNumberBtn")?.classList.toggle("active", gameState.mode==="number");
  $("modeFreeBtn")?.classList.toggle("active", gameState.mode==="free");

  setSaveMsg("Ready ✅");
  const hint = $("modeHint");
  if (hint){
    hint.textContent = gameState.mode==="number"
      ? "Pick a number colour, then tap matching numbered tiles."
      : "Pick any colour and tap tiles.";
  }
}

/* =========================
   Progress (basic streak)
========================= */
function calcStreak(){
  const today = isoToday();
  const last = localStorage.getItem(ENIGMA.keys.lastActive);
  let streak = parseInt(localStorage.getItem(ENIGMA.keys.streak) || "0", 10);

  if (!last){
    streak = 1;
  } else {
    const diffDays = Math.floor((new Date(today) - new Date(last)) / (1000*60*60*24));
    if (diffDays === 0) { /* keep */ }
    else if (diffDays === 1) streak += 1;
    else streak = 1;
  }

  localStorage.setItem(ENIGMA.keys.lastActive, today);
  localStorage.setItem(ENIGMA.keys.streak, String(streak));
  return streak;
}

function initProgress(){
  const streakLine = $("streakLine");
  if (!streakLine) return;

  const streak = calcStreak();
  streakLine.textContent = `${streak} day streak`;
}

/* =========================
   Boot (runs on every page)
========================= */
document.addEventListener("DOMContentLoaded", ()=>{
  applyTheme();

  const themeBtn = $("themeFab");
  if (themeBtn){
    themeBtn.addEventListener("click", (e)=>{ e.preventDefault(); toggleTheme(); }, { passive:false });
    themeBtn.addEventListener("touchend", (e)=>{ e.preventDefault(); toggleTheme(); }, { passive:false });
  }

  // Page initialisers (only run if their DOM exists)
  initBreathe();
  initSounds();
  initQuotes();
  initGame();
  initProgress();
});
