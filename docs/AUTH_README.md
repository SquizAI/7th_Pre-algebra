# Authentication System Documentation

## Overview

The Equation Quest platform now includes a complete authentication system powered by Supabase. This allows students to:

- Create accounts and sign in
- Save their progress across devices
- Track their learning journey
- Access personalized features
- Maintain privacy and security

## File Structure

```
/auth/
├── login.html          # Login page
├── signup.html         # Registration page
└── profile.html        # User profile management

/js/auth/
├── supabase-client.js  # Supabase client initialization
└── auth-manager.js     # Authentication operations manager

/docs/
├── SUPABASE_SETUP.md   # Setup instructions
└── AUTH_README.md      # This file
```

## Features

### 1. User Registration (signup.html)

- Full name, username, email, and password
- Real-time password strength indicator
- Username validation (3-20 characters, alphanumeric)
- Terms of service acceptance
- Email verification (optional)
- Auto-profile creation

### 2. User Login (login.html)

- Email and password authentication
- "Remember me" functionality
- Password reset via email
- Session persistence
- Auto-redirect if already logged in

### 3. User Profile (profile.html)

- View user stats (level, XP, coins)
- Update profile information
- Change password
- Sign out
- Delete account (with confirmation)

### 4. Session Management

- Automatic session refresh
- localStorage persistence
- Auth state change listeners
- Secure token handling

### 5. Data Synchronization

- Real-time progress sync to database
- Automatic updates every 30 seconds
- Conflict resolution
- Offline capability (localStorage fallback)

## Authentication Flow

### Sign Up Flow

1. User fills out registration form
2. Validation checks:
   - All fields required
   - Username format (3-20 chars, alphanumeric)
   - Password strength (min 8 chars)
   - Passwords match
   - Terms accepted
3. Create auth user in Supabase
4. Create profile in profiles table
5. Send verification email (optional)
6. Redirect to login

### Sign In Flow

1. User enters email and password
2. Supabase authenticates credentials
3. Session token stored in localStorage
4. User profile loaded from database
5. Game state synced with profile data
6. Redirect to main app
7. Display user info in header

### Sign Out Flow

1. User clicks sign out
2. Clear Supabase session
3. Clear localStorage data
4. Redirect to login page

## Security Features

### 1. Row Level Security (RLS)

- Users can only access their own data
- Policies enforced at database level
- No data leakage between users

### 2. Password Security

- Minimum 8 characters required
- Strength indicator guides users
- Passwords hashed by Supabase
- Reset via secure email link

### 3. Session Security

- Automatic token refresh
- Secure token storage
- Session expiration handling
- HTTPS required in production

### 4. Input Validation

- Client-side validation
- Server-side validation via RLS
- SQL injection prevention
- XSS protection

## Integration with Game System

### Data Sync

The auth system automatically syncs with the game controller:

```javascript
// On login, load profile data
const profile = await authManager.getUserProfile(user.id);
gameController.playerLevel = profile.level;
gameController.playerXP = profile.xp;
gameController.playerCoins = profile.coins;

// Every 30 seconds, save progress
await authManager.updateUserProfile(user.id, {
  level: gameController.playerLevel,
  xp: gameController.playerXP,
  coins: gameController.playerCoins,
  current_world: gameController.currentWorld,
  current_lesson: gameController.currentLevel
});
```

### Progress Tracking

Track lesson completion and mastery:

```javascript
// Insert lesson progress
await supabase.from('lesson_progress').insert({
  user_id: user.id,
  lesson_id: 1,
  world_id: 1,
  completed: true,
  score: 95,
  mastery_level: 0.95
});
```

### Activity Logging

Log user activities for analytics:

```javascript
// Log activity
await supabase.from('activity_log').insert({
  user_id: user.id,
  activity_type: 'lesson_complete',
  activity_data: {
    lesson_id: 1,
    score: 95,
    time_spent: 300
  }
});
```

## API Reference

### AuthManager Class

#### Methods

**signUp(email, password, username, fullName)**
- Creates a new user account
- Returns: `{ success, user, message, error }`

**signIn(email, password)**
- Authenticates existing user
- Returns: `{ success, user, message, error }`

