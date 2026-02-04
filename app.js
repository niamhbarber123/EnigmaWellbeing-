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
    const y = yesterday.toISOString().split("T")[0];

    streak = (lastDate === y) ? streak + 1 : 1;
    localStorage.setItem("streak", streak);
    localStorage.setItem("lastCheckinDate", currentDate);
  }

  localStorage.setItem("dailyMood", mood);
  alert(`Check-in saved 💜\nStreak: ${streak} days`);
}

/* =========================
   RECOMMENDATIONS
========================= */
function getRecommendation() {
  const mood = localStorage.getItem("dailyMood") || "";
  if (mood.includes("Good")) return "✨ Keep the positive momentum today.";
  if (mood.includes("Okay")) return "🌿 Try a short breathing exercise.";
  if (mood.includes("Low")) return "🤍 Be kind to yourself today.";
  if (mood.includes("Anxious")) return "🌬️ Slow breathing may help.";
  return "💜 Check in with yourself.";
}

/* =========================
   REMINDERS
========================= */
function enableReminder() {
  localStorage.setItem("reminder", "on");
  alert("Daily reminder enabled 🌿");
}

function reminderCheck() {
  if (localStorage.getItem("reminder") === "on") {
    if (localStorage.getItem("reminded") !== today()) {
      alert("🌸 Enigma reminder:\nTake a moment for yourself today.");
      localStorage.setItem("reminded", today());
    }
  }
}

/* =========================
   BREATHE
========================= */
function completeBreathe() {
  alert("Well done 🌬️");
}

/* =========================
   QUOTES
========================= */
function saveQuote(text) {
  let saved = JSON.parse(localStorage.getItem("savedQuotes")) || [];
  if (!saved.includes(text)) {
    saved.push(text);
    localStorage.setItem("savedQuotes", JSON.stringify(saved));
    alert("Quote saved 💜");
  }
}
