const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

if (toggle && links) {
  /* ── Íconos del menú móvil expandible (tap en ☰, estilo tarjeta) ──────────
     Se inyectan una sola vez y solo son visibles en la vista móvil vía CSS.
     La clave se resuelve por el destino del enlace o por su data-i18n.       */
  const NAV_ICONS = {
    home:       '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    about:      '<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
    multimedia: '<circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>',
    help:       '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4"/><line x1="12" y1="17" x2="12" y2="17.01"/>',
    contact:    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    donate:     '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>'
  };
  const iconKeyFor = (a) => {
    const i18n = (a.getAttribute("data-i18n") || "").split(".").pop();
    if (NAV_ICONS[i18n]) return i18n;
    if (a.hasAttribute("data-donation") || a.classList.contains("donate")) return "donate";
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href.includes("index") || href === "#" || href === "" || href.startsWith("#inicio")) return "home";
    if (href.includes("quienes")) return "about";
    if (href.includes("multimedia")) return "multimedia";
    if (href.includes("ayuda")) return "help";
    if (href.includes("contacto")) return "contact";
    return "home";
  };
  links.querySelectorAll("a").forEach((a) => {
    if (a.querySelector(".nav-ico")) return;
    const key = iconKeyFor(a);
    const span = document.createElement("span");
    span.className = "nav-ico";
    span.setAttribute("aria-hidden", "true");
    span.innerHTML =
      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${NAV_ICONS[key]}</svg>`;
    a.insertBefore(span, a.firstChild);
  });

  const setOpen = (open) => {
    links.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!links.classList.contains("open"));
  });

  // Cerrar al elegir una opción (+ scroll suave al Inicio si ya estamos ahí)
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", (e) => {
      // El trigger del mega-menú gestiona su propia apertura en móvil: no cerrar aquí
      if (a.classList.contains("mega-trigger") &&
          window.matchMedia("(max-width: 820px)").matches) {
        return;
      }
      if (iconKeyFor(a) === "home" && document.querySelector(".hero")) {
        // Mismo scroll suave al Inicio en desktop y móvil
        e.preventDefault();
        setOpen(false);
        // Esperar al cierre del panel para un desplazamiento fluido en móvil
        requestAnimationFrame(() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        );
        return;
      }
      setOpen(false);
    });
  });

  // Cerrar al tocar fuera del panel
  document.addEventListener("click", (e) => {
    if (links.classList.contains("open") &&
        !links.contains(e.target) && !toggle.contains(e.target)) {
      setOpen(false);
    }
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

/* ─── MEGA-MENÚ "QUIÉNES SOMOS" (2 columnas) ──────────────────────────────
   Hover en desktop · tap expandible en móvil. Se construye sobre el enlace
   de navegación existente para no duplicar HTML en cada página.            */
(function () {
  const nav = document.querySelector(".nav-links");
  if (!nav) return;
  const trigger = nav.querySelector('a[data-i18n="nav.about"]');
  if (!trigger) return;

  const ICO = {
    mission:
      '<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    vision:
      '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    values:
      '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    org:
      '<circle cx="12" cy="4.5" r="2.2"/><circle cx="4.6" cy="16" r="2.2"/><circle cx="19.4" cy="16" r="2.2"/><path d="M12 6.7v3M10.2 11 6 14M13.8 11 18 14"/>',
    map:
      '<path d="m9 4 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/>',
  };

  const HOME = "quienes-somos.html";
  const wrap = document.createElement("div");
  wrap.className = "has-mega";
  trigger.replaceWith(wrap);
  wrap.appendChild(trigger);
  trigger.classList.add("mega-trigger");
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");

  const panel = document.createElement("div");
  panel.className = "mega-panel";
  panel.setAttribute("role", "menu");
  panel.innerHTML = `
    <div class="mega-col">
      <p class="mega-col-title">Nuestra Esencia</p>
      <p class="mega-col-sub">Los principios de sororidad y equidad que nos mueven.</p>
      <a class="mega-link" role="menuitem" href="${HOME}#mision">
        <span class="mega-ico">${svg(ICO.mission)}</span>
        <span><strong>Misión</strong><em>Defender derechos y construir bienestar.</em></span>
      </a>
      <a class="mega-link" role="menuitem" href="${HOME}#vision">
        <span class="mega-ico">${svg(ICO.vision)}</span>
        <span><strong>Visión 2030</strong><em>Una organización comunitaria referente.</em></span>
      </a>
      <a class="mega-link" role="menuitem" href="${HOME}#valores">
        <span class="mega-ico">${svg(ICO.values)}</span>
        <span><strong>Valores</strong><em>Sororidad, equidad, justicia y más.</em></span>
      </a>
    </div>
    <div class="mega-col mega-col--alt">
      <p class="mega-col-title">Estructura Circular</p>
      <p class="mega-col-sub">Un círculo que nos une, no una pirámide que nos divide.</p>
      <a class="mega-link" role="menuitem" href="${HOME}#organigrama">
        <span class="mega-ico">${svg(ICO.org)}</span>
        <span><strong>Organigrama circular</strong><em>Gráfico dinámico, sin jerarquías.</em></span>
      </a>
      <a class="mega-link" role="menuitem" href="${HOME}#mapa-accion">
        <span class="mega-ico">${svg(ICO.map)}</span>
        <span><strong>Mapa de acción</strong><em>Impacto regional interactivo.</em></span>
      </a>
    </div>`;
  wrap.appendChild(panel);

  function svg(inner) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  }

  const isMobile = () => window.matchMedia("(max-width: 820px)").matches;
  const setOpen = (open) => {
    wrap.classList.toggle("mega-open", open);
    trigger.setAttribute("aria-expanded", String(open));
  };

  // Móvil: primer tap expande el submenú en lugar de navegar
  trigger.addEventListener("click", (e) => {
    if (isMobile()) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!wrap.classList.contains("mega-open"));
    }
  });

  // Al elegir una opción del mega-menú, cerrar también el panel móvil
  panel.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      setOpen(false);
      const list = document.querySelector(".nav-links.open");
      const tog = document.querySelector(".nav-toggle.open");
      if (list) list.classList.remove("open");
      if (tog) {
        tog.classList.remove("open");
        tog.setAttribute("aria-expanded", "false");
      }
    })
  );

  // Cerrar submenú al tocar fuera (móvil)
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
})();

/* ─── DONACIONES — modal de marca + Mercado Pago ──────────────────────────── */
(function () {
  // Link genérico (monto libre): el usuario escribe el valor en Mercado Pago
  const DONATE_URL = "https://link.mercadopago.com.co/fmujerespurpura";

  /* ┌─ LINKS DE PAGO POR MONTO ──────────────────────────────────────────────┐
     │ Para que el monto vaya YA FIJADO, crea en Mercado Pago un "Link de pago"│
     │ con valor fijo por cada monto y pega aquí su URL. Mientras esté vacío,  │
     │ ese botón usará el link genérico (monto libre).                         │
     │ Mercado Pago → Tu negocio → Link de pago → Crear (monto fijo).          │
     └─────────────────────────────────────────────────────────────────────────┘ */
  const DONATE_LINKS = {
    "20.000":  "",   // ← pega aquí el link de $20.000
    "50.000":  "",   // ← pega aquí el link de $50.000
    "100.000": ""    // ← pega aquí el link de $100.000
  };

  const donateButtons = document.querySelectorAll("[data-donation]");
  if (!donateButtons.length) return;

  // Crea el modal una sola vez y lo reutiliza en todas las páginas
  const overlay = document.createElement("div");
  overlay.className = "donate-modal";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Donar a Fundación Mujeres Púrpura");
  overlay.innerHTML = `
    <div class="donate-card" role="document">
      <button class="donate-close" type="button" aria-label="Cerrar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <!-- Cabecera con degradado y resplandor -->
      <div class="donate-banner">
        <span class="donate-spark donate-spark--1"></span>
        <span class="donate-spark donate-spark--2"></span>
        <span class="donate-spark donate-spark--3"></span>
      </div>
      <!-- Logo fuera de la cabecera para que no se recorte -->
      <div class="donate-logo-ring">
        <img class="donate-logo" src="${location.pathname.includes('/admin/') ? '../' : ''}assets/logo.jpg" alt="Fundación Mujeres Púrpura">
      </div>

      <div class="donate-body">
        <span class="donate-eyebrow">Tu aporte transforma vidas</span>
        <h3>Sé parte del cambio</h3>
        <p>Cada donación impulsa talleres, acompañamiento psicosocial y redes de apoyo para mujeres que lo necesitan.</p>

        <div class="donate-amounts" role="group" aria-label="Montos sugeridos">
          <button class="donate-amount" type="button" data-amt="20.000" data-impact="Aportas material para un taller comunitario.">$20.000</button>
          <button class="donate-amount donate-amount--featured" type="button" data-amt="50.000" data-impact="Financias una sesión de acompañamiento psicosocial.">$50.000</button>
          <button class="donate-amount" type="button" data-amt="100.000" data-impact="Apoyas a una mujer durante todo un programa.">$100.000</button>
          <button class="donate-amount" type="button" data-amt="" data-impact="Tú decides cuánto aportar. ¡Cada peso suma!">Otro monto</button>
        </div>

        <!-- Línea de impacto dinámica según el monto -->
        <div class="donate-impact-line" id="donateImpactLine">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span>Elige un monto para ver tu impacto.</span>
        </div>

        <a class="donate-cta" href="${DONATE_URL}" target="_blank" rel="noopener">
          <svg class="donate-cta-heart" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span>Donar con Mercado Pago</span>
          <svg class="donate-cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>

        <!-- Métodos de pago + sello seguro -->
        <div class="donate-methods" aria-label="Métodos de pago aceptados">
          <span class="donate-method">VISA</span>
          <span class="donate-method">Mastercard</span>
          <span class="donate-method">PSE</span>
          <span class="donate-method">Efectivo</span>
        </div>
        <div class="donate-secure">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Procesado de forma segura por Mercado Pago
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector(".donate-close");
  const cta = overlay.querySelector(".donate-cta");

  function openModal(e) {
    if (e) e.preventDefault();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  donateButtons.forEach((btn) => btn.addEventListener("click", openModal));
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  // Al continuar al pago: cerramos el modal y marcamos que inició una donación
  cta.addEventListener("click", () => {
    sessionStorage.setItem("mp_donation_started", String(Date.now()));
    setTimeout(closeModal, 100);
  });

  /* ─── MODAL DE AGRADECIMIENTO (post-donación) ─────────────────────────────── */
  const thanks = document.createElement("div");
  thanks.className = "thanks-modal";
  thanks.setAttribute("role", "dialog");
  thanks.setAttribute("aria-modal", "true");
  thanks.setAttribute("aria-label", "Gracias por tu donación");
  thanks.innerHTML = `
    <div class="thanks-card" role="document">
      <div class="thanks-confetti" aria-hidden="true"></div>
      <button class="thanks-close" type="button" aria-label="Cerrar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="thanks-badge">
        <svg class="thanks-check" width="46" height="46" viewBox="0 0 52 52" aria-hidden="true">
          <circle class="thanks-check-circle" cx="26" cy="26" r="24" fill="none"/>
          <path class="thanks-check-mark" fill="none" d="M14 27l8 8 16-16"/>
        </svg>
      </div>
      <span class="thanks-eyebrow">Donación recibida</span>
      <h3>¡Gracias por tu generosidad! 💜</h3>
      <p>Tu aporte se convierte en talleres, acompañamiento y oportunidades reales para más mujeres. Eres parte del cambio.</p>
      <div class="thanks-actions">
        <button class="thanks-btn primary" type="button" data-close>Volver al inicio</button>
        <a class="thanks-btn ghost" href="https://instagram.com/fmujerespurpura" target="_blank" rel="noopener">Síguenos en Instagram</a>
      </div>
      <p class="thanks-note">Recibirás el comprobante de Mercado Pago en tu correo.</p>
    </div>`;
  document.body.appendChild(thanks);

  const confettiBox = thanks.querySelector(".thanks-confetti");
  function launchConfetti() {
    confettiBox.innerHTML = "";
    const colors = ["#6f60a8", "#95dce2", "#36aeb8", "#e88472", "#9185c7"];
    for (let i = 0; i < 26; i++) {
      const p = document.createElement("span");
      p.className = "confetti-piece";
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.5) + "s";
      p.style.animationDuration = (1.8 + Math.random() * 1.4) + "s";
      p.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
      confettiBox.appendChild(p);
    }
  }
  function showThanks() {
    thanks.classList.add("is-open");
    document.body.style.overflow = "hidden";
    launchConfetti();
  }
  function closeThanks() {
    thanks.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  thanks.querySelector(".thanks-close").addEventListener("click", closeThanks);
  thanks.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeThanks));
  thanks.addEventListener("click", (e) => { if (e.target === thanks) closeThanks(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeThanks(); });

  // (1) Retorno desde Mercado Pago con ?donacion=gracias o ?status=approved
  const params = new URLSearchParams(location.search);
  if (params.get("donacion") === "gracias" || params.get("status") === "approved") {
    setTimeout(showThanks, 400);
    // Limpia la URL para que no se repita al recargar
    params.delete("donacion"); params.delete("status");
    const clean = location.pathname + (params.toString() ? "?" + params.toString() : "");
    history.replaceState(null, "", clean);
    sessionStorage.removeItem("mp_donation_started");
  }

  // (2) Volvió a la pestaña tras iniciar la donación (mín. 6 s fuera)
  function maybeThankOnReturn() {
    const started = parseInt(sessionStorage.getItem("mp_donation_started") || "0", 10);
    if (started && Date.now() - started > 6000) {
      sessionStorage.removeItem("mp_donation_started");
      showThanks();
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") maybeThankOnReturn();
  });
  window.addEventListener("focus", maybeThankOnReturn);

  // Montos sugeridos: además de resaltar, ajustan el destino del botón de pago.
  const ctaLabel = cta.querySelector("span");
  const impactLine = overlay.querySelector("#donateImpactLine span");
  function setCta(url, label) {
    cta.href = url;
    if (ctaLabel) ctaLabel.textContent = label;
  }
  overlay.querySelectorAll(".donate-amount").forEach((b) => {
    b.addEventListener("click", () => {
      overlay.querySelectorAll(".donate-amount").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      const amt = b.dataset.amt;                       // "50.000" o "" (Otro monto)
      // Línea de impacto dinámica (con animación de entrada)
      if (impactLine && b.dataset.impact) {
        impactLine.textContent = b.dataset.impact;
        const line = overlay.querySelector("#donateImpactLine");
        line.classList.remove("pulse"); void line.offsetWidth; line.classList.add("pulse");
      }
      const specific = amt && DONATE_LINKS[amt];        // link fijo si existe
      if (specific) {
        setCta(specific, "Donar $" + amt);              // monto YA fijado en el link
      } else {
        // Sin link específico → genérico (monto libre, se escribe en Mercado Pago)
        setCta(DONATE_URL, amt ? "Donar $" + amt : "Donar con Mercado Pago");
      }
    });
  });
})();

