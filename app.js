(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* THEME */
  function applyTheme() {
    const t = localStorage.getItem("theme") || "light";
    document.body.classList.toggle("night", t === "night");
    const btn = $("themeToggle");
    if (btn) btn.textContent = t === "night" ? "☀️" : "🌙";
  }

  function toggleTheme() {
    const night = !document.body.classList.contains("night");
    document.body.classList.toggle("night", night);
    localStorage.setItem("theme", night ? "night" : "light");
    applyTheme();
  }

  /* WORD OF THE DAY (shared data) */
  const WORDS = [
    { w:"Compassion", d:"Meeting yourself with kindness instead of judgement." },
    { w:"Balance", d:"Making space for rest, effort, and recovery." },
    { w:"Patience", d:"Letting growth take the time it takes." },
    { w:"Courage", d:"Choosing what matters even when it’s hard." },
    { w:"Serenity", d:"A quiet steadiness inside." },
    { w:"Acceptance", d:"Allowing reality so you can respond wisely." }
  ];

  function todayWord() {
    const day = new Date().toISOString().slice(0,10);
    let sum = 0;
    for (let c of day) sum += c.charCodeAt(0);
    return WORDS[sum % WORDS.length];
  }

  function initWordPage() {
    const w = $("wotdWordBig");
    const d = $("wotdDescBig");
    if (!w || !d) return;
    const t = todayWord();
    w.textContent = t.w;
    d.textContent = t.d;
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    const btn = $("themeToggle");
    if (btn) btn.addEventListener("click", toggleTheme);
    initWordPage();
  });
})();
