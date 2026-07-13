/* ═══════════════════════════════════════════════════════════════════════════
   security.js — utilidades de seguridad del cliente (se carga PRIMERO).

   Reemplaza los manejadores `onerror=` inline de las <img> (que un
   Content-Security-Policy estricto sin 'unsafe-inline' bloquea) por un único
   manejador delegado en fase de captura. Cada imagen declara su cadena de
   respaldo con  data-fallbacks="url1|url2|__remove__"  (se prueban en orden;
   __remove__ elimina el contenedor de la imagen).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'IMG') return;
    var list = el.getAttribute('data-fallbacks');
    if (!list) return;
    var arr = list.split('|');
    var i = parseInt(el.getAttribute('data-fb-i') || '0', 10);
    if (i >= arr.length) return;          // sin más respaldos: evita bucles
    el.setAttribute('data-fb-i', String(i + 1));
    var next = arr[i];
    if (next === '__remove__') {
      if (el.parentElement) el.parentElement.remove();
    } else {
      el.src = next;
    }
  }, true); // captura: el evento 'error' de <img> no burbujea
})();
