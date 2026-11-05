/* ==========================================================================
   Préstamos El Fraile — Funcionalidad del sitio
   Los datos (teléfonos, sucursales, horario) se editan en js/data.js
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.CONFIG || {};
  var sucursales = window.SUCURSALES || [];
  var horarioGeneral = cfg.horario || [];

  var TIPOS = {
    "empeno":       { etiqueta: "Empeño",         prefijo: "Sucursal", letrero: "Empeño" },
    "empeno-bazar": { etiqueta: "Empeño y Bazar", prefijo: "Sucursal", letrero: "Empeño" },
    "bazar":        { etiqueta: "Bazar",          prefijo: "Bazar",    letrero: "Bazar" }
  };
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var DIAS_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------- Utilidades ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function digits(str) { return String(str || "").replace(/\D/g, ""); }

  // 10 dígitos de México -> número local (quita 52 / 521 si lo escribieron)
  function localPhone(str) {
    var d = digits(str);
    if (d.length === 13 && d.indexOf("521") === 0) d = d.slice(3);
    else if (d.length === 12 && d.indexOf("52") === 0) d = d.slice(2);
    return d;
  }

  function formatPhone(str) {
    var d = localPhone(str);
    if (d.length !== 10) return String(str || "");
    if (/^(55|56|33|81)/.test(d)) return d.slice(0, 2) + " " + d.slice(2, 6) + " " + d.slice(6);
    return d.slice(0, 3) + " " + d.slice(3, 6) + " " + d.slice(6);
  }

  function telHref(str) { var d = localPhone(str); return d ? "tel:+52" + d : ""; }

  function whatsappHref() {
    var d = localPhone(cfg.whatsapp);
    if (!d) return "";
    var msg = cfg.whatsappMensaje ? "?text=" + encodeURIComponent(cfg.whatsappMensaje) : "";
    return "https://wa.me/52" + d + msg;
  }

  function webHref(str) {
    str = String(str || "").trim();
    if (!str) return "";
    return /^https?:\/\//i.test(str) ? str : "https://" + str;
  }

  function toMinutes(hhmm) {
    var p = String(hhmm || "0:0").split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1] || "0", 10);
  }

  function formatTime(hhmm) {
    var total = toMinutes(hhmm);
    var h = Math.floor(total / 60) % 24;
    var m = total % 60;
    var suf = h < 12 ? "a.m." : "p.m.";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + " " + suf;
  }

  function rango(h) { return formatTime(h.abre) + " – " + formatTime(h.cierra); }

  // [1,2,3,4,5,6] -> "Lun – Sáb" ; [0] -> "Dom" (semana empezando en lunes)
  var DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  function diasCortos(h) {
    var nums = (h.numeros || []).slice().sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); });
    if (!nums.length) return h.dias || "";
    if (nums.length === 1) return DIAS_CORTOS[nums[0]];
    var seguidos = nums.every(function (n, i) { return i === 0 || ((n + 6) % 7) === ((nums[i - 1] + 6) % 7) + 1; });
    if (seguidos && nums.length > 2) return DIAS_CORTOS[nums[0]] + " – " + DIAS_CORTOS[nums[nums.length - 1]];
    return nums.map(function (n) { return DIAS_CORTOS[n]; }).join(", ");
  }

  function mapsHref(s) {
    if (s.mapa) return webHref(s.mapa);
    var q = [s.calle, s.colonia, "García", "Nuevo León", "México"].join(", ").replace(/#\s*/g, "");
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  }

  function nombreCompleto(s) {
    var t = TIPOS[s.tipo] || TIPOS.empeno;
    return t.prefijo + " " + s.nombre;
  }

  function esBazar(s) { return s.tipo === "bazar" || s.tipo === "empeno-bazar"; }
  function esEmpeno(s) { return s.tipo === "empeno" || s.tipo === "empeno-bazar"; }

  // Tienda en línea; si no hay dirección, se usa el WhatsApp
  function bazarEnLineaHref() { return webHref(cfg.bazarEnLinea) || whatsappHref(); }

  /* ---------- Datos de contacto (teléfono, WhatsApp, redes) ---------- */
  var LINKS = {
    telefono:  function () { return telHref(cfg.telefono); },
    whatsapp:  whatsappHref,
    facebook:  function () { return webHref(cfg.facebook); },
    instagram: function () { return webHref(cfg.instagram); },
    correo:    function () { return cfg.correo ? "mailto:" + String(cfg.correo).trim() : ""; },
    bazarEnLinea: function () { return bazarEnLineaHref(); }
  };
  var EXTERNOS = { whatsapp: true, facebook: true, instagram: true, bazarEnLinea: true };

  function hasValue(key) {
    if (LINKS[key]) return !!LINKS[key]();
    return !!String(cfg[key] || "").trim();
  }

  function textFor(key) {
    if (key === "telefono" || key === "whatsapp") return formatPhone(cfg[key]);
    return String(cfg[key] || "");
  }

  function applyConfig() {
    $$("[data-link]").forEach(function (el) {
      var key = el.getAttribute("data-link");
      var href = LINKS[key] ? LINKS[key]() : "";
      if (href) {
        el.setAttribute("href", href);
        if (EXTERNOS[key]) { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); }
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
    $$("[data-requires]").forEach(function (el) { el.hidden = !hasValue(el.getAttribute("data-requires")); });
    $$("[data-unless]").forEach(function (el) { el.hidden = hasValue(el.getAttribute("data-unless")); });
    $$("[data-text]").forEach(function (el) { el.textContent = textFor(el.getAttribute("data-text")); });

    var totales = {
      total: sucursales.length,
      empeno: sucursales.filter(esEmpeno).length,
      bazar: sucursales.filter(esBazar).length + 1 // + bazar en línea
    };
    $$("[data-count]").forEach(function (el) {
      var k = el.getAttribute("data-count");
      if (totales[k]) el.textContent = totales[k];
    });

    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Texto de automóviles: lista las sucursales que empeñan autos
    var autos = sucursales.filter(function (s) { return s.autos; }).map(function (s) { return "Suc. " + s.nombre; });
    var autosEl = $("[data-autos-text]");
    if (autosEl && autos.length) {
      var lista = autos.length > 1 ? autos.slice(0, -1).join(", ") + " y " + autos[autos.length - 1] : autos[0];
      autosEl.textContent = "Empeña tu auto en " + lista + ".";
    }
  }

  /* ---------- Horario ---------- */
  function hoursHTML(horario) {
    return horario.map(function (h) {
      return "<div><dt>" + esc(h.dias) + "</dt><dd>" + esc(rango(h)) + "</dd></div>";
    }).join("");
  }

  function renderHours() {
    if (!horarioGeneral.length) return;
    $$("[data-hours]").forEach(function (dl) { dl.innerHTML = hoursHTML(horarioGeneral); });
  }

  function nowInMonterrey() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Monterrey", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var day, h, m;
      parts.forEach(function (p) {
        if (p.type === "weekday") day = map[p.value];
        if (p.type === "hour") h = parseInt(p.value, 10) % 24;
        if (p.type === "minute") m = parseInt(p.value, 10);
      });
      if (day == null || isNaN(h) || isNaN(m)) return null;
      return { day: day, min: h * 60 + m };
    } catch (e) {
      return null;
    }
  }

  function scheduleFor(day) {
    for (var i = 0; i < horarioGeneral.length; i++) {
      if ((horarioGeneral[i].numeros || []).indexOf(day) !== -1) return horarioGeneral[i];
    }
    return null;
  }

  function updateStatus() {
    var el = $("[data-status]");
    if (!el || !horarioGeneral.length) return;
    var now = nowInMonterrey();
    if (!now) { el.hidden = true; return; }

    var hoy = scheduleFor(now.day);
    var texto, abierto = false;

    if (hoy && now.min >= toMinutes(hoy.abre) && now.min < toMinutes(hoy.cierra)) {
      abierto = true;
      texto = "Abierto ahora · cierra a las " + formatTime(hoy.cierra);
    } else if (hoy && now.min < toMinutes(hoy.abre)) {
      texto = "Cerrado · abre hoy a las " + formatTime(hoy.abre);
    } else {
      for (var i = 1; i <= 7; i++) {
        var d = (now.day + i) % 7;
        var sig = scheduleFor(d);
        if (sig) {
          texto = "Cerrado · abre " + (i === 1 ? "mañana" : "el " + DIAS[d]) + " a las " + formatTime(sig.abre);
          break;
        }
      }
    }
    if (!texto) { el.hidden = true; return; }
    el.textContent = texto;
    el.classList.toggle("is-open", abierto);
    el.classList.toggle("is-closed", !abierto);
    el.hidden = false;
  }

  /* ---------- Sucursales ---------- */
  function iconHTML(id) {
    return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  function branchHTML(s) {
    var tipo = TIPOS[s.tipo] || TIPOS.empeno;
    var nombre = nombreCompleto(s);
    var horario = s.horario && s.horario.length ? s.horario : horarioGeneral;
    var tel = s.telefono || cfg.telefono;

    var media = s.foto
      ? '<img src="' + esc(s.foto) + '" alt="Fachada de Empeño El Fraile, ' + esc(nombre) + '" loading="lazy" decoding="async" width="800" height="600">'
      : '<div class="facade" aria-hidden="true"><div class="facade__wall"><span class="facade__sign">' +
          esc(tipo.letrero) + "<small>El Fraile</small></span></div><div class=\"facade__base\"></div></div>";

    var horas = horario.map(function (h) {
      return '<span><b title="' + esc(h.dias) + '">' + esc(diasCortos(h)) + ":</b> " + esc(rango(h)) + "</span>";
    }).join("");

    var tags = s.autos
      ? '<div class="branch__tags"><span class="badge badge--autos">' + iconHTML("i-car") + "Empeño de autos</span></div>"
      : "";

    var llamar = telHref(tel)
      ? '<a class="btn btn--sm btn--outline" href="' + telHref(tel) + '">' + iconHTML("i-call") + "Llamar</a>"
      : "";

    return (
      '<article class="branch' + (s.foto ? "" : " branch--sin-foto") + '" data-reveal>' +
        '<div class="branch__media">' + media +
          '<span class="badge badge--' + esc(s.tipo) + '">' + esc(tipo.etiqueta) + "</span>" +
        "</div>" +
        '<div class="branch__body">' +
          '<h3 class="branch__title">' + esc(nombre) + "</h3>" +
          '<p class="branch__row">' + iconHTML("i-pin") +
            "<span>" + esc(s.calle) + "<br>" + esc(s.colonia) + ", " + esc(cfg.ciudad || "García, N.L.") + "</span></p>" +
          '<p class="branch__row">' + iconHTML("i-clock") + '<span class="branch__hours">' + horas + "</span></p>" +
          tags +
          '<div class="branch__actions">' +
            '<a class="btn btn--sm btn--indigo" href="' + esc(mapsHref(s)) + '" target="_blank" rel="noopener">' +
              iconHTML("i-pin") + "Cómo llegar</a>" +
            llamar +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderBranches() {
    var cont = $("[data-branches]");
    if (cont) cont.innerHTML = sucursales.map(branchHTML).join("");

    var lista = $("[data-bazares]");
    if (lista) {
      lista.innerHTML = sucursales.filter(esBazar).map(function (s) {
        var nombre = nombreCompleto(s);
        return (
          '<li class="mini-branch">' +
            "<div>" +
              '<p class="mini-branch__name">' + esc(nombre) + "</p>" +
              '<p class="mini-branch__addr">' + esc(s.calle) + ", " + esc(s.colonia) + "</p>" +
            "</div>" +
            '<a class="mini-branch__go" href="' + esc(mapsHref(s)) + '" target="_blank" rel="noopener" aria-label="Cómo llegar a ' + esc(nombre) + '">' +
              iconHTML("i-arrow") +
            "</a>" +
          "</li>"
        );
      }).join("") + bazarEnLineaHTML();
    }
  }

  function bazarEnLineaHTML() {
    var href = bazarEnLineaHref();
    var accion = href
      ? '<a class="mini-branch__go" href="' + esc(href) + '" target="_blank" rel="noopener" aria-label="Ir al Bazar en línea">' +
          iconHTML("i-arrow") + "</a>"
      : "";
    return (
      '<li class="mini-branch mini-branch--online">' +
        "<div>" +
          '<p class="mini-branch__name">Bazar en línea <span class="badge badge--online">En línea</span></p>' +
          '<p class="mini-branch__addr">Compra desde tu celular, sin salir de casa.</p>' +
        "</div>" +
        accion +
      "</li>"
    );
  }

  /* ---------- Datos estructurados para Google (SEO local) ---------- */
  function injectSchema() {
    try {
      var graph = sucursales.map(function (s) {
        var horario = s.horario && s.horario.length ? s.horario : horarioGeneral;
        var tel = localPhone(s.telefono || cfg.telefono);
        var item = {
          "@type": s.tipo === "bazar" ? "Store" : "PawnShop",
          "name": "Préstamos El Fraile – " + nombreCompleto(s),
          "address": {
            "@type": "PostalAddress",
            "streetAddress": (s.calle + ", " + s.colonia).replace(/#\s*/g, ""),
            "addressLocality": "García",
            "addressRegion": "N.L.",
            "addressCountry": "MX"
          },
          "openingHoursSpecification": horario.map(function (h) {
            return {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": (h.numeros || []).map(function (n) { return DIAS_SCHEMA[n]; }),
              "opens": h.abre,
              "closes": h.cierra
            };
          })
        };
        if (tel) item.telephone = "+52" + tel;
        if (s.foto && /^https?:/.test(location.protocol)) item.image = new URL(s.foto, location.href).href;
        return item;
      });
      var script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
      document.head.appendChild(script);
    } catch (e) { /* sin datos estructurados */ }
  }

  /* ---------- Menú móvil ---------- */
  function setupNav() {
    var body = document.body;
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (!toggle || !nav) return;
    var label = $(".visually-hidden", toggle);

    function setOpen(open) {
      body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Cerrar menú" : "Abrir menú";
    }

    toggle.addEventListener("click", function () { setOpen(!body.classList.contains("nav-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) { setOpen(false); toggle.focus(); }
    });
    if (window.matchMedia) {
      var mq = window.matchMedia("(min-width: 1000px)");
      var onChange = function () { if (mq.matches) setOpen(false); };
      if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ---------- Encabezado con sombra al hacer scroll ---------- */
  function setupHeader() {
    var header = $(".site-header");
    if (!header) return;
    var ticking = false;
    function update() { header.classList.toggle("is-scrolled", window.scrollY > 8); ticking = false; }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Resalta la sección actual en el menú ---------- */
  function setupActiveLinks() {
    if (!("IntersectionObserver" in window)) return;
    var links = $$(".site-nav__list a[href^='#']");
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        var a = byId[entry.target.id];
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (sec) { observer.observe(sec); });
  }

  /* ---------- Aparición suave de elementos ---------- */
  function setupReveal() {
    var items = $$("[data-reveal]");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    // Pequeño escalonado dentro de cada grupo (tarjetas)
    items.forEach(function (el) {
      var parent = el.parentElement;
      if (!parent) return;
      var siblings = Array.prototype.filter.call(parent.children, function (c) { return c.hasAttribute("data-reveal"); });
      var idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = (idx % 5) * 70 + "ms";
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Inicio ---------- */
  applyConfig();
  renderHours();
  updateStatus();
  setInterval(updateStatus, 60 * 1000);
  renderBranches();
  injectSchema();
  setupNav();
  setupHeader();
  setupActiveLinks();
  setupReveal();
})();
