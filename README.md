# Nextgentech MX

Versión en español del sitio [nextgentechinc.com](https://nextgentechinc.com/), adaptada para clientes en México.

## Estructura del proyecto
- `index.html` → Página principal
- `about.html`, `services.html`, `artificial_intelligence.html`, `global_talent_acquisition.html`, `contact.html`, `privacy.html`, `open_positions.html` → Páginas principales (todas en raíz)
- `partials/` → Header y Footer compartidos
- `css/` → Estilos base, layout y específicos por página
- `js/` → Scripts core y específicos de cada página
- `assets/` → Recursos dinámicos (ej. `jobs.json` para vacantes)
- `img/` → Imágenes y recursos gráficos

## Vacantes dinámicas
La página [`open_positions.html`](open_positions.html) carga las vacantes desde [`assets/jobs.json`](assets/jobs.json) y las muestra en un acordeón interactivo. Los títulos de las vacantes resaltan y los detalles se expanden al hacer clic.

**¿Cómo actualizar las vacantes?**  
Edita el archivo `assets/jobs.json` siguiendo la estructura de los objetos existentes. No incluyas instrucciones de postulación en cada vacante, ya que se muestran de forma global en la UI.

**¿Cómo postularse?**  
Envía tu CV actualizado y el título de la vacante que te interesa a [nextgen@nextgentech.mx](mailto:nextgen@nextgentech.mx). Incluye también un número telefónico con clave internacional para que podamos contactarte.

## Desarrollo local
Puedes correr el sitio en local con Python 3:

```bash
python3 -m http.server 8080
```
Luego abre [http://localhost:8080](http://localhost:8080) en tu navegador.

## Edición y recomendaciones
- Mantén todas las páginas principales en la raíz del proyecto.
- Usa rutas relativas (no absolutas) para recursos y enlaces.
- Para cambios de estilos en vacantes, edita `css/pages/open_positions.css`.
- Para lógica de carga de vacantes, edita `js/pages/open_positions.js`.
