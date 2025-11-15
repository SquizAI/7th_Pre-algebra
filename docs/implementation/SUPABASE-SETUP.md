# SUPABASE SETUP GUIDE

## Overview

This guide covers the complete Supabase backend setup for the platform.

**What is Supabase?**
- Open-source Firebase alternative
- PostgreSQL database
- Built-in authentication
- Row Level Security (RLS)
- Real-time subscriptions
- RESTful API auto-generated

---

## Project Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project"
4. Fill in:
   - **Name**: `7th-grade-pre-algebra`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to Miami (e.g., `us-east-1`)
5. Click "Create new project"
6. Wait ~2 minutes for provisioning

### 2. Get API Credentials

Navigate to **Settings > API**:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (NEVER expose to client!)
```

Save these in Netlify environment variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## Database Schema

### Overview

```
users (Supabase Auth)
  ↓
user_profiles
  ↓
user_progress ← lessons
  ↓
achievements_earned ← achievements
  ↓
daily_streaks
```

---

## Table Definitions

### 1. user_profiles

Stores additional student information beyond Supabase Auth.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  grade_level INTEGER DEFAULT 8,
  current_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  total_coins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. lessons

Stores lesson metadata (read-only reference data).

```sql
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  lesson_number INTEGER UNIQUE NOT NULL,
  lesson_name TEXT NOT NULL,
  standard_code TEXT NOT NULL,
  topic TEXT NOT NULL,
  video_id TEXT,
  unit_number INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_assessment BOOLEAN DEFAULT FALSE,
  scheduled_date DATE,
  password_protected BOOLEAN DEFAULT FALSE,
  unlock_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read lessons (public data)
CREATE POLICY "Lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (TRUE);

-- Sample data
INSERT INTO lessons (lesson_number, lesson_name, standard_code, topic, video_id, unit_number, difficulty, scheduled_date)
VALUES
  (1, 'Welcome to Algebra Castle', 'MA.8.AR.2.1', 'Two-Step Equations', '0ackz7dJSYY', 1, 'easy', '2025-09-04'),
  (2, 'Two-Step Mastery', 'MA.8.AR.2.1', 'Two-Step Equations', '0ackz7dJSYY', 1, 'easy', '2025-09-08'),
  (3, 'Two-Step Review Checkpoint', 'MA.8.AR.2.1', 'Two-Step Equations', '0ackz7dJSYY', 1, 'medium', '2025-09-10');
  -- ... 84 more lessons
```

---

### 3. user_progress

Tracks student progress through lessons.

```sql
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_number INTEGER REFERENCES lessons(lesson_number),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')),

  -- Attempt tracking
  attempts INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,

  -- Performance metrics
  mastery_percentage DECIMAL(5,2) DEFAULT 0.00,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_attempted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Rewards earned
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,

  -- Metadata
  time_spent_seconds INTEGER DEFAULT 0,
  difficulty_level TEXT DEFAULT 'medium',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one row per user per lesson
  UNIQUE(user_id, lesson_number)
);

-- Indexes for performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_number ON user_progress(lesson_number);
CREATE INDEX idx_user_progress_status ON user_progress(status);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update mastery percentage
CREATE OR REPLACE FUNCTION calculate_mastery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_questions > 0 THEN
    NEW.mastery_percentage = (NEW.correct_answers::DECIMAL / NEW.total_questions::DECIMAL) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mastery_percentage
  BEFORE INSERT OR UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION calculate_mastery();
```

---

### 4. achievements

Reference table for all possible achievements.

```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  achievement_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji or icon class
  category TEXT CHECK (category IN ('streak', 'completion', 'mastery', 'topic')),

  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  coins_reward INTEGER DEFAULT 0,

  -- Unlock criteria (stored as JSONB for flexibility)
  unlock_criteria JSONB NOT NULL,

  -- Display order
  display_order INTEGER,
  is_secret BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (TRUE);

-- Sample data
INSERT INTO achievements (achievement_key, name, description, icon, category, xp_reward, coins_reward, unlock_criteria, display_order)
VALUES
  ('week-warrior', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 50, 20, '{"streak_days": 7}', 1),
  ('two-week-wonder', 'Two Week Wonder', 'Maintain a 14-day streak', '🔥', 'streak', 100, 50, '{"streak_days": 14}', 2),
  ('first-steps', 'First Steps', 'Complete your first lesson', '👣', 'completion', 10, 0, '{"lessons_completed": 1}', 3),
  ('perfect-practice', 'Perfect Practice', 'Get 5/5 on any lesson', '⭐', 'mastery', 25, 0, '{"perfect_scores": 1}', 4),
  ('two-step-wizard', 'Two-Step Wizard', 'Master two-step equations', '🧙', 'topic', 50, 0, '{"topic": "two-step", "mastery_avg": 80}', 5);
  -- ... more achievements
