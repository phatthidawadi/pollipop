import { test, expect } from '@playwright/test';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'ChangeMeInDev123!';

test.describe('TEST-40: End-to-End User Journey across Sprint 1 Core Flow', () => {
  const surveyTitle = `E2E Survey ${Date.now()}`;
  let surveyId = '';

  test('Complete Sprint 1 Vertical Slice Journey (AC-01, AC-09, AC-14, AC-20, AC-21, AC-27, AC-30, AC-38)', async ({
    page,
  }) => {
    // ------------------------------------------------------------------------
    // Step 1: Owner 1 Login (AC-01 / TEST-01)
    // ------------------------------------------------------------------------
    await page.goto('/login');
    await expect(page).toHaveURL('/login');

    await page.locator('[data-testid="email-input"]').fill('owner1@pollipop.local');
    await page.locator('[data-testid="password-input"]').fill(DEMO_PASSWORD);
    await page.locator('[data-testid="login-submit"]').click();

    // Verify redirected to Owner dashboard
    await expect(page).toHaveURL('/owner/surveys');
    await expect(page.locator('[data-testid="nav-user-role"]')).toHaveText('OWNER');
    await expect(page.locator('[data-testid="nav-user-name"]')).toContainText('Owner 1');

    // ------------------------------------------------------------------------
    // Step 2: Owner creates Survey with SINGLE_CHOICE and RATING (AC-09..AC-13 / TEST-09..TEST-13)
    // ------------------------------------------------------------------------
    await page.locator('[data-testid="create-survey-link"]').click();
    await expect(page).toHaveURL('/owner/surveys/new');

    await page.locator('[data-testid="survey-title-input"]').fill(surveyTitle);
    await page
      .locator('[data-testid="survey-desc-input"]')
      .fill('Sprint 1 End-to-End Acceptance Test Survey');
    await page.locator('[data-testid="survey-mode-select"]').selectOption('IDENTIFIED');

    // Question 0: SINGLE_CHOICE
    await page.locator('[data-testid="question-text-0"]').fill('Course delivery quality');
    await page.locator('[data-testid="question-0-option-0"]').fill('Excellent');
    await page.locator('[data-testid="question-0-option-1"]').fill('Good');

    // Add Question 1: RATING
    await page.locator('[data-testid="add-question-btn"]').click();
    await page.locator('[data-testid="question-text-1"]').fill('Overall rating for course materials');
    await page.locator('[data-testid="question-type-1"]').selectOption('RATING');

    // Save Draft
    await page.locator('[data-testid="save-survey-btn"]').click();
    await expect(page).toHaveURL('/owner/surveys');

    // Verify Survey appears in DRAFT status
    const surveyCard = page.locator('.card', { hasText: surveyTitle });
    await expect(surveyCard).toBeVisible();
    await expect(surveyCard.locator('.badge-draft')).toContainText('DRAFT');

    // ------------------------------------------------------------------------
    // Step 3: Owner Publishes Survey (AC-14 / TEST-14)
    // ------------------------------------------------------------------------
    const publishBtn = surveyCard.locator('button', { hasText: 'เผยแพร่ (Publish)' });
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();

    // Verify status updated to PUBLISHED
    await expect(surveyCard.locator('.badge-published')).toContainText('PUBLISHED');

    // Extract survey ID from summary link for reference
    const summaryLink = surveyCard.locator('a', { hasText: 'ดูผลสรุป (Summary)' });
    const summaryHref = await summaryLink.getAttribute('href');
    expect(summaryHref).toBeTruthy();
    surveyId = summaryHref!.split('/')[3];

    // ------------------------------------------------------------------------
    // Step 4: Owner Logout (AC-06 / TEST-06)
    // ------------------------------------------------------------------------
    await page.locator('[data-testid="logout-btn"]').click();
    await expect(page).toHaveURL('/login');

    // ------------------------------------------------------------------------
    // Step 5: Student 1 Login (AC-01, AC-18 / TEST-01, TEST-18)
    // ------------------------------------------------------------------------
    await page.locator('[data-testid="email-input"]').fill('student1@pollipop.local');
    await page.locator('[data-testid="password-input"]').fill(DEMO_PASSWORD);
    await page.locator('[data-testid="login-submit"]').click();

    await expect(page).toHaveURL('/surveys');
    await expect(page.locator('[data-testid="nav-user-role"]')).toHaveText('RESPONDENT');
    await expect(page.locator('[data-testid="nav-user-name"]')).toContainText('Student 1');

    // Verify survey is listed with "ยังไม่ได้ตอบ" badge
    const respondentCard = page.locator(`[data-testid="respondent-survey-${surveyId}"]`);
    await expect(respondentCard).toBeVisible();
    await expect(respondentCard.locator(`[data-testid="answered-badge-${surveyId}"]`)).toHaveText(
      'ยังไม่ได้ตอบ'
    );

    // ------------------------------------------------------------------------
    // Step 6: Student 1 Takes and Submits Survey (AC-20 / TEST-20)
    // ------------------------------------------------------------------------
    await respondentCard.locator(`[data-testid="take-survey-link-${surveyId}"]`).click();
    await expect(page).toHaveURL(`/surveys/${surveyId}`);

    // Select answers: Single Choice "Excellent" (option 0) and Rating 5
    await page.locator('[data-testid="radio-q0-opt0"]').check();
    await page.locator('[data-testid="rating-q1-5"]').check();

    // Submit Response
    await page.locator('[data-testid="submit-response-btn"]').click();

    // Verify submission success alert
    await expect(page.locator('[data-testid="submit-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-success"]')).toContainText(
      'ส่งคำตอบแบบสอบถามสำเร็จ!'
    );

    // ------------------------------------------------------------------------
    // Step 7: Student 1 Inspects Submitted Answers (AC-27 / TEST-27)
    // ------------------------------------------------------------------------
    await page.locator('[data-testid="confirmation-view-response-link"]').click();
    await expect(page).toHaveURL(/\/responses\/.+/);

    const responseDetail = page.locator('[data-testid="response-detail"]');
    await expect(responseDetail).toBeVisible();
    await expect(responseDetail).toContainText(surveyTitle);
    await expect(responseDetail).toContainText('Excellent');
    await expect(responseDetail).toContainText('5 / 5 คะแนน');

    // ------------------------------------------------------------------------
    // Step 8: Duplicate Submission Gate (AC-21 / TEST-21)
    // ------------------------------------------------------------------------
    await page.goto('/surveys');
    await expect(respondentCard.locator(`[data-testid="answered-badge-${surveyId}"]`)).toHaveText(
      'ตอบแล้ว'
    );
    await expect(
      respondentCard.locator(`[data-testid="view-response-link-${surveyId}"]`)
    ).toBeVisible();

    // Attempt duplicate submission by directly navigating to survey page
    await page.goto(`/surveys/${surveyId}`);
    await page.locator('[data-testid="radio-q0-opt0"]').check();
    await page.locator('[data-testid="rating-q1-5"]').check();
    await page.locator('[data-testid="submit-response-btn"]').click();

    // Verify rejection error
    await expect(page.locator('[data-testid="submit-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-error"]')).toContainText(
      'คุณได้ส่งคำตอบสำหรับแบบสอบถามนี้ไปแล้ว'
    );

    // ------------------------------------------------------------------------
    // Step 9: Student 1 Logout
    // ------------------------------------------------------------------------
    await page.locator('[data-testid="logout-btn"]').click();
    await expect(page).toHaveURL('/login');

    // ------------------------------------------------------------------------
    // Step 10: Owner 1 Inspects Aggregate Summary Dashboard (AC-30 / TEST-30)
    // ------------------------------------------------------------------------
    await page.locator('[data-testid="email-input"]').fill('owner1@pollipop.local');
    await page.locator('[data-testid="password-input"]').fill(DEMO_PASSWORD);
    await page.locator('[data-testid="login-submit"]').click();
    await expect(page).toHaveURL('/owner/surveys');

    await page.goto(`/owner/surveys/${surveyId}/summary`);
    await expect(page).toHaveURL(`/owner/surveys/${surveyId}/summary`);

    const summaryDashboard = page.locator('[data-testid="summary-dashboard"]');
    await expect(summaryDashboard).toBeVisible();
    await expect(page.locator('[data-testid="total-responses"]')).toContainText('1 คน');

    // Verify Single choice option metrics (100.00%)
    await expect(summaryDashboard).toContainText('Excellent');
    await expect(summaryDashboard).toContainText('1 คน (100.00%)');

    // Verify Rating metrics (5.00 / 5.00)
    await expect(page.locator('[data-testid="avg-rating-1"]')).toContainText('5.00 / 5.00');

    // Verify Rating Distribution: 5 stars shows 1 person (100.00%)
    await expect(summaryDashboard).toContainText('5 ดาว');
    await expect(summaryDashboard).toContainText('1 คน');
    await expect(summaryDashboard).toContainText('(100.00%)');

    // ------------------------------------------------------------------------
    // Step 11: Owner Logout and Browser Back-Button Security Guard (AC-38 / TEST-39, TEST-40)
    // ------------------------------------------------------------------------
    await page.locator('[data-testid="logout-btn"]').click();
    await expect(page).toHaveURL('/login');

    // Attempt browser back-button navigation to cached authenticated screen
    await page.goBack();

    // Verify user is immediately kicked back to /login and authenticated content is protected
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-dashboard"]')).not.toBeVisible();
  });
});

