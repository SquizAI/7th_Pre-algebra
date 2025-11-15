const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Enable request/response logging
  const apiCalls = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('gemini-api') || url.includes('functions')) {
      console.log('\n=== API CALL DETECTED ===');
      console.log('URL:', url);
      console.log('Status:', response.status());
      try {
        const responseData = await response.json();
        console.log('Response payload:', JSON.stringify(responseData, null, 2));
        apiCalls.push({
          url,
          status: response.status(),
          data: responseData
        });
      } catch (e) {
        console.log('Could not parse response as JSON:', e.message);
        try {
          const text = await response.text();
          console.log('Response text (first 500 chars):', text.substring(0, 500));
        } catch (err) {
          console.log('Could not get response text');
        }
      }
    }
  });
  
  // Log console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('word') || text.includes('Word') || text.includes('problem') || text.includes('Problem')) {
      console.log('BROWSER LOG (word/problem related):', text);
    }
  });
  
  console.log('Step 1: Navigating to site...');
  await page.goto('https://6916b7543620c585e7058fa2--7th-grade-pre-algebra.netlify.app', {
    waitUntil: 'networkidle'
  });
  
  await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/wp-step1-landing.png' });
  
  console.log('\nStep 2: Entering name...');
  await page.waitForSelector('#studentNameInput', { timeout: 5000 });
  await page.fill('#studentNameInput', 'TestStudent');
  
  console.log('\nStep 3: Clicking Start Learning to dismiss modal...');
  await page.click('#submitNameBtn');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/wp-step2-modal-dismissed.png' });
  
  console.log('\nStep 4: Clicking "Go to Lessons" button...');
  await page.click('button:has-text("Go to Lessons")');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/wp-step3-lessons-view.png' });
  
  console.log('\nStep 5: Looking for level selector or starting first level...');
  // Try to find and click level 1
  const level1Exists = await page.locator('button:has-text("Level 1")').count();
  if (level1Exists > 0) {
    console.log('Found Level 1 button, clicking...');
    await page.click('button:has-text("Level 1")');
  } else {
    console.log('No Level 1 button, looking for other level buttons...');
    await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/wp-no-level1.png', fullPage: true });
  }
  
  console.log('\nStep 6: Waiting for game screen to load...');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/wp-step4-game-loaded.png', fullPage: true });
  
  console.log('\nStep 7: Waiting 5 seconds for word problem generation...');
  await page.waitForTimeout(5000);
  
  console.log('\nStep 8: Checking #wordProblemSection visibility...');
  const wpSectionVisible = await page.evaluate(() => {
    const section = document.querySelector('#wordProblemSection');
    if (!section) return { exists: false };
    const style = window.getComputedStyle(section);
    return {
      exists: true,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      offsetWidth: section.offsetWidth,
      offsetHeight: section.offsetHeight,
      innerHTML: section.innerHTML.substring(0, 500)
    };
  });
  console.log('Word Problem Section:', JSON.stringify(wpSectionVisible, null, 2));
  
  console.log('\nStep 9: Checking #wordProblemText content...');
  const wpText = await page.evaluate(() => {
    const element = document.querySelector('#wordProblemText');
    if (!element) return { exists: false };
    return {
      exists: true,
      innerHTML: element.innerHTML,
      textContent: element.textContent,
      classes: element.className
    };
  });
  console.log('Word Problem Text:', JSON.stringify(wpText, null, 2));
  
  console.log('\nStep 10: Taking screenshot of word problem area...');
  try {
    const wpElement = await page.locator('#wordProblemSection');
    if (await wpElement.count() > 0) {
      await wpElement.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/wp-section-detail.png' });
      console.log('Screenshot saved');
    } else {
      console.log('Word problem section not found in DOM');
    }
  } catch (e) {
    console.log('Could not screenshot word problem section:', e.message);
  }
  
  await page.screenshot({ path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/wp-step5-final-state.png', fullPage: true });
  
  console.log('\n=== API CALLS SUMMARY ===');
  console.log('Total API calls to functions: ' + apiCalls.length);
  if (apiCalls.length === 0) {
    console.log('NO API CALLS DETECTED - Word problem may not have been generated');
  }
  apiCalls.forEach((call, index) => {
    console.log('\nCall ' + (index + 1) + ':');
    console.log('URL:', call.url);
    console.log('Status:', call.status);
    console.log('Data:', JSON.stringify(call.data, null, 2));
  });
  
  console.log('\n=== ADDITIONAL DEBUGGING INFO ===');
  const debugInfo = await page.evaluate(() => {
    return {
      gameState: window.game ? {
        currentLevel: window.game.currentLevel,
        coins: window.game.coins,
        xp: window.game.xp
      } : 'game object not found',
      currentEquation: window.game ? window.game.currentEquation : 'no current equation',
      allWordProblemElements: Array.from(document.querySelectorAll('[id*="word"], [id*="Word"], [id*="problem"], [id*="Problem"]')).map(el => ({
        tag: el.tagName,
        id: el.id,
        class: el.className,
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        textContent: el.textContent ? el.textContent.substring(0, 100) : ''
      })),
      gameScreens: Array.from(document.querySelectorAll('[id*="Screen"], [id*="screen"]')).map(el => ({
        id: el.id,
        display: window.getComputedStyle(el).display
      }))
    };
  });
  console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('Screenshots saved to test-screenshots/');
  
  // Keep browser open for manual inspection
  console.log('\nKeeping browser open for 10 seconds for manual inspection...');
  await page.waitForTimeout(10000);
  await browser.close();
})();
