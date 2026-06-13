# API de edgarsierra.com

Backend dinámico del sitio: un servicio FastAPI desplegado en Cloud Run que atiende
las dos únicas piezas dinámicas del sitio (el resto es estático en Vercel):

- `POST /newsletter/subscribe` — proxy a Beehiiv (Beehiiv es la fuente de verdad; no se
  guardan suscriptores localmente).
- `POST /contact` — guarda el mensaje en Firestore (colección `messages`).
- `GET /health` — healthcheck.

El blog y las páginas de contenido **nunca** dependen de este servicio para renderizar:
si la API está fría o caída, el sitio sigue sirviéndose estático desde la CDN.

---

## Arquitectura de identidad: tres planos, tres mecanismos

El punto de este backend como case study es que cada interacción usa el mínimo
privilegio posible y **no hay una sola llave JSON en el repositorio**.

| Plano | Quién se autentica ante quién | Mecanismo | Por qué |
|---|---|---|---|
| **Deploy (CI/CD)** | GitHub Actions → GCP | **Workload Identity Federation (OIDC)** | GitHub emite un token OIDC efímero por ejecución; GCP lo valida directamente contra el repo autorizado. Sin llaves de larga vida que robar o rotar. |
| **Runtime** | Cloud Run → Firestore / Secret Manager | **Service account de runtime** con IAM mínimo | El servicio corre dentro de GCP con la identidad `edgarsierra-api`, que solo tiene `datastore.user` + `secretmanager.secretAccessor`. No necesita federación. |
| **Navegador → API** | Visitante anónimo → API | **Sin auth** + validación | Acciones públicas (suscribir, contactar). Se protegen con CORS estricto, honeypot anti-spam y rate limiting por IP. Nada de WIF/JWT aquí. |

> WIF es para el **pipeline de deploy**, no para autenticar requests del navegador.
> Confundir ambos planos es el error de diseño que este backend evita a propósito.

---

## Deploy con Workload Identity Federation (sin llaves)

El pipeline vive en [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) y
corre solo cuando cambia `api/**`. Flujo:

1. GitHub Actions solicita un token OIDC (`permissions: id-token: write`).
2. `google-github-actions/auth` lo intercambia, vía el **WIF provider**, por
   credenciales efímeras de la service account `github-deployer`.
3. Se construye la imagen Docker, se publica en **Artifact Registry**
   (`us-central1-docker.pkg.dev/edgarsierra-prod/edgarsierra/api`) y se despliega a
   Cloud Run con la SA de runtime.
4. Smoke test final contra `GET https://api.edgarsierra.com/health`.

### Por qué el provider solo confía en este repo

El binding restringe la federación a un único repositorio mediante un `principalSet`
por `attribute.repository`, y el provider exige una `attribute-condition` sobre el
`repository_owner`. Ningún otro repo —ni un fork— puede impersonar al deployer:

```
principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/
  workloadIdentityPools/github/attribute.repository/edgarsierra-gt/edgarsierra.com
```

### Permisos de la SA de deploy

`github-deployer` tiene exactamente lo necesario para desplegar, nada más:

- `roles/run.admin` — crear/actualizar revisiones de Cloud Run.
- `roles/artifactregistry.writer` — publicar la imagen.
- `roles/iam.serviceAccountUser` **sobre la SA de runtime** — para poder asignarla al
  servicio (no es un permiso a nivel de proyecto).

---

## Secretos

`BEEHIIV_API_KEY` vive en **Secret Manager** y se monta como variable de entorno en
Cloud Run (`--set-secrets`). Nunca está en el repo, ni en los logs, ni en GitHub: el
deploy con WIF no necesita ningún secreto almacenado en GitHub Actions.

`BEEHIIV_PUBLICATION_ID`, `PROJECT_ID` y `ALLOWED_ORIGINS` no son sensibles (el
publication ID es visible en la URL pública de Beehiiv) y van como env vars planas.

---

## Desarrollo local

```bash
# Autenticación local para Firestore (ADC)
gcloud auth application-default login

# Variables locales (no se commitea api/.env)
cp api/.env.example api/.env   # editar con valores reales

cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

CORS: para probar contra el sitio Astro en `localhost:4321`, agregá ese origen a
`ALLOWED_ORIGINS` en tu `.env` local.

---

## Stack

FastAPI · Uvicorn · Pydantic v2 · `google-cloud-firestore` (async) · httpx · slowapi.
Imagen `python:3.12-slim`. Región `us-central1`.
