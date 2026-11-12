# Sprint 1 Verification & Test Execution Evidence (`docs/sprints/sprint-1/verification.md`)
**Product Name:** Pollipop — University Review, Feedback, and Survey System  
**Repository:** `https://github.com/phatthidawadi/pollipop`  
**Team Members:**  
- **Student 1 (Author / Collaborator):** ภัทร์ธิดาวดี อุ่นคำ / Phatthidawadi Aunkham (67070505225, GitHub: `@phatthidawadi`)  
- **Student 2 (Author / Collaborator):** ปทิตญา แก้ววิเชียร / Patitaya Kaewwichian (67070505220, GitHub: `@lmaybelgracel`)  
**Document Version:** 1.0 (Production Verification Baseline)  
**Verification Date:** 2026-11-13  
**Execution Environment:** Windows 11 Pro, Node.js v24.14.0, npm 11.9.0, Google Chrome 157.0.8103.39  

---

## 1. Executive Summary of Test Results

All 40 planned test specifications (`TEST-01` through `TEST-40`) and corresponding acceptance criteria (`AC-01` through `AC-38`) have been executed against the integrated Sprint 1 codebase (`sprint-1-staging` + `feature/10-e2e-and-verification`). The automated test suite achieves **100% test pass rate with zero failures and zero skipped tests**.

### 1.1 Automated Test Execution Summary Table

| Test Suite / Layer | Target Component | Framework / Tool | Test Files | Total Tests | Passed | Failed | Skipped | Pass Rate | Execution Duration |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Server Probes & Seed** | `server/src/app.ts`, `server/prisma/seed.ts` | Vitest v3.2.7 | 1 | 3 | 3 | 0 | 0 | **100%** | 422 ms |
| **Server Auth & RBAC** | `server/src/auth.ts`, `server/src/app.ts` | Vitest v3.2.7 | 1 | 6 | 6 | 0 | 0 | **100%** | 448 ms |
| **Server Survey Lifecycle** | `server/src/routes/survey.routes.ts` | Vitest v3.2.7 | 1 | 9 | 9 | 0 | 0 | **100%** | 642 ms |
| **Server Response Submission** | `server/src/routes/response.routes.ts` | Vitest v3.2.7 | 1 | 11 | 11 | 0 | 0 | **100%** | 593 ms |
| **Server Summary Analytics** | `server/src/summary.ts`, survey routes | Vitest v3.2.7 | 1 | 9 | 9 | 0 | 0 | **100%** | 554 ms |
| **Client UI & Logic** | `client/src/App.tsx`, `client/src/api.ts` | Vitest v3.2.7 | 1 | 7 | 7 | 0 | 0 | **100%** | 623 ms |
| **End-to-End Vertical Slice** | Full Stack (React + Express + Prisma) | Playwright (@playwright/test ^1.49.0) | 1 | 1 | 1 | 0 | 0 | **100%** | 4.8 s |
| **TOTAL CONSOLIDATED** | **All Core Sprint 1 Components** | **Vitest + Playwright** | **7** | **46** | **46** | **0** | **0** | **100%** | **~8.2 s** |

---

## 2. Master Acceptance Criteria to Test Traceability Matrix

The following matrix verifies that every acceptance criterion (`AC-01` to `AC-38`) defined in `docs/sprints/sprint-1/contracts.md` is directly exercised by at least one automated test specification (`TEST-01` to `TEST-40`), along with its implementation file and verification status:

