# FEATURES SPECIFICATION

## Overview

This document defines ALL features that need to be built for the platform. Each feature includes:
- User story
- Acceptance criteria
- Implementation notes
- Priority

---

## CRITICAL: NO COMPETITIVE FEATURES

**ABSOLUTE RULE**: This platform has ZERO competitive features.

### What This Means

NO:
- Leaderboards
- Class rankings
- Comparing students to each other
- Public achievement displays
- "Beat your classmates" messaging
- Social features

YES:
- Personal progress tracking
- Individual achievements
- Personal bests
- Daily streaks (personal goal)
- Self-improvement metrics

### Why This Matters

Students learn at different paces. Comparison creates:
- Math anxiety in struggling students
- Complacency in advanced students
- Unhealthy competition instead of learning

Every student's journey is personal and private.

---

## Core Features

### 1. User Authentication

**User Story**: As a student, I want to create an account so my progress is saved.

**Acceptance Criteria**:
- Students can sign up with email/password
- Students can log in and log out
- Password reset via email
- Session persists across browser sessions
- Only first name is collected (no last names for privacy)

**Implementation**:
```javascript
// Use Supabase Auth
await supabase.auth.signUp({
  email: 'student@email.com',
  password: 'password',
  options: {
    data: {
      first_name: 'Alex'
    }
  }
});
```

**Priority**: P0 (Must have for launch)

---

### 2. XP (Experience Points) System

**User Story**: As a student, I want to earn XP for completing lessons so I feel progress.

**Acceptance Criteria**:
- Students earn XP for:
  - Completing a lesson: 50 XP
  - Getting perfect score (5/5): +10 bonus XP
  - Maintaining a streak: +5 XP per day
  - Unlocking achievement: varies (10-100 XP)
- XP is cumulative (never decreases)
- XP determines student level (every 100 XP = 1 level)
- Level up animation/celebration
- XP is visible in header at all times

**XP Formula**:
```javascript
baseXP = 50; // per lesson
perfectBonus = (correctAnswers === totalQuestions) ? 10 : 0;
streakBonus = currentStreak * 5;
totalXP = baseXP + perfectBonus + streakBonus;
```

**UI Elements**:
- XP counter in header
- Progress bar to next level
- Level badge
- XP gain animation when earned

**Priority**: P0 (Must have for launch)

---

### 3. Coins System

**User Story**: As a student, I want to earn coins so I can unlock cosmetic rewards (future).

**Acceptance Criteria**:
- Students earn coins for:
  - Completing a lesson: 10 coins
  - Perfect score: +5 coins
  - Daily streak milestone (7, 14, 30 days): +20 coins
  - Achievement unlocked: varies
- Coins are cumulative (can be spent on future cosmetic items)
- Coin count visible in header

**Coin Formula**:
```javascript
baseCoins = 10; // per lesson
perfectBonus = (correctAnswers === totalQuestions) ? 5 : 0;
achievementBonus = 0; // varies by achievement
totalCoins = baseCoins + perfectBonus + achievementBonus;
```

**Future Use** (not for initial launch):
- Avatar customization
- Theme colors
- Celebration effects
- Profile badges

**Priority**: P0 (Must have for launch, even if no spending yet)

---

### 4. Daily Streaks (Personal Goal)

**User Story**: As a student, I want to track my daily practice streak so I stay motivated.

**Acceptance Criteria**:
- Streak starts at 0
- Streak increases by 1 when student completes any lesson that day
- Streak resets to 0 if student misses a B-day (class day)
- Weekends and holidays do NOT break streak
- Only B-days count for streak maintenance
- Streak is visible in header
- Milestone celebrations at 7, 14, 30, 60, 100 days

**Streak Logic**:
```javascript
function updateStreak(lastCompletedDate, currentDate) {
  // Get all B-days between last completion and today
  const missedBDays = getClassDaysBetween(lastCompletedDate, currentDate);

  if (missedBDays === 0) {
    // Completed today or no B-days passed
    streak++;
  } else if (missedBDays === 1 && isToday(currentDate)) {
    // Completed today after missing one B-day - increment from reset
    streak = 1;
  } else {
    // Missed 2+ B-days - streak broken
    streak = 0;
  }
}
```

