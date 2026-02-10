(() => {
  const toggle = document.querySelector(".theme-toggle");
  const saved = localStorage.getItem("enigma_theme");

  if (saved === "night") {
    document.body.classList.add("night");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("night");
      localStorage.setItem(
        "enigma_theme",
        document.body.classList.contains("night") ? "night" : "light"
      );
    });
  }
})();
