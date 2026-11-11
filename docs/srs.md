# Software Requirements Specification (SRS)
**Project Theme:** 10. Review, Feedback, and Survey System  
**Product Name:** Pollipop — University Review, Feedback, and Survey System  
**Repository:** `https://github.com/phatthidawadi/pollipop`  
**Team Members:**  
- **Student 1 (Lead Author / Collaborator):** ภัทร์ธิดาวดี อุ่นคำ / Phatthidawadi Aunkham (67070505225, GitHub: `@phatthidawadi`)  
- **Student 2 (Co-Author / Collaborator):** ปทิตญา แก้ววิเชียร / Patitaya Kaewwichian (67070505220, GitHub: `@lmaybelgracel`)  
**Document Version:** 1.0 (Production-Ready Baseline for Deliverable 1 & Lab 5 Cloud Deployment)  

---

## 1. Stakeholder Problem and System Context

### 1.1 Stakeholder Problem
Within higher education institutions, academic departments, instructors, faculty administrators, and student activity organizers (Survey Owners) routinely need to collect feedback and evaluations from students and staff (Respondents) regarding courses, workshops, campus services, and academic facilities. Traditional paper forms and off-the-shelf consumer survey tools exhibit several critical engineering limitations:
1. **Uncontrolled Duplicate Submissions & Identity Leakage:** Generic survey tools either allow unrestricted, untraceable repeat submissions or tightly couple respondent accounts to their submitted responses, making true anonymity impossible when conducting sensitive evaluations.
2. **Absence of Role-Based & Departmental Access Control:** Existing tools lack institutional role boundaries. There is no automated mechanism to enforce departmental survey eligibility (e.g., restricting course feedback strictly to enrolled Computer Engineering students) or to isolate survey management so that one instructor cannot access or modify another instructor's evaluations.
3. **Statistical Inconsistency Caused by Post-Publish Mutations:** Allowing survey questions or choices to be altered after responses have begun flowing into the system invalidates historical submissions and corrupts aggregate summary statistics.

### 1.2 Chosen Domain Context
**Pollipop** is a cloud-ready, three-tier web application specifically tailored for university course evaluations and campus feedback surveys. The system manages the entire survey lifecycle: from structured question design (Single Choice and Rating Scale) and publication, to authenticated response submission with strict validation and atomic concurrency protection, through to server-side aggregate calculation and reporting.

The system is engineered as a Three-Tier Architecture (React Vite SPA $\rightarrow$ Node.js / Express REST API $\rightarrow$ PostgreSQL 16 Database managed via Prisma ORM) packaged with multi-stage Docker containers, making it ready for automated CI/CD and deployment onto Google Cloud Platform (Cloud Run and Cloud SQL) per CPE 334 Lab 5 specifications.

---

## 2. Actors and Responsibilities

The system enforces strict role-based access control (RBAC) across two distinct user roles:

| Actor / Role | Role Code | Responsibilities & Allowed Operations | Restrictions (Explicitly Forbidden Operations) |
| :--- | :--- | :--- | :--- |
| **Survey Owner**<br>(Instructor / Department Staff) | `OWNER` | - Create new surveys in `DRAFT` status with configured questions (`SINGLE_CHOICE` and `RATING` in Sprint 1).<br>- Inspect, update (while in `DRAFT` status only), and transition survey state to `PUBLISHED` or `CLOSED`.<br>- View server-side calculated aggregate summaries and statistics of surveys they own. | - **Forbidden:** Accessing, modifying, publishing, closing, or viewing summary results of surveys created by other `OWNER` accounts (`403 Forbidden`).<br>- **Forbidden:** Submitting responses to any survey as a respondent (`403 Forbidden`). |
| **Survey Respondent**<br>(Student / University Member) | `RESPONDENT` | - View the list of currently open (`PUBLISHED`) surveys along with personal completion status (`answered: boolean`) and submission identifier (`responseId`).<br>- Submit a validated response exactly once per survey.<br>- Review their own submitted response history in `IDENTIFIED` survey mode (`GET /api/responses/:id`). | - **Forbidden:** Creating, modifying, publishing, or closing surveys (`403 Forbidden`).<br>- **Forbidden:** Viewing or submitting responses to surveys in `DRAFT` status (`404 Not Found`).<br>- **Forbidden:** Viewing aggregate summary analytics (`403 Forbidden`).<br>- **Forbidden:** Accessing responses submitted by other respondents (`403 Forbidden`). |

