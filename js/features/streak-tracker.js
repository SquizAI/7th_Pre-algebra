/**
 * Streak Tracker
 *
 * PURPOSE: Track student learning streaks on B-days only
 * FEATURES:
 * - Check if student completed lesson today
 * - Update current streak when lesson completed
 * - Break streak if B-day was missed
 * - Calculate streak bonuses for milestones
 * - Get streak status and history
 */

const StreakTracker = {
  // Streak milestones for bonus rewards
  MILESTONES: [3, 7, 14, 30, 60, 100],

  // Bonus XP/coins for each milestone
  MILESTONE_REWARDS: {
    3: { xp: 50, coins: 10, message: "3-day streak! You're on fire!" },
    7: { xp: 100, coins: 25, message: "One week streak! Amazing dedication!" },
    14: { xp: 200, coins: 50, message: "Two weeks! You're unstoppable!" },
    30: { xp: 500, coins: 100, message: "30-day streak! Legendary!" },
    60: { xp: 1000, coins: 250, message: "60 days! You're a math master!" },
    100: { xp: 2500, coins: 500, message: "100 DAYS! Absolute legend!" }
  },

  /**
   * Initialize streak tracker
   */
  init() {
    console.log('🔥 StreakTracker initializing...');
    this.loadStreakData();
  },

  /**
   * Check if user has completed a lesson today
   * @returns {boolean}
   */
  checkStreakToday() {
    const streakData = this.getStreakData();
    const today = this._getTodayDateString();

    return streakData.lastActivityDate === today;
  },

  /**
   * Update streak when a lesson is completed
   * @param {string} userId - User identifier (or use localStorage key)
   * @param {Date} date - Date of completion (defaults to today)
   * @returns {object} Updated streak data with milestone info
   */
  updateStreak(userId = 'default', date = new Date()) {
    const dateStr = this._formatDate(date);
    const streakData = this.getStreakData();

    // Check if this is the first lesson of the day
    if (streakData.lastActivityDate === dateStr) {
      console.log('📅 Already completed lesson today - streak unchanged');
      return {
        streakUpdated: false,
        currentStreak: streakData.currentStreak,
        message: 'Already completed today'
      };
    }

    // Check if this is a B-day
    const lessonForDate = window.LessonScheduler?.getLessonForDate(date);
    if (!lessonForDate) {
      console.log('⚠️ Not a B-day - streak not updated');
      return {
        streakUpdated: false,
        currentStreak: streakData.currentStreak,
        message: 'Not a class day'
      };
    }

    // Check if streak should continue or break
    const lastBDay = this._getLastBDay(date);
    const shouldContinueStreak = streakData.lastActivityDate === lastBDay;

    let newStreakCount;
    let streakBroken = false;

    if (shouldContinueStreak) {
      // Continue the streak
      newStreakCount = streakData.currentStreak + 1;
      console.log(`🔥 Streak continued! Now ${newStreakCount} days`);
    } else {
      // Streak broken or starting fresh
      if (streakData.currentStreak > 0) {
        console.log(`💔 Missed a B-day - streak broken at ${streakData.currentStreak}`);
        streakBroken = true;
      }
      newStreakCount = 1;
    }

    // Update longest streak if needed
    const newLongestStreak = Math.max(streakData.longestStreak, newStreakCount);

    // Check for milestone
    const milestone = this._checkMilestone(streakData.currentStreak, newStreakCount);

    // Update streak data
    const updatedData = {
      currentStreak: newStreakCount,
      longestStreak: newLongestStreak,
      lastActivityDate: dateStr,
      totalBDaysCompleted: streakData.totalBDaysCompleted + 1
    };

    this.saveStreakData(updatedData);

    // Record in daily_streaks history
    this._recordDailyStreak(dateStr, newStreakCount);

    return {
      streakUpdated: true,
      currentStreak: newStreakCount,
      previousStreak: streakData.currentStreak,
      longestStreak: newLongestStreak,
      streakBroken: streakBroken,
      milestone: milestone,
      bonus: milestone ? this.calculateStreakBonus(milestone) : null
    };
  },

  /**
   * Break the current streak (reset to 0)
   * @param {string} userId - User identifier
   * @returns {object} Updated streak data
   */
  breakStreak(userId = 'default') {
    const streakData = this.getStreakData();
    const brokenStreak = streakData.currentStreak;

    console.log(`💔 Breaking streak of ${brokenStreak} days`);

    const updatedData = {
      currentStreak: 0,
      longestStreak: streakData.longestStreak,
      lastActivityDate: streakData.lastActivityDate,
      totalBDaysCompleted: streakData.totalBDaysCompleted
    };

    this.saveStreakData(updatedData);

    return {
      streakBroken: true,
      brokenStreakLength: brokenStreak,
      currentStreak: 0
    };
  },

  /**
   * Get current streak status
   * @param {string} userId - User identifier
   * @returns {object} Streak status
   */
  getStreakStatus(userId = 'default') {
    const streakData = this.getStreakData();
    const today = new Date();
    const todayStr = this._getTodayDateString();

    // Check if streak is at risk
    const lessonToday = window.LessonScheduler?.getTodaysLesson();
    const completedToday = streakData.lastActivityDate === todayStr;
    const isBDay = lessonToday !== null;

    let status = 'active';
    let message = '';

    if (streakData.currentStreak === 0) {
      status = 'none';
      message = 'Start your streak by completing today\'s lesson!';
    } else if (isBDay && !completedToday) {
      status = 'at-risk';
      message = `Complete a lesson today to keep your ${streakData.currentStreak}-day streak!`;
    } else if (completedToday) {
      status = 'completed-today';
      message = `${streakData.currentStreak} day streak! Great work!`;
    } else {
      status = 'safe';
      message = `${streakData.currentStreak} day streak - keep it going!`;
    }

    // Get next milestone
    const nextMilestone = this.MILESTONES.find(m => m > streakData.currentStreak);

    return {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastActivityDate: streakData.lastActivityDate,
      totalBDaysCompleted: streakData.totalBDaysCompleted,
      status: status,
      message: message,
      completedToday: completedToday,
      isBDay: isBDay,
      nextMilestone: nextMilestone,
      daysUntilMilestone: nextMilestone ? nextMilestone - streakData.currentStreak : null
    };
  },

  /**
   * Calculate bonus XP/coins for streak milestone
   * @param {number} streakDays - Number of consecutive days
   * @returns {object|null} Bonus rewards or null
   */
  calculateStreakBonus(streakDays) {
    if (this.MILESTONE_REWARDS[streakDays]) {
      return this.MILESTONE_REWARDS[streakDays];
    }
    return null;
  },

  /**
   * Get streak data from localStorage
   * @returns {object} Streak data
   */
  getStreakData() {
    try {
      const saved = localStorage.getItem('streakData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load streak data:', e);
    }

    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      totalBDaysCompleted: 0
    };
  },

  /**
   * Save streak data to localStorage
   * @param {object} data - Streak data to save
   */
  saveStreakData(data) {
    try {
      localStorage.setItem('streakData', JSON.stringify(data));
      console.log('💾 Streak data saved:', data);

      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('streakUpdated', {
        detail: data
      }));
    } catch (e) {
      console.error('Failed to save streak data:', e);
    }
  },

  /**
   * Load streak data (called on init)
   */
  loadStreakData() {
    const data = this.getStreakData();
    console.log('📊 Loaded streak data:', data);
    return data;
  },

  /**
   * Get calendar view of completed B-days (last 90 days)
   * @returns {Array} Array of {date, completed, isToday, isBDay}
   */
  getCalendarView(days = 90) {
    const calendar = [];
    const today = new Date();
    const dailyStreaks = this._getDailyStreaks();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this._formatDate(date);

      const lessonForDate = window.LessonScheduler?.getLessonForDate(date);
      const isBDay = lessonForDate !== null;
      const completed = dailyStreaks[dateStr] || false;
      const isToday = this._formatDate(new Date()) === dateStr;

      calendar.push({
        date: dateStr,
        dateObj: new Date(date),
        completed: completed,
        isToday: isToday,
        isBDay: isBDay,
        dayOfWeek: date.getDay()
      });
    }

    return calendar;
  },

  /**
   * Record daily streak in history
   * @private
   */
  _recordDailyStreak(dateStr, streakCount) {
    try {
      const dailyStreaks = this._getDailyStreaks();
      dailyStreaks[dateStr] = true;
      localStorage.setItem('dailyStreaks', JSON.stringify(dailyStreaks));
    } catch (e) {
      console.error('Failed to record daily streak:', e);
    }
  },

  /**
   * Get daily streaks history
   * @private
   */
  _getDailyStreaks() {
    try {
      const saved = localStorage.getItem('dailyStreaks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load daily streaks:', e);
    }
    return {};
  },

  /**
   * Check if a milestone was reached
   * @private
   */
  _checkMilestone(oldStreak, newStreak) {
    return this.MILESTONES.find(m => oldStreak < m && newStreak >= m) || null;
  },

  /**
   * Get the last B-day before a given date
   * @private
   */
  _getLastBDay(date) {
    const schedule = window.LessonScheduler?.getSchedule() || [];
    const dateStr = this._formatDate(date);

    // Find current date in schedule
    const currentIndex = schedule.findIndex(s => s.dateStr === dateStr);
    if (currentIndex <= 0) return null;

    // Get previous B-day
    const previousBDay = schedule[currentIndex - 1];
    return previousBDay ? previousBDay.dateStr : null;
  },

  /**
   * Format date as YYYY-MM-DD
   * @private
   */
  _formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Get today's date as YYYY-MM-DD
   * @private
   */
  _getTodayDateString() {
    return this._formatDate(new Date());
  },

  /**
   * Reset all streak data (for testing)
   */
  resetAllStreaks() {
    if (confirm('⚠️ Reset all streak data? This cannot be undone!')) {
      localStorage.removeItem('streakData');
      localStorage.removeItem('dailyStreaks');
      console.log('🔄 All streak data reset');
      this.loadStreakData();
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    StreakTracker.init();
  });
} else {
  StreakTracker.init();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.StreakTracker = StreakTracker;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StreakTracker;
}
