(() => {
  const entryText = document.getElementById("entryText");
  const saveBtn = document.getElementById("saveEntry");
  const viewBtn = document.getElementById("viewEntries");
  const delBtn = document.getElementById("deleteEntries");
  const closeBtn = document.getElementById("closeEntries");

  const wrap = document.getElementById("entriesWrap");
  const list = document.getElementById("entriesList");

  if (!entryText || !saveBtn || !viewBtn || !delBtn || !closeBtn || !wrap || !list) return;

  const KEY = "enigma_journal_entries_v1";

  function esc(s){
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function nowStamp(){
    const d = new Date();
    const dd = String(d.getDate()).padStart(2,"0");
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2,"0");
    const mi = String(d.getMinutes()).padStart(2,"0");
    return `${dd}/${mm}/${yyyy} • ${hh}:${mi}`;
  }

  function load(){
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(arr){
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
  }

  function render(){
    const arr = load().slice().reverse();
    list.innerHTML = "";

    if (!arr.length){
      list.innerHTML = `<div class="gentle-text">No saved entries yet.</div>`;
      return;
    }

    arr.forEach((it, i) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="section-title">${esc(it.date || "Entry")}</div>
        <div class="gentle-text" style="margin-top:10px; white-space:pre-wrap;">${esc(it.text || "")}</div>
        <div class="row" style="margin-top:12px; grid-template-columns: 1fr;">
          <button class="btn danger" type="button" data-del="${i}">Delete this entry</button>
        </div>
      `;
      list.appendChild(card);
    });

    // Wire deletes (index based on reversed list)
    list.querySelectorAll("button[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        const revIndex = Number(btn.getAttribute("data-del"));
        const original = load();
        const realIndex = original.length - 1 - revIndex;
        original.splice(realIndex, 1);
        save(original);
        render();
      });
    });
  }

  function showList(){
    wrap.style.display = "";
    render();
  }
  function hideList(){
    wrap.style.display = "none";
  }

  saveBtn.addEventListener("click", () => {
    const text = (entryText.value || "").trim();
    if (!text) return;

    const arr = load();
    arr.push({ text, date: nowStamp(), ts: Date.now() });
    save(arr);

    entryText.value = "";
    showList();
  });

  viewBtn.addEventListener("click", showList);
  closeBtn.addEventListener("click", hideList);

  delBtn.addEventListener("click", () => {
    save([]);
    render();
  });

  // init
  hideList();
})();
