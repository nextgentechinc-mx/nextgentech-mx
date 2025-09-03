
/**
 * core/loader.js — Header/Footer compartidos con raíz calculada.
 * Evita rutas relativas rotas desde /pages/* o /.
 */
(async function initLayout(){
  // Calcula raíz del sitio (antes de /pages/ si existe)
  const path = location.pathname;
  const root = path.includes('/pages/') ? path.split('/pages/')[0] + '/' : '/';

  async function fetchInto(el, url){
    try {
      const res = await fetch(root + url);
      if (res && res.ok) el.innerHTML = await res.text();
    } catch (e) { console.warn('No se pudo cargar', url, e); }
  }

  const headerEl = document.getElementById('site-header');
  if (headerEl) {
    await fetchInto(headerEl, 'partials/header.html');
    normalizeLinks(root);
    markActive(root);
  }

  const footerEl = document.getElementById('site-footer');
  if (footerEl) await fetchInto(footerEl, 'partials/footer.html');

  function normalizeLinks(root) {
    // Brand → Home
    const brand = document.querySelector('.navbar__brand');
    if (brand) {
      brand.setAttribute('href', root + 'index.html');
      brand.setAttribute('data-route','/');
    }
    // Todos los data-route → href absolutos desde root
    document.querySelectorAll('[data-route]').forEach(a => {
      const route = a.getAttribute('data-route');
      if (!route) return;
      if (route === '/') {
        a.setAttribute('href', root + 'index.html');
      } else {
        const clean = route.replace(/^\/?/, '');
        a.setAttribute('href', root + clean);
      }
    });
  }

  function markActive(root) {
    const path = location.pathname;
    document.querySelectorAll('[data-route]').forEach(a => {
      const route = a.getAttribute('data-route');
      if (!route) return;
      if (route === '/' && (path.endsWith('/index.html') || path === '/' )) {
        a.classList.add('is-active');
      } else if (route !== '/' && path.endsWith(route.replace(/^\//,''))) {
        a.classList.add('is-active');
      }
    });
  }
})();
