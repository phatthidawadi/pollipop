# Sprint 1 Engineering Contracts Index (`docs/sprints/sprint-1/README.md`)
**Product Name:** Pollipop — University Review, Feedback, and Survey System  
**Repository:** `https://github.com/phatthidawadi/pollipop`  
**Team Members:**  
- **Student 1 (Author / Collaborator):** ภัทร์ธิดาวดี อุ่นคำ / Phatthidawadi Aunkham (67070505225, GitHub: `@phatthidawadi`)  
- **Student 2 (Author / Collaborator):** ปทิตญา แก้ววิเชียร / Patitaya Kaewwichian (67070505220, GitHub: `@lmaybelgracel`)  
**Document Version:** 1.0 (Spec-First Baseline)  

---

## Sprint 1 Engineering Contracts Directory

The complete engineering contract suite for **Sprint 1** (comprising feature-level designs for `S-01`, `F-01` through `F-04`, UI/API/Database specifications, master acceptance criteria `AC-01` to `AC-38`, software test specifications `TEST-01` to `TEST-40`, and the Product Definition of Done) is consolidated in the primary contract document:

* **[`contracts.md` — Sprint 1 Master Engineering Contracts (Feature Design, AC-01..AC-38, TEST-01..TEST-40, DoD)](./contracts.md)**

### Sprint 1 Feature Scope Summary

| Feature ID | Feature Name | Author | Reviewer | Acceptance Criteria | Planned Tests |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **S-01** | System Foundation, Health & Readiness Probes (`/api/health`, `/api/ready`, Idempotent Seed) | Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225) | Student 2 (ปทิตญา แก้ววิเชียร - 67070505220) | `AC-07`, `AC-08`, `AC-37` | `TEST-07`, `TEST-08`, `TEST-38` |
| **F-01** | Authentication, Database Session (`pollipop_sid`) & Role-Based Access Control + Back-Button Guard | Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225) | Student 2 (ปทิตญา แก้ววิเชียร - 67070505220) | `AC-01`..`AC-06`, `AC-38` | `TEST-01`..`TEST-06`, `TEST-39`, `TEST-40` |
| **F-02** | Survey Creation (`SINGLE_CHOICE`, `RATING`), Listing & Lifecycle (`DRAFT` $\rightarrow$ `PUBLISHED` $\rightarrow$ `CLOSED`) | Student 2 (ปทิตญา แก้ววิเชียร - 67070505220) | Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225) | `AC-09`..`AC-19`, `AC-35` | `TEST-09`..`TEST-19`, `TEST-35`, `TEST-40` |
| **F-03** | Validated Response Submission (`IDENTIFIED` / `ANONYMOUS`) & Own Response View (`GET /api/responses/:id`) | Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225) | Student 2 (ปทิตญา แก้ววิเชียร - 67070505220) | `AC-20`..`AC-29`, `AC-36` | `TEST-20`..`TEST-29`, `TEST-36`, `TEST-37`, `TEST-40` |
| **F-04** | Survey Aggregate Summary & Results Dashboard (`GET /api/surveys/:id/summary`) | Student 2 (ปทิตญา แก้ววิเชียร - 67070505220) | Student 1 (ภัทร์ธิดาวดี อุ่นคำ - 67070505225) | `AC-30`..`AC-34` | `TEST-30`..`TEST-34`, `TEST-40` |
