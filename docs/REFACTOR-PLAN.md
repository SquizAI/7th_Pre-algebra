# Complete Platform Refactor Plan

**Date**: November 15, 2025
**Status**: 🔴 PLANNING PHASE
**Approach**: Ground-up rebuild using lessons learned

---

## 🎯 Executive Summary

This document outlines a **complete architectural rebuild** of the 8th Grade Pre-Algebra platform. We are moving from band-aid fixes to a **properly architected modern web application**.

**Current State**: 16,145 lines of vanilla JavaScript, 12 HTML pages, fragmented architecture
**Target State**: Modern component-based SPA with proper build system, testing, and deployment
**Timeline**: 8-12 weeks phased migration
**Risk Level**: Medium (dual-run strategy minimizes production risk)

---

## 🔍 Root Cause Analysis - Why Rebuild?

### Critical Architectural Flaws

#### 1. **No Module System** 🚨
**Problem**: 36 JavaScript files loaded via `<script>` tags in HTML
**Impact**:
- No dependency management
- Global namespace pollution (`window.xpSystem`, `window.coinSystem`)
- Race conditions on page load
- Impossible to tree-shake or optimize
- Hard to test in isolation

**Evidence**:
```html
<!-- index.html - 20+ script tags -->
<script src="js/core/equations.js"></script>
<script src="js/core/game.js"></script>
<script src="js/features/xp-system.js"></script>
<script src="js/features/coin-system.js"></script>
<script src="js/ui/xp-display.js"></script>
<!-- ... 31 more files -->
```

#### 2. **Manual CSS Import Hell** 🚨
**Problem**: Legacy `styles.css` (84KB, 4,887 lines) conflicts with atomic design
**Impact**:
- Import order determines specificity (fragile)
- CSS conflicts require constant firefighting
- No scoped styles or CSS modules
- No way to dead-code eliminate unused CSS

**Evidence**:
```css
/* css/main.css - Import order CRITICAL */
@import './styles.css';  /* Must be FIRST or everything breaks */
@import './foundation/tokens.css';
@import './foundation/reset.css';
/* ... 15 more imports */
```

#### 3. **Tight Coupling to Old Game.js** 🚨
**Problem**: 1,300+ line monolithic `game.js` controls everything
**Impact**:
- Can't remove old practice mode without breaking homepage
- XP/coins logic mixed with game state
- Resume dialog bug shows this coupling problem
- Impossible to refactor incrementally

**Evidence**:
```javascript
// js/core/game.js - Lines 1-1300
class GameController {
    // Handles: equation generation, game state, XP, coins,
    // level progression, save/load, UI updates, auto-save...
    // ALL IN ONE CLASS
}
```

#### 4. **No Build Process** 🚨
**Problem**: Manual file management, no bundling, no optimization
**Impact**:
- No TypeScript (type safety would catch `window.XPSystem` bugs)
- No minification or compression
- No code splitting (users download all 16KB+ JS on every page)
- No environment variable injection (Supabase URL hardcoded)

**Current "Build"**:
```javascript
// build.js - Just injects env vars, doesn't bundle anything
const fs = require('fs');
const envContent = `window.ENV = { SUPABASE_URL: "..." };`;
fs.writeFileSync('env-inject.js', envContent);
```

#### 5. **Inconsistent State Management** 🚨
**Problem**: State scattered across localStorage, global variables, and Supabase
**Impact**:
- No single source of truth
- Sync issues between local and remote state
- Hard to debug state changes
- Race conditions on auth state

**Evidence**:
```javascript
// State lives in 5 different places:
localStorage.getItem('playerData');     // Old game progress
window.xpSystem.getUserStats();         // XP state (global)
await supabase.from('profiles').select(); // User state (remote)
game.currentLevel;                      // Game state (instance)
document.getElementById('playerXP');    // DOM state (!!!)
```

#### 6. **No Testing Infrastructure** 🚨
**Problem**: Zero unit tests, manual E2E testing only
**Impact**:
- Every change risks breaking something
- Can't refactor with confidence
- Bugs found in production, not development
- No regression testing

**Current Test Coverage**: 0%

#### 7. **Mixed Concerns Everywhere** 🚨
**Problem**: UI, business logic, and data access all mixed together
**Impact**:
- Can't reuse logic across components
- Can't test business logic without DOM
- Changes cascade unpredictably

