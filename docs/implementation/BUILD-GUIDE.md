# BUILD GUIDE

## Overview

This guide shows you HOW to build features for the platform. Follow these patterns for consistency.

---

## Development Environment Setup

### Prerequisites

```bash
# Required
- Node.js 18+ (check: node --version)
- npm 9+ (check: npm --version)
- Git (check: git --version)

# Recommended
- VS Code with extensions:
  - ESLint
  - Prettier
  - Live Server
```

### Local Setup

```bash
# 1. Clone repository
git clone [repo-url]
cd 7th-PreAlgebra

# 2. Install dependencies
npm install

# 3. Create .env file (don't commit!)
touch .env

# Add to .env:
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_ANON_KEY=eyJhbGc...
# GEMINI_API_KEY=your_api_key_here

# 4. Install Netlify CLI
npm install -g netlify-cli

# 5. Run local dev server
netlify dev
# Access at http://localhost:8888
```

---

## Component Building Pattern

### 1. Frontend Component Structure

Every feature follows this pattern:

```javascript
// /js/features/my-feature.js

(function() {
  'use strict';

  /**
   * MyFeature Module
   * Description of what this feature does
   */
  const MyFeature = {
    // Configuration
    config: {
      settingName: 'value',
      anotherSetting: true
    },

    // State
    state: {
      isActive: false,
      data: null
    },

    // Initialize the feature
    init() {
      this.setupEventListeners();
      this.loadInitialData();
    },

    // Set up event listeners
    setupEventListeners() {
      document.getElementById('myButton')
        .addEventListener('click', () => this.handleClick());
    },

    // Handle events
    handleClick() {
      this.state.isActive = !this.state.isActive;
      this.render();
    },

    // Load data (from Supabase or API)
    async loadInitialData() {
      try {
        const { data, error } = await supabase
          .from('my_table')
          .select('*');

        if (error) throw error;

        this.state.data = data;
        this.render();
      } catch (error) {
        this.handleError(error);
      }
    },

    // Render UI
    render() {
      const container = document.getElementById('myContainer');
      container.innerHTML = this.buildHTML();
    },

    // Build HTML
    buildHTML() {
      return `
        <div class="my-feature">
          <h2>${this.state.isActive ? 'Active' : 'Inactive'}</h2>
          ${this.state.data ? this.renderData() : this.renderLoading()}
        </div>
      `;
    },

    renderData() {
      return this.state.data.map(item => `
        <div class="item">${item.name}</div>
      `).join('');
    },

    renderLoading() {
      return '<div class="loading">Loading...</div>';
    },

    // Error handling
    handleError(error) {
      console.error('MyFeature error:', error);
      this.showUserMessage('Something went wrong. Please try again.');
    },

    showUserMessage(message) {
      // Show toast or alert
      alert(message); // Replace with better UI
    }
  };

  // Attach to window for global access
  window.MyFeature = MyFeature;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MyFeature.init());
  } else {
    MyFeature.init();
  }

})();
```

---

## Supabase Integration Patterns

### Pattern 1: Fetch Data

```javascript
async function fetchUserProgress(userId) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('lesson_number', { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching progress:', error);
    return [];
  }
}
```

### Pattern 2: Insert/Update Data (Upsert)

```javascript
async function saveProgress(userId, lessonNumber, progressData) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        lesson_number: lessonNumber,
        status: progressData.status,
        correct_answers: progressData.correct,
        total_questions: progressData.total,
        completed_at: progressData.completed ? new Date().toISOString() : null,
        xp_earned: progressData.xp,
        coins_earned: progressData.coins
      }, {
        onConflict: 'user_id,lesson_number' // Update if exists
      });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving progress:', error);
    throw error;
  }
}
```

### Pattern 3: Real-time Subscriptions (optional)

```javascript
function subscribeToProgress(userId, callback) {
  const subscription = supabase
    .channel('progress-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('Progress updated:', payload);
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
}

// Unsubscribe when done
function unsubscribe(subscription) {
  supabase.removeChannel(subscription);
}
```

