/**
 * Achievement System
 *
 * PURPOSE: Track and award achievements based on student actions
 * FEATURES:
 * - 40+ achievements across 6 categories
 * - Real-time achievement checking
 * - Progress tracking for multi-step achievements
 * - XP rewards
 * - Local storage persistence
 */

const AchievementSystem = {
  // Cache loaded achievements
  _achievements: null,
  _userAchievements: {},
  _userStats: {},

  /**
   * Initialize the achievement system
   */
  async init() {
    console.log('🏆 Achievement System initializing...');
    await this.loadAchievements();
    this.loadUserData();
  },

  /**
   * Load achievement definitions from JSON
   */
  async loadAchievements() {
    try {
      const response = await fetch('/data/achievements.json');
      const data = await response.json();
      this._achievements = data.achievements;
      console.log(`✅ Loaded ${this._achievements.length} achievements`);
      return this._achievements;
    } catch (error) {
      console.error('❌ Failed to load achievements:', error);
      this._achievements = [];
    }
  },

  /**
   * Load user achievement data from localStorage
   */
  loadUserData() {
    try {
      const saved = localStorage.getItem('userAchievements');
      if (saved) {
        this._userAchievements = JSON.parse(saved);
      }

      const stats = localStorage.getItem('achievementStats');
      if (stats) {
        this._userStats = JSON.parse(stats);
      } else {
        // Initialize default stats
        this._userStats = {
          lessonsCompleted: 0,
          lessonsAttempted: 0,
          perfectLessons: 0,
          consecutivePerfect: 0,
          fastCompletions: 0,
          practiceProblems: 0,
          correctEquations: 0,
          videosWatched: 0,
          aiHelperUsed: 0,
          stepSolverUsed: 0,
          visualizationUsed: 0,
          wordProblems: 0,
          scoreImprovements: 0,
          currentStreak: 0,
          longestStreak: 0,
          activeDays: 0,
          loginStreak: 0,
          totalXP: 0,
          totalCoins: 0,
          playerLevel: 1,
          lastActiveDate: null,
          completedUnits: [],
          completedQuarters: [],
          completedWorlds: [],
          completedTopics: [],
          practiceArenaComplete: 0
        };
      }

      console.log('📊 Loaded user achievements:', Object.keys(this._userAchievements).length);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  },

  /**
   * Save user achievement data to localStorage
   */
  saveUserData() {
    try {
      localStorage.setItem('userAchievements', JSON.stringify(this._userAchievements));
      localStorage.setItem('achievementStats', JSON.stringify(this._userStats));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  },

  /**
   * Check if an action triggered any achievements
   * @param {string} eventType - Type of event (e.g., 'lesson_complete', 'perfect_score')
   * @param {object} eventData - Event data (e.g., {lessonId: 1, score: 100, time: 120})
   */
  async checkAchievements(eventType, eventData = {}) {
    if (!this._achievements) {
      await this.loadAchievements();
    }

    console.log('🔍 Checking achievements for:', eventType, eventData);

    // Update stats based on event
    this.updateStats(eventType, eventData);

    // Check all achievements
    const unlockedAchievements = [];

    for (const achievement of this._achievements) {
      // Skip if already unlocked
      if (this.hasAchievement(achievement.id)) {
        continue;
      }

      // Check if criteria met
      if (this.checkCriteria(achievement.unlock_criteria)) {
        await this.awardAchievement(achievement.id);
        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  },

  /**
   * Update user statistics based on event
   */
  updateStats(eventType, eventData) {
    const stats = this._userStats;

    switch (eventType) {
      case 'lesson_complete':
        stats.lessonsCompleted++;
        if (eventData.score === 100) {
          stats.perfectLessons++;
          stats.consecutivePerfect++;
        } else {
          stats.consecutivePerfect = 0;
        }
        if (eventData.time && eventData.time < 180) {
          stats.fastCompletions++;
        }
        this.updateStreak();
        break;

      case 'lesson_start':
        stats.lessonsAttempted++;
        break;

      case 'practice_problem':
        stats.practiceProblems++;
        if (eventData.correct) {
          stats.correctEquations++;
        }
        break;

      case 'video_watched':
        stats.videosWatched++;
        break;

      case 'ai_helper':
        stats.aiHelperUsed++;
        break;

      case 'step_solver':
        stats.stepSolverUsed++;
        break;

      case 'visualization':
        stats.visualizationUsed++;
        break;

      case 'word_problem':
        stats.wordProblems++;
        break;

      case 'score_improvement':
        stats.scoreImprovements++;
        break;

      case 'unit_complete':
        if (!stats.completedUnits.includes(eventData.unitId)) {
          stats.completedUnits.push(eventData.unitId);
        }
        break;

      case 'quarter_complete':
        if (!stats.completedQuarters.includes(eventData.quarterId)) {
          stats.completedQuarters.push(eventData.quarterId);
        }
        break;

      case 'world_complete':
        if (!stats.completedWorlds.includes(eventData.worldId)) {
          stats.completedWorlds.push(eventData.worldId);
        }
        break;

      case 'topic_mastery':
        if (!stats.completedTopics.includes(eventData.topic)) {
          stats.completedTopics.push(eventData.topic);
        }
        break;

      case 'practice_arena':
        stats.practiceArenaComplete++;
        break;

      case 'xp_earned':
        stats.totalXP += eventData.xp || 0;
        break;

      case 'coins_earned':
        stats.totalCoins += eventData.coins || 0;
        break;

      case 'level_up':
        stats.playerLevel = eventData.level || stats.playerLevel + 1;
        break;
    }

    this.saveUserData();
  },

  /**
   * Update login and activity streaks
   */
  updateStreak() {
    const today = new Date().toDateString();
    const lastActive = this._userStats.lastActiveDate;

    if (lastActive !== today) {
      this._userStats.activeDays++;

      if (lastActive) {
        const lastDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          this._userStats.currentStreak++;
          this._userStats.loginStreak++;
        } else {
          // Streak broken
          this._userStats.currentStreak = 1;
          this._userStats.loginStreak = 1;
        }
      } else {
        this._userStats.currentStreak = 1;
        this._userStats.loginStreak = 1;
      }

      // Update longest streak
      if (this._userStats.currentStreak > this._userStats.longestStreak) {
        this._userStats.longestStreak = this._userStats.currentStreak;
      }

      this._userStats.lastActiveDate = today;
      this.saveUserData();
    }
  },

  /**
   * Check if achievement criteria is met
   */
  checkCriteria(criteria) {
    const stats = this._userStats;
    const type = criteria.type;
    const value = criteria.value;

    switch (type) {
      case 'lessons_completed':
        return stats.lessonsCompleted >= value;

      case 'lessons_attempted':
        return stats.lessonsAttempted >= value;

      case 'perfect_lesson':
        return stats.perfectLessons >= value;

      case 'consecutive_perfect':
        return stats.consecutivePerfect >= value;

      case 'lesson_time':
        // This is checked in real-time during lesson completion
        return false; // Handled by event data

      case 'streak':
        return stats.currentStreak >= value;

      case 'login_streak':
        return stats.loginStreak >= value;

      case 'active_days':
        return stats.activeDays >= value;

      case 'unit_completed':
        return stats.completedUnits.length >= value;

      case 'quarter_completed':
        return stats.completedQuarters.length >= value;

      case 'world_completed':
        return stats.completedWorlds.includes(value);

      case 'topic_mastery':
        return stats.completedTopics.includes(value);

      case 'practice_problems':
        return stats.practiceProblems >= value;

      case 'correct_equations':
        return stats.correctEquations >= value;

      case 'videos_watched':
        return stats.videosWatched >= value;

      case 'ai_helper_used':
        return stats.aiHelperUsed >= value;

      case 'step_solver_used':
        return stats.stepSolverUsed >= value;

      case 'visualization_used':
        return stats.visualizationUsed >= value;

      case 'word_problems':
        return stats.wordProblems >= value;

      case 'score_improvement':
      case 'score_improvements':
        return stats.scoreImprovements >= value;

      case 'retry_success':
        return stats.scoreImprovements >= value;

      case 'player_level':
        return stats.playerLevel >= value;

      case 'total_coins':
        return stats.totalCoins >= value;

      case 'total_xp':
        return stats.totalXP >= value;

      case 'practice_arena_complete':
        return stats.practiceArenaComplete >= value;

      case 'early_completion':
      case 'late_completion':
      case 'weekend_completion':
      case 'daily_lessons':
      case 'flawless_lesson':
      case 'fast_completions':
      case 'high_accuracy':
        // These require specific event tracking
        return false;

      default:
        console.warn('Unknown criteria type:', type);
        return false;
    }
  },

  /**
   * Award an achievement to the user
   */
  async awardAchievement(achievementId) {
    if (this.hasAchievement(achievementId)) {
      console.log('Achievement already earned:', achievementId);
      return;
    }

    const achievement = this.getAchievementById(achievementId);
    if (!achievement) {
      console.error('Achievement not found:', achievementId);
      return;
    }

    // Add to user achievements
    this._userAchievements[achievementId] = {
      unlockedAt: new Date().toISOString(),
      xpAwarded: achievement.xp_reward
    };

    // Award XP
    this._userStats.totalXP += achievement.xp_reward;

    this.saveUserData();

    console.log(`🏆 Achievement unlocked: ${achievement.name} (+${achievement.xp_reward} XP)`);

    // Show notification
    if (window.AchievementDisplay) {
      window.AchievementDisplay.showUnlockModal(achievement);
    }

    return achievement;
  },

  /**
   * Check if user has an achievement
   */
  hasAchievement(achievementId) {
    return achievementId in this._userAchievements;
  },

  /**
   * Get all user achievements
   */
  getUserAchievements() {
    return this._userAchievements;
  },

  /**
   * Get achievement by ID
   */
  getAchievementById(achievementId) {
    if (!this._achievements) {
      return null;
    }
    return this._achievements.find(a => a.id === achievementId);
  },

  /**
   * Get all achievements (earned and unearned)
   */
  getAllAchievements() {
    return this._achievements || [];
  },

  /**
   * Get achievement progress
   */
  getAchievementProgress(achievementId) {
    const achievement = this.getAchievementById(achievementId);
    if (!achievement) {
      return null;
    }

    const criteria = achievement.unlock_criteria;
    const stats = this._userStats;
    let current = 0;
    let max = criteria.value;

    switch (criteria.type) {
      case 'lessons_completed':
        current = stats.lessonsCompleted;
        break;
      case 'lessons_attempted':
        current = stats.lessonsAttempted;
        break;
      case 'perfect_lesson':
        current = stats.perfectLessons;
        break;
      case 'streak':
        current = stats.currentStreak;
        break;
      case 'practice_problems':
        current = stats.practiceProblems;
        break;
      case 'correct_equations':
        current = stats.correctEquations;
        break;
      case 'videos_watched':
        current = stats.videosWatched;
        break;
      case 'ai_helper_used':
        current = stats.aiHelperUsed;
        break;
      case 'step_solver_used':
        current = stats.stepSolverUsed;
        break;
      case 'word_problems':
        current = stats.wordProblems;
        break;
      case 'score_improvements':
        current = stats.scoreImprovements;
        break;
      case 'total_coins':
        current = stats.totalCoins;
        break;
      case 'total_xp':
        current = stats.totalXP;
        break;
      default:
        return null;
    }

    return {
      current: Math.min(current, max),
      max: max,
      percentage: Math.min(100, Math.floor((current / max) * 100))
    };
  },

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category) {
    if (!this._achievements) {
      return [];
    }
    return this._achievements.filter(a => a.category === category);
  },

  /**
   * Get total XP earned from achievements
   */
  getTotalAchievementXP() {
    return Object.values(this._userAchievements)
      .reduce((sum, ach) => sum + (ach.xpAwarded || 0), 0);
  },

  /**
   * Get achievement statistics
   */
  getStats() {
    const total = this._achievements ? this._achievements.length : 0;
    const earned = Object.keys(this._userAchievements).length;

    return {
      total: total,
      earned: earned,
      remaining: total - earned,
      percentage: total > 0 ? Math.floor((earned / total) * 100) : 0,
      totalXP: this.getTotalAchievementXP()
    };
  },

  /**
   * Reset all achievements (for testing)
   */
  resetAchievements() {
    if (confirm('⚠️ Reset all achievements? This cannot be undone!')) {
      this._userAchievements = {};
      this._userStats = {
        lessonsCompleted: 0,
        lessonsAttempted: 0,
        perfectLessons: 0,
        consecutivePerfect: 0,
        fastCompletions: 0,
        practiceProblems: 0,
        correctEquations: 0,
        videosWatched: 0,
        aiHelperUsed: 0,
        stepSolverUsed: 0,
        visualizationUsed: 0,
        wordProblems: 0,
        scoreImprovements: 0,
        currentStreak: 0,
        longestStreak: 0,
        activeDays: 0,
        loginStreak: 0,
        totalXP: 0,
        totalCoins: 0,
        playerLevel: 1,
        lastActiveDate: null,
        completedUnits: [],
        completedQuarters: [],
        completedWorlds: [],
        completedTopics: [],
        practiceArenaComplete: 0
      };
      this.saveUserData();
      console.log('🔄 Achievements reset');
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AchievementSystem.init();
  });
} else {
  AchievementSystem.init();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.AchievementSystem = AchievementSystem;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AchievementSystem;
}
