# Sprint 1 Engineering Contracts (`docs/sprints/sprint-1/contracts.md`)
**Product Name:** Pollipop — University Review, Feedback, and Survey System  
**Repository:** `https://github.com/phatthidawadi/pollipop`  
**Team Members:**  
- **Student 1 (Author / Collaborator):** ภัทร์ธิดาวดี อุ่นคำ / Phatthidawadi Aunkham (67070505225, GitHub: `@phatthidawadi`)  
- **Student 2 (Author / Collaborator):** ปทิตญา แก้ววิเชียร / Patitaya Kaewwichian (67070505220, GitHub: `@lmaybelgracel`)  

---

## 1. Document Revision History

| Version | Date | Author | Summary of Changes & Justification |
| :---: | :---: | :--- | :--- |
| **v0.1** | 2026-11-08 | Team (Student 1 & 2) | Initial Sprint 1 scope draft covering `F-01` through `F-04` with first iteration of ACs and STSs. |
| **v0.2** | 2026-11-09 | Team (Student 1 & 2) | Added `S-01` (`/api/health`, `/api/ready`), updated `GET /api/surveys` to return `responseId` when `answered === true` (`DEC-06`), and established Zod error formats (`NFR-04`). |
| **v1.0** | 2026-11-10 | Team (Student 1 & 2) | Locked HTTP codes for `AC-22` (`DRAFT` $\rightarrow$ `404 NOT_FOUND`, `CLOSED` $\rightarrow$ `409 SURVEY_NOT_OPEN`), added `AC-38` / `TEST-39`–`TEST-40` for `Cache-Control: no-store` and `pageshow` back-button defense, and codified optional question handling in `AC-26`. |

---

## 2. Feature Engineering Contracts

### 2.1 Feature `S-01`: System Foundation, Health & Readiness Probes
* **Linked Requirements:** `FR-03`, `NFR-02`, `NFR-04`, `NFR-05`, `A-01`, `A-08`
* **Dependencies:** None
* **Workflow & Behavior:**
  1. The server exposes `GET /api/health` (Liveness Probe) publicly, returning `200 OK` with `{ "status": "ok", "service": "Pollipop API", "timestamp": "..." }`.
  2. The server exposes `GET /api/ready` (Readiness Probe for Lab 5 Smoke Tests), executing `await prisma.$queryRaw\`SELECT 1\`` against the active database. If connected, it returns `200 OK { "status": "ready", "db": "connected" }`; if failed, it returns `503 Service Unavailable { "status": "not_ready", "db": "disconnected" }`.
  3. The database seed script (`prisma/seed.ts`) seeds 4 standard test accounts (`owner1@pollipop.local`, `owner2@pollipop.local`, `student1@pollipop.local`, `student2@pollipop.local`) using `prisma.user.upsert` with `bcrypt` password hashing (salt rounds $\ge 10$).
* **UI Layer:** No dedicated frontend view (serves DevOps monitoring and automated smoke testing).

---

### 2.2 Feature `F-01`: Authentication, Database Session & Role-Based Access Control
* **Linked Requirements:** `FR-01`, `FR-02`, `BR-05`, `NFR-01`, `NFR-02`, `NFR-05`
* **Dependencies:** `S-01`
* **UI Specification:**
  * Route `/login`: Form with `email` (`input[type="email"]`), `password` (`input[type="password"]`), and submit button (`button[type="submit"]`).
  * On success: Redirects to `/owner/surveys` if `user.role === 'OWNER'`, or `/surveys` if `user.role === 'RESPONDENT'`.
  * Top Navigation Bar: Displays user name, role badge (`OWNER` or `RESPONDENT`), and **"Log Out"** button.
  * **Back-Button Protection (`pageshow`):** Upon logging out, browser back navigation triggers a `pageshow` event handler checking `event.persisted` or verifying with `/api/auth/me`, immediately redirecting back to `/login` without displaying cached data.
