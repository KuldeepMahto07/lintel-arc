// Mouse effects for the study build: trailing cursor, CAD crosshair hero, drag-to-select issues.
document.fonts.ready.then(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (!matchMedia("(pointer: fine)").matches) { $(".cur")?.remove(); return; }

  // ---- trailing cursor: dot that turns into a square over anything clickable ----------
  const cur = $(".cur");
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    const t = e.target;
    cur.classList.toggle("link", !!t.closest("a, button, .vmark, .h-mark, .uc-list li"));
    cur.classList.toggle("hide", !!t.closest("input, textarea"));
  });
  document.addEventListener("mouseleave", () => cur.classList.add("hide"));
  document.addEventListener("mouseenter", () => cur.classList.remove("hide"));
  gsap.ticker.add(() => {
    cx += (mx - cx) * .22; cy += (my - cy) * .22;
    cur.style.transform = `translate(${cx}px, ${cy}px)`;
  });

  // ---- hero: CAD crosshair, coordinates, extents, drag selection -----------------------
  const hero = $(".hero"), card = $(".hcard");
  if (!hero) return; // only the home page has the CAD hero; other pages just get the cursor
  const H = $(".cad-h"), V = $(".cad-v"), XY = $(".cad-xy"), hint = $(".cad-hint"), sel = $(".cad-sel");
  const extY = $(".cad-ext-y"), extX = $(".cad-ext-x");
  const guides = { top: $(".g-top"), bot: $(".g-bot"), left: $(".g-left"), right: $(".g-right") };
  const marks = $$(".h-mark");
  const loading = () => document.body.classList.contains("is-loading");

  // the building's bounding box (all drawn blocks, not the trees), relative to the hero
  function buildingBox() {
    const hr = hero.getBoundingClientRect();
    const rects = $$(".h-render > rect").map((r) => r.getBoundingClientRect()).filter((r) => r.width > 0);
    if (!rects.length) return null;
    return {
      l: Math.min(...rects.map((r) => r.left)) - hr.left, r: Math.max(...rects.map((r) => r.right)) - hr.left,
      t: Math.min(...rects.map((r) => r.top)) - hr.top, b: Math.max(...rects.map((r) => r.bottom)) - hr.top,
    };
  }
  const local = (e) => { const r = hero.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  let start = null, moved = false;

  hero.addEventListener("mouseleave", () => { hero.classList.remove("cad-on", "selecting"); start = null; });
  hero.addEventListener("pointermove", (e) => {
    if (loading()) return;
    hero.classList.add("cad-on");
    const p = local(e);
    H.style.transform = `translateY(${p.y}px)`; V.style.transform = `translateX(${p.x}px)`;
    XY.style.transform = `translate(${p.x + 10}px, ${p.y + 10}px)`;
    XY.innerHTML = `X:${Math.round(e.clientX)}PX<br>Y:${Math.round(e.clientY)}PX`;
    hint.style.transform = `translate(${p.x + 16}px, ${p.y - 40}px)`;
    const b = buildingBox();
    const inside = b && p.x > b.l && p.x < b.r && p.y > b.t && p.y < b.b;
    for (const el of [extX, extY, ...Object.values(guides)]) el.style.opacity = inside ? 1 : 0;
    if (b) {
      extY.style.top = b.t + "px"; extY.style.height = b.b - b.t + "px";
      extX.style.left = b.l + "px"; extX.style.width = b.r - b.l + "px";
      guides.top.style.top = b.t + "px"; guides.bot.style.top = b.b + "px";
      guides.left.style.left = b.l + "px"; guides.right.style.left = b.r + "px";
    }
    if (start) {
      moved = moved || Math.hypot(p.x - start.x, p.y - start.y) > 6;
      Object.assign(sel.style, { left: Math.min(p.x, start.x) + "px", top: Math.min(p.y, start.y) + "px", width: Math.abs(p.x - start.x) + "px", height: Math.abs(p.y - start.y) + "px" });
      marks.forEach((m) => m.classList.toggle("hit", within(m, sel)));
    }
  });
  hero.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".hcard") || loading()) return;
    e.preventDefault();
    start = local(e); moved = false;
    hero.classList.add("selecting"); cur.classList.add("drag");
    Object.assign(sel.style, { left: start.x + "px", top: start.y + "px", width: 0, height: 0 });
  });
  const endDrag = (e) => {
    if (!start) return;
    hero.classList.remove("selecting"); cur.classList.remove("drag");
    const clicked = e.target.closest && e.target.closest(".h-mark");
    const hits = moved ? marks.filter((m) => m.classList.contains("hit")) : clicked ? [clicked] : [];
    marks.forEach((m) => m.classList.remove("hit"));
    start = null;
    if (hits.length) {
      hero.classList.add("dragged"); show(hits[0]);
      hits.forEach((m) => m.classList.add("hit")); setTimeout(() => hits.forEach((m) => m.classList.remove("hit")), 600);
    }
  };
  addEventListener("pointerup", endDrag);
  addEventListener("pointercancel", endDrag);
  function within(m, box) {
    const r = m.getBoundingClientRect(), s = box.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    return x > s.left && x < s.right && y > s.top && y < s.bottom;
  }
  function show(m) {
    const hr = hero.getBoundingClientRect(), r = m.getBoundingClientRect();
    $(".hcard-code", card).textContent = `RULE ${m.dataset.code}`;
    $(".hcard-title", card).textContent = m.dataset.tip;
    card.style.left = Math.min(r.right - hr.left + 8, hr.width - 240) + "px";
    card.style.top = r.top - hr.top - 4 + "px";
    card.classList.add("on");
  }
  $(".hcard-x").addEventListener("click", () => card.classList.remove("on"));

  // ---- why cards: a field of moving dashed lines under each card ------------------------
  $$(".why-grid article").forEach((a, i) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "why-lines"); svg.setAttribute("viewBox", "0 0 200 100"); svg.setAttribute("preserveAspectRatio", "none");
    for (let k = 0; k < 7; k++) {
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const y = 10 + k * 13;
      l.setAttribute("x1", 0); l.setAttribute("y1", y + (i % 2 ? 6 : 0)); l.setAttribute("x2", 200); l.setAttribute("y2", y);
      l.style.animationDelay = `${-k * .7}s`;
      svg.appendChild(l);
    }
    a.prepend(svg);
  });
});
