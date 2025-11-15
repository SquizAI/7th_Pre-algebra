# Skill Tree - Visual Design Guide

## Color-Coded Status System

### Lesson Node States

```
🔒 LOCKED (Gray - #9CA3AF)
├─ Appearance: Faded gray circle with lock icon
├─ Behavior: Non-clickable, opacity 60%
├─ Path: Dotted line connection
└─ Message: "Complete Lesson X to unlock"

📘 AVAILABLE (Blue - #3B82F6)
├─ Appearance: Bright blue circle with book icon
├─ Behavior: Clickable, hover scales 1.1x
├─ Path: Solid blue line connection
└─ Message: "Ready to Start"

⭐ CURRENT (Gold - #F59E0B)
├─ Appearance: Gold circle with star icon + glow ring
├─ Behavior: Pulse animation (2s loop)
├─ Path: Solid gradient line
└─ Message: "Current Lesson"

✓ COMPLETED (Green - #10B981)
├─ Appearance: Green circle with checkmark + stars
├─ Behavior: Clickable for review, no animation
├─ Path: Solid green line
└─ Display: 1-3 stars based on score
```

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  Your Learning Journey                       │  │
│  │  87 Lessons • 4 Quarters • 10 Units          │  │
│  │                                               │  │
│  │      [Progress Circle: 17%]                  │  │
│  │      15/87 Lessons Completed                 │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  FILTERS                                            │
│  [Quarter ▼] [Unit ▼] [Standard ▼] [Status ▼]     │
│  [🔍 Search lessons...]                            │
│  [⭐ Go to Current] [🔄 Reset Filters]             │
│                                                     │
├─────────────────────────────────────────────────────┤
│  SKILL TREE                                         │
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │  📅 First Quarter                     │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │  🏰 Unit 1: Number Sense              │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│       [1] Intro to Irrational Numbers              │
│              ⭐                                     │
│            MA.8.NSO.1.1                            │
│              |                                      │
│              |                                      │
│  [2] Approximating Square Roots     ────►          │
│          ✓ ⭐⭐⭐                                    │
│        MA.8.NSO.1.1                                │
│              |                                      │
│              |                                      │
│       [3] Expressions with π                       │
│          ✓ ⭐⭐                                     │
│        MA.8.NSO.1.1                                │
│              |                                      │
│         .    :    (dotted = locked)                │
│         .    :                                      │
│              🔒                                     │
│       [4] Plotting Numbers                         │
│        MA.8.NSO.1.2                                │
│                                                     │
│  ... (continues for all 87 lessons)                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Lesson Node Anatomy

```
┌────────────────────────────────────────┐
│  LESSON NODE (70px circle)             │
│                                        │
│         ┌────────────┐                 │
│         │     ⭐     │ ← Status Icon   │
│         │    ---     │                 │
│         │     15     │ ← Lesson Number │
│         └────────────┘                 │
│              │                          │
│              │                          │
│     ┌────────┴─────────┐               │
│     │ Solving Multi-   │ ← Title       │
│     │ Step Equations   │               │
│     │ MA.8.AR.2.1      │ ← Standard    │
│     │ ⭐⭐⭐            │ ← Stars       │
│     └──────────────────┘               │
│                                        │
└────────────────────────────────────────┘
```

## Preview Modal Layout

```
┌─────────────────────────────────────────────┐
│  [×]                                        │
│                                             │
│  Lesson 15                                  │
│  Solving Multi-Step Equations               │
│  [⭐ Current Lesson]                        │
│                                             │
│  Quarter: Q2    Unit: Unit 3               │
│  Date: Dec 10   Standard: MA.8.AR.2.1      │
│                                             │
│  ────────────────────────────────────────  │
│  Solve multi-step linear equations in one  │
│  variable with rational coefficients...     │
│  ────────────────────────────────────────  │
│                                             │
│  Learning Objectives:                       │
│  ✓ Combine like terms on same side         │
│  ✓ Use inverse operations to solve         │
│  ✓ Work with rational coefficients         │
│                                             │
│  ────────────────────────────────────────  │
│                                             │
│  [▶️ Start Lesson]                          │
│                                             │
└─────────────────────────────────────────────┘
```

## Unit Theme Colors

```
Unit 1:  🏰 Castle      #8B5CF6 (Purple)
Unit 2:  🌲 Forest      #059669 (Green)
Unit 3:  ⛰️  Mountain    #0EA5E9 (Sky Blue)
Unit 4:  🏜️  Desert      #F59E0B (Amber)
Unit 5:  🌊 Ocean       #06B6D4 (Cyan)
Unit 6:  ☁️  Sky         #6366F1 (Indigo)
Unit 7:  🕳️  Cave        #78716C (Stone)
Unit 8:  🌸 Garden      #84CC16 (Lime)
Unit 9:  ⛩️  Temple      #DC2626 (Red)
Unit 10: 📚 Library     #7C3AED (Violet)
```

