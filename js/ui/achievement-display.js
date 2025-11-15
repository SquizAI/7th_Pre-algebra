/**
 * Achievement Display UI
 *
 * PURPOSE: Display achievement unlock notifications and gallery
 * FEATURES:
 * - Achievement unlock modal with animation
 * - Toast notifications
 * - Achievement gallery rendering
 * - Progress bars
 * - Locked/unlocked states
 */

const AchievementDisplay = {
  /**
   * Show achievement unlock modal
   */
  showUnlockModal(achievement) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'achievement-modal-overlay';
    overlay.innerHTML = `
      <div class="achievement-modal" role="dialog" aria-labelledby="achievement-title">
        <div class="achievement-animation">
          <div class="achievement-shine"></div>
          <div class="achievement-badge-large">${achievement.badge_icon}</div>
        </div>
        <h2 id="achievement-title" class="achievement-modal-title">Achievement Unlocked!</h2>
        <div class="achievement-details">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
          <div class="achievement-reward">
            <span class="reward-label">Reward:</span>
            <span class="reward-value">+${achievement.xp_reward} XP</span>
          </div>
        </div>
        <button class="btn-close-achievement" aria-label="Close achievement notification">
          Continue
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Add celebration sound (optional)
    this.playAchievementSound();

    // Show with animation
    requestAnimationFrame(() => {
      overlay.classList.add('show');
    });

    // Close on button click
    const closeBtn = overlay.querySelector('.btn-close-achievement');
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        closeBtn.click();
      }
    }, 5000);
  },

  /**
   * Show toast notification for achievement
   */
  showToast(achievement) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="toast-icon">${achievement.badge_icon}</div>
      <div class="toast-content">
        <div class="toast-title">Achievement!</div>
        <div class="toast-message">${achievement.name}</div>
        <div class="toast-xp">+${achievement.xp_reward} XP</div>
      </div>
    `;

    // Add to page
    let toastContainer = document.querySelector('.achievement-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'achievement-toast-container';
      document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);

    // Show with animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, 4000);
  },

  /**
   * Play achievement unlock sound
   */
  playAchievementSound() {
    try {
      // Create simple achievement sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Second note
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 659.25; // E5
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
      }, 150);
    } catch (error) {
      // Silent fail if Web Audio not supported
      console.log('Audio not available');
    }
  },

  /**
   * Render achievement gallery
   */
  renderGallery(container, category = 'all') {
    if (!window.AchievementSystem) {
      console.error('AchievementSystem not loaded');
      return;
    }

    const allAchievements = window.AchievementSystem.getAllAchievements();
    const userAchievements = window.AchievementSystem.getUserAchievements();

    // Filter by category
    let achievements = allAchievements;
    if (category !== 'all') {
      achievements = allAchievements.filter(a => a.category === category);
    }

    // Sort: earned first, then by XP reward
    achievements.sort((a, b) => {
      const aEarned = a.id in userAchievements;
      const bEarned = b.id in userAchievements;

      if (aEarned && !bEarned) return -1;
      if (!aEarned && bEarned) return 1;
      return b.xp_reward - a.xp_reward;
    });

    // Render each achievement
    container.innerHTML = achievements.map(achievement => {
      const earned = achievement.id in userAchievements;
      const progress = window.AchievementSystem.getAchievementProgress(achievement.id);

      return `
        <div class="achievement-card ${earned ? 'earned' : 'locked'}">
          <div class="achievement-badge">${achievement.badge_icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            ${this.renderProgress(achievement, progress, earned)}
            <div class="achievement-xp">
              ${earned ? '✅' : '🔒'} ${achievement.xp_reward} XP
            </div>
            ${earned ? this.renderEarnedDate(userAchievements[achievement.id]) : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render progress bar for achievement
   */
  renderProgress(achievement, progress, earned) {
    if (earned) {
      return '';
    }

    if (!progress || progress.max === 0) {
      return '';
    }

    return `
      <div class="achievement-progress">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${progress.percentage}%"></div>
        </div>
        <div class="progress-text">${progress.current} / ${progress.max}</div>
      </div>
    `;
  },

  /**
   * Render earned date
   */
  renderEarnedDate(achievementData) {
    if (!achievementData.unlockedAt) {
      return '';
    }

    const date = new Date(achievementData.unlockedAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `
      <div class="achievement-earned-date">
        Earned ${formattedDate}
      </div>
    `;
  },

  /**
   * Render category filter tabs
   */
  renderCategoryTabs(container) {
    const categories = [
      { id: 'all', name: 'All', icon: '🏆' },
      { id: 'completion', name: 'Completion', icon: '✅' },
      { id: 'accuracy', name: 'Accuracy', icon: '🎯' },
      { id: 'speed', name: 'Speed', icon: '⚡' },
      { id: 'streaks', name: 'Streaks', icon: '🔥' },
      { id: 'mastery', name: 'Mastery', icon: '🌟' },
      { id: 'special', name: 'Special', icon: '⭐' }
    ];

    container.innerHTML = categories.map(cat => `
      <button class="category-tab" data-category="${cat.id}">
        <span class="tab-icon">${cat.icon}</span>
        <span class="tab-name">${cat.name}</span>
      </button>
    `).join('');

    // Set first tab as active
    container.querySelector('.category-tab').classList.add('active');
  },

  /**
   * Render achievement stats summary
   */
  renderStats(container) {
    if (!window.AchievementSystem) {
      return;
    }

    const stats = window.AchievementSystem.getStats();

    container.innerHTML = `
      <div class="achievement-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">${stats.earned}</div>
          <div class="stat-label">Achievements</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">${stats.percentage}%</div>
          <div class="stat-label">Completion</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✨</div>
          <div class="stat-value">${stats.totalXP}</div>
          <div class="stat-label">Bonus XP</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">${stats.remaining}</div>
          <div class="stat-label">Remaining</div>
        </div>
      </div>
      <div class="overall-progress">
        <div class="progress-label">Overall Progress</div>
        <div class="progress-bar-container large">
          <div class="progress-bar-fill" style="width: ${stats.percentage}%"></div>
        </div>
      </div>
    `;
  },

  /**
   * Initialize achievements page
   */
  initAchievementsPage() {
    const statsContainer = document.getElementById('achievementStats');
    const tabsContainer = document.getElementById('categoryTabs');
    const galleryContainer = document.getElementById('achievementGallery');

    if (!statsContainer || !tabsContainer || !galleryContainer) {
      console.error('Achievement page containers not found');
      return;
    }

    // Render stats
    this.renderStats(statsContainer);

    // Render category tabs
    this.renderCategoryTabs(tabsContainer);

    // Render gallery with default category
    this.renderGallery(galleryContainer, 'all');

    // Add tab click handlers
    tabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.category-tab');
      if (!tab) return;

      // Update active tab
      tabsContainer.querySelectorAll('.category-tab').forEach(t => {
        t.classList.remove('active');
      });
      tab.classList.add('active');

      // Render gallery for selected category
      const category = tab.dataset.category;
      this.renderGallery(galleryContainer, category);
    });
  },

  /**
   * Show mini achievement notification in header
   */
  showHeaderNotification(achievement) {
    const header = document.querySelector('.game-header');
    if (!header) return;

    const notification = document.createElement('div');
    notification.className = 'header-achievement-notification';
    notification.innerHTML = `
      <span class="notif-icon">${achievement.badge_icon}</span>
      <span class="notif-text">${achievement.name}!</span>
    `;

    header.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (header.contains(notification)) {
          header.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.AchievementDisplay = AchievementDisplay;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AchievementDisplay;
}
