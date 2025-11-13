# Development Plan: 7th Grade Pre-Algebra Learning Platform

## Executive Summary

**Current State**: Functional but dated UI with inconsistent styling, poor visual hierarchy, and patchwork fixes.

**Goal**: Modern, clean, bulletproof educational platform that "just works" - no fancy animations, just solid UX.

**Timeline**: 3-phase implementation focused on reliability and user experience.

---

## Phase 1: UI Foundation & Design System (PRIORITY)

### 1.1 Design Tokens
Create consistent design system:

**Colors**
```css
/* Primary - Education Focus */
--primary: #4a5fc1;          /* Deep blue - authority, learning */
--primary-light: #6b7fd7;
--primary-dark: #3a4f9f;

/* Accent - Success & Progress */
--accent: #10b981;           /* Green - achievement */
--accent-light: #34d399;
--accent-dark: #059669;

/* Warning/Help */
--warning: #f59e0b;          /* Amber - caution */
--error: #ef4444;            /* Red - incorrect */

/* Neutrals */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Semantic Colors */
--bg-primary: white;
--bg-secondary: var(--gray-50);
--text-primary: var(--gray-900);
--text-secondary: var(--gray-600);
--border: var(--gray-200);
```

**Typography**
```css
/* Font Families */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'SF Mono', Consolas, 'Liberation Mono', monospace;

/* Font Sizes - Clear Hierarchy */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Spacing**
```css
/* Consistent 8px grid */
--space-1: 0.5rem;   /* 8px */
--space-2: 1rem;     /* 16px */
--space-3: 1.5rem;   /* 24px */
--space-4: 2rem;     /* 32px */
--space-5: 2.5rem;   /* 40px */
--space-6: 3rem;     /* 48px */
--space-8: 4rem;     /* 64px */
```

**Border Radius**
```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-full: 9999px;  /* Pills */
```

**Shadows**
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### 1.2 Component Library

**Button System**
```html
<!-- Primary Action -->
<button class="btn btn-primary btn-lg">
    Start Learning
</button>

<!-- Secondary Action -->
<button class="btn btn-secondary">
    View Tutorials
</button>

<!-- Danger/Warning -->
<button class="btn btn-danger">
    Reset Progress
</button>

<!-- Ghost (minimal) -->
<button class="btn btn-ghost">
    Skip
</button>
```

**Card System**
```html
<!-- Standard Card -->
<div class="card">
    <div class="card-header">
        <h3>Title</h3>
    </div>
    <div class="card-body">
        Content
    </div>
    <div class="card-footer">
        Actions
    </div>
</div>

<!-- Interactive Card (hover effects) -->
<div class="card card-interactive">
    ...
</div>
```

**Badge System**
```html
<span class="badge badge-success">Completed</span>
<span class="badge badge-warning">In Progress</span>
<span class="badge badge-info">New</span>
```

### 1.3 Layout Grid
```css
/* Container Widths */
--container-sm: 640px;   /* Mobile */
--container-md: 768px;   /* Tablet */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1280px;  /* Wide */

