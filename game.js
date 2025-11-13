// Main Game Controller
// Implements learning friction with frequent evaluation and progress tracking

class GameController {
    constructor() {
        this.equationGen = new EquationGenerator();
        this.currentLevel = 1;
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.streak = 0;
        this.playerXP = 0;
        this.playerCoins = 0;
        this.playerLevel = 1;
        this.worldProgress = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        this.currentEquation = null;
        this.currentScreen = 'menu';

        // Adaptive learning tracking
        this.questionStartTime = null;
        this.hintUsedThisQuestion = false;

        this.init();
    }

    init() {
        // Load saved progress
        this.loadProgress();

        // Setup event listeners
        this.setupEventListeners();

        // Update display
        this.updatePlayerStats();
        this.updateWorldProgress();

        // Start auto-save
        this.startAutoSave();

        // Check for in-progress level
        this.checkResumeLevel();
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('startStoryBtn')?.addEventListener('click', () => {
            this.startStoryMode();
        });

        document.getElementById('practiceBtn')?.addEventListener('click', () => {
            this.showScreen('practice');
        });

        document.getElementById('tutorialBtn')?.addEventListener('click', () => {
            this.showScreen('tutorial');
        });

        document.getElementById('challengeBtn')?.addEventListener('click', () => {
            this.showChallengeMode();
        });

        // Practice mode buttons
        document.querySelectorAll('.btn-practice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.practice-card');
                const type = card.dataset.type;
                this.startPracticeMode(type);
            });
        });

        // Game buttons - NEW: Mandatory step-by-step solving
        document.getElementById('solveStepsBtn')?.addEventListener('click', () => {
            this.openStepSolver();
        });

        // Back buttons
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showScreen('menu');
                // Refresh progress display when returning to menu
                this.updateWorldProgress();
                this.updatePlayerStats();
            });
        });

        // Gemini Helper is handled in gemini-helper.js

        // Success modal
        document.getElementById('continueBtn')?.addEventListener('click', () => {
            this.closeSuccessModal();
        });
    }

    // Screen management
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const screen = document.getElementById(`${screenName}Screen`);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
        }

        // Refresh progress when showing menu
        if (screenName === 'menu') {
            console.log('📱 Showing menu screen - refreshing progress display');
            this.updateWorldProgress();
            this.updatePlayerStats();
        }
    }

    // Start story mode
    startStoryMode() {
        // DON'T show game screen yet - let loadLevel() decide which screen to show
        // (concept intro → video → game OR directly to game if concept learned)
        console.log('Starting story mode, current level:', this.currentLevel);
        this.loadLevel(this.currentLevel);
    }

    // Start practice mode
    startPracticeMode(type) {
        this.showScreen('game');
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.isPracticeMode = true;
        this.practiceType = type;

        // Setup practice level
        const practiceLevel = {
            name: `${type} Practice`,
            description: 'Practice mode - no penalties',
            type: this.getPracticeEquationType(type),
            totalQuestions: 10,
            hints: true
        };

        this.loadCustomLevel(practiceLevel);
    }

    getPracticeEquationType(type) {
        const typeMap = {
            'basic': 'two-step-basic',
            'distributive': 'distributive-practice',
            'both-sides': 'both-sides-practice',
            'complex': 'complex-mixed'
        };
        return typeMap[type] || 'two-step-basic';
    }

    // Load a level
    loadLevel(levelId) {
        console.log('=== loadLevel() called ===');
        console.log('Level ID:', levelId);
        console.log('Is practice mode:', this.isPracticeMode);

        const levelInfo = this.equationGen.getLevelInfo(levelId);
        if (!levelInfo) {
            console.error('Level not found:', levelId);
            return;
        }

        console.log('Level info:', levelInfo);
        console.log('Level type:', levelInfo.type);

        // Check if this is a new concept that needs introduction
        const conceptKey = window.learningWorkflow?.getConceptForLevel(levelInfo.type);
        console.log('Concept key:', conceptKey);

        // Check if we've seen this concept before
        const learnedConcepts = JSON.parse(localStorage.getItem('learnedConcepts') || '[]');
        console.log('Learned concepts:', learnedConcepts);

        // ENFORCE: Level 1 ALWAYS shows intro (even if somehow marked as learned)
        if (levelId === 1 && learnedConcepts.length === 0) {
            console.log('✅ FIRST TIME USER - SHOWING LEVEL 1 VIDEO WORKFLOW');
            window.learningWorkflow.startLearningSequence(conceptKey, levelId);
            return;
        }

        if (conceptKey && !learnedConcepts.includes(conceptKey) && !this.isPracticeMode) {
            // New concept - start learning workflow
            console.log(`✅ NEW CONCEPT DETECTED: ${conceptKey} - SHOWING VIDEO WORKFLOW`);
            window.learningWorkflow.startLearningSequence(conceptKey, levelId);
            return;
        }

        // Already learned or practice mode - go straight to game
        console.log(`⏭️ Concept already learned, going directly to practice`);
        this.startLevelDirectly(levelInfo);
    }

    startLevelDirectly(levelInfo) {
        console.log('Starting level directly (concept already learned):', levelInfo.id);

        // Show game screen (we're going directly to practice)
        this.showScreen('game');

        this.currentLevelInfo = levelInfo;
        this.currentQuestion = 0;
        this.correctAnswers = 0;

        // Reset adaptive learning for new level
        if (window.adaptiveLearning) {
            window.adaptiveLearning.reset();
            console.log('🧠 Adaptive learning reset for level', levelInfo.id);
        }

        // Wait for DOM to be ready before updating UI
        setTimeout(() => {
            // Update UI
            document.getElementById('levelTitle').textContent = `Level ${levelInfo.id}: ${levelInfo.name}`;
            document.getElementById('levelDescription').textContent = levelInfo.description;

            // Update both progress displays
            document.getElementById('totalQuestions').textContent = levelInfo.totalQuestions;
            document.getElementById('currentQuestion').textContent = '0';
            document.getElementById('progressFill').style.width = '0%';

            // Update level progress (bottom display)
            document.getElementById('levelTotalQuestions').textContent = levelInfo.totalQuestions;
            document.getElementById('levelCurrentQuestion').textContent = '0';
            document.getElementById('levelProgressFill').style.width = '0%';

            document.getElementById('streak').textContent = this.streak;

            // Generate first question
            this.nextQuestion();
        }, 100);
    }

    loadCustomLevel(levelInfo) {
        this.currentLevelInfo = levelInfo;
        this.currentQuestion = 0;
        this.correctAnswers = 0;

        document.getElementById('levelTitle').textContent = levelInfo.name;
        document.getElementById('levelDescription').textContent = levelInfo.description;

        // Update both progress displays
        document.getElementById('totalQuestions').textContent = levelInfo.totalQuestions;
        document.getElementById('currentQuestion').textContent = '0';
        document.getElementById('progressFill').style.width = '0%';

        // Update level progress (bottom display)
        document.getElementById('levelTotalQuestions').textContent = levelInfo.totalQuestions;
        document.getElementById('levelCurrentQuestion').textContent = '0';
        document.getElementById('levelProgressFill').style.width = '0%';

        this.nextQuestion();
    }

    // Generate next question
    nextQuestion() {
        // Check with adaptive learning if we should continue
        if (window.adaptiveLearning && !this.isPracticeMode) {
            // Check if we've achieved mastery or should stop
            if (this.currentQuestion > 0 && !window.adaptiveLearning.shouldContinue()) {
                console.log('🎓 Adaptive learning says we should stop here');
                this.completeLevel();
                return;
            }
        }

        // Traditional check: max questions reached
        if (this.currentQuestion >= this.currentLevelInfo.totalQuestions) {
            this.completeLevel();
            return;
        }

        this.currentQuestion++;

        // Start timing this question
        this.questionStartTime = Date.now();
        this.hintUsedThisQuestion = false;

        // Generate equation with progressive difficulty based on question number
        this.currentEquation = this.equationGen.generateEquation(
            this.currentLevelInfo.type,
            this.currentQuestion,
            this.currentLevelInfo.totalQuestions
        );

        // Track problem start for student report
        if (window.studentReport) {
            window.studentReport.startProblem(
                this.currentEquation.equation,
                this.currentLevelInfo.name
            );
        }

        // Generate word problem (async)
        this.generateWordProblemForEquation();

        // Update UI
        document.getElementById('equationDisplay').textContent = this.currentEquation.equation;

        // Calculate progress percentage
        const progress = (this.currentQuestion / this.currentLevelInfo.totalQuestions) * 100;

        // Update TOP progress display (problem header)
        const currentQuestionEl = document.getElementById('currentQuestion');
        const totalQuestionsEl = document.getElementById('totalQuestions');
        const progressFillEl = document.getElementById('progressFill');

        if (currentQuestionEl) currentQuestionEl.textContent = this.currentQuestion;
        if (totalQuestionsEl) totalQuestionsEl.textContent = this.currentLevelInfo.totalQuestions;
        if (progressFillEl) {
            progressFillEl.style.width = `${progress}%`;
            progressFillEl.style.transition = 'width 0.3s ease';
        }

        // Update BOTTOM level progress display (the one you see at bottom)
        const levelCurrentQuestionEl = document.getElementById('levelCurrentQuestion');
        const levelTotalQuestionsEl = document.getElementById('levelTotalQuestions');
        const levelProgressFillEl = document.getElementById('levelProgressFill');

        if (levelCurrentQuestionEl) {
            levelCurrentQuestionEl.textContent = this.currentQuestion;
            console.log(`📊 Level Progress: ${this.currentQuestion}/${this.currentLevelInfo.totalQuestions}`);
        }

        if (levelTotalQuestionsEl) {
            levelTotalQuestionsEl.textContent = this.currentLevelInfo.totalQuestions;
        }

        if (levelProgressFillEl) {
            levelProgressFillEl.style.width = `${progress}%`;
            levelProgressFillEl.style.transition = 'width 0.3s ease';
        }

        // Clear optional fields (may not exist in all implementations)
        const answerField = document.getElementById('answerField');
        if (answerField) answerField.value = '';

        document.getElementById('feedbackArea').innerHTML = '';

        const stepsContainer = document.getElementById('stepsContainer');
        if (stepsContainer) stepsContainer.innerHTML = '';

        // Show hint if available
        if (this.currentLevelInfo.hints && this.currentEquation.hint) {
            document.getElementById('hintText').textContent = this.currentEquation.hint;
            document.getElementById('hintBox').style.display = 'block';
        } else {
            document.getElementById('hintBox').style.display = 'none';
        }

        // Display current mastery if adaptive learning is active
        if (window.adaptiveLearning && this.currentQuestion > 1 && !this.isPracticeMode) {
            const mastery = window.adaptiveLearning.getCurrentMastery();
            const difficulty = window.adaptiveLearning.getCurrentDifficulty();
            console.log(`📊 Mastery: ${(mastery * 100).toFixed(1)}% | Difficulty: ${difficulty}`);

            // Update UI with mastery info
            const masteryDisplay = document.getElementById('masteryDisplay');
            const masteryValue = document.getElementById('masteryValue');
            const difficultyBadge = document.getElementById('difficultyBadge');

            if (masteryDisplay && masteryValue && difficultyBadge) {
                masteryDisplay.style.display = 'flex';
                masteryValue.textContent = `${(mastery * 100).toFixed(0)}%`;
                difficultyBadge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

                // Color code difficulty badge
                difficultyBadge.className = 'difficulty-badge difficulty-' + difficulty;
            }
        }

        // Update 3D visualization
        if (window.threeVisualization) {
            window.threeVisualization.updateEquation(this.currentEquation);
        }

        // Clear feedback
        document.getElementById('feedbackArea').innerHTML = '';
    }

    // Generate and display word problem for current equation
    async generateWordProblemForEquation() {
        // Check if word problem generator is available
        if (!window.wordProblemGenerator) {
            console.log('Word problem generator not available');
            return;
        }

        // Get difficulty level from adaptive learning or use default
        let difficulty = 'medium';
        if (window.adaptiveLearning && !this.isPracticeMode) {
            difficulty = window.adaptiveLearning.getCurrentDifficulty();
        }

        // Show loading state
        const wordProblemSection = document.getElementById('wordProblemSection');
        const wordProblemText = document.getElementById('wordProblemText');

        if (wordProblemSection && wordProblemText) {
            wordProblemSection.style.display = 'block';
            wordProblemText.innerHTML = '<div style="text-align: center; opacity: 0.7;">✨ Generating word problem...</div>';

            try {
                // Generate word problem with full equation object
                const wordProblem = await window.wordProblemGenerator.generateWordProblem(
                    this.currentEquation,
                    difficulty
                );

                // Store word problem for current equation
                this.currentWordProblem = wordProblem;

                // Display the word problem
                wordProblemText.textContent = wordProblem;
                console.log('📝 Word problem generated:', wordProblem);
                console.log('   For equation:', this.currentEquation.equation);

                // Update visualization with word problem context
                if (window.threeVisualization) {
                    window.threeVisualization.updateEquation(this.currentEquation, wordProblem);
                    console.log('🎨 Visualization updated with word problem context');
                }

            } catch (error) {
                console.error('Error generating word problem:', error);
                wordProblemText.textContent = 'A student is working on an equation. Help them solve it!';
            }
        }
    }

    // Open step-by-step solver (MANDATORY METHOD)
    openStepSolver() {
        // Mark that help/hint was used for this question
        this.hintUsedThisQuestion = true;

        if (this.currentEquation && window.stepSolver) {
            // Open solver with callback for completion
            window.stepSolver.openWithCallback(this.currentEquation, () => {
                // Called when student completes ALL steps correctly
                this.onStepSolverCompleted();
            });
        }
    }

    // Called when step solver is completed successfully
    onStepSolverCompleted() {
        // Track problem completion for student report
        if (window.studentReport) {
            window.studentReport.completeProblem(true); // Completed correctly
        }

        // Student worked through all steps - give credit
        // handleCorrectAnswer() will automatically call nextQuestion() after delay
        this.handleCorrectAnswer();
    }

    // Check answer (DEPRECATED - keeping for backward compatibility)
    checkAnswer() {
        const answerField = document.getElementById('answerField');
        const userAnswer = answerField.value.trim().toLowerCase();

        if (!userAnswer) {
            this.showFeedback('Please enter an answer!', 'incorrect');
            return;
        }

        let isCorrect = false;
        const correctAnswer = this.currentEquation.answer;

        // Check for special solution types
        if (correctAnswer === 'infinite') {
            isCorrect = userAnswer === 'infinite' || userAnswer === 'infinitely many' ||
                       userAnswer === 'all' || userAnswer === 'all numbers';
        } else if (correctAnswer === 'none') {
            isCorrect = userAnswer === 'none' || userAnswer === 'no solution' ||
                       userAnswer === 'no' || userAnswer === '0';
        } else {
            // Numeric answer
            const userNum = parseFloat(userAnswer);
            isCorrect = Math.abs(userNum - correctAnswer) < 0.01;
        }

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(correctAnswer);
        }
    }

    handleCorrectAnswer() {
        this.correctAnswers++;
        this.streak++;

        // Record attempt with adaptive learning
        if (window.adaptiveLearning && !this.isPracticeMode) {
            const timeSpent = (Date.now() - this.questionStartTime) / 1000; // Convert to seconds
            const difficulty = window.adaptiveLearning.getCurrentDifficulty();
            const mastery = window.adaptiveLearning.recordAttempt(
                true, // correct
                timeSpent,
                this.hintUsedThisQuestion,
                difficulty
            );

            // Show mastery progress
            console.log(`✅ Correct! Mastery now at ${(mastery * 100).toFixed(1)}%`);
        }

        // Calculate XP and coins
        const baseXP = 20;
        const streakBonus = Math.min(this.streak * 5, 50);
        const totalXP = baseXP + streakBonus;
        const coins = Math.floor(totalXP / 10);

        this.addXP(totalXP);
        this.addCoins(coins);

        // Update streak display
        document.getElementById('streak').textContent = this.streak;

        // Show positive feedback with mastery info
        let message;
        if (window.adaptiveLearning && !this.isPracticeMode) {
            const recommendation = window.adaptiveLearning.getRecommendation();
            const messages = [
                `🎉 Perfect! +${totalXP} XP`,
                `🌟 Excellent work! +${totalXP} XP`,
                `✨ You're on fire! +${totalXP} XP`,
                `🚀 Amazing! +${totalXP} XP`,
                `⭐ Outstanding! +${totalXP} XP`
            ];
            message = messages[Math.floor(Math.random() * messages.length)];

            // Add mastery hint if close to completion
            if (recommendation.action === 'advance') {
                message += ' 🎯 Mastery achieved!';
            }
        } else {
            const messages = [
                `🎉 Perfect! +${totalXP} XP`,
                `🌟 Excellent work! +${totalXP} XP`,
                `✨ You're on fire! +${totalXP} XP`,
                `🚀 Amazing! +${totalXP} XP`,
                `⭐ Outstanding! +${totalXP} XP`
            ];
            message = messages[Math.floor(Math.random() * messages.length)];
        }

        this.showFeedback(message, 'correct');

        // Animate success
        this.animateSuccess();

        // Move to next question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    handleIncorrectAnswer(correctAnswer) {
        this.streak = 0;
        document.getElementById('streak').textContent = '0';

        // Record attempt with adaptive learning
        if (window.adaptiveLearning && !this.isPracticeMode) {
            const timeSpent = (Date.now() - this.questionStartTime) / 1000; // Convert to seconds
            const difficulty = window.adaptiveLearning.getCurrentDifficulty();
            const mastery = window.adaptiveLearning.recordAttempt(
                false, // incorrect
                timeSpent,
                this.hintUsedThisQuestion,
                difficulty
            );

            // Show mastery progress
            console.log(`❌ Incorrect. Mastery now at ${(mastery * 100).toFixed(1)}%`);
        }

        let answerText = correctAnswer;
        if (correctAnswer === 'infinite') {
            answerText = 'infinitely many solutions';
        } else if (correctAnswer === 'none') {
            answerText = 'no solution';
        } else {
            answerText = `x = ${correctAnswer}`;
        }

        this.showFeedback(
            `❌ Not quite. The correct answer is: ${answerText}. Try the next one!`,
            'incorrect'
        );

        // In practice mode, allow retry
        if (this.isPracticeMode) {
            const answerField = document.getElementById('answerField');
            if (answerField) {
                answerField.value = '';
                answerField.focus();
            }
        } else {
            // Move to next question after delay
            setTimeout(() => {
                this.nextQuestion();
            }, 3000);
        }
    }

    showFeedback(message, type) {
        const feedbackArea = document.getElementById('feedbackArea');
        feedbackArea.innerHTML = `<div class="feedback-message ${type}">${message}</div>`;
    }

    // Complete level - check for mastery
    completeLevel() {
        console.log('=== COMPLETING LEVEL ===');
        const levelInfo = this.currentLevelInfo;
        console.log('Level:', levelInfo.id, 'World:', levelInfo.world);
        console.log('Correct answers:', this.correctAnswers, 'out of', this.currentQuestion, 'attempted');

        // Check mastery using adaptive learning if available, otherwise use traditional method
        let hasMastery = false;
        let masteryScore = 0;
        let recommendation = null;

        if (window.adaptiveLearning && !this.isPracticeMode) {
            // Use adaptive learning mastery
            hasMastery = window.adaptiveLearning.hasMastery();
            masteryScore = window.adaptiveLearning.getCurrentMastery();
            recommendation = window.adaptiveLearning.getRecommendation();
            console.log('🧠 Adaptive Learning Mastery:', hasMastery);
            console.log('📊 Mastery Score:', (masteryScore * 100).toFixed(1) + '%');
            console.log('💡 Recommendation:', recommendation.message);
        } else {
            // Traditional mastery check
            const masteryRequired = levelInfo.masteryRequired || 3;
            hasMastery = this.correctAnswers >= masteryRequired;
            console.log('Mastery required:', masteryRequired, 'Has mastery:', hasMastery);
        }

        // Calculate rewards
        const baseXP = 100;
        const masteryBonus = hasMastery ? 100 : 0;
        const perfectBonus = (this.correctAnswers === this.currentQuestion) ? 50 : 0;
        const totalXP = baseXP + masteryBonus + perfectBonus;
        const coins = 20 + (hasMastery ? 20 : 0);

        if (hasMastery) {
            // MASTERY ACHIEVED!
            this.addXP(totalXP);
            this.addCoins(coins);

            // Track level completion for student report
            if (window.studentReport) {
                window.studentReport.recordLevelCompleted(levelInfo.name, true);
                // Auto-download the student evaluation report
                console.log('📥 Generating student evaluation report...');
                setTimeout(() => {
                    window.studentReport.downloadReport();
                }, 500); // Small delay to ensure everything is tracked
            }

            // Update progress
            if (!this.isPracticeMode) {
                console.log('📊 UPDATING PROGRESS - World:', levelInfo.world);
                console.log('Before:', this.worldProgress);
                this.worldProgress[levelInfo.world]++;
                console.log('After:', this.worldProgress);
                this.currentLevel++;
                this.saveProgress();
                this.updateWorldProgress();
                this.updatePlayerStats(); // Update the home screen display
                console.log('✅ Progress saved and updated');
            }

            // Show success modal with adaptive learning info
            document.getElementById('earnedXP').textContent = totalXP;
            document.getElementById('earnedCoins').textContent = coins;

            // Add mastery percentage to success message if using adaptive learning
            if (masteryScore > 0) {
                const scoreDisplay = document.createElement('div');
                scoreDisplay.style.marginTop = '10px';
                scoreDisplay.style.fontSize = '0.9em';
                scoreDisplay.style.opacity = '0.9';
                scoreDisplay.textContent = `Mastery: ${(masteryScore * 100).toFixed(1)}% | Questions: ${this.currentQuestion}`;
                const modal = document.getElementById('successModal');
                const earnedXPEl = document.getElementById('earnedXP');
                if (earnedXPEl && earnedXPEl.parentElement) {
                    earnedXPEl.parentElement.appendChild(scoreDisplay);
                }
            }

            document.getElementById('successModal').classList.add('active');

            // Play celebration
            this.playCelebration();

        } else {
            // NEED MORE PRACTICE
            let feedbackMessage;

            if (recommendation) {
                // Use adaptive learning recommendation
                feedbackMessage = recommendation.message + `\n\nYou answered ${this.correctAnswers}/${this.currentQuestion} correctly.`;
            } else {
                // Traditional feedback
                const masteryRequired = levelInfo.masteryRequired || 3;
                feedbackMessage = `📚 You got ${this.correctAnswers}/${this.currentQuestion} correct. ` +
                    `You need ${masteryRequired} correct to advance. Let's review and try again!`;
            }

            this.showFeedback(feedbackMessage, 'incorrect');

            // Offer to retry or go to tutorial
            setTimeout(() => {
                if (confirm('Would you like to:\n- Review the tutorial videos\n- Try the level again\n\nClick OK for tutorial, Cancel to retry')) {
                    this.showScreen('tutorial');
                } else {
                    this.loadLevel(levelInfo.id);
                }
            }, 2000);
        }
    }

    // Show hint
    showHint() {
        // Mark that a hint was used for this question
        this.hintUsedThisQuestion = true;

        if (this.currentEquation && this.currentEquation.hint) {
            alert(`💡 Hint: ${this.currentEquation.hint}`);
        } else {
            alert('💡 Think about isolating the variable step by step!');
        }
    }

    // Get help - open interactive step solver
    getHelp() {
        // Mark that help was used for this question
        this.hintUsedThisQuestion = true;

        if (this.currentEquation && window.stepSolver) {
            window.stepSolver.open(this.currentEquation);
        } else {
            alert('Step solver not available. Please try the hints instead!');
        }
    }

    // Skip question
    skipQuestion() {
        if (confirm('Are you sure you want to skip this question? You won\'t earn points.')) {
            this.showFeedback('Skipped. Try the next one!', 'incorrect');
            setTimeout(() => {
                this.nextQuestion();
            }, 1500);
        }
    }

    // XP and leveling
    addXP(amount) {
        this.playerXP += amount;

        // Check for level up
        const xpNeeded = this.playerLevel * 100;
        while (this.playerXP >= xpNeeded) {
            this.playerXP -= xpNeeded;
            this.playerLevel++;
            this.showLevelUpNotification();
        }

        this.updatePlayerStats();
        this.saveProgress();
    }

    addCoins(amount) {
        this.playerCoins += amount;
        this.updatePlayerStats();
        this.saveProgress();
    }

    updatePlayerStats() {
        document.getElementById('playerLevel').textContent = this.playerLevel;
        document.getElementById('playerXP').textContent = this.playerXP;
        document.querySelector('#playerXP + .stat-max').textContent = `/${this.playerLevel * 100}`;
        document.getElementById('playerCoins').textContent = this.playerCoins;

        // Update current level display on home screen
        this.updateCurrentLevelDisplay();
    }

    updateCurrentLevelDisplay() {
        const nextLevelInfo = this.equationGen.getLevelInfo(this.currentLevel);
        if (nextLevelInfo) {
            document.getElementById('displayLevelNum').textContent = `Level ${nextLevelInfo.id}`;
            document.getElementById('displayLevelTitle').textContent = nextLevelInfo.name;

            // Get world icon and name
            const worldData = {
                1: {icon: '🏰', name: 'Castle of Basics'},
                2: {icon: '🌲', name: 'Forest of Distribution'},
                3: {icon: '⛰️', name: 'Mountain of Both Sides'},
                4: {icon: '🌊', name: 'Ocean of Fractions'},
                5: {icon: '🐉', name: 'Dragon\'s Lair'}
            };

            const world = worldData[nextLevelInfo.world] || {icon: '📚', name: 'Learning Path'};
            document.getElementById('displayLevelWorld').textContent = `${world.icon} ${world.name}`;
        }
    }

    showLevelUpNotification() {
        // Could add a fancy animation here
        alert(`🎊 LEVEL UP! You're now level ${this.playerLevel}!`);
    }


    // World progress
    updateWorldProgress() {
        console.log('🗺️ Updating world progress display');
        const nextLevelInfo = this.equationGen.getLevelInfo(this.currentLevel);
        const currentWorld = nextLevelInfo ? nextLevelInfo.world : 1;
        console.log('Current level:', this.currentLevel, 'Current world:', currentWorld);
        console.log('World progress data:', this.worldProgress);

        document.querySelectorAll('.world-item').forEach(item => {
            const world = parseInt(item.dataset.world);
            const total = this.equationGen.levels.filter(l => l.world === world).length;
            const completed = this.worldProgress[world] || 0;

            console.log(`World ${world}: ${completed}/${total} completed`);

            // Update completion count
            const statusElement = item.querySelector('.world-status');
            if (statusElement) {
                statusElement.textContent = `${completed}/${total}`;
            }

            // Highlight current world
            if (world === currentWorld) {
                item.classList.add('current-world');
            } else {
                item.classList.remove('current-world');
            }

            // Mark completed worlds
            if (completed >= total) {
                item.classList.add('completed-world');
            } else {
                item.classList.remove('completed-world');
            }
        });
    }

    // Animations
    animateSuccess() {
        // Could add particle effects or animations
        const display = document.getElementById('equationDisplay');
        display.style.transform = 'scale(1.1)';
        setTimeout(() => {
            display.style.transform = 'scale(1)';
        }, 300);
    }

    playCelebration() {
        // Add confetti or celebration animation
        console.log('🎉 Celebration!');
    }

    // Modals
    closeSuccessModal() {
        document.getElementById('successModal').classList.remove('active');

        if (!this.isPracticeMode) {
            // Check if there's a next level
            const nextLevelInfo = this.equationGen.getLevelInfo(this.currentLevel);
            if (nextLevelInfo) {
                this.loadLevel(this.currentLevel);
            } else {
                // Game complete!
                alert('🎉 Congratulations! You\'ve completed all levels!');
                this.showScreen('menu');
            }
        } else {
            this.showScreen('menu');
        }
    }

    // Save/Load progress
    saveProgress() {
        const progress = {
            currentLevel: this.currentLevel,
            playerXP: this.playerXP,
            playerCoins: this.playerCoins,
            playerLevel: this.playerLevel,
            worldProgress: this.worldProgress,
            streak: this.streak,
            lastSaved: new Date().toISOString(),
            // Save current level state if in progress
            inProgressLevel: this.currentLevelInfo ? {
                levelId: this.currentLevelInfo.id,
                currentQuestion: this.currentQuestion,
                correctAnswers: this.correctAnswers
            } : null
        };
        localStorage.setItem('equationQuestProgress', JSON.stringify(progress));

        // Auto-save notification (subtle)
        console.log('Progress auto-saved at', new Date().toLocaleTimeString());
    }

    loadProgress() {
        const saved = localStorage.getItem('equationQuestProgress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                this.currentLevel = progress.currentLevel || 1;
                this.playerXP = progress.playerXP || 0;
                this.playerCoins = progress.playerCoins || 0;
                this.playerLevel = progress.playerLevel || 1;
                this.worldProgress = progress.worldProgress || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
                this.streak = progress.streak || 0;

                // Check for in-progress level
                if (progress.inProgressLevel) {
                    this.hasInProgressLevel = true;
                    this.inProgressData = progress.inProgressLevel;
                }

                // Log last save time
                if (progress.lastSaved) {
                    console.log('Progress loaded from', new Date(progress.lastSaved).toLocaleString());
                }
            } catch (e) {
                console.error('Error loading progress:', e);
                // Reset progress if corrupted
                this.resetProgress();
            }
        }
    }

    resetProgress() {
        this.currentLevel = 1;
        this.playerXP = 0;
        this.playerCoins = 0;
        this.playerLevel = 1;
        this.worldProgress = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        this.streak = 0;
        this.saveProgress();
    }

    // Auto-save every 30 seconds
    startAutoSave() {
        setInterval(() => {
            if (this.currentLevelInfo) {
                this.saveProgress();
            }
        }, 30000); // 30 seconds
    }

    checkResumeLevel() {
        if (this.hasInProgressLevel && this.inProgressData) {
            const levelInfo = this.equationGen.getLevelInfo(this.inProgressData.levelId);
            if (confirm(
                `📚 Resume your progress?\n\n` +
                `You were working on Level ${levelInfo.id}: "${levelInfo.name}"\n` +
                `Question ${this.inProgressData.currentQuestion} of ${levelInfo.totalQuestions}\n\n` +
                `Click OK to resume, or Cancel to start fresh.`
            )) {
                // Resume the level
                this.resumeLevel(this.inProgressData);
            } else {
                // Clear in-progress data
                this.hasInProgressLevel = false;
                this.inProgressData = null;
                this.saveProgress();
            }
        }
    }

    resumeLevel(data) {
        const levelInfo = this.equationGen.getLevelInfo(data.levelId);
        this.currentLevelInfo = levelInfo;
        this.currentQuestion = data.currentQuestion - 1; // Will increment on nextQuestion
        this.correctAnswers = data.correctAnswers;

        this.showScreen('game');

        // Wait for DOM to be ready before updating UI
        setTimeout(() => {
            this.nextQuestion();
        }, 100);
    }

    showChallengeMode() {
        alert('🏆 Challenge mode coming soon! Complete more levels to unlock.');
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});
