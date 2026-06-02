/* ─── CREDENCIALES ──────────────────────────────────────────────────────── */
const CREDENTIALS  = { username: "admin", password: "purpura2025" };
const SESSION_KEY  = "mp_admin_session";
const SPOTIFY_KEY  = "mp_spotify_episodes";
const YOUTUBE_KEY  = "mp_youtube_videos";
const DRAFT_SP_KEY = "mp_draft_spotify";
const DRAFT_YT_KEY = "mp_draft_youtube";

/* ─── DATOS DEFAULT ─────────────────────────────────────────────────────── */
const DEFAULT_SPOTIFY = [
  { badge:"Ep. 01", title:"Identidad En La Frontera", author:"Maximiliano Bernal Albarracín", duration:"17 min",
    spotifyUrl:"https://open.spotify.com/episode/6yQmrZmfYMSUk96t6l7M6W",
    embedUrl:"https://open.spotify.com/embed/episode/6yQmrZmfYMSUk96t6l7M6W?utm_source=generator",
    coverUrl:"https://image-cdn-fa.spotifycdn.com/image/ab67656300005f1f29365a0b4c2370e7e81aecc5", isNew:false },
  { badge:"Ep. 02", title:"Migrar con Orgullo", author:"Glojai Villamizar Mariño", duration:"19 min",
    spotifyUrl:"https://open.spotify.com/episode/3pUoJxJqE8MfCKL9EIdjWR",
    embedUrl:"https://open.spotify.com/embed/episode/3pUoJxJqE8MfCKL9EIdjWR?utm_source=generator",
    coverUrl:"https://image-cdn-ak.spotifycdn.com/image/ab67656300005f1fed1e6ede457326265dc8045b", isNew:false },
  { badge:"Ep. 03", title:"Mujer y Lucha", author:"Beatriz Mosquera Hernández", duration:"17 min",
    spotifyUrl:"https://open.spotify.com/episode/37hcj5itMjVaIav95VQbfh",
    embedUrl:"https://open.spotify.com/embed/episode/37hcj5itMjVaIav95VQbfh?utm_source=generator",
    coverUrl:"https://image-cdn-ak.spotifycdn.com/image/ab67656300005f1fed9f494f4783c70b20c77653", isNew:false },
  { badge:"Ep. 04", title:"Liderazgo en la Sombra", author:"Marieth Lozano Sánchez", duration:"16 min",
    spotifyUrl:"https://open.spotify.com/episode/1LWuPxVB9rbA9UmofBMwO0",
    embedUrl:"https://open.spotify.com/embed/episode/1LWuPxVB9rbA9UmofBMwO0?utm_source=generator",
    coverUrl:"https://image-cdn-ak.spotifycdn.com/image/ab67656300005f1f089864a55b315f631cbaa1c6", isNew:true }
];

const DEFAULT_YOUTUBE = [
  { title:"Historias de impacto", channel:"Mujeres Púrpura", description:"Videos sobre proyectos, talleres y acciones comunitarias.",
    ytUrl:"https://www.youtube.com/results?search_query=Mujeres+Purpura+Fundacion",
    thumbUrl:"../assets/hero-community.jpg", duration:"Próximamente" },
  { title:"Mujeres en acción", channel:"Mujeres Púrpura", description:"Aquí irá el primer video oficial de YouTube.",
    ytUrl:"https://www.youtube.com/results?search_query=Mujeres+Purpura+Fundacion",
    thumbUrl:"../assets/hero-group.jpg", duration:"Próximamente" },
  { title:"Voces que Sanan", channel:"Mujeres Púrpura", description:"Arte, expresión y empoderamiento colectivo.",
    ytUrl:"https://www.youtube.com/results?search_query=Mujeres+Purpura+Fundacion",
    thumbUrl:"../assets/hero-community.jpg", duration:"Próximamente" },
  { title:"Comunidad Púrpura", channel:"Mujeres Púrpura", description:"Talleres, encuentros y momentos que construyen comunidad.",
    ytUrl:"https://www.youtube.com/results?search_query=Mujeres+Purpura+Fundacion",
    thumbUrl:"../assets/hero-group.jpg", duration:"Próximamente" }
];

