(() => {
  const KEY = "enigma_moods_v1";

  const moodGrid = document.getElementById("moodGrid");
  const selectedMoodEl = document.getElementById("selectedMood");
  const notesEl = document.getElementById("moodNotes");

  const saveBtn = document.getElementById("saveMood");
  const viewBtn = document.getElementById("viewMoods");
  const clearBtn = document.getElementById("clearMoods");

  const savedWrap = document.getElementById("savedWrap");
  const savedList = document.getElementById("savedList");

  const MOODS = [
    { label: "Calm", emoji: "😌" },
    { label: "Anxious", emoji: "😟" },
    { label: "Low", emoji: "😔" },
    { label: "Stressed", emoji: "😣" },
    { label: "Overwhelmed", emoji: "😵‍💫" },
    { label: "Angry", emoji: "😠" },
    { label: "Tired", emoji: "😴" },
    { label: "Good", emoji: "🙂" }
  ];

  let selectedMood = null;

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function saveAll(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  function fmtDate(iso) {
    const dt = new Date(iso);
    return dt.toLocaleString(undefined, {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  function renderMoodButtons() {
    moodGrid.innerHTML = "";
    MOODS.forEach(m => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mood-btn" + (selectedMood?.label === m.label ? " active" : "");
      btn.innerHTML = `<span class="mood-emoji">${m.emoji}</span><span>${m.label}</span>`;

      btn.addEventListener("click", () => {
        selectedMood = m;
        selectedMoodEl.textContent = `${m.emoji} ${m.label}`;
        renderMoodButtons();
      });

      moodGrid.appendChild(btn);
    });
  }

  function renderSaved() {
    const items = loadAll();
    if (!items.length) {
      savedWrap.style.display = "none";
      savedList.innerHTML = "";
      return;
    }

    savedWrap.style.display = "block";
    savedList.innerHTML = "";

    items.slice().reverse().forEach(item => {
      const row = document.createElement("div");
      row.className = "saved-item";

      const title = document.createElement("div");
      title.className = "saved-title";
      title.textContent = `${item.moodEmoji} ${item.moodLabel}`;

      const meta = document.createElement("div");
      meta.className = "saved-meta";
      meta.textContent = fmtDate(item.createdAt);

      row.appendChild(title);
      row.appendChild(meta);

      if (item.notes) {
        const notes = document.createElement("div");
        notes.className = "saved-notes";
        notes.textContent = item.notes;
        row.appendChild(notes);
      }

      savedList.appendChild(row);
    });
  }

  saveBtn.addEventListener("click", () => {
    const notes = (notesEl.value || "").trim();
    if (!selectedMood && !notes) return;

    const entry = {
      moodLabel: selectedMood ? selectedMood.label : "Unlabelled",
      moodEmoji: selectedMood ? selectedMood.emoji : "📝",
      notes,
      createdAt: new Date().toISOString()
    };

    const items = loadAll();
    items.push(entry);
    saveAll(items);

    notesEl.value = "";
    renderSaved();
  });

  viewBtn.addEventListener("click", () => {
    renderSaved();
    if (savedWrap.style.display === "none") return;
    savedWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(KEY);
    renderSaved();
  });

  renderMoodButtons();
  renderSaved();
})();
