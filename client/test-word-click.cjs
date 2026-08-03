const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173/reading', { waitUntil: 'networkidle', timeout: 10000 });
    
    const lineBtn = await page.$('.reading-hub-grid > div:nth-child(1)');
    if (lineBtn) {
        await lineBtn.click();
        await page.waitForTimeout(1000);
        
        // click a word
        const words = await page.$$('.phoneme-word');
        if (words.length > 0) {
            console.log('Clicking word 0');
            await words[0].click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'after_word_click.png' });
            console.log('Screenshotted after word click');
        } else {
            console.log('No words found');
        }
    }
  } catch (err) {
    console.error('SCRIPT_ERROR:', err);
  }
  
  await browser.close();
})();
