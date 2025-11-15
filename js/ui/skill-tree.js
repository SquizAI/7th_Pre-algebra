/**
 * Skill Tree - Lesson Map Logic
 *
 * PURPOSE: Manage the visual skill tree showing all 87 lessons
 * FEATURES:
 * - Load all lessons from Supabase database
 * - Track lesson status (locked, available, completed, current)
 * - Filter by quarter, unit, or standard
 * - Calculate progress and dependencies
 * - Sync progress with Supabase
 */

const SkillTree = {
  // Data storage
  allLessons: [],
  progress: {},
  currentLesson: 1,
  userId: null,
  supabase: null,

  // Filters
  filters: {
    quarter: 'all', // 'all', 'Q1', 'Q2', 'Q3', 'Q4'
    unit: 'all',     // 'all', 1, 2, 3, etc.
    standard: 'all', // 'all', 'NSO', 'AR', 'F', 'GR', 'DP'
    status: 'all'    // 'all', 'not-started', 'in-progress', 'completed'
  },

  /**
   * Initialize the skill tree
   */
  async init() {
    console.log('🌳 SkillTree initializing...');

    // Initialize Supabase client
    this.supabase = window.SupabaseClient?.getClient();
    if (!this.supabase) {
      console.warn('⚠️ Supabase not initialized, falling back to localStorage');
    }

    // Get current user
    await this.getCurrentUser();

    // Load all lesson data from Supabase
    await this.loadAllLessons();

    // Load user progress from Supabase
    await this.loadProgress();

    // Determine current lesson
    await this.determineCurrentLesson();

    console.log(`✅ Loaded ${this.allLessons.length} lessons`);
    console.log(`📊 Progress: ${this.getCompletedCount()}/${this.allLessons.length} completed`);
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    if (!this.supabase) return;

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      this.userId = user?.id || null;
      console.log('👤 User ID:', this.userId || 'Not authenticated');
    } catch (error) {
      console.warn('⚠️ Error getting user:', error.message);
      this.userId = null;
    }
  },

  /**
   * Load all lessons from Supabase database
   */
  async loadAllLessons() {
    if (!this.supabase) {
      // Fallback to JSON files if Supabase not available
      await this.loadLessonsFromJSON();
      return;
    }

    try {
      console.log('📚 Loading lessons from Supabase...');

      // Fetch all lessons from Supabase
      const { data: lessons, error } = await this.supabase
        .from('lessons')
        .select('*')
        .order('lesson_number', { ascending: true });

      if (error) throw error;

      if (lessons && lessons.length > 0) {
        // Map database fields to expected format
        this.allLessons = lessons.map(lesson => ({
          ...lesson,
          lessonId: `lesson-${lesson.lesson_number}`,
          // Normalize field names
          lesson_topic: lesson.lesson_topic || lesson.title,
          standard_code: lesson.standard_code || lesson.standard,
          unit_number: lesson.unit_number || lesson.unit,
          b_day_date: lesson.date
        }));
        console.log(`✅ Loaded ${lessons.length} lessons from database`);
      } else {
        console.warn('⚠️ No lessons found in database, falling back to JSON');
        await this.loadLessonsFromJSON();
      }
    } catch (error) {
      console.error('❌ Error loading lessons from Supabase:', error.message);
      // Fallback to JSON files
      await this.loadLessonsFromJSON();
    }
  },

  /**
   * Fallback: Load lessons from JSON files
   */
  async loadLessonsFromJSON() {
    const lessons = [];

    try {
      console.log('📄 Loading lessons from JSON files...');

      // Load Q1 lessons (1-19)
      const q1Response = await fetch('/docs/Q1_8th_grade_detailed_lessons.json');
      const q1Data = await q1Response.json();
      if (q1Data.lessons) {
        lessons.push(...q1Data.lessons.map(lesson => ({
          ...lesson,
          quarter: 'Q1',
          lessonId: `lesson-${lesson.lesson_number}`
        })));
      }

      // Load Q2 lessons (20-44)
      const q2Response = await fetch('/docs/Q2_8th_grade_detailed_lessons.json');
      const q2Data = await q2Response.json();
      if (q2Data.units) {
        q2Data.units.forEach(unit => {
          if (unit.lessons) {
            lessons.push(...unit.lessons.map(lesson => ({
              ...lesson,
              quarter: 'Q2',
              unit_number: unit.unit_number,
              unit_name: unit.unit_name,
              lessonId: `lesson-${lesson.lesson_number}`
            })));
          }
        });
      }

      // Load Q3 lessons (45-66)
      const q3Response = await fetch('/docs/Q3_8th_grade_detailed_lessons.json');
      const q3Data = await q3Response.json();
      if (q3Data.units) {
        q3Data.units.forEach(unit => {
          if (unit.lessons) {
            lessons.push(...unit.lessons.map(lesson => ({
              ...lesson,
              quarter: 'Q3',
              unit_number: unit.unit_number,
              unit_name: unit.unit_name,
              lessonId: `lesson-${lesson.lesson_number}`
            })));
          }
        });
      }

      // Load Q4 lessons (67-87)
      const q4Response = await fetch('/docs/Q4_8th_grade_detailed_lessons.json');
      const q4Data = await q4Response.json();
      if (q4Data.units) {
        q4Data.units.forEach(unit => {
          if (unit.lessons) {
            lessons.push(...unit.lessons.map(lesson => ({
              ...lesson,
              quarter: 'Q4',
              unit_number: unit.unit_number,
              unit_name: unit.unit_name,
              lessonId: `lesson-${lesson.lesson_number}`
            })));
          }
        });
      }

      // Sort by lesson number
      this.allLessons = lessons.sort((a, b) => a.lesson_number - b.lesson_number);
      console.log(`✅ Loaded ${lessons.length} lessons from JSON`);

    } catch (error) {
      console.error('❌ Error loading lessons from JSON:', error);
      this.allLessons = [];
    }
  },

  /**
   * Load progress from Supabase or localStorage
   */
  async loadProgress() {
    if (!this.supabase || !this.userId) {
      // Fallback to localStorage
      this.loadProgressFromLocalStorage();
      return;
    }

    try {
      console.log('📊 Loading progress from Supabase...');

      // Fetch user's lesson progress
      const { data: progressData, error } = await this.supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', this.userId);

      if (error) throw error;

      // Convert array to object keyed by lesson_id
      this.progress = {};
      if (progressData) {
        progressData.forEach(item => {
          // Extract lesson number from lesson_id
          const lessonNumber = item.lesson_id;
          this.progress[lessonNumber] = {
            completed: item.status === 'completed',
            score: item.score || 0,
            attempts: item.attempts || 0,
            completedAt: item.completed_at,
            status: item.status
          };
        });
      }

      console.log(`✅ Loaded progress for ${Object.keys(this.progress).length} lessons`);
    } catch (error) {
      console.error('❌ Error loading progress from Supabase:', error.message);
      // Fallback to localStorage
      this.loadProgressFromLocalStorage();
    }
  },

  /**
   * Fallback: Load progress from localStorage
   */
  loadProgressFromLocalStorage() {
    const saved = localStorage.getItem('skillTreeProgress');
    if (saved) {
      try {
        this.progress = JSON.parse(saved);
        console.log('✅ Loaded progress from localStorage');
      } catch (e) {
        console.error('Failed to parse progress:', e);
        this.progress = {};
      }
    }
  },

  /**
   * Save progress to Supabase and localStorage
   */
  async saveProgress() {
    // Always save to localStorage as backup
    localStorage.setItem('skillTreeProgress', JSON.stringify(this.progress));

    // Save to Supabase if available
    if (this.supabase && this.userId) {
      // Progress will be saved when lessons are completed via lesson player
      console.log('💾 Progress saved to localStorage (Supabase sync via lesson player)');
    }
  },

  /**
   * Determine which lesson should be current based on progress
   */
  async determineCurrentLesson() {
    // Find the first incomplete lesson
    const firstIncomplete = this.allLessons.find(lesson => {
      return !this.progress[lesson.lesson_number]?.completed;
    });

    if (firstIncomplete) {
      this.currentLesson = firstIncomplete.lesson_number;
    } else if (this.allLessons.length > 0) {
      // All lessons complete, set to last lesson
      this.currentLesson = this.allLessons[this.allLessons.length - 1].lesson_number;
    } else {
      this.currentLesson = 1;
    }

    console.log('⭐ Current lesson:', this.currentLesson);
  },

  /**
   * Get lesson status
   * @param {number} lessonNumber - The lesson number
   * @returns {string} 'locked', 'available', 'current', 'completed'
   */
  getLessonStatus(lessonNumber) {
    // Completed
    if (this.progress[lessonNumber]?.completed) {
      return 'completed';
    }

    // Current lesson
    if (lessonNumber === this.currentLesson) {
      return 'current';
    }

    // Available (previous lesson completed or lesson 1)
    if (lessonNumber === 1 || this.progress[lessonNumber - 1]?.completed) {
      return 'available';
    }

    // Locked
    return 'locked';
  },

  /**
   * Mark lesson as completed
   * @param {number} lessonNumber - The lesson number
   */
  completeLesson(lessonNumber) {
    if (!this.progress[lessonNumber]) {
      this.progress[lessonNumber] = {};
    }
    this.progress[lessonNumber].completed = true;
    this.progress[lessonNumber].completedAt = new Date().toISOString();
    this.saveProgress();

    // Move to next lesson if this was current
    if (lessonNumber === this.currentLesson && lessonNumber < this.allLessons.length) {
      this.currentLesson = lessonNumber + 1;
      localStorage.setItem('currentLesson', this.currentLesson);
    }
  },

  /**
   * Unlock next lesson
   * @param {number} currentLesson - The current lesson number
   */
  unlockNextLesson(currentLesson) {
    if (currentLesson < this.allLessons.length) {
      this.currentLesson = currentLesson + 1;
      localStorage.setItem('currentLesson', this.currentLesson);
    }
  },

  /**
   * Get filtered lessons
   * @returns {Array} Filtered lesson array
   */
  getFilteredLessons() {
    let filtered = [...this.allLessons];

    // Filter by quarter
    if (this.filters.quarter !== 'all') {
      filtered = filtered.filter(l => l.quarter === this.filters.quarter);
    }

    // Filter by unit
    if (this.filters.unit !== 'all') {
      filtered = filtered.filter(l => l.unit_number === this.filters.unit);
    }

    // Filter by standard type
    if (this.filters.standard !== 'all') {
      filtered = filtered.filter(l => {
        const standardCode = l.standard_code || l.standard;
        return standardCode && standardCode.includes(this.filters.standard);
      });
    }

    // Filter by status
    if (this.filters.status !== 'all') {
      filtered = filtered.filter(l => {
        const status = this.getLessonStatus(l.lesson_number);
        if (this.filters.status === 'not-started') {
          return status === 'locked' || status === 'available';
        } else if (this.filters.status === 'in-progress') {
          return status === 'current';
        } else if (this.filters.status === 'completed') {
          return status === 'completed';
        }
        return true;
      });
    }

    return filtered;
  },

  /**
   * Filter by quarter
   * @param {string} quarter - 'all', 'Q1', 'Q2', 'Q3', 'Q4'
   */
  filterByQuarter(quarter) {
    this.filters.quarter = quarter;
  },

  /**
   * Filter by unit
   * @param {number|string} unit - 'all' or unit number
   */
  filterByUnit(unit) {
    this.filters.unit = unit;
  },

  /**
   * Filter by standard type
   * @param {string} standard - 'all', 'NSO', 'AR', 'F', 'GR', 'DP'
   */
  filterByStandard(standard) {
    this.filters.standard = standard;
  },

  /**
   * Filter by mastery level
   * @param {string} status - 'all', 'not-started', 'in-progress', 'completed'
   */
  filterByStatus(status) {
    this.filters.status = status;
  },

  /**
   * Get completed lesson count
   * @returns {number} Number of completed lessons
   */
  getCompletedCount() {
    return Object.values(this.progress).filter(p => p.completed).length;
  },

  /**
   * Get progress percentage
   * @returns {number} Percentage (0-100)
   */
  getProgressPercentage() {
    if (this.allLessons.length === 0) return 0;
    return Math.round((this.getCompletedCount() / this.allLessons.length) * 100);
  },

  /**
   * Get lesson data
   * @param {number} lessonNumber - The lesson number
   * @returns {Object|null} Lesson data or null
   */
  getLesson(lessonNumber) {
    return this.allLessons.find(l => l.lesson_number === lessonNumber) || null;
  },

  /**
   * Search lessons by keyword
   * @param {string} keyword - Search term
   * @returns {Array} Matching lessons
   */
  searchLessons(keyword) {
    const search = keyword.toLowerCase();
    return this.allLessons.filter(lesson => {
      const title = (lesson.lesson_topic || lesson.title || '').toLowerCase();
      const standard = (lesson.standard_code || lesson.standard || '').toLowerCase();
      return title.includes(search) || standard.includes(search);
    });
  },

  /**
   * Get lessons by unit
   * @param {number} unitNumber - Unit number
   * @returns {Array} Lessons in unit
   */
  getLessonsByUnit(unitNumber) {
    return this.allLessons.filter(l => l.unit_number === unitNumber);
  },

  /**
   * Get all unique units
   * @returns {Array} Array of {unitNumber, unitName, lessonCount}
   */
  getUnits() {
    const units = new Map();

    this.allLessons.forEach(lesson => {
      const unitNum = lesson.unit_number;
      const unitName = lesson.unit_name;

      if (unitNum && !units.has(unitNum)) {
        units.set(unitNum, {
          unitNumber: unitNum,
          unitName: unitName || `Unit ${unitNum}`,
          lessonCount: 0,
          quarter: lesson.quarter
        });
      }

      if (unitNum && units.has(unitNum)) {
        units.get(unitNum).lessonCount++;
      }
    });

    return Array.from(units.values()).sort((a, b) => a.unitNumber - b.unitNumber);
  },

  /**
   * Get score/stars for a lesson
   * @param {number} lessonNumber - Lesson number
   * @returns {Object} {score: number, stars: number}
   */
  getLessonScore(lessonNumber) {
    const data = this.progress[lessonNumber];
    if (!data || !data.completed) {
      return { score: 0, stars: 0 };
    }

    const score = data.score || 0;
    let stars = 0;
    if (score >= 90) stars = 3;
    else if (score >= 75) stars = 2;
    else if (score >= 60) stars = 1;

    return { score, stars };
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('lesson-map')) {
      SkillTree.init();
    }
  });
} else {
  if (window.location.pathname.includes('lesson-map')) {
    SkillTree.init();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillTree;
}
