# Requirements Traceability Matrix (`docs/traceability.md`)
**Product Name:** Pollipop — University Review, Feedback, and Survey System  
**Repository:** `https://github.com/phatthidawadi/pollipop`  
**Team Members:**  
- **Student 1 (Author / Collaborator):** ภัทร์ธิดาวดี อุ่นคำ / Phatthidawadi Aunkham (67070505225, GitHub: `@phatthidawadi`)  
- **Student 2 (Author / Collaborator):** ปทิตญา แก้ววิเชียร / Patitaya Kaewwichian (67070505220, GitHub: `@lmaybelgracel`)  

---

## 1. Requirements-to-Feature-to-Sprint Traceability Matrix

This matrix establishes bidirectional traceability linking every **Functional Requirement (`FR-01`..`FR-16`)**, **Business Rule (`BR-01`..`BR-13`)**, and **Non-Functional Requirement (`NFR-01`..`NFR-05`)** from `docs/srs.md` to its implementing Feature ID, targeted Sprint, and verification Acceptance Criteria (`AC-xx`) and Test Specifications (`TEST-xx`):

### 1.1 Functional Requirements (FR) Traceability

| Requirement ID | Requirement Summary | Feature / Component | Target Sprint | Sprint 1 Verification (AC IDs / TEST IDs) |
| :--- | :--- | :--- | :---: | :--- |
| **FR-01** | User Login & DB Session Creation (`POST /api/auth/login`) | **F-01** Authentication & Roles | **Sprint 1** | `AC-01`, `AC-02`, `AC-03` / `TEST-01`, `TEST-02`, `TEST-03` |
| **FR-02** | Current User Profile (`GET /api/auth/me`) & Logout (`POST /api/auth/logout`) + Back Guard | **F-01** Authentication & Roles | **Sprint 1** | `AC-04`, `AC-05`, `AC-06`, `AC-38` / `TEST-04`, `TEST-05`, `TEST-06`, `TEST-39`, `TEST-40` |
| **FR-03** | System Health (`/api/health`) & DB Readiness (`/api/ready`) Probes | **S-01** System Foundation | **Sprint 1** | `AC-07`, `AC-08` / `TEST-07`, `TEST-08` |
| **FR-04** | Create Draft Survey (`POST /api/surveys`) by `OWNER` | **F-02** Survey Creation & Lifecycle | **Sprint 1** | `AC-09`, `AC-10`, `AC-11` / `TEST-09`, `TEST-10`, `TEST-11` |
| **FR-05** | Sprint 1 Question Types (`SINGLE_CHOICE` 2–10 options, `RATING` 1–5, `required` flag) | **F-02** Survey Creation & Lifecycle | **Sprint 1** | `AC-09`, `AC-12`, `AC-13` / `TEST-09`, `TEST-12`, `TEST-13` |
| **FR-06** | Publish Survey (`POST /api/surveys/:id/publish`: `DRAFT` $\rightarrow$ `PUBLISHED`) | **F-02** Survey Creation & Lifecycle | **Sprint 1** | `AC-14`, `AC-15`, `AC-16` / `TEST-14`, `TEST-15`, `TEST-16` |
| **FR-07** | List Surveys by Role (`GET /api/surveys` with `answered` & `responseId` for `RESPONDENT`) | **F-02** Survey Creation & Lifecycle | **Sprint 1** | `AC-17`, `AC-18`, `AC-19` / `TEST-17`, `TEST-18`, `TEST-19` |
| **FR-08** | Submit Validated Response (`POST /api/surveys/:id/responses`) in Atomic Transaction | **F-03** Response Submission | **Sprint 1** | `AC-20`, `AC-21`, `AC-23`, `AC-24`, `AC-25`, `AC-26` / `TEST-20`, `TEST-21`, `TEST-23`, `TEST-24`, `TEST-25`, `TEST-26` |
| **FR-09** | View Own Submitted Response (`GET /api/responses/:id`) | **F-03** Response Submission | **Sprint 1** | `AC-27`, `AC-28`, `AC-29` / `TEST-27`, `TEST-28`, `TEST-29` |
| **FR-10** | View Survey Aggregate Summary (`GET /api/surveys/:id/summary`) by `OWNER` | **F-04** Survey Aggregate Summary | **Sprint 1** | `AC-30`, `AC-31`, `AC-32`, `AC-33`, `AC-34` / `TEST-30`, `TEST-31`, `TEST-32`, `TEST-33`, `TEST-34` |
| **FR-11** | Edit Draft Survey (`PUT /api/surveys/:id`) | **F-05** Draft Survey Editing | **Sprint 2** | Target Sprint 2 Contract (`F-05`) |
| **FR-12** | Close Survey (`POST /api/surveys/:id/close`) & Scheduled Expiration (`closesAt`) | **F-02** (Manual) / **F-06** (Scheduled) | **Sprint 1 / 2** | Manual close verified in Sprint 1 (`AC-22`, `AC-35` / `TEST-22`, `TEST-35`); Scheduled `closesAt` in Sprint 2 |
| **FR-13** | True Anonymous Survey Mode (`ANONYMOUS` with decoupled response records) | **F-03**, **F-06** Anonymous Mode | **Sprint 1 / 2** | Schema & API verified in Sprint 1 (`AC-36` / `TEST-36`); UI/Schedule in Sprint 2 |
| **FR-14** | Department Eligibility Control (`targetDepartment`) | **F-07** Department Eligibility | **Sprint 2** | Target Sprint 2 Contract (`F-07`) |
| **FR-15** | Extended Question Types (`MULTIPLE_CHOICE` & `SHORT_TEXT`) | **F-07** Extended Question Types | **Sprint 2** | Target Sprint 2 Contract (`F-07`) |
| **FR-16** | Export Aggregate & Raw Results (CSV) | **F-08** CSV Export & Filtering | **Sprint 3** | Target Sprint 3 Contract (`F-08`) |

