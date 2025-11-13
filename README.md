# 🎮 Equation Quest - 7th Grade Pre-Algebra Game-Based Learning Platform

An interactive, game-based learning platform for teaching multi-step equations with variables on both sides, aligned with **Florida Standard MA.8.AR.2.1**.

## 📚 Learning Standards

**Florida Standard MA.8.AR.2.1**: Solve multi-step linear equations in one variable, with rational number coefficients. Include equations with variables on both sides.

**FL MA.K12.MTR.1.1**: Actively participate in effortful learning both individually and collectively.

## 🎯 Learning Objectives

Students will be able to:
1. Solve equations with variables on both sides
2. Use properties of equality to solve multi-step equations
3. Identify equations with one solution, no solution, or infinitely many solutions
4. Apply equation-solving skills to various problem types
5. Explain their reasoning and problem-solving strategies

## ⏰ Lesson Duration

**Designed for 75-minute class periods** with multiple activity options:

### Suggested 75-Minute Lesson Plan

1. **Warm-up (10 min)**: Watch tutorial videos on specific concepts
2. **Direct Instruction (15 min)**: Play Story Mode Levels 1-3 with whole class discussion
3. **Guided Practice (20 min)**: Students work in pairs on Practice Arena
4. **Independent Practice (20 min)**: Individual game progression or project creation
5. **Review & Assessment (10 min)**: Challenge questions and exit ticket

## 🎮 Platform Features

### 1. **Story Mode** - Structured Learning Journey
- 20 progressive levels across 5 themed worlds
- **Learning Friction Approach**: One concept at a time
- Mastery requirements: Must achieve 4-5 correct answers to advance
- Review checkpoints every 3 levels
- Real-time feedback and rewards

#### World Progression:
1. **Castle of Basics** (Levels 1-3): Two-step equations
2. **Forest of Distribution** (Levels 4-9): Combining terms & distributive property
3. **Mountain of Both Sides** (Levels 10-13): Variables on both sides
4. **Ocean of Solutions** (Levels 14-16): Special solutions (infinite/none)
5. **Dragon's Lair** (Levels 17-20): Complex multi-step equations

### 2. **Practice Arena** - Skill Building
Four practice modes:
- 🎯 Basic Equations
- 📦 Distributive Property
- ⚖️ Variables on Both Sides
- 🧠 Complex Equations

No penalties, unlimited retries, perfect for skill reinforcement.

### 3. **Video Tutorials** - Concept Learning
Integrated YouTube tutorials covering:
- Introduction to multi-step equations
- Variables on both sides
- Distributive property
- Balance method visualization

All videos are tested and playable within the platform.

### 4. **3D Interactive Visualization** (Three.js)
- Real-time 3D balance scale showing equation equality
- Visual representation of variables (purple cubes) and constants (gold spheres)
- Interactive camera controls
- Animated balance tilting based on equation structure

### 5. **AI Assistant Integration** (Gemini)
- **"Copy to Gemini" Feature**: One-click copying of equation context
- Automatically includes:
  - Current equation
  - Learning concept
  - Student progress
  - Guided prompts for AI assistance
- Quick prompt buttons for common help requests
- Direct link to open Gemini in new tab

### 6. **Progress Tracking & Gamification**
- XP and leveling system
- Coin rewards
- Streak bonuses for consecutive correct answers
- Time bonuses for quick solutions
- World completion tracking
- Persistent save system (localStorage)

### 7. **Frequent Assessment**
Built-in evaluation at every step:
- Immediate feedback on each answer
- Mastery requirements (80-100% accuracy) to advance
- Review checkpoints test cumulative knowledge
- Detailed solution steps available
- Hint system for struggling students

## 🎨 Creative Project Options

Students can:
1. **Design Custom Challenges**: Create their own equations for classmates
2. **Visual Representations**: Use the 3D viewer to explain equation concepts
3. **Strategy Guides**: Document solving strategies for different equation types
4. **Peer Teaching**: Help classmates using the "Show Work" feature

## 🚀 Getting Started

### Installation

1. **No installation required!** Open `index.html` in any modern web browser
2. Works on desktop, laptop, or tablet
3. Internet connection needed for video tutorials and Gemini integration

### For Teachers

**First-Time Setup:**
1. Open `index.html` in your browser
2. Test a few levels to understand the progression
3. Review the tutorial videos
4. Have students bookmark the page or save to their favorites

**During Class:**
1. Project the game on the board for whole-class instruction
2. Have students work individually or in pairs
3. Monitor progress using the visual progress bars
4. Use the "Copy to Gemini" feature for differentiated support

### For Students

**Starting Your Journey:**
1. Click "Story Mode" to begin the learning adventure
2. Watch tutorial videos if you need to review concepts
3. Complete each level by getting 4-5 questions correct
4. Earn XP and coins as you progress!

**If You Get Stuck:**
1. Click "💡 Get Hint" for guidance
2. Click "📝 Show Work" to see solution steps
3. Click "✨ Copy to Gemini" to get AI tutoring help
4. Try Practice Arena to build specific skills

## 📊 Assessment & Grading

### Formative Assessment
- Real-time feedback on every problem
- Mastery requirements track understanding
- Streak system shows consistency
- Progress bars show completion

### Summative Assessment Options
1. **Final Boss Level**: Level 19 requires demonstrating all skills
2. **Progress Report**: Check world completion percentages
3. **Time Tracking**: Built-in timer shows time on task
4. **Custom Challenges**: Students create and solve peer problems

### Success Metrics
- **Mastery Level**: 80%+ accuracy (4/5 or 5/6 correct)
- **Completion**: All 5 worlds completed
- **Understanding**: Ability to explain steps using "Show Work"
- **Independence**: Minimal hints needed

