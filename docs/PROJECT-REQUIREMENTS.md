# 7th Grade Pre-Algebra Platform - Project Requirements

## 🎯 Project Vision

Create a **bulletproof, kid-friendly, engaging** educational platform that helps 7th-grade students master pre-algebra concepts through interactive, game-based learning aligned with Florida B.E.S.T. Standards.

### Core Principles
1. **Simple & Reliable**: Keep code simple - HTML, CSS, JavaScript (Python serverless if needed)
2. **Kid-Friendly**: Fun, engaging UI that students actually want to use
3. **Standards-Aligned**: Every lesson maps to Florida Standards
4. **Bulletproof**: Thoroughly tested, no breaking changes
5. **Maintainable**: Well-organized, documented, easy to update

---

## 📋 Platform Overview

### Target Audience
- **Primary**: 7th-grade pre-algebra students (ages 12-13)
- **Secondary**: Math teachers implementing Florida B.E.S.T. Standards

### Learning Approach
- Game-based, progressive difficulty
- Immediate feedback and mastery-based progression
- Multiple learning modalities (visual, interactive, video)
- AI-assisted tutoring through Gemini integration

---

## 🏗️ Technical Stack

### Frontend
- **HTML5**: Semantic, accessible markup
- **CSS3**: Modern styling with Flexbox/Grid, animations
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
- **Three.js**: 3D visualization of equation balance

### Backend / Hosting
- **Netlify**: Static site hosting with CI/CD
- **Netlify Functions**: Serverless functions for AI API calls
- **Environment Variables**: Secure API key management

### External Services
- **Google Gemini AI**: Student assistance and tutoring
- **YouTube API**: Embedded educational videos
- **LocalStorage**: Client-side progress persistence

### Development Tools
- **Claude Code**: AI-assisted development with specialized subagents
- **Git**: Version control
- **Chrome DevTools / Playwright**: Testing and debugging

---

## 📁 Project Structure

```
7th-PreAlgebra/
├── index.html                    # Main application entry point
├── netlify.toml                  # Netlify configuration
├── .env                          # Environment variables (gitignored)
├── .gitignore
│
├── /js                           # JavaScript organized by purpose
│   ├── /core                     # Core game logic
│   │   ├── game.js               # Main game controller
│   │   └── equations.js          # Equation generation & level data
│   ├── /features                 # Specific features
│   │   ├── adaptive-learning.js  # Personalized learning paths
│   │   ├── animated-examples.js  # Animated equation solutions
│   │   ├── learning-workflow.js  # Learning flow management
│   │   ├── student-report.js     # Progress reports
│   │   ├── three-visualization.js # 3D balance visualization
│   │   └── word-problem-generator.js # Word problem creation
│   └── /utils                    # Utility functions
│       ├── gemini-helper.js      # AI integration utilities
│       └── step-solver.js        # Step-by-step solution logic
│
├── /css                          # Stylesheets
│   └── styles.css                # All styles (organized internally)
│
├── /assets                       # Static assets
│   └── /images                   # Images, icons, social cards
│
├── /functions                    # Netlify serverless functions
│   └── gemini-api.js             # Gemini AI API proxy (to be created)
│
├── /docs                         # Documentation
│   ├── PROJECT-REQUIREMENTS.md   # This file
│   ├── README.md                 # User-facing documentation
│   ├── CURRICULUM-STANDARDS.md   # Florida Standards mapping
│   └── [other docs]
│
└── /.claude                      # Claude Code configuration
    ├── settings.local.json       # Local Claude settings
    └── /agents                   # Specialized subagents
        ├── build-agent.md
        ├── analyze-agent.md
        ├── frontend-agent.md
        ├── test-agent.md
        ├── ui-update-agent.md
        ├── lesson-creator-agent.md
        └── devtools-agent.md
```

---

## 🎮 Core Features

### 1. Story Mode (Main Learning Path)
- **Purpose**: Structured, progressive learning journey
- **Structure**: 20 levels across 5 themed worlds
- **Mastery-Based**: Must achieve 80%+ accuracy to advance
- **Progress Tracking**: XP, coins, level progression
- **Checkpoints**: Review levels every 3-4 levels

**Worlds:**
1. Castle of Basics (Levels 1-3): Two-step equations
2. Forest of Distribution (Levels 4-9): Distributive property
3. Mountain of Both Sides (Levels 10-13): Variables on both sides
4. Ocean of Solutions (Levels 14-16): Special solutions
5. Dragon's Lair (Levels 17-20): Complex multi-step equations

### 2. Practice Arena
- **Purpose**: Skill reinforcement without pressure
- **Modes**: 4 practice types (basic, distributive, both sides, complex)
- **Features**: Unlimited retries, no penalties, hints available

### 3. Video Tutorials
- **Purpose**: Visual learning for different learning styles
- **Integration**: Embedded YouTube videos
- **Content**: Step-by-step explanations of key concepts

### 4. 3D Interactive Visualization
- **Purpose**: Visual representation of equation balance
- **Technology**: Three.js
- **Features**: Interactive camera, animated balance, real-time updates

