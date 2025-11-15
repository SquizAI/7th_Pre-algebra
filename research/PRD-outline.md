# Product Requirements Document: Duolingo-Style Pre-Algebra Platform

**Version:** 1.1
**Date:** 2025-11-13
**Status:** Draft
**Owner:** Product Team

---

## 1. Executive Summary

### 1.1 Vision and Goals

**Vision Statement:**
Transform 7th-grade pre-algebra learning into an addictive, Duolingo-style experience that makes equation solving as engaging as a mobile game while maintaining rigorous academic standards.

**Primary Goals:**
- **Daily Engagement:** Students return daily to maintain streaks (target: 60% DAU/MAU ratio)
- **Mastery-Based Progression:** No advancement without demonstrated understanding (85% accuracy threshold)
- **Retention:** 80% of students who complete Week 1 continue to Week 4
- **Learning Outcomes:** Average 25% improvement on standardized assessments

**Core Philosophy:**
Keep it SIMPLE. Focus on the proven Duolingo mechanics:
1. Bite-sized lessons (5-10 minutes)
2. Daily streaks and visible progress
3. Immediate feedback and celebration
4. Clear, linear progression path
5. No cognitive overload

### 1.2 Target Users

**Primary Segment:** 7th-grade students (ages 12-13)
- Digital natives comfortable with mobile/web apps
- Variable math confidence levels
- Need intrinsic motivation and visual progress
- Respond to gamification and personal achievement

**Secondary Segments:**
- **Teachers:** Need progress monitoring, standards alignment, minimal setup
- **Parents:** Want visibility into learning, struggle early-warning, time-on-task data

**User Distribution (Expected):**
- 70% independent student users (self-directed)
- 20% classroom-assigned (teacher-directed)
- 10% parent-directed (homework support)

### 1.3 Success Metrics

**North Star Metric:** Daily Active Lessons Completed (DALC)

**Primary KPIs:**
- **Engagement:** 5+ days per week active usage
- **Retention:** 30-day retention rate > 40%
- **Mastery:** Average 85% lesson completion rate
- **Streak:** 50% of active users maintain 7+ day streaks

**Secondary KPIs:**
- Time per session: 10-15 minutes (sweet spot)
- XP earned per week: 500+ (indicates consistent engagement)
- Concept mastery rate: 80% pass on first attempt after practice

---

## 2. User Stories

### 2.1 Student Personas

#### Persona A: "Confident Carlos"
- **Background:** Math comes easily, gets bored with repetition
- **Goals:** Fast progression, challenges, personal achievement
- **Pain Points:** Forced to wait for peers, unchallenging content
- **Must-Haves:**
  - Skip-ahead option after demonstrating mastery
  - Hard mode / challenge levels
  - Personal achievement tracking

**User Story:**
_"As a confident math student, I want to skip ahead when I prove mastery so that I don't waste time on concepts I already know."_

#### Persona B: "Struggling Sarah"
- **Background:** Math anxiety, falls behind, needs extra support
- **Goals:** Build confidence, understand fundamentals, avoid embarrassment
- **Pain Points:** Public failure, moving too fast, unclear explanations
- **Must-Haves:**
  - Unlimited practice without penalty
  - Video re-watch capability
  - Private progress (no public comparison)

**User Story:**
_"As a struggling math student, I want to practice unlimited times without judgment so that I can build confidence before moving forward."_

#### Persona C: "Motivated Maya"
- **Background:** Average ability, motivated by visible progress
- **Goals:** Maintain streak, see daily growth, earn rewards
- **Pain Points:** Losing motivation, unclear next steps
- **Must-Haves:**
  - Daily streak counter
  - Clear progress bars
  - Achievement badges

**User Story:**
_"As a motivated student, I want to see my daily streak and progress so that I stay motivated to practice every day."_

### 2.2 Teacher Personas

#### Persona D: "Tech-Savvy Tina"
- **Background:** Flipped classroom advocate, uses multiple edtech tools
- **Goals:** Track student progress, identify struggling students, standards alignment
- **Pain Points:** Too many dashboards, integration friction
- **Must-Haves:**
  - Class dashboard with at-a-glance progress
  - Export to Google Classroom/Canvas
  - Standards-aligned reporting

**User Story:**
_"As a teacher, I want to see which students are struggling on specific concepts so that I can provide targeted intervention."_

### 2.3 Parent Personas

#### Persona E: "Involved Ian"
- **Background:** Wants to support learning, but limited math knowledge
- **Goals:** Monitor progress, ensure homework completion
- **Pain Points:** Can't help with math content, unclear expectations
- **Must-Haves:**
  - Weekly progress emails
  - Simple parent dashboard
  - Recommended practice time

