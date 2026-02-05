/* =========================
   Auth: login/logout + page protection
========================= */
function requireLogin(){
  const isLoginPage = location.pathname.endsWith("login.html");
  if (isLoginPage) return;

  const user = localStorage.getItem("enigmaUser");
  if (!user){
    window.location.href = "/Enigma-/login.html";
  }
}

function loginEnigma(){
  const name = document.getElementById("name")?.value.trim();
  if (!name){
    alert("Please enter your name 💜");
    return;
  }
  localStorage.setItem("enigmaUser", name);
  window.location.href = "/Enigma-/index.html";
}

function logoutEnigma(){
  localStorage.removeItem("enigmaUser");
  window.location.href = "/Enigma-/login.html";
}

/* =========================
   Helpers
========================= */
function isoToday(){ return new Date().toISOString().split("T")[0]; }
function escapeHtml(str){
  return (str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

/* =========================
   Reminders (web-safe)
========================= */
function enableReminder(){
  localStorage.setItem("enigmaReminderEnabled","yes");
  alert("Daily reminder enabled 🌿\n(It will appear when you open Enigma each day.)");
}
function reminderCheck(){
  if (localStorage.getItem("enigmaReminderEnabled") !== "yes") return;
  const today = isoToday();
  const lastSeen = localStorage.getItem("enigmaReminderSeen");
  if (lastSeen === today) return;

  alert("🌿 Gentle reminder from Enigma:\nTake a small moment for yourself today.");
  localStorage.setItem("enigmaReminderSeen", today);
}

/* =========================
   Check-in + streaks
========================= */
function pickMood(btn, mood){
  window.__enigmaMood = mood;
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function saveCheckin(){
  const mood = window.__enigmaMood || "";
  const note = document.getElementById("checkinNote")?.value || "";
  if (!mood){ alert("Please choose how you're feeling 💜"); return; }

  const today = isoToday();
  const lastDate = localStorage.getItem("enigmaLastCheckinDate");
  let streak = parseInt(localStorage.getItem("enigmaStreak") || "0", 10);

  const y = new Date(); y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().split("T")[0];

  if (lastDate !== today){
    streak = (lastDate === yesterday) ? streak + 1 : 1;
    localStorage.setItem("enigmaStreak", String(streak));
    localStorage.setItem("enigmaLastCheckinDate", today);
  }

  localStorage.setItem("enigmaDailyMood", mood);
  localStorage.setItem("enigmaDailyNote", note);

  const msg = document.getElementById("checkinSavedMsg");
  if (msg) msg.textContent = `Saved 🌿 Streak: ${streak} day(s)`;
}

function getRecommendation(){
  const mood = localStorage.getItem("enigmaDailyMood") || "";
  if (mood === "calm") return "🧘 Gentle yoga or a short walk could feel lovely today.";
  if (mood === "okay") return "💬 Read a quote that resonates.";
  if (mood === "low") return "🌬️ Try a slow breathing session.";
  if (mood === "anxious") return "🎨 Tap-to-colour can help ground you.";
  return "🌱 Try a daily check-in to get gentle suggestions.";
}

/* =========================
   Breathe – SYNC text to circle animation
   Cycle is 10s:
     0-4   Inhale (circle expands)
     4-6   Hold  (stays big)
     6-10  Exhale (shrinks)
========================= */
let __breathTimers = [];

function clearBreathTimers(){
  __breathTimers.forEach(t => clearTimeout(t));
  __breathTimers = [];
}

function setBreathText(text){
  const el = document.getElementById("breathText");
  if (el) el.textContent = text;
}

function startBreathingSynced(){
  const circle = document.querySelector(".breathe-circle");
  const textEl = document.getElementById("breathText");
  if (!circle || !textEl) return;

  function scheduleCycle(){
    clearBreathTimers();
    setBreathText("Inhale");
    __breathTimers.push(setTimeout(() => setBreathText("Hold"), 4000));
    __breathTimers.push(setTimeout(() => setBreathText("Exhale"), 6000));
  }

  // Start immediately
  scheduleCycle();

  // Re-sync on every animation loop (perfect alignment)
  circle.addEventListener("animationiteration", scheduleCycle);

  // Also handle if user switches tabs and comes back
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleCycle();
  });
}

function completeBreathe(){
  localStorage.setItem("enigmaBreatheDone", isoToday());
  alert("Well done 🌬️ Take that calm with you.");
}

/* =========================
   Quotes: toggle save/unsave + delete saved
========================= */
function getSavedQuotes(){
  return JSON.parse(localStorage.getItem("enigmaSavedQuotes") || "[]");
}
function setSavedQuotes(arr){
  localStorage.setItem("enigmaSavedQuotes", JSON.stringify(arr));
}

function toggleQuote(tile){
  const text = tile.getAttribute("data-quote");
  const author = tile.getAttribute("data-author");
  const item = `${text} — ${author}`;

  let saved = getSavedQuotes();
  if (saved.includes(item)){
    saved = saved.filter(x => x !== item);
    setSavedQuotes(saved);
    tile.classList.remove("saved");
  } else {
    saved.push(item);
    setSavedQuotes(saved);
    tile.classList.add("saved");
  }
}

function deleteSavedQuote(item){
  let saved = getSavedQuotes();
  saved = saved.filter(x => x !== item);
  setSavedQuotes(saved);
  renderSavedQuotes();
}

function clearAllSavedQuotes(){
  if (!confirm("Clear all saved quotes?")) return;
  setSavedQuotes([]);
  renderSavedQuotes();
}

function renderSavedQuotes(){
  const list = document.getElementById("savedQuotesList");
  if (!list) return;

  const items = getSavedQuotes();
  list.innerHTML = "";

  if (items.length === 0){
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = "No saved quotes yet 💜";
    list.appendChild(div);
    return;
  }

  const top = document.createElement("div");
  top.className = "card";
  top.innerHTML = `
    <div style="font-weight:900; color:#5a4b7a;">Saved quotes</div>
    <div style="height:10px;"></div>
    <button class="primary" style="background:#f4c2c2; color:#5a4b7a;" onclick="clearAllSavedQuotes()">Clear all</button>
  `;
  list.appendChild(top);

  items.forEach(q => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div style="white-space:pre-wrap;">${escapeHtml(q)}</div>
      <div style="height:10px;"></div>
      <button class="primary" style="background:#ffeaa6; color:#5a4b7a;" onclick='deleteSavedQuote(${JSON.stringify(q)})'>Delete</button>
    `;
    list.appendChild(div);
  });
}

/* =========================
   Journal (saved entries)
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
  entries.unshift({ date: new Date().toLocaleString(), text });

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
      <div style="font-weight:900; margin-bottom:8px; color:#5a4b7a;">${escapeHtml(e.date)}</div>
      <div style="white-space:pre-wrap;">${escapeHtml(e.text)}</div>
      <div style="height:10px;"></div>
      <button class="primary" style="background:#f4c2c2; color:#5a4b7a;" onclick="deleteJournalEntry(${i})">Delete</button>
    `;
    list.appendChild(card);
  });
}

/* =========================
   Progress page population
========================= */
function populateProgress(){
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

/* =========================
   Tap-to-Colour V3 boot
   (Your V3 game code stays as you already pasted it)
========================= */
if (typeof initColourGame !== "function") {
  // if game code isn't present on some pages, it's fine
}

/* =========================
   Boot
========================= */
document.addEventListener("DOMContentLoaded", () => {
  requireLogin();
  reminderCheck();
  populateProgress();
  renderJournal();
  renderSavedQuotes();

  // Quotes: mark saved tiles
  const saved = getSavedQuotes();
  document.querySelectorAll(".quote-tile").forEach(tile => {
    const item = `${tile.getAttribute("data-quote")} — ${tile.getAttribute("data-author")}`;
    if (saved.includes(item)) tile.classList.add("saved");
  });

  // Breathe: sync text to animation when on breathe page
  startBreathingSynced();

  // Colour game init (only works on game page where IDs exist)
  try { initColourGame(); } catch(e) {}
});
