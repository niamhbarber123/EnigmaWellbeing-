/* =========================
   Journal (localStorage)
========================= */
function getJournalEntries(){
  return JSON.parse(localStorage.getItem("enigmaJournalEntries") || "[]");
}

function saveJournalEntry(){
  const textEl = document.getElementById("journalText");
  const msgEl = document.getElementById("journalMsg");
  if (!textEl) return;

  const text = textEl.value.trim();
  if (!text){
    if (msgEl) msgEl.textContent = "Write a little first 💜";
    return;
  }

  const entries = getJournalEntries();
  entries.unshift({
    date: new Date().toLocaleString(),
    text
  });

  localStorage.setItem("enigmaJournalEntries", JSON.stringify(entries));
  textEl.value = "";
  if (msgEl) msgEl.textContent = "Saved ✨";

  renderJournal();
}

function deleteJournalEntry(index){
  const entries = getJournalEntries();
  entries.splice(index, 1);
  localStorage.setItem("enigmaJournalEntries", JSON.stringify(entries));
  renderJournal();
}

function renderJournal(){
  const list = document.getElementById("journalList");
  if (!list) return;

  const entries = getJournalEntries();
  list.innerHTML = "";

  if (entries.length === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.textContent = "No entries yet. Your words are safe here 💜";
    list.appendChild(empty);
    return;
  }

  entries.forEach((e, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div style="font-weight:800; margin-bottom:8px; color:#5a4b7a;">${e.date}</div>
      <div style="white-space:pre-wrap; color:#4a4458;">${escapeHtml(e.text)}</div>
      <div style="height:10px;"></div>
      <button class="primary" style="background:#f4c2c2; color:#5a4b7a;" onclick="deleteJournalEntry(${i})">Delete</button>
    `;
    list.appendChild(card);
  });
}

/* small helper to prevent HTML injection in stored text */
function escapeHtml(str){
  return str.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
