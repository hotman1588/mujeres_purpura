const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("[data-donation]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    alert("El botón de donaciones quedará activo cuando agreguemos la información de recaudo.");
  });
});

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
    dot.addEventListener("click", () => scrollToCard(i));
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
      // Profundidad 3D: la tarjeta central se adelanta (+Z) y las lejanas se hunden (−Z).
      // (la perspectiva está en .pmc-track) — CALIBRAR: 70 = avance, 160 = rango de fondo.
      const translateZ = 70 - t * 160;

      card.style.transform = `translateZ(${translateZ.toFixed(0)}px) scale(${scale}) translateY(${translateY}px)`;
      card.style.opacity = opacity;
      card.classList.toggle("pmc-active", i === closestIndex);
      card.classList.toggle("pmc-near", Math.abs(i - closestIndex) === 1);
    });

    if (closestIndex !== activeIndex) {
      updateBackground(closestIndex);
      activeIndex = closestIndex;
      getDots().forEach((d, i) => d.classList.toggle("pmc-dot-active", i === activeIndex));
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
    focusCard(card);

    const art = card.querySelector(".pmc-art");
    if (!art) return;

    // Autoplay=1 fuerza reproducción inmediata dentro del embed
    const embedSrc = card.dataset.spotifyEmbed + "&autoplay=1";

    const iframe = document.createElement("iframe");
    iframe.className = "pmc-inline-player";
    iframe.src = embedSrc;
    iframe.title = "Spotify player";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");

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
    if (playIcon) {
      playIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        openInlinePlayer(card);
      });
    }
  });

  // CTA — centra la tarjeta y abre Spotify
  cards.forEach((card) => {
    const btn = card.querySelector(".pmc-cta");
    if (!btn) return;
    btn.addEventListener("click", () => {
      focusCard(card);
      const url = card.dataset.spotifyUrl;
      if (url) setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 320);
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
    dot.addEventListener("click", () => scrollToCard(i));
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
      updateBackground(closestIndex);
      activeIndex = closestIndex;
      getDots().forEach((d, i) => d.classList.toggle("ytc-dot-active", i === activeIndex));
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
      scrollToCard(index);
      setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
      if (url) setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 320);
    }

    if (playBtn) playBtn.addEventListener("click", (e) => { e.stopPropagation(); focusAndOpen(); });
    if (ctaBtn)  ctaBtn.addEventListener("click",  () => focusAndOpen());
  });

  const ro = new ResizeObserver(() => { setEdgePadding(); scrollToCard(activeIndex); updateCards(); });
  ro.observe(track);
  setEdgePadding();
  setTimeout(() => { scrollToCard(0); updateCards(); }, 80);
})();
