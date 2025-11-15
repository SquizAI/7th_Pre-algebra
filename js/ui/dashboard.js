/**
 * Dashboard Module
 *
 * PURPOSE: Main dashboard logic for students and teachers
 * FEATURES:
 * - Load student/class data
 * - Render stats and charts
 * - Display activity feeds
 * - Handle data refresh
 * - Export reports
 */

const Dashboard = {
  // Current user data
  userId: null,
  userData: null,
  isTeacher: false,

  // Data cache
  _cache: {
    progress: null,
    achievements: null,
    calendar: null,
    students: null,
    lastUpdated: null
  },

  /**
   * Initialize student dashboard
   * @param {string} userId - User ID
   */
  async init(userId) {
    this.userId = userId;
    this.isTeacher = false;

    console.log('Initializing student dashboard for user:', userId);

    // Show loading overlay
    this._showLoading();

    try {
      // Load all student data
      await this.loadStudentData(userId);

      // Render dashboard
      this.renderStats();
      this.renderCharts();
      this.renderActivityFeed();
      this.renderUpcomingLessons();
      this.renderAchievementShowcase();
      this.renderInsights();

      // Hide loading overlay
      this._hideLoading();

      // Setup event listeners
      this._setupEventListeners();

      console.log('Dashboard initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this._showError('Failed to load dashboard. Please refresh the page.');
    }
  },

  /**
   * Initialize teacher dashboard
   */
  async initTeacherDashboard() {
    this.isTeacher = true;

    console.log('Initializing teacher dashboard');

    this._showLoading();

    try {
      // Load class data
      await this.loadClassData();

      // Render teacher views
      this.renderClassOverview();
      this.renderClassCharts();
      this.renderStudentTable();
      this.renderQuarterBreakdown();
      this.renderAlerts();

      this._hideLoading();

      this._setupTeacherEventListeners();

      console.log('Teacher dashboard initialized');
    } catch (error) {
      console.error('Failed to initialize teacher dashboard:', error);
      this._showError('Failed to load class data. Please refresh the page.');
    }
  },

  /**
   * Load student data from API
   * @param {string} userId - User ID
   */
  async loadStudentData(userId) {
    try {
      // Fetch from Netlify function
      const response = await fetch(`/.netlify/functions/get-student-progress?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      this.userData = data;
      this._cache.progress = data.progress;
      this._cache.achievements = data.achievements;
      this._cache.calendar = data.upcomingLessons;
      this._cache.lastUpdated = new Date();

      return data;
    } catch (error) {
      console.error('Error loading student data:', error);
      // Fallback to localStorage/Supabase direct query
      return await this._loadStudentDataFallback(userId);
    }
  },

  /**
   * Fallback: Load student data directly from Supabase
   * @private
   */
  async _loadStudentDataFallback(userId) {
    if (!window.authManager?.supabase) {
      throw new Error('Supabase not available');
    }

    const supabase = window.authManager.supabase;

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get progress
    const { data: progress } = await supabase
      .from('progress')
      .select('*, lessons(*)')
      .eq('user_id', userId);

    // Get achievements
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId);

    // Get streak data from localStorage
    const streakData = window.StreakTracker?.getStreakData() || {
      currentStreak: 0,
      longestStreak: 0
    };

    this.userData = {
      profile,
      progress,
      achievements,
      streakData,
      stats: this._calculateStats(progress)
    };

    return this.userData;
  },

  /**
   * Load class data (teacher view)
   */
  async loadClassData() {
    try {
      const response = await fetch('/.netlify/functions/get-class-progress');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      this._cache.students = data.students;
      this._cache.classStats = data.classStats;
      this._cache.lastUpdated = new Date();

      return data;
    } catch (error) {
      console.error('Error loading class data:', error);
      return await this._loadClassDataFallback();
    }
  },

  /**
   * Fallback: Load class data directly
   * @private
   */
  async _loadClassDataFallback() {
    if (!window.authManager?.supabase) {
      throw new Error('Supabase not available');
    }

    const supabase = window.authManager.supabase;

    // Get all profiles
    const { data: students } = await supabase
      .from('profiles')
      .select('*')
      .order('username');

    // Get progress for each student
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        const { data: progress } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', student.id);

        const stats = this._calculateStats(progress);

        return {
          ...student,
          ...stats,
          lessonsCompleted: progress.filter(p => p.status === 'completed').length,
          completionRate: Math.round((stats.lessonsCompleted / 87) * 100),
          averageScore: stats.averageScore
        };
      })
    );

    const classStats = window.Analytics.calculateClassStats(studentsWithProgress);

    this._cache.students = studentsWithProgress;
    this._cache.classStats = classStats;

    return { students: studentsWithProgress, classStats };
  },

  /**
   * Calculate stats from progress data
   * @private
   */
  _calculateStats(progress) {
    if (!progress || progress.length === 0) {
      return {
        lessonsCompleted: 0,
        averageScore: 0,
        totalXP: 0,
        totalCoins: 0
      };
    }

    const completed = progress.filter(p => p.status === 'completed');

    return {
      lessonsCompleted: completed.length,
      averageScore: window.Analytics.calculateAverageScore(completed),
      totalXP: completed.reduce((sum, p) => sum + (p.xp_earned || 0), 0),
      totalCoins: completed.reduce((sum, p) => sum + (p.coins_earned || 0), 0)
    };
  },

  /**
   * Render stats cards
   */
  renderStats() {
    if (!this.userData) return;

    const { profile, progress, achievements, streakData, stats } = this.userData;

    // Welcome message
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg && profile) {
      welcomeMsg.textContent = `Welcome back, ${profile.username || profile.full_name || 'Student'}!`;
    }

    // Level
    const levelEl = document.getElementById('studentLevel');
    if (levelEl) {
      levelEl.textContent = profile?.level || 1;
    }

    // XP Progress
    const totalXP = profile?.total_xp || 0;
    const xpProgress = window.xpSystem?.getXPProgress(totalXP) || {
      xpInCurrentLevel: 0,
      xpNeededForNextLevel: 100,
      progressPercent: 0
    };

    const xpText = document.getElementById('xpText');
    const xpFill = document.getElementById('xpFill');

    if (xpText) {
      xpText.textContent = `${xpProgress.xpInCurrentLevel} / ${xpProgress.xpNeededForNextLevel} XP`;
    }
    if (xpFill) {
      xpFill.style.width = `${xpProgress.progressPercent}%`;
    }

    // Coins
    const coinsEl = document.getElementById('coinsAmount');
    if (coinsEl) {
      coinsEl.textContent = profile?.total_coins || 0;
    }

    // Lessons completed
    const lessonsCompleted = stats.lessonsCompleted;
    const lessonsCompletedEl = document.getElementById('lessonsCompleted');
    const lessonProgress = document.getElementById('lessonProgress');

    if (lessonsCompletedEl) {
      lessonsCompletedEl.textContent = `${lessonsCompleted} / 87`;
    }
    if (lessonProgress) {
      const percentage = Math.round((lessonsCompleted / 87) * 100);
      lessonProgress.style.width = `${percentage}%`;
    }

    // Current streak
    const currentStreak = streakData?.currentStreak || profile?.current_streak || 0;
    const streakEl = document.getElementById('currentStreak');
    const streakMsg = document.getElementById('streakMessage');

    if (streakEl) {
      streakEl.textContent = `${currentStreak} days`;
    }
    if (streakMsg && window.StreakTracker) {
      const status = window.StreakTracker.getStreakStatus();
      streakMsg.textContent = status.message;
    }

    // Total XP
    const totalXPEl = document.getElementById('totalXP');
    if (totalXPEl) {
      totalXPEl.textContent = totalXP.toLocaleString();
    }

    // Achievements
    const achievementsCount = document.getElementById('achievementsCount');
    if (achievementsCount && achievements) {
      achievementsCount.textContent = `${achievements.length} / 44`;
    }

    // Quarter progress
    const quarterProgress = window.Analytics.calculateQuarterProgress(progress);
    this._renderQuarterProgress(quarterProgress);

    // Update last updated time
    this._updateLastUpdatedTime();
  },

  /**
   * Render quarter progress bars
   * @private
   */
  _renderQuarterProgress(quarterProgress) {
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
      const data = quarterProgress[quarter];
      const progressText = document.getElementById(`${quarter.toLowerCase()}Progress`);
      const progressBar = document.getElementById(`${quarter.toLowerCase()}ProgressBar`);

      if (progressText) {
        progressText.textContent = `${data.completed} / ${data.total} lessons`;
      }
      if (progressBar) {
        progressBar.style.width = `${data.percentage}%`;
      }
    });
  },

  /**
   * Render charts
   */
  renderCharts() {
    if (!this.userData || !window.Charts) return;

    const { progress } = this.userData;

    // Progress over time chart
    const progressData = this._prepareProgressChartData(progress);
    if (progressData.length > 0) {
      window.Charts.createProgressChart('progressChart', progressData);
    }

    // Study time chart
    const studyTimeData = this._prepareStudyTimeData(progress);
    if (studyTimeData.length > 0) {
      window.Charts.createStudyTimeChart('studyTimeChart', studyTimeData);
    }
  },

  /**
   * Prepare progress chart data
   * @private
   */
  _prepareProgressChartData(progress) {
    if (!progress) return [];

    const completedLessons = progress
      .filter(p => p.completed_at)
      .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));

    if (completedLessons.length === 0) return [];

    // Group by date
    const dateMap = {};
    let cumulative = 0;

    completedLessons.forEach(lesson => {
      const date = new Date(lesson.completed_at).toISOString().split('T')[0];
      cumulative++;
      dateMap[date] = cumulative;
    });

    // Convert to array
    return Object.entries(dateMap).map(([date, count]) => ({
      date,
      lessonsCompleted: count
    }));
  },

  /**
   * Prepare study time data
   * @private
   */
  _prepareStudyTimeData(progress) {
    if (!progress) return [];

    const weekMap = {};

    progress.forEach(lesson => {
      if (!lesson.completed_at || !lesson.time_spent) return;

      const date = new Date(lesson.completed_at);
      const weekStart = this._getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weekMap[weekKey]) {
        weekMap[weekKey] = { week: this._formatWeek(weekStart), seconds: 0 };
      }

      weekMap[weekKey].seconds += lesson.time_spent;
    });

    // Convert to hours
    return Object.values(weekMap).map(w => ({
      week: w.week,
      hours: parseFloat((w.seconds / 3600).toFixed(1))
    }));
  },

  /**
   * Get week start date (Sunday)
   * @private
   */
  _getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  },

  /**
   * Format week label
   * @private
   */
  _formatWeek(date) {
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  },

  /**
   * Render activity feed
   */
  renderActivityFeed() {
    const feedEl = document.getElementById('activityFeed');
    if (!feedEl || !this.userData) return;

    const activities = this._getActivitiesFromProgress();

    if (activities.length === 0) {
      feedEl.innerHTML = '<div class="empty-state">No recent activity</div>';
      return;
    }

    feedEl.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-time">${activity.timeAgo}</div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Get activities from progress data
   * @private
   */
  _getActivitiesFromProgress() {
    if (!this.userData?.progress) return [];

    const activities = [];

    // Lesson completions
    this.userData.progress
      .filter(p => p.status === 'completed' && p.completed_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 10)
      .forEach(lesson => {
        const icon = lesson.score === 100 ? '⭐' : '✅';
        activities.push({
          type: 'lesson_complete',
          icon,
          title: `Completed lesson ${lesson.lesson_number}${lesson.score === 100 ? ' with perfect score!' : ''}`,
          timestamp: lesson.completed_at,
          timeAgo: window.Analytics._getTimeAgo(lesson.completed_at)
        });
      });

    // Achievements
    if (this.userData.achievements) {
      this.userData.achievements
        .slice(0, 5)
        .forEach(achievement => {
          activities.push({
            type: 'achievement',
            icon: '🏆',
            title: `Earned: ${achievement.achievements?.name || achievement.name}`,
            timestamp: achievement.earned_at,
            timeAgo: window.Analytics._getTimeAgo(achievement.earned_at)
          });
        });
    }

    // Sort by timestamp
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
  },

  /**
   * Render upcoming lessons
   */
  renderUpcomingLessons() {
    const listEl = document.getElementById('upcomingList');
    if (!listEl) return;

    const upcoming = this._getUpcomingLessons();

    if (upcoming.length === 0) {
      listEl.innerHTML = '<div class="empty-state">No upcoming lessons</div>';
      return;
    }

    listEl.innerHTML = upcoming.map(lesson => `
      <div class="upcoming-item">
        <div class="upcoming-date">
          <div class="date-day">${this._getDay(lesson.date)}</div>
          <div class="date-month">${this._getMonth(lesson.date)}</div>
        </div>
        <div class="upcoming-content">
          <div class="upcoming-title">Lesson ${lesson.lessonNumber}</div>
          <div class="upcoming-topic">${lesson.topic || 'Pre-Algebra'}</div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Get upcoming lessons
   * @private
   */
  _getUpcomingLessons() {
    // Use calendar data from cache or lesson scheduler
    if (this._cache.calendar) {
      return this._cache.calendar.slice(0, 3);
    }

    if (window.LessonScheduler) {
      const upcoming = window.LessonScheduler.getUpcomingLessons(3);
      return upcoming;
    }

    return [];
  },

  /**
   * Get day from date string
   * @private
   */
  _getDay(dateStr) {
    return new Date(dateStr).getDate();
  },

  /**
   * Get month from date string
   * @private
   */
  _getMonth(dateStr) {
    return new Date(dateStr).toLocaleString('default', { month: 'short' });
  },

  /**
   * Render achievement showcase
   */
  renderAchievementShowcase() {
    const showcaseEl = document.getElementById('achievementsShowcase');
    if (!showcaseEl) return;

    const achievements = this.userData?.achievements?.slice(0, 3) || [];

    if (achievements.length === 0) {
      showcaseEl.innerHTML = '<div class="empty-state">No achievements yet. Keep learning!</div>';
      return;
    }

    showcaseEl.innerHTML = achievements.map(ach => {
      const achievement = ach.achievements || ach;
      return `
        <div class="achievement-card">
          <div class="achievement-badge">${achievement.badge_icon || '🏆'}</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.description}</div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render insights
   */
  renderInsights() {
    const insightsEl = document.getElementById('insightsGrid');
    if (!insightsEl || !window.Analytics) return;

    const insights = window.Analytics.generateInsights({
      lessonsCompleted: this.userData?.stats?.lessonsCompleted || 0,
      currentStreak: this.userData?.streakData?.currentStreak || 0,
      averageScore: this.userData?.stats?.averageScore || 0,
      achievementsEarned: this.userData?.achievements?.length || 0
    });

    if (insights.length === 0) {
      insightsEl.innerHTML = '';
      return;
    }

    insightsEl.innerHTML = insights.map(insight => `
      <div class="insight-card ${insight.type}">
        <div class="insight-icon">${insight.icon}</div>
        <div class="insight-content">
          <div class="insight-title">${insight.title}</div>
          <div class="insight-message">${insight.message}</div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Render class overview (teacher)
   */
  renderClassOverview() {
    const stats = this._cache.classStats;
    if (!stats) return;

    this._updateElement('totalStudents', stats.totalStudents);
    this._updateElement('avgCompletion', stats.avgCompletion + '%');
    this._updateElement('avgScore', stats.avgScore + '%');
    this._updateElement('activeToday', stats.activeToday);
  },

  /**
   * Render class charts (teacher)
   */
  renderClassCharts() {
    // Implementation for teacher charts
    console.log('Rendering class charts');
  },

  /**
   * Render student table (teacher)
   */
  renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody || !this._cache.students) return;

    const students = this._cache.students;

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No students found</td></tr>';
      return;
    }

    tbody.innerHTML = students.map(student => `
      <tr>
        <td>${student.username || student.full_name}</td>
        <td>${student.level || 1}</td>
        <td>${student.lessonsCompleted || 0} / 87</td>
        <td>${student.averageScore || 0}%</td>
        <td>${student.current_streak || 0} days</td>
        <td>${this._formatDate(student.last_activity_date) || 'Never'}</td>
        <td>
          <button class="btn-icon-sm" onclick="Dashboard.viewStudent('${student.id}')">View</button>
        </td>
      </tr>
    `).join('');

    // Update count
    const countEl = document.getElementById('showingCount');
    if (countEl) {
      countEl.textContent = `Showing ${students.length} of ${students.length} students`;
    }
  },

  /**
   * Render quarter breakdown (teacher)
   */
  renderQuarterBreakdown() {
    // Implementation for quarter breakdown
    console.log('Rendering quarter breakdown');
  },

  /**
   * Render alerts for struggling students (teacher)
   */
  renderAlerts() {
    const alertSection = document.getElementById('alertSection');
    const alertList = document.getElementById('alertList');

    if (!alertSection || !alertList || !this._cache.students) return;

    const strugglingStudents = window.Analytics.identifyStrugglingStudents(this._cache.students);

    if (strugglingStudents.length === 0) {
      alertSection.style.display = 'none';
      return;
    }

    alertSection.style.display = 'block';
    alertList.innerHTML = strugglingStudents.map(student => `
      <div class="alert-item">
        <div class="alert-student">${student.username || student.full_name}</div>
        <div class="alert-reasons">
          ${student.reasons.map(reason => `<span class="alert-reason">${reason}</span>`).join('')}
        </div>
      </div>
    `).join('');
  },

  /**
   * View student details (teacher)
   */
  viewStudent(studentId) {
    console.log('View student:', studentId);
    // Implementation for student detail modal
  },

  /**
   * Refresh dashboard data
   */
  async refresh() {
    console.log('Refreshing dashboard...');

    try {
      if (this.isTeacher) {
        await this.loadClassData();
        this.renderClassOverview();
        this.renderStudentTable();
      } else {
        await this.loadStudentData(this.userId);
        this.renderStats();
        this.renderActivityFeed();
      }

      this._updateLastUpdatedTime();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  },

  /**
   * Refresh teacher data
   */
  async refreshTeacherData() {
    await this.loadClassData();
    this.renderClassOverview();
    this.renderStudentTable();
    this.renderAlerts();
    this._updateLastUpdatedTime();
  },

  /**
   * Export class data to CSV (teacher)
   */
  exportClassData() {
    if (!this._cache.students) return;

    const csv = this._convertToCSV(this._cache.students);
    this._downloadCSV(csv, 'class-progress-report.csv');
  },

  /**
   * Convert data to CSV
   * @private
   */
  _convertToCSV(students) {
    const headers = ['Name', 'Email', 'Level', 'Lessons Completed', 'Completion %', 'Avg Score', 'Current Streak', 'Last Active'];
    const rows = students.map(s => [
      s.username || s.full_name,
      s.email,
      s.level || 1,
      s.lessonsCompleted || 0,
      s.completionRate || 0,
      s.averageScore || 0,
      s.current_streak || 0,
      s.last_activity_date || 'Never'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },

  /**
   * Download CSV file
   * @private
   */
  _downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Format date
   * @private
   */
  _formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  },

  /**
   * Update element text content
   * @private
   */
  _updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  },

  /**
   * Update last updated time
   * @private
   */
  _updateLastUpdatedTime() {
    const el = document.getElementById('lastUpdated');
    if (el) {
      el.textContent = new Date().toLocaleTimeString();
    }
  },

  /**
   * Show loading overlay
   * @private
   */
  _showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
  },

  /**
   * Hide loading overlay
   * @private
   */
  _hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  /**
   * Show error message
   * @private
   */
  _showError(message) {
    console.error(message);
    alert(message); // TODO: Replace with better UI
  },

  /**
   * Setup event listeners
   * @private
   */
  _setupEventListeners() {
    // Chart period selector
    const periodSelect = document.getElementById('chartPeriodSelect');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        // Re-render chart with new period
        this.renderCharts();
      });
    }

    // Refresh activity button
    const refreshBtn = document.getElementById('refreshActivity');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.renderActivityFeed();
      });
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this._exportProgressReport();
      });
    }
  },

  /**
   * Setup teacher event listeners
   * @private
   */
  _setupTeacherEventListeners() {
    // Student search
    const searchInput = document.getElementById('studentSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this._filterStudents(e.target.value);
      });
    }

    // Sort controls
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this._sortStudents();
      });
    }
  },

  /**
   * Filter students by search term
   * @private
   */
  _filterStudents(searchTerm) {
    // Implementation
    console.log('Filter students:', searchTerm);
  },

  /**
   * Sort students
   * @private
   */
  _sortStudents() {
    // Implementation
    console.log('Sort students');
  },

  /**
   * Export progress report
   * @private
   */
  _exportProgressReport() {
    console.log('Exporting progress report');
    // TODO: Generate PDF report
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.Dashboard = Dashboard;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
}
