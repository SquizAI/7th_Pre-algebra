// Equation Generator and Manager
// Implements learning friction - one concept at a time with mastery requirements

class EquationGenerator {
    constructor() {
        // Learning progression - one concept at a time
        this.levels = [
            // PHASE 1: Two-Step Equations (Levels 1-3)
            {
                id: 1,
                name: "Welcome to Algebra Castle",
                description: "Solve simple two-step equations: ax + b = c",
                world: 1,
                type: "two-step-basic",
                masteryRequired: 4, // Must get 4/5 correct
                totalQuestions: 5,
                hints: true,
                concepts: ["addition/subtraction", "multiplication/division"]
            },
            {
                id: 2,
                name: "Two-Step Mastery",
                description: "More two-step equations practice",
                world: 1,
                type: "two-step-basic",
                masteryRequired: 4,
                totalQuestions: 5,
                hints: true,
                concepts: ["two-step equations"]
            },
            {
                id: 3,
                name: "Two-Step Review Checkpoint",
                description: "Review: Can you solve two-step equations?",
                world: 1,
                type: "two-step-mixed",
                masteryRequired: 5, // Higher requirement for checkpoint
                totalQuestions: 6,
                hints: false,
                concepts: ["two-step review"]
            },

            // PHASE 2: Combining Like Terms (Levels 4-6)
            {
                id: 4,
                name: "Into the Forest of Terms",
                description: "Learn to combine like terms: 2x + 3x + 5 = 20",
                world: 2,
                type: "combining-terms",
                masteryRequired: 4,
                totalQuestions: 5,
                hints: true,
                concepts: ["combining like terms"]
            },
            {
                id: 5,
                name: "Like Terms Practice",
                description: "More practice combining like terms",
                world: 2,
                type: "combining-terms",
                masteryRequired: 4,
                totalQuestions: 5,
                hints: true,
                concepts: ["combining like terms"]
            },
            {
                id: 6,
                name: "Combining Terms Review",
                description: "Review: Two-step AND combining like terms",
                world: 2,
                type: "review-checkpoint-1",
                masteryRequired: 5,
                totalQuestions: 6,
                hints: false,
                concepts: ["two-step", "combining terms"]
            },

            // PHASE 3: Distributive Property (Levels 7-9)
            {
                id: 7,
                name: "Distribution Introduction",
                description: "Learn distributive property: 2(x + 3) = 14",
                world: 2,
                type: "distributive-intro",
                masteryRequired: 4,
                totalQuestions: 5,
                hints: true,
                concepts: ["distributive property"]
            },
            {
                id: 8,
                name: "Distributive Practice",
                description: "More distributive property practice",
                world: 2,
                type: "distributive-practice",
                masteryRequired: 4,
                totalQuestions: 5,
                hints: true,
                concepts: ["distributive property"]
            },
            {
                id: 9,
                name: "Distribution Review",
                description: "Review: All concepts so far",
                world: 2,
                type: "review-checkpoint-2",
                masteryRequired: 5,
                totalQuestions: 6,
                hints: false,
                concepts: ["two-step", "combining", "distributive"]
            },

            // PHASE 4: Variables on Both Sides (Levels 10-13)
            {
                id: 10,
                name: "Mountain of Both Sides - Base",
                description: "Introduction: Variables on both sides",
                world: 3,
                type: "both-sides-intro",
                masteryRequired: 4,
                totalQuestions: 5,
                hints: true,
                concepts: ["variables on both sides"]
            },
            {
                id: 11,
                name: "Both Sides Practice",
                description: "Practice variables on both sides",
                world: 3,
                type: "both-sides-practice",
                masteryRequired: 4,
                totalQuestions: 5,
                hints: true,
                concepts: ["variables on both sides"]
            },
            {
                id: 12,
                name: "Both Sides with Distribution",
                description: "Combine: Both sides AND distributive property",
                world: 3,
                type: "both-sides-distributive",
                masteryRequired: 4,
                totalQuestions: 5,
                hints: true,
                concepts: ["both sides", "distributive"]
            },
            {
                id: 13,
                name: "Mountain Peak Review",
                description: "Review: All mountain concepts",
                world: 3,
                type: "review-checkpoint-3",
                masteryRequired: 5,
                totalQuestions: 6,
                hints: false,
                concepts: ["all concepts"]
            },

            // PHASE 5: Special Solutions (Levels 14-16)
            {
                id: 14,
                name: "Ocean of Infinity",
                description: "Learn about infinitely many solutions",
                world: 4,
                type: "infinite-solutions",
                masteryRequired: 3,
                totalQuestions: 4,
                hints: true,
                concepts: ["infinite solutions"]
            },
            {
                id: 15,
                name: "Island of No Solution",
                description: "Learn about equations with no solution",
                world: 4,
                type: "no-solution",
                masteryRequired: 3,
                totalQuestions: 4,
                hints: true,
                concepts: ["no solution"]
            },
            {
                id: 16,
                name: "Solutions Review",
                description: "Review: One, none, or infinite solutions?",
                world: 4,
                type: "solutions-mixed",
                masteryRequired: 5,
                totalQuestions: 6,
                hints: false,
                concepts: ["solution types"]
            },

            // PHASE 6: Boss Levels (17-20)
            {
                id: 17,
                name: "Dragon's Lair - Entrance",
                description: "Complex multi-step equations",
                world: 5,
                type: "complex-mixed",
                masteryRequired: 5,
                totalQuestions: 5,
                hints: true,
                concepts: ["all concepts"]
            },
            {
                id: 18,
                name: "Dragon's Challenge",
                description: "Master level equations",
                world: 5,
                type: "complex-advanced",
                masteryRequired: 5,
                totalQuestions: 5,
                hints: false,
                concepts: ["all concepts"]
            },
            {
                id: 19,
                name: "Final Boss Battle",
                description: "Ultimate equation challenge!",
                world: 5,
                type: "final-boss",
                masteryRequired: 6,
                totalQuestions: 7,
                hints: false,
                concepts: ["mastery"]
            },
            {
                id: 20,
                name: "Victory Lap",
                description: "You've mastered equations! Celebrate!",
                world: 5,
                type: "celebration",
                masteryRequired: 4,
                totalQuestions: 5,
                hints: true,
                concepts: ["review"]
            }
        ];
    }

