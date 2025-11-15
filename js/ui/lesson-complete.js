/**
 * Lesson Complete Modal
 *
 * PURPOSE: Celebration screen shown after completing a lesson
 * FEATURES:
 * - Show final score and accuracy
 * - XP breakdown with animations
 * - Coins earned
 * - Achievements (if any)
 * - Return to skill tree button
 */

const LessonComplete = {
  modal: null,
  currentScore: null,

  /**
   * Show the lesson complete modal
   * @param {object} lessonData - Lesson information
   * @param {object} score - Score data from LessonPlayer
   */
  show(lessonData, score) {
    console.log('Showing lesson complete screen', { lessonData, score });

    this.currentScore = score;

    // Create modal if it doesn't exist
    if (!this.modal) {
      this.createModal();
    }

    // Populate with data
    this.populateModal(lessonData, score);

    // Show modal
    this.modal.style.display = 'flex';
    this.modal.classList.add('active');

    // Animate in
    setTimeout(() => {
      this.animateResults(score);
    }, 300);
  },

  /**
   * Create the modal HTML
   */
  createModal() {
    const modalHTML = `
      <div id="lessonCompleteModal" class="lesson-complete-modal" role="dialog" aria-modal="true" aria-labelledby="complete-title">
        <div class="lesson-complete-content">
          <!-- Celebration Header -->
          <div class="celebration-header">
            <div class="celebration-icon" id="celebrationIcon">🎉</div>
            <h2 id="complete-title" class="complete-title">Lesson Complete!</h2>
            <div class="lesson-name" id="completeLessonName"></div>
          </div>

          <!-- Score Summary -->
          <div class="score-summary">
            <div class="score-circle" id="scoreCircle">
              <svg viewBox="0 0 100 100" class="score-ring">
                <circle cx="50" cy="50" r="45" class="score-ring-bg"></circle>
                <circle cx="50" cy="50" r="45" class="score-ring-fill" id="scoreRingFill"></circle>
              </svg>
              <div class="score-text">
                <div class="score-value" id="scoreValue">0</div>
                <div class="score-label">correct</div>
              </div>
            </div>
            <div class="accuracy-text" id="accuracyText">0% Accuracy</div>
          </div>

          <!-- XP Breakdown -->
          <div class="rewards-section">
            <h3 class="rewards-title">Rewards Earned</h3>

            <div class="xp-breakdown">
              <div class="xp-item" data-type="base">
                <span class="xp-label">Base XP</span>
                <span class="xp-value" id="xpBase">+0</span>
              </div>
              <div class="xp-item" data-type="accuracy" id="xpAccuracyItem" style="display: none;">
                <span class="xp-label" id="xpAccuracyLabel">Perfect Score!</span>
                <span class="xp-value" id="xpAccuracy">+0</span>
              </div>
              <div class="xp-item" data-type="speed" id="xpSpeedItem" style="display: none;">
                <span class="xp-label">Speed Bonus</span>
                <span class="xp-value" id="xpSpeed">+0</span>
              </div>
              <div class="xp-item" data-type="first-try" id="xpFirstTryItem" style="display: none;">
                <span class="xp-label">First Try Bonus</span>
                <span class="xp-value" id="xpFirstTry">+0</span>
              </div>
              <div class="xp-total">
                <span class="xp-label">Total XP</span>
                <span class="xp-value total" id="xpTotal">+0</span>
              </div>
            </div>

            <div class="coins-earned">
              <span class="coins-icon">🪙</span>
              <span class="coins-label">Coins Earned:</span>
              <span class="coins-value" id="coinsEarned">0</span>
            </div>
          </div>

          <!-- Achievements (if any) -->
          <div class="achievements-section" id="achievementsSection" style="display: none;">
            <h3 class="achievements-title">Achievements Unlocked!</h3>
            <div class="achievements-list" id="achievementsList"></div>
          </div>

          <!-- Stats -->
          <div class="lesson-stats">
            <div class="stat-item">
              <div class="stat-label">Time Spent</div>
              <div class="stat-value" id="timeSpent">0 min</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Exercises</div>
              <div class="stat-value" id="exerciseCount">0</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="complete-actions">
            <button class="btn-continue-main" id="continueMainBtn">
              Continue
              <span class="btn-arrow">→</span>
            </button>
            <button class="btn-review" id="reviewLessonBtn" style="display: none;">
              Review Mistakes
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('lessonCompleteModal');

    // Setup event listeners
    document.getElementById('continueMainBtn').addEventListener('click', () => {
      this.close();
    });

    document.getElementById('reviewLessonBtn')?.addEventListener('click', () => {
      this.reviewMistakes();
    });

    // Prevent closing by clicking outside
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        // Don't allow closing by clicking backdrop
        // User must click continue
      }
    });
  },

  /**
   * Populate modal with lesson data
   * @param {object} lessonData
   * @param {object} score
   */
  populateModal(lessonData, score) {
    // Lesson name
    document.getElementById('completeLessonName').textContent = lessonData.name;

    // Celebration icon based on performance
    const icon = document.getElementById('celebrationIcon');
    if (score.accuracy === 100) {
      icon.textContent = '🏆';
      icon.setAttribute('aria-label', 'Perfect score trophy');
    } else if (score.accuracy >= 80) {
      icon.textContent = '🌟';
      icon.setAttribute('aria-label', 'Great job star');
    } else {
      icon.textContent = '✓';
      icon.setAttribute('aria-label', 'Completed checkmark');
    }

    // Title based on performance
    const title = document.getElementById('complete-title');
    if (score.accuracy === 100) {
      title.textContent = 'Perfect! Amazing Work!';
    } else if (score.accuracy >= 80) {
      title.textContent = 'Great Job!';
    } else if (score.accuracy >= 60) {
      title.textContent = 'Good Effort!';
    } else {
      title.textContent = 'Lesson Complete!';
    }

    // Score values
    document.getElementById('scoreValue').textContent = `${score.correctExercises}/${score.totalExercises}`;
    document.getElementById('accuracyText').textContent = `${score.accuracy}% Accuracy`;

    // XP breakdown
    document.getElementById('xpBase').textContent = `+${score.breakdown.base}`;

    if (score.breakdown.accuracyBonus > 0) {
      document.getElementById('xpAccuracyItem').style.display = 'flex';
      document.getElementById('xpAccuracy').textContent = `+${score.breakdown.accuracyBonus}`;
      if (score.accuracy === 100) {
        document.getElementById('xpAccuracyLabel').textContent = 'Perfect Score!';
      } else {
        document.getElementById('xpAccuracyLabel').textContent = 'Accuracy Bonus';
      }
    }

    if (score.breakdown.speedBonus > 0) {
      document.getElementById('xpSpeedItem').style.display = 'flex';
      document.getElementById('xpSpeed').textContent = `+${score.breakdown.speedBonus}`;
    }

    if (score.breakdown.firstTryBonus > 0) {
      document.getElementById('xpFirstTryItem').style.display = 'flex';
      document.getElementById('xpFirstTry').textContent = `+${score.breakdown.firstTryBonus}`;
    }

    document.getElementById('xpTotal').textContent = `+${score.xp}`;
    document.getElementById('coinsEarned').textContent = score.coins;

    // Stats
    document.getElementById('timeSpent').textContent = `${score.timeSpent} min`;
    document.getElementById('exerciseCount').textContent = `${score.correctExercises}/${score.totalExercises}`;

    // Show review button if there are mistakes
    if (score.correctExercises < score.totalExercises) {
      document.getElementById('reviewLessonBtn').style.display = 'block';
    }

    // Check for achievements
    this.checkAchievements(lessonData, score);
  },

  /**
   * Animate results appearing
   * @param {object} score
   */
  animateResults(score) {
    // Animate score ring
    const ring = document.getElementById('scoreRingFill');
    const percentage = score.accuracy;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;

    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
    }, 100);

    // Animate numbers counting up
    this.animateNumber('scoreValue', 0, score.correctExercises, 800, `/${score.totalExercises}`);
    this.animateNumber('accuracyText', 0, score.accuracy, 800, '% Accuracy');

    // Animate XP items appearing
    const xpItems = document.querySelectorAll('.xp-item');
    xpItems.forEach((item, index) => {
      if (item.style.display !== 'none') {
        setTimeout(() => {
          item.classList.add('animate-in');
        }, 400 + (index * 100));
      }
    });

    // Animate coins
    setTimeout(() => {
      document.querySelector('.coins-earned').classList.add('animate-in');
      this.animateNumber('coinsEarned', 0, score.coins, 500);
    }, 800);
  },

  /**
   * Animate a number counting up
   * @param {string} elementId
   * @param {number} start
   * @param {number} end
   * @param {number} duration
   * @param {string} suffix
   */
  animateNumber(elementId, start, end, duration, suffix = '') {
    const element = document.getElementById(elementId);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = Math.round(current) + suffix;
    }, 16);
  },

  /**
   * Check for achievements
   * @param {object} lessonData
   * @param {object} score
   */
  checkAchievements(lessonData, score) {
    const achievements = [];

    // Perfect score achievement
    if (score.accuracy === 100) {
      achievements.push({
        icon: '💯',
        name: 'Perfect Score!',
        description: 'Completed lesson with 100% accuracy'
      });
    }

    // Speed demon achievement
    if (score.timeSpent < 3) {
      achievements.push({
        icon: '⚡',
        name: 'Speed Demon',
        description: 'Completed lesson in under 3 minutes'
      });
    }

    // First try achievement
    const firstTryCount = score.attempts.filter(a => a.tries === 1 && a.correct).length;
    if (firstTryCount === score.totalExercises) {
      achievements.push({
        icon: '🎯',
        name: 'First Try Master',
        description: 'Got every answer right on first try'
      });
    }

    // Check streak achievements
    const streak = this.getStreak();
    if (streak >= 3 && streak % 3 === 0) {
      achievements.push({
        icon: '🔥',
        name: `${streak}-Day Streak!`,
        description: `Completed lessons ${streak} days in a row`
      });
    }

    // Display achievements if any
    if (achievements.length > 0) {
      this.displayAchievements(achievements);
    }
  },

  /**
   * Display achievements
   * @param {Array} achievements
   */
  displayAchievements(achievements) {
    const section = document.getElementById('achievementsSection');
    const list = document.getElementById('achievementsList');

    list.innerHTML = achievements.map(ach => `
      <div class="achievement-item">
        <span class="achievement-icon" aria-hidden="true">${ach.icon}</span>
        <div class="achievement-content">
          <div class="achievement-name">${ach.name}</div>
          <div class="achievement-description">${ach.description}</div>
        </div>
      </div>
    `).join('');

    section.style.display = 'block';

    // Animate in
    setTimeout(() => {
      const items = list.querySelectorAll('.achievement-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate-in');
        }, index * 150);
      });
    }, 1000);
  },

  /**
   * Get current streak
   * @returns {number}
   */
  getStreak() {
    const results = JSON.parse(localStorage.getItem('lessonResults') || '{}');
    const dates = Object.values(results)
      .map(r => new Date(r.completedAt).toDateString())
      .sort()
      .reverse();

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      const daysDiff = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }

    return streak;
  },

  /**
   * Close the modal
   */
  close() {
    this.modal.classList.remove('active');
    setTimeout(() => {
      this.modal.style.display = 'none';

      // Return to skill tree or main menu
      if (window.gameController) {
        window.gameController.showScreen('menu');
      } else {
        window.location.href = '/index.html';
      }
    }, 300);
  },

  /**
   * Review mistakes
   */
  reviewMistakes() {
    // TODO: Implement review mode
    alert('Review mode coming soon! You can retake the lesson to practice.');
    this.close();
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.LessonComplete = LessonComplete;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonComplete;
}