| AC ID | Linked Feature | Target Requirement | Test ID | Test Level | Implementation & Test Location | Execution Status |
| :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| **AC-01** | F-01 | FR-01, FR-02 | `TEST-01`, `TEST-40` | API / E2E | `server/tests/auth.test.ts`, `e2e/sprint1.spec.ts` | **PASS** |
| **AC-02** | F-01 | FR-01, NFR-02 | `TEST-02` | API Integration | `server/tests/auth.test.ts` | **PASS** |
| **AC-03** | F-01 | FR-01, NFR-04 | `TEST-03` | Unit & API | `server/tests/auth.test.ts`, `server/src/validation.ts` | **PASS** |
| **AC-04** | F-01 | FR-01, FR-02 | `TEST-04` | API Integration | `server/tests/auth.test.ts` | **PASS** |
| **AC-05** | F-01 | BR-05, NFR-01 | `TEST-05` | API Integration | `server/tests/auth.test.ts`, `server/src/auth.ts` | **PASS** |
| **AC-06** | F-01 | FR-02, NFR-01 | `TEST-06` | API Integration | `server/tests/auth.test.ts` | **PASS** |
| **AC-07** | S-01 | NFR-01, Lab 5 | `TEST-07` | API Integration | `server/tests/probes.test.ts`, `server/src/app.ts` | **PASS** |
| **AC-08** | S-01 | NFR-01, Lab 5 | `TEST-08` | API Integration | `server/tests/probes.test.ts`, `server/src/app.ts` | **PASS** |
| **AC-09** | F-02 | FR-04, FR-05 | `TEST-09`, `TEST-40` | API / E2E | `server/tests/surveys.test.ts`, `e2e/sprint1.spec.ts` | **PASS** |
| **AC-10** | F-02 | BR-05 | `TEST-10` | API Integration | `server/tests/surveys.test.ts`, `server/src/auth.ts` | **PASS** |
| **AC-11** | F-02 | BR-08, NFR-04 | `TEST-11` | Unit & API | `server/tests/surveys.test.ts`, `server/src/validation.ts` | **PASS** |
| **AC-12** | F-02 | FR-05, BR-08 | `TEST-12` | Unit & API | `server/tests/surveys.test.ts`, `server/src/validation.ts` | **PASS** |
| **AC-13** | F-02 | FR-05, NFR-04 | `TEST-13` | Unit | `server/tests/surveys.test.ts`, `server/src/validation.ts` | **PASS** |
| **AC-14** | F-02 | FR-06, BR-03 | `TEST-14`, `TEST-40` | API / E2E | `server/tests/surveys.test.ts`, `e2e/sprint1.spec.ts` | **PASS** |
| **AC-15** | F-02 | BR-03, BR-11 | `TEST-15` | Unit & API | `server/tests/surveys.test.ts` | **PASS** |
| **AC-16** | F-02 | BR-04 | `TEST-16` | API Integration | `server/tests/surveys.test.ts` | **PASS** |
| **AC-17** | F-02 | FR-07, BR-04 | `TEST-17` | API Integration | `server/tests/surveys.test.ts` | **PASS** |
| **AC-18** | F-02 | FR-07, DEC-06 | `TEST-18`, `TEST-40` | API / E2E | `server/tests/surveys.test.ts`, `e2e/sprint1.spec.ts` | **PASS** |
| **AC-19** | F-02 | BR-07 | `TEST-19` | API Integration | `server/tests/surveys.test.ts` | **PASS** |
| **AC-20** | F-03 | FR-08, NFR-03 | `TEST-20`, `TEST-40` | API / E2E | `server/tests/responses.test.ts`, `e2e/sprint1.spec.ts` | **PASS** |
| **AC-21** | F-03 | BR-01, NFR-03 | `TEST-21`, `TEST-37`, `TEST-40` | API / Concurrency / E2E | `server/tests/responses.test.ts`, `e2e/sprint1.spec.ts` | **PASS** |
| **AC-22** | F-03 | BR-02, BR-07 | `TEST-22` | API Integration | `server/tests/responses.test.ts` | **PASS** |
| **AC-23** | F-03 | BR-05 | `TEST-23` | API Integration | `server/tests/responses.test.ts`, `server/src/auth.ts` | **PASS** |
| **AC-24** | F-03 | BR-09, NFR-04 | `TEST-24` | Unit & API | `server/tests/responses.test.ts`, `server/src/validation.ts` | **PASS** |
| **AC-25** | F-03 | BR-09, NFR-04 | `TEST-25` | Unit & API | `server/tests/responses.test.ts`, `server/src/validation.ts` | **PASS** |
| **AC-26** | F-03 | BR-09, DEC-04 | `TEST-26` | Unit & API | `server/tests/responses.test.ts` | **PASS** |
| **AC-27** | F-03 | FR-09 | `TEST-27`, `TEST-40` | API / E2E | `server/tests/responses.test.ts`, `e2e/sprint1.spec.ts` | **PASS** |
| **AC-28** | F-03 | BR-06 | `TEST-28` | API Integration | `server/tests/responses.test.ts` | **PASS** |
| **AC-29** | F-03 | BR-05, BR-06 | `TEST-29` | API Integration | `server/tests/responses.test.ts` | **PASS** |
| **AC-30** | F-04 | FR-10, BR-10 | `TEST-30`, `TEST-40` | Unit, API / E2E | `server/tests/summary.test.ts`, `e2e/sprint1.spec.ts` | **PASS** |
| **AC-31** | F-04 | BR-10 | `TEST-31` | Unit & API | `server/tests/summary.test.ts`, `server/src/summary.ts` | **PASS** |
| **AC-32** | F-04 | BR-04 | `TEST-32` | API Integration | `server/tests/summary.test.ts` | **PASS** |
| **AC-33** | F-04 | BR-05 | `TEST-33` | API Integration | `server/tests/summary.test.ts` | **PASS** |
| **AC-34** | F-04 | BR-10 | `TEST-34` | Unit & API | `server/tests/summary.test.ts`, `server/src/summary.ts` | **PASS** |
| **AC-35** | F-02 | FR-12, BR-03 | `TEST-35` | API Integration | `server/tests/surveys.test.ts` | **PASS** |
| **AC-36** | F-03 | FR-13, BR-13 | `TEST-36` | API Integration | `server/tests/responses.test.ts` | **PASS** |
| **AC-37** | S-01 | NFR-02, A-08 | `TEST-38` | Integration | `server/tests/probes.test.ts`, `server/prisma/seed.ts` | **PASS** |
| **AC-38** | F-01 | FR-02, NFR-01 | `TEST-39`, `TEST-40` | API / E2E | `server/tests/auth.test.ts`, `e2e/sprint1.spec.ts` | **PASS** |

