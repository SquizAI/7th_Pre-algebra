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
            },

            // PERIOD 2 SPECIAL LESSON (Level 21)
            {
                id: 21,
                name: "Solution Types Mastery",
                description: "Master identifying one, none, or infinite solutions",
                world: 4,
                type: "solutions-mixed",
                masteryRequired: 5,
                totalQuestions: 6,
                hints: true,
                concepts: ["solution types", "infinite solutions", "no solution"],
                // Password protection
                requiresPassword: true,
                password: "Algebra1114", // Password: Algebra1114
                passwordHint: "Think: Algebra + today's date (4 digits)",
                availableDate: "2025-11-14", // November 14, 2025
                // Florida Standards
                standards: ["MA.8.AR.2.1", "MA.K12.MTR.4.1", "ELA.K12.EE.1.1"],
                standardDescriptions: {
                    "MA.8.AR.2.1": "Solve multi-step linear equations in one variable with rational number coefficients",
                    "MA.K12.MTR.4.1": "Engage in discussions on mathematical thinking",
                    "ELA.K12.EE.1.1": "Cite evidence to explain and justify reasoning"
                },
                // Lesson metadata
                lessonCode: "7_math_2.11.3",
                period: 2,
                grade: 7,
                subject: "Pre-Algebra"
            }
        ];
    }

    // Generate equation based on type with adaptive difficulty
    generateEquation(type, questionNumber = 1, totalQuestions = 5) {
        // Get current difficulty from adaptive learning, or calculate from question number
        let difficulty = 'medium';

        if (window.adaptiveLearning) {
            // Use adaptive learning's difficulty if available
            difficulty = window.adaptiveLearning.getCurrentDifficulty();
        } else {
            // Fallback: increase difficulty as level progresses
            const progressPct = questionNumber / totalQuestions;
            if (progressPct <= 0.33) {
                difficulty = 'easy';
            } else if (progressPct <= 0.66) {
                difficulty = 'medium';
            } else {
                difficulty = 'hard';
            }
        }

        console.log(`🎲 Generating ${type} equation (Q${questionNumber}/${totalQuestions}, difficulty: ${difficulty})`);

        switch(type) {
            case 'two-step-basic':
                return this.generateTwoStepBasic(difficulty);
            case 'two-step-mixed':
                return this.generateTwoStepMixed(difficulty);
            case 'combining-terms':
                return this.generateCombiningTerms(difficulty);
            case 'distributive-intro':
                return this.generateDistributiveIntro(difficulty);
            case 'distributive-practice':
                return this.generateDistributivePractice(difficulty);
            case 'both-sides-intro':
                return this.generateBothSidesIntro(difficulty);
            case 'both-sides-practice':
                return this.generateBothSidesPractice(difficulty);
            case 'both-sides-distributive':
                return this.generateBothSidesDistributive(difficulty);
            case 'infinite-solutions':
                return this.generateInfiniteSolutions(difficulty);
            case 'no-solution':
                return this.generateNoSolution(difficulty);
            case 'solutions-mixed':
                return this.generateSolutionsMixed(difficulty);
            case 'complex-mixed':
                return this.generateComplexEquation(difficulty, 'mixed');
            case 'complex-advanced':
                return this.generateComplexEquation(difficulty, 'advanced');
            case 'final-boss':
                return this.generateComplexEquation(difficulty, 'boss');
            case 'review-checkpoint-1':
                return this.generateCheckpoint1(difficulty);
            case 'review-checkpoint-2':
                return this.generateCheckpoint2(difficulty);
            case 'review-checkpoint-3':
                return this.generateCheckpoint3(difficulty);
            default:
                return this.generateTwoStepBasic(difficulty);
        }
    }

    // Two-step basic: ax + b = c (with difficulty scaling)
    generateTwoStepBasic(difficulty = 'medium') {
        let a, b, x, c;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(2, 4);      // Small coefficients
                x = this.randomInt(1, 8);       // Small answers
                b = this.randomInt(1, 7);       // Small constants
                break;
            case 'hard':
                a = this.randomInt(3, 8);       // Larger coefficients
                x = this.randomInt(-5, 15);     // Can be negative
                b = this.randomInt(-10, 15);    // Can be negative
                break;
            default: // medium
                a = this.randomInt(2, 6);
                x = this.randomInt(1, 12);
                b = this.randomInt(1, 12);
        }

        c = a * x + b;

        return {
            equation: `${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}`,
            answer: x,
            type: 'two-step-basic',
            steps: [
                `${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}`,
                `${a}x = ${c - b}  (${b >= 0 ? 'subtract' : 'add'} ${Math.abs(b)} ${b >= 0 ? 'from' : 'to'} both sides)`,
                `x = ${x}  (divide both sides by ${a})`
            ],
            hint: `First, ${b >= 0 ? 'subtract' : 'add'} ${Math.abs(b)} to isolate the x term, then divide by ${a}.`,
            concept: "two-step equation"
        };
    }

    // Two-step mixed: HARDER - includes subtraction AND division
    generateTwoStepMixed(difficulty = 'medium') {
        let a, b, x, c;
        const operationType = Math.random();

        // 33% subtraction, 33% division, 34% addition (mixed)
        const useSubtraction = operationType < 0.33;
        const useDivision = operationType >= 0.33 && operationType < 0.66;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(2, 5);
                x = this.randomInt(1, 10);
                b = this.randomInt(1, 8);
                break;
            case 'hard':
                a = this.randomInt(4, 10);      // Larger coefficients than basic
                x = this.randomInt(-8, 18);     // Wider range including negatives
                b = this.randomInt(-15, 20);    // Larger constants
                break;
            default: // medium
                a = this.randomInt(3, 7);       // Slightly larger than basic
                x = this.randomInt(-3, 15);
                b = this.randomInt(-5, 15);
        }

        let equation, steps, hint;

        if (useDivision) {
            // x/a + b = c format (division)
            // FIX: Ensure x is divisible by a to avoid fractional answers
            x = x - (x % a); // Make x divisible by a
            if (x === 0) x = a; // Avoid x = 0
            c = (x / a) + b;
            equation = `x/${a} ${b >= 0 ? '+' : ''} ${b} = ${c}`;
            steps = [
                `x/${a} ${b >= 0 ? '+' : ''} ${b} = ${c}`,
                `x/${a} = ${c - b}  (subtract ${b})`,
                `x = ${x}  (multiply by ${a})`
            ];
            hint = `Subtract ${b} first, then multiply both sides by ${a}.`;
        } else if (useSubtraction) {
            // ax - b = c format (subtraction)
            c = a * x - b;
            equation = `${a}x - ${Math.abs(b)} = ${c}`;
            steps = [
                `${a}x - ${Math.abs(b)} = ${c}`,
                `${a}x = ${c + b}  (add ${Math.abs(b)})`,
                `x = ${x}  (divide by ${a})`
            ];
            hint = `Add ${Math.abs(b)} first, then divide by ${a}.`;
        } else {
            // ax + b = c format (addition)
            c = a * x + b;
            const sign = b >= 0 ? '+' : '';
            equation = `${a}x ${sign} ${b} = ${c}`;
            steps = [
                `${a}x ${sign} ${b} = ${c}`,
                `${a}x = ${c - b}  (subtract ${b})`,
                `x = ${x}  (divide by ${a})`
            ];
            hint = `Subtract ${b} first, then divide by ${a}.`;
        }

        console.log(`📝 Generated two-step-mixed: ${equation} (Type: ${useDivision ? 'division' : useSubtraction ? 'subtraction' : 'addition'})`);

        return {
            equation,
            answer: x,
            type: 'two-step-mixed',
            steps,
            hint,
            concept: "two-step with mixed operations"
        };
    }

    // Combining like terms: ax + bx + c = d (with difficulty scaling)
    generateCombiningTerms(difficulty = 'medium') {
        let a, b, c, x, d;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(1, 3);       // Small coefficients
                b = this.randomInt(1, 3);
                x = this.randomInt(1, 8);
                c = this.randomInt(1, 8);
                break;
            case 'hard':
                a = this.randomInt(2, 7);       // Larger, can have subtraction
                b = this.randomInt(-4, 7);      // Can be negative to create subtraction
                x = this.randomInt(-5, 15);
                c = this.randomInt(-12, 18);
                break;
            default: // medium
                a = this.randomInt(1, 5);
                b = this.randomInt(1, 5);
                x = this.randomInt(-3, 12);
                c = this.randomInt(-5, 15);
        }

        d = (a + b) * x + c;
        const combined = a + b;

        return {
            equation: `${a}x ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = ${d}`,
            answer: x,
            type: 'combining-terms',
            steps: [
                `${a}x ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = ${d}`,
                `${combined}x ${c >= 0 ? '+' : ''} ${c} = ${d}  (combine: ${a}x ${b >= 0 ? '+' : ''} ${b}x = ${combined}x)`,
                `${combined}x = ${d - c}  (${c >= 0 ? 'subtract' : 'add'} ${Math.abs(c)})`,
                `x = ${x}  (divide by ${combined})`
            ],
            hint: `Combine like terms first: ${a}x ${b >= 0 ? '+' : ''} ${b}x = ${combined}x, then solve.`,
            concept: "combining like terms"
        };
    }

    // Distributive property: a(x + b) = c (with difficulty)
    generateDistributiveIntro(difficulty = 'medium') {
        let a, b, x, c;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(2, 4);       // Small multiplier
                b = this.randomInt(1, 6);       // Small inside constant
                x = this.randomInt(1, 8);
                break;
            case 'hard':
                a = this.randomInt(3, 8);       // Larger multiplier
                b = this.randomInt(-8, 12);     // Can be negative
                x = this.randomInt(-5, 15);
                break;
            default: // medium
                a = this.randomInt(2, 6);
                b = this.randomInt(1, 10);
                x = this.randomInt(1, 12);
        }

        c = a * (x + b);

        return {
            equation: `${a}(x ${b >= 0 ? '+' : ''} ${b}) = ${c}`,
            answer: x,
            type: 'distributive-intro',
            steps: [
                `${a}(x ${b >= 0 ? '+' : ''} ${b}) = ${c}`,
                `${a}x ${a * b >= 0 ? '+' : ''} ${a * b} = ${c}  (distribute ${a})`,
                `${a}x = ${c - a * b}  (subtract ${a * b})`,
                `x = ${x}  (divide by ${a})`
            ],
            hint: `Distribute ${a}: multiply both x and ${b} by ${a}, then solve.`,
            concept: "distributive property"
        };
    }

    // Distributive practice: HARDER - includes extra constant outside parentheses
    generateDistributivePractice(difficulty = 'medium') {
        let a, b, c, x, result;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(2, 4);
                b = this.randomInt(1, 6);
                c = this.randomInt(1, 8);
                x = this.randomInt(1, 8);
                break;
            case 'hard':
                a = this.randomInt(3, 8);
                b = this.randomInt(-6, 12);
                c = this.randomInt(-10, 15);
                x = this.randomInt(-5, 15);
                break;
            default: // medium
                a = this.randomInt(2, 6);
                b = this.randomInt(-3, 10);
                c = this.randomInt(-5, 12);
                x = this.randomInt(-3, 12);
        }

        result = a * (x + b) + c;

        return {
            equation: `${a}(x ${b >= 0 ? '+' : ''} ${b}) ${c >= 0 ? '+' : ''} ${c} = ${result}`,
            answer: x,
            type: 'distributive-practice',
            steps: [
                `${a}(x ${b >= 0 ? '+' : ''} ${b}) ${c >= 0 ? '+' : ''} ${c} = ${result}`,
                `${a}x ${a * b >= 0 ? '+' : ''} ${a * b} ${c >= 0 ? '+' : ''} ${c} = ${result}  (distribute)`,
                `${a}x ${a * b + c >= 0 ? '+' : ''} ${a * b + c} = ${result}  (combine constants)`,
                `${a}x = ${result - (a * b + c)}  (subtract ${a * b + c})`,
                `x = ${x}  (divide by ${a})`
            ],
            hint: `Distribute ${a} first, then combine ${a * b} and ${c}, then solve.`,
            concept: "distributive with extra constants"
        };
    }

    // Variables on both sides intro: ax + b = cx + d
    generateBothSidesIntro(difficulty = 'medium') {
        let a, c, b, x, d;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(3, 5);
                c = this.randomInt(1, 2);       // Small right-side coefficient
                b = this.randomInt(1, 6);
                x = this.randomInt(1, 8);
                break;
            case 'hard':
                a = this.randomInt(4, 10);
                c = this.randomInt(2, 7);
                b = this.randomInt(-10, 15);    // Can be negative
                x = this.randomInt(-5, 15);
                break;
            default: // medium
                a = this.randomInt(3, 7);
                c = this.randomInt(1, 5);
                b = this.randomInt(-3, 12);
                x = this.randomInt(-2, 12);
        }

        d = a * x + b - c * x;

        return {
            equation: `${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}x ${d >= 0 ? '+' : ''} ${d}`,
            answer: x,
            type: 'both-sides-intro',
            steps: [
                `${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}x ${d >= 0 ? '+' : ''} ${d}`,
                `${a - c}x ${b >= 0 ? '+' : ''} ${b} = ${d}  (subtract ${c}x)`,
                `${a - c}x = ${d - b}  (subtract ${b})`,
                `x = ${x}  (divide by ${a - c})`
            ],
            hint: `Move all x terms to one side: subtract ${c}x from both sides first.`,
            concept: "variables on both sides"
        };
    }

    // Variables on both sides practice: HARDER - includes subtraction
    generateBothSidesPractice(difficulty = 'medium') {
        let a, c, b, d, x;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(4, 6);
                c = this.randomInt(1, 3);
                b = this.randomInt(1, 8);
                x = this.randomInt(1, 10);
                d = a * x - b - c * x;  // Calculate d to get integer solution
                break;
            case 'hard':
                a = this.randomInt(5, 12);
                c = this.randomInt(2, 8);
                b = this.randomInt(-12, 18);
                x = this.randomInt(-8, 18);
                d = a * x - b - c * x;
                break;
            default: // medium
                a = this.randomInt(4, 9);
                c = this.randomInt(2, 6);
                b = this.randomInt(-5, 15);
                x = this.randomInt(-4, 15);
                d = a * x - b - c * x;
        }

        return {
            equation: `${a}x - ${b} = ${c}x ${d >= 0 ? '+' : ''} ${d}`,
            answer: x,
            type: 'both-sides-practice',
            steps: [
                `${a}x - ${b} = ${c}x ${d >= 0 ? '+' : ''} ${d}`,
                `${a - c}x - ${b} = ${d}  (subtract ${c}x)`,
                `${a - c}x = ${d + b}  (add ${b})`,
                `x = ${x}  (divide by ${a - c})`
            ],
            hint: `Subtract ${c}x from both sides, then add ${b} to both sides.`,
            concept: "variables both sides with subtraction"
        };
    }

    // Both sides with distributive: HARDEST - combines two concepts
    generateBothSidesDistributive(difficulty = 'medium') {
        let a, b, c, d, x;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(2, 3);       // Small multiplier
                b = this.randomInt(1, 4);
                c = this.randomInt(1, 2);       // Small right coefficient
                x = this.randomInt(1, 8);
                d = a * (x + b) - c * x;        // Calculate for integer solution
                break;
            case 'hard':
                a = this.randomInt(3, 7);
                b = this.randomInt(-6, 10);
                c = this.randomInt(2, 6);
                x = this.randomInt(-5, 15);
                d = a * (x + b) - c * x;
                break;
            default: // medium
                a = this.randomInt(2, 5);
                b = this.randomInt(-3, 8);
                c = this.randomInt(1, 4);
                x = this.randomInt(-3, 12);
                d = a * (x + b) - c * x;
        }

        return {
            equation: `${a}(x ${b >= 0 ? '+' : ''} ${b}) = ${c}x ${d >= 0 ? '+' : ''} ${d}`,
            answer: x,
            type: 'both-sides-distributive',
            steps: [
                `${a}(x ${b >= 0 ? '+' : ''} ${b}) = ${c}x ${d >= 0 ? '+' : ''} ${d}`,
                `${a}x ${a * b >= 0 ? '+' : ''} ${a * b} = ${c}x ${d >= 0 ? '+' : ''} ${d}  (distribute ${a})`,
                `${a - c}x ${a * b >= 0 ? '+' : ''} ${a * b} = ${d}  (subtract ${c}x)`,
                `${a - c}x = ${d - a * b}  (subtract ${a * b})`,
                `x = ${x}  (divide by ${a - c})`
            ],
            hint: `Distribute ${a} first, THEN handle variables on both sides.`,
            concept: "distributive + both sides (combined)"
        };
    }

    // Infinite solutions: ax + b = ax + b
    generateInfiniteSolutions(difficulty = 'medium') {
        let a, b, left;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(2, 4);       // Smaller coefficients
                b = this.randomInt(3, 10);
                left = this.randomInt(2, 3);    // Smaller multiplier
                break;
            case 'hard':
                a = this.randomInt(3, 8);       // Larger coefficients
                b = this.randomInt(-8, 20);     // Can be negative
                left = this.randomInt(2, 6);    // Larger multiplier
                break;
            default: // medium
                a = this.randomInt(2, 6);
                b = this.randomInt(3, 15);
                left = this.randomInt(2, 5);
        }

        return {
            equation: `${left}(${a}x ${b >= 0 ? '+' : ''} ${b}) = ${left * a}x ${(left * b) >= 0 ? '+' : ''} ${left * b}`,
            answer: "infinite",
            steps: [
                `${left}(${a}x ${b >= 0 ? '+' : ''} ${b}) = ${left * a}x ${(left * b) >= 0 ? '+' : ''} ${left * b}`,
                `${left * a}x ${(left * b) >= 0 ? '+' : ''} ${left * b} = ${left * a}x ${(left * b) >= 0 ? '+' : ''} ${left * b}  (distribute)`,
                `${left * b} = ${left * b}  (subtract ${left * a}x)`,
                `TRUE for all values of x`
            ],
            hint: `When both sides become identical, there are infinitely many solutions.`,
            concept: "infinite solutions",
            solutionType: "infinite"
        };
    }

    // No solution: ax + b = ax + c (where b ≠ c)
    generateNoSolution(difficulty = 'medium') {
        let a, b, c;

        switch(difficulty) {
            case 'easy':
                a = this.randomInt(2, 4);       // Smaller coefficients
                b = this.randomInt(3, 8);
                c = b + this.randomInt(2, 5);   // Smaller difference
                break;
            case 'hard':
                a = this.randomInt(3, 8);       // Larger coefficients
                b = this.randomInt(-10, 15);    // Can be negative
                c = b + this.randomInt(3, 12);  // Larger difference
                break;
            default: // medium
                a = this.randomInt(2, 6);
                b = this.randomInt(3, 10);
                c = b + this.randomInt(2, 8);
        }

        return {
            equation: `${a}x ${b >= 0 ? '+' : ''} ${b} = ${a}x ${c >= 0 ? '+' : ''} ${c}`,
            answer: "none",
            steps: [
                `${a}x ${b >= 0 ? '+' : ''} ${b} = ${a}x ${c >= 0 ? '+' : ''} ${c}`,
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
    generateSolutionsMixed(difficulty = 'medium') {
        const types = [
            () => this.generateTwoStepBasic(difficulty),
            () => this.generateInfiniteSolutions(difficulty),
            () => this.generateNoSolution(difficulty)
        ];
        return types[this.randomInt(0, 2)]();
    }

    // Complex equations for boss levels with progressive difficulty
    generateComplexEquation(difficulty = 'medium', variant = 'mixed') {
        // Different variants for different boss levels
        switch(variant) {
            case 'mixed':
                // Level 17: Mix of distributive and both sides (moderate)
                const mixedTypes = [
                    () => this.generateBothSidesDistributive(difficulty),
                    () => this.generateDistributivePractice(difficulty),
                    () => this.generateBothSidesPractice(difficulty)
                ];
                return mixedTypes[this.randomInt(0, 2)]();

            case 'advanced':
                // Level 18: Harder versions, more both-sides emphasis
                const advancedTypes = [
                    () => this.generateBothSidesDistributive(difficulty),
                    () => this.generateBothSidesPractice(difficulty),
                    () => this.generateSolutionsMixed(difficulty)  // Include special solutions
                ];
                return advancedTypes[this.randomInt(0, 2)]();

            case 'boss':
                // Level 19: Ultimate challenge - all hardest types
                const bossTypes = [
                    () => this.generateBothSidesDistributive(difficulty),
                    () => this.generateSolutionsMixed(difficulty),
                    () => {
                        // Create an extra-challenging both-sides equation
                        let a = this.randomInt(3, 8);
                        let b = this.randomInt(-8, 12);
                        let c = this.randomInt(2, 7);
                        let d = this.randomInt(-10, 15);
                        let x = this.randomInt(-5, 20);
                        let e = a * x + b - c * x - d;

                        return {
                            equation: `${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}x ${d >= 0 ? '+' : ''} ${d} ${e >= 0 ? '+' : ''} ${e}`,
                            answer: x,
                            type: 'complex-boss',
                            steps: [
                                `${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}x ${d >= 0 ? '+' : ''} ${d} ${e >= 0 ? '+' : ''} ${e}`,
                                `${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}x ${(d + e) >= 0 ? '+' : ''} ${d + e}  (combine constants)`,
                                `${a - c}x ${b >= 0 ? '+' : ''} ${b} = ${d + e}  (subtract ${c}x)`,
                                `${a - c}x = ${d + e - b}  (subtract ${b})`,
                                `x = ${x}  (divide by ${a - c})`
                            ],
                            hint: `Collect all x terms on one side, then all constants on the other.`,
                            concept: "complex multi-step equation"
                        };
                    }
                ];
                return bossTypes[this.randomInt(0, 2)]();

            default:
                return this.generateBothSidesDistributive(difficulty);
        }
    }

    // Checkpoint 1: Review levels 1-5 (two-step and combining terms)
    generateCheckpoint1(difficulty = 'medium') {
        const types = [
            () => this.generateTwoStepBasic(difficulty),
            () => this.generateTwoStepMixed(difficulty),
            () => this.generateCombiningTerms(difficulty)
        ];
        return types[this.randomInt(0, 2)]();
    }

    // Checkpoint 2: Review levels 1-10 (two-step, combining, distributive)
    generateCheckpoint2(difficulty = 'medium') {
        const types = [
            () => this.generateTwoStepMixed(difficulty),
            () => this.generateCombiningTerms(difficulty),
            () => this.generateDistributiveIntro(difficulty),
            () => this.generateDistributivePractice(difficulty)
        ];
        return types[this.randomInt(0, 3)]();
    }

    // Checkpoint 3: Review levels 1-15 (all concepts including both sides)
    generateCheckpoint3(difficulty = 'medium') {
        const types = [
            () => this.generateCombiningTerms(difficulty),
            () => this.generateDistributivePractice(difficulty),
            () => this.generateBothSidesIntro(difficulty),
            () => this.generateBothSidesPractice(difficulty),
            () => this.generateBothSidesDistributive(difficulty)
        ];
        return types[this.randomInt(0, 4)]();
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
