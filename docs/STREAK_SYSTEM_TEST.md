# Streak System Testing Guide

## Overview
The streak tracking system tracks student learning streaks on B-days only (not every calendar day).

## Components Created

### 1. JavaScript Files

**`/js/features/streak-tracker.js`** - Core streak management
- `checkStreakToday()` - Check if lesson completed today
- `updateStreak(userId, date)` - Update streak when lesson completed
- `breakStreak(userId)` - Reset streak to 0
- `getStreakStatus(userId)` - Get current streak info
- `calculateStreakBonus(streakDays)` - Calculate milestone bonuses
- `getCalendarView(days)` - Get activity calendar data

**`/js/ui/streak-display.js`** - UI components
- Navbar streak counter with flame emoji 🔥
- Status messages (warnings, success)
- Milestone celebration animations with confetti
- Calendar view modal with activity squares
- Event listeners for streak updates

### 2. Netlify Functions

**`/functions/check-streak.js`** - GET endpoint
- Checks if streak is still active
- Compares last activity date to current date
- Returns streak status and recommendations

**`/functions/update-streak.js`** - POST endpoint
- Updates streak when lesson completed
- Checks if first lesson of the day
- Handles streak continuation or breaking
- Returns milestone information and bonuses

### 3. Styles

**`/css/streak-display.css`** - Complete styling
- Navbar streak stat with pulse animation
- Status container (warning/success states)
- Celebration modal with gradient background
- Confetti animation
- Calendar grid with hover effects
- Fully responsive design

## Streak Milestones

| Days | XP Bonus | Coins | Message |
|------|----------|-------|---------|
| 3    | 50       | 10    | "3-day streak! You're on fire!" |
| 7    | 100      | 25    | "One week streak! Amazing dedication!" |
| 14   | 200      | 50    | "Two weeks! You're unstoppable!" |
| 30   | 500      | 100   | "30-day streak! Legendary!" |
| 60   | 1000     | 250   | "60 days! You're a math master!" |
| 100  | 2500     | 500   | "100 DAYS! Absolute legend!" |

## XP Bonuses

In addition to milestone bonuses, students get ongoing XP bonuses:
- **5% per day** streak bonus on regular XP
- **Max 50%** bonus at 10+ day streak
- Example: With 10-day streak, 100 XP becomes 150 XP

## Testing Instructions

### Test 1: Complete Lesson on B-day
```javascript
// Open browser console
window.LessonScheduler.completLesson(1);
// Expected: Streak increments to 1
// Expected: Navbar shows "🔥 1"
```

### Test 2: Skip a B-day
```javascript
// Manually set last activity to 2 B-days ago
const streakData = window.StreakTracker.getStreakData();
const lastBDay = window.StreakTracker._getLastBDay(new Date());
// Simulate missed B-day by setting old date
localStorage.setItem('streakData', JSON.stringify({
  ...streakData,
  lastActivityDate: '2025-09-04'
}));

// Complete lesson today
window.LessonScheduler.completLesson(2);
// Expected: Streak breaks and resets to 1
```

### Test 3: Reach 7-day Milestone
```javascript
// Manually set streak to 6 days
localStorage.setItem('streakData', JSON.stringify({
  currentStreak: 6,
  longestStreak: 6,
  lastActivityDate: window.StreakTracker._getLastBDay(new Date()),
  totalBDaysCompleted: 6
}));

// Complete lesson
window.LessonScheduler.completLesson(3);
// Expected: Confetti animation
// Expected: Celebration modal with "7-day milestone!"
// Expected: +100 XP and +25 coins displayed
```

### Test 4: View Calendar
```javascript
// Click on the streak stat in navbar (🔥 icon)
// OR run:
window.StreakDisplay.showCalendarView();
// Expected: Modal shows last 90 days
// Expected: Green squares for completed B-days
// Expected: Gray squares for non-B-days
// Expected: Blue border on today
```

### Test 5: Check Status
```javascript
const status = window.StreakTracker.getStreakStatus();
console.log(status);
// Expected output:
// {
//   currentStreak: 5,
//   longestStreak: 7,
//   status: "at-risk" or "completed-today" or "safe",
//   message: "Complete a lesson today to keep your 5-day streak!",
//   nextMilestone: 7,
//   daysUntilMilestone: 2
// }
```

### Test 6: Netlify Function - Check Streak
```bash
# Test the check-streak endpoint
curl "http://localhost:8888/.netlify/functions/check-streak?userId=default&lastActivityDate=2025-09-08&currentStreak=5"

# Expected response:
# {
#   "userId": "default",
#   "currentStreak": 5,
#   "streakStatus": "safe",
#   "shouldBreakStreak": false,
#   "message": "Streak is safe",
#   ...
# }
```

