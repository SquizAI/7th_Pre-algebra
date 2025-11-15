/**
 * Lesson Exercises Data
 *
 * PURPOSE: Store exercise data for each lesson
 * Each lesson has 5-7 bite-sized exercises
 */

const LessonExercises = {
  /**
   * Get exercises for a specific lesson
   * @param {number} lessonId
   * @returns {Array} Array of exercise objects
   */
  getExercisesForLesson(lessonId) {
    const exercises = this.exercises[lessonId];

    if (!exercises) {
      console.warn(`No exercises found for lesson ${lessonId}`);
      return null;
    }

    // Convert exercise data to ExerciseType instances
    return exercises.map(ex => this.createExercise(ex));
  },

  /**
   * Create an exercise instance from data
   * @param {object} data
   * @returns {Exercise}
   */
  createExercise(data) {
    const { type, ...params } = data;

    switch (type) {
      case 'multipleChoice':
        return new window.ExerciseTypes.MultipleChoice(
          params.question,
          params.options,
          params.correctIndex,
          params.hint
        );

      case 'fillInBlank':
        return new window.ExerciseTypes.FillInTheBlank(
          params.question,
          params.correctAnswer,
          params.caseSensitive || false,
          params.hint
        );

      case 'mathProblem':
        return new window.ExerciseTypes.MathProblem(
          params.equation,
          params.correctAnswer,
          params.hint
        );

      case 'trueFalse':
        return new window.ExerciseTypes.TrueFalse(
          params.statement,
          params.correctAnswer,
          params.explanation
        );

      case 'ordering':
        return new window.ExerciseTypes.Ordering(
          params.question,
          params.items,
          params.correctOrder
        );

      default:
        console.error(`Unknown exercise type: ${type}`);
        return null;
    }
  },

  // Exercise data for each lesson
  exercises: {
    // Lesson 1: Welcome to Algebra Castle (Two-Step Equations Intro)
    1: [
      {
        type: 'multipleChoice',
        question: 'What does the variable "x" represent in an equation?',
        options: [
          'A number we already know',
          'A number we need to find',
          'Always equals 10',
          'A multiplication symbol'
        ],
        correctIndex: 1,
        hint: 'The variable is the unknown we\'re solving for!'
      },
      {
        type: 'trueFalse',
        statement: 'In the equation 2x + 3 = 11, we need to undo the operations to find x.',
        correctAnswer: true,
        explanation: 'Correct! We work backwards to isolate x.'
      },
      {
        type: 'multipleChoice',
        question: 'What is the FIRST step to solve: 2x + 5 = 13?',
        options: [
          'Divide both sides by 2',
          'Subtract 5 from both sides',
          'Add 5 to both sides',
          'Multiply both sides by 2'
        ],
        correctIndex: 1,
        hint: 'Undo addition/subtraction BEFORE multiplication/division'
      },
      {
        type: 'mathProblem',
        equation: '2x + 5 = 13',
        correctAnswer: 4,
        hint: 'First subtract 5 from both sides, then divide by 2'
      },
      {
        type: 'mathProblem',
        equation: '3x + 7 = 16',
        correctAnswer: 3,
        hint: 'Subtract 7 first, then divide by 3'
      },
      {
        type: 'multipleChoice',
        question: 'Which equation has the solution x = 5?',
        options: [
          '2x + 3 = 13',
          '4x - 2 = 18',
          '3x + 1 = 16',
          '5x - 5 = 20'
        ],
        correctIndex: 2,
        hint: 'Try substituting x = 5 into each equation'
      },
      {
        type: 'mathProblem',
        equation: '4x + 2 = 18',
        correctAnswer: 4
      }
    ],

    // Lesson 2: Two-Step Mastery
    2: [
      {
        type: 'mathProblem',
        equation: '5x + 3 = 18',
        correctAnswer: 3,
        hint: 'Subtract 3, then divide by 5'
      },
      {
        type: 'mathProblem',
        equation: '2x - 7 = 5',
        correctAnswer: 6,
        hint: 'Add 7 first, then divide by 2'
      },
      {
        type: 'multipleChoice',
        question: 'To solve 3x - 4 = 14, what should you do SECOND?',
        options: [
          'Divide by 3',
          'Subtract 4',
          'Add 4',
          'Multiply by 3'
        ],
        correctIndex: 0,
        hint: 'After adding 4, you need to isolate x'
      },
      {
        type: 'mathProblem',
        equation: '6x - 8 = 22',
        correctAnswer: 5
      },
      {
        type: 'mathProblem',
        equation: '7x + 9 = 30',
        correctAnswer: 3
      },
      {
        type: 'trueFalse',
        statement: 'The equation 4x + 12 = 36 has the same solution as 4x = 24.',
        correctAnswer: true,
        explanation: 'Yes! Subtracting 12 from both sides gives us 4x = 24'
      }
    ],

    // Lesson 3: Two-Step Review Checkpoint
    3: [
      {
        type: 'mathProblem',
        equation: '8x + 5 = 37',
        correctAnswer: 4
      },
      {
        type: 'mathProblem',
        equation: '3x - 11 = 7',
        correctAnswer: 6
      },
      {
        type: 'multipleChoice',
        question: 'If 2x + 6 = 20, then what does 2x equal?',
        options: ['26', '14', '10', '7'],
        correctIndex: 1,
        hint: 'Subtract 6 from both sides first'
      },
      {
        type: 'mathProblem',
        equation: '9x - 3 = 42',
        correctAnswer: 5
      },
      {
        type: 'mathProblem',
        equation: '4x + 15 = 35',
        correctAnswer: 5
      },
      {
        type: 'trueFalse',
        statement: 'To check your answer, substitute it back into the original equation.',
        correctAnswer: true,
        explanation: 'Always check your work by substituting your answer!'
      }
    ],

    // Lesson 4: Into the Forest of Terms (Combining Like Terms)
    4: [
      {
        type: 'multipleChoice',
        question: 'Which terms are "like terms"?',
        options: [
          '3x and 3y',
          '5x and 2x',
          '4 and 4x',
          '2x² and 2x'
        ],
        correctIndex: 1,
        hint: 'Like terms have the same variable AND exponent'
      },
      {
        type: 'fillInBlank',
        question: 'Combine like terms: 3x + 5x = ___',
        correctAnswer: '8x',
        hint: 'Add the coefficients: 3 + 5 = 8'
      },
      {
        type: 'fillInBlank',
        question: 'Simplify: 7x - 2x = ___',
        correctAnswer: '5x',
        hint: 'Subtract the coefficients: 7 - 2 = 5'
      },
      {
        type: 'trueFalse',
        statement: 'In the expression 4x + 3 + 2x, we can combine 4x and 2x.',
        correctAnswer: true,
        explanation: 'Yes! They are like terms, so 4x + 2x = 6x'
      },
      {
        type: 'mathProblem',
        equation: '2x + 3x + 4 = 19',
        correctAnswer: 3,
        hint: 'First combine 2x + 3x = 5x, then solve'
      },
      {
        type: 'mathProblem',
        equation: '7x - 4x + 5 = 14',
        correctAnswer: 3,
        hint: 'Combine 7x - 4x = 3x first'
      }
    ],

    // Lesson 5: Like Terms Practice
    5: [
      {
        type: 'fillInBlank',
        question: 'Combine: 6x + 2 + 4x - 5 = ___x + ___',
        correctAnswer: '10x - 3',
        caseSensitive: false,
        hint: 'Combine x terms: 6x + 4x = 10x, then numbers: 2 - 5 = -3'
      },
      {
        type: 'mathProblem',
        equation: '5x + 2x - 3 = 18',
        correctAnswer: 3,
        hint: '5x + 2x = 7x'
      },
      {
        type: 'mathProblem',
        equation: '8x - 3x + 7 = 22',
        correctAnswer: 3,
        hint: '8x - 3x = 5x'
      },
      {
        type: 'multipleChoice',
        question: 'What is the coefficient of x in: 9x - 5x + 2?',
        options: ['9', '5', '4', '2'],
        correctIndex: 2,
        hint: 'Combine the x terms first: 9 - 5 = 4'
      },
      {
        type: 'mathProblem',
        equation: '3x + 4x + 1 = 15',
        correctAnswer: 2
      }
    ],

    // Lesson 6: Combining Terms Review
    6: [
      {
        type: 'mathProblem',
        equation: '6x + 3x - 5 = 22',
        correctAnswer: 3
      },
      {
        type: 'mathProblem',
        equation: '10x - 2x + 4 = 20',
        correctAnswer: 2
      },
      {
        type: 'ordering',
        question: 'Put the steps in order to solve: 4x + 2x + 3 = 21',
        items: [
          'Combine like terms: 6x + 3 = 21',
          'Subtract 3 from both sides: 6x = 18',
          'Divide both sides by 6: x = 3',
          'Check: 4(3) + 2(3) + 3 = 21 ✓'
        ],
        correctOrder: [0, 1, 2, 3]
      },
      {
        type: 'mathProblem',
        equation: '5x + x - 2 = 16',
        correctAnswer: 3,
        hint: '5x + x = 6x'
      },
      {
        type: 'trueFalse',
        statement: 'The expression 3x + 2y + 5x can be simplified to 8xy.',
        correctAnswer: false,
        explanation: 'No! It should be 8x + 2y. You can\'t combine x and y terms.'
      }
    ]

    // More lessons can be added here...
    // Lessons 7-21 would follow the same pattern
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.LessonExercises = LessonExercises;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonExercises;
}