---

## Building Features: Step-by-Step Examples

### Example 1: XP System

**Goal**: Award XP when student completes a lesson.

**Step 1**: Update user_profiles table

```javascript
async function awardXP(userId, xpAmount, reason) {
  try {
    // Get current XP
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('current_xp, current_level')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newXP = profile.current_xp + xpAmount;
    const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level

    // Update XP and level
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        current_xp: newXP,
        current_level: newLevel
      })
      .eq('id', userId);

    if (error) throw error;

    // Check if leveled up
    if (newLevel > profile.current_level) {
      showLevelUpAnimation(newLevel);
    }

    // Show XP gain animation
    showXPGain(xpAmount, reason);

    return { newXP, newLevel };
  } catch (error) {
    console.error('Error awarding XP:', error);
  }
}
```

**Step 2**: Create UI for XP display

```javascript
function updateXPDisplay(xp, level) {
  document.getElementById('playerXP').textContent = xp;
  document.getElementById('playerLevel').textContent = level;

  // Update progress bar
  const progressToNextLevel = xp % 100;
  const progressBar = document.querySelector('.xp-progress-bar');
  progressBar.style.width = `${progressToNextLevel}%`;
}
```

**Step 3**: Integrate into lesson completion

```javascript
async function completeLesson(userId, lessonNumber, score) {
  const baseXP = 50;
  const perfectBonus = (score.correct === score.total) ? 10 : 0;
  const totalXP = baseXP + perfectBonus;

  // Save progress
  await saveProgress(userId, lessonNumber, {
    status: 'completed',
    correct: score.correct,
    total: score.total,
    xp: totalXP,
    coins: 10,
    completed: true
  });

  // Award XP
  await awardXP(userId, totalXP, 'Lesson completed');

  // Award coins
  await awardCoins(userId, 10, 'Lesson completed');

  // Update streak
  await updateStreak(userId);

  // Check achievements
  await checkAndUnlockAchievements(userId);
}
```

---

### Example 2: Daily Streaks

**Goal**: Track student's daily practice streak.

**Step 1**: Update streak on lesson completion

```javascript
async function updateStreak(userId) {
  try {
    // Get current streak
    const { data: streak, error: fetchError } = await supabase
      .from('daily_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastActivity = streak.last_activity_date;

    let newStreakCount = streak.streak_count;
    let longestStreak = streak.longest_streak;

    // Check if already practiced today
    if (lastActivity === today) {
      return { streak: newStreakCount, isNewDay: false };
    }

    // Check if streak continues
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get all B-days between last activity and today
    const missedBDays = countMissedClassDays(lastActivity, today);

    if (missedBDays === 0) {
      // Practiced today (same day or weekend)
      newStreakCount++;
    } else if (missedBDays === 1 && isToday(today)) {
      // Practiced today after one B-day
      newStreakCount++;
    } else {
      // Missed 2+ B-days - streak broken
      newStreakCount = 1;
    }

    // Update longest streak
    if (newStreakCount > longestStreak) {
      longestStreak = newStreakCount;
    }

    // Update database
    const { data, error } = await supabase
      .from('daily_streaks')
      .update({
        streak_count: newStreakCount,
        longest_streak: longestStreak,
        last_activity_date: today,
        total_practice_days: streak.total_practice_days + 1
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Check for streak milestones
    checkStreakMilestones(userId, newStreakCount);

    return { streak: newStreakCount, isNewDay: true };
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

function countMissedClassDays(lastDate, currentDate) {
  // Use ScheduleConfig to count B-days between dates
  const start = new Date(lastDate);
  const end = new Date(currentDate);

  let count = 0;
  let current = new Date(start);
  current.setDate(current.getDate() + 1); // Start from next day

  while (current < end) {
    if (ScheduleConfig.isClassDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}
```

**Step 2**: Display streak in UI

