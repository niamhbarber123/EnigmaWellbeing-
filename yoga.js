(() => {
  const chipsEl = document.getElementById("yogaChips");
  const listEl  = document.getElementById("yogaList");
  if (!chipsEl || !listEl) return;

  const YOGA = [
    { mood: "Calm", items: [
      { title: "Gentle full body", desc: "Slow flow to settle your nervous system.", url: "https://www.youtube.com/results?search_query=gentle+yoga+slow+flow" },
      { title: "Stretch + release", desc: "Soft stretching for tension.", url: "https://www.youtube.com/results?search_query=gentle+yoga+stretch+release" }
    ]},
    { mood: "Anxiety", items: [
      { title: "Yoga for anxiety", desc: "Grounding movement + breath.", url: "https://www.youtube.com/results?search_query=yoga+for+anxiety+grounding" },
      { title: "Nervous system reset", desc: "Slow, supportive practice.", url: "https://www.youtube.com/results?search_query=restorative+yoga+nervous+system" }
    ]},
    { mood: "Sleep", items: [
      { title: "Bedtime yoga", desc: "Wind down and soften.", url: "https://www.youtube.com/results?search_query=bedtime+yoga+relaxing" },
      { title: "Restorative yoga", desc: "Props-friendly, very gentle.", url: "https://www.youtube.com/results?search_query=restorative+yoga+for+sleep" }
    ]},
    { mood: "Energy", items: [
      { title: "Morning wake up", desc: "Easy energising flow.", url: "https://www.youtube.com/results?search_query=morning+yoga+energizing" },
      { title: "Feel-good flow", desc: "Light movement to lift mood.", url: "https://www.youtube.com/results?search_query=feel+good+yoga+flow" }
    ]}
  ];

  const MOODS = YOGA.map(x => x.mood);
  let active = MOODS[0] || "Calm";

  function esc(str){
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  function renderChips(){
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

  function renderList(){
    const group = YOGA.find(x => x.mood === active);
    const items = group ? group.items : [];
    listEl.innerHTML = "";

    if (!items.length){
      listEl.innerHTML = `<div class="gentle-text" style="margin-top:12px;">No videos yet.</div>`;
      return;
    }

    items.forEach(item => {
      const a = document.createElement("a");
      a.className = "link-btn";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener";

      a.innerHTML = `
        <div>
          <div class="link-title">${esc(item.title)}</div>
          <div class="link-sub">${esc(item.desc)}</div>
        </div>
        <div class="link-arrow">→</div>
      `;
      listEl.appendChild(a);
    });
  }

  renderChips();
  renderList();
})();
