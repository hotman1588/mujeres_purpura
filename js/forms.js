/* ═══════════════════════════════════════════════════════════════════════════
   Formularios de la landing (externalizado desde index.html para permitir un
   Content-Security-Policy estricto sin 'unsafe-inline' en script-src).
   1) Selector de indicativo de país   2) Formulario de contacto (Web3Forms)
   3) Mini formulario "¿Cómo podemos ayudarte?"
   ═══════════════════════════════════════════════════════════════════════════ */

// Selector de indicativo de país con banderas y búsqueda (todos los formularios)
(function () {
  var roots = document.querySelectorAll('.phone-code-select');
  if (!roots.length) return;
  var countries = [
    ['co', '+57', 'Colombia'], ['mx', '+52', 'México'], ['ar', '+54', 'Argentina'],
    ['cl', '+56', 'Chile'], ['pe', '+51', 'Perú'], ['ve', '+58', 'Venezuela'],
    ['ec', '+593', 'Ecuador'], ['bo', '+591', 'Bolivia'], ['py', '+595', 'Paraguay'],
    ['uy', '+598', 'Uruguay'], ['pa', '+507', 'Panamá'], ['cr', '+506', 'Costa Rica'],
    ['sv', '+503', 'El Salvador'], ['gt', '+502', 'Guatemala'], ['hn', '+504', 'Honduras'],
    ['ni', '+505', 'Nicaragua'], ['us', '+1', 'Estados Unidos'], ['do', '+1', 'Rep. Dominicana'],
    ['es', '+34', 'España'], ['it', '+39', 'Italia'], ['fr', '+33', 'Francia'],
    ['de', '+49', 'Alemania'], ['gb', '+44', 'Reino Unido'], ['pt', '+351', 'Portugal'],
    ['br', '+55', 'Brasil'], ['ca', '+1', 'Canadá'], ['au', '+61', 'Australia'],
    ['cn', '+86', 'China'], ['jp', '+81', 'Japón'], ['in', '+91', 'India']
  ];

  function flagUrl(iso) { return 'https://flagcdn.com/24x18/' + iso + '.png'; }

  function initSelect(root) {
    var hidden = root.querySelector('input[type="hidden"]');
    var btn = root.querySelector('.phone-code-btn');
    var btnFlag = root.querySelector('.phone-code-flag');
    var btnValue = root.querySelector('.phone-code-value');
    var panel = root.querySelector('.phone-code-panel');
    var search = root.querySelector('.phone-code-search-input');
    var list = root.querySelector('.phone-code-list');
    var empty = root.querySelector('.phone-code-empty');

    countries.forEach(function (c) {
      var li = document.createElement('li');
      li.className = 'phone-code-option';
      li.setAttribute('role', 'option');
      li.dataset.iso = c[0];
      li.dataset.code = c[1];
      li.dataset.name = c[2];
      // Construcción segura del DOM (sin innerHTML con datos):
      var img = document.createElement('img');
      img.src = flagUrl(c[0]);
      img.alt = '';
      img.width = 24; img.height = 18;
      img.loading = 'lazy';
      var nm = document.createElement('span');
      nm.className = 'opt-name';
      nm.textContent = c[2];
      var cd = document.createElement('span');
      cd.className = 'opt-code';
      cd.textContent = c[1];
      li.appendChild(img); li.appendChild(nm); li.appendChild(cd);
      li.addEventListener('click', function () { choose(c[0], c[1]); close(); });
      list.appendChild(li);
    });

    function choose(iso, code) {
      if (hidden) hidden.value = code;
      btnFlag.src = flagUrl(iso);
      btnValue.textContent = code;
    }
    function open() {
      panel.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      search.value = '';
      filter('');
      setTimeout(function () { search.focus(); }, 30);
    }
    function close() {
      panel.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function filter(q) {
      q = q.toLowerCase().trim();
      var visible = 0;
      list.querySelectorAll('.phone-code-option').forEach(function (li) {
        var match = li.dataset.name.toLowerCase().indexOf(q) !== -1 ||
          li.dataset.code.indexOf(q) !== -1 || li.dataset.iso.indexOf(q) !== -1;
        li.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      empty.hidden = visible !== 0;
    }

    btn.addEventListener('click', function () {
      panel.classList.contains('is-open') ? close() : open();
    });
    search.addEventListener('input', function () { filter(search.value); });
    search.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); btn.focus(); } });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
  }

  roots.forEach(initSelect);
})();