* **API Specification:**
  * `POST /api/auth/login`
    * **Request Body:** `{ "email": "owner1@pollipop.local", "password": "..." }`
    * **Success Response (`200 OK`):** Sets `pollipop_sid` cookie (`HttpOnly; Path=/; SameSite=Lax`) and returns `{ "user": { "id": "...", "email": "...", "name": "...", "role": "OWNER", "department": "CPE" } }` (excluding `passwordHash`).
    * **Failure Responses:** `400 Bad Request` (`VALIDATION_ERROR`), `401 Unauthorized` (`INVALID_CREDENTIALS`).
  * `GET /api/auth/me`
    * **Headers:** Always sends `Cache-Control: no-store, no-cache, must-revalidate`.
    * **Success Response (`200 OK`):** `{ "user": { "id": "...", "email": "...", "name": "...", "role": "...", "department": "..." } }`.
    * **Failure Response:** `401 Unauthorized` (`UNAUTHORIZED`).
  * `POST /api/auth/logout`
    * **Success Response (`200 OK`):** Deletes session row from database, clears `pollipop_sid` cookie, sends `Cache-Control: no-store`, and returns `{ "message": "Successfully logged out" }`.
* **Database Layer:** Uses `User` and `Session` tables.

---

### 2.3 Feature `F-02`: Survey Creation, Listing & Lifecycle Management
* **Linked Requirements:** `FR-04`, `FR-05`, `FR-06`, `FR-07`, `FR-12`, `BR-03`, `BR-04`, `BR-05`, `BR-07`, `BR-08`, `BR-11`, `NFR-04`
* **Dependencies:** `F-01`
* **UI Specification:**
  * Route `/owner/surveys` (`OWNER` only): Lists own surveys with status badges (`DRAFT`, `PUBLISHED`, `CLOSED`), response counts, **"Create New Survey"** button, **"Publish"** button (`DRAFT` only), **"Close"** button (`PUBLISHED` only), and **"View Summary"** link.
  * Route `/owner/surveys/new` (`OWNER` only): Survey creation form with `title`, `description`, `mode` (`IDENTIFIED`), and dynamic question builder (`SINGLE_CHOICE` with 2–10 options, `RATING` with 1–5 scale, and `required` toggle).
  * Route `/surveys` (`RESPONDENT` only): Displays `PUBLISHED` surveys with completion status badge (**"Completed"** vs **"Not Completed"**); completed identified surveys show a **"View My Submission"** link to `/responses/:responseId`.
* **API Specification:**
  * `POST /api/surveys` (Role: `OWNER`)
    * **Request Body:**
      ```json
      {
        "title": "CPE 334 Course Evaluation",
        "description": "Student feedback for Semester 1/2026",
        "mode": "IDENTIFIED",
        "questions": [
          {
            "text": "How effectively did the lectures cover course outcomes?",
            "type": "SINGLE_CHOICE",
            "required": true,
            "options": ["Excellent", "Good", "Satisfactory"]
          },
          {
            "text": "Overall Course Rating (1-5)",
            "type": "RATING",
            "required": true
          }
        ]
      }
      ```
    * **Success Response (`201 Created`):** Returns survey object with `status: "DRAFT"`.
    * **Failure Responses:** `400 Bad Request` (`VALIDATION_ERROR`), `401 Unauthorized`, `403 Forbidden` (if invoked by `RESPONDENT`).
  * `GET /api/surveys` (Role: `OWNER` or `RESPONDENT`)
    * **For `OWNER` (`200 OK`):** Returns only surveys where `ownerId === currentUser.id` with `responseCount`.
    * **For `RESPONDENT` (`200 OK`):** Returns only surveys where `status === 'PUBLISHED'`, including `answered: boolean` and `responseId: string | null`.
  * `GET /api/surveys/:id` (Role: `OWNER` or `RESPONDENT`)
    * **For `OWNER`:** Returns `200 OK` if owner; returns `403 Forbidden` if owned by another account (`BR-04`).
    * **For `RESPONDENT`:** Returns `404 Not Found` if `DRAFT` (`BR-07`); returns `200 OK` if `PUBLISHED` or `CLOSED`.
  * `POST /api/surveys/:id/publish` (Role: `OWNER` of the survey)
    * Transitions state from `DRAFT` $\rightarrow$ `PUBLISHED` (`200 OK`).
    * Returns `403 Forbidden` if not owner; returns `409 Conflict` (`INVALID_STATE_TRANSITION`) if not currently in `DRAFT`.
  * `POST /api/surveys/:id/close` (Role: `OWNER` of the survey)
    * Transitions state from `PUBLISHED` $\rightarrow$ `CLOSED` (`200 OK`).
    * Returns `403 Forbidden` if not owner; returns `409 Conflict` (`INVALID_STATE_TRANSITION`) if not currently `PUBLISHED`.

