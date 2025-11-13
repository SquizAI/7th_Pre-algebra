// Word Problem Generator using Google Gemini AI
// Generates age-appropriate word problems for 7th graders

class WordProblemGenerator {
    constructor() {
        this.apiKey = this.getApiKey();
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.cache = new Map(); // Cache generated problems
        this.maxCacheSize = 50;
    }

    // Get API key from environment or localStorage
    getApiKey() {
        // In production (Netlify), this will be set as an environment variable
        // For local development, you can set it in localStorage for testing
        if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
            return process.env.GEMINI_API_KEY;
        }

        // Fallback: check if it's injected into window (for Netlify build)
        if (window.GEMINI_API_KEY) {
            return window.GEMINI_API_KEY;
        }

        // For local testing only
        const localKey = localStorage.getItem('GEMINI_API_KEY');
        if (localKey) {
            return localKey;
        }

        console.warn('⚠️ Gemini API key not found. Word problems will use fallback mode.');
        return null;
    }

    // Generate a word problem using Gemini AI
    async generateWordProblem(equationType, difficulty, answer) {
        // Check cache first
        const cacheKey = `${equationType}-${difficulty}-${answer}`;
        if (this.cache.has(cacheKey)) {
            console.log('📦 Using cached word problem');
            return this.cache.get(cacheKey);
        }

        // If no API key, use fallback
        if (!this.apiKey) {
            return this.getFallbackProblem(equationType, difficulty, answer);
        }

        try {
            const prompt = this.buildPrompt(equationType, difficulty, answer);
            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 300,
                    }
                })
            });

            if (!response.ok) {
                console.error('Gemini API error:', response.status);
                return this.getFallbackProblem(equationType, difficulty, answer);
            }

            const data = await response.json();
            const wordProblem = data.candidates[0].content.parts[0].text.trim();

            // Cache the result
            this.addToCache(cacheKey, wordProblem);

            console.log('✨ Generated word problem with Gemini AI');
            return wordProblem;

        } catch (error) {
            console.error('Error generating word problem:', error);
            return this.getFallbackProblem(equationType, difficulty, answer);
        }
    }

    // Build the AI prompt based on equation type and difficulty
    buildPrompt(equationType, difficulty, answer) {
        const difficultyContext = {
            easy: 'simple, straightforward',
            medium: 'moderately challenging',
            hard: 'complex and challenging'
        };

        const typeContext = {
            'two-step-basic': 'two-step equation (like 3x + 5 = 20)',
            'two-step equation': 'two-step equation (like 2x - 7 = 15)',
            'combining like terms': 'equation with combining like terms (like 3x + 2x + 4 = 29)',
            'distributive property': 'equation using distributive property (like 2(x + 3) = 18)',
            'variables on both sides': 'equation with variables on both sides (like 4x + 7 = 2x + 19)',
            'complex-mixed': 'complex equation combining multiple concepts'
        };

        return `You are a 7th grade math teacher creating engaging word problems for students learning pre-algebra.

Create a ${difficultyContext[difficulty]} word problem for 7th graders that involves a ${typeContext[equationType] || 'multi-step equation'}.

The word problem should:
1. Be relatable to 7th grade students (ages 12-13)
2. Use real-world scenarios they care about: money, gaming, sports, phones, food, shopping, friends, etc.
3. Be ${difficultyContext[difficulty]} to understand
4. Have an answer of x = ${answer}
5. Be exactly 2-3 sentences long
6. NOT include the equation itself - students need to figure out the equation from the word problem
7. Use diverse scenarios (avoid repeating shopping/money themes if possible)

Write ONLY the word problem text. No equations, no solutions, no extra explanations.

Example format:
"Sarah is saving up for a new gaming console. She already has $45 and plans to save $12 each week from her allowance. How many weeks will it take her to have $117?"`;
    }

    // Fallback word problems when API is unavailable
    getFallbackProblem(equationType, difficulty, answer) {
        const templates = this.getFallbackTemplates(equationType, difficulty);
        const template = templates[Math.floor(Math.random() * templates.length)];
        return template.replace('{answer}', answer);
    }

    getFallbackTemplates(equationType, difficulty) {
        const templates = {
            'two-step-basic': [
                'You scored {answer} points in a video game. You earned 5 bonus points and then tripled your score. What was your original score?',
                'A pizza costs ${answer} after a $3 delivery fee. If the pizza was divided equally among 2 friends, how much did each person pay before the fee?',
                'Your phone has {answer} GB of storage. After downloading 8 GB of games, you\'ve used half your storage. How much storage do you have total?'
            ],
            'distributive property': [
                'You bought {answer} packs of trading cards. Each pack costs $3 and has 5 cards. If you spent $30 total, how many packs did you buy?',
                'A streaming service charges ${answer} per month. You paid for 3 months plus a $5 setup fee, spending $44 total. What\'s the monthly cost?',
                'You\'re planning a party. Pizza costs ${answer} per person. With 8 friends and a $12 cake, you spent $60 total. What\'s the cost per person?'
            ],
            'variables on both sides': [
                'Two gamers are competing. Player 1 has {answer} points plus 7 bonus points. Player 2 has {answer} points plus 15 bonus points. They end with the same score. What\'s {answer}?',
                'You and your friend are collecting sneakers. You have {answer} pairs plus 4 more. Your friend has {answer} pairs plus 10 more. You both have the same total. What\'s {answer}?',
                'Two students are reading. Student A reads {answer} pages per day plus 5 extra. Student B reads {answer} pages per day plus 13 extra. They read the same amount. What\'s {answer}?'
            ]
        };

        return templates[equationType] || templates['two-step-basic'];
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
