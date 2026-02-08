(function () {
  const $ = (id) => document.getElementById(id);

  // ---------- NAV ----------
  window.enigmaHome = () => location.href = "index.html";

  // ---------- THEME ----------
  function applyTheme() {
    const night = localStorage.getItem("theme") === "night";
    document.body.classList.toggle("night", night);
    const btn = $("themeFab");
    if (btn) btn.textContent = night ? "☀️" : "🌙";
  }

  function toggleTheme() {
    const night = !document.body.classList.contains("night");
    localStorage.setItem("theme", night ? "night" : "light");
    applyTheme();
  }

  // ---------- WORD OF THE DAY ----------
  const WORDS = [
    { w: "Calm", d: "A steady quiet inside." },
    { w: "Safety", d: "You are allowed to feel safe now." },
    { w: "Patience", d: "Nothing is required all at once." },
    { w: "Grounded", d: "Here. Now. Supported." },
    { w: "Gentle", d: "Soft does not mean weak." },
    { w: "Balance", d: "Rest and effort can coexist." }
  ];

  function todayIndex() {
    return new Date().getDate() % WORDS.length;
  }

  function initWOTD() {
    const word = WORDS[todayIndex()];
    if ($("wotdWord")) $("wotdWord").textContent = word.w;
    if ($("wotdWordBig")) $("wotdWordBig").textContent = word.w;
    if ($("wotdDescBig")) $("wotdDescBig").textContent = word.d;
  }

  // ---------- DISTRACTION ----------
  const QUESTIONS = [
    "Name 5 things you can see.",
    "Name 4 things you can feel.",
    "Name 3 things you can hear."
  ];

  function initDistraction() {
    const q = $("distractionQuestion");
    const start = $("distractionStartBtn");
    const next = $("distractionNextBtn");
    if (!q || !start || !next) return;

    let i = 0;

    start.onclick = () => {
      q.textContent = QUESTIONS[0];
      start.style.display = "none";
      next.style.display = "block";
    };

    next.onclick = () => {
      i++;
      if (i >= QUESTIONS.length) {
        q.textContent = "Take one slow breath.";
        next.style.display = "none";
      } else {
        q.textContent = QUESTIONS[i];
      }
    };
  }

  // ---------- BOOT ----------
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    $("themeFab")?.addEventListener("click", toggleTheme);
    initWOTD();
    initDistraction();
  });
})();
