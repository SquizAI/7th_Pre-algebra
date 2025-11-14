// Animated Worked Examples System
// Interactive step-by-step equation solving animations

class AnimatedExample {
    constructor(containerId) {
        this.containerId = containerId;  // Store ID instead of element
        this.currentStep = 0;
        this.steps = [];
        this.isPlaying = false;
        this.autoPlayDelay = 2000; // 2 seconds between steps
    }

    loadExample(example) {
        this.steps = example.steps;
        this.currentStep = 0;
        this.isPlaying = false;
        this.render();
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const step = this.steps[this.currentStep];
        const isFirst = this.currentStep === 0;
        const isLast = this.currentStep === this.steps.length - 1;

        container.innerHTML = `
            <div class="animated-example-container">
                <div class="example-header">
                    <div class="step-indicator">
                        Step ${this.currentStep + 1} of ${this.steps.length}
                    </div>
                    <div class="step-dots">
                        ${this.steps.map((_, i) => `
                            <span class="dot ${i === this.currentStep ? 'active' : ''} ${i < this.currentStep ? 'completed' : ''}"></span>
                        `).join('')}
                    </div>
                </div>

                <div class="equation-animation-area">
                    ${this.renderEquationVisual(step)}
                </div>

                <div class="step-explanation-box">
                    <div class="step-action">
                        <span class="action-badge">${step.action}</span>
                    </div>
                    <div class="step-equation-large">
                        ${this.formatEquation(step.equation)}
                    </div>
                    <div class="step-explanation-text">
                        💡 ${step.explanation}
                    </div>
                </div>

                <div class="animation-controls">
                    <button class="btn btn-md btn-secondary" id="prevStepBtn" ${isFirst ? 'disabled' : ''} aria-label="Previous step">
                        <span aria-hidden="true">⬅️</span> Previous
                    </button>
                    <button class="btn btn-md btn-primary" id="playPauseBtn" aria-label="${this.isPlaying ? 'Pause animation' : 'Play animation'}">
                        <span aria-hidden="true">${this.isPlaying ? '⏸️' : '▶️'}</span> ${this.isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button class="btn btn-md btn-secondary" id="nextStepBtn" ${isLast ? 'disabled' : ''} aria-label="Next step">
                        Next <span aria-hidden="true">➡️</span>
                    </button>
                </div>

                ${this.currentStep > 0 ? this.renderComparisonView() : ''}
            </div>
        `;

        this.attachEventListeners();
        this.animateStepTransition();
    }

    formatEquation(equation) {
        // Return equation as-is without HTML formatting
        // CSS will handle styling via parent classes
        return equation;
    }

    renderEquationVisual(step) {
        // Create visual representation of equation with balance
        const parts = step.equation.split('=');
        if (parts.length !== 2) return '';

        const leftSide = parts[0].trim();
        const rightSide = parts[1].trim();

        return `
            <div class="visual-equation">
                <div class="equation-side left-side">
                    ${this.renderExpressionBlocks(leftSide)}
                </div>
                <div class="balance-fulcrum">
                    <div class="fulcrum-symbol">⚖️</div>
                    <div class="equals-indicator">=</div>
                </div>
                <div class="equation-side right-side">
                    ${this.renderExpressionBlocks(rightSide)}
                </div>
            </div>
        `;
    }

    renderExpressionBlocks(expression) {
        // Parse expression into visual blocks
        const blocks = [];

        // Match x terms
        const xMatches = expression.match(/([+-]?\s*\d*)x/g) || [];
        xMatches.forEach(match => {
            const coef = match.replace('x', '').trim() || '1';
            const coefficient = coef === '+' || coef === '' ? 1 : coef === '-' ? -1 : parseInt(coef);

            if (coefficient !== 0) {
                blocks.push({
                    type: 'variable',
                    value: coefficient,
                    display: `${coefficient}x`
                });
            }
        });

        // Match constant terms (but not coefficients of x)
        const constantMatches = expression.match(/([+-]\s*\d+)(?!.*x)/g) || [];
        constantMatches.forEach(match => {
            const value = parseInt(match.replace(/\s/g, ''));
            if (value !== 0) {
                blocks.push({
                    type: 'constant',
                    value: value,
                    display: value > 0 ? `+${value}` : value
                });
            }
        });

        // Check if expression starts with a constant (no sign)
        const startsWithConstant = expression.match(/^\d+(?!.*x)/);
        if (startsWithConstant) {
            const value = parseInt(startsWithConstant[0]);
            blocks.unshift({
                type: 'constant',
                value: value,
                display: value
            });
        }

        return blocks.map((block, index) => `
            <div class="expression-block ${block.type} ${block.value < 0 ? 'negative' : 'positive'}"
                 style="animation-delay: ${index * 0.1}s">
                <div class="block-visual">
                    ${block.type === 'variable' ?
                        `<div class="var-cube">${Math.abs(block.value)}x</div>` :
                        `<div class="const-sphere">${Math.abs(block.value)}</div>`
                    }
                </div>
                <div class="block-label">${block.display}</div>
            </div>
        `).join('');
    }

