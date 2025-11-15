const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('\n=== 3D VISUALIZATION TEST - GAME SCREEN V2 ===\n');

  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
  });

  // Step 1: Navigate to the app
  console.log('Step 1: Navigating to app...');
  await page.goto('https://6916b7543620c585e7058fa2--7th-grade-pre-algebra.netlify.app');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Step 2: Click Start Lesson
  console.log('\nStep 2: Looking for Start Lesson button...');
  const startButton = await page.$('button:has-text("Start Lesson")');
  if (startButton) {
    console.log('- Found Start Lesson button, clicking...');
    await startButton.click();
    await page.waitForTimeout(3000);
  }

  // Step 3: Take screenshot to see what we got
  console.log('\nStep 3: Taking screenshot after clicking Start...');
  await page.screenshot({ 
    path: '/Users/mattysquarzoni/Documents/7th-PreAlgebra/test-screenshots/after-start-click.png',
    fullPage: true
  });
  console.log('- Screenshot saved');

  // Step 4: Check what elements exist on the page
  console.log('\nStep 4: Checking all IDs and classes on page...');
  const elements = await page.evaluate(() => {
    const allElements = [];
    document.querySelectorAll('[id], [class]').forEach(el => {
      if (el.id || el.className) {
        allElements.push({
          tag: el.tagName,
          id: el.id,
          class: el.className,
          visible: el.offsetParent !== null
        });
      }
    });
    return allElements;
  });
  
  console.log('- Found ' + elements.length + ' elements with ID or class');
  console.log('\nVisible elements containing "equation", "three", "game", or "canvas":');
  elements.filter(el => {
    const search = (el.id + ' ' + el.class).toLowerCase();
    return el.visible && (search.includes('equation') || search.includes('three') || 
                          search.includes('game') || search.includes('canvas') ||
                          search.includes('viz'));
  }).forEach(el => {
    console.log('  ' + el.tag + ' id="' + el.id + '" class="' + el.class + '"');
  });

  // Step 5: Check for canvas elements
  console.log('\nStep 5: Checking for canvas elements...');
  const canvases = await page.$$('canvas');
  console.log('- Found ' + canvases.length + ' canvas element(s)');
  
  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const info = await canvas.evaluate(el => ({
      parentId: el.parentElement.id,
      parentClass: el.parentElement.className,
      width: el.width,
      height: el.height,
      visible: el.offsetParent !== null
    }));
    console.log('\n  Canvas ' + (i + 1) + ':');
    console.log('    Parent ID: ' + info.parentId);
    console.log('    Parent class: ' + info.parentClass);
    console.log('    Size: ' + info.width + 'px x ' + info.height + 'px');
    console.log('    Visible: ' + info.visible);
  }

  // Step 6: Check console logs
  console.log('\nStep 6: Console logs containing "3D", "Three", or "visualization":');
  const relevantLogs = consoleLogs.filter(log => {
    const lower = log.toLowerCase();
    return lower.includes('3d') || lower.includes('three') || lower.includes('visualization');
  });
  if (relevantLogs.length > 0) {
    relevantLogs.forEach(log => console.log('  ' + log));
  } else {
    console.log('  (none found)');
  }

  console.log('\n=== ALL CONSOLE LOGS ===');
  consoleLogs.slice(-20).forEach(log => console.log('  ' + log));

  console.log('\n=== TEST COMPLETE ===');
  console.log('Browser will stay open for 2 minutes for manual inspection...\n');

  await page.waitForTimeout(120000);
  await browser.close();
})();
