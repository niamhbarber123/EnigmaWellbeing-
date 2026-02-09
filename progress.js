(() => {
  /* =========================
     Progress — Enigma Wellbeing
     ========================= */

  // Element refs (safe if missing)
  const breatheTodayEl = document.getElementById("breatheToday");
  const breatheTotalEl = document.getElementById("breatheTotal");
  const musicTodayEl   = document.getElementById("musicToday");
  const musicTotalEl   = document.getElementById("musicTotal");
  const savedQuotesEl  = document.getElementById("savedQuotes");

  // Keys used elsewhere in the app
  const BREATHE_KEY = "enigma_breathe_minutes";
  const MUSIC_KEY   = "enigma_music_minutes";
  const QUOTES_KEY  = "enigma_saved_quotes_v1";

  // Helper: today key
  function todayKey(){
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function readMinutes(key){
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch {
      return {};
    }
  }

  function readArray(key){
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  /* =========================
     Breathe minutes
     ========================= */

  const breatheData = readMinutes(BREATHE_KEY);
  const today = todayKey();

  const breatheToday = Number(breatheData[today] || 0);
  const breatheTotal = Object.values(breatheData)
    .reduce((sum, v) => sum + Number(v || 0), 0);

  if (breatheTodayEl) breatheTodayEl.textContent = breatheToday;
  if (breatheTotalEl) breatheTotalEl.textContent = breatheTotal;

  /* =========================
     Music minutes
     ========================= */

  const musicData = readMinutes(MUSIC_KEY);

  const musicToday = Number(musicData[today] || 0);
  const musicTotal = Object.values(musicData)
    .reduce((sum, v) => sum + Number(v || 0), 0);

  if (musicTodayEl) musicTodayEl.textContent = musicToday;
  if (musicTotalEl) musicTotalEl.textContent = musicTotal;

  /* =========================
     Saved quotes
     ========================= */

  const savedQuotes = readArray(QUOTES_KEY);
  if (savedQuotesEl) savedQuotesEl.textContent = savedQuotes.length;
})();
