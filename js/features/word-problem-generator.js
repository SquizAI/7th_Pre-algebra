// Word Problem Generator using Google Gemini AI
// Generates age-appropriate word problems for 7th graders

class WordProblemGenerator {
    constructor() {
        // Use serverless function instead of direct API access
        this.apiEndpoint = '/.netlify/functions/gemini-api';
        this.cache = new Map(); // Cache generated problems
        this.maxCacheSize = 50;
        this.useServerlessFunction = true;
    }

    // Parse equation to extract coefficients
    parseEquation(equationStr) {
        // Handle equations like "5x + 7 = 52" or "3x - 4 = 14"
        const parts = equationStr.split('=');
        if (parts.length !== 2) {
            return { coefficient: 1, constant: 0, result: 0 };
        }

        const leftSide = parts[0].trim();
        const result = parseInt(parts[1].trim());

        // Extract coefficient of x
        const xMatch = leftSide.match(/(-?\d*)x/);
        const coefficient = xMatch ? (xMatch[1] === '' || xMatch[1] === '+' ? 1 : xMatch[1] === '-' ? -1 : parseInt(xMatch[1])) : 1;

        // Extract constant term
        const constantMatch = leftSide.match(/[+-]\s*(\d+)(?!x)/);
        const constant = constantMatch ? parseInt(constantMatch[0].replace(/\s/g, '')) : 0;

        return { coefficient, constant, result };
    }

    // Generate a word problem using Gemini AI with exact equation match
    async generateWordProblem(equation, difficulty) {
        const equationStr = equation.equation;
        const equationType = equation.type;
        const answer = equation.answer;

        // Parse equation to get coefficients
        const { coefficient, constant, result } = this.parseEquation(equationStr);

        // Check cache first
        const cacheKey = `${equationStr}-${difficulty}`;
        if (this.cache.has(cacheKey)) {
            console.log('📦 Using cached word problem');
            return this.cache.get(cacheKey);
        }

        try {
            const prompt = this.buildPrompt(coefficient, constant, result, answer, equationType, difficulty);

            // Call serverless function instead of Gemini API directly
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    studentContext: {
                        equation: equationStr,
                        level: difficulty,
                        concept: 'Two-Step Equations'
                    }
                })
            });

            if (!response.ok) {
                console.error('Word problem API error:', response.status);
                return this.getFallbackProblem(coefficient, constant, result, answer, equationType);
            }

            const data = await response.json();
            const wordProblem = data.response.trim();

            // Cache the result
            this.addToCache(cacheKey, wordProblem);

            console.log('✨ Generated word problem with Gemini AI');
            console.log(`   Equation: ${coefficient}x + ${constant} = ${result} (x = ${answer})`);
            return wordProblem;

        } catch (error) {
            console.error('Error generating word problem:', error);
            return this.getFallbackProblem(coefficient, constant, result, answer, equationType);
        }
    }

    // Build the AI prompt with exact equation structure
    buildPrompt(coefficient, constant, result, answer, equationType, difficulty) {
        const difficultyContext = {
            easy: 'simple, straightforward',
            medium: 'moderately challenging',
            hard: 'complex and challenging'
        };

        const typeContext = {
            'two-step-basic': 'two-step equation',
            'two-step equation': 'two-step equation',
            'combining like terms': 'equation with combining like terms',
            'distributive property': 'equation using distributive property',
            'variables on both sides': 'equation with variables on both sides',
            'complex-mixed': 'complex equation combining multiple concepts'
        };

        // Build equation description based on sign
        const constantPart = constant >= 0 ? `plus ${constant}` : `minus ${Math.abs(constant)}`;
        const equationDescription = `${coefficient}x ${constantPart} equals ${result}`;

        return `You are a 7th grade math teacher creating engaging word problems for students learning pre-algebra.

Create a ${difficultyContext[difficulty] || 'moderately challenging'} word problem that EXACTLY matches this equation:
${coefficient}x ${constant >= 0 ? '+' : '-'} ${Math.abs(constant)} = ${result}

Where:
- ${coefficient} is the rate/coefficient (how much per unit)
- ${Math.abs(constant)} is the starting amount or adjustment (${constant >= 0 ? 'added' : 'subtracted'})
- ${result} is the final total
- The answer is x = ${answer}

The word problem should:
1. Be relatable to 7th grade students (ages 12-13)
2. Use real-world scenarios: money, gaming, sports, phones, food, collecting items, etc.
3. Have EXACTLY the structure: "${coefficient} times something ${constant >= 0 ? 'plus' : 'minus'} ${Math.abs(constant)} equals ${result}"
4. Be exactly 2-3 sentences long
5. NOT include the equation itself - students need to figure it out
6. Make it clear what the variable represents

Example for 3x + 5 = 20:
"Marco is collecting trading cards. He has 5 cards already and buys 3 cards each week. After a certain number of weeks, Marco has 20 cards total. How many weeks did he collect?"

Write ONLY the word problem text. No equations, no solutions, no extra explanations.`;
    }

    // Fallback word problems when API is unavailable
    getFallbackProblem(coefficient, constant, result, answer, equationType) {
        const scenarios = [
            {
                template: `{name} is saving money for a new gaming console. {pronoun_cap} already has $${Math.abs(constant)} and plans to save $${coefficient} each week from {pronoun_pos} allowance. After ${answer} weeks, {pronoun} will have $${result}. How many weeks did it take?`,
                names: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'],
                pronouns: { cap: 'They', pos: 'their', obj: 'they' }
            },
            {
                template: `A student is collecting rare sneakers. Starting with ${Math.abs(constant)} pairs, the student buys ${coefficient} ${coefficient === 1 ? 'pair' : 'pairs'} each month. After ${answer} months, the collection has ${result} pairs total.`,
                names: [],
                pronouns: {}
            },
            {
                template: `Your phone has ${Math.abs(constant)} GB used already. You download ${coefficient} GB of games each day. After ${answer} days, you've used ${result} GB total. How many days passed?`,
                names: [],
                pronouns: {}
            },
            {
                template: `A basketball player scored ${Math.abs(constant)} points in the first quarter. In each remaining quarter, the player scores ${coefficient} ${coefficient === 1 ? 'point' : 'points'}. After ${answer} more quarters, the total score is ${result} points.`,
                names: [],
                pronouns: {}
            }
        ];

        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        let problem = scenario.template;

        // Replace placeholders
        if (scenario.names.length > 0) {
            const name = scenario.names[Math.floor(Math.random() * scenario.names.length)];
            problem = problem.replace(/{name}/g, name);
            problem = problem.replace(/{pronoun_cap}/g, scenario.pronouns.cap);
            problem = problem.replace(/{pronoun_pos}/g, scenario.pronouns.pos);
            problem = problem.replace(/{pronoun}/g, scenario.pronouns.obj);
        }

        console.log(`📝 Using fallback problem for ${coefficient}x + ${constant} = ${result}`);
        return problem;
    }

    // Cache management
    addToCache(key, value) {
        // Implement simple LRU cache
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Word problem cache cleared');
    }

    // Set API key manually (for testing)
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('GEMINI_API_KEY', key);
        console.log('✅ Gemini API key set');
    }
}

// Initialize global instance
window.addEventListener('DOMContentLoaded', () => {
    window.wordProblemGenerator = new WordProblemGenerator();
    console.log('📝 Word Problem Generator initialized');
});
