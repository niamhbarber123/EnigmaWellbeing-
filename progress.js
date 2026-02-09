(() => {
  /* =========================
     PROGRESS — Enigma Wellbeing (FULL)
     Works with:
       - Breathe: enigma_breathe_minutes_v1  { total, byDay: { "YYYY-MM-DD": minutes } }
       - Music:  enigma_music_minutes_v1    { total, byDay: { "YYYY-MM-DD": minutes } }
       - Quotes: enigma_saved_quotes_v1     [ ... ]
     ========================= */

  const breatheTodayEl = document.getElementById("breatheToday");
  const breatheTotalEl = document.getElementById("breatheTotal");
  const musicTodayEl   = document.getElementById("musicToday");
  const musicTotalEl   = document.getElementById("musicTotal");
  const savedQuotesEl  = document.getElementById("savedQuotes");

  const BREATHE_KEY = "enigma_breathe_minutes_v1";
  const MUSIC_KEY   = "enigma_music_minutes_v1";
  const QUOTES_KEY  = "enigma_saved_quotes_v1";

  function todayKey() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function readJSON(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }

  function normaliseMinutesStore(raw) {
    // Expect { total:number, byDay: { [date]: number } }
    // If missing/invalid, return empty structure.
    if (!raw || typeof raw !== "object") return { total: 0, byDay: {} };

    const byDay =
      raw.byDay && typeof raw.byDay === "object" && !Array.isArray(raw.byDay)
        ? raw.byDay
        : {};

    const totalFromByDay = Object.values(byDay).reduce((s, n) => s + Number(n || 0), 0);
    const total = Number(raw.total || 0) || totalFromByDay;

    return { total, byDay };
  }

  function setText(el, value) {
    if (!el) return;
    el.textContent = String(value);
  }

  // ----- BREATHE -----
  const breatheRaw = readJSON(BREATHE_KEY, null);
  const breatheStore = normaliseMinutesStore(breatheRaw);
  const tk = todayKey();

  const breatheToday = Number(breatheStore.byDay[tk] || 0);
  const breatheTotal = Number(breatheStore.total || 0);

  setText(breatheTodayEl, breatheToday);
  setText(breatheTotalEl, breatheTotal);

  // ----- MUSIC -----
  const musicRaw = readJSON(MUSIC_KEY, null);
  const musicStore = normaliseMinutesStore(musicRaw);

  const musicToday = Number(musicStore.byDay[tk] || 0);
  const musicTotal = Number(musicStore.total || 0);

  setText(musicTodayEl, musicToday);
  setText(musicTotalEl, musicTotal);

  // ----- SAVED QUOTES -----
  const savedQuotes = readJSON(QUOTES_KEY, []);
  const quotesCount = Array.isArray(savedQuotes) ? savedQuotes.length : 0;

  setText(savedQuotesEl, quotesCount);
})();
