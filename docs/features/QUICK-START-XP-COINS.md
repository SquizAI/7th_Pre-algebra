# Quick Start: XP and Coins System

## What Was Built

A complete XP and coins rewards system with Supabase backend integration. The system includes:

### Backend (Supabase)
- **SQL Migration**: `/supabase/migrations/007_create_xp_coin_history.sql`
  - `xp_history` table for tracking XP transactions
  - `coin_history` table for tracking coin transactions
  - Database functions for awarding/spending XP and coins
  - Level calculation functions
  - RLS policies for security

### Serverless Functions (Netlify)
- **`/functions/award-xp.js`**: Award XP to users
- **`/functions/award-coins.js`**: Award coins to users
- **`/functions/spend-coins.js`**: Spend coins with balance validation

### Frontend Modules
- **`/js/features/xp-system.js`**: XP calculation and management
- **`/js/features/coin-system.js`**: Coin calculation and management
- **`/js/ui/xp-display.js`**: XP UI components and animations
- **`/js/ui/coin-display.js`**: Coin UI components and animations

### Styling
- **`/css/molecules/rewards.css`**: Complete styling for XP/coin displays, progress bars, and animations

## Setup Instructions

### 1. Run Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard
# Copy contents of 007_create_xp_coin_history.sql
# Run in SQL Editor
```

### 2. Set Environment Variables

Create `.env` file in project root:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Add the same variables in Netlify:
1. Go to Site Settings > Environment Variables
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### 3. Deploy Serverless Functions

```bash
# Functions auto-deploy with Netlify
netlify deploy --prod

# Or commit and push to trigger automatic deployment
git add functions/
git commit -m "Add XP and coins serverless functions"
git push
```

### 4. Include Scripts in HTML

Add to `index.html` in the `<head>` section (before closing `</head>`):

```html
<!-- XP and Coins System -->
<script src="/js/features/xp-system.js"></script>
<script src="/js/features/coin-system.js"></script>
<script src="/js/ui/xp-display.js"></script>
<script src="/js/ui/coin-display.js"></script>
```

Add CSS:

```html
<link rel="stylesheet" href="/css/molecules/rewards.css">
```

## Integration with Game.js

### Update completeLevel() Function

Find the `completeLevel()` method in `/js/core/game.js` and add XP/coin awarding:

```javascript
completeLevel() {
    console.log('=== COMPLETING LEVEL ===');
    const levelInfo = this.currentLevelInfo;

    // Existing mastery check code...
    const hasMastery = /* your existing logic */;

    if (hasMastery) {
        // Calculate rewards based on performance
        const score = (this.correctAnswers / this.currentQuestion) * 100;
        const timeSpent = 300; // Example: track actual time
        const attempts = 1; // Track actual attempts

        // Get streak for bonus
        const streakStatus = window.StreakTracker?.getStreakStatus();
        const streakBonus = Math.min((streakStatus?.currentStreak || 0) * 0.05, 0.5);

        // Calculate XP
        const xpCalc = window.XPSystem.calculateLessonXP(
            score,
            timeSpent,
            attempts,
            streakBonus
        );

        // Calculate Coins
        const coinCalc = window.CoinSystem.calculateLessonCoins(score);

        // Award XP and Coins
        this.awardRewards(levelInfo.id, xpCalc.total, coinCalc.total);

        // Existing code for updating progress...
    }
}
```

### Add awardRewards() Method

Add this new method to `GameController` class:

```javascript
async awardRewards(lessonNumber, xpAmount, coinAmount) {
    try {
        // Get current user
        const { data: { user } } = await window.SupabaseClient.getClient().auth.getUser();

        if (!user) {
            console.warn('No user logged in, skipping rewards');
            return;
        }

        // Award XP
        const xpResult = await window.XPSystem.awardXP(
            user.id,
            xpAmount,
            'lesson_completion',
            `lesson-${lessonNumber}`,
            `Completed Lesson ${lessonNumber}`
        );

        // Award Coins
        const coinResult = await window.CoinSystem.awardCoins(
            user.id,
            coinAmount,
            'lesson_completion',
            `lesson-${lessonNumber}`,
            `Completed Lesson ${lessonNumber}`
        );

        // Show animations
        window.xpDisplay.showXPGainedAnimation(xpAmount);
        window.coinDisplay.showCoinsEarnedAnimation(coinAmount);

        // Handle level up
        if (xpResult.leveledUp) {
            window.xpDisplay.showLevelUpCelebration(xpResult.level);
        }

        console.log('Rewards awarded:', { xp: xpResult, coins: coinResult });
    } catch (error) {
        console.error('Error awarding rewards:', error);
    }
}
```

### Update updatePlayerStats() Method

Update the method to fetch from Supabase:

```javascript
async updatePlayerStats() {
    try {
        const { data: { user } } = await window.SupabaseClient.getClient().auth.getUser();

        if (!user) return;

        // Fetch latest stats from Supabase
        const { data, error } = await window.SupabaseClient.getClient()
            .from('profiles')
            .select('total_xp, level, total_coins')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        // Update UI
        document.getElementById('playerLevel').textContent = data.level;
        document.getElementById('playerXP').textContent = data.total_xp;
        document.getElementById('playerCoins').textContent = data.total_coins;

        // Update XP progress bar
        await window.xpDisplay.updateDisplay(user.id);

    } catch (error) {
        console.error('Error updating player stats:', error);
    }
}
```

## Testing

### Test XP Award in Browser Console

```javascript
// Award XP
await window.XPSystem.awardXP(
    null,  // Uses current user
    150,
    'lesson_completion',
    'test-lesson',
    'Test award'
);

