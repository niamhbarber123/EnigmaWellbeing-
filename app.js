// Ensure user exists
if (!localStorage.getItem("enigmaUser")) {
  localStorage.setItem("enigmaUser", "guest");
}

// Daily check-in
function saveCheckin() {
  const mood = document.getElementById("mood").value;
  localStorage.setItem("dailyMood", mood);
  alert("Check-in saved 💜");
}

// Breathe completion
function completeBreathe() {
  localStorage.setItem("breatheDone", "yes");
  alert("Well done 🌬️");
}

// Quote saving
function saveQuote(text) {
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  if (!quotes.includes(text)) quotes.push(text);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  alert("Saved 💜");
}

// Mood-based recommendation
function getRecommendation() {
  const mood = localStorage.getItem("dailyMood") || "";
  if (mood.includes("Good")) return "Celebrate a small win ✨";
  if (mood.includes("Okay")) return "A short breathe could help 🌬️";
  if (mood.includes("Low")) return "Be gentle with yourself 🤍";
  if (mood.includes("Anxious")) return "Grounding or breathing may help 🌿";
  return "Check in with yourself today 💜";
}
