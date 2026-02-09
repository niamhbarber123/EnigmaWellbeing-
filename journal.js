(() => {
  const KEY = "enigma_journal_entries_v2";

  const textEl = document.getElementById("entryText");
  const saveBtn = document.getElementById("saveEntry");
  const viewBtn = document.getElementById("viewEntries");
  const delBtn  = document.getElementById("deleteEntries");

  const wrap = document.getElementById("entriesWrap");
  const list = document.getElementById("entriesList");

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function saveAll(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  function fmt(iso) {
    const dt = new Date(iso);
    return dt.toLocaleString(undefined, {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  function render() {
    const items = loadAll();
    if (!items.length) {
      wrap.style.display = "none";
      list.innerHTML = "";
      return;
    }

    wrap.style.display = "block";
    list.innerHTML = "";

    items.slice().reverse().forEach(item => {
      const tile = document.createElement("div");
      tile.className = "card";
      tile.style.margin = "0";
      tile.style.padding = "14px 16px";

      tile.innerHTML = `
        <div style="font-weight:900;font-size:14px;color:var(--muted);">${fmt(item.createdAt)}</div>
        <div style="margin-top:10px;font-weight:750;font-size:16px;line-height:1.5;color:var(--ink);">
          ${escapeHtml(item.text)}
        </div>
      `;

      list.appendChild(tile);
    });
  }

  saveBtn.addEventListener("click", () => {
    const text = (textEl.value || "").trim();
    if (!text) return;

    const items = loadAll();
    items.push({ text, createdAt: new Date().toISOString() });
    saveAll(items);

    textEl.value = "";
    render();
  });

  viewBtn.addEventListener("click", () => {
    render();
    if (wrap.style.display !== "none") {
      wrap.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  delBtn.addEventListener("click", () => {
    localStorage.removeItem(KEY);
    render();
  });

  render();
})();
