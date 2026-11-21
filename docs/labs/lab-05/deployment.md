# Lab 5: Cloud Deployment and CI/CD Specification

**System:** Pollipop (University Review, Feedback, and Survey System)  
**Course:** CPE 334 Software Engineering (Semester 1/2026)  
**Deliverable:** Lab 5 — Cloud Deployment and CI/CD Pipeline on GCP  
**Team Prefix:** `sda0ec11f`  
**GCP Project ID:** `cpe-se-course-2026`  
**GCP Region:** `asia-southeast1` (Singapore)  

---

## 1. Team Roster & Roles

| Full Name | Student ID | GitHub Account | Portal Role | Responsibilities |
|---|---|---|---|---|
| ปทิตญา แก้ววิเชียร (Patitaya Kaewwichian) | 67070505220 | `@lmaybelgracel` | Primary Owner | Cloud Foundation, Containerization, Deployment Verification |
| ภัทร์ธิดาวดี อุ่นคำ (Phatthidawadi Ounkham) | 67070505225 | `@phatthidawadi` | Collaborator / Editor | Cloud-Readiness Refactoring, CI Quality Gate, Security Hardening |

---

## 2. Infrastructure Architecture & Resource Mapping

All resources are provisioned under the course-managed GCP project `cpe-se-course-2026` with team namespace prefix `sda0ec11f`:

| Component | Resource Identifier | Service / Specification | Status / Port |
|---|---|---|---|
| **Web & API Host** | `sda0ec11f` | Google Cloud Run Service | Port `3000`, HTTPS reverse-proxy |
| **Database Migration Job** | `sda0ec11f-migrate` | Google Cloud Run Job | Executes `prisma migrate deploy` & seed |
| **Relational Database** | `sda0ec11f-pg` | Google Cloud SQL (PostgreSQL 16 Enterprise) | Socket: `/cloudsql/cpe-se-course-2026:asia-southeast1:sda0ec11f-pg` |
| **Container Registry** | `sda0ec11f` | Google Artifact Registry (Docker OCI) | `asia-southeast1-docker.pkg.dev/cpe-se-course-2026/sda0ec11f` |
| **Service Account (Runtime)** | `sda0ec11f-runner@cpe-se-course-2026.iam.gserviceaccount.com` | Least-privilege runtime identity | Roles: Cloud SQL Client, Secret Manager Accessor |
| **Service Account (Deployer)** | `sda0ec11f-deployer@cpe-se-course-2026.iam.gserviceaccount.com` | CI/CD GitHub Actions deployer (`WIF_SERVICE_ACCOUNT`) | Roles: Cloud Run Developer, Artifact Registry Writer |

---

## 3. Live Service Endpoints

- **Cloud Run Base URL:** `https://sda0ec11f-4d7hbszvwq-as.a.run.app`
- **Health Check Endpoint:** `https://sda0ec11f-4d7hbszvwq-as.a.run.app/api/health`
- **Readiness Check Endpoint:** `https://sda0ec11f-4d7hbszvwq-as.a.run.app/api/ready`

---

## 4. Environment Variables Specification

The application configuration strictly decouples code from environment secrets according to Twelve-Factor App principles:

| Variable Name | Required Environment | Purpose | Source / Storage |
|---|---|---|---|
| `NODE_ENV` | Production & Local | Application runtime environment (`development` / `production`) | Environment Variable |
| `PORT` | Production & Local | Port to bind server (`3000` default, dynamically injected by Cloud Run) | Environment Variable |
| `DATABASE_URL` | Production & Local | PostgreSQL connection string (Unix domain socket in production) | Secret Manager (`sda0ec11f-database-url`) |
| `SESSION_SECRET` | Production & Local | Cookie signing secret for session persistence | Secret Manager (`sda0ec11f-app-secret-1`) |
| `ADMIN_PASSWORD` | Production & Local | Initial seed administrative account password | Secret Manager (`sda0ec11f-admin-password`) |
| `DEMO_USER_PASSWORD` | Production & Local | Password for seeded demonstration accounts | Secret Manager (`sda0ec11f-demo-password`) |
| `CORS_ORIGIN` | Production & Local | Permitted CORS origins for API requests | Environment Variable |

---

## 5. Verification Checklist (Issue 11 / Episode 1)

- [x] Cloud Shell authorized under project `cpe-se-course-2026`
- [x] Pre-allocated team resources inspected and mapped to team prefix `sda0ec11f`
- [x] Team membership verified on CPE334 Student Cloud Portal
- [x] Public Cloud Run service ingress verified

---