---

### 2.4 Feature `F-03`: Validated Response Submission & Own Response Inspection
* **Linked Requirements:** `FR-08`, `FR-09`, `BR-01`, `BR-02`, `BR-05`, `BR-06`, `BR-07`, `BR-09`, `BR-12`, `BR-13`, `NFR-03`, `NFR-04`
* **Dependencies:** `F-01`, `F-02`
* **UI Specification:**
  * Route `/surveys/:id` (`RESPONDENT` only): Interactive survey form rendering choices for `SINGLE_CHOICE`, score buttons `1` to `5` for `RATING`, and optional badges `(Optional)` for `required: false` questions.
  * On submission success (`201 Created`): Confirmation screen with option to review answers at `/responses/:id`.
* **API Specification:**
  * `POST /api/surveys/:id/responses` (Role: `RESPONDENT` only; `403 Forbidden` for `OWNER`)
    * **Request Body:**
      ```json
      {
        "answers": [
          { "questionId": "q-1", "optionId": "opt-1" },
          { "questionId": "q-2", "ratingValue": 5 }
        ]
      }
      ```
    * **Validation & Enforcement Order:**
      1. Survey missing or `DRAFT` $\rightarrow$ Return `404 Not Found` (`NOT_FOUND`).
      2. Survey is `CLOSED` $\rightarrow$ Return `409 Conflict` (`SURVEY_NOT_OPEN`).
      3. Already submitted by user (checked via `SurveyParticipation` or `(surveyId, userId)` unique index) $\rightarrow$ Return `409 Conflict` (`ALREADY_SUBMITTED`).
      4. Validate all answers per `BR-09`:
         * All `required: true` questions must have valid answers.
         * Questions with `required: false` may be omitted or sent with `null`.
         * `SINGLE_CHOICE` answers must reference valid `optionId` items belonging to that question.
         * `RATING` answers must be integers between 1 and 5.
         * Any violation $\rightarrow$ Return `400 Bad Request` (`VALIDATION_ERROR`).
      5. Atomically insert `Response`, `Answer`, and `SurveyParticipation` within `prisma.$transaction()`:
         * In `IDENTIFIED` mode: set `Response.respondentId = currentUser.id`.
         * In `ANONYMOUS` mode: set `Response.respondentId = null` (`BR-13`).
    * **Success Response (`201 Created`):** `{ "id": "resp-...", "surveyId": "...", "submittedAt": "...", "answers": [...] }`.
  * `GET /api/responses/:id` (Role: `RESPONDENT` only)
    * If not found $\rightarrow$ `404 Not Found`.
    * If `response.respondentId !== currentUser.id` $\rightarrow$ Return `403 Forbidden` (`FORBIDDEN`) without revealing response content (`BR-06`).

---

### 2.5 Feature `F-04`: Survey Aggregate Summary & Results Dashboard
* **Linked Requirements:** `FR-10`, `BR-04`, `BR-05`, `BR-10`, `BR-13`
* **Dependencies:** `F-02`, `F-03`
* **UI Specification:**
  * Route `/owner/surveys/:id/summary` (Survey `OWNER` only):
    * Displays survey title, status, mode, and total completed respondents (`totalResponses`).
    * Single choice questions: Table showing choice labels, selection counts (`count`), and percentage shares (`percentage` to 2 decimal places).
    * Rating questions: Mean score (`averageRating` to 2 decimal places, or `"0.00"` if 0 responses) and frequency distribution across scores 1 to 5.
