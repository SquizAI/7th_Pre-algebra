/**
 * Streak Display UI
 *
 * PURPOSE: Display streak information and animations
 * FEATURES:
 * - Flame emoji with streak count in navbar
 * - Streak status messages
 * - Milestone celebration animations (confetti)
 * - Streak freeze warning
 * - Calendar view with activity squares
 */

const StreakDisplay = {
  // Animation state
  _confettiActive: false,

  /**
   * Initialize streak display
   */
  init() {
    console.log('🔥 StreakDisplay initializing...');
    this.createStreakElements();
    this.updateDisplay();
    this.setupEventListeners();
  },

  /**
   * Create streak display elements in navbar
   */
  createStreakElements() {
    const playerStats = document.querySelector('.player-stats');
    if (!playerStats) {
      console.warn('⚠️ Player stats container not found');
      return;
    }

    // Create streak stat item
    const streakItem = document.createElement('div');
    streakItem.className = 'stat-item streak-stat';
    streakItem.innerHTML = `
      <span class="stat-label" aria-hidden="true">🔥</span>
      <span class="stat-value" id="streakCount" aria-live="polite">0</span>
      <span class="stat-label">day streak</span>
    `;

    // Insert after coins
    const coinsItem = playerStats.querySelector('.stat-item:last-child');
    if (coinsItem) {
      coinsItem.insertAdjacentElement('afterend', streakItem);
    } else {
      playerStats.appendChild(streakItem);
    }

    // Create streak status container (below header)
    const header = document.querySelector('.game-header');
    if (header) {
      const statusContainer = document.createElement('div');
      statusContainer.id = 'streakStatusContainer';
      statusContainer.className = 'streak-status-container';
      statusContainer.style.display = 'none';
      header.insertAdjacentElement('afterend', statusContainer);
    }
  },

  /**
   * Update streak display with current data
   */
  updateDisplay() {
    if (!window.StreakTracker) {
      console.warn('⚠️ StreakTracker not available');
      return;
    }

    const status = window.StreakTracker.getStreakStatus();

    // Update streak count in navbar
    const streakCountEl = document.getElementById('streakCount');
    if (streakCountEl) {
      streakCountEl.textContent = status.currentStreak;

      // Add pulsing animation for active streaks
      const streakStat = streakCountEl.closest('.streak-stat');
      if (status.currentStreak > 0) {
        streakStat?.classList.add('streak-active');
      } else {
        streakStat?.classList.remove('streak-active');
      }
    }

    // Update status message
    this.updateStatusMessage(status);
  },

  /**
   * Update streak status message
   * @param {object} status - Streak status from StreakTracker
   */
  updateStatusMessage(status) {
    const container = document.getElementById('streakStatusContainer');
    if (!container) return;

    // Only show message if there's something important
    if (status.status === 'none' || status.status === 'safe') {
      container.style.display = 'none';
      return;
    }

    let messageHTML = '';
    let className = '';

    if (status.status === 'at-risk') {
      className = 'streak-warning';
      messageHTML = `
        <div class="streak-warning-content">
          <span class="warning-icon" aria-hidden="true">⚠️</span>
          <span class="warning-text">${status.message}</span>
        </div>
      `;
    } else if (status.status === 'completed-today') {
      className = 'streak-success';
      messageHTML = `
        <div class="streak-success-content">
          <span class="success-icon" aria-hidden="true">🔥</span>
          <span class="success-text">${status.message}</span>
          ${status.nextMilestone ? `
            <span class="milestone-progress">
              ${status.daysUntilMilestone} more ${status.daysUntilMilestone === 1 ? 'day' : 'days'}
              to ${status.nextMilestone}-day milestone!
            </span>
          ` : ''}
        </div>
      `;
    }

    container.className = `streak-status-container ${className}`;
    container.innerHTML = messageHTML;
    container.style.display = 'block';
  },

  /**
   * Show streak milestone celebration
   * @param {number} milestone - Milestone reached (3, 7, 14, 30, etc.)
   * @param {object} rewards - Bonus XP/coins
   */
  showMilestoneCelebration(milestone, rewards) {
    console.log(`🎉 Celebrating ${milestone}-day milestone!`);

    // Show confetti animation for major milestones
    if (milestone >= 7) {
      this.triggerConfetti();
    }

    // Create celebration modal
    const modal = document.createElement('div');
    modal.className = 'modal streak-celebration-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content celebration-content">
        <div class="celebration-animation" aria-hidden="true">
          🔥🔥🔥
        </div>
        <h2 class="celebration-title">${milestone}-Day Streak!</h2>
        <p class="celebration-message">${rewards.message}</p>
        <div class="celebration-rewards">
          <div class="reward-badge">
            <span class="reward-icon" aria-hidden="true">⭐</span>
            <span class="reward-amount">+${rewards.xp} XP</span>
          </div>
          <div class="reward-badge">
            <span class="reward-icon" aria-hidden="true">🪙</span>
            <span class="reward-amount">+${rewards.coins} Coins</span>
          </div>
        </div>
        <button class="btn btn-lg btn-primary celebration-continue" id="celebrationContinue">
          Keep the Streak Going! 🚀
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle continue button
    const continueBtn = modal.querySelector('#celebrationContinue');
    continueBtn?.addEventListener('click', () => {
      modal.remove();
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 10000);
  },

  /**
   * Trigger confetti animation
   */
  triggerConfetti() {
    if (this._confettiActive) return;

    this._confettiActive = true;
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.setAttribute('aria-hidden', 'true');

    // Create confetti pieces
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 3}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 3}s`;
      confettiContainer.appendChild(confetti);
    }

    document.body.appendChild(confettiContainer);

    // Remove after animation completes
    setTimeout(() => {
      confettiContainer.remove();
      this._confettiActive = false;
    }, 5000);
  },

  /**
   * Show calendar view with activity squares
   */
  showCalendarView() {
    if (!window.StreakTracker) return;

    const calendarData = window.StreakTracker.getCalendarView(90);
    const modal = document.createElement('div');
    modal.className = 'modal calendar-modal';
    modal.style.display = 'flex';

    // Group by weeks
    const weeks = [];
    let currentWeek = [];

    calendarData.forEach((day, index) => {
      if (day.dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Generate calendar HTML
    const calendarHTML = weeks.map(week => {
      const daysHTML = week.map(day => {
        let className = 'calendar-day';
        if (day.isToday) className += ' today';
        if (day.completed) className += ' completed';
        if (!day.isBDay) className += ' not-bday';

        const title = day.isBDay
          ? (day.completed ? 'Completed' : 'B-day (not completed)')
          : 'Not a B-day';

        return `
          <div class="${className}"
               title="${day.date} - ${title}"
               data-date="${day.date}">
          </div>
        `;
      }).join('');

      return `<div class="calendar-week">${daysHTML}</div>`;
    }).join('');

    modal.innerHTML = `
      <div class="modal-content calendar-content">
        <div class="modal-header">
          <h2>Your Learning Activity</h2>
          <button class="btn-close" aria-label="Close calendar">&times;</button>
        </div>
        <div class="modal-body">
          <div class="calendar-legend">
            <div class="legend-item">
              <div class="legend-square completed"></div>
              <span>Completed B-day</span>
            </div>
            <div class="legend-item">
              <div class="legend-square not-completed"></div>
              <span>Missed B-day</span>
            </div>
            <div class="legend-item">
              <div class="legend-square not-bday"></div>
              <span>Not a class day</span>
            </div>
          </div>
          <div class="calendar-grid">
            <div class="calendar-weekday-labels">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
            ${calendarHTML}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle close button
    const closeBtn = modal.querySelector('.btn-close');
    closeBtn?.addEventListener('click', () => {
      modal.remove();
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for streak updates
    window.addEventListener('streakUpdated', (e) => {
      console.log('🔥 Streak updated event received:', e.detail);
      this.updateDisplay();
    });

    // Listen for milestone celebrations
    window.addEventListener('streakMilestone', (e) => {
      const { milestone, rewards } = e.detail;
      this.showMilestoneCelebration(milestone, rewards);
    });

    // Add click handler to streak stat to show calendar
    const streakStat = document.querySelector('.streak-stat');
    if (streakStat) {
      streakStat.style.cursor = 'pointer';
      streakStat.setAttribute('title', 'Click to view activity calendar');
      streakStat.addEventListener('click', () => {
        this.showCalendarView();
      });
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    StreakDisplay.init();
  });
} else {
  StreakDisplay.init();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.StreakDisplay = StreakDisplay;
}
