/**
 * Achievement System Test Script
 *
 * Copy and paste these commands into the browser console to test achievements
 * Open the main app page (index.html) first, then open browser DevTools console
 */

console.log('🏆 Achievement Test Suite Loaded');
console.log('Copy and paste these commands to test achievements:\n');

// Test Functions
const AchievementTests = {

  // Test 1: First Steps Achievement
  testFirstSteps() {
    console.log('🧪 Testing: First Steps achievement...');
    window.AchievementSystem.checkAchievements('lesson_complete', {
      lessonId: 1,
      score: 80,
      time: 240
    });
    console.log('✅ Should unlock "First Steps" if first lesson');
  },

  // Test 2: Perfect Score Achievement
  testPerfectScore() {
    console.log('🧪 Testing: Perfect Score achievement...');
    window.AchievementSystem.checkAchievements('lesson_complete', {
      lessonId: 2,
      score: 100,
      time: 180
    });
    console.log('✅ Should unlock "Perfect Score"');
  },

  // Test 3: Speed Demon Achievement
  testSpeedDemon() {
    console.log('🧪 Testing: Speed Demon achievement...');
    window.AchievementSystem.checkAchievements('lesson_complete', {
      lessonId: 3,
      score: 85,
      time: 150  // Under 3 minutes
    });
    console.log('✅ Should unlock "Speed Demon" if time < 180s');
  },

  // Test 4: Multiple Practice Problems
  testPracticeProblems() {
    console.log('🧪 Testing: Practice Makes Perfect achievement...');
    for (let i = 0; i < 50; i++) {
      window.AchievementSystem.checkAchievements('practice_problem', {
        correct: true
      });
    }
    console.log('✅ Should unlock "Practice Makes Perfect" after 50 problems');
  },

  // Test 5: Video Watching
  testVideoViewer() {
    console.log('🧪 Testing: Video Viewer achievement...');
    for (let i = 0; i < 10; i++) {
      window.AchievementSystem.checkAchievements('video_watched', {
        videoId: `video-${i}`
      });
    }
    console.log('✅ Should unlock "Video Viewer" after 10 videos');
  },

  // Test 6: Equation Expert
  testEquationExpert() {
    console.log('🧪 Testing: Equation Expert achievement...');
    for (let i = 0; i < 100; i++) {
      window.AchievementSystem.checkAchievements('practice_problem', {
        correct: true
      });
    }
    console.log('✅ Should unlock "Equation Expert" after 100 correct');
  },

  // Test 7: Complete Multiple Lessons
  testExplorer() {
    console.log('🧪 Testing: Explorer achievement...');
    for (let i = 1; i <= 10; i++) {
      window.AchievementSystem.checkAchievements('lesson_start', {
        lessonId: i
      });
    }
    console.log('✅ Should unlock "Explorer" after 10 different lessons');
  },

  // Test 8: Comeback Kid
  testComebackKid() {
    console.log('🧪 Testing: Comeback Kid achievement...');
    window.AchievementSystem.checkAchievements('score_improvement', {
      lessonId: 5,
      oldScore: 60,
      newScore: 90
    });
    console.log('✅ Should unlock "Comeback Kid"');
  },

  // Test 9: Lightning Fast
  testLightningFast() {
    console.log('🧪 Testing: Lightning Fast achievement...');
    window.AchievementSystem.checkAchievements('lesson_complete', {
      lessonId: 10,
      score: 100,
      time: 45  // Under 1 minute
    });
    console.log('✅ Should unlock "Lightning Fast" if time < 60s');
  },

  // Test 10: AI Helper Usage
  testHelpSeeker() {
    console.log('🧪 Testing: Help Seeker achievement...');
    for (let i = 0; i < 5; i++) {
      window.AchievementSystem.checkAchievements('ai_helper', {
        context: 'help-request'
      });
    }
    console.log('✅ Should unlock "Help Seeker" after 5 uses');
  },

  // Utility: View Current Stats
  viewStats() {
    console.log('📊 Current Achievement Stats:');
    console.log(window.AchievementSystem.getStats());
  },

  // Utility: View User Stats
  viewUserStats() {
    console.log('📈 Current User Stats:');
    console.log(window.AchievementSystem._userStats);
  },

  // Utility: View Earned Achievements
  viewEarned() {
    console.log('🏆 Earned Achievements:');
    const earned = window.AchievementSystem.getUserAchievements();
    Object.keys(earned).forEach(id => {
      const achievement = window.AchievementSystem.getAchievementById(id);
      if (achievement) {
        console.log(`✅ ${achievement.name} - ${achievement.xp_reward} XP`);
      }
    });
  },

  // Utility: View All Achievements
  viewAll() {
    console.log('📋 All Achievements:');
    const all = window.AchievementSystem.getAllAchievements();
    all.forEach(ach => {
      const earned = window.AchievementSystem.hasAchievement(ach.id);
      console.log(`${earned ? '✅' : '🔒'} ${ach.name} (${ach.category}) - ${ach.xp_reward} XP`);
    });
  },

  // Utility: Check Progress on Specific Achievement
  viewProgress(achievementId) {
    const progress = window.AchievementSystem.getAchievementProgress(achievementId);
    const achievement = window.AchievementSystem.getAchievementById(achievementId);

    if (achievement && progress) {
      console.log(`📊 Progress on "${achievement.name}":`);
      console.log(`   ${progress.current} / ${progress.max} (${progress.percentage}%)`);
    } else {
      console.log('Achievement not found or no progress tracking available');
    }
  },

  // Utility: Reset Everything
  reset() {
    console.log('🔄 Resetting all achievements...');
    window.AchievementSystem.resetAchievements();
    console.log('✅ Reset complete');
  },

  // Run All Tests
  runAll() {
    console.log('🧪 Running all achievement tests...\n');
    this.testFirstSteps();
    setTimeout(() => this.testPerfectScore(), 500);
    setTimeout(() => this.testSpeedDemon(), 1000);
    setTimeout(() => this.testComebackKid(), 1500);
    setTimeout(() => this.testHelpSeeker(), 2000);
    setTimeout(() => {
      console.log('\n✅ All tests complete!');
      console.log('Run AchievementTests.viewEarned() to see what you unlocked');
    }, 2500);
  }
};

