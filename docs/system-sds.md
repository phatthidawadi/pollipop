# System-Level Software Design Specification (`docs/system-sds.md`)
**Product Name:** Pollipop — University Review, Feedback, and Survey System  
**Repository:** `https://github.com/phatthidawadi/pollipop`  
**Team Members:**  
- **Student 1 (Author / Collaborator):** ภัทร์ธิดาวดี อุ่นคำ / Phatthidawadi Aunkham (67070505225, GitHub: `@phatthidawadi`)  
- **Student 2 (Author / Collaborator):** ปทิตญา แก้ววิเชียร / Patitaya Kaewwichian (67070505220, GitHub: `@lmaybelgracel`)    

---

## 1. Architecture and Data Design

### 1.1 Selected Technology Stack & Three-Tier Component Responsibilities
The **Pollipop** platform implements a clean **Three-Tier Architecture**, separating concerns between the client presentation layer (`client/`), server application/API layer (`server/`), and persistent database layer (`PostgreSQL 16`):

| Layer / Component | Technology Stack | Primary Responsibilities & Enforcement of Business Rules |
| :--- | :--- | :--- |
| **Presentation Tier**<br>(`client/`) | React 18, Vite, TypeScript, React Router v6 | - Role-aware rendering (`OWNER` vs `RESPONDENT`) managing Loading, Empty, and Error UI states.<br>- Automated credential inclusion with requests (`credentials: 'include'`).<br>- Intercepting browser `pageshow` history navigation events to verify active session against `/api/auth/me` on back-button clicks post-logout.<br>- *Note:* UI button disabling is solely a UX convenience; **all security and access constraints are strictly enforced server-side**. |
| **Application / API Tier**<br>(`server/`) | Node.js, Express, TypeScript, Zod, `bcryptjs`, `cookie-parser` | - **Authentication & Session Middleware:** Validates `pollipop_sid` cookies against the database `Session` table, checks expiry (`expiresAt`), and injects `Cache-Control: no-store` headers into all protected routes.<br>- **Role & Ownership Authorization:** Strictly enforces `BR-04` (Ownership Isolation), `BR-05` (Role Segregation), and `BR-06` (Cross-Response Privacy) on every endpoint.<br>- **Input & Domain Validation:** Uses Zod schemas for request validation with structured dot-path error notations (`NFR-04`), and coordinates atomic business transactions. |
| **Data Persistence Tier**<br>(`server/prisma/`) | PostgreSQL 16, Prisma ORM | - Stores durable entities: `User`, `Session`, `Survey`, `Question`, `ChoiceOption`, `SurveyParticipation`, `Response`, and `Answer`.<br>- Enforces database-level constraints including `@@unique([surveyId, userId])` on `SurveyParticipation` for race-condition prevention (`BR-01`, `NFR-03`).<br>- Executes multi-table response submissions inside atomic transactions (`prisma.$transaction`). |

### 1.2 System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client_Tier["Presentation Tier (Browser)"]
        UI["React + Vite SPA (client/)\n- Role-aware Views\n- Form & Error State Display\n- pageshow bfcache Guard"]
    end

    subgraph Server_Tier["Application / API Tier (server/)"]
        Health["Health & Readiness Probes\nGET /api/health\nGET /api/ready"]
        AuthMW["Auth & Cache Middleware\n- Verify pollipop_sid in DB\n- Set Cache-Control: no-store\n- Role Guard (OWNER / RESPONDENT)"]
        ZodVal["Zod Validation Layer\n- Structured Error Responses\n- Dot-path Field Notation"]
        Controllers["Domain Controllers & Services\n- Auth Service (F-01)\n- Survey Lifecycle Service (F-02)\n- Response Transaction Service (F-03)\n- Aggregate Summary Calculator (F-04)"]
    end

    subgraph Data_Tier["Data Persistence Tier (PostgreSQL / Prisma)"]
        DB[("PostgreSQL Database\n- User & Session\n- Survey, Question, ChoiceOption\n- SurveyParticipation (Unique surveyId+userId)\n- Response & Answer")]
    end

    UI <-->|"HTTP JSON + Cookie (pollipop_sid)\ncredentials: include"| AuthMW
    UI -->|"Public Login"| Controllers
    AuthMW --> ZodVal
    ZodVal --> Controllers
    Controllers <-->|"Prisma Client\n(Atomic $transaction)"| DB
    Health <-->|"SELECT 1"| DB
