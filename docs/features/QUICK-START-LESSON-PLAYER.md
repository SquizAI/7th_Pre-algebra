# Quick Start: Lesson Player

## Test It Now (3 steps)

### 1. Open Test Page
```
http://localhost:8888/test-lesson-player.html
```

### 2. Click "Lesson 1"
Start the first sample lesson

### 3. Complete the Lesson
- Answer 7 exercises
- See your score and rewards
- Click "Continue" to return

## Launch from Main App

### Update Start Button

**File:** `/index.html` (Line ~122)

**Change this:**
```html
<button id="startStoryBtn">Start This Level</button>
```

**To this:**
```html
<button id="startStoryBtn" onclick="LessonScheduler.launchTodaysLesson()">
    Start Today's Lesson
</button>
```

**Add scripts:** (before `</body>`)
```html
<script src="js/ui/exercise-types.js"></script>
<script src="js/ui/lesson-exercises.js"></script>
```

## Files Created

```
/js/ui/
  ├── exercise-types.js      ← Exercise question types
  ├── lesson-player.js       ← Main lesson controller
  ├── lesson-complete.js     ← Completion screen
  └── lesson-exercises.js    ← Lesson data (Lessons 1-6)

/css/
  └── lesson-player.css      ← All styling

/
  ├── lesson-player.html     ← Lesson player page
  └── test-lesson-player.html ← Test interface
```

## Key Features

- **5-7 exercises per lesson** (5-10 minutes)
- **5 question types**: Multiple choice, fill in blank, math problems, true/false, ordering
- **Immediate feedback**: Green checkmark or red X with hints
- **Progress tracking**: "Exercise 3 of 7" with visual bar
- **Rewards**: 50-90 XP + 5-10 coins based on performance
- **Achievements**: Perfect score, speed demon, first try master
- **Animations**: Success pulse, error shake, reward count-up
- **Mobile responsive**: Works on all devices
- **Accessible**: Keyboard navigation, screen reader support

## Sample Lessons Included

1. **Lesson 1:** Two-Step Equations (7 exercises)
2. **Lesson 2:** Two-Step Mastery (6 exercises)
3. **Lesson 3:** Two-Step Review (6 exercises)
4. **Lesson 4:** Combining Like Terms (6 exercises)
5. **Lesson 5:** Like Terms Practice (5 exercises)
6. **Lesson 6:** Terms Review (5 exercises)

## Quick Commands

### Launch Lesson
```javascript
LessonScheduler.launchLesson(1)  // Lesson 1
```

### Check Progress
```javascript
LessonScheduler.getProgress()
```

### View Results
```javascript
JSON.parse(localStorage.getItem('lessonResults'))
```

### Reset Progress
```javascript
LessonScheduler.resetProgress()
```

## Adding New Lessons

### 1. Add Exercise Data

**File:** `/js/ui/lesson-exercises.js`

```javascript
exercises: {
  // ... existing ...

  7: [  // New lesson
    {
      type: 'multipleChoice',
      question: 'Your question here?',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 1,
      hint: 'Helpful hint'
    },
    {
      type: 'mathProblem',
      equation: '2x + 3 = 11',
      correctAnswer: 4,
      hint: 'Subtract 3 first'
    }
    // ... 3-5 more exercises
  ]
}
```

### 2. Add Metadata

**File:** `/js/config/schedule.js`

```javascript
lessonMetadata: {
  // ... existing ...

  7: {
    name: 'Your Lesson Name',
    standard: 'MA.8.AR.2.1',
    topic: 'Your Topic',
    videoId: 'YouTubeVideoID'
  }
}
```

### 3. Test
```
http://localhost:8888/lesson-player.html?lesson=7
```

## Troubleshooting

### Lesson won't load
- Check URL has `?lesson=1` parameter
- Open browser console (F12) for errors
- Verify exercise data exists in `lesson-exercises.js`

### Progress not saving
- Check localStorage enabled (not incognito mode)
- Verify `LessonScheduler` is loaded
- Check console for errors

### Exercises not showing
- Verify `exercise-types.js` is loaded
- Check exercise type spelling
- Look for errors in browser console

## Documentation

- **Full Guide:** `/docs/LESSON-PLAYER-GUIDE.md`
- **Integration:** `/docs/INTEGRATION-EXAMPLE.md`
- **Summary:** `/docs/LESSON-PLAYER-SUMMARY.md`

## Support

1. Check browser console (F12)
2. Try lesson 1 (known working)
3. Review documentation files
4. Test with `/test-lesson-player.html`

## Next Steps

1. ✅ Test lessons 1-6
2. ✅ Review documentation
3. ⬜ Integrate with main app
4. ⬜ Create more lessons
5. ⬜ Test with students
6. ⬜ Collect feedback

---

**Status:** Production Ready
**Version:** 1.0
**Created:** November 2025
