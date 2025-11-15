/**
 * XP Display - UI Components for XP System
 *
 * Handles visual display of XP, levels, progress bars, and celebrations
 */

class XPDisplay {
    constructor() {
        this.xpSystem = window.xpSystem;
        this.animationQueue = [];
        this.isAnimating = false;
        this.currentXP = 0;
        this.currentLevel = 1;

        this.init();
    }

    async init() {
        // Create XP bar if it doesn't exist
        this.ensureXPBarExists();

        // Wait for XP System to initialize
        if (this.xpSystem) {
          // Subscribe to XP events
          this.xpSystem.addListener((event, data) => {
            if (event === 'xp_awarded') {
              this.handleXPAwarded(data);
            } else if (event === 'level_up') {
              this.handleLevelUp(data);
            }
          });
        }

        // Update display on page load
        await this.updateDisplay();
    }

    /**
     * Ensure XP progress bar exists in header
     */
    ensureXPBarExists() {
        const existingBar = document.getElementById('xpProgressBar');
        if (existingBar) return;

        // Create XP progress bar
        const playerStats = document.querySelector('.player-stats');
        if (!playerStats) return;

        const xpContainer = document.createElement('div');
        xpContainer.className = 'xp-progress-container';
        xpContainer.innerHTML = `
            <div class="xp-progress-bar" id="xpProgressBar">
                <div class="xp-progress-fill" id="xpProgressFill" style="width: 0%"></div>
                <div class="xp-progress-text" id="xpProgressText">Level 1</div>
            </div>
        `;

        // Insert after stats
        playerStats.insertAdjacentElement('afterend', xpContainer);
    }

