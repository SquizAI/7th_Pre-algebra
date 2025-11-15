# Integration Example: Connecting Lesson Player to Main App

## Quick Start

To integrate the Duolingo-style lesson player into your main application, follow these steps:

## Step 1: Update the "Start This Level" Button

### Location
`/index.html` - Line ~122

### Old Code (Game-based)
```html
<button class="menu-btn primary large" id="startStoryBtn">
    <span class="btn-icon">▶️</span>
    <span class="btn-text">Start This Level</span>
</button>
```

### New Code (Lesson Player)
```html
<button class="menu-btn primary large"
        id="startStoryBtn"
        onclick="LessonScheduler.launchTodaysLesson()">
    <span class="btn-icon">▶️</span>
    <span class="btn-text">Start Today's Lesson</span>
</button>
```

## Step 2: Add Lesson Player Scripts to Main Page

### Location
`/index.html` - Before closing `</body>` tag

### Add These Lines
```html
<!-- Lesson Player System -->
<script src="js/ui/exercise-types.js"></script>
<script src="js/ui/lesson-exercises.js"></script>
<!-- Note: lesson-player.js and lesson-complete.js only needed on lesson-player.html -->
```

## Step 3: Create Skill Tree Integration (Optional)

If you have a skill tree or lesson list, add click handlers:

### Example: Skill Node Click
```javascript
// In your skill tree rendering code
function renderSkillNode(lessonNumber) {
  const node = document.createElement('div');
  node.className = 'skill-node';
  node.textContent = `Lesson ${lessonNumber}`;

  // Add click handler to launch lesson
  node.addEventListener('click', () => {
    LessonScheduler.launchLesson(lessonNumber);
  });

  return node;
}
```

### Example: Lesson List
```html
<div class="lesson-list">
  <div class="lesson-item" onclick="LessonScheduler.launchLesson(1)">
    <h3>Lesson 1: Welcome to Algebra Castle</h3>
    <p>Two-Step Equations Introduction</p>
  </div>

  <div class="lesson-item" onclick="LessonScheduler.launchLesson(2)">
    <h3>Lesson 2: Two-Step Mastery</h3>
    <p>Practice solving two-step equations</p>
  </div>

  <!-- More lessons... -->
</div>
```

## Step 4: Display Progress on Main Page

### Show Completed Lessons
```javascript
// Get completed lessons
const progress = LessonScheduler.getProgress();
const completed = progress.completedLessons;

// Display somewhere on your page
document.getElementById('completedCount').textContent =
  `${completed.length} lessons completed`;
```

### Show Today's Lesson Status
```javascript
const todaysLesson = LessonScheduler.getTodaysLesson();

if (todaysLesson) {
  const metadata = ScheduleConfig.getLessonMetadata(todaysLesson.lessonNumber);

  document.getElementById('todayLesson').innerHTML = `
    <h3>Today's Lesson</h3>
    <p>${metadata.name}</p>
    <button onclick="LessonScheduler.launchTodaysLesson()">
      Start Lesson
    </button>
  `;
}
```

## Step 5: Update Navigation Flow

### Return from Lesson Player

The lesson player automatically returns to `/index.html` after completion. To customize:

Edit `/js/ui/lesson-complete.js` - Line ~285:

```javascript
close() {
  this.modal.classList.remove('active');
  setTimeout(() => {
    this.modal.style.display = 'none';

    // Customize return destination
    window.location.href = '/index.html';  // or '/skill-tree.html'
  }, 300);
}
```

## Complete Integration Example

Here's a full example of updating the main menu:

```html
<!-- index.html -->
<section class="workflow-instructions">
  <h3>Today's Learning</h3>

  <div id="todayLessonCard" class="lesson-card">
    <!-- Will be populated by JavaScript -->
  </div>

  <button class="btn-primary" id="startTodayBtn">
    Start Today's Lesson
  </button>
</section>

<script>
  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', () => {
    // Get today's lesson
    const todaysLesson = LessonScheduler.getTodaysLesson();

    if (todaysLesson) {
      const metadata = ScheduleConfig.getLessonMetadata(todaysLesson.lessonNumber);

      // Display lesson info
      document.getElementById('todayLessonCard').innerHTML = `
        <div class="lesson-icon">${getLessonIcon(metadata.topic)}</div>
        <h4>${metadata.name}</h4>
        <p class="lesson-topic">${metadata.topic}</p>
        <p class="lesson-standard">${metadata.standard}</p>
      `;

      // Add click handler
      document.getElementById('startTodayBtn')
        .addEventListener('click', () => {
          LessonScheduler.launchTodaysLesson();
        });
    } else {
      // No lesson today
      document.getElementById('todayLessonCard').innerHTML = `
        <p>No lesson scheduled for today. Great job staying on track!</p>
      `;
      document.getElementById('startTodayBtn').style.display = 'none';
    }
  });

  function getLessonIcon(topic) {
    const icons = {
      'Two-Step Equations': '🎯',
      'Combining Like Terms': '🌲',
      'Distributive Property': '📦',
      'Variables on Both Sides': '⚖️',
      'Solution Types': '🔍'
    };
    return icons[topic] || '📚';
  }
</script>
```

## Testing the Integration

### 1. Test Launch from Main App
1. Open `/index.html`
2. Click "Start Today's Lesson" button
3. Verify it redirects to `/lesson-player.html?lesson=X`
4. Verify lesson loads correctly

### 2. Test Return to Main App
1. Complete a lesson
2. Click "Continue" on completion screen
3. Verify it returns to `/index.html`
4. Verify lesson marked as completed

### 3. Test Progress Tracking
```javascript
// In browser console
LessonScheduler.getProgress()
// Should show: { completedLessons: [1], lastAccessDate: "..." }
```

## Backward Compatibility

If you want to keep both the old game-based system AND the new lesson player:

```javascript
// Add a toggle in settings
const useLessonPlayer = localStorage.getItem('useLessonPlayer') === 'true';

document.getElementById('startBtn').addEventListener('click', () => {
  if (useLessonPlayer) {
    LessonScheduler.launchTodaysLesson();
  } else {
    gameController.startLevel(1);  // Old system
  }
});
```

## Troubleshooting

### "LessonScheduler is not defined"
**Solution:** Ensure scripts are loaded in correct order:
```html
<script src="js/config/schedule.js"></script>
<script src="js/features/lesson-scheduler.js"></script>
<!-- Then your custom code -->
```

### Lesson doesn't launch
**Check:**
1. Lesson status: `LessonScheduler.getLessonStatus(1)` should not be 'locked'
2. URL format: Should be `/lesson-player.html?lesson=1`
3. Browser console for errors

### Progress not saving
**Check:**
1. `LessonScheduler.completLesson()` is called after completion
2. localStorage is enabled
3. Check stored data: `localStorage.getItem('lessonProgress')`

## Next Steps

1. Add lesson player to your navigation
2. Style the integration to match your theme
3. Add progress indicators (completion badges, streak counter)
4. Create a lesson history page
5. Add achievements display to main menu

## Example Pages

See these for working examples:
- `/test-lesson-player.html` - Testing interface
- `/lesson-player.html` - Actual lesson player
- `/docs/LESSON-PLAYER-GUIDE.md` - Full documentation
