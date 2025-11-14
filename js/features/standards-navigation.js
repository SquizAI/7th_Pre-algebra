/**
 * Florida Standards Navigation Component
 *
 * PURPOSE: Organize lessons by date and Florida Standard
 * Provides side navigation for teachers to see curriculum pacing
 */

const StandardsNavigation = {
  // Curriculum data with dates and standards
  curriculum: [
    {
      id: 'week-1-2',
      startDate: '2025-11-13',
      endDate: '2025-11-24',
      standard: 'MA.8.AR.2.1',
      title: 'Multi-Step Linear Equations',
      description: 'Solve multi-step linear equations with variables on both sides',
      worlds: [1, 2, 3], // Castle, Forest, Mountain
      levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      status: 'active' // active, upcoming, completed
    },
    {
      id: 'week-3',
      startDate: null, // TBD - add date when ready
      endDate: null,
      standard: 'MA.8.AR.2.2',
      title: 'Linear Inequalities',
      description: 'Solve two-step linear inequalities in one variable',
      worlds: [], // To be created
      levels: [],
      status: 'upcoming'
    },
    {
      id: 'week-4',
      startDate: null,
      endDate: null,
      standard: 'MA.8.AR.3.1',
      title: 'Systems of Equations',
      description: 'Determine solutions to systems of linear equations',
      worlds: [],
      levels: [],
      status: 'upcoming'
    }
  ],

  /**
   * Initialize the standards navigation
   */
  init() {
    this.createNavigationUI();
    this.attachEventListeners();
  },

  /**
   * Create the navigation UI in the DOM
   */
  createNavigationUI() {
    // Check if navigation already exists
    if (document.getElementById('standardsNav')) return;

    const app = document.getElementById('app');
    if (!app) return;

    // Create wrapper layout structure
    const appLayout = document.createElement('div');
    appLayout.className = 'app-layout';

    // Create sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'standardsNav';
    sidebar.className = 'app-sidebar';
    sidebar.innerHTML = `
      <div class="standards-nav-header">
        <h3>📅 Curriculum Standards</h3>
        <button class="nav-toggle" id="toggleStandardsNav" aria-label="Toggle navigation">
          <span class="toggle-icon">◀</span>
        </button>
      </div>
      <div class="standards-nav-content" id="standardsNavContent">
        ${this.renderCurriculumList()}
      </div>
    `;

    // Create main content area
    const mainArea = document.createElement('div');
    mainArea.className = 'app-main';
    mainArea.id = 'appMain';

    // Move all existing children of #app into mainArea
    while (app.firstChild) {
      mainArea.appendChild(app.firstChild);
    }

    // Build new structure
    appLayout.appendChild(sidebar);
    appLayout.appendChild(mainArea);
    app.appendChild(appLayout);

    // Create mobile overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    overlay.id = 'mobileNavOverlay';
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
    app.appendChild(overlay);

    // Create hamburger button for mobile
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-btn';
    hamburger.id = 'hamburgerBtn';
    hamburger.innerHTML = '<span>☰</span>';
    hamburger.setAttribute('aria-label', 'Open navigation menu');
    hamburger.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('active');
    });
    app.appendChild(hamburger);
  },

  /**
   * Render the curriculum list
   */
  renderCurriculumList() {
    const today = new Date().toISOString().split('T')[0];

    return this.curriculum.map(item => {
      const isCurrent = item.startDate && item.endDate &&
                       today >= item.startDate && today <= item.endDate;
      const isPast = item.endDate && today > item.endDate;

      let statusClass = 'upcoming';
      let statusIcon = '⏳';
      if (isCurrent) {
        statusClass = 'current';
        statusIcon = '▶️';
      } else if (isPast) {
        statusClass = 'completed';
        statusIcon = '✅';
      }

      const dateRange = item.startDate && item.endDate
        ? `${this.formatDate(item.startDate)} - ${this.formatDate(item.endDate)}`
        : 'Date TBD';

      return `
        <div class="standard-item ${statusClass}" data-standard-id="${item.id}">
          <div class="standard-status">${statusIcon}</div>
          <div class="standard-info">
            <div class="standard-code">${item.standard}</div>
            <div class="standard-title">${item.title}</div>
            <div class="standard-dates">${dateRange}</div>
            <div class="standard-description">${item.description}</div>
            ${item.levels.length > 0 ? `
              <div class="standard-progress">
                <span class="progress-label">Levels:</span>
                <span class="progress-value">${item.levels.join(', ')}</span>
              </div>
            ` : ''}
            ${item.status === 'active' ? `
              <button class="btn-goto-standard" data-levels="${item.levels.join(',')}">
                Go to Lessons
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle navigation open/closed
    const toggleBtn = document.getElementById('toggleStandardsNav');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleNavigation();
      });
    }

    // Handle "Go to Lessons" buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-goto-standard')) {
        const levels = e.target.dataset.levels.split(',').map(Number);
        this.navigateToStandard(levels);
      }
    });
  },

  /**
   * Toggle navigation open/closed
   */
  toggleNavigation() {
    const nav = document.getElementById('standardsNav');
    const icon = document.querySelector('.toggle-icon');
    const overlay = document.getElementById('mobileNavOverlay');

    if (!nav) return;

    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // On mobile: toggle open state and overlay
      const isOpen = nav.classList.contains('open');
      if (isOpen) {
        nav.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
      } else {
        nav.classList.add('open');
        if (overlay) overlay.classList.add('active');
      }
    } else {
      // On desktop: toggle collapsed state
      nav.classList.toggle('collapsed');
      if (icon) {
        icon.textContent = nav.classList.contains('collapsed') ? '▶' : '◀';
      }
    }
  },

  /**
   * Navigate to a specific standard's lessons
   */
  navigateToStandard(levels) {
    if (levels && levels.length > 0) {
      // Switch to Story Mode and start first level of this standard
      const menuScreen = document.getElementById('menuScreen');
      const storyScreen = document.getElementById('storyModeScreen');

      if (menuScreen && storyScreen) {
        menuScreen.classList.remove('active');
        storyScreen.classList.add('active');

        // If game object exists, load the first level
        if (window.game && window.game.loadLevel) {
          window.game.loadLevel(levels[0]);
        }
      }
    }
  },

  /**
   * Add a new standard to the curriculum
   * (Called by lesson-creator-agent)
   */
  addStandard(standardData) {
    this.curriculum.push({
      id: standardData.id || `standard-${Date.now()}`,
      startDate: standardData.startDate,
      endDate: standardData.endDate,
      standard: standardData.code,
      title: standardData.title,
      description: standardData.description,
      worlds: standardData.worlds || [],
      levels: standardData.levels || [],
      status: standardData.status || 'upcoming'
    });

    // Re-render navigation
    const content = document.getElementById('standardsNavContent');
    if (content) {
      content.innerHTML = this.renderCurriculumList();
    }

    // Save to localStorage
    this.saveCurriculum();
  },

  /**
   * Update an existing standard
   */
  updateStandard(standardId, updates) {
    const index = this.curriculum.findIndex(item => item.id === standardId);
    if (index !== -1) {
      this.curriculum[index] = { ...this.curriculum[index], ...updates };

      // Re-render navigation
      const content = document.getElementById('standardsNavContent');
      if (content) {
        content.innerHTML = this.renderCurriculumList();
      }

      // Save to localStorage
      this.saveCurriculum();
    }
  },

  /**
   * Save curriculum data to localStorage
   */
  saveCurriculum() {
    try {
      localStorage.setItem('curriculumData', JSON.stringify(this.curriculum));
    } catch (e) {
      console.error('Failed to save curriculum:', e);
    }
  },

  /**
   * Load curriculum data from localStorage
   */
  loadCurriculum() {
    try {
      const saved = localStorage.getItem('curriculumData');
      if (saved) {
        this.curriculum = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load curriculum:', e);
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    StandardsNavigation.loadCurriculum();
    StandardsNavigation.init();
  });
} else {
  StandardsNavigation.loadCurriculum();
  StandardsNavigation.init();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.StandardsNavigation = StandardsNavigation;
}
