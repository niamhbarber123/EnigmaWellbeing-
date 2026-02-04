/* =========================
   Enigma Core Helpers
========================= */
function isoToday(){
  return new Date().toISOString().split("T")[0];
}

/* =========================
   Reminders (web-safe)
   Shows once/day when the user opens the app
========================= */
function enableReminder(){
  localStorage.setItem("enigmaReminderEnabled","yes");
  alert("Daily reminder enabled 🌿\n(It will appear when you open Enigma each day.)");
}

function reminderCheck(){
  if (localStorage.getItem("enigmaReminderEnabled") !== "yes") return;

  const today = isoToday();
  const lastSeen = localStorage.getItem("enigmaReminderSeen");
  if (lastSeen === today) return;

  alert("🌿 Gentle reminder from Enigma:\nTake a small moment for yourself today.");
  localStorage.setItem("enigmaReminderSeen", today);
}

/* =========================
   Daily Check-in + Streaks
========================= */
function pickMood(btn, mood){
  window.__enigmaMood = mood;
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function saveCheckin(){
  const mood = window.__enigmaMood || "";
  const note = document.getElementById("checkinNote")?.value || "";

  if (!mood){
    alert("Please choose how you're feeling 💜");
    return;
  }

  const today = isoToday();
  const lastDate = localStorage.getItem("enigmaLastCheckinDate");
  let streak = parseInt(localStorage.getItem("enigmaStreak") || "0", 10);

  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().split("T")[0];

  if (lastDate !== today){
    streak = (lastDate === yesterday) ? streak + 1 : 1;
    localStorage.setItem("enigmaStreak", String(streak));
    localStorage.setItem("enigmaLastCheckinDate", today);
  }

  localStorage.setItem("enigmaDailyMood", mood);
  localStorage.setItem("enigmaDailyNote", note);

  const msg = document.getElementById("checkinSavedMsg");
  if (msg) msg.textContent = `Saved 🌿 Streak: ${streak} day(s)`;
}

/* =========================
   Mood-based Recommendations
========================= */
function getRecommendation(){
  const mood = localStorage.getItem("enigmaDailyMood") || "";
  if (mood === "calm") return "🧘 Gentle yoga could feel lovely today.";
  if (mood === "okay") return "💬 Read a quote that resonates.";
  if (mood === "low") return "🌬️ Try a slow breathing session.";
  if (mood === "anxious") return "🎨 Tap-to-colour can help ground you.";
  return "🌱 Try a daily check-in to get gentle suggestions.";
}

/* =========================
   Breathe: text loop + completion
========================= */
function startBreathingText(){
  const el = document.getElementById("breathText");
  if (!el) return;

  function cycle(){
    el.textContent = "Inhale";
    setTimeout(() => (el.textContent = "Hold"), 4000);
    setTimeout(() => (el.textContent = "Exhale"), 6000);
  }

  cycle();
  setInterval(cycle, 10000);
}

function completeBreathe(){
  localStorage.setItem("enigmaBreatheDone", isoToday());
  alert("Well done 🌬️ Take that calm with you.");
}

/* =========================
   Quotes: save favourites + render saved list
========================= */
function getSavedQuotes(){
  return JSON.parse(localStorage.getItem("enigmaSavedQuotes") || "[]");
}

function saveQuote(tile){
  const text = tile.getAttribute("data-quote");
  const author = tile.getAttribute("data-author");
  const item = `${text} — ${author}`;

  let saved = getSavedQuotes();
  if (!saved.includes(item)){
    saved.push(item);
    localStorage.setItem("enigmaSavedQuotes", JSON.stringify(saved));
  }
  tile.classList.add("saved");
}

/* =========================
   Progress page population
========================= */
function populateProgress(){
  const moodEl = document.getElementById("pMood");
  const streakEl = document.getElementById("pStreak");
  const recEl = document.getElementById("pRec");
  const favEl = document.getElementById("pFavCount");
  const breatheEl = document.getElementById("pBreathe");

  if (moodEl) moodEl.textContent = localStorage.getItem("enigmaDailyMood") || "Not checked in yet";
  if (streakEl) streakEl.textContent = localStorage.getItem("enigmaStreak") || "0";
  if (recEl) recEl.textContent = getRecommendation();
  if (favEl) favEl.textContent = String(getSavedQuotes().length);

  const breatheDone = localStorage.getItem("enigmaBreatheDone");
  if (breatheEl) breatheEl.textContent = (breatheDone === isoToday()) ? "Yes 🌬️" : "Not today yet";
}

/* =========================
   Tap-to-colour Game (Upgraded)
========================= */
const ENIGMA_GAME_KEY = "enigmaColourGameV2";
let enigmaCurrentDesign = "mandala";
let enigmaCurrentColour = "#cbbfff";
let enigmaUndoStack = [];

const designs = [
  { id:"mandala", name:"Mandala", desc:"Balanced and calm", mask: maskMandala() },
  { id:"flower",  name:"Flower",  desc:"Soft petals",      mask: maskFlower() },
  { id:"leaf",    name:"Leaf",    desc:"Grounding",        mask: maskLeaf() },
  { id:"moon",    name:"Moon",    desc:"Quiet night",      mask: maskMoon() },
  { id:"waves",   name:"Waves",   desc:"Flowing",          mask: maskWaves() },
  { id:"stars",   name:"Stars",   desc:"Gentle sparkle",   mask: maskStars() }
];

function getGameDataV2(){
  return JSON.parse(localStorage.getItem(ENIGMA_GAME_KEY) || "{}");
}
function setGameDataV2(data){
  localStorage.setItem(ENIGMA_GAME_KEY, JSON.stringify(data));
}

function saveCellV2(index, colour){
  const data = getGameDataV2();
  if (!data[enigmaCurrentDesign]) data[enigmaCurrentDesign] = {};
  data[enigmaCurrentDesign][index] = colour;
  setGameDataV2(data);
}

function loadDesignData(){
  const data = getGameDataV2();
  return data[enigmaCurrentDesign] || {};
}

function setSaveMsg(text){
  const el = document.getElementById("saveMsg");
  if (el) el.textContent = text;
}

function initColourGame(){
  const grid = document.getElementById("grid");
  const palette = document.getElementById("palette");
  const designGrid = document.getElementById("designGrid");
  if (!grid || !palette || !designGrid) return;

  // Restore last design
  const last = localStorage.getItem("enigmaLastDesign");
  if (last && designs.some(d => d.id === last)) enigmaCurrentDesign = last;

  // Build palette
  const colours = ["#cbbfff","#e6d9ff","#b8e0d2","#f4c2c2","#ffffff","#d6c9ef","#cfd9d6","#b8a6d9"];
  palette.innerHTML = "";
  colours.forEach((c, i) => {
    const sw = document.createElement("div");
    sw.className = "swatch" + (i === 0 ? " active" : "");
    sw.style.background = c;
    sw.addEventListener("click", () => {
      enigmaCurrentColour = c;
      document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
      sw.classList.add("active");
      setSaveMsg("");
    });
    palette.appendChild(sw);
  });

  // Build design picker
  designGrid.innerHTML = "";
  designs.forEach(d => {
    const tile = document.createElement("div");
    tile.className = "design-tile" + (d.id === enigmaCurrentDesign ? " active" : "");
    tile.setAttribute("data-design", d.id);

    const prev = document.createElement("div");
    prev.className = "design-preview";
    d.mask.forEach(on => {
      const dot = document.createElement("div");
      dot.className = "preview-dot" + (on ? "" : " off");
      prev.appendChild(dot);
    });

    const txt = document.createElement("div");
    txt.innerHTML = `<div class="design-title">${d.name}</div><div class="design-sub">${d.desc}</div>`;

    tile.appendChild(prev);
    tile.appendChild(txt);

    tile.addEventListener("click", () => {
      enigmaCurrentDesign = d.id;
      localStorage.setItem("enigmaLastDesign", d.id);
      document.querySelectorAll(".design-tile").forEach(t => t.classList.remove("active"));
      tile.classList.add("active");
      enigmaUndoStack = [];
      renderGrid();
      setSaveMsg("");
    });

    designGrid.appendChild(tile);
  });

  function renderGrid(){
    grid.innerHTML = "";
    const d = designs.find(x => x.id === enigmaCurrentDesign);
    const mask = d ? d.mask : new Array(64).fill(true);
    const saved = loadDesignData();

    for (let i=0;i<64;i++){
      const cell = document.createElement("div");
      cell.className = "cell";

      if (!mask[i]){
        cell.style.background = "transparent";
        cell.style.boxShadow = "none";
        cell.style.pointerEvents = "none";
        grid.appendChild(cell);
        continue;
      }

      if (saved[i]) cell.style.background = saved[i];

      cell.addEventListener("click", () => {
        const prev = cell.style.background || "";
        enigmaUndoStack.push({ index:i, prev });
        cell.style.background = enigmaCurrentColour || "";
        saveCellV2(i, enigmaCurrentColour || "");
      });

      grid.appendChild(cell);
    }
  }

  window.__enigmaRenderGrid = renderGrid;
  renderGrid();
}

/* Game tools */
function enigmaUndo(){
  const grid = document.getElementById("grid");
  if (!grid || enigmaUndoStack.length === 0) return;

  const last = enigmaUndoStack.pop();
  const cell = grid.children[last.index];
  if (!cell) return;

  cell.style.background = last.prev;
  saveCellV2(last.index, last.prev || "");
  setSaveMsg("");
}

function enigmaEraser(){
  enigmaCurrentColour = "";
  setSaveMsg("Eraser selected 🧼 Tap tiles to clear.");
}

function enigmaClear(){
  if (!confirm("Clear this design?")) return;
  const data = getGameDataV2();
  data[enigmaCurrentDesign] = {};
  setGameDataV2(data);
  enigmaUndoStack = [];
  if (window.__enigmaRenderGrid) window.__enigmaRenderGrid();
  setSaveMsg("Cleared ✨");
}

function saveArt(){
  setSaveMsg("Saved 💜 You can come back anytime.");
}

/* Masks (64 cells) */
function maskFromCoords(coords){
  const m = new Array(64).fill(false);
  coords.forEach(([r,c]) => { m[r*8 + c] = true; });
  return m;
}

function maskMandala(){
  const coords = [];
  const center = 3.5;
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      const d = Math.abs(r-center) + Math.abs(c-center);
      if (d <= 4.2) coords.push([r,c]);
    }
  }
  return maskFromCoords(coords);
}

