/**
 * Netlify Function: Get Student Progress
 *
 * Fetches comprehensive student progress data including:
 * - Profile information
 * - Lesson progress
 * - Achievements
 * - Streaks
 * - XP and coins
 * - Statistics
 */

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Get userId from query parameters
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'userId parameter is required' })
      };
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Fetch progress with lesson details
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select(`
        *,
        lessons (
          lesson_number,
          lesson_topic,
          quarter,
          unit_name,
          standard_code,
          xp_value,
          coin_value
        )
      `)
      .eq('id', userId)
      .order('lesson_number');

    if (progressError) throw progressError;

    // Fetch achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          achievement_id,
          name,
          description,
          badge_icon,
          category,
          rarity,
          xp_reward,
          coin_reward
        )
      `)
      .eq('id', userId)
      .order('earned_at', { ascending: false });

    if (achievementsError) throw achievementsError;

    // Calculate statistics
    const completedLessons = progress.filter(p => p.status === 'completed');
    const stats = {
      lessonsCompleted: completedLessons.length,
      totalLessons: progress.length,
      completionRate: Math.round((completedLessons.length / progress.length) * 100),
      averageScore: calculateAverageScore(completedLessons),
      totalXP: completedLessons.reduce((sum, p) => sum + (p.xp_earned || 0), 0),
      totalCoins: completedLessons.reduce((sum, p) => sum + (p.coins_earned || 0), 0),
      totalTime: completedLessons.reduce((sum, p) => sum + (p.time_spent || 0), 0)
    };

    // Get upcoming lessons (next 3 unlocked but not completed)
    const upcomingLessons = progress
      .filter(p => p.status === 'available' || p.status === 'in_progress')
      .slice(0, 3)
      .map(p => ({
        lessonNumber: p.lesson_number,
        topic: p.lessons?.lesson_topic || 'Pre-Algebra',
        quarter: p.lessons?.quarter || 'Q1',
        date: null // TODO: Match with calendar
      }));

    // Return comprehensive data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        profile,
        progress,
        achievements,
        stats,
        upcomingLessons,
        streakData: {
          currentStreak: profile.current_streak || 0,
          longestStreak: profile.longest_streak || 0,
          lastActivityDate: profile.last_activity_date
        }
      })
    };

  } catch (error) {
    console.error('Error fetching student progress:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch student progress',
        message: error.message
      })
    };
  }
};

/**
 * Calculate average score from completed lessons
 */
function calculateAverageScore(lessons) {
  if (lessons.length === 0) return 0;

  const scoresWithValues = lessons.filter(l => l.score !== null && l.score !== undefined);
  if (scoresWithValues.length === 0) return 0;

  const total = scoresWithValues.reduce((sum, l) => sum + l.score, 0);
  return Math.round(total / scoresWithValues.length);
}