## 6. Application Cloud-Readiness Contracts (Issue 12 / Episode 2)

Pollipop has been refactored to satisfy all 6 Cloud-Ready runtime contracts for stateless execution on Google Cloud Run with Google Cloud SQL (PostgreSQL 16):

| # | Cloud-Ready Contract | Implementation in Pollipop | Source Reference |
|---|---|---|---|
| 1 | **Stateless Container & External Persistence** | All user sessions (`Session` table), surveys, and responses persist in PostgreSQL; zero local disk/SQLite state (`dev.db` fallback removed). | `server/prisma/schema.prisma`, `server/src/prisma.ts` |
| 2 | **PostgreSQL Schema & Migrations** | Prisma datasource migrated to `postgresql` with PostgreSQL-native DDL (`TIMESTAMP(3)`, explicit primary/foreign key constraints) for `prisma migrate deploy`. | `server/prisma/migrations/20261110000000_init/migration.sql` |
| 3 | **Dynamic Port & `0.0.0.0` Binding** | Server binds to `HOST=0.0.0.0` and reads `process.env.PORT` (default `3000`) to satisfy Cloud Run container ingress requirements. | `server/src/index.ts` |
| 4 | **HTTPS Reverse-Proxy Trust & Single-Origin Serving** | Configured `app.set('trust proxy', 1)` for `Secure` `HttpOnly` cookies behind Cloud Run TLS termination, env-driven `CORS_ORIGIN`, and static SPA serving from `client/dist`. | `server/src/app.ts` |
| 5 | **Liveness, Readiness & Graceful Shutdown** | `GET /api/health` (HTTP 200) and `GET /api/ready` (`SELECT 1` DB ping → 200/503) plus `SIGTERM`/`SIGINT` handlers closing HTTP server and Prisma connections cleanly. | `server/src/app.ts`, `server/src/index.ts` |
| 6 | **12-Factor Environment & Secret Hygiene** | All secrets (`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `DEMO_USER_PASSWORD`) injected via environment variables/Secret Manager; documented with safe placeholders only. | `.env.example`, `server/.env.example`, `server/prisma/seed.ts` |

---

## 7. Container Architecture & Multi-Stage Packaging (Issue 13 / Episode 3)

Pollipop is packaged with Docker adhering to least-privilege non-root execution and production multi-stage optimization:

### 7.1 Container Topology & Local Orchestration

| Service | Image / Build Context | Container Name | Port Mapping | Purpose |
|---|---|---|---|---|
| `db` | `postgres:16-alpine` | `pollipop-db` | `5432:5432` | Persistent PostgreSQL 16 database with volume `postgres_data` |
| `migrate` | `./server/Dockerfile` | `pollipop-migrate` | N/A | One-shot initialization: runs `prisma migrate deploy` and `seed.ts` |
| `server` | `./server/Dockerfile` | `pollipop-server` | `3000:3000` | Express API runtime listening on port `3000` as non-root `node` |
| `client` | `./client/Dockerfile` | `pollipop-client` | `5173:80` | Nginx reverse-proxy serving Vite React SPA and proxying `/api` |

### 7.2 Production Multi-Stage Container (`Dockerfile`)
- **Stage 1 (`client-builder`):** Compiles Vite React SPA (`npm run build`) into production static assets (`/app/client/dist`).
- **Stage 2 (`server-builder`):** Generates Prisma client (`prisma generate`) and compiles TypeScript (`tsc`) into CommonJS bytecode (`dist/`).
- **Stage 3 (`production`):** Minimal `node:24-alpine` runtime copying only compiled artifacts, running as unprivileged user `node` on port `3000` with `./docker-entrypoint.sh`.

---

## 8. Continuous Integration Quality Gate (Issue 14 / Episode 4)

GitHub Actions workflow `.github/workflows/ci-docker.yml` enforces automated verification on every Pull Request targeting `lab-5-staging` and `main`, and is reusable by `deploy.yml` via `workflow_call`:

- **Required Check Job ID:** `test-and-docker`
- **Database Service:** Ephemeral `postgres:16-alpine` container executing real Prisma migrations (`prisma migrate deploy`) and all 38 server integration tests + 7 client unit tests.
- **Deployment Script Verification:** Runs `DRY_RUN=1 bash deploy/deploy.sh`, offline stub tests (`deploy/tests/test_deploy_stub.sh`, `deploy/tests/test_release_stub.sh`), and Python syntax verification on `deploy/smoke_test.py`.
- **Container Build Gate:** Builds the unified multi-stage `Dockerfile` and asserts the image runs as non-root user `node`.



