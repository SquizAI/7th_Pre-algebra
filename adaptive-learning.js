// Adaptive Learning Engine
// Dynamically adjusts difficulty and tracks mastery

class AdaptiveLearning {
    constructor() {
        this.performanceHistory = [];
        this.currentDifficultyLevel = 'medium'; // easy, medium, hard
        this.masteryThreshold = 0.85; // 85% mastery required
        this.minQuestionsForMastery = 3; // Minimum questions before declaring mastery
        this.maxQuestionsBeforeMastery = 8; // Max questions if not showing mastery

        // Performance metrics
        this.metrics = {
            accuracy: [],
            speed: [],
            hintsUsed: 0,
            consecutiveCorrect: 0,
            consecutiveIncorrect: 0,
        };
    }

    // Record attempt with timing and accuracy
    recordAttempt(isCorrect, timeSpentSeconds, usedHint, difficulty) {
        const attempt = {
            correct: isCorrect,
            timeSpent: timeSpentSeconds,
            usedHint: usedHint,
            difficulty: difficulty,
            timestamp: Date.now()
        };

        this.performanceHistory.push(attempt);
        this.metrics.accuracy.push(isCorrect ? 1 : 0);

        // Track consecutive performance
        if (isCorrect) {
            this.metrics.consecutiveCorrect++;
            this.metrics.consecutiveIncorrect = 0;
        } else {
            this.metrics.consecutiveIncorrect++;
            this.metrics.consecutiveCorrect = 0;
        }

        if (usedHint) {
            this.metrics.hintsUsed++;
        }

        // Adjust difficulty based on recent performance
        this.adjustDifficulty();

        return this.getCurrentMastery();
    }

    // Calculate current mastery level (0-1 scale)
    getCurrentMastery() {
        if (this.performanceHistory.length === 0) return 0;

        // Weight recent performance more heavily
        const recentAttempts = this.performanceHistory.slice(-5);

        let masteryScore = 0;
        let weights = 0;

        recentAttempts.forEach((attempt, index) => {
            const recencyWeight = (index + 1) / recentAttempts.length; // More recent = higher weight
            const difficultyMultiplier = this.getDifficultyMultiplier(attempt.difficulty);
            const hintPenalty = attempt.usedHint ? 0.7 : 1.0;
            const speedBonus = attempt.timeSpent < 30 ? 1.1 : (attempt.timeSpent > 60 ? 0.9 : 1.0);

            const score = (attempt.correct ? 1 : 0) *
                         recencyWeight *
                         difficultyMultiplier *
                         hintPenalty *
                         speedBonus;

            masteryScore += score;
            weights += recencyWeight;
        });

        // Normalize to 0-1 scale
        const normalizedMastery = masteryScore / weights;

        console.log(`📊 Current Mastery: ${(normalizedMastery * 100).toFixed(1)}%`, {
            attempts: this.performanceHistory.length,
            consecutiveCorrect: this.metrics.consecutiveCorrect,
            difficulty: this.currentDifficultyLevel
        });

        return normalizedMastery;
    }

    getDifficultyMultiplier(difficulty) {
        switch(difficulty) {
            case 'easy': return 0.8;
            case 'medium': return 1.0;
            case 'hard': return 1.3;
            default: return 1.0;
        }
    }

    // Check if student has achieved mastery
    hasMastery() {
        if (this.performanceHistory.length < this.minQuestionsForMastery) {
            return false;
        }

        const mastery = this.getCurrentMastery();
        const hasConsecutiveCorrect = this.metrics.consecutiveCorrect >= 3;
        const recentAccuracy = this.getRecentAccuracy(5);

        // Mastery conditions:
        // 1. Overall mastery score above threshold
        // 2. At least 3 consecutive correct answers
        // 3. Recent accuracy (last 5) is high
        const achievedMastery = mastery >= this.masteryThreshold &&
                               hasConsecutiveCorrect &&
                               recentAccuracy >= 0.8;

        if (achievedMastery) {
            console.log('🎯 MASTERY ACHIEVED!', {
                mastery: (mastery * 100).toFixed(1) + '%',
                consecutiveCorrect: this.metrics.consecutiveCorrect,
                recentAccuracy: (recentAccuracy * 100).toFixed(1) + '%'
            });
        }

        return achievedMastery;
    }

    // Get accuracy for recent N attempts
    getRecentAccuracy(n) {
        if (this.performanceHistory.length === 0) return 0;

        const recent = this.performanceHistory.slice(-n);
        const correct = recent.filter(a => a.correct).length;
        return correct / recent.length;
    }

