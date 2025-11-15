const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testResults = {
    passed: [],
    failed: [],
    warnings: [],
    consoleErrors: []
  };

  // Capture console logs and errors
  page.on('console', msg => {
    const msgType = msg.type();
    const text = msg.text();
    console.log('CONSOLE [' + msgType + ']: ' + text);
    
    if (msgType === 'error') {
      testResults.consoleErrors.push(text);
    }
    
    // Capture showScreen debug logs
    if (text.includes('showScreen:')) {
      console.log('>>> SCREEN CHANGE DEBUG: ' + text);
    }
  });

  // Capture page errors
  page.on('pageerror', err => {
    console.error('PAGE ERROR: ' + err.message);
    testResults.consoleErrors.push(err.message);
  });

  try {
    console.log('\n=== TEST 1: Navigate to site ===');
    await page.goto('https://6916a6843fca7c62b1a139b0--7th-grade-pre-algebra.netlify.app');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/01-initial-load.png' });
    testResults.passed.push('Page loaded successfully');

    console.log('\n=== TEST 2: Enter student name ===');
    await page.fill('input[placeholder="Enter your name"]', 'TestStudent');
    await page.click('button:has-text("Start Learning")');
    await page.waitForTimeout(1500);
    
    const menuVisible = await page.isVisible('#menuScreen');
    if (menuVisible) {
      testResults.passed.push('Menu screen visible after entering name');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/02-menu-screen.png' });
    } else {
      testResults.failed.push('Menu screen not visible after entering name');
    }

    console.log('\n=== TEST 3: Navigate to a lesson via sidebar ===');
    // Click "Go to Lessons" in the first lesson card
    await page.click('button:has-text("Go to Lessons")');
    await page.waitForTimeout(1500);
    
    // Check which screen is visible
    const conceptIntroVisible = await page.isVisible('#conceptIntroScreen');
    const videoVisible = await page.isVisible('#videoScreen');
    
    console.log('Concept intro visible: ' + conceptIntroVisible);
    console.log('Video visible: ' + videoVisible);
    
    if (conceptIntroVisible || videoVisible) {
      testResults.passed.push('Lesson started - concept or video screen visible');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/03-lesson-started.png' });
    } else {
      testResults.failed.push('No lesson screen visible after clicking Go to Lessons');
      await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/03-lesson-NOT-started.png' });
    }

    console.log('\n=== TEST 4: Test Concept Intro Back Button ===');
    if (conceptIntroVisible) {
      const backButton = await page.locator('#conceptIntroScreen button:has-text("Back to Menu")');
      const backButtonCount = await backButton.count();
      
      if (backButtonCount > 0) {
        const isClickable = await backButton.isEnabled();
        console.log('Back button exists and clickable: ' + isClickable);
        
        if (isClickable) {
          testResults.passed.push('Concept intro back button is clickable');
          
          await backButton.click();
          await page.waitForTimeout(1500);
          
          const menuVisibleAfter = await page.isVisible('#menuScreen');
          const conceptHidden = await page.isHidden('#conceptIntroScreen');
          
          console.log('Menu visible after back: ' + menuVisibleAfter);
          console.log('Concept intro hidden after back: ' + conceptHidden);
          
          if (menuVisibleAfter && conceptHidden) {
            testResults.passed.push('CRITICAL: Concept intro back button WORKS - returns to menu');
            await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/04-back-from-concept.png' });
          } else {
            testResults.failed.push('CRITICAL BUG: Concept intro back button does NOT work - screen not switching');
            await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/04-back-from-concept-FAILED.png' });
          }
          
          // Go back into lesson
          await page.waitForTimeout(500);
          await page.click('button:has-text("Go to Lessons")');
          await page.waitForTimeout(1500);
        } else {
          testResults.failed.push('Concept intro back button not clickable');
        }
      } else {
        testResults.warnings.push('No back button found on concept intro screen');
      }
    } else if (videoVisible) {
      testResults.warnings.push('Skipped concept intro test - went directly to video screen');
    }

    console.log('\n=== TEST 5: Navigate to Video Screen and Test Back Button ===');
    const continueButtons = await page.locator('button:has-text("Continue")');
    if (await continueButtons.count() > 0) {
      await continueButtons.first().click();
      await page.waitForTimeout(1500);
    }
    
    const videoScreenVisible = await page.isVisible('#videoScreen');
    console.log('Video screen visible: ' + videoScreenVisible);
    
    if (videoScreenVisible) {
      const videoBackButton = await page.locator('#videoScreen button:has-text("Back to Menu")');
      if (await videoBackButton.count() > 0) {
        const isClickable = await videoBackButton.isEnabled();
        console.log('Video back button clickable: ' + isClickable);
        
        if (isClickable) {
          testResults.passed.push('Video screen back button is clickable');
          
          await videoBackButton.click();
          await page.waitForTimeout(1500);
          
          const menuVisibleAfter = await page.isVisible('#menuScreen');
          const videoHidden = await page.isHidden('#videoScreen');
          
          console.log('Menu visible after video back: ' + menuVisibleAfter);
          console.log('Video hidden after back: ' + videoHidden);
          
          if (menuVisibleAfter && videoHidden) {
            testResults.passed.push('CRITICAL: Video back button WORKS - returns to menu');
            await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/05-back-from-video.png' });
          } else {
            testResults.failed.push('CRITICAL BUG: Video back button does NOT work');
            await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/05-back-from-video-FAILED.png' });
          }
          
          // Go back into lesson
          await page.waitForTimeout(500);
          await page.click('button:has-text("Go to Lessons")');
          await page.waitForTimeout(1500);
        }
      } else {
        testResults.warnings.push('No back button found on video screen');
      }
    }

    console.log('\n=== TEST 6: Navigate to Examples Screen and Test Back Button ===');
    for (let i = 0; i < 3; i++) {
      const continueBtn = await page.locator('button:has-text("Continue")');
      if (await continueBtn.count() > 0) {
        await continueBtn.first().click();
        await page.waitForTimeout(1500);
      }
    }
    
    const examplesVisible = await page.isVisible('#examplesScreen');
    console.log('Examples screen visible: ' + examplesVisible);
    
    if (examplesVisible) {
      const examplesBackButton = await page.locator('#examplesScreen button:has-text("Back to Menu")');
      if (await examplesBackButton.count() > 0) {
        const isClickable = await examplesBackButton.isEnabled();
        console.log('Examples back button clickable: ' + isClickable);
        
        if (isClickable) {
          testResults.passed.push('Examples screen back button is clickable');
          
          await examplesBackButton.click();
          await page.waitForTimeout(1500);
          
          const menuVisibleAfter = await page.isVisible('#menuScreen');
          const examplesHidden = await page.isHidden('#examplesScreen');
          
          console.log('Menu visible after examples back: ' + menuVisibleAfter);
          console.log('Examples hidden after back: ' + examplesHidden);
          
          if (menuVisibleAfter && examplesHidden) {
            testResults.passed.push('CRITICAL: Examples back button WORKS - returns to menu');
            await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/06-back-from-examples.png' });
          } else {
            testResults.failed.push('CRITICAL BUG: Examples back button does NOT work');
            await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/06-back-from-examples-FAILED.png' });
          }
          
          // Go back into lesson
          await page.waitForTimeout(500);
          await page.click('button:has-text("Go to Lessons")');
          await page.waitForTimeout(1500);
        }
      } else {
        testResults.warnings.push('No back button found on examples screen');
      }
    }

    console.log('\n=== TEST 7: Navigate to Game Screen and Test Back Button ===');
    for (let i = 0; i < 5; i++) {
      const continueBtn = await page.locator('button:has-text("Continue")');
      if (await continueBtn.count() > 0) {
        await continueBtn.first().click();
        await page.waitForTimeout(1500);
      }
    }
    
    const gameVisible = await page.isVisible('#gameScreen');
    console.log('Game screen visible: ' + gameVisible);
    
    if (gameVisible) {
      const gameBackButton = await page.locator('#gameScreen button:has-text("Back to Menu")');
      if (await gameBackButton.count() > 0) {
        const isClickable = await gameBackButton.isEnabled();
        console.log('Game back button clickable: ' + isClickable);
        
        if (isClickable) {
          testResults.passed.push('Game screen back button is clickable');
          
          await gameBackButton.click();
          await page.waitForTimeout(1500);
          
          const menuVisibleAfter = await page.isVisible('#menuScreen');
          const gameHidden = await page.isHidden('#gameScreen');
          
          console.log('Menu visible after game back: ' + menuVisibleAfter);
          console.log('Game hidden after back: ' + gameHidden);
          
          if (menuVisibleAfter && gameHidden) {
            testResults.passed.push('CRITICAL: Game back button WORKS - returns to menu');
            await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/07-back-from-game.png' });
          } else {
            testResults.failed.push('CRITICAL BUG: Game back button does NOT work');
            await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/07-back-from-game-FAILED.png' });
          }
        }
      } else {
        testResults.warnings.push('No back button found on game screen');
      }
    }

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('TEST ERROR: ' + error);
    testResults.failed.push('Test execution error: ' + error.message);
    await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/error-state.png' });
  }

  // Generate report
  console.log('\n\n' + '='.repeat(80));
  console.log('TEST REPORT: BACK BUTTON NAVIGATION');
  console.log('='.repeat(80));
  
  console.log('\n### PASSED TESTS (' + testResults.passed.length + ') ###');
  testResults.passed.forEach(test => console.log('  ✓ ' + test));
  
  console.log('\n### FAILED TESTS (' + testResults.failed.length + ') ###');
  if (testResults.failed.length === 0) {
    console.log('  None - All tests passed!');
  } else {
    testResults.failed.forEach(test => console.log('  ✗ ' + test));
  }
  
  console.log('\n### WARNINGS (' + testResults.warnings.length + ') ###');
  if (testResults.warnings.length === 0) {
    console.log('  None');
  } else {
    testResults.warnings.forEach(warning => console.log('  ⚠ ' + warning));
  }
  
  console.log('\n### CONSOLE ERRORS (' + testResults.consoleErrors.length + ') ###');
  if (testResults.consoleErrors.length === 0) {
    console.log('  None - No JavaScript errors!');
  } else {
    testResults.consoleErrors.forEach(error => console.log('  ❌ ' + error));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('OVERALL RESULT: ' + (testResults.failed.length === 0 ? 'ALL TESTS PASSED ✓' : 'TESTS FAILED ✗'));
  console.log('='.repeat(80) + '\n');

  await browser.close();
})();
