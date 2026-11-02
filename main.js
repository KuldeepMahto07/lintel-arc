// Motion for the study build (GSAP + ScrollTrigger + SplitText + Lenis). Original code.
// Starts after web fonts load so SplitText lines and ScrollTrigger positions are measured with the real fonts.
document.fonts.ready.then(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const GHOST = "#b4b4b0", INK = "#282828";

  // ---- artwork -------------------------------------------------------------
  const hero = ART.hero($("#hero-svg"));
  const tower = ART.tower($("#tower-svg"));
  const slab = ART.slab($("#slab-svg"));
  ART.fort($("#fort-svg"));
  const plan = ART.plan($("#plan-svg"));
  const word = ART.wordmark($(".wordmark"));
  const icons = $$(".pg-ico").map((h, i) => ART2.problemIcon(h, i));
  const mini = ART2.miniPlan($("#mini-plan"));
  const into = (id) => { const host = document.createElement("div"); host.className = "sa"; $(id).prepend(host); return host; };
  ART2.section(into("#st-section"));
  const sheets = ART2.sheets(into("#st-sheets"));
  const net = ART2.network(into("#st-network"));
  ART2.clientMarks($("#clients"));

  // ---- smooth scroll ---------------------------------------------------------
  const lenis = new Lenis({ lerp: .085, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href").length > 1) { e.preventDefault(); lenis.scrollTo(a.getAttribute("href"), { offset: -80 }); }
  });
  const strokeIn = (els) => els.forEach((p) => {
    const len = p.getTotalLength ? Math.ceil(p.getTotalLength()) : 400;
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
  });
  // Line splits re-run on resize and font load (autoSplit); animations live in onSplit (gsap-plugins skill).
  const splitLines = (target, onSplit) => SplitText.create(target, { type: "lines", mask: "lines", autoSplit: true, onSplit });


  // ---- CSS keyframe entrances (reveal / slide / slide-x / fade / rotate), staggered per item ----------
  const kf = [[".problem-grid", "article", "slide"], [".pl-list", "li", "slide-x"], [".uc-list ul", "li", "fade"],
    [".why-cols", ".stage-cap", "reveal"], [".cta-grid", ":scope > *", "fade"], [".clients-row, .cl-track", ".cl", "slide"]];
  kf.forEach(([group, item, kind]) => $$(group).forEach((g) => {
    $$(item, g).forEach((el, i) => { el.classList.add("kf", "kf-" + kind); el.style.setProperty("--i", i); });
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { g.classList.add("in"); o.disconnect(); } }), { rootMargin: "0px 0px -12% 0px" }).observe(g);
  }));
  $$(".hdr-nav > a, .hdr-nav > .dd").forEach((el, i) => { el.classList.add("kf", "kf-slide"); el.style.setProperty("--i", i); });
  $$(".cross").forEach((el) => el.classList.add("kf-rotate"));

  // ---- preloader: wireframe builds from the left on a still scan line, then the line splits ----
  let heroLines = [], introDone = false;
  splitLines(".hero-row h1", (self) => { heroLines = self.lines; if (!introDone) gsap.set(heroLines, { yPercent: 110 }); });
  const wireEls = $$("rect, line", hero.wire).sort((a, b) => a.getBBox().x - b.getBBox().x);
  strokeIn(wireEls);
  // render layer is revealed through a band that opens out from the scan line
  const svg = $("#hero-svg");
  const clip = document.createElementNS(NS, "clipPath"); clip.id = "hero-reveal";
  const band = document.createElementNS(NS, "rect");
  band.setAttribute("x", -2000); band.setAttribute("width", 5000); band.setAttribute("height", 0);
  clip.appendChild(band); svg.querySelector("defs").appendChild(clip);
  hero.render.setAttribute("clip-path", "url(#hero-reveal)");
  const midSvgY = () => { const pt = svg.createSVGPoint(); pt.x = 0; pt.y = innerHeight * .52; return pt.matrixTransform(svg.getScreenCTM().inverse()).y; };
  gsap.set(hero.marks, { opacity: 0 });
  gsap.set(".hdr", { yPercent: -130 });
  gsap.set([".hero-copy", ".hero-more", ".ticker"], { opacity: 0 });
  gsap.set([".ruler", ".ruler-v", ".cross"], { opacity: 0 });
  gsap.set(".hero-row", { borderColor: "transparent" });

  const pct = { v: 0 }, boot = $$(".pre-boot li");
  const intro = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
  intro
    .add(() => { const y = midSvgY(); band.setAttribute("y", y); })
    .to(pct, { v: 100, duration: 2.8, ease: "power1.inOut", onUpdate: () => {
      $(".pre-pct").textContent = Math.round(pct.v) + "%";
      boot.forEach((li, i) => li.classList.toggle("on", pct.v >= i * 10));
    } }, 0)
    .to(wireEls, { strokeDashoffset: 0, duration: .5, ease: "none", stagger: 2.3 / wireEls.length }, .1)
    .set([".ps-a", ".ps-b"], { opacity: 1 }, 2.9)
    .set(".pre-scan", { opacity: 0 }, 2.9)
    .add(() => {
      const r = $(".hero-art").getBoundingClientRect();
      gsap.to(".ps-a", { top: r.top, duration: 1, ease: "power3.inOut" });
      gsap.to(".ps-b", { top: r.bottom, duration: 1, ease: "power3.inOut" });
      const y = midSvgY();
      gsap.fromTo(band, { attr: { y, height: 0 } }, { attr: { y: y - 900, height: 1800 }, duration: 1.1, ease: "power3.inOut" });
    }, 2.9)
    .to(hero.wire, { opacity: .1, duration: .8 }, 3.3)
    .to([".pre-left", ".pre-meta", ".pre-boot", ".pre-pct"], { opacity: 0, duration: .4 }, 2.9)
    .to([".ps-a", ".ps-b"], { opacity: 0, duration: .4 }, 3.9)
    .to([".ruler", ".ruler-v", ".cross"], { opacity: 1, duration: .5, stagger: .04, onStart: () => $(".hero").classList.add("in") }, 3.7)
    .fromTo(".ruler", { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 1, ease: "power3.out" }, 3.7)
    .fromTo(".ruler-v", { scaleY: 0, transformOrigin: "top" }, { scaleY: 1, duration: 1, ease: "power3.out" }, 3.7)
    .to(".hdr", { yPercent: 0, duration: .8, ease: "power3.out", onStart: () => $(".hdr").classList.add("in") }, 3.9)
    .to(".hero-row", { borderColor: "rgba(40,40,40,.32)", duration: .4 }, 4.0)
    .add(() => { introDone = true; gsap.to(heroLines, { yPercent: 0, duration: .9, stagger: .1, ease: "power4.out" }); }, 4.0)
    .to([".hero-copy", ".hero-more", ".ticker"], { opacity: 1, duration: .6, stagger: .1 }, 4.2)
    .to(hero.marks, { opacity: 1, duration: .3 }, 4.4)
    .add(() => { document.body.classList.remove("is-loading"); $(".pre").remove(); hero.render.removeAttribute("clip-path"); lenis.start(); ScrollTrigger.refresh(); }, 4.5);
  lenis.stop();
  const play = () => (reduce ? intro.progress(1) : intro.play());
  document.readyState === "complete" ? play() : window.addEventListener("load", play);

  $$(".h-mark").forEach((m) => gsap.to(m, { opacity: .25, repeat: -1, yoyo: true, duration: .8, ease: "steps(1)" }));
  gsap.to("#hero-svg", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // ---- section headings: masked line reveals ---------------------------------------
  $$("h2.split").forEach((h) => splitLines(h, (self) => gsap.from(self.lines, { yPercent: 110, duration: 1, stagger: .08, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 85%" } })));

  // ---- intro: tower revealed in horizontal slices, sun grows, text darkens line by line ----
  const tsvg = $("#tower-svg");
  const mask = document.createElementNS(NS, "mask"); mask.id = "slices";
  const SL = 16, sliceRects = [];
  for (let i = 0; i < SL; i++) {
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("x", 0); r.setAttribute("y", (560 / SL) * i); r.setAttribute("width", 600); r.setAttribute("height", 560 / SL + .5); r.setAttribute("fill", "#fff");
    mask.appendChild(r); sliceRects.push(r);
  }
  tsvg.querySelector("defs").appendChild(mask);
  const gWrap = document.createElementNS(NS, "g"); gWrap.setAttribute("mask", "url(#slices)");
  [tower.body, tower.frame].forEach((n) => gWrap.appendChild(n));
  tsvg.appendChild(gWrap);
  gsap.set(sliceRects, { scaleY: 0, transformOrigin: "50% 100%", transformBox: "fill-box" });
  gsap.to(sliceRects.slice().reverse(), { scaleY: 1, stagger: .06, ease: "none", scrollTrigger: { trigger: ".intro", start: "top 85%", end: "top 15%", scrub: true } });
  gsap.fromTo(tower.sun, { scale: 0, transformOrigin: "330px 120px" }, { scale: 1, ease: "power2.out", scrollTrigger: { trigger: ".intro", start: "top 70%", end: "top 10%", scrub: true } });
  gsap.fromTo(tower.frame, { y: 50 }, { y: -30, ease: "none", scrollTrigger: { trigger: ".intro", start: "top bottom", end: "bottom top", scrub: true } });
  splitLines(".scrub", (self) => gsap.fromTo(self.lines, { color: GHOST }, { color: INK, stagger: .5, ease: "none", scrollTrigger: { trigger: ".intro", start: "top 60%", end: "center 40%", scrub: true } }));

  // clients carousel: arrows + slow auto-advance
  const track = $(".cl-track"), total = track.children.length, per = 4;
  let idx = 0;
  const go = (d) => { idx = (idx + d + (total - per + 1)) % (total - per + 1); track.style.transform = `translateX(${-idx * 25}%)`; };
  $(".cl-next").onclick = () => go(1); $(".cl-prev").onclick = () => go(-1);
  setInterval(() => go(1), 3200);

  // ---- problem cards: borders draw, icons draw, titles rise ----------------------------
  $$(".problem-grid article").forEach((a, i) => {
    const paths = $$("polygon, circle", icons[i]);
    strokeIn(paths);
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".problem-grid", start: "top 80%" }, delay: i * .12 });
    tl.to(paths, { strokeDashoffset: 0, duration: 1.2, stagger: .05, ease: "power2.inOut" }, .1)
      .from($("h3.mask > span", a), { yPercent: 110, duration: .9, ease: "power4.out" }, .4)
      .from($("p", a), { opacity: 0, y: 10, duration: .6 }, .6);
  });

  // ---- pinned plan: statements, walls fly in hollow then fill, details, markers ------------
  const wallRects = $$("line", plan.phases[1]).map((l) => {
    const x1 = +l.getAttribute("x1"), y1 = +l.getAttribute("y1"), x2 = +l.getAttribute("x2"), y2 = +l.getAttribute("y2");
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("x", Math.min(x1, x2) - 5); r.setAttribute("y", Math.min(y1, y2) - 5);
    r.setAttribute("width", Math.abs(x2 - x1) + 10); r.setAttribute("height", Math.abs(y2 - y1) + 10);
    r.setAttribute("fill", "#3a3a3a"); r.setAttribute("fill-opacity", 0); r.setAttribute("stroke", INK); r.setAttribute("stroke-width", 1.2);
    l.replaceWith(r); return r;
  });
  const setout = $$("line", plan.phases[0]);
  strokeIn(setout);
  gsap.set(plan.phases[0], { opacity: 0 });
  gsap.set(plan.phases.slice(2), { opacity: 0 });
  gsap.set(wallRects, { opacity: 0, x: () => gsap.utils.random(-120, 120), y: () => gsap.utils.random(-90, 90) });
  gsap.set(plan.marks, { scale: 0, transformOrigin: "center", transformBox: "fill-box" });
  gsap.set(".mw2", { opacity: 0, color: GHOST });
  gsap.set([".map-box"], { opacity: 0 });
  const steps = [
    "Drafting eats hours: modelling, coordinating and tidying up, all of it pulling you away from the design.",
    "Most of that work follows rules. It's the kind of job nobody should be doing by hand every single time.",
    "Lintel sits inside your CAD app as an assistant that reads the drawing, notices problems and edits on your approval.",
    "Here it has found three. Click a marker to see the rule, the reference and the fix it's ready to make.",
  ];
  const stepEl = $(".map-step");
  const setStep = (i) => { if (stepEl.dataset.i == i) return; stepEl.dataset.i = i; stepEl.textContent = steps[i]; gsap.fromTo(stepEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .35 }); };
  const mt = gsap.timeline({ scrollTrigger: { trigger: ".map", start: "top top", end: "bottom bottom", scrub: .7,
    onUpdate: (st) => setStep(st.progress < .4 ? 0 : st.progress < .58 ? 1 : st.progress < .76 ? 2 : 3) } });
  mt.to(".mw1", { color: GHOST, duration: .5 }, .4)
    .to(".mw1", { opacity: 0, duration: .3 }, .9)
    .to(".mw2", { opacity: 1, duration: .3 }, 1.0)
    .to(".mw2", { color: INK, duration: .5 }, 1.2)
    .to(".map-box", { opacity: 1, duration: .3 }, 1.9)
    .to(wallRects, { opacity: 1, x: 0, y: 0, duration: 1.4, stagger: .03, ease: "power3.out" }, 2.0)
    .to(".mw2", { color: GHOST, opacity: .35, duration: .4 }, 2.2)
    .to(".mw2", { opacity: 0, duration: .4 }, 3.0)
    .to(plan.phases[0], { opacity: .3, duration: .2 }, 3.2)
    .to(setout, { strokeDashoffset: 0, duration: .8, stagger: .02 }, 3.2)
    .to(wallRects, { attr: { "fill-opacity": 1 }, duration: .8, stagger: .02 }, 3.6)
    .to(plan.phases[2], { opacity: 1, duration: .7 }, 4.5)
    .to(plan.phases[3], { opacity: 1, duration: .7 }, 5.2)
    .to(plan.phases[4], { opacity: 1, duration: .7 }, 5.9)
    .to(plan.phases[5], { opacity: 1, duration: .3 }, 6.6)
    .to(plan.marks, { scale: 1, duration: .5, stagger: .2, ease: "back.out(3)" }, 6.7)
    .to("#plan-svg", { xPercent: -14, duration: 1 }, 7.8)
    .to({}, { duration: .6 });

  const card = $(".vcard");
  let current = null;
  const openCard = (m) => {
    current = m; const v = m.__v;
    $(".vcard-code", card).textContent = v.code; $(".vcard-title", card).textContent = m.classList.contains("done") ? "Fixed, approved by you" : v.title;
    $(".vcard-body", card).textContent = v.body;
    $(".vc-ok", card).style.display = v.fix && !m.classList.contains("done") ? "" : "none";
    card.classList.add("on");
  };
  plan.marks.forEach((m) => { m.addEventListener("click", () => openCard(m)); m.addEventListener("keydown", (e) => e.key === "Enter" && openCard(m)); });
  $(".vcard-x").onclick = $(".vc-no").onclick = () => card.classList.remove("on");
  $(".vc-ok").onclick = () => {
    current.classList.add("done");
    gsap.fromTo(current, { scale: 1.4 }, { scale: 1, duration: .5, ease: "back.out(3)" });
    $(".vcard-title", card).textContent = "Fixed, approved by you";
    $(".vcard-body", card).textContent = "Applied as one undo step and written to the project log.";
    $(".vc-ok", card).style.display = "none";
  };

  // ---- platform rows ---------------------------------------------------------------------
  $$(".pl-row").forEach((row) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 75%" } });
    tl.from($(".pl-name h3", row), { yPercent: 40, opacity: 0, duration: .8, ease: "power3.out" })
      .from($(".pl-art", row), { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "power3.inOut" }, 0)
      .from($$(".chat-mock, .dash-mock", row), { y: 40, opacity: 0, duration: .8, ease: "power3.out" }, .5)
      .from($$(".cm-q, .cm-a, .dm-row", row), { opacity: 0, y: 8, stagger: .15, duration: .4 }, .9);
  });
  gsap.to(mini.hot, { opacity: .25, repeat: -1, yoyo: true, duration: .9, ease: "steps(1)" });
  $$(".dm-stats b").forEach((b) => {
    const end = parseFloat(b.textContent), pctSign = b.textContent.includes("%"), o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: b, start: "top 85%" }, onUpdate: () => (b.textContent = Math.round(o.v) + (pctSign ? "%" : "")) });
  });

  // ---- why: two columns drift at different speeds; each stage animates in -----------------
  gsap.fromTo(".why-left", { y: 60 }, { y: -60, ease: "none", scrollTrigger: { trigger: ".why-cols", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".why-right", { y: -40 }, { y: -260, ease: "none", scrollTrigger: { trigger: ".why-cols", start: "top bottom", end: "bottom top", scrub: true } });
  const onStage = (sel, fn) => ScrollTrigger.create({ trigger: sel, start: "top 75%", once: true, onEnter: fn });
  gsap.set(".tag", { scale: .6, opacity: 0, transformOrigin: "left top" });
  onStage("#st-section", () => gsap.to(".tag", { scale: 1, opacity: 1, duration: .5, stagger: .35, ease: "back.out(2.4)" }));
  gsap.set(".side-card", { x: 60, opacity: 0 }); gsap.set(".corr", { opacity: 0 });
  onStage(".plan-card-art", () => gsap.timeline().to(".corr", { opacity: .85, duration: .2, repeat: 3, yoyo: true }).to(".corr", { opacity: .85 }).to(".side-card", { x: 0, opacity: 1, duration: .7, ease: "power3.out" }, .3));
  gsap.set(sheets[0], { x: -60, opacity: 0 }); gsap.set(sheets[1], { x: 60, y: 30, opacity: 0 });
  onStage("#st-sheets", () => gsap.to(sheets, { x: 0, y: 0, opacity: 1, duration: .9, stagger: .25, ease: "power3.out" }));
  strokeIn(net.lines); gsap.set(net.nodes, { scale: 0, transformOrigin: "center", transformBox: "fill-box" }); gsap.set(".net-tag", { opacity: 0, y: 10 });
  onStage("#st-network", () => gsap.timeline()
    .to(net.nodes, { scale: 1, duration: .35, stagger: .07, ease: "back.out(3)" })
    .to(net.lines, { strokeDashoffset: 0, duration: .9, stagger: .05 }, .3)
    .add(() => net.lines.forEach((l) => { l.style.strokeDasharray = "4 4"; l.style.animation = "dash 4s linear infinite"; }))
    .to(".net-tag", { opacity: 1, y: 0, duration: .5 }, .8));

  // ---- use cases: accordion + art ---------------------------------------------------------
  $$(".uc-list li").forEach((li) => $("button", li).addEventListener("click", () => {
    const open = !li.classList.contains("on");
    $$(".uc-list li").forEach((x) => x.classList.remove("on"));
    if (open) li.classList.add("on");
  }));
  gsap.fromTo(slab.sun, { y: 120, scale: .7, transformOrigin: "140px 110px" }, { y: -30, scale: 1, ease: "none", scrollTrigger: { trigger: ".usecase", start: "top bottom", end: "center center", scrub: true } });
  gsap.fromTo(slab.sun2, { x: -160 }, { x: 0, ease: "none", scrollTrigger: { trigger: ".usecase", start: "top bottom", end: "center center", scrub: true } });
  gsap.fromTo(slab.bar, { y: -240 }, { y: 0, ease: "none", scrollTrigger: { trigger: ".usecase", start: "top bottom", end: "center center", scrub: true } });
  gsap.fromTo(slab.body, { x: 60, opacity: .4 }, { x: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".usecase", start: "top bottom", end: "center center", scrub: true } });

  // ---- CTA + wordmark ------------------------------------------------------------------
  gsap.from(".cta-art svg", { opacity: 0, y: 40, duration: 1, scrollTrigger: { trigger: ".cta", start: "top 80%" } });
  const wmGuides = $$("line, circle", word.guides), wmLetters = $$("path", word.letters);
  strokeIn(wmGuides); strokeIn(wmLetters);
  gsap.set(word.dots, { opacity: 0 });
  gsap.timeline({ scrollTrigger: { trigger: ".wordmark", start: "top 95%", end: "bottom bottom", scrub: 1 } })
    .to(wmGuides, { strokeDashoffset: 0, duration: 1, stagger: .01 })
    .to(wmLetters, { strokeDashoffset: 0, duration: 1, stagger: .1 }, .4)
    .to(word.dots, { opacity: 1, duration: .3 }, 1.2);
});