function maskFlower(){
  const coords = [];
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      const dr = r-3.5, dc = c-3.5;
      const dist = Math.sqrt(dr*dr+dc*dc);
      if (dist < 2.2 || (dist > 2.7 && dist < 3.4 && (r===1||r===6||c===1||c===6))) coords.push([r,c]);
    }
  }
  return maskFromCoords(coords);
}

function maskLeaf(){
  const coords = [];
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      if (c >= 2 && c <= 5 && (r+c>=4) && (r+c<=10)) coords.push([r,c]);
      if (c===3||c===4) coords.push([r,c]);
    }
  }
  return maskFromCoords(coords);
}

function maskMoon(){
  const coords = [];
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      const dr=r-3.5, dc=c-3.0;
      const dist = Math.sqrt(dr*dr+dc*dc);
      const dist2 = Math.sqrt((r-3.5)*(r-3.5)+(c-4.2)*(c-4.2));
      if (dist < 3.0 && dist2 > 2.2) coords.push([r,c]);
    }
  }
  return maskFromCoords(coords);
}

function maskWaves(){
  const coords = [];
  for (let r=1;r<7;r++){
    for (let c=0;c<8;c++){
      const wave = Math.round(3 + 2*Math.sin((c/7)*Math.PI*2));
      if (Math.abs(r - wave) <= 1) coords.push([r,c]);
    }
  }
  return maskFromCoords(coords);
}