---

## 3. Product Scope and Explicit Exclusions

### 3.1 Product Scope by Sprints

* **Sprint 1: Core Vertical Slice & Cloud-Ready Baseline (Deliverable 1 & Lab 5)**
  * **Authentication & RBAC:** Database-backed session authentication (`pollipop_sid` HTTP-only, SameSite=Lax cookie) with `bcrypt` password hashing, role enforcement (`OWNER` vs `RESPONDENT`), and Back-button cache invalidation (`Cache-Control: no-store` + `pageshow` handler).
  * **Survey Lifecycle:** Creation of `IDENTIFIED` mode surveys supporting `SINGLE_CHOICE` (2–10 choices) and `RATING` (integer scale 1–5) questions with `required` flags; state progression from `DRAFT` to `PUBLISHED` and manual `CLOSED`; immutability guarantee once published.
  * **Respondent Participation:** Listing of published surveys with `answered` status and `responseId`; validated response submission under an atomic database transaction; database-enforced duplicate prevention (`(surveyId, userId)` unique constraint); inspection of own submitted answers.
  * **Aggregate Analytics:** Server-side aggregate summary calculation for survey owners (total response count, option distribution counts and percentages, mean rating calculated to 2 decimal places with rating distributions).
  * **Cloud & Operations Baseline:** System health check (`GET /api/health`) and database readiness probe (`GET /api/ready`), fully idempotent database seeding (`prisma.user.upsert`), and Dockerization for GCP Cloud Run and Cloud SQL.

* **Sprint 2: Core Expansion — Anonymous Mode, Department Eligibility & New Types (Deliverable 2)**
  * **True Anonymity (`ANONYMOUS`):** Clean architectural separation of participation tracking (`SurveyParticipation`) from answers (`Response` where `respondentId = null`).
  * **Extended Question Types:** Multi-select questions (`MULTIPLE_CHOICE`) and open-ended feedback (`SHORT_TEXT`).
  * **Department Eligibility & Scheduled Expiration:** Survey restriction by student department (`department` attribute) and automatic survey closure based on `closesAt` timestamps.

* **Sprint 3: Analytics Export, Hardening & Final Release (Deliverable 3 & Labs 6–7)**
  * **CSV Data Export:** Exporting aggregate summaries and raw response datasets while honoring anonymity rules.
  * **Hardening & Verification:** Edge-case failure handling, full accessibility and UX polish, automated regression testing, security analysis, and load testing.

### 3.2 Explicit Exclusions
1. **No Public Self-Registration or External Email Verification:** User accounts are provisioned via database seed scripts (`prisma/seed.ts`) reading secure environment variables.
2. **No Complex Skip / Branching Logic:** All respondents view and complete questions in sequential order.
3. **No External University SSO / SMS Integrations:** Authentication is self-contained using secure database sessions.
4. **No Post-Submission Response Editing or Retraction:** Once a response is submitted, it is permanent to protect statistical integrity.

---

## 4. Functional Requirements (FR)

