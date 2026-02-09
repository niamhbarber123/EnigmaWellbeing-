(() => {
  const chipsEl = document.getElementById("musicChips");
  const listEl = document.getElementById("musicList");

  const todayEl = document.getElementById("todayMin");
  const totalEl = document.getElementById("totalMin");
  const stateEl = document.getElementById("sessionState");

  const startBtn = document.getElementById("startSession");
  const endBtn = document.getElementById("endSession");

  const KEY_TOTAL = "enigma_music_total_min";
  const KEY_TODAY = "enigma_music_today_min";
  const KEY_DAYSTAMP = "enigma_music_daystamp";
  const KEY_SESSION_START = "enigma_music_session_start";

  const TRACKS = [
    { mood: "Calm", title: "Calm piano / ambient", url: "https://www.youtube.com/results?search_query=calm+piano+ambient+music" },
    { mood: "Focus", title: "Lo-fi focus", url: "https://www.youtube.com/results?search_query=lofi+focus+study+music" },
    { mood: "Sleep", title: "Sleep sounds / rain", url: "https://www.youtube.com/results?search_query=rain+sleep+sounds+8+hours" },
    { mood: "Anxiety", title: "Anxiety relief music", url: "https://www.youtube.com/results?search_query=anxiety+relief+music" },
    { mood: "Energy", title: "Gentle uplifting", url: "https://www.youtube.com/results?search_query=gentle+uplifting+music" },
  ];

  const MOODS = ["All", "Calm", "Focus", "Sleep", "Anxiety", "Energy"];
  let active = "All";

  function dayStamp() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }

  function getNum(key) {
    const v = Number(localStorage.getItem(key) || "0");
    return Number.isFinite(v) ? v : 0;
  }

  function setNum(key, val) {
    localStorage.setItem(key, String(Math.max(0, Math.round(val))));
  }

  function ensureTodayReset() {
    const stamp = localStorage.getItem(KEY_DAYSTAMP);
    const now = dayStamp();
    if (stamp !== now) {
      localStorage.setItem(KEY_DAYSTAMP, now);
      setNum(KEY_TODAY, 0);
      localStorage.removeItem(KEY_SESSION_START);
    }
  }

  function renderTotals() {
    ensureTodayReset();
    todayEl.textContent = String(getNum(KEY_TODAY));
    totalEl.textContent = String(getNum(KEY_TOTAL));

    const start = Number(localStorage.getItem(KEY_SESSION_START) || "0");
    if (start > 0) stateEl.textContent = "Session running…";
    else stateEl.textContent = "No active session.";
  }

  function renderChips() {
    chipsEl.innerHTML = "";
    MOODS.forEach(m => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (m === active ? " active" : "");
      b.textContent = m;
      b.addEventListener("click", () => {
        active = m;
        renderChips();
        renderList();
      });
      chipsEl.appendChild(b);
    });
  }

  function renderList() {
    listEl.innerHTML = "";
    const filtered = active === "All" ? TRACKS : TRACKS.filter(t => t.mood === active);
    filtered.forEach(t => {
      const a = document.createElement("a");
      a.className = "link-pill";
      a.href = t.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `🎧 ${t.title}`;
      listEl.appendChild(a);
    });
  }

  function startSession() {
    ensureTodayReset();
    const existing = Number(localStorage.getItem(KEY_SESSION_START) || "0");
    if (existing > 0) return; // already running
    localStorage.setItem(KEY_SESSION_START, String(Date.now()));
    renderTotals();
  }

  function endSession() {
    ensureTodayReset();
    const start = Number(localStorage.getItem(KEY_SESSION_START) || "0");
    if (!start) return;

    const minutes = Math.max(0, Math.round((Date.now() - start) / 60000));
    localStorage.removeItem(KEY_SESSION_START);

    const today = getNum(KEY_TODAY) + minutes;
    const total = getNum(KEY_TOTAL) + minutes;

    setNum(KEY_TODAY, today);
    setNum(KEY_TOTAL, total);

    renderTotals();
  }

  startBtn.addEventListener("click", startSession);
  endBtn.addEventListener("click", endSession);

  renderChips();
  renderList();
  renderTotals();
})();