### 5. AI Tutoring Integration (Gemini)
- **Purpose**: Personalized help when students get stuck
- **Implementation**: "Copy to Gemini" feature
- **Context**: Automatically includes equation, concept, progress
- **Future**: Direct API integration via serverless function

### 6. Progress Tracking & Gamification
- **XP System**: Earn experience for correct answers
- **Coins**: Reward currency (future: unlock features)
- **Streaks**: Bonus for consecutive correct answers
- **Level System**: Visual progression through worlds
- **Time Bonuses**: Rewards for quick solving

### 7. Florida Standards Navigation (To Be Built)
- **Purpose**: Organize lessons by date and standard
- **Structure**: Side navigation with calendar integration
- **Features**:
  - View lessons by date
  - See which standards are covered
  - Track curriculum pacing
  - Jump to specific standard lessons

---

## 📚 Florida Standards Alignment

### Current Coverage
- **MA.8.AR.2.1**: Multi-step linear equations in one variable
- **MA.K12.MTR.1.1**: Active effortful learning

### Expansion Plan
As additional standards are added, they will be:
1. Documented in CURRICULUM-STANDARDS.md
2. Added to side navigation with target dates
3. Integrated into Story Mode or new learning paths
4. Tagged with prerequisites and follow-up standards

---

## 🔧 Serverless Functions Architecture

### Purpose
- Secure API calls to external services (Gemini AI)
- Keep API keys server-side, never exposed to client
- Simple, reliable, minimal complexity

### Structure
```javascript
// /functions/gemini-api.js
exports.handler = async (event) => {
  // 1. Validate request
  // 2. Extract equation context from body
  // 3. Call Gemini API with API key from env
  // 4. Return response
  // Keep it simple - no complex logic
};
```

### Netlify Configuration
```toml
# netlify.toml
[functions]
  directory = "functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

---

## 🎨 Design Philosophy

### User Experience
1. **Fun First**: Engaging visuals, smooth animations, rewarding feedback
2. **Clear Feedback**: Students always know if they're correct/incorrect
3. **Progressive Difficulty**: One concept at a time, build gradually
4. **Accessible**: High contrast, readable fonts, keyboard navigation
5. **Responsive**: Works on tablets and desktops (primary use cases)

### Code Quality
1. **Readable**: Clear variable names, commented complex logic
2. **Modular**: Organized into logical files by feature
3. **DRY**: Don't repeat yourself - reusable functions
4. **Tested**: Every feature tested before deployment
5. **Documented**: Code comments and README for future maintainers

### Performance
1. **Fast Load**: Minimize asset sizes, lazy load when possible
2. **Smooth Animations**: 60fps target, use CSS transforms
3. **Efficient JS**: Avoid unnecessary computations, debounce events
4. **Caching**: Leverage browser caching for static assets

---

## 🚀 Development Workflow

### Using Claude Code Subagents

The project includes 7 specialized subagents to help with development:

1. **build-agent**: Build and deployment verification
2. **analyze-agent**: Code quality and security analysis
3. **frontend-agent**: HTML/CSS/JS UI development
4. **test-agent**: Feature testing and bug finding
5. **ui-update-agent**: Incremental UI improvements
6. **lesson-creator-agent**: New lesson and standard integration
7. **devtools-agent**: Browser testing and debugging

**Usage:**
```bash
# Invoke specific agent
> Use the test-agent to verify all features work

