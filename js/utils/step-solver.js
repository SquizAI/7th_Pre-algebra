// Interactive Step-by-Step Solver
// Students work through each step with fill-in-the-blank guidance

class StepSolver {
    constructor() {
        this.currentEquation = null;
        this.currentStepIndex = 0;
        this.steps = [];
        this.isOpen = false;
        this.completionCallback = null;
    }

    // Open the step solver for an equation
    open(equation) {
        this.currentEquation = equation;
        this.currentStepIndex = 0;
        this.isOpen = true;
        this.completionCallback = null;
        this.buildSteps(equation);
        this.render();
    }

    // Open with callback for when student completes all steps
    openWithCallback(equation, callback) {
        this.currentEquation = equation;
        this.currentStepIndex = 0;
        this.isOpen = true;
        this.completionCallback = callback;
        this.buildSteps(equation);
        this.render();
    }

    close() {
        this.isOpen = false;
        const container = document.getElementById('stepSolverContainer');
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    }

    // Build interactive steps based on equation type
    buildSteps(equation) {
        this.steps = [];
        const eq = equation.equation;
        const answer = equation.answer;

        // Parse equation to determine steps needed
        if (equation.concept === 'two-step equation') {
            this.steps = this.buildTwoStepSteps(eq, answer);
        } else if (equation.concept === 'combining like terms') {
            this.steps = this.buildCombiningTermsSteps(eq, answer);
        } else if (equation.concept === 'distributive property') {
            this.steps = this.buildDistributiveSteps(eq, answer);
        } else if (equation.concept.includes('both sides')) {
            this.steps = this.buildBothSidesSteps(eq, answer);
        } else {
            // Generic steps
            this.steps = this.buildGenericSteps(eq, answer);
        }
    }

    // Build steps for two-step equations (ax + b = c)
    buildTwoStepSteps(equation, answer) {
        const steps = [];

        // Parse: ax + b = c
        const parts = equation.split('=');
        const leftSide = parts[0].trim();
        const rightSide = parts[1].trim();

        // Extract coefficient, constant on left, and value on right
        const match = leftSide.match(/(-?\d+)x\s*([+-]\s*\d+)/);
        if (match) {
            const a = parseInt(match[1]);
            const b = parseInt(match[2].replace(/\s/g, ''));
            const c = parseInt(rightSide);

            // Step 1: Identify what to do first
            steps.push({
                type: 'question',
                prompt: `Starting equation: ${equation}`,
                question: `What operation should we do FIRST to isolate the x term?`,
                questionType: 'choice',
                choices: [
                    { text: `Divide both sides by ${a}`, correct: false },
                    { text: b > 0 ? `Subtract ${b} from both sides` : `Add ${Math.abs(b)} to both sides`, correct: true },
                    { text: 'Multiply both sides', correct: false }
                ],
                explanation: 'Work backwards! Undo addition/subtraction BEFORE division/multiplication.'
            });

            // Step 2: Perform the operation
            const step2Result = c - b;
            steps.push({
                type: 'fill-blank',
                prompt: b > 0 ?
                    `Subtract ${b} from both sides` :
                    `Add ${Math.abs(b)} to both sides`,
                previousEquation: equation,  // Show where we came from
                equation: `${a}x = ___`,
                correctAnswer: step2Result.toString(),
                hint: b > 0 ?
                    `${c} - ${b} = ?` :
                    `${c} + ${Math.abs(b)} = ?`,
                explanation: `${a}x = ${step2Result}`,
                showTransformation: true
            });

            // Step 3: What to do next
            steps.push({
                type: 'question',
                prompt: `Now we have: ${a}x = ${step2Result}`,
                question: `What should we do to solve for x?`,
                questionType: 'choice',
                choices: [
                    { text: `Divide both sides by ${a}`, correct: true },
                    { text: `Multiply both sides by ${a}`, correct: false },
                    { text: `Subtract ${a}`, correct: false }
                ],
                explanation: `To get x by itself, divide both sides by ${a}`
            });

            // Step 4: Final calculation
            steps.push({
                type: 'fill-blank',
                prompt: `Divide both sides by ${a}`,
                previousEquation: `${a}x = ${step2Result}`,
                equation: `x = ___`,
                correctAnswer: answer.toString(),
                hint: `${step2Result} ÷ ${a} = ?`,
                explanation: `x = ${answer}`,
                showTransformation: true
            });
        }

        return steps;
    }

