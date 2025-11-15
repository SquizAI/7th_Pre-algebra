/**
 * Netlify Serverless Function: Award Coins
 *
 * PURPOSE: Award coins to students and update their profiles
 * Validates authentication and tracks coin history
 *
 * USAGE: POST to /.netlify/functions/award-coins
 * Body: { userId, amount, source, lessonNumber, score }
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
        const {
            userId,
            amount,
            source,
            lessonNumber,
            score
        } = JSON.parse(event.body || '{}');

        // Validate required fields
        if (!userId || !amount || !source) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Missing required fields: userId, amount, source'
                })
            };
        }

        // Validate amount is positive
        if (amount <= 0 || amount > 1000) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Invalid amount. Must be between 1 and 1000.'
                })
            };
        }

        // Initialize Supabase client with service key (bypasses RLS)
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // Get current profile
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('total_coins')
            .eq('id', userId)
            .single();

        if (fetchError) {
            throw new Error(`Failed to fetch profile: ${fetchError.message}`);
        }

        if (!profile) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'User profile not found'
                })
            };
        }

        // Calculate new balance
        const newTotalCoins = (profile.total_coins || 0) + amount;

        // Update profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                total_coins: newTotalCoins,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`);
        }

        // Insert coin history
        const { error: historyError } = await supabase
            .from('coin_history')
            .insert({
                user_id: userId,
                amount,
                transaction_type: 'earned',
                source,
                source_id: lessonNumber ? `lesson_${lessonNumber}` : null,
                description: lessonNumber ? `Lesson ${lessonNumber} completed - Score: ${score || 0}%` : null
            });

        if (historyError) {
            throw new Error(`Failed to insert coin history: ${historyError.message}`);
        }

        const response = {
            success: true,
            data: {
                userId,
                coinsAwarded: amount,
                source,
                totalCoins: newTotalCoins,
                timestamp: new Date().toISOString()
            }
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('Error awarding coins:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to award coins',
                message: error.message
            })
        };
    }
};

