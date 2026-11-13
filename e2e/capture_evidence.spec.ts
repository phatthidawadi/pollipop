import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'ChangeMeInDev123!';
const ASSET_DIR = path.resolve(__dirname, '../docs/report_assets');

test.describe('Capture Visual Evidence for Deliverable 1 Part F', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(ASSET_DIR)) {
      fs.mkdirSync(ASSET_DIR, { recursive: true });
    }
  });

  test('Capture all required verification screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Login Page
    await page.goto('/login');
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
    await page.screenshot({ path: path.join(ASSET_DIR, '01_login_page.png'), fullPage: false });

    // 2. Owner Login & Dashboard
    await page.locator('[data-testid="email-input"]').fill('owner1@pollipop.local');
    await page.locator('[data-testid="password-input"]').fill(DEMO_PASSWORD);
    await page.locator('[data-testid="login-submit"]').click();
    await expect(page).toHaveURL('/owner/surveys');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ASSET_DIR, '02_owner_dashboard.png'), fullPage: true });

    // 3. Create Survey Form
    await page.locator('[data-testid="create-survey-link"]').click();
    await expect(page).toHaveURL('/owner/surveys/new');
    await page.locator('[data-testid="survey-title-input"]').fill('แบบสำรวจการจัดกิจกรรมปฐมนิเทศนักศึกษาใหม่');
    await page.locator('[data-testid="survey-desc-input"]').fill('สำรวจความเห็นเพื่อพัฒนาการจัดกิจกรรมต้อนรับเพื่อนใหม่');
    await page.locator('[data-testid="question-text-0"]').fill('กิจกรรมที่ท่านประทับใจมากที่สุด');
    await page.locator('[data-testid="question-0-option-0"]').fill('กิจกรรมบายศรีสู่ขวัญ');
    await page.locator('[data-testid="question-0-option-1"]').fill('กิจกรรมสันทนาการและพบปะเพื่อนใหม่');
    await page.locator('[data-testid="add-question-btn"]').click();
    await page.locator('[data-testid="question-text-1"]').fill('ความพึงพอใจโดยรวมต่อการจัดงาน');
    await page.locator('[data-testid="question-type-1"]').selectOption('RATING');
    await page.screenshot({ path: path.join(ASSET_DIR, '03_create_survey_form.png'), fullPage: true });

    // 4. View Survey Summary Dashboard (First published survey)
    await page.goto('/owner/surveys');
    const firstSummaryLink = page.locator('a', { hasText: 'ดูผลสรุป' }).first();
    await firstSummaryLink.click();
    await expect(page).toHaveURL(/\/owner\/surveys\/.+\/summary/);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ASSET_DIR, '08_owner_summary_dashboard.png'), fullPage: true });

    // Logout Owner
    await page.locator('[data-testid="logout-btn"]').click();
    await expect(page).toHaveURL('/login');

    // 5. Respondent Login & Dashboard (student1)
    await page.locator('[data-testid="email-input"]').fill('student1@pollipop.local');
    await page.locator('[data-testid="password-input"]').fill(DEMO_PASSWORD);
    await page.locator('[data-testid="login-submit"]').click();
    await expect(page).toHaveURL('/surveys');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ASSET_DIR, '04_respondent_survey_list.png'), fullPage: true });

    // 6. View Submitted Response Details
    const viewResponseLink = page.locator('a', { hasText: 'ดูคำตอบที่ส่งแล้ว' }).first();
    const viewHref = await viewResponseLink.getAttribute('href');
    if (viewHref) {
      await page.goto(viewHref);
      await expect(page.locator('[data-testid="response-detail"]')).toBeVisible();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(ASSET_DIR, '06_view_own_response.png'), fullPage: true });
    }

    // 7. Take Survey Screen & Duplicate Rejection
    await page.goto('/surveys');
    const detailLink = page.locator('a', { hasText: 'ดูคำตอบที่ส่งแล้ว' }).first();
    const answeredResponseHref = await detailLink.getAttribute('href');
    
    const responseId = answeredResponseHref?.split('/')[2];
    const respData = await page.evaluate(async (rid) => {
      const res = await fetch(`/api/responses/${rid}`);
      return res.json();
    }, responseId);

    if (respData && respData.surveyId) {
      await page.goto(`/surveys/${respData.surveyId}`);
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(ASSET_DIR, '05_take_survey_page.png'), fullPage: true });

      const firstRadio = page.locator('input[type="radio"]').first();
      if (await firstRadio.isVisible()) {
        await firstRadio.check();
      }
      const ratingInput = page.locator('input[value="5"]').first();
      if (await ratingInput.isVisible()) {
        await ratingInput.check();
      }
      await page.locator('[data-testid="submit-response-btn"]').click();
      await expect(page.locator('[data-testid="submit-error"]')).toBeVisible();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(ASSET_DIR, '07_duplicate_rejection.png'), fullPage: false });
    }

    // 8. Logout and Back-Button Protection
    await page.locator('[data-testid="logout-btn"]').click();
    await expect(page).toHaveURL('/login');
    await page.goBack();
    await expect(page).toHaveURL('/login');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ASSET_DIR, '09_back_button_protection.png'), fullPage: false });
  });
});
