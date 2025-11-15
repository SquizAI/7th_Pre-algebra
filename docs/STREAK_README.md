# 🔥 Daily Streaks System

## Overview

A **B-days only** personal tracking system that encourages consistent learning by rewarding students for completing lessons on consecutive class days.

## Key Features

### ✅ Personal Tracking (Non-Competitive)
- Track individual learning streaks
- No leaderboards or comparisons
- Focus on self-improvement

### 📅 B-Days Only
- Streaks only count on B-days (class days)
- Weekends and A-days don't break your streak
- Reads from lesson calendar: `/docs/lesson_calendar_B_days_2025-2026.json`

### 🎯 Milestone Celebrations
- **3 days**: +50 XP, +10 coins
- **7 days**: +100 XP, +25 coins + 🎊 confetti
- **14 days**: +200 XP, +50 coins + 🎊 confetti
- **30 days**: +500 XP, +100 coins + 🎊 confetti
- **60 days**: +1000 XP, +250 coins + 🎊 confetti
- **100 days**: +2500 XP, +500 coins + 🎊 confetti

### 💰 Continuous Bonuses
- 5% XP bonus per day of streak
- Max 50% bonus at 10+ days
- Example: 10-day streak = 50% more XP on all activities

### 📊 Visual Tracking
- **Navbar**: Flame emoji 🔥 with streak count
- **Status Messages**: Warnings when at-risk, encouragement when active
- **Calendar View**: Click streak stat to see activity history
  - Green squares = completed B-days
  - White squares = missed B-days
  - Gray squares = non-B-days

## How to Use

### As a Student

1. **Complete lessons on B-days** to build your streak
2. **Click the 🔥 icon** in the navbar to view your activity calendar
3. **Watch for warnings** if you haven't completed today's lesson
4. **Celebrate milestones** when you hit 7, 14, 30+ days!

### As a Developer

See full documentation:
- **Testing Guide**: `/docs/STREAK_SYSTEM_TEST.md`
- **Implementation Guide**: `/docs/STREAK_IMPLEMENTATION.md`

Quick integration:
```javascript
// Streak updates automatically when lesson completes
LessonScheduler.completLesson(lessonNumber);

// Add XP with streak bonus
gameController.addXP(50, { includeStreakBonus: true });

// Check current status
const status = StreakTracker.getStreakStatus();
console.log(`${status.currentStreak}-day streak!`);
```

## File Structure

```
/js/features/streak-tracker.js    - Core logic
/js/ui/streak-display.js          - UI components
/css/streak-display.css           - Styling
/functions/check-streak.js        - Netlify function (GET)
/functions/update-streak.js       - Netlify function (POST)
```

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: localStorage (can migrate to Supabase)
- **UI**: Custom CSS with animations
- **Backend**: Netlify Functions (optional)

## Screenshots

### Navbar Streak Display
```
┌─────────────────────────────────────┐
│  🔥 7  day streak                   │
└─────────────────────────────────────┘
```

### Warning Banner
```
┌─────────────────────────────────────┐
│ ⚠️ Complete a lesson today to keep  │
│    your 12-day streak!              │
└─────────────────────────────────────┘
```

### Celebration Modal
```
┌─────────────────────────────────────┐
│           🔥🔥🔥                     │
│       7-Day Streak!                 │
│                                     │
│   One week streak! Amazing          │
│        dedication!                  │
│                                     │
│   ⭐ +100 XP    🪙 +25 Coins       │
│                                     │
│  [Keep the Streak Going! 🚀]       │
└─────────────────────────────────────┘
```

### Calendar View
```
    Sun Mon Tue Wed Thu Fri Sat
    ▢   ▢   🟩  ▢   🟩  ▢   ▢
    ▢   ▢   🟩  ▢   ⬜  ▢   ▢
    ▢   ▢   🟩  ▢   🟩  ▢   ▢

Legend:
🟩 Completed B-day
⬜ Missed B-day
▢  Not a class day
```

## Benefits

### For Students
- **Motivation**: Visual progress encourages consistency
- **Rewards**: Tangible XP/coin bonuses for dedication
- **No Pressure**: Personal tracking, not competitive
- **Fair**: Only counts class days, not calendar days

### For Teachers
- **Engagement**: Students more likely to complete work regularly
- **Insights**: Can see activity patterns in calendar
- **Gamification**: Builds good study habits through game mechanics
- **Flexible**: Works with A/B schedule naturally

## Important Notes

### What Counts as "Completing a Lesson"?
A lesson is completed when:
- Student finishes all exercises
- `LessonScheduler.completLesson()` is called
- This can be triggered by:
  - Finishing practice problems
  - Passing a quiz
  - Watching required videos + doing exercises

### What Breaks a Streak?
A streak breaks when:
- A B-day passes without completing that day's lesson
- Example: If Sept 4 (B-day) and Sept 8 (B-day) are class days, you must complete lessons on both days to maintain streak

### What Doesn't Break a Streak?
- A-days (not class days)
- Weekends
- Holidays
- School breaks
- Days marked as "No School" in calendar

### Can You Recover a Broken Streak?
Currently: No automatic recovery
- Streak resets to 1 when you complete next lesson
- Longest streak is preserved

Future: Possible "Streak Freeze" power-up
- Cost: 50 coins
- Effect: Skip 1 B-day without breaking streak
- Limit: 2 per month

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Screen reader support with ARIA labels
- Keyboard navigation
- High contrast mode compatible
- Focus indicators on all interactive elements

## Privacy

- All data stored locally in browser (localStorage)
- No data sent to external servers
- No tracking or analytics
- Student controls their own data

## Future Enhancements

Planned features:
- [ ] Backend sync (Supabase integration)
- [ ] Streak freeze power-up (costs coins)
- [ ] Weekly summary emails (opt-in)
- [ ] Streak recovery (limited use)
- [ ] Multi-device sync
- [ ] Achievement badges for long streaks

Optional (if requested):
- [ ] Class-wide stats (anonymized)
- [ ] Friendly leaderboard (opt-in)
- [ ] Share achievements (social)

## Quick Start

### For Users
1. Complete a lesson on a B-day
2. Look for the 🔥 icon in the navbar
3. Keep completing lessons to build your streak!

### For Developers
1. Files are already integrated in `index.html`
2. Streak tracking works automatically
3. Check console for debug info
4. Run tests from `/docs/STREAK_SYSTEM_TEST.md`

## Troubleshooting

**Streak not incrementing?**
- Check if today is a B-day: `LessonScheduler.getTodaysLesson()`
- Verify lesson was completed: `LessonScheduler.isLessonCompleted(n)`

**Calendar not showing?**
- Check if `streak-display.css` is loaded
- Verify `StreakDisplay` is initialized
- Check browser console for errors

**Milestone not triggering?**
- Verify streak count is correct
- Check if milestone was already reached
- Listen for `streakMilestone` event in console

## Support & Documentation

- **Full Testing Guide**: `/docs/STREAK_SYSTEM_TEST.md`
- **Implementation Details**: `/docs/STREAK_IMPLEMENTATION.md`
- **Lesson Calendar**: `/docs/lesson_calendar_B_days_2025-2026.json`

## License

Part of the 7th Grade Pre-Algebra Learning Platform
Educational use only
