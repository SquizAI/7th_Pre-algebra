# Achievement System Guide

## Overview

The Achievement System tracks student progress and awards badges for completing various tasks, maintaining streaks, achieving accuracy goals, and more.

## Features

### 40+ Achievements Across 6 Categories

1. **Completion** - Finishing lessons, units, quarters, and worlds
2. **Accuracy** - Perfect scores, high accuracy, flawless lessons
3. **Speed** - Fast lesson completion times
4. **Streaks** - Daily login streaks and learning consistency
5. **Mastery** - Topic mastery, total equations solved
6. **Special** - Unique achievements like time-based, retries, and tools usage

## File Structure

```
/data/achievements.json              - All achievement definitions
/js/features/achievement-system.js   - Core achievement logic
/js/ui/achievement-display.js        - UI components and notifications
/achievements.html                   - Achievement gallery page
/css/achievements.css                - Achievement styles
/functions/award-achievement.js      - Netlify serverless function
```

## Achievement Definitions

Each achievement has:

```json
{
  "id": "first_steps",
  "name": "First Steps",
  "description": "Complete your first lesson",
  "badge_icon": "🏆",
  "xp_reward": 10,
  "category": "completion",
  "unlock_criteria": {
    "type": "lessons_completed",
    "value": 1
  }
}
```

## Usage Examples

### 1. Check Achievements on Lesson Complete

```javascript
// In your lesson completion code
if (window.AchievementSystem) {
  await window.AchievementSystem.checkAchievements('lesson_complete', {
    lessonId: 5,
    score: 100,
    time: 120  // seconds
  });
}
```

### 2. Track Practice Problems

```javascript
// When a practice problem is answered
window.AchievementSystem.checkAchievements('practice_problem', {
  correct: true
});
```

### 3. Track Video Views

```javascript
// When a video is watched
window.AchievementSystem.checkAchievements('video_watched', {
  videoId: 'two-step-equations'
});
```

### 4. Track Tool Usage

```javascript
// When AI helper is used
window.AchievementSystem.checkAchievements('ai_helper', {
  context: 'equation-help'
});

// When step solver is used
window.AchievementSystem.checkAchievements('step_solver', {
  problemType: 'two-step'
});
```

## Event Types

The system recognizes these event types:

- `lesson_complete` - Lesson finished
- `lesson_start` - Lesson started
- `practice_problem` - Practice problem answered
- `video_watched` - Video tutorial watched
- `ai_helper` - AI helper used
- `step_solver` - Step-by-step solver used
- `visualization` - 3D visualization used
- `word_problem` - Word problem completed
- `score_improvement` - Score improved on retry
- `unit_complete` - Unit finished
- `quarter_complete` - Quarter finished
- `world_complete` - World finished
- `topic_mastery` - Topic mastered
- `practice_arena` - Practice arena challenge completed
- `xp_earned` - XP earned
- `coins_earned` - Coins earned
- `level_up` - Player leveled up

## Achievement Categories

### Completion Achievements
- First Steps (10 XP)
- Explorer (30 XP) - Try 10 lessons
- Fifty Club (200 XP) - Complete 50 lessons
- Math Master (500 XP) - Complete all 87 lessons
- Unit Complete (100 XP)
- Quarter King (250 XP)
- Castle Conqueror (100 XP)
- Forest Explorer (100 XP)
- Mountain Climber (100 XP)
- Ocean Navigator (100 XP)
- Dragon Slayer (150 XP)

### Accuracy Achievements
- Perfect Score (20 XP)
- Triple Perfect (75 XP) - 3 perfect in a row
- No Mistakes (40 XP) - Flawless lesson
- Accuracy Ace (70 XP) - 90%+ over 20 problems

### Speed Achievements
- Speed Demon (25 XP) - Under 3 minutes
- Lightning Fast (50 XP) - Under 1 minute
- Speed Runner (100 XP) - 5 lessons under 3 minutes

### Streak Achievements
- Week Warrior (50 XP) - 7-day streak
- Month Master (200 XP) - 30-day streak
- Dedication Award (100 XP) - 14 consecutive logins
- Steady Progress (65 XP) - 10 active days

### Mastery Achievements
- Equation Expert (60 XP) - 100 correct equations
- Centurion (150 XP) - 500 correct equations
- Distribution Master (80 XP)
- Fraction Fanatic (90 XP)
- Both Sides Boss (85 XP)

### Special Achievements
- Comeback Kid (15 XP) - Improve score on retry
- Early Bird (20 XP) - Complete before 8 AM
- Night Owl (20 XP) - Complete after 8 PM
- Weekend Warrior (35 XP) - Weekend completion
- Five Star Student (50 XP) - 5 lessons in one day
- Help Seeker (15 XP) - Use AI helper 5 times
- Coin Collector (50 XP) - Earn 1000 coins
- XP Hunter (100 XP) - Earn 5000 XP