/* Standard Layout */
.container {
    max-width: var(--container-lg);
    margin: 0 auto;
    padding: var(--space-4);
}
```

---

## Phase 2: Screen-by-Screen Rebuild

### 2.1 Home Screen
**Current Problems:**
- Cluttered with too many options
- Poor visual hierarchy
- Confusing CTA placement
- Purple gradient looks dated

**New Design:**
```
┌─────────────────────────────────────────┐
│  7th Grade Pre-Algebra                  │
│  Florida Standard MA.8.AR.2.1           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📊 Your Progress                        │
│                                          │
│  ▓▓▓▓▓▓▓░░░ 65%                         │
│                                          │
│  • Two-Step Equations     ✓ Mastered    │
│  • Combining Terms        ⏳ Learning   │
│  • Distributive Property  🔒 Locked     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           [Continue Learning] ←────      │
│            Level 2: Combining Terms      │
│                                          │
│  Need Help?  [Watch Tutorials]          │
│  Extra Practice?  [Practice Arena]      │
└─────────────────────────────────────────┘
```

**Key Changes:**
- Single, clear primary action
- Progress visible immediately
- Flat, clean design
- No gradients or shadows (except subtle elevation)

### 2.2 Video Lesson Screen
**Current Problems:**
- Too much text
- Poor video player sizing
- Key points not scannable

**New Design:**
```
┌─────────────────────────────────────────┐
│  ← Back                    Step 1 of 3   │
├─────────────────────────────────────────┤
│                                          │
│         [YouTube Video Player]           │
│            16:9 Responsive               │
│                                          │
├─────────────────────────────────────────┤
│  Key Concepts:                           │
│  ✓ Work backwards - undo operations     │
│  ✓ Same operation to both sides         │
│  ✓ Simplify one step at a time          │
│  ✓ Check your answer                    │
├─────────────────────────────────────────┤
│  ☐ I watched the video                  │
│                                          │
│          [Continue to Examples] →        │
└─────────────────────────────────────────┘
```

### 2.3 Examples Screen
**Current Problems:**
- Animation controls unclear
- Too much going on visually
- Balance visual is overcomplicated

**New Design:**
```
┌─────────────────────────────────────────┐
│  Worked Example 1 of 2                   │
├─────────────────────────────────────────┤
│  Problem: 3x + 5 = 20                    │
│                                          │
│  Step 1: Subtract 5 from both sides      │
│                                          │
│     3x + 5 = 20                          │
│       - 5   - 5                          │
│     ───────────                          │
│     3x = 15                              │
│                                          │
│  Why? We need to isolate the x term.    │
│                                          │
│  [← Previous]  [Pause]  [Next →]        │
├─────────────────────────────────────────┤
│  Quick Check:                            │
│  What should we do next?                 │
│  ( ) Add 3                               │
│  (•) Divide by 3    ← Selected           │
│  ( ) Multiply by 3                       │
│                                          │
│  [Check Answer]                          │
└─────────────────────────────────────────┘
```

### 2.4 Practice Screen - SCAFFOLDED LEARNING (PRIMARY METHOD)

**CRITICAL INSIGHT**: Students learn BY DOING guided steps, not by solving independently.

**Progressive Mastery Model (BINGO Method):**
- **B-I-N-G-O** (Beginner): Full guidance - every step explained with choices
- **I-N-G-O** (Learning): Reduce scaffolding - fewer choices, more blanks
- **N-G-O** (Practicing): Minimal hints - mostly fill-in-blank
- **G-O** (Advanced): Just equation → calculation → check
- **O** (Mastery): No scaffolding - pure problem solving

**Current Problems:**
- "Get Help" is backwards - guided steps should be PRIMARY
- 3D balance is distracting, often broken
- Students jump to final answer without learning steps
- No progressive difficulty

**New Design - B-I-N-G-O Stage (Full Scaffolding):**
```
┌─────────────────────────────────────────┐
│  Level 2: Combining Terms    Problem 3/10│
│  ▓▓▓░░░░░░░                             │
├─────────────────────────────────────────┤
│  Problem: 2x + 3x + 5 = 20               │
│                                          │
│  Step 1 of 4: What should we do FIRST?   │
│                                          │
│  ( ) Subtract 5 from both sides          │
│  ( ) Divide everything by 2              │
│  (•) Combine the x terms                 │
│                                          │
│  💡 Hint: Look for terms with x          │
│                                          │
│  [Check Answer]                          │
├─────────────────────────────────────────┤
│  🔥 Streak: 2    ⭐ XP: 145    💰 Coins: 45│
└─────────────────────────────────────────┘
```

**After Correct Answer:**
```
┌─────────────────────────────────────────┐
│  ✅ Correct! 2x + 3x = 5x                │
│                                          │
│  Step 2 of 4: Now solve this:            │
│                                          │
│         5x + 5 = 20                      │
│                                          │
│  Subtract 5 from both sides:             │
│                                          │
│         5x = [___]                       │
│                                          │
│  💡 Hint: 20 - 5 = ?                     │
│                                          │
│  [Check Answer]                          │
└─────────────────────────────────────────┘
```

**I-N-G-O Stage (Reduced Scaffolding):**
```
┌─────────────────────────────────────────┐
│  Problem: 4x - x + 6 = 15                │
│                                          │
│  Step 1: Combine like terms              │
│                                          │
│  [___]x + 6 = 15                         │
│                                          │
│  💡 Show hint                            │
│                                          │
│  [Check Answer]                          │
└─────────────────────────────────────────┘
```

**N-G-O Stage (Minimal Scaffolding):**
```
┌─────────────────────────────────────────┐
│  Solve: 3x + 7 = 22                      │
│                                          │
│  First, isolate the x term:              │
│  3x = [___]                              │
│                                          │
│  Then solve for x:                       │
│  x = [___]                               │
│                                          │
│  [Check Answer]                          │
└─────────────────────────────────────────┘
```

**G-O Stage (Almost Independent):**
```
┌─────────────────────────────────────────┐
│  Solve for x:                            │
│                                          │
│         5x - 3 = 17                      │
│                                          │
│  x = [_______]                           │
│                                          │
│  [Check Answer]  [💡 Review Steps]       │
└─────────────────────────────────────────┘
```

**O Stage (Full Mastery - No Scaffolding):**
```
┌─────────────────────────────────────────┐
│  8x + 12 = 44                            │
│                                          │
│  x = [_______]                           │
│                                          │
│  [Check Answer]                          │
└─────────────────────────────────────────┘
```

**Key Implementation:**
1. Every concept starts at B-I-N-G-O (full scaffolding)
2. After 3 correct in a row → move to I-N-G-O
3. After 3 more correct → move to N-G-O
4. Continue until mastery (O stage)
5. Incorrect answer → stay at current stage or regress one stage

---

## Phase 3: Bulletproofing

### 3.1 State Management
**Problem:** LocalStorage is fragile, no error recovery

**Solution:**
```javascript
class StateManager {
    constructor() {
        this.state = this.loadState();
        this.autoSaveInterval = null;
    }

