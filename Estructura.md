nextgentech-mx/
├─ index.html                # Home, con secciones + bloque de Vacantes dinámicas
├─ pages/                    # Páginas secundarias
│  ├─ about.html
│  ├─ contact.html
│  ├─ services.html
│  ├─ artificial_intelligence.html
│  ├─ global_talent_acquisition.html
│  └─ privacy.html
├─ partials/                 # Header y footer compartidos (inyectados dinámicamente)
│  ├─ header.html
│  └─ footer.html
├─ css/                      # Estilos organizados
│  ├─ base/                  # Tokens y reset
│  │  ├─ tokens.css          # Variables: colores, tipografías, spacing, breakpoints
│  │  ├─ reset.css           # Reset básico
│  │  └─ utilities.css       # Helpers: .container, grids, etc.
│  ├─ layout/                # Estructura global
│  │  └─ header-footer.css   # Navbar, footer
│  └─ pages/                 # Estilos por página
│     └─ home.css
├─ js/
│  ├─ core/                  # Utilidades compartidas
│  │  └─ loader.js           # Inyecta header/footer y marca link activo
│  └─ pages/
│     └─ home.js             # Renderiza Vacantes desde JSON
├─ assets/
│  └─ jobs.json              # Vacantes dinámicas (JSON)
└─ img/                      # Imágenes y recursos