// Check XP progress
const progress = window.XPSystem.getXPProgress(1500);
console.log('Progress:', progress);
```

### Test Coin Award

```javascript
// Award coins
await window.CoinSystem.awardCoins(
    null,
    15,
    'lesson_completion',
    'test-lesson',
    'Test award'
);

// Check balance
const balance = await window.CoinSystem.getCoinsBalance();
console.log('Balance:', balance);
```

### Test Coin Spending

```javascript
// Spend coins
const result = await window.CoinSystem.spendCoins(
    null,
    50,
    'avatar_purchase',
    'avatar-dragon',
    'Bought dragon avatar'
);
console.log('Spend result:', result);
```

## XP Formula Reference

```
Level 1: 0 XP
Level 2: 100 XP (+100)
Level 3: 210 XP (+110)
Level 4: 330 XP (+120)
Level 5: 460 XP (+130)
...
Level N: Previous + (100 + (N-1) * 10)
```

## Coin Formula Reference

```
Coins = floor(score / 10) + perfectBonus

Examples:
100% = 10 + 5 = 15 coins
90% = 9 + 0 = 9 coins
80% = 8 + 0 = 8 coins
75% = 7 + 0 = 7 coins
```

## Troubleshooting

### XP/Coins not saving

**Check:**
1. User is logged in: `await supabase.auth.getUser()`
2. Environment variables are set in Netlify
3. Migration was run successfully
4. Check Netlify function logs for errors

### Level not updating

**Check:**
1. `calculate_level_from_xp` function exists in database
2. XP is being awarded correctly
3. Frontend is fetching latest data

### Animations not showing

**Check:**
1. CSS file is included
2. Console for JavaScript errors
3. Event listeners are set up correctly

## File Checklist

- [x] `/supabase/migrations/007_create_xp_coin_history.sql`
- [x] `/functions/award-xp.js`
- [x] `/functions/award-coins.js`
- [x] `/functions/spend-coins.js`
- [x] `/js/features/xp-system.js`
- [x] `/js/features/coin-system.js`
- [x] `/js/ui/xp-display.js`
- [x] `/js/ui/coin-display.js`
- [x] `/css/molecules/rewards.css`
- [x] `/docs/XP-COINS-SYSTEM.md`
- [x] `/docs/XP-COINS-IMPLEMENTATION.md`

## Next Steps

1. **Run the migration** in Supabase
2. **Set environment variables** in Netlify
3. **Deploy functions** (automatic with Netlify)
4. **Update game.js** with reward integration
5. **Test thoroughly** in development
6. **Deploy to production**

## Support

For detailed documentation, see:
- `/docs/XP-COINS-SYSTEM.md` - Complete system documentation
- `/docs/XP-COINS-IMPLEMENTATION.md` - Implementation guide

For issues:
- Check browser console
- Check Netlify function logs
- Check Supabase logs
- Verify environment variables are set correctly