    // Generate equation based on type
    generateEquation(type) {
        switch(type) {
            case 'two-step-basic':
                return this.generateTwoStepBasic();
            case 'two-step-mixed':
                return this.generateTwoStepMixed();
            case 'combining-terms':
                return this.generateCombiningTerms();
            case 'distributive-intro':
                return this.generateDistributiveIntro();
            case 'distributive-practice':
                return this.generateDistributivePractice();
            case 'both-sides-intro':
                return this.generateBothSidesIntro();
            case 'both-sides-practice':
                return this.generateBothSidesPractice();
            case 'both-sides-distributive':
                return this.generateBothSidesDistributive();
            case 'infinite-solutions':
                return this.generateInfiniteSolutions();
            case 'no-solution':
                return this.generateNoSolution();
            case 'solutions-mixed':
                return this.generateSolutionsMixed();
            case 'complex-mixed':
            case 'complex-advanced':
            case 'final-boss':
                return this.generateComplexEquation();
            default:
                return this.generateTwoStepBasic();
        }
    }

    // Two-step basic: ax + b = c
    generateTwoStepBasic() {
        const a = this.randomInt(2, 5);
        const b = this.randomInt(1, 10);
        const x = this.randomInt(1, 10);
        const c = a * x + b;

        return {
            equation: `${a}x + ${b} = ${c}`,
            answer: x,
            steps: [
                `${a}x + ${b} = ${c}`,
                `${a}x = ${c - b}  (subtract ${b} from both sides)`,
                `x = ${x}  (divide both sides by ${a})`
            ],
            hints: [
                `🤔 What's next to the x term? How can we isolate ${a}x by itself?`,
                `💡 We need to get rid of the ${b}. What operation undoes adding ${b}?`,
                `✨ Subtract ${b} from both sides to isolate the term with x.`
            ],
            concept: "two-step equation"
        };
    }

