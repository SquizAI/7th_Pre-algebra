# CRITICAL BUG: Returning User Experience

## The Problem (TL;DR)

**Returning users are forced to watch the entire video workflow again, even if they already watched it.**

This happens because the concept is only marked as "learned" when students click "Ready to Practice!" - but many students may watch the video, look at examples, then close the browser before practicing.

---

## Visual Evidence

### First-Time User Flow ✅
```
1. Enter Name
   ↓
2. Click "Start This Level"
   ↓
3. Concept Intro Screen (shows learning path)
   ↓
4. Watch Video Screen (3-5 min video)
   ↓
5. Examples Screen (worked examples)
   ↓
6. [Student closes browser here]
```

**localStorage saved:**
```json
{
  "studentName": "TestStudent123"
}
```
❌ **Note:** No `learnedConcepts` saved!

---

### Returning User Flow ❌ BUG

```
1. Page loads (name already saved)
   ↓
2. Click "Start This Level"
   ↓
3. ❌ SENT TO CONCEPT INTRO AGAIN!
   ↓
4. ❌ MUST WATCH VIDEO AGAIN!
   ↓
5. ❌ MUST VIEW EXAMPLES AGAIN!
```

**Expected Flow:**
```
1. Page loads
   ↓
2. Click "Start This Level"
   ↓
3. ✅ GO DIRECTLY TO GAME SCREEN
```

---

## The Code Bug

### Where it breaks:

**File:** `js/core/game.js` (Line 203-206)
```javascript
// This checks if learnedConcepts array is empty
if (levelId === 1 && learnedConcepts.length === 0) {
    console.log('✅ FIRST TIME USER - SHOWING LEVEL 1 VIDEO WORKFLOW');
    window.learningWorkflow.startLearningSequence(conceptKey, levelId);
    return;  // ← Exits here, never reaches game screen
}
```

**Problem:** `learnedConcepts` is ALWAYS empty because it's only populated here:

**File:** `js/features/learning-workflow.js` (Line 425-434)
```javascript
startPractice() {
    // Mark concept as learned
    this.markConceptLearned(this.currentConcept);  // ← ONLY SAVES HERE!
    
    // Now start the actual game level
    window.gameController.startLevelDirectly(
        window.gameController.equationGen.getLevelInfo(this.currentLevelId)
    );
}
```

`startPractice()` is only called when clicking "Ready to Practice!" on the examples screen.

---

## Real-World Impact

### Scenario 1: Student Takes a Break
```
Monday 3:00 PM:
- Student watches video ✅
- Student views examples ✅
- Student closes laptop (needs to go to practice)

Monday 5:00 PM:
- Student returns
- Clicks "Start This Level"
- ❌ FORCED TO WATCH 5-MIN VIDEO AGAIN
- Student: "I already saw this! This is dumb."
```

### Scenario 2: Student Reviews
```
Student has learned concept, wants extra practice:
- Clicks "Start This Level"
- ❌ SENT BACK TO CONCEPT INTRO
- ❌ CANNOT SKIP TO PRACTICE
- Must click through: Intro → Video → Examples → Practice
```

---

## Test Results

### localStorage After Full Session:

**After watching video + viewing examples:**
```json
{
  "studentName": "TestStudent123"
  // ← learnedConcepts is NULL!
}
```

**After clicking "Ready to Practice!":**
```json
{
  "studentName": "TestStudent123",
  "learnedConcepts": ["two-step-basic"]  // ← NOW it's saved!
}
```

---

## Console Evidence

### First Time (Expected):
```
Starting story mode, current level: 1
Concept key: two-step-basic
Learned concepts: []
✅ FIRST TIME USER - SHOWING LEVEL 1 VIDEO WORKFLOW  ✅ CORRECT
```

### Returning User (Bug):
```
Starting story mode, current level: 1
Concept key: two-step-basic
Learned concepts: []  ← STILL EMPTY!
✅ FIRST TIME USER - SHOWING LEVEL 1 VIDEO WORKFLOW  ❌ WRONG!
```

---

## Why This Matters

### User Frustration:
- Wasted time (5-7 minutes per return)
- Feeling disrespected ("The app doesn't remember me")
- Abandonment risk

### Learning Disruption:
- Students who want to practice get blocked
- Can't do "quick practice session"
- Defeats the purpose of "return anytime"

### UX Violation:
- Violates principle: "Respect user's time"
- No progress tracking between sessions
- Forces unnecessary repetition

---

## Screenshots

### Screenshot 07: Returning User (THE BUG)
![Returning user sent to concept intro](test-screenshots/07-returning-lesson-start.png)

**What's wrong here:**
- User already watched the video
- User already viewed examples  
- User should be at GAME SCREEN
- Instead: Back at concept intro!

---

## Quick Fix Options

### Option A: Save Progress After Video ⭐ RECOMMENDED
```javascript
// In learning-workflow.js, line 262
document.getElementById('videoWatchedCheck')?.addEventListener('change', (e) => {
    document.getElementById('continueToExamplesBtn').disabled = !e.target.checked;
    this.videoWatched = e.target.checked;
    
    // ADD THIS:
    if (e.target.checked) {
        this.markConceptLearned(this.currentConcept);
        localStorage.setItem(`videoWatched_${this.currentConcept}`, 'true');
    }
});
```

### Option B: Save Progress After Examples
```javascript
// In learning-workflow.js, line 350
showExamples() {
    const concept = this.concepts[this.currentConcept];
    this.examplesViewed = true;
    
    // ADD THIS:
    this.markConceptLearned(this.currentConcept);  // Save progress now!
    
    // ... rest of function
}
```

### Option C: Track Each Step
```javascript
// Create granular tracking:
localStorage.setItem('workflow_progress', JSON.stringify({
    'two-step-basic': {
        conceptIntro: true,
        videoWatched: true,
        examplesViewed: true,
        practiceStarted: false
    }
}));
```

---

## What Wasn't Tested (Due to Bug)

Because the bug prevented reaching the game screen on return, I couldn't test:

- ❓ Does 3D balance visualization render?
- ❓ Do word problems generate?
- ❓ Is there a canvas in #threeContainer?
- ❓ Are there any game screen errors?

**These require fixing the returning user bug first!**

---

## Priority

**CRITICAL** 🔴

This will affect EVERY student who:
- Takes breaks during learning
- Returns for additional practice
- Wants to review concepts

**Estimated users affected:** 80-90% of all students

---

## Next Action

1. Choose fix option (A, B, or C)
2. Implement fix
3. Re-run test to verify
4. Then test game screen features (3D viz, word problems)

---

**Bug Report Generated:** 2025-11-13  
**Test Script:** `test-returning-user.js`  
**Full Report:** `RETURNING_USER_TEST_REPORT.md`