**Example**:
```javascript
// js/ui/xp-display.js - UI component fetching data directly
async updateDisplay() {
    const { data } = await supabase.from('profiles').select(); // ❌ Data access in UI
    this.xpElement.textContent = data.total_xp; // ❌ Direct DOM manipulation
    this.calculateLevel(data.total_xp); // ❌ Business logic in UI
}
```

---

## 🏗️ New Architecture - Modern Stack

### Technology Decisions

#### Frontend Framework: **React 18 + TypeScript**
**Why React**:
- ✅ Component-based (matches our atomic design)
- ✅ Huge ecosystem (Chart.js, Framer Motion for animations)
- ✅ Server components support (future Next.js migration path)
- ✅ Team familiarity (most developers know React)

**Why NOT Vue/Svelte**:
- Vue: Good, but React ecosystem better for charts/animations
- Svelte: Excellent performance, but smaller ecosystem

**TypeScript Benefits**:
- Catch `window.XPSystem` vs `window.xpSystem` bugs at compile time
- Autocomplete for Supabase schema
- Self-documenting code
- Easier refactoring

#### State Management: **Zustand + React Query**
**Why Zustand**:
- Lightweight (1KB vs Redux 10KB)
- Simple API (no boilerplate)
- Built-in devtools
- Works great with TypeScript

**Why React Query**:
- Server state management (Supabase data)
- Automatic caching and invalidation
- Optimistic updates for XP/coins
- Background refetching

**Example**:
```typescript
// stores/userStore.ts
import create from 'zustand';

interface UserState {
  user: User | null;
  xp: number;
  coins: number;
  level: number;
  awardXP: (amount: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  xp: 0,
  coins: 0,
  level: 1,
  awardXP: (amount) => set((state) => ({
    xp: state.xp + amount,
    level: calculateLevel(state.xp + amount)
  })),
}));
```

#### Build Tool: **Vite**
**Why Vite**:
- ⚡ Lightning fast dev server (instant HMR)
- 🔧 Built-in TypeScript support
- 📦 Optimized production builds (code splitting, tree shaking)
- 🎨 CSS modules out of the box
- 🔌 Plugin ecosystem (React, Supabase, etc.)

**vs Webpack**: Too complex, slow builds
**vs Parcel**: Not as mature, fewer plugins

#### CSS Strategy: **Tailwind CSS + CSS Modules**
**Why Tailwind**:
- Utility-first (matches atomic design philosophy)
- No more import order hell
- Purges unused CSS automatically
- Dark mode built-in
- Responsive design utilities

**CSS Modules for**:
- Component-specific styles
- Complex animations
- Legacy styles.css migration

**Migration Path**:
```typescript
// Old way (fragile)
import './xp-display.css'; // Hope it doesn't conflict!

// New way (scoped)
import styles from './XPDisplay.module.css';
<div className={styles.xpContainer}>
  {/* Scoped to this component only */}
</div>

// Or Tailwind (utility-first)
<div className="flex items-center gap-2 px-4 py-2 bg-purple-500 rounded-lg">
  <span className="text-2xl font-bold">{xp} XP</span>
</div>
```

#### Testing: **Vitest + Testing Library + Playwright**
**Vitest** (Unit/Integration):
- 10x faster than Jest
- Built for Vite
- Same API as Jest (easy migration)

**Testing Library** (Component):
- User-centric testing
- Tests accessibility by default

**Playwright** (E2E):
- Already using it
- Multi-browser support
- Video recording for debugging

**Test Pyramid**:
```
       /\
      /E2E\       <- 10% (Playwright - critical user flows)
     /------\
    /Component\   <- 30% (Testing Library - UI components)
   /----------\
  /    Unit    \  <- 60% (Vitest - business logic)
 /--------------\
```

#### Backend: **Supabase + Netlify Edge Functions**
**Keep Supabase** (already working):
- PostgreSQL database
- Row Level Security
- Real-time subscriptions (future feature)
- Auth

**Netlify Edge Functions** (replace current functions):
- Run on Deno (faster cold starts)
- TypeScript native
- Closer to users (CDN edge)

---

## 📦 New Folder Structure

