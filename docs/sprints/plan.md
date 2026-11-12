# Three-Sprint Product Plan (`docs/sprints/plan.md`)
**Product Name:** Pollipop — University Review, Feedback, and Survey System  
**Repository:** `https://github.com/phatthidawadi/pollipop`  
**Team Members:**  
- **Student 1 (Author / Collaborator):** ภัทร์ธิดาวดี อุ่นคำ / Phatthidawadi Aunkham (67070505225, GitHub: `@phatthidawadi`)  
- **Student 2 (Author / Collaborator):** ปทิตญา แก้ววิเชียร / Patitaya Kaewwichian (67070505220, GitHub: `@lmaybelgracel`)  
---

## 1. Three-Sprint Roadmap Summary

The development lifecycle spans three iterative sprints covering all functional and architectural requirements (`FR-01`–`FR-16`, `BR-01`–`BR-13`, `NFR-01`–`NFR-05`):

| Sprint | Checkpoint & Due Date | Sprint Goal | Included Feature IDs | Required Completion Outcome |
| :---: | :--- | :--- | :--- | :--- |
| **Sprint 1** | **Deliverable 1**<br>(15 Nov 2026)<br>+ **Lab 5 Cloud Deploy** | Establish engineering baseline and deliver a fully functional **Core Vertical Slice** across all layers (Auth/RBAC, survey creation/publishing, atomic response submission with duplicate prevention, own response inspection, and aggregate summary reporting), ready for Cloud Run deployment. | **S-01**, **F-01**, **F-02**, **F-03**, **F-04** | Complete full-stack vertical slice running against PostgreSQL, strict server-side RBAC enforcement, 100% automated test pass rate (`AC-01`..`AC-38`, `TEST-01`..`TEST-40`), and peer-reviewed PR evidence on GitHub. |
| **Sprint 2** | **Deliverable 2**<br>(29 Nov 2026) | Implement **Core Expansion**: draft survey editing, true anonymity (`ANONYMOUS` mode with decoupled participation), departmental survey eligibility (`department`), multi-choice and short-text questions, and scheduled closing (`closesAt`). | **F-05**, **F-06**, **F-07** | Owners can edit drafts, launch anonymous surveys restricted to specific faculties, respondents can complete multi-select and open-ended questions, and aggregate calculations update in real time. |
| **Sprint 3** | **Progress Check** (29 Nov)<br>& **Final Release** (13 Dec 2026) | Implement **Analysis & Export** (CSV export of aggregate summaries and anonymized responses), edge-case hardening, accessibility audit, and full regression testing across all features. | **F-08**, **F-09** | Owners can filter and download CSV reports respecting privacy rules; system passes UAT acceptance (Lab 6) and performance/security audits (Lab 7). |

---

## 2. Sprint 1 Scope, Rationale & Pair Workflow

### 2.1 Why Sprint 1 Forms a Complete Vertical Slice
Sprint 1 features (`S-01`, `F-01` through `F-04`) are specifically chosen to prove the complete end-to-end architectural flow:
1. **Full Architectural Span (UI $\rightarrow$ API $\rightarrow$ DB):** Authenticating against real database sessions (`F-01`), authoring and publishing surveys (`F-02`), submitting validated responses inside atomic transactions with duplicate prevention (`F-03`), and computing summary analytics server-side (`F-04`).
2. **Early Verification of Critical Business Rules:** Proves single-submission rules (`BR-01`), state machine immutability (`BR-02`, `BR-03`, `BR-11`), ownership isolation (`BR-04`), role segregation (`BR-05`), and cross-response privacy (`BR-06`).
3. **Cloud & Operations Readiness (Lab 5):** Provides containerized health and database readiness probes (`/api/health`, `/api/ready`), database-persisted sessions, and idempotent seed scripts (`A-08`) from day one.

### 2.2 Feature Dependencies Across Sprints
* **Within Sprint 1:**
  * `S-01` (DB Schema, Seed, Probes) $\rightarrow$ Prerequisite for `F-01`
  * `F-01` (Auth Middleware & Session Cookie) $\rightarrow$ Prerequisite for `F-02`, `F-03`, and `F-04`
  * `F-02` (Survey Lifecycle) $\rightarrow$ Must have `PUBLISHED` surveys before `F-03` submissions or `F-04` summaries can occur
  * `F-03` (Response Submission) $\rightarrow$ Creates answer data required for `F-04` summary calculations
* **Connecting to Sprints 2 & 3:**
  * `F-05` (Draft Editing) builds directly on `F-02` state machine
  * `F-06` (Anonymous Mode) leverages decoupled `SurveyParticipation` schema from `F-03`
  * `F-07` (Department Eligibility) leverages `User.department` attribute from `F-01`
  * `F-08` (CSV Export) and `F-09` (Hardening) aggregate data across all prior features

### 2.3 Team Allocation and Balanced Pair Workflow (10 Issues / 10 Branches)
To ensure rigorous peer review and equal distribution of engineering responsibility, Student 1 and Student 2 alternate author and reviewer roles across all 10 Sprint 1 issues (5 issues each, strictly balanced):

| Issue # | Title & Scope Summary | Branch Name | Author (Spec + TDD Tests + Code) | Reviewer (PR Review & Approval) | Target Branch |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **#1** | **docs:** establish SRS, feature inventory, and traceability matrix (Parts A & B) | `docs/sprint1-srs-and-traceability` | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | `sprint-1-staging` |
| **#2** | **docs:** define system-level SDS, 3-sprint plan, and Sprint 1 contracts (Parts C, D & E) | `docs/sprint1-sds-and-contracts` | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | `sprint-1-staging` |
| **#3** | **feat(S-01):** set up Pollipop project foundation and Prisma database schema | `feature/3-project-foundation` | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | `sprint-1-staging` |
| **#4** | **feat(S-01):** implement `/api/health`, `/api/ready` probes and idempotent user seed | `feature/4-health-and-seed` | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | `sprint-1-staging` |
| **#5** | **feat(F-01):** implement session authentication, RBAC middleware, and no-store cache guard | `feature/5-auth-and-session` | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | `sprint-1-staging` |
| **#6** | **feat(F-02):** implement survey creation, question validation, and lifecycle transitions | `feature/6-survey-lifecycle` | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | `sprint-1-staging` |
| **#7** | **feat(F-03):** implement atomic survey response submission and own response view | `feature/7-response-submission` | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | `sprint-1-staging` |
| **#8** | **feat(F-04):** implement survey aggregate summary calculation and owner summary endpoint | `feature/8-survey-summary` | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | `sprint-1-staging` |
| **#9** | **feat(ui):** build React + Vite frontend views for Owner and Respondent workflows | `feature/9-frontend-ui` | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | `sprint-1-staging` |
| **#10** | **test(e2e):** add Playwright E2E test suite (TEST-40) and Part F verification evidence | `feature/10-e2e-and-verification` | **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)** | **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)** | `sprint-1-staging` |
| **Release** | **Release Sprint 1:** Merge `sprint-1-staging` $\rightarrow$ `main` (`v1.0.0-sprint1`) | `sprint-1-staging` | **Pair Work (Both Students)** | **Joint Cross-Verification of E2E Suite** | `main` |