    // Two-step mixed with negatives
    generateTwoStepMixed() {
        const operations = [
            () => this.generateTwoStepBasic(),
            () => {
                // ax - b = c
                const a = this.randomInt(2, 5);
                const b = this.randomInt(1, 10);
                const x = this.randomInt(1, 10);
                const c = a * x - b;
                return {
                    equation: `${a}x - ${b} = ${c}`,
                    answer: x,
                    steps: [
                        `${a}x - ${b} = ${c}`,
                        `${a}x = ${c + b}  (add ${b} to both sides)`,
                        `x = ${x}  (divide both sides by ${a})`
                    ],
                    hints: [
                        `🤔 What operation is being done to the x term? What needs to be undone first?`,
                        `💡 Subtracting ${b} is the same as adding negative ${b}. How do we undo that?`,
                        `✨ Add ${b} to both sides to isolate the term with x.`
                    ],
                    concept: "two-step with subtraction"
                };
            }
        ];

        return operations[this.randomInt(0, operations.length - 1)]();
    }

    // Combining like terms: ax + bx + c = d
    generateCombiningTerms() {
        const a = this.randomInt(1, 4);
        const b = this.randomInt(1, 4);
        const c = this.randomInt(1, 10);
        const x = this.randomInt(1, 8);
        const d = (a + b) * x + c;

        return {
            equation: `${a}x + ${b}x + ${c} = ${d}`,
            answer: x,
            steps: [
                `${a}x + ${b}x + ${c} = ${d}`,
                `${a + b}x + ${c} = ${d}  (combine like terms)`,
                `${a + b}x = ${d - c}  (subtract ${c} from both sides)`,
                `x = ${x}  (divide both sides by ${a + b})`
            ],
            hint: `First, combine the terms with x: ${a}x + ${b}x = ${a + b}x`,
            concept: "combining like terms"
        };
    }

    // Distributive property: a(x + b) = c
    generateDistributiveIntro() {
        const a = this.randomInt(2, 5);
        const b = this.randomInt(1, 8);
        const x = this.randomInt(1, 10);
        const c = a * (x + b);

        return {
            equation: `${a}(x + ${b}) = ${c}`,
            answer: x,
            steps: [
                `${a}(x + ${b}) = ${c}`,
                `${a}x + ${a * b} = ${c}  (distribute ${a})`,
                `${a}x = ${c - a * b}  (subtract ${a * b} from both sides)`,
                `x = ${x}  (divide both sides by ${a})`
            ],
            hint: `Use the distributive property: ${a}(x + ${b}) = ${a}x + ${a * b}`,
            concept: "distributive property"
        };
    }

    // Distributive practice with more complexity
    generateDistributivePractice() {
        const a = this.randomInt(2, 6);
        const b = this.randomInt(1, 8);
        const c = this.randomInt(1, 10);
        const x = this.randomInt(1, 10);
        const result = a * (x + b) + c;

        return {
            equation: `${a}(x + ${b}) + ${c} = ${result}`,
            answer: x,
            steps: [
                `${a}(x + ${b}) + ${c} = ${result}`,
                `${a}x + ${a * b} + ${c} = ${result}  (distribute ${a})`,
                `${a}x + ${a * b + c} = ${result}  (combine constants)`,
                `${a}x = ${result - (a * b + c)}  (subtract ${a * b + c})`,
                `x = ${x}  (divide by ${a})`
            ],
            hint: `First distribute ${a}, then combine like terms.`,
            concept: "distributive with constants"
        };
    }

    // Variables on both sides intro: ax + b = cx + d
    generateBothSidesIntro() {
        const a = this.randomInt(3, 6);
        const c = this.randomInt(1, a - 1);
        const b = this.randomInt(1, 8);
        const x = this.randomInt(1, 10);
        const d = a * x + b - c * x;

        return {
            equation: `${a}x + ${b} = ${c}x + ${d}`,
            answer: x,
            steps: [
                `${a}x + ${b} = ${c}x + ${d}`,
                `${a - c}x + ${b} = ${d}  (subtract ${c}x from both sides)`,
                `${a - c}x = ${d - b}  (subtract ${b} from both sides)`,
                `x = ${x}  (divide by ${a - c})`
            ],
            hint: `Move all x terms to one side. Subtract ${c}x from both sides.`,
            concept: "variables on both sides"
        };
    }

