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


