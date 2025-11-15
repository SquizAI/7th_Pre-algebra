# PROJECT OVERVIEW

## What We're Building

A **Duolingo-style gamified learning platform** for 8th Grade Pre-Algebra at Centner Academy, Miami FL.

### Core Concept
Transform traditional math education into an engaging, game-like experience where students progress through 87 lessons aligned with Florida BEST Standards (Course #1205070).

---

## The 5 W's

### WHAT
Interactive pre-algebra platform with:
- 87 microlessons (one per B-day in 2025-2026 school year)
- Duolingo-style progression (bite-sized lessons, instant feedback)
- Gamification (XP, coins, streaks, achievements, skill tree)
- Step-by-step equation solver with visual balance representation
- Adaptive difficulty based on student performance
- Individual progress tracking (NO competition between students)

### WHY
**Problem**: Traditional math education fails to engage middle schoolers
**Solution**: Game mechanics proven by Duolingo to drive daily engagement

**Goals**:
1. Increase daily practice completion rates
2. Build math confidence through small wins
3. Provide instant feedback and personalized difficulty
4. Make algebra feel like progress, not punishment

**CRITICAL CONSTRAINT**: NO competitive features. No leaderboards. No comparing students. Each student's journey is personal and private.

### WHO
**Primary Users**: 8th graders at Centner Academy
- Age: 13-14 years old
- Tech-savvy generation
- Prefer mobile-first experiences
- Respond to instant gratification

**Secondary Users**: Teacher (you)
- Monitor individual student progress
- Identify struggling concepts
- Adjust pacing based on class mastery

### WHEN
**Academic Year**: 2025-2026
**Schedule**: B-days only (87 total lessons)
- September 3, 2025 - June 11, 2026
- Every other day (A/B block schedule)
- 90-minute class periods

**Quarter Breakdown**:
- Q1: 23 lessons (Sept 3 - Nov 7)
- Q2: 21 lessons (Nov 10 - Jan 30)
- Q3: 22 lessons (Feb 2 - Apr 10)
- Q4: 21 lessons (Apr 13 - Jun 11)

### HOW
**Current State**: Working prototype with:
- 21 lessons on equations (MA.8.AR.2.1)
- Vanilla JS frontend + Three.js visualizations
- Basic localStorage for progress
- Netlify deployment

**Target State**: Full platform with:
- 87 lessons covering all MA.8.XXX standards
- Supabase backend (PostgreSQL + Auth)
- Serverless functions for AI features
- Persistent user accounts with progress tracking
- XP/coins/streaks/achievements system
- Skill tree visualization

---

## Technical Refactor Plan

### Phase 1: Backend Migration (DO THIS FIRST)
Replace localStorage with Supabase:
1. Set up Supabase project
2. Create database schema (users, lessons, progress, achievements)
3. Implement Row Level Security
4. Build authentication system
5. Migrate existing data

### Phase 2: Gamification System
Implement Duolingo-style mechanics:
1. XP and coins for lesson completion
2. Daily streak tracking
3. Achievement badges
4. Skill tree progression
5. Personal bests (NOT competitive)

### Phase 3: Lesson Expansion
Build remaining 66 lessons:
1. Unit 2: Inequalities (6 lessons)
2. Unit 3: Exponents & Radicals (9 lessons)
3. Unit 4: Linear Relationships (11 lessons)
4. Unit 5: Systems of Equations (10 lessons)
5. Unit 6: Functions (8 lessons)
6. Unit 7: Pythagorean Theorem (6 lessons)
7. Unit 8: Scatter Plots & Data (8 lessons)
8. Unit 9: Review & Assessment (8 lessons)

### Phase 4: Polish & Testing
1. Mobile responsiveness
2. Accessibility compliance
3. Performance optimization
4. Browser testing
5. Student user testing

---

## Success Metrics

### Student Engagement
- Daily lesson completion rate > 80%
- Average time on platform > 15 min/day
- Streak maintenance > 5 days average

### Academic Performance
- Lesson mastery rate (4/5 correct) > 75%
- Concept retention measured by spaced repetition
- Improvement on quarterly assessments

### Platform Health
- Page load time < 2 seconds
- Error rate < 1%
- Mobile usage > 50% of sessions

---

## Non-Goals (What We're NOT Building)

1. NO competitive leaderboards
2. NO public student rankings
3. NO comparing students to each other
4. NO social features or comments
5. NO grade calculation (teacher handles that)
6. NO parent portal (focus on student experience)

---

## File Structure

```
/7th-PreAlgebra/
├── index.html              # Main entry point
├── netlify.toml            # Netlify config
├── package.json            # Dependencies
│
├── /css/                   # Styles
│   ├── main.css           # Atomic CSS system
│   └── styles.css         # Legacy styles
│
├── /js/
│   ├── /core/
│   │   ├── game.js        # Main game controller
│   │   └── equations.js   # Equation generator
│   │
│   ├── /features/
│   │   ├── adaptive-learning.js
│   │   ├── animated-examples.js
│   │   ├── learning-workflow.js
│   │   ├── three-visualization.js
│   │   ├── student-report.js
│   │   ├── standards-navigation.js
│   │   ├── lesson-scheduler.js
│   │   └── date-navigation.js
│   │
│   ├── /utils/
│   │   ├── step-solver.js
│   │   ├── ai-client.js
│   │   └── gemini-helper.js
│   │
│   └── /config/
│       └── schedule.js     # Lesson calendar
│
├── /functions/             # Netlify serverless functions
│   └── gemini-api.js      # AI API proxy
│
└── /docs/
    ├── implementation/     # THIS DOCUMENTATION
    ├── *.json             # Standards & lesson data
    └── *.csv              # School calendar
```

---

## Technology Stack

### Frontend
- **HTML5**: Semantic markup, accessibility
- **CSS3**: Atomic CSS system + legacy styles
- **Vanilla JavaScript**: No framework bloat
- **Three.js**: 3D balance visualizations

### Backend
- **Supabase**: PostgreSQL database + Auth
- **Netlify Functions**: Serverless API
- **Netlify**: Hosting + continuous deployment

### Third-Party Services
- **Gemini API**: AI-powered word problems (via proxy)
- **YouTube**: Embedded tutorial videos

### Development
- **Git**: Version control
- **Playwright**: E2E testing
- **npm**: Package management

---

## Security & Privacy

### Student Data
- First names only (no last names)
- No PII stored except what's needed for platform
- Row Level Security in Supabase ensures students only see their own data

### API Keys
- Gemini API key stored in Netlify environment variables
- Never exposed to client-side code
- Proxied through serverless function

### Authentication
- Supabase Auth (email/password or magic links)
- Session management
- Secure password hashing

---

## Getting Started

For agents building features, read in this order:
1. **PROJECT-OVERVIEW.md** (this file) - Understand the vision
2. **ARCHITECTURE.md** - Understand the technical structure
3. **SUPABASE-SETUP.md** - Set up the database
4. **FEATURES.md** - Know what to build
5. **BUILD-GUIDE.md** - Learn how to build it
6. **TESTING-GUIDE.md** - Learn how to test it
7. **LESSON-IMPLEMENTATION.md** - Build the 87 lessons

---

## Course Information

**Florida Course Code**: 1205070
**Course Name**: M/J Grade 8 Pre-Algebra
**Grade Level**: 8th
**Standards Framework**: Florida BEST Standards (adopted Feb 2020)
**Total Standards**: 42 MA.8.XXX standards

**Standard Categories**:
- NSO: Number Sense and Operations (7 standards)
- AR: Algebraic Reasoning (12 standards)
- GR: Geometric Reasoning (8 standards)
- DP: Data Analysis and Probability (8 standards)
- FR: Functions (7 standards)

---

## Next Steps for Agents

1. Read **ARCHITECTURE.md** to understand the codebase structure
2. Read **SUPABASE-SETUP.md** to understand the database schema
3. Read **FEATURES.md** to understand what needs to be built
4. Choose a feature to implement
5. Follow **BUILD-GUIDE.md** for development workflow
6. Use **TESTING-GUIDE.md** to test your implementation
7. Refer to **LESSON-IMPLEMENTATION.md** when building lessons

---

## Questions?

If you're an agent building a feature and something is unclear:
1. Check if it's answered in another implementation doc
2. Look at existing code in the codebase for patterns
3. Ask the user (teacher) for clarification
4. Document your decision in code comments