    loadState() {
        try {
            const saved = localStorage.getItem('appState');
            const parsed = JSON.parse(saved);

            // Validate schema
            if (!this.validateState(parsed)) {
                console.warn('Invalid state, using defaults');
                return this.getDefaultState();
            }

            return parsed;
        } catch (error) {
            console.error('State load error:', error);
            return this.getDefaultState();
        }
    }

    validateState(state) {
        // Check required fields exist
        return state &&
               typeof state.currentLevel === 'number' &&
               typeof state.playerXP === 'number' &&
               Array.isArray(state.learnedConcepts);
    }

    getDefaultState() {
        return {
            currentLevel: 1,
            playerXP: 0,
            playerCoins: 0,
            playerLevel: 1,
            worldProgress: {},
            learnedConcepts: [],
            streak: 0,
            lastSaved: new Date().toISOString(),
            version: '2.0.0'  // For migration handling
        };
    }

    saveState() {
        try {
            this.state.lastSaved = new Date().toISOString();
            localStorage.setItem('appState', JSON.stringify(this.state));
            return true;
        } catch (error) {
            console.error('State save error:', error);
            // Show user-friendly error
            this.showSaveError();
            return false;
        }
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveState();
        }, 30000);  // Every 30 seconds
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}
```

### 3.2 Workflow Enforcement
**Problem:** Students can bypass required steps

**Solution:**
```javascript
class WorkflowManager {
    constructor() {
        this.requiredSteps = {
            1: ['video', 'examples', 'understanding-check'],  // Level 1
            2: ['video', 'examples', 'understanding-check'],  // Level 2
            // etc...
        };

        this.completedSteps = {};
    }

    canStartLevel(levelId) {
        // Level 1 ALWAYS requires workflow
        if (levelId === 1) {
            const completed = this.completedSteps[levelId] || [];
            return completed.includes('understanding-check');
        }

        // Check if concept is learned
        const conceptKey = this.getConceptForLevel(levelId);
        return this.isConceptLearned(conceptKey);
    }

    markStepComplete(levelId, step) {
        if (!this.completedSteps[levelId]) {
            this.completedSteps[levelId] = [];
        }

        if (!this.completedSteps[levelId].includes(step)) {
            this.completedSteps[levelId].push(step);
            this.saveState();
        }
    }

    getNextRequiredStep(levelId) {
        const required = this.requiredSteps[levelId];
        const completed = this.completedSteps[levelId] || [];

        return required.find(step => !completed.includes(step));
    }

