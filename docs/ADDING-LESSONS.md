# How to Add New Lessons to Your Pre-Algebra Platform

This guide will help you add new lessons, levels, and concepts to your learning platform.

## 🎯 Quick Overview

Your platform is fully modular! Adding new lessons is easy:
1. Add level definitions to `equations.js`
2. Add equation generation logic (if new type)
3. Add video resources to `learning-workflow.js`
4. Everything else happens automatically!

---

## 📚 Step 1: Add New Levels to equations.js

Open `equations.js` and find the `this.levels` array (around line 7).

### Level Structure:

```javascript
{
    id: 21,                              // Unique ID (next available number)
    name: "Your Lesson Name",            // Student-facing name
    description: "What students learn",   // Brief description
    world: 5,                            // Which world (1-5)
    type: "your-equation-type",          // Equation type (see below)
    masteryRequired: 4,                  // Correct answers needed (out of totalQuestions)
    totalQuestions: 5,                   // How many questions to ask
    hints: true,                         // Allow hints?
    concepts: ["your concept names"]     // For learning workflow
}
```

### Example: Adding a Fractions Lesson

```javascript
// Add to the levels array in equations.js around line 150
{
    id: 21,
    name: "Fraction Fundamentals",
    description: "Solve equations with fractions: x/2 + 3 = 7",
    world: 4,
    type: "fractions-basic",
    masteryRequired: 4,
    totalQuestions: 5,
    hints: true,
    concepts: ["fractions", "division"]
},
{
    id: 22,
    name: "Fraction Practice",
    description: "More practice with fractions",
    world: 4,
    type: "fractions-basic",
    masteryRequired: 4,
    totalQuestions: 5,
    hints: true,
    concepts: ["fractions"]
},
{
    id: 23,
    name: "Fraction Challenge",
    description: "Complex fraction equations",
    world: 4,
    type: "fractions-advanced",
    masteryRequired: 5,
    totalQuestions: 6,
    hints: false,
    concepts: ["fractions", "multiple steps"]
}
```

---

## 🔢 Step 2: Add Equation Generation Logic

### If using an existing equation type:
**Skip this step!** Existing types:
- `two-step-basic`
- `combining-terms`
- `distributive-intro`
- `distributive-practice`
- `both-sides-basic`
- `both-sides-practice`
- `complex-mixed`
- `review-checkpoint-*`

### If creating a NEW equation type:

Find the `generateEquation()` method in `equations.js` (around line 170) and add your case:

```javascript
generateEquation(type) {
    switch (type) {
        // ... existing cases ...

        case 'fractions-basic':
            return this.generateFractionBasic();

        case 'fractions-advanced':
            return this.generateFractionAdvanced();

        default:
            return this.generateTwoStepBasic();
    }
}
```

Then add your generation method at the bottom of the class:

```javascript
generateFractionBasic() {
    // Your logic here
    const denominator = this.randomInt(2, 5); // Random denominator 2-5
    const answer = this.randomInt(2, 10);     // Answer
    const constant = this.randomInt(1, 8);    // Constant
    const result = (answer / denominator) + constant;

    const equation = `x/${denominator} + ${constant} = ${result}`;
    const hint = `First, subtract ${constant} from both sides`;

    return {
        equation: equation,
        answer: answer,
        type: 'fractions-basic',
        hint: hint,
        steps: [
            `Subtract ${constant} from both sides`,
            `Multiply both sides by ${denominator}`
        ]
    };
}
```

---

## 🎥 Step 3: Add Video Resources (Optional)

If you want videos for your new concept, add them to `learning-workflow.js` (around line 8):

```javascript
this.conceptMap = {
    'two-step-basic': 'two-step-basic',
    'combining-terms': 'combining-like-terms',
    'distributive-intro': 'distributive-property',
    'fractions-basic': 'fractions-intro',  // ADD YOUR CONCEPT HERE
    // ... more mappings
};

this.videoResources = {
    'two-step-basic': {
        videoUrl: 'https://www.youtube.com/embed/0ackz7dJSYY',
        title: 'Two-Step Equations'
    },
    'fractions-intro': {  // ADD YOUR VIDEO HERE
        videoUrl: 'https://www.youtube.com/embed/YOUR_VIDEO_ID',
        title: 'Solving Equations with Fractions',
        description: 'Learn how to solve equations involving fractions'
    }
};
```

### Finding Good Educational Videos:

1. Search YouTube for: "7th grade [your topic] math"
2. Look for channels: Math with Mr. J, Khan Academy, Math is Simple
3. Copy the video ID from the URL
   - Example: `https://www.youtube.com/watch?v=ABC123XYZ`
   - Use: `https://www.youtube.com/embed/ABC123XYZ`

---

## 🌍 Step 4: Update World Progress (Optional)

If adding a new world, update the world info in `game.js` (around line 544):

```javascript
const worldData = {
    1: {icon: '🏰', name: 'Castle of Basics'},
    2: {icon: '🌲', name: 'Forest of Distribution'},
    3: {icon: '⛰️', name: 'Mountain of Both Sides'},
    4: {icon: '🌊', name: 'Ocean of Fractions'},      // EXAMPLE
    5: {icon: '🐉', name: 'Dragon\'s Lair'}
};
```

---

## ✅ Testing Your New Lesson

1. **Save all files**
2. **Deploy to Netlify:**
   ```bash
   git add .
   git commit -m "Add [your lesson name] lessons"
   git push
   ```
   OR use Netlify CLI:
   ```bash
   netlify deploy --prod
   ```