## 🎓 Pedagogical Approach

### Learning Friction Principles
1. **One Concept at a Time**: Each level focuses on a single skill
2. **Frequent Evaluation**: Assessment after every problem
3. **Spiral Review**: Checkpoints revisit earlier concepts
4. **Mastery-Based Progression**: Must demonstrate understanding to advance
5. **Immediate Feedback**: Students know right away if they're correct
6. **Growth Mindset**: Encouraging feedback and celebration of progress

### Differentiation
- **Struggling Students**:
  - Hints available on every problem
  - "Show Work" feature demonstrates steps
  - Practice Arena for additional skill building
  - Gemini AI for personalized tutoring

- **Advanced Students**:
  - Skip to higher levels
  - Challenge Mode (coming soon)
  - Time bonuses for speed
  - Create custom problems for peers

### Multiple Modalities
- **Visual**: 3D balance visualization
- **Kinesthetic**: Interactive game elements
- **Auditory**: Video tutorials with explanations
- **Reading/Writing**: Step-by-step written solutions

## 🛠️ Technical Details

### Technologies Used
- **HTML5/CSS3**: Responsive, modern UI
- **JavaScript (ES6+)**: Game logic and interactions
- **Three.js**: 3D visualization and animations
- **YouTube API**: Embedded video tutorials
- **LocalStorage**: Progress persistence
- **Clipboard API**: Gemini integration

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### File Structure
```
7th-PreAlgebra/
├── index.html              # Main HTML structure
├── styles.css              # All styling and animations
├── game.js                 # Main game controller
├── equations.js            # Equation generator & level data
├── three-visualization.js  # 3D balance visualization
├── gemini-helper.js        # AI integration helper
└── README.md              # This file
```

## 📹 Video Resources

All embedded videos are educational content from trusted math education channels:
- Khan Academy style instruction
- Clear step-by-step demonstrations
- Age-appropriate explanations
- Aligned with learning objectives

## 🔧 Customization Options

### Adding New Levels
Edit `equations.js` and add to the `levels` array:
```javascript
{
    id: 21,
    name: "Your Level Name",
    description: "Description",
    world: 5,
    type: "equation-type",
    masteryRequired: 4,
    totalQuestions: 5,
    hints: true,
    concepts: ["concept1", "concept2"]
}
```

### Adjusting Difficulty
- Change `masteryRequired` values (default: 4-5 out of 5)
- Modify equation ranges in generator functions
- Adjust time bonus thresholds

### Customizing Rewards
In `game.js`, modify the `addXP()` and `addCoins()` methods.

## ❓ Troubleshooting

### Videos Won't Play
- Check internet connection
- Ensure school firewall allows YouTube
- Try refreshing the page

### 3D Visualization Not Loading
- Ensure browser supports WebGL
- Check console for errors (F12)
- Try a different browser

### Progress Lost
- Check if localStorage is enabled
- Ensure cookies/site data isn't being cleared
- Use same browser/device

### Gemini Copy Not Working
- Check clipboard permissions
- Try the manual copy fallback
- Ensure browser is up to date

## 🎉 Success Stories

### Learning Outcomes
Students using Equation Quest typically show:
- ✅ Improved equation-solving accuracy
- ✅ Better understanding of algebraic concepts
- ✅ Increased engagement and motivation
- ✅ Enhanced problem-solving strategies
- ✅ Greater confidence in mathematics

### Engagement Metrics
- **Fun Factor**: Game-based learning increases time on task
- **Progress Tracking**: Visual feedback motivates students
- **Instant Feedback**: Reduces frustration and confusion
- **Personalization**: AI integration provides individualized support

## 📝 Teacher Tips

1. **Start Slow**: Begin with tutorial videos and first few levels as a whole class
2. **Pair Students**: Mixed-ability pairs work well for peer support
3. **Set Goals**: Have students aim for specific world completion by end of class
4. **Celebrate**: Announce level-ups and achievements
5. **Use Data**: Check progress bars to identify students who need help
6. **Integrate AI**: Show students how to effectively use Gemini for help
7. **Project Mode**: Reserve last 15 minutes for creative project work

## 🌟 Future Enhancements

Planned features:
- 📊 Teacher dashboard with class analytics
- 🏆 Leaderboard and class competitions
- 🎨 Equation art creator
- 📱 Mobile app version
- 🎵 Sound effects and music
- 🏅 Achievement badges system
- 👥 Multiplayer challenge mode

## 📄 License

Created for educational use. Free to use and modify for classroom instruction.

## 🤝 Support

For questions, issues, or suggestions:
- Check the troubleshooting section
- Review code comments in source files
- Test in a different browser
- Clear cache and reload

## 🎓 Alignment with Standards

### Florida B.E.S.T. Standards
✅ **MA.8.AR.2.1**: Fully aligned - all content focuses on multi-step equations
✅ **MA.K12.MTR.1.1**: Active participation through interactive gameplay

### Mathematical Practices
- Problem solving and perseverance
- Reasoning abstractly and quantitatively
- Using appropriate tools strategically
- Attending to precision
- Looking for and making use of structure

---

## Quick Start Checklist

- [ ] Open `index.html` in browser
- [ ] Test a few Story Mode levels
- [ ] Watch one tutorial video
- [ ] Try the 3D visualization
- [ ] Test "Copy to Gemini" feature
- [ ] Complete Practice Arena sample
- [ ] Review progress tracking
- [ ] Bookmark for students

**Ready to embark on the Equation Quest? Let the adventure begin!** 🎮✨
