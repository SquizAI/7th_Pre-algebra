/**
 * XP System Module
 *
 * Manages experience points (XP) calculation, leveling, and persistence.
 * Integrates with Supabase for backend storage and history tracking.
 *
 * Features:
 * - Dynamic XP calculation based on performance
 * - Exponential leveling curve (Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 210 XP)
 * - Multiple XP sources (lessons, achievements, streaks, bonuses)
 * - Level-up detection and notifications
 * - Progress tracking to next level
 */

class XPSystem {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.listeners = new Set();

    // XP source multipliers
    this.sourceMultipliers = {
      lesson_completion: 1.0,
      achievement: 1.5,
      streak_bonus: 0.5,
      perfect_score: 1.2,
      speed_bonus: 0.8,
      daily_challenge: 2.0,
      mastery_bonus: 1.3
    };

    this.init();
  }

  async init() {
    // Get Supabase client
    this.supabase = window.SupabaseClient?.getClient();
    if (!this.supabase) {
      console.warn('XP System: Supabase not initialized');
      return;
    }

    // Get current user
    const { data: { user } } = await this.supabase.auth.getUser();
    this.currentUser = user;

    console.log('XP System initialized');
  }

  /**
   * Calculate XP for a lesson based on performance metrics
   * @param {number} lessonScore - Score percentage (0-100)
   * @param {number} timeSpent - Time spent in seconds
   * @param {number} attempts - Number of attempts
   * @param {number} streakBonus - Current streak multiplier (0-1)
   * @returns {Object} XP breakdown
   */
  calculateLessonXP(lessonScore, timeSpent, attempts, streakBonus = 0) {
    // Base XP calculation
    const baseXP = 100; // Base XP for completing any lesson

    // Score bonus: 0-100 XP based on score percentage
    const scoreBonus = Math.floor(lessonScore * 1.0);

    // Speed bonus: Extra XP for completing quickly
    // Fast: < 5 min = +50 XP, Medium: 5-10 min = +25 XP, Slow: > 10 min = 0 XP
    let speedBonus = 0;
    if (timeSpent < 300) { // < 5 minutes
      speedBonus = 50;
    } else if (timeSpent < 600) { // 5-10 minutes
      speedBonus = 25;
    }

    // Attempt penalty: -10 XP per attempt after first (min 0)
    const attemptPenalty = Math.max(0, (attempts - 1) * 10);

    // Perfect score bonus
    const perfectBonus = lessonScore === 100 ? 100 : 0;

    // Calculate streak bonus (5% per day up to 50%)
    const streakBonusAmount = Math.floor((baseXP + scoreBonus) * streakBonus);

    // Calculate total
    const totalXP = Math.max(
      10, // Minimum XP
      baseXP + scoreBonus + speedBonus + perfectBonus + streakBonusAmount - attemptPenalty
    );

    return {
      total: totalXP,
      breakdown: {
        base: baseXP,
        score: scoreBonus,
        speed: speedBonus,
        perfect: perfectBonus,
        streak: streakBonusAmount,
        attempts: -attemptPenalty
      }
    };
  }

  /**
   * Award XP to a user through the serverless function
   * @param {string} userId - User ID (optional, uses current user if not provided)
   * @param {number} amount - Amount of XP to award
   * @param {string} source - Source of XP (lesson_completion, achievement, etc.)
   * @param {string} sourceId - Optional ID of the source (lesson number, achievement ID, etc.)
   * @param {string} description - Optional description
   * @returns {Promise<Object>} Result with new XP, level, and level-up status
   */
  async awardXP(userId, amount, source, sourceId = null, description = null) {
    try {
      // Use current user if no userId provided
      if (!userId && this.currentUser) {
        userId = this.currentUser.id;
      }

      if (!userId) {
        throw new Error('No user ID provided and no user logged in');
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('XP amount must be positive');
      }

      // Call serverless function
      const response = await fetch('/.netlify/functions/award-xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          amount,
          source,
          sourceId,
          description
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to award XP');
      }

      const result = await response.json();

      // Notify listeners of XP award
      this.notifyListeners('xp_awarded', result);

      // Check for level up
      if (result.leveledUp) {
        this.notifyListeners('level_up', result);
      }

      console.log(`✅ Awarded ${amount} XP from ${source}. New total: ${result.newXP} (Level ${result.level})`);

      return result;
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  }

  /**
   * Check if user leveled up between old and new XP values
   * @param {string} userId - User ID
   * @param {number} oldXP - Previous XP amount
   * @param {number} newXP - New XP amount
   * @returns {Object} Level up information
   */
  checkLevelUp(userId, oldXP, newXP) {
    const oldLevel = this.getLevelForXP(oldXP);
    const newLevel = this.getLevelForXP(newXP);

    const leveledUp = newLevel > oldLevel;

    return {
      leveledUp,
      oldLevel,
      newLevel,
      levelsGained: newLevel - oldLevel
    };
  }

  /**
   * Calculate level from total XP
   * Formula: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 210 XP (exponential)
   * Each level requires: 100 + (level - 1) * 10 more XP than the previous
   * @param {number} xp - Total XP
   * @returns {number} Current level
   */
  getLevelForXP(xp) {
    let level = 1;
    let xpRequired = 0;
    let xpForNextLevel = 100;

    while (xp >= xpRequired + xpForNextLevel && level < 87) {
      xpRequired += xpForNextLevel;
      level++;
      xpForNextLevel = 100 + (level - 1) * 10;
    }

    return level;
  }

  /**
   * Calculate XP required to reach a specific level
   * @param {number} level - Target level
   * @returns {number} Total XP required
   */
  getXPForLevel(level) {
    if (level <= 1) return 0;

    let totalXP = 0;
    let currentLevel = 1;
    let xpForNextLevel = 100;

    while (currentLevel < level && currentLevel < 87) {
      totalXP += xpForNextLevel;
      currentLevel++;
      xpForNextLevel = 100 + (currentLevel - 1) * 10;
    }

    return totalXP;
  }

  /**
   * Get XP progress for current level
   * @param {number} currentXP - Current total XP
   * @returns {Object} Progress information
   */
  getXPProgress(currentXP) {
    const currentLevel = this.getLevelForXP(currentXP);
    const xpForCurrentLevel = this.getXPForLevel(currentLevel);
    const xpForNextLevel = this.getXPForLevel(currentLevel + 1);
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

    return {
      currentLevel,
      currentXP,
      xpInCurrentLevel,
      xpNeededForNextLevel,
      xpToNextLevel: xpNeededForNextLevel - xpInCurrentLevel,
      progressPercent: Math.min(100, progressPercent)
    };
  }

  /**
   * Get XP history for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of records to retrieve
   * @returns {Promise<Array>} XP history
   */
  async getXPHistory(userId = null, limit = 50) {
    try {
      if (!userId && this.currentUser) {
        userId = this.currentUser.id;
      }

      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await this.supabase
        .from('xp_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching XP history:', error);
      return [];
    }
  }

  /**
   * Register a listener for XP events
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in XP listener:', error);
      }
    });
  }

  /**
   * Get formatted XP string with source emoji
   * @param {string} source - XP source
   * @param {number} amount - XP amount
   * @returns {string} Formatted string
   */
  formatXPGain(source, amount) {
    const sourceEmojis = {
      lesson_completion: '📚',
      achievement: '🏆',
      streak_bonus: '🔥',
      perfect_score: '⭐',
      speed_bonus: '⚡',
      daily_challenge: '🎯',
      mastery_bonus: '🎓'
    };

    const emoji = sourceEmojis[source] || '✨';
    return `${emoji} +${amount} XP`;
  }
}

// Initialize and export
if (typeof window !== 'undefined') {
  window.xpSystem = new XPSystem();
  console.log('XP System loaded');
}

// Export for Node.js (for serverless functions)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = XPSystem;
}
