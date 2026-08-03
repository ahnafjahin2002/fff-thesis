const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173/reading', { waitUntil: 'networkidle', timeout: 10000 });
    const btn = await page.$('.reading-hub-grid > div:nth-child(1)');
    if (btn) {
      console.log("Clicking line dhore pora...");
      await btn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshot.png' });
      console.log("Screenshot saved.");
    } else {
      console.log("Button not found on reading page, might already be inside");
    }
  } catch (err) {
    console.error('SCRIPT_ERROR:', err);
  }
  
  await browser.close();
})();
