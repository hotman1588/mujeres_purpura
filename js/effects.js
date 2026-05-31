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

  /* ── 3D Image Split Scroll — testimonios "Voces que transforman" ─────────────
     Las tarjetas empiezan apiladas y, vinculadas al scroll (scrub), se separan
     en el eje Z revelándose una a una. En móvil/reduced-motion no se ejecuta
     (el CSS las muestra como stack vertical limpio). */
  const t3dTrack = document.querySelector(".t3d-track");
  if (t3dTrack) {
    const stage = t3dTrack.querySelector(".t3d-stage");
    const cards = Array.from(t3dTrack.querySelectorAll(".t3d-card"));
    const bar = t3dTrack.querySelector(".t3d-progress span");
    const N = cards.length;

    // ┌─ CONSTANTES CALIBRABLES ────────────────────────────────────────────┐
    // │ Ajusta estos valores para variar la intensidad del efecto 3D.        │
    const STACK_Z   = 110;  // px que cada tarjeta de atrás se hunde en profundidad (translateZ−)
    const STACK_Y   = 26;   // px que cada tarjeta apilada asoma hacia abajo (peek)
    const STACK_SC  = 0.07; // reducción de escala por cada nivel apilado
    const STACK_BLUR= 1.6;  // px de desenfoque por nivel apilado (profundidad de campo)
    const STACK_DIM = 0.16; // oscurecimiento por nivel apilado (foco de cámara)
    const OUT_Z     = 320;  // px que la tarjeta activa avanza hacia el espectador al salir (translateZ+)
    const OUT_Y     = 165;  // px que la tarjeta sube al salir de escena (translateY−)
    const OUT_ROTX  = 22;   // grados de inclinación (rotateX) al salir
    const OUT_ROTY  = 30;   // grados de giro lateral cinematográfico (rotateY) al salir
    const STACK_ROTY= 8;    // grados de giro lateral leve de las tarjetas apiladas (profundidad)
    const OUT_ROTZ  = 6;    // grados de giro sutil del "naipe" (rotateZ)
    const OUT_SC    = 0.10; // aumento de escala al acercarse a la cámara
    const FADE_BACK = 3;    // a partir de este nivel apilado, las traseras se desvanecen
    // └──────────────────────────────────────────────────────────────────────┘

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function render() {
      const rect = t3dTrack.getBoundingClientRect();
      // Progreso 0→1 mientras el track recorre la ventana (mientras la escena está "pin")
      const total = t3dTrack.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / total, 0, 1);

      // Índice "activo" continuo: 0 → primera tarjeta; (N-1) → última
      const active = progress * (N - 1);

      cards.forEach((card, i) => {
        const rel = i - active; // >0: aún apiladas detrás · ≈0: al frente · <0: ya reveladas (salen)
        let tz, ty, rotx, roty, rotz, scale, op, blur, bright;

        if (rel >= 0) {
          // Tarjetas apiladas detrás del frente
          tz    = -rel * STACK_Z;
          ty    =  rel * STACK_Y;
          rotx  = 0;
          // Giro lateral leve que se atenúa al acercarse al frente (rel→0 ⇒ 0°)
          roty  = -clamp(rel, 0, 1) * STACK_ROTY;
          rotz  = 0;
          scale = 1 - rel * STACK_SC;
          op    = clamp(1 - Math.max(0, rel - FADE_BACK) * 0.6, 0, 1);
          // Profundidad de campo: las de atrás se desenfocan y oscurecen
          blur   = rel * STACK_BLUR;
          bright = clamp(1 - rel * STACK_DIM, 0.45, 1);
        } else {
          // Tarjetas que ya pasaron: avanzan hacia el espectador, suben y rotan al salir
          const k = -rel; // cantidad de "salida" (0→…)
          tz    =  k * OUT_Z;
          ty    = -k * OUT_Y;
          rotx  =  k * OUT_ROTX;
          roty  =  k * OUT_ROTY;   // giro lateral cinematográfico al salir
          rotz  =  k * OUT_ROTZ;
          scale = 1 + k * OUT_SC;
          op    = clamp(1 - k * 1.15, 0, 1);
          blur   = k * 0.8;        // ligero desenfoque de movimiento al salir
          bright = 1;
        }

        card.style.setProperty("--tz", tz.toFixed(1) + "px");
        card.style.setProperty("--ty", ty.toFixed(1) + "px");
        card.style.setProperty("--rotx", rotx.toFixed(2) + "deg");
        card.style.setProperty("--roty", roty.toFixed(2) + "deg");
        card.style.setProperty("--rotz", rotz.toFixed(2) + "deg");
        card.style.setProperty("--scale", scale.toFixed(3));
        card.style.setProperty("--op", op.toFixed(3));
        card.style.setProperty("--blur", blur.toFixed(2) + "px");
        card.style.setProperty("--bright", bright.toFixed(3));
        // z-index para que la tarjeta más al frente quede siempre encima
        card.style.zIndex = String(Math.round(100 - Math.abs(rel) * 10));
      });

      if (bar) bar.style.width = (progress * 100).toFixed(1) + "%";
    }

    // Solo activamos el scrub en escritorio y sin reduced-motion (coincide con el CSS)
    const mq = window.matchMedia("(min-width: 769px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { render(); rafId = null; });
    };

    function enable() {
      if (!mq.matches || reduce.matches) {
        // Modo móvil/accesible: limpia estilos en línea para que mande el CSS
        cards.forEach((c) => { c.removeAttribute("style"); });
        window.removeEventListener("scroll", onScroll);
        return;
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      render();
    }
    enable();
    mq.addEventListener("change", enable);
    reduce.addEventListener("change", enable);
    window.addEventListener("resize", () => { if (mq.matches && !reduce.matches) render(); }, { passive: true });
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
