const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('Dashboard loaded');
    const act = await page.$('.dash-card-btn');
    if (act) {
        await act.click();
        await page.waitForTimeout(2000);
        console.log('Clicked dash card. Current URL:', page.url());
        
        // now find 'লাইন ধরে পড়া'
        const lineBtn = await page.$('.reading-hub-grid > div:nth-child(1)');
        if (lineBtn) {
            console.log('Clicking line dhore pora in hub...');
            await lineBtn.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'after_hub_click.png' });
            console.log('Screenshotted after hub click');
        } else {
            console.log('Line dhore pora btn not found');
        }
    }
  } catch (err) {
    console.error('SCRIPT_ERROR:', err);
  }
  
  await browser.close();
})();