---

### 1.2 Business Rules (BR) Traceability

| Rule ID | Business Rule Summary | Feature / Component | Target Sprint | Sprint 1 Verification (AC IDs / TEST IDs) |
| :--- | :--- | :--- | :---: | :--- |
| **BR-01** | **Single Submission per Respondent:** Duplicate submissions rejected with `409 ALREADY_SUBMITTED` backed by DB constraint. | **F-03** Response Submission | **Sprint 1** | `AC-21` / `TEST-21`, `TEST-37` |
| **BR-02** | **Responses Allowed Only on Published Surveys:** Answering `DRAFT` returns `404 Not Found`; answering `CLOSED` returns `409 Conflict` (`SURVEY_NOT_OPEN`). | **F-03** Response Submission | **Sprint 1** | `AC-22` / `TEST-22` |
| **BR-03** | **One-Way Survey Lifecycle State Machine:** States progress `DRAFT` $\rightarrow$ `PUBLISHED` $\rightarrow$ `CLOSED` strictly forward; backward transitions rejected (`409 INVALID_STATE_TRANSITION`). | **F-02** Survey Creation & Lifecycle | **Sprint 1** | `AC-15`, `AC-35` / `TEST-15`, `TEST-35` |
| **BR-04** | **Survey Ownership Isolation:** `OWNER` cannot view, edit, publish, close, or inspect summaries of surveys owned by other accounts (`403 FORBIDDEN`). | **F-02**, **F-04** Ownership Guard | **Sprint 1** | `AC-16`, `AC-32` / `TEST-16`, `TEST-32` |
| **BR-05** | **Role Segregation:** `RESPONDENT` cannot create/publish surveys or view summaries; `OWNER` cannot submit responses (`403 FORBIDDEN`). | **F-01**, **F-02**, **F-03**, **F-04** | **Sprint 1** | `AC-10`, `AC-23`, `AC-33` / `TEST-10`, `TEST-23`, `TEST-33` |
| **BR-06** | **Cross-Response Privacy Restriction:** `RESPONDENT` cannot inspect (`GET /api/responses/:id`) responses submitted by others (`403 FORBIDDEN`). | **F-03** Response Submission | **Sprint 1** | `AC-28`, `AC-29` / `TEST-28`, `TEST-29` |
| **BR-07** | **Draft Survey Visibility Restriction:** `RESPONDENT` cannot view or retrieve `DRAFT` surveys in listings or details (`404 NOT_FOUND`). | **F-02**, **F-03** Survey Discovery | **Sprint 1** | `AC-18`, `AC-19`, `AC-22` / `TEST-18`, `TEST-19`, `TEST-22` |
| **BR-08** | **Question & Option Structural Constraints:** Titles 1–200 characters, 1–50 questions, `SINGLE_CHOICE` has 2–10 non-empty options (`400 VALIDATION_ERROR`). | **F-02** Survey Creation | **Sprint 1** | `AC-11`, `AC-12`, `AC-13` / `TEST-11`, `TEST-12`, `TEST-13` |
| **BR-09** | **Answer Completeness & Validity:** `required: true` questions must be answered, options must match question, ratings must be integers 1–5 (`400 VALIDATION_ERROR`); optional questions can be omitted/null. | **F-03** Response Submission | **Sprint 1** | `AC-24`, `AC-25`, `AC-26` / `TEST-24`, `TEST-25`, `TEST-26` |
| **BR-10** | **Server-Side Aggregate Accuracy:** Accurately calculate counts, percentages, and rating mean (2 decimals) server-side without division by zero on empty answers. | **F-04** Survey Aggregate Summary | **Sprint 1** | `AC-30`, `AC-31`, `AC-34` / `TEST-30`, `TEST-31`, `TEST-34` |
| **BR-11** | **Immutability After Publication:** Modifying or deleting questions after `PUBLISHED` or `CLOSED` is strictly forbidden (`409 Conflict`). | **F-02**, **F-05** Survey Lifecycle | **Sprint 1 / 2** | `AC-15` / `TEST-15` (State lock in Sprint 1; edit lock in Sprint 2) |
| **BR-12** | **Sprint 1 Baseline Eligibility:** All authenticated respondents are eligible to complete published surveys in Sprint 1. | **F-03**, **F-07** Eligibility | **Sprint 1 / 2** | `AC-18`, `AC-20` / `TEST-18`, `TEST-20` |
| **BR-13** | **True Anonymity Separation:** In `ANONYMOUS` mode, `Response.respondentId` must remain `null` and user identity is never tied to answers. | **F-03**, **F-04**, **F-06** | **Sprint 1 / 2** | `AC-36` / `TEST-36` |

