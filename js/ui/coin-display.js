/**
 * Coin Display - UI Components for Coin System
 *
 * Handles visual display of coins, animations, and balance updates
 */

class CoinDisplay {
    constructor() {
        this.coinSystem = window.coinSystem;
        this.animationQueue = [];
        this.isAnimating = false;

        this.init();
    }

    init() {
        // Update display on page load
        this.updateDisplay();

        // TODO: Check for daily login bonus when implemented
        // this.checkDailyBonus();
    }

    /**
     * Update coin display
     * @param {string} userId - User ID (default: null for current user)
     */
    async updateDisplay(userId = null) {
        const balance = await this.coinSystem.getCoinsBalance(userId);

        // Update coin counter in navbar
        const coinElement = document.getElementById('playerCoins');
        if (coinElement) {
            // Animate number change
            this.animateNumberChange(coinElement, balance);
        }
    }

    /**
     * Animate number change
     * @param {HTMLElement} element - Element to update
     * @param {number} newValue - New value
     */
    animateNumberChange(element, newValue) {
        const currentValue = parseInt(element.textContent, 10) || 0;

        if (currentValue === newValue) return;

        const duration = 500; // ms
        const steps = 20;
        const stepValue = (newValue - currentValue) / steps;
        const stepTime = duration / steps;

        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            const displayValue = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = displayValue;

            if (currentStep >= steps) {
                element.textContent = newValue;
                clearInterval(interval);
            }
        }, stepTime);
    }

    /**
     * Show coins earned animation
     * @param {number} amount - Coin amount gained
     * @param {object} breakdown - Coin breakdown
     */
    showCoinsEarnedAnimation(amount, breakdown = null) {
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

        // Create floating coins
        this.createFloatingCoins(amount, breakdown);

        // Wait for animation to complete
        await this.wait(1500);

        // Process next in queue
        this.processAnimationQueue();
    }

    /**
     * Create floating coin animation
     * @param {number} amount - Coin amount
     * @param {object} breakdown - Coin breakdown
     */
    createFloatingCoins(amount, breakdown) {
        const container = document.querySelector('.player-stats') || document.body;

        const floatingCoins = document.createElement('div');
        floatingCoins.className = 'floating-coins';
        floatingCoins.innerHTML = `
            <div class="floating-coins-main">+${amount} 🪙</div>
            ${breakdown ? this.createBreakdownHTML(breakdown) : ''}
        `;

        container.appendChild(floatingCoins);

        // Trigger animation
        setTimeout(() => {
            floatingCoins.classList.add('animate');
        }, 10);

        // Remove after animation
        setTimeout(() => {
            floatingCoins.remove();
        }, 1500);

        // Play coin sound
        this.playCoinSound();
    }

    /**
     * Create breakdown HTML
     * @param {object} breakdown - Coin breakdown
     * @returns {string} HTML string
     */
    createBreakdownHTML(breakdown) {
        const items = [];

        if (breakdown.base > 0) {
            items.push(`<div class="coin-breakdown-item">Base: +${breakdown.base}</div>`);
        }
        if (breakdown.perfectScore > 0) {
            items.push(`<div class="coin-breakdown-item">Perfect: +${breakdown.perfectScore}</div>`);
        }
        if (breakdown.streak > 0) {
            items.push(`<div class="coin-breakdown-item">Streak: +${breakdown.streak}</div>`);
        }

        return `<div class="coin-breakdown">${items.join('')}</div>`;
    }

    /**
     * Award coins with animation
     * @param {string} userId - User ID
     * @param {number} amount - Coin amount
     * @param {string} source - Source of coins
     * @param {object} breakdown - Coin breakdown
     */
    awardCoins(userId, amount, source, breakdown = null) {
        const result = this.coinSystem.awardCoins(userId, amount, source);

        // Show coins earned animation
        this.showCoinsEarnedAnimation(amount, breakdown);

        // Update display
        setTimeout(() => {
            this.updateDisplay(userId);
        }, 100);

        return result;
    }

    /**
     * Play coin collection sound
     */
    playCoinSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Coin sound: quick high-pitched beep
            oscillator.frequency.value = 1000;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Silent fail
            console.log('Audio not supported');
        }
    }

    /**
     * Check and award daily login bonus
     * @param {string} userId - User ID
     */
    checkDailyBonus(userId = 'student') {
        const result = this.coinSystem.getDailyLoginBonus(userId);

        if (result.claimed) {
            // Show daily bonus notification
            this.showDailyBonusNotification(result.coinsGained);
        }
    }

    /**
     * Show daily bonus notification
     * @param {number} amount - Bonus amount
     */
    showDailyBonusNotification(amount) {
        const notification = document.createElement('div');
        notification.className = 'daily-bonus-notification';
        notification.innerHTML = `
            <div class="bonus-icon">🎁</div>
            <div class="bonus-text">
                <strong>Daily Bonus!</strong>
                <p>+${amount} coins for logging in today</p>
            </div>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Show coin balance modal
     * @param {string} userId - User ID
     */
    async showCoinBalance(userId = null) {
        // Get balance and history
        const balance = await this.coinSystem.getCoinsBalance(userId);
        const history = (await this.coinSystem.getCoinHistory(userId, 10)).reverse();

        const modal = document.createElement('div');
        modal.className = 'modal coin-balance-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💰 Coin Balance</h2>
                    <button class="btn-close" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="coin-stats">
                        <div class="stat-box">
                            <div class="stat-value">${balance}</div>
                            <div class="stat-label">Current Balance</div>
                        </div>
                    </div>
                    <h3>Recent Transactions</h3>
                    <div class="coin-history">
                        ${this.createHistoryHTML(history)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button
        modal.querySelector('.btn-close').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    /**
     * Create history HTML
     * @param {array} history - Transaction history
     * @returns {string} HTML string
     */
    createHistoryHTML(history) {
        if (history.length === 0) {
            return '<p class="no-history">No transactions yet</p>';
        }

        return history.map(transaction => {
            const icon = transaction.type === 'earned' ? '+' : '-';
            const className = transaction.type === 'earned' ? 'earned' : 'spent';
            const date = new Date(transaction.timestamp).toLocaleDateString();

            return `
                <div class="history-item ${className}">
                    <div class="history-amount">${icon}${transaction.amount} 🪙</div>
                    <div class="history-details">
                        <div class="history-source">${transaction.source}</div>
                        <div class="history-date">${date}</div>
                    </div>
                </div>
            `;
        }).join('');
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
window.coinDisplay = new CoinDisplay();
