const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('\n=== 3D VISUALIZATION TEST - GAME SCREEN ===\n');

  // Step 1: Navigate to the app
  console.log('Step 1: Navigating to app...');
  await page.goto('https://6916b7543620c585e7058fa2--7th-grade-pre-algebra.netlify.app');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Step 2: Enter name (for new users) or skip for returning users
  console.log('\nStep 2: Checking for name input...');
  const nameInput = await page.$('#player-name');
  if (nameInput) {
    console.log('- New user flow detected, entering name...');
    await page.fill('#player-name', 'TestStudent3D');
    await page.waitForTimeout(500);
  } else {
    console.log('- Returning user flow detected (no name input)');
  }

  // Step 3: Click "Start Lesson" button
  console.log('\nStep 3: Looking for Start Lesson button...');
  const startButton = await page.$('button:has-text("Start Lesson")');
  if (startButton) {
    console.log('- Found Start Lesson button, clicking...');
    await startButton.click();
    await page.waitForTimeout(2000);
  } else {
    console.log('- No Start Lesson button (may already be on game screen)');
  }

  // Step 4: Wait for game screen with equation
  console.log('\nStep 4: Waiting for game screen with equation...');
  await page.waitForSelector('#equation-display, #equation', { timeout: 10000 });
  await page.waitForTimeout(2000);
  console.log('- Game screen loaded with equation');

  // Step 5: Check for canvas element
  console.log('\nStep 5: Checking for canvas element in #threeContainer...');
  const threeContainer = await page.$('#threeContainer');
  if (threeContainer) {
    const containerBox = await threeContainer.boundingBox();
    console.log('- #threeContainer found');
    console.log('  Position: x=' + containerBox.x + ', y=' + containerBox.y);
    console.log('  Size: ' + containerBox.width + 'px x ' + containerBox.height + 'px');
    
    const canvas = await page.$('#threeContainer canvas');
    if (canvas) {
      const canvasBox = await canvas.boundingBox();
      console.log('- Canvas element found!');
      console.log('  Canvas size: ' + canvasBox.width + 'px x ' + canvasBox.height + 'px');
      console.log('  Canvas position: x=' + canvasBox.x + ', y=' + canvasBox.y);
      
      // Check canvas attributes
      const width = await canvas.getAttribute('width');
      const height = await canvas.getAttribute('height');
      console.log('  Canvas attributes: width="' + width + '" height="' + height + '"');
    } else {
      console.log('- NO CANVAS FOUND in #threeContainer');
    }
  } else {
    console.log('- #threeContainer NOT FOUND');
  }

  // Step 6: Check console for Three.js initialization
  console.log('\nStep 6: Checking console logs for Three.js initialization...');
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('3D') || text.includes('Three') || text.includes('visualization')) {
      logs.push(text);
    }
  });
  
  // Wait a bit for any delayed logs
  await page.waitForTimeout(2000);
  
  if (logs.length > 0) {
    console.log('- Found relevant console logs:');
    logs.forEach(log => console.log('  ' + log));
  } else {
    console.log('- No Three.js initialization logs found');
  }

  // Step 7: Check for any canvas elements on the entire page
  console.log('\nStep 7: Searching for ANY canvas elements on page...');
  const allCanvases = await page.$$('canvas');
  console.log('- Found ' + allCanvases.length + ' canvas element(s) on page');
  
  for (let i = 0; i < allCanvases.length; i++) {
    const canvas = allCanvases[i];
    const canvasBox = await canvas.boundingBox();
    const parent = await canvas.evaluateHandle(el => el.parentElement);
    const parentId = await parent.evaluate(el => el.id);
    const parentClass = await parent.evaluate(el => el.className);
    
    console.log('\n  Canvas ' + (i + 1) + ':');
    console.log('    Parent ID: ' + (parentId || '(none)'));
    console.log('    Parent class: ' + (parentClass || '(none)'));
    console.log('    Size: ' + canvasBox.width + 'px x ' + canvasBox.height + 'px');
    console.log('    Position: x=' + canvasBox.x + ', y=' + canvasBox.y);
  }

  // Step 8: Take screenshot
  console.log('\nStep 8: Taking screenshot of game screen...');
  await page.screenshot({ 
    path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/3d-game-screen.png',
    fullPage: true
  });
  console.log('- Screenshot saved to test-screenshots/3d-game-screen.png');

  // Step 9: Check the actual equation and visualization panel visibility
  console.log('\nStep 9: Checking visibility of key elements...');
  
  const equation = await page.$('#equation-display, #equation');
  if (equation) {
    const isVisible = await equation.isVisible();
    console.log('- Equation display: ' + (isVisible ? 'VISIBLE' : 'HIDDEN'));
  }
  
  const vizPanel = await page.$('#threeContainer, .visualization-panel, #visualization-panel');
  if (vizPanel) {
    const isVisible = await vizPanel.isVisible();
    const box = await vizPanel.boundingBox();
    console.log('- Visualization panel: ' + (isVisible ? 'VISIBLE' : 'HIDDEN'));
    if (box) {
      console.log('  Size: ' + box.width + 'px x ' + box.height + 'px');
    }
  } else {
    console.log('- Visualization panel: NOT FOUND');
  }

  console.log('\n=== TEST COMPLETE ===\n');
  console.log('Keeping browser open for manual inspection...');
  console.log('Press Ctrl+C to close\n');

  // Keep browser open for manual inspection
  await page.waitForTimeout(300000);

  await browser.close();
})();