---

### 1.3 Non-Functional Requirements (NFR) Traceability

| NFR ID | Category & Target Summary | Feature / Component | Target Sprint | Sprint 1 Verification (AC IDs / TEST IDs) |
| :--- | :--- | :--- | :---: | :--- |
| **NFR-01** | **Authentication, Session & Cache Security:** Reject unauthenticated requests with `401 Unauthorized` 100%, send `Cache-Control: no-store` on protected APIs, and handle `pageshow` to prevent back-button bfcache leaks. | **F-01** (Cross-cutting Auth & Cache Middleware) | **Sprint 1** | `AC-05`, `AC-06`, `AC-38` / `TEST-05`, `TEST-06`, `TEST-39`, `TEST-40` |
| **NFR-02** | **Password Storage & Secret Hygiene:** Password hashing via `bcrypt` ($\ge 10$ rounds) 100% and strict absence of secrets in Git. | **S-01**, **F-01** Seed & Auth | **Sprint 1** | `AC-01`, `AC-37` / `TEST-01`, `TEST-38` |
| **NFR-03** | **Data Integrity & Concurrency:** Atomic database transactions and single-winner guarantees under race conditions (`(surveyId, userId)` unique constraint). | **F-03** Response Submission | **Sprint 1** | `AC-21`, `AC-24` / `TEST-21`, `TEST-37` |
| **NFR-04** | **Validation & Error Standards:** Zod input schemas returning structured `400 Bad Request` with dot-path notation and safe error messages. | **F-01**..**F-04** Validation Layer | **Sprint 1** | `AC-03`, `AC-11`, `AC-12`, `AC-24`, `AC-25` / `TEST-03`, `TEST-11`, `TEST-12`, `TEST-24`, `TEST-25` |
| **NFR-05** | **Cloud-Readiness & Persistence:** Environment variable configuration, fast response on `/api/health` and `/api/ready` ($< 500\text{ ms}$), and container restart resilience. | **S-01**, **F-01** Foundation & Auth | **Sprint 1 & Lab 5** | `AC-07`, `AC-08`, `AC-37` / `TEST-07`, `TEST-08`, `TEST-38` |