```

---

### 1.3 Data Model & Entity-Relationship Diagram (ERD)

The database schema decouples **`SurveyParticipation`** (who completed which survey) from **`Response`** (the submitted answer payload). In `IDENTIFIED` mode, `Response.respondentId` is set to allow respondents to review their submissions (`GET /api/responses/:id`). In `ANONYMOUS` mode, `Response.respondentId` is set to `null`, ensuring duplicate submissions are blocked while identity remains permanently unlinked.

```mermaid
erDiagram
    User ||--o{ Session : "has active sessions"
    User ||--o{ Survey : "owns (ownerId)"
    User ||--o{ SurveyParticipation : "participates in (userId)"
    User ||--o{ Response : "submits in IDENTIFIED mode (respondentId nullable)"

    Survey ||--|{ Question : "contains (1..50)"
    Survey ||--o{ SurveyParticipation : "tracks completion"
    Survey ||--o{ Response : "receives"

    Question ||--o{ ChoiceOption : "has choices (2..10 for SINGLE_CHOICE)"
    Question ||--o{ Answer : "answered by"

    Response ||--|{ Answer : "contains"
    ChoiceOption ||--o{ Answer : "selected option"

    User {
        string id PK
        string email UK
        string passwordHash
        string name
        enum role "OWNER | RESPONDENT"
        string department "e.g. CPE, ENV"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Session {
        string id PK "Session Token (UUID/Random)"
        string userId FK
        datetime expiresAt
        datetime createdAt
    }

    Survey {
        string id PK
        string title
        string description
        enum status "DRAFT | PUBLISHED | CLOSED"
        enum mode "IDENTIFIED | ANONYMOUS"
        string targetDepartment "Nullable for Sprint 2"
        datetime closesAt "Nullable for Sprint 2"
        string ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    Question {
        string id PK
        string surveyId FK
        string text
        enum type "SINGLE_CHOICE | RATING | MULTIPLE_CHOICE | SHORT_TEXT"
        int orderIndex
        boolean required
        datetime createdAt
    }

    ChoiceOption {
        string id PK
        string questionId FK
        string text
        int orderIndex
    }

    SurveyParticipation {
        string id PK
        string surveyId FK
        string userId FK
        datetime participatedAt
    }

    Response {
        string id PK
        string surveyId FK
        string respondentId FK "Nullable for ANONYMOUS mode"
        datetime submittedAt
    }

    Answer {
        string id PK
        string responseId FK
        string questionId FK
        string optionId FK "Nullable for RATING / text"
        int ratingValue "Nullable for choices / text (1..5)"
        string textValue "Nullable for future text"
    }
```

---

### 1.4 Complete Prisma Schema (`server/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  OWNER
  RESPONDENT
}

enum SurveyStatus {
  DRAFT
  PUBLISHED
  CLOSED
}

enum SurveyMode {
  IDENTIFIED
  ANONYMOUS
}

enum QuestionType {
  SINGLE_CHOICE
  RATING
  MULTIPLE_CHOICE
  SHORT_TEXT
}

model User {
  id             String                @id @default(cuid())
  email          String                @unique
  passwordHash   String
  name           String
  role           Role
  department     String                @default("GENERAL")
  isActive       Boolean               @default(true)
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt

  sessions       Session[]
  surveys        Survey[]              @relation("OwnerSurveys")
  participations SurveyParticipation[]
  responses      Response[]            @relation("RespondentResponses")

  @@index([email])
}

model Session {
  id        String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}

model Survey {
  id               String                @id @default(cuid())
  title            String
  description      String?
  status           SurveyStatus          @default(DRAFT)
  mode             SurveyMode            @default(IDENTIFIED)
  targetDepartment String?
  closesAt         DateTime?
  ownerId          String
  owner            User                  @relation("OwnerSurveys", fields: [ownerId], references: [id], onDelete: Cascade)
  createdAt        DateTime              @default(now())
  updatedAt        DateTime              @updatedAt

  questions        Question[]
  participations   SurveyParticipation[]
  responses        Response[]

  @@index([ownerId])
  @@index([status])
}

model Question {
  id         String         @id @default(cuid())
  surveyId   String
  survey     Survey         @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  text       String
  type       QuestionType
  orderIndex Int            @default(0)
  required   Boolean        @default(true)
  createdAt  DateTime       @default(now())

  options    ChoiceOption[]
  answers    Answer[]

  @@index([surveyId])
}

model ChoiceOption {
  id         String   @id @default(cuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  text       String
  orderIndex Int      @default(0)

  answers    Answer[]

  @@index([questionId])
}

model SurveyParticipation {
  id             String   @id @default(cuid())
  surveyId       String
  userId         String
  participatedAt DateTime @default(now())

  survey         Survey   @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([surveyId, userId])
  @@index([surveyId])
  @@index([userId])
}

model Response {
  id           String    @id @default(cuid())
  surveyId     String
  respondentId String?
  submittedAt  DateTime  @default(now())

  survey       Survey    @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  respondent   User?     @relation("RespondentResponses", fields: [respondentId], references: [id], onDelete: SetNull)
  answers      Answer[]

  @@index([surveyId])
  @@index([respondentId])
}

model Answer {
  id          String        @id @default(cuid())
  responseId  String
  questionId  String
  optionId    String?
  ratingValue Int?
  textValue   String?

  response    Response      @relation(fields: [responseId], references: [id], onDelete: Cascade)
  question    Question      @relation(fields: [questionId], references: [id], onDelete: Cascade)
  option      ChoiceOption? @relation(fields: [optionId], references: [id], onDelete: SetNull)

  @@unique([responseId, questionId])
  @@index([responseId])
  @@index([questionId])
}
```

---

## 2. UI, API and Access Conventions

### 2.1 Main Screens, Navigation & Shared UI Behavior
The frontend application (`client/`) enforces consistent navigation and state handling across all views:

| Screen / Route | Target Role | Primary UI Purpose & Navigation | Loading, Empty, Validation & Error State Behavior |
| :--- | :---: | :--- | :--- |
| **Login View**<br>`/login` | Public / Unauthenticated | Email and password login form. Redirects authenticated `OWNER` to `/owner/surveys` and `RESPONDENT` to `/surveys`. | - **Validation:** Client checks non-empty email/password before dispatch.<br>- **Loading:** Disables submit button while awaiting `POST /api/auth/login`.<br>- **Error:** Renders a banner (`role="alert"`) on `400`/`401` responses. |
| **Owner Dashboard**<br>`/owner/surveys` | `OWNER` | Lists surveys created by the logged-in owner with status badges (`DRAFT`, `PUBLISHED`, `CLOSED`), response counts, and actions to Create, Publish, Close, or View Summary. | - **Loading:** Displays loading indicator while fetching `GET /api/surveys`.<br>- **Empty:** Displays an empty-state callout with a link to create the first survey when 0 surveys exist.<br>- **Error:** Displays actionable error banner on `403`/`409` state transition failures. |
| **Survey Builder**<br>`/owner/surveys/new` | `OWNER` | Dynamic form to author survey `title`, `description`, `mode`, and `1..50` questions (`SINGLE_CHOICE` with 2–10 options or `RATING` 1–5, plus `required` flag). | - **Validation:** Validates title length, question text, and option counts (`2..10`); maps server `details[].field` dot-paths (`questions.0.options`) to inline alerts. |
| **Owner Summary View**<br>`/owner/surveys/:id/summary` | `OWNER` (Survey Owner) | Displays `totalResponses`, option counts and percentages for `SINGLE_CHOICE`, and `averageRating` (2 decimals) plus 1–5 distribution for `RATING`. | - **Empty (0 Responses):** Renders `totalResponses: 0`, `0%` option bars, and `"No ratings yet (0.00)"` without division-by-zero errors (`AC-31`).<br>- **Error:** Displays `403 Forbidden` message if accessed by non-owner. |
| **Respondent Survey List**<br>`/surveys` | `RESPONDENT` | Lists all `PUBLISHED` surveys with completion badges (`Completed` vs `Not Completed`). Completed `IDENTIFIED` surveys provide a link to `/responses/:responseId`. | - **Loading:** Shows loading state while querying `GET /api/surveys`.<br>- **Empty:** Displays `"No published surveys available at this time"` when list is empty. |
| **Survey Response Form**<br>`/surveys/:id` | `RESPONDENT` | Renders radio options for `SINGLE_CHOICE` and 1–5 rating selectors for `RATING`, marking optional items (`required: false`). | - **Validation:** Highlights unanswered required questions (`400 VALIDATION_ERROR`).<br>- **Error:** Displays conflict alert on duplicate submission (`409 ALREADY_SUBMITTED`) or closed survey (`409 SURVEY_NOT_OPEN`). |
| **Own Response View**<br>`/responses/:id` | `RESPONDENT` (Submission Owner) | Read-only view displaying the respondent's submitted answers and timestamp in `IDENTIFIED` mode. | - **Error:** Renders `403 Forbidden` alert without leaking data if another respondent or owner attempts access (`BR-06`, `AC-28`, `AC-29`). |

### 2.2 Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Unauthenticated | `RESPONDENT` | Survey `OWNER` | Other `OWNER` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `/api/health` | GET | Allowed | Allowed | Allowed | Allowed |
| `/api/ready` | GET | Allowed | Allowed | Allowed | Allowed |
| `/api/auth/login` | POST | Allowed | Allowed | Allowed | Allowed |
| `/api/auth/me` | GET | `401 Unauthorized` | Allowed | Allowed | Allowed |
| `/api/auth/logout` | POST | `401 Unauthorized` | Allowed | Allowed | Allowed |
| `/api/surveys` | GET | `401 Unauthorized` | Allowed (`PUBLISHED` only) | Allowed (Own only) | Allowed (Own only) |
| `/api/surveys` | POST | `401 Unauthorized` | `403 Forbidden` | Allowed (`DRAFT`) | Allowed (`DRAFT`) |
| `/api/surveys/:id` | GET | `401 Unauthorized` | Allowed (`PUBLISHED`/`CLOSED`) | Allowed (Own only) | `403 Forbidden` |
| `/api/surveys/:id/publish` | POST | `401 Unauthorized` | `403 Forbidden` | Allowed (Own only) | `403 Forbidden` |
| `/api/surveys/:id/close` | POST | `401 Unauthorized` | `403 Forbidden` | Allowed (Own only) | `403 Forbidden` |
| `/api/surveys/:id/responses` | POST | `401 Unauthorized` | Allowed (Atomic Tx) | `403 Forbidden` | `403 Forbidden` |
| `/api/responses/:id` | GET | `401 Unauthorized` | Allowed (Own only) | `403 Forbidden` | `403 Forbidden` |
| `/api/surveys/:id/summary` | GET | `401 Unauthorized` | `403 Forbidden` | Allowed (Own only) | `403 Forbidden` |

### 2.3 Standard Error Response Shape
All API errors return a standard JSON structure adhering to `NFR-04` and never leak internal stack traces:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ข้อมูลคำขอไม่ถูกต้อง",
    "details": [
      {
        "field": "questions.0.options",
        "message": "คำถามแบบตัวเลือกเดียวต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก"
      }
    ]
  }
}
```

### 2.4 Credential Handling, Password Hashing & Session Lifecycle
1. **Password Hashing:** User passwords are never stored or logged in plaintext. During seeding (`prisma/seed.ts`) and authentication (`POST /api/auth/login`), passwords are hashed and verified using `bcryptjs` with `10` salt rounds (`$2a$` / `$2b$` prefix).
2. **Session Creation & Expiry:** Upon valid login, the server generates a cryptographically random UUID session record in the database `Session` table with a 24-hour TTL (`expiresAt = now + 24h`) and issues an `HttpOnly; SameSite=Lax; Path=/` cookie named `pollipop_sid`.
3. **Current-User Retrieval & Cache Prevention:** Every protected endpoint invokes `requireAuth`, which looks up `pollipop_sid` in the `Session` table, verifies `expiresAt > now`, attaches `req.user` (excluding `passwordHash`), and sets `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate` and `Pragma: no-cache`.
4. **Logout & Back-Button Protection:** `POST /api/auth/logout` deletes the session row from the database and clears the `pollipop_sid` cookie. On the client, a global `window.addEventListener('pageshow', ...)` listener re-verifies session state with `GET /api/auth/me` on browser history navigation (`event.persisted` or back/forward traversal) and immediately redirects to `/login` if unauthenticated (`AC-38`).

---

## 3. Configuration and Delivery Design (Lab 5 Alignment)

### 3.1 Environment Variables & Secret Hygiene
All runtime configuration is injected via environment variables. Real credentials and `.env` files are excluded via `.gitignore`; only synthetic examples are committed in `.env.example`:

| Variable Name | Layer | Default / Example Value | Purpose & Secret Handling |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | `server/` | `postgresql://postgres:postgres@localhost:5432/pollipop?schema=public` (or `file:./dev.db` for local SQLite test runner) | Prisma database connection string. Injected via Cloud Run environment / Secret Manager in Lab 5. |
| `PORT` | `server/` | `3000` (`8080` on Cloud Run) | HTTP listening port for the Express server. |
| `CORS_ORIGIN` | `server/` | `http://localhost:5173` | Allowed frontend origin(s) for credentialed CORS requests. |
| `DEMO_USER_PASSWORD` | `server/prisma/` | `Passw0rd123!` (local synthetic fallback) | Password hashed by `prisma/seed.ts` when provisioning the 4 demo accounts (`A-08`). Required explicitly in production. |

### 3.2 Planned Docker & Google Cloud Platform (GCP) Deployment Components
1. **Container Packaging:** Multi-stage `Dockerfile` building the React Vite client (`client/dist`) and TypeScript Express server (`server/dist`), served as a unified container or tiered service.
2. **Compute Engine:** Hosted on **Google Cloud Run** (`asia-southeast1`) with stateless container instances backed by database sessions (`Session` table) so logins survive container restarts.
3. **Database:** Managed **Google Cloud SQL for PostgreSQL 16**, connected via Cloud SQL Auth Proxy / Unix socket.
4. **Automated Migrations & Idempotent Seed:** Executed during deployment via `npx prisma migrate deploy && npx tsx prisma/seed.ts` (`prisma.user.upsert`).
5. **Observability:** `/api/health` (liveness) and `/api/ready` (`SELECT 1` database readiness) serve as Cloud Run health probes and Lab 5 smoke test endpoints.