/* ─── ESTADO ────────────────────────────────────────────────────────────── */
let spotifyData = [];
let youtubeData = [];
let isDirty     = false;   // cambios no guardados
let hasDraft    = false;   // borrador guardado sin publicar

function loadData() {
  try { spotifyData = JSON.parse(localStorage.getItem(DRAFT_SP_KEY) || localStorage.getItem(SPOTIFY_KEY)) || [...DEFAULT_SPOTIFY]; }
  catch { spotifyData = [...DEFAULT_SPOTIFY]; }
  try { youtubeData = JSON.parse(localStorage.getItem(DRAFT_YT_KEY) || localStorage.getItem(YOUTUBE_KEY)) || [...DEFAULT_YOUTUBE]; }
  catch { youtubeData = [...DEFAULT_YOUTUBE]; }
  // Detectar si hay borradores sin publicar
  hasDraft = !!(localStorage.getItem(DRAFT_SP_KEY) || localStorage.getItem(DRAFT_YT_KEY));
}

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
function showToast(msg, color) {
  const t = document.getElementById("toast");
  const m = document.getElementById("toastMsg");
  if (!t) return;
  if (m) m.textContent = msg;
  if (color) t.style.background = color;
  t.classList.add("show");
  setTimeout(() => { t.classList.remove("show"); t.style.background = ""; }, 3000);
}

function setStatus(txt, type) {
  const s = document.getElementById("saveStatus");
  if (!s) return;
  s.textContent = txt;
  s.className = "save-status" + (type ? " save-status--" + type : "");
}

function markDirty() {
  isDirty = true;
  setStatus("Cambios sin guardar", "warn");
}

function updateDots() {
  const dsp = document.getElementById("dot-spotify");
  const dyt = document.getElementById("dot-youtube");
  if (dsp) dsp.classList.toggle("active", hasDraft);
  if (dyt) dyt.classList.toggle("active", hasDraft);
}

