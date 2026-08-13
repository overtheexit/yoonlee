// dots.js — Art hero: generates a random 10–15 floating balls (Pantone colors
// + the distorted disco ball), then makes them draggable physics toys. Idle
// they drift; grab and fling one and gravity takes over — slow and bouncy — and
// it falls down the page, bounces, and settles at the bottom. Skipped for
// reduced-motion (balls placed statically instead).

(function () {
  const hero = document.querySelector(".art-hero");
  const container = hero && hero.querySelector(".dots");
  if (!hero || !container) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Pantone-ish, mid-tone so every ball reads on both ivory and black.
  const PANTONE = [
    "#F96714", "#EF3340", "#E03C31", "#FF6F61", "#F5A623",
    "#EFC050", "#6BB745", "#009B77", "#45B8AC", "#00A3E0",
    "#0072CE", "#5B5EA6", "#6B5B95", "#B565A7", "#D94F70",
    "#E8618C", "#955196", "#DD4132",
  ];

  const heroRect = hero.getBoundingClientRect();
  const mobile = window.innerWidth <= 600;

  // Keep-out box around the headline/lede so balls don't cover the text. Use a
  // Range to measure the actual text extent, not the full-width <p> block.
  let keep = { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity };
  ["h1", ".lede", ".eyebrow"].forEach((s) => {
    const el = hero.querySelector(s);
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    keep.l = Math.min(keep.l, r.left);
    keep.t = Math.min(keep.t, r.top);
    keep.r = Math.max(keep.r, r.right);
    keep.b = Math.max(keep.b, r.bottom);
  });
  const PAD = 16;
  const onText = (x, y, s) =>
    !(x + s < keep.l - PAD || x > keep.r + PAD || y + s < keep.t - PAD || y > keep.b + PAD);

  const total = 10 + Math.floor(Math.random() * 6); // 10..15
  const nodes = [];
  for (let i = 0; i < total; i++) {
    const isDisco = i === 0;
    const size = isDisco
      ? (mobile ? 66 : 116)
      : (mobile ? 20 : 38) + Math.round(Math.random() * (mobile ? 34 : 82));
    let x, y, tries = 0;
    do {
      x = heroRect.left + Math.random() * Math.max(1, heroRect.width - size);
      y = heroRect.top + 40 + Math.random() * Math.max(40, heroRect.height - size - 100);
      tries++;
    } while (onText(x, y, size) && tries < 40);

    const el = document.createElement("span");
    el.className = "dot" + (isDisco ? " disco" : "");
    el.style.width = el.style.height = size + "px";
    if (!isDisco) el.style.background = PANTONE[(Math.random() * PANTONE.length) | 0];
    el.dataset.x = x + window.scrollX;
    el.dataset.y = y + window.scrollY;
    container.appendChild(el);
    nodes.push(el);
  }

  if (reduce) {
    nodes.forEach((el) => {
      el.style.position = "absolute";
      el.style.left = parseFloat(el.dataset.x) - heroRect.left - window.scrollX + "px";
      el.style.top = parseFloat(el.dataset.y) - heroRect.top - window.scrollY + "px";
    });
    return;
  }

  // ---- physics (slow + bouncy) ----
  const G = 0.3;     // gravity per frame
  const REST = 0.85; // bounce restitution
  const AIR = 0.992; // air drag
  const GF = 0.9;    // floor friction
  const FLING = 0.4; // how much of the drag speed becomes throw velocity
  const MAXV = 26;   // speed cap

  const docW = () => document.documentElement.clientWidth;
  const docH = () =>
    Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

  const bodies = nodes.map((el) => {
    const size = parseFloat(el.style.width);
    const b = {
      el, w: size, h: size,
      x: parseFloat(el.dataset.x), y: parseFloat(el.dataset.y),
      vx: 0, vy: 0,
      hx: parseFloat(el.dataset.x), hy: parseFloat(el.dataset.y),
      phase: Math.random() * Math.PI * 2, sp: 0.35 + Math.random() * 0.4,
      amp: 4 + Math.random() * 7, awake: false, drag: false, ox: 0, oy: 0,
    };
    document.body.appendChild(el);
    el.style.position = "absolute";
    el.style.left = "0";
    el.style.top = "0";
    el.style.margin = "0";
    el.style.zIndex = "40";
    el.style.cursor = "grab";
    el.style.touchAction = "none";
    el.style.willChange = "transform";
    return b;
  });

  const cap = (v) => Math.max(-MAXV, Math.min(MAXV, v));
  const render = (b) => {
    b.el.style.transform = "translate(" + b.x + "px," + b.y + "px)";
  };

  let active = null, px = 0, py = 0, lpx = 0, lpy = 0;
  function down(e, b) {
    active = b;
    b.drag = true;
    b.awake = true;
    try { b.el.setPointerCapture(e.pointerId); } catch (_) {}
    const r = b.el.getBoundingClientRect();
    b.ox = e.clientX - r.left;
    b.oy = e.clientY - r.top;
    px = lpx = e.clientX;
    py = lpy = e.clientY;
    e.preventDefault();
  }
  function move(e) {
    if (!active) return;
    lpx = px; lpy = py;
    px = e.clientX; py = e.clientY;
    active.x = e.clientX - active.ox + window.scrollX;
    active.y = e.clientY - active.oy + window.scrollY;
  }
  function up() {
    if (!active) return;
    active.vx = cap((px - lpx) * FLING);
    active.vy = cap((py - lpy) * FLING);
    active.drag = false;
    active = null;
  }
  bodies.forEach((b) => b.el.addEventListener("pointerdown", (e) => down(e, b)));
  window.addEventListener("pointermove", move, { passive: false });
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);

  let t = 0;
  function step() {
    t += 1;
    const W = docW(), H = docH();
    for (const b of bodies) {
      if (b.drag) { render(b); continue; }
      if (!b.awake) {
        b.x = b.hx + Math.sin(t * 0.01 * b.sp + b.phase) * b.amp;
        b.y = b.hy + Math.cos(t * 0.011 * b.sp + b.phase) * b.amp;
        render(b);
        continue;
      }
      b.vy += G;
      b.vx *= AIR;
      b.vy *= AIR;
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 0) { b.x = 0; b.vx = -b.vx * REST; }
      if (b.x + b.w > W) { b.x = W - b.w; b.vx = -b.vx * REST; }
      if (b.y < 0) { b.y = 0; b.vy = -b.vy * REST; }
      if (b.y + b.h > H) {
        b.y = H - b.h;
        b.vy = -b.vy * REST;
        b.vx *= GF;
        if (Math.abs(b.vy) < 0.5) b.vy = 0;
      }
      render(b);
    }
    requestAnimationFrame(step);
  }
  bodies.forEach(render);
  requestAnimationFrame(step);
})();
