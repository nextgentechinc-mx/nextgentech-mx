# Plan general de migración a DigitalOcean — nextgentech.mx
**Fecha:** 2025-09-09

> Objetivo: Ejecutar nextgentech.mx con frontend y backend en un servidor de DigitalOcean, usando una base de datos en el mismo proveedor. Se prioriza simplicidad hoy y escalabilidad moderada mañana, con estándares profesionales (seguridad, CI/CD, backups y monitoreo).

---

## 1) Arquitectura propuesta (MVP productivo)
**Opción A (recomendada):** Droplet + Docker + Nginx + Managed PostgreSQL
- **Droplet** (Ubuntu LTS) para correr contenedores:
  - **frontend** (Next.js o sitio estático servidos por Nginx)
  - **backend** (Node.js/Express o Next.js API Routes en contenedor)
  - **reverse-proxy** (Nginx) + **TLS** (Let's Encrypt con certbot)
- **Base de datos:** PostgreSQL **gestionado por DigitalOcean** (Managed DB) → menos mantenimiento, backups automáticos, alta disponibilidad opcional.
- **Almacenamiento de archivos:** DO **Spaces** (S3-compatible) para assets y archivos subidos.
- **CDN:** opcional (DigitalOcean CDN frente a Spaces) para servir estáticos globalmente.
- **Dominio y DNS:** en DigitalOcean DNS apuntando al load balancer o al droplet.
- **Logs/Monitoreo:** DO Monitoring + alertas + Sentry (en app) + UptimeRobot/Better Stack.

**Opción B (más PaaS):** DigitalOcean App Platform
- Despliegue “push-to-deploy”, escala automática y SSL gestionado.
- Menos control fino, costo algo mayor. Mantener **Managed PostgreSQL** aparte.

> Recomendación: **Opción A** para aprender/ahorrar y tener control; podrás migrar partes a App Platform si conviene.

---

## 2) Repositorio y estructura de proyecto
Monorepo simple para frontend + backend + infra (Docker/compose).

```
/nextgentech
├─ apps/
│  ├─ web/                      # Frontend (Next.js o sitio estático)
│  └─ api/                      # Backend (Node/Express o Next API)
├─ packages/
│  ├─ ui/                       # Componentes compartidos (opcional)
│  └─ config/                   # tsconfig/eslint/tailwind, etc.
├─ infra/
│  ├─ docker/
│  │  ├─ web.Dockerfile
│  │  ├─ api.Dockerfile
│  │  └─ nginx.Dockerfile
│  ├─ docker-compose.yml
│  ├─ nginx/                    # confs reverse proxy
│  │  ├─ nginx.conf
│  │  └─ sites-enabled/nextgentech.conf
│  ├─ scripts/                  # despliegue, backups, rotate logs
│  └─ README.md
└─ .env.example                 # variables de entorno documentadas
```

---

## 3) Rediseño mínimo para producción
- **TypeScript** en backend (tipado; menos bugs).
- Separar **capas**: `routes/` (delgadas), `services/`, `db/` (Prisma), `lib/`.
- **OpenAPI** (`/apps/api/openapi.yaml`) para contratos estables entre front y back.
- **Autenticación**: Auth.js o JWT propio (access corto + refresh en cookie httpOnly).
- **Suscripciones**: Stripe y/o PayPal (webhooks → sincronizar `Subscription` en DB).
- **Contenido en video**: preferible **Mux** (tokens de reproducción firmados). Si deseas todo en DO, usar **Spaces+CDN** para descarga y player propio (sin transcodificación adaptativa).

---

## 4) Variables de entorno (plantilla)
Crear `.env` (no subir a git) basado en `.env.example`:
```
# App
NODE_ENV=production
APP_URL=https://nextgentech.mx

# API
PORT=3001
JWT_PUBLIC_KEY="---BEGIN PUBLIC KEY---..."
JWT_PRIVATE_KEY="---BEGIN PRIVATE KEY---..."

# Base de datos (Managed PostgreSQL DO)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require

# Storage (Spaces)
SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
SPACES_BUCKET=nextgentech-assets
SPACES_KEY=...
SPACES_SECRET=...

# Stripe / PayPal
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Observabilidad
SENTRY_DSN=...
```

---

## 5) Contenedores: Dockerfiles (ejemplo conceptual)
**`web.Dockerfile` (Next.js)**
```dockerfile
# build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

# run (si usas next start) o export (si estático)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm","run","start"]
```

**`api.Dockerfile` (Node/Express)**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3001
CMD ["node","dist/app.js"]
```

**`nginx.Dockerfile`**
```dockerfile
FROM nginx:1.27-alpine
COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf
COPY infra/nginx/sites-enabled/nextgentech.conf /etc/nginx/conf.d/default.conf
```

---

## 6) docker-compose.yml (esqueleto)
```yaml
version: "3.9"
services:
  web:
    build:
      context: ./apps/web
      dockerfile: ../../infra/docker/web.Dockerfile
    env_file: .env
    restart: unless-stopped

  api:
    build:
      context: ./apps/api
      dockerfile: ../../infra/docker/api.Dockerfile
    env_file: .env
    restart: unless-stopped

  nginx:
    build:
      context: ./infra/docker
      dockerfile: nginx.Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - web
      - api
    restart: unless-stopped
```

**Ruteo Nginx (`nextgentech.conf`)**: proxy a `web:3000` y `api:3001`, redirecciones HTTP→HTTPS, headers de seguridad.

---

## 7) Pasos de infraestructura en DigitalOcean
1. **Crear Droplet** (Ubuntu 24.04 LTS, 2 vCPU / 4GB RAM para empezar).  
   - Habilitar **SSH keys**, **UFW** (80, 443, 22), **fail2ban**.
2. **Instalar Docker y docker-compose-plugin**.
3. **Crear Managed PostgreSQL** en DO (ha, backups diarios, pgBouncer opcional).
4. **Crear Space + CDN** (si usarás assets descargables).  
5. **Configurar DNS** en DO: `A` a la IP del Droplet; TXT para verificación si aplica.
6. **TLS**:
   - Primera emisión: correr `certbot` en el Droplet con webroot o standalone.
   - Renovación automática via cron/systemd timer.
7. **Despliegue**: clonar repo, `docker compose build && docker compose up -d`.
8. **Backups**:
   - DB: ya incluidos en Managed PG (programar retención).  
   - Droplet: habilitar **Snapshots** semanales.  
   - Contenidos críticos: sync a Space o bucket externo.
9. **Monitoreo y alertas**:
   - DO Monitoring (CPU, RAM, disco). Alertas a email/Slack.  
   - Uptime checks (Better Stack/UptimeRobot).  
   - Sentry para errores de app.

---

## 8) CI/CD con GitHub Actions (flujo sugerido)
- **Build & push** imágenes a **DigitalOcean Container Registry (DOCR)**.
- **Deploy** al Droplet vía **SSH** que hace `docker compose pull && up -d`.
- Separar pipelines por `main` (prod) y `develop` (staging si creas segundo droplet).
- Semver de imágenes (`api:1.2.0`, `web:1.2.0`), y tags `latest` para prod.

**Pseudocode del workflow:**
1) `on: push` a `main`  
2) `docker buildx build` (web/api) → push a DOCR  
3) SSH al Droplet → `docker login DOCR` → `docker compose pull` → `up -d`  
4) `prisma migrate deploy` en `api` si aplica.

---

## 9) Seguridad base
- **JWT** corto + **refresh en cookie httpOnly** + rotación.
- **Rate limit** por IP/usuario en `/api/tutor/ask` y rutas sensibles.
- **CSP/Helmet**, **no** tokens en localStorage.
- **Secret management:** DO **Encrypted Secrets** en Actions; `.env` sólo en server.
- **Accesos** mínimos a DB (firewall: “trusted sources” del Droplet/Apps).
- **Audit logs** para pagos, roles, generación de links firmados.

---

## 10) Roadmap de migración (alto nivel)
**Fase 0 — Preparación**
- Reorganizar repo a la estructura de `apps/` + `infra/` + `.env.example`.
- Añadir Dockerfiles y `docker-compose.yml` funcional en local.
- Documentar variables y `README` de despliegue.

**Fase 1 — Infra básica en DO**
- Crear Droplet, Managed PG, DNS, TLS, Monitoring.
- Primer despliegue manual (SSH) con compose.

**Fase 2 — Persistencia y pagos**
- Conectar a Managed PG (Prisma migrations).
- Stripe/PayPal + webhooks → gating de contenido.

**Fase 3 — Media y almacenamiento**
- Integrar Mux (preferido) o Spaces+CDN para assets.
- Signed URLs / playback tokens.

**Fase 4 — Observabilidad y CI/CD**
- Sentry + Uptime + logs centralizados.
- GitHub Actions → DOCR → Deploy automatizado.

**Fase 5 — Tutor IA**
- Endpoint `/api/tutor/ask` (RAG básico), límites de uso, historial.
- (Opcional) Voz/llamadas con LiveKit + minutos por plan.

---

## 11) Estimación de costos iniciales (orientativa, USD/mes)
- Droplet 2vCPU/4GB: ~$24–28
- Managed PostgreSQL Basic: ~$15–30 (según tamaño)
- Spaces + CDN: ~$5 + tráfico
- Sentry (free tier) / UptimeRobot (free) / Better Stack (opc. $0–10)
- Stripe/PayPal: comisión por transacción
- Mux (si usas): pago por almacenamiento/streaming
> Puedes empezar en ~$50–80/mes y crecer por uso.

---

## 12) Checklist de “Listo para producción”
- [ ] HTTPS forzado y renovaciones automatizadas
- [ ] Backups y restauración probada
- [ ] `.env` completo; secrets en Actions/servidor
- [ ] Webhooks verificados (Stripe/PayPal)
- [ ] Migraciones Prisma automatizadas
- [ ] Rate limits y logging de seguridad
- [ ] Monitoreo, alertas y Uptime
- [ ] CI/CD con rollback sencillo
- [ ] Documentación paso a paso actualizada

---

## 13) Notas finales
- Empezar simple (un droplet) y crecer a **Load Balancer + 2 droplet** si el tráfico lo exige.
- Mantener **OpenAPI** vivo te permitirá extraer microservicios (incluido Spring Boot) sin fricción.
- Si en el futuro quieres **Kubernetes**, DO tiene **DOKS**, pero sólo cuando la complejidad lo justifique.
