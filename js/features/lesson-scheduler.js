/**
 * Lesson Scheduler
 *
 * PURPOSE: Calculate which lesson should be taught on which date
 * FEATURES:
 * - Auto-calculate lesson dates based on every-other-day schedule
 * - Handle holidays and date overrides
 * - Determine lesson status (locked, available, completed, today)
 * - Track student progress
 */

const LessonScheduler = {
  // Cache calculated schedule
  _schedule: null,
  _scheduleCache: null,

  /**
   * Initialize the scheduler
   */
  init() {
    console.log('📅 LessonScheduler initializing...');
    this.loadProgress();
    this.generateSchedule();
  },

  /**
   * Generate the complete lesson schedule
   * Maps lesson numbers to calendar dates
   */
  generateSchedule() {
    console.log('📅 Generating lesson schedule...');

    const config = window.ScheduleConfig;
    if (!config) {
      console.error('❌ ScheduleConfig not loaded!');
      return;
    }

    const schedule = [];
    const startDate = new Date(config.startDate);
    let currentDate = new Date(startDate);
    let lessonNumber = 1;
    const maxLessons = Object.keys(config.lessonToLevel).length;

    // Generate dates for all lessons
    while (lessonNumber <= maxLessons) {
      // Check for date override first
      const dateStr = config.formatDate(currentDate);
      if (config.dateOverrides[dateStr]) {
        const overrideLessonNum = config.dateOverrides[dateStr];
        schedule.push({
          lessonNumber: overrideLessonNum,
          date: new Date(currentDate),
          dateStr: dateStr,
          isOverride: true
        });
        lessonNumber++;
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Check if this is a class day
      if (config.isClassDay(currentDate)) {
        schedule.push({
          lessonNumber: lessonNumber,
          date: new Date(currentDate),
          dateStr: dateStr,
          isOverride: false
        });
        lessonNumber++;
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);

      // Safety check: don't create infinite loop
      if (currentDate.getFullYear() > 2027) {
        console.warn('⚠️ Schedule generation stopped - reached year 2027');
        break;
      }
    }

    this._schedule = schedule;
    this._scheduleCache = Date.now();

    console.log(`✅ Generated schedule for ${schedule.length} lessons`);
    console.log('First lesson:', schedule[0]);
    console.log('Last lesson:', schedule[schedule.length - 1]);

    return schedule;
  },

  /**
   * Get the complete schedule
   * @returns {Array} Array of {lessonNumber, date, dateStr, isOverride}
   */
  getSchedule() {
    if (!this._schedule || !this._scheduleCache) {
      this.generateSchedule();
    }
    return this._schedule;
  },

  /**
   * Get lesson for a specific date
   * @param {Date} date - The date to check
   * @returns {object|null} Lesson object or null if no lesson that day
   */
  getLessonForDate(date) {
    const dateStr = window.ScheduleConfig.formatDate(date);
    const schedule = this.getSchedule();
    return schedule.find(item => item.dateStr === dateStr) || null;
  },

  /**
   * Get today's lesson
   * @returns {object|null} Today's lesson or null if no class today
   */
  getTodaysLesson() {
    const today = new Date();
    return this.getLessonForDate(today);
  },

  /**
   * Get date for a specific lesson number
   * @param {number} lessonNumber
   * @returns {Date|null}
   */
  getDateForLesson(lessonNumber) {
    const schedule = this.getSchedule();
    const item = schedule.find(s => s.lessonNumber === lessonNumber);
    return item ? item.date : null;
  },

  /**
   * Get lesson status
   * @param {number} lessonNumber
   * @returns {string} 'locked', 'available', 'today', 'completed'
   */
  getLessonStatus(lessonNumber) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lessonDate = this.getDateForLesson(lessonNumber);
    if (!lessonDate) {
      return 'locked'; // Lesson not scheduled yet
    }

    lessonDate.setHours(0, 0, 0, 0);

    // Check if completed
    if (this.isLessonCompleted(lessonNumber)) {
      return 'completed';
    }

    // Check if it's today
    if (lessonDate.getTime() === today.getTime()) {
      return 'today';
    }

    // Check if available (date has passed)
    if (lessonDate < today) {
      return 'available';
    }

    // Future lesson - locked
    return 'locked';
  },

  /**
   * Check if a lesson is completed
   * @param {number} lessonNumber
   * @returns {boolean}
   */
  isLessonCompleted(lessonNumber) {
    const progress = this.getProgress();
    return progress.completedLessons.includes(lessonNumber);
  },

  /**
   * Mark a lesson as completed
   * @param {number} lessonNumber
   */
  completLesson(lessonNumber) {
    const progress = this.getProgress();
    if (!progress.completedLessons.includes(lessonNumber)) {
      progress.completedLessons.push(lessonNumber);
      progress.completedLessons.sort((a, b) => a - b);
      this.saveProgress(progress);
      console.log(`✅ Lesson ${lessonNumber} marked as completed`);
    }
  },

  /**
   * Get student progress data
   * @returns {object} {completedLessons: [], lastAccessDate: string}
   */
  getProgress() {
    try {
      const saved = localStorage.getItem('lessonProgress');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }

    return {
      completedLessons: [],
      lastAccessDate: new Date().toISOString()
    };
  },

  /**
   * Save student progress
   * @param {object} progress
   */
  saveProgress(progress) {
    try {
      progress.lastAccessDate = new Date().toISOString();
      localStorage.setItem('lessonProgress', JSON.stringify(progress));
      console.log('💾 Progress saved:', progress);
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  },

  /**
   * Load progress from localStorage
   */
  loadProgress() {
    const progress = this.getProgress();
    console.log('📊 Loaded progress:', progress);
    return progress;
  },

  /**
   * Get lessons by status
   * @returns {object} {locked: [], available: [], today: [], completed: []}
   */
  getLessonsByStatus() {
    const schedule = this.getSchedule();
    const result = {
      locked: [],
      available: [],
      today: [],
      completed: []
    };

    schedule.forEach(item => {
      const status = this.getLessonStatus(item.lessonNumber);
      const metadata = window.ScheduleConfig.getLessonMetadata(item.lessonNumber);
      const levelId = window.ScheduleConfig.getLevelForLesson(item.lessonNumber);

      result[status].push({
        lessonNumber: item.lessonNumber,
        date: item.date,
        dateStr: item.dateStr,
        status: status,
        levelId: levelId,
        name: metadata ? metadata.name : `Lesson ${item.lessonNumber}`,
        standard: metadata ? metadata.standard : null,
        topic: metadata ? metadata.topic : null
      });
    });

    return result;
  },

  /**
   * Get lessons for current week
   * @returns {Array} Lessons in current week (Sunday-Saturday)
   */
  getCurrentWeekLessons() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Go to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Go to Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const schedule = this.getSchedule();
    return schedule.filter(item => {
      const lessonDate = new Date(item.date);
      return lessonDate >= startOfWeek && lessonDate <= endOfWeek;
    }).map(item => {
      const metadata = window.ScheduleConfig.getLessonMetadata(item.lessonNumber);
      const levelId = window.ScheduleConfig.getLevelForLesson(item.lessonNumber);
      const status = this.getLessonStatus(item.lessonNumber);

      return {
        lessonNumber: item.lessonNumber,
        date: item.date,
        dateStr: item.dateStr,
        status: status,
        levelId: levelId,
        name: metadata ? metadata.name : `Lesson ${item.lessonNumber}`,
        standard: metadata ? metadata.standard : null,
        topic: metadata ? metadata.topic : null
      };
    });
  },

  /**
   * Get upcoming lessons (next 5 available/locked lessons)
   * @returns {Array} Next 5 lessons
   */
  getUpcomingLessons(count = 5) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedule = this.getSchedule();
    const upcoming = schedule.filter(item => {
      const lessonDate = new Date(item.date);
      lessonDate.setHours(0, 0, 0, 0);
      return lessonDate >= today;
    });

    return upcoming.slice(0, count).map(item => {
      const metadata = window.ScheduleConfig.getLessonMetadata(item.lessonNumber);
      const levelId = window.ScheduleConfig.getLevelForLesson(item.lessonNumber);
      const status = this.getLessonStatus(item.lessonNumber);

      return {
        lessonNumber: item.lessonNumber,
        date: item.date,
        dateStr: item.dateStr,
        status: status,
        levelId: levelId,
        name: metadata ? metadata.name : `Lesson ${item.lessonNumber}`,
        standard: metadata ? metadata.standard : null,
        topic: metadata ? metadata.topic : null
      };
    });
  },

  /**
   * Get past lessons (completed or available from previous days)
   * @returns {Array} Past lessons
   */
  getPastLessons(count = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedule = this.getSchedule();
    const past = schedule.filter(item => {
      const lessonDate = new Date(item.date);
      lessonDate.setHours(0, 0, 0, 0);
      return lessonDate < today;
    });

    // Get most recent past lessons
    const recentPast = past.slice(-count);

    return recentPast.map(item => {
      const metadata = window.ScheduleConfig.getLessonMetadata(item.lessonNumber);
      const levelId = window.ScheduleConfig.getLevelForLesson(item.lessonNumber);
      const status = this.getLessonStatus(item.lessonNumber);

      return {
        lessonNumber: item.lessonNumber,
        date: item.date,
        dateStr: item.dateStr,
        status: status,
        levelId: levelId,
        name: metadata ? metadata.name : `Lesson ${item.lessonNumber}`,
        standard: metadata ? metadata.standard : null,
        topic: metadata ? metadata.topic : null
      };
    });
  },

  /**
   * Reset all progress (for testing)
   */
  resetProgress() {
    if (confirm('⚠️ Reset all lesson progress? This cannot be undone!')) {
      localStorage.removeItem('lessonProgress');
      console.log('🔄 Progress reset');
      this.loadProgress();
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    LessonScheduler.init();
  });
} else {
  LessonScheduler.init();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.LessonScheduler = LessonScheduler;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonScheduler;
}
