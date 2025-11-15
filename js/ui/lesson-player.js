/**
 * Lesson Player - Duolingo-Style Microlearning
 *
 * PURPOSE: Main controller for bite-sized lesson experiences
 * FEATURES:
 * - Load lesson data (5-7 exercises per lesson)
 * - Show progress bar
 * - Display one exercise at a time
 * - Handle submissions and feedback
 * - Track time and attempts
 * - Calculate and award XP/coins
 */

const LessonPlayer = {
  // Current lesson state
  lessonId: null,
  lessonData: null,
  currentExerciseIndex: 0,
  exercises: [],

  // Performance tracking
  startTime: null,
  attempts: [],
  correctCount: 0,
  totalTime: 0,

  // UI elements
  container: null,
  exerciseContainer: null,
  checkButton: null,
  continueButton: null,

  /**
   * Initialize the lesson player
   * @param {number} lessonId - The lesson to load
   */
  async init(lessonId) {
    console.log(`Starting lesson ${lessonId}...`);

    this.lessonId = lessonId;
    this.currentExerciseIndex = 0;
    this.attempts = [];
    this.correctCount = 0;
    this.startTime = Date.now();

    // Load lesson data
    await this.loadLessonData(lessonId);

    // Setup UI
    this.setupUI();

    // Show first exercise
    this.showExercise(0);
  },

  /**
   * Load lesson data from lessons configuration
   * @param {number} lessonId
   */
  async loadLessonData(lessonId) {
    // Get lesson metadata from schedule
    const metadata = window.ScheduleConfig?.getLessonMetadata(lessonId);

    if (!metadata) {
      console.error(`No metadata found for lesson ${lessonId}`);
      return;
    }

    // Load exercises for this lesson
    const exercises = window.LessonExercises?.getExercisesForLesson(lessonId);

    if (!exercises || exercises.length === 0) {
      console.error(`No exercises found for lesson ${lessonId}`);
      // Create sample exercises
      this.exercises = this.createSampleExercises(metadata);
    } else {
      this.exercises = exercises;
    }

    this.lessonData = {
      id: lessonId,
      name: metadata.name,
      topic: metadata.topic,
      exerciseCount: this.exercises.length,
      ...metadata
    };

    console.log(`Loaded lesson: ${this.lessonData.name} (${this.exercises.length} exercises)`);
  },

  /**
   * Create sample exercises if none exist
   * @param {object} metadata
   * @returns {Array}
   */
  createSampleExercises(metadata) {
    const topic = metadata.topic;

    // Sample exercises based on topic
    if (topic === 'Two-Step Equations') {
      return [
        new window.ExerciseTypes.MultipleChoice(
          'What is the first step to solve: 2x + 5 = 13?',
          ['Divide both sides by 2', 'Subtract 5 from both sides', 'Add 5 to both sides', 'Multiply both sides by 2'],
          1,
          'Remember: work backwards! Undo addition before division.'
        ),
        new window.ExerciseTypes.MathProblem('2x + 5 = 13', 4, 'Subtract 5 first, then divide by 2'),
        new window.ExerciseTypes.MathProblem('3x - 7 = 8', 5, 'Add 7 first, then divide by 3'),
        new window.ExerciseTypes.TrueFalse(
          'To solve 4x + 12 = 28, you should divide by 4 before subtracting 12.',
          false,
          'Always undo addition/subtraction before multiplication/division!'
        ),
        new window.ExerciseTypes.MathProblem('5x + 3 = 18', 3),
        new window.ExerciseTypes.MultipleChoice(
          'Which equation has the solution x = 6?',
          ['2x + 3 = 15', '3x - 2 = 16', '4x + 1 = 23', '5x - 5 = 25'],
          1,
          'Try substituting x = 6 into each equation'
        ),
        new window.ExerciseTypes.MathProblem('7x - 4 = 17', 3)
      ];
    } else if (topic === 'Combining Like Terms') {
      return [
        new window.ExerciseTypes.MultipleChoice(
          'Which terms are "like terms"?',
          ['3x and 3y', '5x and 2x', '4 and 4x', '2x² and 2x'],
          1,
          'Like terms have the same variable with the same exponent'
        ),
        new window.ExerciseTypes.FillInTheBlank(
          'Simplify: 3x + 5x = ___',
          '8x',
          false,
          'Add the coefficients: 3 + 5 = 8'
        ),
        new window.ExerciseTypes.MathProblem('2x + 3x - 1 = 14', 3),
        new window.ExerciseTypes.TrueFalse(
          '7x - 2x can be simplified to 5x',
          true,
          'Correct! 7 - 2 = 5'
        ),
        new window.ExerciseTypes.FillInTheBlank(
          'Combine: 4x + 2 + 3x - 5 = ___x + ___',
          '7x - 3',
          false
        ),
        new window.ExerciseTypes.MathProblem('5x - 2x + 6 = 15', 3)
      ];
    } else {
      // Generic exercises
      return [
        new window.ExerciseTypes.MathProblem('2x + 3 = 11', 4),
        new window.ExerciseTypes.MathProblem('3x - 5 = 10', 5),
        new window.ExerciseTypes.MathProblem('4x + 7 = 19', 3),
        new window.ExerciseTypes.MathProblem('5x - 2 = 13', 3),
        new window.ExerciseTypes.MathProblem('6x + 1 = 25', 4)
      ];
    }
  },

  /**
   * Setup the UI elements
   */
  setupUI() {
    this.container = document.getElementById('lessonPlayerContainer');
    this.exerciseContainer = document.getElementById('exerciseContainer');
    this.checkButton = document.getElementById('checkAnswerBtn');
    this.continueButton = document.getElementById('continueBtn');

    // Update header info
    document.getElementById('lessonTitle').textContent = this.lessonData.name;
    document.getElementById('lessonTopic').textContent = this.lessonData.topic;

    // Setup event listeners
    this.checkButton.addEventListener('click', () => this.checkAnswer());
    this.continueButton.addEventListener('click', () => this.nextExercise());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.checkButton.disabled) {
        this.checkAnswer();
      }
    });

    // Exit button
    document.getElementById('exitLessonBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
        this.exitLesson();
      }
    });
  },

  /**
   * Show a specific exercise
   * @param {number} index
   */
  showExercise(index) {
    if (index >= this.exercises.length) {
      this.completeLesson();
      return;
    }

    this.currentExerciseIndex = index;
    const exercise = this.exercises[index];

    // Update progress
    this.updateProgress();

    // Clear previous exercise
    this.exerciseContainer.innerHTML = '';

    // Render new exercise
    const exerciseHTML = exercise.render();
    this.exerciseContainer.innerHTML = exerciseHTML;

    // Attach exercise-specific listeners
    exercise.attachListeners(this.exerciseContainer, (hasAnswer) => {
      this.checkButton.disabled = !hasAnswer;
    });

    // Reset buttons
    this.checkButton.disabled = true;
    this.checkButton.style.display = 'block';
    this.continueButton.style.display = 'none';

    // Hide feedback
    document.getElementById('feedbackArea').style.display = 'none';

    // Track attempt start time
    this.attempts[index] = {
      startTime: Date.now(),
      tries: 0
    };
  },

  /**
   * Update progress indicators
   */
  updateProgress() {
    const current = this.currentExerciseIndex + 1;
    const total = this.exercises.length;
    const percentage = (this.currentExerciseIndex / total) * 100;

    // Update text
    document.getElementById('currentExercise').textContent = current;
    document.getElementById('totalExercises').textContent = total;

    // Update progress bar
    document.getElementById('progressBar').value = percentage;
    document.getElementById('progressFill').style.width = `${percentage}%`;
  },

  /**
   * Check the current answer
   */
  checkAnswer() {
    const exercise = this.exercises[this.currentExerciseIndex];
    const isCorrect = exercise.checkAnswer();

    // Track attempt
    this.attempts[this.currentExerciseIndex].tries++;
    this.attempts[this.currentExerciseIndex].endTime = Date.now();
    this.attempts[this.currentExerciseIndex].correct = isCorrect;

    if (isCorrect) {
      this.correctCount++;
    }

    // Show feedback
    const feedback = exercise.showFeedback(this.exerciseContainer, isCorrect);
    this.displayFeedback(feedback);

    // Disable check button, show continue
    this.checkButton.style.display = 'none';
    this.continueButton.style.display = 'block';
    this.continueButton.focus();

    // Play animation
    if (isCorrect) {
      this.playSuccessAnimation();
    } else {
      this.playErrorAnimation();
    }
  },

  /**
   * Display feedback message
   * @param {object} feedback
   */
  displayFeedback(feedback) {
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.className = `feedback-message ${feedback.type}`;
    feedbackArea.innerHTML = `
      <div class="feedback-icon">${feedback.type === 'success' ? '✓' : '✗'}</div>
      <div class="feedback-content">
        <div class="feedback-title">${feedback.message}</div>
        ${feedback.explanation ? `<div class="feedback-explanation">${feedback.explanation}</div>` : ''}
      </div>
    `;
    feedbackArea.style.display = 'flex';
  },

  /**
   * Move to next exercise
   */
  nextExercise() {
    this.showExercise(this.currentExerciseIndex + 1);
  },

  /**
   * Complete the lesson
   */
  completeLesson() {
    this.totalTime = Date.now() - this.startTime;

    // Calculate score
    const score = this.calculateScore();

    // Save progress
    this.saveProgress(score);

    // Show completion screen
    window.LessonComplete.show(this.lessonData, score);
  },

  /**
   * Calculate final score and XP
   * @returns {object}
   */
  calculateScore() {
    const totalExercises = this.exercises.length;
    const correctExercises = this.correctCount;
    const accuracy = (correctExercises / totalExercises) * 100;

    // Base XP
    let xp = 50;

    // Accuracy bonus
    if (accuracy === 100) {
      xp += 20; // Perfect score
    } else if (accuracy >= 80) {
      xp += 10; // Good score
    }

    // Speed bonus (under 5 minutes)
    const minutes = this.totalTime / 1000 / 60;
    if (minutes < 5) {
      xp += 10;
    }

    // First-try bonus
    const firstTryCorrect = this.attempts.filter(a => a.tries === 1 && a.correct).length;
    const firstTryBonus = Math.floor(firstTryCorrect / totalExercises * 10);
    xp += firstTryBonus;

    // Coins based on accuracy
    const coins = Math.floor(accuracy / 10); // 10 coins for 100%, 9 for 90%, etc.

    return {
      totalExercises,
      correctExercises,
      accuracy: Math.round(accuracy),
      xp,
      coins,
      timeSpent: Math.round(minutes * 10) / 10, // Round to 1 decimal
      attempts: this.attempts,
      breakdown: {
        base: 50,
        accuracyBonus: accuracy === 100 ? 20 : (accuracy >= 80 ? 10 : 0),
        speedBonus: minutes < 5 ? 10 : 0,
        firstTryBonus
      }
    };
  },

  /**
   * Save lesson progress
   * @param {object} score
   */
  saveProgress(score) {
    // Mark lesson as complete in LessonScheduler
    if (window.LessonScheduler) {
      window.LessonScheduler.completLesson(this.lessonId);
    }

    // Save lesson results to localStorage
    const results = JSON.parse(localStorage.getItem('lessonResults') || '{}');
    results[this.lessonId] = {
      completedAt: new Date().toISOString(),
      score: score,
      lessonName: this.lessonData.name
    };
    localStorage.setItem('lessonResults', JSON.stringify(results));

    // Award XP and coins to player
    if (window.gameController) {
      window.gameController.addXP(score.xp);
      window.gameController.addCoins(score.coins);
    }

    console.log(`Lesson ${this.lessonId} completed! XP: ${score.xp}, Coins: ${score.coins}`);
  },

  /**
   * Exit lesson without completing
   */
  exitLesson() {
    // Return to main menu or skill tree
    if (window.gameController) {
      window.gameController.showScreen('menu');
    } else {
      window.location.href = '/index.html';
    }
  },

  /**
   * Play success animation
   */
  playSuccessAnimation() {
    this.exerciseContainer.classList.add('animate-success');
    setTimeout(() => {
      this.exerciseContainer.classList.remove('animate-success');
    }, 600);

    // Optional: play sound effect
    this.playSound('success');
  },

  /**
   * Play error animation
   */
  playErrorAnimation() {
    this.exerciseContainer.classList.add('animate-shake');
    setTimeout(() => {
      this.exerciseContainer.classList.remove('animate-shake');
    }, 500);

    // Optional: play sound effect
    this.playSound('error');
  },

  /**
   * Play sound effect (if enabled)
   * @param {string} type - 'success' or 'error'
   */
  playSound(type) {
    // Check if sounds are enabled
    const soundsEnabled = localStorage.getItem('soundsEnabled') !== 'false';

    if (!soundsEnabled) return;

    // Create audio context if needed
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.log('Audio not supported');
        return;
      }
    }

    // Play simple beep (using Web Audio API)
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    if (type === 'success') {
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } else {
      oscillator.frequency.value = 200;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.2);
    }
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.LessonPlayer = LessonPlayer;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonPlayer;
}
