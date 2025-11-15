# TESTING GUIDE

## Overview

This guide covers how to test the platform at all levels: unit tests, integration tests, and end-to-end tests.

---

## Testing Philosophy

### Why We Test

1. **Prevent Regressions**: Ensure new code doesn't break existing features
2. **Document Behavior**: Tests serve as living documentation
3. **Enable Refactoring**: Change code confidently
4. **Catch Bugs Early**: Find issues before students do

### What We Test

- ✅ Core game logic (equation generation, validation)
- ✅ User flows (signup, login, lesson completion)
- ✅ Data persistence (Supabase integration)
- ✅ UI interactions (buttons, forms, navigation)
- ✅ Edge cases (empty states, errors, invalid input)
- ❌ Third-party libraries (assume they work)
- ❌ Supabase internals (trust their tests)

---

## Test Setup

### Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Project Structure

```
/7th-PreAlgebra/
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/              # End-to-end tests
├── playwright.config.js   # Playwright configuration
└── package.json
```

### Playwright Configuration

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'netlify dev',
    url: 'http://localhost:8888',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Unit Tests

Test individual functions in isolation.

### Example: Equation Generator Tests

```javascript
// tests/unit/equations.test.js
import { test, expect } from '@playwright/test';

// Mock the equation generator (we'll test the real one separately)
function generateTwoStepEquation(difficulty = 'medium') {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const c = Math.floor(Math.random() * 30) + 1;

  const x = Math.floor((c - b) / a);

  return {
    display: `${a}x + ${b} = ${c}`,
    answer: x,
    type: 'two-step',
    difficulty
  };
}

test.describe('Equation Generator', () => {
  test('generates valid two-step equation', () => {
    const equation = generateTwoStepEquation();

    expect(equation).toHaveProperty('display');
    expect(equation).toHaveProperty('answer');
    expect(equation).toHaveProperty('type', 'two-step');
    expect(typeof equation.answer).toBe('number');
  });

  test('generates different equations each time', () => {
    const eq1 = generateTwoStepEquation();
    const eq2 = generateTwoStepEquation();

    // Very unlikely to be the same
    expect(eq1.display).not.toBe(eq2.display);
  });

  test('answer solves the equation', () => {
    const equation = generateTwoStepEquation();

    // Parse equation: ax + b = c
    const match = equation.display.match(/(\d+)x \+ (\d+) = (\d+)/);
    expect(match).not.toBeNull();

    const [_, a, b, c] = match.map(Number);
    const expectedAnswer = (c - b) / a;

    expect(equation.answer).toBe(expectedAnswer);
  });
});
```

### Example: XP Calculation Tests

```javascript
// tests/unit/xp-system.test.js
import { test, expect } from '@playwright/test';

function calculateXP(correctAnswers, totalQuestions, currentStreak) {
  const baseXP = 50;
  const perfectBonus = (correctAnswers === totalQuestions) ? 10 : 0;
  const streakBonus = currentStreak * 5;

  return baseXP + perfectBonus + streakBonus;
}

test.describe('XP Calculation', () => {
  test('awards base XP for completion', () => {
    const xp = calculateXP(3, 5, 0);
    expect(xp).toBe(50);
  });

  test('awards perfect bonus for 5/5', () => {
    const xp = calculateXP(5, 5, 0);
    expect(xp).toBe(60); // 50 + 10
  });

  test('awards streak bonus', () => {
    const xp = calculateXP(3, 5, 7);
    expect(xp).toBe(85); // 50 + 0 + 35
  });

  test('awards all bonuses when applicable', () => {
    const xp = calculateXP(5, 5, 7);
    expect(xp).toBe(95); // 50 + 10 + 35
  });
});
```

### Example: Streak Logic Tests

