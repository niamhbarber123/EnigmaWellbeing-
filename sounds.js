(() => {
  const chipsEl = document.getElementById("musicChips");
  const listEl  = document.getElementById("musicList");

  const todayEl = document.getElementById("todayMin");
  const totalEl = document.getElementById("totalMin");
  const startBtn = document.getElementById("startSession");
  const endBtn = document.getElementById("endSession");
  const stateEl = document.getElementById("sessionState");

  // =========================
  // Tracks by mood (edit/add)
  // =========================
  const MUSIC = [
    {
      mood: "Calm",
      items: [
        { title: "Peaceful piano", desc: "Soft focus + gentle calm.", url: "https://www.youtube.com/results?search_query=peaceful+piano+relaxing" },
        { title: "Lo-fi for relaxation", desc: "Steady background comfort.", url: "https://www.youtube.com/results?search_query=lofi+relaxing+study" }
      ]
    },
    {
      mood: "Anxiety",
      items: [
        { title: "Anxiety calming music", desc: "Slow, settling ambience.", url: "https://www.youtube.com/results?search_query=calming+music+for+anxiety" },
        { title: "432Hz calming", desc: "Soft tones for grounding.", url: "https://www.youtube.com/results?search_query=432hz+calming+music" }
      ]
    },
    {
      mood: "Sleep",
      items: [
        { title: "Deep sleep sounds", desc: "Gentle drift-off soundscape.", url: "https://www.youtube.com/results?search_query=deep+sleep+music" },
        { title: "Rain sounds", desc: "Classic steady rain ambience.", url: "https://www.youtube.com/results?search_query=rain+sounds+for+sleep" }
      ]
    },
    {
      mood: "Focus",
      items: [
        { title: "Lo-fi focus", desc: "Light structure, low distraction.", url: "https://www.youtube.com/results?search_query=lofi+beats+focus" },
        { title: "Instrumental focus", desc: "Calm productivity soundtrack.", url: "https://www.youtube.com/results?search_query=instrumental+music+for+focus" }
      ]
    }
  ];

  const MOODS = MUSIC.map(x => x.mood);
  let active = MOODS[0] || "Calm";

  // =========================
  // Minutes listened (simple)
  // =========================
  const SESS_KEY = "enigma_music_session_v1";
  const MIN_KEY  = "enigma_music_minutes_v1";

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function loadMinutes() {
    try {
      return JSON.parse(localStorage.getItem(MIN_KEY)) || { total: 0, byDay: {} };
    } catch {
      return { total: 0, byDay: {} };
    }
  }

  function saveMinutes(obj) {
    localStorage.setItem(MIN_KEY, JSON.stringify(obj));
  }

  function loadSession() {
    try { return JSON.parse(localStorage.getItem(SESS_KEY)) || null; }
    catch { return null; }
  }

  function saveSession(sess) {
    if (!sess) localStorage.removeItem(SESS_KEY);
    else localStorage.setItem(SESS_KEY, JSON.stringify(sess));
  }

  function updateMinutesUI() {
    const mins = loadMinutes();
    const tk = todayKey();
    const today = mins.byDay[tk] || 0;

    todayEl.textContent = String(today);
    totalEl.textContent = String(mins.total);

    const sess = loadSession();
    if (sess && sess.startedAt) {
      stateEl.textContent = "Session running…";
    } else {
      stateEl.textContent = "No active session.";
    }
  }

  function startSession() {
    const sess = loadSession();
    if (sess && sess.startedAt) {
      stateEl.textContent = "Session already running…";
      return;
    }
    saveSession({ startedAt: Date.now() });
    updateMinutesUI();
  }

  function endSession() {
    const sess = loadSession();
    if (!sess || !sess.startedAt) {
      stateEl.textContent = "No active session.";
      return;
    }

    const elapsedMs = Date.now() - sess.startedAt;
    const minsToAdd = Math.max(0, Math.round(elapsedMs / 60000));

    const store = loadMinutes();
    const tk = todayKey();
    store.byDay[tk] = (store.byDay[tk] || 0) + minsToAdd;
    store.total = (store.total || 0) + minsToAdd;

    saveMinutes(store);
    saveSession(null);
    updateMinutesUI();
  }

  // =========================
  // UI rendering (Enigma tiles)
  // =========================
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  function renderChips() {
    chipsEl.innerHTML = "";
    MOODS.forEach(m => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (m === active ? " active" : "");
      btn.textContent = m;
      btn.addEventListener("click", () => {
        active = m;
        renderChips();
        renderList();
      });
      chipsEl.appendChild(btn);
    });
  }

  function renderList() {
    const group = MUSIC.find(x => x.mood === active);
    const items = group ? group.items : [];

    if (!items.length) {
      listEl.innerHTML = `<div class="gentle-text" style="margin-top:12px;">No tracks for this mood yet.</div>`;
      return;
    }

    listEl.innerHTML = "";
    items.forEach(item => {
      const a = document.createElement("a");
      a.className = "link-btn";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener";

      a.innerHTML = `
        <div>
          <div class="link-title">${escapeHtml(item.title)}</div>
          <div class="link-sub">${escapeHtml(item.desc)}</div>
        </div>
        <div class="link-arrow">→</div>
      `;
      listEl.appendChild(a);
    });
  }

  // Events
  startBtn.addEventListener("click", startSession);
  endBtn.addEventListener("click", endSession);

  // Init
  renderChips();
  renderList();
  updateMinutesUI();
})();
