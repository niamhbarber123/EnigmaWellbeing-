function isoToday() {
  return new Date().toISOString().split("T")[0];
}

/* -----------------------
   Reminders (web-safe)
   shows once/day when app opens
------------------------ */
function enableReminder() {
  localStorage.setItem("enigmaReminderEnabled", "yes");
  alert("Daily reminder enabled 🌿\n(It will appear when you open Enigma each day.)");
}

function reminderCheck() {
  if (localStorage.getItem("enigmaReminderEnabled") !== "yes") return;
  const today = isoToday();
  const lastSeen = localStorage.getItem("enigmaReminderSeen");
  if (lastSeen === today) return;

  alert("🌿 Gentle reminder from Enigma:\nTake a small moment for yourself today.");
  localStorage.setItem("enigmaReminderSeen", today);
}

/* -----------------------
   Check-in + streaks
------------------------ */
function pickMood(btn, mood) {
  window.__enigmaMood = mood;
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function saveCheckin() {
  const mood = window.__enigmaMood || "";
  const note = document.getElementById("checkinNote")?.value || "";
  if (!mood) {
    alert("Please choose how you're feeling 💜");
    return;
  }

  const today = isoToday();
  const lastDate = localStorage.getItem("enigmaLastCheckinDate");
  let streak = parseInt(localStorage.getItem("enigmaStreak") || "0", 10);

  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().split("T")[0];

  if (lastDate !== today) {
    streak = (lastDate === yesterday) ? streak + 1 : 1;
    localStorage.setItem("enigmaStreak", String(streak));
    localStorage.setItem("enigmaLastCheckinDate", today);
  }

  localStorage.setItem("enigmaDailyMood", mood);
  localStorage.setItem("enigmaDailyNote", note);

  const msg = document.getElementById("checkinSavedMsg");
  if (msg) msg.textContent = `Saved 🌿 Streak: ${streak} day(s)`;
}

/* -----------------------
   Recommendations
------------------------ */
function getRecommendation() {
  const mood = localStorage.getItem("enigmaDailyMood") || "";
  if (mood === "calm") return "🧘 Gentle yoga could feel lovely today.";
  if (mood === "okay") return "💬 Read a quote that resonates.";
  if (mood === "low") return "🌬️ Try a slow breathing session.";
  if (mood === "anxious") return "🎨 Tap-to-colour can help ground you.";
  return "🌱 Try a daily check-in to get gentle suggestions.";
}

/* -----------------------
   Breathe text + completion
------------------------ */
function startBreathingText() {
  const el = document.getElementById("breathText");
  if (!el) return;

  function cycle() {
    el.textContent = "Inhale";
    setTimeout(() => (el.textContent = "Hold"), 4000);
    setTimeout(() => (el.textContent = "Exhale"), 6000);
  }
  cycle();
  setInterval(cycle, 10000);
}

function completeBreathe() {
  localStorage.setItem("enigmaBreatheDone", isoToday());
  alert("Well done 🌬️ Take that calm with you.");
}

/* -----------------------
   Quotes favourites
------------------------ */
function getSavedQuotes() {
  return JSON.parse(localStorage.getItem("enigmaSavedQuotes") || "[]");
}

function saveQuote(tile) {
  const text = tile.getAttribute("data-quote");
  const author = tile.getAttribute("data-author");
  const item = `${text} — ${author}`;

  let saved = getSavedQuotes();
  if (!saved.includes(item)) {
    saved.push(item);
    localStorage.setItem("enigmaSavedQuotes", JSON.stringify(saved));
  }
  tile.classList.add("saved");
}

/* -----------------------
   Tap-to-colour game (multi-image + saved per image)
------------------------ */
const ENIGMA_GAME_KEY = "enigmaColourGame";

function getGameData() {
  return JSON.parse(localStorage.getItem(ENIGMA_GAME_KEY) || "{}");
}
function setGameData(data) {
  localStorage.setItem(ENIGMA_GAME_KEY, JSON.stringify(data));
}

function initColourGame() {
  const grid = document.getElementById("grid");
  const imageSelect = document.getElementById("imageSelect");
  const palette = document.getElementById("palette");
  if (!grid || !imageSelect || !palette) return;

  const colours = ["#cbbfff", "#e6d9ff", "#b8e0d2", "#f4c2c2", "#ffffff", "#d6c9ef", "#cfd9d6"];
  let currentColour = colours[0];

  palette.innerHTML = "";
  colours.forEach((c, i) => {
    const sw = document.createElement("div");
    sw.className = "swatch" + (i === 0 ? " active" : "");
    sw.style.background = c;
    sw.addEventListener("click", () => {
      currentColour = c;
      document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
      sw.classList.add("active");
    });
    palette.appendChild(sw);
  });

  function createGrid() {
    grid.innerHTML = "";
    for (let i = 0; i < 64; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.addEventListener("click", () => {
        cell.style.background = currentColour;
        saveCell(i, currentColour);
      });
      grid.appendChild(cell);
    }
  }

  function saveCell(index, colour) {
    const img = imageSelect.value;
    const data = getGameData();
    if (!data[img]) data[img] = {};
    data[img][index] = colour;
    setGameData(data);
  }

  function loadImage() {
    const img = imageSelect.value;
    localStorage.setItem("enigmaLastGameImage", img);

    createGrid();
    const data = getGameData();
    if (data[img]) {
      Object.keys(data[img]).forEach(i => {
        const idx = parseInt(i, 10);
        if (grid.children[idx]) grid.children[idx].style.background = data[img][i];
      });
    }
  }

  const last = localStorage.getItem("enigmaLastGameImage");
  if (last) imageSelect.value = last;

  imageSelect.addEventListener("change", loadImage);
  createGrid();
  loadImage();
}

function saveArt() {
  alert("Saved 💜 You can come back anytime.");
}

/* -----------------------
   Progress population
------------------------ */
function populateProgress() {
  const moodEl = document.getElementById("pMood");
  const streakEl = document.getElementById("pStreak");
  const recEl = document.getElementById("pRec");
  const favEl = document.getElementById("pFavCount");
  const breatheEl = document.getElementById("pBreathe");

  if (moodEl) moodEl.textContent = localStorage.getItem("enigmaDailyMood") || "Not checked in yet";
  if (streakEl) streakEl.textContent = localStorage.getItem("enigmaStreak") || "0";
  if (recEl) recEl.textContent = getRecommendation();
  if (favEl) favEl.textContent = String(getSavedQuotes().length);

  const breatheDone = localStorage.getItem("enigmaBreatheDone");
  if (breatheEl) breatheEl.textContent = (breatheDone === isoToday()) ? "Yes 🌬️" : "Not today yet";
}

/* -----------------------
   Boot
------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  reminderCheck();
  startBreathingText();
  initColourGame();
  populateProgress();

  // mark saved quotes tiles
  const saved = getSavedQuotes();
  document.querySelectorAll(".quote-tile").forEach(tile => {
    const item = `${tile.getAttribute("data-quote")} — ${tile.getAttribute("data-author")}`;
    if (saved.includes(item)) tile.classList.add("saved");
  });

  // render saved quotes list
  const list = document.getElementById("savedQuotesList");
  if (list) {
    const items = getSavedQuotes();
    list.innerHTML = "";
    if (items.length === 0) {
      const div = document.createElement("div");
      div.className = "card";
      div.textContent = "No saved quotes yet 💜";
      list.appendChild(div);
    } else {
      items.forEach(q => {
        const div = document.createElement("div");
        div.className = "card";
        div.textContent = q;
        list.appendChild(div);
      });
    }
  }
});
