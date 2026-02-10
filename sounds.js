(() => {
  const chipsEl = document.getElementById("musicChips");
  const listEl  = document.getElementById("musicList");

  const todayEl = document.getElementById("todayMin");
  const totalEl = document.getElementById("totalMin");
  const startBtn = document.getElementById("startSession");
  const endBtn = document.getElementById("endSession");
  const stateEl = document.getElementById("sessionState");

  if (!chipsEl || !listEl || !todayEl || !totalEl || !startBtn || !endBtn || !stateEl) return;

  const MUSIC = [
    { mood: "Calm", items: [
      { title: "Peaceful piano", desc: "Soft focus + gentle calm.", url: "https://www.youtube.com/results?search_query=peaceful+piano+relaxing" },
      { title: "Lo-fi for relaxation", desc: "Steady background comfort.", url: "https://www.youtube.com/results?search_query=lofi+relaxing+study" }
    ]},
    { mood: "Anxiety", items: [
      { title: "Calming for anxiety", desc: "Slow, settling ambience.", url: "https://www.youtube.com/results?search_query=calming+music+for+anxiety" },
      { title: "Grounding soundscape", desc: "Comforting tones for regulation.", url: "https://www.youtube.com/results?search_query=grounding+ambient+music" }
    ]},
    { mood: "Sleep", items: [
      { title: "Deep sleep music", desc: "Gentle drift-off soundscape.", url: "https://www.youtube.com/results?search_query=deep+sleep+music" },
      { title: "Rain sounds", desc: "Classic steady rain ambience.", url: "https://www.youtube.com/results?search_query=rain+sounds+for+sleep" }
    ]},
    { mood: "Focus", items: [
      { title: "Lo-fi focus", desc: "Light structure, low distraction.", url: "https://www.youtube.com/results?search_query=lofi+beats+focus" },
      { title: "Instrumental focus", desc: "Calm productivity soundtrack.", url: "https://www.youtube.com/results?search_query=instrumental+music+for+focus" }
    ]}
  ];

  const MOODS = MUSIC.map(x => x.mood);
  let active = MOODS[0] || "Calm";

  const SESS_KEY = "enigma_music_session_v1";
  const MIN_KEY  = "enigma_music_minutes_v1";

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function loadMinutes() {
    try { return JSON.parse(localStorage.getItem(MIN_KEY)) || { total: 0, byDay: {} }; }
    catch { return { total: 0, byDay: {} }; }
  }
  function saveMinutes(obj) {
    try { localStorage.setItem(MIN_KEY, JSON.stringify(obj)); } catch {}
  }

  function loadSession() {
    try { return JSON.parse(localStorage.getItem(SESS_KEY)) || null; }
    catch { return null; }
  }
  function saveSession(sess) {
    try {
      if (!sess) localStorage.removeItem(SESS_KEY);
      else localStorage.setItem(SESS_KEY, JSON.stringify(sess));
    } catch {}
  }

  function updateMinutesUI() {
    const mins = loadMinutes();
    const tk = todayKey();
    const today = mins.byDay[tk] || 0;

    todayEl.textContent = String(today);
    totalEl.textContent = String(mins.total || 0);

    const sess = loadSession();
    stateEl.textContent = (sess && sess.startedAt) ? "Session running…" : "No active session.";
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

  function esc(str){
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
    listEl.innerHTML = "";

    items.forEach(item => {
      const a = document.createElement("a");
      a.className = "link-btn";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `
        <div>
          <div class="link-title">${esc(item.title)}</div>
          <div class="link-sub">${esc(item.desc)}</div>
        </div>
        <div class="link-arrow">→</div>
      `;
      listEl.appendChild(a);
    });
  }

  startBtn.addEventListener("click", startSession);
  endBtn.addEventListener("click", endSession);

  renderChips();
  renderList();
  updateMinutesUI();
})();
