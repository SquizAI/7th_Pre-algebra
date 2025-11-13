/**
 * AI Client - Simple interface for calling Gemini via Netlify function
 *
 * This replaces the client-side clipboard copy approach with
 * a secure server-side API call.
 */

const AIClient = {
  /**
   * Ask Gemini AI a question with optional student context
   * @param {string} prompt - The question to ask
   * @param {object} context - Optional student context (equation, level, etc.)
   * @returns {Promise<string>} - AI response text
   */
  async ask(prompt, context = {}) {
    try {
      const response = await fetch('/.netlify/functions/gemini-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          studentContext: context
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.response) {
        return data.response;
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }

    } catch (error) {
      console.error('AI Client Error:', error);
      throw error;
    }
  },

  /**
   * Get help with current equation
   * @param {string} equation - Current equation
   * @param {string} concept - Learning concept
   * @param {number} level - Current level
   * @returns {Promise<string>} - AI help response
   */
  async getEquationHelp(equation, concept, level) {
    const prompt = "I'm stuck on this equation. Can you help me understand how to solve it?";
    const context = {
      equation: equation,
      concept: concept,
      level: level,
      progress: `Working on level ${level}`
    };

    return this.ask(prompt, context);
  },

  /**
   * Get a hint for solving the current equation
   * @param {string} equation - Current equation
   * @param {string} concept - Learning concept
   * @returns {Promise<string>} - Hint from AI
   */
  async getHint(equation, concept) {
    const prompt = "Can you give me a hint about what to do first with this equation? Don't give me the answer, just point me in the right direction.";
    const context = {
      equation: equation,
      concept: concept
    };

    return this.ask(prompt, context);
  },

  /**
   * Get explanation of solution steps
   * @param {string} equation - The equation
   * @param {array} steps - Solution steps
   * @returns {Promise<string>} - Explanation from AI
   */
  async explainSteps(equation, steps) {
    const stepsText = steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
    const prompt = `Can you explain why we take these steps to solve this equation?\n\nSteps:\n${stepsText}`;
    const context = {
      equation: equation
    };

    return this.ask(prompt, context);
  }
};

// Export for use in other files
if (typeof window !== 'undefined') {
  window.AIClient = AIClient;
}
