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
      btn.className = "small-pill";
      btn.style.justifyContent = "flex-start";
      btn.style.gap = "10px";
      btn.style.width = "100%";
      btn.textContent = `${m.emoji} ${m.label}`;

      btn.addEventListener("click", () => {
        selectedMood = m;
        selectedMoodEl.textContent = `${m.emoji} ${m.label}`;
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
      row.className = "card";
      row.style.margin = "0";
      row.style.padding = "14px 16px";

      row.innerHTML = `
        <div style="font-weight:900;font-size:16px;">${item.moodEmoji} ${item.moodLabel}</div>
        <div style="margin-top:6px;font-weight:700;font-size:13px;color:var(--muted);">${fmtDate(item.createdAt)}</div>
        ${item.notes ? `<div style="margin-top:10px;font-weight:650;font-size:15px;line-height:1.45;">${escapeHtml(item.notes)}</div>` : ""}
      `;

      savedList.appendChild(row);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
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
    if (savedWrap.style.display !== "none") {
      savedWrap.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(KEY);
    renderSaved();
  });

  renderMoodButtons();
  renderSaved();
})();
