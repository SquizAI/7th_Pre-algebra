/**
 * Lesson Preview Modal
 *
 * PURPOSE: Display lesson preview when user clicks a lesson node
 * FEATURES:
 * - Show lesson details (number, title, standard, objectives, date)
 * - Display requirements for locked lessons
 * - Provide "Start Lesson" button for available lessons
 * - Show score and stars for completed lessons
 */

const LessonPreview = {
  // Modal element
  modal: null,

  /**
   * Initialize the preview modal
   */
  init() {
    this.createModal();
    console.log('👁️ LessonPreview initialized');
  },

  /**
   * Create modal HTML
   */
  createModal() {
    // Remove existing modal if any
    const existing = document.getElementById('lessonPreviewModal');
    if (existing) {
      existing.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'lessonPreviewModal';
    modal.className = 'lesson-preview-modal';
    modal.innerHTML = `
      <div class="lesson-preview-overlay" role="button" aria-label="Close modal"></div>
      <div class="lesson-preview-content" role="dialog" aria-labelledby="previewTitle" aria-modal="true">
        <button class="lesson-preview-close" aria-label="Close preview">×</button>
        <div class="lesson-preview-body">
          <!-- Content will be injected here -->
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;

    // Add event listeners
    modal.querySelector('.lesson-preview-overlay').addEventListener('click', () => this.hide());
    modal.querySelector('.lesson-preview-close').addEventListener('click', () => this.hide());

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.hide();
      }
    });
  },

  /**
   * Show preview for a lesson
   * @param {Object} lesson - Lesson data
   */
  show(lesson) {
    if (!this.modal) {
      this.init();
    }

    const status = SkillTree.getLessonStatus(lesson.lesson_number);
    const score = SkillTree.getLessonScore(lesson.lesson_number);

    const body = this.modal.querySelector('.lesson-preview-body');
    body.innerHTML = this.renderPreviewContent(lesson, status, score);

    // Add button listeners
    const startBtn = body.querySelector('.btn-start-lesson');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startLesson(lesson));
    }

    const viewBtn = body.querySelector('.btn-view-lesson');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => this.viewLesson(lesson));
    }

    // Show modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus on close button for accessibility
    setTimeout(() => {
      this.modal.querySelector('.lesson-preview-close').focus();
    }, 100);
  },

  /**
   * Hide the modal
   */
  hide() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * Render preview content
   * @param {Object} lesson - Lesson data
   * @param {string} status - Lesson status
   * @param {Object} score - Score data
   * @returns {string} HTML content
   */
  renderPreviewContent(lesson, status, score) {
    const lessonNumber = lesson.lesson_number;
    const title = lesson.lesson_topic || lesson.title || 'Lesson';
    const standard = lesson.standard_code || lesson.standard || '';
    const standardTitle = lesson.standard_details?.title || lesson.standard_title || '';
    const objectives = lesson.learning_objectives || lesson.objectives || [];
    const date = lesson.date || lesson.b_day_date || '';
    const quarter = lesson.quarter || '';
    const unit = lesson.unit_name || '';

    // Status badge
    let statusBadgeHtml = '';
    if (status === 'locked') {
      statusBadgeHtml = '<span class="status-badge status-badge--locked">🔒 Locked</span>';
    } else if (status === 'available') {
      statusBadgeHtml = '<span class="status-badge status-badge--available">📘 Ready to Start</span>';
    } else if (status === 'current') {
      statusBadgeHtml = '<span class="status-badge status-badge--current">⭐ Current Lesson</span>';
    } else if (status === 'completed') {
      statusBadgeHtml = '<span class="status-badge status-badge--completed">✓ Completed</span>';
    }

    // Stars for completed
    let starsHtml = '';
    if (status === 'completed' && score.stars > 0) {
      starsHtml = `
        <div class="lesson-score">
          <div class="score-stars">${'⭐'.repeat(score.stars)}</div>
          <div class="score-value">${score.score}% Score</div>
        </div>
      `;
    }

    // Requirements for locked lessons
    let requirementsHtml = '';
    if (status === 'locked') {
      const requiredLesson = lessonNumber - 1;
      requirementsHtml = `
        <div class="lesson-requirements">
          <h4>Requirements:</h4>
          <p>Complete <strong>Lesson ${requiredLesson}</strong> to unlock this lesson.</p>
        </div>
      `;
    }

    // Objectives list
    let objectivesHtml = '';
    if (objectives.length > 0) {
      objectivesHtml = `
        <div class="lesson-objectives">
          <h4>Learning Objectives:</h4>
          <ul>
            ${objectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Action buttons
    let actionsHtml = '';
    if (status === 'available' || status === 'current') {
      actionsHtml = `
        <div class="lesson-actions">
          <button class="btn btn-primary btn-start-lesson">
            <span>▶️</span> Start Lesson
          </button>
        </div>
      `;
    } else if (status === 'completed') {
      actionsHtml = `
        <div class="lesson-actions">
          <button class="btn btn-secondary btn-view-lesson">
            <span>👁️</span> Review Lesson
          </button>
        </div>
      `;
    }

    return `
      <div class="lesson-preview-header">
        <div class="lesson-preview-number">Lesson ${lessonNumber}</div>
        <h3 id="previewTitle" class="lesson-preview-title">${title}</h3>
        ${statusBadgeHtml}
      </div>

      <div class="lesson-preview-meta">
        ${quarter ? `<div class="meta-item"><strong>Quarter:</strong> ${quarter}</div>` : ''}
        ${unit ? `<div class="meta-item"><strong>Unit:</strong> ${unit}</div>` : ''}
        ${date ? `<div class="meta-item"><strong>Date:</strong> ${date}</div>` : ''}
        ${standard ? `<div class="meta-item"><strong>Standard:</strong> ${standard}</div>` : ''}
      </div>

      ${standardTitle ? `
        <div class="lesson-standard-description">
          <p>${standardTitle}</p>
        </div>
      ` : ''}

      ${starsHtml}
      ${requirementsHtml}
      ${objectivesHtml}
      ${actionsHtml}
    `;
  },

  /**
   * Start a lesson
   * @param {Object} lesson - Lesson data
   */
  startLesson(lesson) {
    console.log('▶️ Starting lesson:', lesson.lesson_number);

    // Navigate to lesson player
    const lessonNumber = lesson.lesson_number;

    // Check if lesson exists
    // For now, we'll just show an alert
    // In production, this would navigate to the actual lesson
    this.hide();

    // Try to launch lesson player
    window.location.href = `/lesson-player.html?lesson=${lessonNumber}`;
  },

  /**
   * View/review a completed lesson
   * @param {Object} lesson - Lesson data
   */
  viewLesson(lesson) {
    console.log('👁️ Viewing lesson:', lesson.lesson_number);
    this.hide();

    // Navigate to lesson player in review mode
    window.location.href = `/lesson-player.html?lesson=${lesson.lesson_number}&mode=review`;
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('lesson-map')) {
      LessonPreview.init();
    }
  });
} else {
  if (window.location.pathname.includes('lesson-map')) {
    LessonPreview.init();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonPreview;
}