function updateBanner() {
  const banner = document.getElementById("unpublishedBanner");
  if (!banner) return;
  if (hasDraft) {
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
}

/* Extrae el ID de un URL de YouTube y devuelve la URL de su miniatura */
function ytUrlToThumb(url) {
  if (!url) return "";
  const patterns = [
    /[?&]v=([^&#]+)/,           // youtube.com/watch?v=ID
    /youtu\.be\/([^?&#]+)/,      // youtu.be/ID
    /\/embed\/([^?&#/]+)/,       // youtube.com/embed/ID
    /\/shorts\/([^?&#/]+)/,      // youtube.com/shorts/ID
    /\/v\/([^?&#/]+)/            // youtube.com/v/ID
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) {
      const id = m[1];
      // maxresdefault es la mayor calidad disponible
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
  }
  return "";
}

function spotifyToEmbed(url) {
  if (!url) return "";
  const m = url.match(/open\.spotify\.com\/(episode|show|track|album|playlist)\/([^?&/]+)/);
  if (!m) return url;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`;
}

/* ─── IMAGEN: URL o archivo local → base64 ─────────────────────────────── */
function bindImageUpload(fileInputId, urlInputId, previewId) {
  const fileInput = document.getElementById(fileInputId);
  if (!fileInput) return;
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const urlInput = document.getElementById(urlInputId);
      const preview  = document.getElementById(previewId);
      if (urlInput) {
        urlInput.value            = dataUrl;  // valor real = base64
        urlInput.dataset.realval  = dataUrl;  // backup (se setea AQUÍ, después del read)
        urlInput.dataset.isUpload = "1";
      }
      if (preview) preview.src = dataUrl;
      markDirty();
    };
    reader.readAsDataURL(file);
  });
}

/* ════════════════════════════════════════════════════════════════════════════
   LOGIN
════════════════════════════════════════════════════════════════════════════ */
if (document.getElementById("loginForm")) {
  if (sessionStorage.getItem(SESSION_KEY) === "1") location.replace("dashboard.html");

  const form    = document.getElementById("loginForm");
  const errEl   = document.getElementById("loginError");
  const btnText = document.getElementById("loginBtnText");
  const eyeBtn  = document.getElementById("eyeBtn");
  const pwdIn   = document.getElementById("password");

  eyeBtn.addEventListener("click", () => {
    const show = pwdIn.type === "password";
    pwdIn.type = show ? "text" : "password";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errEl.textContent = "";
    const user = document.getElementById("username").value.trim();
    const pass = pwdIn.value;
    btnText.textContent = "Verificando…";
    setTimeout(() => {
      if (user === CREDENTIALS.username && pass === CREDENTIALS.password) {
        sessionStorage.setItem(SESSION_KEY, "1");
        location.replace("dashboard.html");
      } else {
        errEl.textContent = "Usuario o contraseña incorrectos.";
        btnText.textContent = "Ingresar";
        pwdIn.value = ""; pwdIn.focus();
      }
    }, 500);
  });
}

/* ════════════════════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════════════════════ */
if (document.getElementById("panel-spotify")) {
  if (sessionStorage.getItem(SESSION_KEY) !== "1") location.replace("index.html");

  loadData();
  let activePanel = "spotify";

  const PANEL_META = {
    spotify: { title:"Episodios de Spotify",  sub:"Gestiona los episodios del carrusel de podcast.", addLabel:"+ Agregar episodio" },
    youtube: { title:"Videos de YouTube",     sub:"Gestiona los videos del carrusel de YouTube.",   addLabel:"+ Agregar video"    }
  };

  // Render inicial
  renderSpotifyGrid();
  renderYoutubeGrid();
  updateDots();
  updateBanner();
  if (hasDraft) setStatus("Borrador sin publicar", "warn");

  /* ── Nav ── */
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      activePanel = item.dataset.panel;
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      item.classList.add("active");
      document.querySelectorAll(".panel").forEach(p => p.classList.add("hidden"));
      document.getElementById("panel-" + activePanel).classList.remove("hidden");
      document.getElementById("panelTitle").textContent = PANEL_META[activePanel].title;
      document.getElementById("panelSub").textContent   = PANEL_META[activePanel].sub;
      document.getElementById("addBtn").textContent     = PANEL_META[activePanel].addLabel;
    });
  });
  document.getElementById("addBtn").textContent = PANEL_META.spotify.addLabel;

  /* ── Agregar ── */
  document.getElementById("addBtn").addEventListener("click", () => {
    if (activePanel === "spotify") {
      const n = spotifyData.length + 1;
      spotifyData.push({ badge:`Ep. ${String(n).padStart(2,"0")}`, title:"Nuevo episodio",
        author:"", duration:"", spotifyUrl:"", embedUrl:"", coverUrl:"", isNew:false });
      renderSpotifyGrid();
      scrollToLast("#spotifyGrid .ep-card");
    } else {
      youtubeData.push({ title:"Nuevo video", channel:"Mujeres Púrpura",
        description:"", ytUrl:"", thumbUrl:"", duration:"Próximamente" });
      renderYoutubeGrid();
      scrollToLast("#youtubeGrid .ep-card");
    }
    markDirty();
  });

  function scrollToLast(selector) {
    setTimeout(() => {
      const all = document.querySelectorAll(selector);
      all[all.length - 1]?.scrollIntoView({ behavior:"smooth", block:"center" });
    }, 80);
  }

  /* ── GUARDAR BORRADOR ── */
  document.getElementById("draftBtn").addEventListener("click", () => {
    collectFromForms();
    localStorage.setItem(DRAFT_SP_KEY, JSON.stringify(spotifyData));
    localStorage.setItem(DRAFT_YT_KEY, JSON.stringify(youtubeData));
    isDirty  = false;
    hasDraft = true;
    setStatus("Guardado · " + new Date().toLocaleTimeString("es-CO"), "ok");
    updateDots();
    updateBanner();
    showToast("Borrador guardado. Recuerda publicar para impactar la landing page.", "#6f60a8");
  });

  /* ── PUBLICAR ── */
  document.getElementById("publishBtn").addEventListener("click", publishChanges);
  document.getElementById("bannerPublishBtn")?.addEventListener("click", publishChanges);

  function publishChanges() {
    collectFromForms();
    localStorage.setItem(SPOTIFY_KEY, JSON.stringify(spotifyData));
    localStorage.setItem(YOUTUBE_KEY, JSON.stringify(youtubeData));
    // Limpiar borradores
    localStorage.removeItem(DRAFT_SP_KEY);
    localStorage.removeItem(DRAFT_YT_KEY);
    isDirty  = false;
    hasDraft = false;
    setStatus("Publicado · " + new Date().toLocaleTimeString("es-CO"), "ok");
    updateDots();
    updateBanner();
    showToast("✓ Cambios publicados en la landing page", "#1ed760");
  }

  /* ── Cerrar banner ── */
  document.getElementById("bannerCloseBtn")?.addEventListener("click", () => {
    document.getElementById("unpublishedBanner")?.classList.add("hidden");
  });

  /* ── LOGOUT ── */
  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (isDirty) {
      if (!confirm("Tienes cambios sin guardar. ¿Deseas cerrar sesión de todas formas? Se perderán los cambios no guardados.")) return;
    } else if (hasDraft) {
      if (!confirm("Tienes un borrador sin publicar en la landing page. ¿Seguro que deseas cerrar sesión sin publicar?")) return;
    }
    sessionStorage.removeItem(SESSION_KEY);
    location.replace("index.html");
  });

  /* ── Alerta antes de cerrar ventana ── */
  window.addEventListener("beforeunload", (e) => {
    if (isDirty || hasDraft) {
      e.preventDefault();
      e.returnValue = "Tienes cambios sin publicar. ¿Seguro que deseas salir?";
    }
  });

  /* ── Detectar cambios en formularios ── */
  document.getElementById("spotifyGrid").addEventListener("input",  markDirty);
  document.getElementById("spotifyGrid").addEventListener("change", markDirty);
  document.getElementById("youtubeGrid").addEventListener("input",  markDirty);
  document.getElementById("youtubeGrid").addEventListener("change", markDirty);

  /* ════════════════════════════════════════════════════════════
     SPOTIFY GRID
  ════════════════════════════════════════════════════════════ */
  function renderSpotifyGrid() {
    const grid = document.getElementById("spotifyGrid");
    grid.innerHTML = "";
    spotifyData.forEach((ep, i) => {
      const card = document.createElement("div");
      card.className = "ep-card";
      card.style.animation = "cardIn 0.35s cubic-bezier(0.16,1,0.3,1) both";
      card.innerHTML = `
        <div class="ep-card-header">
          <img class="ep-preview" id="sp-preview-${i}"
            src="${esc(ep.coverUrl)||'../assets/logo.jpg'}" alt="Portada"
            onerror="this.src='../assets/logo.jpg'">
          <div style="flex:1;min-width:0">
            <div class="ep-badges">
              <span class="ep-badge spotify">${esc(ep.badge)||`Ep. ${i+1}`}</span>
              ${ep.isNew?'<span class="ep-badge new-badge">Nuevo</span>':''}
            </div>
            <strong class="ep-name-preview">${esc(ep.title)||'Sin título'}</strong>
          </div>
          <button class="delete-btn" aria-label="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
        <div class="ep-card-body">
          <div class="field-row">
            <div class="admin-field">
              <label>Badge / Número</label>
              <input class="admin-input" id="sp-badge-${i}" value="${esc(ep.badge)}" placeholder="Ep. 01">
            </div>
            <div class="admin-field">
              <label>Duración</label>
              <input class="admin-input" id="sp-duration-${i}" value="${esc(ep.duration)}" placeholder="17 min">
            </div>
          </div>
          <div class="admin-field">
            <label>Título del episodio</label>
            <input class="admin-input" id="sp-title-${i}" value="${esc(ep.title)}" placeholder="Título">
          </div>
          <div class="admin-field">
            <label>Autor / Invitado</label>
            <input class="admin-input" id="sp-author-${i}" value="${esc(ep.author)}" placeholder="Nombre">
          </div>
          <div class="admin-field">
            <label>URL del episodio en Spotify</label>
            <input class="admin-input" id="sp-url-${i}" value="${esc(ep.spotifyUrl)}" placeholder="https://open.spotify.com/episode/...">
            <span class="field-hint">El embed para el reproductor se genera automáticamente.</span>
          </div>
          <div class="admin-field">
            <label>Imagen de portada</label>
            <div class="img-field-wrap">
              <input class="admin-input" id="sp-cover-${i}"
                value="${ep.coverUrl && ep.coverUrl.startsWith('data:') ? '[Imagen cargada localmente]' : esc(ep.coverUrl)}"
                data-realval="${esc(ep.coverUrl)}"
                placeholder="https://... o carga una imagen">
              <label class="img-upload-label" for="sp-file-${i}" title="Cargar imagen desde tu dispositivo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </label>
              <input type="file" id="sp-file-${i}" accept="image/*" class="hidden-file">
              <button class="img-preview-btn" type="button" data-src="sp-cover-${i}" data-prev="sp-preview-${i}" title="Previsualizar URL">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <label class="toggle-label">
            <input type="checkbox" id="sp-new-${i}" ${ep.isNew?"checked":""}>
            Marcar como <strong class="text-green">Nuevo</strong>
          </label>
        </div>`;
      grid.appendChild(card);

      // Preview URL
      card.querySelector(`#sp-cover-${i}`).addEventListener("input", (e) => {
        document.getElementById(`sp-preview-${i}`).src = e.target.value;
      });
      card.querySelector(".img-preview-btn").addEventListener("click", () => {
        const src = document.getElementById(`sp-cover-${i}`).dataset.realval || document.getElementById(`sp-cover-${i}`).value;
        document.getElementById(`sp-preview-${i}`).src = src;
      });
      // Actualizar name-preview
      card.querySelector(`#sp-title-${i}`).addEventListener("input", (e) => {
        card.querySelector(".ep-name-preview").textContent = e.target.value || "Sin título";
      });
      card.querySelector(`#sp-badge-${i}`).addEventListener("input", (e) => {
        card.querySelector(".ep-badge.spotify").textContent = e.target.value || `Ep. ${i+1}`;
      });
      bindImageUpload(`sp-file-${i}`, `sp-cover-${i}`, `sp-preview-${i}`);
      // Eliminar
      card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`¿Eliminar "${spotifyData[i]?.title||'este episodio'}"?`)) {
          spotifyData.splice(i, 1);
          renderSpotifyGrid();
          markDirty();
        }
      });
    });
    grid.appendChild(makeAddCard("spotify"));
  }

  /* ════════════════════════════════════════════════════════════
     YOUTUBE GRID
  ════════════════════════════════════════════════════════════ */
  function renderYoutubeGrid() {
    const grid = document.getElementById("youtubeGrid");
    grid.innerHTML = "";
    youtubeData.forEach((vid, i) => {
      const card = document.createElement("div");
      card.className = "ep-card";
      card.style.animation = "cardIn 0.35s cubic-bezier(0.16,1,0.3,1) both";
      card.innerHTML = `
        <div class="ep-card-header" style="flex-direction:column;align-items:flex-start;gap:10px;position:relative;">
          <button class="delete-btn" style="position:absolute;top:0;right:0;" aria-label="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
          <img class="yt-thumb-preview" id="yt-preview-${i}"
            src="${esc(vid.thumbUrl || ytUrlToThumb(vid.ytUrl) || '../assets/hero-community.jpg')}" alt="Miniatura"
            onerror="this.src=this.src.includes('maxresdefault')?this.src.replace('maxresdefault','hqdefault'):'../assets/hero-community.jpg'">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span class="ep-badge youtube">YouTube</span>
            <strong class="ep-name-preview">${esc(vid.title)||'Sin título'}</strong>
          </div>
        </div>
        <div class="ep-card-body">
          <div class="field-row">
            <div class="admin-field">
              <label>Título</label>
              <input class="admin-input" id="yt-title-${i}" value="${esc(vid.title)}" placeholder="Título del video">
            </div>
            <div class="admin-field">
              <label>Canal</label>
              <input class="admin-input" id="yt-channel-${i}" value="${esc(vid.channel)}" placeholder="Canal">
            </div>
          </div>
          <div class="admin-field">
            <label>Descripción</label>
            <input class="admin-input" id="yt-desc-${i}" value="${esc(vid.description)}" placeholder="Descripción">
          </div>
          <div class="admin-field">
            <label>URL del video en YouTube</label>
            <input class="admin-input" id="yt-url-${i}" value="${esc(vid.ytUrl)}" placeholder="https://www.youtube.com/watch?v=...">
            <span class="field-hint">La miniatura se obtiene automáticamente del video.</span>
          </div>
          <div class="admin-field">
            <label>Duración</label>
            <input class="admin-input" id="yt-dur-${i}" value="${esc(vid.duration)}" placeholder="5:32 o Próximamente">
          </div>
        </div>`;
      grid.appendChild(card);

      // Auto-thumbnail al escribir la URL de YouTube
      card.querySelector(`#yt-url-${i}`).addEventListener("input", (e) => {
        const thumb = ytUrlToThumb(e.target.value);
        const preview = document.getElementById(`yt-preview-${i}`);
        if (thumb && preview) preview.src = thumb;
        markDirty();
      });
      card.querySelector(`#yt-title-${i}`).addEventListener("input", (e) => {
        card.querySelector(".ep-name-preview").textContent = e.target.value || "Sin título";
      });
      bindImageUpload(`yt-file-${i}`, `yt-thumb-${i}`, `yt-preview-${i}`);
      card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`¿Eliminar "${youtubeData[i]?.title||'este video'}"?`)) {
          youtubeData.splice(i, 1);
          renderYoutubeGrid();
          markDirty();
        }
      });
    });
    grid.appendChild(makeAddCard("youtube"));
  }

  /* ── Add card placeholder ── */
  function makeAddCard(type) {
    const card = document.createElement("div");
    card.className = "ep-card add-card";
    const label = type === "spotify" ? "Agregar episodio" : "Agregar video";
    card.innerHTML = `
      <button class="add-card-btn" type="button" aria-label="${label}">
        <div class="add-card-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <span>${label}</span>
      </button>`;
    card.querySelector(".add-card-btn").addEventListener("click", () => {
      document.getElementById("addBtn").click();
    });
    return card;
  }

  /* Lee el valor real de un campo de imagen (URL o base64 de upload) */
  function readImageVal(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    // Si fue upload reciente, dataset.realval tiene la base64
    if (el.dataset.isUpload === "1") return el.dataset.realval || "";
    // Si el usuario escribió algo, usarlo directamente (.value siempre tiene lo que escribe)
    const v = el.value.trim();
    if (v && v !== "[Imagen cargada localmente]") return v;
    // Fallback al valor original guardado en data-realval
    return el.dataset.realval || "";
  }

  /* ── Recoger formularios → arrays ── */
  function collectFromForms() {
    spotifyData = spotifyData.map((_, i) => {
      const spotifyUrl = val(`sp-url-${i}`);          // .value directo — lo que escribió el usuario
      const coverUrl   = readImageVal(`sp-cover-${i}`);
      return {
        badge:      val(`sp-badge-${i}`)    || _.badge,
        title:      val(`sp-title-${i}`)    || _.title,
        author:     val(`sp-author-${i}`)   || "",
        duration:   val(`sp-duration-${i}`) || "",
        spotifyUrl, coverUrl,
        embedUrl:   spotifyToEmbed(spotifyUrl),
        isNew: document.getElementById(`sp-new-${i}`)?.checked ?? _.isNew
      };
    });

    youtubeData = youtubeData.map((_, i) => {
      const ytUrl   = val(`yt-url-${i}`) || "";
      const thumbUrl = ytUrlToThumb(ytUrl) || _.thumbUrl || "";
      return {
        title:       val(`yt-title-${i}`)   || _.title,
        channel:     val(`yt-channel-${i}`) || "",
        description: val(`yt-desc-${i}`)    || "",
        ytUrl, thumbUrl,
        duration:    val(`yt-dur-${i}`)     || ""
      };
    });
  }
}

/* ─── UTILS ─────────────────────────────────────────────────────────────── */
function val(id) { return document.getElementById(id)?.value?.trim() || ""; }
function getRealVal(id) {
  const el = document.getElementById(id);
  return el?.dataset?.realval || el?.value?.trim() || "";
}
function esc(str) {
  return (str || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
}

window.previewImg = function(inputId, imgId) {
  const el  = document.getElementById(inputId);
  const img = document.getElementById(imgId);
  if (img && el) img.src = el.dataset.realval || el.value;
};
