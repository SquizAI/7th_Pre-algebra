/**
 * Netlify Function: Award Achievement
 *
 * POST /api/award-achievement
 * Award an achievement to a user
 *
 * Body:
 * {
 *   userId: string,
 *   achievementId: string,
 *   eventData: object (optional)
 * }
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check if Supabase is configured
  if (!supabase) {
    console.log('⚠️ Supabase not configured - using local storage mode');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Local storage mode - achievement tracked locally',
        localMode: true
      })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { userId, achievementId, eventData } = body;

    // Validate input
    if (!userId || !achievementId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: userId and achievementId'
        })
      };
    }

    console.log(`🏆 Awarding achievement: ${achievementId} to user: ${userId}`);

    // Check if achievement already exists
    const { data: existing, error: checkError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error checking achievement:', checkError);
      throw checkError;
    }

    // If already exists, return early
    if (existing) {
      console.log('Achievement already earned');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          alreadyEarned: true,
          achievement: existing,
          message: 'Achievement already earned'
        })
      };
    }

    // Load achievement definitions to get XP reward
    const achievements = require('../data/achievements.json');
    const achievement = achievements.achievements.find(a => a.id === achievementId);

    if (!achievement) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Achievement not found'
        })
      };
    }

    // Insert achievement record
    const { data: newAchievement, error: insertError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
        xp_awarded: achievement.xp_reward,
        event_data: eventData || {}
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting achievement:', insertError);
      throw insertError;
    }

    // Award bonus XP to user
    const { error: xpError } = await supabase.rpc('add_user_xp', {
      p_user_id: userId,
      p_xp_amount: achievement.xp_reward,
      p_source: 'achievement',
      p_source_id: achievementId
    });

    if (xpError) {
      console.error('Error awarding XP:', xpError);
      // Don't fail the whole operation if XP update fails
    }

    console.log(`✅ Achievement awarded: ${achievement.name} (+${achievement.xp_reward} XP)`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        achievement: {
          ...achievement,
          unlocked_at: newAchievement.unlocked_at,
          xp_awarded: achievement.xp_reward
        },
        message: `Achievement unlocked: ${achievement.name}`
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
