/**
 * Coin System Module
 *
 * Manages virtual currency (coins) for purchases and rewards.
 * Integrates with Supabase for backend storage and history tracking.
 *
 * Features:
 * - Dynamic coin calculation based on performance
 * - Coin earning from multiple sources
 * - Coin spending with balance validation
 * - Transaction history tracking
 * - Daily bonuses and streak rewards
 */

class CoinSystem {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.listeners = new Set();

    // Coin earning rates
    this.coinRates = {
      lesson_completion: 10, // Base coins per lesson
      achievement: 25,
      daily_bonus: 5,
      perfect_score: 5,
      streak_reward: 2 // Per day of streak
    };

    this.init();
  }

  async init() {
    // Get Supabase client
    this.supabase = window.SupabaseClient?.getClient();
    if (!this.supabase) {
      console.warn('Coin System: Supabase not initialized');
      return;
    }

    // Get current user
    const { data: { user } } = await this.supabase.auth.getUser();
    this.currentUser = user;

    console.log('Coin System initialized');
  }

  /**
   * Calculate coins for a lesson based on performance
   * Formula: 10 coins for 100%, 9 for 90%, 8 for 80%, etc.
   * @param {number} lessonScore - Score percentage (0-100)
   * @returns {Object} Coin breakdown
   */
  calculateLessonCoins(lessonScore) {
    // Base coins based on score (0-10 coins)
    const scoreCoins = Math.floor(lessonScore / 10);

    // Perfect score bonus
    const perfectBonus = lessonScore === 100 ? this.coinRates.perfect_score : 0;

    const totalCoins = Math.max(1, scoreCoins + perfectBonus); // Minimum 1 coin

    return {
      total: totalCoins,
      breakdown: {
        score: scoreCoins,
        perfect: perfectBonus
      }
    };
  }

  /**
   * Award coins to a user through the serverless function
   * @param {string} userId - User ID (optional, uses current user if not provided)
   * @param {number} amount - Amount of coins to award
   * @param {string} source - Source of coins (lesson_completion, achievement, etc.)
   * @param {string} sourceId - Optional ID of the source
   * @param {string} description - Optional description
   * @returns {Promise<Object>} Result with new coin balance
   */
  async awardCoins(userId, amount, source, sourceId = null, description = null) {
    try {
      // Use current user if no userId provided
      if (!userId && this.currentUser) {
        userId = this.currentUser.id;
      }

      if (!userId) {
        throw new Error('No user ID provided and no user logged in');
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Coin amount must be positive');
      }

      // Call serverless function
      const response = await fetch('/.netlify/functions/award-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          amount,
          source,
          sourceId,
          description
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to award coins');
      }

      const result = await response.json();

      // Notify listeners of coin award
      this.notifyListeners('coins_awarded', result);

      console.log(`✅ Awarded ${amount} coins from ${source}. New balance: ${result.newCoins}`);

      return result;
    } catch (error) {
      console.error('Error awarding coins:', error);
      throw error;
    }
  }

  /**
   * Spend coins through the serverless function
   * @param {string} userId - User ID (optional, uses current user if not provided)
   * @param {number} amount - Amount of coins to spend
   * @param {string} item - Item being purchased
   * @param {string} itemId - Optional item ID
   * @param {string} description - Optional description
   * @returns {Promise<Object>} Result with success status and remaining balance
   */
  async spendCoins(userId, amount, item, itemId = null, description = null) {
    try {
      // Use current user if no userId provided
      if (!userId && this.currentUser) {
        userId = this.currentUser.id;
      }

      if (!userId) {
        throw new Error('No user ID provided and no user logged in');
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Coin amount must be positive');
      }

      // Call serverless function
      const response = await fetch('/.netlify/functions/spend-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          amount,
          item,
          itemId,
          description
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to spend coins');
      }

      const result = await response.json();

      // Notify listeners of coin spending
      if (result.success) {
        this.notifyListeners('coins_spent', result);
        console.log(`✅ Spent ${amount} coins on ${item}. Remaining: ${result.remainingCoins}`);
      } else {
        console.warn(`❌ Failed to spend coins: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('Error spending coins:', error);
      throw error;
    }
  }

  /**
   * Get current coin balance for a user
   * @param {string} userId - User ID (optional, uses current user if not provided)
   * @returns {Promise<number>} Current coin balance
   */
  async getCoinsBalance(userId = null) {
    try {
      if (!userId && this.currentUser) {
        userId = this.currentUser.id;
      }

      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .select('total_coins')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data?.total_coins || 0;
    } catch (error) {
      console.error('Error fetching coin balance:', error);
      return 0;
    }
  }

  /**
   * Get coin history for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of records to retrieve
   * @returns {Promise<Array>} Coin history
   */
  async getCoinHistory(userId = null, limit = 50) {
    try {
      if (!userId && this.currentUser) {
        userId = this.currentUser.id;
      }

      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await this.supabase
        .from('coin_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching coin history:', error);
      return [];
    }
  }

  /**
   * Register a listener for coin events
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in coin listener:', error);
      }
    });
  }

  /**
   * Get formatted coin string with source emoji
   * @param {string} source - Coin source
   * @param {number} amount - Coin amount
   * @returns {string} Formatted string
   */
  formatCoinGain(source, amount) {
    const sourceEmojis = {
      lesson_completion: '📚',
      achievement: '🏆',
      daily_bonus: '🎁',
      perfect_score: '⭐',
      streak_reward: '🔥'
    };

    const emoji = sourceEmojis[source] || '💰';
    return `${emoji} +${amount} coins`;
  }
}

// Initialize and export
if (typeof window !== 'undefined') {
  window.coinSystem = new CoinSystem();
  console.log('Coin System loaded');
}

// Export for Node.js (for serverless functions)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CoinSystem;
}