/* ─── PREMIUM MULTIMEDIA CAROUSEL ─────────────────────────────────────────── */
(function () {
  const track = document.getElementById("pmcTrack");
  const dotsContainer = document.getElementById("pmcDots");
  const bgEl = document.getElementById("pmcBg");
  if (!track || !dotsContainer) return;

  const cards = Array.from(track.querySelectorAll(".pmc-card"));
  let activeIndex = -1;
  let rafId = null;
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  function updateBackground(index) {
    if (!bgEl || index === activeIndex) return;
    const img = cards[index] && cards[index].querySelector(".pmc-art-img");
    if (!img) return;
    bgEl.style.opacity = "0";
    setTimeout(() => {
      bgEl.style.backgroundImage = `url('${img.src}')`;
      bgEl.style.opacity = "1";
    }, 220);
  }

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "pmc-dot" + (i === 0 ? " pmc-dot-active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Episodio " + (i + 1));
    dot.addEventListener("click", () => {
      setActiveCard(i);
      scrollToCard(i);
    });
    dotsContainer.appendChild(dot);
  });

  function getDots() {
    return Array.from(dotsContainer.querySelectorAll(".pmc-dot"));
  }

  function scrollToCard(index) {
    const card = cards[index];
    if (!card) return;
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset = cardRect.left - trackRect.left - (trackRect.width - cardRect.width) / 2;
    track.scrollBy({ left: offset, behavior: "smooth" });
  }

  function setActiveCard(index) {
    if (index < 0 || index >= cards.length || index === activeIndex) return;
    activeIndex = index;
    updateBackground(index);
    getDots().forEach((d, i) => d.classList.toggle("pmc-dot-active", i === activeIndex));
    cards.forEach((card, i) => {
      card.classList.toggle("pmc-active", i === activeIndex);
      card.classList.toggle("pmc-near", Math.abs(i - activeIndex) === 1);
    });
  }

  function updateCards() {
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closestIndex = 0;
    let closestDist = Infinity;

    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < closestDist) { closestDist = dist; closestIndex = i; }

      const maxDist = trackRect.width * 0.6;
      const t = Math.min(dist / maxDist, 1);
      const scale = 1.06 - t * 0.22;
      const translateY = t * 12;
      const opacity = 1 - t * 0.45;

      card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      card.style.opacity = opacity;
      card.classList.toggle("pmc-active", i === closestIndex);
      card.classList.toggle("pmc-near", Math.abs(i - closestIndex) === 1);
    });

    if (closestIndex !== activeIndex) {
      setActiveCard(closestIndex);
    }
  }

  // Set initial padding so first/last card can center
  function setEdgePadding() {
    const trackRect = track.getBoundingClientRect();
    const card = cards[0];
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const pad = Math.max(16, (trackRect.width - cardWidth) / 2);
    track.style.paddingLeft = pad + "px";
    track.style.paddingRight = pad + "px";
  }

  // Drag-to-scroll (mouse)
  track.addEventListener("mousedown", (e) => {
    isDown = true;
    track.style.scrollSnapType = "none";
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener("mouseleave", endDrag);
  track.addEventListener("mouseup", endDrag);
  track.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX);
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    track.style.scrollSnapType = "x mandatory";
    scrollToCard(activeIndex);
  }

  track.addEventListener("scroll", () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateCards);
  }, { passive: true });

  // Reproductor inline con auto-cierre y autoplay
  let activePlayerCard = null;

  function closeInlinePlayer(card) {
    if (!card) return;
    const art = card.querySelector(".pmc-art");
    if (!art) return;
    const iframe = art.querySelector(".pmc-inline-player");
    const closeBtn = art.querySelector(".pmc-inline-close");
    if (iframe) iframe.remove();
    if (closeBtn) closeBtn.remove();
    art.classList.remove("pmc-art--playing");
    if (activePlayerCard === card) activePlayerCard = null;
  }

  function focusCard(card) {
    const index = cards.indexOf(card);
    if (index !== -1) scrollToCard(index);
    setTimeout(() => {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
  }

  function openInlinePlayer(card) {
    if (activePlayerCard === card) {
      closeInlinePlayer(card);
      return;
    }
    if (activePlayerCard) closeInlinePlayer(activePlayerCard);
    const index = cards.indexOf(card);
    setActiveCard(index);
    focusCard(card);

    const art = card.querySelector(".pmc-art");
    if (!art) return;

    let embedSrc = card.dataset.spotifyEmbed || "";
    try {
      const url = new URL(embedSrc);
      url.searchParams.set("autoplay", "1");
      embedSrc = url.toString();
    } catch (error) {
      embedSrc = embedSrc + (embedSrc.includes("?") ? "&" : "?") + "autoplay=1";
    }

    const iframe = document.createElement("iframe");
    iframe.className = "pmc-inline-player";
    iframe.src = embedSrc;
    iframe.title = `Spotify player – ${card.querySelector(".pmc-title")?.textContent || "Podcast"}`;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("loading", "lazy");

    const closeBtn = document.createElement("button");
    closeBtn.className = "pmc-inline-close";
    closeBtn.setAttribute("aria-label", "Cerrar reproductor");
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeInlinePlayer(card);
    });

    art.classList.add("pmc-art--playing");
    art.appendChild(iframe);
    art.appendChild(closeBtn);
    activePlayerCard = card;
  }

  cards.forEach((card) => {
    const playIcon = card.querySelector(".pmc-play-icon");
    const btn = card.querySelector(".pmc-cta");
    const art = card.querySelector(".pmc-art");
    const url = card.dataset.spotifyUrl;

    function activateAndPlay() {
      openInlinePlayer(card);
    }

    if (playIcon) {
      playIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        activateAndPlay();
      });
    }

    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        focusCard(card);
        if (url) setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 320);
      });
    }

    if (art) {
      art.addEventListener("click", (e) => {
        if (e.target.closest(".pmc-play-icon")) return;
        e.stopPropagation();
        const index = cards.indexOf(card);
        if (index >= 0 && index !== activeIndex) {
          setActiveCard(index);
          scrollToCard(index);
          setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
        }
      });
    }

    card.addEventListener("click", (e) => {
      if (e.target.closest(".pmc-play-icon") || e.target.closest(".pmc-cta") || e.target.closest("a")) return;
      const index = cards.indexOf(card);
      if (index >= 0 && index !== activeIndex) {
        setActiveCard(index);
        scrollToCard(index);
        setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
      }
    });
  });

  // Init
  const ro = new ResizeObserver(() => {
    setEdgePadding();
    scrollToCard(activeIndex);
    updateCards();
  });
  ro.observe(track);
  setEdgePadding();
  setTimeout(() => {
    scrollToCard(0);
    updateCards();
  }, 80);
})();
/* ─── FIN PREMIUM MULTIMEDIA CAROUSEL ─────────────────────────────────────── */

