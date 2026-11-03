// Shared motion and drawings for the Lintel site pages (Resources, article, About, Contact).
// GSAP + ScrollTrigger + SplitText + Lenis load from the CDN first. Original code and art.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ---- drawings ----------------------------------------------------------------
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.append(n);
    return n;
  };
  const rng = (seed) => { let t = seed >>> 0; return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
  let uid = 0;

  function defs(svg, R) {
    const id = `lp${++uid}`;
    const d = el("defs", {}, svg);
    const dots = (p, n, rmax, bg) => {
      el("rect", { width: 40, height: 40, fill: bg }, p);
      for (let i = 0; i < n; i++) el("circle", { cx: (R() * 40).toFixed(1), cy: (R() * 40).toFixed(1), r: (0.3 + R() * rmax).toFixed(2), fill: "#282828" }, p);
    };
    dots(el("pattern", { id: `${id}-s`, width: 40, height: 40, patternUnits: "userSpaceOnUse" }, d), 40, 0.5, "#efeee8");
    dots(el("pattern", { id: `${id}-d`, width: 40, height: 40, patternUnits: "userSpaceOnUse" }, d), 110, 0.7, "#8a8984");
    const h = el("pattern", { id: `${id}-h`, width: 7, height: 7, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, d);
    el("rect", { width: 7, height: 7, fill: "#ecebe5" }, h);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 7, stroke: "#282828", "stroke-width": 0.6, opacity: 0.6 }, h);
    const g = el("linearGradient", { id: `${id}-g`, x1: 0, y1: 0, x2: 1, y2: 1 }, d);
    el("stop", { offset: 0, "stop-color": "#f5f4ef" }, g);
    el("stop", { offset: 1, "stop-color": "#c8c7c1" }, g);
    return { s: `url(#${id}-s)`, d: `url(#${id}-d)`, h: `url(#${id}-h)`, g: `url(#${id}-g)` };
  }

  function tree(g, R, x, y, h, leafy) {
    const branch = (x0, y0, len, ang, w, depth) => {
      const x1 = x0 + Math.cos(ang) * len, y1 = y0 - Math.sin(ang) * len;
      el("path", { d: `M${x0.toFixed(1)} ${y0.toFixed(1)}Q${((x0 + x1) / 2 + (R() - 0.5) * len * 0.3).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`, stroke: "#282828", "stroke-width": Math.max(0.5, w).toFixed(2), fill: "none", "stroke-linecap": "round" }, g);
      if (depth === 0 || len < 5) {
        if (leafy) for (let i = 0; i < 4; i++) el("circle", { cx: (x1 + (R() - 0.5) * 16).toFixed(1), cy: (y1 + (R() - 0.5) * 10).toFixed(1), r: (2 + R() * 4).toFixed(1), fill: "#282828", opacity: (0.75 + R() * 0.25).toFixed(2) }, g);
        return;
      }
      const n = 2 + (R() < 0.35 ? 1 : 0);
      for (let i = 0; i < n; i++) branch(x1, y1, len * (0.62 + R() * 0.18), ang + (i - (n - 1) / 2) * (0.42 + R() * 0.3) + (R() - 0.5) * 0.25, w * 0.66, depth - 1);
    };
    branch(x, y, h * 0.36, Math.PI / 2 + (R() - 0.5) * 0.12, leafy ? 3.6 : 3, leafy ? 6 : 7);
  }

  /** Card vignette: a sun, stepped massing, a stair, hatching, sometimes a tree. Same seed, same picture. */
  function vignette(svg, seed) {
    const R = rng(seed);
    svg.setAttribute("viewBox", "0 0 400 300");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    const P = defs(svg, R);
    const g = el("g", {}, svg);
    const sx = 90 + R() * 220, sy = 70 + R() * 50, sr = 34 + R() * 26;
    el("circle", { cx: sx.toFixed(0), cy: sy.toFixed(0), r: sr.toFixed(0), fill: "#fa3600" }, g);
    const ground = 236;
    let x = 30 + R() * 30;
    const blocks = 3 + Math.floor(R() * 3);
    for (let i = 0; i < blocks; i++) {
      const w = 50 + R() * 80, h = 50 + R() * 120;
      const fill = [P.s, P.g, P.d, P.h][Math.floor(R() * 4)];
      el("rect", { x: x.toFixed(0), y: (ground - h).toFixed(0), width: w.toFixed(0), height: h.toFixed(0), fill, stroke: "#282828", "stroke-width": 1.3 }, g);
      if (fill === P.g) for (let m = x + 14; m < x + w - 4; m += 16) el("line", { x1: m.toFixed(0), y1: (ground - h).toFixed(0), x2: m.toFixed(0), y2: ground, stroke: "#282828", "stroke-width": 0.8 }, g);
      if (R() < 0.5) el("rect", { x: (x - 8).toFixed(0), y: (ground - h - 6).toFixed(0), width: (w + 16).toFixed(0), height: 6, fill: "#efeee8", stroke: "#282828", "stroke-width": 1.1 }, g);
      x += w - (R() < 0.3 ? 14 : 0);
      if (x > 360) break;
    }
    const st = 60 + R() * 220, steps = 6 + Math.floor(R() * 5);
    for (let i = 0; i < steps; i++) el("rect", { x: (st + i * 7).toFixed(0), y: (ground - (i + 1) * 5).toFixed(0), width: (steps - i) * 7 + 10, height: 5, fill: "#efeee8", stroke: "#282828", "stroke-width": 0.8 }, g);
    el("line", { x1: 0, y1: ground, x2: 400, y2: ground, stroke: "#282828", "stroke-width": 1.5 }, g);
    for (let i = 0; i < 14; i++) el("line", { x1: (i * 32).toFixed(0), y1: ground, x2: (i * 32 - 30).toFixed(0), y2: 300, stroke: "#282828", "stroke-width": 0.5, opacity: 0.35 }, g);
    if (R() < 0.7) tree(el("g", {}, g), R, 330 + R() * 40, ground, 160 + R() * 80, R() < 0.5);
    el("rect", { x: (40 + R() * 300).toFixed(0), y: (120 + R() * 80).toFixed(0), width: 10, height: 10, fill: "#fa3600", opacity: 0.5 }, g);
    return svg;
  }

  /** Elevation for Contact: glazed pavilion, stippled box, dark core, side wing, trees. */
  function elevation(svg, seed = 7) {
    const R = rng(seed);
    svg.setAttribute("viewBox", "0 0 1200 760");
    svg.setAttribute("preserveAspectRatio", "xMidYMax slice");
    const P = defs(svg, R);
    const g = el("g", { transform: "translate(0 200)" }, svg);
    const L = (x1, y1, x2, y2, w = 1.2) => el("line", { x1, y1, x2, y2, stroke: "#282828", "stroke-width": w }, g);
    const B = (x, y, w, h, fill, sw = 1.4) => el("rect", { x, y, width: w, height: h, fill, stroke: "#282828", "stroke-width": sw }, g);
    el("circle", { cx: 860, cy: 140, r: 92, fill: "#fa3600" }, g);
    B(300, 150, 520, 120, P.s); B(350, 182, 360, 52, P.g, 1.6);
    for (let x = 410; x < 710; x += 60) L(x, 182, x, 234, 1.1);
    B(330, 270, 330, 170, P.g); for (let x = 385; x < 660; x += 55) L(x, 270, x, 440);
    B(660, 270, 70, 170, P.h, 1.1);
    B(730, 110, 64, 330, P.d, 1.6); for (let y = 135; y < 420; y += 38) B(752, y, 20, 22, "#f2f1eb", 1.1);
    B(794, 190, 250, 250, P.s); B(794, 270, 250, 16, P.h, 0.9);
    for (const x of [830, 900, 970]) B(x, 210, 40, 40, P.g, 1.3);
    B(905, 320, 82, 120, P.d);
    B(240, 440, 820, 26, "#efeee8", 1.2);
    for (let i = 0; i < 5; i++) B(170 + i * 12, 440 + i * 5.2, 70 - i * 12, 5.2, "#efeee8", 0.9);
    L(40, 466, 1160, 466, 1.6);
    el("path", { d: "M560 440v-34m-6 6l6-6 6 6M552 466l8-26 8 26", stroke: "#282828", "stroke-width": 1.4, fill: "none" }, g); // a figure for scale
    tree(el("g", {}, g), R, 150, 466, 360, false);
    tree(el("g", {}, g), R, 1100, 466, 290, true);
    tree(el("g", {}, g), R, 1150, 466, 210, true);
    for (const [x, y] of [[540, 196], [395, 330], [760, 236], [940, 372]]) el("rect", { x: x - 7, y: y - 7, width: 14, height: 14, fill: "#fa3600", opacity: 0.45 }, g);
    return svg;
  }

  /** About hero: a courtyard plan, drawn on scroll. */
  function courtyard(svg) {
    svg.setAttribute("viewBox", "0 0 600 600");
    const w = (d) => el("path", { d, class: "w" }, svg);
    const t = (d) => el("path", { d, class: "t" }, svg);
    const dsh = (d) => el("path", { d, class: "d" }, svg);
    w("M100 100H260M340 100H500V260M500 340V500H340M260 500H100V340M100 260V100");
    w("M200 200H270M330 200H400V270M400 330V400H330M270 400H200V330M200 270V200");
    w("M100 300H200M400 300H500M300 100V200M300 400V500");
    t("M230 230H370V370H230Z"); t("M250 250H350V350H250Z");
    t("M120 120h50v30h-50zM430 120h50v30h-50zM120 450h50v30h-50zM430 450h50v30h-50z");
    for (const [x, y, r] of [[260, 100, 0], [500, 260, 90], [340, 500, 180], [100, 340, 270]]) {
      const g = el("g", { transform: `rotate(${r} ${x} ${y})` }, svg);
      el("path", { d: `M${x} ${y}v40`, class: "t" }, g);
      el("path", { d: `M${x} ${y + 40}A40 40 0 0 0 ${x + 40} ${y}`, class: "d" }, g);
    }
    dsh("M60 60H540M60 540H540M60 60V540M540 60V540");
    t("M60 50v-12M540 50v-12M60 44H540"); t("M550 60h12M550 540h12M556 60V540");
    el("text", { x: 300, y: 34, "text-anchor": "middle", "font-family": "Geist Mono", "font-size": 11, fill: "rgba(40,40,40,.64)" }, svg).textContent = "24 000";
    el("rect", { x: 292, y: 292, width: 16, height: 16, class: "m" }, svg);
    return svg;
  }

  /** Small line glyphs for the About cells. */
  function glyph(svg, kind) {
    svg.setAttribute("viewBox", "0 0 240 120");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "#282828");
    svg.setAttribute("stroke-width", "1.3");
    const p = (d, extra = {}) => el("path", { d, ...extra }, svg);
    if (kind === "plan") { p("M30 20h120v80H30zM90 20v50M30 60h60"); p("M90 70a30 30 0 0 1 30 30", { stroke: "#fa3600", "stroke-dasharray": "3 3" }); p("M170 40h40M170 60h30M170 80h40", { opacity: 0.5 }); }
    if (kind === "code") { p("M30 30h180M30 50h120M30 70h150M30 90h90", { opacity: 0.6 }); p("M200 82l8 8 16-18", { stroke: "#fa3600", "stroke-width": 2 }); }
    if (kind === "build") { p("M40 90l30-50 30 30 30-40 30 60 30-20"); p("M40 100h160"); p("M130 30h12v12h-12z", { stroke: "#fa3600" }); }
    if (kind === "people") { p("M60 95v-10a20 20 0 0 1 40 0v10M140 95v-10a20 20 0 0 1 40 0v10"); p("M80 50a12 12 0 1 0 0.1 0M160 50a12 12 0 1 0 0.1 0"); p("M104 80h32", { stroke: "#fa3600", "stroke-dasharray": "3 3" }); }
    if (kind === "pilot") { p("M30 90h180M60 90V40h120v50"); p("M60 40l60-20 60 20"); p("M110 90V60h20v30", { stroke: "#fa3600" }); }
    if (kind === "audit") { p("M60 20h100l20 20v70H60z"); p("M80 50h70M80 66h70M80 82h40", { opacity: 0.6 }); p("M150 86l8 8 14-16", { stroke: "#fa3600", "stroke-width": 2 }); }
    return svg;
  }

  window.LP = { vignette, elevation, courtyard, glyph };

  // ---- motion helpers --------------------------------------------------------------
  const lenis = RM ? null : new Lenis({ lerp: 0.085, smoothWheel: true });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.LP.lenis = lenis;

  function drawIn(svg, { duration = 1.2, stagger = 0.02, delay = 0 } = {}) {
    const strokes = $$("line, path, rect, polyline, polygon, circle", svg).filter((n) => {
      if (n.closest("pattern, defs")) return false;
      const st = getComputedStyle(n).stroke;
      if (!st || st === "none") return false;
      let len = 0;
      try { len = n.getTotalLength(); } catch (e) { len = 0; }
      if (!len) return false;
      n.style.strokeDasharray = `${len} ${len}`;
      n.style.strokeDashoffset = len;
      return true;
    });
    const fills = $$("text, rect, circle, path", svg).filter((n) => !n.closest("pattern, defs") && !strokes.includes(n));
    gsap.set(fills, { opacity: 0 });
    return gsap.timeline({ delay })
      // cap the spread so busy drawings (tree branches) still finish in about two seconds
      .to(strokes, { strokeDashoffset: 0, duration, stagger: { amount: Math.min(strokes.length * stagger, 1.2) }, ease: "power2.inOut" })
      .to(fills, { opacity: (i, n) => n.getAttribute("opacity") || 1, duration: 0.5, stagger: { amount: Math.min(fills.length * stagger * 0.5, 0.6) }, ease: "power1.out" }, `-=${duration * 0.7}`)
      .add(() => strokes.forEach((n) => { n.style.strokeDasharray = ""; n.style.strokeDashoffset = ""; }));
  }
  window.LP.drawIn = drawIn;

  const lines = (node, onSplit) => SplitText.create(node, { type: "lines", mask: "lines", autoSplit: true, onSplit });
  window.LP.lines = lines;

  // ---- page start: loader, then the hero --------------------------------------------
  const intro = gsap.timeline({ paused: true });
  const h1 = $("main h1");
  // SplitText waits for the web fonts, so the lines can arrive before or after the page starts.
  let started = false;
  const riseTitle = (ls) => gsap.fromTo(ls, { yPercent: 112 }, { yPercent: 0, duration: 1.15, stagger: 0.09, ease: "power4.out" });
  let h1Lines = [];
  if (h1) lines(h1, (self) => {
    const first = !h1Lines.length;
    h1Lines = self.lines;
    if (!started) gsap.set(h1Lines, { yPercent: 112 });
    else if (first && !RM) riseTitle(h1Lines); // split landed after start: play it now
  });
  const reveals = $$("[data-reveal]");
  gsap.set(reveals, { visibility: "visible", y: 26, autoAlpha: 0 });
  intro.add(() => { started = true; if (h1Lines.length) riseTitle(h1Lines); }, 0)
    .to(reveals, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07, ease: "power3.out" }, 0.3);
  window.LP.intro = intro;

  function start() {
    $(".pg-loader")?.remove();
    intro.play();
    document.dispatchEvent(new CustomEvent("lp:start"));
  }
  if (RM) { intro.progress(1); $(".pg-loader")?.remove(); requestAnimationFrame(() => document.dispatchEvent(new CustomEvent("lp:start"))); }
  else if (!$(".pg-loader")) requestAnimationFrame(start);
  else {
    const n = { v: 0 };
    gsap.timeline({ onComplete: start })
      .to(n, { v: 100, duration: 0.85, ease: "power2.inOut", onUpdate: () => { const p = $("#pl-num"); if (p) p.textContent = Math.round(n.v); } }, 0)
      .to(".pg-loader .pl-bar span", { scaleX: 1, duration: 0.85, ease: "power2.inOut" }, 0)
      .to(".pg-loader", { clipPath: "inset(0 0 100% 0)", duration: 0.65, ease: "power4.inOut" }, "+=0.08");
  }

  // ---- shared scroll entrances -----------------------------------------------------
  document.addEventListener("lp:start", () => {
    $$("main h2.split").forEach((h) => lines(h, (self) => gsap.from(self.lines, { yPercent: 112, duration: 1.05, stagger: 0.08, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 86%" } })));
    $$("[data-stagger]").forEach((box) => gsap.from(box.children, {
      y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: box, start: "top 82%", once: true },
    }));
    $$("[data-draw]").forEach((svg) => ScrollTrigger.create({ trigger: svg, start: "top 80%", once: true, onEnter: () => !RM && drawIn(svg) }));
    try { ART.fort($("#fort-svg")); ART.wordmark($(".wordmark")); } catch (e) { /* optional footer art */ }
    ScrollTrigger.create({ trigger: ".cta", start: "top 80%", once: true, onEnter: () => gsap.from(".cta-grid > *", { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: "power3.out" }) });
  }, { once: true });

  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (href.length > 1 && $(href)) { e.preventDefault(); lenis ? lenis.scrollTo(href, { offset: -80 }) : $(href).scrollIntoView(); }
  }));
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
