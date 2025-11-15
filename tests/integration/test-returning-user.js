const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'https://6916acdd218dd36d704f77b6--7th-grade-pre-algebra.netlify.app';

async function testReturningUser() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    const msgType = msg.type();
    const msgText = msg.text();
    const text = '[' + msgType + '] ' + msgText;
    consoleMessages.push(text);
    console.log(text);
  });
  
  page.on('pageerror', error => {
    const errorText = 'PAGE ERROR: ' + error.message;
    errors.push(errorText);
    console.error(errorText);
  });
  
  try {
    console.log('\n=== PHASE 1: FIRST-TIME USER EXPERIENCE ===\n');
    
    console.log('1. Navigating to site...');
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, '01-initial-load.png'), fullPage: true });
    
    console.log('2. Entering student name in modal...');
    const nameInput = await page.$('#studentNameInput');
    if (nameInput) {
      await nameInput.fill('TestStudent123');
      await page.screenshot({ path: path.join(screenshotDir, '02-name-entered.png'), fullPage: true });
      
      const submitBtn = await page.$('#submitNameBtn');
      if (submitBtn) {
        console.log('   Clicking submit button...');
        await submitBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, '03-after-name-submit.png'), fullPage: true });
      }
    } else {
      console.log('WARNING: No student name input found');
    }
    
    console.log('3. Clicking Start This Level (first time)...');
    const startBtn = await page.$('#startStoryBtn');
    if (startBtn) {
      await startBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotDir, '04-first-lesson-start.png'), fullPage: true });
    } else {
      console.log('WARNING: Start This Level button not found');
    }
    
    const firstTimeChecks = {
      threeContainer: await page.$('#threeContainer'),
      canvas: await page.$('#threeContainer canvas'),
      wordProblemText: await page.$('#wordProblemText'),
      wordProblemSection: await page.$('#wordProblemSection'),
      equationDisplay: await page.$('#equationDisplay'),
      solveStepsBtn: await page.$('#solveStepsBtn')
    };
    
    console.log('\nFirst-Time User Elements Check:');
    for (const key in firstTimeChecks) {
      const element = firstTimeChecks[key];
      const isVisible = element ? await element.isVisible().catch(() => false) : false;
      console.log('  ' + key + ': ' + (element ? (isVisible ? 'VISIBLE' : 'HIDDEN') : 'NOT FOUND'));
      
      if (key === 'wordProblemText' && element) {
        const text = await element.textContent();
        console.log('    Text: "' + text.substring(0, 100) + '..."');
      }
      if (key === 'wordProblemSection' && element) {
        const display = await element.evaluate(el => window.getComputedStyle(el).display);
        console.log('    Display style: ' + display);
      }
      if (key === 'canvas' && element) {
        const bbox = await element.boundingBox();
        console.log('    Canvas size: ' + (bbox ? bbox.width + 'x' + bbox.height : 'no bbox'));
      }
    }
    
    console.log('\n4. Navigating through workflow...');
    
    const watchVideoBtn = await page.$('#watchVideoBtn');
    if (watchVideoBtn) {
      console.log('  - On concept intro, clicking Watch Video...');
      await watchVideoBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotDir, '05a-video-screen.png'), fullPage: true });
      
      const videoCheck = await page.$('#videoWatchedCheck');
      if (videoCheck) {
        await videoCheck.click();
        await page.waitForTimeout(500);
      }
      
      const continueToExamples = await page.$('#continueToExamplesBtn');
      if (continueToExamples) {
        await continueToExamples.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, '05b-examples-screen.png'), fullPage: true });
      }
      
      const startPractice = await page.$('#startPracticeBtn');
      if (startPractice) {
        await startPractice.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, '05c-game-screen.png'), fullPage: true });
      }
    }
    
    console.log('\n=== PHASE 2: RETURNING USER EXPERIENCE ===\n');
    
    console.log('5. Refreshing page to simulate returning user...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, '06-after-refresh.png'), fullPage: true });
    
    const localStorageData = await page.evaluate(() => {
      return {
        studentName: localStorage.getItem('studentName'),
        learnedConcepts: localStorage.getItem('learnedConcepts'),
        currentXP: localStorage.getItem('currentXP'),
        videoWatched: localStorage.getItem('videoWatched_1'),
        allKeys: Object.keys(localStorage)
      };
    });
    
    console.log('\nLocalStorage after refresh:');
    console.log(JSON.stringify(localStorageData, null, 2));
    
    const nameModal = await page.$('#studentNameModal');
    if (nameModal) {
      const modalDisplay = await nameModal.evaluate(el => window.getComputedStyle(el).display);
      console.log('Name modal display after refresh: ' + modalDisplay);
    }
    
    console.log('\n6. Clicking Start This Level (returning user)...');
    const startBtn2 = await page.$('#startStoryBtn');
    if (startBtn2) {
      await startBtn2.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotDir, '07-returning-lesson-start.png'), fullPage: true });
    } else {
      console.log('WARNING: Start This Level button not found after refresh');
    }
    
    const returningUserChecks = {
      conceptIntroScreen: await page.$('#conceptIntroScreen'),
      videoLessonScreen: await page.$('#videoLessonScreen'),
      examplesScreen: await page.$('#examplesScreen'),
      gameScreen: await page.$('#gameScreen'),
      threeContainer: await page.$('#threeContainer'),
      canvas: await page.$('#threeContainer canvas'),
      wordProblemText: await page.$('#wordProblemText'),
      wordProblemSection: await page.$('#wordProblemSection'),
      equationDisplay: await page.$('#equationDisplay'),
      solveStepsBtn: await page.$('#solveStepsBtn')
    };
    
    console.log('\nReturning User Screen Check:');
    for (const key in returningUserChecks) {
      const element = returningUserChecks[key];
      const isVisible = element ? await element.isVisible().catch(() => false) : false;
      const hasActive = element ? await element.evaluate(el => el.classList.contains('active')).catch(() => false) : false;
      console.log('  ' + key + ': ' + (element ? (isVisible || hasActive ? 'ACTIVE/VISIBLE' : 'HIDDEN') : 'NOT FOUND'));
      
      if (key === 'wordProblemSection' && element) {
        const display = await element.evaluate(el => window.getComputedStyle(el).display);
        console.log('    Display style: ' + display);
        const text = await page.$eval('#wordProblemText', el => el.textContent).catch(() => 'N/A');
        console.log('    Text content: "' + text.substring(0, 100) + '..."');
      }
      if (key === 'threeContainer' && element) {
        const display = await element.evaluate(el => window.getComputedStyle(el).display);
        const innerHTML = await element.innerHTML();
        console.log('    Display: ' + display);
        console.log('    Has canvas child: ' + innerHTML.includes('<canvas'));
      }
      if (key === 'canvas' && element) {
        const bbox = await element.boundingBox();
        console.log('    Canvas size: ' + (bbox ? bbox.width + 'x' + bbox.height : 'no bbox'));
      }
    }
    
    console.log('\n7. Checking current active screen...');
    const activeScreen = await page.evaluate(() => {
      const screens = document.querySelectorAll('.screen');
      for (let screen of screens) {
        if (screen.classList.contains('active') || window.getComputedStyle(screen).display !== 'none') {
          return {
            id: screen.id,
            classList: Array.from(screen.classList),
            display: window.getComputedStyle(screen).display
          };
        }
      }
      return null;
    });
    
    console.log('Active screen:', JSON.stringify(activeScreen, null, 2));
    
    console.log('\n8. Checking DOM structure for word problems...');
    const domInfo = await page.evaluate(() => {
      const container = document.getElementById('threeContainer');
      const wpSection = document.getElementById('wordProblemSection');
      const wpText = document.getElementById('wordProblemText');
      return {
        threeContainer: {
          exists: !!container,
          display: container ? window.getComputedStyle(container).display : null,
          canvasCount: container ? container.querySelectorAll('canvas').length : 0,
        },
        wordProblemSection: {
          exists: !!wpSection,
          display: wpSection ? window.getComputedStyle(wpSection).display : null,
        },
        wordProblemText: {
          exists: !!wpText,
          textContent: wpText ? wpText.textContent : null,
          parentDisplay: wpText ? window.getComputedStyle(wpText.parentElement).display : null
        }
      };
    });
    
    console.log('DOM Info:');
    console.log(JSON.stringify(domInfo, null, 2));
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, '08-final-state.png'), fullPage: true });
    
    console.log('\n=== TEST SUMMARY ===\n');
    console.log('Total console messages: ' + consoleMessages.length);
    console.log('Total errors: ' + errors.length);
    
    if (errors.length > 0) {
      console.log('\nERRORS FOUND:');
      errors.forEach((err, i) => console.log((i + 1) + '. ' + err));
    }
    
    const errorWarningMessages = consoleMessages.filter(msg => 
      msg.toLowerCase().includes('error') || msg.toLowerCase().includes('warn')
    );
    
    console.log('\nConsole messages with "error" or "warn": ' + errorWarningMessages.length);
    errorWarningMessages.forEach(msg => console.log('  ' + msg));
    
    console.log('\nScreenshots saved to: ' + screenshotDir);
    
  } catch (error) {
    console.error('Test failed with error:', error);
    await page.screenshot({ path: path.join(screenshotDir, 'ERROR.png'), fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testReturningUser();