**UI Elements**:
- Streak counter with fire emoji
- Streak milestone badges
- Warning when streak at risk (haven't practiced today)

**Priority**: P0 (Must have for launch)

---

### 5. Achievement Badges

**User Story**: As a student, I want to unlock achievement badges so I can see my accomplishments.

**Acceptance Criteria**:
- Achievements are personal (only visible to student)
- Achievement unlocked = permanent (never lost)
- Celebration animation when unlocked
- Achievement gallery shows all (locked + unlocked)
- Each achievement has:
  - Name
  - Description
  - Icon
  - XP reward
  - Coin reward

**Achievement Categories**:

**Streak Achievements**:
- "Week Warrior" - 7-day streak (50 XP, 20 coins)
- "Two Week Wonder" - 14-day streak (100 XP, 50 coins)
- "Month Master" - 30-day streak (200 XP, 100 coins)
- "Unstoppable" - 60-day streak (500 XP, 250 coins)

**Lesson Completion Achievements**:
- "First Steps" - Complete lesson 1 (10 XP)
- "Quarter Champion" - Complete Q1 (100 XP, 50 coins)
- "Halfway Hero" - Complete 50% of course (200 XP, 100 coins)
- "Graduation" - Complete all 87 lessons (1000 XP, 500 coins)

**Mastery Achievements**:
- "Perfect Practice" - Get 5/5 on any lesson (25 XP)
- "Perfectionist" - Get 5/5 on 10 lessons (100 XP, 50 coins)
- "Equation Expert" - Complete Unit 1 with 80%+ avg (150 XP)
- "Master of Math" - 90%+ average across all units (500 XP, 250 coins)

**Topic Achievements**:
- "Two-Step Wizard" - Master two-step equations (50 XP)
- "Distribution Dynamo" - Master distributive property (50 XP)
- "Both Sides Boss" - Master variables on both sides (75 XP)
- "Inequality Guru" - Master inequalities unit (75 XP)

**Implementation**:
```javascript
const achievements = {
  'week-warrior': {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xp: 50,
    coins: 20,
    check: (progress) => progress.currentStreak >= 7
  },
  // ... more achievements
};

function checkAchievements(progress) {
  const newlyUnlocked = [];

  for (const [id, achievement] of Object.entries(achievements)) {
    if (!progress.unlockedAchievements.includes(id)) {
      if (achievement.check(progress)) {
        newlyUnlocked.push(achievement);
        progress.unlockedAchievements.push(id);
        progress.xp += achievement.xp;
        progress.coins += achievement.coins;
      }
    }
  }

  return newlyUnlocked;
}
```

**Priority**: P1 (Important for engagement)

---

### 6. Skill Tree Visualization

**User Story**: As a student, I want to see my progress through a skill tree so I understand the learning path.

**Acceptance Criteria**:
- Visual tree showing all 87 lessons
- Lessons organized by unit/topic
- Completed lessons show checkmark
- Current lesson highlighted
- Future lessons grayed out (locked)
- Click lesson to view details
- Progress percentage shown for each unit

**Visual Structure**:
```
Unit 1: Equations (Lessons 1-21)
├── Two-Step Equations (1-3) ✓✓✓
├── Combining Terms (4-6) ✓✓○
├── Distribution (7-9) ○○○
├── Both Sides (10-12) 🔒🔒🔒
└── Special Solutions (13-16) 🔒🔒🔒🔒

Unit 2: Inequalities (Lessons 22-27) 🔒
Unit 3: Exponents (Lessons 28-36) 🔒
...
```

**Implementation**:
- Use CSS/SVG for tree structure
- Dynamic data from Supabase
- Responsive for mobile

**Priority**: P2 (Nice to have, not critical)

---

### 7. Adaptive Difficulty

**User Story**: As a student, I want problems to adjust to my level so I'm challenged but not frustrated.

**Acceptance Criteria**:
- System tracks mastery % per lesson
- If mastery < 60%: Generate easier variations
- If mastery > 90%: Generate harder variations
- Mastery = (correct answers / total attempts) * 100
- Difficulty adjusts per-student (no class-wide changes)
- Student never sees difficulty number (hidden metric)

**Difficulty Levels**:
```javascript
const difficultySettings = {
  easy: {
    maxCoefficient: 5,
    maxConstant: 10,
    allowNegatives: false,
    allowFractions: false
  },
  medium: {
    maxCoefficient: 10,
    maxConstant: 20,
    allowNegatives: true,
    allowFractions: false
  },
  hard: {
    maxCoefficient: 15,
    maxConstant: 30,
    allowNegatives: true,
    allowFractions: true
  }
};

function getNextDifficulty(mastery) {
  if (mastery < 60) return 'easy';
  if (mastery < 90) return 'medium';
  return 'hard';
}
```

**Priority**: P1 (Important for learning)

---

### 8. Progress Tracking

**User Story**: As a student, I want to see my progress so I know how far I've come.

**Acceptance Criteria**:
- Dashboard shows:
  - Total lessons completed
  - Current streak
  - Total XP and level
  - Total coins
  - Achievements unlocked
  - Average score per unit
  - Lessons completed this week
  - Time spent practicing (optional)
- Progress is PRIVATE (not shared with classmates)
- Teacher can view individual student progress (separate admin view)

**Dashboard Layout**:
```
┌─────────────────────────────────────────┐
│  Your Progress                          │
│                                         │
│  Level 12        XP: 1,234             │
│  🔥 Streak: 15   🪙 Coins: 432         │
│                                         │
│  Lessons Completed: 34/87 (39%)        │
│  [===============░░░░░░░░░░░░░]        │
│                                         │
│  This Week: 5 lessons ✓                │
│  Average Score: 87%                    │
│                                         │
│  Achievements Unlocked: 8/25           │
│  [Show All Achievements →]             │
└─────────────────────────────────────────┘
```

**Priority**: P0 (Must have for launch)

---

### 9. Lesson UI Components

**User Story**: As a student, I want a clear lesson interface so I can focus on learning.

**Acceptance Criteria**:

**Lesson Flow**:
1. Concept Introduction (splash screen)
2. Video Tutorial (embedded YouTube)
3. Worked Examples (step-by-step)
4. Practice Problems (interactive)
5. Lesson Complete (celebration + rewards)

**Required UI Elements**:
- Equation display (large, readable)
- Step-by-step solver interface
- 3D balance visualization (Three.js)
- Progress indicator (X/5 questions)
- Feedback messages (correct/incorrect)
- Hint button (reveals next step)
- Skip button (penalized: no XP)
- Timer (optional, for advanced students)

**Keyboard Navigation**:
- Tab: Move between inputs
- Enter: Submit answer
- Esc: Close modal/return to menu

**Accessibility**:
- ARIA labels on all interactive elements
- Screen reader support
- High contrast mode
- Keyboard-only navigation

**Priority**: P0 (Must have for launch)

---

### 10. Word Problem Generator

**User Story**: As a student, I want real-world word problems so I understand when to use math.

**Acceptance Criteria**:
- AI generates contextual word problems
- Aligned with current equation type
- Age-appropriate scenarios (8th grade interests)
- Diverse contexts (money, sports, gaming, cooking, etc.)
- Student must extract equation from word problem
- Option to "Show Equation" if stuck (loses 2 XP)

**Example Word Problem**:
```
Topic: Two-Step Equations
Equation Type: ax + b = c

Word Problem:
"You're saving up for a new game that costs $65. You already
have $20 saved. If you earn $9 per week doing chores, how many
weeks will it take to afford the game?"

Equation: 9x + 20 = 65
Answer: x = 5 weeks
```

**Implementation**:
- Use Gemini API (via Netlify proxy)
- Cache generated problems to reduce API calls
- Fallback to template-based generation if API fails

**Priority**: P2 (Nice to have, enhances learning)

---

### 11. Video Tutorial Integration

**User Story**: As a student, I want to watch video tutorials so I can learn concepts before practice.

**Acceptance Criteria**:
- Each lesson has an assigned YouTube video
- Videos are embedded (not external links)
- Student must confirm watching video before practicing
- Option to rewatch video during practice
- Videos are from trusted educational sources
- Closed captions available

**Video Sources**:
- Math with Mr. J
- Khan Academy
- The Organic Chemistry Tutor
- Other vetted educational channels

**Implementation**:
```javascript
const lessonMetadata = {
  1: {
    videoId: '0ackz7dJSYY', // YouTube video ID
    videoTitle: 'Two-Step Equations for Beginners'
  }
};

// Embed code
<iframe
  src={`https://www.youtube.com/embed/${videoId}`}
  title={videoTitle}
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
```

**Priority**: P0 (Must have for launch)

---

### 12. Worked Examples

**User Story**: As a student, I want to see worked examples so I understand how to solve problems.

**Acceptance Criteria**:
- 2-3 examples shown before practice
- Each example shows:
  - Original equation
  - Step-by-step solution
  - Explanation of each step
  - Final answer highlighted
- Examples cover different variations of concept
- Animated step-through (optional)
- "Got it!" button to proceed to practice

**Example Format**:
```
Example 1: Solve 3x + 5 = 20

Step 1: Subtract 5 from both sides
        3x + 5 - 5 = 20 - 5
        3x = 15

Step 2: Divide both sides by 3
        3x ÷ 3 = 15 ÷ 3
        x = 5

Answer: x = 5
```

**Priority**: P0 (Must have for launch)

---

### 13. Interactive Step Solver

**User Story**: As a student, I want step-by-step guidance so I can learn the solving process.

**Acceptance Criteria**:
- Student chooses next operation (not free-form input)
- Multiple choice for each step
- Immediate feedback (correct/incorrect)
- Explanation if incorrect
- Option to "Show Me" (reveals answer, loses XP)
- Visual balance updates after each step

**Step Solver Flow**:
```
Equation: 3x + 5 = 20

Question: "What should you do first?"
Options:
  A) Divide both sides by 3
  B) Subtract 5 from both sides ✓
  C) Add 5 to both sides

