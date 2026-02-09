(() => {
  const chipsEl = document.getElementById("yogaChips");
  const listEl  = document.getElementById("yogaList");

  // ✅ Edit/add your videos here
  const YOGA = [
    {
      mood: "Calm",
      items: [
        { title: "Gentle yoga for calm", desc: "Slow, grounding flow.", url: "https://www.youtube.com/results?search_query=gentle+yoga+calm" },
        { title: "Bedtime stretch", desc: "Wind down and soften tension.", url: "https://www.youtube.com/results?search_query=bedtime+yoga+stretch" }
      ]
    },
    {
      mood: "Anxiety",
      items: [
        { title: "Yoga for anxiety", desc: "Gentle flow to settle the nervous system.", url: "https://www.youtube.com/results?search_query=yoga+for+anxiety+gentle" },
        { title: "Breath-led calming practice", desc: "Simple movement + breath.", url: "https://www.youtube.com/results?search_query=breath+led+yoga+calming" }
      ]
    },
    {
      mood: "Low mood",
      items: [
        { title: "Mood-boost gentle flow", desc: "Light movement to lift energy.", url: "https://www.youtube.com/results?search_query=gentle+yoga+for+depression" },
        { title: "Soft morning yoga", desc: "Easy start to the day.", url: "https://www.youtube.com/results?search_query=morning+gentle+yoga" }
      ]
    },
    {
      mood: "Tension",
      items: [
        { title: "Neck & shoulder release", desc: "Undo desk tension.", url: "https://www.youtube.com/results?search_query=yoga+neck+shoulder+release" },
        { title: "Hip opener gentle", desc: "Slow hips + lower back.", url: "https://www.youtube.com/results?search_query=gentle+hip+opener+yoga" }
      ]
    }
  ];

  const MOODS = YOGA.map(x => x.mood);
  let active = MOODS[0] || "Calm";

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  function renderChips() {
    chipsEl.innerHTML = "";
    MOODS.forEach(m => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (m === active ? " active" : "");
      btn.textContent = m;
      btn.addEventListener("click", () => {
        active = m;
        renderChips();
        renderList();
      });
      chipsEl.appendChild(btn);
    });
  }

  function renderList() {
    const group = YOGA.find(x => x.mood === active);
    const items = group ? group.items : [];

    if (!items.length) {
      listEl.innerHTML = `<div class="gentle-text" style="margin-top:12px;">No videos for this mood yet.</div>`;
      return;
    }

    listEl.innerHTML = "";
    items.forEach(item => {
      const a = document.createElement("a");
      a.className = "link-btn";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener";

      a.innerHTML = `
        <div>
          <div class="link-title">${escapeHtml(item.title)}</div>
          <div class="link-sub">${escapeHtml(item.desc)}</div>
        </div>
        <div class="link-arrow">→</div>
      `;

      listEl.appendChild(a);
    });
  }

  renderChips();
  renderList();
})();
