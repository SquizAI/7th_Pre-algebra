/**
 * Netlify Serverless Function: Award XP
 *
 * PURPOSE: Award XP to students and update their profiles
 * Validates authentication and tracks XP history
 *
 * USAGE: POST to /.netlify/functions/award-xp
 * Body: { userId, amount, source, lessonNumber, score, timeSpent, attempts }
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
            score,
            timeSpent,
            attempts
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

        // TODO: Add Supabase integration here
        // For now, return success with mock data
        // In production, this would:
        // 1. Verify user exists and is authenticated
        // 2. Update profiles table (total_xp, level)
        // 3. Insert into xp_history table
        // 4. Calculate new level
        // 5. Return updated profile data

        // Calculate level from XP
        const calculateLevel = (totalXP) => {
            return Math.floor(Math.sqrt(totalXP / 100)) + 1;
        };

        // Mock response (replace with Supabase query)
        const mockTotalXP = amount; // This would be fetched from DB
        const newLevel = calculateLevel(mockTotalXP);
        const leveledUp = false; // Calculate based on previous level

        const response = {
            success: true,
            data: {
                userId,
                xpAwarded: amount,
                source,
                totalXP: mockTotalXP,
                level: newLevel,
                leveledUp,
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
        console.error('Error awarding XP:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to award XP',
                message: error.message
            })
        };
    }
};

/**
 * SUPABASE INTEGRATION TEMPLATE (Uncomment when Supabase is set up)
 *
 * const { createClient } = require('@supabase/supabase-js');
 *
 * const supabase = createClient(
 *     process.env.SUPABASE_URL,
 *     process.env.SUPABASE_SERVICE_KEY
 * );
 *
 * // Get current profile
 * const { data: profile, error: fetchError } = await supabase
 *     .from('profiles')
 *     .select('total_xp, level')
 *     .eq('user_id', userId)
 *     .single();
 *
 * if (fetchError) throw fetchError;
 *
 * // Calculate new values
 * const newTotalXP = (profile.total_xp || 0) + amount;
 * const oldLevel = profile.level || 1;
 * const newLevel = calculateLevel(newTotalXP);
 * const leveledUp = newLevel > oldLevel;
 *
 * // Update profile
 * const { error: updateError } = await supabase
 *     .from('profiles')
 *     .update({
 *         total_xp: newTotalXP,
 *         level: newLevel,
 *         updated_at: new Date().toISOString()
 *     })
 *     .eq('user_id', userId);
 *
 * if (updateError) throw updateError;
 *
 * // Insert XP history
 * const { error: historyError } = await supabase
 *     .from('xp_history')
 *     .insert({
 *         user_id: userId,
 *         amount,
 *         source,
 *         lesson_number: lessonNumber,
 *         score,
 *         time_spent: timeSpent,
 *         attempts,
 *         timestamp: new Date().toISOString()
 *     });
 *
 * if (historyError) throw historyError;
 */
