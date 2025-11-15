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
    // Use gemini-2.5-pro for best performance
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

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
          maxOutputTokens: 8192,  // Increased from 1024 to allow full responses
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

    // Comprehensive logging for debugging
    console.log('Gemini API Full Response:', JSON.stringify(data, null, 2));

    // Check for safety blocks
    if (data.promptFeedback?.blockReason) {
      console.error('Content blocked by safety filters:', data.promptFeedback.blockReason);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          error: 'Content blocked by safety filters',
          reason: data.promptFeedback.blockReason,
          safetyRatings: data.promptFeedback.safetyRatings
        })
      };
    }

    // Check if candidates exist
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response');
      console.log('Full response data:', data);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          error: 'No response candidates generated',
          details: 'The AI did not generate any response candidates',
          responseData: data
        })
      };
    }

    // Check finish reason
    const finishReason = data.candidates[0].finishReason;
    console.log('Finish reason:', finishReason);

    if (finishReason && finishReason !== 'STOP') {
      console.warn('Unexpected finish reason:', finishReason);

      // Handle different finish reasons
      if (finishReason === 'SAFETY') {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            error: 'Response blocked by safety filters',
            finishReason: finishReason,
            safetyRatings: data.candidates[0].safetyRatings
          })
        };
      } else if (finishReason === 'MAX_TOKENS') {
        console.error('Response truncated: hit max token limit');
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            error: 'Response truncated due to token limit',
            finishReason: finishReason,
            details: 'The AI response was too long. Try asking a more specific question.'
          })
        };
      }
    }

    // Extract text
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Extracted text:', aiResponse);

    if (!aiResponse) {
      console.error('No text found in response parts');
      console.log('Candidate structure:', JSON.stringify(data.candidates[0], null, 2));
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          error: 'No text in response',
          finishReason: finishReason,
          candidateData: data.candidates[0]
        })
      };
    }

    // Success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        response: aiResponse,
        finishReason: finishReason,
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
