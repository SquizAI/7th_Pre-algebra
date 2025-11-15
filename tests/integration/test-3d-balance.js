const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('\n========================================');
  console.log('3D BALANCE VISUALIZATION TEST');
  console.log('========================================\n');
  
  try {
    // Navigate to the app
    console.log('Step 1: Navigating to app...');
    await page.goto('https://6916b7543620c585e7058fa2--7th-grade-pre-algebra.netlify.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);
    
    // Enter name
    console.log('Step 2: Entering name...');
    const nameInput = await page.locator('#playerName, input[type="text"]').first();
    await nameInput.fill('TestUser3D');
    await page.waitForTimeout(500);
    
    // Click Start Lesson
    console.log('Step 3: Clicking Start Lesson...');
    const startButton = await page.locator('button:has-text("Start Lesson"), button:has-text("Start")').first();
    await startButton.click();
    await page.waitForTimeout(3000);
    
    // Check for #threeContainer
    console.log('\nStep 4: Checking for #threeContainer...');
    const threeContainer = await page.locator('#threeContainer');
    const containerExists = await threeContainer.count() > 0;
    console.log(`  - #threeContainer exists: ${containerExists}`);
    
    if (containerExists) {
      const containerVisible = await threeContainer.isVisible();
      console.log(`  - #threeContainer visible: ${containerVisible}`);
      
      // Get container dimensions
      const containerBox = await threeContainer.boundingBox();
      if (containerBox) {
        console.log(`  - Container dimensions: ${containerBox.width}px x ${containerBox.height}px`);
        console.log(`  - Container position: (${containerBox.x}, ${containerBox.y})`);
      }
    }
    
    // Check for canvas element
    console.log('\nStep 5: Checking for <canvas> element...');
    const canvas = await page.locator('#threeContainer canvas, canvas').first();
    const canvasExists = await canvas.count() > 0;
    console.log(`  - Canvas exists: ${canvasExists}`);
    
    if (canvasExists) {
      const canvasVisible = await canvas.isVisible();
      console.log(`  - Canvas visible: ${canvasVisible}`);
      
      // Get canvas attributes
      const width = await canvas.getAttribute('width');
      const height = await canvas.getAttribute('height');
      const style = await canvas.getAttribute('style');
      
      console.log(`  - Canvas width attribute: ${width}`);
      console.log(`  - Canvas height attribute: ${height}`);
      console.log(`  - Canvas style: ${style || 'none'}`);
      
      // Get computed dimensions
      const canvasBox = await canvas.boundingBox();
      if (canvasBox) {
        console.log(`  - Canvas rendered dimensions: ${canvasBox.width}px x ${canvasBox.height}px`);
      }
    }
    
    // Take screenshot of visualization area
    console.log('\nStep 6: Taking screenshot of visualization area...');
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/3d-balance-full.png',
      fullPage: false
    });
    console.log('  - Full page screenshot saved');
    
    if (containerExists) {
      await threeContainer.screenshot({ 
        path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/3d-balance-container.png'
      });
      console.log('  - Container screenshot saved');
    }
    
    // Check console for Three.js errors
    console.log('\nStep 7: Checking console messages...');
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    // Wait a bit for any late-loading scripts
    await page.waitForTimeout(2000);
    
    // Get all console messages
    const logs = await page.evaluate(() => {
      return window.__consoleLog || [];
    });
    
    // Check for errors in browser console
    const errors = [];
    const warnings = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check for Three.js specific elements
    console.log('\nStep 8: Checking for Three.js initialization...');
    const threeJsCheck = await page.evaluate(() => {
      return {
        threeLoaded: typeof THREE !== 'undefined',
        hasWebGL: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
          } catch (e) {
            return false;
          }
        })(),
        canvasContext: (() => {
          const canvas = document.querySelector('#threeContainer canvas, canvas');
          if (canvas) {
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return gl ? 'WebGL' : canvas.getContext('2d') ? '2D' : 'none';
          }
          return 'no canvas';
        })()
      };
    });
    
    console.log(`  - Three.js loaded: ${threeJsCheck.threeLoaded}`);
    console.log(`  - WebGL supported: ${threeJsCheck.hasWebGL}`);
    console.log(`  - Canvas context: ${threeJsCheck.canvasContext}`);
    
    // Summary Report
    console.log('\n========================================');
    console.log('TEST REPORT SUMMARY');
    console.log('========================================\n');
    
    console.log('CANVAS ELEMENT:');
    console.log(`  Status: ${canvasExists ? 'EXISTS' : 'MISSING'}`);
    
    if (canvasExists) {
      const width = await canvas.getAttribute('width');
      const height = await canvas.getAttribute('height');
      console.log(`  Dimensions: ${width} x ${height}`);
    }
    
    console.log('\nTHREE.JS STATUS:');
    console.log(`  Library loaded: ${threeJsCheck.threeLoaded}`);
    console.log(`  WebGL support: ${threeJsCheck.hasWebGL}`);
    console.log(`  Canvas context: ${threeJsCheck.canvasContext}`);
    
    console.log('\nCONSOLE ERRORS:');
    if (errors.length === 0) {
      console.log('  No errors detected');
    } else {
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
    console.log('\nSCREENSHOTS:');
    console.log('  - /Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/3d-balance-full.png');
    if (containerExists) {
      console.log('  - /Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/3d-balance-container.png');
    }
    
    console.log('\n========================================\n');
    
    // Keep browser open for manual inspection
    console.log('Browser will remain open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('\nERROR during test:', error.message);
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/3d-balance-error.png'
    });
  } finally {
    await browser.close();
  }
})();