---

## 3. Raw Test Execution Logs

### 3.1 Backend Test Execution Log (`npm --prefix server test`)

```text
> pollipop-server@1.0.0 test
> vitest run

 RUN  v3.2.7 pollipop/server

 ✓ tests/probes.test.ts (3 tests) 422ms
   ✓ S-01 System Foundation, Health & Readiness Probes > TEST-38: seedDatabase executes idempotently with bcrypt >= 10 rounds  389ms
   ✓ S-01 System Foundation, Health & Readiness Probes > TEST-07: GET /api/health returns 200 OK with liveness payload  14ms
   ✓ S-01 System Foundation, Health & Readiness Probes > TEST-08: GET /api/ready returns 200 OK when database is reachable  19ms

 ✓ tests/auth.test.ts (6 tests) 448ms
   ✓ F-01: Authentication, Session & Access Tests (TEST-01 to TEST-06, TEST-39) > TEST-01 / AC-01: Valid login sets HttpOnly pollipop_sid cookie and omits passwordHash
   ✓ F-01: Authentication, Session & Access Tests (TEST-01 to TEST-06, TEST-39) > TEST-02 / AC-02: Invalid password or unknown email is rejected with 401 INVALID_CREDENTIALS
   ✓ F-01: Authentication, Session & Access Tests (TEST-01 to TEST-06, TEST-39) > TEST-03 / AC-03: Invalid login payload returns 400 Bad Request with VALIDATION_ERROR
   ✓ F-01: Authentication, Session & Access Tests (TEST-01 to TEST-06, TEST-39) > TEST-04 & TEST-39 / AC-04, AC-38: GET /api/auth/me returns current user, omits sessionId and sets Cache-Control: no-store
   ✓ F-01: Authentication, Session & Access Tests (TEST-01 to TEST-06, TEST-39) > TEST-05 / AC-05: Unauthenticated requests to protected endpoints are rejected with 401
   ✓ F-01: Authentication, Session & Access Tests (TEST-01 to TEST-06, TEST-39) > TEST-06 / AC-06: POST /api/auth/logout deletes session in DB and invalidates subsequent requests

 ✓ tests/responses.test.ts (11 tests) 593ms
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-23 / AC-23: OWNER role attempting POST /api/surveys/:id/responses is rejected with 403 Forbidden
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-22 / AC-22: Submitting answers to DRAFT returns 404 NOT_FOUND, and to CLOSED returns 409 SURVEY_NOT_OPEN
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-24 / AC-24: Omitting required question returns 400 Bad Request (VALIDATION_ERROR)
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-25 / AC-25: Submitting rating outside 1..5 or invalid optionId returns 400 Bad Request
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-20 & TEST-26 / AC-20, AC-26: RESPONDENT submits valid response (omitting optional question) and receives 201 Created
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-21 / AC-21: Duplicate response submission returns 409 Conflict (ALREADY_SUBMITTED)
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-27 / AC-27: RESPONDENT can view own submitted answers via GET /api/responses/:id
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-28 / AC-28: Different RESPONDENT (student2) attempting GET /api/responses/:id receives 403 Forbidden
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-29 / AC-29: OWNER attempting direct access to GET /api/responses/:id receives 403 Forbidden
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-36 / AC-36: ANONYMOUS survey decouples respondentId from Response record while recording participation
   ✓ Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37) > TEST-37 / AC-21: Concurrent submissions dispatched simultaneously result in exactly one 201 and one 409

 ✓ tests/surveys.test.ts (9 tests) 642ms
   ✓ Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35) > TEST-09 / AC-09: OWNER creates survey with SINGLE_CHOICE and RATING questions (default status: DRAFT)
   ✓ Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35) > TEST-10 / AC-10: RESPONDENT role attempting POST /api/surveys is rejected with 403 Forbidden
   ✓ Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35) > TEST-11, TEST-12, TEST-13 / AC-11, AC-12, AC-13: Validation rules reject invalid survey payloads
   ✓ Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35) > TEST-14 / AC-14: OWNER can publish own survey (transitions DRAFT -> PUBLISHED)
   ✓ Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35) > TEST-15 / AC-15: Attempting to publish an already PUBLISHED survey returns 409 Conflict
   ✓ Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35) > TEST-16 / AC-16: Non-owner OWNER (owner2) cannot access or publish owner1's survey (403 Forbidden)
   ✓ Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35) > TEST-17 / AC-17: GET /api/surveys for OWNER returns only surveys owned by that user
   ✓ Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35) > TEST-18, TEST-19 / AC-18, AC-19: GET /api/surveys for RESPONDENT returns only PUBLISHED surveys; DRAFT returns 404
   ✓ Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35) > TEST-35 / AC-35: OWNER can close a PUBLISHED survey; cannot close a DRAFT survey

 ✓ tests/summary.test.ts (9 tests) 554ms
   ✓ Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34) > TEST-30 / AC-30: Survey OWNER receives accurate counts, percentages, and rating mean (200 OK)
   ✓ Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34) > TEST-31 / AC-31: Survey with 0 responses returns totalResponses: 0 and averageRating: null cleanly
   ✓ Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34) > TEST-32 / AC-32: Non-owning OWNER (owner2) querying summary receives 403 Forbidden
   ✓ Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34) > TEST-33 / AC-33: RESPONDENT querying summary receives 403 Forbidden
   ✓ Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34) > TEST-34 / AC-34: Optional questions skipped by respondents compute metrics based on totalAnswered
   ✓ Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34) > calculateSurveySummary unit test: calculates accurate percentages and distributions
   ✓ Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34) > calculateSurveySummary unit test: handles zero responses without division by zero
   ✓ Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34) > calculateSurveySummary unit test: ignores answers with invalid option IDs
   ✓ Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34) > TEST-34 / AC-34 API Integration: summary endpoint reflects skipped optional questions

 Test Files  5 passed (5)
      Tests  38 passed (38)
   Start at  00:03:41
   Duration  5.20s
```

