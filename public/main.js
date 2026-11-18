// Мобилно меню
(function () {
  var btn = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  });
})();

// Форма за контакт: изпращане без презареждане (без JS работи като обикновена форма)
(function () {
  var form = document.querySelector(".contact-form");
  if (!form) return;
  var status = form.querySelector(".contact-form__status");
  var btn = form.querySelector("button[type=submit]");
  var show = function (msg, ok) {
    status.textContent = msg;
    status.className = "contact-form__status " + (ok ? "is-ok" : "is-error");
  };
  var q = new URLSearchParams(location.search);
  if (q.get("sent")) show("Благодарим! Получихме запитването и ще Ви се обадим скоро.", true);
  if (q.get("error")) show("Съобщението не беше изпратено. Моля, обадете се на 0878 817777.", false);
  if (!window.fetch) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    btn.disabled = true;
    show("Изпращане…", true);
    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (d) {
        if (d.ok) { form.reset(); show("Благодарим! Получихме запитването и ще Ви се обадим скоро.", true); }
        else show(d.error || "Съобщението не беше изпратено. Моля, обадете се на 0878 817777.", false);
      })
      .catch(function () { show("Съобщението не беше изпратено. Моля, обадете се на 0878 817777.", false); })
      .then(function () { btn.disabled = false; });
  });
})();