## Display Components

### Achievement Unlock Modal

Shows full-screen celebration when achievement is unlocked:
- Animated badge icon
- Achievement name and description
- XP reward
- Shine/glow effects
- Sound effect

### Toast Notifications

Small notifications in top-right:
- Badge icon
- Achievement name
- XP reward
- Auto-dismisses after 4 seconds

### Achievement Gallery

Browse all achievements at `/achievements.html`:
- Filter by category
- View progress on incomplete achievements
- See earned dates
- Track completion percentage

### Header Notification

Brief notification at top of page:
- Appears for 3 seconds
- Shows achievement name and icon

## Statistics Tracked

The system tracks these user statistics:

```javascript
{
  lessonsCompleted: 0,
  lessonsAttempted: 0,
  perfectLessons: 0,
  consecutivePerfect: 0,
  fastCompletions: 0,
  practiceProblems: 0,
  correctEquations: 0,
  videosWatched: 0,
  aiHelperUsed: 0,
  stepSolverUsed: 0,
  visualizationUsed: 0,
  wordProblems: 0,
  scoreImprovements: 0,
  currentStreak: 0,
  longestStreak: 0,
  activeDays: 0,
  loginStreak: 0,
  totalXP: 0,
  totalCoins: 0,
  playerLevel: 1,
  completedUnits: [],
  completedQuarters: [],
  completedWorlds: [],
  completedTopics: [],
  practiceArenaComplete: 0
}
```

## Testing

### Manual Testing Steps

1. **Test First Steps Achievement**
   - Open console
   - Run: `AchievementSystem.checkAchievements('lesson_complete', {lessonId: 1, score: 80})`
   - Should unlock "First Steps" achievement

2. **Test Perfect Score**
   - Run: `AchievementSystem.checkAchievements('lesson_complete', {lessonId: 2, score: 100})`
   - Should unlock "Perfect Score" achievement

3. **Test Speed Demon**
   - Run: `AchievementSystem.checkAchievements('lesson_complete', {lessonId: 3, score: 85, time: 150})`
   - Should unlock "Speed Demon" achievement

4. **View Achievements Gallery**
   - Navigate to `/achievements.html`
   - Should see all achievements
   - Filter by categories
   - View progress bars

5. **Test Streak**
   - Complete lessons on consecutive days
   - Check streak counter updates
   - Unlock Week Warrior at 7 days

### Reset Achievements

```javascript
// In console
AchievementSystem.resetAchievements()
```

## Integration Points

### In lesson-scheduler.js

```javascript
completLesson(lessonNumber, lessonData = {}) {
  // ... existing code ...

  if (window.AchievementSystem) {
    window.AchievementSystem.checkAchievements('lesson_complete', {
      lessonId: lessonNumber,
      score: lessonData.score || 0,
      time: lessonData.time || 0,
      ...lessonData
    });
  }
}
```

### In game.js

When tracking game events, add achievement checks:

```javascript
// Example: When player completes a level
this.completeLevel = async function() {
  // ... existing completion logic ...

  if (window.AchievementSystem) {
    await window.AchievementSystem.checkAchievements('lesson_complete', {
      lessonId: this.currentLevel,
      score: this.currentScore,
      time: this.levelTime
    });
  }
};
```

## Future Enhancements

1. **Leaderboards** - Compare achievements with classmates
2. **Rare Achievements** - Special limited-time achievements
3. **Achievement Points** - Separate point system for achievements
4. **Social Sharing** - Share achievements on social media
5. **Achievement Milestones** - Unlock special rewards at achievement milestones
6. **Custom Achievements** - Teacher-created achievements
7. **Achievement Chains** - Series of related achievements
8. **Seasonal Achievements** - Holiday and season-specific badges

## Troubleshooting

### Achievement Not Unlocking

1. Check console for errors
2. Verify event type matches achievement criteria type
3. Confirm stats are being tracked: `console.log(AchievementSystem._userStats)`
4. Check if already unlocked: `console.log(AchievementSystem._userAchievements)`

### Progress Not Saving

1. Check localStorage is enabled
2. Verify browser storage quota
3. Check for console errors during save

### Display Issues

1. Ensure CSS file is loaded
2. Check for JavaScript errors
3. Verify DOM elements exist before rendering

## Support

For issues or questions:
- Check browser console for errors
- Verify all files are loaded correctly
- Test in different browsers
- Clear localStorage and retry
