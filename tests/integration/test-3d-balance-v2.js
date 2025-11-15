const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  // Capture console messages and errors
  const consoleMessages = [];
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') errors.push(text);
    if (msg.type() === 'warning') warnings.push(text);
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });
  
  console.log('\n========================================');
  console.log('3D BALANCE VISUALIZATION TEST v2');
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
    
    // Click Start Lesson button (first one)
    console.log('Step 3: Clicking Start Lesson (to reach lesson card)...');
    const startButton = await page.locator('button:has-text("Start Lesson"), button:has-text("Start")').first();
    await startButton.click();
    await page.waitForTimeout(2000);
    
    // Now click the actual "Start Lesson" button on the lesson card
    console.log('Step 4: Clicking Start Lesson on lesson card (to reach game)...');
    const startLessonCard = await page.locator('button:has-text("Start Lesson")').first();
    await startLessonCard.click();
    await page.waitForTimeout(3000);
    
    // Take screenshot of the game screen
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/3d-game-screen.png'
    });
    console.log('  - Game screen screenshot saved');
    
    // Check for #threeContainer
    console.log('\nStep 5: Checking for #threeContainer...');
    const threeContainer = await page.locator('#threeContainer');
    const containerExists = await threeContainer.count() > 0;
    console.log(`  - #threeContainer exists: ${containerExists}`);
    
    if (containerExists) {
      const containerVisible = await threeContainer.isVisible();
      console.log(`  - #threeContainer visible: ${containerVisible}`);
      
      // Get container dimensions and styling
      const containerInfo = await page.evaluate(() => {
        const container = document.getElementById('threeContainer');
        if (!container) return null;
        
        const styles = window.getComputedStyle(container);
        const rect = container.getBoundingClientRect();
        
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          width: styles.width,
          height: styles.height,
          position: styles.position,
          zIndex: styles.zIndex,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          innerHTML: container.innerHTML.substring(0, 200)
        };
      });
      
      console.log('  - Container computed styles:');
      console.log(`    - display: ${containerInfo.display}`);
      console.log(`    - visibility: ${containerInfo.visibility}`);
      console.log(`    - opacity: ${containerInfo.opacity}`);
      console.log(`    - width: ${containerInfo.width}`);
      console.log(`    - height: ${containerInfo.height}`);
      console.log(`    - position: ${containerInfo.position}`);
      console.log(`    - z-index: ${containerInfo.zIndex}`);
      console.log(`  - Container bounding box: ${containerInfo.rect.width}px x ${containerInfo.rect.height}px at (${containerInfo.rect.x}, ${containerInfo.rect.y})`);
      console.log(`  - Container innerHTML preview: ${containerInfo.innerHTML}`);
    }
    
    // Check for canvas element
    console.log('\nStep 6: Checking for <canvas> element...');
    const canvasAll = await page.locator('canvas').all();
    console.log(`  - Total canvas elements found: ${canvasAll.length}`);
    
    for (let i = 0; i < canvasAll.length; i++) {
      const canvas = canvasAll[i];
      const canvasInfo = await canvas.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return {
          id: el.id,
          width: el.width,
          height: el.height,
          styleWidth: el.style.width,
          styleHeight: el.style.height,
          visible: rect.width > 0 && rect.height > 0,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          parent: el.parentElement ? el.parentElement.id : 'no parent'
        };
      });
      
      console.log(`  - Canvas #${i + 1}:`);
      console.log(`    - id: ${canvasInfo.id || 'none'}`);
      console.log(`    - parent: ${canvasInfo.parent}`);
      console.log(`    - width attr: ${canvasInfo.width}`);
      console.log(`    - height attr: ${canvasInfo.height}`);
      console.log(`    - style width: ${canvasInfo.styleWidth || 'none'}`);
      console.log(`    - style height: ${canvasInfo.styleHeight || 'none'}`);
      console.log(`    - rendered: ${canvasInfo.rect.width}px x ${canvasInfo.rect.height}px`);
      console.log(`    - visible: ${canvasInfo.visible}`);
    }
    
    // Check for Three.js initialization
    console.log('\nStep 7: Checking Three.js initialization...');
    const threeJsCheck = await page.evaluate(() => {
      return {
        threeLoaded: typeof THREE !== 'undefined',
        threeVersion: typeof THREE !== 'undefined' ? THREE.REVISION : 'N/A',
        hasWebGL: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
          } catch (e) {
            return false;
          }
        })(),
        canvasContext: (() => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) return 'WebGL';
            const ctx2d = canvas.getContext('2d');
            if (ctx2d) return '2D';
            return 'none';
          }
          return 'no canvas';
        })(),
        gameState: typeof game !== 'undefined' ? 'game object exists' : 'no game object',
        balanceExists: typeof balance !== 'undefined' ? 'balance object exists' : 'no balance object'
      };
    });
    
    console.log(`  - Three.js loaded: ${threeJsCheck.threeLoaded}`);
    console.log(`  - Three.js version: ${threeJsCheck.threeVersion}`);
    console.log(`  - WebGL supported: ${threeJsCheck.hasWebGL}`);
    console.log(`  - Canvas context: ${threeJsCheck.canvasContext}`);
    console.log(`  - Game state: ${threeJsCheck.gameState}`);
    console.log(`  - Balance state: ${threeJsCheck.balanceExists}`);
    
    // Check console messages
    console.log('\nStep 8: Console Messages...');
    const threeRelated = consoleMessages.filter(msg => 
      msg.text.toLowerCase().includes('three') || 
      msg.text.toLowerCase().includes('webgl') ||
      msg.text.toLowerCase().includes('canvas') ||
      msg.text.toLowerCase().includes('balance')
    );
    
    if (threeRelated.length > 0) {
      console.log('  Three.js/WebGL related messages:');
      threeRelated.forEach(msg => {
        console.log(`    [${msg.type}] ${msg.text}`);
      });
    } else {
      console.log('  No Three.js/WebGL related console messages');
    }
    
    // Summary Report
    console.log('\n========================================');
    console.log('TEST REPORT SUMMARY');
    console.log('========================================\n');
    
    console.log('CONTAINER STATUS:');
    console.log(`  #threeContainer exists: ${containerExists ? 'YES' : 'NO'}`);
    if (containerExists) {
      const visible = await threeContainer.isVisible();
      console.log(`  #threeContainer visible: ${visible ? 'YES' : 'NO'}`);
    }
    
    console.log('\nCANVAS ELEMENT:');
    console.log(`  Canvas count: ${canvasAll.length}`);
    if (canvasAll.length > 0) {
      const firstCanvas = canvasAll[0];
      const info = await firstCanvas.evaluate(el => ({
        width: el.width,
        height: el.height,
        visible: el.getBoundingClientRect().width > 0
      }));
      console.log(`  First canvas dimensions: ${info.width} x ${info.height}`);
      console.log(`  First canvas visible: ${info.visible ? 'YES' : 'NO'}`);
    } else {
      console.log('  NO CANVAS FOUND - THIS IS A CRITICAL BUG!');
    }
    
    console.log('\nTHREE.JS STATUS:');
    console.log(`  Library loaded: ${threeJsCheck.threeLoaded ? 'YES' : 'NO'}`);
    console.log(`  Version: ${threeJsCheck.threeVersion}`);
    console.log(`  WebGL support: ${threeJsCheck.hasWebGL ? 'YES' : 'NO'}`);
    console.log(`  Canvas context: ${threeJsCheck.canvasContext}`);
    
    console.log('\nCONSOLE ERRORS:');
    if (errors.length === 0) {
      console.log('  No errors detected');
    } else {
      console.log(`  ${errors.length} error(s) found:`);
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }
    
    console.log('\nCONSOLE WARNINGS:');
    if (warnings.length === 0) {
      console.log('  No warnings detected');
    } else {
      console.log(`  ${warnings.length} warning(s) found:`);
      warnings.slice(0, 5).forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
      if (warnings.length > 5) {
        console.log(`  ... and ${warnings.length - 5} more`);
      }
    }
    
    console.log('\nSCREENSHOTS:');
    console.log('  - /Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/3d-game-screen.png');
    
    console.log('\n========================================');
    console.log('VERDICT:');
    
    if (canvasAll.length === 0) {
      console.log('CRITICAL BUG: No canvas element found!');
      console.log('The Three.js visualization is NOT rendering.');
    } else if (!threeJsCheck.threeLoaded) {
      console.log('CRITICAL BUG: Three.js library not loaded!');
    } else if (threeJsCheck.canvasContext === 'none' || threeJsCheck.canvasContext === 'no canvas') {
      console.log('CRITICAL BUG: Canvas has no rendering context!');
    } else {
      console.log('SUCCESS: Canvas exists and has rendering context!');
      console.log(`Context type: ${threeJsCheck.canvasContext}`);
    }
    
    console.log('========================================\n');
    
    // Keep browser open for manual inspection
    console.log('Browser will remain open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('\nERROR during test:', error.message);
    console.error(error.stack);
    await page.screenshot({ 
      path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/3d-balance-error-v2.png'
    });
  } finally {
    await browser.close();
  }
})();
