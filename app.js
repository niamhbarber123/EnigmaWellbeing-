/* =========================================================
   Enigma • app.js (CLEAN + WORKING)
   - Theme (night mode)
   - Back navigation
   - Breathe animation (Start/Stop)
   - Quotes (save)
   - Music (moods + links + minutes)
   - Tap to Colour (COMPLEX SVG + colour-by-number + free mode)
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
     TAP TO COLOUR – GAME (complex + numbers fixed)
  ========================= */

  const GAME_DESIGNS = [
    "Mandala (Complex)",
    "Lotus Garden",
    "Butterfly (Detailed)"
  ];

  const GAME_PALETTE = [
    "#6B4FA3","#9B7BD0","#C3B2EA","#F1EAFE",
    "#4F6BD8","#7AA6F9","#9DD1FF",
    "#2E8B8B","#63BFAF","#A7E2D3",
    "#2C7A4B","#66B36A","#B8E6A7",
    "#F2D46D","#F5B86B","#E98E7A",
    "#F2A7B8","#D46AA6","#6A6A74","#B9B9C6"
  ];

  // Helper for repeated petals
  function petal(cx, cy, rx, ry, rotDeg, id, num){
    return `<ellipse class="fill" data-id="${id}" data-num="${num}"
      cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
      transform="rotate(${rotDeg} ${cx} ${cy})"
      fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="2.4"/>`;
  }

  // Create a complex mandala dynamically
  function mandalaComplexSVG(){
    const cx = 160, cy = 160;
    let petals = "";
    // Outer ring 16 petals
    for(let i=0;i<16;i++){
      const a = (360/16)*i;
      petals += petal(cx, cy-92, 24, 56, a, `m_out_${i}`, (i%6)+1);
    }
    // Inner ring 10 petals
    for(let i=0;i<10;i++){
      const a = (360/10)*i;
      petals += petal(cx, cy-62, 18, 40, a, `m_in_${i}`, ((i+2)%6)+1);
    }

    // Small circle segments (tap-able)
    let dots = "";
    for(let i=0;i<12;i++){
      const ang = (Math.PI*2/12)*i;
      const x = cx + 98*Math.cos(ang);
      const y = cy + 98*Math.sin(ang);
      dots += `<circle class="fill" data-id="m_dot_${i}" data-num="${(i%6)+1}"
        cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10"
        fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="2.2"/>`;
    }

    // Number labels (placed at common areas)
    const labels = `
      <text class="number-overlay" x="160" y="40">1</text>
      <text class="number-overlay" x="250" y="90">2</text>
      <text class="number-overlay" x="275" y="170">3</text>
      <text class="number-overlay" x="230" y="255">4</text>
      <text class="number-overlay" x="90" y="255">5</text>
      <text class="number-overlay" x="45" y="170">6</text>
    `;

    return `
      <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
        <circle cx="160" cy="160" r="138" fill="rgba(255,255,255,0.6)" stroke="rgba(90,75,122,0.18)" stroke-width="3"/>
        <circle cx="160" cy="160" r="110" fill="rgba(255,255,255,0.55)" stroke="rgba(90,75,122,0.18)" stroke-width="3"/>
        ${petals}
        ${dots}
        <circle class="fill" data-id="m_center_1" data-num="1" cx="160" cy="160" r="48" fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="2.8"/>
        <circle class="fill" data-id="m_center_2" data-num="4" cx="160" cy="160" r="26" fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="2.8"/>
        <circle class="fill" data-id="m_center_3" data-num="6" cx="160" cy="160" r="12" fill="#ffffff" stroke="rgba(90,75,122,0.25)" stroke-width="2.8"/>
        ${labels}
      </svg>
    `;
  }

  const SVG_DESIGNS = {
    "Mandala (Complex)": mandalaComplexSVG(),

    "Lotus Garden": `
      <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
        <!-- Water -->
        <path class="fill" data-id="lg_water_1" data-num="3"
          d="M20 230 C70 205, 110 255, 160 230 C210 205, 250 255, 300 230 L300 300 L20 300 Z"
          fill="#fff" stroke="rgba(90,75,122,0.22)" stroke-width="2.6"/>
        <path class="fill" data-id="lg_water_2" data-num="6"
          d="M20 255 C70 230, 110 280, 160 255 C210 230, 250 280, 300 255 L300 300 L20 300 Z"
          fill="#fff" stroke="rgba(90,75,122,0.22)" stroke-width="2.6"/>

        <!-- Leaves -->
        <ellipse class="fill" data-id="lg_leaf_1" data-num="5" cx="90" cy="220" rx="46" ry="22"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.6"/>
        <ellipse class="fill" data-id="lg_leaf_2" data-num="2" cx="235" cy="220" rx="52" ry="24"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.6"/>

        <!-- Lotus petals (outer 10) -->
        ${Array.from({length:10}).map((_,i)=>{
          const a = (360/10)*i;
          const num = (i%6)+1;
          return `<ellipse class="fill" data-id="lg_p_out_${i}" data-num="${num}"
            cx="160" cy="150" rx="18" ry="58"
            transform="rotate(${a} 160 150)"
            fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.4"/>`;
        }).join("")}

        <!-- Lotus petals (inner 6) -->
        ${Array.from({length:6}).map((_,i)=>{
          const a = (360/6)*i;
          const num = ((i+3)%6)+1;
          return `<ellipse class="fill" data-id="lg_p_in_${i}" data-num="${num}"
            cx="160" cy="150" rx="14" ry="42"
            transform="rotate(${a} 160 150)"
            fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.4"/>`;
        }).join("")}

        <!-- Centre -->
        <circle class="fill" data-id="lg_center_1" data-num="1" cx="160" cy="150" r="28"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.8"/>
        <circle class="fill" data-id="lg_center_2" data-num="4" cx="160" cy="150" r="12"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.8"/>

        <!-- Number labels -->
        <text class="number-overlay" x="160" y="55">1</text>
        <text class="number-overlay" x="250" y="125">2</text>
        <text class="number-overlay" x="255" y="255">3</text>
        <text class="number-overlay" x="160" y="295">4</text>
        <text class="number-overlay" x="70"  y="255">5</text>
        <text class="number-overlay" x="70"  y="125">6</text>
      </svg>
    `,

    "Butterfly (Detailed)": `
      <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="320" fill="rgba(255,255,255,0)"/>
        <!-- Left wing segments -->
        <path class="fill" data-id="bf_l1" data-num="1"
          d="M160 160 C120 90, 55 110, 62 178 C68 240, 120 240, 160 205 Z"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.8"/>
        <path class="fill" data-id="bf_l2" data-num="3"
          d="M150 160 C118 120, 82 132, 86 178 C90 212, 120 216, 150 196 Z"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.4"/>
        <path class="fill" data-id="bf_l3" data-num="5"
          d="M150 182 C125 165, 108 170, 110 190 C112 210, 132 210, 150 198 Z"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.2"/>

        <!-- Right wing segments -->
        <path class="fill" data-id="bf_r1" data-num="2"
          d="M160 160 C200 90, 265 110, 258 178 C252 240, 200 240, 160 205 Z"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.8"/>
        <path class="fill" data-id="bf_r2" data-num="4"
          d="M170 160 C202 120, 238 132, 234 178 C230 212, 200 216, 170 196 Z"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.4"/>
        <path class="fill" data-id="bf_r3" data-num="6"
          d="M170 182 C195 165, 212 170, 210 190 C208 210, 188 210, 170 198 Z"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.2"/>

        <!-- Body -->
        <rect class="fill" data-id="bf_body" data-num="1" x="150" y="110" width="20" height="140" rx="10"
          fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2.8"/>

        <!-- Spots -->
        ${Array.from({length:10}).map((_,i)=>{
          const x = 95 + (i%5)*18;
          const y = 145 + Math.floor(i/5)*30;
          const num = (i%6)+1;
          return `<circle class="fill" data-id="bf_sp_l_${i}" data-num="${num}" cx="${x}" cy="${y}" r="6"
            fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2"/>`;
        }).join("")}

        ${Array.from({length:10}).map((_,i)=>{
          const x = 225 - (i%5)*18;
          const y = 145 + Math.floor(i/5)*30;
          const num = ((i+2)%6)+1;
          return `<circle class="fill" data-id="bf_sp_r_${i}" data-num="${num}" cx="${x}" cy="${y}" r="6"
            fill="#fff" stroke="rgba(90,75,122,0.25)" stroke-width="2"/>`;
        }).join("")}

        <!-- Number labels -->
        <text class="number-overlay" x="70"  y="120">1</text>
        <text class="number-overlay" x="250" y="120">2</text>
        <text class="number-overlay" x="85"  y="230">3</text>
        <text class="number-overlay" x="235" y="230">4</text>
        <text class="number-overlay" x="160" y="285">5</text>
        <text class="number-overlay" x="160" y="65">6</text>
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
    const numberRow = $("numberRow");
    const modeHint = $("modeHint");

    if (!mount || !chips || !dots) return;

    let activeDesign = localStorage.getItem("enigmaActiveDesignV2") || "Mandala (Complex)";
    let activeColor  = localStorage.getItem("enigmaActiveColorV2")  || GAME_PALETTE[0];
    let freeMode     = (localStorage.getItem("enigmaFreeModeV2") === "1");
    let erasing      = false;

    let activeNum = Number(localStorage.getItem("enigmaActiveNumV2") || "1");

    const undoStack = []; // { id, prev, el }

    function setStatus(msg){
      if (status) status.textContent = msg;
    }

    function setModeHint(){
      if (!modeHint) return;
      if (freeMode){
        modeHint.textContent = "Free colour: tap any area to colour. Numbers are hidden.";
      } else {
        modeHint.textContent = "Colour-by-number: choose a number, then tap matching areas.";
      }
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
          localStorage.setItem("enigmaActiveDesignV2", activeDesign);
          undoStack.length = 0;
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
          localStorage.setItem("enigmaActiveColorV2", activeColor);
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

      // show number row only in CBN mode
      if (numberRow) numberRow.style.display = freeMode ? "none" : "flex";
      setModeHint();
      renderNumberRow();
    }

    function getNumbersInDesign(){
      const nums = new Set();
      mount.querySelectorAll(".fill").forEach(el=>{
        const n = Number(el.getAttribute("data-num") || "0");
        if (n) nums.add(n);
      });
      // fallback 1..6
      if (!nums.size) [1,2,3,4,5,6].forEach(x=>nums.add(x));
      return Array.from(nums).sort((a,b)=>a-b);
    }

    function numberToColor(n){
      // stable mapping: 1->first palette colour, etc
      return GAME_PALETTE[(n - 1) % GAME_PALETTE.length];
    }

    function renderNumberRow(){
      if (!numberRow) return;
      if (freeMode) return;

      const nums = getNumbersInDesign();
      numberRow.innerHTML = "";

      nums.forEach(n=>{
        const b = document.createElement("button");
        b.type = "button";
        b.className = "number-chip" + (n === activeNum ? " active" : "");
        b.textContent = String(n);

        b.addEventListener("click", ()=>{
          activeNum = n;
          localStorage.setItem("enigmaActiveNumV2", String(activeNum));

          // auto-pick a colour for this number (feels like true colour-by-number)
          activeColor = numberToColor(activeNum);
          localStorage.setItem("enigmaActiveColorV2", activeColor);

          renderNumberRow();
          renderPalette();

          setStatus(`Design: ${activeDesign} • Number ${activeNum}`);
        });

        numberRow.appendChild(b);
      });
    }

    function loadDesign(){
      const svg = SVG_DESIGNS[activeDesign] || "<div class='gentle-text'>Design missing.</div>";
      mount.innerHTML = svg;

      const saveKey = `enigmaFillV2_${activeDesign}`;
      const saved = JSON.parse(localStorage.getItem(saveKey) || "{}");

      // Restore fills + attach click handlers
      mount.querySelectorAll(".fill").forEach(el=>{
        const id = el.getAttribute("data-id");
        if (id && saved[id]) el.setAttribute("fill", saved[id]);
        else el.setAttribute("fill", "#ffffff");

        el.addEventListener("click", ()=>{
          const fid = el.getAttribute("data-id");
          const num = Number(el.getAttribute("data-num") || "0");
          if (!fid) return;

          // Colour-by-number enforcement:
          if (!freeMode && !erasing){
            if (num && num !== activeNum){
              // gentle feedback (no alert)
              setStatus(`Pick number ${num} to colour this area.`);
              el.classList.add("cbn-wrong");
              setTimeout(()=> el.classList.remove("cbn-wrong"), 180);
              return;
            }
          }

          const prev = el.getAttribute("fill") || "#ffffff";
          undoStack.push({ id: fid, prev, el });

          const next = erasing ? "#ffffff" : activeColor;
          el.setAttribute("fill", next);

          saved[fid] = next;
          localStorage.setItem(saveKey, JSON.stringify(saved));
        });
      });

      // Ensure number row matches this SVG’s numbers
      const nums = getNumbersInDesign();
      if (nums.length && !nums.includes(activeNum)){
        activeNum = nums[0];
        localStorage.setItem("enigmaActiveNumV2", String(activeNum));
      }

      renderNumberRow();
      renderPalette();
      applyMode();

      setStatus(`Design: ${activeDesign}${freeMode ? "" : ` • Number ${activeNum}`}`);
    }

    $("undoBtn")?.addEventListener("click", ()=>{
      const last = undoStack.pop();
      if (!last) return;
      last.el.setAttribute("fill", last.prev);

      const saveKey = `enigmaFillV2_${activeDesign}`;
      const saved = JSON.parse(localStorage.getItem(saveKey) || "{}");
      saved[last.id] = last.prev;
      localStorage.setItem(saveKey, JSON.stringify(saved));
    });

    $("eraserBtn")?.addEventListener("click", ()=>{
      erasing = !erasing;
      $("eraserBtn")?.classList.toggle("active", erasing);
      setStatus(erasing ? "Eraser on" : "Eraser off");
    });

    $("clearBtn")?.addEventListener("click", ()=>{
      if (!confirm("Clear this design?")) return;
      localStorage.removeItem(`enigmaFillV2_${activeDesign}`);
      undoStack.length = 0;
      loadDesign();
    });

    $("completeBtn")?.addEventListener("click", ()=>{
      alert("Saved ✅");
    });

    cbnBtn?.addEventListener("click", ()=>{
      freeMode = false;
      localStorage.setItem("enigmaFreeModeV2", "0");
      applyMode();
      setStatus(`Design: ${activeDesign} • Number ${activeNum}`);
    });

    freeBtn?.addEventListener("click", ()=>{
      freeMode = true;
      localStorage.setItem("enigmaFreeModeV2", "1");
      applyMode();
      setStatus(`Design: ${activeDesign} • Free colour`);
    });

    renderChips();
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