    // Should continue with more questions?
    shouldContinue() {
        // Continue if:
        // 1. Haven't reached minimum questions
        // 2. Haven't achieved mastery and under max questions
        // 3. Not struggling too much (allow graceful failure)

        if (this.performanceHistory.length < this.minQuestionsForMastery) {
            return true;
        }

        if (this.hasMastery()) {
            return false; // Mastered! Can move on
        }

        if (this.performanceHistory.length >= this.maxQuestionsBeforeMastery) {
            console.log('⚠️ Max questions reached without mastery');
            return false; // Reached limit
        }

        // Check if struggling significantly
        const recentAccuracy = this.getRecentAccuracy(5);
        if (recentAccuracy < 0.3 && this.performanceHistory.length >= 5) {
            console.log('📚 Student needs more help - ending level for review');
            return false; // Struggling, needs intervention
        }

        return true; // Keep going
    }

    // Adjust difficulty based on performance
    adjustDifficulty() {
        if (this.performanceHistory.length < 2) return;

        const recentAccuracy = this.getRecentAccuracy(3);
        const currentDifficulty = this.currentDifficultyLevel;

        // Increase difficulty if doing well
        if (recentAccuracy >= 0.9 && this.metrics.consecutiveCorrect >= 2) {
            if (currentDifficulty === 'easy') {
                this.currentDifficultyLevel = 'medium';
                console.log('📈 Difficulty increased to: medium');
            } else if (currentDifficulty === 'medium') {
                this.currentDifficultyLevel = 'hard';
                console.log('📈 Difficulty increased to: hard');
            }
        }
        // Decrease difficulty if struggling
        else if (recentAccuracy < 0.5 && this.metrics.consecutiveIncorrect >= 2) {
            if (currentDifficulty === 'hard') {
                this.currentDifficultyLevel = 'medium';
                console.log('📉 Difficulty decreased to: medium');
            } else if (currentDifficulty === 'medium') {
                this.currentDifficultyLevel = 'easy';
                console.log('📉 Difficulty decreased to: easy');
            }
        }
    }

    // Get current difficulty level
    getCurrentDifficulty() {
        return this.currentDifficultyLevel;
    }

    // Generate equation parameters based on difficulty and concept
    generateEquationParams(concept) {
        const difficulty = this.currentDifficultyLevel;

        switch(concept) {
            case 'two-step-basic':
            case 'two-step equation':
                return this.generateTwoStepParams(difficulty);

            case 'combining like terms':
                return this.generateCombiningTermsParams(difficulty);

            case 'distributive property':
                return this.generateDistributiveParams(difficulty);

            case 'variables on both sides':
                return this.generateBothSidesParams(difficulty);

            default:
                return this.generateTwoStepParams(difficulty);
        }
    }

    // Generate two-step equation parameters (ax + b = c)
    generateTwoStepParams(difficulty) {
        let coefficient, constant, result, answer;

        switch(difficulty) {
            case 'easy':
                // Small positive numbers, nice answers
                coefficient = this.randomInt(2, 5);
                answer = this.randomInt(1, 10);
                constant = this.randomInt(1, 8);
                result = coefficient * answer + constant;
                break;

            case 'medium':
                // Larger numbers, may include negatives
                coefficient = this.randomInt(2, 8);
                answer = this.randomInt(-5, 15);
                constant = this.randomInt(-10, 15);
                result = coefficient * answer + constant;
                break;

            case 'hard':
                // Larger coefficients, negatives, decimal answers possible
                coefficient = this.randomInt(3, 12);
                answer = this.randomInt(-10, 20);
                constant = this.randomInt(-20, 20);
                result = coefficient * answer + constant;
                break;
        }

        return {
            coefficient,
            constant,
            result,
            answer
        };
    }

    // Generate combining like terms parameters
    generateCombiningTermsParams(difficulty) {
        let coeff1, coeff2, constant, result, answer;

        switch(difficulty) {
            case 'easy':
                coeff1 = this.randomInt(1, 4);
                coeff2 = this.randomInt(1, 4);
                answer = this.randomInt(1, 8);
                constant = this.randomInt(1, 10);
                result = (coeff1 + coeff2) * answer + constant;
                break;

            case 'medium':
                coeff1 = this.randomInt(2, 6);
                coeff2 = this.randomInt(2, 6);
                answer = this.randomInt(-5, 12);
                constant = this.randomInt(-8, 15);
                result = (coeff1 + coeff2) * answer + constant;
                break;

            case 'hard':
                coeff1 = this.randomInt(3, 9);
                coeff2 = this.randomInt(3, 9);
                answer = this.randomInt(-10, 15);
                constant = this.randomInt(-15, 20);
                result = (coeff1 + coeff2) * answer + constant;
                break;
        }

        return {
            coeff1,
            coeff2,
            constant,
            result,
            answer
        };
    }

