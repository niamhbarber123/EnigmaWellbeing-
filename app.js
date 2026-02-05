/* =========================================================
   Enigma • app.js (FULL)
   - Theme toggle
   - Back helper
   - Music page: mood filtering + tap buttons + minutes listened
   - Game page: 20+ palette circles + mode switch (free hides numbers)
========================================================= */

function $(id){ return document.getElementById(id); }

/* ---------- Back ---------- */
window.enigmaBack = function(){
  if (history.length > 1) history.back();
  else window.location.href = "index.html";
};

/* ---------- Theme ---------- */
function applyThemeFromStorage(){
  const night = localStorage.getItem("enigmaNightMode") === "1";
  document.body.classList.toggle("night", night);
}
function toggleTheme(){
  const now = !(localStorage.getItem("enigmaNightMode") === "1");
  localStorage.setItem("enigmaNightMode", now ? "1" : "0");
  applyThemeFromStorage();
}

/* =========================================================
   MUSIC PAGE (sounds.html)
========================================================= */
const MOODS = ["All","Anxious","Stressed","Low mood","Focus","Sleep"];

const TRACKS = [
  { title:"Calm breathing music (1 hour)", mood:["Anxious","Stressed"], url:"https://www.youtube.com/results?search_query=calm+breathing+music+1+hour" },
  { title:"Relaxing piano for stress", mood:["Stressed","Low mood"], url:"https://www.youtube.com/results?search_query=relaxing+piano+for+stress" },
  { title:"Gentle uplifting ambient", mood:["Low mood"], url:"https://www.youtube.com/results?search_query=gentle+uplifting+ambient+music" },
  { title:"Lo-fi focus mix", mood:["Focus"], url:"https://www.youtube.com/results?search_query=lofi+focus+mix" },
  { title:"Sleep music (dark screen)", mood:["Sleep"], url:"https://www.youtube.com/results?search_query=sleep+music+dark+screen" },
  { title:"Nature sounds playlist", mood:["Anxious","Sleep"], url:"https://www.youtube.com/results?search_query=nature+sounds+playlist" },
  { title:"Meditation music playlist", mood:["Anxious","Stressed","Sleep"], url:"https://www.youtube.com/results?search_query=meditation+music+playlist" },
  { title:"Rain sounds", mood:["Sleep","Anxious"], url:"https://www.youtube.com/results?search_query=rain+sounds+8+hours" },
  { title:"Ocean waves", mood:["Sleep","Low mood"], url:"https://www.youtube.com/results?search_query=ocean+waves+relaxing+sounds" },
  { title:"Forest ambience", mood:["Focus","Low mood"], url:"https://www.youtube.com/results?search_query=forest+ambience+relaxing" }
];

function getTodayKey(){
  return new Date().toISOString().slice(0,10);
}

function initMusic(){
  const chipWrap = $("moodChips");
  const list = $("musicList");
  if (!chipWrap || !list) return;

  // Minutes listened storage
  const minsTodayEl = $("minsToday");
  const minsTotalEl = $("minsTotal");
  const statusEl = $("listenStatus");
  const startBtn = $("startListenBtn");
  const endBtn = $("endListenBtn");

  const totalKey = "enigmaMusicMinsTotal";
  const todayKey = "enigmaMusicMinsToday_" + getTodayKey();
  const sessionKey = "enigmaMusicSessionStart";

  function readInt(key){ return parseInt(localStorage.getItem(key) || "0", 10) || 0; }
  function setInt(key, val){ localStorage.setItem(key, String(val)); }

  function refreshMins(){
    if (minsTodayEl) minsTodayEl.textContent = String(readInt(todayKey));
    if (minsTotalEl) minsTotalEl.textContent = String(readInt(totalKey));
    const s = localStorage.getItem(sessionKey);
    if (statusEl) statusEl.textContent = s ? "Session active." : "No active session.";
  }

  if (startBtn){
    startBtn.onclick = ()=>{
      if (localStorage.getItem(sessionKey)) return;
      localStorage.setItem(sessionKey, String(Date.now()));
      refreshMins();
    };
  }
  if (endBtn){
    endBtn.onclick = ()=>{
      const start = parseInt(localStorage.getItem(sessionKey) || "0", 10);
      if (!start) return;
      const mins = Math.max(0, Math.round((Date.now() - start) / 60000));
      localStorage.removeItem(sessionKey);

      setInt(todayKey, readInt(todayKey) + mins);
      setInt(totalKey, readInt(totalKey) + mins);
      refreshMins();
    };
  }

  refreshMins();

  // Mood filter
  let activeMood = "All";
  function renderChips(){
    chipWrap.innerHTML = "";
    MOODS.forEach(m=>{
      const b = document.createElement("button");
      b.className = "chip" + (m===activeMood ? " active" : "");
      b.type = "button";
      b.textContent = m;
      b.onclick = ()=>{
        activeMood = m;
        renderChips();
        renderTracks();
        const showing = $("moodShowing");
        if (showing) showing.textContent = "Showing: " + activeMood;
      };
      chipWrap.appendChild(b);
    });
  }

  function renderTracks(){
    list.innerHTML = "";
    const filtered = TRACKS.filter(t => activeMood==="All" || t.mood.includes(activeMood));

    filtered.forEach(t=>{
      const btn = document.createElement("button");
      btn.className = "music-btn";
      btn.type = "button";
      btn.innerHTML = `<span>${t.title}</span><span>↗</span>`;

      // iOS-friendly: open on click (user gesture)
      btn.onclick = ()=>{
        window.open(t.url, "_blank", "noopener,noreferrer");
      };

      list.appendChild(btn);
    });

    if (!filtered.length){
      const empty = document.createElement("div");
      empty.className = "gentle-text";
      empty.textContent = "No tracks for this mood yet.";
      list.appendChild(empty);
    }
  }

  renderChips();
  renderTracks();
}

