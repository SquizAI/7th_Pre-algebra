# LESSON IMPLEMENTATION GUIDE

## Overview

This guide covers how to build all **87 lessons** for the 2025-2026 school year. Each lesson follows the same structure but adapts to different Florida BEST Standards (MA.8.XXX).

---

## Lesson Structure

Every lesson follows the **Duolingo microlearning pattern**:

```
1. Concept Introduction (splash screen)
   ↓
2. Video Tutorial (3-5 min YouTube video)
   ↓
3. Worked Examples (2-3 step-by-step examples)
   ↓
4. Practice Problems (5 interactive questions)
   ↓
5. Lesson Complete (celebration + XP/coins)
```

---

## Lesson Metadata Template

Each lesson needs metadata in `/js/config/schedule.js`:

```javascript
lessonMetadata: {
  1: {
    name: 'Introduction to Irrational Numbers',
    standard: 'MA.8.NSO.1.1',
    topic: 'Irrational Numbers',
    videoId: 'xyz123abc',  // YouTube video ID
    unit: 1,
    difficulty: 'easy',
    prerequisites: [],  // Lesson numbers that should be completed first
    estimatedTime: 25  // minutes
  }
}
```

---

## Course Outline: All 87 Lessons

### Quarter 1 (Lessons 1-23)

**Unit 1: Number Sense and Operations (Lessons 1-19)**
Focus: MA.8.NSO.1.X standards

| Lesson | Standard | Topic | Type |
|--------|----------|-------|------|
| 1 | MA.8.NSO.1.1 | Introduction to Irrational Numbers | Intro |
| 2 | MA.8.NSO.1.1 | Approximating Square Roots | Practice |
| 3 | MA.8.NSO.1.1 | Cube Roots and Pi | Practice |
| 4 | MA.8.NSO.1.2 | Plotting Rational & Irrational Numbers | Intro |
| 5 | MA.8.NSO.1.2 | Ordering Numbers on Number Line | Practice |
| 6 | MA.8.NSO.1.2 | Comparing with Inequalities | Practice |
| 7 | MA.8.NSO.1.3 | Laws of Exponents - Introduction | Intro |
| 8 | MA.8.NSO.1.3 | Integer Exponents | Practice |
| 9 | MA.8.NSO.1.3 | Negative Exponents | Practice |
| 10 | MA.8.NSO.1.3 | Zero Exponent Rule | Practice |
| 11 | MA.8.NSO.1.4 | Scientific Notation - Introduction | Intro |
| 12 | MA.8.NSO.1.4 | Converting to Scientific Notation | Practice |
| 13 | MA.8.NSO.1.4 | Operations with Scientific Notation | Practice |
| 14 | MA.8.NSO.1.5 | Adding & Subtracting in Scientific Notation | Practice |
| 15 | MA.8.NSO.1.5 | Multiplying & Dividing in Scientific Notation | Practice |
| 16 | MA.8.NSO.1.6 | Estimating Solutions | Practice |
| 17 | MA.8.NSO.1.7 | Solving Multi-Step Problems | Practice |
| 18 | MA.8.NSO.1.7 | Real-World Applications | Practice |
| 19 | MA.8.NSO.1.X | Unit 1 Assessment | Assessment |

**Unit 2: Algebraic Reasoning - Part 1 (Lessons 20-23)**
Focus: MA.8.AR.1.X standards (Intro to equations)

| Lesson | Standard | Topic | Type |
|--------|----------|-------|------|
| 20 | MA.8.AR.1.1 | Applying Properties to Generate Equivalent Expressions | Intro |
| 21 | MA.8.AR.1.2 | Rewriting Algebraic Expressions | Practice |
| 22 | MA.8.AR.1.3 | Rewriting Formulas | Practice |
| 23 | MA.8.AR.1.X | Q1 Comprehensive Review | Assessment |

---

### Quarter 2 (Lessons 24-44)

**Unit 2 Continued: Algebraic Reasoning - Equations (Lessons 24-38)**
Focus: MA.8.AR.2.X standards

