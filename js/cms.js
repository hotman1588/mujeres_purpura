/* ─── CMS LOADER ─────────────────────────────────────────────────────────
   Corre ANTES que main.js para que el carrusel inicialice con datos frescos.
   Reconstruye las tarjetas dinámicamente si hay datos en localStorage.
───────────────────────────────────────────────────────────────────────── */
(function () {
  const SPOTIFY_KEY = "mp_spotify_episodes";
  const YOUTUBE_KEY = "mp_youtube_videos";
  const POSTS_KEY = "mp_publications";
  const DRAFT_POSTS_KEY = "mp_draft_publications";

  /* ── Spotify ── */
  function applySpotify() {
    let data;
    try { data = JSON.parse(localStorage.getItem(SPOTIFY_KEY)); } catch { return; }
    if (!Array.isArray(data) || !data.length) return;

    const track = document.getElementById("pmcTrack");
    if (!track) return;

    // Vaciar el track y reconstruir con los datos del admin
    track.innerHTML = "";

    data.forEach((ep, i) => {
      const art = document.createElement("article");
      art.className = "pmc-card";
      art.setAttribute("role", "listitem");
      art.dataset.episodeIndex = i;
      art.dataset.spotifyUri   = spotifyToUri(ep.spotifyUrl);
      art.dataset.spotifyUrl   = ep.spotifyUrl  || "";
      art.dataset.spotifyEmbed = ep.embedUrl    || spotifyToEmbed(ep.spotifyUrl);

      const overlayClass = `pmc-art--${(i % 4) + 1}`;
      const overlayColorClass = `pmc-art-overlay--${(i % 4) + 1}`;

      art.innerHTML = `
        <div class="pmc-ep-badge${ep.isNew ? ' pmc-ep-new' : ''}">${ep.isNew ? 'Nuevo' : (ep.badge || `Ep. ${String(i+1).padStart(2,'0')}`)}</div>
        <div class="pmc-art ${overlayClass}">
          <img src="${escHtml(ep.coverUrl||'')}" alt="${escHtml(ep.title||'')}" class="pmc-art-img"
            onerror="this.src='assets/women-pattern.png'">
          <div class="pmc-art-overlay ${overlayColorClass}"></div>
          <button class="pmc-play-icon" type="button" aria-label="Reproducir episodio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
          <div class="pmc-art-glow"></div>
        </div>
        <div class="pmc-card-body">
          <p class="pmc-meta">${escHtml(ep.duration||'')} · Podcast</p>
          <h3 class="pmc-title">${escHtml(ep.title||'')}</h3>
          <p class="pmc-sub">${escHtml(ep.author||'')}</p>
          <button class="pmc-cta" type="button" data-i18n="media.cta.spotify">Escuchar en Spotify</button>
        </div>`;
      track.appendChild(art);
    });
  }

  /* ── YouTube ── */
  function applyYoutube() {
    let data;
    try { data = JSON.parse(localStorage.getItem(YOUTUBE_KEY)); } catch { return; }
    if (!Array.isArray(data) || !data.length) return;

    const track = document.getElementById("ytcTrack");
    if (!track) return;

    track.innerHTML = "";

    data.forEach((vid) => {
      const art = document.createElement("article");
      art.className = "ytc-card";
      art.setAttribute("role", "listitem");
      art.dataset.ytUrl = vid.ytUrl || "";

      const thumb = vid.thumbUrl || ytUrlToThumb(vid.ytUrl) || "assets/hero-community.jpg";
      art.innerHTML = `
        <div class="ytc-thumb">
          <img src="${escHtml(thumb)}" alt="${escHtml(vid.title||'')}" class="ytc-img"
            onerror="this.src=this.src.includes('maxresdefault')?this.src.replace('maxresdefault','hqdefault'):'assets/hero-community.jpg'">
          <div class="ytc-overlay"></div>
          <button class="ytc-play" type="button" aria-label="Ver video">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
          <span class="ytc-duration">${escHtml(vid.duration||'Próximamente')}</span>
        </div>
        <div class="ytc-body">
          <p class="ytc-channel">${escHtml(vid.channel||'Mujeres Púrpura')}</p>
          <h3 class="ytc-title">${escHtml(vid.title||'')}</h3>
          <p class="ytc-desc">${escHtml(vid.description||'')}</p>
          <a class="ytc-cta" href="${escHtml(vid.ytUrl||'#')}" target="_blank" rel="noreferrer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            ${window.MP_I18N?.t?.("media.cta.youtube") || "Ver en YouTube"}
          </a>
        </div>`;
      track.appendChild(art);
    });
  }


  /* ── Publicaciones ── */
  function applyPosts() {
    const grid = document.getElementById("postsGrid");
    const empty = document.getElementById("postsEmpty");
    if (!grid) return;

    let raw = "";
    let draftRaw = "";
    let data = [];
    try {
      raw = localStorage.getItem(POSTS_KEY) || "";
      draftRaw = localStorage.getItem(DRAFT_POSTS_KEY) || "";
      data = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("No se pudieron leer las publicaciones", err);
      if (empty) {
        empty.hidden = false;
        empty.textContent = "Hay publicaciones guardadas, pero el navegador no pudo leerlas. Vuelve a publicar desde el panel admin.";
      }
      return;
    }

    const posts = Array.isArray(data)
      ? data.filter((post) => post && (post.title || post.excerpt || post.body))
      : [];

    grid.innerHTML = "";
    if (!posts.length) {
      if (empty) {
        empty.hidden = false;
        empty.textContent = draftRaw
          ? (window.MP_I18N?.t?.("posts.draftOnly") || "Hay un borrador de publicaciones guardado, pero todavía no está publicado. Entra al panel admin y presiona Publicar.")
          : (window.MP_I18N?.t?.("posts.noneOrigin") || `No hay publicaciones publicadas en este navegador/origen (${location.origin}). Verifica que admin y landing usen la misma URL.`);
      }
      return;
    }
    if (empty) empty.hidden = true;

    posts
      .slice()
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .forEach((post) => {
        const art = document.createElement("article");
        art.className = "post-card";
        art.setAttribute("data-reveal", "");

        const image = post.imageUrl
          ? `<div class="post-card-media"><img src="${escHtml(post.imageUrl)}" alt="${escHtml(post.title || 'Publicación')}" onerror="this.parentElement.remove()"></div>`
          : "";
        const link = post.linkUrl
          ? `<a class="post-card-link" href="${escHtml(post.linkUrl)}" target="_blank" rel="noreferrer">${window.MP_I18N?.t?.("posts.readMore") || "Leer más"}</a>`
          : "";

        art.innerHTML = `
          ${image}
          <div class="post-card-body">
            <div class="post-card-meta">
              <span>${escHtml(post.category || 'Novedad')}</span>
              <time datetime="${escHtml(post.date || '')}">${escHtml(formatDate(post.date))}</time>
            </div>
            <h3>${escHtml(post.title || 'Publicación')}</h3>
            <p>${escHtml(post.excerpt || post.body || '')}</p>
            ${link}
          </div>`;
        grid.appendChild(art);
      });
  }
  /* ── Utils ── */
  function ytUrlToThumb(url) {
    if (!url) return "";
    const patterns = [
      /[?&]v=([^&#]+)/,
      /youtu\.be\/([^?&#]+)/,
      /\/embed\/([^?&#/]+)/,
      /\/shorts\/([^?&#/]+)/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg`;
    }
    return "";
  }

  function spotifyToEmbed(url) {
    if (!url) return "";
    const m = url.match(/open\.spotify\.com\/(episode|show|track|album|playlist)\/([^?&/]+)/);
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator` : url;
  }

  function spotifyToUri(url) {
    if (!url) return "";
    const m = url.match(/open\.spotify\.com\/(episode|show|track|album|playlist)\/([^?&/]+)/);
    return m ? `spotify:${m[1]}:${m[2]}` : url;
  }


  function formatDate(value) {
    if (!value) return "Sin fecha";
    const date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" });
  }
  function escHtml(str) {
    return String(str || "")
      .replace(/&/g,"&amp;")
      .replace(/"/g,"&quot;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;");
  }

  // Ejecutar de inmediato — antes de main.js
  applySpotify();
  applyYoutube();
  applyPosts();
})();



