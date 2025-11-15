# Implementation Documentation

## Purpose

This directory contains **comprehensive technical documentation** for building features on the 8th Grade Pre-Algebra platform. These docs are designed for **AI agents and developers** to understand and implement the system.

**IMPORTANT**: These are NOT configuration files for Claude Code agents. These are reference documents that explain HOW to build the platform.

---

## Documentation Files

### 1. PROJECT-OVERVIEW.md
**Read this first!**

High-level overview of the entire project:
- What we're building (Duolingo-style math platform)
- Why we're building it (gamified learning for 8th graders)
- Who it's for (Centner Academy students)
- When it's needed (2025-2026 school year, 87 B-day lessons)
- How it works (Vanilla JS + Supabase + Netlify)
- **CRITICAL**: NO competitive features, NO leaderboards

**When to read**: Start here to understand the big picture

---

### 2. ARCHITECTURE.md
**Read this second!**

Technical architecture and codebase structure:
- Frontend architecture (Vanilla JS module pattern)
- Backend architecture (Supabase PostgreSQL + Auth)
- File organization
- Data flow
- Script load order
- Module patterns
- Security best practices

**When to read**: Before writing any code, to understand how everything fits together

---

### 3. FEATURES.md
**Read this third!**

Complete feature specifications:
- XP system
- Coins system
- Daily streaks (personal, NOT competitive)
- Achievement badges
- Adaptive difficulty
- Progress tracking
- Lesson UI components
- Video tutorials
- Interactive step solver

**When to read**: Before building a feature, to understand requirements and acceptance criteria

---

### 4. SUPABASE-SETUP.md
**Read this when setting up database**

Complete database architecture:
- All table schemas (users, lessons, progress, achievements, streaks)
- Row Level Security policies
- Supabase Auth configuration
- Client integration code
- Migration strategies
- Database functions

**When to read**: When setting up the backend or implementing data persistence

---

### 5. BUILD-GUIDE.md
**Read this when coding**

Step-by-step implementation patterns:
- Component building pattern
- Supabase integration examples
- Frontend component structure
- Netlify Functions
- CSS patterns (Atomic CSS)
- Error handling
- Testing checklist
- Git workflow

**When to read**: While actively building features

---

### 6. TESTING-GUIDE.md
**Read this before testing**

Comprehensive testing strategy:
- Unit tests (Playwright)
- Integration tests
- End-to-end tests
- Database tests
- Visual regression tests
- Accessibility tests
- Performance tests
- Manual testing checklist

**When to read**: When writing tests or before deploying

---

### 7. DEPLOYMENT-GUIDE.md
**Read this when deploying**

Production deployment instructions:
- Supabase production setup
- Netlify configuration
- Environment variables
- Deploy workflow
- Database migrations
- Rollback procedures
- Monitoring and alerts
- Security checklist

**When to read**: When deploying to staging or production

---

### 8. LESSON-IMPLEMENTATION.md
**Read this when building lessons**

How to build all 87 lessons:
- Complete course outline (Q1-Q4)
- Lesson structure (Duolingo-style microlearning)
- Exercise types by standard (MA.8.XXX)
- Implementation template
- Equation generators
- Worked examples
- Quality checklist
- Batch creation strategy

**When to read**: When building any of the 87 lessons

---

## Reading Order for New Agents

### First-Time Setup
1. **PROJECT-OVERVIEW.md** - Understand the vision
2. **ARCHITECTURE.md** - Understand the structure
3. **SUPABASE-SETUP.md** - Set up the database
4. **BUILD-GUIDE.md** - Learn how to code

### Building a Feature
1. **FEATURES.md** - Read feature specification
2. **BUILD-GUIDE.md** - Follow implementation patterns
3. **TESTING-GUIDE.md** - Write and run tests
4. **DEPLOYMENT-GUIDE.md** - Deploy to production