    /**
     * Update XP display from Supabase
     * @param {string} userId - User ID (optional)
     */
    async updateDisplay(userId = null) {
        try {
            if (!this.xpSystem || !this.xpSystem.supabase) {
                console.warn('XP System not ready yet');
                return;
            }

            // Get user ID
            if (!userId && this.xpSystem.currentUser) {
                userId = this.xpSystem.currentUser.id;
            }

            if (!userId) {
                return;
            }

            // Fetch user profile from Supabase
            const { data, error } = await this.xpSystem.supabase
                .from('profiles')
                .select('total_xp, level')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching XP:', error);
                return;
            }

            this.currentXP = data.total_xp;
            this.currentLevel = data.level;

            // Calculate progress
            const progress = this.xpSystem.getXPProgress(this.currentXP);

            // Update level display
            const levelElement = document.getElementById('playerLevel');
            if (levelElement) {
                levelElement.textContent = progress.currentLevel;
            }

            // Update XP display
            const xpElement = document.getElementById('playerXP');
            const xpMaxElement = document.querySelector('.stat-max');
            if (xpElement && xpMaxElement) {
                xpElement.textContent = progress.xpInCurrentLevel;
                xpMaxElement.textContent = `/${progress.xpNeededForNextLevel}`;
            }

            // Update progress bar
            this.updateProgressBar(progress.progressPercent);

            // Update level badge
            this.updateLevelBadge(progress.currentLevel);
        } catch (error) {
            console.error('Error updating XP display:', error);
        }
    }

    /**
     * Handle XP awarded event
     * @param {Object} data - Event data
     */
    handleXPAwarded(data) {
        this.showXPGainedAnimation(data.newXP - this.currentXP);
        this.currentXP = data.newXP;
        this.currentLevel = data.level;
        this.updateDisplay();
    }

    /**
     * Handle level up event
     * @param {Object} data - Event data
     */
    handleLevelUp(data) {
        setTimeout(() => {
            this.showLevelUpCelebration(data.level);
        }, 1000);
    }

    /**
     * Update XP progress bar
     * @param {number} percent - Progress percentage
     */
    updateProgressBar(percent) {
        const progressFill = document.getElementById('xpProgressFill');
        if (progressFill) {
            // Smooth animation
            progressFill.style.transition = 'width 0.5s ease-out';
            progressFill.style.width = `${percent}%`;
        }
    }

    /**
     * Update level badge display
     * @param {number} level - Current level
     */
    updateLevelBadge(level) {
        const progressText = document.getElementById('xpProgressText');
        if (progressText) {
            progressText.textContent = `Level ${level}`;
        }
    }

    /**
     * Show XP gained animation
     * @param {number} amount - XP amount gained
     * @param {object} breakdown - XP breakdown
     */
    showXPGainedAnimation(amount, breakdown = null) {
        // Add to queue
        this.animationQueue.push({ amount, breakdown });

        // Process queue
        if (!this.isAnimating) {
            this.processAnimationQueue();
        }
    }

    /**
     * Process animation queue
     */
    async processAnimationQueue() {
        if (this.animationQueue.length === 0) {
            this.isAnimating = false;
            return;
        }

        this.isAnimating = true;
        const { amount, breakdown } = this.animationQueue.shift();

        // Create floating XP text
        this.createFloatingXP(amount, breakdown);

        // Wait for animation to complete
        await this.wait(1500);

        // Process next in queue
        this.processAnimationQueue();
    }

    /**
     * Create floating XP animation
     * @param {number} amount - XP amount
     * @param {object} breakdown - XP breakdown
     */
    createFloatingXP(amount, breakdown) {
        const container = document.querySelector('.player-stats') || document.body;

        const floatingXP = document.createElement('div');
        floatingXP.className = 'floating-xp';
        floatingXP.innerHTML = `
            <div class="floating-xp-main">+${amount} XP</div>
            ${breakdown ? this.createBreakdownHTML(breakdown) : ''}
        `;

        container.appendChild(floatingXP);

        // Trigger animation
        setTimeout(() => {
            floatingXP.classList.add('animate');
        }, 10);

        // Remove after animation
        setTimeout(() => {
            floatingXP.remove();
        }, 1500);
    }

    /**
     * Create breakdown HTML
     * @param {object} breakdown - XP breakdown
     * @returns {string} HTML string
     */
    createBreakdownHTML(breakdown) {
        const items = [];

        if (breakdown.base > 0) {
            items.push(`<div class="xp-breakdown-item">Base: +${breakdown.base}</div>`);
        }
        if (breakdown.perfectScore > 0) {
            items.push(`<div class="xp-breakdown-item">Perfect: +${breakdown.perfectScore}</div>`);
        }
        if (breakdown.speed > 0) {
            items.push(`<div class="xp-breakdown-item">Speed: +${breakdown.speed}</div>`);
        }
        if (breakdown.firstAttempt > 0) {
            items.push(`<div class="xp-breakdown-item">First Try: +${breakdown.firstAttempt}</div>`);
        }

        return `<div class="xp-breakdown">${items.join('')}</div>`;
    }

    /**
     * Show level up celebration
     * @param {number} newLevel - New level achieved
     */
    showLevelUpCelebration(newLevel) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal level-up-modal active';
        modal.innerHTML = `
            <div class="modal-content level-up-content">
                <div class="celebration-animation">
                    <div class="level-up-badge">${newLevel}</div>
                    <div class="celebration-particles"></div>
                </div>
                <h2 class="level-up-title">Level Up!</h2>
                <p class="level-up-message">You've reached Level ${newLevel}!</p>
                <div class="level-up-rewards">
                    <p>Keep up the amazing work!</p>
                </div>
                <button class="btn btn-lg btn-primary" id="closeLevelUpBtn">
                    Continue Learning
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Add particles
        this.createCelebrationParticles(modal.querySelector('.celebration-particles'));

        // Close button
        modal.querySelector('#closeLevelUpBtn').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        // Play sound effect (if available)
        this.playLevelUpSound();
    }

    /**
     * Create celebration particles
     * @param {HTMLElement} container - Container element
     */
    createCelebrationParticles(container) {
        const particles = ['✨', '🎉', '⭐', '💫', '🌟'];
        const count = 20;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            particle.style.animationDuration = `${1 + Math.random()}s`;
            container.appendChild(particle);
        }
    }

    /**
     * Play level up sound
     */
    playLevelUpSound() {
        // Simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Silent fail if audio not supported
            console.log('Audio not supported');
        }
    }

    /**
     * Award XP with animation (async version for Supabase)
     * @param {string} userId - User ID
     * @param {number} amount - XP amount
     * @param {string} source - Source of XP
     * @param {string} sourceId - Source ID
     * @param {string} description - Description
     */
    async awardXP(userId, amount, source, sourceId = null, description = null) {
        try {
            const result = await this.xpSystem.awardXP(userId, amount, source, sourceId, description);

            // Show XP gained animation
            this.showXPGainedAnimation(amount);

            // Update display
            setTimeout(() => {
                this.updateDisplay(userId);
            }, 100);

            // Level up is handled by the event listener

            return result;
        } catch (error) {
            console.error('Error awarding XP:', error);
            throw error;
        }
    }

    /**
     * Utility: Wait for ms
     * @param {number} ms - Milliseconds to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global instance
window.xpDisplay = new XPDisplay();
