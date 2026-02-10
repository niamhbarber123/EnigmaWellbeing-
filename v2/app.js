// 🌙 Night mode
const themeBtn = document.querySelector(".theme-toggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("night");
    localStorage.setItem(
      "enigma_night",
      document.body.classList.contains("night")
    );
  });
}

if (localStorage.getItem("enigma_night") === "true") {
  document.body.classList.add("night");
}

// 🔙 Back button
document.querySelectorAll(".back-btn").forEach(btn => {
  btn.addEventListener("click", () => history.back());
});
