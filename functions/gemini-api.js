/**
 * Netlify Serverless Function: Gemini API Proxy
 *
 * PURPOSE: Securely proxy requests to Google Gemini API
 * This keeps the API key server-side and prevents client exposure
 *
 * USAGE: POST to /.netlify/functions/gemini-api
 * Body: { prompt: string, context?: object }
 */

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    // Parse request body
    const { prompt, studentContext } = JSON.parse(event.body || '{}');

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request. "prompt" is required.' })
      };
    }

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Construct Gemini API request
    // Use gemini-1.5-flash for fast, cost-effective responses
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Build the full prompt with context
    let fullPrompt = prompt;
    if (studentContext) {
      fullPrompt = `Student Context:
- Equation: ${studentContext.equation || 'N/A'}
- Current Level: ${studentContext.level || 'N/A'}
- Concept: ${studentContext.concept || 'N/A'}
- Student Progress: ${studentContext.progress || 'N/A'}

Student Question: ${prompt}

Please provide helpful, age-appropriate guidance for a 7th-grade student. Focus on teaching the concept, not just giving the answer.`;
    }

    // Make request to Gemini API
    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 40
        }
      })
    });

    // Check if request was successful
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'Failed to get response from Gemini',
          details: errorData
        })
      };
    }

    // Parse and return response
    const data = await response.json();

    // Extract the text response
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust in production if needed
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
