/* =========================================================
   Enigma • app.js (FULL)
   Includes:
   - Theme (night mode)
   - Back navigation
   - Breathe animation
   - Quotes (save / daily shuffle)
   - Music (moods + links + minutes)
   - Tap to Colour (DESIGNS + PALETTE + modes)
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
    if(btn) btn.onclick = toggleTheme;
  }

/* =========================
   BREATHE (reliable)
========================= */
function initBreathe(){
  const page = document.getElementById("breathePage");
  if (!page) return;

  const circle = document.getElementById("breatheCircle");
  const phase  = document.getElementById("breathPhase");
  const tip    = document.getElementById("breathTip");
  const start  = document.getElementById("breathStartBtn");
  const stop   = document.getElementById("breathStopBtn");
  const done   = document.getElementById("breathCompleteBtn");

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
      const day = new Date().toISOString().split("T")[0];
      obj[day] = (obj[day] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(obj));
      done.textContent = "Saved ✅";
      setTimeout(()=> done.textContent = "Completed ✅", 1200);
    }, { passive:false });
  }

  reset();
}

  /* =========================
     QUOTES
  ========================= */
  const QUOTES = [
    {q:"Nothing can dim the light that shines from within.",a:"Maya Angelou"},
    {q:"No one can make you feel inferior without your consent.",a:"Eleanor Roosevelt"},
    {q:"Well-behaved women seldom make history.",a:"Laurel Thatcher Ulrich"},
    {q:"My peace is my priority.",a:"Affirmation"}
  ];

  function initQuotes(){
    const grid = $("quoteGrid");
    if(!grid) return;

    const saved = new Set(JSON.parse(localStorage.getItem("enigmaQuotes")||"[]"));
    grid.innerHTML = "";

    QUOTES.forEach(q=>{
      const tile = document.createElement("div");
      tile.className = "quote-tile" + (saved.has(q.q)?" saved":"");
      tile.innerHTML = `
        <div>“${q.q}”</div>
        <small>— ${q.a}</small>
        <button class="quote-save-btn">${saved.has(q.q)?"Saved":"Save"}</button>
      `;

      tile.querySelector("button").onclick = ()=>{
        saved.has(q.q) ? saved.delete(q.q) : saved.add(q.q);
        localStorage.setItem("enigmaQuotes",JSON.stringify([...saved]));
        initQuotes();
      };

      grid.appendChild(tile);
    });
  }

  /* =========================
     MUSIC (Links + minutes)
  ========================= */
  const MOODS = ["All","Anxious","Stressed","Focus","Sleep"];
  const TRACKS = [
    {t:"Calm breathing music",m:"Anxious",u:"https://www.youtube.com/watch?v=odADwWzHR24"},
    {t:"Lo-fi focus mix",m:"Focus",u:"https://www.youtube.com/watch?v=jfKfPfyJRdk"},
    {t:"Sleep music",m:"Sleep",u:"https://www.youtube.com/watch?v=DWcJFNfaw9c"}
  ];

  function initMusic(){
    if(!$("musicPage")) return;

    let mood="All", start=null;

    function render(){
      $("musicList").innerHTML="";
      TRACKS.filter(x=>mood==="All"||x.m===mood).forEach(x=>{
        const a=document.createElement("a");
        a.href=x.u;a.target="_blank";
        a.className="music-btn";
        a.innerHTML=`<span>${x.t}</span><span>▶</span>`;
        $("musicList").appendChild(a);
      });
    }

    $("moodChips").innerHTML="";
    MOODS.forEach(m=>{
      const b=document.createElement("button");
      b.className="chip"+(m===mood?" active":"");
      b.textContent=m;
      b.onclick=()=>{mood=m;initMusic();};
      $("moodChips").appendChild(b);
    });

    $("startListenBtn").onclick=()=>{start=Date.now();$("listenStatus").textContent="Listening…";};
    $("endListenBtn").onclick=()=>{
      if(!start) return;
      const mins=Math.max(1,Math.round((Date.now()-start)/60000));
      const total=Number(localStorage.getItem("musicMins")||0)+mins;
      localStorage.setItem("musicMins",total);
      $("minsTotal").textContent=total;
      $("listenStatus").textContent=`Saved ${mins} min`;
      start=null;
    };

    $("minsTotal").textContent=localStorage.getItem("musicMins")||0;
    render();
  }

  /* =========================
   TAP TO COLOUR – GAME (SVG designs that render)
========================= */

