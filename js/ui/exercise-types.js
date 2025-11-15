/**
 * Exercise Types for Microlearning Lessons
 *
 * PURPOSE: Define different types of exercises for Duolingo-style lessons
 * Each exercise type has: render(), checkAnswer(), showFeedback()
 */

const ExerciseTypes = {
  /**
   * Multiple Choice Exercise
   * @param {string} question - The question text
   * @param {Array} options - Array of option strings
   * @param {number} correctIndex - Index of correct answer (0-based)
   * @param {string} hint - Optional hint text
   */
  MultipleChoice: class {
    constructor(question, options, correctIndex, hint = '') {
      this.question = question;
      this.options = options;
      this.correctIndex = correctIndex;
      this.hint = hint;
      this.selectedIndex = null;
    }

    render() {
      return `
        <div class="exercise multiple-choice">
          <div class="exercise-question">
            <h3>${this.question}</h3>
          </div>
          <div class="exercise-options" role="radiogroup" aria-label="Answer options">
            ${this.options.map((option, index) => `
              <button class="option-btn"
                      data-index="${index}"
                      role="radio"
                      aria-checked="false"
                      tabindex="${index === 0 ? '0' : '-1'}">
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
              </button>
            `).join('')}
          </div>
          ${this.hint ? `<div class="exercise-hint" style="display: none;">💡 ${this.hint}</div>` : ''}
        </div>
      `;
    }

    attachListeners(container, onAnswer) {
      const buttons = container.querySelectorAll('.option-btn');
      buttons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          // Clear previous selection
          buttons.forEach(b => {
            b.classList.remove('selected');
            b.setAttribute('aria-checked', 'false');
          });

          // Mark as selected
          btn.classList.add('selected');
          btn.setAttribute('aria-checked', 'true');
          this.selectedIndex = index;

          // Notify parent
          if (onAnswer) onAnswer(true); // Has answer
        });

        // Keyboard navigation
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const nextBtn = buttons[(index + 1) % buttons.length];
            nextBtn.focus();
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevBtn = buttons[(index - 1 + buttons.length) % buttons.length];
            prevBtn.focus();
          }
        });
      });
    }

    checkAnswer() {
      return this.selectedIndex === this.correctIndex;
    }

    showFeedback(container, isCorrect) {
      const buttons = container.querySelectorAll('.option-btn');

      if (isCorrect) {
        buttons[this.selectedIndex].classList.add('correct');
        return {
          type: 'success',
          message: '✓ Correct! Great job!',
          explanation: ''
        };
      } else {
        buttons[this.selectedIndex].classList.add('incorrect');
        buttons[this.correctIndex].classList.add('correct-answer');

        const hintEl = container.querySelector('.exercise-hint');
        if (hintEl) hintEl.style.display = 'block';

        return {
          type: 'error',
          message: '✗ Not quite right.',
          explanation: `The correct answer is: ${this.options[this.correctIndex]}`
        };
      }
    }
  },

  /**
   * Fill in the Blank Exercise
   * @param {string} question - Question with ___ for blank
   * @param {string|number} correctAnswer - The correct answer
   * @param {boolean} caseSensitive - Whether to check case
   * @param {string} hint - Optional hint
   */
  FillInTheBlank: class {
    constructor(question, correctAnswer, caseSensitive = false, hint = '') {
      this.question = question;
      this.correctAnswer = String(correctAnswer).trim();
      this.caseSensitive = caseSensitive;
      this.hint = hint;
      this.userAnswer = '';
    }

    render() {
      return `
        <div class="exercise fill-in-blank">
          <div class="exercise-question">
            <h3>${this.question}</h3>
          </div>
          <div class="exercise-input-area">
            <label for="answer-input" class="sr-only">Your answer</label>
            <input type="text"
                   id="answer-input"
                   class="answer-input"
                   placeholder="Type your answer here"
                   autocomplete="off"
                   spellcheck="false"
                   aria-label="Answer input">
          </div>
          ${this.hint ? `<div class="exercise-hint" style="display: none;">💡 ${this.hint}</div>` : ''}
        </div>
      `;
    }

    attachListeners(container, onAnswer) {
      const input = container.querySelector('.answer-input');
      input.addEventListener('input', (e) => {
        this.userAnswer = e.target.value.trim();
        onAnswer(this.userAnswer.length > 0);
      });

      // Auto-focus input
      setTimeout(() => input.focus(), 100);
    }

    checkAnswer() {
      const userAns = this.caseSensitive ? this.userAnswer : this.userAnswer.toLowerCase();
      const correctAns = this.caseSensitive ? this.correctAnswer : this.correctAnswer.toLowerCase();

      // Also check for numeric equality
      if (!isNaN(userAns) && !isNaN(correctAns)) {
        return parseFloat(userAns) === parseFloat(correctAns);
      }

      return userAns === correctAns;
    }

    showFeedback(container, isCorrect) {
      const input = container.querySelector('.answer-input');

      if (isCorrect) {
        input.classList.add('correct');
        return {
          type: 'success',
          message: '✓ Correct!',
          explanation: ''
        };
      } else {
        input.classList.add('incorrect');

        const hintEl = container.querySelector('.exercise-hint');
        if (hintEl) hintEl.style.display = 'block';

        return {
          type: 'error',
          message: '✗ Not quite right.',
          explanation: `The correct answer is: ${this.correctAnswer}`
        };
      }
    }
  },

  /**
   * Math Problem Exercise (specific for equations)
   * @param {string} equation - The equation to solve (e.g., "2x + 5 = 13")
   * @param {number} correctAnswer - The solution
   * @param {string} hint - Optional hint
   */
  MathProblem: class {
    constructor(equation, correctAnswer, hint = '') {
      this.equation = equation;
      this.correctAnswer = correctAnswer;
      this.hint = hint;
      this.userAnswer = '';
    }

    render() {
      return `
        <div class="exercise math-problem">
          <div class="exercise-question">
            <h3>Solve for x:</h3>
          </div>
          <div class="equation-display">
            ${this.equation}
          </div>
          <div class="exercise-input-area">
            <label for="math-answer" class="input-label">x =</label>
            <input type="text"
                   id="math-answer"
                   class="answer-input math-input"
                   placeholder="?"
                   autocomplete="off"
                   inputmode="numeric"
                   aria-label="Solution for x">
          </div>
          ${this.hint ? `<div class="exercise-hint" style="display: none;">💡 ${this.hint}</div>` : ''}
        </div>
      `;
    }

    attachListeners(container, onAnswer) {
      const input = container.querySelector('.math-input');
      input.addEventListener('input', (e) => {
        this.userAnswer = e.target.value.trim();
        onAnswer(this.userAnswer.length > 0);
      });

      // Auto-focus
      setTimeout(() => input.focus(), 100);
    }

    checkAnswer() {
      // Handle fractions like "1/2"
      let userValue = this.userAnswer;
      let correctValue = this.correctAnswer;

      // Parse fractions
      if (this.userAnswer.includes('/')) {
        const [num, den] = this.userAnswer.split('/').map(x => parseFloat(x.trim()));
        userValue = num / den;
      } else {
        userValue = parseFloat(this.userAnswer);
      }

      if (typeof correctValue === 'string' && correctValue.includes('/')) {
        const [num, den] = correctValue.split('/').map(x => parseFloat(x.trim()));
        correctValue = num / den;
      } else {
        correctValue = parseFloat(correctValue);
      }

      // Check if both are valid numbers
      if (isNaN(userValue) || isNaN(correctValue)) {
        return false;
      }

      // Allow small floating point errors
      return Math.abs(userValue - correctValue) < 0.0001;
    }

    showFeedback(container, isCorrect) {
      const input = container.querySelector('.math-input');

      if (isCorrect) {
        input.classList.add('correct');
        return {
          type: 'success',
          message: '✓ Perfect! That\'s the right answer!',
          explanation: ''
        };
      } else {
        input.classList.add('incorrect');

        const hintEl = container.querySelector('.exercise-hint');
        if (hintEl) hintEl.style.display = 'block';

        return {
          type: 'error',
          message: '✗ Not quite. Try again!',
          explanation: `The correct answer is x = ${this.correctAnswer}`
        };
      }
    }
  },

  /**
   * True/False Exercise
   * @param {string} statement - The statement to evaluate
   * @param {boolean} correctAnswer - True or False
   * @param {string} explanation - Explanation of the answer
   */
  TrueFalse: class {
    constructor(statement, correctAnswer, explanation = '') {
      this.statement = statement;
      this.correctAnswer = correctAnswer;
      this.explanation = explanation;
      this.selectedAnswer = null;
    }

    render() {
      return `
        <div class="exercise true-false">
          <div class="exercise-question">
            <h3>True or False?</h3>
            <p class="statement">${this.statement}</p>
          </div>
          <div class="exercise-options tf-options" role="radiogroup" aria-label="True or False">
            <button class="option-btn tf-btn" data-value="true" role="radio" aria-checked="false">
              <span class="option-text">True</span>
            </button>
            <button class="option-btn tf-btn" data-value="false" role="radio" aria-checked="false">
              <span class="option-text">False</span>
            </button>
          </div>
        </div>
      `;
    }

    attachListeners(container, onAnswer) {
      const buttons = container.querySelectorAll('.tf-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => {
            b.classList.remove('selected');
            b.setAttribute('aria-checked', 'false');
          });

          btn.classList.add('selected');
          btn.setAttribute('aria-checked', 'true');
          this.selectedAnswer = btn.dataset.value === 'true';

          onAnswer(true);
        });
      });
    }

    checkAnswer() {
      return this.selectedAnswer === this.correctAnswer;
    }

    showFeedback(container, isCorrect) {
      const buttons = container.querySelectorAll('.tf-btn');
      const selectedBtn = container.querySelector('.tf-btn.selected');

      if (isCorrect) {
        selectedBtn.classList.add('correct');
        return {
          type: 'success',
          message: '✓ Correct!',
          explanation: this.explanation
        };
      } else {
        selectedBtn.classList.add('incorrect');
        const correctBtn = Array.from(buttons).find(b =>
          (b.dataset.value === 'true') === this.correctAnswer
        );
        if (correctBtn) correctBtn.classList.add('correct-answer');

        return {
          type: 'error',
          message: '✗ Incorrect.',
          explanation: this.explanation
        };
      }
    }
  },

  /**
   * Ordering Exercise (put steps in order)
   * @param {string} question - The question
   * @param {Array} items - Items to order
   * @param {Array} correctOrder - Correct order (indices)
   */
  Ordering: class {
    constructor(question, items, correctOrder) {
      this.question = question;
      this.items = items;
      this.correctOrder = correctOrder;
      this.currentOrder = items.map((_, i) => i);
    }

    render() {
      return `
        <div class="exercise ordering">
          <div class="exercise-question">
            <h3>${this.question}</h3>
            <p class="instruction">Drag to reorder, or use arrow buttons</p>
          </div>
          <div class="ordering-list" role="list">
            ${this.items.map((item, index) => `
              <div class="ordering-item" data-index="${index}" draggable="true" role="listitem">
                <span class="drag-handle" aria-label="Drag to reorder">⋮⋮</span>
                <span class="item-number">${index + 1}</span>
                <span class="item-text">${item}</span>
                <div class="item-controls">
                  <button class="move-btn move-up" aria-label="Move up" ${index === 0 ? 'disabled' : ''}>↑</button>
                  <button class="move-btn move-down" aria-label="Move down" ${index === this.items.length - 1 ? 'disabled' : ''}>↓</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    attachListeners(container, onAnswer) {
      const list = container.querySelector('.ordering-list');
      const items = Array.from(list.querySelectorAll('.ordering-item'));

      // Drag and drop
      items.forEach((item, index) => {
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/html', item.innerHTML);
          item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          this.updateOrder(list);
          onAnswer(true);
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          const dragging = list.querySelector('.dragging');
          const afterElement = this.getDragAfterElement(list, e.clientY);

          if (afterElement == null) {
            list.appendChild(dragging);
          } else {
            list.insertBefore(dragging, afterElement);
          }
        });

        // Button controls
        const upBtn = item.querySelector('.move-up');
        const downBtn = item.querySelector('.move-down');

        if (upBtn) {
          upBtn.addEventListener('click', () => {
            if (item.previousElementSibling) {
              list.insertBefore(item, item.previousElementSibling);
              this.updateOrder(list);
              onAnswer(true);
            }
          });
        }

        if (downBtn) {
          downBtn.addEventListener('click', () => {
            if (item.nextElementSibling) {
              list.insertBefore(item.nextElementSibling, item);
              this.updateOrder(list);
              onAnswer(true);
            }
          });
        }
      });
    }

    getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.ordering-item:not(.dragging)')];

      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateOrder(list) {
      const items = Array.from(list.querySelectorAll('.ordering-item'));
      this.currentOrder = items.map(item => parseInt(item.dataset.index));

      // Update numbering
      items.forEach((item, index) => {
        item.querySelector('.item-number').textContent = index + 1;
        const upBtn = item.querySelector('.move-up');
        const downBtn = item.querySelector('.move-down');

        if (upBtn) upBtn.disabled = index === 0;
        if (downBtn) downBtn.disabled = index === items.length - 1;
      });
    }

    checkAnswer() {
      return JSON.stringify(this.currentOrder) === JSON.stringify(this.correctOrder);
    }

    showFeedback(container, isCorrect) {
      if (isCorrect) {
        return {
          type: 'success',
          message: '✓ Perfect order!',
          explanation: ''
        };
      } else {
        return {
          type: 'error',
          message: '✗ Not quite the right order.',
          explanation: 'Try again! Think about the logical sequence.'
        };
      }
    }
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ExerciseTypes = ExerciseTypes;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExerciseTypes;
}
