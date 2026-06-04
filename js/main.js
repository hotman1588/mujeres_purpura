const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

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
  // Al continuar al pago, cerramos el modal (el enlace abre en pestaña nueva)
  cta.addEventListener("click", () => setTimeout(closeModal, 100));

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
