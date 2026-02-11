const THEME_KEY  = "enigma_theme_v2";
const ACCENT_KEY = "enigma_accent_v2";
const TEXT_KEY   = "enigma_textsize_v2";

const ACCENTS = {
  lavender: { tint:"rgba(200,186,255,.30)", tintSoft:"rgba(200,186,255,.22)", ring:"rgba(200,186,255,.85)" },
  blush:    { tint:"rgba(255,205,224,.30)", tintSoft:"rgba(255,205,224,.22)", ring:"rgba(255,205,224,.85)" },
  mint:     { tint:"rgba(190,240,220,.30)", tintSoft:"rgba(190,240,220,.22)", ring:"rgba(190,240,220,.85)" },
  sky:      { tint:"rgba(180,220,255,.30)", tintSoft:"rgba(180,220,255,.22)", ring:"rgba(180,220,255,.85)" }
};

const TEXT_SCALES = { small: 0.95, default: 1, large: 1.08 };

export function applySavedTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if(saved === "dark") document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

export function wireThemeButton(){
  const btn = document.querySelector("[data-theme-toggle]");
  if(!btn) return;
  btn.addEventListener("click", ()=>{
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  });
}

export function applySavedPreferences(){
  const accentKey = localStorage.getItem(ACCENT_KEY) || "lavender";
  applyAccent(accentKey);

  const textKey = localStorage.getItem(TEXT_KEY) || "default";
  applyTextSize(textKey);
}

export function applyAccent(key){
  const a = ACCENTS[key] || ACCENTS.lavender;
  const r = document.documentElement;
  r.style.setProperty("--accentTint", a.tint);
  r.style.setProperty("--accentTintSoft", a.tintSoft);
  r.style.setProperty("--accentRing", a.ring);
  localStorage.setItem(ACCENT_KEY, key);
}

export function applyTextSize(key){
  const s = (TEXT_SCALES[key] ?? 1);
  document.documentElement.style.setProperty("--textScale", String(s));
  localStorage.setItem(TEXT_KEY, key);
}
