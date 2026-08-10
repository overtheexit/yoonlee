// site.js — small page behaviors: footer year, in-page smooth scroll, and the
// gallery lightbox.

// Footer year
(function () {
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();

// Fifth floating dot gets a fresh random color every load. Controlled HSL keeps
// it vivid but readable on both the ivory and black backgrounds.
(function () {
  const d5 = document.querySelector(".art-hero .dot.d5");
  if (!d5) return;
  const hue = Math.floor(Math.random() * 360);
  const sat = 62 + Math.floor(Math.random() * 20); // 62–82%
  const light = 56 + Math.floor(Math.random() * 10); // 56–66%
  d5.style.setProperty("--d5", "hsl(" + hue + " " + sat + "% " + light + "%)");
})();

// Lightbox
(function () {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const cap = document.getElementById("lightboxCap");
  const closeBtn = document.getElementById("lightboxClose");
  if (!box || !img || !cap) return;

  let lastFocus = null;

  window.openLightbox = function (piece) {
    lastFocus = document.activeElement;
    img.src = piece.src;
    img.alt = piece.title + " — " + piece.medium;
    cap.textContent = piece.title + " · " + piece.year + " · " + piece.medium;
    box.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  function close() {
    box.hidden = true;
    img.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  closeBtn.addEventListener("click", close);
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !box.hidden) close();
  });
})();
