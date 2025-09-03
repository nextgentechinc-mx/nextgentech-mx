/**
 * pages/home.js — Lista de roles objetivo (sin botón de aplicar)
 */
(async function renderRoles(){
  const mount = document.getElementById('roles-list');
  if (!mount) return;
  try {
    const base = location.pathname.includes('/pages/') ? '../' : '';
    const res = await fetch(base + 'assets/roles.json');
    const data = await res.json();
    const items = data.roles || [];
    const frag = document.createDocumentFragment();

    items.forEach(r => {
      const li = document.createElement('li');
      li.className = 'role card';

      const skills = (r.skills || []).map(s => `<span class="chip">${s}</span>`).join(' ');

      let salaryBlock = '';
      if (r.salary_usa && typeof r.salary_usa === 'object') {
        salaryBlock = '<ul class="stack-sm">' + Object.entries(r.salary_usa)
          .map(([lvl, val]) => `<li><strong>${lvl}:</strong> ${val}</li>`)
          .join('') + '</ul>';
      }

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
    mount.innerHTML = '';
    mount.appendChild(frag);
  } catch (e) {
    mount.innerHTML = '<p class="p muted">No hay roles por el momento.</p>';
    console.error(e);
  }
})();