/**
 * Netlify Function: Check Streak Status
 *
 * GET endpoint to check if a streak is still active
 * Compares last activity date to current date
 * If last B-day was missed → streak should be broken
 *
 * Usage: GET /api/check-streak?userId=default
 */

const fetch = require('node-fetch');

// B-days calendar data (simplified - in production would fetch from external source)
// For now, we'll use a simple calculation based on alternating days
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

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get parameters
    const params = event.queryStringParameters || {};
    const userId = params.userId || 'default';
    const lastActivityDate = params.lastActivityDate; // Format: YYYY-MM-DD
    const currentStreak = parseInt(params.currentStreak) || 0;

    if (!lastActivityDate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing lastActivityDate parameter'
        })
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = new Date(lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    // Check if today is a B-day
    const isBDayToday = isClassDay(today);

    // Get the last B-day before today
    const lastBDay = getLastBDay(today);
    const lastBDayStr = lastBDay ? formatDate(lastBDay) : null;

    // Determine if streak should be broken
    let streakStatus = 'active';
    let shouldBreakStreak = false;
    let message = '';

    if (currentStreak === 0) {
      streakStatus = 'none';
      message = 'No active streak';
    } else if (lastBDayStr && lastActivityDate !== lastBDayStr) {
      // Missed the last B-day
      streakStatus = 'broken';
      shouldBreakStreak = true;
      message = `Streak broken - missed B-day on ${lastBDayStr}`;
    } else if (isBDayToday && lastActivityDate !== formatDate(today)) {
      streakStatus = 'at-risk';
      message = 'Today is a B-day - complete lesson to maintain streak';
    } else {
      streakStatus = 'safe';
      message = 'Streak is safe';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        userId,
        currentStreak,
        streakStatus,
        shouldBreakStreak,
        message,
        lastActivityDate,
        today: formatDate(today),
        isBDayToday,
        lastBDay: lastBDayStr
      })
    };

  } catch (error) {
    console.error('Error checking streak:', error);
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