```
/
├── src/                          # Source code (TypeScript/TSX)
│   ├── components/               # React components (atomic design)
│   │   ├── atoms/               # Button, Input, Badge, etc.
│   │   ├── molecules/           # XPDisplay, CoinDisplay, StreakFlame
│   │   ├── organisms/           # Header, LessonCard, AchievementGallery
│   │   └── pages/               # Page-level components
│   ├── features/                # Feature modules (business logic)
│   │   ├── auth/
│   │   │   ├── hooks/           # useAuth, useProfile
│   │   │   ├── services/        # authService.ts
│   │   │   └── types/           # User, Profile types
│   │   ├── lessons/
│   │   │   ├── hooks/           # useLessons, useLessonProgress
│   │   │   ├── components/      # LessonPlayer, ExerciseTypes
│   │   │   └── services/        # lessonService.ts
│   │   ├── gamification/
│   │   │   ├── xp/              # XP system
│   │   │   ├── coins/           # Coin system
│   │   │   ├── streaks/         # Streak tracker
│   │   │   └── achievements/    # Achievement system
│   │   └── analytics/           # Progress tracking
│   ├── stores/                  # Zustand state stores
│   │   ├── userStore.ts
│   │   ├── lessonStore.ts
│   │   └── gameStore.ts
│   ├── lib/                     # Shared utilities
│   │   ├── supabase.ts          # Supabase client
│   │   ├── constants.ts         # App constants
│   │   └── utils.ts             # Helper functions
│   ├── types/                   # TypeScript types
│   │   ├── database.ts          # Supabase schema types (generated)
│   │   ├── lesson.ts
│   │   └── achievement.ts
│   ├── styles/                  # Global styles
│   │   ├── globals.css          # Tailwind imports
│   │   ├── tokens.css           # Design tokens (CSS vars)
│   │   └── legacy.module.css    # Migrated styles.css
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── router.tsx               # React Router config
├── functions/                    # Netlify Edge Functions (TypeScript)
│   ├── award-xp.ts
│   ├── award-coins.ts
│   ├── award-achievement.ts
│   └── shared/                  # Shared function utilities
├── public/                      # Static assets
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/
│   └── data/                    # JSON data files
│       ├── lessons/
│       └── achievements.json
├── tests/                       # Test files
│   ├── unit/
│   ├── component/
│   └── e2e/
├── docs/                        # Documentation (keep current structure)
├── .github/workflows/           # CI/CD pipelines
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

**Key Improvements**:
- ✅ Clear separation: components vs features vs business logic
- ✅ Co-location: Each feature has its own hooks, services, types
- ✅ Testability: Easy to import and test any module
- ✅ Scalability: Add new features without touching existing code

---

## 🔄 Migration Strategy - Dual-Run Approach

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up new architecture without breaking current site

**Tasks**:
1. ✅ Create new `src/` folder structure
2. ✅ Initialize Vite + React + TypeScript
3. ✅ Configure Tailwind CSS
4. ✅ Set up Vitest + Testing Library
5. ✅ Generate TypeScript types from Supabase schema
6. ✅ Create base component library (atoms)
7. ✅ Set up Zustand stores
8. ✅ Configure React Router

**Deliverable**: Empty React app at `/app/` route (current site at `/`)

**Testing**: Run both old and new apps side-by-side

---

### Phase 2: Core Systems Migration (Week 3-4)
**Goal**: Migrate authentication and gamification systems

#### 2.1 Authentication System
**Current**: `js/auth/supabase-client.js`, `js/auth/auth-manager.js`
**New**: `src/features/auth/`

```typescript
// src/features/auth/hooks/useAuth.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useAuth() {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: authService.getSession,
  });

  const signIn = useMutation({
    mutationFn: authService.signIn,
    onSuccess: () => queryClient.invalidateQueries(['session']),
  });

  return { session, signIn, signOut, isAuthenticated };
}
```

**Migration Steps**:
1. Create TypeScript types for User, Session, Profile
2. Write unit tests for auth logic
3. Migrate to React hooks
4. Test with existing Supabase database
5. Update login/signup pages to React components

**Acceptance Criteria**:
- ✅ All auth tests passing (unit + integration)
- ✅ Can sign up, sign in, sign out
- ✅ Session persists across page reloads
- ✅ RLS policies still work

#### 2.2 XP System Migration
**Current**: `js/features/xp-system.js` (333 lines, class-based)
**New**: `src/features/gamification/xp/`

```typescript
// src/features/gamification/xp/hooks/useXP.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUserStore } from '@/stores/userStore';