    // Generate distributive property parameters
    generateDistributiveParams(difficulty) {
        let outside, inside1, inside2, constant, result, answer;

        switch(difficulty) {
            case 'easy':
                outside = this.randomInt(2, 4);
                inside1 = 1; // Keep it simple: a(x + b)
                answer = this.randomInt(1, 8);
                inside2 = this.randomInt(1, 5);
                constant = this.randomInt(1, 8);
                result = outside * (inside1 * answer + inside2) + constant;
                break;

            case 'medium':
                outside = this.randomInt(2, 6);
                inside1 = this.randomInt(1, 3);
                answer = this.randomInt(-5, 12);
                inside2 = this.randomInt(-5, 10);
                constant = this.randomInt(-8, 12);
                result = outside * (inside1 * answer + inside2) + constant;
                break;

            case 'hard':
                outside = this.randomInt(3, 8);
                inside1 = this.randomInt(2, 5);
                answer = this.randomInt(-10, 15);
                inside2 = this.randomInt(-10, 15);
                constant = this.randomInt(-15, 20);
                result = outside * (inside1 * answer + inside2) + constant;
                break;
        }

        return {
            outside,
            inside1,
            inside2,
            constant,
            result,
            answer
        };
    }

    // Generate variables on both sides parameters
    generateBothSidesParams(difficulty) {
        let leftCoeff, rightCoeff, leftConst, rightConst, answer;

        switch(difficulty) {
            case 'easy':
                answer = this.randomInt(1, 10);
                leftCoeff = this.randomInt(2, 5);
                rightCoeff = this.randomInt(1, 3);
                leftConst = this.randomInt(1, 8);
                rightConst = leftCoeff * answer + leftConst - rightCoeff * answer;
                break;

            case 'medium':
                answer = this.randomInt(-5, 15);
                leftCoeff = this.randomInt(2, 7);
                rightCoeff = this.randomInt(2, 6);
                leftConst = this.randomInt(-10, 15);
                rightConst = leftCoeff * answer + leftConst - rightCoeff * answer;
                break;

            case 'hard':
                answer = this.randomInt(-12, 18);
                leftCoeff = this.randomInt(3, 10);
                rightCoeff = this.randomInt(3, 9);
                leftConst = this.randomInt(-15, 20);
                rightConst = leftCoeff * answer + leftConst - rightCoeff * answer;
                break;
        }

        return {
            leftCoeff,
            rightCoeff,
            leftConst,
            rightConst,
            answer
        };
    }

    // Helper: random integer in range
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Reset for new level
    reset() {
        this.performanceHistory = [];
        this.currentDifficultyLevel = 'medium';
        this.metrics = {
            accuracy: [],
            speed: [],
            hintsUsed: 0,
            consecutiveCorrect: 0,
            consecutiveIncorrect: 0,
        };
        console.log('🔄 Adaptive learning reset for new level');
    }

    // Get recommendation for next action
    getRecommendation() {
        const mastery = this.getCurrentMastery();
        const accuracy = this.getRecentAccuracy(5);

        if (this.hasMastery()) {
            return {
                action: 'advance',
                message: '🎉 Great job! You\'ve mastered this concept!',
                canAdvance: true
            };
        }

        if (this.performanceHistory.length >= this.maxQuestionsBeforeMastery) {
            if (accuracy >= 0.6) {
                return {
                    action: 'review',
                    message: '📚 You\'re making progress! Review the concept and try again.',
                    canAdvance: false
                };
            } else {
                return {
                    action: 'help',
                    message: '🤔 This concept needs more practice. Let\'s review the tutorial first.',
                    canAdvance: false
                };
            }
        }

        if (accuracy < 0.4 && this.performanceHistory.length >= 3) {
            return {
                action: 'hint',
                message: '💡 Need some help? Try using the step-by-step solver.',
                canAdvance: false
            };
        }

        return {
            action: 'continue',
            message: 'Keep going! You\'re doing well.',
            canAdvance: false
        };
    }

    // Get performance summary
    getSummary() {
        return {
            totalAttempts: this.performanceHistory.length,
            mastery: this.getCurrentMastery(),
            accuracy: this.getRecentAccuracy(this.performanceHistory.length),
            recentAccuracy: this.getRecentAccuracy(5),
            consecutiveCorrect: this.metrics.consecutiveCorrect,
            hintsUsed: this.metrics.hintsUsed,
            currentDifficulty: this.currentDifficultyLevel,
            hasMastery: this.hasMastery()
        };
    }
}

// Initialize global adaptive learning instance
window.addEventListener('DOMContentLoaded', () => {
    window.adaptiveLearning = new AdaptiveLearning();
    console.log('🧠 Adaptive Learning Engine initialized');
});
