(function () {
  "use strict";

  var MENU = window.TORONERO_MENU || [];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- mobile nav ---------- */
  var toggle = $("nav-toggle"), links = $("nav-links");
  function closeNav() {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Chiudi" : "Menu";
    });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
  }

  /* ---------- open / closed on Messina time ---------- */
  var SLOTS = [[12 * 60, 15 * 60], [19 * 60 + 30, 23 * 60 + 30]];
  function hhmm(min) { var h = Math.floor(min / 60), m = min % 60; return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m; }
  function romeMinutes() {
    try {
      var h = 0, m = 0;
      new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (p) {
          if (p.type === "hour") h = +p.value;
          if (p.type === "minute") m = +p.value;
        });
      return h * 60 + m;
    } catch (e) { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  }
  function updateStatus() {
    var el = $("open-status"); if (!el) return;
    var now = romeMinutes();
    for (var i = 0; i < SLOTS.length; i++) {
      if (now >= SLOTS[i][0] && now < SLOTS[i][1]) { el.dataset.state = "open"; el.textContent = "Aperto ora · fino alle " + hhmm(SLOTS[i][1]); return; }
      if (now < SLOTS[i][0]) { el.dataset.state = "closed"; el.textContent = "Chiuso · apre alle " + hhmm(SLOTS[i][0]); return; }
    }
    el.dataset.state = "closed"; el.textContent = "Chiuso · domani dalle " + hhmm(SLOTS[0][0]);
  }
  updateStatus(); setInterval(updateStatus, 60000);

  /* ---------- menu ---------- */
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function euro(p) { return "€ " + (p % 1 ? p.toFixed(2).replace(".", ",") : p); }

  // flatten once: every dish knows its category and group
  var DISHES = [];
  MENU.forEach(function (cat) {
    var groups = cat.groups || [{ g: "", items: cat.items }];
    groups.forEach(function (gr) {
      gr.items.forEach(function (it) {
        DISHES.push({ cat: cat, group: gr.g, it: it, hay: norm([it.n, it.d, it.o, gr.g, cat.title].join(" ")) });
      });
    });
  });

  function highlight(text, terms) {
    text = String(text);
    // collect match ranges on the accent-folded raw text (same length for Latin letters),
    // merge them, then escape segment by segment so marks never land inside markup
    var folded = norm(text), ranges = [];
    terms.forEach(function (t) {
      if (t.length < 2) return;
      for (var at = folded.indexOf(t); at !== -1; at = folded.indexOf(t, at + t.length)) ranges.push([at, at + t.length]);
    });
    if (!ranges.length || folded.length !== text.length) return esc(text);
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var out = "", i = 0;
    ranges.forEach(function (r) {
      if (r[1] <= i) return;
      var s = Math.max(r[0], i);
      out += esc(text.slice(i, s)) + "<mark>" + esc(text.slice(s, r[1])) + "</mark>";
      i = r[1];
    });
    return out + esc(text.slice(i));
  }

  function dishHTML(d, terms) {
    var it = d.it;
    var price = '<span class="dish__price">' + euro(it.p) + (it.unit ? "<small>" + esc(it.unit) + "</small>" : "") + "</span>";
    return '<li class="dish">' +
      '<span class="dish__name">' + highlight(it.n, terms) +
        (it.o ? '<span class="dish__origin">' + highlight(it.o, terms) + "</span>" : "") +
        (it.tag ? '<span class="dish__tag">' + esc(it.tag) + "</span>" : "") +
      "</span>" + price +
      (it.d ? '<p class="dish__desc">' + highlight(it.d, terms) + "</p>" : "") +
      "</li>";
  }

  var body = $("menu-body"), cats = $("menu-cats"), empty = $("menu-empty"), filterBar = $("menu-filter"), search = $("menu-search");

  function renderMenu(query) {
    var terms = norm(query).split(/\s+/).filter(Boolean);
    var html = "", shown = 0;
    MENU.forEach(function (cat) {
      var rows = DISHES.filter(function (d) {
        return d.cat === cat && terms.every(function (t) { return d.hay.indexOf(t) !== -1; });
      });
      if (!rows.length) return;
      shown += rows.length;
      html += '<section class="cat" id="cat-' + cat.id + '" aria-labelledby="cat-t-' + cat.id + '">' +
        '<header class="cat__head"><h3 class="cat__title" id="cat-t-' + cat.id + '">' + esc(cat.title) + "</h3>" +
        (cat.note ? '<p class="cat__note">' + esc(cat.note) + "</p>" : "") + "</header>";
      var lastGroup = null, open = false;
      rows.forEach(function (d) {
        if (d.group !== lastGroup) {
          if (open) html += "</ul>";
          if (d.group) html += '<h4 class="cat__group">' + esc(d.group) + "</h4>";
          html += '<ul class="dishes">'; open = true; lastGroup = d.group;
        }
        html += dishHTML(d, terms);
      });
      if (open) html += "</ul>";
      html += "</section>";
    });
    body.innerHTML = html;
    empty.hidden = shown > 0;

    // category chips mirror what's visible
    cats.innerHTML = MENU.filter(function (c) { return $("cat-" + c.id); }).map(function (c) {
      return '<a href="#cat-' + c.id + '" data-cat="' + c.id + '">' + esc(c.short) + "</a>";
    }).join("");

    if (terms.length) {
      filterBar.hidden = false;
      filterBar.innerHTML = "<span>" + shown + (shown === 1 ? " piatto" : " piatti") + " per «" + esc(query.trim()) + "»</span>" +
        '<button type="button" id="menu-clear">Mostra tutto il menu</button>';
      $("menu-clear").addEventListener("click", function () { setQuery(""); search.focus(); });
    } else {
      filterBar.hidden = true; filterBar.innerHTML = "";
    }
    observeCats();
  }

  var spy = null;
  function observeCats() {
    if (!("IntersectionObserver" in window)) return;
    if (spy) spy.disconnect();
    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id.replace("cat-", "");
        cats.querySelectorAll("a").forEach(function (a) {
          var on = a.dataset.cat === id;
          a.classList.toggle("is-current", on);
          if (on && a.scrollIntoView && !reduceMotion) {
            var r = a.getBoundingClientRect(), cr = cats.getBoundingClientRect();
            if (r.left < cr.left || r.right > cr.right) cats.scrollBy({ left: r.left - cr.left - 24, behavior: "smooth" });
          }
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    body.querySelectorAll(".cat").forEach(function (s) { spy.observe(s); });
  }

  var searchTimer;
  function setQuery(q) {
    search.value = q;
    renderMenu(q);
    syncTags(q);
  }
  if (body && search) {
    renderMenu("");
    search.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { renderMenu(search.value); syncTags(search.value); }, 120);
    });
  }

  /* ---------- meat tags (cella) ---------- */
  var MEATS = [
    { n: "Scottona", o: "Italia", q: "scottona" },
    { n: "Chianina IGP", o: "Italia", q: "chianina" },
    { n: "Vacche grasse", o: "Italia", q: "vacche grasse" },
    { n: "Frisona", o: "Emilia-Romagna", q: "frisona" },
    { n: "Fassona", o: "Piemonte", q: "fassona" },
    { n: "Rubia Gallega", o: "Spagna", q: "rubia gallega" },
    { n: "Sashi", o: "Finlandia", q: "sashi" },
    { n: "Picanha", o: "Argentina · Danimarca · Finlandia", q: "picanha" },
    { n: "Black Angus", o: "Stati Uniti · Argentina", q: "black angus" },
    { n: "Danish Crown", o: "Danimarca", q: "danish crown" },
    { n: "Manzetto baltico", o: "Paesi baltici", q: "manzetto baltico" },
    { n: "Wagyu", o: "Giappone · Kagoshima", q: "wagyu" }
  ];
  var tagBox = $("meat-tags");
  function matches(q) {
    var t = norm(q).split(/\s+/);
    return DISHES.filter(function (d) { return t.every(function (x) { return d.hay.indexOf(x) !== -1; }); });
  }
  if (tagBox) {
    tagBox.innerHTML = MEATS.map(function (m, i) {
      var rows = matches(m.q);
      var perPiece = rows.filter(function (d) { return !d.it.unit; });
      var pool = perPiece.length ? perPiece : rows;
      var min = pool.reduce(function (a, d) { return Math.min(a, d.it.p); }, Infinity);
      var unit = perPiece.length ? "" : " /kg";
      return '<button type="button" class="tag" role="listitem" aria-pressed="false" data-q="' + esc(m.q) + '">' +
        '<span class="tag__origin">' + esc(m.o) + "</span>" +
        '<span class="tag__name">' + esc(m.n) + "</span>" +
        '<span class="tag__price"><span>' + rows.length + (rows.length === 1 ? " piatto" : " piatti") + "</span>" +
        "<span>da <b>" + euro(min) + unit + "</b></span></span></button>";
    }).join("");
    tagBox.addEventListener("click", function (e) {
      var b = e.target.closest(".tag"); if (!b) return;
      var q = b.getAttribute("aria-pressed") === "true" ? "" : b.dataset.q;
      setQuery(q);
      if (q) $("menu").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
  function syncTags(q) {
    if (!tagBox) return;
    var nq = norm(q).trim();
    tagBox.querySelectorAll(".tag").forEach(function (b) { b.setAttribute("aria-pressed", String(nq !== "" && nq === norm(b.dataset.q))); });
  }

  /* ---------- room galleries ---------- */
  document.querySelectorAll("[data-room]").forEach(function (room) {
    var main = room.querySelector(".room__main");
    room.querySelectorAll(".room__thumbs button").forEach(function (btn) {
      btn.setAttribute("aria-label", "Mostra: " + btn.dataset.alt);
      btn.addEventListener("click", function () {
        room.querySelectorAll(".room__thumbs button").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        if (reduceMotion) { main.src = btn.dataset.src; main.alt = btn.dataset.alt; return; }
        main.style.opacity = "0.2";
        setTimeout(function () { main.src = btn.dataset.src; main.alt = btn.dataset.alt; main.style.opacity = "1"; }, 160);
      });
    });
  });

  /* ---------- 360° tour ---------- */
  var TOUR_URL = "https://storage.net-fs.com/hosting/8290082/2/";
  var dlg = $("tour-dialog"), frame = $("tour-frame");
  if ($("tour-open")) {
    $("tour-open").addEventListener("click", function () {
      if (!dlg || typeof dlg.showModal !== "function") { window.open(TOUR_URL, "_blank", "noopener"); return; }
      if (!frame.firstChild) {
        var f = document.createElement("iframe");
        f.src = TOUR_URL; f.title = "Tour virtuale a 360° di Toronero";
        f.allow = "fullscreen; accelerometer; gyroscope; xr-spatial-tracking"; f.allowFullscreen = true;
        frame.appendChild(f);
      }
      dlg.showModal();
    });
    $("tour-close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- booking ---------- */
  var form = $("book-form"), msg = $("form-msg"), dateInput = $("f-date");
  if (dateInput) {
    var t = new Date(), iso = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = iso; if (!dateInput.value) dateInput.value = iso;
  }
  document.querySelectorAll("[data-occasion]").forEach(function (a) {
    a.addEventListener("click", function () {
      var r = form && form.querySelector('input[name="room"][value="' + a.dataset.occasion + '"]');
      if (r) r.checked = true;
    });
  });
  function say(text, kind) { msg.textContent = text; msg.className = "form__msg" + (kind ? " is-" + kind : ""); }
  if (form) {
    var via = "whatsapp";
    form.querySelectorAll("[data-via]").forEach(function (b) { b.addEventListener("click", function () { via = b.dataset.via; }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = null;
      ["f-name", "f-date", "f-guests"].forEach(function (id) {
        var el = $(id), invalid = !el.value.trim() || (el.type === "number" && +el.value < 1);
        el.setAttribute("aria-invalid", String(invalid));
        if (invalid && !bad) bad = el;
      });
      if (bad) { say("Mancano alcuni dati: controlla i campi evidenziati.", "error"); bad.focus(); return; }
      var data = new FormData(form);
      var d = new Date(data.get("date") + "T12:00:00");
      var day = isNaN(d) ? data.get("date") : d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
      var lines = [
        "Buongiorno, vorrei prenotare un tavolo da Toronero.",
        "Nome: " + data.get("name"),
        "Giorno: " + day,
        "Orario: " + data.get("time"),
        "Persone: " + data.get("guests"),
        "Sala: " + data.get("room")
      ];
      if (data.get("notes")) lines.push("Note: " + data.get("notes"));
      var text = lines.join("\n");
      if (via === "email") {
        var subject = "Prenotazione " + day + " ore " + data.get("time") + " · " + data.get("guests") + " persone";
        window.location.href = "mailto:toronerosrl@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
        say("Si apre la tua email con la richiesta pronta. La prenotazione è confermata quando ti rispondiamo.", "ok");
      } else {
        window.open("https://wa.me/393667102667?text=" + encodeURIComponent(text), "_blank", "noopener");
        say("Si apre WhatsApp con il messaggio pronto: premi invia. La prenotazione è confermata quando ti rispondiamo.", "ok");
      }
    });
    form.addEventListener("input", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true" && e.target.value.trim()) e.target.setAttribute("aria-invalid", "false");
    });
  }

  /* ---------- floating "Prenota" on phones, hidden over hero and booking ---------- */
  var fab = document.querySelector(".fab");
  if (fab && "IntersectionObserver" in window) {
    var hidden = { hero: true, book: false };
    var upd = function () { fab.classList.toggle("is-visible", !hidden.hero && !hidden.book); };
    new IntersectionObserver(function (es) { hidden.hero = es[0].isIntersecting; upd(); }).observe(document.querySelector(".hero"));
    new IntersectionObserver(function (es) { hidden.book = es[0].isIntersecting; upd(); }).observe($("prenota"));
  }

  var y = $("year"); if (y) y.textContent = String(new Date().getFullYear());
})();