export function useXP() {
  const userId = useUserStore(state => state.user?.id);

  // Optimistic update - instant UI feedback
  const awardXP = useMutation({
    mutationFn: async (amount: number) => {
      // Update UI immediately
      useUserStore.setState(state => ({
        xp: state.xp + amount,
        level: calculateLevel(state.xp + amount),
      }));

      // Sync to backend
      return xpService.awardXP(userId, amount);
    },
    onError: (err, variables, context) => {
      // Rollback on error
      useUserStore.setState(context.previousState);
    },
  });

  return { xp, level, awardXP, xpToNextLevel };
}
```

**Benefits**:
- Optimistic updates (instant XP gain animation)
- Automatic rollback on errors
- Type-safe (can't pass string to awardXP)
- Easy to test

**Migration Steps**:
1. Extract business logic to pure functions (testable)
2. Write unit tests for XP calculations
3. Create React hooks for XP operations
4. Build XPDisplay component with animations
5. Test optimistic updates
6. Migrate award-xp Netlify function to Edge Function

**Acceptance Criteria**:
- ✅ XP calculations match old system exactly
- ✅ Optimistic updates work (instant feedback)
- ✅ Rollback on errors
- ✅ All tests passing
- ✅ XP history logged correctly

#### 2.3 Coins, Streaks, Achievements
**Same pattern as XP system**:
- Extract to feature modules
- Write tests first
- Create React hooks
- Build UI components
- Migrate backend functions

---

### Phase 3: Lesson System Migration (Week 5-7)
**Goal**: Migrate lesson player and skill tree

#### 3.1 Lesson Player
**Current**: `js/ui/lesson-player.js`, `js/ui/exercise-types.js` (1,200+ lines)
**New**: `src/features/lessons/components/`

**Component Hierarchy**:
```tsx
<LessonPlayer lessonId={42}>
  <LessonHeader />
  <ProgressBar current={3} total={7} />
  <ExerciseRenderer exercise={currentExercise}>
    {/* Polymorphic - renders correct type */}
    <MultipleChoiceExercise />
    <FillInBlankExercise />
    <DragAndDropExercise />
  </ExerciseRenderer>
  <LessonControls onNext={handleNext} onHint={handleHint} />
  <CompletionModal onClose={handleClose} />
</LessonPlayer>
```

**State Management**:
```typescript
// src/features/lessons/hooks/useLessonPlayer.ts
export function useLessonPlayer(lessonId: number) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonService.getLesson(lessonId),
  });

  const submitAnswer = useMutation({
    mutationFn: async (answer: Answer) => {
      // Immediate feedback
      setAnswers([...answers, answer]);

      // Check answer
      const result = await lessonService.checkAnswer(lessonId, answer);

      if (result.correct) {
        // Award XP immediately (optimistic)
        awardXP(result.xpEarned);

        // Next exercise or complete
        if (currentExerciseIndex < lesson.exercises.length - 1) {
          setCurrentExerciseIndex(i => i + 1);
        } else {
          handleLessonComplete();
        }
      }

      return result;
    },
  });

  return { lesson, currentExercise, submitAnswer, progress };
}
```

**Migration Steps**:
1. Create Lesson type definitions (TypeScript)
2. Build exercise components (MultipleChoice, FillInBlank, etc.)
3. Implement lesson state machine (not started → in progress → completed)
4. Add animations (Framer Motion for celebrations)
5. Test all 5 exercise types
6. Migrate sample lesson data

**Acceptance Criteria**:
- ✅ All exercise types work
- ✅ Progress saves to Supabase
- ✅ XP awarded correctly
- ✅ Animations smooth (60fps)
- ✅ Works on mobile

#### 3.2 Skill Tree / Lesson Map
**Current**: `lesson-map.html` (basic list)
**New**: Interactive skill tree visualization

```tsx
// src/features/lessons/components/SkillTree.tsx
import { motion } from 'framer-motion';

export function SkillTree() {
  const { data: lessons } = useQuery({
    queryKey: ['lessons'],
    queryFn: lessonService.getAllLessons,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: progressService.getUserProgress,
  });

  return (
    <div className="skill-tree">
      {quarters.map(quarter => (
        <QuarterPath key={quarter.id} quarter={quarter}>
          {quarter.lessons.map(lesson => (
            <LessonNode
              key={lesson.id}
              lesson={lesson}
              status={getLessonStatus(lesson, progress)}
              onClick={() => startLesson(lesson.id)}
            />
          ))}
        </QuarterPath>
      ))}
    </div>
  );
}

