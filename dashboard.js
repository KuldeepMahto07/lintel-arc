// Lintel Dashboard page: load sequence, pinned feature roll, section entrances, live mockup.
// GSAP + ScrollTrigger + SplitText + Lenis, all loaded from the CDN before this file.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ---- smooth scroll ----------------------------------------------------
  const lenis = RM ? null : new Lenis({ lerp: 0.085, smoothWheel: true });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target, offset = -80) => {
    if (lenis) return lenis.scrollTo(target, { offset });
    const top = typeof target === "number" ? target : $(target).getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + offset });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (href.length > 1 && $(href)) { e.preventDefault(); scrollTo(href); }
  }));

  try { ART.fort($("#fort-svg")); ART.wordmark($(".wordmark")); } catch (e) { /* footer art is optional */ }

  // ---- helpers ------------------------------------------------------------
  const lines = (el, onSplit) => SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true, onSplit });

  /** Draw an SVG like a pen: strokes trace in, then fills and labels fade up. */
  function drawIn(svg, { duration = 0.9, stagger = 0.015, delay = 0 } = {}) {
    const strokes = $$("line, path, rect, polyline, polygon, circle", svg).filter((n) => {
      const st = getComputedStyle(n).stroke;
      if (!st || st === "none") return false;
      let len = 0;
      try { len = n.getTotalLength(); } catch (e) { len = 0; }
      if (!len) return false;
      n.style.strokeDasharray = `${len} ${len}`;
      n.style.strokeDashoffset = len;
      return true;
    });
    const fills = $$("text", svg).concat($$("[fill]", svg).filter((n) => n.tagName !== "text" && n.getAttribute("fill") !== "none" && !strokes.includes(n)));
    gsap.set(fills, { opacity: 0 });
    return gsap.timeline({ delay })
      .to(strokes, { strokeDashoffset: 0, duration, stagger, ease: "power2.inOut" })
      .to(fills, { opacity: 1, duration: 0.4, stagger: stagger * 0.6, ease: "power1.out" }, `-=${duration * 0.6}`)
      .add(() => strokes.forEach((n) => { n.style.strokeDasharray = ""; n.style.strokeDashoffset = ""; }));
  }

  /** Mono label that scrambles into its text. */
  function scramble(el, { duration = 0.8 } = {}) {
    const final = el.textContent;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789[]/";
    const o = { p: 0 };
    return gsap.to(o, {
      p: 1, duration, ease: "none",
      onStart: () => { el.style.visibility = "visible"; },
      onUpdate: () => {
        const n = Math.floor(o.p * final.length);
        el.textContent = final.slice(0, n) + final.slice(n).replace(/\S/g, () => chars[(Math.random() * chars.length) | 0]);
      },
      onComplete: () => { el.textContent = final; },
    });
  }

  function countUp(el, to, { duration = 1.2, delay = 0 } = {}) {
    const o = { v: 0 };
    const keep = el.querySelector("small");
    return gsap.to(o, {
      v: to, duration, delay, ease: "power2.out",
      onUpdate: () => { el.firstChild.nodeValue = String(Math.round(o.v)); if (keep) el.append(keep); },
    });
  }

  // ---- preloader, then the hero ------------------------------------------
  const heroLines = [];
  const subLines = [];
  lines($(".hp-content h1"), (self) => { heroLines.splice(0, heroLines.length, ...self.lines); });
  lines($(".hp-sub"), (self) => { subLines.splice(0, subLines.length, ...self.lines); });
  const kpiVals = $$(".kpi .k-val").map((v) => Number(v.firstChild.nodeValue));

  gsap.set([".hp-content > *", ".dash-stage", ".cad-badge"], { visibility: "visible" });
  gsap.set(".hp-content .lbl", { visibility: "hidden" });
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set(subLines, { yPercent: 100, opacity: 0 });
  gsap.set(".hp-actions > *", { y: 24, autoAlpha: 0 });
  gsap.set(".dash", { clipPath: "inset(0 0 100% 0)" });
  gsap.set(".dash-feed li", { x: -14, autoAlpha: 0 });
  gsap.set(".dash-queue", { x: 70, autoAlpha: 0 });
  gsap.set(".cad-badge", { autoAlpha: 0, y: -8 });
  $$(".kpi .k-val").forEach((v) => { v.firstChild.nodeValue = "0"; });

  const hero = gsap.timeline({ paused: true })
    .add(scramble($(".hp-content .lbl"), { duration: 0.7 }), 0)
    .to(heroLines, { yPercent: 0, duration: 1.15, stagger: 0.09, ease: "power4.out" }, 0.1)
    .to(subLines, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: "power3.out" }, 0.45)
    .to(".hp-actions > *", { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" }, 0.7)
    .add(drawIn($(".hp-cad-art"), { duration: 1.4, stagger: 0.04 }), 0.15)
    .to(".cad-badge", { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.4)
    .to(".dash", { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power3.inOut" }, 0.35)
    .add(() => $$(".kpi .k-val").forEach((v, i) => countUp(v, kpiVals[i], { duration: 1.1, delay: i * 0.08 })), 0.9)
    .to(".dash-feed li", { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.09, ease: "power3.out" }, 1.0)
    .to(".dash-queue", { x: 0, autoAlpha: 1, duration: 0.9, ease: "back.out(1.4)" }, 1.15);

  if (RM) {
    hero.progress(1);
    $$(".kpi .k-val").forEach((v, i) => { v.firstChild.nodeValue = String(kpiVals[i]); });
    $(".dash-loader")?.remove();
  } else {
    const n = { v: 0 };
    gsap.timeline({ onComplete: () => { $(".dash-loader")?.remove(); hero.play(); } })
      .to(n, { v: 100, duration: 1.1, ease: "power2.inOut", onUpdate: () => { $("#dl-num").textContent = Math.round(n.v); } }, 0)
      .to(".dash-loader .dl-bar span", { scaleX: 1, duration: 1.1, stagger: 0.12, ease: "power2.inOut" }, 0)
      .to(".dash-loader", { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power4.inOut" }, "+=0.1");
  }

  // ---- hosts marquee -------------------------------------------------------
  const run = $(".hosts-run");
  if (run) {
    run.append(...[...run.children].map((c) => c.cloneNode(true))); // two copies, so the loop is seamless
    if (!RM) {
      const loop = gsap.to(run, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
      run.addEventListener("mouseenter", () => gsap.to(loop, { timeScale: 0.2, duration: 0.5 }));
      run.addEventListener("mouseleave", () => gsap.to(loop, { timeScale: 1, duration: 0.5 }));
    }
  }

  // ---- section headings: lines rise from behind a mask ---------------------
  $$("section:not(.hero-product) h2.split").forEach((h) => lines(h, (self) => gsap.from(self.lines, {
    yPercent: 110, duration: 1.05, stagger: 0.08, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 85%" },
  })));
  const onStage = (trigger, build, start = "top 72%") => ScrollTrigger.create({ trigger, start, once: true, onEnter: () => build() });
  onStage(".pf-head", () => gsap.from([".pf-head .lbl", ".pf-head p"], { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }));

  // ---- pinned features: scrolling moves through the five tabs -----------------
  const M = 'font-family="Geist Mono" stroke="none"';
  const ART_TABS = [
    `${[[30, 30, "CLINIC GF", "9 ISSUES", 1], [170, 30, "RESIDENCE 04", "0 ISSUES", 0], [310, 30, "STUDIO FIT-OUT", "2 ISSUES", 1]].map(([x, y, n, i, hot]) => `
      <rect x="${x}" y="${y}" width="120" height="150" fill="#fff" stroke="#282828"/>
      <rect x="${x + 10}" y="${y + 12}" width="100" height="66" fill="#eae9e2" stroke="none"/>
      <path d="M${x + 22} ${y + 26}h40v18h30v24h-70z" stroke="#3a3a3a" stroke-width="2.2"/>
      ${hot ? `<rect x="${x + 50}" y="${y + 40}" width="8" height="8" fill="#fa3600" stroke="none"/>` : ""}
      <line x1="${x}" y1="${y + 92}" x2="${x + 120}" y2="${y + 92}"/>
      <text x="${x + 10}" y="${y + 110}" ${M} font-size="9.5" font-weight="700" fill="#282828">${n}</text>
      <text x="${x + 10}" y="${y + 130}" ${M} font-size="9" fill="${hot ? "#fa3600" : "#70706c"}">${i}</text>`).join("")}
      <text x="30" y="222" ${M} font-size="10" fill="#70706c">SORT: LAST SYNCED · FILTER: HAS ISSUES</text>
      <line x1="30" y1="238" x2="430" y2="238" stroke-dasharray="3 3" opacity=".4"/>`,
    `<rect x="40" y="36" width="380" height="224" fill="#fff" stroke="#282828" stroke-width="1.5"/>
      <rect x="40" y="36" width="380" height="32" fill="#fa3600" stroke="none"/>
      <text x="54" y="57" ${M} font-size="10.5" fill="#fff">WIDEN EXAM 1 DOOR · RULE FIX · 9:14</text>
      <text x="54" y="96" ${M} font-size="9" fill="#70706c">ELEMENT</text><text x="170" y="96" ${M} font-size="9" fill="#70706c">BEFORE</text><text x="270" y="96" ${M} font-size="9" fill="#70706c">AFTER</text>
      <line x1="54" y1="106" x2="406" y2="106" stroke="#d6d5cf"/>
      <text x="54" y="128" ${M} font-size="10.5" fill="#282828">EXAM 1 DOOR</text>
      <text x="170" y="128" ${M} font-size="10.5" fill="#a5a4a0" text-decoration="line-through">760 MM</text>
      <text x="270" y="128" ${M} font-size="10.5" font-weight="700" fill="#282828">813 MM</text>
      <text x="54" y="164" ${M} font-size="9" fill="#70706c">REASON: BELOW FIRM MINIMUM · REF §1010.1.1</text>
      <rect x="54" y="196" width="96" height="30" fill="#fa3600" stroke="none"/><text x="70" y="215" ${M} font-size="10" fill="#fff">APPROVE →</text>
      <rect x="160" y="196" width="80" height="30" fill="none" stroke="#fa3600"/><text x="178" y="215" ${M} font-size="10" fill="#fa3600">REJECT</text>`,
    `<rect x="40" y="36" width="380" height="228" fill="#fff" stroke="#282828"/>
      ${["WHEN", "WHO", "ACTION"].map((h, i) => `<text x="${56 + i * 110}" y="60" ${M} font-size="9" fill="#70706c">${h}</text>`).join("")}
      <line x1="40" y1="72" x2="420" y2="72" stroke="#282828"/>
      ${[["09:16", "SAMPLE HOST", "CHANGESET.APPLIED"], ["09:15", "PRIYA SEN", "CHANGESET.APPROVED"], ["09:14", "OMAR AZIZ", "CHANGESET.PROPOSED"], ["09:02", "RHINO 8", "MODEL.SNAPSHOT"], ["08:31", "THE ASSISTANT", "RULE.PROPOSED"]].map((r, i) => `
        <text x="56" y="${98 + i * 34}" ${M} font-size="9.5" fill="#282828">${r[0]}</text>
        <text x="166" y="${98 + i * 34}" ${M} font-size="9.5" fill="#282828">${r[1]}</text>
        <text x="276" y="${98 + i * 34}" ${M} font-size="9.5" fill="${i < 2 ? "#fa3600" : "#70706c"}">${r[2]}</text>
        <line x1="40" y1="${110 + i * 34}" x2="420" y2="${110 + i * 34}" stroke="#e2e1db"/>`).join("")}`,
    `${[["OWNER", "BILLING · DELETE FIRM"], ["ADMIN", "MEMBERS · RULES · TOKENS"], ["APPROVER", "APPROVE · REJECT · REVERT"], ["MEMBER", "PROPOSE · CHAT · COMMENT"], ["VIEWER", "READ ONLY"]].map((r, i) => `
        <rect x="${40 + i * 18}" y="${40 + i * 44}" width="${380 - i * 36}" height="36" fill="${i === 2 ? "#282828" : "#fff"}" stroke="#282828"/>
        <text x="${54 + i * 18}" y="${62 + i * 44}" ${M} font-size="10" font-weight="700" fill="${i === 2 ? "#fff" : "#282828"}">${r[0]}</text>
        <text x="${150 + i * 18}" y="${62 + i * 44}" ${M} font-size="9" fill="${i === 2 ? "#fa3600" : "#70706c"}">${r[1]}</text>`).join("")}`,
    `<rect x="40" y="40" width="380" height="220" fill="#fff" stroke="#282828"/>
      ${["NAME", "CHECK", "STATUS"].map((h, i) => `<text x="${56 + [0, 150, 290][i]}" y="64" ${M} font-size="9" fill="#70706c">${h}</text>`).join("")}
      <line x1="40" y1="76" x2="420" y2="76" stroke="#282828"/>
      ${[["DOOR CLEAR WIDTH", "≥ 813 MM", "ACTIVE"], ["STAIR RISER", "≤ 178 MM", "ACTIVE"], ["EXAM ROOM AREA", "≥ 11 M²", "ACTIVE"], ["DOOR WIDTH (LEARNED)", "≥ 900 MM", "PROPOSED"]].map((r, i) => `
        <text x="56" y="${104 + i * 40}" ${M} font-size="9.5" fill="#282828">${r[0]}</text>
        <text x="206" y="${104 + i * 40}" ${M} font-size="9.5" fill="#282828">${r[1]}</text>
        <rect x="342" y="${92 + i * 40}" width="${r[2] === "ACTIVE" ? 52 : 66}" height="18" fill="${r[2] === "PROPOSED" ? "#fa3600" : "none"}" stroke="${r[2] === "PROPOSED" ? "#fa3600" : "#282828"}"/>
        <text x="348" y="${105 + i * 40}" ${M} font-size="8.5" fill="${r[2] === "PROPOSED" ? "#fff" : "#282828"}">${r[2]}</text>
        <line x1="40" y1="${118 + i * 40}" x2="420" y2="${118 + i * 40}" stroke="#e2e1db"/>`).join("")}`,
  ];

  const track = $("#df-track");
  const tabs = $$(".feat-tab-btn");
  const N = tabs.length;
  const svg = $("#feat-svg");
  const slider = $(".df-slider");
  const copy = $("#df-copy");
  let current = -1;
  track.style.height = `calc(${N} * 85vh + 100vh)`;

  function moveSlider(i, instant) {
    const btn = tabs[i];
    gsap.to(slider, { x: btn.offsetLeft, width: btn.offsetWidth, duration: instant ? 0 : 0.6, ease: "power3.inOut" });
  }

  function setTab(i, instant = false) {
    if (i === current) return;
    const dir = i > current ? 1 : -1;
    current = i;
    const still = instant || RM;
    tabs.forEach((t, n) => { t.classList.toggle("active", n === i); t.setAttribute("aria-selected", String(n === i)); });
    moveSlider(i, still);
    gsap.to(copy, { yPercent: -100 * i, duration: still ? 0 : 0.9, ease: "power4.inOut" });
    if (!still) {
      gsap.fromTo(copy.children[i].children, { y: 30 * dir, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: "power3.out", delay: 0.25 });
      gsap.timeline()
        .fromTo("#df-scan", { scaleX: 0, transformOrigin: dir > 0 ? "left center" : "right center" }, { scaleX: 1, duration: 0.45, ease: "power2.in" })
        .set("#df-scan", { transformOrigin: dir > 0 ? "right center" : "left center" })
        .to("#df-scan", { scaleX: 0, duration: 0.45, ease: "power2.out" });
    }
    const label = `[0${i + 1}]`;
    const idx = $("#df-index");
    if (still) idx.textContent = label;
    else gsap.timeline()
      .to(idx, { yPercent: -110 * dir, duration: 0.25, ease: "power2.in" })
      .add(() => { idx.textContent = label; gsap.set(idx, { yPercent: 110 * dir }); })
      .to(idx, { yPercent: 0, duration: 0.35, ease: "power3.out" });
    const ghost = $("#df-ghost");
    if (still) ghost.textContent = `0${i + 1}`;
    else gsap.to(ghost, {
      autoAlpha: 0, y: 24 * dir, duration: 0.25,
      onComplete: () => { ghost.textContent = `0${i + 1}`; gsap.fromTo(ghost, { y: -24 * dir, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }); },
    });
    svg.innerHTML = ART_TABS[i];
    if (!RM) drawIn(svg, { duration: 0.9, stagger: 0.012, delay: instant ? 0 : 0.15 });
  }

  setTab(0, true);
  ScrollTrigger.create({
    trigger: track, start: "top top+=80", end: "bottom bottom",
    onUpdate: (self) => {
      gsap.set("#df-progress", { scaleX: self.progress });
      setTab(Math.min(N - 1, Math.floor(self.progress * N * 0.9999)));
    },
  });
  addEventListener("resize", () => moveSlider(current, true));
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    const top = track.getBoundingClientRect().top + scrollY - 80;
    const span = track.offsetHeight - innerHeight;
    scrollTo(top + span * ((i + 0.5) / N), 0);
  }));
  onStage(track, () => gsap.from(tabs, { y: -16, autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" }), "top 80%");

  // ---- steps ---------------------------------------------------------------
  onStage(".steps-grid", () => {
    const tl = gsap.timeline();
    tl.from(".steps-head p", { y: 20, autoAlpha: 0, duration: 0.7, ease: "power3.out" }, 0)
      .from(".step-card", { y: 60, autoAlpha: 0, duration: 0.9, stagger: 0.14, ease: "power4.out" }, 0.05);
    $$(".step-card .step-visual-slot svg").forEach((s, i) => tl.add(drawIn(s, { duration: 1, stagger: 0.03 }), 0.3 + i * 0.14));
  });

  // ---- FAQ: entrance, and answers that open by measuring their height -------
  onStage(".faq-list", () => gsap.from(".faq-item", { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }));
  onStage(".faq-title-col", () => gsap.from(".faq-title-col .lbl, .faq-title-col p", { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }));
  const faqItems = $$(".faq-item");
  const setFaq = (item, open) => {
    const ans = item.querySelector(".faq-answer");
    item.classList.toggle("open", open);
    item.querySelector(".faq-btn").setAttribute("aria-expanded", String(open));
    gsap.fromTo(ans, { height: ans.offsetHeight }, {
      height: open ? ans.scrollHeight : 0, duration: RM ? 0 : 0.55, ease: "power3.inOut",
      onComplete: () => { if (open) ans.style.height = "auto"; },
    });
    if (open && !RM) gsap.fromTo(ans.firstElementChild, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.1, ease: "power2.out" });
  };
  faqItems.forEach((item) => {
    item.querySelector(".faq-answer").style.height = item.classList.contains("open") ? "auto" : "0px";
    item.querySelector(".faq-btn").addEventListener("click", () => {
      const willOpen = !item.classList.contains("open");
      faqItems.forEach((o) => { if (o !== item && o.classList.contains("open")) setFaq(o, false); });
      setFaq(item, willOpen);
    });
  });

  // ---- CTA, footer and a little scroll depth in the hero ------------------------
  onStage(".cta-grid", () => gsap.timeline()
    .from(".cta-art svg", { y: 40, autoAlpha: 0, duration: 1, ease: "power3.out" }, 0)
    .from(".cta-grid > *:not(.cta-h)", { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: "power3.out" }, 0.15)
    .from(".foot-base span", { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }, 0.5), "top 80%");
  lines($(".cta-h"), (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: 0.08, ease: "power4.out", scrollTrigger: { trigger: ".cta", start: "top 75%" } }));
  if (!RM) {
    gsap.to(".hp-cad-art", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero-product", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".dash-stage", { y: -40, ease: "none", scrollTrigger: { trigger: ".hero-product", start: "top top", end: "bottom top", scrub: true } });
  }

  // ---- the live mockup: approve from the queue, watch the counts move ---------
  const kpi = (id, delta) => {
    const el = $(`#${id}`), v = el.querySelector(".k-val"), small = v.querySelector("small");
    v.firstChild.nodeValue = String(Number(v.firstChild.nodeValue) + delta);
    if (small) v.append(small);
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
  };
  const feed = $("#dash-feed");
  const addFeed = (title, tag, detail) => {
    const li = document.createElement("li");
    li.innerHTML = '<span class="ico"><svg viewBox="0 0 20 20"><path d="M4 10l4 4 8-8"/></svg></span><div><div class="t"></div><div class="s"><span class="d-tag ok"></span><span></span></div></div><span class="when">NOW</span>';
    li.querySelector(".t").textContent = title;
    li.querySelector(".d-tag").textContent = tag;
    li.querySelector(".s span:last-child").textContent = detail;
    feed.prepend(li);
    gsap.fromTo(li, { autoAlpha: 0, y: -8, backgroundColor: "rgba(250,54,0,.12)" }, { autoAlpha: 1, y: 0, backgroundColor: "rgba(250,54,0,0)", duration: 0.8, ease: "power3.out" });
    while (feed.children.length > 4) feed.lastElementChild.remove();
  };
  let waiting = $$(".dash-queue .q-item").length;
  $$(".dash-queue .q-item").forEach((item) => {
    const btn = item.querySelector("button"), who = item.querySelector(".q-who"), meter = item.querySelector(".q-meter span");
    const title = item.querySelector(".q-title").textContent;
    btn.addEventListener("click", () => {
      if (item.classList.contains("done")) return;
      const got = Number(who.textContent.split(" OF ")[0]);
      if (got + 1 < 2) {
        who.textContent = "1 OF 2";
        gsap.to(meter, { width: "50%", duration: 0.5, ease: "power3.out" });
        addFeed("Approval recorded", "SIGN-OFF", `${title.toUpperCase()} · 1 OF 2`);
        return;
      }
      who.textContent = "2 OF 2";
      gsap.to(meter, { width: "100%", duration: 0.5, ease: "power3.out" });
      btn.textContent = "APPLIED ✓";
      item.classList.add("done");
      gsap.fromTo(item, { backgroundColor: "rgba(250,54,0,.12)" }, { backgroundColor: "rgba(250,54,0,0)", duration: 0.9 });
      waiting -= 1;
      $("#q-count").textContent = String(waiting);
      kpi("kpi-waiting", -1);
      kpi("kpi-applied", 1);
      if (/door/i.test(title)) kpi("kpi-issues", -1);
      addFeed(title, "APPLIED", item.querySelector(".q-diff").textContent);
      $(".dash-hello span").textContent = waiting ? `${waiting} CHANGE${waiting === 1 ? "" : "S"} NEED AN APPROVER` : "EVERYTHING IS SIGNED OFF";
    });
  });

  // fonts change line breaks: re-measure once they are in
  document.fonts?.ready.then(() => { ScrollTrigger.refresh(); moveSlider(current, true); });
})();
