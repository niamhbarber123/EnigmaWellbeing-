(() => {
  const FAV_KEY = "enigma_book_favs_v1";
  const chipsEl = document.getElementById("genreChips");
  const listEl  = document.getElementById("booksList");

  const BOOKS = [
    { id:"dare", title:"DARE", author:"Barry McDonagh", genre:"Anxiety", desc:"Practical method for panic and anxious spirals.", url:"https://www.goodreads.com/book/show/22425641-dare" },
    { id:"weekes", title:"Hope and Help for Your Nerves", author:"Dr Claire Weekes", genre:"Anxiety", desc:"Classic reassurance + steps for fear/adrenaline cycles.", url:"https://www.goodreads.com/book/show/194372.Hope_and_Help_for_Your_Nerves" },
    { id:"anxworkbook", title:"The Anxiety and Phobia Workbook", author:"Edmund J. Bourne", genre:"Anxiety", desc:"Exercises and worksheets you can use day-to-day.", url:"https://www.goodreads.com/book/show/46674.The_Anxiety_and_Phobia_Workbook" },
    { id:"burnout", title:"Burnout", author:"Emily & Amelia Nagoski", genre:"Stress", desc:"How stress gets stuck and how to complete the stress cycle.", url:"https://www.goodreads.com/book/show/42397849-burnout" },

    { id:"feelinggood", title:"Feeling Good", author:"David D. Burns", genre:"Depression", desc:"CBT tools for low mood and negative thinking loops.", url:"https://www.goodreads.com/book/show/46674.Feeling_Good" },
    { id:"mindovermood", title:"Mind Over Mood", author:"Greenberger & Padesky", genre:"Depression", desc:"Structured CBT workbook (very practical).", url:"https://www.goodreads.com/book/show/59676.Mind_Over_Mood" },

    { id:"bodykeepscore", title:"The Body Keeps the Score", author:"Bessel van der Kolk", genre:"PTSD", desc:"How trauma shows up in mind/body + recovery options.", url:"https://www.goodreads.com/book/show/18693771-the-body-keeps-the-score" },
    { id:"complexptsd", title:"Complex PTSD: From Surviving to Thriving", author:"Pete Walker", genre:"PTSD", desc:"Supportive guide for complex trauma patterns.", url:"https://www.goodreads.com/book/show/20556323-complex-ptsd" },

    { id:"ocdworkbook", title:"The OCD Workbook", author:"Bruce M. Hyman", genre:"OCD", desc:"Evidence-based strategies and ERP guidance.", url:"https://www.goodreads.com/book/show/19849.The_OCD_Workbook" },

    { id:"intuitive", title:"Intuitive Eating", author:"Tribole & Resch", genre:"Eating disorders", desc:"Gentle approach to rebuilding trust with food.", url:"https://www.goodreads.com/book/show/723662.Intuitive_Eating" },

    { id:"dbtskills", title:"The Dialectical Behavior Therapy Skills Workbook", author:"McKay, Wood & Brantley", genre:"BPD", desc:"DBT skills: mindfulness, distress tolerance, emotion regulation, relationships.", url:"https://www.goodreads.com/book/show/369266.The_Dialectical_Behavior_Therapy_Skills_Workbook" },
    { id:"ihy-dlm", title:"I Hate You—Don’t Leave Me", author:"Kreisman & Straus", genre:"BPD", desc:"Understanding BPD patterns with compassionate explanations.", url:"https://www.goodreads.com/book/show/145391.I_Hate_You_Don_t_Leave_Me" },
    { id:"buddha-borderline", title:"The Buddha and the Borderline", author:"Kiera Van Gelder", genre:"BPD", desc:"Memoir with recovery themes (relatable + hopeful).", url:"https://www.goodreads.com/book/show/18693766-the-buddha-and-the-borderline" },
    { id:"linehan-handouts", title:"DBT Skills Training Handouts and Worksheets", author:"Marsha M. Linehan", genre:"BPD", desc:"Core DBT handouts/worksheets used widely in services.", url:"https://www.goodreads.com/book/show/121091.DBT_Skills_Training_Handouts_and_Worksheets" },

    { id:"atomic", title:"Atomic Habits", author:"James Clear", genre:"Wellbeing", desc:"Small habits that compound into big change (easy + motivating).", url:"https://www.goodreads.com/book/show/40121378-atomic-habits" },
    { id:"selfcomp", title:"Self-Compassion", author:"Kristin Neff", genre:"Wellbeing", desc:"Build a kinder inner voice without losing accountability.", url:"https://www.goodreads.com/book/show/10127008-self-compassion" }
  ];

  const ALL_GENRES = Array.from(new Set(BOOKS.map(b => b.genre))).sort((a,b)=>a.localeCompare(b));
  const GENRES = ["All", "★ Favourites", ...ALL_GENRES];

  function loadFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch { return []; }
  }

  function saveFavs(ids) {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  }

  let activeGenre = "All";

  function renderChips() {
    chipsEl.innerHTML = "";
    GENRES.forEach(g => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (g === activeGenre ? " active" : "");
      btn.textContent = g;
      btn.addEventListener("click", () => {
        activeGenre = g;
        renderChips();
        renderList();
      });
      chipsEl.appendChild(btn);
    });
  }

  function matches(book, favIds) {
    if (activeGenre === "All") return true;
    if (activeGenre === "★ Favourites") return favIds.includes(book.id);
    return book.genre === activeGenre;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  function renderList() {
    const favIds = loadFavs();
    const filtered = BOOKS.filter(b => matches(b, favIds));

    if (!filtered.length) {
      listEl.innerHTML = `<div class="gentle-text" style="margin-top:12px;">No books found for this filter.</div>`;
      return;
    }

    listEl.innerHTML = "";
    filtered.forEach(book => {
      const isFav = favIds.includes(book.id);

      const card = document.createElement("div");
      card.className = "book-item";

      card.innerHTML = `
        <div class="book-top">
          <div>
            <div class="book-title">${escapeHtml(book.title)}</div>
            <div class="book-meta">${escapeHtml(book.author)} • ${escapeHtml(book.genre)}</div>
            <div class="book-desc">${escapeHtml(book.desc)}</div>
          </div>

          <button class="fav-btn ${isFav ? "fav" : ""}" type="button" aria-label="${isFav ? "Remove from favourites" : "Add to favourites"}">
            ${isFav ? "★" : "☆"}
          </button>
        </div>

        <div class="book-actions">
          <a class="book-link" href="${book.url}" target="_blank" rel="noopener">Open</a>
        </div>
      `;

      card.querySelector(".fav-btn").addEventListener("click", () => {
        const current = loadFavs();
        const idx = current.indexOf(book.id);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(book.id);
        saveFavs(current);
        renderChips();
        renderList();
      });

      listEl.appendChild(card);
    });
  }

  renderChips();
  renderList();
})();
