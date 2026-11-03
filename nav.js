// Phone header menu for every page: adds a MENU button that opens the nav as a full-width panel.
// Desktop keeps the hover dropdowns; below 760px the dropdown items are listed inline instead.
(() => {
  const hdr = document.querySelector(".hdr");
  const nav = hdr && hdr.querySelector(".hdr-nav");
  if (!nav) return;
  if (!nav.id) nav.id = "site-nav";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "hdr-menu";
  btn.setAttribute("aria-controls", nav.id);
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = '<span class="hm-label">MENU</span><span class="hm-icon" aria-hidden="true"><i></i><i></i></span>';
  hdr.insertBefore(btn, nav);

  const set = (open) => {
    hdr.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.querySelector(".hm-label").textContent = open ? "CLOSE" : "MENU";
    document.documentElement.classList.toggle("menu-lock", open);
  };
  btn.addEventListener("click", () => set(!hdr.classList.contains("menu-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && hdr.classList.contains("menu-open")) { set(false); btn.focus(); } });
  matchMedia("(min-width: 761px)").addEventListener("change", (m) => { if (m.matches) set(false); });
})();
