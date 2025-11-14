// Learning Workflow System
// Manages the pedagogical flow: Video → Examples → Practice → Mastery

class LearningWorkflow {
    constructor() {
        this.currentConcept = null;
        this.videoWatched = false;
        this.examplesViewed = false;
        this.understandingChecked = false;

        // Concept definitions with videos and examples
        this.concepts = {
            'two-step-basic': {
                name: 'Two-Step Equations',
                icon: '🎯',
                description: 'Learn to solve equations that require two steps: isolate the variable term, then isolate the variable.',
                videoId: '0ackz7dJSYY', // Math with Mr. J - INTRO level (beginner friendly)
                keyPoints: [
                    'Work backwards - undo operations in reverse order',
                    'Always do the same operation to both sides of the equation',
                    'Simplify one step at a time',
                    'Check your answer by substituting back'
                ],
                examples: [
                    {
                        problem: '3x + 5 = 20',
                        steps: [
                            { action: 'Start', equation: '3x + 5 = 20', explanation: 'We need to isolate x' },
                            { action: 'Subtract 5', equation: '3x = 15', explanation: 'Subtract 5 from both sides to isolate the term with x' },
                            { action: 'Divide by 3', equation: 'x = 5', explanation: 'Divide both sides by 3 to solve for x' },
                            { action: 'Check', equation: '3(5) + 5 = 20 ✓', explanation: '15 + 5 = 20, so x = 5 is correct!' }
                        ]
                    },
                    {
                        problem: '2x - 7 = 11',
                        steps: [
                            { action: 'Start', equation: '2x - 7 = 11', explanation: 'Solve for x' },
                            { action: 'Add 7', equation: '2x = 18', explanation: 'Add 7 to both sides' },
                            { action: 'Divide by 2', equation: 'x = 9', explanation: 'Divide both sides by 2' },
                            { action: 'Check', equation: '2(9) - 7 = 11 ✓', explanation: '18 - 7 = 11, correct!' }
                        ]
                    }
                ],
                checkQuestion: {
                    question: 'What should you do FIRST when solving: 4x + 8 = 32?',
                    options: [
                        { text: 'Divide both sides by 4', correct: false },
                        { text: 'Subtract 8 from both sides', correct: true },
                        { text: 'Add 8 to both sides', correct: false }
                    ],
                    explanation: 'Always work backwards! Subtract 8 first to isolate the term with x, then divide.'
                }
            },

            'combining-terms': {
                name: 'Combining Like Terms',
                icon: '🔗',
                description: 'Learn to combine terms with the same variable before solving.',
                videoId: 'XCWkBAUiBxM',
                keyPoints: [
                    'Like terms have the same variable and exponent',
                    'Add or subtract the coefficients',
                    'Combine like terms on each side first',
                    'Then solve like a two-step equation'
                ],
                examples: [
                    {
                        problem: '2x + 3x + 5 = 20',
                        steps: [
                            { action: 'Start', equation: '2x + 3x + 5 = 20', explanation: 'Notice we have two x terms' },
                            { action: 'Combine', equation: '5x + 5 = 20', explanation: '2x + 3x = 5x (add the coefficients)' },
                            { action: 'Subtract 5', equation: '5x = 15', explanation: 'Subtract 5 from both sides' },
                            { action: 'Divide by 5', equation: 'x = 3', explanation: 'Divide both sides by 5' }
                        ]
                    },
                    {
                        problem: '4x - x + 6 = 15',
                        steps: [
                            { action: 'Start', equation: '4x - x + 6 = 15', explanation: 'Combine the x terms' },
                            { action: 'Combine', equation: '3x + 6 = 15', explanation: '4x - x = 3x' },
                            { action: 'Subtract 6', equation: '3x = 9', explanation: 'Subtract 6 from both sides' },
                            { action: 'Divide by 3', equation: 'x = 3', explanation: 'Divide by 3' }
                        ]
                    }
                ]
                ,
                checkQuestion: {
                    question: 'What is 5x + 2x?',
                    options: [
                        { text: '7x²', correct: false },
                        { text: '7x', correct: true },
                        { text: '10x', correct: false }
                    ],
                    explanation: 'When combining like terms, add the coefficients: 5 + 2 = 7, so 5x + 2x = 7x'
                }
            },

            'distributive-intro': {
                name: 'Distributive Property',
                icon: '📦',
                description: 'Learn to distribute a number across terms in parentheses.',
                videoId: 'D_j-VAKJ1cU',
                keyPoints: [
                    'Multiply the outside number by EACH term inside',
                    'a(b + c) = ab + ac',
                    'Watch the signs! Negative times negative is positive',
                    'Distribute first, then solve'
                ],
                examples: [
                    {
                        problem: '2(x + 3) = 14',
                        steps: [
                            { action: 'Start', equation: '2(x + 3) = 14', explanation: 'Need to distribute the 2' },
                            { action: 'Distribute', equation: '2x + 6 = 14', explanation: '2 × x = 2x, and 2 × 3 = 6' },
                            { action: 'Subtract 6', equation: '2x = 8', explanation: 'Subtract 6 from both sides' },
                            { action: 'Divide by 2', equation: 'x = 4', explanation: 'Divide both sides by 2' }
                        ]
                    },
                    {
                        problem: '3(x - 2) + 5 = 14',
                        steps: [
                            { action: 'Start', equation: '3(x - 2) + 5 = 14', explanation: 'Distribute the 3' },
                            { action: 'Distribute', equation: '3x - 6 + 5 = 14', explanation: '3 × x = 3x, 3 × (-2) = -6' },
                            { action: 'Combine', equation: '3x - 1 = 14', explanation: '-6 + 5 = -1' },
                            { action: 'Add 1', equation: '3x = 15', explanation: 'Add 1 to both sides' },
                            { action: 'Divide by 3', equation: 'x = 5', explanation: 'Divide by 3' }
                        ]
                    }
                ],
                checkQuestion: {
                    question: 'What is 4(x + 2)?',
                    options: [
                        { text: '4x + 2', correct: false },
                        { text: '4x + 8', correct: true },
                        { text: '4x + 4', correct: false }
                    ],
                    explanation: 'Distribute: 4 × x = 4x, and 4 × 2 = 8. So 4(x + 2) = 4x + 8'
                }
            },

            'both-sides-intro': {
                name: 'Variables on Both Sides',
                icon: '⚖️',
                description: 'Learn to solve equations with variables on both sides of the equals sign.',
                videoId: 'eZsyV0ISzV8',
                keyPoints: [
                    'Move all variable terms to one side',
                    'Move all number terms to the other side',
                    'Choose to move the smaller variable term',
                    'Then solve as usual'
                ],
                examples: [
                    {
                        problem: '5x + 3 = 2x + 12',
                        steps: [
                            { action: 'Start', equation: '5x + 3 = 2x + 12', explanation: 'Variables on both sides!' },
                            { action: 'Subtract 2x', equation: '3x + 3 = 12', explanation: 'Move 2x to the left: 5x - 2x = 3x' },
                            { action: 'Subtract 3', equation: '3x = 9', explanation: 'Subtract 3 from both sides' },
                            { action: 'Divide by 3', equation: 'x = 3', explanation: 'Divide both sides by 3' }
                        ]
                    },
                    {
                        problem: '7x - 4 = 3x + 8',
                        steps: [
                            { action: 'Start', equation: '7x - 4 = 3x + 8', explanation: 'Get x terms on one side' },
                            { action: 'Subtract 3x', equation: '4x - 4 = 8', explanation: '7x - 3x = 4x' },
                            { action: 'Add 4', equation: '4x = 12', explanation: 'Add 4 to both sides' },
                            { action: 'Divide by 4', equation: 'x = 3', explanation: 'Divide by 4' }
                        ]
                    }
                ],
                checkQuestion: {
                    question: 'When solving 6x + 5 = 2x + 13, what should you do first?',
                    options: [
                        { text: 'Subtract 5 from both sides', correct: false },
                        { text: 'Subtract 2x from both sides', correct: true },
                        { text: 'Divide by 6', correct: false }
                    ],
                    explanation: 'First move all x terms to one side. Subtract 2x from both sides to get 4x + 5 = 13'
                }
            },

            'solution-types': {
                name: 'Special Solution Types',
                icon: '🎭',
                description: 'Learn to identify equations with one solution, no solution, or infinitely many solutions.',
                videoId: 'nYo6ftCSgAs', // EnVision Grade 7 Accelerated Pre-Algebra 7-4
                keyPoints: [
                    'One Solution: Variables cancel to give a true statement with a specific answer',
                    'No Solution: Variables cancel but you get a FALSE statement (like 5 = 3)',
                    'Infinitely Many Solutions: Variables cancel and you get a TRUE statement (like 5 = 5)',
                    'The key is what happens after you simplify - does it make sense?'
                ],
                examples: [
                    {
                        problem: '2x + 3 = 2x + 5',
                        steps: [
                            { action: 'Start', equation: '2x + 3 = 2x + 5', explanation: 'Solve for x' },
                            { action: 'Subtract 2x', equation: '3 = 5', explanation: 'Subtract 2x from both sides' },
                            { action: 'Result', equation: '3 = 5 (FALSE)', explanation: 'This is impossible! No value of x makes this true' },
                            { action: 'Answer', equation: 'NO SOLUTION', explanation: 'The equation has no solution' }
                        ]
                    },
                    {
                        problem: '3x + 6 = 3(x + 2)',
                        steps: [
                            { action: 'Start', equation: '3x + 6 = 3(x + 2)', explanation: 'Solve for x' },
                            { action: 'Distribute', equation: '3x + 6 = 3x + 6', explanation: 'Apply distributive property' },
                            { action: 'Subtract 3x', equation: '6 = 6', explanation: 'Subtract 3x from both sides' },
                            { action: 'Result', equation: '6 = 6 (TRUE)', explanation: 'This is always true, regardless of x!' },
                            { action: 'Answer', equation: 'INFINITELY MANY SOLUTIONS', explanation: 'Any value of x works!' }
                        ]
                    },
                    {
                        problem: '4x + 5 = 2x + 13',
                        steps: [
                            { action: 'Start', equation: '4x + 5 = 2x + 13', explanation: 'Solve for x' },
                            { action: 'Subtract 2x', equation: '2x + 5 = 13', explanation: 'Get variables on one side' },
                            { action: 'Subtract 5', equation: '2x = 8', explanation: 'Isolate the variable term' },
                            { action: 'Divide by 2', equation: 'x = 4', explanation: 'Solve for x' },
                            { action: 'Result', equation: 'ONE SOLUTION: x = 4', explanation: 'This has exactly one solution' }
                        ]
                    }
                ],
                checkQuestion: {
                    question: 'When you solve an equation and get "7 = 7", what does this mean?',
                    options: [
                        { text: 'The solution is x = 7', correct: false },
                        { text: 'There is no solution', correct: false },
                        { text: 'There are infinitely many solutions', correct: true }
                    ],
                    explanation: 'When both sides are identical after solving, the equation is true for ALL values of x. This means infinitely many solutions!'
                }
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Concept intro buttons
        document.getElementById('watchVideoBtn')?.addEventListener('click', () => {
            this.startVideoLesson();
        });

        // REMOVED: No more skipping videos! Students MUST watch.

        // Video lesson buttons
        document.getElementById('videoWatchedCheck')?.addEventListener('change', (e) => {
            document.getElementById('continueToExamplesBtn').disabled = !e.target.checked;
            this.videoWatched = e.target.checked;

            // Track video watched for student report
            if (e.target.checked && window.studentReport) {
                window.studentReport.recordVideoWatched();
            }
        });

        document.getElementById('continueToExamplesBtn')?.addEventListener('click', () => {
            this.showExamples();
        });

        // Examples buttons
        document.getElementById('startPracticeBtn')?.addEventListener('click', () => {
            if (this.understandingChecked) {
                this.startPractice();
            } else {
                alert('Please answer the understanding check question first!');
            }
        });

        document.getElementById('rewatchVideoBtn')?.addEventListener('click', () => {
            this.startVideoLesson();
        });

        // Understanding check
        document.querySelectorAll('.check-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.checkUnderstanding(e.target);
            });
        });
    }

    // Start learning sequence for a concept
    startLearningSequence(conceptKey, levelId) {
        console.log('=== STARTING LEARNING SEQUENCE ===');
        console.log('Concept Key:', conceptKey);
        console.log('Level ID:', levelId);

        this.currentConcept = conceptKey;
        this.currentLevelId = levelId;
        this.videoWatched = false;
        this.examplesViewed = false;
        this.understandingChecked = false;

        const concept = this.concepts[conceptKey];
        if (!concept) {
            console.error('❌ Concept not found:', conceptKey);
            return;
        }

        console.log('✅ Concept found:', concept.name);
        console.log('Showing concept intro screen...');

        // Show concept intro
        this.showConceptIntro(concept);
    }

    showConceptIntro(concept) {
        console.log('📺 Showing concept intro for:', concept.name);

        document.getElementById('conceptIcon').textContent = concept.icon;
        document.getElementById('conceptTitle').textContent = `New Concept: ${concept.name}`;
        document.getElementById('conceptDescription').textContent = concept.description;

        console.log('Navigating to conceptIntro screen...');
        window.gameController.showScreen('conceptIntro');
    }

    startVideoLesson() {
        const concept = this.concepts[this.currentConcept];

        document.getElementById('videoLessonTitle').textContent = `Video Lesson: ${concept.name}`;
        document.getElementById('videoLessonDesc').textContent = concept.description;

        // Load video
        const videoFrame = document.getElementById('mainVideoFrame');
        videoFrame.src = `https://www.youtube.com/embed/${concept.videoId}?rel=0`;

        // Load key points
        const keyPointsList = document.getElementById('keyPointsList');
        keyPointsList.innerHTML = '';
        concept.keyPoints.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            keyPointsList.appendChild(li);
        });

        // Reset checkbox
        document.getElementById('videoWatchedCheck').checked = false;
        document.getElementById('continueToExamplesBtn').disabled = true;

        window.gameController.showScreen('videoLesson');
    }

    showExamples() {
        const concept = this.concepts[this.currentConcept];
        this.examplesViewed = true;

        // Track examples viewed for student report
        if (window.studentReport) {
            window.studentReport.recordExamplesViewed();
        }

        // CRITICAL FIX: Mark concept as learned here so returning users can skip workflow
        // Students who view examples have seen enough to skip intro/video next time
        this.markConceptLearned(this.currentConcept);
        console.log(`✅ Concept marked as learned: ${this.currentConcept}`);

        // Use animated examples system
        if (window.animatedExamplesGrid) {
            window.animatedExamplesGrid.loadExamples(concept.examples);
        }

        // Load understanding check
        const check = concept.checkQuestion;
        document.getElementById('checkQuestion').textContent = check.question;

        const optionsContainer = document.querySelector('.check-options');
        optionsContainer.innerHTML = '';
        check.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'check-option';
            btn.textContent = option.text;
            btn.dataset.correct = option.correct;
            btn.addEventListener('click', (e) => this.checkUnderstanding(e.target));
            optionsContainer.appendChild(btn);
        });

        document.getElementById('checkFeedback').innerHTML = '';
        this.understandingChecked = false;

        window.gameController.showScreen('examples');
    }

    checkUnderstanding(button) {
        const concept = this.concepts[this.currentConcept];
        const isCorrect = button.dataset.correct === 'true';
        const feedbackDiv = document.getElementById('checkFeedback');

        // Disable all buttons
        document.querySelectorAll('.check-option').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === 'true') {
                btn.style.background = '#d4edda';
                btn.style.borderColor = '#28a745';
            }
        });

        if (isCorrect) {
            feedbackDiv.innerHTML = `
                <div class="feedback-correct">
                    ✅ Correct! ${concept.checkQuestion.explanation}
                </div>
            `;
            this.understandingChecked = true;
        } else {
            feedbackDiv.innerHTML = `
                <div class="feedback-incorrect">
                    ❌ Not quite. ${concept.checkQuestion.explanation}
                </div>
            `;

            // Allow retry after 2 seconds
            setTimeout(() => {
                document.querySelectorAll('.check-option').forEach(btn => {
                    btn.disabled = false;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                });
                feedbackDiv.innerHTML = '';
            }, 3000);
        }
    }

    startPractice() {
        // Mark concept as learned
        this.markConceptLearned(this.currentConcept);

        // Now start the actual game level
        // (startLevelDirectly will handle showing game screen)
        window.gameController.startLevelDirectly(
            window.gameController.equationGen.getLevelInfo(this.currentLevelId)
        );
    }

    markConceptLearned(conceptKey) {
        const learnedConcepts = JSON.parse(localStorage.getItem('learnedConcepts') || '[]');
        if (!learnedConcepts.includes(conceptKey)) {
            learnedConcepts.push(conceptKey);
            localStorage.setItem('learnedConcepts', JSON.stringify(learnedConcepts));
        }
    }

    // Get concept for a level type
    getConceptForLevel(levelType) {
        if (levelType.includes('two-step')) return 'two-step-basic';
        if (levelType.includes('combining')) return 'combining-terms';
        if (levelType.includes('distributive')) return 'distributive-intro';
        if (levelType.includes('both-sides')) return 'both-sides-intro';
        if (levelType.includes('solution') || levelType.includes('infinite') || levelType.includes('no-solution')) return 'solution-types';
        return null;
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.learningWorkflow = new LearningWorkflow();
});
