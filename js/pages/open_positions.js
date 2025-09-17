// js/pages/open_positions.js
// Renderiza las vacantes desde assets/jobs.json en modo acordeón (solo título visible, detalles al hacer click)
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('jobs-list');
  if (!container) return;
  try {
    const res = await fetch('assets/jobs.json');
    const jobs = await res.json();
    container.innerHTML = jobs.map((job, i) => `
      <div class="job-card">
        <button class="job-title" aria-expanded="false" aria-controls="job-details-${i}">
          ${job.title}
          <span class="job-location">${job.location} ${job.modality === 'remote' ? '(Remoto)' : '(Local)'}${job.relocation ? ' + Relocation' : ''}</span>
        </button>
        <div class="job-details" id="job-details-${i}" hidden>
          <p class="job-desc">${job.description}</p>
          <ul class="job-reqs">
            ${job.requirements.map(r => `<li>${r}</li>`).join('')}
          </ul>
          ${job.bonuses && job.bonuses.length ? `<div class="job-bonuses"><strong>Bonuses:</strong><ul>${job.bonuses.map(b => `<li>${b}</li>`).join('')}</ul></div>` : ''}
        </div>
      </div>
    `).join('');
    // Acordeón: mostrar/ocultar detalles
    container.querySelectorAll('.job-title').forEach(btn => {
      btn.addEventListener('click', e => {
        const details = btn.nextElementSibling;
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !expanded);
        details.hidden = expanded;
      });
    });
  } catch (e) {
    container.innerHTML = '<p class="p muted">No se pudieron cargar las vacantes.</p>';
  }
});
