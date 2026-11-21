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
| `SESSION_SECRET` | Optional (Reserved) | Optional cookie signing secret (Pollipop uses DB-backed opaque session IDs; not mounted in `deploy.sh` until populated via `./kit.sh secrets add 1`) | Secret Manager (`sda0ec11f-app-secret-1`, optional) |
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

---

## 9. Repeatable Release & Rollback Procedure (Issue 17 / Episode 7 — R-07, R-08)

All production releases to Google Cloud Run (`sda0ec11f`) are executed exclusively from `main` via `.github/workflows/deploy.yml` (**Deploy demo**) using keyless Workload Identity Federation (`sda0ec11f-deployer@cpe-se-course-2026.iam.gserviceaccount.com`):

### 9.1 Standard Release Flow
1. Create a feature branch from an up-to-date `lab-5-staging` branch and open a Pull Request into `lab-5-staging` with label `lab5`.
2. Wait for `CI (Tests & Docker) / test-and-docker` to pass and obtain peer review approval from your teammate. Merge into `lab-5-staging`.
3. Open a Release Pull Request from `lab-5-staging` into `main` (protected by the `protect-main` ruleset requiring 1 approval, up-to-date branch, and passing `test-and-docker`).
4. Once approved and merged into `main`, **Deploy demo** triggers automatically:
   - Re-runs `ci-docker.yml` (`test-and-docker`).
   - Authenticates to GCP via WIF (`environment: demo`).
   - Builds and pushes `asia-southeast1-docker.pkg.dev/cpe-se-course-2026/sda0ec11f/sda0ec11f:<40-char-commit-SHA>`.
   - Executes `deploy/release.sh`: resolves the immutable `@sha256` digest, runs Cloud Run migration job `sda0ec11f-migrate`, updates Cloud Run service `sda0ec11f`, and routes 100% traffic to the latest revision.
   - Runs `python3 deploy/smoke_test.py "$SERVICE_URL"` against `/api/health`, `/api/ready`, and `/`.

### 9.2 Identifying the Currently Running Commit (R-08)
- Open the latest successful **Deploy demo** run Summary on GitHub Actions to read the **Commit image tag** (40-char SHA) and **Digest** (`@sha256:...`).
- Cross-verify against Google Cloud Console -> **Cloud Run -> `sda0ec11f` -> Revisions** (active 100% traffic revision image digest) and **Artifact Registry -> `sda0ec11f`** (tag matching the full commit SHA).

### 9.3 Rollback & Roll-Forward Procedure
1. Open **GitHub Actions -> Deploy demo -> Run workflow** on branch `main`.
2. Paste the full 40-character commit SHA of the target prior release (for rollback) or newer release (for roll-forward) into `image_tag`, then click **Run workflow**.
3. The pipeline skips tests, build, and database migration (`ROLLBACK=true`), resolves the existing image digest in Artifact Registry, updates Cloud Run to serve that digest, and verifies health with `deploy/smoke_test.py`.

---

## 10. Data Persistence, Rollback & Roll-Forward Verification Log (Issue 18 / Episode 8)

Live verification was executed against `https://sda0ec11f-4d7hbszvwq-as.a.run.app` (Cloud Run `sda0ec11f` connected to Cloud SQL PostgreSQL `sda0ec11f-pg`) using two immutable commit-SHA images stored in Artifact Registry:

| Stage | Action / Trigger | Target Commit SHA (`image_tag`) | GitHub Actions Run | Live SPA Bundle | `(Release 2)` Visible | Live Smoke Test (`/api/health`, `/api/ready`, `/`) |
|---|---|---|---|---|---|---|
| **Release A** | Auto-deploy (`push` to `main`, PR #37) | `6b9821c1651f69ef4d3b5f1b16f7bba206da6563` | [`#44945262105`](https://github.com/phatthidawadi/pollipop/actions/runs/44945262105) (✅ success) | `/assets/index-yRFRucEu.js` | `False` | PASS (HTTP 200, `db=connected`) |
| **Release B** | Auto-deploy (`push` to `main`, PR #39 / C-06) | `c32283750945d4d07e641868ee5d81e32b2f4888` | [`#44947414079`](https://github.com/phatthidawadi/pollipop/actions/runs/44947414079) (✅ success) | `/assets/index-D4qqVP1v.js` | `True` | PASS (HTTP 200, `db=connected`) |
| **Rollback** | Manual `workflow_dispatch` (`ROLLBACK=true`) | `6b9821c1651f69ef4d3b5f1b16f7bba206da6563` | [`#44954048929`](https://github.com/phatthidawadi/pollipop/actions/runs/44954048929) (✅ success, 40s) | `/assets/index-yRFRucEu.js` | `False` | PASS (HTTP 200, `db=connected`) |
| **Roll-Forward** | Manual `workflow_dispatch` (`ROLLBACK=true`) | `c32283750945d4d07e641868ee5d81e32b2f4888` | [`#44954675642`](https://github.com/phatthidawadi/pollipop/actions/runs/44954675642) (✅ success) | `/assets/index-D4qqVP1v.js` | `True` | PASS (HTTP 200, `db=connected`) |

### Key Resilience Observations
- **Zero-Rebuild & Non-Destructive Rollback:** Both Rollback (`#44954048929`) and Roll-Forward (`#44954675642`) skipped `test`, `Build and push image`, and Cloud Run migration (`sda0ec11f-migrate`), resolving the existing immutable `@sha256` digest directly from Artifact Registry and completing in ~40 seconds.
- **Database Durability Across Revisions:** All relational records stored in Cloud SQL (`sda0ec11f-pg`) remained intact across both revision transitions with zero downtime and passing `/api/ready` (`db=connected`) probes.

---

## 11. Lab 5 Final Checkpoint Sign-Off (C-01 through C-06)

| Checkpoint | Description | Verification Artifact / Evidence | Status |
|---|---|---|---|
| **C-01** | Cloud-Ready Architecture & Multi-Stage Non-Root Container | PR #31 (PostgreSQL, `trust proxy`, graceful shutdown, `.env.example`s) & PR #32 (Multi-stage `Dockerfile`, `USER node`, `docker-compose.yml`) | ✅ Verified |
| **C-02** | CI Quality Gate & Blocked Merge Gate on `main` | PR #33 (`ci-docker.yml` job `test-and-docker`), `protect-main` ruleset, and closed throwaway PR #35 (`test/prove-gate` blocked with red check) | ✅ Verified |
| **C-03** | Initial Production Deployment & Live Smoke Probes | Release PR #34 merged to `main`, deployed to `https://sda0ec11f-4d7hbszvwq-as.a.run.app`, `deploy/smoke_test.py` passing | ✅ Verified |
| **C-04** | Keyless WIF Authentication (Zero JSON Keys) | GitHub Environment `demo` restricted to `main` with `GCP_PROJECT_ID`, `GCP_REGION`, `WIF_PROVIDER`, `WIF_SERVICE_ACCOUNT` and zero secret keys (Issue #27) | ✅ Verified |
| **C-05** | Data Persistence & Non-Destructive Rollback / Roll-Forward | Live Rollback Run `#44954048929` (Release B -> A) & Roll-Forward Run `#44954675642` (Release A -> B) with Cloud SQL durability verified (Issue #29) | ✅ Verified |
| **C-06** | Repeatable Automated Release Pipeline on `main` Merge | PR #36 (`deploy.yml`), Release A PR #37 (`#44945262105`), visible UI change PR #38 (`feature/deploy-proof`), Release B PR #39 (`#44947414079`) | ✅ Verified |