[Student selects B]

Feedback: "Correct! This undoes the +5."

New equation: 3x = 15

Question: "What should you do next?"
...
```

**Priority**: P0 (Must have for launch)

---

### 14. Date-Based Lesson Unlocking

**User Story**: As a student, I can only access today's lesson so I stay on pace with class.

**Acceptance Criteria**:
- Lessons unlock on specific B-days
- Student can replay old lessons
- Student cannot skip ahead to future lessons
- Teacher can override (password unlock)
- Clear messaging when lesson is locked
- Countdown to next lesson unlock

**Implementation**:
```javascript
function isLessonUnlocked(lessonNumber) {
  const today = new Date();
  const scheduledDate = getLessonDate(lessonNumber);

  // Can access if today or past
  if (today >= scheduledDate) return true;

  // Teacher override with password
  if (hasTeacherPassword()) return true;

  return false;
}
```

**Priority**: P0 (Must have for launch)

---

### 15. Student Report Generation

**User Story**: As a student, I want to download my progress report so I can share with parents.

**Acceptance Criteria**:
- Generate PDF report with:
  - Student name
  - Lessons completed
  - Average score per unit
  - Strengths and areas to improve
  - Achievements earned
  - Streak history
- Report is print-friendly
- Report is PRIVATE (not shared automatically)

**Priority**: P2 (Nice to have)

---

## Feature Prioritization

### P0: Must Have for Launch
1. User Authentication
2. XP System
3. Coins System
4. Daily Streaks
5. Progress Tracking
6. Lesson UI Components
7. Video Tutorial Integration
8. Worked Examples
9. Interactive Step Solver
10. Date-Based Lesson Unlocking

### P1: Important for Engagement
1. Achievement Badges
2. Adaptive Difficulty

### P2: Nice to Have
1. Skill Tree Visualization
2. Word Problem Generator
3. Student Report Generation

---

## What We're NOT Building

1. Leaderboards or rankings
2. Class-wide statistics visible to students
3. Social features (chat, comments, sharing)
4. Competitive modes
5. Timed challenges (stress-inducing)
6. Public achievement displays
7. Comparing students to each other
8. External sharing to social media

---

## Mobile Considerations

All features must work on:
- Phone screens (320px+)
- Tablets (768px+)
- Desktops (1024px+)

Touch-friendly:
- Buttons min 44px × 44px
- Swipe gestures for navigation
- No hover-only interactions

---

## Next Steps

Read these docs next:
1. **SUPABASE-SETUP.md** - How to store this data
2. **BUILD-GUIDE.md** - How to implement these features
3. **LESSON-IMPLEMENTATION.md** - How to build lessons