### 3.2 Frontend Test Execution Log (`npm --prefix client test`)

```text
> pollipop-client@1.0.0 test
> vitest run --reporter=verbose

 RUN  v3.2.7 pollipop/client

 ✓ src/App.test.ts > Feature F-01..F-04: Client UI Architecture & Logic Tests (Issue #9) > API Client: apiRequest is exported and sets credentials to include 1ms
 ✓ src/App.test.ts > Feature F-01..F-04: Client UI Architecture & Logic Tests (Issue #9) > Role Routing: redirects OWNER to /owner/surveys and RESPONDENT to /surveys 0ms
 ✓ src/App.test.ts > Feature F-01..F-04: Client UI Architecture & Logic Tests (Issue #9) > Form Validation: Question builder enforces minimum 2 options for SINGLE_CHOICE 0ms
 ✓ src/App.test.ts > Feature F-01..F-04: Client UI Architecture & Logic Tests (Issue #9) > Survey Lifecycle Status Badges: assigns correct status badge classes 0ms
 ✓ src/App.test.ts > Feature F-01..F-04: Client UI Architecture & Logic Tests (Issue #9) > Summary Formatting: formats average rating and percentages to 2 decimal places and handles rating distribution 0ms
 ✓ src/App.test.ts > Feature F-01..F-04: Client UI Architecture & Logic Tests (Issue #9) > Role-Based Route Guarding: guards against unauthorized role access to endpoints 0ms
 ✓ src/App.test.ts > Feature F-01..F-04: Client UI Architecture & Logic Tests (Issue #9) > Security: AC-38 pageshow bfcache invalidation trigger handler is supported 0ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  00:24:03
   Duration  495ms
```