| ID | Requirement Description (Observable Behavior) | Target Sprint |
| :--- | :--- | :---: |
| **FR-01** | **User Login & Session Creation:** The system shall authenticate users via email and password (`POST /api/auth/login`), verify credentials against `bcrypt` password hashes, create a database-backed session, and return a secure HTTP-only cookie (`pollipop_sid`). | Sprint 1 |
| **FR-02** | **Current User Retrieval & Logout:** The system shall return the authenticated user's profile (`GET /api/auth/me`) and allow session termination (`POST /api/auth/logout`), deleting the session from the database, clearing the cookie, and preventing cached browser back-navigation. | Sprint 1 |
| **FR-03** | **Health & Readiness Probes:** The system shall provide `GET /api/health` returning `200 { "status": "ok", "service": "Pollipop API", "timestamp": "..." }` and `GET /api/ready` executing `SELECT 1` on the database returning `200 { "status": "ready", "db": "connected" }` or `503 { "status": "not_ready" }`. | Sprint 1 |
| **FR-04** | **Create Draft Survey:** An `OWNER` can create a new survey (`POST /api/surveys`) specifying title, description, mode (`IDENTIFIED` in Sprint 1), and at least one question. Initial state is set to `DRAFT`. | Sprint 1 |
| **FR-05** | **Sprint 1 Question Types Support:** The survey creation API shall accept `SINGLE_CHOICE` (2–10 options) and `RATING` (integer scale 1–5) questions with configurable `required: boolean` flags. | Sprint 1 |
| **FR-06** | **Publish Survey:** An `OWNER` can transition their own survey from `DRAFT` to `PUBLISHED` (`POST /api/surveys/:id/publish`), making it active for respondents. | Sprint 1 |
| **FR-07** | **List Surveys by Role:** The system shall list surveys according to user role (`GET /api/surveys`): `OWNER` sees only their own surveys; `RESPONDENT` sees only `PUBLISHED` surveys along with `answered: boolean` and `responseId: string | null`. | Sprint 1 |
| **FR-08** | **Submit Validated Response:** A `RESPONDENT` can submit answers (`POST /api/surveys/:id/responses`). The system validates all answers and records participation and responses atomically in a single database transaction. | Sprint 1 |
| **FR-09** | **View Own Submitted Response:** In `IDENTIFIED` mode, a `RESPONDENT` can retrieve their submitted response details (`GET /api/responses/:id`). | Sprint 1 |
| **FR-10** | **View Survey Aggregate Summary:** The survey `OWNER` can retrieve server-computed statistical summaries (`GET /api/surveys/:id/summary`) including total respondents, choice counts/percentages, and rating mean/distribution. | Sprint 1 |
| **FR-11** | **Edit Draft Survey:** An `OWNER` can modify titles, descriptions, and questions of a survey only while it remains in `DRAFT` status. | Sprint 2 |
| **FR-12** | **Close Survey & Expiration:** An `OWNER` can manually transition a survey from `PUBLISHED` to `CLOSED` (`POST /api/surveys/:id/close`) or configure scheduled expiration (`closesAt`). | Sprint 1 / 2 |
| **FR-13** | **Anonymous Survey Mode:** The system shall support `ANONYMOUS` surveys where participation is logged to prevent duplicates, but `respondentId` in the `Response` table is strictly set to `null`. | Sprint 2 |
| **FR-14** | **Department Eligibility Control:** An `OWNER` can restrict survey access so that only `RESPONDENT` users matching the configured `department` can submit responses. | Sprint 2 |
| **FR-15** | **Extended Question Types:** Support for `MULTIPLE_CHOICE` and `SHORT_TEXT` question formats with aggregate summary calculations. | Sprint 2 |
| **FR-16** | **Export Aggregate & Raw Results:** An `OWNER` can download aggregate summaries and raw response datasets as CSV files in compliance with anonymity rules. | Sprint 3 |

---

## 5. Business Rules (BR)

