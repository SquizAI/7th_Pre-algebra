# XP and Coins System Documentation

## Overview

The XP (Experience Points) and Coins system is a gamified rewards mechanism designed to motivate 7th-grade students as they progress through pre-algebra lessons. The system provides immediate feedback, tracks progress, and celebrates achievements.

## System Architecture

### Core Components

1. **XP System** (`/js/features/xp-system.js`)
   - Manages experience points
   - Calculates levels based on XP
   - Tracks XP history
   - Formula: `level = floor(sqrt(totalXP / 100)) + 1`

2. **Coin System** (`/js/features/coin-system.js`)
   - Manages virtual currency
   - Tracks earnings and spending
   - Handles daily bonuses
   - Future: Shop integration

3. **XP Display** (`/js/ui/xp-display.js`)
   - Visual XP animations
   - Progress bar updates
   - Level-up celebrations
   - Floating XP notifications

4. **Coin Display** (`/js/ui/coin-display.js`)
   - Coin earning animations
   - Balance display
   - Transaction history
   - Daily bonus notifications

5. **Rewards Integration** (`/js/features/rewards-integration.js`)
   - Connects systems to game controller
   - Overrides game methods for seamless integration
   - Syncs progress across systems

## XP System Details

### XP Calculation Formula

```javascript
calculateXP(lessonNumber, score, timeSpent, attempts) {
    base = 50 XP

    // Perfect Score Bonus (100%)
    if (score >= 100) +20 XP

    // Speed Bonus (under 5 minutes)
    if (timeSpent <= 300 seconds) +10 XP

    // First Attempt Bonus
    if (attempts === 1) +15 XP

    total = base + bonuses (max: 95 XP per lesson)
}
```

### Level Calculation

The system uses a square root scaling formula to ensure:
- Early levels are achievable quickly (motivation)
- Later levels require more effort (long-term engagement)

```javascript
Level 1: 0 - 99 XP      (100 XP needed)
Level 2: 100 - 399 XP   (300 XP needed)
Level 3: 400 - 899 XP   (500 XP needed)
Level 4: 900 - 1599 XP  (700 XP needed)
...and so on
```

Formula: `level = floor(sqrt(totalXP / 100)) + 1`

### XP Progress Tracking

```javascript
getXPProgress(totalXP) {
    currentLevel: Current level number
    totalXP: Total accumulated XP
    xpInCurrentLevel: XP earned in current level
    xpNeededForNextLevel: XP needed to reach next level
    progressPercent: 0-100% progress to next level
}
```

## Coin System Details

### Coin Calculation Formula

```javascript
calculateCoins(lessonNumber, score, streakDays) {
    base = 10 coins

    // Perfect Score Bonus
    if (score >= 100) +5 coins

    // Streak Bonus (up to 10 days)
    streakBonus = min(streakDays, 10) * 2 coins

    total = base + bonuses
}
```

### Daily Login Bonus

- **Bonus Amount**: 5 coins
- **Frequency**: Once per day
- **Auto-claimed**: On first page load each day

### Future Coin Uses

1. **Avatar Customization**: Unlock character skins
2. **Power-ups**: Hints, extra time, etc.
3. **Themes**: Custom UI themes
4. **Achievements**: Unlock special badges

## UI Components

### XP Progress Bar

Located in the header, shows:
- Current level
- XP in current level / XP needed for next level
- Animated progress bar (0-100%)
- Shimmer effect on fill

### Floating XP Notifications

When XP is earned:
1. Float up from player stats
2. Show total XP gained
3. Break down bonuses (base, perfect, speed, first attempt)
4. Fade out after 1.5 seconds

### Level Up Celebration

When leveling up:
1. Full-screen modal with gradient background
2. Large level badge with pulse animation
3. Confetti particles
4. Celebration message
5. Sound effect (optional)

### Coin Counter

Located in header:
- Shows current balance
- Animates number changes
- Coin icon indicator

### Daily Bonus Notification

Slides in from right side:
- Gift box icon
- Bonus amount
- Auto-dismisses after 3 seconds

## Integration with Game

### Method Overrides

The `rewards-integration.js` file overrides these game controller methods:

1. **addXP(amount, options)**
   - Calculates XP with breakdown
   - Shows animations
   - Updates displays
   - Handles level-ups

2. **addCoins(amount, options)**
   - Calculates coin bonuses
   - Shows animations
   - Updates balance

3. **updatePlayerStats()**
   - Syncs XP display
   - Syncs coin display
   - Updates progress bars

