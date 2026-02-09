(() => {
  const KEY = "enigma_mood_entries_v1";
  const chipsEl = document.getElementById("moodChips");
  const textEl = document.getElementById("moodText");
  const saveBtn = document.getElementById("saveMood");
  const clearBtn = document.getElementById("clearMood");
  const listEl = document.getElementById("moodList");

  if (!chipsEl || !textEl || !saveBtn || !clearBtn || !listEl) return;

  const MOODS = ["Calm","Okay","Anxious","Low","Angry","Overwhelmed","Tired","Hopeful"];

  let activeMood = "Okay";

  function load(){
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(arr){
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
  }

  function esc(s){
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function renderChips(){
    chipsEl.innerHTML = "";
    MOODS.forEach(m => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (m === activeMood ? " active" : "");
      b.textContent = m;
      b.addEventListener("click", () => {
        activeMood = m;
        renderChips();
      });
      chipsEl.appendChild(b);
    });
  }

  function renderList(){
    const arr = load().slice(-7).reverse();
    if (!arr.length){
      listEl.innerHTML = `<div class="gentle-text">No entries yet.</div>`;
      return;
    }

    listEl.innerHTML = "";
    arr.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.marginTop = "12px";
      card.innerHTML = `
        <div class="section-title">${esc(item.mood)} <span class="gentle-text" style="font-weight:800;">• ${esc(item.date)}</span></div>
        <div class="gentle-text" style="margin-top:8px; white-space:pre-wrap;">${esc(item.text)}</div>
      `;
      listEl.appendChild(card);
    });
  }

  function today(){
    const d = new Date();
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  }

  saveBtn.addEventListener("click", () => {
    const txt = (textEl.value || "").trim();
    if (!txt) return;

    const arr = load();
    arr.push({ mood: activeMood, text: txt, date: today(), ts: Date.now() });
    save(arr);

    textEl.value = "";
    renderList();
  });

  clearBtn.addEventListener("click", () => {
    textEl.value = "";
  });

  renderChips();
  renderList();
})();
