const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testResults = {
    passed: [],
    failed: [],
    warnings: [],
    consoleErrors: [],
    showScreenLogs: []
  };

  // Capture console logs
  page.on('console', msg => {
    const msgType = msg.type();
    const text = msg.text();
    console.log('CONSOLE [' + msgType + ']: ' + text);
    
    if (msgType === 'error') {
      testResults.consoleErrors.push(text);
    }
    
    // Capture showScreen debug logs
    if (text.includes('showScreen:')) {
      console.log('>>> SCREEN CHANGE: ' + text);
      testResults.showScreenLogs.push(text);
    }
  });

  page.on('pageerror', err => {
    console.error('PAGE ERROR: ' + err.message);
    testResults.consoleErrors.push(err.message);
  });

  try {
    console.log('\n========== TEST 1: Navigate to site ==========');
    await page.goto('https://6916a6843fca7c62b1a139b0--7th-grade-pre-algebra.netlify.app');
    await page.waitForLoadState('networkidle');
    testResults.passed.push('Page loaded successfully');

    console.log('\n========== TEST 2: Enter student name ==========');
    await page.fill('input[placeholder="Enter your name"]', 'TestStudent');
    await page.click('button:has-text("Start Learning")');
    await page.waitForTimeout(2000);
    
    if (await page.isVisible('#menuScreen')) {
      testResults.passed.push('Menu screen visible after entering name');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/step1-menu.png' });
    } else {
      testResults.failed.push('Menu screen not visible');
    }

    console.log('\n========== TEST 3: Click "Start This Level" button ==========');
    await page.click('#startStoryBtn');
    await page.waitForTimeout(2000);
    
    const conceptVisible = await page.isVisible('#conceptIntroScreen');
    const videoVisible = await page.isVisible('#videoScreen');
    console.log('Concept intro visible: ' + conceptVisible);
    console.log('Video visible: ' + videoVisible);
    
    if (conceptVisible || videoVisible) {
      testResults.passed.push('Successfully navigated to lesson screen');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/step2-lesson-screen.png' });
    } else {
      testResults.failed.push('Failed to navigate to lesson screen');
    }

    console.log('\n========== TEST 4: Test Back Button on Concept Intro ==========');
    if (conceptVisible) {
      const backBtn = page.locator('button:has-text("Back to Menu")').first();
      
      if (await backBtn.isVisible()) {
        testResults.passed.push('Back button is VISIBLE');
        console.log('CLICKING BACK BUTTON...');
        
        await backBtn.click();
        await page.waitForTimeout(2000);
        
        const menuAfter = await page.isVisible('#menuScreen');
        const conceptAfter = await page.isHidden('#conceptIntroScreen');
        
        console.log('After clicking back:');
        console.log('  Menu visible: ' + menuAfter);
        console.log('  Concept hidden: ' + conceptAfter);
        
        if (menuAfter && conceptAfter) {
          testResults.passed.push('CRITICAL SUCCESS: Back button WORKS - returned to menu!');
          await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/step3-back-to-menu.png' });
        } else {
          testResults.failed.push('CRITICAL BUG: Back button clicked but screen did NOT change!');
          await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/step3-FAILED.png' });
        }
        
        // Go back to lesson for next test
        await page.waitForTimeout(500);
        await page.click('#startStoryBtn');
        await page.waitForTimeout(2000);
      } else {
        testResults.failed.push('Back button exists but is NOT VISIBLE');
      }
    }

    console.log('\n========== TEST 5: Navigate to Video Screen and Test Back ==========');
    if (await page.isVisible('button:has-text("Continue")')) {
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(2000);
    }
    
    if (await page.isVisible('#videoScreen')) {
      testResults.passed.push('Video screen is visible');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/step4-video-screen.png' });
      
      const videoBackBtn = page.locator('#videoScreen button:has-text("Back to Menu")');
      if (await videoBackBtn.isVisible()) {
        testResults.passed.push('Video back button is VISIBLE');
        
        await videoBackBtn.click();
        await page.waitForTimeout(2000);
        
        const menuAfter = await page.isVisible('#menuScreen');
        const videoAfter = await page.isHidden('#videoScreen');
        
        console.log('After clicking video back:');
        console.log('  Menu visible: ' + menuAfter);
        console.log('  Video hidden: ' + videoAfter);
        
        if (menuAfter && videoAfter) {
          testResults.passed.push('CRITICAL SUCCESS: Video back button WORKS!');
          await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/step5-video-back-works.png' });
        } else {
          testResults.failed.push('CRITICAL BUG: Video back button does NOT work!');
        }
      }
    }

    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('TEST ERROR: ' + error.message);
    testResults.failed.push('Test error: ' + error.message);
    await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/error.png' });
  }

  // Generate report
  console.log('\n\n' + '='.repeat(80));
  console.log('BACK BUTTON NAVIGATION TEST REPORT');
  console.log('='.repeat(80));
  
  console.log('\nPASSED (' + testResults.passed.length + ')');
  testResults.passed.forEach(t => console.log('  ✓ ' + t));
  
  console.log('\nFAILED (' + testResults.failed.length + ')');
  if (testResults.failed.length === 0) {
    console.log('  NONE - All tests passed!');
  } else {
    testResults.failed.forEach(t => console.log('  ✗ ' + t));
  }
  
  console.log('\nWARNINGS (' + testResults.warnings.length + ')');
  testResults.warnings.forEach(t => console.log('  ⚠ ' + t));
  
  console.log('\nCONSOLE ERRORS (' + testResults.consoleErrors.length + ')');
  if (testResults.consoleErrors.length === 0) {
    console.log('  NONE');
  } else {
    testResults.consoleErrors.forEach(t => console.log('  ❌ ' + t));
  }
  
  console.log('\nSHOWSCREEN DEBUG LOGS (' + testResults.showScreenLogs.length + ')');
  testResults.showScreenLogs.forEach(t => console.log('  📺 ' + t));
  
  console.log('\n' + '='.repeat(80));
  const result = testResults.failed.length === 0 ? 'ALL TESTS PASSED!' : 'TESTS FAILED';
  console.log('RESULT: ' + result);
  console.log('='.repeat(80) + '\n');

  await browser.close();
})();