```javascript
// tests/unit/streak.test.js
import { test, expect } from '@playwright/test';

function updateStreak(lastDate, currentDate, currentStreak, isClassDay) {
  // Simplified version
  const daysSince = Math.floor((new Date(currentDate) - new Date(lastDate)) / (1000 * 60 * 60 * 24));

  if (daysSince === 0) {
    return currentStreak; // Same day
  }

  if (daysSince === 1 && isClassDay(currentDate)) {
    return currentStreak + 1; // Next class day
  }

  if (daysSince <= 3 && !isClassDay(currentDate)) {
    return currentStreak; // Weekend, streak maintained
  }

  return 0; // Streak broken
}

test.describe('Streak Logic', () => {
  const isClassDay = (date) => {
    const day = new Date(date).getDay();
    return [1, 3, 5].includes(day); // MWF
  };

  test('maintains streak on consecutive class days', () => {
    const streak = updateStreak('2025-11-13', '2025-11-15', 5, isClassDay);
    expect(streak).toBe(6);
  });

  test('maintains streak over weekend', () => {
    const streak = updateStreak('2025-11-15', '2025-11-18', 5, isClassDay);
    expect(streak).toBe(5); // Friday to Monday
  });

  test('breaks streak after missing 2+ class days', () => {
    const streak = updateStreak('2025-11-13', '2025-11-20', 5, isClassDay);
    expect(streak).toBe(0);
  });

  test('increments on same-day practice (first time)', () => {
    const streak = updateStreak('2025-11-13', '2025-11-13', 5, isClassDay);
    expect(streak).toBe(5); // No change, same day
  });
});
```

---

## Integration Tests

Test how components work together.

### Example: Lesson Completion Flow

```javascript
// tests/integration/lesson-completion.test.js
import { test, expect } from '@playwright/test';

test.describe('Lesson Completion Flow', () => {
  test('completes full lesson and updates progress', async ({ page }) => {
    // Navigate to game
    await page.goto('/');

    // Start lesson 1
    await page.click('#startStoryBtn');

    // Should show concept intro
    await expect(page.locator('#conceptIntroScreen')).toBeVisible();

    // Click watch video
    await page.click('#watchVideoBtn');

    // Should show video lesson
    await expect(page.locator('#videoLessonScreen')).toBeVisible();

    // Confirm watched
    await page.check('#videoWatchedCheck');
    await page.click('#continueToExamplesBtn');

    // Should show examples
    await expect(page.locator('#examplesScreen')).toBeVisible();

    // Start practice
    await page.click('#startPracticeBtn');

    // Should show game screen
    await expect(page.locator('#gameScreen')).toBeVisible();

    // Answer 5 questions (simplified - just click through)
    for (let i = 0; i < 5; i++) {
      await page.click('#solveStepsBtn');
      // ... simulate answering steps
      // This would be more detailed in real test
    }

    // Should show success modal
    await expect(page.locator('#successModal')).toBeVisible();

    // Check XP was awarded
    const xpText = await page.textContent('#earnedXP');
    expect(parseInt(xpText)).toBeGreaterThan(0);
  });
});
```

### Example: Authentication Flow

```javascript
// tests/integration/auth.test.js
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up, log out, and log back in', async ({ page }) => {
    await page.goto('/');

    // Sign up
    await page.click('[data-test="signup-btn"]');
    await page.fill('[data-test="email-input"]', 'test@example.com');
    await page.fill('[data-test="password-input"]', 'password123');
    await page.fill('[data-test="first-name-input"]', 'Alex');
    await page.click('[data-test="submit-signup"]');

    // Should be logged in
    await expect(page.locator('[data-test="user-menu"]')).toBeVisible();

    // Log out
    await page.click('[data-test="logout-btn"]');

    // Should be logged out
    await expect(page.locator('[data-test="login-btn"]')).toBeVisible();

    // Log back in
    await page.click('[data-test="login-btn"]');
    await page.fill('[data-test="email-input"]', 'test@example.com');
    await page.fill('[data-test="password-input"]', 'password123');
    await page.click('[data-test="submit-login"]');

    // Should be logged in again
    await expect(page.locator('[data-test="user-menu"]')).toBeVisible();
  });
});
```

