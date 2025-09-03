Cómo funciona la dinámica

loader.js:

Calcula el root del sitio y siempre carga partials/header.html y partials/footer.html.

Normaliza los href de los menús para que funcionen desde / y /pages/*.

Marca el link activo (is-active).

Vacantes dinámicas (home.js):

Lee assets/jobs.json y pinta cada rol como tarjeta.

Si no hay roles → mensaje “No hay vacantes disponibles”.

Tipografía/Paleta (tokens.css):

Fonts: Manrope (titulares), Inter (texto/UI).

Paleta definida como variables CSS (--color-brand-*, --color-accent-*, etc.).

Breakpoints (--bp-sm, --bp-md, etc.) centralizados.