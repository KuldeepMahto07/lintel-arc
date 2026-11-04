// Site forms: footer email sign-ups ([data-signup]) and the contact form send to Lintel's
// /api/waitlist (the site proxies /api to the app). window.lintelSend is used by contact.html.
(() => {
  window.lintelSend = async (data) => {
    const r = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!r.ok) {
      const out = await r.json().catch(() => ({}));
      throw new Error(out.error?.message || "Couldn't send. Try again in a minute.");
    }
    return r.json();
  };

  document.querySelectorAll("form[data-signup]").forEach((form) => {
    const input = form.querySelector("input[type=email]");
    const btn = form.querySelector("button");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { input.value = ""; input.placeholder = "Check the address"; input.focus(); return; }
      btn.disabled = true;
      try {
        await window.lintelSend({ email, message: `site: ${form.dataset.signup} (${location.pathname})` });
        input.value = "";
        input.placeholder = form.dataset.thanks || "Thanks, noted.";
      } catch (err) {
        input.placeholder = err.message;
      } finally {
        btn.disabled = false;
      }
    });
  });
})();
