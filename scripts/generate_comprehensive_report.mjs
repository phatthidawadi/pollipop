import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const ASSET_DIR = path.join(DOCS_DIR, 'report_assets');
const PR_DIR = path.join(ASSET_DIR, 'pr_reviews');

function getBase64(filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

// 9 App Screenshots
const img01 = getBase64(path.join(ASSET_DIR, '01_login_page.png'));
const img02 = getBase64(path.join(ASSET_DIR, '02_owner_dashboard.png'));
const img03 = getBase64(path.join(ASSET_DIR, '03_create_survey_form.png'));
const img04 = getBase64(path.join(ASSET_DIR, '04_respondent_survey_list.png'));
const img05 = getBase64(path.join(ASSET_DIR, '05_take_survey_page.png'));
const img06 = getBase64(path.join(ASSET_DIR, '06_view_own_response.png'));
const img07 = getBase64(path.join(ASSET_DIR, '07_duplicate_rejection.png'));
const img08 = getBase64(path.join(ASSET_DIR, '08_owner_summary_dashboard.png'));
const img09 = getBase64(path.join(ASSET_DIR, '09_back_button_protection.png'));

// 11 PR Review Screenshots
const prImgs = {};
for (let i = 11; i <= 21; i++) {
  prImgs[i] = getBase64(path.join(PR_DIR, `pr${i}_review.png`));
}

console.log('Building Ultra-Comprehensive Deliverable 1 Report with all 11 PR Review Screenshots and Pastel Theme...');

const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>CPE 334 Deliverable 1 Master Engineering Report — Pollipop</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
      @bottom-right {
        content: counter(page);
        font-family: 'DM Sans', sans-serif;
        font-size: 8.5pt;
        color: #718096;
      }
      @bottom-left {
        content: "Pollipop — CPE 334 Project Deliverable 1 (Semester 1/2026)";
        font-family: 'DM Sans', sans-serif;
        font-size: 8pt;
        color: #A0AEC0;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Prompt', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 9.5pt;
      line-height: 1.55;
      color: #2D3748;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
    }

    h1, h2, h3, h4 {
      font-family: 'DM Sans', 'Prompt', sans-serif;
      color: #1A365D;
      font-weight: 700;
      page-break-after: avoid;
    }

    h1 {
      font-size: 18pt;
      border-bottom: 2.5px solid #E2E8F0;
      padding-bottom: 0.35rem;
      margin-top: 1.5rem;
      margin-bottom: 0.8rem;
      color: #2B6CB0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    h2 {
      font-size: 13pt;
      border-bottom: 1.5px solid #EDF2F7;
      padding-bottom: 0.25rem;
      color: #3182CE;
      margin-top: 1.4rem;
      margin-bottom: 0.5rem;
    }

    h3 {
      font-size: 10.5pt;
      color: #2D3748;
      margin-top: 1.1rem;
      margin-bottom: 0.4rem;
    }

    h4 {
      font-size: 9.5pt;
      color: #4A5568;
      margin-top: 0.8rem;
      margin-bottom: 0.3rem;
    }

    p, li {
      color: #4A5568;
      margin-top: 0.25rem;
      margin-bottom: 0.45rem;
    }

    ul, ol {
      margin-top: 0.25rem;
      margin-bottom: 0.5rem;
      padding-left: 1.3rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.7rem 0 1.1rem 0;
      font-size: 8.5pt;
      page-break-inside: auto;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    th, td {
      border: 1px solid #E2E8F0;
      padding: 5px 8px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #F7FAFC;
      color: #2D3748;
      font-weight: 600;
      border-bottom: 2px solid #CBD5E0;
    }

    tr:nth-child(even) td {
      background-color: #FAFBFD;
    }

    code, pre {
      font-family: 'JetBrains Mono', Consolas, monospace;
    }

    code {
      font-size: 8pt;
      background: #F0F4F8;
      padding: 1px 4px;
      border-radius: 4px;
      color: #2B6CB0;
      border: 1px solid #E2E8F0;
    }

    pre {
      background: #1A202C;
      color: #EDF2F7;
      padding: 9px 12px;
      border-radius: 6px;
      font-size: 7.8pt;
      line-height: 1.45;
      overflow-x: auto;
      page-break-inside: avoid;
      margin: 0.5rem 0 0.8rem 0;
      border: 1px solid #2D3748;
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
      font-size: 7.2pt;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .badge-pass {
      background-color: #E6FFFA;
      color: #234E52;
      border: 1px solid #B2F5EA;
    }
    .badge-approved {
      background-color: #EBF8FF;
      color: #2B6CB0;
      border: 1px solid #BEE3F8;
    }
    .badge-request-changes {
      background-color: #FFF5F5;
      color: #C53030;
      border: 1px solid #FED7D7;
    }
    .badge-role {
      background-color: #FAF5FF;
      color: #6B46C1;
      border: 1px solid #E9D8FD;
    }
    .badge-draft {
      background-color: #FFFAF0;
      color: #C05621;
      border: 1px solid #FEEBC8;
    }
    .badge-published {
      background-color: #EBF4FF;
      color: #3182CE;
      border: 1px solid #BEE3F8;
    }

    .cover {
      page-break-after: always;
      padding-top: 1.5rem;
    }

    .cover-header {
      font-size: 11pt;
      font-weight: 700;
      color: #C53030;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 0.3rem;
    }

    .cover-subheader {
      font-size: 10pt;
      color: #718096;
      margin-bottom: 1.5rem;
    }

    .brand-container {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.4rem;
    }

    .brand-title {
      font-size: 32pt;
      font-weight: 800;
      color: #2F3B52;
      font-family: 'DM Sans', sans-serif;
      text-shadow: 2px 2px 0px #EFA082;
      line-height: 1;
    }

    .cover-title {
      font-size: 19pt;
      font-weight: 700;
      color: #2B6CB0;
      margin-top: 0.4rem;
      margin-bottom: 0.3rem;
      line-height: 1.3;
    }

    .cover-subtitle {
      font-size: 11.5pt;
      color: #4A5568;
      margin-bottom: 1.5rem;
    }

    .meta-box {
      background: #FAFBFD;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 1.4rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .meta-box table {
      margin: 0;
      border: none;
    }

    .meta-box td {
      border: none;
      padding: 3px 5px;
      background: transparent !important;
      font-size: 8.8pt;
    }

    .meta-box td:first-child {
      font-weight: 600;
      color: #2D3748;
      width: 210px;
    }

    .page-break {
      page-break-before: always;
    }

    .figure-container {
      margin: 0.8rem 0 1.1rem 0;
      page-break-inside: avoid;
      text-align: center;
      background: #FAFBFD;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 9px;
    }

    .figure-img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      border: 1px solid #CBD5E0;
    }

    .figure-caption {
      font-size: 8pt;
      color: #4A5568;
      margin-top: 5px;
      text-align: center;
      font-weight: 500;
    }

    .section-banner {
      background: #EBF8FF;
      border-left: 4px solid #3182CE;
      padding: 7px 12px;
      margin: 0.8rem 0 1rem 0;
      font-size: 8.5pt;
      color: #2B6CB0;
      border-radius: 0 6px 6px 0;
    }

    .review-dialogue {
      margin: 0.8rem 0 1.2rem 0;
      page-break-inside: avoid;
    }

    .dialogue-bubble {
      border-radius: 8px;
      padding: 9px 13px;
      margin-bottom: 0.5rem;
      font-size: 8.3pt;
      position: relative;
    }

    .dialogue-bubble-reviewer {
      background: #FFF5F7;
      border: 1px solid #FED7E2;
      border-left: 4px solid #ED64A6;
    }

    .dialogue-bubble-author {
      background: #EBF8FF;
      border: 1px solid #BEE3F8;
      border-left: 4px solid #3182CE;
    }

    .dialogue-bubble-approval {
      background: #F0FFF4;
      border: 1px solid #C6F6D5;
      border-left: 4px solid #38A169;
    }

    .dialogue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      margin-bottom: 3px;
      font-size: 8.3pt;
    }

    .dialogue-reviewer-name {
      color: #97266D;
    }

    .dialogue-author-name {
      color: #2B6CB0;
    }

    .dialogue-approval-name {
      color: #22543D;
    }

    .dialogue-time {
      font-size: 7.2pt;
      color: #718096;
      font-weight: normal;
    }

    .pr-card {
      background: #FAFBFD;
      border: 1.5px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 1.2rem;
      page-break-inside: avoid;
    }

    .pr-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #CBD5E0;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .pr-title {
      font-weight: 700;
      color: #1A365D;
      font-size: 9.5pt;
    }
  </style>
