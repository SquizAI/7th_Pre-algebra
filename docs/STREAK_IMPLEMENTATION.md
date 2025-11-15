# Streak System Implementation Guide

## Quick Start

The streak tracking system is now fully integrated into the application. Here's what you need to know:

## Files Created

### Core Functionality
```
/js/features/streak-tracker.js     - Streak business logic
/js/ui/streak-display.js           - UI components and animations
/css/streak-display.css            - All styling
```

### Netlify Functions
```
/functions/check-streak.js         - GET endpoint to check streak status
/functions/update-streak.js        - POST endpoint to update streak
```

### Documentation
```
/docs/STREAK_SYSTEM_TEST.md        - Comprehensive testing guide
/docs/STREAK_IMPLEMENTATION.md     - This file
```

## How It Works

### 1. B-Days Only
Streaks only increment on B-days (class days), not every calendar day:
- ✅ B-day completed = streak +1
- ❌ B-day skipped = streak breaks
- ⏸️ A-days, weekends, holidays = no effect on streak

### 2. Automatic Integration
When a student completes a lesson:
```javascript
// In lesson-scheduler.js - automatically called
LessonScheduler.completLesson(lessonNumber);
  ↓
StreakTracker.updateStreak('default', new Date());
  ↓
Updates streak count, checks for milestones, triggers celebrations
```

### 3. Display Updates
The UI automatically updates when streak changes:
- Navbar shows: 🔥 [count] day streak
- Status banner appears when at-risk
- Celebration modal on milestones
- Calendar view on click

## API Reference

### StreakTracker Methods

```javascript
// Check if lesson completed today
const completedToday = StreakTracker.checkStreakToday();

// Update streak (called automatically)
const result = StreakTracker.updateStreak('default', new Date());
// Returns: { streakUpdated, currentStreak, milestone, bonus, ... }

// Get current status
const status = StreakTracker.getStreakStatus();
// Returns: { currentStreak, longestStreak, status, message, ... }

// Calculate milestone bonus
const bonus = StreakTracker.calculateStreakBonus(7);
// Returns: { xp: 100, coins: 25, message: "..." } or null

// Get calendar data (last 90 days)
const calendar = StreakTracker.getCalendarView(90);
// Returns: [{ date, completed, isToday, isBDay }, ...]

// Break streak (for testing)
StreakTracker.breakStreak('default');
```

### StreakDisplay Methods

```javascript
// Update display with current data
StreakDisplay.updateDisplay();

// Show milestone celebration
StreakDisplay.showMilestoneCelebration(7, {
  xp: 100,
  coins: 25,
  message: "One week streak!"
});

// Trigger confetti animation
StreakDisplay.triggerConfetti();

// Show calendar modal
StreakDisplay.showCalendarView();
```

## Events

### Listen for Streak Updates
```javascript
window.addEventListener('streakUpdated', (e) => {
  console.log('New streak data:', e.detail);
  // e.detail = { currentStreak, longestStreak, ... }
});
```

### Listen for Milestones
```javascript
window.addEventListener('streakMilestone', (e) => {
  const { milestone, rewards } = e.detail;
  console.log(`${milestone}-day milestone reached!`);
  console.log(`Rewards: +${rewards.xp} XP, +${rewards.coins} coins`);
});
```

## Data Structure

### localStorage: 'streakData'
```javascript
{
  currentStreak: 5,          // Current consecutive B-days
  longestStreak: 12,         // All-time best streak
  lastActivityDate: "2025-09-18",  // Last completion date (YYYY-MM-DD)
  totalBDaysCompleted: 23    // Total B-days completed ever
}
```

### localStorage: 'dailyStreaks'
```javascript
{
  "2025-09-04": true,
  "2025-09-08": true,
  "2025-09-11": true,
  // ... all completed B-days
}
```

## Milestone Rewards

| Milestone | XP  | Coins | Confetti |
|-----------|-----|-------|----------|
| 3 days    | 50  | 10    | No       |
| 7 days    | 100 | 25    | Yes      |
| 14 days   | 200 | 50    | Yes      |
| 30 days   | 500 | 100   | Yes      |
| 60 days   | 1000| 250   | Yes      |
| 100 days  | 2500| 500   | Yes      |

## Continuous XP Bonus

In addition to milestone bonuses:
```javascript
// Calculate ongoing streak bonus
const streakBonus = Math.min(currentStreak * 5, 50);
// 1 day = 5%, 2 days = 10%, ... 10+ days = 50%

// Apply to XP
gameController.addXP(100, { includeStreakBonus: true });
// With 10-day streak: 100 * 1.5 = 150 XP
```

## Netlify Function Examples

### Check Streak Status
```javascript
// Frontend call
const response = await fetch(
  `/.netlify/functions/check-streak?` +
  `userId=default&` +
  `lastActivityDate=${lastDate}&` +
  `currentStreak=${streak}`
);
const data = await response.json();
console.log(data.streakStatus); // 'safe', 'at-risk', 'broken'
```

