// Lintel pricing: plan data (from Lintel's own billing plan), card rendering, the monthly/yearly
// switch, seat steppers, the comparison table and the pricing FAQ. Original code.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const APP = "https://lintel-ruddy-five.vercel.app/signup";

  const PLANS = [
    { key: "free", name: "Free", desc: "Try Lintel on one project with the starter rules.", month: 0, year: 0, seats: null,
      cta: ["Start free", APP],
      list: [["1 project", 1], ["Rule checks and the plan view", 1], ["Propose fixes", 1], ["20 assistant messages a month", 1], ["Apply changes in your CAD app", 0], ["Custom firm rules", 0]] },
    { key: "pro", name: "Pro", desc: "For a designer or small team working on live projects.", month: 39, year: 390, seats: [1, 1],
      cta: ["Start 14-day trial", APP],
      list: [["Unlimited projects", 1], ["Apply approved changes in Rhino", 1], ["Custom rules and project overrides", 1], ["300 assistant messages per seat", 1], ["Email support", 1], ["Two-approval mode", 0]] },
    { key: "firm", name: "Firm", desc: "For offices that sign off together and keep the record.", month: 99, year: 990, seats: [3, 3], featured: "MOST CHOSEN",
      cta: ["Start 14-day trial", APP],
      list: [["Everything in Pro", 1], ["Two-approval mode", 1], ["Audit log CSV export", 1], ["1,000 assistant messages per seat", 1], ["Priority support", 1], ["Viewers are always free", 1]] },
    { key: "ent", name: "Enterprise", desc: "For groups that need single sign-on or their own hosting.", month: null, year: null, seats: null,
      cta: ["Talk to us", "contact.html"],
      list: [["Everything in Firm", 1], ["SSO and data residency", 1], ["Self-hosting option", 1], ["Custom assistant limits", 1], ["A named contact", 1], ["Rollout with your standards", 1]] },
  ];
  window.LINTEL_PLANS = PLANS;
  const fmt = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  function card(p, i) {
    const el = document.createElement("article");
    el.className = "pr-card" + (p.featured ? " featured" : "");
    el.dataset.plan = p.key;
    el.innerHTML = `
      <div class="pc-top"><span>[0${i + 1}]</span>${p.featured ? `<span class="pc-flag">${p.featured}</span>` : "<span></span>"}</div>
      <div class="pc-body">
        <h3></h3><p class="pc-desc"></p>
        <div class="pc-price">${p.month === null ? '<span class="custom">CUSTOM</span>' : '<span class="pc-cur">$</span><span class="num">0</span><span class="per"></span>'}</div>
        <div class="pc-bill"></div>
        ${p.seats ? `<div class="pc-seats"><div class="stepper"><button type="button" data-d="-1" aria-label="Fewer seats">−</button><output>${p.seats[0]}</output><button type="button" data-d="1" aria-label="More seats">+</button></div><div class="total">TOTAL<b>$0</b></div></div>` : ""}
        <ul class="pc-list"></ul>
      </div>
      <a class="pc-cta"><span></span><i>→</i></a>`;
    el.querySelector("h3").textContent = p.name;
    el.querySelector(".pc-desc").textContent = p.desc;
    p.list.forEach(([t, ok]) => { const li = document.createElement("li"); li.textContent = t; if (!ok) li.className = "no"; el.querySelector(".pc-list").append(li); });
    const a = el.querySelector(".pc-cta");
    a.href = p.cta[1];
    a.querySelector("span").textContent = p.cta[0];
    return el;
  }

  function mount(root) {
    const grid = $(".pr-grid", root);
    PLANS.forEach((p, i) => grid.append(card(p, i)));
    const toggle = $(".pr-toggle", root);
    const knob = $(".knob", toggle);
    const btns = $$("button", toggle);
    const seats = Object.fromEntries(PLANS.filter((p) => p.seats).map((p) => [p.key, p.seats[0]]));
    let period = "month";
    const shown = {};

    function render(animate) {
      PLANS.forEach((p) => {
        const c = $(`[data-plan="${p.key}"]`, grid);
        if (p.month === null) { $(".pc-bill", c).textContent = "PRICED FOR YOUR GROUP"; return; }
        const perMonth = period === "month" ? p.month : p.year / 12;
        const num = $(".num", c), from = shown[p.key] ?? 0;
        shown[p.key] = perMonth;
        if (animate && !RM) {
          const o = { v: from };
          gsap.to(o, { v: perMonth, duration: 0.7, ease: "power3.out", onUpdate: () => (num.textContent = fmt(Math.round(o.v * 100) / 100)) });
          gsap.fromTo(num, { yPercent: period === "year" ? -20 : 20, opacity: 0.4 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
        } else num.textContent = fmt(perMonth);
        $(".per", c).textContent = p.month === 0 ? "FOREVER" : "PER SEAT / MONTH";
        $(".pc-bill", c).textContent = p.month === 0 ? "NO CARD NEEDED" : period === "year" ? `BILLED $${fmt(p.year)} PER SEAT YEARLY` : "BILLED MONTHLY · CANCEL ANYTIME";
        if (p.seats) {
          const n = seats[p.key];
          const total = period === "year" ? p.year * n : p.month * n;
          $(".total b", c).textContent = `$${fmt(total)}${period === "year" ? " / YR" : " / MO"}`;
          $("output", c).textContent = n;
          $('[data-d="-1"]', c).disabled = n <= p.seats[1];
        }
      });
    }

    btns.forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.period === period) return;
      period = b.dataset.period;
      btns.forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      gsap.to(knob, { x: b.offsetLeft, width: b.offsetWidth, duration: RM ? 0 : 0.5, ease: "power3.inOut" });
      render(true);
    }));
    const placeKnob = () => { const on = btns.find((b) => b.classList.contains("on")); gsap.set(knob, { x: on.offsetLeft, width: on.offsetWidth }); };
    addEventListener("resize", placeKnob);
    document.fonts?.ready.then(placeKnob);
    placeKnob();

    grid.addEventListener("click", (e) => {
      const b = e.target.closest(".stepper button");
      if (!b) return;
      const key = b.closest(".pr-card").dataset.plan;
      seats[key] = Math.max(PLANS.find((p) => p.key === key).seats[1], Math.min(99, seats[key] + Number(b.dataset.d)));
      render(false);
      if (!RM) gsap.fromTo(b.closest(".pc-seats").querySelector(".total b"), { color: "#fa3600" }, { color: "", duration: 0.6 });
    });
    render(false);

    // entrance: cards rise in, prices count up from zero once
    if (!RM) {
      gsap.set($$(".pr-card", grid), { autoAlpha: 0, y: 50 });
      ScrollTrigger.create({
        trigger: grid, start: "top 80%", once: true,
        onEnter: () => {
          gsap.to($$(".pr-card", grid), { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" });
          PLANS.forEach((p) => { shown[p.key] = 0; });
          setTimeout(() => render(true), 250);
          gsap.from($$(".pc-list li", grid), { x: -10, autoAlpha: 0, duration: 0.5, stagger: 0.02, delay: 0.4, ease: "power2.out" });
        },
      });
    }
  }

  // ---- comparison table and FAQ (pricing.html only) -------------------------------
  const COMPARE = [
    ["Projects and checks", [
      ["Projects", "1", "Unlimited", "Unlimited", "Unlimited"],
      ["Rule checks on every sync", 1, 1, 1, 1],
      ["Plan view with issue markers", 1, 1, 1, 1],
      ["Starter rule set", 1, 1, 1, 1],
      ["Custom firm rules and CSV import", 0, 1, 1, 1],
      ["Per-project rule overrides", 0, 1, 1, 1],
    ]],
    ["Changes and approvals", [
      ["Propose fixes", 1, 1, 1, 1],
      ["Apply approved changes in your CAD app", 0, 1, 1, 1],
      ["Revert applied changes", 0, 1, 1, 1],
      ["Two-approval mode", 0, 0, 1, 1],
      ["Comments on change sets", 1, 1, 1, 1],
    ]],
    ["Assistant", [
      ["Assistant messages per seat each month", "20", "300", "1,000", "Custom"],
      ["Top-ups (+500 messages)", 0, "$10", "$10", "Included"],
      ["Assistant proposes rules from your standards", 1, 1, 1, 1],
    ]],
    ["Team and records", [
      ["Members", "1", "Seats bought", "Seats bought", "Seats bought"],
      ["Viewers", "—", "Free", "Free", "Free"],
      ["Audit log", 1, 1, 1, 1],
      ["Audit CSV export", 0, 0, 1, 1],
      ["SSO, data residency, self-hosting", 0, 0, 0, 1],
      ["Support", "Community", "Email", "Priority", "Named contact"],
    ]],
  ];

  function mountCompare(root) {
    const body = $(".cmp-body", root);
    COMPARE.forEach(([title, rows], gi) => {
      const g = document.createElement("div");
      g.className = "cmp-group" + (gi === 0 ? " open" : "");
      g.innerHTML = `<button type="button" aria-expanded="${gi === 0}"><span></span><i>+</i></button><div class="cmp-rows"></div>`;
      $("span", g).textContent = title;
      const box = $(".cmp-rows", g);
      rows.forEach((r) => {
        const row = document.createElement("div");
        row.className = "cmp-row";
        r.forEach((v, i) => {
          const c = document.createElement("div");
          if (i === 0) c.textContent = v;
          else if (v === 1) { c.className = "y"; c.setAttribute("aria-label", "Included"); }
          else if (v === 0) { c.className = "n"; c.setAttribute("aria-label", "Not included"); }
          else { c.className = "t"; c.textContent = v; }
          row.append(c);
        });
        box.append(row);
      });
      if (gi !== 0) box.style.height = "0px";
      $("button", g).addEventListener("click", () => {
        const open = !g.classList.contains("open");
        g.classList.toggle("open", open);
        $("button", g).setAttribute("aria-expanded", String(open));
        gsap.fromTo(box, { height: box.offsetHeight }, { height: open ? box.scrollHeight : 0, duration: RM ? 0 : 0.55, ease: "power3.inOut", onComplete: () => { if (open) box.style.height = "auto"; ScrollTrigger.refresh(); } });
        if (open && !RM) gsap.from($$(".cmp-row", box), { x: -12, autoAlpha: 0, duration: 0.4, stagger: 0.03, ease: "power2.out" });
      });
      body.append(g);
    });
  }

  function mountFaq(root) {
    $$(".q-item", root).forEach((item) => {
      const a = $(".a", item);
      if (item.classList.contains("open")) a.style.height = "auto";
      $("button", item).addEventListener("click", () => {
        const open = !item.classList.contains("open");
        $$(".q-item.open", root).forEach((o) => { if (o !== item) { o.classList.remove("open"); gsap.fromTo($(".a", o), { height: $(".a", o).offsetHeight }, { height: 0, duration: RM ? 0 : 0.45, ease: "power3.inOut" }); } });
        item.classList.toggle("open", open);
        $("button", item).setAttribute("aria-expanded", String(open));
        gsap.fromTo(a, { height: a.offsetHeight }, { height: open ? a.scrollHeight : 0, duration: RM ? 0 : 0.5, ease: "power3.inOut", onComplete: () => { if (open) a.style.height = "auto"; } });
      });
    });
  }

  const start = () => {
    $$("[data-pricing]").forEach(mount);
    $$("[data-compare]").forEach(mountCompare);
    $$("[data-faq]").forEach(mountFaq);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