// Make available globally
window.AchievementTests = AchievementTests;

// Print instructions
console.log(`
🏆 ACHIEVEMENT TEST COMMANDS
============================

Quick Tests:
------------
AchievementTests.testFirstSteps()       - Test first lesson completion
AchievementTests.testPerfectScore()     - Test perfect score
AchievementTests.testSpeedDemon()       - Test fast completion
AchievementTests.testLightningFast()    - Test super fast completion
AchievementTests.testComebackKid()      - Test score improvement
AchievementTests.testExplorer()         - Test multiple lessons
AchievementTests.testPracticeProblems() - Test practice problems
AchievementTests.testVideoViewer()      - Test video watching
AchievementTests.testEquationExpert()   - Test equation solving
AchievementTests.testHelpSeeker()       - Test AI helper usage

Run All Tests:
--------------
AchievementTests.runAll()               - Run all tests at once

View Progress:
--------------
AchievementTests.viewStats()            - View achievement statistics
AchievementTests.viewUserStats()        - View tracked user stats
AchievementTests.viewEarned()           - View earned achievements
AchievementTests.viewAll()              - View all achievements
AchievementTests.viewProgress('id')     - View progress on specific achievement

Utilities:
----------
AchievementTests.reset()                - Reset all achievements

Manual Achievement Check:
-------------------------
window.AchievementSystem.checkAchievements('event_type', {data})

Example:
window.AchievementSystem.checkAchievements('lesson_complete', {
  lessonId: 1,
  score: 100,
  time: 120
});

`);
