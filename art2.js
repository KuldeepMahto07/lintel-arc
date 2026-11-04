// More original SVG art for the study build: isometric icons, platform plans, why-stage drawings, client marks.
const ART2 = (() => {
  const NS = "http://www.w3.org/2000/svg", INK = "#282828", HOT = "#fa3600";
  const el = (tag, a = {}, p) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); if (p) p.appendChild(n); return n; };
  const svgIn = (host, vb) => { host.innerHTML = ""; return el("svg", { viewBox: vb, fill: "none", stroke: INK, "stroke-width": 1.1 }, host); };

  // isometric projection helper: (x, y, z) -> 2D
  const iso = (x, y, z) => [100 + (x - y) * .866 * 14, 120 + (x + y) * .5 * 14 - z * 14];
  const box = (s, x, y, z, w, d, h, extra = {}) => {
    const P = (a, b, c) => iso(a, b, c).map((v) => v.toFixed(1)).join(",");
    const faces = [
      [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)],
      [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)],
      [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)],
    ];
    faces.forEach((f) => el("polygon", { points: f.join(" "), ...extra }, s));
  };
  // four isometric icons for the problem cards
  const icons = [
    (s) => { box(s, 0, 0, 0, 4, 4, 1); box(s, 1, 1, 1, 2, 2, 3); box(s, 1.5, 1.5, 4, 1, 1, .6, { stroke: HOT }); },
    (s) => { box(s, 0, 0, 0, 3, 3, 3); box(s, 4, 1, 0, 2, 2, 2, { "stroke-dasharray": "3 3" }); },
    (s) => { box(s, 0, 0, 0, 5, 1, 1); box(s, 0, 2, 0, 5, 1, 2); box(s, 0, 4, 0, 5, 1, 3); el("circle", { cx: 150, cy: 60, r: 9, stroke: HOT }, s); },
    (s) => { for (let i = 0; i < 4; i++) box(s, i, i, 0, 1.4, 1.4, i + 1); },
  ];
  function problemIcon(host, i) { const s = svgIn(host, "0 0 220 200"); icons[i % 4](s); return s; }

  // platform: mini floor plan with one room that flashes orange
  function miniPlan(host) {
    const s = svgIn(host, "0 0 360 240");
    const walls = "M20 20H340V220H20Z M20 120H180 M180 20V220 M260 120H340 M260 120V220";
    el("path", { d: walls, "stroke-width": 6, stroke: "#3a3a3a" }, s);
    const hot = el("rect", { x: 26, y: 26, width: 148, height: 88, fill: HOT, stroke: "none", class: "mp-hot" }, s);
    for (const [x, y] of [[60, 160], [110, 160], [210, 60], [290, 60], [290, 170]]) el("rect", { x, y, width: 34, height: 24, rx: 2, opacity: .7 }, s);
    for (const [x, y] of [[50, 50], [90, 50], [130, 50]]) el("circle", { cx: x, cy: y, r: 9, stroke: "#fff" }, s);
    return { s, hot };
  }

  // why stage 1: building section with two violation cards
  function section(host) {
    const s = svgIn(host, "0 0 420 300");
    for (let x = 30; x <= 390; x += 60) el("line", { x1: x, y1: 10, x2: x, y2: 290, opacity: .18 }, s);
    for (let y = 30; y <= 270; y += 60) el("line", { x1: 10, y1: y, x2: 410, y2: y, opacity: .18 }, s);
    el("path", { d: "M60 240L300 240L300 120L180 120L180 180L60 180Z", "stroke-width": 2 }, s);
    el("path", { d: "M180 120L240 70L360 70L360 150L300 150", "stroke-width": 2 }, s);
    for (let i = 0; i < 6; i++) el("line", { x1: 60 + i * 20, y1: 240 - i * 10, x2: 80 + i * 20, y2: 240 - i * 10 }, s);
    el("polygon", { points: "300,150 360,150 360,240 300,240", fill: INK, opacity: .85 }, s);
    return s;
  }
  // why stage 3: two title-block sheets
  function sheets(host) {
    const s = svgIn(host, "0 0 420 320");
    const sheet = (x, y, title) => {
      const g = el("g", { class: "sheet" }, s);
      el("rect", { x, y, width: 230, height: 150, fill: "#f6f5f0" }, g);
      el("path", { d: `M${x + 30} ${y + 20}H${x + 110}V${y + 70}H${x + 170}V${y + 100}H${x + 30}Z M${x + 70} ${y + 20}V${y + 70}`, "stroke-width": 3, stroke: "#3a3a3a" }, g);
      el("line", { x1: x, y1: y + 115, x2: x + 230, y2: y + 115 }, g);
      el("line", { x1: x + 150, y1: y + 115, x2: x + 150, y2: y + 150 }, g);
      el("text", { x: x + 8, y: y + 138, fill: INK, stroke: "none", "font-family": "Schibsted Grotesk", "font-weight": 700, "font-size": 12 }, g).textContent = title;
      el("rect", { x: x + 205, y: y + 125, width: 16, height: 16, stroke: HOT }, g);
      return g;
    };
    return [sheet(20, 20, "STUDIO FLOOR PLAN"), sheet(150, 150, "COTTAGE FLOOR PLAN")];
  }
  // why stage 4: learning network over a plan
  function network(host) {
    const s = svgIn(host, "0 0 420 320");
    el("path", { d: "M60 40H300L360 100V280H60Z M60 160H200 M200 40V280 M260 160H360", "stroke-width": 4, stroke: "#9a9a96" }, s);
    const pts = [[90, 70], [170, 60], [260, 70], [330, 120], [120, 190], [230, 200], [320, 230], [150, 260], [250, 120]];
    const lines = [];
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if ((i * 7 + j * 3) % 4 === 0)
      lines.push(el("line", { x1: pts[i][0], y1: pts[i][1], x2: pts[j][0], y2: pts[j][1], stroke: HOT, "stroke-dasharray": "4 4" }, s));
    const nodes = pts.map(([x, y]) => el("rect", { x: x - 6, y: y - 6, width: 12, height: 12, fill: HOT, stroke: "none" }, s));
    return { lines, nodes };
  }
  // the CAD apps Lintel runs in: plain names with simple original marks, never product logos or invented customers
  const clients = [["RHINO 8", "M4 18L12 4L20 18Z", ""], ["REVIT", "M4 4H20V20H4Z M4 12H20", "beta"], ["ARCHICAD", "M12 3A9 9 0 1 0 12.1 3Z M12 3V21", "beta"],
    ["SKETCHUP", "M3 6H21M3 12H21M3 18H21M9 6V12M15 12V18", "beta"], ["AUTOCAD", "M4 4L12 20L20 4", "beta"], ["VECTORWORKS", "M12 2V22M5 9L12 2L19 9", "beta"]];
  function clientMarks(host) {
    host.innerHTML = clients.map(([n, d, tag]) => `<div class="cl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="${d}"/></svg><span>${n}${tag ? `<small> ${tag}</small>` : ""}</span></div>`).join("");
  }
  return { problemIcon, miniPlan, section, sheets, network, clientMarks };
})();