---

## 2. Coverage Gaps and Approved Specification Changes

### 2.1 Uncovered Requirements (Coverage Gaps)
* **Sprint 1 Scope Coverage Gaps:** **None (0 uncovered requirements).** All 10 Functional Requirements allocated to Sprint 1 (`FR-01`..`FR-10`, plus manual closure in `FR-12` and anonymous schema separation in `FR-13`), all 13 Business Rules (`BR-01`..`BR-13`), and all 5 Non-Functional Requirements (`NFR-01`..`NFR-05`) are 100% mapped to `S-01` and `F-01`..`F-04` and verified by `AC-01`..`AC-38` and `TEST-01`..`TEST-40`.
* **Deferred Later-Sprint Requirements (`FR-11`, Scheduled `FR-12`, UI `FR-13`, `FR-14`, `FR-15`, `FR-16`):** Allocated to Sprint 2 (`F-05`, `F-06`, `F-07`) and Sprint 3 (`F-08`, `F-09`). As required by Deliverable 1 specifications, these requirements have explicit feature and sprint allocations in Section 1.1 while their detailed Acceptance Criteria and executable tests are scheduled for their respective sprint contracts.

### 2.2 Approved Specification Changes
| Change ID | Date | Affected Artifacts | Description of Change & Engineering Justification | Approved By |
| :--- | :---: | :--- | :--- | :---: |
| **CHG-01** | 2026-11-09 | `docs/srs.md`, `docs/features.md`, `docs/sprints/sprint-1/contracts.md` | Added System Responsibility `S-01` (`/api/health`, `/api/ready`, and idempotent `upsert` seed script) to align Sprint 1 baseline directly with Lab 5 Cloud Run smoke test requirements (`A-08`). | Both Students (`@phatthidawadi`, `@lmaybelgracel`) |
| **CHG-02** | 2026-11-09 | `docs/srs.md`, `docs/system-sds.md`, `docs/sprints/sprint-1/contracts.md` | Standardized `GET /api/surveys` for `RESPONDENT` to include `answered: boolean` and `responseId: string | null` (`DEC-06`, `AC-18`) so respondents can navigate directly to their submitted response (`GET /api/responses/:id`). | Both Students (`@phatthidawadi`, `@lmaybelgracel`) |
| **CHG-03** | 2026-11-10 | `docs/srs.md`, `docs/traceability.md`, `docs/sprints/sprint-1/contracts.md` | Clarified `BR-02` / `AC-22` HTTP status codes (`404 Not Found` when submitting to `DRAFT` surveys vs `409 Conflict SURVEY_NOT_OPEN` when submitting to `CLOSED` surveys) and added `AC-38` / `TEST-39`–`TEST-40` for `Cache-Control: no-store` and `pageshow` back-button protection. | Both Students (`@phatthidawadi`, `@lmaybelgracel`) |