| Lesson | Standard | Topic | Type |
|--------|----------|-------|------|
| 24 | MA.8.AR.2.1 | Two-Step Equations - Introduction | Intro |
| 25 | MA.8.AR.2.1 | Two-Step Equations - Practice | Practice |
| 26 | MA.8.AR.2.1 | Combining Like Terms | Practice |
| 27 | MA.8.AR.2.1 | Distributive Property in Equations | Practice |
| 28 | MA.8.AR.2.1 | Variables on Both Sides | Practice |
| 29 | MA.8.AR.2.1 | Special Solutions (No Solution) | Practice |
| 30 | MA.8.AR.2.1 | Special Solutions (Infinite Solutions) | Practice |
| 31 | MA.8.AR.2.2 | One-Variable Inequalities - Introduction | Intro |
| 32 | MA.8.AR.2.2 | Solving Inequalities | Practice |
| 33 | MA.8.AR.2.2 | Graphing Inequalities on Number Line | Practice |
| 34 | MA.8.AR.2.3 | Writing Equations from Word Problems | Practice |
| 35 | MA.8.AR.2.4 | Systems of Equations - Introduction | Intro |
| 36 | MA.8.AR.2.4 | Solving Systems Graphically | Practice |
| 37 | MA.8.AR.2.4 | Solving Systems Algebraically | Practice |
| 38 | MA.8.AR.2.X | Unit 2 Assessment | Assessment |

**Unit 3: Functions - Part 1 (Lessons 39-44)**
Focus: MA.8.F.1.X standards

| Lesson | Standard | Topic | Type |
|--------|----------|-------|------|
| 39 | MA.8.F.1.1 | Understanding Functions | Intro |
| 40 | MA.8.F.1.1 | Function Notation | Practice |
| 41 | MA.8.F.1.2 | Comparing Functions | Practice |
| 42 | MA.8.F.1.3 | Interpreting Rate of Change | Practice |
| 43 | MA.8.F.1.3 | Initial Value | Practice |
| 44 | MA.8.F.1.X | Q2 Comprehensive Review | Assessment |

---

### Quarter 3 (Lessons 45-66)

**Unit 4: Linear Relationships (Lessons 45-54)**
Focus: MA.8.AR.3.X and MA.8.AR.4.X standards

| Lesson | Standard | Topic | Type |
|--------|----------|-------|------|
| 45 | MA.8.AR.3.1 | Slope of a Line | Intro |
| 46 | MA.8.AR.3.2 | Slope-Intercept Form (y = mx + b) | Practice |
| 47 | MA.8.AR.3.3 | Graphing Linear Equations | Practice |
| 48 | MA.8.AR.3.4 | Writing Linear Equations | Practice |
| 49 | MA.8.AR.3.5 | Parallel & Perpendicular Lines | Practice |
| 50 | MA.8.AR.4.1 | Graphing Systems of Linear Equations | Practice |
| 51 | MA.8.AR.4.2 | Solving Systems Algebraically | Practice |
| 52 | MA.8.AR.4.3 | Special Cases (No Solution, Infinite Solutions) | Practice |
| 53 | MA.8.AR.4.4 | Linear Inequalities - Two Variables | Practice |
| 54 | MA.8.AR.4.X | Unit 4 Assessment | Assessment |

**Unit 5: Geometric Reasoning (Lessons 55-66)**
Focus: MA.8.GR.1.X and MA.8.GR.2.X standards

| Lesson | Standard | Topic | Type |
|--------|----------|-------|------|
| 55 | MA.8.GR.1.1 | Translations | Intro |
| 56 | MA.8.GR.1.2 | Reflections | Practice |
| 57 | MA.8.GR.1.3 | Rotations | Practice |
| 58 | MA.8.GR.1.4 | Dilations | Practice |
| 59 | MA.8.GR.1.5 | Similarity | Practice |
| 60 | MA.8.GR.2.1 | Pythagorean Theorem - Introduction | Intro |
| 61 | MA.8.GR.2.2 | Applying Pythagorean Theorem | Practice |
| 62 | MA.8.GR.2.3 | Distance on Coordinate Plane | Practice |
| 63 | MA.8.GR.2.4 | Volume of Cylinders | Practice |
| 64 | MA.8.GR.2.5 | Volume of Cones | Practice |
| 65 | MA.8.GR.2.6 | Volume of Spheres | Practice |
| 66 | MA.8.GR.2.X | Q3 Comprehensive Review | Assessment |

---

### Quarter 4 (Lessons 67-87)

**Unit 6: Data Analysis and Probability (Lessons 67-79)**
Focus: MA.8.DP.1.X and MA.8.DP.2.X standards

