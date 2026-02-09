/* =========================
   NIGHT MODE – BUTTON VISIBILITY FIX
   ========================= */

body.night .home-pill,
body.night .small-pill,
body.night .btn,
body.night .chip,
body.night .link-btn {
  background: rgba(40, 38, 60, 0.95);   /* darker pill */
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow:
    0 10px 26px rgba(0,0,0,0.55),
    inset 0 0 0 1px rgba(255,255,255,0.05);
}

/* Button text */
body.night .pill-text,
body.night .btn,
body.night .chip,
body.night .link-title {
  color: rgba(255,255,255,0.96);
}

/* Subtext inside buttons */
body.night .link-sub {
  color: rgba(255,255,255,0.70);
}

/* Icons inside buttons */
body.night .pill-ico,
body.night .nav-ico {
  opacity: 0.9;
}

/* Active / selected states */
body.night .chip.active,
body.night .btn.primary {
  background: rgba(184,168,255,0.28);
  border-color: rgba(184,168,255,0.45);
  box-shadow:
    0 0 0 1px rgba(184,168,255,0.35),
    0 12px 30px rgba(0,0,0,0.55);
}

/* Press feedback */
body.night .home-pill:active,
body.night .btn:active,
body.night .chip:active {
  transform: scale(0.985);
}