### Update Streak
```javascript
// Frontend call
const response = await fetch('/.netlify/functions/update-streak', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'default',
    lessonNumber: 5,
    currentStreak: 6,
    longestStreak: 8,
    lastActivityDate: '2025-09-18'
  })
});
const data = await response.json();
if (data.milestone) {
  console.log(`Milestone reached: ${data.milestone} days!`);
}
```

## Styling Customization

All styles are in `/css/streak-display.css`:

```css
/* Change streak flame color */
.streak-stat.streak-active .stat-value {
  color: #ff6b6b; /* Default: red */
}

/* Customize warning banner */
.streak-status-container.streak-warning {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
}

/* Adjust celebration modal colors */
.streak-celebration-modal .modal-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Calendar completed day color */
.calendar-day.completed {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
}
```

## Performance Considerations

1. **LocalStorage**: All data stored locally - no backend calls needed for basic operations
2. **Lazy Loading**: Calendar modal only renders when opened
3. **Debouncing**: Streak updates are debounced to prevent multiple calls
4. **Caching**: Calendar data cached for 5 minutes to reduce recalculations

## Security Notes

1. **Client-Side Only**: Current implementation is fully client-side
2. **No Authentication**: Uses localStorage - data is per-browser
3. **No Validation**: Trust client data (fine for MVP)

**For Production:**
- Store streaks in Supabase database
- Validate B-day calculations server-side
- Add user authentication
- Prevent streak manipulation

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Uses modern JavaScript (ES6+) features:
- Arrow functions
- Template literals
- Destructuring
- Optional chaining
- Custom events

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements for streak updates
- High contrast mode compatible
- Focus indicators on all buttons

## Common Issues & Solutions

### Streak not incrementing
```javascript
// Debug: Check if today is a B-day
const todayLesson = LessonScheduler.getTodaysLesson();
console.log('Is today a B-day?', todayLesson !== null);

// Debug: Check last activity
const streakData = StreakTracker.getStreakData();
console.log('Last activity:', streakData.lastActivityDate);
console.log('Today:', StreakTracker._getTodayDateString());
```

### Calendar not showing
```javascript
// Check if streak-display.js is loaded
console.log('StreakDisplay loaded?', typeof window.StreakDisplay !== 'undefined');

// Check if CSS is loaded
const cssLoaded = Array.from(document.styleSheets)
  .some(sheet => sheet.href?.includes('streak-display.css'));
console.log('CSS loaded?', cssLoaded);
```

### Milestone not triggering
```javascript
// Check milestone configuration
console.log('Milestones:', StreakTracker.MILESTONES);
console.log('Current streak:', StreakTracker.getStreakData().currentStreak);

// Listen for event
window.addEventListener('streakMilestone', (e) => {
  console.log('Milestone event fired!', e.detail);
});
```

## Adding New Features

### Add New Milestone
```javascript
// In streak-tracker.js
MILESTONES: [3, 7, 14, 30, 60, 100, 200], // Add 200

MILESTONE_REWARDS: {
  // ... existing milestones
  200: {
    xp: 5000,
    coins: 1000,
    message: "200 DAYS! You're a LEGEND!"
  }
}
```

### Add Streak Freeze Power-Up
```javascript
// In streak-tracker.js
freezeStreak(userId, cost = 50) {
  const profile = getUserProfile(userId);
  if (profile.coins < cost) {
    return { success: false, error: 'Not enough coins' };
  }

  // Deduct coins and set freeze flag
  profile.coins -= cost;
  this.saveStreakData({
    ...this.getStreakData(),
    streakFrozen: true,
    freezeDate: this._getTodayDateString()
  });

  return { success: true, coinsSpent: cost };
}
```

### Add Streak Leaderboard
```javascript
// In new file: streak-leaderboard.js
const StreakLeaderboard = {
  async getTopStreaks() {
    // Fetch from Supabase
    const { data } = await supabase
      .from('profiles')
      .select('username, current_streak')
      .order('current_streak', { ascending: false })
      .limit(10);
    return data;
  },

  displayLeaderboard(data) {
    // Render leaderboard UI
  }
};
```

## Migration to Backend

When ready to move to Supabase:

1. **Create table:**
```sql
CREATE TABLE daily_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  lesson_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

2. **Update profiles table:**
```sql
ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN last_activity_date DATE;
```

3. **Replace localStorage calls with Supabase:**
```javascript
// Instead of localStorage
async updateStreak(userId, date) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ current_streak: newStreak })
    .eq('id', userId);
  // ...
}
```

## Testing Checklist

- [ ] Streak increments on B-day completion
- [ ] Streak doesn't increment on A-days
- [ ] Streak breaks when B-day is skipped
- [ ] Milestone celebration appears at 7 days
- [ ] Confetti animation plays
- [ ] Calendar shows green squares for completed days
- [ ] Warning banner appears when at-risk
- [ ] XP bonus applies correctly
- [ ] Click streak stat to open calendar
- [ ] Responsive on mobile devices

## Support

For questions or issues:
1. Check `/docs/STREAK_SYSTEM_TEST.md` for testing procedures
2. Use browser console debugging commands
3. Check browser console for error messages
4. Verify all files are loaded in Network tab