| ID | Business Rule Description | Enforced Layer | Target Sprint |
| :--- | :--- | :---: | :---: |
| **BR-01** | **Single Submission per Respondent:** A respondent may submit answers to a survey exactly once. Duplicate attempts shall be rejected with `409 Conflict` (`ALREADY_SUBMITTED`). Enforced in application logic and backed by database unique constraint `(surveyId, userId)` on `SurveyParticipation`. | Application & DB | Sprint 1 |
| **BR-02** | **Responses Allowed Only on Published Surveys:** Submitting responses to a survey in `DRAFT` status shall return `404 Not Found` (masking existence). Submitting responses to a `CLOSED` survey shall return `409 Conflict` (`SURVEY_NOT_OPEN`). | Application | Sprint 1 |
| **BR-03** | **One-Way Survey Lifecycle State Machine:** Survey states progress strictly forward: `DRAFT` $\rightarrow$ `PUBLISHED` $\rightarrow$ `CLOSED`. Any backward transition shall be rejected with `409 Conflict` (`INVALID_STATE_TRANSITION`). A survey must contain at least 1 question to be published. | Application | Sprint 1 |
| **BR-04** | **Survey Ownership Isolation:** An `OWNER` can only view, edit, publish, close, or inspect summaries of surveys where `ownerId === currentUser.id`. Unauthorized access to another owner's survey shall return `403 Forbidden` (`FORBIDDEN`). | Application | Sprint 1 |
| **BR-05** | **Role Segregation:** `RESPONDENT` accounts are forbidden from creating, publishing, or inspecting survey summaries (`403 Forbidden`). `OWNER` accounts are forbidden from submitting survey responses (`403 Forbidden`). | Application | Sprint 1 |
| **BR-06** | **Cross-Response Privacy Restriction:** A `RESPONDENT` can only view their own submitted response (`respondentId === currentUser.id`). Attempting to view another user's response shall return `403 Forbidden` (`FORBIDDEN`). | Application | Sprint 1 |
| **BR-07** | **Draft Survey Visibility Restriction:** A `RESPONDENT` shall never see or access `DRAFT` surveys in listing or detail queries (`404 Not Found`). | Application | Sprint 1 |
| **BR-08** | **Question & Option Structural Constraints:** Titles must be 1–200 characters. A survey must have 1–50 questions. `SINGLE_CHOICE` questions must have 2–10 non-empty choices. Violations return `400 Bad Request` (`VALIDATION_ERROR`). | Application | Sprint 1 |
| **BR-09** | **Answer Completeness & Validity:** All questions marked `required: true` must be answered. Selected `optionId` must belong to the respective question. `RATING` values must be integers between 1 and 5. Questions with `required: false` may be omitted or stored with `null` references without violating constraints. | Application & DB | Sprint 1 |
| **BR-10** | **Server-Side Aggregate Accuracy:** All summary statistics must be calculated server-side from committed database records. Ratings are computed to 2 decimal places. Divisions by zero on unanswered optional questions must return 0 or null cleanly. | Application | Sprint 1 |
| **BR-11** | **Immutability After Publication:** Once a survey transitions to `PUBLISHED` or `CLOSED`, questions and options cannot be added, edited, or deleted (`409 Conflict`). | Application | Sprint 1 |
| **BR-12** | **Sprint 1 Baseline Eligibility:** In Sprint 1, all authenticated `RESPONDENT` users are eligible to answer any `PUBLISHED` survey. (Department filtering is introduced in Sprint 2). | Application | Sprint 1 / 2 |
| **BR-13** | **True Anonymity Separation:** In `ANONYMOUS` mode, `respondentId` in the `Response` table must remain strictly `NULL`. Identity must never be correlated with answer records in storage or API payloads. | Application & DB | Sprint 1 / 2 |

---

## 6. Non-Functional Requirements (NFR)

| ID | Category | Measurable Target | Practical Verification Method | Target Sprint |
| :--- | :--- | :--- | :--- | :---: |
| **NFR-01** | **Security (Auth, Session & Cache Security)** | Unauthenticated requests to protected endpoints must be rejected with `401 Unauthorized` 100% of the time. All protected endpoints must return `Cache-Control: no-store`. Frontend must detect `pageshow` history traversal and redirect to `/login` when session is invalid. | Verified via Supertest integration tests for `401` and cache headers, combined with Playwright E2E testing browser back navigation post-logout (`TEST-39`, `TEST-40`). | Sprint 1 |
| **NFR-02** | **Security (Password & Secret Hygiene)** | All stored passwords must be hashed using `bcrypt` (salt rounds $\ge 10$). Plaintext passwords, connection strings, or private keys must never exist in Git commits or logs. | Unit/Integration tests verifying hash prefixes (`$2b$`) in database records and CI script verifying `.env.example` vs git index. | Sprint 1 |
| **NFR-03** | **Data Integrity & Concurrency** | Concurrent duplicate submissions by the same user on the same survey must result in exactly one recorded response (`201 Created`) and one conflict rejection (`409 Conflict`), with atomic rollback on errors. | Verified via database unique constraint `(surveyId, userId)` on `SurveyParticipation` and `Promise.all` concurrent API tests (`TEST-37`). | Sprint 1 |
| **NFR-04** | **Validation & Error Standards** | Invalid inputs must be caught by Zod schemas, returning `400 Bad Request` with structured dot-path error notations and clear error codes without leaking server stack traces. | Unit and boundary tests against Zod schemas and API payloads (`TEST-11`, `TEST-24`). | Sprint 1 |
| **NFR-05** | **Cloud-Readiness & Persistence** | All configuration must be loaded from environment variables (`PORT`, `DATABASE_URL`, `SESSION_SECRET`). Probes `/api/health` and `/api/ready` must respond in $< 500\text{ ms}$. Sessions must survive container restarts. | Verified via API integration tests for health probes, database session persistence, and GCP Cloud Run deployment in Lab 5. | Sprint 1 & Lab 5 |

