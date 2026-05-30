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
