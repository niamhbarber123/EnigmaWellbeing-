(() => {
  const chipsEl = document.getElementById("moodChips");
  const textEl = document.getElementById("checkinText");
  const saveBtn = document.getElementById("saveCheckin");
  const clearBtn = document.getElementById("clearCheckin");
  const msgEl = document.getElementById("savedMsg");
  const listEl = document.getElementById("checkinList");
  const deleteAllBtn = document.getElementById("deleteAllCheckins");

  if (!chipsEl || !textEl || !saveBtn || !clearBtn || !msgEl || !listEl || !deleteAllBtn) return;

  const KEY = "enigma_checkins_v2";
  const MOODS = [
    { label: "Calm", emoji: "😌" },
    { label: "Okay", emoji: "🙂" },
    { label: "Anxious", emoji: "😟" },
    { label: "Low", emoji: "🌧️" },
    { label: "Angry", emoji: "😠" },
    { label: "Overwhelmed", emoji: "😵‍💫" },
    { label: "Tired", emoji: "🥱" },
    { label: "Hopeful", emoji: "🌤️" }
  ];

  let active = MOODS[0].label;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  function timeLabel(ts){
    const d = new Date(ts);
    const dd = String(d.getDate()).padStart(2,"0");
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2,"0");
    const mi = String(d.getMinutes()).padStart(2,"0");
    return `${dd}/${mm}/${yyyy} • ${hh}:${mi}`;
  }

  function renderChips(){
    chipsEl.innerHTML = "";
    MOODS.forEach(m => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (m.label === active ? " active" : "");
      b.textContent = `${m.emoji} ${m.label}`;
      b.addEventListener("click", () => {
        active = m.label;
        renderChips();
      });
      chipsEl.appendChild(b);
    });
  }

  function renderList(){
    const items = load().slice().reverse();
    listEl.innerHTML = "";

    if (!items.length){
      const empty = document.createElement("div");
      empty.className = "gentle";
      empty.textContent = "No saved check-ins yet.";
      listEl.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";

      const top = document.createElement("div");
      top.style.display = "flex";
      top.style.justifyContent = "space-between";
      top.style.gap = "10px";
      top.style.alignItems = "baseline";

      const mood = document.createElement("div");
      mood.style.fontWeight = "900";
      mood.style.color = "var(--ink)";
      mood.textContent = `${item.emoji} ${item.mood}`;

      const when = document.createElement("div");
      when.className = "gentle";
      when.textContent = timeLabel(item.ts);

      top.appendChild(mood);
      top.appendChild(when);

      const body = document.createElement("div");
      body.style.marginTop = "10px";
      body.style.fontWeight = "750";
      body.style.lineHeight = "1.45";
      body.textContent = item.text || "—";

      card.appendChild(top);
      card.appendChild(body);

      listEl.appendChild(card);
    });
  }

  function setMsg(t){
    msgEl.textContent = t;
    if (!t) return;
    setTimeout(() => { msgEl.textContent = ""; }, 1800);
  }

  saveBtn.addEventListener("click", () => {
    const txt = (textEl.value || "").trim();
    const moodObj = MOODS.find(m => m.label === active) || MOODS[0];

    const items = load();
    items.push({
      ts: Date.now(),
      mood: moodObj.label,
      emoji: moodObj.emoji,
      text: txt
    });
    save(items);
    textEl.value = "";
    setMsg("Saved.");
    renderList();
  });

  clearBtn.addEventListener("click", () => {
    textEl.value = "";
    setMsg("Cleared.");
  });

  deleteAllBtn.addEventListener("click", () => {
    localStorage.removeItem(KEY);
    renderList();
    setMsg("Deleted all check-ins.");
  });

  renderChips();
  renderList();
})();
