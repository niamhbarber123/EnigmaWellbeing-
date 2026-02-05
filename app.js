/* =========================================================
   Enigma • app.js (FULL)
   - Theme toggle (moon button #themeFab)
   - Back helper (enigmaBack)
   - Quotes tiles + save/unsave + daily shuffle
   - Tap-to-Colour game (designs + palette + grid + save)
========================================================= */

/* =========================
   Helpers
========================= */
function $(id){ return document.getElementById(id); }
function isoToday(){ return new Date().toISOString().split("T")[0]; }
function safeParseJSON(str, fallback){
  try{ return JSON.parse(str); } catch { return fallback; }
}
function getJSON(key, fallback){
  return safeParseJSON(localStorage.getItem(key) || "", fallback);
}
function setJSON(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

/* =========================
   Back
========================= */
window.enigmaBack = function(){
  if (history.length > 1) history.back();
  else window.location.href = "/Enigma-/index.html";
};

/* =========================
   Theme (Night mode)
========================= */
(function themeInit(){
  function setIcon(){
    const btn = $("themeFab");
    if (!btn) return;
    btn.textContent = document.body.classList.contains("night") ? "☀️" : "🌙";
  }
  function applyTheme(){
    const saved = localStorage.getItem("enigmaTheme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useNight = saved ? (saved === "night") : prefersDark;
    document.body.classList.toggle("night", useNight);
    setIcon();
  }
  function toggleTheme(){
    const isNight = document.body.classList.toggle("night");
    localStorage.setItem("enigmaTheme", isNight ? "night" : "day");
    setIcon();
  }
  window.toggleTheme = toggleTheme;

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    const btn = $("themeFab");
    if (!btn) return;
    btn.addEventListener("click", (e)=>{ e.preventDefault(); toggleTheme(); }, { passive:false });
    btn.addEventListener("touchend", (e)=>{ e.preventDefault(); toggleTheme(); }, { passive:false });
  });
})();

/* =========================================================
   Quotes (tiles + save/unsave + daily shuffle)
========================================================= */
const QUOTES = [
  { q:"Nothing can dim the light that shines from within.", a:"Maya Angelou" },
  { q:"No one can make you feel inferior without your consent.", a:"Eleanor Roosevelt" },
  { q:"I raise up my voice—not so that I can shout, but so that those without a voice can be heard.", a:"Malala Yousafzai" },
  { q:"Well-behaved women seldom make history.", a:"Laurel Thatcher Ulrich" },
  { q:"Power is not given to you. You have to take it.", a:"Beyoncé" },
  { q:"I have learned over the years that when one’s mind is made up, this diminishes fear.", a:"Rosa Parks" },
  { q:"If you don’t like the road you’re walking, start paving another one.", a:"Dolly Parton" },
  { q:"My peace is my priority.", a:"Affirmation" }
];

function quoteId(item){
  return `${item.a}::${item.q}`;
}

