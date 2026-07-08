/* ─── MAPA DE ACCIÓN — hotspots interactivos + línea de tiempo glass ────────
   Datos reales de impacto regional. Al activar un punto se despliega un panel
   con efecto glassmorphism y una línea de tiempo animada (fade-in / slide-up).
──────────────────────────────────────────────────────────────────────────── */
(function () {
  const DATA = [
    {
      region: "ARAUCA",
      proyectos: [
        {
          ano: "2019",
          actividad:
            "Apoyo en la construcción de la Política Pública LGBTI del municipio de Arauca.",
          aliados: "Casa Municipal de la Mujer, Red Municipal LGBTIQ+",
        },
        {
          ano: "2020",
          actividad:
            "Gestión de beca de profesionalización con la UNAD a través de la participación en la Red de Mujeres Diversas a Julieth Pabón Mosquera (mujer lesbiana y afro).",
          aliados: "UNAD - Red de Mujeres Diversas",
        },
        {
          ano: "2022",
          actividad:
            "Construcción de la línea base poblacional perteneciente a la comunidad LGBTIQ+ del municipio de Arauca (14 a 65 años) y Aplicación de la escala de Salud Mental, Bienestar Psicológico y Buen trato en Adolescentes.",
          aliados: "Universidad Simón Bolívar",
        },
      ],
    },
    {
      region: "BOGOTÁ",
      proyectos: [
        {
          ano: "2023",
          actividad:
            "Trabajo conjunto de apoyo de instituciones y formulación de proyectos para aplicación a Convocatorias. Promoción y Prevención de la violencia de género y derechos fundamentales de las mujeres y colectivo LGBTIQ+.",
          aliados: "Fundación Profesionales Amigos, Universidad Simón Bolívar",
        },
      ],
    },
    {
      region: "BUCARAMANGA",
      proyectos: [
        {
          ano: "2025",
          actividad:
            "Consultoría en Género y Prevención de Violencia Basada en Género para la Clínica de Urgencias Bucaramanga. Talleres de prevención de VBG: 'Entender para Prevenir'.",
          aliados: "Clínica de Urgencias Bucaramanga",
        },
      ],
    },
    {
      region: "FRONTERA DE VENEZUELA (ARAUCA Y CÚCUTA)",
      proyectos: [
        {
          ano: "2023 - 2024",
          actividad:
            "Atención psicológica remota, apoyo en Primeros Auxilios Psicológicos para mujeres migrantes latinoamericanas.",
          aliados: "Red Nacional de Mujeres",
        },
      ],
    },
  ];

  const stage = document.querySelector(".mapa-stage");
  const panel = document.getElementById("mapaPanel");
  if (!stage || !panel) return;

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );

  const byRegion = (name) => DATA.find((d) => d.region === name);
  const hotspots = Array.from(stage.querySelectorAll(".hotspot"));

  const placeholder = `
    <div class="mapa-panel-empty">
      <div class="mapa-panel-empty-ico" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>
      </div>
      <h3>Explora nuestro territorio</h3>
      <p>Toca un punto del mapa para descubrir la línea de tiempo de proyectos, actividades y aliados de cada región.</p>
    </div>`;

  function render(region) {
    const item = byRegion(region);
    if (!item) return;

    const steps = item.proyectos
      .map(
        (p, i) => `
        <li class="mapa-tl-item" style="--i:${i}">
          <span class="mapa-tl-dot" aria-hidden="true"></span>
          <span class="mapa-tl-year">${esc(p.ano)}</span>
          <p class="mapa-tl-act">${esc(p.actividad)}</p>
          <p class="mapa-tl-allies">
            <span class="mapa-tl-allies-label">Aliados</span>
            ${esc(p.aliados)}
          </p>
        </li>`
      )
      .join("");

    panel.classList.remove("is-animated");
    panel.innerHTML = `
      <button class="mapa-panel-close" type="button" aria-label="Cerrar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>
      <header class="mapa-panel-head">
        <span class="mapa-panel-kicker">Región</span>
        <h3 class="mapa-panel-title">${esc(item.region)}</h3>
        <span class="mapa-panel-count">${item.proyectos.length} ${
      item.proyectos.length === 1 ? "proyecto" : "proyectos"
    }</span>
      </header>
      <ol class="mapa-timeline">${steps}</ol>`;

    // Reinicia la animación de entrada
    void panel.offsetWidth;
    panel.classList.add("is-animated");

    panel
      .querySelector(".mapa-panel-close")
      .addEventListener("click", clearActive);
  }

  function setActive(btn) {
    hotspots.forEach((h) => {
      const on = h === btn;
      h.classList.toggle("is-active", on);
      h.setAttribute("aria-pressed", String(on));
    });
    stage.classList.add("has-selection");
    render(btn.dataset.region);
    if (window.matchMedia("(max-width: 900px)").matches) {
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function clearActive() {
    hotspots.forEach((h) => {
      h.classList.remove("is-active");
      h.setAttribute("aria-pressed", "false");
    });
    stage.classList.remove("has-selection");
    panel.classList.remove("is-animated");
    void panel.offsetWidth;
    panel.classList.add("is-animated");
    panel.innerHTML = placeholder;
  }

  hotspots.forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => setActive(btn));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(btn);
      }
    });
  });

  panel.innerHTML = placeholder;
})();
