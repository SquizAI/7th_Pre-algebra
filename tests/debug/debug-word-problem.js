const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Store network requests
  const geminiRequests = [];

  // Listen to all network requests
  page.on('request', request => {
    if (request.url().includes('gemini-api') || request.url().includes('word-problem')) {
      console.log('\n=== REQUEST ===');
      console.log('URL:', request.url());
      console.log('Method:', request.method());
      console.log('Headers:', JSON.stringify(request.headers(), null, 2));
      
      const postData = request.postData();
      if (postData) {
        console.log('POST Data:', postData);
      }
    }
  });

  // Listen to all network responses
  page.on('response', async response => {
    if (response.url().includes('gemini-api') || response.url().includes('word-problem')) {
      console.log('\n=== RESPONSE ===');
      console.log('URL:', response.url());
      console.log('Status:', response.status());
      console.log('Headers:', JSON.stringify(response.headers(), null, 2));
      
      try {
        const body = await response.text();
        console.log('Response Body:', body);
        
        geminiRequests.push({
          url: response.url(),
          status: response.status(),
          body: body,
          request: {
            url: response.request().url(),
            method: response.request().method(),
            postData: response.request().postData()
          }
        });
        
        // Save to file
        fs.writeFileSync(
          '/Users/mattysquarzoni/Documents/7th-PreAlgebra/gemini-debug.json',
          JSON.stringify(geminiRequests, null, 2)
        );
      } catch (e) {
        console.error('Error reading response:', e);
      }
    }
  });

  // Listen to console messages
  page.on('console', msg => {
    if (msg.text().includes('Gemini') || msg.text().includes('word problem')) {
      console.log('Browser Console:', msg.text());
    }
  });

  console.log('Navigating to site...');
  await page.goto('https://6916b7543620c585e7058fa2--7th-grade-pre-algebra.netlify.app');
  
  console.log('Waiting for page to load...');
  await page.waitForTimeout(3000);

  // Take initial screenshot
  await page.screenshot({ 
    path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/01-initial-load.png',
    fullPage: true 
  });

  // Enter name
  console.log('Looking for name input...');
  const nameInput = await page.locator('input[type="text"]').first();
  if (await nameInput.isVisible()) {
    console.log('Entering name...');
    await nameInput.fill('Test Student');
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/02-name-entered.png',
      fullPage: true 
    });
  }

  // Click start button
  console.log('Looking for start button...');
  const startButton = await page.locator('button:has-text("Start")').first();
  if (await startButton.isVisible()) {
    console.log('Clicking start button...');
    await startButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/03-lesson-started.png',
      fullPage: true 
    });
  }

  // Look for lesson 1 or any lesson button
  console.log('Looking for lesson to start...');
  const lessonButton = await page.locator('button:has-text("Start Lesson"), button:has-text("Lesson 1"), .lesson-button').first();
  if (await lessonButton.isVisible()) {
    console.log('Starting lesson...');
    await lessonButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/04-in-lesson.png',
      fullPage: true 
    });
  }

  // Wait for word problem to potentially load
  console.log('Waiting for word problem to generate...');
  await page.waitForTimeout(10000);

  await page.screenshot({ 
    path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/screenshots/05-word-problem.png',
    fullPage: true 
  });

  console.log('\n=== SUMMARY ===');
  console.log(`Captured ${geminiRequests.length} Gemini API requests`);
  console.log('Check gemini-debug.json for full details');

  // Keep browser open for manual inspection
  console.log('\nBrowser will stay open for 60 seconds for manual inspection...');
  await page.waitForTimeout(60000);

  await browser.close();
})();
