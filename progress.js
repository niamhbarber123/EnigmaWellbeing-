(() => {
  const todayEl = document.getElementById("todayStats");
  const totalEl = document.getElementById("totalStats");
  if (!todayEl || !totalEl) return;

  // Keys used across the app
  const BREATHE_DONE_KEY = "enigma_breathe_completed_v1";
  const MUSIC_MIN_KEY = "enigma_music_minutes_v1";
  const JOURNAL_KEY = "enigma_journal_entries_v1";
  const MOOD_KEY = "enigma_mood_entries_v1";
  const SAVED_QUOTES_KEY = "enigma_saved_quotes_v2";

  function todayKey(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function safeNum(v){
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function loadJSON(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function statRow(title, value){
    const div = document.createElement("div");
    div.className = "link-btn";
    div.style.cursor = "default";
    div.innerHTML = `
      <div>
        <div class="link-title">${title}</div>
        <div class="link-sub">${value}</div>
      </div>
      <div class="link-arrow">•</div>
    `;
    return div;
  }

  // Music minutes store format: { total: n, byDay: { "YYYY-MM-DD": n } }
  const music = loadJSON(MUSIC_MIN_KEY, { total: 0, byDay: {} });
  const tk = todayKey();

  const breatheTotal = safeNum(localStorage.getItem(BREATHE_DONE_KEY) || 0);
  const musicToday = safeNum((music.byDay || {})[tk] || 0);
  const musicTotal = safeNum(music.total || 0);

  const journal = loadJSON(JOURNAL_KEY, []);
  const mood = loadJSON(MOOD_KEY, []);
  const savedQuotes = loadJSON(SAVED_QUOTES_KEY, []);

  // Today (simple)
  todayEl.innerHTML = "";
  todayEl.appendChild(statRow("Music minutes", `${musicToday} min today`));
  todayEl.appendChild(statRow("Mood entries", `${mood.filter(x => (x || {}).date).length ? "Logged" : "—"}`));

  // Totals
  totalEl.innerHTML = "";
  totalEl.appendChild(statRow("Breathe sessions", `${breatheTotal} completed`));
  totalEl.appendChild(statRow("Music minutes", `${musicTotal} min total`));
  totalEl.appendChild(statRow("Journal entries", `${journal.length} saved`));
  totalEl.appendChild(statRow("Mood entries", `${mood.length} saved`));
  totalEl.appendChild(statRow("Saved quotes", `${savedQuotes.length} saved`));
})();