function LessonNode({ lesson, status, onClick }) {
  return (
    <motion.button
      className={cn(
        'lesson-node',
        status === 'locked' && 'opacity-50 cursor-not-allowed',
        status === 'completed' && 'bg-green-500',
        status === 'in-progress' && 'bg-yellow-500',
      )}
      whileHover={status !== 'locked' ? { scale: 1.1 } : {}}
      whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
      onClick={status !== 'locked' ? onClick : undefined}
    >
      <LessonIcon standard={lesson.standard_code} />
      <span>{lesson.title}</span>
    </motion.button>
  );
}
```

**Features**:
- Visual path through quarters
- Locked/unlocked/completed states
- Hover previews (standard info)
- Smooth animations
- Mobile swipe navigation

---

### Phase 4: Dashboard & Analytics (Week 8-9)
**Goal**: Build student and teacher dashboards

#### Student Dashboard
**Components**:
- `<ProgressOverview />` - XP, level, streaks, coins
- `<LessonHistory />` - Recent lessons with scores
- `<AchievementShowcase />` - Latest badges earned
- `<StreakCalendar />` - B-day streak heatmap
- `<NextLesson />` - Recommended next lesson

**Data Fetching**:
```typescript
// src/features/analytics/hooks/useDashboard.ts
export function useDashboard() {
  const userId = useUserStore(state => state.user?.id);

  const { data, isLoading } = useQueries({
    queries: [
      { queryKey: ['profile', userId], queryFn: () => profileService.get(userId) },
      { queryKey: ['progress', userId], queryFn: () => progressService.get(userId) },
      { queryKey: ['achievements', userId], queryFn: () => achievementService.get(userId) },
      { queryKey: ['streaks', userId], queryFn: () => streakService.get(userId) },
    ],
  });

  if (isLoading) return <DashboardSkeleton />;

  const [profile, progress, achievements, streaks] = data;

  return { profile, progress, achievements, streaks };
}
```

#### Teacher Dashboard
**Components**:
- `<ClassOverview />` - Class average XP, completion rate
- `<StudentList />` - All students with progress bars
- `<StruggleAlert />` - Students who need help
- `<LessonPacing />` - On track vs behind schedule

**New Table** (Supabase):
```sql
-- Teacher-student relationships
CREATE TABLE class_enrollments (
  id SERIAL PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id),
  student_id UUID REFERENCES profiles(id),
  class_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(teacher_id, student_id)
);
```

---

### Phase 5: Legacy Cleanup (Week 10-11)
**Goal**: Remove old code, optimize, polish

**Tasks**:
1. ✅ Delete old `js/` folder (backup first!)
2. ✅ Remove old HTML pages (keep as reference)
3. ✅ Archive `styles.css` (no longer needed)
4. ✅ Update all documentation
5. ✅ Run Lighthouse audit (target 90+ score)
6. ✅ Optimize bundle size (target <500KB initial load)
7. ✅ Add service worker (offline support)
8. ✅ Set up error monitoring (Sentry)
9. ✅ Configure analytics (Plausible - privacy-friendly)

**Bundle Analysis**:
```bash
npm run build -- --analyze

# Target metrics:
# Initial bundle: <500KB (gzipped)
# Largest chunk: <200KB
# Time to Interactive: <3s (3G connection)
```

**Cleanup Checklist**:
- [ ] Remove `css/styles.css` (84KB saved)
- [ ] Remove `js/core/game.js` (old practice mode)
- [ ] Remove 20+ unused script tags from HTML
- [ ] Delete `css/main.css` (replaced by Tailwind)
- [ ] Archive old documentation to `docs/archive/2025-11/pre-refactor/`

---

### Phase 6: Production Deployment (Week 12)
**Goal**: Ship to production with monitoring

#### Deployment Strategy
**Netlify Configuration**:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "functions"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**CI/CD Pipeline** (.github/workflows/deploy.yml):
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test       # Vitest unit tests
      - run: npm run test:e2e   # Playwright E2E tests
      - run: npm run build      # Production build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod
```

**Monitoring Setup**:
1. **Sentry** - Error tracking
   ```typescript
   // src/main.tsx
   import * as Sentry from '@sentry/react';

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     tracesSampleRate: 0.1,
   });
   ```

