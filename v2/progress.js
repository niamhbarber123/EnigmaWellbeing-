(() => {
  const STATS_KEY = "enigma_stats_v1";

  const daysUsedEl = document.getElementById("daysUsed");
  const checkinsEl = document.getElementById("checkins");
  const overwhelmedEl = document.getElementById("overwhelmed");
  const reflectionEl = document.getElementById("reflectionText");

  if (!daysUsedEl || !checkinsEl || !overwhelmedEl || !reflectionEl) return;

  function load() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY)) || { opens:{}, events:{} }; }
    catch { return { opens:{}, events:{} }; }
  }

  const s = load();
  const openDays = Object.keys(s.opens || {});
  const daysUsed = openDays.length;

  let checkins = 0;
  let overwhelmed = 0;

  Object.values(s.events || {}).forEach(dayEvents => {
    checkins += (dayEvents.checkin_saved || 0);
    overwhelmed += (dayEvents.overwhelmed_done || 0);
  });

  daysUsedEl.textContent = String(daysUsed);
  checkinsEl.textContent = String(checkins);
  overwhelmedEl.textContent = String(overwhelmed);

  let reflection = "You’re building a habit of checking in with yourself — that’s real care.";

  if (daysUsed >= 7 && checkins === 0) reflection = "You’ve been showing up. If writing feels hard, even one sentence is enough.";
  else if (checkins >= 5) reflection = "You’ve been putting feelings into words. That can make thoughts feel less loud.";
  else if (overwhelmed >= 3) reflection = "You’ve used “I’m overwhelmed” more than once — that’s you choosing support in the moment.";
  else if (daysUsed === 1) reflection = "You’re here. That’s a start. Keep it simple — one small tool is enough.";

  reflectionEl.textContent = reflection;
})();