/* =========================================================
   GAME PAGE (game.html) — 20+ palette circles
========================================================= */
const PALETTE_20 = [
  "#b8a6d9", "#d6c8ef", "#efe9f8", "#cbb6e6", "#a79ccf",
  "#bfe3d7", "#9fd6c7", "#7ccab9", "#cfe8f7", "#a7d6f5",
  "#7fbdf0", "#ffd9cf", "#f7c3d8", "#ffe6a7", "#f1f5c5",
  "#c9f0d3", "#b0d0ff", "#d3c7ff", "#f2c7ff", "#c7c7d1"
];

function initGame(){
  const dots = $("paletteDots");
  const designChips = $("designChips");
  if (!dots || !designChips) return;

  const gamePage = $("gamePage");
  const status = $("gameStatus");

  // Designs (chips)
  const DESIGNS = ["Mandala","Flower","Butterfly","Waves","Heart","Sunrise"];
  let activeDesign = "";
  let activeColor = PALETTE_20[0];
  let isFree = false;

  function renderDesigns(){
    designChips.innerHTML = "";
    DESIGNS.forEach(d=>{
      const b = document.createElement("button");
      b.className = "chip" + (d===activeDesign ? " active" : "");
      b.type = "button";
      b.textContent = d;
      b.onclick = ()=>{
        activeDesign = d;
        renderDesigns();
        if ($("designHint")) $("designHint").textContent = `Selected: ${d}`;
        if (status) status.textContent = `Design: ${d} • Colour selected`;
      };
      designChips.appendChild(b);
    });
  }

  function renderPalette(){
    dots.innerHTML = "";
    PALETTE_20.forEach(col=>{
      const d = document.createElement("div");
      d.className = "color-dot" + (col===activeColor ? " selected" : "");
      d.style.background = col;
      d.setAttribute("role","button");
      d.setAttribute("tabindex","0");
      d.onclick = ()=>{
        activeColor = col;
        renderPalette();
        if (status) status.textContent = (activeDesign ? `Design: ${activeDesign} • ` : "") + `Colour selected`;
      };
      dots.appendChild(d);
    });
  }

  function setMode(free){
    isFree = free;
    $("modeByNumber")?.classList.toggle("active", !free);
    $("modeFree")?.classList.toggle("active", free);
    if (gamePage) gamePage.classList.toggle("free-mode", free);
  }

  $("modeByNumber")?.addEventListener("click", ()=> setMode(false));
  $("modeFree")?.addEventListener("click", ()=> setMode(true));

  // Buttons (placeholders for your existing drawing logic)
  $("undoBtn")?.addEventListener("click", ()=> alert("Undo (connect to your colouring logic)"));
  $("eraserBtn")?.addEventListener("click", ()=> alert("Eraser (connect to your colouring logic)"));
  $("clearBtn")?.addEventListener("click", ()=> {
    if (confirm("Clear your colouring?")) alert("Cleared (connect to your colouring logic)");
  });
  $("completeBtn")?.addEventListener("click", ()=> {
    localStorage.setItem("enigmaLastCompletedColour", new Date().toISOString());
    alert("Saved ✅");
  });

  renderDesigns();
  renderPalette();
  setMode(false);
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  applyThemeFromStorage();
  const themeFab = $("themeFab");
  if (themeFab) themeFab.addEventListener("click", toggleTheme);

  initMusic();
  initGame();
});
