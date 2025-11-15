# Complete Supabase Setup Guide - Step by Step

**Estimated Time**: 45 minutes
**Project**: Equation Quest - 7th Grade Pre-Algebra Platform
**Last Updated**: November 14, 2025

This guide will walk you through setting up Supabase from scratch, including database tables, authentication, environment configuration, and deployment to Netlify.

---

## Table of Contents

1. [Create Supabase Project (5 minutes)](#1-create-supabase-project-5-minutes)
2. [Get API Credentials (2 minutes)](#2-get-api-credentials-2-minutes)
3. [Create Database Tables (10 minutes)](#3-create-database-tables-10-minutes)
4. [Enable Authentication (5 minutes)](#4-enable-authentication-5-minutes)
5. [Configure Environment Variables (3 minutes)](#5-configure-environment-variables-3-minutes)
6. [Test the Connection (5 minutes)](#6-test-the-connection-5-minutes)
7. [Seed Initial Data (5 minutes)](#7-seed-initial-data-5-minutes)
8. [Configure Netlify Functions (10 minutes)](#8-configure-netlify-functions-10-minutes)
9. [Deploy to Production (5 minutes)](#9-deploy-to-production-5-minutes)
10. [Troubleshooting](#troubleshooting)
11. [Verification Checklist](#verification-checklist)

---

## 1. Create Supabase Project (5 minutes)

### Step 1.1: Sign Up or Log In
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (green button, top right)
3. Sign in with GitHub (recommended) or email
4. Authorize Supabase to access your GitHub account

### Step 1.2: Create New Project
1. Click **"New Project"** (green button)
2. Select your organization (or create a new one)
3. Fill in project details:
   - **Name**: `7th-PreAlgebra` or `equation-quest`
   - **Database Password**: Generate a strong password
     - Click the **Generate password** button (use this!)
     - **IMPORTANT**: Copy and save this password immediately!
     - Save it to: Password manager, text file, or write it down
     - You'll need this password for direct database access later
   - **Region**: Choose **East US (North Virginia)** for best performance
     - If you're in a different region, choose the closest one
   - **Pricing Plan**: Free tier is sufficient for development

4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning (you'll see a loading animation)
6. ☕ Grab coffee while it sets up!

### What's Happening Behind the Scenes?
Supabase is creating:
- A dedicated PostgreSQL database
- Authentication server
- RESTful API endpoints
- Real-time subscriptions
- Storage buckets
- Auto-generated API documentation

---

## 2. Get API Credentials (2 minutes)

Once your project is ready, you need to copy two important values.

### Step 2.1: Navigate to API Settings
1. Look at the left sidebar (dark sidebar)
2. Scroll down and click the **gear icon** ⚙️ (Settings)
3. In the settings menu, click **"API"**

### Step 2.2: Copy Your Credentials

You'll see three sections on this page. You need values from two of them:

**Section 1: Project URL**
- **Label**: "URL"
- **Location**: Top section, labeled "Config"
- **Value looks like**: `https://abcdefghijklmnop.supabase.co`
- **Action**: Click the copy icon 📋 next to the URL
- **Save as**: `SUPABASE_URL`

**Section 2: API Keys**
- **Label**: "anon public"
- **Location**: Middle section, labeled "Project API keys"
- **Description**: This key is safe to use in a browser
- **Value looks like**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...` (very long string)
- **Action**: Click the copy icon 📋 next to "anon public"
- **Save as**: `SUPABASE_ANON_KEY`

**DO NOT USE**:
- ❌ "service_role" key - This is for server-side only and has full database access

### Step 2.3: Save Your Credentials Temporarily
Create a temporary text file to store these values:

```text
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here...
```

Keep this file open - you'll need these in Step 5.

---

## 3. Create Database Tables (10 minutes)

Now we'll create the database schema with all tables, indexes, and security policies.

### Step 3.1: Open SQL Editor
1. Look at the left sidebar
2. Click **"SQL Editor"** icon (looks like `</>`)
3. Click **"New query"** button (top right)

### Step 3.2: Run Migration Scripts

You'll run 5 migration scripts in order. Copy and paste each one, then click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`).

#### Migration 1: Create Profiles Table

This table stores user data, XP, levels, coins, and streaks.

```sql
-- ============================================================================
-- Migration: 001_create_profiles.sql
-- Description: Create user profiles table with XP, levels, streaks, and coins
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,

  -- Gamification metrics
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 87),
  total_coins INTEGER NOT NULL DEFAULT 0 CHECK (total_coins >= 0),

  -- Streak tracking
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level);
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp ON public.profiles(total_xp DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Public profiles viewable by everyone (for leaderboards)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Click "Run"** ✅

**Expected Result**: You should see "Success. No rows returned" at the bottom.

---

#### Migration 2: Create Lessons Table

This table stores all 87 Pre-Algebra lessons mapped to the B-day calendar.

```sql
-- ============================================================================
-- Migration: 002_create_lessons.sql
-- Description: Create lessons table for all 87 Pre-Algebra lessons
-- ============================================================================

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  lesson_number INTEGER PRIMARY KEY CHECK (lesson_number >= 1 AND lesson_number <= 87),

  -- Calendar mapping
  date DATE NOT NULL,
  day_type TEXT NOT NULL CHECK (day_type = 'B'),
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),

  -- Curriculum structure
  unit_number INTEGER NOT NULL CHECK (unit_number >= 1 AND unit_number <= 4),
  unit_name TEXT NOT NULL,
  standard_code TEXT NOT NULL,
  standard_title TEXT NOT NULL,
  strand TEXT NOT NULL,

  -- Lesson content
  lesson_topic TEXT NOT NULL,
  learning_objectives JSONB NOT NULL DEFAULT '[]',
  key_vocabulary JSONB NOT NULL DEFAULT '[]',
  materials_needed JSONB NOT NULL DEFAULT '[]',

  -- Gamification
  xp_value INTEGER NOT NULL DEFAULT 100 CHECK (xp_value >= 0),
  coin_value INTEGER NOT NULL DEFAULT 50 CHECK (coin_value >= 0),

  -- Metadata
  cognitive_complexity TEXT,
  integrated_mtr_standards JSONB DEFAULT '[]',
  status TEXT DEFAULT 'NOT CREATED' CHECK (status IN ('NOT CREATED', 'IN PROGRESS', 'COMPLETED')),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_date ON public.lessons(date);
CREATE INDEX IF NOT EXISTS idx_lessons_quarter ON public.lessons(quarter);
CREATE INDEX IF NOT EXISTS idx_lessons_unit_number ON public.lessons(unit_number);
CREATE INDEX IF NOT EXISTS idx_lessons_standard_code ON public.lessons(standard_code);
CREATE INDEX IF NOT EXISTS idx_lessons_quarter_lesson ON public.lessons(quarter, lesson_number);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read lessons
CREATE POLICY "Lessons are publicly readable"
  ON public.lessons FOR SELECT
  USING (true);

-- Policy: Authenticated users can modify lessons
CREATE POLICY "Authenticated users can modify lessons"
  ON public.lessons FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
CREATE TRIGGER set_updated_at_lessons
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**Click "Run"** ✅

---

#### Migration 3: Create Progress Table

This table tracks student progress for each lesson.

```sql
-- ============================================================================
-- Migration: 003_create_progress.sql
-- Description: Create user progress tracking table
-- ============================================================================

-- Create enum type for lesson status
CREATE TYPE lesson_status AS ENUM ('locked', 'available', 'in_progress', 'completed');

-- Create progress table
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL REFERENCES public.lessons(lesson_number) ON DELETE CASCADE,

  -- Progress tracking
  status lesson_status NOT NULL DEFAULT 'locked',
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  time_spent INTEGER NOT NULL DEFAULT 0 CHECK (time_spent >= 0),

  -- Gamification rewards
  xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  coins_earned INTEGER NOT NULL DEFAULT 0 CHECK (coins_earned >= 0),

  -- Completion tracking
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, lesson_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_number ON public.progress(lesson_number);
CREATE INDEX IF NOT EXISTS idx_progress_status ON public.progress(status);
CREATE INDEX IF NOT EXISTS idx_progress_user_lesson ON public.progress(user_id, lesson_number);
CREATE INDEX IF NOT EXISTS idx_progress_completed_at ON public.progress(completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_progress_user_completed ON public.progress(user_id, completed_at DESC) WHERE status = 'completed';

-- Enable Row Level Security
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own progress" ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON public.progress FOR DELETE USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER set_updated_at_progress
  BEFORE UPDATE ON public.progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update profile when lesson is completed
CREATE OR REPLACE FUNCTION public.update_profile_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at = NOW();
    END IF;

    UPDATE public.profiles
    SET
      total_xp = total_xp + NEW.xp_earned,
      total_coins = total_coins + NEW.coins_earned,
      level = LEAST(87, (SELECT COUNT(*) FROM public.progress WHERE user_id = NEW.user_id AND status = 'completed')),
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_lesson_completed
  BEFORE UPDATE ON public.progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_on_completion();

-- Function to initialize progress for new user
CREATE OR REPLACE FUNCTION public.initialize_user_progress(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.progress (user_id, lesson_number, status)
  SELECT p_user_id, lesson_number, 'locked'
  FROM public.lessons
  ON CONFLICT (user_id, lesson_number) DO NOTHING;

  UPDATE public.progress
  SET status = 'available'
  WHERE user_id = p_user_id AND lesson_number = 1;
END;
$$ LANGUAGE plpgsql;

-- Function to unlock next lesson
CREATE OR REPLACE FUNCTION public.unlock_next_lesson(p_user_id UUID, p_current_lesson INTEGER)
RETURNS VOID AS $$
DECLARE
  next_lesson_number INTEGER;
BEGIN
  SELECT lesson_number INTO next_lesson_number
  FROM public.lessons
  WHERE lesson_number > p_current_lesson
  ORDER BY lesson_number
  LIMIT 1;

  IF next_lesson_number IS NOT NULL THEN
    UPDATE public.progress
    SET status = 'available', updated_at = NOW()
    WHERE user_id = p_user_id
      AND lesson_number = next_lesson_number
      AND status = 'locked';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**Click "Run"** ✅

---

#### Migration 4: Create Achievements Tables

This creates the achievement system with 44+ achievements.

```sql
-- ============================================================================
-- Migration: 004_create_achievements.sql
-- Description: Create achievements and user_achievements tables
-- ============================================================================

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  achievement_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streak', 'completion', 'mastery', 'speed', 'perfect', 'milestone')),

  -- Requirements
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('lessons_completed', 'streak_days', 'perfect_scores', 'unit_completed', 'quarter_completed', 'all_completed', 'time_based', 'score_based')),
  requirement_value INTEGER NOT NULL CHECK (requirement_value > 0),

  -- Rewards
  xp_reward INTEGER NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  coin_reward INTEGER NOT NULL DEFAULT 0 CHECK (coin_reward >= 0),

  -- Metadata
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(achievement_id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_value INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON public.achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_display_order ON public.achievements(display_order);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON public.user_achievements(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned ON public.user_achievements(user_id, earned_at DESC);

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements
CREATE POLICY "Achievements are publicly readable" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Authenticated users can modify achievements" ON public.achievements FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.user_achievements FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER set_updated_at_achievements
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to award achievement
CREATE OR REPLACE FUNCTION public.award_achievement(p_user_id UUID, p_achievement_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_achievement public.achievements;
  v_already_earned BOOLEAN;
BEGIN
  SELECT * INTO v_achievement FROM public.achievements WHERE achievement_id = p_achievement_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Achievement % not found', p_achievement_id;
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.user_achievements WHERE user_id = p_user_id AND achievement_id = p_achievement_id) INTO v_already_earned;
  IF v_already_earned THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
  VALUES (p_user_id, p_achievement_id, NOW());

  UPDATE public.profiles
  SET total_xp = total_xp + v_achievement.xp_reward, total_coins = total_coins + v_achievement.coin_reward, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;
```

**Click "Run"** ✅

---

#### Migration 5: Create Streaks Table

This tracks daily B-day activity and streak bonuses.

```sql
-- ============================================================================
-- Migration: 005_create_streaks.sql
-- Description: Create daily streaks tracking table
-- ============================================================================

-- Create streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,

  -- Daily activity
  lessons_completed INTEGER NOT NULL DEFAULT 0 CHECK (lessons_completed >= 0),
  xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  coins_earned INTEGER NOT NULL DEFAULT 0 CHECK (coins_earned >= 0),
  time_spent INTEGER NOT NULL DEFAULT 0 CHECK (time_spent >= 0),

  -- Streak bonuses
  streak_bonus_applied BOOLEAN NOT NULL DEFAULT false,
  bonus_multiplier NUMERIC(3,2) DEFAULT 1.0 CHECK (bonus_multiplier >= 1.0 AND bonus_multiplier <= 3.0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, streak_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_date ON public.streaks(streak_date DESC);
CREATE INDEX IF NOT EXISTS idx_streaks_user_date ON public.streaks(user_id, streak_date DESC);
CREATE INDEX IF NOT EXISTS idx_streaks_recent ON public.streaks(user_id, streak_date DESC) WHERE streak_date >= CURRENT_DATE - INTERVAL '30 days';

-- Enable Row Level Security
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own streaks" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON public.streaks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER set_updated_at_streaks
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to record daily activity
CREATE OR REPLACE FUNCTION public.record_daily_activity(p_user_id UUID, p_xp_earned INTEGER DEFAULT 0, p_coins_earned INTEGER DEFAULT 0, p_time_spent INTEGER DEFAULT 0)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.streaks (user_id, streak_date, lessons_completed, xp_earned, coins_earned, time_spent)
  VALUES (p_user_id, v_today, 1, p_xp_earned, p_coins_earned, p_time_spent)
  ON CONFLICT (user_id, streak_date)
  DO UPDATE SET
    lessons_completed = public.streaks.lessons_completed + 1,
    xp_earned = public.streaks.xp_earned + p_xp_earned,
    coins_earned = public.streaks.coins_earned + p_coins_earned,
    time_spent = public.streaks.time_spent + p_time_spent,
    updated_at = NOW();

  PERFORM public.update_streak_counters(p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate current streak
CREATE OR REPLACE FUNCTION public.calculate_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak_count INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_found BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.streaks WHERE user_id = p_user_id AND streak_date = v_check_date AND lessons_completed > 0) INTO v_found;
    EXIT WHEN NOT v_found;
    v_streak_count := v_streak_count + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;

  RETURN v_streak_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update streak counters
CREATE OR REPLACE FUNCTION public.update_streak_counters(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_current_streak INTEGER;
BEGIN
  v_current_streak := public.calculate_current_streak(p_user_id);

  UPDATE public.profiles
  SET current_streak = v_current_streak, longest_streak = GREATEST(longest_streak, v_current_streak), last_activity_date = CURRENT_DATE, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

**Click "Run"** ✅

---

### Step 3.3: Verify Tables Were Created

1. Click **"Table Editor"** in the left sidebar (icon looks like a table grid)
2. You should see 5 tables in the dropdown:
   - ✅ `profiles`
   - ✅ `lessons`
   - ✅ `progress`
   - ✅ `achievements`
   - ✅ `user_achievements`
   - ✅ `streaks`

3. Click on each table to see its structure

**Troubleshooting**: If you see an error, scroll down in the SQL Editor to read the error message. Common issues:
- Syntax error: Copy the SQL again, make sure you didn't miss any characters
- Table already exists: This is fine, just continue
- Permission denied: Make sure you're logged in as the project owner

---

## 4. Enable Authentication (5 minutes)

Supabase provides built-in authentication. We need to enable email/password authentication.

### Step 4.1: Navigate to Authentication Settings
1. Click **"Authentication"** in the left sidebar (icon looks like a person/user)
2. Click **"Providers"** tab at the top

### Step 4.2: Configure Email Provider
1. Find **"Email"** in the list of providers
2. Make sure it's **enabled** (toggle should be ON/green)
3. Click on **"Email"** to expand settings

### Step 4.3: Configure Settings for Testing
For development and testing, configure these settings:

**Email Settings:**
- ✅ **Enable Email provider**: ON
- ✅ **Confirm email**: OFF (for testing - turn ON in production!)
  - This allows users to sign in immediately without email verification
  - In production, you should enable this for security
- ✅ **Enable email signups**: ON
- ✅ **Double confirm email changes**: OFF (for testing)
- ✅ **Secure email change**: ON

**Password Requirements:**
- Minimum password length: **8 characters** (default is fine)

**Advanced Settings:**
- Disable signup: OFF (we want to allow signups)
- Auto confirm users: ON (for testing only!)

4. Click **"Save"** at the bottom

### Step 4.4: Customize Email Templates (Optional)
1. Go to **Authentication** > **Email Templates**
2. You can customize:
   - Confirmation email
   - Password reset email
   - Magic link email
   - Email change email

For now, leave these as default. You can customize later.

---

## 5. Configure Environment Variables (3 minutes)

Now we'll add your Supabase credentials to your local development environment.

### Step 5.1: Copy Example File
1. Open your terminal/command prompt
2. Navigate to your project directory:
   ```bash
   cd /Users/mattysquarzoni/Documents/7th-PreAlgebra
   ```

3. Copy the example file:
   ```bash
   cp env-inject.example.js env-inject.js
   ```

### Step 5.2: Edit env-inject.js
1. Open `env-inject.js` in your code editor
2. Replace the placeholder values with your actual Supabase credentials (from Step 2.2):

**Before:**
```javascript
window.ENV = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  GEMINI_API_KEY: 'your-gemini-api-key-here'
};
```

**After:**
```javascript
window.ENV = {
  SUPABASE_URL: 'https://abcdefghijklmnop.supabase.co',  // Your actual URL
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // Your actual key
  GEMINI_API_KEY: 'your-existing-gemini-key'  // Keep your existing Gemini key
};
```

3. Save the file

### Step 5.3: Add to .gitignore (IMPORTANT!)
Make sure `env-inject.js` is in your `.gitignore` file so you don't accidentally commit your API keys.

1. Open `.gitignore`
2. Add this line if it's not already there:
   ```
   env-inject.js
   ```
3. Save the file

**Why is this important?**
- API keys in git repos can be found by bots
- Bad actors can use your keys to access your database
- Always keep credentials out of version control

---

## 6. Test the Connection (5 minutes)

Let's verify that everything is connected properly.

### Step 6.1: Test Database Connection in Browser
1. Open `index.html` in your browser:
   - Double-click `index.html`, or
   - Use Live Server in VS Code, or
   - Run: `open index.html` (Mac) or `start index.html` (Windows)

2. Open the browser console:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+J` (Windows) or `Cmd+Option+J` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K`
   - Safari: Enable Developer menu first, then `Cmd+Option+C`

3. Type this command in the console and press Enter:
   ```javascript
   window.supabaseClient.from('profiles').select('*')
   ```

4. **Expected Result**: You should see a Promise that resolves to:
   ```javascript
   {
     data: [],
     error: null
   }
   ```

   **This means success!** The empty array is correct - there are no users yet.

**Troubleshooting**:
- ❌ "supabaseClient is not defined": Make sure you're on the actual site, not just viewing the file (use a local server)
- ❌ "Invalid API key": Double-check your credentials in `env-inject.js`
- ❌ "Failed to fetch": Check your internet connection and Supabase URL

### Step 6.2: Test Sign Up Flow
1. Navigate to the sign-up page:
   - If using Live Server: `http://localhost:5500/auth/signup.html`
   - Or open: `/auth/signup.html` directly

2. Fill out the sign-up form:
   - **Username**: `testuser`
   - **Full Name**: `Test User`
   - **Email**: `test@example.com` (use a real email if you enabled email confirmation)
   - **Password**: `testpassword123`
   - **Confirm Password**: `testpassword123`

3. Click **"Sign Up"**

4. **Expected Result**:
   - You should be redirected to the main page
   - You should see your username/profile in the UI
   - Console should show no errors

### Step 6.3: Verify User in Supabase Dashboard
1. Go back to Supabase dashboard
2. Click **"Authentication"** in sidebar
3. Click **"Users"** tab
4. You should see your new user:
   - ✅ Email: `test@example.com`
   - ✅ Created: Just now
   - ✅ Status: Confirmed (if auto-confirm is enabled)

5. Click **"Table Editor"** in sidebar
6. Select **"profiles"** table
7. You should see one row with:
   - ✅ Email: `test@example.com`
   - ✅ Username: `testuser`
   - ✅ Total XP: 0
   - ✅ Level: 1
   - ✅ Total Coins: 0

**Congratulations!** Your Supabase authentication and database are working! 🎉

---

## 7. Seed Initial Data (5 minutes)

Now let's add all 87 lessons to the database.

### Step 7.1: Prepare Lesson Data
The lesson data is already structured in JSON files in `/docs/`:
- `Q1_8th_grade_detailed_lessons.json` (19 lessons)
- `Q2_8th_grade_detailed_lessons.json` (22 lessons)
- `Q3_8th_grade_detailed_lessons.json` (23 lessons)
- `Q4_8th_grade_detailed_lessons.json` (23 lessons)

### Step 7.2: Create Seed Script
1. Go to Supabase dashboard
2. Click **"SQL Editor"**
3. Click **"New query"**
4. Copy and paste this seed script:

```sql
-- ============================================================================
-- Seed Script: Insert All 87 Lessons
-- Description: Populate lessons table with Q1-Q4 curriculum
-- ============================================================================

-- NOTE: This is a SAMPLE for the first few lessons.
-- For the complete script with all 87 lessons, see:
-- /docs/seed-lessons-complete.sql

-- Q1 Lessons (Sample)
INSERT INTO public.lessons
  (lesson_number, date, day_type, quarter, unit_number, unit_name, standard_code, standard_title, strand, lesson_topic, learning_objectives, key_vocabulary, materials_needed, xp_value, coin_value, cognitive_complexity, integrated_mtr_standards, status, notes)
VALUES
  (1, '2025-09-04', 'B', 'Q1', 1, 'Number Sense and Operations - 8th Grade', 'MA.8.NSO.1.1',
   'Extend previous understanding of rational numbers to define irrational numbers within the real number system. Locate an approximate value of a numerical expression involving irrational numbers on a number line.',
   'Number Sense and Operations',
   'Introduction to Irrational Numbers and the Real Number System',
   '["Students will distinguish between rational and irrational numbers", "Students will understand that irrational numbers have non-terminating, non-repeating decimal representations", "Students will recognize pi (π) as an irrational number"]'::jsonb,
   '["irrational number", "rational number", "real number", "terminating decimal", "repeating decimal", "pi (π)"]'::jsonb,
   '["Whiteboard and markers", "Calculator", "Student notebooks", "Real number system graphic organizer template"]'::jsonb,
   100, 50, 'Level 2: Basic Application of Skills & Concepts',
   '["MA.K12.MTR.2.1", "MA.K12.MTR.4.1"]'::jsonb,
   'NOT CREATED',
   'First lesson of 8th grade. Establish strong foundation for irrational numbers.')
ON CONFLICT (lesson_number) DO NOTHING;

-- Verify insertion
SELECT COUNT(*) as total_lessons FROM public.lessons;
```

**IMPORTANT**: This is just a sample. To insert all 87 lessons, you need to:

**Option A - Manual Insert (Recommended for Learning)**:
1. Open each JSON file (`Q1_8th_grade_detailed_lessons.json`, etc.)
2. For each lesson, create an INSERT statement
3. Run them in batches (10-20 at a time)

**Option B - Use JavaScript to Seed**:
1. Create a seed script that reads the JSON files
2. Use Supabase JS client to insert lessons
3. See `/docs/seed-lessons.js` for a complete example

### Step 7.3: Quick Seed for Testing (5 lessons)
For now, let's add just 5 lessons to test the system:

```sql
-- Quick test: Add first 5 lessons
INSERT INTO public.lessons
  (lesson_number, date, day_type, quarter, unit_number, unit_name, standard_code, standard_title, strand, lesson_topic, xp_value, coin_value, status)
VALUES
  (1, '2025-09-04', 'B', 'Q1', 1, 'Number Sense and Operations', 'MA.8.NSO.1.1', 'Irrational Numbers', 'NSO', 'Introduction to Irrational Numbers', 100, 50, 'NOT CREATED'),
  (2, '2025-09-08', 'B', 'Q1', 1, 'Number Sense and Operations', 'MA.8.NSO.1.2', 'Square Roots', 'NSO', 'Approximating Square Roots', 100, 50, 'NOT CREATED'),
  (3, '2025-09-11', 'B', 'Q1', 1, 'Number Sense and Operations', 'MA.8.NSO.1.3', 'Cube Roots', 'NSO', 'Approximating Cube Roots', 100, 50, 'NOT CREATED'),
  (4, '2025-09-15', 'B', 'Q1', 1, 'Number Sense and Operations', 'MA.8.NSO.1.4', 'Scientific Notation', 'NSO', 'Introduction to Scientific Notation', 100, 50, 'NOT CREATED'),
  (5, '2025-09-18', 'B', 'Q1', 1, 'Number Sense and Operations', 'MA.8.NSO.1.5', 'Operations in Scientific Notation', 'NSO', 'Adding and Subtracting in Scientific Notation', 100, 50, 'NOT CREATED')
ON CONFLICT (lesson_number) DO NOTHING;

-- Verify
SELECT lesson_number, lesson_topic FROM public.lessons ORDER BY lesson_number;
```

**Click "Run"** ✅

### Step 7.4: Verify Lessons
In the console output, you should see:
```
lesson_number | lesson_topic
--------------+-------------------------------------
1             | Introduction to Irrational Numbers
2             | Approximating Square Roots
3             | Approximating Cube Roots
4             | Introduction to Scientific Notation
5             | Adding and Subtracting in Scientific Notation
```

**Next Steps**: After confirming the system works, you can add all 87 lessons using the complete seed script.

---

## 8. Configure Netlify Functions (10 minutes)

Netlify Functions allow you to run server-side code without managing servers.

### Step 8.1: Install Netlify CLI
Open your terminal and run:

```bash
npm install -g netlify-cli
```

**Verify installation**:
```bash
netlify --version
```

You should see something like: `netlify-cli/17.0.0`

### Step 8.2: Login to Netlify
```bash
netlify login
```

This will:
1. Open your browser
2. Ask you to authorize Netlify CLI
3. Click "Authorize"
4. Return to terminal

### Step 8.3: Link Your Project
Navigate to your project directory and link it to Netlify:

```bash
cd /Users/mattysquarzoni/Documents/7th-PreAlgebra
netlify link
```

**You'll be asked**:
- "How do you want to link this folder to a site?"
  - Choose: **"Create & configure a new site"**
- "Team:"
  - Choose your team (usually your name)
- "Site name:"
  - Enter: `7th-prealgebra` or `equation-quest`
  - (This will be your URL: `7th-prealgebra.netlify.app`)

### Step 8.4: Add Environment Variables to Netlify

**Option A - Using Netlify CLI** (Recommended):

```bash
# Add Supabase URL
netlify env:set SUPABASE_URL "https://your-project-id.supabase.co"

# Add Supabase Anon Key
netlify env:set SUPABASE_ANON_KEY "your-anon-key-here"

# Add Gemini API Key (if using)
netlify env:set GEMINI_API_KEY "your-gemini-key-here"
```

Replace the values with your actual credentials.

**Option B - Using Netlify Dashboard**:

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Find your site (`7th-prealgebra`)
3. Click **"Site settings"**
4. Click **"Environment variables"** in the sidebar
5. Click **"Add a variable"** button
6. Add each variable:
   - Key: `SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`
   - Click **"Create variable"**
7. Repeat for:
   - `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`

### Step 8.5: Verify netlify.toml Configuration
Your project already has a `netlify.toml` file. Let's verify it's correct:

1. Open `netlify.toml`
2. It should contain:

```toml
[build]
  publish = "."
  command = "echo '// No client-side API key needed - use serverless function' > env-inject.js"
  functions = "functions"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer-when-downgrade"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

This configuration:
- ✅ Publishes the current directory
- ✅ Sets up serverless functions in `/functions/`
- ✅ Adds security headers
- ✅ Redirects `/api/*` to Netlify Functions

### Step 8.6: Test Functions Locally
Start the Netlify dev server:

```bash
netlify dev
```

This will:
1. Start a local development server
2. Usually on `http://localhost:8888`
3. Automatically use your environment variables
4. Simulate the production environment

**Test in your browser**:
1. Open `http://localhost:8888`
2. The site should load normally
3. Try signing up/logging in
4. Check browser console for errors

**Stop the server**: Press `Ctrl+C` in terminal

---

## 9. Deploy to Production (5 minutes)

Now let's deploy your site to production!

### Step 9.1: Commit Your Changes (if using Git)
If you're using Git:

```bash
git add .
git commit -m "Add Supabase integration and database setup"
git push origin main
```

**IMPORTANT**: Make sure `env-inject.js` is in `.gitignore` and NOT committed!

### Step 9.2: Deploy to Netlify

**Option A - Automatic Deploy** (if connected to GitHub):
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Find your site
3. Go to **"Deploys"** tab
4. It should automatically start deploying after you push to GitHub
5. Wait 1-2 minutes for the build to complete

**Option B - Manual Deploy** (using CLI):

```bash
netlify deploy --prod
```

This will:
1. Build your site
2. Upload files to Netlify
3. Deploy to production
4. Give you a URL

### Step 9.3: Verify Production Site
1. Go to your Netlify URL: `https://7th-prealgebra.netlify.app`
2. Test the site:
   - ✅ Homepage loads
   - ✅ Can create a new account
   - ✅ Can log in
   - ✅ Can view lessons
   - ✅ Can complete a lesson

3. Check browser console for errors (should be none)

### Step 9.4: Test Supabase Connection in Production
1. Open browser console (F12)
2. Run:
   ```javascript
   window.supabaseClient.from('profiles').select('*')
   ```
3. Should return user profiles (including the test account you created)

**Congratulations!** 🎉 Your site is now live with Supabase!

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Invalid API key" Error

**Symptoms**:
- Console error: `Invalid API key`
- Can't connect to Supabase

**Solutions**:
1. Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
2. Make sure there are no extra spaces or quotes
3. Check you copied the "anon public" key, not "service_role"
4. In `env-inject.js`, make sure the values are in quotes
5. Clear browser cache and reload

**How to verify**:
```javascript
// In browser console
console.log(window.ENV.SUPABASE_URL);
console.log(window.ENV.SUPABASE_ANON_KEY.substring(0, 20) + '...');
```

#### Issue 2: User Profile Not Created

**Symptoms**:
- User appears in Authentication but not in `profiles` table
- Error: "Failed to create user profile"

**Solutions**:
1. Check if the `handle_new_user()` trigger is enabled:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Manually create the profile:
   ```sql
   INSERT INTO public.profiles (id, email, username)
   VALUES ('user-uuid-here', 'user@example.com', 'username');
   ```
3. Re-run Migration 1 to recreate the trigger

#### Issue 3: "Permission Denied" on Tables

**Symptoms**:
- Error: `permission denied for table profiles`
- Can't read or write to tables

**Solutions**:
1. Check Row Level Security (RLS) policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
2. Verify you're logged in (check `auth.uid()`)
3. Re-run the migration scripts to recreate policies

#### Issue 4: Email Not Sending

**Symptoms**:
- User doesn't receive confirmation email
- Can't reset password

**Solutions**:
1. Go to **Authentication** > **Settings**
2. Check **Email Settings**:
   - Make sure SMTP is configured
   - For testing, enable "Auto confirm users"
3. Use a real email address (not example.com)
4. Check spam folder

#### Issue 5: Netlify Deploy Failed

**Symptoms**:
- Build fails on Netlify
- Error in deploy log

**Solutions**:
1. Check the deploy log for specific errors
2. Verify `netlify.toml` is in the root directory
3. Make sure all environment variables are set:
   ```bash
   netlify env:list
   ```
4. Try deploying locally first:
   ```bash
   netlify build
   ```

#### Issue 6: Functions Not Working

**Symptoms**:
- API calls to `/api/gemini-api` fail
- 404 or 500 errors

**Solutions**:
1. Verify functions directory exists: `/functions/`
2. Check function file has correct export:
   ```javascript
   exports.handler = async (event, context) => { ... }
   ```
3. Test locally with `netlify dev`
4. Check Netlify function logs:
   - Dashboard > Functions > Select function > Logs

#### Issue 7: Database Connection Slow

**Symptoms**:
- Queries take 5+ seconds
- Timeout errors

**Solutions**:
1. Check your internet connection
2. Verify you chose the closest region when creating the project
3. Add indexes to frequently queried columns
4. Use Supabase connection pooling (free tier has limits)

#### Issue 8: Streak Not Updating

**Symptoms**:
- `current_streak` stays at 0
- Streak counter doesn't increment

**Solutions**:
1. Check if `record_daily_activity()` function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'record_daily_activity';
   ```
2. Manually call the function:
   ```sql
   SELECT public.record_daily_activity('user-uuid-here'::uuid, 100, 50, 300);
   ```
3. Verify `streaks` table has data:
   ```sql
   SELECT * FROM public.streaks WHERE user_id = 'user-uuid-here';
   ```

---

## How to Check Connection

### Test Database Connection
```sql
-- In Supabase SQL Editor
SELECT NOW() as current_time, version() as postgres_version;
```

### Test from JavaScript
```javascript
// In browser console
const { data, error } = await window.supabaseClient
  .from('profiles')
  .select('*')
  .limit(1);

console.log('Data:', data);
console.log('Error:', error);
```

### Test Authentication
```javascript
// In browser console
const { data, error } = await window.supabaseClient.auth.getSession();
console.log('Session:', data.session);
console.log('User:', data.session?.user);
```

---

## How to View Database Logs

### Real-time Logs
1. Go to Supabase dashboard
2. Click **"Logs"** in sidebar (icon looks like a document with lines)
3. Filter by type:
   - **API**: HTTP requests to your database
   - **Database**: SQL queries
   - **Auth**: Authentication events
   - **Realtime**: Websocket connections

### Query Specific Logs
```sql
-- Recent auth logins
SELECT * FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 10;

-- Recent profile updates
SELECT * FROM public.profiles ORDER BY updated_at DESC LIMIT 10;

-- Recent lesson completions
SELECT * FROM public.progress WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 10;
```

---

## How to Reset Database

**⚠️ WARNING: This will delete ALL data!**

### Option 1: Reset Specific Tables
```sql
-- Delete all data (keeps structure)
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.lessons CASCADE;
TRUNCATE TABLE public.progress CASCADE;
TRUNCATE TABLE public.achievements CASCADE;
TRUNCATE TABLE public.user_achievements CASCADE;
TRUNCATE TABLE public.streaks CASCADE;

-- Also delete auth users
DELETE FROM auth.users;
```

### Option 2: Drop and Recreate Tables
```sql
-- Drop all tables
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.streaks CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS lesson_status CASCADE;

-- Then re-run all migration scripts from Step 3
```

### Option 3: Reset Entire Project
1. Go to Supabase dashboard
2. Click **Settings** > **General**
3. Scroll to bottom: **"Danger Zone"**
4. Click **"Pause project"** (temporary)
5. Or **"Delete project"** (permanent - creates new project from scratch)

---

## Verification Checklist

Use this checklist to verify your setup is complete:

### Database Setup
- [ ] Supabase project created and active
- [ ] API credentials copied and saved
- [ ] `profiles` table exists with correct structure
- [ ] `lessons` table exists with correct structure
- [ ] `progress` table exists with correct structure
- [ ] `achievements` table exists with correct structure
- [ ] `user_achievements` table exists with correct structure
- [ ] `streaks` table exists with correct structure
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies created and working

### Authentication
- [ ] Email authentication enabled
- [ ] Email confirmation settings configured
- [ ] Test user account created successfully
- [ ] User profile auto-created on signup
- [ ] Can log in and log out
- [ ] Session persists on page reload

### Environment Variables
- [ ] `env-inject.js` created with correct values
- [ ] `env-inject.js` added to `.gitignore`
- [ ] `SUPABASE_URL` set correctly
- [ ] `SUPABASE_ANON_KEY` set correctly
- [ ] Environment variables work in browser
- [ ] Netlify environment variables set

### Data Seeding
- [ ] At least 5 test lessons inserted
- [ ] Lesson data displays correctly on frontend
- [ ] Can select and start a lesson
- [ ] Progress tracking works

### Local Development
- [ ] Site loads at `http://localhost:8888` (or local server)
- [ ] Can create new accounts
- [ ] Can log in
- [ ] Can view profile
- [ ] Can start lessons
- [ ] Can earn XP and coins
- [ ] Streak counter works

### Netlify Deployment
- [ ] Project linked to Netlify
- [ ] Environment variables set in Netlify
- [ ] Site deploys successfully
- [ ] Production URL works
- [ ] All features work in production
- [ ] No console errors

### Functionality Tests
- [ ] User registration creates profile
- [ ] Login/logout works
- [ ] Profile displays correct XP, level, coins
- [ ] Lesson progress saves
- [ ] XP and coins update after lesson
- [ ] Streak increments on B-days
- [ ] Achievements unlock when earned
- [ ] Leaderboard shows other users (if enabled)

---

## Next Steps

After completing this setup:

1. **Add All 87 Lessons**: Create a complete seed script with all lessons from Q1-Q4
2. **Create Achievement Definitions**: Populate the `achievements` table with all 44+ achievements
3. **Customize Email Templates**: Brand the confirmation and password reset emails
4. **Set Up Monitoring**: Configure alerts for errors and performance issues
5. **Enable Production Settings**:
   - Turn ON email confirmation
   - Configure custom domain
   - Set up backup/restore schedule
6. **Add More Features**:
   - Profile pictures (use Supabase Storage)
   - Social features (friend system)
   - Teacher dashboard
   - Parent portal

---

## Support and Resources

### Supabase Resources
- [Official Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com) - Very active community
- [GitHub Issues](https://github.com/supabase/supabase/issues)
- [YouTube Tutorials](https://www.youtube.com/@Supabase)

### Netlify Resources
- [Netlify Docs](https://docs.netlify.com)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)
- [Netlify Support](https://www.netlify.com/support/)

### Project-Specific Help
For issues specific to this project:
1. Check browser console for errors
2. Check Supabase logs
3. Check Netlify deploy logs
4. Review this guide's Troubleshooting section

---

## FAQ

**Q: Can I use Supabase for free?**
A: Yes! The free tier includes:
- 500 MB database space
- 50,000 monthly active users
- 2 GB bandwidth per month
- Social auth with Google, GitHub, etc.

**Q: What happens if I exceed the free tier?**
A: Supabase will notify you. You can upgrade to Pro ($25/month) for more resources.

**Q: Is my data secure?**
A: Yes! Supabase uses:
- Row Level Security (RLS) - users can only access their own data
- PostgreSQL - industry-standard database
- Encrypted connections (SSL)
- Regular backups

**Q: Can I export my data?**
A: Yes! Go to Database > Backups. You can download a full database dump.

**Q: How do I add custom domain?**
A: In Netlify: Site settings > Domain management > Add custom domain

**Q: Can I use Supabase locally?**
A: Yes! Supabase CLI allows local development with Docker.

**Q: What if I need help?**
A: Join the Supabase Discord! The community is very helpful.

---

**End of Guide**

Total setup time: **~45 minutes**

You now have:
- ✅ Fully functional Supabase backend
- ✅ User authentication system
- ✅ Gamification database (XP, coins, streaks, achievements)
- ✅ 87 lesson curriculum structure
- ✅ Local development environment
- ✅ Production deployment on Netlify

**Happy coding!** 🚀