    renderComparisonView() {
        const prevStep = this.steps[this.currentStep - 1];
        const currStep = this.steps[this.currentStep];

        return `
            <div class="comparison-view">
                <div class="comparison-header">📊 What Changed?</div>
                <div class="comparison-equations">
                    <div class="comparison-item before">
                        <div class="comparison-label">Before:</div>
                        <div class="comparison-equation">${this.formatEquation(prevStep.equation)}</div>
                    </div>
                    <div class="comparison-arrow">
                        <span class="arrow-symbol">➜</span>
                        <span class="action-applied">${currStep.action}</span>
                    </div>
                    <div class="comparison-item after">
                        <div class="comparison-label">After:</div>
                        <div class="comparison-equation">${this.formatEquation(currStep.equation)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        document.getElementById('prevStepBtn')?.addEventListener('click', () => {
            this.previousStep();
        });

        document.getElementById('nextStepBtn')?.addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('playPauseBtn')?.addEventListener('click', () => {
            this.togglePlayPause();
        });
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.render();
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.render();
        } else if (this.isPlaying) {
            this.isPlaying = false;
        }
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            this.autoPlay();
        }

        this.render();
    }

    autoPlay() {
        if (!this.isPlaying) return;

        if (this.currentStep < this.steps.length - 1) {
            setTimeout(() => {
                this.nextStep();
                if (this.isPlaying) {
                    this.autoPlay();
                }
            }, this.autoPlayDelay);
        } else {
            this.isPlaying = false;
            this.render();
        }
    }

    animateStepTransition() {
        // Add entrance animations
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const animArea = container.querySelector('.equation-animation-area');
        const explanationBox = container.querySelector('.step-explanation-box');

        if (animArea) {
            animArea.style.opacity = '0';
            animArea.style.transform = 'translateY(20px)';

            setTimeout(() => {
                animArea.style.transition = 'all 0.5s ease';
                animArea.style.opacity = '1';
                animArea.style.transform = 'translateY(0)';
            }, 50);
        }

        if (explanationBox) {
            explanationBox.style.opacity = '0';
            explanationBox.style.transform = 'translateY(20px)';

            setTimeout(() => {
                explanationBox.style.transition = 'all 0.5s ease 0.2s';
                explanationBox.style.opacity = '1';
                explanationBox.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    reset() {
        this.currentStep = 0;
        this.isPlaying = false;
        this.render();
    }
}

// Enhanced Examples Grid with Animation Support
class AnimatedExamplesGrid {
    constructor(gridContainerId) {
        this.gridContainer = document.getElementById(gridContainerId);
        this.animatedExample = new AnimatedExample('animatedExampleContainer');
        this.currentExampleIndex = 0;
        this.examples = [];
    }

    loadExamples(examples) {
        this.examples = examples;
        this.currentExampleIndex = 0;
        this.renderGrid();
    }

    renderGrid() {
        if (!this.gridContainer) return;

        this.gridContainer.innerHTML = `
            <div class="examples-navigation card" style="margin-bottom: var(--space-6);">
                <div class="card__header">
                    <h3 class="card__title"><span aria-hidden="true">📚</span> Select an Example</h3>
                    <p class="card__subtitle">Watch how to solve these step-by-step</p>
                </div>

                <div class="example-selector card__body" role="tablist" aria-label="Example problem selector">
                    ${this.examples.map((example, index) => `
                        <button class="btn btn-md ${index === this.currentExampleIndex ? 'btn-primary' : 'btn-secondary'} example-tab"
                                data-index="${index}"
                                role="tab"
                                aria-selected="${index === this.currentExampleIndex}"
                                aria-controls="animatedExampleContainer"
                                aria-label="Example ${index + 1}: ${example.problem}">
                            <div class="example-tab-content">
                                <span class="example-number">Example ${index + 1}</span>
                                <div class="example-problem-preview">${example.problem}</div>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div id="animatedExampleContainer" class="animated-example-wrapper card" role="tabpanel" aria-live="polite"></div>

            <div class="interaction-prompt card" style="margin-top: var(--space-6); text-align: center;">
                <div class="card__body">
                    <div class="prompt-icon" aria-hidden="true">👆</div>
                    <div class="prompt-text">Click the arrows or press Play to see the solution steps!</div>
                </div>
            </div>
        `;

        // Attach tab click listeners
        this.gridContainer.querySelectorAll('.example-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.loadExample(index);
            });
        });

        // Load first example
        if (this.examples.length > 0) {
            this.loadExample(0);
        }
    }

    loadExample(index) {
        this.currentExampleIndex = index;

        // Update active tab with atomic button classes
        this.gridContainer.querySelectorAll('.example-tab').forEach((tab, i) => {
            if (i === index) {
                tab.classList.remove('btn-secondary');
                tab.classList.add('btn-primary');
                tab.setAttribute('aria-selected', 'true');
            } else {
                tab.classList.remove('btn-primary');
                tab.classList.add('btn-secondary');
                tab.setAttribute('aria-selected', 'false');
            }
        });

        // Load into animated example
        this.animatedExample.loadExample(this.examples[index]);
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.animatedExamplesGrid = new AnimatedExamplesGrid('examplesGrid');
});