**User Story:**
_"As a parent, I want to receive weekly summaries of my child's progress so that I can encourage them and identify when they need extra help."_

### 2.4 Core Use Cases

**Use Case 1: Daily Practice Session**
1. Student logs in, sees streak counter (Day 7!)
2. "Continue" button shows next lesson in sequence
3. Complete 5-question lesson in 10 minutes
4. Earn XP, see progress bar advance
5. Receive celebration animation
6. Return tomorrow to maintain streak

**Use Case 2: Struggling on a Concept**
1. Student fails lesson (3/5 correct)
2. System prompts: "Want to review the video?"
3. Re-watch tutorial, try 3 practice problems
4. Retry lesson with different questions
5. Pass with 4/5 correct
6. Unlock next lesson

**Use Case 3: Teacher Monitoring**
1. Teacher logs into dashboard
2. See class heatmap: green (on track), yellow (struggling), red (inactive)
3. Click on yellow student, see specific struggles
4. Assign targeted practice from practice library
5. Student receives notification of assigned work

---

## 3. Core Features (MVP)

### 3.1 Lesson Progression System

**Current State:**
Platform has 5 "worlds" with multiple levels, but progression is not strictly enforced.

**MVP Requirements:**

**3.1.1 Linear Progression Path**
- **Must unlock lessons sequentially** (no skipping ahead without mastery)
- Clear visual path showing: Completed → Current → Locked
- Each lesson requires 80% accuracy (4/5 questions) to unlock next
- Allow replay of completed lessons for XP (but reduced rewards)

**3.1.2 Lesson Structure**
Every lesson follows this flow:
1. **Concept Introduction** (30 seconds): "You'll learn X to solve Y problems"
2. **Video Tutorial** (3-5 minutes): Embedded YouTube video
3. **Guided Examples** (2 minutes): Step-by-step walkthroughs
4. **Practice Problems** (5 questions): Interactive solving
5. **Mastery Check** (Pass/Fail): 4/5 correct required

**3.1.3 Lesson Metadata**
```json
{
  "lessonId": "L001",
  "title": "Two-Step Equations",
  "world": "Castle of Basics",
  "estimatedTime": "10 min",
  "prerequisites": [],
  "standards": ["MA.8.AR.2.1"],
  "difficulty": "beginner",
  "xpReward": 50,
  "coinReward": 10
}
```

**Technical Implementation:**
- Store lesson state in localStorage: `{lessonId: 'L001', status: 'completed', accuracy: 0.85, attempts: 1}`
- Check prerequisites before allowing access
- Show lock icon + tooltip on locked lessons

### 3.2 Gamification Mechanics

**3.2.1 XP (Experience Points)**
- **Purpose:** Measure total effort/progress
- **Earning Rates:**
  - First-time lesson pass: 50 XP
  - Lesson replay: 25 XP (50% reduction)
  - Daily login: 5 XP
  - Streak milestone (7 days): 100 XP bonus
- **Level Up:** Every 500 XP = new player level
- **Visual:** Progress bar shows XP toward next level

**3.2.2 Coins**
- **Purpose:** Currency for cosmetic rewards (future: avatar customization)
- **Earning Rates:**
  - Lesson completion: 10 coins
  - Perfect score (5/5): 5 bonus coins
  - Daily challenge: 20 coins
- **MVP Scope:** Display counter, no spending mechanics yet

**3.2.3 Hearts System (Lives)**
**Decision: NOT in MVP**
Reason: Duolingo's heart system creates frustration. For learning, we want unlimited attempts. Save for post-MVP if retention data supports it.

### 3.3 Progress Tracking

**3.3.1 Visual Progress Indicators**

**World Map View:**
```
Castle of Basics
├── Lesson 1: Two-Step Equations ✅ (5/5)
├── Lesson 2: Distributive Property ✅ (4/5)
├── Lesson 3: Combining Like Terms 🔓 (0/5) ← YOU ARE HERE
├── Lesson 4: Variables Both Sides 🔒
└── Lesson 5: Complex Equations 🔒
```

**Dashboard Metrics:**
- Current streak: "7 days 🔥"
- Total XP: 350/500 to Level 4
- Lessons completed: 12/23
- Accuracy rate: 85%
- World progress: 3/5 worlds unlocked

**3.3.2 Data Model**
```javascript
studentProgress = {
  studentId: "uuid",
  currentStreak: 7,
  longestStreak: 14,
  totalXP: 350,
  playerLevel: 3,
  coinsEarned: 120,
  lessonsCompleted: [
    {lessonId: "L001", completedDate: "2025-01-10", accuracy: 1.0, timeSpent: 480},
    {lessonId: "L002", completedDate: "2025-01-11", accuracy: 0.8, timeSpent: 720}
  ],
  currentLesson: "L003",
  lastActiveDate: "2025-01-13"
}
```

