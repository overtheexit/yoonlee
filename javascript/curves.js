// curves.js — the hero's plotted-curve motif, echoing the "Regression" collage:
// data science and collage drawn with the same gesture. Static if the visitor
// prefers reduced motion.

(function heroCurves() {
  const cv = document.getElementById("curves");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, DPR;

  function size() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = W * DPR;
    cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function accent() {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#2530d6"
    );
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const cols = [accent(), "#c15a2b", "#7a2fb0", "#2b7fff"];
    ctx.globalAlpha = 0.5;
    for (let k = 0; k < cols.length; k++) {
      ctx.beginPath();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = cols[k];
      for (let x = 0; x <= W; x += 6) {
        const p = x / W;
        const y =
          H * 0.5 +
          Math.sin(p * 3.0 + t * 0.0004 + k * 1.7) * (H * 0.2) +
          Math.sin(p * 7.0 - t * 0.0002 + k) * (H * 0.06 * (k + 1) * 0.4);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function loop(t) {
    draw(t);
    if (!reduce) requestAnimationFrame(loop);
  }
  window.addEventListener("resize", () => {
    size();
    if (reduce) draw(0);
  });
  size();
  reduce ? draw(0) : requestAnimationFrame(loop);
})();