const DESIGNS = ["Mandala","Flower","Butterfly","Waves","Heart","Sunrise"];

const PALETTE = [
  "#6B4FA3","#9B7BD0","#C3B2EA","#F1EAFE",
  "#4F6BD8","#7AA6F9","#9DD1FF",
  "#2E8B8B","#63BFAF","#A7E2D3",
  "#2C7A4B","#66B36A","#B8E6A7",
  "#F2D46D","#F5B86B","#E98E7A",
  "#F2A7B8","#D46AA6","#6A6A74","#B9B9C6"
];

const SVG_DESIGNS = {
  Mandala: `
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
      <circle class="fill" data-id="c1" cx="160" cy="160" r="120" fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
      <circle class="fill" data-id="c2" cx="160" cy="160" r="85" fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
      <circle class="fill" data-id="c3" cx="160" cy="160" r="50" fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
      <circle class="fill" data-id="c4" cx="160" cy="160" r="20" fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
    </svg>
  `,
  Flower: `
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
      <circle class="fill" data-id="f0" cx="160" cy="160" r="30" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
      ${Array.from({length:8}).map((_,i)=>{
        const a=i*(Math.PI*2/8);
        const x=160+90*Math.cos(a), y=160+90*Math.sin(a);
        return `<ellipse class="fill" data-id="f${i+1}" cx="${x}" cy="${y}" rx="42" ry="58" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>`;
      }).join("")}
    </svg>
  `,
  Butterfly: `
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
      <path class="fill" data-id="b1" d="M160 160 C120 90, 60 110, 70 170 C80 230, 125 240, 160 200 Z" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
      <path class="fill" data-id="b2" d="M160 160 C200 90, 260 110, 250 170 C240 230, 195 240, 160 200 Z" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
      <rect class="fill" data-id="b3" x="150" y="120" width="20" height="120" rx="10" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
    </svg>
  `,
  Waves: `
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
      <path d="M20 90 C60 50, 120 130, 160 90 C200 50, 260 130, 300 90" stroke="rgba(90,75,122,0.25)" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M20 160 C60 120, 120 200, 160 160 C200 120, 260 200, 300 160" stroke="rgba(90,75,122,0.25)" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M20 230 C60 190, 120 270, 160 230 C200 190, 260 270, 300 230" stroke="rgba(90,75,122,0.25)" stroke-width="18" fill="none" stroke-linecap="round"/>
      <!-- tap regions -->
      <rect class="fill" data-id="w1" x="10" y="65" width="300" height="50" rx="25" fill="#fff" opacity="0.001"/>
      <rect class="fill" data-id="w2" x="10" y="135" width="300" height="50" rx="25" fill="#fff" opacity="0.001"/>
      <rect class="fill" data-id="w3" x="10" y="205" width="300" height="50" rx="25" fill="#fff" opacity="0.001"/>
    </svg>
  `,
  Heart: `
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
      <path class="fill" data-id="h1" d="M160 270 C80 210, 40 160, 70 120
        C95 85, 140 95, 160 130
        C180 95, 225 85, 250 120
        C280 160, 240 210, 160 270 Z"
        fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
    </svg>
  `,
  Sunrise: `
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
      <rect class="fill" data-id="s1" x="30" y="210" width="260" height="60" rx="20" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
      <circle class="fill" data-id="s2" cx="160" cy="210" r="70" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
    </svg>
  `
};