function maskStars(){
  const coords = [];
  const stars = [[1,1],[1,6],[3,3],[4,5],[6,2],[6,6],[2,4],[5,1]];
  stars.forEach(([r,c]) => {
    coords.push([r,c]);
    if (r>0) coords.push([r-1,c]);
    if (r<7) coords.push([r+1,c]);
    if (c>0) coords.push([r,c-1]);
    if (c<7) coords.push([r,c+1]);
  });
  return maskFromCoords(coords);
}

/* =========================
   Boot (runs on every page)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  reminderCheck();
  startBreathingText();
  initColourGame();
  populateProgress();

  // Mark saved quote tiles
  const saved = getSavedQuotes();
  document.querySelectorAll(".quote-tile").forEach(tile => {
    const item = `${tile.getAttribute("data-quote")} — ${tile.getAttribute("data-author")}`;
    if (saved.includes(item)) tile.classList.add("saved");
  });

  // Render saved quotes page
  const list = document.getElementById("savedQuotesList");
  if (list){
    const items = getSavedQuotes();
    list.innerHTML = "";
    if (items.length === 0){
      const div = document.createElement("div");
      div.className = "card";
      div.textContent = "No saved quotes yet 💜";
      list.appendChild(div);
    } else {
      items.forEach(q => {
        const div = document.createElement("div");
        div.className = "card";
        div.textContent = q;
        list.appendChild(div);
      });
    }
  }
});
