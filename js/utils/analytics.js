/**
 * Analytics Utilities
 *
 * PURPOSE: Calculate statistics and analyze student/class performance
 * FEATURES:
 * - Calculate average scores
 * - Calculate completion rates
 * - Calculate study time
 * - Identify struggling standards
 * - Predict next lessons
 * - Generate insights
 */

const Analytics = {
  /**
   * Calculate average score from lessons
   * @param {Array} lessons - Array of lesson objects with score property
   * @returns {number} Average score (0-100)
   */
  calculateAverageScore(lessons) {
    if (!lessons || lessons.length === 0) return 0;

    const completedLessons = lessons.filter(l => l.score !== null && l.score !== undefined);
    if (completedLessons.length === 0) return 0;

    const totalScore = completedLessons.reduce((sum, lesson) => sum + lesson.score, 0);
    return Math.round(totalScore / completedLessons.length);
  },

  /**
   * Calculate completion rate
   * @param {number} total - Total number of lessons
   * @param {number} completed - Number of completed lessons
   * @returns {number} Completion percentage (0-100)
   */
  calculateCompletionRate(total, completed) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  /**
   * Calculate total study time
   * @param {Array} sessions - Array of session objects with timeSpent property
   * @returns {Object} {hours, minutes, seconds, totalSeconds}
   */
  calculateStudyTime(sessions) {
    if (!sessions || sessions.length === 0) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const totalSeconds = sessions.reduce((sum, session) => {
      return sum + (session.timeSpent || session.time_spent || 0);
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
      formatted: `${hours}h ${minutes}m`
    };
  },

  /**
   * Identify struggling standards (below 70% average)
   * @param {Array} lessons - Array of lesson objects
   * @returns {Array} Array of {standard, avgScore, lessonCount}
   */
  identifyStrugglingStandards(lessons) {
    if (!lessons || lessons.length === 0) return [];

    // Group lessons by standard
    const standardGroups = {};
    lessons.forEach(lesson => {
      if (!lesson.standard_code || lesson.score === null) return;

      if (!standardGroups[lesson.standard_code]) {
        standardGroups[lesson.standard_code] = {
          standard: lesson.standard_code,
          scores: [],
          lessonCount: 0
        };
      }

      standardGroups[lesson.standard_code].scores.push(lesson.score);
      standardGroups[lesson.standard_code].lessonCount++;
    });

    // Calculate average and filter struggling standards
    const strugglingStandards = [];
    Object.values(standardGroups).forEach(group => {
      const avgScore = group.scores.reduce((a, b) => a + b, 0) / group.scores.length;
      if (avgScore < 70) {
        strugglingStandards.push({
          standard: group.standard,
          avgScore: Math.round(avgScore),
          lessonCount: group.lessonCount
        });
      }
    });

    // Sort by score (lowest first)
    return strugglingStandards.sort((a, b) => a.avgScore - b.avgScore);
  },

  /**
   * Predict next lesson based on progress and calendar
   * @param {Array} progress - Array of progress objects
   * @param {Array} calendar - Array of calendar entries
   * @returns {Object|null} Next lesson object
   */
  predictNextLesson(progress, calendar) {
    if (!progress || !calendar) return null;

    // Find first incomplete lesson
    const completedLessons = progress.filter(p => p.status === 'completed').map(p => p.lesson_number);
    const nextLessonNumber = Math.max(0, ...completedLessons) + 1;

    // Find in calendar
    return calendar.find(c => c.lessonNumber === nextLessonNumber) || null;
  },

  /**
   * Generate insights based on student data
   * @param {Object} data - Student data object
   * @returns {Array} Array of insight objects
   */
  generateInsights(data) {
    const insights = [];

    // Completion rate insight
    const completionRate = this.calculateCompletionRate(87, data.lessonsCompleted || 0);
    if (completionRate >= 75) {
      insights.push({
        type: 'success',
        icon: '🎉',
        title: 'Great Progress!',
        message: `You've completed ${completionRate}% of all lessons. Keep it up!`
      });
    } else if (completionRate >= 50) {
      insights.push({
        type: 'info',
        icon: '📈',
        title: 'Halfway There!',
        message: `You're ${completionRate}% through the course. Stay consistent!`
      });
    } else if (completionRate < 25 && data.lessonsCompleted > 0) {
      insights.push({
        type: 'warning',
        icon: '💪',
        title: 'Keep Going!',
        message: 'Every lesson counts. Try to complete at least one lesson per day.'
      });
    }

    // Streak insight
    if (data.currentStreak >= 7) {
      insights.push({
        type: 'success',
        icon: '🔥',
        title: 'Amazing Streak!',
        message: `${data.currentStreak} day streak! Consistency is key to mastery.`
      });
    } else if (data.currentStreak >= 3) {
      insights.push({
        type: 'info',
        icon: '🔥',
        title: 'Building Momentum!',
        message: `${data.currentStreak} day streak. Can you reach 7 days?`
      });
    }

    // Average score insight
    const avgScore = data.averageScore || 0;
    if (avgScore >= 90) {
      insights.push({
        type: 'success',
        icon: '⭐',
        title: 'Outstanding Performance!',
        message: `Your average score is ${avgScore}%. You're mastering the material!`
      });
    } else if (avgScore >= 70) {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Solid Performance',
        message: `${avgScore}% average. Review tricky concepts to reach 90%+.`
      });
    } else if (avgScore > 0 && avgScore < 70) {
      insights.push({
        type: 'warning',
        icon: '📚',
        title: 'Review Recommended',
        message: 'Consider rewatching videos and practicing more before moving forward.'
      });
    }

    // Study time insight
    if (data.studyTime) {
      const hoursPerWeek = data.studyTime.totalSeconds / 3600 / 4; // Approximate weeks
      if (hoursPerWeek >= 3) {
        insights.push({
          type: 'success',
          icon: '⏱️',
          title: 'Great Study Habits!',
          message: `You're averaging ${hoursPerWeek.toFixed(1)} hours per week.`
        });
      }
    }

    // Achievement insight
    const achievementRate = this.calculateCompletionRate(44, data.achievementsEarned || 0);
    if (achievementRate >= 50) {
      insights.push({
        type: 'success',
        icon: '🏆',
        title: 'Achievement Hunter!',
        message: `You've unlocked ${data.achievementsEarned} achievements!`
      });
    }

    return insights;
  },

  /**
   * Calculate progress by quarter
   * @param {Array} lessons - Array of lesson objects
   * @returns {Object} {Q1: {completed, total, percentage}, ...}
   */
  calculateQuarterProgress(lessons) {
    const quarters = {
      Q1: { completed: 0, total: 22, percentage: 0 },
      Q2: { completed: 0, total: 22, percentage: 0 },
      Q3: { completed: 0, total: 22, percentage: 0 },
      Q4: { completed: 0, total: 21, percentage: 0 }
    };

    if (!lessons) return quarters;

    lessons.forEach(lesson => {
      const quarter = lesson.quarter;
      if (quarters[quarter]) {
        if (lesson.status === 'completed' || lesson.completed_at) {
          quarters[quarter].completed++;
        }
      }
    });

    // Calculate percentages
    Object.keys(quarters).forEach(q => {
      quarters[q].percentage = this.calculateCompletionRate(
        quarters[q].total,
        quarters[q].completed
      );
    });

    return quarters;
  },

  /**
   * Get recent activity formatted for display
   * @param {Array} activities - Array of activity objects
   * @param {number} limit - Number of activities to return
   * @returns {Array} Formatted activity objects
   */
  getRecentActivity(activities, limit = 10) {
    if (!activities || activities.length === 0) return [];

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .map(activity => ({
        ...activity,
        timeAgo: this._getTimeAgo(activity.timestamp),
        icon: this._getActivityIcon(activity.type)
      }));
  },

  /**
   * Get upcoming lessons from calendar
   * @param {Array} calendar - Calendar entries
   * @param {Array} progress - Progress data
   * @param {number} limit - Number of lessons to return
   * @returns {Array} Upcoming lesson objects
   */
  getUpcomingLessons(calendar, progress, limit = 3) {
    if (!calendar || !progress) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get completed lesson numbers
    const completedLessons = new Set(
      progress.filter(p => p.status === 'completed').map(p => p.lesson_number)
    );

    // Find upcoming lessons (not completed, date >= today)
    return calendar
      .filter(entry => {
        const lessonDate = new Date(entry.date);
        lessonDate.setHours(0, 0, 0, 0);
        return !completedLessons.has(entry.lessonNumber) && lessonDate >= today;
      })
      .slice(0, limit)
      .map(entry => ({
        ...entry,
        dateFormatted: this._formatLessonDate(entry.date),
        daysUntil: this._getDaysUntil(entry.date)
      }));
  },

  /**
   * Identify students needing attention (teacher view)
   * @param {Array} students - Array of student objects
   * @returns {Array} Students needing attention
   */
  identifyStrugglingStudents(students) {
    if (!students) return [];

    return students.filter(student => {
      // Low score (< 60%)
      const lowScore = student.averageScore < 60;

      // Inactive for 7+ days
      const lastActive = student.lastActivityDate ? new Date(student.lastActivityDate) : null;
      const daysSinceActive = lastActive
        ? Math.floor((new Date() - lastActive) / (1000 * 60 * 60 * 24))
        : 999;
      const inactive = daysSinceActive >= 7;

      // Behind schedule (less than expected completion rate)
      const expectedCompletion = this._getExpectedCompletion();
      const behindSchedule = student.completionRate < expectedCompletion - 20;

      return lowScore || inactive || behindSchedule;
    }).map(student => ({
      ...student,
      reasons: this._getStrugglingReasons(student)
    }));
  },

  /**
   * Calculate class statistics
   * @param {Array} students - Array of student objects
   * @returns {Object} Class statistics
   */
  calculateClassStats(students) {
    if (!students || students.length === 0) {
      return {
        totalStudents: 0,
        avgCompletion: 0,
        avgScore: 0,
        activeToday: 0,
        totalLessonsCompleted: 0,
        avgStreak: 0
      };
    }

    const today = new Date().toDateString();

    return {
      totalStudents: students.length,
      avgCompletion: Math.round(
        students.reduce((sum, s) => sum + (s.completionRate || 0), 0) / students.length
      ),
      avgScore: Math.round(
        students.reduce((sum, s) => sum + (s.averageScore || 0), 0) / students.length
      ),
      activeToday: students.filter(s =>
        s.lastActivityDate && new Date(s.lastActivityDate).toDateString() === today
      ).length,
      totalLessonsCompleted: students.reduce((sum, s) => sum + (s.lessonsCompleted || 0), 0),
      avgStreak: Math.round(
        students.reduce((sum, s) => sum + (s.currentStreak || 0), 0) / students.length
      )
    };
  },

  /**
   * Format time ago string
   * @private
   */
  _getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  },

  /**
   * Get activity icon based on type
   * @private
   */
  _getActivityIcon(type) {
    const icons = {
      lesson_complete: '✅',
      achievement: '🏆',
      level_up: '⬆️',
      streak: '🔥',
      perfect_score: '⭐',
      practice: '⚔️'
    };
    return icons[type] || '📚';
  },

  /**
   * Format lesson date
   * @private
   */
  _formatLessonDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },

  /**
   * Get days until date
   * @private
   */
  _getDaysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  /**
   * Get expected completion rate based on current date
   * @private
   */
  _getExpectedCompletion() {
    // Rough estimate: school year is ~180 days, 87 lessons
    // So about 48% per lesson expected
    const today = new Date();
    const schoolYearStart = new Date(today.getFullYear(), 7, 1); // August 1
    const daysSinceStart = Math.floor((today - schoolYearStart) / (1000 * 60 * 60 * 24));
    const expectedRate = Math.min(100, Math.floor((daysSinceStart / 180) * 100));
    return expectedRate;
  },

  /**
   * Get reasons why student is struggling
   * @private
   */
  _getStrugglingReasons(student) {
    const reasons = [];

    if (student.averageScore < 60) {
      reasons.push(`Low average score (${student.averageScore}%)`);
    }

    const lastActive = student.lastActivityDate ? new Date(student.lastActivityDate) : null;
    const daysSinceActive = lastActive
      ? Math.floor((new Date() - lastActive) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceActive >= 7) {
      reasons.push(`Inactive for ${daysSinceActive} days`);
    }

    const expectedCompletion = this._getExpectedCompletion();
    if (student.completionRate < expectedCompletion - 20) {
      reasons.push(`Behind schedule (${student.completionRate}% vs ${expectedCompletion}% expected)`);
    }

    return reasons;
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.Analytics = Analytics;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}