4. **loadProgress()**
   - Loads XP from XP system
   - Loads coins from coin system
   - Syncs to game state

### Example Usage in Game

```javascript
// When student completes a lesson correctly
gameController.handleCorrectAnswer() {
    // XP is automatically awarded
    const baseXP = 20;
    const streakBonus = this.streak * 5;
    const totalXP = baseXP + streakBonus;

    this.addXP(totalXP); // Uses new XP system

    // Coins are automatically awarded
    const coins = Math.floor(totalXP / 10);
    this.addCoins(coins); // Uses new coin system
}

// For lesson completion with full data
gameController.awardLessonRewards(
    lessonNumber: 1,
    score: 100,
    timeSpent: 240, // seconds
    attempts: 1
);
// Returns: { xp: {...}, coins: {...} }
```

## Data Storage

### LocalStorage Keys

**XP Data:**
- `xp_data_student`: Current XP totals and level
- `xp_history_student`: Last 100 XP transactions

**Coin Data:**
- `coin_balance_student`: Current coin balance
- `coin_history_student`: Last 100 coin transactions
- `last_login_student`: Last login date for daily bonus

### Data Structure

```javascript
// XP Data
{
    totalXP: 350,
    level: 3,
    lastUpdated: "2024-11-13T23:45:00.000Z"
}

// XP History Entry
{
    amount: 50,
    source: "lesson-1",
    timestamp: "2024-11-13T23:45:00.000Z"
}

// Coin History Entry
{
    amount: 10,
    source: "lesson-1",
    type: "earned", // or "spent"
    timestamp: "2024-11-13T23:45:00.000Z"
}
```

## Serverless Functions (Netlify)

### Award XP Endpoint

**URL**: `/.netlify/functions/award-xp`
**Method**: POST

**Request Body:**
```json
{
    "userId": "student123",
    "amount": 50,
    "source": "lesson-1",
    "lessonNumber": 1,
    "score": 100,
    "timeSpent": 240,
    "attempts": 1
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "userId": "student123",
        "xpAwarded": 50,
        "totalXP": 350,
        "level": 3,
        "leveledUp": true
    }
}
```

### Award Coins Endpoint

**URL**: `/.netlify/functions/award-coins`
**Method**: POST

**Request Body:**
```json
{
    "userId": "student123",
    "amount": 10,
    "source": "lesson-1",
    "lessonNumber": 1,
    "score": 100
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "userId": "student123",
        "coinsAwarded": 10,
        "totalCoins": 150
    }
}
```

## Testing

### Test Page

A comprehensive test page is available at `/test-rewards.html`

Features:
- Visual XP/coin displays
- Test buttons for all scenarios
- Real-time stats display
- Event log
- Reset functionality

### Test Scenarios

1. **Basic XP Award**: 50 XP
2. **Perfect Score**: 70 XP (50 + 20 bonus)
3. **Speed Bonus**: 60 XP (50 + 10 bonus)
4. **All Bonuses**: 95 XP (all bonuses combined)
5. **Level Up**: 500 XP to test level-up celebration
6. **Basic Coins**: 10 coins
7. **Coin Perfect**: 15 coins (10 + 5 bonus)
8. **Coin Streak**: Variable based on streak
9. **Daily Bonus**: 5 coins once per day

### Manual Testing Checklist

- [ ] XP awarded correctly for lesson completion
- [ ] Perfect score bonus applied
- [ ] Speed bonus applied (under 5 minutes)
- [ ] First attempt bonus applied
- [ ] XP progress bar updates smoothly
- [ ] Level up celebration triggers
- [ ] Coins awarded correctly
- [ ] Daily bonus claimed once per day
- [ ] Coin balance displays correctly
- [ ] Transaction history tracks properly
- [ ] Animations are smooth and kid-friendly
- [ ] System persists across page refreshes
- [ ] Mobile responsive design works

## CSS Styling

The rewards system uses bright, engaging colors and smooth animations:

### Color Palette