```javascript
function updateStreakDisplay(streakCount) {
  document.getElementById('streak').textContent = streakCount;

  // Add flame animation
  if (streakCount >= 7) {
    document.querySelector('.streak').classList.add('on-fire');
  }
}
```

---

### Example 3: Achievement System

**Goal**: Unlock achievements when criteria met.

**Step 1**: Check achievements after any progress update

```javascript
async function checkAndUnlockAchievements(userId) {
  try {
    // Get all achievements
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*');

    // Get earned achievements
    const { data: earnedAchievements } = await supabase
      .from('achievements_earned')
      .select('achievement_id')
      .eq('user_id', userId);

    const earnedIds = earnedAchievements.map(a => a.achievement_id);

    // Get current user stats
    const stats = await getUserStats(userId);

    // Check each achievement
    const newlyUnlocked = [];

    for (const achievement of allAchievements) {
      // Skip if already earned
      if (earnedIds.includes(achievement.id)) continue;

      // Check unlock criteria
      if (meetsAchievementCriteria(achievement, stats)) {
        await unlockAchievement(userId, achievement);
        newlyUnlocked.push(achievement);
      }
    }

    // Show celebration for newly unlocked
    if (newlyUnlocked.length > 0) {
      showAchievementUnlocked(newlyUnlocked);
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

function meetsAchievementCriteria(achievement, stats) {
  const criteria = achievement.unlock_criteria;

  // Streak achievements
  if (criteria.streak_days) {
    return stats.currentStreak >= criteria.streak_days;
  }

  // Completion achievements
  if (criteria.lessons_completed) {
    return stats.lessonsCompleted >= criteria.lessons_completed;
  }

  // Mastery achievements
  if (criteria.perfect_scores) {
    return stats.perfectScores >= criteria.perfect_scores;
  }

  // Topic achievements
  if (criteria.topic && criteria.mastery_avg) {
    const topicMastery = getTopicMastery(stats, criteria.topic);
    return topicMastery >= criteria.mastery_avg;
  }

  return false;
}

async function unlockAchievement(userId, achievement) {
  // Add to earned achievements
  await supabase
    .from('achievements_earned')
    .insert({
      user_id: userId,
      achievement_id: achievement.id
    });

  // Award XP and coins
  await awardXP(userId, achievement.xp_reward, `Achievement: ${achievement.name}`);
  await awardCoins(userId, achievement.coins_reward, `Achievement: ${achievement.name}`);
}
```

**Step 2**: Display achievement unlocked

```javascript
function showAchievementUnlocked(achievements) {
  achievements.forEach(achievement => {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <h3>Achievement Unlocked!</h3>
        <p><strong>${achievement.name}</strong></p>
        <p>${achievement.description}</p>
        <p class="rewards">+${achievement.xp_reward} XP +${achievement.coins_reward} coins</p>
      </div>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  });
}
```

---

## Netlify Functions

### Creating a New Function

```bash
# Create function file
touch functions/my-function.js
```

```javascript
// functions/my-function.js

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    const { param1, param2 } = JSON.parse(event.body);

    // Validate inputs
    if (!param1 || !param2) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Do work (e.g., call external API)
    const result = await doSomething(param1, param2);

    // Return success
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ result })
    };

  } catch (error) {
    console.error('Function error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function doSomething(param1, param2) {
  // Implementation
  return { success: true };
}
```

### Calling Function from Client

```javascript
async function callMyFunction(param1, param2) {
  try {
    const response = await fetch('/.netlify/functions/my-function', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ param1, param2 })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.result;

  } catch (error) {
    console.error('Function call failed:', error);
    throw error;
  }
}
```

---

## CSS Patterns

### Using Atomic CSS

```html
<!-- Spacing -->
<div class="mb-4 p-6">Content</div>

<!-- Layout -->
<div class="flex justify-between items-center">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Grid -->
<div class="grid grid-cols-2 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Typography -->
<h2 class="text-2xl font-bold text-primary">Heading</h2>

<!-- Colors -->
<button class="bg-primary text-white hover:bg-primary-dark">
  Click Me
</button>
```

