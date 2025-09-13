

/**
 * core/loader.js
 *
 * Inyecta dinámicamente el header y footer compartidos en todas las páginas.
 * Además, normaliza los enlaces de navegación y gestiona el menú desplegable de servicios.
 *
 * Diseño: todo se ejecuta en un IIFE async para permitir await y evitar contaminar el global scope.
 */
(async function initLayout(){
  // Ya no existe /pages/, todo está en root. Usamos rutas relativas simples.
  const root = '';

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
        if (logo) logo.src = 'img/Nextgen-logo.png';
      }
    } catch (e) { console.warn('No se pudo cargar', url, e); }
  }

  // Inyecta header y configura navegación si existe el contenedor
  const headerEl = document.getElementById('site-header');
  if (headerEl) {
    await fetchInto(headerEl, 'partials/header.html');
    normalizeLinks(); // Corrige todos los href de navegación
    markActive();     // Marca el enlace activo según la ruta
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
  function normalizeLinks() {
    // Brand → Home
    const brand = document.querySelector('.navbar__brand');
    if (brand) {
      brand.setAttribute('href', 'index.html');
      brand.setAttribute('data-route','/');
    }
    // Todos los data-route → href relativos desde root
    document.querySelectorAll('[data-route]').forEach(a => {
      const route = a.getAttribute('data-route');
      if (!route) return;
      if (route === '/') {
        a.setAttribute('href', 'index.html');
      } else {
        const clean = route.replace(/^\/?/, '');
        a.setAttribute('href', clean);
      }
    });
  }

  /**
   * markActive(root): Marca el enlace activo en la navegación según la ruta actual
   */
  function markActive() {
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