### 3.4 Daily Streaks

**Core Mechanic:**
A "day" counts if student completes at least 1 lesson.

**3.4.1 Streak Counter**
- Prominent display: "🔥 7 Day Streak!"
- Counter increments at midnight if active previous day
- Resets to 0 if miss a day (no "freeze" feature in MVP)

**3.4.2 Streak Milestones**
| Milestone | Reward | Badge |
|-----------|--------|-------|
| 3 days    | 50 XP  | 🔥 On Fire |
| 7 days    | 100 XP | 💪 Week Warrior |
| 14 days   | 200 XP | 🏆 Two Weeks |
| 30 days   | 500 XP | 👑 Month Master |

**3.4.3 Streak Recovery (Post-MVP)**
- "Streak Freeze" purchasable with coins
- One free freeze per week for premium users
- Push notifications: "Don't lose your 14-day streak!"

### 3.5 Achievement System

**MVP Achievements:**

**Learning Achievements:**
- First Steps (Complete first lesson) - 10 XP
- Quick Learner (Complete lesson on first try) - 25 XP
- Perfectionist (Get 5/5 on a lesson) - 50 XP
- World Conqueror (Complete all lessons in a world) - 200 XP

**Consistency Achievements:**
- Daily Habit (3-day streak) - 50 XP
- Weekly Warrior (7-day streak) - 100 XP
- Unstoppable (14-day streak) - 200 XP

**Mastery Achievements:**
- Speed Demon (Complete lesson in under 5 minutes) - 30 XP
- No Hints Needed (Complete without watching video) - 40 XP
- Practice Makes Perfect (Replay lesson 3 times) - 20 XP

**Display:**
- Achievement popup on unlock (modal overlay)
- Achievement gallery page showing locked/unlocked
- Share achievement to social media (post-MVP)

---

## 4. Advanced Features (Post-MVP)

### 4.1 Social Features

**Phase 2 (Month 3-4):**

**4.1.1 Friend System**
- Add friends via username or class code
- See friends' streaks and levels (not specific scores)
- Send/receive encouragement messages
- Compare progress on world map

**4.1.2 Collaborative Challenges**
- Weekly class challenges: "Complete 100 combined lessons"
- Partner problems: Two students solve same problem, compare approaches
- Study groups: Small groups (3-5) work through world together

**Privacy Safeguards:**
- No last names displayed
- Opt-in for social features (default: private)
- Teacher/parent controls to disable social
- Report/block functionality

### 4.2 Adaptive Learning

**Phase 3 (Month 5-6):**

**Current State:**
Basic adaptive difficulty exists (`adaptive-learning.js`)

**Enhanced Adaptive System:**

**4.2.1 Difficulty Adjustment**
- Track performance across 5 recent problems
- If 5/5 correct → increase difficulty (add complexity)
- If 2/5 or less → decrease difficulty (simplify)
- If 3-4/5 → maintain difficulty (in zone)

**4.2.2 Personalized Practice**
- Identify weak concepts from mistake patterns
- Generate targeted practice sets
- Recommend "Review Lessons" before advancing

**4.2.3 Intelligent Spacing**
- Spaced repetition algorithm for review
- Resurface old concepts at optimal intervals
- "Memory Refresh" mini-lessons (3 problems)

### 4.3 Content Creation Tools

**Phase 3:**

**4.3.1 Teacher Lesson Builder**
- Select from problem templates
- Add custom word problems
- Upload video links (YouTube/Vimeo)
- Sequence lessons into custom curriculum

**4.3.2 Problem Bank**
- Library of 1000+ pre-made problems
- Filter by: standard, difficulty, topic
- Clone and modify existing problems
- AI-assisted problem generation (via Gemini API)

**4.3.3 Assessment Builder**
- Create quizzes/tests from problem bank
- Auto-grading with step-by-step feedback
- Standards-aligned scoring reports

---

## 5. Technical Requirements

### 5.1 Architecture Decisions

**Current Stack:**
- Frontend: Vanilla JavaScript, HTML, CSS
- Hosting: Netlify (static site + serverless functions)
- APIs: Gemini AI (via serverless function)
- Storage: LocalStorage for client-side state

**MVP Architecture:**

**5.1.1 Frontend**
- **Framework:** Vanilla JS (keep it simple, no React for MVP)
- **Reason:** Current codebase is vanilla, team expertise, fast performance
- **State Management:** ES6 classes with localStorage persistence
- **Bundle Size:** < 200KB total (fast load on mobile)