## Stars Scoring System

```
⭐⭐⭐  =  90-100%  =  Excellent! Mastered!
⭐⭐    =  75-89%   =  Good Job! Almost there!
⭐      =  60-74%   =  Nice Try! Keep practicing!
(none)  =  0-59%   =  Review and try again
```

## Responsive Breakpoints

### Desktop (> 768px)
- Lessons alternate left/right
- 900px max width container
- 70px lesson circles
- Side-by-side filters

### Tablet (481-768px)
- Lessons center-aligned
- Full width container
- 60px lesson circles
- Stacked filters

### Mobile (≤ 480px)
- Lessons center-aligned
- Compact layout
- 50px lesson circles
- Single column filters
- Bottom modal sheet (vs centered)

## Animation States

### Pulse (Current Lesson)
```
0%    → Scale: 1.0,   Shadow: 0px blur
50%   → Scale: 1.05,  Shadow: 10px blur, fade out
100%  → Scale: 1.0,   Shadow: 0px blur
Duration: 2s, infinite loop
```

### Bounce (Auto-scroll Highlight)
```
0%    → Y-position: 0
50%   → Y-position: -10px
100%  → Y-position: 0
Duration: 0.6s, once
```

### Hover (Available/Current/Completed)
```
Default  → Scale: 1.0
Hover    → Scale: 1.1, shadow increases
Duration: 0.3s ease
```

## Filter Interaction Flow

```
User selects filter
      ↓
SkillTree.filterByX(value)
      ↓
SkillTree.getFilteredLessons()
      ↓
SkillTreeRenderer.renderSkillTree(filtered)
      ↓
Update display count
      ↓
Show "Filtered View: X of 87 lessons"
```

## Click Flow Diagram

```
User clicks lesson node
      ↓
Is lesson locked?
  YES → Show "Complete Lesson X" message
  NO  → Continue
      ↓
LessonPreview.show(lesson)
      ↓
Display modal with:
  - Lesson details
  - Status badge
  - Learning objectives
  - Action button
      ↓
User clicks "Start Lesson"
      ↓
Navigate to: /lesson-player.html?lesson=X
      ↓
Lesson player loads
```

## Search Interaction

```
User types in search box
      ↓
Debounce 300ms
      ↓
SkillTree.searchLessons(keyword)
      ↓
Filter by:
  - Lesson title (case-insensitive)
  - Standard code
      ↓
Render matching lessons
      ↓
Show: "X results for 'keyword'"
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Move between filters and buttons
- **Enter/Space**: Activate selected element
- **Escape**: Close preview modal
- **Ctrl/Cmd+C**: Jump to current lesson

### Screen Reader Announcements
- "Lesson 15, Solving Multi-Step Equations, Current Lesson, Available"
- "Lesson 20, locked, requires completing lesson 19"
- "Lesson 5, completed with 3 stars, score 95%"

### Focus Indicators
- 3px blue outline on focus
- High contrast (4.5:1 minimum)
- Visible on all interactive elements

## Mobile UX Considerations

### Touch Targets
- Minimum 44x44px tap areas
- Increased spacing on mobile
- Larger filter dropdowns

### Scroll Behavior
- Smooth scroll to current lesson
- Sticky header on scroll
- Bottom padding for thumb reach

### Modal Behavior
- Full-width on mobile
- Slide up from bottom
- Easy dismiss (swipe or tap overlay)

## Print Styles (Future)

```css
@media print {
  /* Hide filters and interactive elements */
  .skill-tree-filters,
  .quick-actions {
    display: none;
  }

  /* Simplify layout */
  .lesson-node {
    page-break-inside: avoid;
  }

  /* Use simple colors */
  .lesson-node-circle {
    border: 2px solid black;
  }
}
```

## Performance Optimization

### Initial Load
1. Load critical CSS inline
2. Defer non-critical JS
3. Lazy load lesson data (fetch on demand)
4. Cache JSON responses

### Rendering
1. Virtual scrolling for 87+ lessons
2. Debounced filter updates
3. Memoized status calculations
4. Batch DOM updates

### Animations
1. Use CSS transforms (GPU accelerated)
2. Avoid layout thrashing
3. RequestAnimationFrame for JS animations
4. Reduce motion for accessibility

---

**Visual Guide Version**: 1.0.0
**Last Updated**: November 14, 2024
**Design System**: Duolingo-Inspired Educational UI