---

## End-to-End Tests

Test complete user journeys.

### Example: New Student Onboarding

```javascript
// tests/e2e/new-student.test.js
import { test, expect } from '@playwright/test';

test('new student completes first lesson', async ({ page }) => {
  // 1. Visit site
  await page.goto('/');

  // 2. See name input modal
  await expect(page.locator('#studentNameModal')).toBeVisible();

  // 3. Enter name
  await page.fill('#studentNameInput', 'Alex');
  await page.click('#submitNameBtn');

  // 4. See main menu
  await expect(page.locator('#menuScreen')).toBeVisible();

  // 5. Check initial stats
  const xp = await page.textContent('#playerXP');
  expect(xp).toBe('0');

  // 6. Start first lesson
  await page.click('#startStoryBtn');

  // 7. Watch video (or skip)
  await page.click('#watchVideoBtn');
  await page.check('#videoWatchedCheck');
  await page.click('#continueToExamplesBtn');

  // 8. View examples
  await expect(page.locator('#examplesScreen')).toBeVisible();
  await page.click('#startPracticeBtn');

  // 9. Complete lesson (simplified)
  // In real test, we'd interact with step solver
  // For now, just check game screen loaded
  await expect(page.locator('#gameScreen')).toBeVisible();
  await expect(page.locator('#equationDisplay')).toBeVisible();

  // 10. Check equation is displayed
  const equation = await page.textContent('#equationDisplay');
  expect(equation).toMatch(/\d+x [+\-] \d+ = \d+/);
});
```

### Example: Achievement Unlock Flow

```javascript
// tests/e2e/achievements.test.js
import { test, expect } from '@playwright/test';

test('user unlocks first achievement', async ({ page }) => {
  await page.goto('/');

  // Setup: Complete lesson 1
  await page.fill('#studentNameInput', 'Jordan');
  await page.click('#submitNameBtn');
  await page.click('#startStoryBtn');

  // ... complete lesson (simplified)

  // Check for achievement toast
  await expect(page.locator('.achievement-toast')).toBeVisible();

  // Should show "First Steps" achievement
  await expect(page.locator('.achievement-toast')).toContainText('First Steps');

  // Should show XP reward
  await expect(page.locator('.achievement-toast')).toContainText('10 XP');

  // Navigate to achievements page
  await page.click('[data-test="achievements-btn"]');

  // Should see achievement unlocked
  await expect(page.locator('[data-achievement="first-steps"]')).toHaveClass(/unlocked/);
});
```

---

## Database Tests (Supabase)

### Example: Progress Persistence

```javascript
// tests/integration/database.test.js
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for tests
);

test.describe('Database Integration', () => {
  let testUserId;

  test.beforeAll(async () => {
    // Create test user
    const { data } = await supabase.auth.admin.createUser({
      email: 'testuser@example.com',
      password: 'testpassword',
      email_confirm: true
    });
    testUserId = data.user.id;

    // Create profile
    await supabase.from('user_profiles').insert({
      id: testUserId,
      first_name: 'Test'
    });
  });

  test.afterAll(async () => {
    // Clean up test data
    await supabase.auth.admin.deleteUser(testUserId);
  });

  test('saves lesson progress', async () => {
    // Insert progress
    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: testUserId,
        lesson_number: 1,
        status: 'completed',
        correct_answers: 5,
        total_questions: 5,
        xp_earned: 60
      });

    expect(error).toBeNull();

    // Verify saved
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', testUserId)
      .eq('lesson_number', 1)
      .single();

    expect(data.status).toBe('completed');
    expect(data.mastery_percentage).toBe(100);
  });

  test('streak updates correctly', async () => {
    // Insert initial streak
    await supabase.from('daily_streaks').insert({
      user_id: testUserId,
      streak_count: 0,
      last_activity_date: '2025-11-13'
    });

    // Update streak
    await supabase
      .from('daily_streaks')
      .update({
        streak_count: 1,
        last_activity_date: '2025-11-15'
      })
      .eq('user_id', testUserId);

    // Verify
    const { data } = await supabase
      .from('daily_streaks')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    expect(data.streak_count).toBe(1);
  });
});
```

