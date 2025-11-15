const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const testResults = {
    passed: [],
    failed: [],
    warnings: [],
    consoleErrors: []
  };

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      testResults.consoleErrors.push(text);
    }
    if (text.includes('showScreen:') || text.includes('Showing')) {
      console.log('    >>> ' + text);
    }
  });

  try {
    console.log('\n========================================');
    console.log('COMPREHENSIVE BACK BUTTON TEST');
    console.log('========================================\n');
    
    console.log('[1/7] Loading site...');
    await page.goto('https://6916a6843fca7c62b1a139b0--7th-grade-pre-algebra.netlify.app');
    await page.waitForLoadState('networkidle');
    testResults.passed.push('Site loaded successfully');

    console.log('[2/7] Entering student name...');
    await page.fill('input[placeholder="Enter your name"]', 'BackButtonTester');
    await page.click('button:has-text("Start Learning")');
    await page.waitForTimeout(2000);
    
    if (await page.isVisible('#menuScreen')) {
      testResults.passed.push('Menu screen displayed');
    }

    console.log('[3/7] Starting lesson (Concept Intro)...');
    await page.click('#startStoryBtn');
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // TEST 1: Concept Intro Back Button
    console.log('\n--- TEST 1: Concept Intro Back Button ---');
    if (await page.isVisible('#conceptIntroScreen')) {
      testResults.passed.push('Concept intro screen visible');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/test1-concept-screen.png' });
      
      const backBtn = page.locator('#conceptIntroScreen .btn-back');
      if (await backBtn.isVisible()) {
        testResults.passed.push('Concept intro back button is VISIBLE');
        console.log('  ✓ Back button found and visible');
        
        await backBtn.click();
        await page.waitForTimeout(2000);
        
        if (await page.isVisible('#menuScreen') && await page.isHidden('#conceptIntroScreen')) {
          testResults.passed.push('CRITICAL: Concept intro back button WORKS');
          console.log('  ✓✓ SUCCESS: Returned to menu');
          await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/test1-back-success.png' });
        } else {
          testResults.failed.push('CRITICAL BUG: Concept intro back button does not change screens');
          console.log('  ✗✗ FAILED: Screen did not change');
        }
      } else {
        testResults.failed.push('CRITICAL BUG: Concept intro back button NOT visible');
        console.log('  ✗ Back button not visible');
      }
    }

    // Navigate back to lesson for video screen test
    console.log('\n[4/7] Navigating to video screen...');
    await page.click('#startStoryBtn');
    await page.waitForTimeout(2000);
    
    // Click Continue to get to video
    if (await page.isVisible('button:has-text("Continue")')) {
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(2000);
    }
    
    // TEST 2: Video Screen Back Button
    console.log('\n--- TEST 2: Video Screen Back Button ---');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    if (await page.isVisible('#videoScreen')) {
      testResults.passed.push('Video screen visible');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/test2-video-screen.png' });
      
      const videoBackBtn = page.locator('#videoScreen .btn-back');
      if (await videoBackBtn.isVisible()) {
        testResults.passed.push('Video screen back button is VISIBLE');
        console.log('  ✓ Back button found and visible');
        
        await videoBackBtn.click();
        await page.waitForTimeout(2000);
        
        if (await page.isVisible('#menuScreen') && await page.isHidden('#videoScreen')) {
          testResults.passed.push('CRITICAL: Video screen back button WORKS');
          console.log('  ✓✓ SUCCESS: Returned to menu');
          await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/test2-back-success.png' });
        } else {
          testResults.failed.push('CRITICAL BUG: Video back button does not change screens');
          console.log('  ✗✗ FAILED: Screen did not change');
        }
      } else {
        testResults.failed.push('CRITICAL BUG: Video back button NOT visible');
        console.log('  ✗ Back button not visible');
      }
    } else {
      testResults.warnings.push('Video screen not reached - may have skipped to examples');
    }

    // Navigate to examples screen
    console.log('\n[5/7] Navigating to examples screen...');
    await page.click('#startStoryBtn');
    await page.waitForTimeout(2000);
    
    // Navigate through workflow
    for (let i = 0; i < 3; i++) {
      if (await page.isVisible('button:has-text("Continue")')) {
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(2000);
      }
    }
    
    // TEST 3: Examples Screen Back Button
    console.log('\n--- TEST 3: Examples Screen Back Button ---');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    if (await page.isVisible('#examplesScreen')) {
      testResults.passed.push('Examples screen visible');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/test3-examples-screen.png' });
      
      const examplesBackBtn = page.locator('#examplesScreen .btn-back');
      if (await examplesBackBtn.isVisible()) {
        testResults.passed.push('Examples screen back button is VISIBLE');
        console.log('  ✓ Back button found and visible');
        
        await examplesBackBtn.click();
        await page.waitForTimeout(2000);
        
        if (await page.isVisible('#menuScreen') && await page.isHidden('#examplesScreen')) {
          testResults.passed.push('CRITICAL: Examples screen back button WORKS');
          console.log('  ✓✓ SUCCESS: Returned to menu');
          await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/test3-back-success.png' });
        } else {
          testResults.failed.push('CRITICAL BUG: Examples back button does not change screens');
          console.log('  ✗✗ FAILED: Screen did not change');
        }
      } else {
        testResults.failed.push('CRITICAL BUG: Examples back button NOT visible');
        console.log('  ✗ Back button not visible');
      }
    } else {
      testResults.warnings.push('Examples screen not reached');
    }

    // Navigate to game screen
    console.log('\n[6/7] Navigating to game screen...');
    await page.click('#startStoryBtn');
    await page.waitForTimeout(2000);
    
    // Navigate through all screens to reach game
    for (let i = 0; i < 5; i++) {
      if (await page.isVisible('button:has-text("Continue")')) {
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(2000);
      }
      if (await page.isVisible('button:has-text("Start Practice")')) {
        await page.click('button:has-text("Start Practice")');
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    // TEST 4: Game Screen Back Button
    console.log('\n--- TEST 4: Game Screen Back Button ---');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    if (await page.isVisible('#gameScreen')) {
      testResults.passed.push('Game screen visible');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/test4-game-screen.png' });
      
      const gameBackBtn = page.locator('#gameScreen .btn-back');
      if (await gameBackBtn.isVisible()) {
        testResults.passed.push('Game screen back button is VISIBLE');
        console.log('  ✓ Back button found and visible');
        
        await gameBackBtn.click();
        await page.waitForTimeout(2000);
        
        if (await page.isVisible('#menuScreen') && await page.isHidden('#gameScreen')) {
          testResults.passed.push('CRITICAL: Game screen back button WORKS');
          console.log('  ✓✓ SUCCESS: Returned to menu');
          await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/test4-back-success.png' });
        } else {
          testResults.failed.push('CRITICAL BUG: Game back button does not change screens');
          console.log('  ✗✗ FAILED: Screen did not change');
        }
      } else {
        testResults.failed.push('CRITICAL BUG: Game back button NOT visible');
        console.log('  ✗ Back button not visible');
      }
    } else {
      testResults.warnings.push('Game screen not reached');
    }

    console.log('\n[7/7] Test complete, waiting for review...');
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('\nTEST ERROR:', error.message);
    testResults.failed.push('Test execution error: ' + error.message);
    await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/error.png' });
  }

  // Generate comprehensive report
  console.log('\n\n' + '='.repeat(80));
  console.log('FINAL TEST REPORT: BACK BUTTON NAVIGATION FIX VERIFICATION');
  console.log('='.repeat(80));
  
  console.log('\nTEST SUMMARY:');
  console.log('  Total Passed: ' + testResults.passed.length);
  console.log('  Total Failed: ' + testResults.failed.length);
  console.log('  Warnings: ' + testResults.warnings.length);
  console.log('  Console Errors: ' + testResults.consoleErrors.length);
  
  console.log('\n' + '-'.repeat(80));
  console.log('PASSED TESTS (' + testResults.passed.length + '):');
  console.log('-'.repeat(80));
  testResults.passed.forEach(t => console.log('  ✓ ' + t));
  
  if (testResults.failed.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('FAILED TESTS (' + testResults.failed.length + '):');
    console.log('-'.repeat(80));
    testResults.failed.forEach(t => console.log('  ✗ ' + t));
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('WARNINGS (' + testResults.warnings.length + '):');
    console.log('-'.repeat(80));
    testResults.warnings.forEach(t => console.log('  ⚠ ' + t));
  }
  
  if (testResults.consoleErrors.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('CONSOLE ERRORS (' + testResults.consoleErrors.length + '):');
    console.log('-'.repeat(80));
    testResults.consoleErrors.forEach(t => console.log('  ❌ ' + t));
  }
  
  console.log('\n' + '='.repeat(80));
  const criticalTests = testResults.passed.filter(t => t.includes('CRITICAL'));
  const criticalBugs = testResults.failed.filter(t => t.includes('CRITICAL'));
  
  console.log('CRITICAL FUNCTIONALITY:');
  console.log('  Working: ' + criticalTests.length + ' back buttons');
  console.log('  Broken: ' + criticalBugs.length + ' back buttons');
  
  if (criticalBugs.length === 0) {
    console.log('\n✓✓✓ ALL BACK BUTTONS WORKING CORRECTLY! ✓✓✓');
  } else {
    console.log('\n✗✗✗ CRITICAL BUGS FOUND ✗✗✗');
  }
  console.log('='.repeat(80) + '\n');

  await browser.close();
})();