| Lesson | Standard | Topic | Type |
|--------|----------|-------|------|
| 67 | MA.8.DP.1.1 | Scatter Plots - Introduction | Intro |
| 68 | MA.8.DP.1.2 | Line of Best Fit | Practice |
| 69 | MA.8.DP.1.3 | Interpreting Scatter Plots | Practice |
| 70 | MA.8.DP.1.4 | Analyzing Associations | Practice |
| 71 | MA.8.DP.2.1 | Bivariate Categorical Data - Two-Way Tables | Intro |
| 72 | MA.8.DP.2.2 | Relative Frequency | Practice |
| 73 | MA.8.DP.2.3 | Probability | Practice |
| 74 | MA.8.DP.2.4 | Experimental vs. Theoretical Probability | Practice |
| 75 | MA.8.DP.2.5 | Sample Spaces | Practice |
| 76 | MA.8.DP.2.6 | Compound Events | Practice |
| 77 | MA.8.DP.2.7 | Simulations | Practice |
| 78 | MA.8.DP.2.8 | Comparing Data Sets | Practice |
| 79 | MA.8.DP.2.X | Unit 6 Assessment | Assessment |

**Unit 7: Cumulative Review & Final Prep (Lessons 80-87)**

| Lesson | Standard | Topic | Type |
|--------|----------|-------|------|
| 80 | Review | Number Sense Review | Review |
| 81 | Review | Algebraic Reasoning Review | Review |
| 82 | Review | Functions Review | Review |
| 83 | Review | Linear Relationships Review | Review |
| 84 | Review | Geometry Review | Review |
| 85 | Review | Data & Probability Review | Review |
| 86 | Review | Comprehensive Practice Test | Assessment |
| 87 | Review | Final Celebration & Reflection | Celebration |

---

## Exercise Types by Standard Category

### Number Sense and Operations (MA.8.NSO.1.X)

**Exercise Types**:
1. **Number Classification**
   - Is √15 rational or irrational?
   - Which of these are perfect squares: [16, 20, 25, 30]?

2. **Approximation**
   - Approximate √50 to the nearest tenth
   - Between which two integers is √75?

3. **Number Line Placement**
   - Plot √20 on a number line
   - Order: π, 3.1, √10, 22/7

4. **Exponent Rules**
   - Simplify: 3^-2
   - Evaluate: (2^3)(2^4)
   - Simplify: (x^3)^2

5. **Scientific Notation**
   - Write 45,000,000 in scientific notation
   - Calculate: (3 × 10^5) × (2 × 10^3)

### Algebraic Reasoning - Equations (MA.8.AR.2.X)

**Exercise Types**:
1. **Two-Step Equations**
   - Solve: 3x + 5 = 20
   - Solve: 2x - 7 = 15

2. **Combining Like Terms**
   - Solve: 5x + 3x - 4 = 12
   - Simplify then solve: 2(x + 3) + 4x = 18

3. **Distributive Property**
   - Solve: 2(x + 5) = 20
   - Solve: -3(2x - 4) = 18

4. **Variables on Both Sides**
   - Solve: 3x + 5 = 2x + 12
   - Solve: 5x - 3 = 2x + 9

5. **Special Solutions**
   - Solve: 2x + 3 = 2x + 5 (no solution)
   - Solve: 3x + 6 = 3(x + 2) (infinite solutions)

6. **Inequalities**
   - Solve: 2x + 3 < 11
   - Graph: x ≥ -2

### Functions (MA.8.F.1.X)

**Exercise Types**:
1. **Function Evaluation**
   - If f(x) = 3x + 2, find f(5)
   - If g(x) = x^2 - 1, find g(-2)

2. **Function Notation**
   - Write "y = 5x + 3" using function notation
   - What does f(4) = 23 mean?

3. **Rate of Change**
   - Find the rate of change between (2, 5) and (4, 11)
   - A function has f(0) = 3 and f(2) = 7. What's the rate of change?

4. **Initial Value**
   - What is the initial value of f(x) = 2x + 5?
   - A phone plan costs $30 + $0.10 per minute. What's the initial value?

### Linear Relationships (MA.8.AR.3.X & MA.8.AR.4.X)

**Exercise Types**:
1. **Slope**
   - Find slope between (1, 2) and (3, 8)
   - What is the slope of y = 3x + 2?

2. **Graphing**
   - Graph: y = 2x + 1
   - Graph: y = -x + 3

