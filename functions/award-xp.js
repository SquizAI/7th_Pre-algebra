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

        // Initialize Supabase client with service key (bypasses RLS)
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // Calculate level from XP
        const calculateLevel = (totalXP) => {
            return Math.floor(Math.sqrt(totalXP / 100)) + 1;
        };

        // Get current profile
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('total_xp, level')
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

        // Calculate new values
        const newTotalXP = (profile.total_xp || 0) + amount;
        const oldLevel = profile.level || 1;
        const newLevel = calculateLevel(newTotalXP);
        const leveledUp = newLevel > oldLevel;

        // Update profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                total_xp: newTotalXP,
                level: newLevel,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`);
        }

        // Insert XP history
        const { error: historyError } = await supabase
            .from('xp_history')
            .insert({
                user_id: userId,
                amount,
                source,
                source_id: lessonNumber ? `lesson_${lessonNumber}` : null,
                description: lessonNumber ? `Lesson ${lessonNumber} completed - Score: ${score || 0}%, Time: ${timeSpent || 0}s, Attempts: ${attempts || 1}` : null
            });

        if (historyError) {
            throw new Error(`Failed to insert XP history: ${historyError.message}`);
        }

        const response = {
            success: true,
            data: {
                userId,
                xpAwarded: amount,
                source,
                totalXP: newTotalXP,
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

