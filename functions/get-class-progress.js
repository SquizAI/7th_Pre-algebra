/**
 * Netlify Function: Get Class Progress (Teacher View)
 *
 * Fetches class-wide data including:
 * - All student profiles
 * - Aggregate statistics
 * - Class averages
 * - Struggling students
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
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all student profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('username');

    if (profilesError) throw profilesError;

    // Fetch progress for each student
    const studentsWithProgress = await Promise.all(
      profiles.map(async (profile) => {
        const { data: progress } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', profile.id);

        const completedLessons = progress.filter(p => p.status === 'completed');

        return {
          id: profile.id,
          username: profile.username,
          fullName: profile.full_name,
          email: profile.email,
          level: profile.level,
          totalXP: profile.total_xp,
          totalCoins: profile.total_coins,
          currentStreak: profile.current_streak,
          longestStreak: profile.longest_streak,
          lastActivityDate: profile.last_activity_date,
          lessonsCompleted: completedLessons.length,
          completionRate: Math.round((completedLessons.length / 87) * 100),
          averageScore: calculateAverageScore(completedLessons),
          totalTime: completedLessons.reduce((sum, p) => sum + (p.time_spent || 0), 0)
        };
      })
    );

    // Calculate class statistics
    const classStats = calculateClassStats(studentsWithProgress);

    // Identify struggling students
    const strugglingStudents = identifyStrugglingStudents(studentsWithProgress);

    // Return data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        students: studentsWithProgress,
        classStats,
        strugglingStudents
      })
    };

  } catch (error) {
    console.error('Error fetching class progress:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch class progress',
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

/**
 * Calculate class-wide statistics
 */
function calculateClassStats(students) {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      avgCompletion: 0,
      avgScore: 0,
      activeToday: 0,
      totalLessonsCompleted: 0,
      avgStreak: 0
    };
  }

  const today = new Date().toISOString().split('T')[0];

  return {
    totalStudents: students.length,
    avgCompletion: Math.round(
      students.reduce((sum, s) => sum + s.completionRate, 0) / students.length
    ),
    avgScore: Math.round(
      students.reduce((sum, s) => sum + s.averageScore, 0) / students.length
    ),
    activeToday: students.filter(s =>
      s.lastActivityDate && s.lastActivityDate.split('T')[0] === today
    ).length,
    totalLessonsCompleted: students.reduce((sum, s) => sum + s.lessonsCompleted, 0),
    avgStreak: Math.round(
      students.reduce((sum, s) => sum + s.currentStreak, 0) / students.length
    )
  };
}

/**
 * Identify students needing attention
 */
function identifyStrugglingStudents(students) {
  return students.filter(student => {
    // Low score (< 60%)
    const lowScore = student.averageScore < 60;

    // Inactive for 7+ days
    const lastActive = student.lastActivityDate ? new Date(student.lastActivityDate) : null;
    const daysSinceActive = lastActive
      ? Math.floor((new Date() - lastActive) / (1000 * 60 * 60 * 24))
      : 999;
    const inactive = daysSinceActive >= 7;

    // Behind schedule
    const behindSchedule = student.completionRate < 20; // Less than 20% complete

    return lowScore || inactive || behindSchedule;
  }).map(student => ({
    ...student,
    reasons: getStrugglingReasons(student)
  }));
}

/**
 * Get reasons why student is struggling
 */
function getStrugglingReasons(student) {
  const reasons = [];

  if (student.averageScore < 60) {
    reasons.push(`Low average score (${student.averageScore}%)`);
  }

  const lastActive = student.lastActivityDate ? new Date(student.lastActivityDate) : null;
  const daysSinceActive = lastActive
    ? Math.floor((new Date() - lastActive) / (1000 * 60 * 60 * 24))
    : 999;

  if (daysSinceActive >= 7) {
    reasons.push(`Inactive for ${daysSinceActive} days`);
  }

  if (student.completionRate < 20) {
    reasons.push(`Behind schedule (${student.completionRate}% complete)`);
  }

  return reasons;
}