**signOut()**
- Signs out current user
- Returns: `{ success, message, error }`

**getCurrentUser()**
- Gets currently authenticated user
- Returns: User object or null

**isAuthenticated()**
- Checks if user is logged in
- Returns: boolean

**getUserProfile(userId)**
- Fetches user profile from database
- Returns: Profile object or null

**updateUserProfile(userId, updates)**
- Updates user profile in database
- Returns: `{ success, profile, error }`

**updatePassword(newPassword)**
- Changes user password
- Returns: `{ success, message, error }`

**resetPassword(email)**
- Sends password reset email
- Returns: `{ success, message, error }`

**deleteAccount()**
- Deletes user account (irreversible)
- Returns: `{ success, message, error }`

**onAuthStateChange(callback)**
- Registers auth state listener
- Callback params: (event, user)

## Environment Variables

### Required Variables

```javascript
window.ENV = {
  SUPABASE_URL: 'https://xxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key'
};
```

### Setup

1. Local: Create `env-inject.js` from `env-inject.example.js`
2. Netlify: Add environment variables in dashboard
3. Never commit `env-inject.js` to version control

## Database Schema

### profiles

Stores user profile and game progress:

```sql
{
  id: UUID (primary key),
  username: TEXT (unique),
  full_name: TEXT,
  email: TEXT,
  level: INTEGER,
  xp: INTEGER,
  coins: INTEGER,
  current_world: INTEGER,
  current_lesson: INTEGER,
  last_active: TIMESTAMP,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### lesson_progress

Tracks individual lesson completion:

```sql
{
  id: UUID (primary key),
  user_id: UUID (foreign key),
  lesson_id: INTEGER,
  world_id: INTEGER,
  completed: BOOLEAN,
  score: INTEGER,
  attempts: INTEGER,
  mastery_level: DECIMAL,
  completed_at: TIMESTAMP,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### activity_log

Logs all user activities:

```sql
{
  id: UUID (primary key),
  user_id: UUID (foreign key),
  activity_type: TEXT,
  activity_data: JSONB,
  created_at: TIMESTAMP
}
```

## Testing

### Manual Testing Checklist

- [ ] Can create new account
- [ ] Email validation works
- [ ] Password strength indicator works
- [ ] Can log in with credentials
- [ ] Session persists on refresh
- [ ] Profile data displays correctly
- [ ] Can update profile
- [ ] Can change password
- [ ] Can reset password via email
- [ ] Can sign out
- [ ] Progress syncs to database
- [ ] Can't access other users' data

### Browser Compatibility

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Error Handling

### Common Errors

**"Invalid login credentials"**
- Incorrect email or password
- Account not verified (if verification enabled)

**"Username already exists"**
- Choose a different username
- Check for typos

**"Network error"**
- Check internet connection
- Verify Supabase project is active

**"Session expired"**
- User will be redirected to login
- Previous progress saved automatically

## Guest Mode (Optional)

To allow users to try the app without signing up:

1. Comment out redirect in `index.html`:
```javascript
// Line 767
// window.location.href = 'auth/login.html';
```

2. Add guest mode indicator in UI
3. Prompt to sign up to save progress

## Future Enhancements

Potential additions:
- [ ] Social login (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Parental controls
- [ ] Teacher/student accounts
- [ ] Classroom integration
- [ ] Export progress data
- [ ] Gamification badges
- [ ] Leaderboards
- [ ] Friend system

## Troubleshooting

### Can't log in
1. Check email/password spelling
2. Verify account exists
3. Check if email verified (if required)
4. Try password reset

### Session not saving
1. Check if localStorage enabled
2. Clear browser cache
3. Try incognito mode
4. Check browser console for errors

### Profile not updating
1. Check network connection
2. Verify database policies
3. Check browser console
4. Try signing out and back in

## Support

For authentication issues:
1. Check browser console for errors
2. Review [SUPABASE_SETUP.md](/Users/mattysquarzoni/Documents/7th-PreAlgebra/docs/SUPABASE_SETUP.md)
3. Check Supabase dashboard logs
4. Contact support

## License

This authentication system is part of the Equation Quest platform.
