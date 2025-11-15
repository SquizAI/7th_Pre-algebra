const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const geminiRequests = [];
  let requestCounter = 0;

  page.on('request', request => {
    const url = request.url();
    if (url.includes('gemini-api') || url.includes('word-problem') || url.includes('.netlify/functions')) {
      console.log('\n=== REQUEST #' + (++requestCounter) + ' ===');
      console.log('URL:', url);
      console.log('Method:', request.method());
      
      const postData = request.postData();
      if (postData) {
        console.log('POST Data:');
        try {
          console.log(JSON.stringify(JSON.parse(postData), null, 2));
        } catch {
          console.log(postData);
        }
      }
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('gemini-api') || url.includes('word-problem') || url.includes('.netlify/functions')) {
      console.log('\n=== RESPONSE ===');
      console.log('URL:', url);
      console.log('Status:', response.status(), response.statusText());
      
      try {
        const contentType = response.headers()['content-type'];
        let body;
        
        if (contentType && contentType.includes('application/json')) {
          body = await response.json();
          console.log('Response Body (JSON):');
          console.log(JSON.stringify(body, null, 2));
        } else {
          body = await response.text();
          console.log('Response Body (Text):', body.substring(0, 500));
        }
        
        geminiRequests.push({
          timestamp: new Date().toISOString(),
          url: url,
          status: response.status(),
          statusText: response.statusText(),
          body: body,
          request: {
            url: response.request().url(),
            method: response.request().method(),
            postData: response.request().postData()
          }
        });
        
        fs.writeFileSync(
          '/Users/mattysquarzoni/Documents/7th-PreAlgebra/gemini-debug.json',
          JSON.stringify(geminiRequests, null, 2)
        );
      } catch (e) {
        console.error('Error reading response:', e.message);
      }
    }
  });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Gemini') || text.includes('word problem') || text.includes('Word Problem') || 
        text.includes('API') || text.includes('fetch') || text.includes('error')) {
      console.log('[Browser Console]:', text);
    }
  });

  console.log('Navigating to site...');
  await page.goto('https://6916b7543620c585e7058fa2--7th-grade-pre-algebra.netlify.app');
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({ 
    path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/01-home.png',
    fullPage: true 
  });

  console.log('\nLooking for lesson start button...');
  
  const possibleButtons = [
    'button:has-text("Start This Level")',
    'button:has-text("Start Lesson")',
    'button:has-text("Go to Lesson")',
    'button:has-text("Continue")',
    '.lesson-button',
    '[class*="start"]'
  ];

  let lessonStarted = false;
  for (const selector of possibleButtons) {
    try {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 2000 })) {
        console.log('Found button with selector: ' + selector);
        await button.click();
        console.log('Clicked start button');
        lessonStarted = true;
        await page.waitForTimeout(3000);
        break;
      }
    } catch (e) {
      // Try next selector
    }
  }

  if (!lessonStarted) {
    console.log('Could not find lesson start button. Taking screenshot...');
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/02-no-button.png',
      fullPage: true 
    });
  } else {
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/02-lesson-started.png',
      fullPage: true 
    });
  }

  console.log('\nAdvancing through exercises to find word problem...');
  
  for (let i = 0; i < 10; i++) {
    console.log('\nStep ' + (i + 1) + ':');
    
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/exercise-' + (i + 1) + '.png',
      fullPage: true 
    });
    
    const pageContent = await page.content();
    if (pageContent.includes('word problem') || pageContent.includes('Word Problem')) {
      console.log('Found word problem content!');
      await page.screenshot({ 
        path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/WORD-PROBLEM-FOUND.png',
        fullPage: true 
      });
    }
    
    const advanceButtons = [
      'button:has-text("Next")',
      'button:has-text("Continue")',
      'button:has-text("Submit")',
      'button:has-text("Check")',
      '.next-button',
      '.continue-button'
    ];
    
    let advanced = false;
    for (const selector of advanceButtons) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 })) {
          console.log('Clicking: ' + selector);
          await button.click();
          advanced = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Try next
      }
    }
    
    if (!advanced) {
      console.log('No more advance buttons found');
      break;
    }
  }

  console.log('\n=== FINAL SUMMARY ===');
  console.log('Captured ' + geminiRequests.length + ' API requests');
  if (geminiRequests.length > 0) {
    console.log('\nAPI Requests:');
    geminiRequests.forEach((req, idx) => {
      console.log('\n' + (idx + 1) + '. ' + req.url);
      console.log('   Status: ' + req.status + ' ' + req.statusText);
      if (req.body) {
        console.log('   Response: ' + JSON.stringify(req.body).substring(0, 200) + '...');
      }
    });
  }

  console.log('\nBrowser staying open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
})();