    // Build steps for combining like terms
    buildCombiningTermsSteps(equation, answer) {
        const steps = [];

        // Step 1: Ask what to combine
        steps.push({
            type: 'question',
            prompt: `Equation: ${equation}`,
            question: `What should we do FIRST?`,
            questionType: 'choice',
            choices: [
                { text: 'Combine the x terms', correct: true },
                { text: 'Subtract the constant', correct: false },
                { text: 'Divide everything', correct: false }
            ],
            explanation: 'Combine like terms (terms with the same variable) first!'
        });

        // Additional steps would be added based on the specific equation
        steps.push({
            type: 'instruction',
            prompt: 'Continue using the regular solver to complete this problem.',
            message: 'You understand the first step! Now apply what you learned.'
        });

        return steps;
    }

    // Build generic steps
    buildGenericSteps(equation, answer) {
        return [{
            type: 'instruction',
            prompt: `Equation: ${equation}`,
            message: 'Think through each operation needed to isolate x. What\'s your first step?'
        }];
    }

    buildDistributiveSteps(equation, answer) {
        // TODO: Add distributive property steps
        return this.buildGenericSteps(equation, answer);
    }

    buildBothSidesSteps(equation, answer) {
        // TODO: Add variables on both sides steps
        return this.buildGenericSteps(equation, answer);
    }

    // Render current step
    render() {
        const container = document.getElementById('stepSolverContainer');
        if (!container) return;

        container.style.display = 'flex';

        if (this.currentStepIndex >= this.steps.length) {
            // All steps complete!
            this.renderComplete();
            return;
        }

        const step = this.steps[this.currentStepIndex];

        container.innerHTML = `
            <div class="step-solver-modal">
                <div class="step-solver-header">
                    <h3>🎯 Step-by-Step Solver</h3>
                    <button class="close-solver" id="closeSolverBtn">✖</button>
                </div>

                <div class="original-equation-display">
                    <div class="original-label">Original Problem:</div>
                    <div class="original-eq">${this.currentEquation.equation}</div>
                </div>

                <div class="step-progress">
                    Step ${this.currentStepIndex + 1} of ${this.steps.length}
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.currentStepIndex / this.steps.length) * 100}%"></div>
                    </div>
                </div>

                <div class="step-content">
                    ${this.renderStep(step)}
                </div>

                <div class="step-feedback" id="stepFeedback"></div>
            </div>
        `;

        // Attach event listeners
        document.getElementById('closeSolverBtn')?.addEventListener('click', () => this.close());
        this.attachStepListeners(step);
    }

    renderStep(step) {
        if (step.type === 'question') {
            return `
                <div class="step-question">
                    <p class="step-prompt">${step.prompt}</p>
                    <p class="step-question-text">${step.question}</p>
                    <div class="step-choices">
                        ${step.choices.map((choice, i) => `
                            <button class="choice-btn" data-correct="${choice.correct}" data-index="${i}">
                                ${choice.text}
                            </button>
                        `).join('')}
                    </div>
                    ${step.hint ? `<button class="hint-btn" id="stepHintBtn">💡 Need a hint?</button>` : ''}
                </div>
            `;
        } else if (step.type === 'fill-blank') {
            return `
                <div class="step-fill-blank">
                    ${step.showTransformation && step.previousEquation ? `
                        <div class="equation-transformation">
                            <div class="transformation-label">Before:</div>
                            <div class="previous-equation">${step.previousEquation}</div>

                            <div class="transformation-arrow">
                                <div class="arrow-icon">↓</div>
                                <div class="operation-label">${step.prompt}</div>
                            </div>

                            <div class="transformation-label">After:</div>
                        </div>
                    ` : `<p class="step-prompt">${step.prompt}</p>`}

                    <div class="equation-with-blank">
                        ${step.equation.split('___').map((part, i, arr) =>
                            i < arr.length - 1 ?
                                `<span class="equation-part">${part}</span><input type="text" class="blank-input" id="blankInput" placeholder="?" autocomplete="off">` :
                                `<span class="equation-part">${part}</span>`
                        ).join('')}
                    </div>
                    <button class="check-step-btn" id="checkStepBtn">Check Answer</button>
                    ${step.hint ? `<button class="hint-btn" id="stepHintBtn">💡 Need a hint?</button>` : ''}
                </div>
            `;
        } else if (step.type === 'instruction') {
            return `
                <div class="step-instruction">
                    <p class="step-prompt">${step.prompt}</p>
                    <p class="instruction-message">${step.message}</p>
                    <button class="continue-btn" id="continueBtn">Continue</button>
                </div>
            `;
        }
    }

