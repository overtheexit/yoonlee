// glitch.js — Art hero background.
// Vertical color bars pulled from the collage works: they breathe (expand /
// contract), drift, and occasionally tear like a digital glitch. Each bar has a
// soft top-to-bottom sheen so the whole thing reads smooth, not harsh — closer
// to the mirror-ball than to static. Respects prefers-reduced-motion.

(function () {
  const cv = document.getElementById("glitch");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Colors sampled from the actual pieces (terracotta drip, deli stripes,
  // disco-ball indigo, concrete, the green leak, a hit of yellow).
  const palette = [
    "#c98a4e", "#b5732f", "#b81f36", "#d33b57", "#1b2a54",
    "#2b6fd6", "#2a1fb8", "#c9c3b6", "#8f9096", "#173a2a",
    "#f2c230", "#4a5a72", "#0e0f13",
  ];

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.round(((n >> 16) & 255) * f));
    const g = Math.min(255, Math.round(((n >> 8) & 255) * f));
    const b = Math.min(255, Math.round((n & 255) * f));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  let W, H, DPR, stripes, tears;
  function build() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = W * DPR;
    cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    tears = 0;
    const n = Math.max(16, Math.round(W / 48));
    stripes = [];
    for (let i = 0; i < n; i++) {
      stripes.push({
        base: 0.5 + Math.random() * 1.6, // relative width
        amp: 0.25 + Math.random() * 0.75, // breathing amount
        phase: Math.random() * Math.PI * 2,
        speed: 0.00025 + Math.random() * 0.0006,
        c: palette[(Math.random() * palette.length) | 0],
      });
    }
  }

  function paint(t) {
    const ws = stripes.map(
      (s) => s.base + s.amp * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
    );
    const scale = W / ws.reduce((a, b) => a + b, 0);
    let x = 0;
    for (let i = 0; i < stripes.length; i++) {
      const w = ws[i] * scale;
      const c = stripes[i].c;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, shade(c, 1.12));
      g.addColorStop(0.5, c);
      g.addColorStop(1, shade(c, 0.82));
      ctx.fillStyle = g;
      ctx.fillRect(Math.floor(x) - 0.5, 0, Math.ceil(w) + 1, H);
      x += w;
    }

    // Occasional glitch: tear horizontal slices sideways for a few frames.
    if (!reduce && Math.random() < 0.018) tears = 5 + ((Math.random() * 9) | 0);
    if (tears > 0) {
      tears--;
      const passes = 1 + ((Math.random() * 2) | 0);
      for (let p = 0; p < passes; p++) {
        const sliceH = 4 + Math.random() * 26;
        const sy = Math.random() * (H - sliceH);
        const dx = (Math.random() - 0.5) * 40;
        ctx.drawImage(cv, 0, sy * DPR, cv.width, sliceH * DPR, dx, sy, W, sliceH);
        if (Math.random() < 0.5) {
          ctx.fillStyle = "rgba(127,134,255,0.45)";
          ctx.fillRect(0, sy + sliceH, W, 1.5);
        }
      }
    }
  }

  function loop(t) {
    paint(t);
    if (!reduce) requestAnimationFrame(loop);
  }
  function boot() {
    build();
    reduce ? paint(0) : requestAnimationFrame(loop);
  }
  window.addEventListener("resize", () => {
    build();
    if (reduce) paint(0);
  });
  boot();
})();
