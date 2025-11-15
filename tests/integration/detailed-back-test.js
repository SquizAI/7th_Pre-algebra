const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  const testResults = {
    passed: [],
    failed: [],
    criticalBugs: []
  };

  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('showScreen:') || text.includes('Showing') || text.includes('screen')) {
      console.log('>>> ' + text);
    }
  });

  try {
    console.log('1. Loading site...');
    await page.goto('https://6916a6843fca7c62b1a139b0--7th-grade-pre-algebra.netlify.app');
    await page.waitForLoadState('networkidle');

    console.log('2. Entering name...');
    await page.fill('input[placeholder="Enter your name"]', 'TestStudent');
    await page.click('button:has-text("Start Learning")');
    await page.waitForTimeout(2000);

    console.log('3. Starting lesson...');
    await page.click('#startStoryBtn');
    await page.waitForTimeout(2000);
    
    // Scroll to top to ensure back button is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    console.log('\n=== CONCEPT INTRO SCREEN ANALYSIS ===');
    const conceptVisible = await page.isVisible('#conceptIntroScreen');
    console.log('Concept intro screen visible:', conceptVisible);
    
    // Take full-page screenshot
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/fullpage-concept.png',
      fullPage: true 
    });
    
    // Check for back button in multiple ways
    const backBtnSelectors = [
      'button:has-text("Back to Menu")',
      '.btn-back',
      'button[onclick*="showScreen"]',
      '#conceptIntroScreen button:has-text("Back")',
      '#conceptIntroScreen .btn-back'
    ];
    
    console.log('\nSearching for back button with different selectors:');
    for (const selector of backBtnSelectors) {
      const count = await page.locator(selector).count();
      const visible = count > 0 ? await page.locator(selector).first().isVisible() : false;
      console.log('  ' + selector + ': count=' + count + ', visible=' + visible);
      
      if (count > 0) {
        // Get computed style
        const styles = await page.locator(selector).first().evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            position: computed.position,
            top: computed.top,
            left: computed.left,
            zIndex: computed.zIndex
          };
        });
        console.log('    Styles:', JSON.stringify(styles));
      }
    }
    
    // Check if button exists in DOM
    const backBtnExists = await page.locator('.btn-back').count();
    console.log('\nBack button (.btn-back) exists in DOM:', backBtnExists > 0);
    
    if (backBtnExists > 0) {
      const backBtn = page.locator('.btn-back').first();
      
      // Get all info about the button
      const btnInfo = await backBtn.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);
        return {
          text: el.textContent,
          class: el.className,
          isVisible: rect.width > 0 && rect.height > 0,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          parentDisplay: window.getComputedStyle(el.parentElement).display,
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity
        };
      });
      
      console.log('\nBack button details:', JSON.stringify(btnInfo, null, 2));
      
      if (btnInfo.isVisible) {
        console.log('\n✓ Back button IS visible, attempting click...');
        testResults.passed.push('Back button is visible');
        
        await backBtn.click();
        await page.waitForTimeout(2000);
        
        const menuAfter = await page.isVisible('#menuScreen');
        const conceptAfter = await page.isHidden('#conceptIntroScreen');
        
        console.log('After click:');
        console.log('  Menu visible:', menuAfter);
        console.log('  Concept hidden:', conceptAfter);
        
        if (menuAfter && conceptAfter) {
          console.log('\n✓✓✓ SUCCESS! Back button works correctly!');
          testResults.passed.push('CRITICAL: Back button functionality WORKS');
          await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/success-back-to-menu.png' });
        } else {
          console.log('\n✗✗✗ BUG! Back button clicked but screen did not change!');
          testResults.criticalBugs.push('Back button does not change screens');
          await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/bug-no-screen-change.png' });
        }
      } else {
        console.log('\n✗✗✗ CRITICAL BUG! Back button exists but is NOT VISIBLE!');
        testResults.criticalBugs.push('Back button is hidden (display/visibility issue)');
        console.log('Button rect:', btnInfo.rect);
        console.log('Button styles - display:', btnInfo.display, 'visibility:', btnInfo.visibility);
      }
    } else {
      console.log('\n✗✗✗ CRITICAL BUG! Back button does NOT exist in DOM!');
      testResults.criticalBugs.push('Back button missing from DOM');
    }
    
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('\nERROR:', error.message);
    testResults.failed.push(error.message);
  }

  // Final report
  console.log('\n' + '='.repeat(80));
  console.log('DETAILED BACK BUTTON TEST REPORT');
  console.log('='.repeat(80));
  console.log('\nPASSED:', testResults.passed.length);
  testResults.passed.forEach(t => console.log('  ✓', t));
  console.log('\nCRITICAL BUGS:', testResults.criticalBugs.length);
  testResults.criticalBugs.forEach(t => console.log('  ✗', t));
  console.log('\nFAILED:', testResults.failed.length);
  testResults.failed.forEach(t => console.log('  ✗', t));
  console.log('='.repeat(80) + '\n');

  await browser.close();
})();
