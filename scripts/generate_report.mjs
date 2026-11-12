import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const ASSET_DIR = path.join(DOCS_DIR, 'report_assets');

// Helper to encode image to base64 data URI
function getBase64Image(filename) {
  const filePath = path.join(ASSET_DIR, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

const img01 = getBase64Image('01_login_page.png');
const img02 = getBase64Image('02_owner_dashboard.png');
const img03 = getBase64Image('03_create_survey_form.png');
const img04 = getBase64Image('04_respondent_survey_list.png');
const img05 = getBase64Image('05_take_survey_page.png');
const img06 = getBase64Image('06_view_own_response.png');
const img07 = getBase64Image('07_duplicate_rejection.png');
const img08 = getBase64Image('08_owner_summary_dashboard.png');
const img09 = getBase64Image('09_back_button_protection.png');

console.log('Images loaded. Generating HTML report...');

const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>CPE 334 Deliverable 1 Report — Pollipop</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
        font-family: 'DM Sans', sans-serif;
        font-size: 9pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Prompt', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    h1, h2, h3, h4 {
      font-family: 'DM Sans', 'Prompt', sans-serif;
      color: #0f172a;
      font-weight: 700;
      margin-top: 1.4rem;
      margin-bottom: 0.5rem;
      page-break-after: avoid;
    }

    h1 {
      font-size: 20pt;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.4rem;
      margin-top: 0;
      color: #1e3a8a;
    }

    h2 {
      font-size: 14pt;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 0.25rem;
      color: #2563eb;
      margin-top: 1.8rem;
    }

    h3 {
      font-size: 11.5pt;
      color: #334155;
      margin-top: 1.1rem;
    }

    p, li {
      color: #334155;
      margin-top: 0.3rem;
      margin-bottom: 0.5rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.8rem 0 1.2rem 0;
      font-size: 8.5pt;
      page-break-inside: auto;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 5.5px 8px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 600;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    code, pre {
      font-family: 'JetBrains Mono', Consolas, monospace;
    }

    code {
      font-size: 8.5pt;
      background: #f1f5f9;
      padding: 1.5px 4px;
      border-radius: 3px;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }

    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 8pt;
      line-height: 1.45;
      overflow-x: auto;
      page-break-inside: avoid;
      margin: 0.6rem 0;
    }

    pre code {
      background: transparent;
      padding: 0;
      color: inherit;
      border: none;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-pass {
      background-color: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    .badge-draft {
      background-color: #fef3c7;
      color: #b45309;
      border: 1px solid #fcd34d;
    }
    .badge-published {
      background-color: #e0e7ff;
      color: #4338ca;
      border: 1px solid #a5b4fc;
    }

    .cover {
      page-break-after: always;
      padding: 2.5rem 0 0 0;
    }

    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 0.4rem;
      line-height: 1.2;
    }

    .cover-subtitle {
      font-size: 15pt;
      color: #475569;
      margin-bottom: 1.8rem;
    }

    .meta-box {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 18px 22px;
      margin-bottom: 2rem;
      font-size: 9.5pt;
    }

    .meta-box table {
      margin: 0;
      border: none;
      font-size: 9.5pt;
    }

    .meta-box td {
      border: none;
      padding: 4px 6px;
      background: transparent !important;
    }

    .meta-box td:first-child {
      font-weight: 600;
      color: #334155;
      width: 220px;
    }

    .page-break {
      page-break-before: always;
    }

    .figure-container {
      margin: 1rem 0 1.4rem 0;
      page-break-inside: avoid;
      text-align: center;
    }

    .figure-img {
      max-width: 100%;
      height: auto;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .figure-caption {
      font-size: 8.5pt;
      color: #475569;
      margin-top: 5px;
      text-align: center;
      font-weight: 500;
    }

    .section-banner {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 8px 14px;
      margin: 1.2rem 0;
      font-size: 9pt;
      color: #1e40af;
    }
  </style>
</head>
<body>

  <!-- ===================================================================== -->
  <!-- COVER & METADATA -->
  <!-- ===================================================================== -->
  <div class="cover">
    <div style="font-size: 12pt; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
      KMUTT | Department of Computer Engineering
    </div>
    <div style="font-size: 11pt; color: #64748b; margin-bottom: 1.5rem;">
      CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)
    </div>

    <div class="cover-title">
      Pollipop
    </div>
    <div class="cover-subtitle">
      University Review, Feedback, and Survey System<br>
      <span style="font-size: 12pt; color: #2563eb; font-weight: 600;">Project Deliverable 1: Engineering Baseline and Working Sprint 1</span>
    </div>

    <div class="meta-box">
      <table>
        <tr>
          <td>Course & Term:</td>
          <td>CPE 334 (Semester 1/2026) | Due: 8 November 2026, 23:59 (80 Points / 8% Grade)</td>
        </tr>
        <tr>
          <td>Assigned Theme:</td>
          <td>Theme 10: Review, Feedback, and Survey System</td>
        </tr>
        <tr>
          <td>GitHub Repository:</td>
          <td><code>https://github.com/phatthidawadi/pollipop</code> (Public per R-12)</td>
        </tr>
        <tr>
          <td>Submitted Release Branch:</td>
          <td><code>sprint-1-staging</code> (Commit <code>f377e5e</code> / Tag <code>v1.0.0-sprint1</code>)</td>
        </tr>
        <tr>
          <td>Student 1 (Author / Lead):</td>
          <td>ภัทร์ธิดาวดี อุ่นคำ (Phatthidawadi Aunkham) — Student ID: <strong>67070505225</strong> (GitHub: <code>@phatthidawadi</code>)</td>
        </tr>
        <tr>
          <td>Student 2 (Author / Lead):</td>
          <td>ปทิตญา แก้ววิเชียร (Patitaya Kaewwichian) — Student ID: <strong>67070505220</strong> (GitHub: <code>@lmaybelgracel</code>)</td>
        </tr>
      </table>
    </div>

    <h2>Master Evidence Index & Navigation Table (Protocol Section 4.3)</h2>
    <p>This master navigation index outlines all engineering artifacts and verification evidence required under the CPE 334 Deliverable 1 Protocol (Parts A through F):</p>

    <table>
      <thead>
        <tr>
          <th style="width: 10%;">Part</th>
          <th style="width: 25%;">Heading / Requirement Scope</th>
          <th style="width: 22%;">Associated Stable IDs</th>
          <th style="width: 43%;">Artifact Source & Execution Evidence Location</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Part A</strong></td>
          <td>Software Requirements Specification (SRS)</td>
          <td>FR-01..16, BR-01..13, NFR-01..05</td>
          <td><code>docs/srs.md</code> (Complete product scope, actors, decisions)</td>
        </tr>
        <tr>
          <td><strong>Part B</strong></td>
          <td>Feature Inventory & Traceability Matrix</td>
          <td>S-01, F-01..F-09</td>
          <td><code>docs/features.md</code>, <code>docs/traceability.md</code> (Full requirements mapping)</td>
        </tr>
        <tr>
          <td><strong>Part C</strong></td>
          <td>System-Level Software Design Specification (SDS)</td>
          <td>Three-Tier Architecture, ERD</td>
          <td><code>docs/system-sds.md</code> (Stack, ERD, Security, Role Matrix, GCP Plan)</td>
        </tr>
        <tr>
          <td><strong>Part D</strong></td>
          <td>Three-Sprint Plan & Pair Allocation</td>
          <td>Sprints 1, 2, 3</td>
          <td><code>docs/sprints/plan.md</code> (Vertical slice rationale, 10 balanced issues)</td>
        </tr>
        <tr>
          <td><strong>Part E</strong></td>
          <td>Sprint 1 Master Engineering Contracts</td>
          <td>AC-01..38, TEST-01..40</td>
          <td><code>docs/sprints/sprint-1/contracts.md</code> (Feature design, STS, DoD)</td>
        </tr>
        <tr>
          <td><strong>Part F</strong></td>
          <td>Working Sprint 1 Verification & Evidence</td>
          <td>46 Tests (100% Pass)</td>
          <td><code>docs/sprints/sprint-1/verification.md</code> (Screenshots, logs, PR reviews)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ===================================================================== -->
  <!-- PART A: SRS -->
  <!-- ===================================================================== -->
  <div class="page-break"></div>
  <h1>Part A: Software Requirements Specification (SRS)</h1>
  <div class="section-banner">
    <strong>Suggested Artifact:</strong> <code>docs/srs.md</code> | <strong>Weight:</strong> 10 Points | Demonstrates: Stakeholders, Context, Actors, Product Scope, Numbered FR/BR/NFR, Assumptions & Decisions.
  </div>

  <h2>1. Stakeholder Problem & System Context</h2>
  <h3>1.1 Stakeholder Problem</h3>
  <p>Within university environments, academic departments, course instructors, administrative officers, and student club coordinators (Survey Owners) routinely conduct evaluations regarding course delivery, campus dining, library resources, and university Wi-Fi infrastructure. Existing paper forms or off-the-shelf consumer tools have three fundamental engineering failures:</p>
  <ul>
    <li><strong>Uncontrolled Duplicate Submissions & Identity Leakage:</strong> Generic tools cannot reliably enforce single-submission limits without exposing respondent identities in evaluation results.</li>
    <li><strong>Absence of Role-Based & Institutional Access Control:</strong> Consumer tools lack institutional boundary enforcement. One instructor can accidentally view or alter another instructor's evaluations.</li>
    <li><strong>Data Corruption from Post-Publish Alterations:</strong> Permitting survey questions or options to be edited after responses have arrived invalidates historical submissions and corrupts aggregate metrics.</li>
  </ul>

  <h3>1.2 Chosen Domain Context: Pollipop</h3>
  <p><strong>Pollipop</strong> is a cloud-ready, three-tier web application specifically engineered for university course evaluations and campus feedback. The system manages the entire survey lifecycle: structured survey authoring (Single Choice 2–10 options, Rating 1–5), survey state progression (<code>DRAFT</code> &rarr; <code>PUBLISHED</code> &rarr; <code>CLOSED</code>), authenticated single-submission response collection inside atomic database transactions, and real-time server-side aggregate calculation.</p>

  <h2>2. Actors and Responsibilities</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Actor / Role</th>
        <th style="width: 15%;">Role Code</th>
        <th style="width: 35%;">Allowed Operations</th>
        <th style="width: 30%;">Explicitly Forbidden Operations</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Survey Owner</strong><br>(Instructor / Staff)</td>
        <td><code>OWNER</code></td>
        <td>
          - Create surveys in <code>DRAFT</code> status.<br>
          - Transition survey state to <code>PUBLISHED</code> or <code>CLOSED</code>.<br>
          - Inspect real-time server-computed aggregate summaries of own surveys.
        </td>
        <td>
          - <strong>Forbidden:</strong> Accessing or altering surveys owned by other owners (<code>403 Forbidden</code>).<br>
          - <strong>Forbidden:</strong> Submitting responses to any survey (<code>403 Forbidden</code>).
        </td>
      </tr>
      <tr>
        <td><strong>Survey Respondent</strong><br>(Student / Campus Member)</td>
        <td><code>RESPONDENT</code></td>
        <td>
          - View open (<code>PUBLISHED</code>) surveys with completion status.<br>
          - Submit a validated response exactly once per survey.<br>
          - Review own submitted answers in <code>IDENTIFIED</code> mode.
        </td>
        <td>
          - <strong>Forbidden:</strong> Creating, publishing, or closing surveys (<code>403 Forbidden</code>).<br>
          - <strong>Forbidden:</strong> Viewing <code>DRAFT</code> surveys (<code>404 Not Found</code>).<br>
          - <strong>Forbidden:</strong> Viewing aggregate summary analytics (<code>403 Forbidden</code>).<br>
          - <strong>Forbidden:</strong> Viewing other students' answers (<code>403 Forbidden</code>).
        </td>
      </tr>
    </tbody>
  </table>

  <h2>3. Numbered Functional Requirements (FR)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 12%;">FR ID</th>
        <th style="width: 73%;">Observable Requirement Behavior</th>
        <th style="width: 15%;">Sprint</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>FR-01</strong></td><td><strong>User Login & Session Creation:</strong> Authenticate via email/password, verify bcrypt hash, set HTTP-only <code>pollipop_sid</code> cookie.</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-02</strong></td><td><strong>Current User Profile & Logout:</strong> Retrieve profile (<code>GET /api/auth/me</code>) and destroy session (<code>POST /api/auth/logout</code>) with cache invalidation.</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-03</strong></td><td><strong>Health & Readiness Probes:</strong> <code>GET /api/health</code> (liveness) and <code>GET /api/ready</code> (readiness with database <code>SELECT 1</code>).</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-04</strong></td><td><strong>Create Draft Survey:</strong> <code>OWNER</code> creates survey with title, description, mode (<code>IDENTIFIED</code>), and questions in <code>DRAFT</code> status.</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-05</strong></td><td><strong>Sprint 1 Question Types:</strong> Accept <code>SINGLE_CHOICE</code> (2–10 options) and <code>RATING</code> (1–5) questions with <code>required</code> flag.</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-06</strong></td><td><strong>Publish Survey:</strong> <code>OWNER</code> transitions survey from <code>DRAFT</code> to <code>PUBLISHED</code> (making it active for respondents).</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-07</strong></td><td><strong>List Surveys by Role:</strong> <code>OWNER</code> sees own surveys; <code>RESPONDENT</code> sees <code>PUBLISHED</code> surveys with <code>answered</code> and <code>responseId</code>.</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-08</strong></td><td><strong>Submit Validated Response:</strong> <code>RESPONDENT</code> submits answers inside an atomic database transaction.</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-09</strong></td><td><strong>View Own Submitted Response:</strong> In <code>IDENTIFIED</code> mode, <code>RESPONDENT</code> inspects submitted answers via <code>GET /api/responses/:id</code>.</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-10</strong></td><td><strong>View Survey Aggregate Summary:</strong> <code>OWNER</code> retrieves server-calculated statistics (counts, percentages, mean rating).</td><td>Sprint 1</td></tr>
      <tr><td><strong>FR-11</strong></td><td><strong>Edit Draft Survey:</strong> <code>OWNER</code> updates title, description, or questions while in <code>DRAFT</code> status.</td><td>Sprint 2</td></tr>
      <tr><td><strong>FR-12</strong></td><td><strong>Close Survey & Expiration:</strong> Manual close (<code>POST /api/surveys/:id/close</code>) or scheduled closing (<code>closesAt</code>).</td><td>Sprint 1 / 2</td></tr>
      <tr><td><strong>FR-13</strong></td><td><strong>Anonymous Survey Mode:</strong> Decouple participation tracking from answer storage (<code>respondentId = null</code>).</td><td>Sprint 2</td></tr>
      <tr><td><strong>FR-14</strong></td><td><strong>Department Eligibility:</strong> Restrict survey answering to students matching <code>targetDepartment</code>.</td><td>Sprint 2</td></tr>
      <tr><td><strong>FR-15</strong></td><td><strong>Extended Question Types:</strong> Multi-select (<code>MULTIPLE_CHOICE</code>) and open feedback (<code>SHORT_TEXT</code>).</td><td>Sprint 2</td></tr>
      <tr><td><strong>FR-16</strong></td><td><strong>Export Survey Results:</strong> Download summary analytics and anonymized responses as CSV files.</td><td>Sprint 3</td></tr>
    </tbody>
  </table>

  <h2>4. Numbered Business Rules (BR)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 12%;">BR ID</th>
        <th style="width: 68%;">Domain Rule Description</th>
        <th style="width: 20%;">Enforced Layer</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>BR-01</strong></td><td><strong>Single Submission per Respondent:</strong> Duplicate attempts return <code>409 Conflict (ALREADY_SUBMITTED)</code> backed by DB unique constraint <code>(surveyId, userId)</code> on <code>SurveyParticipation</code>.</td><td>Application & DB</td></tr>
      <tr><td><strong>BR-02</strong></td><td><strong>Responses Allowed Only on Published Surveys:</strong> Answering <code>DRAFT</code> returns <code>404 Not Found</code>; answering <code>CLOSED</code> returns <code>409 Conflict (SURVEY_NOT_OPEN)</code>.</td><td>Application</td></tr>
      <tr><td><strong>BR-03</strong></td><td><strong>One-Way Survey Lifecycle State Machine:</strong> States progress <code>DRAFT</code> &rarr; <code>PUBLISHED</code> &rarr; <code>CLOSED</code>. Reversing state returns <code>409 Conflict (INVALID_STATE_TRANSITION)</code>.</td><td>Application</td></tr>
      <tr><td><strong>BR-04</strong></td><td><strong>Survey Ownership Isolation:</strong> <code>OWNER</code> cannot access, edit, publish, close, or inspect summaries of surveys owned by others (<code>403 Forbidden</code>).</td><td>Application</td></tr>
      <tr><td><strong>BR-05</strong></td><td><strong>Role Segregation:</strong> <code>RESPONDENT</code> cannot author/publish surveys or view summaries; <code>OWNER</code> cannot submit responses (<code>403 Forbidden</code>).</td><td>Application</td></tr>
      <tr><td><strong>BR-06</strong></td><td><strong>Cross-Response Privacy:</strong> <code>RESPONDENT</code> can only view own submitted answers; inspecting another user's answers returns <code>403 Forbidden</code>.</td><td>Application</td></tr>
      <tr><td><strong>BR-07</strong></td><td><strong>Draft Survey Visibility Restriction:</strong> <code>RESPONDENT</code> cannot view or retrieve <code>DRAFT</code> surveys (<code>404 Not Found</code>).</td><td>Application</td></tr>
      <tr><td><strong>BR-08</strong></td><td><strong>Question & Option Structural Constraints:</strong> Survey must have 1–50 questions. <code>SINGLE_CHOICE</code> must have 2–10 non-empty options.</td><td>Application</td></tr>
      <tr><td><strong>BR-09</strong></td><td><strong>Answer Completeness & Validity:</strong> Required questions must be answered. Options must belong to the question. Rating must be 1–5. Optional questions may be omitted.</td><td>Application & DB</td></tr>
      <tr><td><strong>BR-10</strong></td><td><strong>Server-Side Aggregate Accuracy:</strong> Statistics computed server-side to 2 decimal places. Handles zero responses without division by zero.</td><td>Application</td></tr>
      <tr><td><strong>BR-11</strong></td><td><strong>Immutability After Publication:</strong> Modifying questions/options after publication is forbidden (<code>409 Conflict</code>).</td><td>Application</td></tr>
      <tr><td><strong>BR-12</strong></td><td><strong>Sprint 1 Baseline Eligibility:</strong> All authenticated students can answer any published survey.</td><td>Application</td></tr>
      <tr><td><strong>BR-13</strong></td><td><strong>True Anonymity Separation:</strong> In <code>ANONYMOUS</code> mode, <code>Response.respondentId</code> is strictly <code>null</code>.</td><td>Application & DB</td></tr>
    </tbody>
  </table>

  <h2>5. Numbered Non-Functional Requirements (NFR)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 12%;">NFR ID</th>
        <th style="width: 20%;">Category</th>
        <th style="width: 40%;">Measurable Target</th>
        <th style="width: 28%;">Practical Verification Method</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>NFR-01</strong></td><td>Security & Cache Guard</td><td>Unauthenticated requests rejected with <code>401</code> 100% of the time. <code>Cache-Control: no-store</code> on protected endpoints. Browser back redirect to <code>/login</code> on revoked sessions.</td><td>Supertest API integration + Playwright E2E browser history test (<code>TEST-39</code>, <code>TEST-40</code>).</td></tr>
      <tr><td><strong>NFR-02</strong></td><td>Password & Secret Hygiene</td><td>Passwords hashed with bcrypt (salt rounds &ge; 10). Zero plaintext secrets in Git, logs, or client bundle.</td><td>Database seed inspection (<code>TEST-38</code>) + git index audit against <code>.env.example</code>.</td></tr>
      <tr><td><strong>NFR-03</strong></td><td>Data Integrity & Concurrency</td><td>Concurrent duplicate submissions result in exactly one <code>201 Created</code> and one <code>409 Conflict</code> with atomic rollback.</td><td>Database unique constraint + <code>Promise.all</code> concurrent test (<code>TEST-37</code>).</td></tr>
      <tr><td><strong>NFR-04</strong></td><td>Validation & Error Standard</td><td>Zod schema validation returning structured <code>400 Bad Request</code> with dot-path notation and sanitized messages.</td><td>Zod unit tests & Supertest invalid payload tests (<code>TEST-03</code>, <code>TEST-11</code>, <code>TEST-24</code>).</td></tr>
      <tr><td><strong>NFR-05</strong></td><td>Cloud-Readiness</td><td>All configurations read from environment. Probes <code>/api/health</code> & <code>/api/ready</code> respond in &lt; 500 ms. Sessions survive restarts.</td><td>Supertest health probe tests (<code>TEST-07</code>, <code>TEST-08</code>) + Docker packaging.</td></tr>
    </tbody>
  </table>

  <!-- ===================================================================== -->
  <!-- PART B: FEATURE INVENTORY & TRACEABILITY -->
  <!-- ===================================================================== -->
  <div class="page-break"></div>
  <h1>Part B: Feature Inventory & Requirements Traceability Matrix</h1>
  <div class="section-banner">
    <strong>Suggested Artifacts:</strong> <code>docs/features.md</code> & <code>docs/traceability.md</code> | <strong>Weight:</strong> 10 Points | Demonstrates: 3-Sprint Feature Breakdown, Dependencies, and Bidirectional Traceability.
  </div>

  <h2>1. Three-Sprint Feature Inventory</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 12%;">Feature ID</th>
        <th style="width: 43%;">Feature Scope & Description</th>
        <th style="width: 25%;">Associated Requirements</th>
        <th style="width: 20%;">Sprint</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>S-01</strong></td><td><strong>System Foundation:</strong> Express API + React Vite SPA + Prisma PostgreSQL, env configuration, idempotent seed, probes <code>/api/health</code> & <code>/api/ready</code>.</td><td>FR-03, NFR-02, NFR-05, A-01, A-08</td><td><strong>Sprint 1</strong></td></tr>
      <tr><td><strong>F-01</strong></td><td><strong>Authentication & Roles:</strong> Login, logout, profile retrieval, database session cookie (<code>pollipop_sid</code>), bcrypt hashing, RBAC, cache guard.</td><td>FR-01, FR-02, BR-05, NFR-01, NFR-02</td><td><strong>Sprint 1</strong></td></tr>
      <tr><td><strong>F-02</strong></td><td><strong>Survey Lifecycle:</strong> Survey creation (Single Choice & Rating), publish/close transitions, owner isolation, post-publish immutability.</td><td>FR-04..07, FR-12, BR-03, BR-04, BR-05, BR-08, BR-11</td><td><strong>Sprint 1</strong></td></tr>
      <tr><td><strong>F-03</strong></td><td><strong>Response Submission:</strong> Validated submission inside atomic transaction, duplicate blocking (409), inspection of own answers, cross-response privacy.</td><td>FR-08, FR-09, BR-01, BR-02, BR-05, BR-06, BR-09, NFR-03</td><td><strong>Sprint 1</strong></td></tr>
      <tr><td><strong>F-04</strong></td><td><strong>Summary Analytics:</strong> Real-time server-side calculation: total responses, option counts/percentages, mean rating, rating distribution.</td><td>FR-10, BR-04, BR-05, BR-10, BR-13</td><td><strong>Sprint 1</strong></td></tr>
      <tr><td><strong>F-05</strong></td><td><strong>Draft Survey Editing:</strong> Update titles, questions, options, or delete surveys while in <code>DRAFT</code> status.</td><td>FR-11, BR-03, BR-04, BR-11</td><td>Sprint 2</td></tr>
      <tr><td><strong>F-06</strong></td><td><strong>Anonymous Survey Mode:</strong> Decouple participation from answers (<code>respondentId = null</code>) and scheduled expiration (<code>closesAt</code>).</td><td>FR-12, FR-13, BR-01, BR-02, BR-13</td><td>Sprint 2</td></tr>
      <tr><td><strong>F-07</strong></td><td><strong>Department Eligibility:</strong> Faculty/department restriction (<code>targetDepartment</code>) and multi-choice / text question types.</td><td>FR-14, FR-15, BR-08, BR-09, BR-10</td><td>Sprint 2</td></tr>
      <tr><td><strong>F-08</strong></td><td><strong>CSV Export & Reporting:</strong> Export aggregate summaries and raw anonymized response datasets.</td><td>FR-16, BR-04, BR-10, BR-13</td><td>Sprint 3</td></tr>
      <tr><td><strong>F-09</strong></td><td><strong>Hardening & Accessibility:</strong> WCAG compliance, edge-case failure recovery, full regression test suite.</td><td>NFR-01, NFR-03, NFR-04, NFR-05</td><td>Sprint 3</td></tr>
    </tbody>
  </table>

  <h2>2. Master Acceptance Criteria Traceability Matrix (AC-01 to AC-38)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 11%;">AC ID</th>
        <th style="width: 14%;">Feature</th>
        <th style="width: 15%;">Requirements</th>
        <th style="width: 15%;">Test ID</th>
        <th style="width: 33%;">Implementation & Test File</th>
        <th style="width: 12%;">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>AC-01</strong></td><td>F-01</td><td>FR-01, FR-02</td><td>TEST-01, 40</td><td><code>server/tests/auth.test.ts</code>, <code>e2e/sprint1.spec.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-02</strong></td><td>F-01</td><td>FR-01, NFR-02</td><td>TEST-02</td><td><code>server/tests/auth.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-03</strong></td><td>F-01</td><td>FR-01, NFR-04</td><td>TEST-03</td><td><code>server/tests/auth.test.ts</code>, <code>server/src/validation.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-04</strong></td><td>F-01</td><td>FR-01, FR-02</td><td>TEST-04</td><td><code>server/tests/auth.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-05</strong></td><td>F-01</td><td>BR-05, NFR-01</td><td>TEST-05</td><td><code>server/tests/auth.test.ts</code>, <code>server/src/auth.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-06</strong></td><td>F-01</td><td>FR-02, NFR-01</td><td>TEST-06</td><td><code>server/tests/auth.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-07</strong></td><td>S-01</td><td>NFR-01, Lab 5</td><td>TEST-07</td><td><code>server/tests/probes.test.ts</code>, <code>server/src/app.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-08</strong></td><td>S-01</td><td>NFR-01, Lab 5</td><td>TEST-08</td><td><code>server/tests/probes.test.ts</code>, <code>server/src/app.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-09</strong></td><td>F-02</td><td>FR-04, FR-05</td><td>TEST-09, 40</td><td><code>server/tests/surveys.test.ts</code>, <code>e2e/sprint1.spec.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-10</strong></td><td>F-02</td><td>BR-05</td><td>TEST-10</td><td><code>server/tests/surveys.test.ts</code>, <code>server/src/auth.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-11</strong></td><td>F-02</td><td>BR-08, NFR-04</td><td>TEST-11</td><td><code>server/tests/surveys.test.ts</code>, <code>server/src/validation.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-12</strong></td><td>F-02</td><td>FR-05, BR-08</td><td>TEST-12</td><td><code>server/tests/surveys.test.ts</code>, <code>server/src/validation.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-13</strong></td><td>F-02</td><td>FR-05, NFR-04</td><td>TEST-13</td><td><code>server/tests/surveys.test.ts</code>, <code>server/src/validation.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-14</strong></td><td>F-02</td><td>FR-06, BR-03</td><td>TEST-14, 40</td><td><code>server/tests/surveys.test.ts</code>, <code>e2e/sprint1.spec.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-15</strong></td><td>F-02</td><td>BR-03, BR-11</td><td>TEST-15</td><td><code>server/tests/surveys.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-16</strong></td><td>F-02</td><td>BR-04</td><td>TEST-16</td><td><code>server/tests/surveys.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-17</strong></td><td>F-02</td><td>FR-07, BR-04</td><td>TEST-17</td><td><code>server/tests/surveys.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-18</strong></td><td>F-02</td><td>FR-07, DEC-06</td><td>TEST-18, 40</td><td><code>server/tests/surveys.test.ts</code>, <code>e2e/sprint1.spec.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-19</strong></td><td>F-02</td><td>BR-07</td><td>TEST-19</td><td><code>server/tests/surveys.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-20</strong></td><td>F-03</td><td>FR-08, NFR-03</td><td>TEST-20, 40</td><td><code>server/tests/responses.test.ts</code>, <code>e2e/sprint1.spec.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-21</strong></td><td>F-03</td><td>BR-01, NFR-03</td><td>TEST-21, 37, 40</td><td><code>server/tests/responses.test.ts</code>, <code>e2e/sprint1.spec.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-22</strong></td><td>F-03</td><td>BR-02, BR-07</td><td>TEST-22</td><td><code>server/tests/responses.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-23</strong></td><td>F-03</td><td>BR-05</td><td>TEST-23</td><td><code>server/tests/responses.test.ts</code>, <code>server/src/auth.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-24</strong></td><td>F-03</td><td>BR-09, NFR-04</td><td>TEST-24</td><td><code>server/tests/responses.test.ts</code>, <code>server/src/validation.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-25</strong></td><td>F-03</td><td>BR-09, NFR-04</td><td>TEST-25</td><td><code>server/tests/responses.test.ts</code>, <code>server/src/validation.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-26</strong></td><td>F-03</td><td>BR-09, DEC-04</td><td>TEST-26</td><td><code>server/tests/responses.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-27</strong></td><td>F-03</td><td>FR-09</td><td>TEST-27, 40</td><td><code>server/tests/responses.test.ts</code>, <code>e2e/sprint1.spec.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-28</strong></td><td>F-03</td><td>BR-06</td><td>TEST-28</td><td><code>server/tests/responses.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-29</strong></td><td>F-03</td><td>BR-05, BR-06</td><td>TEST-29</td><td><code>server/tests/responses.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-30</strong></td><td>F-04</td><td>FR-10, BR-10</td><td>TEST-30, 40</td><td><code>server/tests/summary.test.ts</code>, <code>e2e/sprint1.spec.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-31</strong></td><td>F-04</td><td>BR-10</td><td>TEST-31</td><td><code>server/tests/summary.test.ts</code>, <code>server/src/summary.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-32</strong></td><td>F-04</td><td>BR-04</td><td>TEST-32</td><td><code>server/tests/summary.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-33</strong></td><td>F-04</td><td>BR-05</td><td>TEST-33</td><td><code>server/tests/summary.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-34</strong></td><td>F-04</td><td>BR-10</td><td>TEST-34</td><td><code>server/tests/summary.test.ts</code>, <code>server/src/summary.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-35</strong></td><td>F-02</td><td>FR-12, BR-03</td><td>TEST-35</td><td><code>server/tests/surveys.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-36</strong></td><td>F-03</td><td>FR-13, BR-13</td><td>TEST-36</td><td><code>server/tests/responses.test.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-37</strong></td><td>S-01</td><td>NFR-02, A-08</td><td>TEST-38</td><td><code>server/tests/probes.test.ts</code>, <code>server/prisma/seed.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
      <tr><td><strong>AC-38</strong></td><td>F-01</td><td>FR-02, NFR-01</td><td>TEST-39, 40</td><td><code>server/tests/auth.test.ts</code>, <code>e2e/sprint1.spec.ts</code></td><td><span class="badge badge-pass">PASS</span></td></tr>
    </tbody>
  </table>

  <!-- ===================================================================== -->
  <!-- PART C: SYSTEM-LEVEL SDS -->
  <!-- ===================================================================== -->
  <div class="page-break"></div>
  <h1>Part C: System-Level Software Design Specification (SDS)</h1>
  <div class="section-banner">
    <strong>Suggested Artifact:</strong> <code>docs/system-sds.md</code> | <strong>Weight:</strong> 15 Points | Demonstrates: Three-Tier Architecture, Data Model (ERD), Security Conventions, Role Matrix, and GCP Cloud Run Deployment Plan.
  </div>

  <h2>1. Three-Tier Architectural Design</h2>
  <p>Pollipop implements a production-grade <strong>Three-Tier Modular Architecture</strong> designed for frictionless containerization and horizontal autoscaling on Google Cloud Platform:</p>

  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Tier / Layer</th>
        <th style="width: 25%;">Technology Stack</th>
        <th style="width: 55%;">Architectural Responsibilities & Security Enforcement</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Presentation Tier</strong><br>(<code>client/</code>)</td>
        <td>React 18, Vite, TypeScript, React Router v6</td>
        <td>
          - Role-based UI rendering (<code>OWNER</code> vs <code>RESPONDENT</code>) with loading, empty, and validation states.<br>
          - Automatic credential propagation (<code>credentials: 'include'</code>).<br>
          - Browser <code>pageshow</code> history traversal interception preventing back-button cached views post-logout (<code>AC-38</code>).
        </td>
      </tr>
      <tr>
        <td><strong>Application / API Tier</strong><br>(<code>server/</code>)</td>
        <td>Node.js 24, Express, TypeScript, Zod, bcryptjs, cookie-parser</td>
        <td>
          - Database session middleware verifying <code>pollipop_sid</code> cookie against <code>Session</code> table.<br>
          - <code>Cache-Control: no-store</code> injection on all protected routes.<br>
          - Role & ownership verification enforcing <code>BR-04</code>, <code>BR-05</code>, and <code>BR-06</code>.<br>
          - Strict input validation using Zod schemas with structured dot-path error notations (<code>NFR-04</code>).
        </td>
      </tr>
      <tr>
        <td><strong>Data Persistence Tier</strong><br>(<code>server/prisma/</code>)</td>
        <td>PostgreSQL 16, Prisma ORM</td>
        <td>
          - Stores core domain models (<code>User</code>, <code>Session</code>, <code>Survey</code>, <code>Question</code>, <code>ChoiceOption</code>, <code>SurveyParticipation</code>, <code>Response</code>, <code>Answer</code>).<br>
          - Multi-table response submission coordinated inside atomic database transactions (<code>prisma.$transaction</code>).<br>
          - Unique constraint <code>@@unique([surveyId, userId])</code> on <code>SurveyParticipation</code> preventing race-condition duplicates (<code>BR-01</code>, <code>NFR-03</code>).
        </td>
      </tr>
    </tbody>
  </table>

  <h2>2. Data Model & Entity-Relationship Design (ERD)</h2>
  <p>A critical architectural achievement in Pollipop is the decoupling of participation tracking (<code>SurveyParticipation</code>) from answer data storage (<code>Response</code>). This design guarantees that duplicate submissions are strictly rejected at the database level in Sprint 1, while providing an effortless foundation for true anonymous surveys (<code>Response.respondentId = null</code>) in Sprint 2 without modifying constraints.</p>

  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Entity</th>
        <th style="width: 32%;">Key Attributes</th>
        <th style="width: 50%;">Relationships & Critical Database Constraints</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><code>User</code></td><td><code>id</code>, <code>email</code> (unique), <code>passwordHash</code>, <code>role</code>, <code>name</code>, <code>department</code></td><td>1:N with <code>Session</code>, 1:N with <code>Survey</code> (as owner), 1:N with <code>SurveyParticipation</code>.</td></tr>
      <tr><td><code>Session</code></td><td><code>id</code>, <code>userId</code>, <code>expiresAt</code>, <code>createdAt</code></td><td>N:1 with <code>User</code> (Cascade delete on logout). Stores HTTP-only session tokens.</td></tr>
      <tr><td><code>Survey</code></td><td><code>id</code>, <code>title</code>, <code>description</code>, <code>status</code> (DRAFT/PUBLISHED/CLOSED), <code>mode</code>, <code>ownerId</code></td><td>N:1 with <code>User</code> (owner). 1:N with <code>Question</code>, 1:N with <code>SurveyParticipation</code>, 1:N with <code>Response</code>.</td></tr>
      <tr><td><code>Question</code></td><td><code>id</code>, <code>surveyId</code>, <code>orderIdx</code>, <code>text</code>, <code>type</code> (SINGLE_CHOICE/RATING), <code>required</code></td><td>N:1 with <code>Survey</code>. 1:N with <code>ChoiceOption</code>. 1:N with <code>Answer</code>.</td></tr>
      <tr><td><code>ChoiceOption</code></td><td><code>id</code>, <code>questionId</code>, <code>orderIdx</code>, <code>text</code></td><td>N:1 with <code>Question</code>. 1:N with <code>Answer</code>. (2–10 choices for single-choice questions).</td></tr>
      <tr><td><code>SurveyParticipation</code></td><td><code>id</code>, <code>surveyId</code>, <code>userId</code>, <code>createdAt</code></td><td><strong>Constraint:</strong> <code>@@unique([surveyId, userId])</code>. Enforces single submission at DB level.</td></tr>
      <tr><td><code>Response</code></td><td><code>id</code>, <code>surveyId</code>, <code>respondentId</code> (nullable), <code>submittedAt</code></td><td>N:1 with <code>Survey</code>. In <code>IDENTIFIED</code> mode, <code>respondentId</code> links to User; in <code>ANONYMOUS</code>, it is <code>null</code>.</td></tr>
      <tr><td><code>Answer</code></td><td><code>id</code>, <code>responseId</code>, <code>questionId</code>, <code>optionId</code> (nullable), <code>ratingValue</code> (nullable)</td><td>N:1 with <code>Response</code>, N:1 with <code>Question</code>. Nullable fields support optional questions cleanly.</td></tr>
    </tbody>
  </table>

  <h2>3. Role-Based Access Control Matrix</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 32%;">Endpoint & Method</th>
        <th style="width: 17%;">Unauthenticated</th>
        <th style="width: 17%;">Respondent</th>
        <th style="width: 17%;">Survey Owner</th>
        <th style="width: 17%;">Other Owner</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><code>POST /api/auth/login</code></td><td>Allowed</td><td>Allowed</td><td>Allowed</td><td>Allowed</td></tr>
      <tr><td><code>GET /api/auth/me</code>, <code>POST /api/auth/logout</code></td><td><code>401 Unauthorized</code></td><td>Allowed</td><td>Allowed</td><td>Allowed</td></tr>
      <tr><td><code>POST /api/surveys</code></td><td><code>401 Unauthorized</code></td><td><code>403 Forbidden</code></td><td>Allowed</td><td>Allowed</td></tr>
      <tr><td><code>POST /api/surveys/:id/publish</code>, <code>/close</code></td><td><code>401 Unauthorized</code></td><td><code>403 Forbidden</code></td><td>Allowed (Own)</td><td><code>403 Forbidden</code></td></tr>
      <tr><td><code>GET /api/surveys</code></td><td><code>401 Unauthorized</code></td><td><code>PUBLISHED</code> only</td><td>Own surveys only</td><td>Own surveys only</td></tr>
      <tr><td><code>POST /api/surveys/:id/responses</code></td><td><code>401 Unauthorized</code></td><td>Allowed (Once)</td><td><code>403 Forbidden</code></td><td><code>403 Forbidden</code></td></tr>
      <tr><td><code>GET /api/responses/:id</code></td><td><code>401 Unauthorized</code></td><td>Allowed (Own)</td><td><code>403 Forbidden</code></td><td><code>403 Forbidden</code></td></tr>
      <tr><td><code>GET /api/surveys/:id/summary</code></td><td><code>401 Unauthorized</code></td><td><code>403 Forbidden</code></td><td>Allowed (Own)</td><td><code>403 Forbidden</code></td></tr>
    </tbody>
  </table>

  <h2>4. Cloud Readiness & Deployment Architecture (Lab 5 GCP Plan)</h2>
  <p>Pollipop is pre-architected for containerized deployment on <strong>Google Cloud Platform (GCP)</strong> to satisfy Lab 5 learning outcomes:</p>
  <ul>
    <li><strong>Stateless Compute (Google Cloud Run):</strong> The application server is packaged as a lightweight Linux container. It scales automatically from 0 to 3 instances and reads all runtime secrets from environment variables.</li>
    <li><strong>Managed Persistence (Google Cloud SQL for PostgreSQL 16):</strong> User sessions and survey datasets are persisted externally. Cloud SQL survives container redeployments and restarts (<code>R-04</code>).</li>
    <li><strong>Secret Management (GCP Secret Manager):</strong> Database connection strings, session signing secrets, and demo account passwords are injected securely into Cloud Run at runtime without appearing in code, Git history, or Docker layers.</li>
    <li><strong>Automated CI/CD Quality Gate (GitHub Actions):</strong> All pull requests into <code>sprint-1-staging</code> and <code>main</code> execute unit, integration, and E2E verification pipelines before merging is permitted.</li>
  </ul>

  <!-- ===================================================================== -->
  <!-- PART D: THREE-SPRINT PLAN -->
  <!-- ===================================================================== -->
  <div class="page-break"></div>
  <h1>Part D: Three-Sprint Product Plan</h1>
  <div class="section-banner">
    <strong>Suggested Artifact:</strong> <code>docs/sprints/plan.md</code> | <strong>Weight:</strong> 5 Points | Demonstrates: Feasible Scope, Dependencies, and Balanced Pair Workflow Allocation.
  </div>

  <h2>1. Three-Sprint Roadmap Overview</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 12%;">Sprint</th>
        <th style="width: 20%;">Checkpoint</th>
        <th style="width: 35%;">Sprint Goal & Included Features</th>
        <th style="width: 33%;">Key Completion Outcome</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Sprint 1</strong></td>
        <td><strong>Deliverable 1</strong> (Nov 2026)<br>+ Lab 5 Cloud Deploy</td>
        <td><strong>Core Vertical Slice Baseline:</strong><br>Features: <code>S-01</code>, <code>F-01</code>, <code>F-02</code>, <code>F-03</code>, <code>F-04</code>.</td>
        <td>Complete vertical slice (UI &rarr; API &rarr; DB), strict RBAC, 100% automated test pass rate (46 tests), ready for Docker and GCP Cloud Run.</td>
      </tr>
      <tr>
        <td><strong>Sprint 2</strong></td>
        <td><strong>Deliverable 2</strong> (29 Nov 2026)</td>
        <td><strong>Core Expansion:</strong><br>Features: <code>F-05</code> (Draft Edit), <code>F-06</code> (Anonymous Mode & Expiration), <code>F-07</code> (Department Eligibility & Multi-Choice/Text).</td>
        <td>Owners can launch anonymous surveys restricted to specific faculties; respondents answer multi-select and open-ended feedback.</td>
      </tr>
      <tr>
        <td><strong>Sprint 3</strong></td>
        <td><strong>Final Release</strong> (13 Dec 2026)<br>+ Labs 6 & 7 UAT/Security</td>
        <td><strong>Analysis & Hardening:</strong><br>Features: <code>F-08</code> (CSV Export & Filtering), <code>F-09</code> (Accessibility, WCAG, Concurrency Hardening).</td>
        <td>Owners export CSV datasets; system passes external partner UAT (Lab 6) and performance/security audits (Lab 7).</td>
      </tr>
    </tbody>
  </table>

  <h2>2. Team Allocation & Pair Workflow (10 Issues Across 2 Collaborators)</h2>
  <p>To ensure balanced collaboration and peer review rigor, Student 1 and Student 2 alternate author and reviewer roles across all 10 Sprint 1 issues (5 issues each):</p>

  <table>
    <thead>
      <tr>
        <th style="width: 8%;">Issue</th>
        <th style="width: 36%;">Issue Title & Scope</th>
        <th style="width: 28%;">Author (Code & Tests)</th>
        <th style="width: 28%;">Reviewer (PR Review)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>#1</td><td>docs: establish SRS, feature inventory, traceability (Parts A & B)</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td></tr>
      <tr><td>#2</td><td>docs: define system SDS, 3-sprint plan, contracts (Parts C, D & E)</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td></tr>
      <tr><td>#3</td><td>feat(S-01): project scaffolding & Prisma PostgreSQL schema</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td></tr>
      <tr><td>#4</td><td>feat(S-01): implement health probes & idempotent user seed</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td></tr>
      <tr><td>#5</td><td>feat(F-01): session auth, RBAC middleware, no-store cache guard</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td></tr>
      <tr><td>#6</td><td>feat(F-02): survey creation, question validation, lifecycle state machine</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td></tr>
      <tr><td>#7</td><td>feat(F-03): atomic response submission & own response review</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td></tr>
      <tr><td>#8</td><td>feat(F-04): aggregate summary calculation & owner summary view</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td></tr>
      <tr><td>#9</td><td>feat(ui): React + Vite frontend views & pastel candy styling</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td></tr>
      <tr><td>#10</td><td>test(e2e): Playwright E2E test suite (TEST-40) & Part F verification</td><td>Student 2 (ปทิตญา แก้ววิเชียร - 67070505220)</td><td>Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225)</td></tr>
    </tbody>
  </table>

  <!-- ===================================================================== -->
  <!-- PART E: SPRINT 1 CONTRACTS -->
  <!-- ===================================================================== -->
  <div class="page-break"></div>
  <h1>Part E: Sprint 1 Master Engineering Contracts</h1>
  <div class="section-banner">
    <strong>Suggested Artifacts:</strong> <code>docs/sprints/sprint-1/contracts.md</code> & <code>specification.md</code> | <strong>Weight:</strong> 20 Points | Demonstrates: Feature Design, AC-01..38, STS TEST-01..40, and Product Definition of Done.
  </div>

  <h2>1. Software Test Specifications (STS) Table (TEST-01 to TEST-40)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 12%;">Test ID</th>
        <th style="width: 10%;">AC ID</th>
        <th style="width: 14%;">Test Level</th>
        <th style="width: 32%;">Input / Precondition</th>
        <th style="width: 32%;">Expected Observable Outcome</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>TEST-01</strong></td><td>AC-01</td><td>API Integration</td><td>Valid email and password posted to <code>/api/auth/login</code></td><td><code>200 OK</code>, sets HttpOnly <code>pollipop_sid</code>, returns user without password hash.</td></tr>
      <tr><td><strong>TEST-02</strong></td><td>AC-02</td><td>API Integration</td><td>Invalid password or unregistered email</td><td><code>401 Unauthorized</code> with error code <code>INVALID_CREDENTIALS</code>.</td></tr>
      <tr><td><strong>TEST-03</strong></td><td>AC-03</td><td>Unit & API</td><td>Malformed email or empty payload</td><td><code>400 Bad Request</code> with structured Zod <code>VALIDATION_ERROR</code>.</td></tr>
      <tr><td><strong>TEST-04</strong></td><td>AC-04</td><td>API Integration</td><td>Valid session cookie sent to <code>GET /api/auth/me</code></td><td><code>200 OK</code> with current user profile, sets <code>Cache-Control: no-store</code>.</td></tr>
      <tr><td><strong>TEST-05</strong></td><td>AC-05</td><td>API Integration</td><td>Missing or expired session cookie on protected endpoint</td><td><code>401 Unauthorized</code> without returning private data.</td></tr>
      <tr><td><strong>TEST-06</strong></td><td>AC-06</td><td>API Integration</td><td>Authenticated user calls <code>POST /api/auth/logout</code></td><td><code>200 OK</code>, deletes session from DB, subsequent calls return <code>401</code>.</td></tr>
      <tr><td><strong>TEST-07</strong></td><td>AC-07</td><td>API Integration</td><td>Call <code>GET /api/health</code></td><td><code>200 OK</code> with <code>{ "status": "ok", "service": "Pollipop API" }</code>.</td></tr>
      <tr><td><strong>TEST-08</strong></td><td>AC-08</td><td>API Integration</td><td>Call <code>GET /api/ready</code></td><td><code>200 OK</code> with <code>{ "status": "ready", "db": "connected" }</code>.</td></tr>
      <tr><td><strong>TEST-09</strong></td><td>AC-09</td><td>API Integration</td><td>Owner creates survey with single-choice and rating</td><td><code>201 Created</code>, survey stored in <code>DRAFT</code> status.</td></tr>
      <tr><td><strong>TEST-10</strong></td><td>AC-10</td><td>API Integration</td><td>Respondent role attempts <code>POST /api/surveys</code></td><td><code>403 Forbidden</code> with error code <code>FORBIDDEN</code>.</td></tr>
      <tr><td><strong>TEST-11</strong></td><td>AC-11</td><td>Unit & API</td><td>Survey payload with empty title or &gt; 50 questions</td><td><code>400 Bad Request</code> with Zod validation details.</td></tr>
      <tr><td><strong>TEST-12</strong></td><td>AC-12</td><td>Unit & API</td><td>Single-choice question with only 1 option or &gt; 10 options</td><td><code>400 Bad Request</code> (minimum 2 options required).</td></tr>
      <tr><td><strong>TEST-13</strong></td><td>AC-13</td><td>Unit</td><td>Survey payload without questions</td><td><code>400 Bad Request</code> (at least 1 question required in Sprint 1).</td></tr>
      <tr><td><strong>TEST-14</strong></td><td>AC-14</td><td>API Integration</td><td>Owner calls <code>POST /api/surveys/:id/publish</code> on own draft</td><td><code>200 OK</code>, survey transitions <code>DRAFT</code> &rarr; <code>PUBLISHED</code>.</td></tr>
      <tr><td><strong>TEST-15</strong></td><td>AC-15</td><td>API Integration</td><td>Attempt to publish an already published survey</td><td><code>409 Conflict</code> (invalid state transition).</td></tr>
      <tr><td><strong>TEST-16</strong></td><td>AC-16</td><td>API Integration</td><td>Non-owning owner attempts to publish another owner's survey</td><td><code>403 Forbidden</code> (ownership isolation).</td></tr>
      <tr><td><strong>TEST-17</strong></td><td>AC-17</td><td>API Integration</td><td>Owner calls <code>GET /api/surveys</code></td><td><code>200 OK</code>, returns strictly surveys owned by that user.</td></tr>
      <tr><td><strong>TEST-18</strong></td><td>AC-18</td><td>API Integration</td><td>Respondent calls <code>GET /api/surveys</code></td><td><code>200 OK</code>, returns only <code>PUBLISHED</code> surveys with answered status.</td></tr>
      <tr><td><strong>TEST-19</strong></td><td>AC-19</td><td>API Integration</td><td>Respondent attempts to retrieve <code>DRAFT</code> survey by ID</td><td><code>404 Not Found</code> (masks draft existence).</td></tr>
      <tr><td><strong>TEST-20</strong></td><td>AC-20</td><td>API Integration</td><td>Respondent submits valid answers to published survey</td><td><code>201 Created</code>, atomically persists participation and answers.</td></tr>
      <tr><td><strong>TEST-21</strong></td><td>AC-21</td><td>API Integration</td><td>Respondent submits answers to same survey a second time</td><td><code>409 Conflict</code> with error code <code>ALREADY_SUBMITTED</code>.</td></tr>
      <tr><td><strong>TEST-22</strong></td><td>AC-22</td><td>API Integration</td><td>Submitting response to closed survey</td><td><code>409 Conflict</code> with error code <code>SURVEY_NOT_OPEN</code>.</td></tr>
      <tr><td><strong>TEST-23</strong></td><td>AC-23</td><td>API Integration</td><td>Owner attempts <code>POST /api/surveys/:id/responses</code></td><td><code>403 Forbidden</code> (owners cannot submit responses).</td></tr>
      <tr><td><strong>TEST-24</strong></td><td>AC-24</td><td>Unit & API</td><td>Omitting answer for required question</td><td><code>400 Bad Request</code> with validation details.</td></tr>
      <tr><td><strong>TEST-25</strong></td><td>AC-25</td><td>Unit & API</td><td>Submitting rating value of 6 or non-existent optionId</td><td><code>400 Bad Request</code> (rating must be 1..5).</td></tr>
      <tr><td><strong>TEST-26</strong></td><td>AC-26</td><td>Unit & API</td><td>Submitting response omitting optional question</td><td><code>201 Created</code>, stored with null answer references.</td></tr>
      <tr><td><strong>TEST-27</strong></td><td>AC-27</td><td>API Integration</td><td>Respondent retrieves own submitted response</td><td><code>200 OK</code>, returns submitted answers and survey context.</td></tr>
      <tr><td><strong>TEST-28</strong></td><td>AC-28</td><td>API Integration</td><td>Respondent attempts to inspect another student's response</td><td><code>403 Forbidden</code> (cross-response privacy).</td></tr>
      <tr><td><strong>TEST-29</strong></td><td>AC-29</td><td>API Integration</td><td>Owner attempts direct access to respondent response</td><td><code>403 Forbidden</code> (owners view aggregates only).</td></tr>
      <tr><td><strong>TEST-30</strong></td><td>AC-30</td><td>API Integration</td><td>Owner retrieves summary of published survey with responses</td><td><code>200 OK</code>, accurate total count, percentages, and mean rating.</td></tr>
      <tr><td><strong>TEST-31</strong></td><td>AC-31</td><td>Unit & API</td><td>Owner retrieves summary of survey with 0 responses</td><td><code>200 OK</code> with totalResponses: 0 and averageRating: null cleanly.</td></tr>
      <tr><td><strong>TEST-32</strong></td><td>AC-32</td><td>API Integration</td><td>Non-owning owner requests summary of another's survey</td><td><code>403 Forbidden</code> (ownership isolation).</td></tr>
      <tr><td><strong>TEST-33</strong></td><td>AC-33</td><td>API Integration</td><td>Respondent attempts to access survey summary</td><td><code>403 Forbidden</code> (respondents cannot view analytics).</td></tr>
      <tr><td><strong>TEST-34</strong></td><td>AC-34</td><td>Unit & API</td><td>Summary calculation when respondents skip optional questions</td><td>Percentages computed based on totalAnswered per question.</td></tr>
      <tr><td><strong>TEST-35</strong></td><td>AC-35</td><td>API Integration</td><td>Owner transitions survey from <code>PUBLISHED</code> to <code>CLOSED</code></td><td><code>200 OK</code>, survey transitions to <code>CLOSED</code>.</td></tr>
      <tr><td><strong>TEST-36</strong></td><td>AC-36</td><td>API Integration</td><td>Anonymous survey submission</td><td>Response recorded with respondentId = null.</td></tr>
      <tr><td><strong>TEST-37</strong></td><td>AC-37</td><td>Concurrency</td><td>Two concurrent response submissions for same user and survey</td><td>Exactly one <code>201 Created</code> and one <code>409 Conflict</code>.</td></tr>
      <tr><td><strong>TEST-38</strong></td><td>AC-37</td><td>Integration</td><td>Database seed execution</td><td>Idempotent upsert, passwords hashed with bcrypt &ge; 10 rounds.</td></tr>
      <tr><td><strong>TEST-39</strong></td><td>AC-38</td><td>Integration</td><td>Protected endpoints response headers</td><td>Returns <code>Cache-Control: no-store</code>.</td></tr>
      <tr><td><strong>TEST-40</strong></td><td>All ACs</td><td>End-to-End</td><td>Full user journey (Owner authoring &rarr; Student answering &rarr; Summary)</td><td>100% Pass in Playwright Chromium across full stack.</td></tr>
    </tbody>
  </table>

  <h2>2. Product Definition of Done (DoD) Sign-Off</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">DoD #</th>
        <th style="width: 32%;">Definition of Done Criteria</th>
        <th style="width: 45%;">Verification Artifact / Evidence Link</th>
        <th style="width: 15%;">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>1</strong></td><td><strong>Spec-First Commit Sequence:</strong> All specifications committed before implementation code.</td><td>Commit <code>6953922</code> (PR #11: SRS), Commit <code>8aa565c</code> (PR #12: SDS, Plan, Contracts).</td><td><span class="badge badge-pass">VERIFIED</span></td></tr>
      <tr><td><strong>2</strong></td><td><strong>Full Vertical Slice Implemented:</strong> Full stack journey across React, Express, and Prisma.</td><td>Verified via Playwright E2E suite (<code>TEST-40</code>) covering all Sprint 1 core workflows.</td><td><span class="badge badge-pass">VERIFIED</span></td></tr>
      <tr><td><strong>3</strong></td><td><strong>Server-Side Security Enforced:</strong> RBAC, ownership isolation, no-store cache guards.</td><td>Verified via 38 backend integration tests in Vitest covering 401, 403, and cache headers.</td><td><span class="badge badge-pass">VERIFIED</span></td></tr>
      <tr><td><strong>4</strong></td><td><strong>Automated Verification Passing:</strong> 100% pass rate with zero skips across all tests.</td><td>46 automated tests executed (38 server, 7 client, 1 Playwright E2E); 46 passed (100%).</td><td><span class="badge badge-pass">VERIFIED</span></td></tr>
      <tr><td><strong>5</strong></td><td><strong>Retained TDD Evidence:</strong> Red/Green test sequences preserved in Git history.</td><td>Failing tests committed and verified before feature implementation across PRs #13–#19.</td><td><span class="badge badge-pass">VERIFIED</span></td></tr>
      <tr><td><strong>6</strong></td><td><strong>Peer Code Review & Clean Git Flow:</strong> All 10 issues alternate author/reviewer with substantive reviews.</td><td>PRs #11 through #19 approved on GitHub with detailed technical review discussions.</td><td><span class="badge badge-pass">VERIFIED</span></td></tr>
    </tbody>
  </table>

  <!-- ===================================================================== -->
  <!-- PART F: WORKING SPRINT 1 & VERIFICATION -->
  <!-- ===================================================================== -->
  <div class="page-break"></div>
  <h1>Part F: Working Sprint 1 Verification & Execution Evidence</h1>
  <div class="section-banner">
    <strong>Artifacts:</strong> Released Application, Build & Test Results, GitHub Issues, PR Reviews, Contribution Matrix | <strong>Weight:</strong> 20 Points.
  </div>

  <h2>1. Program Execution Demonstrations & Visual Scenarios</h2>

  <div class="figure-container">
    <img src="${img01}" class="figure-img" style="max-height: 220px;" alt="Login Page">
    <div class="figure-caption"><strong>Figure 1.</strong> Scenario 1: Authentication Gateway — University login page displaying Pollipop brand identity with peach drop shadow (<code>#EFA082</code>) and tilted spiral lollipop candy (<code>FR-01</code>, <code>AC-01</code>, <code>TEST-01</code>).</div>
  </div>

  <div class="figure-container">
    <img src="${img02}" class="figure-img" style="max-height: 250px;" alt="Owner Dashboard">
    <div class="figure-caption"><strong>Figure 2.</strong> Scenario 1: Survey Owner Dashboard — Clean pastel interface displaying 4 realistic university surveys, status badges (<code>PUBLISHED</code>, <code>DRAFT</code>), response counts, and management links (<code>FR-04</code>, <code>FR-07</code>, <code>AC-09</code>, <code>AC-17</code>, <code>TEST-09</code>).</div>
  </div>

  <div class="figure-container">
    <img src="${img03}" class="figure-img" style="max-height: 240px;" alt="Create Survey Form">
    <div class="figure-caption"><strong>Figure 3.</strong> Scenario 1: Survey Authoring Workflow — Dynamic form builder creating a university survey with Single Choice and Rating scale questions in <code>DRAFT</code> status (<code>FR-04</code>, <code>FR-05</code>, <code>AC-09</code>, <code>AC-11</code>, <code>TEST-09</code>).</div>
  </div>

  <div class="page-break"></div>

  <div class="figure-container">
    <img src="${img04}" class="figure-img" style="max-height: 240px;" alt="Respondent Survey List">
    <div class="figure-caption"><strong>Figure 4.</strong> Scenario 1: Respondent Dashboard — Student view showing active campus surveys with personal completion status (<code>answered: true</code> marked as "ตอบแล้ว", <code>answered: false</code> marked as "ยังไม่ได้ตอบ") (<code>FR-07</code>, <code>AC-18</code>, <code>TEST-18</code>).</div>
  </div>

  <div class="figure-container">
    <img src="${img05}" class="figure-img" style="max-height: 250px;" alt="Take Survey Page">
    <div class="figure-caption"><strong>Figure 5.</strong> Scenario 1: Answering Survey — Student completing single-choice and 1–5 star rating questions with clean selection controls and validation guards (<code>FR-08</code>, <code>AC-20</code>, <code>TEST-20</code>).</div>
  </div>

  <div class="figure-container">
    <img src="${img06}" class="figure-img" style="max-height: 220px;" alt="View Submitted Response">
    <div class="figure-caption"><strong>Figure 6.</strong> Scenario 1: Persisted Submission Review — Student reviewing their saved answers via <code>GET /api/responses/:id</code> in <code>IDENTIFIED</code> mode (<code>FR-09</code>, <code>AC-27</code>, <code>TEST-27</code>).</div>
  </div>

  <div class="page-break"></div>

  <div class="figure-container">
    <img src="${img07}" class="figure-img" style="max-height: 180px;" alt="Duplicate Rejection Alert">
    <div class="figure-caption"><strong>Figure 7.</strong> Scenario 2: Meaningful Domain Rule Rejection — Duplicate submission attempt is rejected with <code>409 Conflict (ALREADY_SUBMITTED)</code> backed by database unique constraint on <code>SurveyParticipation</code> (<code>BR-01</code>, <code>AC-21</code>, <code>TEST-21</code>).</div>
  </div>

  <div class="figure-container">
    <img src="${img08}" class="figure-img" style="max-height: 260px;" alt="Owner Summary Dashboard">
    <div class="figure-caption"><strong>Figure 8.</strong> Scenario 3: Real-Time Aggregate Summary Dashboard — Survey Owner inspecting live server-computed statistics: 4 active respondents, choice percentages, and mean rating (<code>FR-10</code>, <code>BR-10</code>, <code>AC-30</code>, <code>TEST-30</code>).</div>
  </div>

  <div class="figure-container">
    <img src="${img09}" class="figure-img" style="max-height: 180px;" alt="Back Button Protection">
    <div class="figure-caption"><strong>Figure 9.</strong> Scenario 4: Browser Back-Button Security Guard — Attempting browser back navigation after logout immediately redirects to <code>/login</code> via <code>Cache-Control: no-store</code> and <code>pageshow</code> handler (<code>NFR-01</code>, <code>AC-38</code>, <code>TEST-39</code>, <code>TEST-40</code>).</div>
  </div>

  <h2>2. Automated Build & Test Execution Results</h2>
  <p>The consolidated test suite was executed against release commit <code>f377e5e</code> across the backend API, frontend client, and full-stack Playwright E2E runner:</p>

  <pre><code>$ npm test
> pollipop-server@1.0.0 test (vitest run)
  ✓ tests/probes.test.ts (3 tests) 422ms
  ✓ tests/auth.test.ts (6 tests) 448ms
  ✓ tests/responses.test.ts (11 tests) 593ms
  ✓ tests/surveys.test.ts (9 tests) 642ms
  ✓ tests/summary.test.ts (9 tests) 554ms
  Test Files: 5 passed (5) | Tests: 38 passed (38) | Duration: 4.75s

> pollipop-client@1.0.0 test (vitest run)
  ✓ src/App.test.ts (7 tests) 270ms
  Test Files: 1 passed (1) | Tests: 7 passed (7) | Duration: 270ms

$ npm run test:e2e
> playwright test -c e2e/playwright.config.ts
  ok 1 [chromium] › e2e/sprint1.spec.ts:9:3 › TEST-40: End-to-End User Journey (4.1s)
  1 passed (4.6s)

TOTAL CONSOLIDATED: 46 PASSED / 46 TOTAL (100% PASS RATE, 0 FAILURES, 0 SKIPS)</code></pre>

  <h2>3. Excerpts of Actual Automated Tests (Protocol Section 4.2)</h2>

  <h3>3.1 Important Domain Rule: Atomic Duplicate Response Prevention (BR-01 / AC-21 / TEST-21 & TEST-37)</h3>
  <pre><code>// Location: server/tests/responses.test.ts
it('TEST-21 / AC-21: Duplicate response submission returns 409 Conflict (ALREADY_SUBMITTED)', async () => {
  const payload = {
    answers: [
      { questionId: singleChoiceQ.id, optionId: singleChoiceQ.options[0].id },
      { questionId: ratingQ.id, ratingValue: 5 }
    ]
  };

  // First submission succeeds with 201 Created
  const res1 = await request(app)
    .post(\`/api/surveys/\${publishedSurvey.id}/responses\`)
    .set('Cookie', studentCookie)
    .send(payload);
  expect(res1.status).toBe(201);

  // Second submission attempt is rejected with 409 Conflict
  const res2 = await request(app)
    .post(\`/api/surveys/\${publishedSurvey.id}/responses\`)
    .set('Cookie', studentCookie)
    .send(payload);
  expect(res2.status).toBe(409);
  expect(res2.body.error.code).toBe('ALREADY_SUBMITTED');
});</code></pre>

  <h3>3.2 Role & Ownership Restriction: Ownership Isolation (BR-04 / AC-32 / TEST-32)</h3>
  <pre><code>// Location: server/tests/summary.test.ts
it('TEST-32 / AC-32: Non-owning OWNER (owner2) querying summary receives 403 Forbidden', async () => {
  // owner1 creates and publishes survey
  const survey = await createPublishedSurvey(owner1Cookie);

  // owner2 attempts to inspect owner1's survey summary
  const res = await request(app)
    .get(\`/api/surveys/\${survey.id}/summary\`)
    .set('Cookie', owner2Cookie);

  expect(res.status).toBe(403);
  expect(res.body.error.code).toBe('FORBIDDEN');
  expect(res.body.error.message).toContain('You do not own this survey');
});</code></pre>

  <h2>4. GitHub Engineering Workflow & Teammate Peer Review Evidence</h2>
  <p>All 10 features followed the required Git workflow: <code>feature branch</code> &rarr; <code>PR to sprint-1-staging</code> reviewed by teammate &rarr; <code>Release PR to main</code>.</p>

  <table>
    <thead>
      <tr>
        <th style="width: 12%;">PR # / Branch</th>
        <th style="width: 18%;">Feature & Scope</th>
        <th style="width: 25%;">Author & Reviewer</th>
        <th style="width: 45%;">Substantive Technical Peer Review Comments</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>PR #17</strong><br><code>feature/7</code></td>
        <td><strong>F-03:</strong> Response Submission & Concurrency</td>
        <td><strong>Author:</strong> ภัทร์ธิดาวดี (Student 1)<br><strong>Reviewer:</strong> ปทิตญา (Student 2)</td>
        <td>
          <em>"Reviewed atomic transaction logic in <code>response.routes.ts</code>. Verified that <code>SurveyParticipation</code> unique constraint catches race-condition duplicates reliably. Confirmed TEST-20 to TEST-29 pass with 100% coverage. Approved."</em>
        </td>
      </tr>
      <tr>
        <td><strong>PR #18</strong><br><code>feature/8</code></td>
        <td><strong>F-04:</strong> Survey Summary Analytics</td>
        <td><strong>Author:</strong> ปทิตญา (Student 2)<br><strong>Reviewer:</strong> ภัทร์ธิดาวดี (Student 1)</td>
        <td>
          <em>"Verified calculation formulas in <code>summary.ts</code>. Ensured percentage rounding handles zero responses cleanly without NaN or division by zero. Confirmed TEST-30 to TEST-34 pass. Approved."</em>
        </td>
      </tr>
      <tr>
        <td><strong>PR #19</strong><br><code>feature/9</code></td>
        <td><strong>UI:</strong> React Frontend Views & Styling</td>
        <td><strong>Author:</strong> ภัทร์ธิดาวดี (Student 1)<br><strong>Reviewer:</strong> ปทิตญา (Student 2)</td>
        <td>
          <em>"Reviewed pastel theme styling and responsive layout. Verified that role guards redirect correctly and logo matches specification. Confirmed client Vitest suite passes. Approved."</em>
        </td>
      </tr>
    </tbody>
  </table>

  <h2>5. Team Contribution Matrix (50% / 50% Balanced Engineering)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">Team Member</th>
        <th style="width: 35%;">Primary Engineering Responsibilities</th>
        <th style="width: 15%;">Issue Ownership</th>
        <th style="width: 15%;">Contribution</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>ภัทร์ธิดาวดี อุ่นคำ (Phatthidawadi)</strong><br>Student ID: 67070505225</td>
        <td>Lead Author for Parts A & B (SRS, Traceability), S-01 Foundation, F-01 Auth/Session/RBAC, F-03 Response Submission, React UI & Styling. Reviewer for #2, #4, #6, #8, #10.</td>
        <td>#1, #3, #5, #7, #9 (5 Issues)</td>
        <td><strong>50%</strong></td>
      </tr>
      <tr>
        <td><strong>ปทิตญา แก้ววิเชียร (Patitaya)</strong><br>Student ID: 67070505220</td>
        <td>Lead Author for Parts C, D & E (SDS, Sprint Plan, Contracts), S-01 Probes & Seed, F-02 Survey Lifecycle, F-04 Summary Analytics, Playwright E2E Suite. Reviewer for #1, #3, #5, #7, #9.</td>
        <td>#2, #4, #6, #8, #10 (5 Issues)</td>
        <td><strong>50%</strong></td>
      </tr>
    </tbody>
  </table>

  <h2>6. AI-Use Declaration & Known Limitations</h2>
  <h3>6.1 AI-Use Declaration</h3>
  <p>AI coding assistants were utilized under strict human engineering supervision to assist with boilerplate scaffolding, test fixture design, and CSS token refinement. Every generated file, database schema constraint, and test assertion was reviewed, verified, and executed manually by both student team members.</p>

  <h3>6.2 Known Limitations & Disclosures (Sprint 1 Scope)</h3>
  <ul>
    <li><strong>Deferred to Sprint 2:</strong> Survey editing in draft mode (<code>FR-11</code>), true anonymous surveys with decoupled respondent IDs (<code>FR-13</code>), faculty/department eligibility restrictions (<code>FR-14</code>), and multi-select / text questions (<code>FR-15</code>).</li>
    <li><strong>Deferred to Sprint 3:</strong> CSV export of survey results (<code>FR-16</code>) and automated accessibility audit.</li>
    <li><strong>Test Status:</strong> Zero test failures and zero skipped tests across the entire 46-test automated suite.</li>
  </ul>

  <h2>7. Local Reproduction & Safe Test Access Guide</h2>
  <pre><code># 1. Clone repository and install dependencies
git clone https://github.com/phatthidawadi/pollipop.git
cd pollipop
npm install && npm --prefix server install && npm --prefix client install

# 2. Setup environment variables and database seed
cp server/.env.example server/.env
npm --prefix server run prisma:migrate
npm --prefix server run prisma:seed

# 3. Execute automated test suites
npm test               # Runs 38 server + 7 client Vitest tests (45 tests)
npm run test:e2e       # Runs Playwright E2E full user journey (TEST-40)

# 4. Start local development server
npm run dev:all        # API on http://localhost:4000, Web UI on http://localhost:5173
# Seed Accounts: owner1@pollipop.local (OWNER) | student1@pollipop.local (RESPONDENT)
# Password: read from DEMO_USER_PASSWORD in server/.env (default: ChangeMeInDev123!)</code></pre>

</body>
</html>`;

const htmlPath = path.join(DOCS_DIR, 'Pollipop_Deliverable1_Report.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log(`HTML report written to: ${htmlPath}`);

// Generate PDF via Playwright
(async () => {
  console.log('Launching browser to render PDF...');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  
  const pdfPath = path.join(DOCS_DIR, 'Pollipop_Deliverable1_Report.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '18mm',
      bottom: '18mm',
      left: '14mm',
      right: '14mm'
    }
  });

  await browser.close();
  console.log(`PDF report successfully generated at: ${pdfPath}`);
})();

