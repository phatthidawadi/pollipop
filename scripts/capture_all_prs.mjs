import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PR_DIR = path.join(ROOT_DIR, 'docs', 'report_assets', 'pr_reviews');

if (!fs.existsSync(PR_DIR)) {
  fs.mkdirSync(PR_DIR, { recursive: true });
}

const prNumbers = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

async function capturePRs() {
  console.log('Launching browser to capture all GitHub PR review discussions...');
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 950 }
  });
  const page = await context.newPage();

  for (const pr of prNumbers) {
    const url = `https://github.com/phatthidawadi/pollipop/pull/${pr}`;
    console.log(`Navigating to PR #${pr}: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Scroll to review comments area
      await page.evaluate(() => {
        const reviewItems = document.querySelectorAll('.js-timeline-item');
        if (reviewItems.length > 2) {
          // scroll to the review section
          reviewItems[reviewItems.length - 2].scrollIntoView({ behavior: 'instant', block: 'center' });
        } else {
          window.scrollBy(0, 600);
        }
      });
      await page.waitForTimeout(1000);

      const screenshotPath = path.join(PR_DIR, `pr${pr}_review.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot: pr${pr}_review.png`);
    } catch (err) {
      console.error(`Error capturing PR #${pr}:`, err.message);
    }
  }

  await browser.close();
  console.log('All PR screenshots captured successfully!');
}

capturePRs().catch(console.error);

