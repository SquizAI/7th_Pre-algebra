const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('\n=== 3D VISUALIZATION TEST - GAME SCREEN ===\n');

  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
  });

  // Navigate
  console.log('Step 1: Navigating to app...');
  await page.goto('https://6916b7543620c585e7058fa2--7th-grade-pre-algebra.netlify.app');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('- Page loaded');

  // Handle name modal if present
  const nameModal = await page.$('#studentNameModal');
  if (nameModal) {
    const isVisible = await nameModal.isVisible();
    if (isVisible) {
      console.log('\nStep 2: Name modal detected, filling and submitting...');
      await page.fill('#player-name', 'Test3DUser');
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        document.querySelector('#submitNameBtn').click();
      });
      await page.waitForTimeout(2000);
      console.log('- Name submitted');
    }
  }

  // Click Start Lesson using JavaScript click
  console.log('\nStep 3: Clicking Start Lesson button...');
  await page.evaluate(() => {
    const startBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent.includes('Start Lesson')
    );
    if (startBtn) startBtn.click();
  });
  await page.waitForTimeout(4000);
  console.log('- Button clicked, waiting for game screen...');

  // Take screenshot
  console.log('\nStep 4: Taking screenshot...');
  await page.screenshot({ 
    path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/game-screen-3d.png',
    fullPage: true
  });
  console.log('- Screenshot saved to test-screenshots/game-screen-3d.png');

  // Check for canvas
  console.log('\nStep 5: Checking for canvas elements...');
  const canvasInfo = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    return canvases.map(canvas => ({
      parentId: canvas.parentElement.id,
      parentClass: canvas.parentElement.className,
      width: canvas.width,
      height: canvas.height,
      styleWidth: canvas.style.width,
      styleHeight: canvas.style.height,
      visible: canvas.offsetParent !== null,
      boundingBox: canvas.getBoundingClientRect()
    }));
  });

  if (canvasInfo.length > 0) {
    console.log('FOUND ' + canvasInfo.length + ' CANVAS ELEMENT(S):');
    canvasInfo.forEach((info, i) => {
      console.log('\nCanvas ' + (i + 1) + ':');
      console.log('  Parent ID: ' + info.parentId);
      console.log('  Parent Class: ' + info.parentClass);
      console.log('  Canvas Dimensions: ' + info.width + ' x ' + info.height);
      console.log('  Style: ' + info.styleWidth + ' x ' + info.styleHeight);
      console.log('  Visible: ' + info.visible);
      console.log('  Position: x=' + Math.round(info.boundingBox.x) + ', y=' + Math.round(info.boundingBox.y));
      console.log('  Size on screen: ' + Math.round(info.boundingBox.width) + 'px x ' + Math.round(info.boundingBox.height) + 'px');
    });
  } else {
    console.log('NO CANVAS ELEMENTS FOUND ON PAGE');
  }

  // Check for #threeContainer
  console.log('\nStep 6: Checking for #threeContainer...');
  const threeContainer = await page.evaluate(() => {
    const container = document.querySelector('#threeContainer');
    if (container) {
      return {
        exists: true,
        visible: container.offsetParent !== null,
        boundingBox: container.getBoundingClientRect(),
        innerHTML: container.innerHTML.substring(0, 200)
      };
    }
    return { exists: false };
  });

  if (threeContainer.exists) {
    console.log('#threeContainer FOUND:');
    console.log('  Visible: ' + threeContainer.visible);
    console.log('  Size: ' + Math.round(threeContainer.boundingBox.width) + 'px x ' + Math.round(threeContainer.boundingBox.height) + 'px');
    console.log('  Position: x=' + Math.round(threeContainer.boundingBox.x) + ', y=' + Math.round(threeContainer.boundingBox.y));
    console.log('  Content: ' + (threeContainer.innerHTML.trim() ? 'HAS CONTENT' : 'EMPTY'));
  } else {
    console.log('#threeContainer NOT FOUND');
  }

  // Check console for Three.js messages
  console.log('\nStep 7: Checking console logs...');
  const threeLogs = consoleLogs.filter(log => 
    log.toLowerCase().includes('3d') || 
    log.toLowerCase().includes('three') || 
    log.toLowerCase().includes('visualization')
  );
  if (threeLogs.length > 0) {
    console.log('Three.js related logs:');
    threeLogs.forEach(log => console.log('  ' + log));
  } else {
    console.log('No Three.js initialization logs found');
  }

  // Check what's visible on the page
  console.log('\nStep 8: Checking visible game elements...');
  const gameElements = await page.evaluate(() => {
    const elements = {};
    const ids = ['equation', 'equation-display', 'game-container', 'threeContainer', 
                 'visualization-panel', 'answer-input', 'submit-btn'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        elements[id] = {
          visible: el.offsetParent !== null,
          text: el.textContent.substring(0, 50)
        };
      }
    });
    return elements;
  });

  console.log('Game elements found:');
  Object.keys(gameElements).forEach(id => {
    console.log('  #' + id + ': visible=' + gameElements[id].visible + ', text="' + gameElements[id].text + '"');
  });

  console.log('\n=== SUMMARY ===');
  console.log('Canvas elements: ' + canvasInfo.length);
  console.log('#threeContainer: ' + (threeContainer.exists ? 'EXISTS' : 'NOT FOUND'));
  console.log('Three.js logs: ' + threeLogs.length);
  console.log('\nBrowser staying open for 2 minutes for manual inspection...\n');

  await page.waitForTimeout(120000);
  await browser.close();
})();
