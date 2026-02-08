/* ------------------
   Theme toggle
------------------ */
const fab = document.getElementById("themeFab");
if (fab) {
  fab.onclick = () => {
    document.body.classList.toggle("night");
  };
}

/* ------------------
   BOOK DATA
------------------ */
const books = [
  {
    title: "The Dialectical Behavior Therapy Skills Workbook",
    author: "McKay, Wood & Brantley",
    genre: "bpd",
    desc: "DBT tools for emotional regulation."
  },
  {
    title: "I Hate You – Don’t Leave Me",
    author: "Jerold J. Kreisman",
    genre: "bpd",
    desc: "Understanding BPD and relationships."
  },
  {
    title: "DARE",
    author: "Barry McDonagh",
    genre: "anxiety",
    desc: "A modern approach to anxiety."
  },
  {
    title: "Reasons to Stay Alive",
    author: "Matt Haig",
    genre: "depression",
    desc: "Hopeful reflections on depression."
  },
  {
    title: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    genre: "trauma",
    desc: "How trauma impacts the body."
  }
];

/* ------------------
   Render Books
------------------ */
function renderBooks(filter = "all") {
  const list = document.getElementById("bookList");
  if (!list) return;

  list.innerHTML = "";

  books
    .filter(b => filter === "all" || b.genre === filter)
    .forEach(b => {
      const div = document.createElement("div");
      div.className = "book-item";
      div.innerHTML = `
        <div class="book-title">${b.title}</div>
        <div class="book-meta">${b.author}</div>
        <div class="book-desc">${b.desc}</div>
      `;
      list.appendChild(div);
    });
}

/* ------------------
   Genre Filtering
------------------ */
document.addEventListener("click", e => {
  if (!e.target.classList.contains("chip")) return;

  document.querySelectorAll(".chip").forEach(c =>
    c.classList.remove("active")
  );

  e.target.classList.add("active");
  renderBooks(e.target.dataset.genre);
});

/* ------------------
   Init
------------------ */
document.addEventListener("DOMContentLoaded", () => {
  renderBooks();
});