# Let Claude choose appropriate agent
> Fix the visual bug in the progress bar
```

### Git Workflow
1. **Main Branch**: Production-ready code only
2. **Commit Often**: Small, logical commits with clear messages
3. **Test Before Commit**: Use test-agent to verify changes
4. **Descriptive Messages**: "Fix equation validation in level 10"

### Deployment Process
1. **Local Testing**: Test changes locally first
2. **Build Verification**: Run build-agent to check for issues
3. **Git Push**: Push to GitHub
4. **Auto Deploy**: Netlify auto-deploys from main branch
5. **Production Testing**: Verify on live site

---

## 📊 Quality Assurance

### Testing Strategy
1. **Manual Testing**: Click through features, try edge cases
2. **Automated Testing**: Use devtools-agent with Playwright
3. **Browser Testing**: Chrome, Firefox, Safari, Edge
4. **Device Testing**: Desktop, laptop, tablet sizes
5. **Student Testing**: Get feedback from actual 7th graders

### Quality Checklist
- [ ] All features work as expected
- [ ] No console errors or warnings
- [ ] Responsive on tablet and desktop
- [ ] Fast load times (< 2 seconds)
- [ ] Accessible (keyboard nav, screen readers)
- [ ] Cross-browser compatible
- [ ] Progress saves correctly
- [ ] AI integration works
- [ ] Videos play properly
- [ ] 3D visualization renders

### Security Checklist
- [ ] No exposed API keys in client code
- [ ] Environment variables properly secured
- [ ] No XSS vulnerabilities
- [ ] Input validation on all forms
- [ ] HTTPS enforced
- [ ] CSP headers configured (if needed)

---

## 🎓 Lesson Creation Workflow

### Adding a New Florida Standard

When you receive a new Florida Standard to implement:

1. **Provide to lesson-creator-agent:**
   - Florida Standard code (e.g., MA.8.AR.2.2)
   - Target implementation date
   - Any specific requirements

2. **Agent will create:**
   - Lesson plan with learning objectives
   - Progressive levels (easy → hard)
   - Practice problems with solutions
   - Hints system
   - Real-world connections
   - Assessment questions

3. **Integration steps:**
   - Add to side navigation with date
   - Update CURRICULUM-STANDARDS.md
   - Link to prerequisite lessons
   - Test with test-agent
   - Deploy to production

### Lesson Quality Standards
- Aligned with Florida Standard
- Age-appropriate language (7th grade)
- Real-world relevance
- Progressive difficulty (scaffolding)
- Complete hint and solution system
- Estimated 75-minute duration
- Fun and engaging presentation

---

## 🔮 Future Enhancements

### Short-Term (Next 1-2 Months)
- [x] Reorganize project structure (DONE)
- [x] Create Claude Code subagents (DONE)
- [ ] Implement Netlify serverless function for Gemini
- [ ] Build Florida Standards side navigation
- [ ] Add next 5 Florida Standards with target dates
- [ ] Implement saved game slots (multiple students)
- [ ] Add teacher dashboard (basic analytics)

### Medium-Term (3-6 Months)
- [ ] Achievement badge system
- [ ] Custom challenge creator for students
- [ ] Peer-to-peer problem sharing
- [ ] Enhanced analytics and reporting
- [ ] Mobile app (Progressive Web App)
- [ ] Sound effects and background music (toggleable)

### Long-Term (6-12 Months)
- [ ] Multiplayer challenge mode
- [ ] Leaderboards (class and global)
- [ ] Equation art creator
- [ ] Additional grade levels (8th grade algebra)
- [ ] Spanish language version
- [ ] Integration with LMS (Canvas, Google Classroom)

---

## 🤝 Collaboration Guidelines

### For Developers
- Keep code simple and readable
- Test thoroughly before committing
- Document complex logic
- Use semantic commits
- Maintain atomic design principles

### For Educators
- Provide feedback on lesson effectiveness
- Suggest real-world examples
- Identify confusing explanations
- Test with actual students
- Report bugs and usability issues

---

## 📝 Documentation Standards

### Code Documentation
```javascript
/**
 * Generate a multi-step equation with variables on both sides
 * @param {number} difficulty - 1 (easy) to 5 (hard)
 * @param {boolean} includeDecimals - Allow decimal coefficients
 * @returns {Object} - {equation, solution, steps}
 */
function generateEquation(difficulty, includeDecimals = false) {
  // Implementation
}
```

### File Headers
```javascript
/**
 * FILENAME: adaptive-learning.js
 * PURPOSE: Personalized learning path adjustments based on student performance
 * DEPENDENCIES: game.js, equations.js, localStorage
 * AUTHOR: [Your Name]
 * LAST UPDATED: 2025-01-13
 */
```

### README Updates
- Keep README.md user-facing (for teachers/students)
- Technical details go in PROJECT-REQUIREMENTS.md
- Update both when adding major features

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Gemini Integration**: Currently client-side clipboard copy (needs serverless function)
2. **Progress Tracking**: LocalStorage only (no cloud sync)
3. **Mobile**: Not optimized for phones (tablets/desktop only)
4. **Accessibility**: Needs WCAG audit
5. **Browser Support**: Requires modern browsers (2020+)

### Planned Fixes
- Priority 1: Serverless Gemini function (security)
- Priority 2: Florida Standards navigation (teacher request)
- Priority 3: Enhanced progress tracking (cloud sync)
- Priority 4: Mobile optimization (if demand exists)

---

## 📞 Support & Contact

### For Students
- Use "Copy to Gemini" for help with problems
- Ask your teacher for guidance
- Check tutorial videos for concept review

### For Teachers
- Review documentation in /docs folder
- Test features before assigning
- Provide feedback for improvements

### For Developers
- Use Claude Code subagents for assistance
- Check PROJECT-REQUIREMENTS.md for architecture
- Review code comments for implementation details

---

## 📄 License & Usage

**Educational Use**: Free to use and modify for classroom instruction.
**Attribution**: Please maintain credits and documentation.
**Commercial Use**: Contact for licensing.

---

## ✅ Success Metrics

### Student Success
- 80%+ of students complete at least 3 worlds
- Average accuracy improves over time (tracked)
- Students request to use platform (engagement)
- Standardized test scores improve (if tracked)

### Technical Success
- 99%+ uptime on Netlify
- < 2 second page load
- Zero critical bugs reported
- No security vulnerabilities
- Cross-browser compatibility maintained

### Educational Success
- Aligned with 100% of covered Florida Standards
- Teachers report positive outcomes
- Students demonstrate mastery on assessments
- Reduces time needed for equation instruction

---

## 🎯 Project Status

**Current Version**: 1.0 (Reorganized Structure)
**Last Updated**: November 13, 2025
**Status**: Production (Active Development)
**Next Milestone**: Florida Standards Navigation + Serverless Functions

---

**Built with ❤️ for 7th grade students who deserve engaging, effective math education.**