    // Variables on both sides practice
    generateBothSidesPractice() {
        const a = this.randomInt(4, 8);
        const c = this.randomInt(1, a - 2);
        const b = this.randomInt(2, 12);
        const d = this.randomInt(1, 10);
        const x = Math.round((d - b) / (a - c));

        if (!Number.isInteger(x) || x < 1) {
            return this.generateBothSidesPractice(); // Try again
        }

        return {
            equation: `${a}x - ${b} = ${c}x + ${d}`,
            answer: x,
            steps: [
                `${a}x - ${b} = ${c}x + ${d}`,
                `${a - c}x - ${b} = ${d}  (subtract ${c}x)`,
                `${a - c}x = ${b + d}  (add ${b})`,
                `x = ${x}  (divide by ${a - c})`
            ],
            hint: `Get all x terms on the left side, constants on the right.`,
            concept: "variables both sides with negatives"
        };
    }

    // Both sides with distributive
    generateBothSidesDistributive() {
        const a = this.randomInt(2, 4);
        const b = this.randomInt(1, 5);
        const c = this.randomInt(1, 3);
        const d = this.randomInt(1, 8);
        const x = this.randomInt(1, 8);
        const right = c * x + d;

        return {
            equation: `${a}(x + ${b}) = ${c}x + ${d}`,
            answer: x,
            steps: [
                `${a}(x + ${b}) = ${c}x + ${d}`,
                `${a}x + ${a * b} = ${c}x + ${d}  (distribute ${a})`,
                `${a - c}x + ${a * b} = ${d}  (subtract ${c}x)`,
                `${a - c}x = ${d - a * b}  (subtract ${a * b})`,
                `x = ${x}  (divide by ${a - c})`
            ],
            hint: `First distribute, then move x terms to one side.`,
            concept: "distributive with both sides"
        };
    }

    // Infinite solutions: ax + b = ax + b
    generateInfiniteSolutions() {
        const a = this.randomInt(2, 6);
        const b = this.randomInt(3, 15);
        const left = this.randomInt(2, 5);

        return {
            equation: `${left}(${a}x + ${b}) = ${left * a}x + ${left * b}`,
            answer: "infinite",
            steps: [
                `${left}(${a}x + ${b}) = ${left * a}x + ${left * b}`,
                `${left * a}x + ${left * b} = ${left * a}x + ${left * b}  (distribute)`,
                `${left * b} = ${left * b}  (subtract ${left * a}x)`,
                `TRUE for all values of x`
            ],
            hint: `When both sides become identical, there are infinitely many solutions.`,
            concept: "infinite solutions",
            solutionType: "infinite"
        };
    }

    // No solution: ax + b = ax + c (where b ≠ c)
    generateNoSolution() {
        const a = this.randomInt(2, 6);
        const b = this.randomInt(3, 10);
        const c = b + this.randomInt(2, 8);

        return {
            equation: `${a}x + ${b} = ${a}x + ${c}`,
            answer: "none",
            steps: [
                `${a}x + ${b} = ${a}x + ${c}`,
                `${b} = ${c}  (subtract ${a}x from both sides)`,
                `FALSE - ${b} does not equal ${c}`,
                `No solution exists`
            ],
            hint: `When variables cancel and you get a false statement, there's no solution.`,
            concept: "no solution",
            solutionType: "none"
        };
    }

    // Mixed solution types
    generateSolutionsMixed() {
        const types = [
            () => this.generateTwoStepBasic(),
            () => this.generateInfiniteSolutions(),
            () => this.generateNoSolution()
        ];
        return types[this.randomInt(0, 2)]();
    }

    // Complex equations for boss levels
    generateComplexEquation() {
        const types = [
            () => this.generateBothSidesDistributive(),
            () => this.generateDistributivePractice(),
            () => this.generateBothSidesPractice()
        ];
        return types[this.randomInt(0, 2)]();
    }

    // Helper function
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getLevelInfo(levelId) {
        return this.levels.find(level => level.id === levelId);
    }

    getAllLevels() {
        return this.levels;
    }
}

// Export for use in other files
window.EquationGenerator = EquationGenerator;