    // Block navigation if workflow incomplete
    enforceWorkflow(levelId) {
        const nextStep = this.getNextRequiredStep(levelId);

        if (nextStep) {
            this.showRequiredStepMessage(nextStep);
            return false;  // Block
        }

        return true;  // Allow
    }
}
```

### 3.3 Error Boundaries
**Problem:** One error crashes entire app

**Solution:**
```javascript
class ErrorBoundary {
    constructor() {
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });
    }

    handleError(error) {
        // Log to console (in production, send to error tracking)
        console.error('Error caught by boundary:', error);

        // Show user-friendly message
        this.showErrorUI({
            title: 'Oops! Something went wrong',
            message: 'Don\'t worry - your progress is saved. Try refreshing the page.',
            actions: [
                {
                    label: 'Refresh Page',
                    action: () => window.location.reload()
                },
                {
                    label: 'Continue Anyway',
                    action: () => this.hideErrorUI()
                }
            ]
        });
    }

    showErrorUI(config) {
        const errorDiv = document.getElementById('errorBoundary');
        errorDiv.innerHTML = `
            <div class="error-modal">
                <div class="error-icon">⚠️</div>
                <h2>${config.title}</h2>
                <p>${config.message}</p>
                <div class="error-actions">
                    ${config.actions.map(action => `
                        <button class="btn btn-primary" onclick="${action.action}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        errorDiv.style.display = 'flex';
    }
}
```

### 3.4 Testing Checklist

**Critical Paths (Must Work 100%):**
- [ ] First-time user → Level 1 → Must see video
- [ ] Video watched → Examples → Understanding check → Practice
- [ ] Correct answer → XP gain → Progress save
- [ ] Incorrect answer → Retry → Hints work
- [ ] Close browser → Reopen → Resume exactly where left off
- [ ] Complete level → Unlock next level
- [ ] Refresh during practice → Resume same question

**Edge Cases:**
- [ ] LocalStorage full → Show error, continue session
- [ ] LocalStorage corrupted → Reset to defaults, warn user
- [ ] No internet (offline) → Core functionality still works
- [ ] Slow connection → Video loads, rest works
- [ ] Browser back button → Handle gracefully
- [ ] Multiple tabs open → Sync or warn user

**Browser Compatibility:**
- [ ] Chrome (primary)
- [ ] Safari (iOS required for students)
- [ ] Firefox
- [ ] Edge

---

## Implementation Order

### Week 1: Foundation
1. Create `design-system.css` with all tokens
2. Build base component library
3. Create `StateManager` class
4. Create `WorkflowManager` class
5. Add `ErrorBoundary`

### Week 2: Screens
1. Rebuild home screen
2. Rebuild video lesson screen
3. Rebuild examples screen
4. Rebuild practice/game screen

### Week 3: Testing & Polish
1. End-to-end testing of all workflows
2. Mobile responsive testing
3. Error case testing
4. Performance optimization
5. Documentation

---

## Success Criteria

**Functional Requirements:**
✓ 100% of first-time users see video before practice
✓ Progress never lost (unless user clears browser data)
✓ Every screen works on mobile (iPhone SE minimum)
✓ No crashes - graceful error handling only
✓ Offline-first: core functionality works without internet

**Visual Requirements:**
✓ Consistent spacing (8px grid)
✓ Clear visual hierarchy
✓ No gradients (except subtle accents)
✓ Maximum 3 colors per screen
✓ All text readable (WCAG AA minimum)

**Performance Requirements:**
✓ Initial load < 2 seconds
✓ Screen transitions < 300ms
✓ No layout shift after load
✓ Smooth on 60fps devices

---

## Next Steps

1. **Approve this plan** - Review and confirm approach
2. **Create design-system.css** - Foundation first
3. **Build component library** - Reusable pieces
4. **Rebuild screens one by one** - Systematic approach
5. **Test ruthlessly** - No shortcuts

---

## Notes

- **No more "winging it"** - Every change follows this plan
- **No more quick fixes** - Proper implementation or nothing
- **Design system first** - Don't touch screens until foundation is solid
- **Test everything** - If it's not tested, it's broken
