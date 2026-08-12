// dots.js — Art hero: the floating dots (and the distorted disco ball) become
// draggable physics toys. Idle, they drift gently in the hero. Grab and fling
// one and gravity takes over — it falls down the page, bounces off the walls
// and floor, and settles at the bottom. Skipped for reduced-motion.

(function () {
  const nodes = [...document.querySelectorAll(".art-hero .dot")];
  if (!nodes.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const G = 0.6; // gravity per frame
  const REST = 0.6; // bounce restitution
  const GROUND_FRICTION = 0.84; // horizontal damping on the floor
  const AIR = 0.994; // air drag

  const docW = () => document.documentElement.clientWidth;
  const docH = () =>
    Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

  // Convert each dot to a document-positioned physics body so it can fall the
  // whole page. Capture its computed look first (colors/images live on
  // .art-hero via CSS variables that won't resolve once moved to <body>).
  const bodies = nodes.map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    el.style.backgroundColor = cs.backgroundColor;
    if (cs.backgroundImage && cs.backgroundImage !== "none") {
      el.style.backgroundImage = cs.backgroundImage;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    }
    el.style.boxShadow = cs.boxShadow;
    const b = {
      el,
      w: r.width,
      h: r.height,
      x: r.left + window.scrollX,
      y: r.top + window.scrollY,
      vx: 0,
      vy: 0,
      phase: Math.random() * Math.PI * 2,
      sp: 0.4 + Math.random() * 0.5,
      amp: 5 + Math.random() * 8,
      awake: false,
      drag: false,
      ox: 0,
      oy: 0,
    };
    b.hx = b.x;
    b.hy = b.y;
    document.body.appendChild(el);
    el.style.position = "absolute";
    el.style.left = "0";
    el.style.top = "0";
    el.style.right = "auto";
    el.style.bottom = "auto";
    el.style.margin = "0";
    el.style.animation = "none";
    el.style.zIndex = "40";
    el.style.willChange = "transform";
    return b;
  });

  const render = (b) => {
    b.el.style.transform = "translate(" + b.x + "px," + b.y + "px)";
  };

  // Dragging (Pointer Events → works for mouse and touch)
  let active = null;
  let px = 0, py = 0, lpx = 0, lpy = 0;

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
    active.vx = px - lpx;
    active.vy = py - lpy;
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
    const W = docW();
    const H = docH();
    for (const b of bodies) {
      if (b.drag) {
        render(b);
        continue;
      }
      if (!b.awake) {
        // gentle idle drift around home
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
        b.vx *= GROUND_FRICTION;
        if (Math.abs(b.vy) < 0.8) b.vy = 0;
      }
      render(b);
    }
    requestAnimationFrame(step);
  }
  bodies.forEach(render);
  requestAnimationFrame(step);
})();
