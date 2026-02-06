/* =========================================================
   Enigma Wellbeing • app.js (HOME FIX)
   - Theme toggle
   - Back navigation
   - Word of the Day (daily deterministic pick + description + modal)
   - Distraction (typed answers required for Next; skip allowed; progress = answered only)
========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // ---------- Back ----------
  window.enigmaBack = function () {
    if (history.length > 1) history.back();
    else location.href = "index.html";
  };

  // ---------- Date key ----------
  function todayKey() {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  }

  // ---------- Deterministic RNG ----------
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFromToday() {
    const s = todayKey().replaceAll("-", "");
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 20260101;
  }

  /* =========================
     THEME
  ========================= */
  function applyTheme() {
    const t = localStorage.getItem("enigmaTheme") || "light";
    document.body.classList.toggle("night", t === "night");
  }

  function toggleTheme() {
    const night = document.body.classList.toggle("night");
    localStorage.setItem("enigmaTheme", night ? "night" : "light");
  }

  function initTheme() {
    const btn = $("themeFab");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  /* =========================
     WORD OF THE DAY
  ========================= */
  const WOTD = [
    { w: "Forgiveness", d: "Releasing resentment so you can move forward lighter." },
    { w: "Honesty", d: "Choosing truth with kindness—to yourself and others." },
    { w: "Trust", d: "Allowing confidence in yourself, others, or the process." },
    { w: "Responsibility", d: "Owning your choices and responding with intention." },
    { w: "Flexibility", d: "Adapting without losing your centre." },
    { w: "Boldness", d: "Taking brave steps even when you feel unsure." },
    { w: "Discretion", d: "Using good judgement about what to share and when." },
    { w: "Discipline", d: "Doing what helps you—even when motivation fades." },
    { w: "Detail", d: "Noticing the small things that improve the whole." },
    { w: "Prosperity", d: "Growing resources and wellbeing in a healthy way." },
    { w: "Acceptance", d: "Letting reality be what it is—so you can respond wisely." },
    { w: "Surrender", d: "Loosening the grip on what you can’t control." },
    { w: "Sincerity", d: "Being genuine—your real self is enough." },
    { w: "Serenity", d: "A quiet steadiness, even when life is loud." },
    { w: "Humility", d: "Staying grounded and open to learning." },
    { w: "Sensitivity", d: "Noticing feelings and needs—yours and others’." },
    { w: "Compassion", d: "Meeting struggle with warmth instead of judgement." },
    { w: "Leadership", d: "Guiding with care, clarity, and example." },
    { w: "Integrity", d: "Aligning actions with values—even in small moments." },
    { w: "Action", d: "One doable step—progress over perfection." },
    { w: "Courage", d: "Feeling fear and still choosing what matters." },
    { w: "Creativity", d: "Letting new ideas and possibilities appear." },
    { w: "Gentleness", d: "Soft strength—especially with yourself." },
    { w: "Clarity", d: "Seeing what matters most, without the noise." },
    { w: "Balance", d: "Making space for rest, effort, joy, and recovery." },
    { w: "Fun", d: "Allowing lightness—your nervous system needs it." },
    { w: "Commitment", d: "Staying with what you choose, one day at a time." },
    { w: "Patience", d: "Letting growth take the time it takes." },
    { w: "Freedom", d: "Creating room to breathe, choose, and be yourself." },
    { w: "Reflection", d: "Looking back kindly to learn and reset." },
    { w: "Giving", d: "Offering support without emptying yourself." },
    { w: "Enthusiasm", d: "Inviting energy and interest into the day." },
    { w: "Joy", d: "Noticing what feels bright—even briefly." },
    { w: "Satisfaction", d: "Letting ‘enough’ be enough." },
    { w: "Grace", d: "Moving with softness through imperfect moments." },
    { w: "Simplicity", d: "Reducing the load—one less thing at a time." },
    { w: "Communication", d: "Sharing clearly, listening carefully." },
    { w: "Appropriateness", d: "Matching your response to the moment wisely." },
    { w: "Strength", d: "Endurance, boundaries, and quiet resilience." },
    { w: "Love", d: "Choosing care—for yourself and others." },
    { w: "Tenderness", d: "Being gentle with what’s sensitive." },
    { w: "Perseverance", d: "Keeping going, especially on the slow days." },
    { w: "Reliability", d: "Being steady and consistent—small promises kept." },
    { w: "Initiative", d: "Starting before you feel ready." },
    { w: "Confidence", d: "Trusting your ability to figure things out." },
    { w: "Authenticity", d: "Being real—no performance required." },
    { w: "Harmony", d: "Finding calm alignment within and around you." },
    { w: "Pleasure", d: "Letting good moments count." },
    { w: "Risk", d: "Trying something new, gently and safely." },
    { w: "Efficiency", d: "Using energy wisely—not doing everything." },
    { w: "Spontaneity", d: "Letting life surprise you in kind ways." },
    { w: "Fulfilment", d: "A sense of meaning—built over time." }
  ];

  function pickWotd() {
    const seed = seedFromToday();
    const rand = mulberry32(seed);
    const i = Math.floor(rand() * WOTD.length);
    return WOTD[i] || { w: "Serenity", d: "A quiet steadiness, even when life is loud." };
  }

  function showWotdModal(word, desc) {
    const modal = $("wotdModal");
    const backdrop = $("wotdBackdrop");
    const closeBtn = $("wotdCloseBtn");

    const mw = $("wotdModalWord");
    const md = $("wotdModalDesc");

    if (!modal || !mw || !md) return;

    mw.textContent = word;
    md.textContent = desc;

    modal.style.display = "block";
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    const close = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      modal.style.display = "none";
    };

    backdrop && backdrop.addEventListener("click", close, { once: true });
    closeBtn && closeBtn.addEventListener("click", close, { once: true });

    // ESC closes
    window.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") {
        close();
        window.removeEventListener("keydown", esc);
      }
    });
  }

  function initWotd() {
    const wEl = $("wotdWord");
    const dEl = $("wotdDesc");
    const infoBtn = $("wotdInfoBtn");
    const tile = $("wotdTile");

    if (!wEl || !dEl || !tile) return;

    const { w, d } = pickWotd();

    // Title bold is handled by CSS; word/desc intentionally normal
    wEl.textContent = w;
    dEl.textContent = d;

    // open modal when tile clicked
    tile.addEventListener("click", (e) => {
      // prevent if clicking the ? button (it has its own handler)
      if (e.target && e.target.id === "wotdInfoBtn") return;
      e.preventDefault();
      showWotdModal(w, d);
    });

    // open modal when ? clicked
    if (infoBtn) {
      infoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showWotdModal(w, d);
      });
    }
  }

  /* =========================
     DISTRACTION (typed answers required for Next)
  ========================= */
  const DISTRACTION_QUESTIONS = [
    "Name 5 things you can see right now.",
    "Name 4 things you can feel (touch/texture).",
    "Name 3 things you can hear.",
    "Name 2 things you can smell.",
    "Name 1 thing you can taste (or would like to taste).",
    "If you could teleport anywhere for 10 minutes, where would you go?",
    "What colour feels calming to you today?",
    "What’s a tiny ‘safe’ plan for the next 10 minutes?",
    "What’s one kind thing you’d say to a friend feeling this way?",
    "What’s your favourite cosy drink?",
    "If today had a soundtrack, what would it be called?",
    "If you could design a calm room, what 3 items are in it?",
    "What’s a small win you’ve had this week?",
    "What’s something you’re looking forward to (even small)?",
    "What would your ‘calm alter ego’ do next?",
    "What’s the softest thing you own?",
    "Name 3 colours you can spot around you.",
    "What’s one gentle stretch you can do right now?",
    "What is a ‘good enough’ goal for today?",
    "What’s one small thing you can do to be kind to yourself right now?"
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function initDistraction() {
    const card = $("distractionCard");
    if (!card) return;

    const qEl = $("distractionQuestion");
    const answeredEl = $("distractionAnsweredCount");

    const inputWrap = $("distractionInputWrap");
    const input = $("distractionInput");

    const startBtn = $("distractionStartBtn");
    const nextBtn = $("distractionNextBtn");
    const skipBtn = $("distractionSkipBtn");
    const endBtn = $("distractionEndBtn");

    if (!qEl || !answeredEl || !startBtn || !nextBtn || !skipBtn || !endBtn || !inputWrap || !input) return;

    const KEY = "enigmaDistractionSessionV2";

    function setRunning(running) {
      startBtn.style.display = running ? "none" : "";
      nextBtn.style.display = running ? "" : "none";
      skipBtn.style.display = running ? "" : "none";
      endBtn.style.display = running ? "" : "none";
      inputWrap.style.display = running ? "" : "none";
      if (!running) input.value = "";
    }

    function load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || s.day !== todayKey()) return null;
        if (!Array.isArray(s.order) || typeof s.i !== "number" || typeof s.answered !== "number") return null;
        return s;
      } catch {
        return null;
      }
    }

    function save(s) {
      localStorage.setItem(KEY, JSON.stringify(s));
    }

    function clear() {
      localStorage.removeItem(KEY);
    }

    function currentQ(s) {
      const idx = s.order[s.i];
      return DISTRACTION_QUESTIONS[idx] || "Take one slow breath in… and out.";
    }

    function render(s) {
      qEl.textContent = currentQ(s);
      answeredEl.textContent = String(s.answered);
      input.value = "";
      setRunning(true);
    }

    function startNew() {
      const order = shuffle([...Array(DISTRACTION_QUESTIONS.length).keys()]);
      const s = { day: todayKey(), order, i: 0, answered: 0 };
      save(s);
      render(s);
    }

    function advance(s) {
      if (s.i >= s.order.length - 1) {
        // end session automatically when questions run out
        qEl.textContent = "You’re done. Take a slow breath.";
        setRunning(false);
        clear();
        return;
      }
      s.i += 1;
      save(s);
      render(s);
    }

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startNew();
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = load() || (startNew(), load());
      if (!s) return;

      const text = (input.value || "").trim();
      if (!text) {
        input.focus();
        // tiny nudge without alerts
        qEl.textContent = "Type any answer (even one word) — or tap Skip.";
        setTimeout(() => {
          const s2 = load();
          if (s2) qEl.textContent = currentQ(s2);
        }, 900);
        return;
      }

      s.answered += 1;
      save(s);
      advance(s);
    });

    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const s = load() || (startNew(), load());
      if (!s) return;
      advance(s);
    });

    endBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clear();
      setRunning(false);
      qEl.textContent = "Ended. You can start again any time.";
    });

    // Resume today if active
    const existing = load();
    if (existing) {
      render(existing);
    } else {
      setRunning(false);
      qEl.textContent = "Tap Start to begin.";
      answeredEl.textContent = "0";
    }
  }

/* =========================
   BOOT (safe)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  try { applyTheme(); } catch(e) {}
  try { initTheme(); } catch(e) {}
  try { initBreathe(); } catch(e) {}
  try { initQuotes(); } catch(e) {}
  try { initMusic(); } catch(e) {}
  try { initYoga(); } catch(e) {}
  try { initDistraction(); } catch(e) {}
});

})();