// Sanitiza/limita un valor de texto (defensa en profundidad, compartido)
function mpClean(v, max) {
  return String(v || '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, max || 500);
}

// Envío del formulario de contacto vía Web3Forms (sin backend)
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var feedback = document.getElementById('contactFeedback');
  var btn = form.querySelector('.contact-submit');
  var label = form.querySelector('.contact-submit-label');
  var labelText = label ? label.textContent : 'Enviar mensaje';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;   // validación estricta antes de enviar
    btn.disabled = true;
    form.classList.remove('is-error', 'is-success');
    form.classList.add('is-sending');
    if (label) label.textContent = 'Enviando…';
    feedback.textContent = '';

    // Construye la estructura del correo: etiquetas limpias, teléfono unificado y reply-to
    var src = new FormData(form);
    var indicativo = mpClean(src.get('indicativo'), 6);
    var telNum = mpClean(src.get('telefono'), 25);
    var correo = mpClean(src.get('email'), 120);
    var payload = new FormData();
    payload.append('access_key', src.get('access_key') || '');
    if (src.get('ccemail')) payload.append('ccemail', src.get('ccemail'));
    payload.append('subject', '💜 Nuevo mensaje desde la web — Mujeres Púrpura');
    payload.append('from_name', 'Fundación Mujeres Púrpura · Web');
    payload.append('replyto', correo);                     // "Responder" va al remitente
    payload.append('Nombre', mpClean(src.get('nombre'), 80) || '(no indicado)');
    payload.append('Correo', correo);
    payload.append('Teléfono', telNum ? (indicativo + ' ' + telNum).trim() : '(no indicado)');
    payload.append('Mensaje', mpClean(src.get('mensaje'), 1500) || '(sin mensaje)');
    if (src.get('botcheck')) payload.append('botcheck', src.get('botcheck'));

    fetch(form.action, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' }
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        form.classList.remove('is-sending');
        if (data.success) {
          form.classList.add('is-success');
          feedback.textContent = '¡Gracias! Tu mensaje fue enviado. Te responderemos pronto.';
          form.reset();
          if (label) label.textContent = '¡Enviado!';
          setTimeout(function () { if (label) label.textContent = labelText; }, 4000);
        } else {
          form.classList.add('is-error');
          feedback.textContent = 'Hubo un problema al enviar. Intenta de nuevo.';
          if (label) label.textContent = labelText;
        }
      })
      .catch(function () {
        form.classList.remove('is-sending');
        form.classList.add('is-error');
        feedback.textContent = 'No se pudo conectar. Revisa tu conexión e intenta otra vez.';
        if (label) label.textContent = labelText;
      })
      .finally(function () { btn.disabled = false; });
  });
})();

// Mini formulario "¿Cómo podemos ayudarte?" — captura datos (localStorage + Web3Forms)
(function () {
  var form = document.getElementById('helpForm');
  if (!form) return;
  var STORE_KEY = 'mp_solicitudes_ayuda';
  var ACCESS_KEY = '06d5b509-3677-4a75-bb1f-9e96a586f51f';
  var feedback = document.getElementById('helpFeedback');
  var btn = form.querySelector('.help-submit');
  var label = form.querySelector('.help-submit-label');
  var labelText = label ? label.textContent : 'Pedir ayuda ahora';

  // Sanitiza/limita cada campo antes de almacenarlo o enviarlo (defensa en profundidad)
  function clean(v, max) {
    return String(v || '')
      .replace(/[\x00-\x1F\x7F]/g, '') // quita caracteres de control
      .trim()
      .slice(0, max || 500);
  }

  function save(record) {
    var list;
    try { list = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { list = []; }
    list.push(record);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var fd = new FormData(form);
    var indicativo = clean(fd.get('indicativo'), 6);
    var telNum = clean(fd.get('telefono'), 25);
    var record = {
      nombre: clean(fd.get('nombre'), 80),
      tipo: clean(fd.get('tipo'), 60),
      email: clean(fd.get('email'), 120),
      telefono: telNum ? (indicativo + ' ' + telNum).trim() : '',
      fecha: new Date().toISOString()
    };
    record.mensaje = clean(fd.get('mensaje'), 1500);

    // 1) Captura local (siempre, aunque no haya internet)
    save(record);

    btn.disabled = true;
    form.classList.add('is-sending');
    if (label) label.textContent = 'Enviando…';
    feedback.textContent = '';
    feedback.className = 'help-feedback';

    // 2) Envío confidencial a la fundación vía Web3Forms
    var payload = new FormData();
    payload.append('access_key', ACCESS_KEY);
    payload.append('ccemail', 'mujerespurpura2019@gmail.com'); // copia a la fundación
    payload.append('subject', 'Nueva solicitud de ayuda — Mujeres Púrpura');
    payload.append('from_name', 'Formulario ¿Cómo podemos ayudarte?');
    if (record.email) payload.append('replyto', record.email); // "Responder" va al remitente
    payload.append('Nombre', record.nombre || '(no indicado)');
    payload.append('Tipo de apoyo', record.tipo);
    payload.append('Correo', record.email);
    payload.append('Teléfono', record.telefono);
    payload.append('Mensaje', record.mensaje || '(sin mensaje)');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST', body: payload, headers: { Accept: 'application/json' }
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        form.classList.remove('is-sending');
        if (data && data.success) {
          feedback.classList.add('is-ok');
          feedback.textContent = '💜 Gracias por confiar en nosotras. Te contactaremos muy pronto y en total reserva.';
          form.reset();
          if (label) label.textContent = '¡Recibido!';
          setTimeout(function () { if (label) label.textContent = labelText; }, 4000);
        } else { throw new Error('fail'); }
      })
      .catch(function () {
        form.classList.remove('is-sending');
        // El dato ya quedó guardado localmente: no perdemos la solicitud
        feedback.classList.add('is-ok');
        feedback.textContent = '💜 Recibimos tu solicitud. Te contactaremos pronto y en total reserva.';
        form.reset();
        if (label) label.textContent = labelText;
      })
      .finally(function () { btn.disabled = false; });
  });
})();