2. **Plausible** - Privacy-friendly analytics
   ```html
   <!-- public/index.html -->
   <script defer data-domain="7th-grade-pre-algebra.netlify.app"
           src="https://plausible.io/js/script.js"></script>
   ```

3. **Web Vitals** - Performance monitoring
   ```typescript
   // src/lib/analytics.ts
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

   function sendToAnalytics(metric) {
     const body = JSON.stringify(metric);
     const url = '/.netlify/functions/analytics';
     navigator.sendBeacon(url, body);
   }

   getCLS(sendToAnalytics);
   getFID(sendToAnalytics);
   getFCP(sendToAnalytics);
   getLCP(sendToAnalytics);
   getTTFB(sendToAnalytics);
   ```

**Rollout Plan**:
1. **Week 1**: Deploy to staging (staging.7th-grade-pre-algebra.netlify.app)
2. **Week 2**: Beta test with 5 students
3. **Week 3**: Gradual rollout (25% → 50% → 100%)
4. **Week 4**: Monitor, fix bugs, full launch

---

## 🧪 Testing Strategy

### Test Coverage Goals
- **Unit Tests**: 80% coverage (business logic)
- **Component Tests**: 60% coverage (UI components)
- **E2E Tests**: 100% coverage (critical user flows)

### Unit Tests (Vitest)
```typescript
// tests/unit/xp-system.test.ts
import { describe, it, expect } from 'vitest';
import { calculateLevel, xpToNextLevel } from '@/features/gamification/xp';

describe('XP System', () => {
  it('calculates correct level from XP', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(350)).toBe(3);
  });

  it('calculates XP needed for next level', () => {
    expect(xpToNextLevel(0)).toBe(100);
    expect(xpToNextLevel(100)).toBe(150);
    expect(xpToNextLevel(250)).toBe(200);
  });

  it('handles edge cases', () => {
    expect(calculateLevel(-10)).toBe(1); // Negative XP
    expect(calculateLevel(999999)).toBeLessThanOrEqual(100); // Max level
  });
});
```

### Component Tests (Testing Library)
```typescript
// tests/component/XPDisplay.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { XPDisplay } from '@/components/molecules/XPDisplay';
import { useUserStore } from '@/stores/userStore';

describe('XPDisplay', () => {
  it('displays current XP and level', () => {
    useUserStore.setState({ xp: 250, level: 3 });

    render(<XPDisplay />);

    expect(screen.getByText('250 XP')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
  });

  it('animates when XP increases', async () => {
    const { rerender } = render(<XPDisplay />);

    useUserStore.setState({ xp: 100, level: 2 });
    rerender(<XPDisplay />);

    // Should see animation
    const xpElement = screen.getByText(/100 XP/);
    expect(xpElement).toHaveClass('animate-pulse');
  });

  it('is accessible', () => {
    render(<XPDisplay />);

    expect(screen.getByLabelText(/experience points/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/lesson-completion.spec.ts
import { test, expect } from '@playwright/test';

test('complete lesson and earn XP', async ({ page }) => {
  // 1. Sign in
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:text("Sign In")');

  // 2. Navigate to lesson map
  await page.click('a:text("Lessons")');
  await expect(page).toHaveURL('/lessons');

  // 3. Start lesson 1
  await page.click('[data-lesson-id="1"]');
  await expect(page).toHaveURL('/lessons/1/play');

  // 4. Complete all exercises
  const initialXP = await page.textContent('[data-testid="xp-display"]');

  // Answer 5 questions (mocked to be correct)
  for (let i = 0; i < 5; i++) {
    await page.click('[data-correct="true"]'); // Click correct answer
    await page.click('button:text("Check")');
    await page.click('button:text("Continue")');
  }

  // 5. Verify completion modal
  await expect(page.locator('text=Lesson Complete!')).toBeVisible();

  // 6. Verify XP awarded
  const finalXP = await page.textContent('[data-testid="xp-display"]');
  expect(parseInt(finalXP)).toBeGreaterThan(parseInt(initialXP));

  // 7. Verify lesson marked complete in database
  const lessonStatus = await page.evaluate(async () => {
    const { data } = await supabase
      .from('lesson_progress')
      .select('status')
      .eq('lesson_id', 1)
      .single();
    return data.status;
  });
  expect(lessonStatus).toBe('completed');
});
```

---

## 📊 Success Metrics

