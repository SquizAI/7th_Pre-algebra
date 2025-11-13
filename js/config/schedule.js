/**
 * Schedule Configuration
 *
 * PURPOSE: Define the lesson schedule and calendar settings
 * FEATURES:
 * - Every-other-day schedule (MWF or TTh)
 * - Date overrides for holidays/special events
 * - Lesson-to-level mapping
 */

const ScheduleConfig = {
  // SCHEDULE TYPE: 'MWF' (Monday/Wednesday/Friday) or 'TTh' (Tuesday/Thursday)
  scheduleType: 'MWF', // ⚠️ TEACHER: Change this to match your class schedule

  // START DATE: First day of lessons (YYYY-MM-DD format)
  startDate: '2025-11-13', // ⚠️ TEACHER: Update to your actual start date

  // HOLIDAYS/BREAKS: Dates when class does NOT meet (YYYY-MM-DD format)
  holidays: [
    '2025-11-27', // Thanksgiving
    '2025-11-28', // Thanksgiving Break
    '2025-11-29', // Thanksgiving Break
    '2025-12-22', // Winter Break Start
    '2025-12-23',
    '2025-12-24',
    '2025-12-25', // Christmas
    '2025-12-26',
    '2025-12-27',
    '2025-12-28',
    '2025-12-29',
    '2025-12-30',
    '2025-12-31', // New Year's Eve
    '2026-01-01', // New Year's Day
    '2026-01-02', // Winter Break End
  ],

  // DATE OVERRIDES: Special dates that don't follow the regular schedule
  // Format: { 'YYYY-MM-DD': lessonNumber }
  dateOverrides: {
    // Example: '2025-11-14': 21, // Special lesson on Friday Nov 14
  },

  // LESSON-TO-LEVEL MAPPING: Maps lesson number to level ID in equations.js
  lessonToLevel: {
    // Existing lessons (Equations focus)
    1: 1,   // Welcome to Algebra Castle
    2: 2,   // Two-Step Mastery
    3: 3,   // Two-Step Review
    4: 4,   // Forest of Terms
    5: 5,   // Like Terms Practice
    6: 6,   // Combining Terms Review
    7: 7,   // Distribution Intro
    8: 8,   // Distributive Practice
    9: 9,   // Distribution Review
    10: 10, // Both Sides Intro
    11: 11, // Variables Both Sides
    12: 12, // Both Sides Review
    13: 13, // Special Solutions Intro
    14: 14, // No Solution Practice
    15: 15, // Infinite Solutions Practice
    16: 16, // Solution Types Mixed
    17: 17, // Advanced Multi-Step
    18: 18, // Complex Distribution
    19: 19, // Mixed Practice
    20: 20, // Boss Battle
    21: 21, // Solution Types Mastery (Password-protected for Nov 14)

    // NEW LESSONS: To be added later
    // 22-27: Inequalities unit
    // 28-32: Exponents & Radicals
    // 33-38: Linear Relationships
    // 39-42: Systems of Equations
    // 43-45: Functions
    // 46-48: Pythagorean Theorem
    // 49-50: Scatter Plots & Data Analysis
  },

  // LESSON METADATA: Additional info for each lesson
  lessonMetadata: {
    1: {
      name: 'Welcome to Algebra Castle',
      standard: 'MA.8.AR.2.1',
      topic: 'Two-Step Equations',
      videoId: '0ackz7dJSYY'
    },
    2: {
      name: 'Two-Step Mastery',
      standard: 'MA.8.AR.2.1',
      topic: 'Two-Step Equations',
      videoId: '0ackz7dJSYY'
    },
    3: {
      name: 'Two-Step Review Checkpoint',
      standard: 'MA.8.AR.2.1',
      topic: 'Two-Step Equations',
      videoId: '0ackz7dJSYY'
    },
    4: {
      name: 'Into the Forest of Terms',
      standard: 'MA.8.AR.2.1',
      topic: 'Combining Like Terms',
      videoId: 'XCWkBAUiBxM'
    },
    5: {
      name: 'Like Terms Practice',
      standard: 'MA.8.AR.2.1',
      topic: 'Combining Like Terms',
      videoId: 'XCWkBAUiBxM'
    },
    6: {
      name: 'Combining Terms Review',
      standard: 'MA.8.AR.2.1',
      topic: 'Combining Like Terms',
      videoId: 'XCWkBAUiBxM'
    },
    7: {
      name: 'Distribution Introduction',
      standard: 'MA.8.AR.2.1',
      topic: 'Distributive Property',
      videoId: 'v-6MShC82ow'
    },
    8: {
      name: 'Distributive Practice',
      standard: 'MA.8.AR.2.1',
      topic: 'Distributive Property',
      videoId: 'v-6MShC82ow'
    },
    9: {
      name: 'Distribution Review',
      standard: 'MA.8.AR.2.1',
      topic: 'Distributive Property',
      videoId: 'v-6MShC82ow'
    },
    10: {
      name: 'Mountain Ascent - Both Sides Intro',
      standard: 'MA.8.AR.2.1',
      topic: 'Variables on Both Sides',
      videoId: 'eZsyV0ISzV8'
    },
    11: {
      name: 'Variables Both Sides',
      standard: 'MA.8.AR.2.1',
      topic: 'Variables on Both Sides',
      videoId: 'eZsyV0ISzV8'
    },
    12: {
      name: 'Both Sides Review',
      standard: 'MA.8.AR.2.1',
      topic: 'Variables on Both Sides',
      videoId: 'eZsyV0ISzV8'
    },
    13: {
      name: 'Special Solutions Introduction',
      standard: 'MA.8.AR.2.1',
      topic: 'Solution Types',
      videoId: 'nYo6ftCSgAs'
    },
    14: {
      name: 'No Solution Practice',
      standard: 'MA.8.AR.2.1',
      topic: 'Solution Types',
      videoId: 'nYo6ftCSgAs'
    },
    15: {
      name: 'Infinite Solutions Practice',
      standard: 'MA.8.AR.2.1',
      topic: 'Solution Types',
      videoId: 'nYo6ftCSgAs'
    },
    16: {
      name: 'Solution Types Mixed',
      standard: 'MA.8.AR.2.1',
      topic: 'Solution Types',
      videoId: 'nYo6ftCSgAs'
    },
    17: {
      name: 'Advanced Multi-Step',
      standard: 'MA.8.AR.2.1',
      topic: 'Advanced Equations',
      videoId: 'eZsyV0ISzV8'
    },
    18: {
      name: 'Complex Distribution',
      standard: 'MA.8.AR.2.1',
      topic: 'Advanced Equations',
      videoId: 'v-6MShC82ow'
    },
    19: {
      name: 'Mixed Practice',
      standard: 'MA.8.AR.2.1',
      topic: 'Review & Mastery',
      videoId: '0ackz7dJSYY'
    },
    20: {
      name: 'Boss Battle - Equation Master',
      standard: 'MA.8.AR.2.1',
      topic: 'Assessment',
      videoId: null // Boss battles don't have videos
    },
    21: {
      name: 'Solution Types Mastery',
      standard: 'MA.8.AR.2.1',
      topic: 'Solution Types',
      videoId: 'nYo6ftCSgAs',
      passwordProtected: true,
      password: 'Algebra1114',
      specialDate: '2025-11-14'
    }
  },

  /**
   * Get the days of week this class meets
   * @returns {number[]} Array of day numbers (0=Sunday, 1=Monday, etc.)
   */
  getClassDays() {
    if (this.scheduleType === 'MWF') {
      return [1, 3, 5]; // Monday, Wednesday, Friday
    } else if (this.scheduleType === 'TTh') {
      return [2, 4]; // Tuesday, Thursday
    } else {
      throw new Error('Invalid schedule type. Must be "MWF" or "TTh"');
    }
  },

  /**
   * Check if a date is a class day (not holiday, matches schedule)
   * @param {Date} date - The date to check
   * @returns {boolean} True if class meets on this date
   */
  isClassDay(date) {
    const dateStr = this.formatDate(date);

    // Check if it's a holiday
    if (this.holidays.includes(dateStr)) {
      return false;
    }

    // Check if day of week matches schedule
    const dayOfWeek = date.getDay();
    return this.getClassDays().includes(dayOfWeek);
  },

  /**
   * Format date as YYYY-MM-DD
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Get lesson metadata
   * @param {number} lessonNumber
   * @returns {object|null}
   */
  getLessonMetadata(lessonNumber) {
    return this.lessonMetadata[lessonNumber] || null;
  },

  /**
   * Get level ID for a lesson number
   * @param {number} lessonNumber
   * @returns {number|null}
   */
  getLevelForLesson(lessonNumber) {
    return this.lessonToLevel[lessonNumber] || null;
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ScheduleConfig = ScheduleConfig;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScheduleConfig;
}