document.querySelectorAll("[data-episode-browser]").forEach((browser) => {
  const player = browser.querySelector("#spotify-player");
  const options = browser.querySelectorAll("[data-spotify-src]");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      if (!player) return;
      player.src = option.dataset.spotifySrc;
      options.forEach((item) => item.classList.remove("active"));
      option.classList.add("active");
    });
  });
});

/* ─── YOUTUBE CAROUSEL ────────────────────────────────────────────────────── */
(function () {
  const track = document.getElementById("ytcTrack");
  const dotsContainer = document.getElementById("ytcDots");
  const bgEl = document.getElementById("ytcBg");
  if (!track || !dotsContainer) return;

  const cards = Array.from(track.querySelectorAll(".ytc-card"));
  let activeIndex = -1;
  let rafId = null;
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  function updateBackground(index) {
    if (!bgEl || index === activeIndex) return;
    const img = cards[index] && cards[index].querySelector(".ytc-img");
    if (!img) return;
    bgEl.style.opacity = "0";
    setTimeout(() => {
      bgEl.style.backgroundImage = `url('${img.src}')`;
      bgEl.style.opacity = "1";
    }, 220);
  }

  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "ytc-dot" + (i === 0 ? " ytc-dot-active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Video " + (i + 1));
    dot.addEventListener("click", () => {
      setActiveCard(i);
      scrollToCard(i);
    });
    dotsContainer.appendChild(dot);
  });

  function getDots() {
    return Array.from(dotsContainer.querySelectorAll(".ytc-dot"));
  }

  function scrollToCard(index) {
    const card = cards[index];
    if (!card) return;
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset = cardRect.left - trackRect.left - (trackRect.width - cardRect.width) / 2;
    track.scrollBy({ left: offset, behavior: "smooth" });
  }

  function setActiveCard(index) {
    if (index < 0 || index >= cards.length || index === activeIndex) return;
    activeIndex = index;
    updateBackground(index);
    getDots().forEach((d, i) => d.classList.toggle("ytc-dot-active", i === activeIndex));
    cards.forEach((card, i) => {
      card.classList.toggle("ytc-active", i === activeIndex);
      card.classList.toggle("ytc-near", Math.abs(i - activeIndex) === 1);
    });
  }

  function updateCards() {
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closestIndex = 0;
    let closestDist = Infinity;

    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < closestDist) { closestDist = dist; closestIndex = i; }

      const maxDist = trackRect.width * 0.6;
      const t = Math.min(dist / maxDist, 1);
      card.style.transform = `scale(${1.05 - t * 0.22}) translateY(${t * 14}px)`;
      card.style.opacity = 1 - t * 0.5;
      card.classList.toggle("ytc-active", i === closestIndex);
      card.classList.toggle("ytc-near", Math.abs(i - closestIndex) === 1);
    });

    if (closestIndex !== activeIndex) {
      setActiveCard(closestIndex);
    }
  }

  function setEdgePadding() {
    const trackRect = track.getBoundingClientRect();
    const card = cards[0];
    if (!card) return;
    const pad = Math.max(16, (trackRect.width - card.offsetWidth) / 2);
    track.style.paddingLeft = pad + "px";
    track.style.paddingRight = pad + "px";
  }

  track.addEventListener("mousedown", (e) => {
    isDown = true;
    track.style.scrollSnapType = "none";
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener("mouseleave", endDrag);
  track.addEventListener("mouseup", endDrag);
  track.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX);
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    track.style.scrollSnapType = "x mandatory";
    scrollToCard(activeIndex);
  }

  track.addEventListener("scroll", () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateCards);
  }, { passive: true });

  // Play button → focus card + open YouTube
  cards.forEach((card) => {
    const playBtn = card.querySelector(".ytc-play");
    const ctaBtn  = card.querySelector(".ytc-cta");
    const url = card.dataset.ytUrl;

    function focusAndOpen() {
      const index = cards.indexOf(card);
      setActiveCard(index);
      scrollToCard(index);
      setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
      if (url) setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 320);
    }

    if (playBtn) playBtn.addEventListener("click", (e) => { e.stopPropagation(); focusAndOpen(); });
    if (ctaBtn)  ctaBtn.addEventListener("click",  (e) => { e.stopPropagation(); focusAndOpen(); });

    card.addEventListener("click", (e) => {
      if (e.target.closest(".ytc-play") || e.target.closest(".ytc-cta") || e.target.closest("a")) return;
      const index = cards.indexOf(card);
      if (index >= 0 && index !== activeIndex) {
        setActiveCard(index);
        scrollToCard(index);
        setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
      }
    });
  });

  const ro = new ResizeObserver(() => { setEdgePadding(); scrollToCard(activeIndex); updateCards(); });
  ro.observe(track);
  setEdgePadding();
  setTimeout(() => { scrollToCard(0); updateCards(); }, 80);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   WIDGET DE EMERGENCIA — "Ruta de Ayuda Psicológica"
   Botón flotante permanente (esquina inferior derecha) que abre un modal con
   un árbol de decisiones: emergencia, primeros auxilios psicológicos y
   derivación a instituciones aliadas. Se inyecta en todas las páginas.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  if (document.querySelector(".sos-fab")) return;

  const WA = "https://wa.me/573107623336"; // WhatsApp de la Fundación
  const svg = (p) =>
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

  const ICON = {
    danger:  '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17.01"/>',
    heart:   '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    building:'<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/>',
    phone:   '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    wa:      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    form:    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>'
  };

  /* ── Árbol de decisiones ────────────────────────────────────────────── */
  const NODES = {
    root: {
      title: "Ruta de Ayuda Psicológica",
      intro: "No estás sola. Cuéntanos qué necesitas ahora y te mostramos el camino más rápido.",
      items: [
        { ico: "danger",   goto: "emergencia",  danger: true,
          t: "Estoy en peligro ahora", d: "Riesgo inmediato para tu vida o integridad." },
        { ico: "heart",    goto: "auxilios",
          t: "Necesito calmarme o hablar", d: "Apoyo emocional y primeros auxilios psicológicos." },
        { ico: "building", goto: "instituciones",
          t: "Quiero orientación profesional", d: "Instituciones aliadas y rutas de atención." }
      ]
    },
    emergencia: {
      title: "Si tu vida corre peligro",
      intro: "Llama de inmediato. Estas líneas atienden 24/7 y son gratuitas.",
      items: [
        { ico: "phone", tel: "123", danger: true,
          t: "Emergencias — 123", d: "Policía y atención inmediata." },
        { ico: "phone", tel: "155",
          t: "Línea 155", d: "Orientación a mujeres víctimas de violencia." },
        { ico: "phone", tel: "018000112137",
          t: "Línea Púrpura", d: "Apoyo psicosocial y jurídico para mujeres." },
        { ico: "wa", href: WA,
          t: "WhatsApp de la Fundación", d: "Escríbenos, te acompañamos." }
      ]
    },
    auxilios: {
      title: "Primeros auxilios psicológicos",
      tips: [
        "<strong>Respira:</strong> inhala 4 seg, sostén 4, exhala 6. Repítelo 5 veces.",
        "<strong>Ancla tu atención (5-4-3-2-1):</strong> nombra 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas.",
        "<strong>Recuerda:</strong> lo que sientes es válido y va a pasar. No tienes que resolverlo sola."
      ],
      intro: "Cuando te sientas lista, da el siguiente paso:",
      items: [
        { ico: "wa", href: WA,
          t: "Hablar con la Fundación", d: "Acompañamiento por WhatsApp." },
        { ico: "form", href: "index.html#ayuda", internal: "#ayuda",
          t: "Pedir ayuda ahora", d: "Déjanos tus datos de forma confidencial." }
      ]
    },
    instituciones: {
      title: "Instituciones aliadas",
      intro: "Puedes acudir directamente a estas entidades de atención en Colombia.",
      items: [
        { ico: "form", href: "index.html#ayuda", internal: "#ayuda",
          t: "Fundación Mujeres Púrpura", d: "Acompañamiento y derivación." },
        { ico: "phone", tel: "155",
          t: "Comisarías de Familia — 155", d: "Medidas de protección." },
        { ico: "phone", tel: "122",
          t: "Fiscalía — 122", d: "Denuncia de delitos." },
        { ico: "phone", tel: "141",
          t: "ICBF — 141", d: "Protección de niñas, niños y adolescentes." }
      ]
    }
  };

  /* ── Construir el DOM del widget ────────────────────────────────────── */
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "sos-fab";
  fab.setAttribute("aria-haspopup", "dialog");
  fab.setAttribute("aria-label", "Abrir Ruta de Ayuda Psicológica");
  fab.innerHTML =
    `<span class="sos-fab-ico">${svg(ICON.heart)}</span>` +
    `<span class="sos-fab-label">Ruta de Ayuda Psicológica</span>`;

  const overlay = document.createElement("div");
  overlay.className = "sos-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Ruta de Ayuda Psicológica");
  overlay.innerHTML =
    '<div class="sos-modal">' +
      '<div class="sos-head">' +
        '<button class="sos-back" type="button" aria-label="Volver">' + svg('<polyline points="15 18 9 12 15 6"/>') + '</button>' +
        '<h3></h3>' +
        '<button class="sos-close" type="button" aria-label="Cerrar">&times;</button>' +
      '</div>' +
      '<div class="sos-body"></div>' +
    '</div>';

  document.body.appendChild(fab);
  document.body.appendChild(overlay);

  const modal   = overlay.querySelector(".sos-modal");
  const titleEl = overlay.querySelector(".sos-head h3");
  const bodyEl  = overlay.querySelector(".sos-body");
  const backBtn = overlay.querySelector(".sos-back");
  const closeBtn= overlay.querySelector(".sos-close");
  let lastFocus = null;

  function render(key) {
    const node = NODES[key];
    if (!node) return;
    overlay.dataset.node = key;
    titleEl.textContent = node.title;
    backBtn.classList.toggle("show", key !== "root");

    let html = "";
    if (node.tips) {
      html += '<ul class="sos-tips">' + node.tips.map((t) => "<li>" + t + "</li>").join("") + "</ul>";
    }
    if (node.intro) html += '<p class="sos-intro">' + node.intro + "</p>";

    node.items.forEach((it) => {
      const ico = '<span class="sos-item-ico">' + svg(ICON[it.ico] || ICON.heart) + "</span>";
      const label = "<span><strong>" + it.t + "</strong><span>" + (it.d || "") + "</span></span>";
      const cls = "sos-item" + (it.danger ? " danger" : "");
      if (it.goto) {
        html += '<button type="button" class="' + cls + '" data-goto="' + it.goto + '">' + ico + label + "</button>";
      } else if (it.tel) {
        html += '<a class="' + cls + '" href="tel:' + it.tel + '">' + ico + label + "</a>";
      } else {
        const attrs = it.internal ? ' data-internal="' + it.internal + '"' : ' target="_blank" rel="noopener"';
        html += '<a class="' + cls + '" href="' + it.href + '"' + attrs + ">" + ico + label + "</a>";
      }
    });
    bodyEl.innerHTML = html;
    modal.scrollTop = 0;
  }

  function open() {
    lastFocus = document.activeElement;
    render("root");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }
  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  fab.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backBtn.addEventListener("click", () => render("root"));

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
    const nav = e.target.closest("[data-goto]");
    if (nav) { render(nav.dataset.goto); return; }
    // Enlaces internos (#ayuda): abrir el modal de ayuda o desplazar en la página
    const internal = e.target.closest("[data-internal]");
    if (internal) {
      const sel = internal.dataset.internal;
      if (sel === "#ayuda" && typeof window.openAyudaModal === "function") {
        e.preventDefault();
        close();
        setTimeout(() => window.openAyudaModal(), 160);
        return;
      }
      const target = document.querySelector(sel);
      if (target) {
        e.preventDefault();
        close();
        setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
      // Si no hay destino en esta página, se deja navegar (p. ej. index.html#ayuda)
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });
})();

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL DE AYUDA CONFIDENCIAL — se activa al "Pedir ayuda a la Fundación"
   El formulario ya no vive en la landing: aparece sobrepuesto cuando se pulsa
   "Ayuda" en el menú, el botón de la Ruta de Ayuda o cualquier enlace #ayuda.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const overlay = document.getElementById("ayudaOverlay");
  if (!overlay) return; // Solo existe en index.html
  // Sacar el overlay de cualquier ancestro con transform (data-reveal),
  // así 'position: fixed' se ancla a la ventana y queda centrado de verdad.
  if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
  const closeBtn = overlay.querySelector(".help-modal-close");
  let lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const first = overlay.querySelector("input, select, textarea, button");
    if (first) setTimeout(() => first.focus(), 60);
  }
  function close() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    // Limpiar el hash para que no reabra al recargar
    if (location.hash === "#ayuda") {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  // Exponer para que otros widgets (Ruta de Ayuda) lo abran
  window.openAyudaModal = open;

  // Interceptar cualquier enlace hacia #ayuda para abrir el modal
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href$="#ayuda"], a[href="#ayuda"]');
    if (link) {
      e.preventDefault();
      open();
    }
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });

  // Si se llega con #ayuda en la URL (p. ej. desde otra página), abrir al cargar
  if (location.hash === "#ayuda") setTimeout(open, 200);
})();