---

## 7. Assumptions, Design Decisions, and Resolved Questions

### 7.1 Assumptions
* **A-01 (Seeded Institutional Accounts):** Sprint 1 utilizes 4 synthetic university accounts seeded via `prisma/seed.ts`:
  - `owner1@pollipop.local` (Instructor A, Role: `OWNER`, Department: `"CPE"`)
  - `owner2@pollipop.local` (Instructor B, Role: `OWNER`, Department: `"ENV"`)
  - `student1@pollipop.local` (Student 1 / Friend, Role: `RESPONDENT`, Department: `"CPE"`)
  - `student2@pollipop.local` (Student 2 / User, Role: `RESPONDENT`, Department: `"ENV"`)
  Default seed password is read from `DEMO_USER_PASSWORD`.
* **A-02 (User Department Attribute):** The `User` model includes a `department` attribute from Sprint 1 to support Sprint 2 eligibility filtering without database schema restructuring.
* **A-03 (Single Role per Account):** Each user account is assigned exactly one institutional role (`OWNER` or `RESPONDENT`).
* **A-04 (Thai End-User UI):** End-user facing UI labels and client validation messages are presented in Thai to match domestic institutional context, while API contracts and internal codes use standard English.
* **A-08 (Idempotent Database Seeding):** The seed script uses `prisma.user.upsert` to allow repeated execution during automated CI/CD and Cloud Run container migrations.

### 7.2 Key Engineering Decisions (DEC)
* **DEC-01 (Domain Specialization):** Selected university course evaluation and feedback system (Theme 10) due to clear role delineation and natural extension into departmental eligibility.
* **DEC-02 (Database-Backed Session & Back-Button Protection):** Utilized database-persisted sessions (`Session` table) with `HTTP-only, SameSite=Lax` cookies, paired with `Cache-Control: no-store` headers and client `pageshow` guards. Ensures instant revocation and container restart resilience on Google Cloud Run.
* **DEC-03 (Sprint 1 Eligibility Scope):** In Sprint 1, all authenticated respondents can answer any published survey. Departmental restrictions are deferred to Sprint 2.
* **DEC-04 (Question Types & Optional Question Storage):** Sprint 1 focuses on `SINGLE_CHOICE` and `RATING` questions. In the `Answer` table, `optionId` and `ratingValue` are nullable to cleanly support optional questions (`required: false`).
* **DEC-05 (Participation and Response Separation):** Architected separate `SurveyParticipation` (participation tracking) and `Response` (answer storage) tables from Sprint 1. In `IDENTIFIED` mode, `Response.respondentId` is populated; in `ANONYMOUS` mode, it is set to `null`.
* **DEC-06 (Exposing `responseId` in Survey List):** `GET /api/surveys` for `RESPONDENT` includes `answered: boolean` and `responseId: string | null` (in `IDENTIFIED` mode) to enable clean navigation to submission reviews.
* **DEC-07 (Three-Tier Stack Architecture):** Standardized on `client/` (React + Vite + TypeScript) and `server/` (Node.js + Express + Prisma + PostgreSQL 16), ensuring 100% compatibility with Lab 5 Dockerization and Cloud Run.

### 7.3 Resolved Questions
| Question ID | Question | Resolution |
| :--- | :--- | :--- |
| **Q-01** | Can respondents inspect their submitted answers? | Yes, in `IDENTIFIED` mode via `GET /api/responses/:id`, with strict ownership protection (`403 Forbidden` for other users). |
| **Q-02** | Can owners edit survey questions after publishing? | Strictly forbidden (`BR-11`, `409 Conflict`) to protect statistical validity. |
| **Q-03** | What HTTP status code is returned when answering `DRAFT` vs `CLOSED` surveys? | `DRAFT` returns `404 Not Found` (masks existence); `CLOSED` returns `409 Conflict` (`SURVEY_NOT_OPEN`). |
| **Q-04** | How are health checks and seeds structured for Lab 5? | `GET /api/health` (liveness) and `GET /api/ready` (readiness with `SELECT 1`); seed script uses `upsert` (`A-08`). |