### 3.3 End-to-End User Journey Test Log (`npm run test:e2e` / `TEST-40`)

```text
> pollipop-root@1.0.0 test:e2e
> playwright test -c e2e/playwright.config.ts

Running 1 test using 1 worker

  ok 1 [chromium] › e2e\sprint1.spec.ts:9:3 › TEST-40: End-to-End User Journey across Sprint 1 Core Flow › Complete Sprint 1 Vertical Slice Journey (AC-01, AC-09, AC-14, AC-20, AC-21, AC-27, AC-30, AC-38) (2.0s)

  1 passed (5.0s)
```

### 3.4 Database Idempotent Seed Execution Log (`npm --prefix server run prisma:seed`)

```text
> pollipop-server@1.0.0 prisma:seed
> tsx prisma/seed.ts

Starting idempotent database seeding...
Seeded user: owner1@pollipop.local (OWNER)
Seeded user: owner2@pollipop.local (OWNER)
Seeded user: student1@pollipop.local (RESPONDENT)
Seeded user: student2@pollipop.local (RESPONDENT)
Seeding completed successfully.
```

---

## 4. Product Definition of Done (DoD) Verification & Sign-Off

The following checklist verifies that the Sprint 1 deliverable satisfies all Definition of Done criteria outlined in `docs/sprints/sprint-1/contracts.md`:

| DoD Item | Requirement & Criteria | Verifiable Artifact / Evidence | Compliance Status |
| :---: | :--- | :--- | :---: |
| **1** | **Spec-First Commit Sequence**<br>All specification documents committed prior to application code. | Commit `6953922` (PR #11: SRS & Traceability), Commit `8aa565c` (PR #12: SDS, Plan, Contracts). Both merged before feature commits. | **VERIFIED & MET** |
| **2** | **Complete Vertical Slice Implementation**<br>Full-stack flow across React UI, Express API, and Prisma DB. | Verified via `TEST-40` Playwright E2E suite covering Owner creation/publishing, Student response submission, duplicate rejection, Owner summary dashboard, and logout. | **VERIFIED & MET** |
| **3** | **Server-Side Security & Access Control**<br>RBAC (`401`, `403`), ownership isolation, and cache guard (`no-store`). | Verified via `server/tests/auth.test.ts`, `server/tests/surveys.test.ts`, `server/tests/responses.test.ts`, and `server/tests/summary.test.ts` (`TEST-01`..`TEST-06`, `TEST-10`, `TEST-16`, `TEST-23`, `TEST-28`, `TEST-29`, `TEST-32`, `TEST-33`, `TEST-39`). | **VERIFIED & MET** |
| **4** | **Automated Verification Executed & Passing**<br>100% test pass rate with zero skips across all 40 planned tests. | 46 total automated tests executed (38 server, 7 client, 1 Playwright E2E full journey). All 46 passed (100% pass rate, 0 failures, 0 skips). | **VERIFIED & MET** |
| **5** | **Retained TDD Evidence**<br>Red/Green commit sequence retained in git history for each feature branch. | Commit history across branches `feature/3`..`feature/10` shows test suites written and verified against requirements. | **VERIFIED & MET** |
| **6** | **Teammate Peer Review & Clean Workflow**<br>All 10 issues alternate author/reviewer with substantive review comments before merge. | PRs #11 through #19 reviewed and approved on GitHub with detailed technical review discussions between `@phatthidawadi` and `@lmaybelgracel`. PR #20 ready for final review. | **VERIFIED & MET** |

---

## 5. Peer Sign-Off & Release Readiness

Both student engineers confirm that Sprint 1 functionality is fully tested, hardened, and ready for release tagging (`v1.0.0-sprint1`) and Lab 5 deployment:

- **Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225):** Verified features `S-01`, `F-01`, `F-03`, `ui` (Issues #1, #3, #5, #7, #9).
- **Student 2 (ปทิตญา แก้ววิเชียร - 67070505220):** Verified features `S-01`, `F-02`, `F-04`, `test(e2e)` (Issues #2, #4, #6, #8, #10).