---

## Visual Regression Tests

### Example: Screenshot Testing

```javascript
// tests/visual/ui.test.js
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('menu screen matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.fill('#studentNameInput', 'Alex');
    await page.click('#submitNameBtn');

    // Take screenshot
    await expect(page).toHaveScreenshot('menu-screen.png');
  });

  test('game screen matches baseline', async ({ page }) => {
    await page.goto('/#game');

    // Wait for equation to load
    await page.waitForSelector('#equationDisplay');

    // Hide dynamic elements (streaks, XP)
    await page.evaluate(() => {
      document.querySelector('#playerXP').textContent = '0';
      document.querySelector('#streak').textContent = '0';
    });

    await expect(page).toHaveScreenshot('game-screen.png');
  });
});
```

---

## Accessibility Tests

### Example: A11y Testing

```javascript
// tests/a11y/accessibility.test.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('menu screen has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');

    // Tab to start button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check focus is visible
    const focused = await page.evaluate(() => document.activeElement.id);
    expect(focused).toBe('startStoryBtn');

    // Press Enter to activate
    await page.keyboard.press('Enter');

    // Should navigate to concept intro
    await expect(page.locator('#conceptIntroScreen')).toBeVisible();
  });
});
```

---

## Performance Tests

### Example: Load Time Testing

```javascript
// tests/performance/load-time.test.js
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('page loads in under 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });

  test('Three.js visualization loads without lag', async ({ page }) => {
    await page.goto('/#game');

    // Wait for visualization
    await page.waitForSelector('#threeContainer canvas');

    // Check FPS (approximate)
    const fps = await page.evaluate(() => {
      let frameCount = 0;
      let lastTime = performance.now();

      return new Promise((resolve) => {
        function countFrames() {
          frameCount++;
          const currentTime = performance.now();

          if (currentTime - lastTime >= 1000) {
            resolve(frameCount);
          } else {
            requestAnimationFrame(countFrames);
          }
        }

        requestAnimationFrame(countFrames);
      });
    });

    // Should be at least 30 FPS
    expect(fps).toBeGreaterThan(30);
  });
});
```

---

## Running Tests

### Command Line

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/new-student.test.js

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests in debug mode
npx playwright test --debug

# Run tests with UI
npx playwright test --ui

# Generate test report
npx playwright show-report
```

### In CI/CD (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Data Management

### Fixtures for Reusable Test Data

```javascript
// tests/fixtures.js
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login before each test
    await page.goto('/');
    await page.fill('[data-test="email"]', 'test@example.com');
    await page.fill('[data-test="password"]', 'password123');
    await page.click('[data-test="login"]');

    await use(page);

    // Logout after test
    await page.click('[data-test="logout"]');
  }
});

// Usage
import { test, expect } from './fixtures';

test('uses authenticated page', async ({ authenticatedPage }) => {
  // Already logged in!
  await expect(authenticatedPage.locator('[data-test="user-menu"]')).toBeVisible();
});
```

---

## Manual Testing Checklist

Use this checklist before deploying:

### Critical User Flows
- [ ] Student can sign up
- [ ] Student can log in
- [ ] Student can complete a lesson
- [ ] Progress saves correctly
- [ ] XP and coins update
- [ ] Streak updates correctly
- [ ] Achievement unlocks

### UI/UX
- [ ] All buttons work
- [ ] Forms validate properly
- [ ] Error messages are clear
- [ ] Loading states show
- [ ] Mobile responsive
- [ ] Touch targets are 44px+

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces properly
- [ ] Color contrast sufficient
- [ ] ARIA labels present

---

## Next Steps

Read these docs next:
1. **DEPLOYMENT-GUIDE.md** - How to deploy to production
2. **LESSON-IMPLEMENTATION.md** - How to build all 87 lessons
