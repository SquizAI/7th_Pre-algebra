const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    const msgType = msg.type();
    const text = msg.text();
    console.log('CONSOLE [' + msgType + ']: ' + text);
  });

  try {
    console.log('Navigating to site...');
    await page.goto('https://6916a6843fca7c62b1a139b0--7th-grade-pre-algebra.netlify.app');
    await page.waitForLoadState('networkidle');
    
    console.log('Entering name...');
    await page.fill('input[placeholder="Enter your name"]', 'TestStudent');
    await page.click('button:has-text("Start Learning")');
    await page.waitForTimeout(2000);
    
    console.log('Clicking View All Lessons...');
    await page.click('button:has-text("View All Lessons")');
    await page.waitForTimeout(2000);
    
    // See what screens are visible
    const screens = {
      welcome: await page.isVisible('#welcomeScreen'),
      menu: await page.isVisible('#menuScreen'),
      conceptIntro: await page.isVisible('#conceptIntroScreen'),
      video: await page.isVisible('#videoScreen'),
      examples: await page.isVisible('#examplesScreen'),
      game: await page.isVisible('#gameScreen')
    };
    
    console.log('\nVisible screens:', JSON.stringify(screens, null, 2));
    
    // Take screenshot
    await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/manual-test-1.png' });
    
    // Look for any back buttons on the page
    const backButtons = await page.locator('button:has-text("Back")').count();
    console.log('\nBack buttons found:', backButtons);
    
    if (backButtons > 0) {
      console.log('Clicking first back button...');
      await page.locator('button:has-text("Back")').first().click();
      await page.waitForTimeout(2000);
      
      const screensAfter = {
        welcome: await page.isVisible('#welcomeScreen'),
        menu: await page.isVisible('#menuScreen'),
        conceptIntro: await page.isVisible('#conceptIntroScreen'),
        video: await page.isVisible('#videoScreen'),
        examples: await page.isVisible('#examplesScreen'),
        game: await page.isVisible('#gameScreen')
      };
      
      console.log('\nVisible screens after back:', JSON.stringify(screensAfter, null, 2));
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/manual-test-2-after-back.png' });
    }
    
    // Wait for manual inspection
    console.log('\nKeeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('ERROR:', error.message);
    await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/manual-test-error.png' });
  }

  await browser.close();
})();