- **XP Bar**: Blue gradient (#1e3a8a to #3b82f6)
- **XP Fill**: Gold gradient (#fbbf24 to #f59e0b)
- **Level Up**: Purple gradient (#667eea to #764ba2)
- **Coins**: Orange gradient (#f59e0b to #d97706)
- **Daily Bonus**: Green gradient (#10b981 to #059669)

### Animations

- **Shimmer Effect**: 2s infinite on XP bar
- **Float Up**: 1.5s for floating notifications
- **Level Badge Pulse**: 2s infinite
- **Particle Float**: 2s on level up
- **Slide In**: 0.5s cubic-bezier for notifications

## Accessibility

### Screen Reader Support

- ARIA live regions for XP/coin updates
- Descriptive labels for all stats
- Keyboard navigation support

### Reduced Motion

Users with `prefers-reduced-motion` set will see:
- No floating animations
- No shimmer effects
- No particle effects
- Instant updates instead of transitions

### High Contrast Mode

- 2px borders added in high contrast mode
- Color contrasts meet WCAG AA standards

## Future Enhancements

### Phase 2 Features

1. **Coin Shop**
   - Avatar customization
   - Power-ups (hints, extra time)
   - UI themes
   - Special effects

2. **XP Multipliers**
   - Streak multipliers
   - Perfect week bonuses
   - Challenge mode XP boost

3. **Leaderboards**
   - Class leaderboards
   - Friend comparisons
   - Weekly challenges

4. **Achievement Integration**
   - Earn coins for achievements
   - XP bonuses for milestone achievements
   - Special badges unlock features

### Phase 3 Features

1. **Supabase Integration**
   - Persistent cloud storage
   - Cross-device sync
   - Parent/teacher dashboards

2. **Social Features**
   - Gift coins to friends
   - XP challenges
   - Collaborative goals

3. **Analytics**
   - XP earning patterns
   - Optimal study time analysis
   - Engagement metrics

## Troubleshooting

### Common Issues

**XP not updating:**
- Check browser console for errors
- Verify XP system loaded: `window.xpSystem`
- Check localStorage: `localStorage.getItem('xp_data_student')`

**Coins not displaying:**
- Verify coin system loaded: `window.coinSystem`
- Check balance: `window.coinSystem.getCoinBalance('student')`

**Animations not showing:**
- Check CSS loaded: `css/molecules/rewards.css`
- Verify display classes loaded: `window.xpDisplay`, `window.coinDisplay`

**Level up not triggering:**
- Check XP threshold calculation
- Verify level-up modal not blocked
- Check console for modal creation errors

### Reset Progress

To reset all XP and coins (for testing):

```javascript
// In browser console
window.xpSystem.resetXP('student');
window.coinSystem.resetCoins('student');
window.xpDisplay.updateDisplay('student');
window.coinDisplay.updateDisplay('student');
```

Or use the test page reset button.

## Code Examples

### Award XP for Lesson Completion

```javascript
// In game controller or lesson completion handler
const lessonNumber = 1;
const score = 100; // percentage
const timeSpent = 240; // seconds
const attempts = 1;

const rewards = gameController.awardLessonRewards(
    lessonNumber,
    score,
    timeSpent,
    attempts
);

console.log('XP earned:', rewards.xp.totalXP);
console.log('Coins earned:', rewards.coins.totalCoins);
```

### Get Current Progress

```javascript
// Get XP progress
const progress = window.xpSystem.getXPProgress(
    window.xpSystem.getXPData('student').totalXP
);

console.log(`Level ${progress.currentLevel}`);
console.log(`${progress.progressPercent}% to next level`);

// Get coin stats
const stats = window.coinSystem.getCoinStats('student');
console.log(`Balance: ${stats.currentBalance} coins`);
console.log(`Earned: ${stats.totalEarned} coins`);
```

### Manual XP Award

```javascript
// Award XP directly (with animation)
window.xpDisplay.awardXP(
    'student',        // userId
    50,               // amount
    'bonus-event',    // source
    { base: 50 }      // breakdown (optional)
);
```

### Show Level Up Manually

```javascript
// Trigger level up celebration
window.xpDisplay.showLevelUpCelebration(5);
```

## File Structure

```
/js
  /features
    xp-system.js              - XP logic and calculations
    coin-system.js            - Coin logic and calculations
    rewards-integration.js    - Game integration
  /ui
    xp-display.js             - XP UI components
    coin-display.js           - Coin UI components

/css
  /molecules
    rewards.css               - XP/coin styling

/functions
  award-xp.js                 - Netlify function for XP
  award-coins.js              - Netlify function for coins

/docs
  XP-COINS-SYSTEM.md          - This documentation

test-rewards.html             - Test page
```

## Support

For questions or issues with the XP/Coins system:
1. Check this documentation
2. Review test page examples
3. Check browser console for errors
4. Review code comments in source files

---

**Version**: 1.0.0
**Last Updated**: November 13, 2024
**Author**: Frontend Development Team