### Building Lessons
1. **LESSON-IMPLEMENTATION.md** - Complete lesson guide
2. **FEATURES.md** - Understand lesson UI requirements
3. **BUILD-GUIDE.md** - Implementation details
4. **TESTING-GUIDE.md** - Test lessons work

---

## Quick Reference

### Key Constraints

**NO COMPETITIVE FEATURES**:
- No leaderboards
- No class rankings
- No comparing students to each other
- Progress is PRIVATE and PERSONAL

**Technology Stack**:
- Frontend: Vanilla JS + Three.js
- Backend: Supabase (PostgreSQL + Auth)
- Deployment: Netlify
- No frameworks, minimal dependencies

**Course Details**:
- 87 lessons total (one per B-day)
- 2025-2026 school year
- Florida BEST Standards (MA.8.XXX)
- Course #1205070: M/J Grade 8 Pre-Algebra

---

## Common Tasks

### "I want to add XP for completing lessons"
→ Read: **FEATURES.md** (XP System), **BUILD-GUIDE.md** (XP implementation example), **SUPABASE-SETUP.md** (user_profiles table)

### "I want to build Lesson 35"
→ Read: **LESSON-IMPLEMENTATION.md** (complete guide), **BUILD-GUIDE.md** (equation generators)

### "I want to add authentication"
→ Read: **SUPABASE-SETUP.md** (Auth setup), **BUILD-GUIDE.md** (Supabase integration), **FEATURES.md** (User Authentication)

### "I want to deploy to production"
→ Read: **DEPLOYMENT-GUIDE.md** (complete deployment process)

### "I want to test the progress tracking"
→ Read: **TESTING-GUIDE.md** (database tests), **BUILD-GUIDE.md** (Supabase patterns)

---

## File Locations

All implementation docs are in:
```
/Users/mattysquarzoni/Documents/7th-PreAlgebra/docs/implementation/
```

Supporting data files:
```
/Users/mattysquarzoni/Documents/7th-PreAlgebra/docs/
├── 8th_BEST_math_standards_2025_PRE_ALGEBRA.json
├── Q1_8th_grade_detailed_lessons.json
├── Q2_8th_grade_detailed_lessons.json
├── Q3_8th_grade_detailed_lessons.json
├── Q4_8th_grade_detailed_lessons.json
└── lesson_calendar_B_days_2025-2026.json
```

---

## What These Docs Are NOT

These are **NOT**:
- Claude Code agent configuration files
- Automatically executed instructions
- Chat prompts
- Agent tools or skills

These **ARE**:
- Reference documentation
- Technical specifications
- Implementation guides
- Best practices and patterns

**How to use**: Read them like you would any technical documentation. They inform your implementation decisions.

---

## Contributing

When updating these docs:

1. Keep information **accurate** and **actionable**
2. Use **specific examples** with code snippets
3. **Cross-reference** between docs
4. Update **all relevant docs** when making changes
5. Keep **consistent formatting**

---

## Questions?

If you're an agent building a feature and something is unclear:

1. Search across all docs (Ctrl+F your topic)
2. Check related docs (cross-references)
3. Look at existing code for patterns
4. Ask the user (teacher) for clarification
5. Document your decision in code comments

---

## Success Criteria

You'll know these docs are working if:

- Agents can build features **without repeated questions**
- Implementation is **consistent** across features
- Code follows established **patterns**
- Features work **correctly** on first try
- Tests **pass** consistently

---

## Document Maintenance

Update these docs when:

- Adding new features
- Changing architecture
- Updating dependencies
- Discovering better patterns
- Fixing bugs that should be prevented

Keep docs in sync with code!

---

## Credits

Created: January 13, 2025
For: Centner Academy 8th Grade Pre-Algebra (Course #1205070)
Platform: Duolingo-style gamified math learning
Year: 2025-2026

---

**Remember**: These docs exist to help you build better, faster, and more consistently. Use them!
