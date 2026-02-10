(() => {
  const KEY = "enigma_settings_v1";
  const paceRow = document.getElementById("paceRow");
  const paceStatus = document.getElementById("paceStatus");
  const reduceMotionEl = document.getElementById("reduceMotion");
  if (!paceRow || !paceStatus || !reduceMotionEl) return;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  }
  function save(obj) {
    localStorage.setItem(KEY, JSON.stringify(obj));
  }

  const options = [
    { id: "slow", label: "🐢 Slow" },
    { id: "standard", label: "😌 Standard" },
    { id: "fast", label: "⚡ Fast" }
  ];

  let s = load();
  let current = s.breathePace || "standard";

  function render() {
    paceRow.innerHTML = "";
    options.forEach(o => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (o.id === current ? " active" : "");
      b.textContent = o.label;
      b.addEventListener("click", () => {
        current = o.id;
        s.breathePace = current;
        save(s);
        render();
      });
      paceRow.appendChild(b);
    });

    paceStatus.textContent =
      current === "slow" ? "Slow pace selected." :
      current === "fast" ? "Fast pace selected." :
      "Standard pace selected.";

    reduceMotionEl.checked = !!s.reduceMotion;
  }

  reduceMotionEl.addEventListener("change", () => {
    s.reduceMotion = !!reduceMotionEl.checked;
    save(s);
  });

  render();
})();
