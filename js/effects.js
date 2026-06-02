/* ─── HERO PARALLAX + CINEMATIC ANIMATIONS ───────────────────────────────── */
(function () {
  const hero = document.querySelector(".hero");
  const heroCopy = document.querySelector(".hero-copy");

  /* ── Mouse parallax con lerp suave ── */
  if (hero && heroCopy) {
    let tX = 0, tY = 0, cX = 0, cY = 0;
    let rafRunning = false;

    function lerpParallax() {
      cX += (tX - cX) * 0.055;
      cY += (tY - cY) * 0.055;

      // Fondo se mueve en dirección del mouse (profundidad)
      hero.style.backgroundPosition =
        `calc(50% + ${cX * 28}px) calc(50% + ${cY * 20}px)`;

      // Texto se mueve ligeramente en sentido contrario (depth layer)
      heroCopy.style.transform =
        `translate(${cX * -7}px, ${cY * -5}px)`;

      if (Math.abs(tX - cX) > 0.01 || Math.abs(tY - cY) > 0.01) {
        requestAnimationFrame(lerpParallax);
      } else {
        rafRunning = false;
      }
    }

    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tX = (e.clientX - r.left)  / r.width  - 0.5;
      tY = (e.clientY - r.top)   / r.height - 0.5;
      if (!rafRunning) { rafRunning = true; requestAnimationFrame(lerpParallax); }
    });

    hero.addEventListener("mouseleave", () => {
      tX = 0; tY = 0;
      if (!rafRunning) { rafRunning = true; requestAnimationFrame(lerpParallax); }
    });

    /* ── Scroll parallax — fondo sube más lento que la página ── */
    const onScroll = () => {
      const scrolled = window.scrollY;
      if (scrolled > hero.offsetHeight) return;
      hero.style.backgroundPositionY =
        `calc(50% + ${scrolled * 0.28}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── Hero stagger de entrada ── */
  if (heroCopy) {
    Array.from(heroCopy.children).forEach((el, i) => {
      el.style.animation =
        `heroIn 0.75s cubic-bezier(0.16,1,0.3,1) ${i * 0.14 + 0.08}s both`;
    });
  }

  /* ── Scroll reveal general ── */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("revealed");
      revealObs.unobserve(e.target);
    }),
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  requestAnimationFrame(() => {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.classList.add("js-reveal");
      revealObs.observe(el);
    });
  });

  /* ── Count-up en stats ── */
  function countUp(el) {
    const raw = el.dataset.count;
    const plus = raw.endsWith("+");
    const target = parseFloat(raw);
    const suffix = plus ? "+" : (el.dataset.suffix || "");
    const dur = 1500, t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.floor(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  const countObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countUp(e.target);
      countObs.unobserve(e.target);
    }),
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => countObs.observe(el));

  /* ── Magnetic buttons ── */
  document.querySelectorAll(".button, .lang-btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left  - r.width  / 2) * 0.1;
      const y = (e.clientY - r.top   - r.height / 2) * 0.14;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });

  /* ── Header scroll shadow ── */
  const header = document.querySelector(".site-header");
  if (header) {
    const onHeaderScroll = () =>
      header.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  /* ── Carrusel de flip-cards "Voces que transforman" ──────────────────────────
     Cara frontal con el logo; al pasar el cursor o tocar, la tarjeta gira y
     muestra el comentario. Flechas + puntos para recorrer las tarjetas. */
  const vocesCarousel = document.querySelector(".voces-carousel");
  if (vocesCarousel) {
    const track = vocesCarousel.querySelector(".voces-track");
    const cards = Array.from(track.querySelectorAll(".flip-card"));
    const prevBtn = vocesCarousel.querySelector(".voces-prev");
    const nextBtn = vocesCarousel.querySelector(".voces-next");
    const dotsWrap = document.querySelector(".voces-dots");
    const isTouch = window.matchMedia("(hover: none)").matches;

    // Flip por toque/click en pantallas sin hover (móvil)
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (isTouch) card.classList.toggle("is-flipped");
      });
      // Accesibilidad: girar con Enter/Espacio cuando la tarjeta tiene foco
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.toggle("is-flipped");
        }
      });
    });

    // Puntos indicadores (uno por tarjeta)
    const dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "voces-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", "Ir al testimonio " + (i + 1));
      dot.addEventListener("click", () => scrollToCard(i));
      dotsWrap && dotsWrap.appendChild(dot);
      return dot;
    });

    function scrollToCard(i) {
      const card = cards[i];
      if (!card) return;
      // Centra la tarjeta dentro de la pista
      track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
    }

    function currentIndex() {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const d = Math.abs(cardCenter - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function updateUI() {
      const idx = currentIndex();
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    }

    prevBtn && prevBtn.addEventListener("click", () => scrollToCard(Math.max(0, currentIndex() - 1)));
    nextBtn && nextBtn.addEventListener("click", () => scrollToCard(Math.min(cards.length - 1, currentIndex() + 1)));

    let tId = null;
    track.addEventListener("scroll", () => {
      if (tId) return;
      tId = requestAnimationFrame(() => { updateUI(); tId = null; });
    }, { passive: true });
    window.addEventListener("resize", updateUI, { passive: true });
    updateUI();
  }

  /* ── Video sello institucional ── */
  const vselloVideo = document.getElementById("vselloVideo");
  const vselloOverlay = document.getElementById("vselloOverlay");
  if (vselloVideo && vselloOverlay) {
    vselloOverlay.addEventListener("click", () => {
      vselloVideo.setAttribute("controls", "");   // muestra los controles nativos al reproducir
      const playPromise = vselloVideo.play();
      if (playPromise && playPromise.then) {
        playPromise.then(() => vselloOverlay.classList.add("is-hidden"))
          .catch(() => {
            // Si no hay archivo de video aún, lleva al usuario a la página Multimedia
            window.location.href = "multimedia.html";
          });
      } else {
        vselloOverlay.classList.add("is-hidden");
      }
    });
    // Al terminar o pausar, vuelve a mostrar la portada con el botón
    vselloVideo.addEventListener("ended", () => vselloOverlay.classList.remove("is-hidden"));
  }

  /* ── Galería 3D: anillo giratorio que muestra TODAS las fotos de la carpeta ──
     El nº de tarjetas y su posición se calculan solos según cuántas fotos haya
     (ángulo = 360/N; radio = (ancho/2)/tan(180/N)). Para añadir fotos, basta con
     dejarlas en la carpeta Fotos/ (o añadir su nombre a FALLBACK_FOTOS). */
  const ring = document.getElementById("ring3d");
  if (ring) {
    // Lista de respaldo (se usa si no se puede leer la carpeta automáticamente).
    // Añade aquí el nombre de archivo de cualquier foto nueva.
    const FALLBACK_FOTOS = [
      "img15.jpg", "img22.jpg", "img30.jpg", "img52.jpg",
      "img64.jpg", "img70.jpg", "img76.jpg", "img87.jpg",
      "img133.jpg", "img178.jpg", "img179.jpg"
    ];

    function buildRing(files) {
      const N = files.length;
      if (!N) return;
      ring.innerHTML = "";
      // Ancho de tarjeta según pantalla (coincide con el CSS) y separación
      const isMobile = window.matchMedia("(max-width: 600px)").matches;
      const cardW = isMobile ? 180 : 260;
      const gap = isMobile ? 40 : 70;
      // Radio del anillo: fórmula equidistante (con mínimo para que no se solapen)
      const radius = Math.max(
        Math.round(((cardW + gap) / 2) / Math.tan(Math.PI / N)),
        cardW
      );
      const step = 360 / N; // ángulo entre tarjetas
      files.forEach((src, i) => {
        const card = document.createElement("div");
        card.className = "ring3d-card";
        card.setAttribute("role", "img");
        card.setAttribute("aria-label", "Foto " + (i + 1) + " de la comunidad");
        card.style.backgroundImage = "url('Fotos/" + src + "')";
        // Distribución equidistante: rotateY + translateZ
        card.style.transform = "rotateY(" + (i * step) + "deg) translateZ(" + radius + "px)";
        ring.appendChild(card);
      });
    }

    // Intenta leer el listado de la carpeta Fotos/ (autoindex del servidor);
    // si no se puede (p. ej. hosting sin listado), usa la lista de respaldo.
    fetch("Fotos/")
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((html) => {
        const found = Array.from(html.matchAll(/href="([^"]+\.(?:jpe?g|png|webp))"/gi))
          .map((m) => decodeURIComponent(m[1].split("/").pop()))
          .filter((v, i, a) => a.indexOf(v) === i); // sin duplicados
        buildRing(found.length ? found : FALLBACK_FOTOS);
      })
      .catch(() => buildRing(FALLBACK_FOTOS));

    // Recalcula posiciones al cambiar el tamaño (móvil/escritorio)
    let ringResizeId = null;
    window.addEventListener("resize", () => {
      if (ringResizeId) return;
      ringResizeId = setTimeout(() => {
        ringResizeId = null;
        const files = Array.from(ring.children).map((c) =>
          (c.style.backgroundImage.match(/Fotos\/([^'")]+)/) || [])[1]
        ).filter(Boolean);
        if (files.length) buildRing(files);
      }, 200);
    }, { passive: true });
  }

  /* ── Líneas accordion ── */
  const accordion = document.getElementById("linesAccordion");
  if (accordion) {
    const items = Array.from(accordion.querySelectorAll(".line-item"));
    items.forEach((item) => {
      const head = item.querySelector(".line-head");
      head.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        // Cerrar todos
        items.forEach((it) => {
          it.classList.remove("open");
          it.querySelector(".line-head").setAttribute("aria-expanded", "false");
        });
        // Abrir el clicado (si no estaba ya abierto)
        if (!isOpen) {
          item.classList.add("open");
          head.setAttribute("aria-expanded", "true");
        }
      });
    });
  }
})();
