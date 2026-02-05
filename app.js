/* =========================================================
   Enigma • app.js (CLEAN + WORKING)
   - Theme (night mode)
   - Back navigation
   - Breathe animation (Start/Stop)
   - Quotes (save)
   - Music (moods + links + minutes)
   - Tap to Colour (SVG designs render + palette + modes)
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
     TAP TO COLOUR – GAME (SVG designs render)
  ========================= */
  const GAME_DESIGNS = ["Mandala","Flower","Butterfly","Waves","Heart","Sunrise"];

  const GAME_PALETTE = [
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
        <circle class="fill" data-id="c2" cx="160" cy="160" r="85"  fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <circle class="fill" data-id="c3" cx="160" cy="160" r="50"  fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <circle class="fill" data-id="c4" cx="160" cy="160" r="20"  fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
      </svg>
    `,
    Flower: `
      <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
        <circle class="fill" data-id="f0" cx="160" cy="160" r="30" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <ellipse class="fill" data-id="f1" cx="160" cy="70"  rx="42" ry="58" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <ellipse class="fill" data-id="f2" cx="250" cy="160" rx="42" ry="58" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <ellipse class="fill" data-id="f3" cx="160" cy="250" rx="42" ry="58" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <ellipse class="fill" data-id="f4" cx="70"  cy="160" rx="42" ry="58" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <ellipse class="fill" data-id="f5" cx="220" cy="95"  rx="42" ry="58" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <ellipse class="fill" data-id="f6" cx="220" cy="225" rx="42" ry="58" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <ellipse class="fill" data-id="f7" cx="100" cy="225" rx="42" ry="58" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
        <ellipse class="fill" data-id="f8" cx="100" cy="95"  rx="42" ry="58" fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="3"/>
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
        <path d="M20 90 C60 50, 120 130, 160 90 C200 50, 260 130, 300 90"
              stroke="rgba(90,75,122,0.25)" stroke-width="18" fill="none" stroke-linecap="round"/>
        <path d="M20 160 C60 120, 120 200, 160 160 C200 120, 260 200, 300 160"
              stroke="rgba(90,75,122,0.25)" stroke-width="18" fill="none" stroke-linecap="round"/>
        <path d="M20 230 C60 190, 120 270, 160 230 C200 190, 260 270, 300 230"
              stroke="rgba(90,75,122,0.25)" stroke-width="18" fill="none" stroke-linecap="round"/>
        <rect class="fill" data-id="w1" x="10" y="65"  width="300" height="55" rx="28" fill="#fff" opacity="0.01"/>
        <rect class="fill" data-id="w2" x="10" y="135" width="300" height="55" rx="28" fill="#fff" opacity="0.01"/>
        <rect class="fill" data-id="w3" x="10" y="205" width="300" height="55" rx="28" fill="#fff" opacity="0.01"/>
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
    const mount  = $("canvasMount");
    const chips  = $("designChips");
    const dots   = $("paletteDots");
    const status = $("gameStatus");
    const cbnBtn = $("modeCbnBtn");
    const freeBtn= $("modeFreeBtn");

    if (!mount || !chips || !dots) return;

    let activeDesign = localStorage.getItem("enigmaActiveDesign") || "Mandala";
    let activeColor  = localStorage.getItem("enigmaActiveColor") || GAME_PALETTE[0];
    let freeMode     = localStorage.getItem("enigmaFreeMode") === "1";
    let erasing      = false;

    const undoStack = []; // { id, prev, el }

    function setStatus(msg){
      if (status) status.textContent = msg;
    }

    function renderChips(){
      chips.innerHTML = "";
      GAME_DESIGNS.forEach(name=>{
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (name === activeDesign ? " active" : "");
        b.textContent = name;
        b.addEventListener("click", ()=>{
          activeDesign = name;
          localStorage.setItem("enigmaActiveDesign", activeDesign);
          renderChips();
          loadDesign();
        });
        chips.appendChild(b);
      });
    }

    function renderPalette(){
      dots.innerHTML = "";
      GAME_PALETTE.forEach(col=>{
        const d = document.createElement("button");
        d.type = "button";
        d.className = "color-dot" + (col === activeColor ? " selected" : "");
        d.style.background = col;
        d.addEventListener("click", ()=>{
          activeColor = col;
          localStorage.setItem("enigmaActiveColor", activeColor);
          erasing = false;
          $("eraserBtn")?.classList.remove("active");
          renderPalette();
        });
        dots.appendChild(d);
      });
    }

    function applyMode(){
      $("gamePage")?.classList.toggle("free-mode", freeMode);
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
        else el.setAttribute("fill", "#ffffff");

        el.addEventListener("click", ()=>{
          const fid = el.getAttribute("data-id");
          if (!fid) return;

          const prev = el.getAttribute("fill") || "#ffffff";
          undoStack.push({ id: fid, prev, el });

          const next = erasing ? "#ffffff" : activeColor;
          el.setAttribute("fill", next);

          saved[fid] = next;
          localStorage.setItem(saveKey, JSON.stringify(saved));
        });
      });

      setStatus(`Design: ${activeDesign} • Tap to colour`);
    }

    $("undoBtn")?.addEventListener("click", ()=>{
      const last = undoStack.pop();
      if (!last) return;
      last.el.setAttribute("fill", last.prev);

      const saveKey = `enigmaFill_${activeDesign}`;
      const saved = JSON.parse(localStorage.getItem(saveKey) || "{}");
      saved[last.id] = last.prev;
      localStorage.setItem(saveKey, JSON.stringify(saved));
    });

    $("eraserBtn")?.addEventListener("click", ()=>{
      erasing = !erasing;
      $("eraserBtn")?.classList.toggle("active", erasing);
    });

    $("clearBtn")?.addEventListener("click", ()=>{
      if (!confirm("Clear this design?")) return;
      localStorage.removeItem(`enigmaFill_${activeDesign}`);
      undoStack.length = 0;
      loadDesign();
    });

    $("completeBtn")?.addEventListener("click", ()=>{
      alert("Saved ✅");
    });

    cbnBtn?.addEventListener("click", ()=>{
      freeMode = false;
      localStorage.setItem("enigmaFreeMode", "0");
      applyMode();
    });

    freeBtn?.addEventListener("click", ()=>{
      freeMode = true;
      localStorage.setItem("enigmaFreeMode", "1");
      applyMode();
    });

    renderChips();
    renderPalette();
    applyMode();
    loadDesign();
  }

  /* =========================
     BOOT (single DOMContentLoaded)
  ========================= */
  document.addEventListener("DOMContentLoaded",()=>{
    applyTheme();
    initTheme();
    initBreathe();
    initQuotes();
    initMusic();
    initGame();
  });

})();