```

---

### 5. achievements_earned

Tracks which achievements each user has unlocked.

```sql
CREATE TABLE achievements_earned (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure each achievement earned only once per user
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_achievements_earned_user_id ON achievements_earned(user_id);

-- Enable RLS
ALTER TABLE achievements_earned ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own earned achievements"
  ON achievements_earned FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own earned achievements"
  ON achievements_earned FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 6. daily_streaks

Tracks daily practice streaks.

```sql
CREATE TABLE daily_streaks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_count INTEGER DEFAULT 0,
  last_activity_date DATE,
  longest_streak INTEGER DEFAULT 0,
  total_practice_days INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One streak record per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own streak"
  ON daily_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON daily_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON daily_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_daily_streaks_updated_at
  BEFORE UPDATE ON daily_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 7. equation_attempts (optional - for detailed analytics)

Stores individual equation attempts for detailed analytics.

```sql
CREATE TABLE equation_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_number INTEGER REFERENCES lessons(lesson_number),

  -- Equation details
  equation_display TEXT NOT NULL,
  equation_type TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  student_answer TEXT,

  -- Result
  is_correct BOOLEAN NOT NULL,

  -- Timing
  time_spent_seconds INTEGER,
  hints_used INTEGER DEFAULT 0,

  -- Difficulty
  difficulty_level TEXT,

  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_equation_attempts_user_id ON equation_attempts(user_id);
CREATE INDEX idx_equation_attempts_lesson ON equation_attempts(lesson_number);

-- Enable RLS
ALTER TABLE equation_attempts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own equation attempts"
  ON equation_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equation attempts"
  ON equation_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Row Level Security (RLS)

**Why RLS?**
- Ensures students can ONLY access their own data
- Security enforced at database level (not just application)
- Prevents malicious users from accessing other students' progress

**Key Pattern**:
```sql
-- SELECT policy
CREATE POLICY "policy_name"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "policy_name"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "policy_name"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id);
```

**What is `auth.uid()`?**
- Returns the UUID of the currently authenticated user
- Automatically set by Supabase Auth
- `null` if user is not logged in

---

## Authentication Setup

### Email/Password Auth

Enable in Supabase Dashboard:
1. Go to **Authentication > Providers**
2. Enable **Email**
3. Configure:
   - Confirm email: Optional (set to false for easy student signup)
   - Email templates: Customize signup/reset emails

### Sign Up Flow

```javascript
// Client-side code
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Sign up
async function signUp(email, password, firstName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
    return null;
  }

  // Create profile
  await supabase
    .from('user_profiles')
    .insert({
      id: data.user.id,
      first_name: firstName
    });

  // Initialize streak
  await supabase
    .from('daily_streaks')
    .insert({
      user_id: data.user.id,
      streak_count: 0
    });

  return data;
}
```

### Sign In Flow

```javascript
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Login error:', error);
    return null;
  }

  return data;
}
```

### Get Current User

```javascript
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

### Sign Out

```javascript
async function signOut() {
  await supabase.auth.signOut();
}
```

---

## Supabase Client Integration

### Install Supabase JS

```bash
npm install @supabase/supabase-js
```

### Create Client Module

```javascript
// /js/utils/supabase-client.js

import { createClient } from '@supabase/supabase-js';

// These should be in environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://xxxxx.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGc...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateProgress(userId, lessonNumber, progressData) {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      lesson_number: lessonNumber,
      ...progressData,
      last_attempted_at: new Date().toISOString()
    });

  return { data, error };
}

export async function getStreak(userId) {
  const { data, error } = await supabase
    .from('daily_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function updateStreak(userId, streakData) {
  const { data, error } = await supabase
    .from('daily_streaks')
    .update(streakData)
    .eq('user_id', userId);

  return { data, error };
}

export async function getAchievements(userId) {
  const { data, error } = await supabase
    .from('achievements_earned')
    .select('*, achievements(*)')
    .eq('user_id', userId);

  return { data, error };
}

export async function earnAchievement(userId, achievementId) {
  const { data, error } = await supabase
    .from('achievements_earned')
    .insert({
      user_id: userId,
      achievement_id: achievementId
    });

  return { data, error };
}
```

---

## Database Functions (Advanced)

### Function: Get User Stats

```sql
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_lessons_completed BIGINT,
  average_mastery DECIMAL,
  current_streak INTEGER,
  total_xp INTEGER,
  total_coins INTEGER,
  achievements_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as total_lessons_completed,
    AVG(up.mastery_percentage) as average_mastery,
    COALESCE(ds.streak_count, 0) as current_streak,
    COALESCE(prof.current_xp, 0) as total_xp,
    COALESCE(prof.total_coins, 0) as total_coins,
    COUNT(DISTINCT ae.id) as achievements_count
  FROM user_profiles prof
  LEFT JOIN user_progress up ON prof.id = up.user_id
  LEFT JOIN daily_streaks ds ON prof.id = ds.user_id
  LEFT JOIN achievements_earned ae ON prof.id = ae.user_id
  WHERE prof.id = p_user_id
  GROUP BY prof.id, ds.streak_count, prof.current_xp, prof.total_coins;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Usage:
```javascript
const { data, error } = await supabase
  .rpc('get_user_stats', { p_user_id: user.id });
```

---

## Environment Variables

Add to Netlify:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

Add to local `.env` file (DO NOT commit!):

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Migration Strategy

### Phase 1: Parallel Run
1. Keep localStorage working
2. Add Supabase alongside
3. Write to both
4. Read from Supabase, fallback to localStorage

### Phase 2: Supabase Primary
1. Read from Supabase only
2. Migrate localStorage data for existing users
3. Remove localStorage fallbacks

### Phase 3: Clean Up
1. Remove all localStorage code
2. Rely entirely on Supabase

---

## Testing Checklist

- [ ] User can sign up
- [ ] User can sign in
- [ ] User can sign out
- [ ] User profile created on signup
- [ ] Streak initialized on signup
- [ ] User can complete a lesson
- [ ] Progress saved to database
- [ ] XP/coins updated correctly
- [ ] Streak updated on lesson completion
- [ ] Achievements unlock correctly
- [ ] User can only see own data (RLS working)
- [ ] Data persists across sessions
- [ ] Password reset works

---

## Next Steps

Read these docs next:
1. **BUILD-GUIDE.md** - How to implement features using this database
2. **TESTING-GUIDE.md** - How to test database integration