**5.1.2 Backend**
- **Platform:** Netlify Functions (serverless)
- **Database:**
  - MVP: LocalStorage (client-side only)
  - Post-MVP: Supabase (PostgreSQL + realtime)
- **Authentication:**
  - MVP: Username only (localStorage)
  - Post-MVP: Supabase Auth (email/password, Google SSO)

**5.1.3 API Layer**
```
/netlify/functions/
  ├── gemini-api.js (existing - AI tutoring)
  ├── save-progress.js (new - persist to DB)
  └── generate-problem.js (post-MVP - AI problem generation)
```

**5.1.4 Hosting & CDN**
- Netlify Edge (global CDN)
- Lazy-load video thumbnails
- Preload next lesson assets
- Service worker for offline capability (post-MVP)

### 5.2 Data Models

**5.2.1 Student Profile**
```typescript
interface StudentProfile {
  id: string;
  username: string;
  displayName: string;
  createdAt: Date;
  lastActiveAt: Date;

  // Gamification
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  playerLevel: number;
  coins: number;

  // Progress
  currentLessonId: string;
  completedLessons: string[];
  unlockedWorlds: number[];

  // Settings
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  privacyMode: boolean;
}
```

**5.2.2 Lesson Progress**
```typescript
interface LessonProgress {
  studentId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';

  // Performance
  attempts: number;
  bestAccuracy: number;
  averageTimeSeconds: number;

  // Timestamps
  startedAt: Date;
  completedAt?: Date;

  // Details
  questionResults: Array<{
    questionId: string;
    correct: boolean;
    timeSpent: number;
    hintsUsed: number;
  }>;
}
```

**5.2.3 Lesson Definition**
```typescript
interface Lesson {
  id: string;
  title: string;
  worldId: number;
  sequence: number; // order within world

  // Content
  description: string;
  videoUrl: string;
  examples: Example[];
  questions: Question[];

  // Metadata
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  standards: string[]; // e.g., ["MA.8.AR.2.1"]

  // Rewards
  xpReward: number;
  coinReward: number;

  // Prerequisites
  requiredLessons: string[];
  unlockThreshold: number; // 0.8 = 80% accuracy required
}
```

**5.2.4 Question Bank**
```typescript
interface Question {
  id: string;
  type: 'multiple_choice' | 'step_by_step' | 'word_problem';
  difficulty: 'easy' | 'medium' | 'hard';

  // Content
  prompt: string;
  equation?: string;
  context?: string; // word problem context

  // Answer
  correctAnswer: string | number;
  steps?: SolutionStep[]; // for step-by-step validation

  // Feedback
  correctFeedback: string;
  incorrectFeedback: string;
  hint?: string;
}
```

### 5.3 API Design

**RESTful Endpoints (Post-MVP when using Supabase):**

```
Authentication:
POST   /api/auth/signup           - Create new student account
POST   /api/auth/login            - Login with username/password
POST   /api/auth/logout           - End session

Student Progress:
GET    /api/students/:id/profile  - Get student profile
PUT    /api/students/:id/profile  - Update profile (name, settings)
GET    /api/students/:id/progress - Get all lesson progress
POST   /api/students/:id/progress - Save lesson completion

Lessons:
GET    /api/lessons               - Get all lessons (with unlock status)
GET    /api/lessons/:id           - Get lesson details
GET    /api/lessons/:id/questions - Get practice questions

Analytics (Teacher Dashboard):
GET    /api/analytics/class/:id       - Class performance summary
GET    /api/analytics/student/:id     - Individual student details
```

**GraphQL Alternative (Future Consideration):**
- Better for complex queries (student + progress + achievements in one call)
- Reduce over-fetching on mobile
- Consider for Phase 3+

### 5.4 Third-Party Integrations

**MVP Integrations:**

**5.4.1 YouTube API**
- Embed video player
- Track watch completion (via player events)
- Fallback to manual checkbox if API unavailable

**5.4.2 Gemini AI API**
- Generate word problems (existing integration)
- Provide step-by-step hints
- Adaptive difficulty suggestions

**Post-MVP Integrations:**

**5.4.3 Google Classroom**
- Import class rosters
- Push assignments
- Sync grades

**5.4.4 Analytics**
- Mixpanel: User behavior tracking
- LogRocket: Session replay for debugging
- Sentry: Error monitoring

**5.4.5 Notifications**
- SendGrid: Email notifications (streak reminders)
- OneSignal: Push notifications (mobile)

---

## 6. Content Pipeline

### 6.1 Lesson Creation Workflow

**Current State:**
Lessons are hardcoded in JavaScript. No CMS.

**MVP Workflow:**

**Step 1: Content Planning**
1. Curriculum designer creates lesson outline (Google Doc)
2. Map to standards (Florida B.E.S.T.)
3. Define learning objectives
4. Estimate difficulty level

