(() => {
  const chipsEl = document.getElementById("yogaChips");
  const listEl = document.getElementById("yogaList");

  const VIDEOS = [
    { mood: "Calm", title: "Gentle Yoga for Calm (10–20 min)", url: "https://www.youtube.com/results?search_query=gentle+yoga+for+calm+10+minutes" },
    { mood: "Stress", title: "Yoga for Stress Release", url: "https://www.youtube.com/results?search_query=yoga+for+stress+release" },
    { mood: "Anxiety", title: "Yoga for Anxiety", url: "https://www.youtube.com/results?search_query=yoga+for+anxiety" },
    { mood: "Sleep", title: "Bedtime Yoga / Wind Down", url: "https://www.youtube.com/results?search_query=bedtime+yoga+for+sleep" },
    { mood: "Energy", title: "Gentle Morning Flow", url: "https://www.youtube.com/results?search_query=gentle+morning+yoga+flow" },
  ];

  const MOODS = ["All", "Calm", "Stress", "Anxiety", "Sleep", "Energy"];
  let active = "All";

  function renderChips() {
    chipsEl.innerHTML = "";
    MOODS.forEach(m => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (m === active ? " active" : "");
      b.textContent = m;
      b.addEventListener("click", () => {
        active = m;
        renderChips();
        renderList();
      });
      chipsEl.appendChild(b);
    });
  }

  function renderList() {
    listEl.innerHTML = "";
    const filtered = active === "All" ? VIDEOS : VIDEOS.filter(v => v.mood === active);

    filtered.forEach(v => {
      const a = document.createElement("a");
      a.className = "link-pill";
      a.href = v.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `▶︎ ${v.title}`;
      listEl.appendChild(a);
    });
  }

  renderChips();
  renderList();
})();
