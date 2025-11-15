/**
 * Netlify Function: Update Streak
 *
 * POST endpoint called when a lesson is completed
 * Checks if this is the first lesson of the day
 * Updates current_streak and longest_streak
 * Records entry in daily_streaks history
 *
 * Usage: POST /api/update-streak
 * Body: { userId, date, lessonNumber }
 */

const isClassDay = (date) => {
  // Sept 3, 2025 was Day 1-A (not a class day)
  // Sept 4, 2025 was Day 1-B (first class day)
  const firstClassDay = new Date('2025-09-04');
  const daysDiff = Math.floor((date - firstClassDay) / (1000 * 60 * 60 * 24));

  // Every even day difference is a B-day
  return daysDiff >= 0 && daysDiff % 2 === 0;
};

const getLastBDay = (fromDate) => {
  let checkDate = new Date(fromDate);
  checkDate.setDate(checkDate.getDate() - 1);

  // Look back up to 30 days for the last B-day
  for (let i = 0; i < 30; i++) {
    if (isClassDay(checkDate)) {
      return checkDate;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return null;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Streak milestones for bonus rewards
const MILESTONES = [3, 7, 14, 30, 60, 100];

const MILESTONE_REWARDS = {
  3: { xp: 50, coins: 10, message: "3-day streak! You're on fire!" },
  7: { xp: 100, coins: 25, message: "One week streak! Amazing dedication!" },
  14: { xp: 200, coins: 50, message: "Two weeks! You're unstoppable!" },
  30: { xp: 500, coins: 100, message: "30-day streak! Legendary!" },
  60: { xp: 1000, coins: 250, message: "60 days! You're a math master!" },
  100: { xp: 2500, coins: 500, message: "100 DAYS! Absolute legend!" }
};

const checkMilestone = (oldStreak, newStreak) => {
  return MILESTONES.find(m => oldStreak < m && newStreak >= m) || null;
};

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
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

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const {
      userId = 'default',
      date,
      lessonNumber,
      currentStreak = 0,
      longestStreak = 0,
      lastActivityDate = null
    } = body;

    if (!lessonNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing lessonNumber'
        })
      };
    }

    // Use provided date or current date
    const completionDate = date ? new Date(date) : new Date();
    completionDate.setHours(0, 0, 0, 0);
    const dateStr = formatDate(completionDate);

    // Check if already completed today
    if (lastActivityDate === dateStr) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          streakUpdated: false,
          message: 'Already completed lesson today',
          currentStreak,
          longestStreak
        })
      };
    }

    // Check if this is a B-day
    if (!isClassDay(completionDate)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Not a class day (B-day)',
          message: 'Streak only increments on B-days'
        })
      };
    }

    // Check if streak should continue or reset
    const lastBDay = getLastBDay(completionDate);
    const lastBDayStr = lastBDay ? formatDate(lastBDay) : null;
    const shouldContinueStreak = lastActivityDate === lastBDayStr;

    let newStreakCount;
    let streakBroken = false;

    if (shouldContinueStreak) {
      // Continue the streak
      newStreakCount = currentStreak + 1;
    } else {
      // Streak broken or starting fresh
      if (currentStreak > 0) {
        streakBroken = true;
      }
      newStreakCount = 1;
    }

    // Update longest streak if needed
    const newLongestStreak = Math.max(longestStreak, newStreakCount);

    // Check for milestone
    const milestone = checkMilestone(currentStreak, newStreakCount);
    const bonus = milestone ? MILESTONE_REWARDS[milestone] : null;

    // Prepare response
    const response = {
      success: true,
      streakUpdated: true,
      currentStreak: newStreakCount,
      previousStreak: currentStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: dateStr,
      streakBroken,
      milestone,
      bonus,
      message: milestone
        ? `${milestone}-day milestone reached! ${bonus.message}`
        : streakBroken
        ? `Streak reset. Starting fresh at day 1.`
        : `Streak continued! Now at ${newStreakCount} days.`
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error updating streak:', error);
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