3. **Test the new lessons:**
   - Visit your site: https://7th-grade-pre-algebra.netlify.app
   - Progress through levels to reach your new lesson
   - Verify equations generate correctly
   - Check that word problems work with the new type

---

## 🎨 Adaptive Learning Integration

**Good news:** Your new lessons automatically work with adaptive learning!

The system will:
- ✅ Adjust difficulty (easy/medium/hard) based on performance
- ✅ Generate word problems for your equation type
- ✅ Track mastery (3-8 questions depending on skill)
- ✅ Show progress and difficulty badges

---

## 📋 Complete Example: Adding a Decimals Unit

### 1. Add to equations.js:

```javascript
// Around line 150, add 3 levels:
{
    id: 21,
    name: "Decimal Discovery",
    description: "Solve equations with decimals: 0.5x + 2.3 = 4.8",
    world: 4,
    type: "decimals-basic",
    masteryRequired: 4,
    totalQuestions: 5,
    hints: true,
    concepts: ["decimals"]
},
{
    id: 22,
    name: "Decimal Precision",
    description: "More complex decimal equations",
    world: 4,
    type: "decimals-advanced",
    masteryRequired: 4,
    totalQuestions: 5,
    hints: true,
    concepts: ["decimals", "rounding"]
},
{
    id: 23,
    name: "Decimal Checkpoint",
    description: "Prove your decimal mastery",
    world: 4,
    type: "decimals-review",
    masteryRequired: 5,
    totalQuestions: 6,
    hints: false,
    concepts: ["decimals review"]
}

// Around line 170, add generation:
case 'decimals-basic':
    return this.generateDecimalBasic();

// At end of class (around line 500):
generateDecimalBasic() {
    const coefficient = this.randomDecimal(0.1, 2.0, 1); // 0.1 to 2.0, 1 decimal place
    const constant = this.randomDecimal(1.0, 10.0, 1);
    const answer = this.randomInt(1, 20);
    const result = parseFloat((coefficient * answer + constant).toFixed(1));

    return {
        equation: `${coefficient}x + ${constant} = ${result}`,
        answer: answer,
        type: 'decimals-basic',
        hint: `First, subtract ${constant} from both sides`,
        steps: [
            `Subtract ${constant} from both sides`,
            `Divide both sides by ${coefficient}`
        ]
    };
}

// Helper method (if not already present):
randomDecimal(min, max, decimals) {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
}
```

### 2. Add to learning-workflow.js:

```javascript
this.conceptMap = {
    // ... existing mappings ...
    'decimals-basic': 'decimals-intro'
};

this.videoResources = {
    // ... existing videos ...
    'decimals-intro': {
        videoUrl: 'https://www.youtube.com/embed/YOUR_DECIMALS_VIDEO',
        title: 'Solving Equations with Decimals',
        description: 'Learn decimal operations in equations'
    }
};
```

### 3. Deploy:

```bash
git add .
git commit -m "Add decimals lesson unit (levels 21-23)"
netlify deploy --prod
```

---

## 🚀 Advanced: Custom Word Problem Templates

The AI will automatically generate word problems for your new types, but you can add fallback templates:

In `word-problem-generator.js`, find `getFallbackTemplates()` (around line 140):

```javascript
getFallbackTemplates(equationType, difficulty) {
    const templates = {
        'two-step-basic': [ /* existing */ ],
        'decimals-basic': [  // ADD YOUR TEMPLATES
            'A streaming service costs ${answer} per month. After paying for 0.5 months plus a $2.30 setup fee, you spent $4.80 total. What is the monthly cost?',
            'Your phone battery drains at {answer}% per hour. After 2.5 hours of use plus 15% initial drain, you have 45% left. What was the initial battery?'
        ]
    };

    return templates[equationType] || templates['two-step-basic'];
}
```

---

## 💡 Pro Tips

1. **Keep mastery requirements realistic:**
   - Introductory lessons: `masteryRequired: 3-4`
   - Practice lessons: `masteryRequired: 4-5`
   - Review/Checkpoint: `masteryRequired: 5-6`

2. **World organization:**
   - World 1: Foundation concepts (levels 1-3)
   - World 2: Intermediate skills (levels 4-9)
   - World 3-4: Advanced topics (levels 10-17)
   - World 5: Final challenges (levels 18-20)

3. **Progressive difficulty:**
   - Start each concept with `hints: true`
   - End each concept unit with `hints: false` for checkpoints

4. **Test incrementally:**
   - Add 2-3 levels at a time
   - Test in browser before deploying
   - Check console for errors

5. **Keep totalQuestions reasonable:**
   - With adaptive learning, 5 questions usually becomes 3-8
   - Too many = students get bored
   - Too few = can't assess mastery

---

## 🔧 Troubleshooting

### Issue: New levels don't appear
- **Check:** Level IDs must be sequential and unique
- **Check:** World progress in `game.js` matches your levels
- **Solution:** Clear browser localStorage and refresh

### Issue: Word problems don't generate
- **Check:** API key is set in Netlify environment variables
- **Solution:** Fallback templates will be used automatically

### Issue: Adaptive learning not working
- **Check:** `adaptive-learning.js` is loaded before `game.js` in index.html
- **Check:** Console for errors about missing methods

### Issue: Progress not saving
- **Check:** Browser localStorage is enabled
- **Check:** Console for autosave messages every 30 seconds

---

## 📞 Need Help?

1. Check console logs (F12 in browser)
2. Review existing level definitions as templates
3. Test locally before deploying
4. Check `SETUP.md` for deployment help

---

**You're ready to add lessons!** 🎉

Start by adding 1-2 new levels, test them, then expand from there. The platform will handle everything else automatically!