3. **Writing Equations**
   - Write equation with slope 3 and y-intercept 2
   - Write equation passing through (2, 5) with slope 4

4. **Systems of Equations**
   - Solve by graphing: y = 2x + 1 and y = -x + 4
   - Solve algebraically: 2x + y = 7 and x - y = 2

### Geometric Reasoning (MA.8.GR.1.X & MA.8.GR.2.X)

**Exercise Types**:
1. **Transformations**
   - Translate point (2, 3) right 4 units, down 2
   - Reflect (3, 5) over the x-axis
   - Rotate (2, 0) 90° clockwise around origin

2. **Pythagorean Theorem**
   - Find the missing side: a = 3, b = 4, c = ?
   - Is triangle with sides 5, 12, 13 a right triangle?

3. **Volume**
   - Find volume of cylinder: r = 3, h = 10
   - Find volume of cone: r = 5, h = 12
   - Find volume of sphere: r = 6

### Data Analysis (MA.8.DP.1.X & MA.8.DP.2.X)

**Exercise Types**:
1. **Scatter Plots**
   - Does this scatter plot show positive or negative association?
   - Draw a line of best fit

2. **Two-Way Tables**
   - Complete a two-way table
   - Find relative frequency

3. **Probability**
   - What is P(rolling a 6)?
   - Find probability of compound event

---

## Implementation Template for Each Lesson

### Step 1: Add Lesson Metadata

In `/js/config/schedule.js`:

```javascript
lessonMetadata: {
  24: {
    name: 'Two-Step Equations - Introduction',
    standard: 'MA.8.AR.2.1',
    topic: 'Two-Step Equations',
    videoId: '0ackz7dJSYY',
    unit: 2,
    difficulty: 'easy',
    prerequisites: [20, 21, 22],
    estimatedTime: 25
  }
}
```

### Step 2: Add to Level Configs

In `/js/core/equations.js`:

```javascript
const levelConfigs = [
  // ... existing levels
  {
    id: 24,
    name: 'Two-Step Equations - Introduction',
    world: 'Algebra Castle',
    types: ['two-step-basic'],
    difficulty: 'easy',
    requiredMastery: 0.8,
    totalQuestions: 5,
    description: 'Learn to solve equations in two steps',
    unlockCondition: (progress) => progress.completedLevels.includes(23)
  }
];
```

### Step 3: Create Equation Generators

In `/js/core/equations.js`:

```javascript
// Generator for two-step equations
function generateTwoStepEquation() {
  const a = randomInt(2, 10);
  const b = randomInt(1, 20);
  const x = randomInt(1, 15);
  const c = a * x + b;

  return {
    display: `${a}x + ${b} = ${c}`,
    answer: x,
    type: 'two-step-basic',
    steps: [
      {
        action: 'subtract',
        value: b,
        explanation: `Subtract ${b} from both sides`,
        equation: `${a}x = ${c - b}`
      },
      {
        action: 'divide',
        value: a,
        explanation: `Divide both sides by ${a}`,
        equation: `x = ${x}`
      }
    ]
  };
}
```

### Step 4: Create Worked Examples

In `/js/features/animated-examples.js`:

```javascript
const examplesByLevel = {
  24: [
    {
      title: 'Example 1: Basic Two-Step',
      equation: '3x + 5 = 20',
      steps: [
        { step: 'Original equation', equation: '3x + 5 = 20' },
        { step: 'Subtract 5 from both sides', equation: '3x = 15' },
        { step: 'Divide both sides by 3', equation: 'x = 5' },
        { step: 'Answer', equation: 'x = 5', highlight: true }
      ]
    },
    {
      title: 'Example 2: Negative Numbers',
      equation: '2x - 7 = 15',
      steps: [
        { step: 'Original equation', equation: '2x - 7 = 15' },
        { step: 'Add 7 to both sides', equation: '2x = 22' },
        { step: 'Divide both sides by 2', equation: 'x = 11' },
        { step: 'Answer', equation: 'x = 11', highlight: true }
      ]
    }
  ]
};
```

### Step 5: Find YouTube Video

Search for appropriate video:
- Math with Mr. J
- Khan Academy
- The Organic Chemistry Tutor

Get video ID from URL:
`https://www.youtube.com/watch?v=ABC123` → `ABC123`

---

## Duolingo-Style Lesson Format

### Microlearning Principles