**Step 2: Content Creation**
5. Find/create YouTube tutorial (3-5 min)
6. Write 3 worked examples (step-by-step)
7. Generate 20 practice questions (varying difficulty)
8. Write feedback messages (correct/incorrect)

**Step 3: Technical Implementation**
9. Add lesson to `lessons.json` config file
10. Add questions to `questions.json`
11. Deploy to staging
12. QA testing (accuracy, timing, flow)
13. Deploy to production

**Lesson Config Example:**
```json
{
  "id": "L001",
  "title": "Two-Step Equations",
  "worldId": 1,
  "sequence": 1,
  "description": "Solve equations like 3x + 5 = 20",
  "videoUrl": "https://youtube.com/embed/xyz",
  "estimatedMinutes": 8,
  "difficulty": "easy",
  "standards": ["MA.8.AR.2.1"],
  "xpReward": 50,
  "coinReward": 10,
  "examples": [
    {
      "equation": "3x + 5 = 20",
      "steps": [
        {"action": "Subtract 5 from both sides", "result": "3x = 15"},
        {"action": "Divide both sides by 3", "result": "x = 5"}
      ]
    }
  ],
  "questionIds": ["Q001", "Q002", "Q003", "Q004", "Q005"]
}
```

### 6.2 YouTube Video Integration

**Content Guidelines:**

**6.2.1 Video Selection Criteria**
- Length: 3-5 minutes (ideal), max 8 minutes
- Production quality: Clear audio, visible board/screen
- Pedagogical approach: Step-by-step, not just answer
- No ads in first 30 seconds (user experience)
- Closed captions available (accessibility)

**6.2.2 Video Sources**
Current trusted channels:
- Math with Mr. J
- Khan Academy
- Organic Chemistry Tutor
- tecmath

**6.2.3 Embed Implementation**
```html
<iframe
  src="https://www.youtube.com/embed/{VIDEO_ID}?rel=0&modestbranding=1"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
  allowfullscreen>
</iframe>
```

**Tracking:**
- Use YouTube Player API to detect:
  - Video started
  - 50% watched
  - 100% watched
- Store watch status: `videoWatched: true` in progress

### 6.3 Practice Problem Generation

**6.3.1 Manual Creation (MVP)**

Question templates:
```javascript
// Two-step equation template
function generateTwoStepEquation(difficulty) {
  const coefficients = {
    easy: {a: [2,3,4,5], b: [5,10,15], c: [15,20,25,30]},
    medium: {a: [6,7,8,9], b: [12,18,24], c: [40,50,60,70]},
    hard: {a: [10,12,15], b: [-5,-10,-15], c: [80,90,100]}
  };

  const {a, b, c} = difficulty;
  const equation = `${a}x + ${b} = ${c}`;
  const solution = (c - b) / a;

  return {equation, solution};
}
```

**6.3.2 AI-Assisted Generation (Post-MVP)**

Use Gemini API to:
1. Generate unique word problems
2. Create similar practice questions
3. Provide alternative explanations
4. Generate step-by-step solutions

**Prompt Template:**
```
Generate a 7th grade pre-algebra word problem that requires solving
a two-step equation of the form ax + b = c.

Requirements:
- Real-world context relatable to 12-year-olds
- Integer solution
- Difficulty: medium
- Include the equation and step-by-step solution

Format as JSON:
{
  "context": "...",
  "question": "...",
  "equation": "...",
  "solution": {...}
}
```

### 6.4 Assessment Design

**6.4.1 Question Types**

**Type 1: Step-by-Step Solver (Primary)**
- Student answers prompts for each step
- Example: "What operation should you do first?"
- Validates each step before next
- Provides immediate corrective feedback

**Type 2: Multiple Choice (Quick Check)**
- Understanding checks between sections
- Not counted toward mastery
- Used to gauge readiness

**Type 3: Word Problems (Advanced)**
- Real-world scenarios
- Student must set up equation first
- Then solve step-by-step
- Higher difficulty, more XP reward

**6.4.2 Difficulty Calibration**

Difficulty factors:
- Coefficient size (3x vs 12x)
- Negative numbers (yes/no)
- Fractions (yes/no)
- Variable on both sides (yes/no)
- Parentheses required (yes/no)

**Easy Example:** `3x + 5 = 20`
**Medium Example:** `7x - 12 = 30`
**Hard Example:** `4x + 8 = 2x - 6`

**6.4.3 Mastery Thresholds**

| Accuracy | Status | Action |
|----------|--------|--------|
| 100% (5/5) | Mastered | Unlock next + bonus XP |
| 80-99% (4/5) | Passed | Unlock next |
| 60-79% (3/5) | Struggling | Recommend review |
| < 60% (0-2/5) | Failed | Must retry |