* **API Specification:**
  * `GET /api/surveys/:id/summary` (Role: Survey `OWNER` only)
    * If caller is `RESPONDENT` or another owner (`survey.ownerId !== currentUser.id`) $\rightarrow$ Return `403 Forbidden` (`BR-04`, `BR-05`).
    * **Success Response (`200 OK`):**
      ```json
      {
        "surveyId": "survey-1",
        "title": "CPE 334 Course Evaluation",
        "status": "PUBLISHED",
        "mode": "IDENTIFIED",
        "totalResponses": 2,
        "questions": [
          {
            "questionId": "q-1",
            "text": "How effectively did the lectures cover course outcomes?",
            "type": "SINGLE_CHOICE",
            "required": true,
            "totalAnswered": 2,
            "options": [
              { "optionId": "opt-1", "text": "Excellent", "count": 1, "percentage": 50 },
              { "optionId": "opt-2", "text": "Good", "count": 1, "percentage": 50 },
              { "optionId": "opt-3", "text": "Satisfactory", "count": 0, "percentage": 0 }
            ]
          },
          {
            "questionId": "q-2",
            "text": "Overall Course Rating (1-5)",
            "type": "RATING",
            "required": true,
            "totalAnswered": 2,
            "averageRating": 4.5,
            "distribution": { "1": 0, "2": 0, "3": 0, "4": 1, "5": 1 }
          }
        ]
      }
      ```

---

## 3. Master Acceptance Criteria Table (`AC-01` to `AC-38`)