function initGame(){
  const mount = document.getElementById("canvasMount");
  const chips = document.getElementById("designChips");
  const dots = document.getElementById("paletteDots");
  const status = document.getElementById("gameStatus");
  const cbnBtn = document.getElementById("modeCbnBtn");
  const freeBtn = document.getElementById("modeFreeBtn");

  if (!mount || !chips || !dots) return;

  let activeDesign = localStorage.getItem("enigmaActiveDesign") || "Mandala";
  let activeColor = localStorage.getItem("enigmaActiveColor") || PALETTE[0];
  let freeMode = localStorage.getItem("enigmaFreeMode") === "1";
  let erasing = false;

  const history = []; // { id, prev, el }

  function setStatus(msg){ if (status) status.textContent = msg; }

  function renderChips(){
    chips.innerHTML = "";
    DESIGNS.forEach(name=>{
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (name===activeDesign ? " active" : "");
      b.textContent = name;
      b.onclick = ()=>{
        activeDesign = name;
        localStorage.setItem("enigmaActiveDesign", activeDesign);
        renderChips();
        loadDesign();
      };
      chips.appendChild(b);
    });
  }

  function renderPalette(){
    dots.innerHTML = "";
    PALETTE.forEach(col=>{
      const d = document.createElement("button");
      d.type = "button";
      d.className = "color-dot" + (col===activeColor ? " selected" : "");
      d.style.background = col;
      d.onclick = ()=>{
        activeColor = col;
        localStorage.setItem("enigmaActiveColor", activeColor);
        erasing = false;
        document.getElementById("eraserBtn")?.classList.remove("active");
        renderPalette();
      };
      dots.appendChild(d);
    });
  }

  function applyMode(){
    document.getElementById("gamePage")?.classList.toggle("free-mode", freeMode);
    cbnBtn?.classList.toggle("active", !freeMode);
    freeBtn?.classList.toggle("active", freeMode);
  }

  function loadDesign(){
    mount.innerHTML = SVG_DESIGNS[activeDesign] || "<div class='gentle-text'>Design missing.</div>";

    const saveKey = `enigmaFill_${activeDesign}`;
    const saved = JSON.parse(localStorage.getItem(saveKey) || "{}");

    mount.querySelectorAll(".fill").forEach(el=>{
      const id = el.getAttribute("data-id");
      if (id && saved[id]) el.setAttribute("fill", saved[id]);
      el.style.cursor = "pointer";

      el.addEventListener("click", ()=>{
        const fid = el.getAttribute("data-id");
        if (!fid) return;

        const prev = el.getAttribute("fill") || "#fff";
        history.push({ id: fid, prev, el });

        const next = erasing ? "#ffffff" : activeColor;
        el.setAttribute("fill", next);

        saved[fid] = next;
        localStorage.setItem(saveKey, JSON.stringify(saved));
      });
    });

    setStatus(`Design: ${activeDesign} • Tap to colour`);
  }

  // tools
  document.getElementById("undoBtn")?.addEventListener("click", ()=>{
    const last = history.pop();
    if (!last) return;
    last.el.setAttribute("fill", last.prev);

    const saveKey = `enigmaFill_${activeDesign}`;
    const saved = JSON.parse(localStorage.getItem(saveKey) || "{}");
    saved[last.id] = last.prev;
    localStorage.setItem(saveKey, JSON.stringify(saved));
  });

  document.getElementById("eraserBtn")?.addEventListener("click", ()=>{
    erasing = !erasing;
    document.getElementById("eraserBtn")?.classList.toggle("active", erasing);
  });

  document.getElementById("clearBtn")?.addEventListener("click", ()=>{
    if (!confirm("Clear this design?")) return;
    localStorage.removeItem(`enigmaFill_${activeDesign}`);
    history.length = 0;
    loadDesign();
  });

  document.getElementById("completeBtn")?.addEventListener("click", ()=>{
    alert("Saved ✅");
  });

  cbnBtn?.addEventListener("click", ()=>{
    freeMode = false;
    localStorage.setItem("enigmaFreeMode","0");
    applyMode();
  });

  freeBtn?.addEventListener("click", ()=>{
    freeMode = true;
    localStorage.setItem("enigmaFreeMode","1");
    applyMode();
  });

  renderChips();
  renderPalette();
  applyMode();
  loadDesign();
}

// Make sure this is called in your main DOMContentLoaded boot:
document.addEventListener("DOMContentLoaded", () => {
  initGame();
});
  /* =========================
     BOOT
  ========================= */
  document.addEventListener("DOMContentLoaded",()=>{
    applyTheme();
    initTheme();
    initBreathe();
    initQuotes();
    initMusic();
    initDesigns();
    initPalette();
    initModes();
  });

})();
