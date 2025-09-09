
/**
 * pages/home.js
 *
 * Renderiza dinámicamente la lista de roles objetivo en la página principal,
 * obteniendo los datos desde assets/roles.json y generando tarjetas para cada perfil.
 * No incluye botón de aplicar, solo muestra información relevante.
 */
(async function renderRoles(){
  // Punto de montaje para la lista de roles
  const mount = document.getElementById('roles-list');
  if (!mount) return;
  try {
    // Determina la base para fetch según si estamos en /pages/ o raíz
    const base = location.pathname.includes('/pages/') ? '../' : '';
    const res = await fetch(base + 'assets/roles.json');
    const data = await res.json();
    const items = data.roles || [];
    const frag = document.createDocumentFragment();

    // Genera una tarjeta por cada rol
    items.forEach(r => {
      const li = document.createElement('li');
      li.className = 'role card';

      // Chips de skills
      const skills = (r.skills || []).map(s => `<span class="chip">${s}</span>`).join(' ');

      // Bloque de salarios por nivel (si existe)
      let salaryBlock = '';
      if (r.salary_usa && typeof r.salary_usa === 'object') {
        salaryBlock = '<ul class="stack-sm">' + Object.entries(r.salary_usa)
          .map(([lvl, val]) => `<li><strong>${lvl}:</strong> ${val}</li>`)
          .join('') + '</ul>';
      }

      // Estructura de la tarjeta de rol
      li.innerHTML = `
        <div class="role__head">
          <h3 class="h2 role__title">${r.title}</h3>
        </div>
        <p class="p muted">${(r.markets||['USA']).join(' / ')} • ${r.type || ''}</p>
        <p class="p">${r.summary || ''}</p>
        <div class="role__salaries">${salaryBlock}</div>
        <div class="role__skills">${skills}</div>
      `;
      frag.appendChild(li);
    });
    // Limpia y monta la lista final
    mount.innerHTML = '';
    mount.appendChild(frag);
  } catch (e) {
    // Fallback si falla el fetch o el parseo
    mount.innerHTML = '<p class="p muted">No hay roles por el momento.</p>';
    console.error(e);
  }
})();