1. **Bite-sized chunks**: 5 questions per lesson, ~25 minutes total
2. **Instant feedback**: Immediate right/wrong + explanation
3. **Spaced repetition**: Review previous concepts
4. **Progressive difficulty**: Start easy, increase gradually
5. **Gamification**: XP, coins, streaks, achievements

### Question Flow

```
Question 1: Easy (confidence builder)
Question 2: Medium (build skills)
Question 3: Medium (reinforce)
Question 4: Hard (challenge)
Question 5: Mixed (assessment)
```

### Feedback Messages

**Correct**:
- "Perfect! You've got it!"
- "Excellent work! That's correct!"
- "Great job! Keep it up!"

**Incorrect**:
- "Not quite. Remember to [hint]"
- "Almost! Try [suggestion]"
- "Let's review: [explanation]"

---

## Lesson Quality Checklist

For each lesson, ensure:

- [ ] Metadata complete in schedule.js
- [ ] Level config added to equations.js
- [ ] Equation generator implemented
- [ ] 2-3 worked examples created
- [ ] YouTube video embedded
- [ ] All 5 question types work
- [ ] Difficulty progression appropriate
- [ ] XP/coins awarded correctly
- [ ] Achievement checks in place
- [ ] Mobile responsive
- [ ] Accessible (keyboard + screen reader)
- [ ] No console errors
- [ ] Tested in Chrome, Firefox, Safari

---

## Building Lessons Efficiently

### Batch Creation Strategy

**Week 1**: Build structure for all lessons in Unit 1
- Add all metadata
- Add all level configs
- Create all equation generators

**Week 2**: Create worked examples for all lessons in Unit 1
- 2-3 examples per lesson
- Step-by-step solutions

**Week 3**: Find and embed all videos for Unit 1
- Curate best educational videos
- Test all embeds work

**Week 4**: Test and polish Unit 1
- Play through all lessons
- Fix bugs
- Adjust difficulty

**Repeat for Units 2-7**

### Template Reuse

Many lessons share structure:

**Template: Introduction Lesson**
- Concept splash screen
- Video tutorial
- 3 examples
- 5 easy practice questions

**Template: Practice Lesson**
- Brief review
- 5 medium practice questions
- Adaptive difficulty

**Template: Assessment Lesson**
- No video
- 10 mixed questions
- Minimum 70% to pass

---

## Lesson Scheduling

All lessons scheduled in `/docs/lesson_calendar_B_days_2025-2026.json`.

Lessons unlock automatically based on date:
- Lesson 1: September 4, 2025
- Lesson 2: September 8, 2025
- ...
- Lesson 87: June 11, 2026

Students cannot skip ahead. Teacher can override with password.

---

## Next Steps for Agents

When tasked with building lessons:

1. Read this guide completely
2. Choose a unit to implement (start with Unit 1 or Unit 2)
3. Follow the implementation template
4. Test each lesson thoroughly
5. Submit for review
6. Iterate based on feedback

---

## Resources

**Florida BEST Standards**: `/docs/8th_BEST_math_standards_2025_PRE_ALGEBRA.json`
**Q1 Lesson Plans**: `/docs/Q1_8th_grade_detailed_lessons.json`
**Q2 Lesson Plans**: `/docs/Q2_8th_grade_detailed_lessons.json`
**Q3 Lesson Plans**: `/docs/Q3_8th_grade_detailed_lessons.json`
**Q4 Lesson Plans**: `/docs/Q4_8th_grade_detailed_lessons.json`
**Calendar**: `/docs/lesson_calendar_B_days_2025-2026.json`

---

## Common Questions

**Q: How long should each lesson take?**
A: 20-30 minutes. Short enough to complete in one sitting.

**Q: What if a student fails a lesson?**
A: They can retry immediately. No lockout. Progress saves.

**Q: Can students replay completed lessons?**
A: Yes! Replay for XP (reduced amount) and streak maintenance.

**Q: How do we handle students at different levels?**
A: Adaptive difficulty adjusts per student based on mastery %.

**Q: What about students who are ahead/behind?**
A: Date-based unlocking keeps class on same pace. Teacher can override.

---

## Success Metrics

Track these per lesson:
- Completion rate (% of students who complete)
- Average score (% correct answers)
- Average time spent
- Retry rate (% who replay)
- Drop-off point (which question students quit)

Use metrics to improve lessons iteratively.
