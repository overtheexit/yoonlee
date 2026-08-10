// glitch.js — Art hero background.
// Thin horizontal color bars whose colors are sampled straight from the actual
// gallery works, then scrolled so the color "flows" through the stack, with
// occasional digital tears. The palette IS the art. Respects reduced-motion.

(function () {
  const cv = document.getElementById("glitch");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SRC = [
    "./assets/gallery/untitled-1.jpg",
    "./assets/gallery/messy-summer.jpg",
    "./assets/gallery/jureuk.jpg",
    "./assets/gallery/buy-me.jpg",
    "./assets/gallery/logo.jpg",
  ];

  // Fallback so it animates before the images finish loading.
  let palette = ["#c98a4e", "#b81f36", "#1b2a54", "#2b6fd6", "#c9c3b6", "#173a2a", "#f2c230"];

  const BAR = 4; // bar thickness in px — thin
  let W, H, DPR, scroll = 0, tears = 0;

  function size() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = W * DPR;
    cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // Sample rows of real pixels from each work → one long, diverse color list.
  function buildPalette(images) {
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    const cols = [];
    images.forEach((img) => {
      const w = 260;
      const h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth));
      off.width = w;
      off.height = h;
      octx.drawImage(img, 0, 0, w, h);
      [0.2, 0.36, 0.5, 0.64, 0.8].forEach((ry) => {
        const y = Math.min(h - 1, Math.floor(h * ry));
        const d = octx.getImageData(0, y, w, 1).data;
        for (let x = 0; x < w; x += 3) {
          const r = d[x * 4], g = d[x * 4 + 1], b = d[x * 4 + 2];
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          if (max < 22) continue; // drop near-black
          if (max - min < 26 && Math.random() < 0.65) continue; // thin out muddy greys
          cols.push("rgb(" + r + "," + g + "," + b + ")");
        }
      });
    });
    if (cols.length > 12) palette = cols;
  }

  function paint() {
    const len = palette.length;
    const base = Math.floor(scroll);
    const off = (scroll - base) * BAR; // sub-bar offset for smooth scroll
    for (let i = -1; i * BAR - off < H; i++) {
      let idx = (base + i) % len;
      if (idx < 0) idx += len;
      ctx.fillStyle = palette[idx];
      ctx.fillRect(0, i * BAR - off, W, BAR + 1);
    }

    // Occasional glitch: shove a horizontal slice sideways for a few frames.
    if (!reduce && Math.random() < 0.02) tears = 4 + ((Math.random() * 9) | 0);
    if (tears > 0) {
      tears--;
      const sliceH = 3 + Math.random() * 22;
      const sy = Math.random() * (H - sliceH);
      const dx = (Math.random() - 0.5) * 46;
      ctx.drawImage(cv, 0, sy * DPR, cv.width, sliceH * DPR, dx, sy, W, sliceH);
      if (Math.random() < 0.5) {
        ctx.fillStyle = "rgba(127,134,255,0.4)";
        ctx.fillRect(0, sy + sliceH, W, 1.5);
      }
    }
  }

  function loop() {
    scroll += 0.22; // colors flow through the bars
    paint();
    if (!reduce) requestAnimationFrame(loop);
  }

  function start() {
    size();
    reduce ? paint() : requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    size();
    if (reduce) paint();
  });

  // Load the works, sample them, then run. Same-origin, so pixels are readable.
  let pending = SRC.length;
  const loaded = [];
  SRC.forEach((src) => {
    const img = new Image();
    img.onload = () => {
      loaded.push(img);
      if (--pending === 0) buildPalette(loaded);
    };
    img.onerror = () => {
      if (--pending === 0 && loaded.length) buildPalette(loaded);
    };
    img.src = src;
  });

  start();
})();
