

/**
 * core/loader.js
 *
 * Inyecta dinámicamente el header y footer compartidos en todas las páginas,
 * calculando la raíz del sitio para evitar rutas relativas rotas desde /pages/* o /.
 * Además, normaliza los enlaces de navegación y gestiona el menú desplegable de servicios.
 *
 * Diseño: todo se ejecuta en un IIFE async para permitir await y evitar contaminar el global scope.
 */
(async function initLayout(){
  // Calcula la raíz del sitio (antes de /pages/ si existe), para rutas absolutas correctas
  const path = location.pathname;
  const root = path.includes('/pages/') ? path.split('/pages/')[0] + '/' : '/';

  /**
   * fetchInto(el, url): Carga HTML externo en un elemento y corrige recursos si es necesario.
   * @param {HTMLElement} el - Elemento destino
   * @param {string} url - Ruta relativa al root
   */
  async function fetchInto(el, url){
    try {
      const res = await fetch(root + url);
      if (res && res.ok) el.innerHTML = await res.text();
      // Corrige el path del logo en el header después de inyectar el HTML
      if (url === 'partials/header.html') {
        const logo = document.querySelector('.navbar__brand img');
        if (logo) logo.src = root + 'img/Nextgen-logo.png';
      }
    } catch (e) { console.warn('No se pudo cargar', url, e); }
  }

  // Inyecta header y configura navegación si existe el contenedor
  const headerEl = document.getElementById('site-header');
  if (headerEl) {
    await fetchInto(headerEl, 'partials/header.html');
    normalizeLinks(root); // Corrige todos los href de navegación
    markActive(root);     // Marca el enlace activo según la ruta
    setupDropdownMenu();  // Inicializa el menú desplegable de servicios
  }

  /**
   * setupDropdownMenu(): Gestiona el menú desplegable de "Servicios" (abrir/cerrar, accesibilidad)
   */
  function setupDropdownMenu() {
    const dropdown = document.querySelector('.dropdown');
    const trigger = dropdown ? dropdown.querySelector('.navbar__link') : null;
    const panel = dropdown ? dropdown.querySelector('.dropdown__panel') : null;
    if (!dropdown || !trigger || !panel) return;

    let open = false; // Estado del panel

    function showPanel() {
      panel.style.display = 'grid';
      open = true;
      trigger.setAttribute('aria-expanded', 'true');
    }
    function hidePanel() {
      panel.style.display = 'none';
      open = false;
      trigger.setAttribute('aria-expanded', 'false');
    }

    // Hover en el trigger abre/cierra el panel (igual al original)
    trigger.addEventListener('mouseenter', showPanel);
    trigger.addEventListener('mouseleave', function(e) {
      // Si el mouse entra al panel, no cerrar
      if (!panel.contains(e.relatedTarget)) hidePanel();
    });
    panel.addEventListener('mouseenter', showPanel);
    panel.addEventListener('mouseleave', hidePanel);

    // Click fuera del dropdown cierra
    document.addEventListener('mousedown', function(e) {
      if (!dropdown.contains(e.target)) hidePanel();
    });

    // Escape cierra
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') hidePanel();
    });

    // Inicialmente oculto
    hidePanel();
  }

  // Inyecta footer si existe el contenedor
  const footerEl = document.getElementById('site-footer');
  if (footerEl) await fetchInto(footerEl, 'partials/footer.html');

  /**
   * normalizeLinks(root): Convierte todos los data-route en href absolutos desde root
   */
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

  /**
   * markActive(root): Marca el enlace activo en la navegación según la ruta actual
   */
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