### Technical Metrics
- **Bundle Size**: <500KB initial load (current: ~800KB with all scripts)
- **Time to Interactive**: <3s on 3G (current: ~5s)
- **Lighthouse Score**: 90+ (current: ~70)
- **Test Coverage**: 80%+ (current: 0%)
- **TypeScript Strict Mode**: No errors (current: N/A)

### Code Quality Metrics
- **Cyclomatic Complexity**: <10 per function (current: game.js has 30+)
- **File Size**: <300 lines per file (current: game.js is 1,300 lines)
- **Dependency Count**: <50 (current: 0, but no management)
- **Dead Code**: 0% (current: unknown, likely high)

### User Experience Metrics
- **D1 Retention**: 50% → 60% (target improvement)
- **D7 Retention**: 40% → 50%
- **Bug Reports**: 10/month → 2/month
- **Page Load Time**: 2s → 1s

---

## 🚨 Risk Mitigation

### Risk 1: Data Loss During Migration
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Full Supabase backup before each phase
- Dual-run old and new apps for 2 weeks
- User data migration script with rollback
- Test on staging database first

### Risk 2: Timeline Slippage
**Probability**: High
**Impact**: Medium
**Mitigation**:
- Buffer time in each phase (8-12 weeks = 4-week buffer)
- Daily standups to track progress
- Drop scope if needed (analytics dashboard can wait)
- Parallel workstreams (frontend + backend)

### Risk 3: Breaking Changes to Supabase Schema
**Probability**: Low
**Impact**: High
**Mitigation**:
- Use Supabase migrations (versioned)
- Never delete columns, only add new ones
- Keep old columns until migration complete
- RLS policies tested in staging first

### Risk 4: Performance Regression
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Lighthouse CI on every PR
- Bundle size monitoring (fail build if >500KB)
- E2E performance tests (check TTI)
- Load testing with 100+ concurrent users

---

## 💰 Cost-Benefit Analysis

### Costs
**Time**:
- 8-12 weeks development (1 developer)
- 2 weeks testing + bug fixing
- 1 week documentation updates
- **Total**: 11-15 weeks

**Money**:
- No new services needed (keep Supabase + Netlify)
- Optional: Sentry ($26/month), Plausible ($9/month)
- **Total**: ~$35/month additional

### Benefits
**Developer Productivity**:
- 10x faster to add new features (components + hooks)
- 90% fewer CSS conflicts (scoped styles)
- Catch bugs before production (TypeScript + tests)
- Easier onboarding (modern stack, clear architecture)

**User Experience**:
- 50% faster page loads (code splitting)
- Instant UI feedback (optimistic updates)
- Better mobile experience (responsive components)
- Offline support (service worker)

**Maintainability**:
- Clear separation of concerns (easy to debug)
- Comprehensive tests (refactor with confidence)
- Type safety (catch bugs at compile time)
- Modern best practices (future-proof)

**ROI**: 3-6 months (time saved on bug fixes + new features)

---

## 🎯 Quick Wins - What We Can Do Today

While planning the full refactor, here are immediate improvements:

### 1. Add TypeScript to Netlify Functions (1 day)
```bash
# Install dependencies
npm install -D typescript @types/node @netlify/functions

# Convert award-xp.js → award-xp.ts
mv functions/award-xp.js functions/award-xp.ts
```

**Benefits**:
- Catch bugs like `.eq('user_id')` vs `.eq('id')`
- Autocomplete for Supabase schema
- Type-safe function signatures

### 2. Set Up Vitest for Utilities (1 day)
```bash
npm install -D vitest

# Create tests/unit/ folder
mkdir -p tests/unit

# Test pure functions first (no DOM dependencies)
# - calculateLevel
# - xpToNextLevel
# - validateEmail
# - formatDate
```

**Benefits**:
- Start building test culture
- Prove testing works on this codebase
- Find bugs in pure logic

### 3. Extract Pure Functions from game.js (2 days)
```javascript
// js/utils/xp-calculations.js
export function calculateLevel(xp) {
  // Extract this from game.js line 150
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function xpToNextLevel(currentXP) {
  // Extract this from game.js line 160
  const currentLevel = calculateLevel(currentXP);
  const nextLevel = currentLevel + 1;
  return Math.pow(nextLevel - 1, 2) * 50 - currentXP;
}
```

**Benefits**:
- Can unit test immediately
- Can reuse in new architecture
- Reduces game.js coupling
- **No breaking changes to current site**