---

## 7. Design Requirements

### 7.1 UI/UX Principles

**Core Principles:**

**7.1.1 Simplicity**
- One primary action per screen
- Clear visual hierarchy
- Minimal text (show, don't tell)
- Progressive disclosure (reveal complexity gradually)

**7.1.2 Immediate Feedback**
- Every action has visual/audio response
- Celebrate small wins (confetti on correct answer)
- Constructive feedback on mistakes (not punishing)

**7.1.3 Consistency**
- Same button styles throughout
- Predictable navigation patterns
- Consistent color coding (green = correct, red = incorrect)

**7.1.4 Mobile-First**
- Touch targets min 44x44px
- Thumb-friendly navigation
- Responsive breakpoints: 320px, 768px, 1024px

### 7.2 Visual Design System

**7.2.1 Color Palette**

**Primary Colors:**
- `--primary-blue: #4A90E2` (CTAs, links)
- `--success-green: #7ED321` (correct answers, completion)
- `--error-red: #D0021B` (incorrect, alerts)
- `--warning-yellow: #F5A623` (hints, caution)

**Neutral Colors:**
- `--dark-bg: #2C3E50` (backgrounds)
- `--light-text: #ECF0F1` (primary text)
- `--gray-medium: #95A5A6` (secondary text)
- `--gray-light: #BDC3C7` (borders, dividers)

**World Theme Colors:**
- Castle of Basics: `#8E44AD` (purple)
- Forest of Distribution: `#27AE60` (green)
- Mountain of Both Sides: `#E67E22` (orange)
- Ocean of Fractions: `#3498DB` (blue)
- Dragon's Lair: `#C0392B` (red)

**7.2.2 Typography**

```css
/* Headers */
--font-family-header: 'Poppins', sans-serif;
--font-size-h1: 32px;
--font-size-h2: 24px;
--font-size-h3: 20px;

/* Body */
--font-family-body: 'Inter', sans-serif;
--font-size-base: 16px;
--font-size-small: 14px;

/* Equations (monospace) */
--font-family-equation: 'Courier New', monospace;
--font-size-equation: 24px;
```

**7.2.3 Component Library**

**Buttons:**
```
Primary: Solid blue, white text (main actions)
Secondary: Outlined blue, blue text (alternative actions)
Ghost: No background, blue text (tertiary actions)
Disabled: Gray, 50% opacity

Sizes:
- Small: 32px height, 12px padding
- Medium: 44px height, 16px padding (default)
- Large: 56px height, 24px padding (CTAs)
```

**Cards:**
```
Standard: White bg, subtle shadow, 8px border-radius
Interactive: Hover effect (lift + shadow increase)
Locked: 50% opacity, lock icon overlay
```

**Progress Bars:**
```
Height: 8px
Background: gray-light
Fill: success-green (animated)
Border-radius: 4px
```

### 7.3 Interaction Patterns

**7.3.1 Lesson Navigation**

```
┌─────────────────────────────┐
│  ← Back to Menu             │
├─────────────────────────────┤
│  LESSON 3: Combining Like   │
│  Terms                       │
│                             │
│  Progress: [████░░] 4/5     │
│                             │
│  [Current Problem]          │
│                             │
│  [▶ Solve Step-by-Step]    │ ← Single primary action
│                             │
└─────────────────────────────┘
```

**7.3.2 Step-by-Step Solver Modal**

```
┌─────────────────────────────┐
│  Solve: 3x + 5 = 20    [X] │
├─────────────────────────────┤
│  Step 1 of 2                │
│                             │
│  What should you do first?  │
│                             │
│  ○ Divide by 3              │
│  ○ Subtract 5 (both sides) ✓│
│  ○ Add 5 (both sides)       │
│                             │
│  [Check Answer]             │
└─────────────────────────────┘
```

**7.3.3 Celebration Animations**

**Correct Answer:**
- Confetti animation (2 seconds)
- +XP counter animates up
- Success sound effect
- "Great job!" message

**Lesson Complete:**
- Full-screen modal
- Trophy icon
- XP and coin rewards animate in
- Progress bar fills
- "Next Lesson" CTA

**Streak Milestone:**
- Fire animation
- "🔥 7 Day Streak!" headline
- Bonus XP awarded
- Share to social (optional)

### 7.4 Accessibility

**WCAG 2.1 AA Compliance:**

**7.4.1 Keyboard Navigation**
- All interactive elements keyboard accessible
- Tab order follows visual flow
- Escape key closes modals
- Enter/Space activates buttons

**7.4.2 Screen Readers**
- Semantic HTML (nav, main, article)
- ARIA labels on dynamic content
- `aria-live` regions for feedback
- Alt text on all images/icons

**7.4.3 Visual Accessibility**
- Color contrast ratio ≥ 4.5:1 (text)
- Color contrast ratio ≥ 3:1 (UI elements)
- No color-only indicators (use icons too)
- Font size min 16px (scalable to 200%)

**7.4.4 Motor Accessibility**
- Touch targets ≥ 44x44px
- No time-based interactions
- Pause/stop animations available
- Large clickable areas

**7.4.5 Cognitive Accessibility**
- Simple, consistent language
- One task per screen
- Clear error messages
- Confirm before destructive actions

---

## 8. Success Metrics

### 8.1 Engagement KPIs

**Daily Active Users (DAU):**
- **Target:** 60% of registered users active weekly
- **Measurement:** Unique users who complete ≥1 action per day
- **Goal:** 1000 DAU by Month 3

**Time on Platform:**
- **Target:** 10-15 minutes per session (sweet spot)
- **Measurement:** Average session duration
- **Red Flag:** < 5 minutes (not engaging) or > 30 minutes (burnout risk)

**Lesson Completion Rate:**
- **Target:** 70% of started lessons completed
- **Measurement:** (Completed lessons / Started lessons) × 100
- **Breakdown by:** Lesson difficulty, world, student cohort

**Daily Streak Retention:**
- **Target:** 50% of active users maintain ≥7 day streak
- **Measurement:** % of users with currentStreak ≥ 7
- **Milestone:** 25% reach 30-day streak by Month 6

**Feature Adoption:**
- **Video Watch Rate:** 80% of students watch video before practice
- **Step-by-Step Usage:** 90% use step solver (vs. skip)
- **Replay Rate:** 30% replay lessons for XP

### 8.2 Learning Outcomes

**Mastery Rate:**
- **Target:** 85% of students pass lessons on first or second attempt
- **Measurement:** % of lessons passed within 2 attempts
- **Breakdown by:** Concept type, difficulty level

**Accuracy Trends:**
- **Target:** 10% improvement in accuracy over 4 weeks
- **Measurement:** Compare Week 1 avg accuracy to Week 4
- **Analysis:** Identify concepts with low accuracy for revision

**Time to Mastery:**
- **Target:** Average 3 attempts per concept before mastery
- **Measurement:** Avg attempts needed to reach 85% accuracy
- **Optimization:** Reduce via better tutorials/examples

**Standardized Assessment Performance:**
- **Target:** 25% improvement on Florida B.E.S.T. aligned questions
- **Measurement:** Pre/post test comparison
- **Control:** Compare to non-platform users (if possible)

**Concept Retention:**
- **Target:** 70% accuracy on concepts after 2 weeks
- **Measurement:** Spaced repetition quiz performance
- **Intervention:** Trigger review if retention drops below 60%

### 8.3 Retention Metrics

**D1 Retention (Next-Day):**
- **Target:** 50% of new users return next day
- **Measurement:** % of Day 0 users active on Day 1
- **Improvement:** Onboarding optimizations, push notifications

**D7 Retention (Week 1):**
- **Target:** 40% of new users active in first week
- **Measurement:** % of Day 0 users active on Day 7
- **Benchmark:** Duolingo D7 is ~25%, aim higher with education focus

**D30 Retention (Month 1):**
- **Target:** 30% of new users still active after 30 days
- **Measurement:** % of Day 0 users active on Day 30
- **Drivers:** Streaks, visible progress, habit formation

**Churn Analysis:**
- **Track:** When users drop off (which lesson, world, difficulty)
- **Identify:** Friction points (too hard, boring, technical issues)
- **Intervene:** Targeted re-engagement (email, easier content)

**Cohort Analysis:**
```
Week 0: 1000 new users
Week 1:  600 active (60% retention)
Week 2:  450 active (45% retention)
Week 3:  400 active (40% retention)
Week 4:  350 active (35% retention)
```

### 8.4 Dashboard Metrics (Teacher/Parent View)

**Class Performance:**
- Average XP per student
- % of class on pace (completing 3+ lessons/week)
- Struggling students (red flag: <2 lessons/week or <60% accuracy)

**Individual Student:**
- Current streak and XP
- Lessons completed vs. expected pace
- Accuracy by concept
- Time spent this week
- Areas needing support (low accuracy concepts)

**Alerts:**
- "Sarah hasn't logged in for 5 days"
- "Carlos struggling with distributive property (2/5 accuracy)"
- "Class behind pace: only 40% completed Week 3 lessons"

---

## Appendix A: Current Platform Analysis

**Existing Features to Leverage:**
1. ✅ Step-by-step equation solver (`step-solver.js`)
2. ✅ 3D balance visualization (`three-visualization.js`)
3. ✅ Adaptive difficulty system (`adaptive-learning.js`)
4. ✅ Video tutorial integration (YouTube embeds)
5. ✅ Gemini AI helper (word problem generation)
6. ✅ Student progress tracking (localStorage)
7. ✅ World-based progression (5 worlds defined)

**Gaps to Address for MVP:**
1. ❌ No persistent storage (only localStorage, no DB)
2. ❌ No streak tracking system
3. ❌ No achievement/badge system
4. ❌ No daily goals or reminders
5. ❌ No teacher dashboard
6. ❌ No parent reporting
7. ❌ Limited gamification (basic XP/coins exist but underutilized)

---

## Appendix B: Competitive Analysis

**Duolingo (Language Learning):**
- **Strengths:** Addictive streaks, bite-sized lessons, strong gamification
- **Apply:** Daily goals, achievement badges, XP progression
- **Avoid:** Overwhelming features (too many tabs), aggressive monetization, competitive pressure

**Khan Academy (Math):**
- **Strengths:** Comprehensive content, mastery-based progression
- **Apply:** Video + practice workflow, mastery thresholds
- **Avoid:** Sterile UI, lack of gamification, too much choice paralysis

**Prodigy Math (K-8 Math Game):**
- **Strengths:** RPG-style engagement, battles with math problems
- **Apply:** Character progression, world themes
- **Avoid:** Over-gamification (distracts from learning), pay-to-win mechanics

**IXL (Skill Practice):**
- **Strengths:** Extensive problem library, detailed analytics
- **Apply:** Granular skill tracking, teacher dashboards
- **Avoid:** Punishing SmartScore system, boring UI

---

## Appendix C: Development Roadmap

**Phase 1: MVP (Months 1-2)**
- ✅ Streak tracking and display
- ✅ Achievement system (6-8 achievements)
- ✅ Lesson progression enforcement (unlock system)
- ✅ Enhanced progress dashboard
- ✅ Daily goal prompts
- ✅ Improved onboarding flow
- ✅ Mobile-responsive design refinements

**Phase 2: Social & Retention (Months 3-4)**
- 🔲 Supabase integration (database + auth)
- 🔲 Teacher dashboard (basic analytics)
- 🔲 Parent email reports
- 🔲 Push notifications (streak reminders)
- 🔲 Friend system (optional, non-competitive)

**Phase 3: Content & Intelligence (Months 5-6)**
- 🔲 Expanded lesson library (30+ lessons)
- 🔲 AI problem generation (Gemini)
- 🔲 Spaced repetition system
- 🔲 Advanced adaptive learning
- 🔲 Teacher lesson builder
- 🔲 Google Classroom integration

**Phase 4: Scale & Monetization (Months 7-8)**
- 🔲 Premium features (unlimited hearts, ad-free)
- 🔲 School/district licensing
- 🔲 Offline mode (Progressive Web App)
- 🔲 Multi-grade expansion (6th, 8th)
- 🔲 Mobile apps (iOS, Android)

---

## Appendix D: Open Questions & Decisions Needed

**Monetization Strategy:**
- Freemium model? (Free basic, paid premium)
- School licensing? (Per-student or site license)
- Ads for free tier? (Non-intrusive)
- **Decision Needed by:** Month 3

**Content Ownership:**
- All YouTube videos are third-party - licensing risk?
- Create original video content? (Higher cost)
- Partnership with educational YouTubers?
- **Decision Needed by:** Month 2

**Privacy & Data:**
- COPPA compliance for under-13 users
- FERPA compliance for school data
- Parent consent requirements
- Data retention policies
- **Decision Needed by:** Month 1 (before any DB implementation)

**Accessibility Standards:**
- WCAG 2.1 AA or AAA?
- Section 508 compliance for schools?
- Budget for accessibility audit?
- **Decision Needed by:** Month 2

**Localization:**
- Spanish version? (Large FL demographic)
- Other languages?
- Cultural adaptations for word problems?
- **Decision Needed by:** Month 6

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-13 | Product Team | Initial draft based on platform analysis |
| 1.1 | 2025-11-13 | Product Team | Removed all competitive/leaderboard features per user requirements |

---

**Next Steps:**
1. Review and approve PRD with stakeholders
2. Create detailed wireframes for MVP features
3. Break down into sprint-sized user stories
4. Prioritize MVP feature backlog
5. Begin Phase 1 development

**Approval Sign-offs:**
- Product Manager: _________________ Date: _________
- Engineering Lead: ________________ Date: _________
- Design Lead: ____________________ Date: _________
- Education Specialist: ____________ Date: _________