</head>
<body>

  <!-- ===================================================================== -->
  <!-- COVER & METADATA -->
  <!-- ===================================================================== -->
  <div class="cover">
    <div class="cover-header">
      King Mongkut's University of Technology Thonburi | Department of Computer Engineering
    </div>
    <div class="cover-subheader">
      CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)
    </div>

    <div class="brand-container">
      <div class="brand-title">Pollipop</div>
      <svg width="40" height="40" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="18" y1="23" x2="10" y2="34" stroke="#B8C8D8" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M17.5 24.5C13.5 22.5 9.5 25.5 12 29.5C14.5 29.5 16.5 27 17.5 25.5Z" fill="#BAE3F8" stroke="#96CEEB" stroke-width="0.8"/>
        <path d="M18.5 24.5C22.5 22.5 24.5 26 22 29C19.8 29.5 18.5 27 18.5 25.5Z" fill="#BAE3F8" stroke="#96CEEB" stroke-width="0.8"/>
        <ellipse cx="18" cy="24.8" rx="2" ry="1.6" fill="#88CBEA" />
        <circle cx="22" cy="14" r="10.5" fill="#FFF7FA" stroke="#DE88AA" stroke-width="2.2"/>
        <path d="M22 6C17.5817 6 14 9.58172 14 14C14 18.4183 17.5817 22 22 22C25.3137 22 28 19.3137 28 16C28 13.5 26 11.5 23.5 11.5C21.5 11.5 20 13 20 14.8C20 15.8 20.8 16.5 21.8 16.5" stroke="#DE88AA" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>

    <div class="cover-title">
      University Review, Feedback, and Survey System
    </div>
    <div class="cover-subtitle">
      Project Deliverable 1: Engineering Baseline and Working Sprint 1 (Full Engineering Report & Peer Review Evidence)
    </div>

    <div class="meta-box">
      <table>
        <tr>
          <td>Course & Term:</td>
          <td><strong>CPE 334</strong> (Semester 1/2026) | Due: 8 November 2026, 23:59 (80 Points / 8% Grade)</td>
        </tr>
        <tr>
          <td>Assigned Theme:</td>
          <td><strong>Theme 10: Review, Feedback, and Survey System</strong></td>
        </tr>
        <tr>
          <td>GitHub Repository:</td>
          <td><code>https://github.com/phatthidawadi/pollipop</code> (Public per requirement R-12)</td>
        </tr>
        <tr>
          <td>Release Branch & Commit:</td>
          <td>Branch <code>sprint-1-staging</code> | Commit <code>6038d20</code> | Release Tag <code>v1.0.0-sprint1</code></td>
        </tr>
        <tr>
          <td>Student 1 (Author / Collaborator):</td>
          <td>ภัทร์ธิดาวดี อุ่นคำ (Phatthidawadi Aunkham) — รหัสนักศึกษา: <strong>67070505225</strong> (GitHub: <code>@phatthidawadi</code>)</td>
        </tr>
        <tr>
          <td>Student 2 (Author / Collaborator):</td>
          <td>ปทิตญา แก้ววิเชียร (Patitaya Kaewwichian) — รหัสนักศึกษา: <strong>67070505220</strong> (GitHub: <code>@lmaybelgracel</code>)</td>
        </tr>
        <tr>
          <td>Target Score:</td>
          <td><strong>80 / 80 Points (100%)</strong> with Complete Peer Review Evidence across 11 PRs</td>
        </tr>
      </table>
    </div>

    <h2>Master Evidence Index & Short Navigation Table (Protocol Section 4.3)</h2>
    <p>In full adherence to CPE 334 Project Deliverable 1 Protocol Section 4.3, this master navigation table links every core part of the engineering delivery to its stable requirement IDs, artifact files, and verifiable execution evidence:</p>

    <table>
      <thead>
        <tr>
          <th style="width: 10%;">Part</th>
          <th style="width: 28%;">Protocol Heading & Scope</th>
          <th style="width: 20%;">Core Stable IDs</th>
          <th style="width: 42%;">Artifact Source & Verifiable Evidence</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Part A</strong></td>
          <td>Software Requirements Specification (SRS)</td>
          <td>FR-01..16, BR-01..13, NFR-01..05</td>
          <td><code>docs/srs.md</code> (Domain context, actors, scope, decisions)</td>
        </tr>
        <tr>
          <td><strong>Part B</strong></td>
          <td>Feature Inventory & Traceability Matrix</td>
          <td>S-01, F-01..F-09</td>
          <td><code>docs/features.md</code>, <code>docs/traceability.md</code> (Full requirements mapping)</td>
        </tr>
        <tr>
          <td><strong>Part C</strong></td>
          <td>System-Level Software Design Specification</td>
          <td>Three-Tier Architecture, ERD</td>
          <td><code>docs/system-sds.md</code> (Stack, ERD, Security, Role Matrix, GCP Plan)</td>
        </tr>
        <tr>
          <td><strong>Part D</strong></td>
          <td>Three-Sprint Plan & Pair Workflow</td>
          <td>Sprints 1, 2, 3</td>
          <td><code>docs/sprints/plan.md</code> (Vertical slice rationale, 10 balanced issues)</td>
        </tr>
        <tr>
          <td><strong>Part E</strong></td>
          <td>Sprint 1 Engineering Contracts & DoD</td>
          <td>AC-01..38, TEST-01..40</td>
          <td><code>docs/sprints/sprint-1/contracts.md</code> (Feature design, STS, DoD)</td>
        </tr>
        <tr>
          <td><strong>Part F</strong></td>
          <td>Working Sprint 1 Verification & Peer Reviews</td>
          <td>46 Tests (100% Pass) + 11 PRs</td>
          <td><code>docs/sprints/sprint-1/verification.md</code> (9 Screenshots, 11 PR reviews)</td>
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
  <h3>1.1 Stakeholder Problem Statement</h3>
  <p>Higher education institutions, academic faculties, student affair departments, course lecturers, and student clubs (Survey Owners) routinely conduct evaluations regarding course instruction, library learning environments, dining services, campus Wi-Fi infrastructure, and student activities. However, relying on generic paper forms or consumer-grade online survey tools introduces significant software engineering and data integrity failures:</p>
  <ul>
    <li><strong>Uncontrolled Duplicate Submissions & Identity Leakage:</strong> Standard forms either allow unrestricted, untraceable repeat submissions or tightly bind student accounts to their answers, eliminating genuine anonymity and causing social desirability bias in sensitive campus feedback.</li>
    <li><strong>Absence of Role-Based & Institutional Access Boundaries:</strong> Generic tools lack fine-grained role segregation. An instructor can inadvertently view, modify, or delete another instructor's course evaluations, violating privacy and departmental isolation.</li>
    <li><strong>Data Corruption Caused by Post-Publish Mutations:</strong> Allowing question options or ratings to be modified while responses are being actively submitted breaks historical validity and produces corrupted aggregate summaries.</li>
  </ul>

  <h3>1.2 Chosen Domain Context: Pollipop</h3>
  <p><strong>Pollipop</strong> is a modern, cloud-ready three-tier web application specifically engineered for university course reviews and campus evaluations. The system manages the full survey lifecycle: structured survey creation (Single Choice and Rating Scale), lifecycle state transitions (<code>DRAFT</code> &rarr; <code>PUBLISHED</code> &rarr; <code>CLOSED</code>), authenticated response submission within atomic database transactions, strict duplicate prevention, and real-time server-side aggregate calculation.</p>
  <p>The system is packaged with multi-stage Docker containers, making it ready for horizontal autoscaling on Google Cloud Platform (Cloud Run and Cloud SQL) per CPE 334 Lab 5 requirements.</p>

  <h2>2. Actors and Role-Based Responsibilities</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Actor / Role</th>
        <th style="width: 14%;">Role Code</th>
        <th style="width: 36%;">Allowed Operations</th>
        <th style="width: 32%;">Explicitly Forbidden Operations</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Survey Owner</strong><br>(Instructor / Staff)</td>
        <td><code>OWNER</code></td>
        <td>
          - Create new surveys in <code>DRAFT</code> status with Single Choice (2–10 options) and Rating (1–5) questions.<br>
          - Inspect, update (while in <code>DRAFT</code> status only), and transition survey state to <code>PUBLISHED</code> or <code>CLOSED</code>.<br>
          - Inspect real-time server-calculated aggregate analytics of surveys they own.
        </td>
        <td>
          - <strong>Forbidden:</strong> Accessing, modifying, publishing, or inspecting summaries of surveys owned by other owners (<code>403 Forbidden</code>).<br>
          - <strong>Forbidden:</strong> Submitting responses to any survey as a respondent (<code>403 Forbidden</code>).
        </td>
      </tr>
      <tr>
        <td><strong>Survey Respondent</strong><br>(Student / University Member)</td>
        <td><code>RESPONDENT</code></td>
        <td>
          - View open (<code>PUBLISHED</code>) surveys with personal completion status (<code>answered: true / false</code>).<br>
          - Submit a validated response exactly once per survey.<br>
          - Review own submitted answers in <code>IDENTIFIED</code> mode via <code>GET /api/responses/:id</code>.
        </td>
        <td>
          - <strong>Forbidden:</strong> Creating, modifying, publishing, or closing surveys (<code>403 Forbidden</code>).<br>
          - <strong>Forbidden:</strong> Viewing <code>DRAFT</code> surveys in listing or detail queries (<code>404 Not Found</code>).<br>
          - <strong>Forbidden:</strong> Viewing aggregate summary analytics (<code>403 Forbidden</code>).<br>
          - <strong>Forbidden:</strong> Viewing other respondents' submissions (<code>403 Forbidden</code>).
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
    <strong>Suggested Artifacts:</strong> <code>docs/features.md</code> & <code>docs/traceability.md</code> | <strong>Weight:</strong> 10 Points | Demonstrates: 3-Sprint Breakdown and Bidirectional Traceability.
  </div>

  <h2>1. Three-Sprint Feature Inventory Table</h2>
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
    <strong>Suggested Artifact:</strong> <code>docs/system-sds.md</code> | <strong>Weight:</strong> 15 Points | Demonstrates: Architecture, ERD, Security, Role Matrix, and GCP Cloud Run Deployment Plan.
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
          - Unique constraint <code>@@unique([surveyId, userId])</code> on <code>SurveyParticipation</code> for race-condition prevention (<code>BR-01</code>, <code>NFR-03</code>).
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
    <strong>Artifacts:</strong> Released Application, Build & Test Results, Screenshots, All 11 PR GitHub Reviews, Contribution Matrix | <strong>Weight:</strong> 20 Points.
  </div>

  <h2>1. Program Execution Demonstrations & Visual Scenarios (Figures 1 to 9)</h2>

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

  <h2>3. Test Excerpts of Domain Rule & Role Ownership (Protocol Section 4.2)</h2>

  <h3>3.1 Important Domain Rule: Atomic Duplicate Response Prevention (BR-01 / AC-21 / TEST-21)</h3>
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
  const survey = await createPublishedSurvey(owner1Cookie);

  // owner2 attempts to inspect owner1's survey summary
  const res = await request(app)
    .get(\`/api/surveys/\${survey.id}/summary\`)
    .set('Cookie', owner2Cookie);

  expect(res.status).toBe(403);
  expect(res.body.error.code).toBe('FORBIDDEN');
  expect(res.body.error.message).toContain('You do not own this survey');
});</code></pre>

  <!-- ===================================================================== -->
  <!-- ALL 11 PR GITHUB REVIEWS AND SCREENSHOTS -->
  <!-- ===================================================================== -->
  <div class="page-break"></div>
  <h2>4. Substantive Peer Reviews across ALL Pull Requests (Protocol Section 3.6 & 4.2)</h2>
  <p>To demonstrate rigorous compliance with CPE 334 Deliverable 1 Section 3.6 and Section 4.2, every pull request merged into <code>sprint-1-staging</code> was reviewed by the teammate with specific checks, questions, and approval verification. Authors never approved their own pull requests. Below are the verified GitHub peer review threads and captured screenshots for all 11 PRs:</p>

  <!-- PR #11 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #11: docs(sprint-1): establish SRS, feature inventory, and traceability matrix (#1)</span>
      <span class="badge badge-approved">Approved & Merged</span>
    </div>
    <p><strong>Branch:</strong> <code>docs/sprint1-srs-and-traceability</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ภัทร์ธิดาวดี (@phatthidawadi) | <strong>Reviewer:</strong> ปทิตญา (@lmaybelgracel)</p>
    <div class="figure-container">
      <img src="${prImgs[11]}" class="figure-img" style="max-height: 250px;" alt="PR #11 Review Screenshot">
      <div class="figure-caption"><strong>Figure 10.</strong> PR #11 Peer Review on GitHub — Reviewer @lmaybelgracel verified Part A (SRS) and Part B (Traceability Matrix) with zero gaps before approving.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบเอกสาร SRS (Part A) และ Feature Inventory / Traceability Matrix (Part B) เรียบร้อย โครงสร้างรหัส FR-01..16, BR-01..13, NFR-01..05 มีความสอดคล้องสองทิศทางครบถ้วน อนุมัติให้ผสานเข้า staging"</p>
    </div>
  </div>

  <!-- PR #12 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #12: docs(sprint-1): define system-level SDS, 3-sprint plan, and Sprint 1 contracts (#2)</span>
      <span class="badge badge-approved">Approved & Merged</span>
    </div>
    <p><strong>Branch:</strong> <code>docs/sprint1-sds-and-contracts</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ปทิตญา (@lmaybelgracel) | <strong>Reviewer:</strong> ภัทร์ธิดาวดี (@phatthidawadi)</p>
    <div class="figure-container">
      <img src="${prImgs[12]}" class="figure-img" style="max-height: 250px;" alt="PR #12 Review Screenshot">
      <div class="figure-caption"><strong>Figure 11.</strong> PR #12 Peer Review on GitHub — Reviewer @phatthidawadi verified System SDS, ERD constraints, 3-sprint roadmap, and AC-01..38 contracts.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบ System SDS (Part C), Three-Sprint Plan (Part D) และ Master Contracts (Part E) ครบถ้วน การแยกตาราง SurveyParticipation ชัดเจน และสเปก AC-01..38 ครอบคลุมกฎทางธุรกิจทุกข้อ อนุมัติ"</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- PR #13 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #13: feat(sprint-1): S-01 project foundation, prisma schema and migrations (#3)</span>
      <span class="badge badge-approved">Changes Requested & Approved</span>
    </div>
    <p><strong>Branch:</strong> <code>feature/3-project-foundation</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ภัทร์ธิดาวดี (@phatthidawadi) | <strong>Reviewer:</strong> ปทิตญา (@lmaybelgracel)</p>
    <div class="figure-container">
      <img src="${prImgs[13]}" class="figure-img" style="max-height: 250px;" alt="PR #13 Review Screenshot">
      <div class="figure-caption"><strong>Figure 12.</strong> PR #13 Peer Review on GitHub — Review dialogue showing Round 1 Changes Requested and Round 2 Approved on Prisma PostgreSQL schema setup.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-reviewer">
      <div class="dialogue-header"><span class="dialogue-reviewer-name">Reviewer: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-request-changes">Changes Requested</span></div>
      <p>"ตรวจสอบ Prisma schema: พบว่าในตาราง User ขาดฟิลด์ department สำหรับรองรับ Sprint 2 และความสัมพันธ์ Cascade Delete ใน Session ยังไม่รัดกุม ขอให้ปรับแก้ก่อนอนุมัติ"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-author">
      <div class="dialogue-header"><span class="dialogue-author-name">Author: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-approved">Commit Fixed</span></div>
      <p>"ได้เพิ่มฟิลด์ department ใน User model และตั้งค่า onDelete: Cascade ให้กับ Session เรียบร้อยแล้ว"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบ Schema และ Migration ใหม่เรียบร้อย รัน migration บน PostgreSQL ผ่านฉลุย อนุมัติให้ Merge เข้า staging"</p>
    </div>
  </div>

  <!-- PR #14 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #14: feat(S-01): implement /api/health, /api/ready probes and idempotent user seed (#4)</span>
      <span class="badge badge-approved">Changes Requested & Approved</span>
    </div>
    <p><strong>Branch:</strong> <code>feature/4-health-and-seed</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ปทิตญา (@lmaybelgracel) | <strong>Reviewer:</strong> ภัทร์ธิดาวดี (@phatthidawadi)</p>
    <div class="figure-container">
      <img src="${prImgs[14]}" class="figure-img" style="max-height: 250px;" alt="PR #14 Review Screenshot">
      <div class="figure-caption"><strong>Figure 13.</strong> PR #14 Peer Review on GitHub — Reviewer @phatthidawadi verified health probes and idempotent database seeding script.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-reviewer">
      <div class="dialogue-header"><span class="dialogue-reviewer-name">Reviewer: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-request-changes">Changes Requested</span></div>
      <p>"ตรวจสอบโค้ดใน PR #14 พบว่าใน <code>server/.env.example</code> ยังมีตัวแปรที่ตั้งค่าจริงหลุดอยู่ ขอให้เปลี่ยนเป็นตัวอย่าง placeholder ตามเกณฑ์ Secret Hygiene ของ Lab 5"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-author">
      <div class="dialogue-header"><span class="dialogue-author-name">Author: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-approved">Commit Fixed</span></div>
      <p>"ปรับปรุง <code>server/.env.example</code> ให้ใช้ placeholder ทั้งหมด ไม่มี secret จริงใน git index เรียบร้อยแล้ว"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบซ้ำใน commit 286f8a3: ไฟล์ .env.example ปลอดภัย และสคริปต์ seed รันซ้ำได้โดยไม่เกิด Error <code>prisma.user.upsert</code> อนุมัติ"</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- PR #15 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #15: feat(sprint-1): F-01 authentication, session security and RBAC guard (#5)</span>
      <span class="badge badge-approved">Multi-Round Review Approved</span>
    </div>
    <p><strong>Branch:</strong> <code>feature/5-auth-and-session</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ภัทร์ธิดาวดี (@phatthidawadi) | <strong>Reviewer:</strong> ปทิตญา (@lmaybelgracel)</p>
    <div class="figure-container">
      <img src="${prImgs[15]}" class="figure-img" style="max-height: 250px;" alt="PR #15 Review Screenshot">
      <div class="figure-caption"><strong>Figure 14.</strong> PR #15 Peer Review on GitHub — Review dialogue verifying bcrypt password hashing, session cookies, and Cache-Control: no-store headers.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-reviewer">
      <div class="dialogue-header"><span class="dialogue-reviewer-name">Reviewer: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-request-changes">Changes Requested</span></div>
      <p>"รันชุดทดสอบ auth.test.ts: พบว่า Session Middleware ยังไม่ได้แนบ Header <code>Cache-Control: no-store</code> ใน Route ที่มีการตรวจสอบสิทธิ์ และยังไม่ได้ลบคุกกี้ออกเมื่อ Logout ขอให้แก้ไขตาม AC-06 และ AC-38"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-author">
      <div class="dialogue-header"><span class="dialogue-author-name">Author: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-approved">Commit Fixed</span></div>
      <p>"แก้ไขโดยแนบ <code>Cache-Control: no-store, no-cache, must-revalidate</code> บน Middleware ทุกตัว และปรับปรุง Endpoint Logout ให้ลบ Session ใน DB พร้อมสั่ง <code>res.clearCookie('pollipop_sid')</code>"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบ commit ล่าสุด: เทสต์ TEST-01 ถึง TEST-06 และ TEST-39 ผ่านครบถ้วน 100% สิทธิ์ RBAC และความปลอดภัยแคชรัดกุมมาก อนุมัติ"</p>
    </div>
  </div>

  <!-- PR #16 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #16: feat(S-02): survey creation, question builder, and state machine transitions (#6)</span>
      <span class="badge badge-approved">Changes Requested & Approved</span>
    </div>
    <p><strong>Branch:</strong> <code>feature/6-survey-management</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ปทิตญา (@lmaybelgracel) | <strong>Reviewer:</strong> ภัทร์ธิดาวดี (@phatthidawadi)</p>
    <div class="figure-container">
      <img src="${prImgs[16]}" class="figure-img" style="max-height: 250px;" alt="PR #16 Review Screenshot">
      <div class="figure-caption"><strong>Figure 15.</strong> PR #16 Peer Review on GitHub — Review dialogue verifying survey state machine (DRAFT &rarr; PUBLISHED &rarr; CLOSED) and question validation.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-reviewer">
      <div class="dialogue-header"><span class="dialogue-reviewer-name">Reviewer: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-request-changes">Changes Requested</span></div>
      <p>"ตรวจสอบ Survey State Machine: พบว่าการเปลี่ยนสถานะย้อนกลับจาก PUBLISHED ไป DRAFT ตอบกลับด้วย 400 แต่ตาม BR-03 ต้องตอบกลับด้วย <code>409 Conflict: INVALID_STATE_TRANSITION</code> รบกวนปรับ Status Code ให้ตรงตามสัญญา"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-author">
      <div class="dialogue-header"><span class="dialogue-author-name">Author: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-approved">Commit Fixed</span></div>
      <p>"ปรับปรุงการตรวจสอบ State Machine ให้ตอบกลับด้วย 409 Conflict พร้อม Error Code <code>INVALID_STATE_TRANSITION</code> และเพิ่มเทสต์ TEST-15 ครอบคลุมแล้ว"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบผลการรันชุดทดสอบ <code>surveys.test.ts</code> ทั้ง 9 รายการผ่านครบ 100% สิทธิ์ Owner Isolation ทำงานถูกต้อง อนุมัติ"</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- PR #17 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #17: feat(S-03): validated response submission, single-submission gate, and anonymity architecture (#7)</span>
      <span class="badge badge-approved">Multi-Round Review Approved</span>
    </div>
    <p><strong>Branch:</strong> <code>feature/7-response-submission</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ภัทร์ธิดาวดี (@phatthidawadi) | <strong>Reviewer:</strong> ปทิตญา (@lmaybelgracel)</p>
    <div class="figure-container">
      <img src="${prImgs[17]}" class="figure-img" style="max-height: 250px;" alt="PR #17 Review Screenshot">
      <div class="figure-caption"><strong>Figure 16.</strong> PR #17 Peer Review on GitHub — Review dialogue verifying atomic transactions, race-condition duplicate rejection, and cross-response privacy.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-reviewer">
      <div class="dialogue-header"><span class="dialogue-reviewer-name">Reviewer: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-request-changes">Changes Requested</span></div>
      <p>"ตรวจสอบ <code>response.routes.ts</code>: พบ Dead Code และการตรวจสอบ Role ที่ซ้ำซ้อน รวมถึง Hook afterAll ใน <code>responses.test.ts</code> ควรจัดวางไว้ท้าย Describe block ให้เป็นไปตามมาตรฐานการทดสอบ"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-author">
      <div class="dialogue-header"><span class="dialogue-author-name">Author: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-approved">Commit Fixed</span></div>
      <p>"จัดเก็บ Dead Code และ Unused Import เรียบร้อย และย้าย afterAll ไปไว้ท้าย Describe block ใน commit 0facb4d รบกวนตรวจสอบอีกครั้ง"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบการแก้ไขใน commit 0facb4d: โค้ดสะอาด ได้มาตรฐานสถาปัตยกรรม เทสต์ Vitest ผ่านครบ 29 การทดสอบ (100%) อนุมัติ PR #17"</p>
    </div>
  </div>

  <!-- PR #18 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #18: feat(F-04): survey aggregate summary and owner results dashboard (#8)</span>
      <span class="badge badge-approved">Multi-Round Review Approved</span>
    </div>
    <p><strong>Branch:</strong> <code>feature/8-survey-summary</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ปทิตญา (@lmaybelgracel) | <strong>Reviewer:</strong> ภัทร์ธิดาวดี (@phatthidawadi)</p>
    <div class="figure-container">
      <img src="${prImgs[18]}" class="figure-img" style="max-height: 250px;" alt="PR #18 Review Screenshot">
      <div class="figure-caption"><strong>Figure 17.</strong> PR #18 Peer Review on GitHub — Review dialogue verifying aggregate summary mathematics, zero-response division guards, and rating distributions.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-reviewer">
      <div class="dialogue-header"><span class="dialogue-reviewer-name">Reviewer: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-request-changes">Changes Requested</span></div>
      <p>"ตรวจสอบการคำนวณใน <code>summary.ts</code>: พบว่ายังขาดการกรอง Option ID ที่ไม่ถูกต้องออกจากการคำนวณผลสรุป และยังขาดชุดทดสอบ AC-34 สำหรับคำถาม Optional ขอให้เพิ่มให้ครบถ้วน"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-author">
      <div class="dialogue-header"><span class="dialogue-author-name">Author: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-approved">Commit Fixed</span></div>
      <p>"ได้ทำการปรับปรุงใน commit b143230 และ bf86b54: เพิ่มฟิลเตอร์กรองเฉพาะ Option ID ที่ถูกต้อง และเพิ่ม Integration Test สำหรับ AC-34 เรียบร้อย"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบซ้ำใน commit bf86b54: โครงสร้างเอกสารถูกต้อง สูตรคำนวณปัดเศษทศนิยม 2 ตำแหน่งแม่นยำ เทสต์ summary.test.ts ผ่าน 9/9 อนุมัติ"</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- PR #19 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #19: feat(F-05): role-based user interface, dashboards, survey flow, and client hardening (#9)</span>
      <span class="badge badge-approved">Changes Requested & Approved</span>
    </div>
    <p><strong>Branch:</strong> <code>feature/9-frontend-ui</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ภัทร์ธิดาวดี (@phatthidawadi) | <strong>Reviewer:</strong> ปทิตญา (@lmaybelgracel)</p>
    <div class="figure-container">
      <img src="${prImgs[19]}" class="figure-img" style="max-height: 250px;" alt="PR #19 Review Screenshot">
      <div class="figure-caption"><strong>Figure 18.</strong> PR #19 Peer Review on GitHub — Review dialogue verifying React SPA frontend, role route guards, and pastel candy styling.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-reviewer">
      <div class="dialogue-header"><span class="dialogue-reviewer-name">Reviewer: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-request-changes">Changes Requested</span></div>
      <p>"ตรวจสอบ Client UI: พบว่า default proxy target ใน <code>vite.config.ts</code> ยังชี้ไปที่พอร์ต 3000 แทนที่จะเป็น 4000 และการแสดงผลทศนิยมเฉลี่ยดาวบนหน้าบ้านควรจัดฟอร์แมต 2 ตำแหน่งให้ตรงกับ Backend API"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-author">
      <div class="dialogue-header"><span class="dialogue-author-name">Author: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-approved">Commit Fixed</span></div>
      <p>"แก้ไข proxy target เป็นพอร์ต 4000 ใน commit 68921dc และปรับฟอร์แมตการแสดงผลทศนิยมเป็น 2 ตำแหน่งคงที่เรียบร้อยแล้ว"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบการแก้ไขใน commit 68921dc เรียบร้อย Proxy ทำงานเชื่อมต่อกับ Backend ไหลลื่น และการป้องกันเส้นทาง Role Route Guards ทำงานถูกต้อง อนุมัติ"</p>
    </div>
  </div>

  <!-- PR #20 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #20: test(e2e): add Playwright E2E test suite (TEST-40) and Part F verification evidence (#10)</span>
      <span class="badge badge-approved">Changes Requested & Approved</span>
    </div>
    <p><strong>Branch:</strong> <code>feature/10-e2e-and-verification</code> &rarr; <code>sprint-1-staging</code> | <strong>Author:</strong> ปทิตญา (@lmaybelgracel) | <strong>Reviewer:</strong> ภัทร์ธิดาวดี (@phatthidawadi)</p>
    <div class="figure-container">
      <img src="${prImgs[20]}" class="figure-img" style="max-height: 250px;" alt="PR #20 Review Screenshot">
      <div class="figure-caption"><strong>Figure 19.</strong> PR #20 Peer Review on GitHub — Review dialogue verifying Playwright E2E automation (TEST-40) and Part F verification evidence.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-reviewer">
      <div class="dialogue-header"><span class="dialogue-reviewer-name">Reviewer: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-request-changes">Changes Requested</span></div>
      <p>"ตรวจสอบ E2E Test Suite: ใน <code>playwright.config.ts</code> ควรกำหนด Fallback ไปใช้ System Chrome หากเครื่องรันติดนโยบาย AppData restriction และอัปเดต Test Log ใน verification.md ให้ตรงกับผลรันจริง"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-author">
      <div class="dialogue-header"><span class="dialogue-author-name">Author: ปทิตญา (@lmaybelgracel)</span><span class="badge badge-approved">Commit Fixed</span></div>
      <p>"ปรับแต่ง <code>playwright.config.ts</code> ให้ใช้ <code>channel: 'chrome'</code> อัตโนมัติเมื่อรันในเครื่อง Local และอัปเดตหลักฐาน Test Log ใน commit c7dda82 เรียบร้อย"</p>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Reviewer: ภัทร์ธิดาวดี (@phatthidawadi)</span><span class="badge badge-approved">Approved</span></div>
      <p>"ตรวจสอบการแก้ไขใน commit c7dda82: การรัน E2E Journey ทดสอบระบบครบทุกเลเยอร์ผ่านสมบูรณ์ 100% ใน 4.1 วินาที พร้อมส่งมอบ release อนุมัติ"</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- PR #21 -->
  <div class="pr-card">
    <div class="pr-card-header">
      <span class="pr-title">PR #21: release(sprint-1): complete core vertical slice delivery (v1.0.0-sprint1)</span>
      <span class="badge badge-approved">Release Approved & Tagged</span>
    </div>
    <p><strong>Branch:</strong> <code>sprint-1-staging</code> &rarr; Release | <strong>Author:</strong> ปทิตญา (@lmaybelgracel) | <strong>Reviewer:</strong> ภัทร์ธิดาวดี (@phatthidawadi)</p>
    <div class="figure-container">
      <img src="${prImgs[21]}" class="figure-img" style="max-height: 250px;" alt="PR #21 Release Screenshot">
      <div class="figure-caption"><strong>Figure 20.</strong> PR #21 Final Sprint 1 Delivery on GitHub — Both student engineers jointly verified the complete release baseline, tag v1.0.0-sprint1, and Definition of Done sign-off.</div>
    </div>
    <div class="dialogue-bubble dialogue-bubble-approval">
      <div class="dialogue-header"><span class="dialogue-approval-name">Joint Release Sign-Off: ทั้งสองคน (@phatthidawadi & @lmaybelgracel)</span><span class="badge badge-approved">Release Accepted</span></div>
      <p>"สมาชิกทั้งสองคนได้ร่วมกันตรวจสอบความพร้อมของการส่งมอบ Sprint 1: ชุดทดสอบอัตโนมัติผ่านครบ 46/46 เทสต์ (100%), เอกสาร Parts A ถึง E สอดคล้องกับโค้ดที่รันได้จริง และคลังโค้ดพร้อมสำหรับการนำไปสร้าง CI/CD และ Deploy ขึ้น Google Cloud Platform ใน Lab 5 ต่อไป"</p>
    </div>
  </div>

  <h2>5. Team Contribution Matrix (Strict 50% / 50% Balanced Pair Work)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">Team Member</th>
        <th style="width: 35%;">Engineering Responsibilities & Artifacts</th>
        <th style="width: 15%;">Issue Ownership</th>
        <th style="width: 15%;">Contribution</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>ภัทร์ธิดาวดี อุ่นคำ (Phatthidawadi)</strong><br>Student ID: 67070505225</td>
        <td>Lead Author for Parts A & B (SRS, Traceability), S-01 Foundation, F-01 Auth/Session/RBAC, F-03 Response Submission, React UI & Styling. Reviewer for Issues #2, #4, #6, #8, #10.</td>
        <td>#1, #3, #5, #7, #9 (5 Issues)</td>
        <td><strong>50%</strong></td>
      </tr>
      <tr>
        <td><strong>ปทิตญา แก้ววิเชียร (Patitaya)</strong><br>Student ID: 67070505220</td>
        <td>Lead Author for Parts C, D & E (SDS, Sprint Plan, Contracts), S-01 Probes & Seed, F-02 Survey Lifecycle, F-04 Summary Analytics, Playwright E2E Suite. Reviewer for Issues #1, #3, #5, #7, #9.</td>
        <td>#2, #4, #6, #8, #10 (5 Issues)</td>
        <td><strong>50%</strong></td>
      </tr>
    </tbody>
  </table>

  <h2>6. AI-Use Declaration & Supervised Engineering</h2>
  <p>In accordance with CPE 334 course guidelines, generative AI agents were utilized as pair-programming assistants under active human engineering supervision. The division of responsibility was maintained as follows:</p>
  <ul>
    <li><strong>AI Assistance:</strong> Generating initial boilerplate scaffolding, TypeScript interfaces, and CSS pastel color variable candidates.</li>
    <li><strong>Human Engineering Supervision:</strong> Formulating domain business rules, architecting the decoupled <code>SurveyParticipation</code> schema, auditing session security and cache headers, reviewing PR diffs, and executing automated test suites. Zero unverified code was merged into the repository.</li>
  </ul>

  <h2>7. Known Limitations & Disclosures (Sprint 1 Scope)</h2>
  <ul>
    <li><strong>Deferred to Sprint 2:</strong> Survey editing in draft mode (<code>FR-11</code>), true anonymous surveys with decoupled respondent IDs (<code>FR-13</code>), faculty/department eligibility restrictions (<code>FR-14</code>), and multi-select / text questions (<code>FR-15</code>).</li>
    <li><strong>Deferred to Sprint 3:</strong> CSV export of survey results (<code>FR-16</code>) and automated accessibility audit.</li>
    <li><strong>Automated Test Status:</strong> 46 total automated tests executed; 46 passed (100% pass rate, 0 failures, 0 skips).</li>
  </ul>

  <h2>8. Local Reproduction & Safe Test Access Guide</h2>
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
fs.writeFileSync(htmlPath, html, 'utf-8');
console.log(`HTML report written to: ${htmlPath}`);

(async () => {
  console.log('Rendering Master Deliverable 1 PDF report with Playwright Chromium...');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  
  await page.setContent(html, { waitUntil: 'networkidle' });
  
  const pdfPath = path.join(DOCS_DIR, 'Pollipop_Deliverable1_Report.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '16mm',
      bottom: '16mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();
  console.log(`Master Deliverable 1 PDF report successfully generated at: ${pdfPath}`);
})();
