/* =========================
   USER SETUP
========================= */
if (!localStorage.getItem("enigmaUser")) {
  localStorage.setItem("enigmaUser", "guest");
}

/* =========================
   DATE HELPERS
========================= */
function today() {
  return new Date().toISOString().split("T")[0];
}

/* =========================
   CHECK-IN + STREAKS
========================= */
function saveCheckin() {
  const mood = document.getElementById("mood").value;
  const lastDate = localStorage.getItem("lastCheckinDate");
  const currentDate = today();

  let streak = parseInt(localStorage.getItem("streak")) || 0;

  if (lastDate !== currentDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yString = yesterday.toISOString().split("T")[0];

    if (lastDate === yString) {
      streak += 1;
    } else {
      streak = 1;
    }

    localStorage.setItem("streak", streak);
    localStorage.setItem("lastCheckinDate", currentDate);
  }

  localStorage.setItem("dailyMood", mood);
  alert(`Check-in saved 💜\nCurrent streak: ${localStorage.getItem("streak")} days`);
}

/* =========================
   BREATHE
========================= */
function completeBreathe() {
  localStorage.setItem("breatheDone", today());
  alert("Well done for breathing 🌬️");
}

/* =========================
   QUOTES
========================= */
function saveQuote(text) {
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  if (!quotes.includes(text)) {
    quotes.push(text);
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }
  alert("Quote saved 💜");
}

/* =========================
   MOOD RECOMMENDATIONS
========================= */
function getRecommendation() {
  const mood = localStorage.getItem("dailyMood") || "";
  if (mood.includes("Good")) return "Celebrate a small win ✨";
  if (mood.includes("Okay")) return "A short breathing exercise could help 🌬️";
  if (mood.includes("Low")) return "Be gentle with yourself today 🤍";
  if (mood.includes("Anxious")) return "Try grounding or breathing 🌿";
  return "Check in with yourself today 💜";
}

/* =========================
   REMINDERS
========================= */
function enableReminder() {
  localStorage.setItem("reminderEnabled", "yes");
  alert("Daily reminder enabled 💜\n(Check once a day)");
}

function reminderMessage() {
  if (localStorage.getItem("reminderEnabled") === "yes") {
    const lastSeen = localStorage.getItem("lastReminderSeen");
    if (lastSeen !== today()) {
      alert("🌿 Gentle reminder from Enigma:\nTake a moment for yourself today.");
      localStorage.setItem("lastReminderSeen", today());
    }
  }
}
