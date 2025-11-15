/**
 * Netlify Serverless Function: Get User Stats
 *
 * PURPOSE: Retrieve complete user profile including XP, coins, streaks, level
 *
 * USAGE: GET /.netlify/functions/get-user-stats?userId=<uuid>
 *
 * RESPONSE: {
 *   success: true,
 *   profile: {
 *     id: string,
 *     username: string,
 *     level: number,
 *     xp: number,
 *     coins: number,
 *     currentStreak: number,
 *     longestStreak: number,
 *     lastActivityDate: string,
 *     totalLessonsCompleted: number,
 *     averageScore: number,
 *     achievementsCount: number
 *   }
 * }
 */

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use GET.' })
    };
  }

  try {
    // Get userId from query parameters
    const params = event.queryStringParameters || {};
    const userId = params.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameter: userId' })
      };
    }

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'User not found',
          message: profileError.message
        })
      };
    }

    // Fetch lesson progress stats
    const { data: lessonStats, error: statsError } = await supabase
      .from('lesson_progress')
      .select('status, score')
      .eq('id', userId);

    if (statsError) {
      console.error('Error fetching lesson stats:', statsError);
    }

    // Calculate stats
    const completedLessons = lessonStats?.filter(l => l.status === 'completed') || [];
    const totalLessonsCompleted = completedLessons.length;
    const averageScore = completedLessons.length > 0
      ? Math.round(completedLessons.reduce((sum, l) => sum + (l.score || 0), 0) / completedLessons.length)
      : 0;

    // Fetch achievements count
    const { count: achievementsCount, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('id', userId);

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
    }

    // Return complete profile
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        profile: {
          id: profile.id,
          username: profile.username,
          fullName: profile.full_name,
          level: profile.level || 1,
          xp: profile.xp || 0,
          coins: profile.coins || 0,
          currentStreak: profile.current_streak || 0,
          longestStreak: profile.longest_streak || 0,
          lastActivityDate: profile.last_activity_date,
          totalLessonsCompleted,
          averageScore,
          achievementsCount: achievementsCount || 0,
          createdAt: profile.created_at
        }
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
