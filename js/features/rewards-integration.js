/**
 * Rewards Integration - Connect XP/Coin Systems to Game
 *
 * Integrates the XP and coin systems with the game controller
 * Enhances existing addXP and addCoins methods with new functionality
 */

(function() {
    'use strict';

    // Wait for game controller to be ready
    function initRewardsIntegration() {
        if (!window.gameController) {
            console.warn('Game controller not ready, retrying...');
            setTimeout(initRewardsIntegration, 100);
            return;
        }

        if (!window.xpDisplay || !window.coinDisplay) {
            console.warn('XP/Coin display not ready, retrying...');
            setTimeout(initRewardsIntegration, 100);
            return;
        }

        console.log('Initializing rewards integration...');

        // Override addXP method to use new XP system
        const originalAddXP = window.gameController.addXP.bind(window.gameController);
        window.gameController.addXP = function(amount, options = {}) {
            const userId = 'student'; // Default user ID

            // Calculate time spent if available
            const timeSpent = this.questionStartTime
                ? Math.floor((Date.now() - this.questionStartTime) / 1000)
                : 0;

            // Calculate XP with breakdown
            const xpResult = window.xpSystem.calculateXP(
                this.currentLevel || 1,
                100, // Assume 100% if correct
                timeSpent,
                1 // First attempt (could be enhanced)
            );

            // Award XP through display (includes animations)
            const result = window.xpDisplay.awardXP(
                userId,
                xpResult.totalXP,
                `level-${this.currentLevel}`,
                xpResult.breakdown
            );

            // Update game controller state
            this.playerXP = result.totalXP;
            this.playerLevel = result.level;

            // Call original method for compatibility
            // (This updates the display using old method)
            this.updatePlayerStats();

            return xpResult.totalXP;
        };

        // Override addCoins method to use new coin system
        const originalAddCoins = window.gameController.addCoins.bind(window.gameController);
        window.gameController.addCoins = function(amount, options = {}) {
            const userId = 'student'; // Default user ID

            // Get current streak for bonus calculation
            const streakDays = window.StreakTracker
                ? window.StreakTracker.getStreakStatus().currentStreak
                : 0;

            // Calculate coins with breakdown
            const coinResult = window.coinSystem.calculateCoins(
                this.currentLevel || 1,
                100, // Assume 100% if correct
                streakDays
            );

            // Award coins through display (includes animations)
            window.coinDisplay.awardCoins(
                userId,
                coinResult.totalCoins,
                `level-${this.currentLevel}`,
                coinResult.breakdown
            );

            // Update game controller state
            this.playerCoins = window.coinSystem.getCoinBalance(userId);

            // Call original method for compatibility
            this.updatePlayerStats();

            return coinResult.totalCoins;
        };

        // Override updatePlayerStats to sync with new systems
        const originalUpdatePlayerStats = window.gameController.updatePlayerStats.bind(window.gameController);
        window.gameController.updatePlayerStats = function() {
            const userId = 'student';

            // Update XP display
            if (window.xpDisplay) {
                window.xpDisplay.updateDisplay(userId);
            }

            // Update coin display
            if (window.coinDisplay) {
                window.coinDisplay.updateDisplay(userId);
            }

            // Call original for other updates
            originalUpdatePlayerStats();
        };

        // Override loadProgress to load from new systems
        const originalLoadProgress = window.gameController.loadProgress.bind(window.gameController);
        window.gameController.loadProgress = function() {
            const userId = 'student';

            // Load XP data
            const xpData = window.xpSystem.getXPData(userId);
            this.playerXP = xpData.totalXP;
            this.playerLevel = xpData.level;

            // Load coin data
            this.playerCoins = window.coinSystem.getCoinBalance(userId);

            // Call original for other progress data
            originalLoadProgress();

            // Update displays
            this.updatePlayerStats();
        };

        // Override saveProgress to save to new systems
        const originalSaveProgress = window.gameController.saveProgress.bind(window.gameController);
        window.gameController.saveProgress = function() {
            const userId = 'student';

            // XP and coins are automatically saved by their systems
            // Just call original for other progress data
            originalSaveProgress();
        };

        // Add method to award lesson completion rewards
        window.gameController.awardLessonRewards = function(lessonNumber, score, timeSpent, attempts = 1) {
            const userId = 'student';

            // Calculate XP
            const xpResult = window.xpSystem.calculateXP(lessonNumber, score, timeSpent, attempts);

            // Calculate coins
            const streakDays = window.StreakTracker
                ? window.StreakTracker.getStreakStatus().currentStreak
                : 0;
            const coinResult = window.coinSystem.calculateCoins(lessonNumber, score, streakDays);

            // Award with animations
            window.xpDisplay.awardXP(userId, xpResult.totalXP, `lesson-${lessonNumber}`, xpResult.breakdown);
            window.coinDisplay.awardCoins(userId, coinResult.totalCoins, `lesson-${lessonNumber}`, coinResult.breakdown);

            // Update displays
            this.updatePlayerStats();

            return {
                xp: xpResult,
                coins: coinResult
            };
        };

        console.log('✅ Rewards integration complete!');

        // Initialize displays
        window.gameController.updatePlayerStats();
    }

    // Start integration when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRewardsIntegration);
    } else {
        initRewardsIntegration();
    }
})();