### 4. Add Prettier + ESLint (1 day)
```bash
npm install -D prettier eslint eslint-config-prettier

# .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}

# Format all code
npx prettier --write "js/**/*.js"
```

**Benefits**:
- Consistent code style
- Catch common bugs (unused variables, etc.)
- Easier code reviews

---

## 📝 Documentation Updates

### Files to Update
1. **docs/SYSTEM-ARCHITECTURE-STATUS.md**
   - Add "Refactor Plan" section
   - Update Mermaid chart with migration phases

2. **docs/architecture/README.md**
   - Add "New Architecture (Post-Refactor)" section
   - Document React component patterns

3. **.claude/CLAUDE.md**
   - Update "TECHNICAL ARCHITECTURE" section
   - Add "REFACTOR STATUS" section

4. **README.md** (root)
   - Add "Architecture Migration" section
   - Link to this refactor plan

### New Documentation to Create
1. **docs/architecture/REACT-PATTERNS.md** - React/TypeScript patterns
2. **docs/architecture/STATE-MANAGEMENT.md** - Zustand store patterns
3. **docs/architecture/TESTING-GUIDE.md** - How to write tests
4. **docs/MIGRATION-LOG.md** - Track migration progress

---

## 🎓 Team Training Plan

### Week 1-2: Fundamentals
- React hooks deep dive
- TypeScript basics
- Vitest crash course
- Git workflow (feature branches)

### Week 3-4: Advanced Topics
- React Query patterns
- Zustand state management
- Testing Library best practices
- Accessibility fundamentals

### Resources
- [React docs](https://react.dev) - Official React documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [Testing Library](https://testing-library.com/) - Testing best practices
- [Vite Guide](https://vitejs.dev/guide/) - Vite documentation

---

## 🚀 Next Steps

### Immediate (This Week)
1. ✅ Review and approve this refactor plan
2. ✅ Create `refactor` branch in git
3. ✅ Set up Vite + React + TypeScript starter
4. ✅ Initialize folder structure
5. ✅ Add TypeScript to one Netlify function (proof of concept)

### Week 1-2 (Foundation)
- [ ] Complete Phase 1 tasks (see above)
- [ ] Write first unit tests
- [ ] Extract pure functions from game.js
- [ ] Set up CI/CD pipeline

### Week 3-4 (Core Systems)
- [ ] Migrate authentication system
- [ ] Migrate XP system
- [ ] Migrate coins, streaks, achievements

### Week 5-7 (Lesson System)
- [ ] Build lesson player components
- [ ] Migrate exercise types
- [ ] Create skill tree visualization

### Week 8-9 (Dashboard)
- [ ] Build student dashboard
- [ ] Build teacher dashboard
- [ ] Add analytics

### Week 10-11 (Cleanup)
- [ ] Remove old code
- [ ] Optimize bundles
- [ ] Polish UI/UX

### Week 12 (Launch)
- [ ] Deploy to production
- [ ] Monitor metrics
- [ ] Fix bugs
- [ ] Celebrate! 🎉

---

## 📞 Stakeholder Communication

### Weekly Progress Updates
**To**: Product Owner, Teacher
**Format**: Slack message + Loom video demo
**Content**:
- What shipped this week
- Metrics (bundle size, test coverage, performance)
- Blockers
- Next week's goals

### Monthly Demo
**To**: All stakeholders
**Format**: 30-minute Zoom call
**Content**:
- Live demo of new features
- Side-by-side comparison (old vs new)
- Q&A session

---

## 🎯 Conclusion

This refactor is **essential** for the long-term success of the platform. The current architecture is unsustainable:
- Fragile (every change risks breaking something)
- Slow (no hot reload, manual file management)
- Untestable (no way to prevent regressions)
- Unmaintainable (1,300-line files, tight coupling)

The new architecture will:
- ✅ Enable rapid feature development (components + hooks)
- ✅ Prevent bugs (TypeScript + tests)
- ✅ Improve performance (code splitting, optimistic updates)
- ✅ Scale to 1,000+ students (proper state management)
- ✅ Attract contributors (modern stack, clear patterns)

**Timeline**: 8-12 weeks
**Risk**: Medium (dual-run strategy minimizes production risk)
**ROI**: 3-6 months (time saved on bug fixes + new features)

**Recommendation**: Approve and begin Phase 1 immediately.

---

**End of Refactor Plan**
**Last Updated**: November 15, 2025