### Test 7: Netlify Function - Update Streak
```bash
# Test the update-streak endpoint
curl -X POST http://localhost:8888/.netlify/functions/update-streak \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "default",
    "lessonNumber": 5,
    "currentStreak": 6,
    "longestStreak": 6,
    "lastActivityDate": "2025-09-18"
  }'

# Expected response:
# {
#   "success": true,
#   "streakUpdated": true,
#   "currentStreak": 7,
#   "milestone": 7,
#   "bonus": { "xp": 100, "coins": 25, ... }
# }
```

## Integration Points

### When Lesson is Completed
The system automatically:
1. Calls `StreakTracker.updateStreak()`
2. Checks for milestones
3. Triggers celebration if milestone reached
4. Updates UI with new streak count
5. Shows status message if needed

### XP Calculation
```javascript
// In game.js, when adding XP:
gameController.addXP(50, { includeStreakBonus: true });
// With 10-day streak: 50 * 1.5 = 75 XP total
```

## Calendar Behavior

### Color Coding
- **Green square**: Completed B-day ✅
- **White square**: Missed B-day (not completed) ❌
- **Light gray square**: Not a B-day (A-day, weekend, holiday)
- **Blue border**: Today

### Hover States
- Hover over any day to see:
  - Date
  - Whether it was completed
  - Whether it was a B-day

## Status Messages

### Warning (Red Banner)
Shows when:
- Current streak > 0
- Today is a B-day
- Haven't completed lesson yet

Message: "Complete a lesson today to keep your 5-day streak!"

### Success (Green Banner)
Shows when:
- Completed lesson today
- Streak is active

Message: "5 day streak! Great work! 2 more days to 7-day milestone!"

## Responsive Design

- **Desktop**: Full calendar grid, large celebration modals
- **Tablet**: Adjusted calendar size, medium modals
- **Mobile**: Compact calendar, mobile-friendly modals

## Reset Functions

### Reset Streak Data
```javascript
window.StreakTracker.resetAllStreaks();
// Confirms before clearing all data
```

### Reset Lesson Progress
```javascript
window.LessonScheduler.resetProgress();
// Confirms before clearing completed lessons
```

## Known Limitations

1. **Local Storage Only**: Currently stores data in localStorage. For multi-device sync, would need backend database integration.

2. **B-day Calculation**: Uses simple alternating day calculation. In production, should use the actual lesson calendar JSON.

3. **Timezone**: All dates use local timezone. For schools across timezones, would need UTC handling.

4. **No Streak Freeze**: Currently no "streak freeze" power-up to skip a day without breaking streak.

## Future Enhancements

1. **Backend Integration**
   - Store streaks in Supabase database
   - Sync across devices
   - Historical streak data

2. **Streak Freeze Power-Up**
   - Allow students to "freeze" streak for 1 day
   - Costs coins (e.g., 50 coins per freeze)
   - Max 2 freezes per month

3. **Leaderboard** (Optional)
   - Class-wide streak leaderboard
   - Weekly/monthly top streaks
   - Privacy-friendly display names

4. **Push Notifications**
   - Remind student to complete lesson on B-days
   - Celebrate milestones
   - Warn about at-risk streaks

5. **Streak Recovery**
   - Allow 1-time streak recovery per month
   - Costs coins to recover broken streak
   - Educational: teaches value of consistency

## Debugging Commands

```javascript
// View current streak data
console.log(window.StreakTracker.getStreakData());

// View streak status
console.log(window.StreakTracker.getStreakStatus());

// View calendar data
console.log(window.StreakTracker.getCalendarView(30));

// View lesson schedule
console.log(window.LessonScheduler.getSchedule());

// Check today's lesson
console.log(window.LessonScheduler.getTodaysLesson());

// Manually trigger milestone celebration
window.StreakDisplay.showMilestoneCelebration(7, {
  xp: 100,
  coins: 25,
  message: "One week streak! Amazing dedication!"
});

// Manually trigger confetti
window.StreakDisplay.triggerConfetti();
```

## Success Criteria

✅ Streaks only count B-days (not every calendar day)
✅ Weekends and A-days don't count as "missed days"
✅ Streak increments when lesson completed on B-day
✅ Streak breaks if B-day is skipped
✅ Milestone celebration at 7, 14, 30 days
✅ Confetti animation for major milestones
✅ Calendar view shows green squares for completed days
✅ Status messages warn about at-risk streaks
✅ Navbar displays flame emoji with count
✅ XP bonus applies to regular gameplay
