/**
 * Netlify Serverless Function: Spend Coins
 *
 * PURPOSE: Spend user coins and track in Supabase
 * This function securely updates the database using the service role key
 * Validates sufficient balance before spending
 *
 * USAGE: POST to /.netlify/functions/spend-coins
 * Body: {
 *   userId: string (UUID),
 *   amount: number (positive integer),
 *   item: string (shop_purchase, avatar_purchase, etc.),
 *   itemId?: string (optional),
 *   description?: string (optional)
 * }
 *
 * RESPONSE: {
 *   success: boolean,
 *   remainingCoins?: number,
 *   message: string
 * }
 */

const { createClient } = require('@supabase/supabase-js');

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
    const { userId, amount, item, itemId, description } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required field: userId' })
      };
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid amount. Must be a positive number.' })
      };
    }

    if (!item) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required field: item' })
      };
    }

    // Validate item enum
    const validItems = [
      'shop_purchase',
      'avatar_purchase',
      'hint_purchase',
      'power_up'
    ];

    if (!validItems.includes(item)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid item. Must be one of: ' + validItems.join(', ')
        })
      };
    }

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Call the spend_coins database function
    const { data, error } = await supabase.rpc('spend_coins', {
      p_user_id: userId,
      p_amount: amount,
      p_source: item,
      p_source_id: itemId || null,
      p_description: description || null
    });

    if (error) {
      console.error('Database error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to spend coins',
          message: error.message
        })
      };
    }

    // The RPC returns a single row with the result
    const result = data[0];

    // Check if spending was successful
    if (!result.success) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          success: false,
          message: result.message || 'Insufficient coins',
          remainingCoins: result.remaining_coins
        })
      };
    }

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        remainingCoins: result.remaining_coins,
        message: result.message || 'Purchase successful',
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
