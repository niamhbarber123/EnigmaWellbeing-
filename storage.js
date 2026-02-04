<script>
/* USER */
function saveUser(name, email) {
  localStorage.setItem("enigmaUser", JSON.stringify({ name, email }));
}

function getUser() {
  return JSON.parse(localStorage.getItem("enigmaUser"));
}

/* JOURNAL */
function saveJournal(text) {
  let entries = JSON.parse(localStorage.getItem("journal")) || [];
  entries.push({ text, date: new Date().toISOString() });
  localStorage.setItem("journal", JSON.stringify(entries));
}

/* WINS */
function saveWin(text) {
  let wins = JSON.parse(localStorage.getItem("wins")) || [];
  wins.push(text);
  localStorage.setItem("wins", JSON.stringify(wins));
}

function loadWins() {
  return JSON.parse(localStorage.getItem("wins")) || [];
}
</script>
