
/**
 * pages/home.js — Renderiza las vacantes desde assets/jobs.json
 * Para actualizar, edita el JSON y no el HTML.
 */
(async function renderJobs(){
  const mount = document.getElementById('jobs-list');
  if (!mount) return;
  try {
    // Resolver ruta relativa desde root o pages
    const base = location.pathname.includes('/pages/') ? '../' : '';
    const res = await fetch(base + 'assets/jobs.json');
    if (!res.ok) throw new Error('No se pudo cargar jobs.json');
    const data = await res.json();
    const frag = document.createDocumentFragment();

    (data.roles || []).forEach(r => {
      const li = document.createElement('li');
      li.className = 'job card';
      li.innerHTML = `
        <div class="job__head">
          <h3 class="h2 job__title">${r.title}</h3>
          <a class="btn" href="${r.apply}">Aplicar</a>
        </div>
        <p class="p muted">${r.location} • ${r.type}</p>
        <p class="p">${r.summary}</p>
      `;
      frag.appendChild(li);
    });
    mount.appendChild(frag);
  } catch (e) {
    mount.innerHTML = '<p class="p muted">No hay vacantes disponibles por el momento.</p>';
    console.error(e);
  }
})();
