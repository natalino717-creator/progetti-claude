(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Chiudi" : "Menu";
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      }
    });
  }

  /* ---------- open / closed, on Messina time ---------- */
  var SLOTS = [[12 * 60, 15 * 60], [19 * 60 + 30, 23 * 60 + 30]];
  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  function romeMinutes() {
    try {
      var parts = new Intl.DateTimeFormat("it-IT", {
        timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      var h = 0, m = 0;
      parts.forEach(function (p) {
        if (p.type === "hour") h = parseInt(p.value, 10);
        if (p.type === "minute") m = parseInt(p.value, 10);
      });
      return h * 60 + m;
    } catch (e) {
      var d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    }
  }
  function updateStatus() {
    var el = document.getElementById("open-status");
    if (!el) return;
    var now = romeMinutes();
    for (var i = 0; i < SLOTS.length; i++) {
      if (now >= SLOTS[i][0] && now < SLOTS[i][1]) {
        el.dataset.state = "open";
        el.textContent = "Aperto ora · fino alle " + fmt(SLOTS[i][1]);
        return;
      }
      if (now < SLOTS[i][0]) {
        el.dataset.state = "closed";
        el.textContent = "Chiuso · apre alle " + fmt(SLOTS[i][0]);
        return;
      }
    }
    el.dataset.state = "closed";
    el.textContent = "Chiuso · domani dalle " + fmt(SLOTS[0][0]);
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- embers ---------- */
  function embers(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, parts = [];
    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, w / 14));
      parts = [];
      for (var i = 0; i < count; i++) parts.push(spawn(true));
    }
    function spawn(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 1.8,
        vy: 0.25 + Math.random() * 0.7,
        drift: Math.random() * Math.PI * 2,
        life: 0.4 + Math.random() * 0.6
      };
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.vy;
        p.drift += 0.015;
        p.x += Math.sin(p.drift) * 0.35;
        var t = Math.max(0, p.y / h);           // 1 at the bottom, 0 at the top
        var a = Math.min(1, t * 1.4) * p.life;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255," + Math.round(120 + 70 * (1 - t)) + ",60," + a.toFixed(3) + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.y < -10) parts[i] = spawn(false);
      }
      if (running) requestAnimationFrame(frame);
    }
    var running = false;
    size();
    window.addEventListener("resize", size);
    if (reduceMotion) { frame(); return; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(frame); }
        else if (!vis) running = false;
      }).observe(canvas);
    } else {
      running = true; requestAnimationFrame(frame);
    }
  }
  var emberCanvas = document.getElementById("embers");
  if (emberCanvas) embers(emberCanvas);

  /* ---------- Rais waves ---------- */
  function waves(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, t = 0, running = false;
    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (var k = 0; k < 9; k++) {
        var base = h * 0.35 + k * (h * 0.075);
        ctx.strokeStyle = "rgba(127,196,201," + (0.05 + k * 0.02).toFixed(3) + ")";
        ctx.beginPath();
        for (var x = 0; x <= w; x += 8) {
          var y = base + Math.sin(x * 0.008 + t + k * 0.7) * (6 + k * 1.2) + Math.sin(x * 0.021 - t * 1.3) * 3;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    function frame() { t += 0.008; draw(); if (running) requestAnimationFrame(frame); }
    size(); draw();
    window.addEventListener("resize", function () { size(); draw(); });
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !running) { running = true; requestAnimationFrame(frame); }
      else if (!vis) running = false;
    }).observe(canvas);
  }
  var waveCanvas = document.getElementById("waves");
  if (waveCanvas) waves(waveCanvas);

  /* ---------- cut chart ---------- */
  var CUTS = {
    collo: {
      num: "01", name: "Collo e spalla",
      desc: "Tagli saporiti e ricchi di collagene. Li maciniamo per i nostri hamburger, compreso quello di Wagyu.",
      dish: "Burger, anche di Wagyu", cook: "Alla piastra, cuore rosato", price: ""
    },
    costata: {
      num: "02", name: "Costata e tomahawk",
      desc: "La parte alta delle costole: marezzatura generosa e grasso che si scioglie sulla brace. Il tomahawk è la costata con l'osso lungo.",
      dish: "Costata di scottona, Angus o Wagyu", cook: "Al sangue o media, riposo prima del taglio", price: "al peso"
    },
    lombata: {
      num: "03", name: "Controfiletto e fiorentina",
      desc: "La lombata: da qui nascono lo striploin e, con l'osso a T, la fiorentina. Fibra compatta, grasso di copertura che sulla brace diventa crosta.",
      dish: "Controfiletto di scottona", cook: "Al sangue o media, sulla brace", price: "€24"
    },
    filetto: {
      num: "04", name: "Filetto",
      desc: "Il muscolo che lavora meno, quindi il più tenero. Poco grasso, sapore delicato, va trattato con rispetto.",
      dish: "Filetto alla brace", cook: "Al sangue", price: ""
    },
    petto: {
      num: "05", name: "Petto e pancia",
      desc: "Tagli da pazienza: fibre lunghe e grasso che con le cotture lente diventano morbidissimi.",
      dish: "Specialità barbecue", cook: "Bassa temperatura, poi brace", price: ""
    },
    scamone: {
      num: "06", name: "Scamone",
      desc: "Tra lombata e coscia, magro ma succoso. È il taglio ideale per la tagliata, uno dei piatti più amati di casa.",
      dish: "Tagliata di manzo", cook: "Media, tagliata a fette spesse", price: ""
    },
    fesa: {
      num: "07", name: "Fesa e coscia",
      desc: "Carne magra e pulita, perfetta da mangiare cruda: battuta al coltello o in fette sottilissime.",
      dish: "Tartare e carpaccio", cook: "Cruda", price: ""
    }
  };
  var card = document.getElementById("cut-card");
  var cutEls = document.querySelectorAll(".cut");
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  function selectCut(key) {
    var c = CUTS[key];
    if (!c || !card) return;
    cutEls.forEach(function (el) {
      var on = el.getAttribute("data-cut") === key;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-pressed", String(on));
    });
    setText("cut-num", c.num);
    setText("cut-name", c.name);
    setText("cut-desc", c.desc);
    setText("cut-dish", c.dish);
    setText("cut-cook", c.cook);
    var price = document.getElementById("cut-price");
    if (price) {
      if (c.price === "") {
        price.innerHTML = "<span>prezzo</span> in sala";
      } else if (c.price === "al peso") {
        price.innerHTML = "<span>prezzo</span> al peso";
      } else {
        price.innerHTML = "<span>da</span> " + c.price;
      }
    }
    card.classList.remove("is-swapping");
    void card.offsetWidth;
    card.classList.add("is-swapping");
  }
  cutEls.forEach(function (el) {
    var key = el.getAttribute("data-cut");
    el.addEventListener("click", function () { selectCut(key); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectCut(key); }
    });
  });
  selectCut("lombata");

  /* ---------- menu tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function activate(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activate(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activate(next, true); }
    });
  });

  /* ---------- seats ---------- */
  document.querySelectorAll(".seats").forEach(function (box) {
    var n = parseInt(box.getAttribute("data-seats"), 10) || 0;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var dot = document.createElement("i");
      dot.style.setProperty("--i", i);
      frag.appendChild(dot);
    }
    box.appendChild(frag);
  });

  /* ---------- booking form ---------- */
  var form = document.getElementById("book-form");
  var msg = document.getElementById("form-msg");
  var dateInput = document.getElementById("f-date");
  if (dateInput) {
    var today = new Date();
    var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = iso;
    if (!dateInput.value) dateInput.value = iso;
  }

  // "Richiedi un preventivo" preselects the private-event room
  document.querySelectorAll("[data-occasion]").forEach(function (a) {
    a.addEventListener("click", function () {
      var v = a.getAttribute("data-occasion");
      var radio = form && form.querySelector('input[name="room"][value="' + v + '"]');
      if (radio) radio.checked = true;
    });
  });

  function say(text, kind) {
    if (!msg) return;
    msg.textContent = text;
    msg.className = "form__msg" + (kind ? " is-" + kind : "");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var required = ["f-name", "f-phone", "f-date", "f-guests"];
      var firstBad = null;
      required.forEach(function (id) {
        var el = document.getElementById(id);
        var bad = !el.value.trim() || (el.type === "number" && (+el.value < 1));
        el.setAttribute("aria-invalid", String(bad));
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) {
        say("Mancano alcuni dati: controlla i campi evidenziati.", "error");
        firstBad.focus();
        return;
      }
      var data = new FormData(form);
      var d = new Date(data.get("date") + "T12:00:00");
      var dateLabel = isNaN(d) ? data.get("date") : d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
      var body = [
        "Buongiorno, vorrei prenotare un tavolo al Toronero.",
        "",
        "Nome: " + data.get("name"),
        "Telefono: " + data.get("phone"),
        "Giorno: " + dateLabel,
        "Orario: " + data.get("time"),
        "Persone: " + data.get("guests"),
        "Sala: " + data.get("room"),
        data.get("notes") ? "Note: " + data.get("notes") : "",
        "",
        "Grazie!"
      ].filter(function (l, i, arr) { return l !== "" || arr[i - 1] !== ""; }).join("\n");
      var subject = "Prenotazione " + dateLabel + " ore " + data.get("time") + " · " + data.get("guests") + " persone";
      window.location.href = "mailto:toronerosrl@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      say("Richiesta pronta: inviala dalla tua email. La prenotazione è confermata solo dopo la nostra risposta. Se l'email non si apre, chiama lo 090 293 1640.", "ok");
    });
    form.addEventListener("input", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true" && e.target.value.trim()) {
        e.target.setAttribute("aria-invalid", "false");
      }
    });
  }

  /* ---------- copy phone ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = btn.getAttribute("data-copy");
      var done = function () { btn.textContent = "Copiato"; setTimeout(function () { btn.textContent = "Copia numero"; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v).then(done, function () { selectNumber(); });
      } else {
        selectNumber();
      }
    });
  });
  function selectNumber() {
    var n = document.querySelector(".phone-block__num");
    if (!n || !window.getSelection) return;
    var r = document.createRange();
    r.selectNodeContents(n);
    var s = window.getSelection();
    s.removeAllRanges(); s.addRange(r);
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