    attachStepListeners(step) {
        if (step.type === 'question') {
            document.querySelectorAll('.choice-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.checkChoice(e.target, step));
            });
        } else if (step.type === 'fill-blank') {
            const input = document.getElementById('blankInput');
            const checkBtn = document.getElementById('checkStepBtn');

            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkFillBlank(input.value, step);
                }
            });

            checkBtn?.addEventListener('click', () => {
                this.checkFillBlank(input.value, step);
            });
        } else if (step.type === 'instruction') {
            document.getElementById('continueBtn')?.addEventListener('click', () => {
                this.nextStep();
            });
        }

        // Hint button
        document.getElementById('stepHintBtn')?.addEventListener('click', () => {
            this.showStepHint(step);
        });
    }

    checkChoice(button, step) {
        const isCorrect = button.dataset.correct === 'true';
        const feedback = document.getElementById('stepFeedback');

        // Track step attempt for student report
        if (window.studentReport) {
            window.studentReport.recordStepAttempt(this.currentStepIndex, isCorrect, false);
        }

        // Disable all buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            button.classList.add('selected-correct');
            feedback.innerHTML = `
                <div class="feedback-correct">
                    ✅ Correct! ${step.explanation}
                    <button class="next-step-btn" onclick="window.stepSolver.nextStep()">Next Step →</button>
                </div>
            `;
        } else {
            button.classList.add('selected-incorrect');
            feedback.innerHTML = `
                <div class="feedback-incorrect">
                    ❌ Not quite. ${step.explanation}
                    <button class="retry-btn" onclick="window.stepSolver.retryChoice()">Try Again</button>
                </div>
            `;
        }
    }

    checkFillBlank(value, step) {
        const feedback = document.getElementById('stepFeedback');
        const input = document.getElementById('blankInput');
        const userAnswer = value.trim();
        const correctAnswer = step.correctAnswer.trim();

        // Check if numeric and close enough
        const isCorrect = userAnswer === correctAnswer ||
                         (parseFloat(userAnswer) === parseFloat(correctAnswer));

        // Track step attempt for student report
        if (window.studentReport) {
            window.studentReport.recordStepAttempt(this.currentStepIndex, isCorrect, false);
        }

        if (isCorrect) {
            input.classList.add('correct');
            input.disabled = true;
            feedback.innerHTML = `
                <div class="feedback-correct">
                    ✅ Perfect! ${step.explanation}
                    <button class="next-step-btn" onclick="window.stepSolver.nextStep()">Next Step →</button>
                </div>
            `;
        } else {
            input.classList.add('incorrect');
            setTimeout(() => input.classList.remove('incorrect'), 500);
            feedback.innerHTML = `
                <div class="feedback-incorrect">
                    ❌ Not quite. Try again!
                    ${step.hint ? `<p class="mini-hint">Hint: ${step.hint}</p>` : ''}
                </div>
            `;
        }
    }

    showStepHint(step) {
        // Track hint usage for student report
        if (window.studentReport) {
            window.studentReport.recordStepAttempt(this.currentStepIndex, false, true); // usedHint = true
        }

        const feedback = document.getElementById('stepFeedback');
        feedback.innerHTML = `
            <div class="hint-box">
                💡 ${step.hint || step.explanation}
            </div>
        `;
    }

    retryChoice() {
        const feedback = document.getElementById('stepFeedback');
        feedback.innerHTML = '';
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'selected-correct', 'selected-incorrect');
        });
    }

    nextStep() {
        this.currentStepIndex++;
        this.render();
    }

    renderComplete() {
        const container = document.getElementById('stepSolverContainer');
        container.innerHTML = `
            <div class="step-solver-modal">
                <div class="step-solver-header">
                    <h3>🎉 Perfect! You Got It!</h3>
                </div>

                <div class="completion-message">
                    <div class="completion-icon">✅</div>
                    <p class="congrats">You worked through all the steps correctly!</p>
                    <p class="instruction">Great job showing your work. Moving to next problem...</p>
                </div>
            </div>
        `;

        // Call completion callback after short delay
        setTimeout(() => {
            this.close();
            if (this.completionCallback) {
                this.completionCallback();
            }
        }, 2000);
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.stepSolver = new StepSolver();
});