| AC ID | Feature | Linked Req | Observable Acceptance Criterion (Expected Outcome) |
| :--- | :---: | :--- | :--- |
| **AC-01** | F-01 | FR-01, NFR-02 | Valid seed credentials authenticate successfully (`200 OK`), receive an `HttpOnly` `pollipop_sid` cookie, and receive user profile excluding `passwordHash`. |
| **AC-02** | F-01 | FR-01 | Invalid password or non-existent email returns `401 Unauthorized` (`INVALID_CREDENTIALS`) without creating a session in the database. |
| **AC-03** | F-01 | FR-01, NFR-04 | Malformed email or empty credentials return `400 Bad Request` (`VALIDATION_ERROR`) with structured error details. |
| **AC-04** | F-01 | FR-02 | Authenticated caller invoking `GET /api/auth/me` receives active user profile and role matching database (`200 OK`). |
| **AC-05** | F-01 | FR-02, NFR-01 | Unauthenticated calls (missing/invalid cookie) to `GET /api/auth/me` or protected routes return `401 Unauthorized`. |
| **AC-06** | F-01 | FR-02, NFR-01 | Invoking `POST /api/auth/logout` deletes the session record, clears the cookie, and subsequent calls return `401 Unauthorized`. |
| **AC-07** | S-01 | FR-03, NFR-05 | `GET /api/health` returns `200 OK` with `{ "status": "ok", "service": "Pollipop API", ... }` without requiring authentication. |
| **AC-08** | S-01 | FR-03, NFR-05 | `GET /api/ready` verifies live DB connection (`SELECT 1`) returning `200 OK` `{ "status": "ready", "db": "connected" }`. |
| **AC-09** | F-02 | FR-04, FR-05 | `OWNER` can create a survey containing `SINGLE_CHOICE` and `RATING` questions (`201 Created`) with default `DRAFT` status. |
| **AC-10** | F-02 | BR-05 | `RESPONDENT` attempting to create a survey via `POST /api/surveys` is rejected with `403 Forbidden`. |
| **AC-11** | F-02 | BR-08, NFR-04 | Creating surveys with empty titles, titles $> 200$ chars, or empty question arrays returns `400 Bad Request` (`VALIDATION_ERROR`). |
| **AC-12** | F-02 | FR-05, BR-08 | Creating `SINGLE_CHOICE` questions with $< 2$ or $> 10$ options returns `400 Bad Request` identifying `questions.0.options`. |
| **AC-13** | F-02 | FR-05, NFR-04 | Questions specifying unsupported question types return `400 Bad Request` (`VALIDATION_ERROR`). |
| **AC-14** | F-02 | FR-06, BR-03 | Survey `OWNER` can publish their `DRAFT` survey via `POST /api/surveys/:id/publish` (`200 OK`). |
| **AC-15** | F-02 | BR-03, BR-11 | Calling publish on a survey already in `PUBLISHED` or `CLOSED` status returns `409 Conflict` (`INVALID_STATE_TRANSITION`). |
| **AC-16** | F-02 | BR-04 | Another owner (`owner2`) attempting to view, publish, or close `owner1`'s survey is rejected with `403 Forbidden`. |
| **AC-17** | F-02 | FR-07, BR-04 | `OWNER` invoking `GET /api/surveys` receives only their own surveys, isolated from other owners. |
| **AC-18** | F-02 | FR-07, DEC-06 | `RESPONDENT` invoking `GET /api/surveys` receives only `PUBLISHED` surveys with `answered` flag and `responseId` when completed. |
| **AC-19** | F-02 | BR-07 | `RESPONDENT` attempting to query `GET /api/surveys/:id` for a `DRAFT` survey receives `404 Not Found`. |
| **AC-20** | F-03 | FR-08, NFR-03 | `RESPONDENT` submitting valid answers to a `PUBLISHED` survey succeeds (`201 Created`), atomically writing participation and responses. |
| **AC-21** | F-03 | BR-01, NFR-03 | Repeat submission by the same respondent returns `409 Conflict` (`ALREADY_SUBMITTED`), leaving total records unchanged. |
| **AC-22** | F-03 | BR-02, BR-07 | Submitting answers to a `DRAFT` survey returns `404 Not Found`; submitting to a `CLOSED` survey returns `409 Conflict` (`SURVEY_NOT_OPEN`). |
| **AC-23** | F-03 | BR-05 | User with `OWNER` role attempting `POST /api/surveys/:id/responses` is rejected with `403 Forbidden`. |
| **AC-24** | F-03 | BR-09, NFR-04 | Omitting an answer for a `required: true` question returns `400 Bad Request` (`VALIDATION_ERROR`) with no database writes. |
| **AC-25** | F-03 | BR-09, NFR-04 | Submitting invalid rating values (e.g. `0`, `6`, `3.5`) or mismatched option IDs returns `400 Bad Request`. |
| **AC-26** | F-03 | BR-09, DEC-04 | Skipping optional questions (`required: false`) or passing `null` succeeds (`201 Created`), correctly recording remaining answers. |
| **AC-27** | F-03 | FR-09 | `RESPONDENT` can inspect their submitted answers via `GET /api/responses/:id` in `IDENTIFIED` mode (`200 OK`). |
| **AC-28** | F-03 | BR-06 | A different respondent (`student2`) attempting `GET /api/responses/:id` of `student1` is rejected with `403 Forbidden`. |
| **AC-29** | F-03 | BR-05, BR-06 | An `OWNER` attempting direct access to `GET /api/responses/:id` is rejected with `403 Forbidden` (must use aggregate summary). |
| **AC-30** | F-04 | FR-10, BR-10 | Survey `OWNER` invoking `GET /api/surveys/:id/summary` receives accurate counts, percentages, and rating mean (2 decimals) (`200 OK`). |
| **AC-31** | F-04 | BR-10 | When a survey has 0 responses, `GET /api/surveys/:id/summary` returns `totalResponses: 0` and `averageRating: null` without zero-division errors. |
| **AC-32** | F-04 | BR-04 | Another owner attempting to inspect `GET /api/surveys/:id/summary` is rejected with `403 Forbidden`. |
| **AC-33** | F-04 | BR-05 | A `RESPONDENT` attempting `GET /api/surveys/:id/summary` is rejected with `403 Forbidden`. |
| **AC-34** | F-04 | BR-10 | Optional questions skipped by respondents compute `averageRating` and `percentage` based strictly on actual answer counts (`totalAnswered`). |
| **AC-35** | F-02 | FR-12, BR-03 | Survey `OWNER` can close a `PUBLISHED` survey (`POST /api/surveys/:id/close`), but cannot close a `DRAFT` directly (`409 Conflict`). |
| **AC-36** | F-03 | FR-13, BR-13 | Submitting answers to an `ANONYMOUS` survey creates a `SurveyParticipation` row while keeping `Response.respondentId` strictly `null`. |
| **AC-37** | S-01 | NFR-02, A-08 | Seed script executes idempotently (`upsert`) without errors and stores all passwords as `bcrypt` hashes (`$2a$`/`$2b$`). |
| **AC-38** | F-01 | FR-02, NFR-01 | All protected routes send `Cache-Control: no-store`; browser back navigation post-logout is redirected to `/login` immediately. |

