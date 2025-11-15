/**
 * Skill Tree Renderer - Visual Components
 *
 * PURPOSE: Render the Duolingo-style visual skill tree
 * FEATURES:
 * - Render lesson nodes with status colors
 * - Draw connecting paths between lessons
 * - Create unit and quarter banners
 * - Handle animations (pulse, bounce, glow)
 */

const SkillTreeRenderer = {
  // Container element
  container: null,

  // Theme colors
  colors: {
    locked: '#9CA3AF',      // Gray
    available: '#3B82F6',   // Blue
    current: '#F59E0B',     // Gold
    completed: '#10B981',   // Green
    path: '#E5E7EB'         // Light gray for paths
  },

  // Unit themes (for variety)
  unitThemes: [
    { name: 'Castle', color: '#8B5CF6', icon: '🏰' },
    { name: 'Forest', color: '#059669', icon: '🌲' },
    { name: 'Mountain', color: '#0EA5E9', icon: '⛰️' },
    { name: 'Desert', color: '#F59E0B', icon: '🏜️' },
    { name: 'Ocean', color: '#06B6D4', icon: '🌊' },
    { name: 'Sky', color: '#6366F1', icon: '☁️' },
    { name: 'Cave', color: '#78716C', icon: '🕳️' },
    { name: 'Garden', color: '#84CC16', icon: '🌸' },
    { name: 'Temple', color: '#DC2626', icon: '⛩️' },
    { name: 'Library', color: '#7C3AED', icon: '📚' }
  ],

  /**
   * Initialize the renderer
   * @param {string} containerId - ID of container element
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('❌ Container not found:', containerId);
      return;
    }
    console.log('🎨 SkillTreeRenderer initialized');
  },

  /**
   * Render the complete skill tree
   * @param {Array} lessons - Array of lesson objects
   */
  renderSkillTree(lessons) {
    if (!this.container) {
      console.error('❌ Renderer not initialized');
      return;
    }

    // Clear container
    this.container.innerHTML = '';

    // Group lessons by quarter and unit
    const grouped = this.groupLessons(lessons);

    // Render each quarter
    Object.keys(grouped).forEach(quarter => {
      const quarterEl = this.renderQuarterSection(quarter, grouped[quarter]);
      this.container.appendChild(quarterEl);
    });
  },

  /**
   * Group lessons by quarter and unit
   * @param {Array} lessons - Lesson array
   * @returns {Object} Grouped lessons
   */
  groupLessons(lessons) {
    const grouped = {};

    lessons.forEach(lesson => {
      const quarter = lesson.quarter || 'Q1';
      const unit = lesson.unit_number || 1;

      if (!grouped[quarter]) {
        grouped[quarter] = {};
      }

      if (!grouped[quarter][unit]) {
        grouped[quarter][unit] = {
          unitName: lesson.unit_name || `Unit ${unit}`,
          lessons: []
        };
      }

      grouped[quarter][unit].lessons.push(lesson);
    });

    return grouped;
  },

  /**
   * Render a quarter section
   * @param {string} quarter - Quarter name (Q1, Q2, etc.)
   * @param {Object} units - Units data
   * @returns {HTMLElement} Quarter section element
   */
  renderQuarterSection(quarter, units) {
    const section = document.createElement('div');
    section.className = 'skill-tree-quarter';
    section.setAttribute('data-quarter', quarter);

    // Quarter banner
    const banner = this.renderQuarterBanner(quarter);
    section.appendChild(banner);

    // Units container
    const unitsContainer = document.createElement('div');
    unitsContainer.className = 'skill-tree-units';

    // Render each unit
    Object.keys(units).sort((a, b) => a - b).forEach((unitNum, index) => {
      const unitData = units[unitNum];
      const unitEl = this.renderUnitSection(unitNum, unitData, index);
      unitsContainer.appendChild(unitEl);
    });

    section.appendChild(unitsContainer);

    return section;
  },

  /**
   * Render quarter banner
   * @param {string} quarter - Quarter name
   * @returns {HTMLElement} Banner element
   */
  renderQuarterBanner(quarter) {
    const banner = document.createElement('div');
    banner.className = 'quarter-banner';

    const quarterNames = {
      'Q1': 'First Quarter',
      'Q2': 'Second Quarter',
      'Q3': 'Third Quarter',
      'Q4': 'Fourth Quarter'
    };

    banner.innerHTML = `
      <div class="quarter-banner-content">
        <span class="quarter-icon">📅</span>
        <h2 class="quarter-title">${quarterNames[quarter] || quarter}</h2>
      </div>
    `;

    return banner;
  },

  /**
   * Render a unit section
   * @param {number} unitNum - Unit number
   * @param {Object} unitData - Unit data with lessons
   * @param {number} themeIndex - Index for theme selection
   * @returns {HTMLElement} Unit section element
   */
  renderUnitSection(unitNum, unitData, themeIndex) {
    const section = document.createElement('div');
    section.className = 'skill-tree-unit';
    section.setAttribute('data-unit', unitNum);

    const theme = this.unitThemes[themeIndex % this.unitThemes.length];

    // Unit banner
    const banner = this.renderUnitBanner(unitNum, unitData.unitName, theme);
    section.appendChild(banner);

    // Lesson path
    const path = document.createElement('div');
    path.className = 'lesson-path';

    // Render lessons
    unitData.lessons.forEach((lesson, index) => {
      const lessonNode = this.renderLessonNode(lesson, index);
      path.appendChild(lessonNode);

      // Add connecting line (except for last lesson)
      if (index < unitData.lessons.length - 1) {
        const connector = this.renderPath(lesson);
        path.appendChild(connector);
      }
    });

    section.appendChild(path);

    return section;
  },

  /**
   * Render unit banner
   * @param {number} unitNum - Unit number
   * @param {string} unitName - Unit name
   * @param {Object} theme - Theme object
   * @returns {HTMLElement} Banner element
   */
  renderUnitBanner(unitNum, unitName, theme) {
    const banner = document.createElement('div');
    banner.className = 'unit-banner';
    banner.style.background = `linear-gradient(135deg, ${theme.color}, ${theme.color}dd)`;

    banner.innerHTML = `
      <div class="unit-banner-content">
        <span class="unit-icon" aria-hidden="true">${theme.icon}</span>
        <div class="unit-info">
          <div class="unit-number">Unit ${unitNum}</div>
          <div class="unit-name">${unitName}</div>
        </div>
      </div>
    `;

    return banner;
  },

  /**
   * Render a lesson node
   * @param {Object} lesson - Lesson data
   * @param {number} positionIndex - Position in unit
   * @returns {HTMLElement} Lesson node element
   */
  renderLessonNode(lesson, positionIndex) {
    const status = SkillTree.getLessonStatus(lesson.lesson_number);
    const score = SkillTree.getLessonScore(lesson.lesson_number);

    const node = document.createElement('div');
    node.className = `lesson-node lesson-node--${status}`;
    node.setAttribute('data-lesson', lesson.lesson_number);
    node.setAttribute('data-status', status);

    // Alternate left/right positioning
    const position = positionIndex % 2 === 0 ? 'left' : 'right';
    node.classList.add(`lesson-node--${position}`);

    // Status icon
    let statusIcon = '';
    if (status === 'locked') statusIcon = '🔒';
    else if (status === 'available') statusIcon = '📘';
    else if (status === 'current') statusIcon = '⭐';
    else if (status === 'completed') statusIcon = '✓';

    // Stars for completed lessons
    let starsHtml = '';
    if (status === 'completed' && score.stars > 0) {
      starsHtml = `
        <div class="lesson-stars">
          ${'⭐'.repeat(score.stars)}
        </div>
      `;
    }

    node.innerHTML = `
      <div class="lesson-node-circle">
        <span class="lesson-status-icon" aria-hidden="true">${statusIcon}</span>
        <span class="lesson-number">${lesson.lesson_number}</span>
      </div>
      <div class="lesson-node-label">
        <div class="lesson-title">${this.truncate(lesson.lesson_topic || lesson.title || 'Lesson', 30)}</div>
        <div class="lesson-standard">${lesson.standard_code || lesson.standard || ''}</div>
        ${starsHtml}
      </div>
    `;

    // Make clickable if available or completed
    if (status === 'available' || status === 'current' || status === 'completed') {
      node.style.cursor = 'pointer';
      node.addEventListener('click', () => {
        this.handleLessonClick(lesson);
      });
    }

    // Add animations
    if (status === 'current') {
      node.classList.add('lesson-node--pulse');
    }

    return node;
  },

  /**
   * Render connecting path
   * @param {Object} lesson - Current lesson
   * @returns {HTMLElement} Path element
   */
  renderPath(lesson) {
    const nextLesson = lesson.lesson_number + 1;
    const nextStatus = SkillTree.getLessonStatus(nextLesson);

    const path = document.createElement('div');
    path.className = 'lesson-connector';

    // Dotted line for locked paths, solid for unlocked
    if (nextStatus === 'locked') {
      path.classList.add('lesson-connector--locked');
    } else {
      path.classList.add('lesson-connector--unlocked');
    }

    return path;
  },

  /**
   * Handle lesson node click
   * @param {Object} lesson - Lesson data
   */
  handleLessonClick(lesson) {
    console.log('📘 Lesson clicked:', lesson.lesson_number);

    // Show preview modal
    if (window.LessonPreview) {
      window.LessonPreview.show(lesson);
    }
  },

  /**
   * Scroll to current lesson
   */
  scrollToCurrentLesson() {
    const currentNode = this.container?.querySelector('.lesson-node--current');
    if (currentNode) {
      currentNode.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Add bounce animation
      currentNode.classList.add('lesson-node--bounce');
      setTimeout(() => {
        currentNode.classList.remove('lesson-node--bounce');
      }, 1000);
    }
  },

  /**
   * Update lesson status
   * @param {number} lessonNumber - Lesson number
   */
  updateLessonNode(lessonNumber) {
    const node = this.container?.querySelector(`[data-lesson="${lessonNumber}"]`);
    if (!node) return;

    const status = SkillTree.getLessonStatus(lessonNumber);
    const score = SkillTree.getLessonScore(lessonNumber);

    // Update classes
    node.className = `lesson-node lesson-node--${status}`;
    node.setAttribute('data-status', status);

    // Update icon
    const iconEl = node.querySelector('.lesson-status-icon');
    if (iconEl) {
      if (status === 'locked') iconEl.textContent = '🔒';
      else if (status === 'available') iconEl.textContent = '📘';
      else if (status === 'current') iconEl.textContent = '⭐';
      else if (status === 'completed') iconEl.textContent = '✓';
    }

    // Add stars for completed
    if (status === 'completed' && score.stars > 0) {
      const labelEl = node.querySelector('.lesson-node-label');
      if (labelEl && !labelEl.querySelector('.lesson-stars')) {
        const starsDiv = document.createElement('div');
        starsDiv.className = 'lesson-stars';
        starsDiv.innerHTML = '⭐'.repeat(score.stars);
        labelEl.appendChild(starsDiv);
      }
    }
  },

  /**
   * Truncate text
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillTreeRenderer;
}
