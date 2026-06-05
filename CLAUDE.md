# edgarsierra.com — Contexto para Claude Code

## Qué es
Sitio personal de Edgar Sierra (Head of BI & Data Science). Dos roles:
home base de contenido (blog/newsletter/investigación) y showcase técnico.
Tono: riguroso pero accesible (ni académico, ni corporativo).

## Idioma (IMPORTANTE)
- Contenido del sitio EN ESPAÑOL: copy, labels de navegación, mensajes de error,
  placeholders de formularios, metadata SEO, textos de botones. Default a español SIEMPRE.
- Código, nombres de variables, comments de lógica y mensajes de commit EN INGLÉS.

## Stack
- Frontend: Astro 5 + MDX, SSG, desplegado en Vercel.
- Contenido (blog, investigacion, projects): MDX en src/content/. Git es la fuente de verdad. NO base de datos.
- Backend dinámico: Cloud Run + FastAPI + Firestore. En JUNIO solo: newsletter (proxy a Beehiiv) + contacto.
- Auth deploy: GitHub Actions con Workload Identity Federation (sin llaves).
- Analytics: Cloudflare Web Analytics. Búsqueda: Pagefind. RSS: @astrojs/rss.

## Reglas de diseño (src/styles/tokens.css es la única fuente de verdad)
- Tipografía: IBM Plex Sans (UI), Plex Serif (cuerpo), Plex Mono (código). Self-hosted.
- Paleta: Okabe-Ito (colorblind-safe). Acento #0072B2. Color de pilar solo como señalética.
- Construir SIEMPRE con CSS custom properties (light + dark ya definidos en tokens).
  Dark mode está diferido: en junio solo light, pero no hardcodear colores nunca.
- Layout: container 1120px, columna de lectura 720px, figuras hasta 920px.
- Sin gradientes morados, glassmorphism ni estética "AI startup".
- Figuras numeradas ("Figura 1."). Tablas numéricas en Plex Mono alineadas a la derecha.

## Reglas de contenido (IMPORTANTE)
- Mencionables: Aumenta Intelligence, Marketing Multi-Client ETL, proyectos GCP de Aumenta, el backend de este sitio.
- NO mencionar OSINTPro por nombre en ningún lado. Solo patrones genéricos, sin atribuir.
- No mencionar proyectos internos de Aumenta no autorizados para difusión pública (detalle en _planning/, no versionado).
- Marca: "Edgar Sierra" en general; "Edgar Arnoldo Sierra" solo en /investigacion.

## Prioridades de ingeniería
1. El blog (MDX) nunca depende del backend para renderizar.
2. Lo dinámico (newsletter, contacto) se consume client-side; el HTML se sirve estático.
3. Incrementos pequeños y verificables. El frontend lo revisa Edgar manualmente.
4. Secretos en Secret Manager, jamás en el repo. CORS solo a edgarsierra.com.
5. Suscriptores: Beehiiv es la fuente de verdad, NO duplicar en Firestore.

## Pilares de contenido (nombre corto — color)
1. Política y datos — #D55E00
2. Marketing analytics — #0072B2
3. Ingeniería GCP — #009E73
4. IA aplicada — #CC79A7
5. Estadística — #E69F00
