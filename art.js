// Original SVG artwork for the study build: buildings, trees, plan, wordmark. Nothing here is traced.
const ART = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#282828", HOT = "#fa3600";
  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }
  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const g = (parent, attrs = {}) => el("g", attrs, parent);

  // ---- shared defs: stipple concrete, light concrete, hatch, glass -----------------------
  function defs(svg, id) {
    const d = el("defs", {}, svg);
    const r = rng(7);
    const mk = (name, size, dots, op, bg) => {
      const p = el("pattern", { id: `${id}-${name}`, width: size, height: size, patternUnits: "userSpaceOnUse" }, d);
      el("rect", { width: size, height: size, fill: bg }, p);
      for (let i = 0; i < dots; i++) el("circle", { cx: (r() * size).toFixed(1), cy: (r() * size).toFixed(1), r: (.25 + r() * .55).toFixed(2), fill: INK, opacity: op }, p);
      return `url(#${id}-${name})`;
    };
    const hatch = el("pattern", { id: `${id}-hatch`, width: 5, height: 5, patternUnits: "userSpaceOnUse", patternTransform: "rotate(35)" }, d);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 5, stroke: INK, "stroke-width": 1.1, opacity: .55 }, hatch);
    const glass = el("linearGradient", { id: `${id}-glass`, x1: 0, y1: 0, x2: 1, y2: 1 }, d);
    el("stop", { offset: 0, "stop-color": "#e9e9e3" }, glass); el("stop", { offset: .55, "stop-color": "#cfcfc8" }, glass); el("stop", { offset: 1, "stop-color": "#a9a9a2" }, glass);
    return {
      concrete: mk("conc", 40, 70, .55, "#e3e2da"),
      dark: mk("dark", 30, 140, .6, "#8e8e88"),
      light: mk("light", 50, 30, .4, "#eceae2"),
      hatch: `url(#${id}-hatch)`, glass: `url(#${id}-glass)`,
    };
  }

  // ---- procedural tree (recursive branching, drawn as thin strokes) ---------------------
  function tree(parent, x, y, h, seed, leafy = false) {
    const r = rng(seed), grp = g(parent, { class: "tree" });
    let d = "";
    (function branch(x0, y0, len, ang, w, depth) {
      const x1 = x0 + Math.cos(ang) * len, y1 = y0 - Math.sin(ang) * len;
      const mx = (x0 + x1) / 2 + (r() - .5) * len * .25, my = (y0 + y1) / 2 + (r() - .5) * len * .2;
      el("path", { d: `M${x0.toFixed(1)} ${y0.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`, stroke: INK, "stroke-width": Math.max(.35, w).toFixed(2), fill: "none", "stroke-linecap": "round" }, grp);
      if (depth === 0 || len < 3) {
        if (leafy) for (let i = 0; i < 4; i++) el("circle", { cx: (x1 + (r() - .5) * 10).toFixed(1), cy: (y1 + (r() - .5) * 8).toFixed(1), r: (1 + r() * 2.2).toFixed(1), fill: INK, opacity: (.35 + r() * .5).toFixed(2) }, grp);
        return;
      }
      const n = 2 + (r() < .45 ? 1 : 0);
      for (let i = 0; i < n; i++) branch(x1, y1, len * (.62 + r() * .2), ang + (r() - .5) * 1.25, w * .68, depth - 1);
    })(x, y, h * .32, Math.PI / 2 + (r() - .5) * .1, h * .022, 7);
    return grp;
  }

  // ---- hero: two-storey house with a cantilevered upper volume (original composition) ----
  function hero(svg) {
    svg.innerHTML = "";
    const P = defs(svg, "h");
    const wire = g(svg, { class: "h-wire", fill: "none", stroke: INK, "stroke-width": .9 });
    const render = g(svg, { class: "h-render" });
    const marks = g(svg, { class: "h-marks" });
    const ground = 400;
    // blocks: [x, y, w, h, kind]
    const B = [
      [250, 250, 520, 150, "glass"],              // ground floor glazing band
      [230, 150, 340, 100, "concrete"],           // upper volume, cantilevers left
      [570, 120, 60, 280, "dark"],                // stair core
      [630, 180, 210, 70, "concrete"],            // right wing upper
      [640, 250, 190, 150, "light"],              // right wing lower wall
      [180, 360, 600, 40, "light"],               // plinth
      [520, 250, 50, 150, "concrete"],            // column wall
    ];
    const kindFill = { glass: P.glass, concrete: P.concrete, dark: P.dark, light: P.light };
    // construction lines (wire only), extending past the building
    for (const y of [120, 150, 180, 250, 360, ground]) el("line", { x1: 120, y1: y, x2: 900, y2: y, opacity: .35, "stroke-dasharray": "2 4" }, wire);
    for (const x of [230, 250, 520, 570, 630, 840]) el("line", { x1: x, y1: 90, x2: x, y2: 425, opacity: .35, "stroke-dasharray": "2 4" }, wire);
    for (const [x, y, w, h, k] of B) {
      el("rect", { x, y, width: w, height: h }, wire);
      el("rect", { x, y, width: w, height: h, fill: kindFill[k], stroke: INK, "stroke-width": 1.4 }, render);
    }
    // mullions and floor lines on glass
    for (let x = 290; x < 520; x += 46) { el("line", { x1: x, y1: 250, x2: x, y2: 360 }, wire); el("line", { x1: x, y1: 250, x2: x, y2: 360, stroke: INK, "stroke-width": 2.2 }, render); }
    el("line", { x1: 250, y1: 268, x2: 520, y2: 268, stroke: INK, "stroke-width": 1 }, render);
    // ribbon window in upper volume
    el("rect", { x: 262, y: 178, width: 280, height: 36 }, wire);
    el("rect", { x: 262, y: 178, width: 280, height: 36, fill: P.glass, stroke: INK, "stroke-width": 2 }, render);
    for (let x = 302; x < 542; x += 40) el("line", { x1: x, y1: 178, x2: x, y2: 214, stroke: INK, "stroke-width": 1.4 }, render);
    // right wing windows
    for (const x of [660, 730, 790]) { el("rect", { x, y: 196, width: 36, height: 36 }, wire); el("rect", { x, y: 196, width: 36, height: 36, fill: P.glass, stroke: INK, "stroke-width": 1.6 }, render); }
    el("rect", { x: 680, y: 280, width: 70, height: 80, fill: P.dark, stroke: INK, "stroke-width": 1.6 }, render); // door
    // core slot windows
    for (let y = 140; y < 380; y += 34) el("rect", { x: 592, y, width: 16, height: 20, fill: "#d9d8d0", stroke: INK, "stroke-width": 1 }, render);
    // shadows (hatch), cast to the lower right
    for (const pts of ["230,250 570,250 570,272 262,272", "630,250 840,250 840,262 650,262", "520,250 570,250 570,400 545,400", "250,250 290,250 290,360 250,360"])
      el("polygon", { points: pts, fill: P.hatch, opacity: .85 }, render);
    // terrace stairs on the left
    for (let i = 0; i < 6; i++) {
      const y = 360 + i * 6.6, x = 120 + i * 10;
      el("line", { x1: x, y1: y, x2: 180, y2: y }, wire);
      el("rect", { x, y, width: 180 - x, height: 6.6, fill: P.light, stroke: INK, "stroke-width": .9 }, render);
    }
    el("line", { x1: 60, y1: ground, x2: 940, y2: ground, stroke: INK, "stroke-width": 1.6 }, render);
    el("line", { x1: 40, y1: ground, x2: 960, y2: ground }, wire);
    // trees (rendered only)
    tree(render, 140, ground, 250, 11); tree(render, 885, ground, 235, 23); tree(render, 845, ground, 150, 5);
    // violation markers (clickable in main.js)
    [[300, 300, "§1010.1.1", "Door clear width below 813 mm"], [700, 330, "§1011.5.2", "Stair risers taller than 178 mm"],
     [600, 210, "§1015.2", "Guard needed at the stair landing"], [460, 196, "§1405.1", "Glazing too close to the slab edge"]].forEach(([x, y, code, t], i) => {
      const m = g(marks, { class: "h-mark", "data-tip": t, "data-code": code, "data-x": x, "data-y": y });
      el("rect", { x: x - 6, y: y - 6, width: 12, height: 12, fill: HOT }, m);
    });
    return { wire, render, marks };
  }

  // ---- intro: slim tower with fins, orange sun, low podium -----------------------------
  function tower(svg) {
    svg.innerHTML = "";
    const P = defs(svg, "t");
    const sun = el("circle", { class: "t-sun", cx: 330, cy: 120, r: 95, fill: HOT }, svg);
    const body = g(svg, { class: "t-body" });
    el("rect", { x: 120, y: 30, width: 150, height: 470, fill: P.concrete, stroke: INK, "stroke-width": 1.4 }, body);
    for (let x = 128; x < 268; x += 9) el("rect", { x, y: 30, width: 4, height: 470, fill: P.dark }, body);
    const frame = g(svg, { class: "t-frame", fill: "none", stroke: INK, "stroke-width": 1 });
    for (let i = 0; i < 4; i++) el("rect", { x: 250 + i * 14, y: 70 + i * 22, width: 70, height: 330 - i * 30 }, frame);
    for (let y = 120; y < 400; y += 45) el("line", { x1: 250, y1: y, x2: 360, y2: y, opacity: .6 }, frame);
    el("rect", { x: 0, y: 410, width: 330, height: 90, fill: P.light, stroke: INK, "stroke-width": 1.2 }, body);
    for (let x = 20; x < 320; x += 34) el("rect", { x, y: 430, width: 22, height: 28, fill: P.glass, stroke: INK, "stroke-width": .8 }, body);
    el("polygon", { points: "0,410 330,410 330,425 0,425", fill: P.hatch }, body);
    for (let i = 0; i < 7; i++) el("rect", { x: 330 + i * 18, y: 470 + i * 4.5, width: 270 - i * 18, height: 4.5, fill: P.light, stroke: INK, "stroke-width": .7 }, body);
    tree(body, 420, 500, 230, 41, true); tree(body, 470, 500, 160, 9, true);
    el("line", { x1: 0, y1: 500, x2: 600, y2: 500, stroke: INK, "stroke-width": 1.4 }, svg);
    return { sun, frame, body };
  }

  // ---- use cases: terraced (stepped) building on a plaza with a sun ---------------------
  function slab(svg) {
    svg.innerHTML = "";
    const P = defs(svg, "s");
    const sun = el("circle", { class: "s-sun", cx: 140, cy: 110, r: 90, fill: HOT, opacity: .85 }, svg);
    const sun2 = el("circle", { cx: 120, cy: 300, r: 75, fill: "#e9e4d6" }, svg);
    const bar = el("rect", { class: "s-bar", x: 360, y: 0, width: 70, height: 230, fill: HOT, opacity: .9 }, svg);
    const body = g(svg, { class: "s-body" });
    const base = 470;
    for (let i = 0; i < 5; i++) {
      const x = 90 + i * 60, y = base - 70 - i * 55, w = 470 - i * 60;
      el("rect", { x, y, width: w, height: 70, fill: i % 2 ? P.light : P.concrete, stroke: INK, "stroke-width": 1.3 }, body);
      el("rect", { x: x + 10, y: y + 18, width: w - 20, height: 26, fill: P.glass, stroke: INK, "stroke-width": 1 }, body);
      for (let xx = x + 30; xx < x + w - 10; xx += 30) el("line", { x1: xx, y1: y + 18, x2: xx, y2: y + 44, stroke: INK, "stroke-width": 1 }, body);
      el("polygon", { points: `${x},${y + 44} ${x + w},${y + 44} ${x + w},${y + 52} ${x + 12},${y + 52}`, fill: P.hatch }, body);
    }
    // plaza grid in perspective
    for (let i = 0; i <= 12; i++) el("line", { x1: 320, y1: base, x2: -200 + i * 85, y2: 620, stroke: INK, "stroke-width": .6, opacity: .55 }, svg);
    for (const y of [base, 500, 540, 590]) el("line", { x1: 0, y1: y, x2: 640, y2: y, stroke: INK, "stroke-width": .6, opacity: .55 }, svg);
    el("line", { x1: 300, y1: base - 2, x2: 300, y2: base - 18, stroke: INK, "stroke-width": 2 }, svg); // a person for scale
    el("circle", { cx: 300, cy: base - 21, r: 2.4, fill: INK }, svg);
    return { sun, sun2, bar, body };
  }

  // ---- CTA: cube pavilion on a stem, with steps and trees ---------------------------------
  function fort(svg) {
    svg.innerHTML = "";
    const P = defs(svg, "f");
    el("circle", { class: "f-sun", cx: 470, cy: 70, r: 42, fill: HOT }, svg);
    const body = g(svg, { class: "f-body" });
    el("rect", { x: 330, y: 150, width: 40, height: 130, fill: P.dark, stroke: INK, "stroke-width": 1.2 }, body);
    el("rect", { x: 240, y: 40, width: 220, height: 120, fill: P.concrete, stroke: INK, "stroke-width": 1.4 }, body);
    el("rect", { x: 262, y: 70, width: 176, height: 40, fill: P.glass, stroke: INK, "stroke-width": 1.2 }, body);
    for (let x = 284; x < 438; x += 22) el("line", { x1: x, y1: 70, x2: x, y2: 110, stroke: INK, "stroke-width": 1 }, body);
    el("rect", { x: 240, y: 40, width: 40, height: 40, fill: HOT }, body);
    el("polygon", { points: "240,160 460,160 460,172 258,172", fill: P.hatch }, body);
    for (let i = 0; i < 8; i++) el("rect", { x: 290 - i * 12, y: 280 - (8 - i) * 0, width: 120 + i * 24, height: 4, fill: P.light, stroke: INK, "stroke-width": .6, transform: `translate(0 ${i * 4})` }, body);
    tree(body, 150, 312, 140, 3, true); tree(body, 560, 312, 150, 19, true); tree(body, 610, 312, 100, 31, true);
    el("line", { x1: 40, y1: 312, x2: 660, y2: 312, stroke: INK, "stroke-width": 1.2 }, svg);
    for (let i = 0; i < 10; i++) el("line", { x1: 350, y1: 312, x2: i * 78 - 20, y2: 330, stroke: INK, "stroke-width": .5, opacity: .5 }, svg);
  }

  // ---- floor plan, built in phases for the pinned sequence ---------------------------------
  function plan(svg) {
    svg.innerHTML = "";
    const phases = [0, 1, 2, 3, 4, 5].map((i) => g(svg, { class: `ph ph${i}` }));
    const W = [ // walls: x1,y1,x2,y2 (gaps are door/window openings)
      [250, 120, 380, 120], [430, 120, 560, 120], [610, 120, 700, 120], [700, 120, 700, 420], [250, 120, 250, 330], [250, 380, 250, 600],
      [250, 600, 420, 600], [470, 600, 700, 600], [700, 470, 700, 600], [250, 300, 420, 300], [470, 300, 560, 300], [560, 120, 560, 230], [560, 280, 560, 520],
      [250, 450, 330, 450], [330, 450, 330, 520], [600, 300, 700, 300],
    ];
    // phase 0: dashed set-out lines; phase 1: walls
    for (const [x1, y1, x2, y2] of W) {
      el("line", { x1, y1, x2, y2, class: "plan-thin", "stroke-dasharray": "6 6" }, phases[0]);
      el("line", { x1, y1, x2, y2, class: "plan-wall" }, phases[1]);
    }
    // phase 2: doors (swing arcs), windows, stair
    const doors = [[380, 120, 50, 1], [420, 300, 50, -1], [560, 230, 50, 1], [420, 600, 50, -1], [250, 330, 50, 1], [700, 420, 50, 1]];
    for (const [x, y, w, dir] of doors) {
      const horiz = y === 120 || y === 300 || y === 600;
      if (horiz) { el("line", { x1: x, y1: y, x2: x, y2: y + dir * w, class: "plan-thin" }, phases[2]); el("path", { d: `M${x + w} ${y}A${w} ${w} 0 0 ${dir > 0 ? 1 : 0} ${x} ${y + dir * w}`, class: "plan-thin", "stroke-dasharray": "3 3" }, phases[2]); }
      else { el("line", { x1: x, y1: y, x2: x + dir * w, y2: y, class: "plan-thin" }, phases[2]); el("path", { d: `M${x} ${y + w}A${w} ${w} 0 0 0 ${x + dir * w} ${y}`, class: "plan-thin", "stroke-dasharray": "3 3" }, phases[2]); }
    }
    for (const [x1, y1, x2, y2] of [[610, 117, 700, 117], [610, 123, 700, 123], [703, 140, 703, 280], [697, 140, 697, 280]]) el("line", { x1, y1, x2, y2, class: "plan-thin" }, phases[2]);
    for (let i = 0; i < 9; i++) el("line", { x1: 600, y1: 320 + i * 14, x2: 690, y2: 320 + i * 14, class: "plan-thin" }, phases[2]);
    el("path", { d: "M645 440V330l-8 10M645 330l8 10", class: "plan-thin" }, phases[2]);
    // phase 3: furniture
    const F = [[280, 150, 80, 40], [280, 210, 80, 40], [450, 150, 80, 110], [590, 150, 90, 50], [280, 340, 60, 90], [380, 340, 150, 60], [380, 420, 150, 60], [270, 470, 40, 40], [360, 520, 160, 50], [590, 480, 90, 90]];
    for (const [x, y, w, h] of F) el("rect", { x, y, width: w, height: h, class: "plan-furn", rx: 2 }, phases[3]);
    for (const [cx, cy] of [[470, 205], [510, 205], [470, 235], [510, 235], [300, 365], [300, 405]]) el("circle", { cx, cy, r: 8, class: "plan-furn" }, phases[3]);
    // phase 4: dimension strings
    const dim = (x1, y1, x2, y2, txt, vertical) => {
      el("line", { x1, y1, x2, y2, class: "plan-dim" }, phases[4]);
      for (const [x, y] of [[x1, y1], [x2, y2]]) el("line", vertical ? { x1: x - 5, y1: y, x2: x + 5, y2: y, class: "plan-dim" } : { x1: x, y1: y - 5, x2: x, y2: y + 5, class: "plan-dim" }, phases[4]);
      const t = el("text", { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 4, class: "plan-dimtxt", "text-anchor": "middle" }, phases[4]);
      if (vertical) t.setAttribute("transform", `rotate(-90 ${(x1 + x2) / 2 - 4} ${(y1 + y2) / 2})`);
      t.textContent = txt;
    };
    dim(250, 80, 380, 80, "3 900"); dim(380, 80, 560, 80, "5 400"); dim(560, 80, 700, 80, "4 200"); dim(250, 640, 700, 640, "13 500");
    dim(210, 120, 210, 300, "5 400", true); dim(210, 300, 210, 600, "9 000", true); dim(740, 120, 740, 600, "14 400", true);
    // phase 5: travel path + violation markers
    el("path", { d: "M650 160L585 255L445 330L455 420L445 600", class: "plan-red" }, phases[5]);
    const V = [
      { x: 405, y: 300, n: "01", code: "§1010.1.1 · DOOR CLEAR WIDTH", title: "Door below minimum", body: "Meeting room door is 760 mm. Your rule asks for at least 813 mm. Lintel can widen the leaf and shift the jamb.", fix: true },
      { x: 560, y: 255, n: "02", code: "T.1017.2 · TRAVEL DISTANCE", title: "Long way out", body: "From the far corner of the studio the walk to an exit is about 64 m against a 61 m limit. Add an exit or move the door; this one is your call.", fix: false },
      { x: 645, y: 385, n: "03", code: "§1011.5.2 · STAIR RISER", title: "Risers too tall", body: "18 risers at 190 mm. Splitting the rise into 20 gives 171 mm each, inside your 178 mm maximum.", fix: true },
    ];
    const marks = V.map((v) => {
      const m = g(phases[5], { class: "vmark", tabindex: 0, role: "button", "aria-label": v.title });
      el("rect", { x: v.x - 13, y: v.y - 13, width: 26, height: 26 }, m);
      el("text", { x: v.x, y: v.y + 3.5, "text-anchor": "middle" }, m).textContent = v.n;
      m.__v = v;
      return m;
    });
    return { phases, marks };
  }

  // ---- wordmark: LINTEL drawn with construction geometry ---------------------------------
  function wordmark(svg) {
    svg.innerHTML = "";
    const guides = g(svg, { class: "wm-guide" }), letters = g(svg, { class: "wm-letter" }), dots = g(svg, {});
    const top = 30, bot = 200, w = 150, gap = 40;
    for (const y of [top, (top + bot) / 2, bot]) el("line", { x1: 0, y1: y, x2: 1200, y2: y }, guides);
    const L = [
      [[0, 0], [0, 1], [.8, 1]],                                            // L
      [[.35, 0], [.35, 1]],                                                   // I
      [[0, 1], [0, 0], [1, 1], [1, 0]],                                       // N
      [[0, 0], [1, 0], null, [.5, 0], [.5, 1]],                               // T
      [[1, 0], [0, 0], [0, 1], [1, 1], null, [0, .5], [.75, .5]],             // E
      [[0, 0], [0, 1], [.8, 1]],                                              // L
    ];
    let x0 = 30;
    L.forEach((pts, i) => {
      const lw = i === 1 ? w * .7 : w;
      let d = "", pen = false;
      for (const p of pts) {
        if (!p) { pen = false; continue; }
        const x = x0 + p[0] * lw, y = top + p[1] * (bot - top);
        d += (pen ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); pen = true;
        el("circle", { cx: x, cy: y, r: 3.2, class: "wm-dot" }, dots);
        el("line", { x1: x, y1: 0, x2: x, y2: 230 }, guides);
      }
      el("path", { d }, letters);
      el("circle", { cx: x0 + lw / 2, cy: (top + bot) / 2, r: (bot - top) / 2.3 }, guides);
      x0 += lw + gap;
    });
    return { guides, letters, dots };
  }

  return { hero, tower, slab, fort, plan, wordmark };
})();