### Creating New Component Styles

```css
/* /css/main.css */

.my-component {
  /* Use CSS variables for colors */
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.my-component__header {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.my-component__body {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .my-component {
    padding: var(--space-2);
  }
}
```

---

## Error Handling Best Practices

### Pattern 1: Try-Catch with User Feedback

```javascript
async function performAction() {
  try {
    // Attempt action
    const result = await riskyOperation();
    showSuccess('Action completed successfully!');
    return result;

  } catch (error) {
    console.error('Action failed:', error);

    // Show user-friendly message
    if (error.message.includes('network')) {
      showError('Network error. Check your connection.');
    } else if (error.message.includes('auth')) {
      showError('Please log in again.');
    } else {
      showError('Something went wrong. Please try again.');
    }

    return null;
  }
}
```

### Pattern 2: Retry Logic

```javascript
async function fetchWithRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;

      console.log(`Retry ${i + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const data = await fetchWithRetry(() =>
  supabase.from('user_progress').select('*')
);
```

---

## Testing Your Code

### Manual Testing Checklist

For each feature:
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile (responsive)
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] Handles errors gracefully
- [ ] Data persists correctly
- [ ] Performance is acceptable
- [ ] No console errors

### Console Debugging

```javascript
// Enable debug logging
const DEBUG = true;

function log(...args) {
  if (DEBUG) console.log('[MyFeature]', ...args);
}

function logError(...args) {
  console.error('[MyFeature ERROR]', ...args);
}

// Usage
log('Initializing feature');
logError('Failed to load data', error);
```

---

## Git Workflow

### Branch Naming

```bash
# Feature branches
git checkout -b feature/xp-system
git checkout -b feature/achievements

# Bug fixes
git checkout -b fix/streak-calculation

# Refactoring
git checkout -b refactor/supabase-integration
```

### Commit Messages

```bash
# Format: <type>: <description>

# Types:
# feat: New feature
# fix: Bug fix
# refactor: Code refactoring
# docs: Documentation
# style: Formatting
# test: Tests

# Examples:
git commit -m "feat: Add XP system with level progression"
git commit -m "fix: Streak resets incorrectly on weekends"
git commit -m "refactor: Migrate progress tracking to Supabase"
git commit -m "docs: Add build guide for developers"
```

### Pull Request Process

1. Create feature branch
2. Build and test feature
3. Commit changes with clear messages
4. Push to GitHub
5. Open PR with description
6. Request review
7. Address feedback
8. Merge to master

---

## Common Gotchas

### 1. Async/Await Errors

```javascript
// WRONG - Missing await
async function getData() {
  const data = supabase.from('table').select();
  return data; // Returns a Promise, not data!
}

// RIGHT
async function getData() {
  const { data } = await supabase.from('table').select();
  return data;
}
```

### 2. Event Listener Leaks

```javascript
// WRONG - Creates new listener every time
function setupListeners() {
  document.getElementById('btn').addEventListener('click', handleClick);
  // This gets called multiple times = multiple listeners!
}

// RIGHT - Remove old listener first
function setupListeners() {
  const btn = document.getElementById('btn');
  btn.removeEventListener('click', handleClick);
  btn.addEventListener('click', handleClick);
}
```

### 3. Supabase RLS Issues

```javascript
// SYMPTOM: Data returns empty even though it exists

// CAUSE: No auth session
// Check: const { data: { user } } = await supabase.auth.getUser();

// SOLUTION: Make sure user is logged in before querying
if (!user) {
  console.error('User not authenticated');
  return;
}
```

---

## Next Steps

Read these docs next:
1. **TESTING-GUIDE.md** - How to test your code
2. **DEPLOYMENT-GUIDE.md** - How to deploy to production
3. **LESSON-IMPLEMENTATION.md** - How to build lessons
