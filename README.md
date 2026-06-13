# edgarsierra.com

Sitio personal de **Edgar Sierra** (Head of BI & Data Science): a la vez home base de
contenido —blog, newsletter, investigación— y showcase técnico de ingeniería de datos.

Construido como un sitio estático (Astro) con un backend dinámico mínimo (FastAPI en
Cloud Run), desplegado con CI/CD vía Workload Identity Federation **sin llaves JSON**.
El propio backend es, a propósito, un case study de ingeniería en GCP.

- **Frontend:** Astro 6 + MDX (SSG) → Vercel
- **Backend:** FastAPI → Cloud Run · Firestore · Beehiiv · Secret Manager
- **Deploy:** GitHub Actions + Workload Identity Federation (OIDC, sin llaves)
- **Idioma:** contenido en español · código y commits en inglés

---

## Tabla de contenidos

1. [Qué es](#1-qué-es)
2. [Arquitectura](#2-arquitectura)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Estructura del repositorio](#4-estructura-del-repositorio)
5. [Cómo se construyó](#5-cómo-se-construyó)
6. [Desarrollo local](#6-desarrollo-local)
7. [Contenido (Content Collections)](#7-contenido-content-collections)
8. [Sistema de diseño](#8-sistema-de-diseño)
9. [Backend / API](#9-backend--api)
10. [Infraestructura y despliegue](#10-infraestructura-y-despliegue)
11. [Open Graph images](#11-open-graph-images)
12. [SEO y periféricos](#12-seo-y-periféricos)
13. [Decisiones de arquitectura](#13-decisiones-de-arquitectura)

---

## 1. Qué es

Un sitio personal con dos roles que conviven sin estorbarse:

- **Home base de contenido** — blog, newsletter e investigación académica, todo
  versionado en git como MDX.
- **Showcase técnico** — la infraestructura del propio sitio (API, deploy, identidad
  en GCP) es parte del portafolio.

**Principio rector:** el contenido nunca depende del backend para renderizar. El blog
es 100 % estático; las únicas piezas dinámicas (contacto, newsletter) se resuelven
client-side. Si la API está fría o caída, el sitio se sigue sirviendo desde la CDN.

---

## 2. Arquitectura

```
   Escribís MDX          git push       ┌────────────────────────────┐
   src/content/    ───────────────────► │ Vercel (build SSG)          │ ──► edgarsierra.com
                                         │ Astro 6 + MDX + KaTeX        │     (estático, CDN)
                                         └────────────────────────────┘
                                                      │ fetch client-side (solo lo dinámico)
                                                      ▼
   navegador ────────────────────────────► api.edgarsierra.com  (Cloud Run · FastAPI)
   (contacto / newsletter)                     │                    │
                                                ▼                    ▼
                                            Firestore            Beehiiv API
                                            (messages)           (suscriptores — fuente de verdad)
                                                ▲
                                                │ deploy (WIF/OIDC, sin llaves)
                                     ┌─────────────────────┐
                                     │ GitHub Actions       │ ──► Artifact Registry + Cloud Run
                                     └─────────────────────┘
```

Dos planos de despliegue independientes:

- **Frontend:** cualquier push a `main` que toque el sitio dispara un build en **Vercel**.
- **Backend:** un push que toque `api/**` dispara la **GitHub Action** que despliega a
  Cloud Run. Cambios de frontend no tocan el backend y viceversa (filtro de paths).

---

## 3. Stack tecnológico

### Frontend

| Pieza | Tecnología |
|---|---|
| Framework | Astro 6 (output `static` / SSG) |
| Contenido | MDX + Content Collections (validadas con Zod) |
| Matemática | `remark-math` + `rehype-katex` |
| Código | Shiki (resaltado en build) |
| Tipografía | IBM Plex Sans / Serif / Mono (self-hosted, `@fontsource`) |
| Búsqueda | Pagefind (índice estático en build) |
| RSS / Sitemap | `@astrojs/rss` · `@astrojs/sitemap` |
| OG images | `astro-og-canvas` (generadas en build) |
| Hosting | Vercel |

### Backend

| Pieza | Tecnología |
|---|---|
| Framework | FastAPI (Python 3.12) |
| Server | Uvicorn |
| Validación | Pydantic v2 |
| Base de datos | Firestore (cliente async) |
| Newsletter | Beehiiv API v2 (proxy) |
| Rate limiting | slowapi (por IP real vía `X-Forwarded-For`) |
| Hosting | Cloud Run (us-central1) |

### Infraestructura

| Pieza | Tecnología |
|---|---|
| Cloud | Google Cloud Platform (`edgarsierra-prod`) |
| Contenedores | Docker → Artifact Registry |
| CI/CD | GitHub Actions + Workload Identity Federation (OIDC) |
| Secretos | Secret Manager |
| DNS | Cloudflare (registros DNS-only) |
| Analytics | Cloudflare Web Analytics |

---

## 4. Estructura del repositorio

```
edgarsierra.com/
├── .github/workflows/deploy.yml   ← CI/CD del backend (WIF → Cloud Run)
├── CLAUDE.md                       ← contexto e instrucciones del proyecto
├── astro.config.mjs
├── src/
│   ├── content.config.ts           ← schemas Zod (blog, investigacion, projects)
│   ├── content/
│   │   ├── blog/*.mdx
│   │   ├── investigacion/*.mdx
│   │   └── projects/*.mdx
│   ├── components/                 ← Card, Figure, HeroViz, PillarTag, SearchBox
│   ├── layouts/                    ← BaseLayout, ArticleLayout
│   ├── pages/                      ← rutas del sitio + /og/[...route].ts (OG images)
│   ├── data/                       ← socials.ts, charlas.ts
│   ├── lib/                        ← api.ts, pillars.ts, utils.ts
│   └── styles/                     ← tokens.css (única fuente de diseño), global.css
├── api/                            ← backend FastAPI (ver api/README.md)
│   ├── main.py · config.py · models.py · limiter.py
│   ├── routers/{contact,newsletter}.py
│   ├── services/{firestore,beehiiv}.py
│   ├── Dockerfile · requirements.txt
│   └── README.md                   ← detalle de identidad/seguridad del backend
└── public/                         ← favicon, robots.txt, images/
```

---

## 5. Cómo se construyó

El proyecto se desarrolló en fases incrementales y verificables. Cada fase deja el
sitio en un estado funcional:

| Fase | Objetivo | Entregable |
|---|---|---|
| **0 — Cimientos** | Astro + tokens de diseño + integraciones + DNS a Vercel | Sitio desplegado, deploy automático |
| **1 — Contenido y render** | Content Collections + render MDX + todas las páginas + SEO | Sitio navegable completo, RSS + sitemap |
| **2 — Backend dinámico** | FastAPI (contacto + newsletter) en Cloud Run + Firestore | Formularios funcionando desde el sitio vivo |
| **3 — Deploy + seguridad** | GitHub Actions → Cloud Run con WIF (sin llaves) | Pipeline de CI/CD + case study de identidad GCP |
| **4 — Flagship + OG** | OG images dinámicas + primer artículo de fondo | Imágenes sociales por artículo, blog con contenido real |

**Orden de seguridad:** el contenido (fases 0–1) va primero y nunca depende del
backend. La infraestructura dinámica se añade después, desacoplada.

---

## 6. Desarrollo local

### Frontend

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # build SSG + índice Pagefind -> dist/
npm run preview      # previsualizar el build
```

Variables (raíz, opcional `.env`):

```
PUBLIC_API_URL=http://localhost:8000   # apunta los forms al backend local
```

### Backend

```bash
gcloud auth application-default login          # ADC para Firestore en local
cp api/.env.example api/.env                   # completar con valores reales (NO se commitea)

cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Para probar los forms contra el sitio local, agregá `http://localhost:4321` a
`ALLOWED_ORIGINS` en tu `api/.env`.

---

## 7. Contenido (Content Collections)

Git es la fuente de verdad del contenido — **no hay base de datos ni panel admin**.
Cada colección está validada con Zod en [src/content.config.ts](src/content.config.ts);
un archivo con datos inválidos rompe el build (calidad por diseño).

| Colección | Campos principales |
|---|---|
| `blog` | `title`, `excerpt`(≤200), `pillar`(1–5), `tags[]`, `publishedAt`, `draft`, `seo?` |
| `investigacion` | `title`, `authors`, `venue`, `year`, `status`, `type`, `abstract`, `link?` |
| `projects` | `title`, `summary`, `stack[]`, `role?`, `links[]`, `featured`, `order`, `caseStudy` |

Escribir un artículo = crear un `.mdx` en `src/content/blog/` con su frontmatter.
Soporta KaTeX (`$...$`), figuras numeradas (`<figure>`/`<figcaption>`), código con
resaltado y footnotes. Un artículo con `draft: true` no aparece en los listados de
producción (sí en desarrollo).

---

## 8. Sistema de diseño

[`src/styles/tokens.css`](src/styles/tokens.css) es la **única fuente de verdad**: todo
se construye con CSS custom properties (light y dark ya definidos; dark mode diferido,
pero nunca se hardcodean colores).

- **Tipografía:** IBM Plex Sans (UI), Plex Serif (cuerpo de artículo), Plex Mono (código y cifras).
- **Paleta:** Okabe-Ito, colorblind-safe. Acento `#0072B2`.
- **Layout:** container 1120px · columna de lectura 720px · figuras hasta 920px.
- **Pilares de contenido** (el color es solo señalética de tag/borde, nunca fondo):

  | # | Pilar | Color |
  |---|---|---|
  | 1 | Política y datos | `#D55E00` |
  | 2 | Marketing analytics | `#0072B2` |
  | 3 | Ingeniería GCP | `#009E73` |
  | 4 | IA aplicada | `#CC79A7` |
  | 5 | Estadística | `#E69F00` |

Sin gradientes morados, glassmorphism ni estética "AI startup". Editorial-técnico.

---

## 9. Backend / API

Servicio en `api.edgarsierra.com`. Detalle completo en [api/README.md](api/README.md).

| Endpoint | Función | Protección |
|---|---|---|
| `GET /health` | Healthcheck | — |
| `POST /contact` | Guarda el mensaje en Firestore `messages` | rate limit 3/h por IP · honeypot |
| `POST /newsletter/subscribe` | Proxy a Beehiiv (no guarda suscriptores) | rate limit 5/min por IP · honeypot |

- **CORS** restringido a `https://edgarsierra.com` (configurable por env var).
- **Honeypot:** un campo oculto `website`; si llega relleno, la API responde `200`
  silencioso sin tocar Firestore ni Beehiiv (no se le revela al bot la detección).
- **Suscriptores:** Beehiiv es la fuente de verdad; no se duplican en Firestore.

---

## 10. Infraestructura y despliegue

### Tres planos de identidad

El diseño de seguridad usa el mínimo privilegio en cada interacción y **no guarda
ninguna llave JSON en el repositorio**:

| Plano | Mecanismo |
|---|---|
| **Deploy** (GitHub Actions → GCP) | Workload Identity Federation (OIDC efímero, sin llaves) |
| **Runtime** (Cloud Run → Firestore/Secrets) | Service account con IAM mínimo |
| **Navegador → API** | Sin auth + CORS + honeypot + rate limit |

### Pipeline

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) corre solo en cambios de
`api/**`: autentica vía WIF, construye la imagen Docker, la publica en Artifact Registry
(tag por commit SHA), despliega a Cloud Run con la SA de runtime y hace un smoke test a
`/health`. El frontend se despliega por separado en Vercel.

Los secretos viven en **Secret Manager** y se montan como variables de entorno en Cloud
Run; el deploy con WIF no necesita ningún secreto almacenado en GitHub.

---

## 11. Open Graph images

[`src/pages/og/[...route].ts`](src/pages/og/[...route].ts) genera las imágenes sociales
**en build** con `astro-og-canvas` (sin runtime):

- Una por artículo en `/og/blog/<id>.png` + una por defecto del sitio en `/og/site.png`.
- Plantilla editorial: borde del color del pilar (señalética), título en IBM Plex Sans,
  marca "Edgar Sierra", fondo neutro. 1200×630.
- Cableadas desde `ArticleLayout` → `BaseLayout` con URL absoluta y `og:image:width/height`.

---

## 12. SEO y periféricos

- **JSON-LD:** `Person` (en `/sobre-mi`, con `sameAs`), `Article` (en posts),
  `BreadcrumbList` (global, computado del pathname).
- **Meta:** Open Graph + Twitter Card en cada página, canonical, `og:locale=es_GT`.
- **Búsqueda:** Pagefind (indexa el HTML en build; cero backend).
- **RSS + sitemap:** generados automáticamente desde las Content Collections.
- **Analytics:** Cloudflare Web Analytics (sin cookies).

---

## 13. Decisiones de arquitectura

Decisiones selladas que dan forma al proyecto:

- **Contenido en git, no en base de datos.** El blog y los proyectos son MDX versionado;
  enrutar artículos por una DB que solo se consulta en build sería usar la herramienta
  equivocada (un punto de falla extra y escritura incómoda).
- **Backend mínimo.** Solo lo genuinamente dinámico (contacto, newsletter). Sin panel
  admin, sin SSR donde alcanza SSG.
- **Beehiiv como fuente de verdad** de suscriptores — menos PII bajo custodia.
- **WIF para el pipeline de deploy**, no para autenticar al navegador: confundir ambos
  planos es justo el error de diseño que el backend evita a propósito.
- **Dark mode diferido** pero con tokens listos desde el día 1, para que añadirlo sea un
  bloque `@media`, no un refactor.

---

<sub>Hecho con Astro + GCP. Contenido en español; código y commits en inglés.</sub>
