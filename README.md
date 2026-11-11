# Pollipop — University Review, Feedback, and Survey System

[![Deliverable 1 Baseline](https://img.shields.io/badge/Deliverable%201-Parts%20A--E%20Ready-success)](./docs/srs.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**CPE 334 Software Engineering Project | Theme 10: Review, Feedback, and Survey System**  
**Repository:** `https://github.com/phatthidawadi/pollipop`  
**Team Members:**  
- **Student 1 (Author / Collaborator):** ภัทร์ธิดาวดี อุ่นคำ (Phatthidawadi Aunkham) — 67070505225 (`student1@pollipop.local`, GitHub: `@phatthidawadi`)  
- **Student 2 (Author / Collaborator):** ปทิตญา แก้ววิเชียร (Patitaya Kaewwichian) — 67070505220 (`student2@pollipop.local`, Git: `lmaybelgracel@email.com`, GitHub: `@lmaybelgracel`)  

---

## Project Documentation Index

All software engineering specifications, architectural designs, and sprint engineering contracts are organized within the [`docs/`](./docs/) directory:

1. **[Part A: Software Requirements Specification (`docs/srs.md`)](./docs/srs.md)**  
   Stakeholder context, system scope, 16 Functional Requirements (`FR-01`..`FR-16`), 13 Business Rules (`BR-01`..`BR-13`), 5 Non-Functional Requirements (`NFR-01`..`NFR-05`), and engineering design decisions.
2. **[Part B: Feature Inventory (`docs/features.md`)](./docs/features.md)**  
   Comprehensive inventory of features (`S-01`, `F-01` through `F-09`), dependency graphs, and multi-sprint delivery roadmaps.
3. **[Part B: Requirements Traceability Matrix (`docs/traceability.md`)](./docs/traceability.md)**  
   Full bidirectional traceability linking requirements to feature IDs, acceptance criteria (`AC-01`..`AC-38`), and test specifications (`TEST-01`..`TEST-40`).
4. **[Part C: System-Level Software Design Specification (`docs/system-sds.md`)](./docs/system-sds.md)**  
   Three-tier architecture, complete Entity-Relationship Diagram (ERD), full Prisma schema, RBAC matrix, and Google Cloud Run / Cloud SQL deployment topology.
5. **[Part D: Three-Sprint Plan (`docs/sprints/plan.md`)](./docs/sprints/plan.md)**  
   Three-sprint release milestones, rationale for Sprint 1 vertical slice, and balanced pair programming workflow.
6. **[Part E: Sprint 1 Engineering Contracts (`docs/sprints/sprint-1/specification.md` & `docs/sprints/sprint-1/contracts.md`)](./docs/sprints/sprint-1/specification.md)**  
   Detailed feature designs for Sprint 1 (`S-01`, `F-01`, `F-02`, `F-03`, `F-04`), API payloads, 38 Acceptance Criteria, 40 Software Test Specifications, and Definition of Done.

---

## Technology Stack

* **Presentation Layer:** React 18, Vite, TypeScript, React Router v6
* **Application Layer:** Node.js, Express, TypeScript, Zod, bcryptjs, cookie-parser
* **Persistence Layer:** PostgreSQL 16, Prisma ORM
* **Testing Suite:** Vitest, Supertest, Playwright E2E
* **Deployment & Cloud:** Docker, Google Artifact Registry, Google Cloud Run, Google Cloud SQL

---

## Seed User Accounts

For local development and automated testing, the database seed script provides 4 synthetic accounts:

| User Account | Email | Role | Department | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| **Owner A** | `owner1@pollipop.local` | `OWNER` | CPE | Author, publish, and inspect survey aggregate summaries. |
| **Owner B** | `owner2@pollipop.local` | `OWNER` | ENV | Verifies owner isolation (`BR-04`, `403 Forbidden`). |
| **Student 1 (Respondent A)** | `student1@pollipop.local` | `RESPONDENT` | CPE | Complete surveys and inspect personal responses (`IDENTIFIED`). |
| **Student 2 (Respondent B)** | `student2@pollipop.local` | `RESPONDENT` | ENV | Verifies cross-response privacy (`BR-06`, `403 Forbidden`). |

---

## Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/phatthidawadi/pollipop.git
cd pollipop

# 2. Configure environment variables
cp .env.example .env

# 3. Install dependencies and run migrations
npm install
npm --prefix server install
npm run prisma:migrate
npm run prisma:seed

# 4. Start local development servers
npm run dev
```

