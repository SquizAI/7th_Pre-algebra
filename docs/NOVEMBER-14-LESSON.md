# November 14, 2025 - Password-Protected Lesson

## 📋 Lesson Details

**Lesson Name:** Solution Types Mastery
**Lesson ID:** Level 21
**Lesson Code:** 7_math_2.11.3
**Period:** 2
**Grade:** 7
**Subject:** Pre-Algebra
**Available Date:** Friday, November 14, 2025

## 🔐 Password Information

**Password:** `Algebra1114`
**Password Hint:** "Think: Algebra + today's date (4 digits)"

### How It Works:
- The lesson will automatically become available on November 14, 2025 at midnight
- Students will need to enter the password to unlock the lesson
- Once unlocked, the lesson remains accessible (stored in browser localStorage)
- The password prompt includes a helpful hint

## 📚 Florida Standards

This lesson addresses the following Florida Standards:

- **MA.8.AR.2.1:** Solve multi-step linear equations in one variable with rational number coefficients
- **MA.K12.MTR.4.1:** Engage in discussions on mathematical thinking
- **ELA.K12.EE.1.1:** Cite evidence to explain and justify reasoning

## 🎯 Learning Objectives

Students will be able to:

1. ✅ Identify equations with infinitely many solutions
2. ✅ Identify equations with no solution
3. ✅ Distinguish between one solution, no solution, and infinite solutions
4. ✅ Solve and classify all types of linear equations

## 📖 Lesson Content

### Video Lesson
**YouTube Video:** EnVision Grade 7 Accelerated Pre-Algebra 7-4
**Video ID:** nYo6ftCSgAs
**URL:** https://www.youtube.com/watch?v=nYo6ftCSgAs

### Key Concepts Covered:

1. **One Solution:**
   - Variables cancel to give a true statement with a specific answer
   - Example: 4x + 5 = 2x + 13 → x = 4

2. **No Solution:**
   - Variables cancel but you get a FALSE statement (like 5 = 3)
   - Example: 2x + 3 = 2x + 5 → 3 = 5 (impossible!)

3. **Infinitely Many Solutions:**
   - Variables cancel and you get a TRUE statement (like 5 = 5)
   - Example: 3x + 6 = 3(x + 2) → 6 = 6 (always true!)

### Practice Questions:
- **Total Questions:** 6
- **Mastery Required:** 5 correct (83%)
- **Hints Enabled:** Yes
- **Difficulty:** Adaptive (adjusts based on student performance)

## 🎮 Lesson Structure

The lesson follows the mandatory learning workflow:

1. **Video Lesson (5-7 minutes)**
   - Students watch the YouTube video
   - Must check "I watched and understood" to proceed

2. **Worked Examples**
   - 3 detailed examples showing:
     - No solution case
     - Infinitely many solutions case
     - One solution case

3. **Understanding Check**
   - Multiple choice question to verify comprehension
   - Question: "When you solve an equation and get '7 = 7', what does this mean?"

4. **Practice Problems**
   - 6 adaptive difficulty problems
   - Mix of one solution, no solution, and infinite solutions
   - Must get 5/6 correct to demonstrate mastery

## 💻 Technical Implementation

### Files Modified:

1. **`js/core/equations.js`** (lines 240-268)
   - Added Level 21 definition with password protection fields
   - Includes standards, metadata, and lesson configuration

2. **`js/core/game.js`** (lines 152-308)
   - Made `loadLevel()` async to support password checking
   - Added `checkLessonAccess()` method for password validation
   - Added date-based availability check

3. **`css/styles.css`** (lines 4255-4407)
   - Added password modal styles
   - Includes animations, transitions, and mobile responsive design

4. **`js/features/learning-workflow.js`** (lines 183-234, 450)
   - Added 'solution-types' concept definition
   - Updated `getConceptForLevel()` to map solution types

### Password Protection Features:

- ✅ Date-based unlock (lesson hidden until November 14, 2025)
- ✅ Password requirement with hint
- ✅ One-time unlock (stored in localStorage)
- ✅ Graceful error handling (shake animation on wrong password)
- ✅ Success confirmation (2-second delay before lesson starts)
- ✅ Cancel option (returns to menu)

## 🧪 Testing Checklist

### Before November 14, 2025:
- [ ] Navigate to Level 21 from menu
- [ ] Verify date restriction message appears
- [ ] Check message shows correct date (Friday, November 14, 2025)

### On/After November 14, 2025:
- [ ] Navigate to Level 21
- [ ] Verify password modal appears
- [ ] Test wrong password (should shake and show error)
- [ ] Test correct password "Algebra1114" (should unlock)
- [ ] Verify lesson starts after success message
- [ ] Close and reopen - verify lesson stays unlocked
- [ ] Watch video → Check "I watched and understood"
- [ ] Review 3 worked examples
- [ ] Answer understanding check correctly
- [ ] Complete 6 practice problems (at least 5 correct)
- [ ] Verify mastery achievement

## 🚀 Deployment Instructions

1. **Commit Changes:**
   ```bash
   git add .
   git commit -m "Add password-protected lesson for November 14, 2025"
   git push
   ```

2. **Netlify Auto-Deploy:**
   - Netlify will automatically detect the push
   - Build time: ~23 seconds
   - No environment variables needed (password is in code)

3. **Verification:**
   - Visit: https://7th-grade-pre-algebra.netlify.app
   - Navigate to menu
   - Look for Level 21 in World 4 (Ocean of Fractions)

## 📝 Teacher Instructions

### Giving the Password to Students:

**On November 14, 2025:**

1. **Announce to the class:**
   > "Today we're unlocking a special lesson on solution types! The password is: **Algebra1114**"

2. **Write on board:**
   ```
   Password: Algebra1114
   (Algebra + 11/14)
   ```

3. **Remind students:**
   - Once they enter the password once, it stays unlocked
   - They need to watch the video first (required)
   - They should answer at least 5 out of 6 questions correctly

### Monitoring Student Progress:

- Students can track their own progress in the game
- Check with students who struggle with the understanding check
- The adaptive difficulty will adjust based on their performance

## 🔧 Troubleshooting

### If the lesson doesn't appear:
- Check browser cache (Ctrl+F5 to hard refresh)
- Verify it's November 14, 2025 or later
- Check console for JavaScript errors

### If password doesn't work:
- Ensure exact spelling: `Algebra1114` (capital A, no spaces)
- Try clearing browser data and re-entering
- Check localStorage: key `lesson_21_unlocked` should be 'true'

### To reset password for testing:
1. Open browser console (F12)
2. Run: `localStorage.removeItem('lesson_21_unlocked')`
3. Refresh page

## 📊 Expected Outcomes

After completing this lesson, students should be able to:

1. Recognize when an equation has no solution
2. Recognize when an equation has infinitely many solutions
3. Distinguish these from regular one-solution equations
4. Explain why each case occurs

## 🎉 Success Criteria

- 80%+ of students complete the lesson
- 75%+ achieve mastery (5/6 or 6/6 correct)
- Students can explain the difference between the three solution types

---

**Created:** November 13, 2025
**Last Updated:** November 13, 2025
**Status:** ✅ Ready for deployment
