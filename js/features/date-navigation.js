/**
 * Date-Based Navigation UI
 *
 * PURPOSE: Display lessons in a calendar view with prominent "Today's Lesson"
 * FEATURES:
 * - Large "Today's Lesson" card (if class meets today)
 * - Weekly calendar view with lesson cards
 * - Past lessons review section
 * - Upcoming lessons preview
 * - Color-coded status indicators
 * - Direct navigation to lessons
 */

const DateNavigation = {
  // Current view state
  currentView: 'calendar', // 'calendar', 'list', 'today'

  /**
   * Initialize the date navigation UI
   */
  init() {
    console.log('📅 DateNavigation initializing...');

    // Wait for LessonScheduler to be ready
    if (!window.LessonScheduler) {
      console.error('❌ LessonScheduler not loaded!');
      return;
    }

    this.render();
    this.attachEventListeners();
  },

  /**
   * Render the complete navigation UI
   */
  render() {
    // Find or create container
    let container = document.getElementById('dateNavigation');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dateNavigation';
      container.className = 'date-navigation-container';

      // Insert after header
      const header = document.querySelector('.game-header');
      if (header && header.nextSibling) {
        header.parentNode.insertBefore(container, header.nextSibling);
      } else if (header) {
        header.parentNode.appendChild(container);
      }
    }

    // Render content based on view
    container.innerHTML = this.renderNavigation();
  },

  /**
   * Render the main navigation content
   */
  renderNavigation() {
    const todaysLesson = window.LessonScheduler.getTodaysLesson();
    const weekLessons = window.LessonScheduler.getCurrentWeekLessons();
    const upcoming = window.LessonScheduler.getUpcomingLessons(5);
    const past = window.LessonScheduler.getPastLessons(5);

    return `
      <div class="date-nav-header">
        <h2 class="date-nav-title">📚 Lesson Calendar</h2>
        <div class="date-nav-controls">
          <button class="btn-view" data-view="today" ${!todaysLesson ? 'disabled' : ''}>
            📍 Today
          </button>
          <button class="btn-view active" data-view="calendar">
            📅 Calendar
          </button>
          <button class="btn-view" data-view="list">
            📋 All Lessons
          </button>
        </div>
      </div>

      ${todaysLesson ? this.renderTodaysLesson(todaysLesson) : this.renderNoClassToday()}

      <div class="date-nav-sections">
        ${this.renderWeekView(weekLessons)}
        ${past.length > 0 ? this.renderPastLessons(past) : ''}
        ${upcoming.length > 0 ? this.renderUpcomingLessons(upcoming) : ''}
      </div>
    `;
  },

  /**
   * Render "Today's Lesson" prominent card
   */
  renderTodaysLesson(todaysLesson) {
    if (!todaysLesson) return '';

    const lesson = window.LessonScheduler.getLessonsByStatus().today[0];
    if (!lesson) return '';

    const metadata = window.ScheduleConfig.getLessonMetadata(lesson.lessonNumber);
    const isCompleted = lesson.status === 'completed';

    return `
      <div class="todays-lesson-card ${isCompleted ? 'completed' : ''}">
        <div class="todays-lesson-header">
          <div class="todays-lesson-badge">
            ${isCompleted ? '✅ COMPLETED' : '📍 TODAY\'S LESSON'}
          </div>
          <div class="todays-lesson-date">
            ${this.formatDateLong(lesson.date)}
          </div>
        </div>
        <div class="todays-lesson-content">
          <div class="todays-lesson-number">Lesson ${lesson.lessonNumber}</div>
          <h3 class="todays-lesson-title">${lesson.name}</h3>
          <div class="todays-lesson-meta">
            <span class="lesson-topic">${lesson.topic || 'Pre-Algebra'}</span>
            <span class="lesson-standard">${lesson.standard}</span>
          </div>
          ${metadata && metadata.videoId ? `
            <div class="todays-lesson-video">
              <span class="video-icon">🎥</span>
              <span class="video-text">Includes video lesson</span>
            </div>
          ` : ''}
        </div>
        <div class="todays-lesson-actions">
          ${!isCompleted ? `
            <button class="btn-start-lesson" data-lesson="${lesson.lessonNumber}" data-level="${lesson.levelId}">
              <span class="btn-icon">▶️</span>
              <span class="btn-text">Start Lesson</span>
            </button>
          ` : `
            <button class="btn-review-lesson" data-lesson="${lesson.lessonNumber}" data-level="${lesson.levelId}">
              <span class="btn-icon">🔄</span>
              <span class="btn-text">Review Lesson</span>
            </button>
          `}
        </div>
      </div>
    `;
  },

  /**
   * Render "No class today" message
   */
  renderNoClassToday() {
    const nextLesson = window.LessonScheduler.getUpcomingLessons(1)[0];

    return `
      <div class="no-class-today">
        <div class="no-class-icon">📅</div>
        <h3 class="no-class-title">No Class Today</h3>
        ${nextLesson ? `
          <p class="no-class-message">
            Your next lesson is <strong>${nextLesson.name}</strong>
            <br>on ${this.formatDateLong(nextLesson.date)}
          </p>
        ` : ''}
      </div>
    `;
  },

  /**
   * Render week view with all lessons this week
   */
  renderWeekView(weekLessons) {
    if (!weekLessons || weekLessons.length === 0) {
      return '';
    }

    const lessonCards = weekLessons.map(lesson => this.renderLessonCard(lesson)).join('');

    return `
      <div class="week-view-section">
        <h3 class="section-title">📅 This Week's Lessons</h3>
        <div class="lesson-cards-grid">
          ${lessonCards}
        </div>
      </div>
    `;
  },

  /**
   * Render past lessons section
   */
  renderPastLessons(pastLessons) {
    if (!pastLessons || pastLessons.length === 0) {
      return '';
    }

    const lessonCards = pastLessons.map(lesson => this.renderLessonCard(lesson)).join('');

    return `
      <div class="past-lessons-section">
        <h3 class="section-title">🔙 Past Lessons</h3>
        <div class="lesson-cards-grid">
          ${lessonCards}
        </div>
      </div>
    `;
  },

  /**
   * Render upcoming lessons section
   */
  renderUpcomingLessons(upcomingLessons) {
    if (!upcomingLessons || upcomingLessons.length === 0) {
      return '';
    }

    // Filter out today's lesson if it exists
    const filtered = upcomingLessons.filter(l => l.status !== 'today');
    if (filtered.length === 0) return '';

    const lessonCards = filtered.map(lesson => this.renderLessonCard(lesson)).join('');

    return `
      <div class="upcoming-lessons-section">
        <h3 class="section-title">📆 Coming Up</h3>
        <div class="lesson-cards-grid">
          ${lessonCards}
        </div>
      </div>
    `;
  },

  /**
   * Render a single lesson card
   */
  renderLessonCard(lesson) {
    const statusIcons = {
      'completed': '✅',
      'today': '📍',
      'available': '📖',
      'locked': '🔒'
    };

    const statusLabels = {
      'completed': 'Completed',
      'today': 'Today',
      'available': 'Available',
      'locked': 'Locked'
    };

    const statusIcon = statusIcons[lesson.status] || '📖';
    const statusLabel = statusLabels[lesson.status] || lesson.status;
    const canAccess = lesson.status === 'today' || lesson.status === 'available' || lesson.status === 'completed';

    return `
      <div class="lesson-card ${lesson.status}" data-lesson="${lesson.lessonNumber}">
        <div class="lesson-card-header">
          <div class="lesson-card-status">
            <span class="status-icon">${statusIcon}</span>
            <span class="status-label">${statusLabel}</span>
          </div>
          <div class="lesson-card-date">${this.formatDateShort(lesson.date)}</div>
        </div>
        <div class="lesson-card-body">
          <div class="lesson-card-number">Lesson ${lesson.lessonNumber}</div>
          <h4 class="lesson-card-title">${lesson.name}</h4>
          <div class="lesson-card-topic">${lesson.topic || 'Pre-Algebra'}</div>
        </div>
        <div class="lesson-card-footer">
          ${canAccess ? `
            <button class="btn-access-lesson" data-lesson="${lesson.lessonNumber}" data-level="${lesson.levelId}">
              ${lesson.status === 'completed' ? 'Review' : 'Start'}
            </button>
          ` : `
            <button class="btn-access-lesson" disabled>
              Available ${this.formatDateShort(lesson.date)}
            </button>
          `}
        </div>
      </div>
    `;
  },

  /**
   * Format date for display (long format)
   * @param {Date} date
   * @returns {string} "Friday, November 14, 2025"
   */
  formatDateLong(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Format date for display (short format)
   * @param {Date} date
   * @returns {string} "Nov 14"
   */
  formatDateShort(date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Handle view switching
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-view')) {
        const btn = e.target.closest('.btn-view');
        const view = btn.dataset.view;
        this.switchView(view);
      }
    });

    // Handle lesson start/access buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-start-lesson') ||
          e.target.closest('.btn-review-lesson') ||
          e.target.closest('.btn-access-lesson')) {
        const btn = e.target.closest('button');
        const lessonNumber = parseInt(btn.dataset.lesson);
        const levelId = parseInt(btn.dataset.level);

        if (levelId && window.game) {
          this.navigateToLesson(levelId);
        }
      }
    });
  },

  /**
   * Switch between different views
   */
  switchView(view) {
    this.currentView = view;

    // Update active button
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Re-render based on view
    // TODO: Implement different views (list, calendar, today)
    console.log(`Switched to ${view} view`);
  },

  /**
   * Navigate to a specific lesson
   */
  navigateToLesson(levelId) {
    console.log(`📖 Navigating to level ${levelId}...`);

    // Hide menu, show game
    const menuScreen = document.getElementById('menuScreen');
    const gameScreen = document.getElementById('gameScreen');

    if (menuScreen) menuScreen.classList.remove('active');
    if (gameScreen) gameScreen.classList.add('active');

    // Load the level
    if (window.game && window.game.loadLevel) {
      window.game.loadLevel(levelId);
    } else {
      console.error('❌ Game not available');
    }
  },

  /**
   * Refresh the navigation (call after completing a lesson)
   */
  refresh() {
    console.log('🔄 Refreshing date navigation...');
    this.render();
    this.attachEventListeners();
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other modules to load
    setTimeout(() => {
      DateNavigation.init();
    }, 100);
  });
} else {
  setTimeout(() => {
    DateNavigation.init();
  }, 100);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.DateNavigation = DateNavigation;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateNavigation;
}