// deterministic RNG
function mulberry32(seed){
  return function(){
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dailyShuffledQuotes(list){
  const today = isoToday(); // YYYY-MM-DD
  const seed = parseInt(today.replaceAll("-", ""), 10) || 20260101;
  const rand = mulberry32(seed);

  const arr = list.slice();
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initQuotes(){
  const grid = $("quoteGrid");
  if (!grid) return; // only on quotes page

  const saved = new Set(getJSON("enigmaSavedQuotesV2", []));
  const savedCount = $("savedCount");
  if (savedCount) savedCount.textContent = String(saved.size);

  const list = dailyShuffledQuotes(QUOTES);

  grid.innerHTML = "";
  list.forEach(item=>{
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
      setJSON("enigmaSavedQuotesV2", Array.from(saved));
      tile.classList.toggle("saved", saved.has(id));
      if (savedCount) savedCount.textContent = String(saved.size);
    };

    tile.addEventListener("click", toggle, { passive:false });
    tile.addEventListener("touchend", toggle, { passive:false });
    tile.addEventListener("keydown", (e)=>{
      if (e.key === "Enter" || e.key === " ") toggle(e);
    });

    grid.appendChild(tile);
  });

  const viewBtn = $("viewSavedBtn");
  if (viewBtn){
    viewBtn.onclick = ()=>{
      const list = Array.from(saved);
      if (!list.length) return alert("No saved quotes yet.");
      alert("Saved quotes:\n\n" + list.map(x=> "• " + x.split("::")[1]).join("\n\n"));
    };
  }

  const clearBtn = $("clearSavedBtn");
  if (clearBtn){
    clearBtn.onclick = ()=>{
      if (!confirm("Delete all saved quotes?")) return;
      localStorage.setItem("enigmaSavedQuotesV2", "[]");
      initQuotes();
    };
  }
}

/* =========================================================
   Tap-to-Colour Game (designs restored)
========================================================= */
const GAME_KEY = "enigmaGameV1";
let gameState = {
  designId: "mandala",
  mode: "number", // number | free
  selectedColour: "#d9d2ff",
  selectedNumber: 1,
  cells: {} // key "r,c" -> colour
};
let undoStack = [];

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
  { id:"heart", name:"Heart", desc:"Self kindness" },
  { id:"sunrise", name:"Sunrise", desc:"A fresh start" },
  { id:"butterfly", name:"Butterfly", desc:"Light & hopeful" }
];

function loadGame(){
  const saved = getJSON(GAME_KEY, null);
  if (saved && typeof saved === "object"){
    gameState = { ...gameState, ...saved };
  }
}
function saveGame(){
  setJSON(GAME_KEY, gameState);
}
function setGameMsg(msg){
  const el = $("saveMsg");
  if (el) el.textContent = msg;
}

// number pattern per design (simple but looks structured)
function numberAt(r,c){
  const x = r - 6.5;
  const y = c - 6.5;
  const d = Math.sqrt(x*x + y*y);

  switch (gameState.designId){
    case "mandala":
      return Math.max(1, Math.min(12, Math.floor(d) + 1));
    case "flower":
      return ((r*3 + c*2) % 10) + 1;
    case "waves":
      return 6 + (Math.floor((Math.sin(c/2) + 1) * 2) + (r % 2)); // 6-11ish
    case "heart":
      return ((r + c) % 8) + 1;
    case "sunrise":
      return (r < 5) ? 10 : (r < 9 ? 11 : 7);
    case "butterfly":
      return ((Math.abs(6.5 - c) + r) % 9) + 1;
    default:
      return ((r + c) % 12) + 1;
  }
}

function renderDesigns(){
  const wrap = $("designGrid");
  if (!wrap) return;

  wrap.innerHTML = "";
  DESIGNS.forEach(d=>{
    const tile = document.createElement("div");
    tile.className = "design-tile" + (d.id === gameState.designId ? " active" : "");

    const preview = document.createElement("div");
    preview.className = "design-preview";
    for (let i=0;i<100;i++){
      const dot = document.createElement("div");
      dot.className = "preview-dot";
      if (i % 7 === 0) dot.style.background = "rgba(90,75,122,0.22)";
      preview.appendChild(dot);
    }

    const text = document.createElement("div");
    text.innerHTML = `<div class="design-title">${d.name}</div><div class="design-sub">${d.desc}</div>`;

    tile.appendChild(preview);
    tile.appendChild(text);

    const pick = (e)=>{
      e.preventDefault();
      gameState.designId = d.id;
      undoStack = [];
      saveGame();
      document.querySelectorAll(".design-tile").forEach(x=>x.classList.remove("active"));
      tile.classList.add("active");
      renderGrid();
      setGameMsg("Design loaded ✨");
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
      setGameMsg(gameState.mode === "number"
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
          setGameMsg(`That tile is ${num}. Select ${num} to fill it.`);
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

function setColourMode(mode){
  gameState.mode = mode;
  saveGame();
  $("modeNumberBtn")?.classList.toggle("active", mode === "number");
  $("modeFreeBtn")?.classList.toggle("active", mode === "free");
  setGameMsg(mode === "number"
    ? "Colour-by-number: pick a number, then tap matching tiles."
    : "Free colour: pick any colour and tap tiles."
  );
}
window.setColourMode = setColourMode;

window.enigmaUndo = function(){
  const last = undoStack.pop();
  if (!last) return;
  if (last.prev) gameState.cells[last.key] = last.prev;
  else delete gameState.cells[last.key];
  saveGame();
  renderGrid();
  setGameMsg("Undone ↩︎");
};
// add inside setColourMode(mode) after setting gameState.mode
const grid = document.getElementById("grid");
if (grid){
  grid.classList.toggle("free-mode", mode === "free");
}

window.enigmaEraser = function(){
  gameState.selectedColour = "";
  saveGame();
  setGameMsg("Eraser selected 🧼 Tap a tile to clear it.");
};

window.enigmaClear = function(){
  if (!confirm("Clear your colouring?")) return;
  gameState.cells = {};
  undoStack = [];
  saveGame();
  renderGrid();
  setGameMsg("Cleared ✨");
};

window.markColouringComplete = function(){
  localStorage.setItem("enigmaColourComplete", isoToday());
  setGameMsg("Completed 🎉 Saved for today.");
};

function initGame(){
  // Only run on game page
  if (!$("designGrid") || !$("palette") || !$("grid")) return;

  loadGame();
  renderDesigns();
  renderPalette();
  renderGrid();

  // Mode buttons
  $("modeNumberBtn")?.addEventListener("click", ()=> setColourMode("number"));
  $("modeFreeBtn")?.addEventListener("click", ()=> setColourMode("free"));

  // initial mode UI
  $("modeNumberBtn")?.classList.toggle("active", gameState.mode === "number");
  $("modeFreeBtn")?.classList.toggle("active", gameState.mode === "free");

  setGameMsg("Ready ✅");
}

/* =========================
   Boot
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initQuotes();
  initGame();
});
