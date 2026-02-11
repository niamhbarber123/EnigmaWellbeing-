const booksList = document.getElementById("booksList");
const tabs = document.querySelectorAll(".tab");

// Demo data (replace with yours)
const BOOKS = [
  {
    title: "DARE",
    author: "Barry McDonagh",
    topic: "Anxiety",
    desc: "Practical method for panic and anxious spirals.",
    url: "https://www.goodreads.com/search?q=DARE%20Barry%20McDonagh",
    tag: "ptsd"
  },
  {
    title: "Hope and Help for Your Nerves",
    author: "Dr Claire Weekes",
    topic: "Anxiety",
    desc: "Classic reassurance + steps for fear/adrenaline cycles.",
    url: "https://www.goodreads.com/search?q=Hope%20and%20Help%20for%20Your%20Nerves%20Claire%20Weekes",
    tag: "stress"
  },
  {
    title: "The Anxiety and Phobia Workbook",
    author: "Edmund J. Bourne",
    topic: "Anxiety",
    desc: "Exercises and worksheets you can use day-to-day.",
    url: "https://www.goodreads.com/search?q=The%20Anxiety%20and%20Phobia%20Workbook%20Edmund%20Bourne",
    tag: "stress"
  },
  {
    title: "Burnout",
    author: "Emily & Amelia Nagoski",
    topic: "Stress",
    desc: "How stress gets stuck and how to complete the stress cycle.",
    url: "https://www.goodreads.com/search?q=Burnout%20Nagoski",
    tag: "wellbeing"
  }
];

// Favourite storage
const FAV_KEY = "enigma_fav_books";

function getFavs(){
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}
function setFavs(arr){
  localStorage.setItem(FAV_KEY, JSON.stringify(arr));
}
function isFav(book){
  const favs = getFavs();
  return favs.some(b => b.title === book.title && b.author === book.author);
}
function toggleFav(book){
  const favs = getFavs();
  const exists = favs.some(b => b.title === book.title && b.author === book.author);
  const next = exists
    ? favs.filter(b => !(b.title === book.title && b.author === book.author))
    : [...favs, { title: book.title, author: book.author }];
  setFavs(next);
}

function renderBooks(filter = null){
  booksList.innerHTML = "";

  const list = filter ? BOOKS.filter(b => b.tag === filter) : BOOKS;

  list.forEach(book => {
    const card = document.createElement("article");
    card.className = "card";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;

    const meta = document.createElement("div");
    meta.className = "book-meta";
    meta.textContent = `${book.author} • ${book.topic}`;

    const desc = document.createElement("p");
    desc.className = "book-desc";
    desc.textContent = book.desc;

    const actions = document.createElement("div");
    actions.className = "book-actions";

    const favBtn = document.createElement("button");
    favBtn.className = "fav-btn";
    favBtn.type = "button";
    favBtn.textContent = isFav(book) ? "★" : "☆";

    favBtn.addEventListener("click", () => {
      toggleFav(book);
      favBtn.textContent = isFav(book) ? "★" : "☆";
    });

    // Styled link button (no underline, no blue)
    const open = document.createElement("a");
    open.className = "open-link";
    open.href = book.url;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.innerHTML = `Open <span aria-hidden="true">↗</span>`;

    actions.appendChild(favBtn);
    actions.appendChild(open);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(desc);
    card.appendChild(actions);

    booksList.appendChild(card);
  });
}

// Tabs
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderBooks(tab.dataset.filter);
  });
});

// Initial render
renderBooks("ptsd");