---

## 4. Software Test Specification (`TEST-01` to `TEST-40`)

| Test ID | Linked AC | Test Level | Preconditions / Input | Action | Expected Result |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **TEST-01** | AC-01 | API Integration | Seeded DB contains `owner1@pollipop.local` | `POST /api/auth/login` with correct password | Returns `200 OK`, `Set-Cookie: pollipop_sid=...; HttpOnly`, `user.role === "OWNER"`, no `passwordHash`. |
| **TEST-02** | AC-02 | API Integration | Seeded DB contains `owner1@pollipop.local` | `POST /api/auth/login` with wrong password | Returns `401 Unauthorized` (`INVALID_CREDENTIALS`), no session created. |
| **TEST-03** | AC-03 | Unit & API | `email: "not-an-email"`, `password: ""` | Validate with `loginSchema` & call `POST /api/auth/login` | Returns `400 Bad Request` (`VALIDATION_ERROR`) with structured field details. |
| **TEST-04** | AC-04 | API Integration | Authenticated as `student1@pollipop.local` | `GET /api/auth/me` with `pollipop_sid` cookie | Returns `200 OK` with profile (`role: "RESPONDENT"`). |
| **TEST-05** | AC-05 | API Integration | No session cookie attached | Call `GET /api/auth/me` and `GET /api/surveys` | Returns `401 Unauthorized` (`UNAUTHORIZED`) on both endpoints. |
| **TEST-06** | AC-06 | API Integration | Logged in with valid `pollipop_sid` | Call `POST /api/auth/logout`, then call `/api/auth/me` | Logout returns `200 OK`, session deleted; second call returns `401 Unauthorized`. |
| **TEST-07** | AC-07 | API Integration | Server running normally | Call `GET /api/health` | Returns `200 OK` `{ "status": "ok", "service": "Pollipop API", ... }`. |
| **TEST-08** | AC-08 | API Integration | Database running normally | Call `GET /api/ready` | Returns `200 OK` `{ "status": "ready", "db": "connected" }`. |
| **TEST-09** | AC-09 | API Integration | Authenticated as `owner1` | `POST /api/surveys` with `SINGLE_CHOICE` and `RATING` questions | Returns `201 Created`, records saved in DB with `status: "DRAFT"` and ordered questions. |
| **TEST-10** | AC-10 | API Integration | Authenticated as `student1` (`RESPONDENT`) | `POST /api/surveys` | Returns `403 Forbidden` (`FORBIDDEN`). |
| **TEST-11** | AC-11 | Unit & API | `title: ""` or `questions: []` | Validate with `createSurveySchema` & call `POST /api/surveys` | Returns `400 Bad Request` (`VALIDATION_ERROR`). |
| **TEST-12** | AC-12 | Unit & API | `SINGLE_CHOICE` question with 1 option or 11 options | Validate with `createSurveySchema` & call `POST /api/surveys` | Returns `400 Bad Request` with `field: "questions.0.options"`. |
| **TEST-13** | AC-13 | Unit | Question specifies `type: "INVALID_TYPE"` | Validate with `createSurveySchema` | Zod rejects payload with schema validation error. |
| **TEST-14** | AC-14 | API Integration | `owner1` owns survey in `DRAFT` status | Call `POST /api/surveys/:id/publish` | Returns `200 OK`, DB status updated to `PUBLISHED` with `publishedAt` timestamp. |
| **TEST-15** | AC-15 | Unit & API | Survey already in `PUBLISHED` status | Call `POST /api/surveys/:id/publish` again | Returns `409 Conflict` (`INVALID_STATE_TRANSITION`). |
| **TEST-16** | AC-16 | API Integration | `owner1` creates `DRAFT` survey; login as `owner2` | `owner2` calls `GET /api/surveys/:id` and `/publish` | Returns `403 Forbidden` (`FORBIDDEN`); state remains `DRAFT`. |
| **TEST-17** | AC-17 | API Integration | Both `owner1` and `owner2` have surveys | `owner1` calls `GET /api/surveys` | Returns `200 OK` containing only surveys belonging to `owner1`. |
| **TEST-18** | AC-18 | API Integration | 1 `DRAFT` survey and 1 `PUBLISHED` survey exist | `student1` calls `GET /api/surveys` before/after submission | Sees only `PUBLISHED` survey; pre-submission shows `answered: false`, post shows `answered: true`. |
| **TEST-19** | AC-19 | API Integration | Survey in `DRAFT` status | `student1` calls `GET /api/surveys/:id` | Returns `404 Not Found` (`NOT_FOUND`). |
| **TEST-20** | AC-20 | API Integration | Survey in `PUBLISHED` status; login as `student1` | `POST /api/surveys/:id/responses` with complete answers | Returns `201 Created`; rows created in `SurveyParticipation`, `Response`, and `Answer`. |
| **TEST-21** | AC-21 | API Integration | `student1` already submitted survey once | `student1` calls `POST /api/surveys/:id/responses` again | Returns `409 Conflict` (`ALREADY_SUBMITTED`); DB count remains 1. |
| **TEST-22** | AC-22 | API Integration | 1 `DRAFT` survey and 1 `CLOSED` survey exist | `student1` calls `POST /api/surveys/:id/responses` to both | `DRAFT` returns `404 Not Found`; `CLOSED` returns `409 Conflict` (`SURVEY_NOT_OPEN`). |
| **TEST-23** | AC-23 | API Integration | Authenticated as `owner1` (`OWNER`) | `owner1` calls `POST /api/surveys/:id/responses` | Returns `403 Forbidden` (`FORBIDDEN`). |
| **TEST-24** | AC-24 | Unit & API | Survey has 2 `required: true` questions | `student1` submits answers omitting 1 required question | Returns `400 Bad Request` (`VALIDATION_ERROR`); no DB records written. |
| **TEST-25** | AC-25 | Unit & API | Question 1 is `SINGLE_CHOICE`, Question 2 is `RATING` | Submit foreign `optionId` or `ratingValue: 6` | Returns `400 Bad Request` (`VALIDATION_ERROR`). |
| **TEST-26** | AC-26 | Unit & API | Survey has question 1 (`required`) and question 2 (`optional`) | `student1` answers only question 1, omitting question 2 | Returns `201 Created`; successfully records response without error. |
| **TEST-27** | AC-27 | API Integration | `student1` submitted `IDENTIFIED` response, has `responseId` | `student1` calls `GET /api/responses/:responseId` | Returns `200 OK` with accurate matching answer details. |
| **TEST-28** | AC-28 | API Integration | `student1` has response; login as `student2` | `student2` calls `GET /api/responses/:responseId` of `student1` | Returns `403 Forbidden` (`FORBIDDEN`); zero answer data leaked. |
| **TEST-29** | AC-29 | API Integration | `student1` has response; login as `owner1` | `owner1` calls `GET /api/responses/:responseId` directly | Returns `403 Forbidden` (`FORBIDDEN`). |
| **TEST-30** | AC-30 | Unit & API | Survey answered by 2 users (`student1` and `student2`) | `owner1` calls `GET /api/surveys/:id/summary` | Returns `200 OK`, `totalResponses: 2`, calculates count, %, average rating, and distribution accurately. |
| **TEST-31** | AC-31 | Unit & API | Survey has 0 responses | `owner1` calls `GET /api/surveys/:id/summary` | Returns `200 OK`, `totalResponses: 0`, choice counts 0, `averageRating: null` (no zero-division error). |
| **TEST-32** | AC-32 | API Integration | Survey owned by `owner1`; login as `owner2` | `owner2` calls `GET /api/surveys/:id/summary` of `owner1` | Returns `403 Forbidden` (`FORBIDDEN`). |
| **TEST-33** | AC-33 | API Integration | Authenticated as `student1` (`RESPONDENT`) | `student1` calls `GET /api/surveys/:id/summary` | Returns `403 Forbidden` (`FORBIDDEN`). |
| **TEST-34** | AC-34 | Unit | 2 respondents, but optional `RATING` answered by only 1 | Calculate summary via `calculateSurveySummary` | `totalResponses: 2`, but for rating question `totalAnswered: 1` and `averageRating: 4`. |
| **TEST-35** | AC-35 | API Integration | `owner1` survey in `PUBLISHED` status | `owner1` calls `POST /api/surveys/:id/close` | `PUBLISHED` returns `200 OK` transitioning to `CLOSED`; `DRAFT` returns `409 Conflict`. |
| **TEST-36** | AC-36 | API Integration | `ANONYMOUS` survey in `PUBLISHED` status | `student1` submits via `POST /api/surveys/:id/responses` | Returns `201 Created`; `SurveyParticipation` written, but `Response.respondentId` is `null`. |
| **TEST-37** | AC-21 | API Integration | `PUBLISHED` survey; login as `student1` | Dispatch 2 concurrent submissions (`Promise.all`) | Exactly 1 returns `201 Created`, the other receives `409 Conflict`; DB holds 1 response. |
| **TEST-38** | AC-37 | Integration | Execute `seedDatabase()` twice consecutively | Inspect database `User` records | Both executions pass without error; password hashes start with `$2a$`/`$2b$`. |
| **TEST-39** | AC-38 | API Integration | Authenticated calls to protected routes (`/api/auth/me`) | Inspect HTTP response headers | `Cache-Control` header contains `no-store` consistently. |
| **TEST-40** | AC-01, AC-09, AC-14, AC-20, AC-21, AC-27, AC-30, AC-38 | UI / E2E (Playwright) | Real browser against seeded database | Full end-to-end journey: (1) `owner1` logs in, creates & publishes survey -> (2) `student1` logs in, submits response, views answer, tests duplicate rejection -> (3) `owner1` inspects summary -> (4) logs out and clicks browser Back button | All UI renders match DB; Back button post-logout immediately redirects to `/login`. |

