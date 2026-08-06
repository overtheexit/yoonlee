// gallery.js — the collage wall is data-driven so it ports cleanly to a
// component/CMS later. Add a work by appending one record here and dropping
// its export into assets/gallery/. `span` sets grid width (2 or 3 of 6 cols);
// `ar` is the frame aspect-ratio (width/height).

const GALLERY = [
  {
    src: "./assets/gallery/jureuk.jpg",
    title: "주륵주륵",
    year: "2023",
    medium: "Digital collage — iPhone 14 Pro, Photoleap",
    span: 2,
    ar: "3 / 4",
  },
  {
    src: "./assets/gallery/untitled-1.jpg",
    title: "Untitled-1",
    year: "2023",
    medium: "Digital collage — iPhone 14 Pro, Photoleap",
    span: 2,
    ar: "3 / 4",
  },
  {
    src: "./assets/gallery/buy-me.jpg",
    title: "Buy Me",
    year: "2024",
    medium: "Digital collage — iPhone 14 Pro, Photoleap",
    span: 2,
    ar: "3 / 4",
  },
  {
    src: "./assets/gallery/logo.jpg",
    title: "LOGO",
    year: "2021",
    medium: "Digital collage — iPhone 14 Pro, Photoleap",
    span: 4,
    ar: "1179 / 1025",
  },
  {
    src: "./assets/gallery/messy-summer.jpg",
    title: "Messey Summer",
    year: "2022",
    medium: "Digital collage — iPhone 14 Pro, Photoleap",
    span: 2,
    ar: "828 / 1026",
  },
];

(function renderGallery() {
  const room = document.getElementById("room");
  if (!room) return;

  GALLERY.forEach((p) => {
    const fig = document.createElement("figure");
    fig.className = "piece s" + p.span;
    fig.setAttribute("role", "listitem");

    const frame = document.createElement("div");
    frame.className = "frame";
    frame.style.aspectRatio = p.ar;

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = p.src;
    img.alt = p.title + " — " + p.medium;
    // Until the real export is dropped in, show the "awaiting export" state
    // instead of a broken image.
    img.addEventListener("error", () => frame.classList.add("missing"));
    frame.appendChild(img);

    // Open the lightbox (wired up in site.js) unless the frame is a placeholder.
    frame.addEventListener("click", () => {
      if (frame.classList.contains("missing")) return;
      window.openLightbox && window.openLightbox(p);
    });

    const cap = document.createElement("figcaption");
    cap.className = "label";
    cap.innerHTML =
      '<span class="lt"></span><span class="lm"></span>';
    cap.querySelector(".lt").textContent = p.title;
    cap.querySelector(".lm").textContent = p.year + " · " + p.medium;

    fig.appendChild(frame);
    fig.appendChild(cap);
    room.appendChild(fig);
  });

  const countEl = document.getElementById("workCount");
  if (countEl) countEl.textContent = GALLERY.length;
})();