---

## 5. Sprint 1 Product Definition of Done (DoD)

A feature within Sprint 1 is considered **Done** only when verifiable evidence confirms compliance with every item below:
1. **Spec-First Commit Sequence:** All specification documents (`docs/srs.md`, `docs/features.md`, `docs/traceability.md`, `docs/system-sds.md`, `docs/sprints/plan.md`, `docs/sprints/sprint-1/contracts.md`) are committed to Git prior to application code commits.
2. **Complete Vertical Slice Implementation:** Full UI (`client/`), API (`server/`), and Database (`Prisma/PostgreSQL`) interact seamlessly for `S-01`, `F-01`, `F-02`, `F-03`, and `F-04`.
3. **Server-Side Security & Access Control:** Authentication (`401`), role segregation (`403`), ownership isolation (`403`), and cross-response privacy (`403`) are enforced server-side with `Cache-Control: no-store`.
4. **Automated Verification Executed & Passing:** All 40 automated tests (`TEST-01` to `TEST-40`: Unit, API Integration, and Playwright E2E) run and pass with 100% success rate without skips.
5. **Retained TDD Evidence:** Git commit history and test execution logs show failing tests (Red) prior to feature implementation and passing tests (Green) following completion.
6. **Teammate Peer Review & Clean Release:** All features developed on feature branches off `sprint-1-staging`, peer-reviewed and approved by the teammate with substantive review comments before merging to `main` with release tags.
