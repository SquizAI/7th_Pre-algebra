# Supabase Database Setup - 8th Grade Pre-Algebra Platform

This directory contains all the database migrations and configuration for the Pre-Algebra learning platform.

## Database Schema Overview

The platform uses **6 main tables**:

### 1. **profiles** (User Profiles)
- User authentication and profile information
- Gamification metrics: XP, levels, coins
- Streak tracking: current and longest streaks
- RLS: Users can only read/update their own profile

### 2. **lessons** (Curriculum)
- All 87 Pre-Algebra lessons
- Mapped to B-day calendar (2025-2026)
- Florida BEST standards alignment
- Learning objectives, vocabulary, materials
- RLS: Public read access

### 3. **progress** (User Progress)
- Tracks user completion of each lesson
- Status: locked, available, in_progress, completed
- Scores, attempts, time spent
- XP and coins earned per lesson
- RLS: Users can only see their own progress

### 4. **achievements** (Gamification)
- Available achievements users can earn
- Categories: streak, completion, mastery, speed, perfect, milestone
- XP and coin rewards
- Rarity levels: common, rare, epic, legendary

### 5. **user_achievements** (Earned Achievements)
- Tracks which achievements each user has earned
- RLS: Users can only see their own achievements

### 6. **streaks** (Daily Activity)
- Daily streak tracking
- Lessons completed, XP/coins earned per day
- Streak bonuses and multipliers
- RLS: Users can only see their own streaks

## Migration Files

| File | Description |
|------|-------------|
| `001_create_profiles.sql` | User profiles with XP, levels, coins, streaks |
| `002_create_lessons.sql` | Lessons table with curriculum mapping |
| `003_create_progress.sql` | User progress tracking |
| `004_create_achievements.sql` | Achievement system |
| `005_create_streaks.sql` | Daily streak tracking |
| `006_seed_lessons.sql` | Seed all 87 lessons from Q1-Q4 JSONs |

## Setup Instructions

### Option 1: Using Supabase Cloud (Recommended for Production)

1. **Create a Supabase Project**
   ```bash
   # Go to https://supabase.com/dashboard
   # Click "New Project"
   # Note your project URL and anon key
   ```

2. **Set Environment Variables**
   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env and add your credentials
   # VITE_SUPABASE_URL=https://your-project-id.supabase.co
   # VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   # or
   brew install supabase/tap/supabase
   ```

4. **Link to Your Project**
   ```bash
   supabase link --project-ref your-project-id
   ```

5. **Run Migrations**
   ```bash
   # Run all migrations in order
   supabase db push

   # Or run them individually via Supabase Dashboard > SQL Editor
   # Copy and paste each migration file in order (001 -> 006)
   ```

6. **Verify Setup**
   ```bash
   # Check that all tables exist
   supabase db diff

   # Check lesson count (should be 87)
   # In Supabase Dashboard > Table Editor > lessons
   ```

### Option 2: Using Supabase Local Development

1. **Install Docker Desktop**
   ```bash
   # Download from https://www.docker.com/products/docker-desktop
   # Start Docker Desktop
   ```

2. **Initialize Supabase Locally**
   ```bash
   cd /Users/mattysquarzoni/Documents/7th-PreAlgebra
   supabase init
   ```

3. **Start Supabase**
   ```bash
   supabase start

   # This will output:
   # - API URL: http://localhost:54321
   # - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
   # - Studio URL: http://localhost:54323
   # - anon key: [copy this key]
   ```

4. **Apply Migrations**
   ```bash
   # Migrations in /supabase/migrations will be applied automatically
   supabase db reset
   ```

5. **Update .env for Local Development**
   ```bash
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=[paste the anon key from step 3]
   ```

6. **Access Supabase Studio**
   ```bash
   # Open http://localhost:54323 in your browser
   # Explore tables, run SQL queries, manage data
   ```

## Verifying the Schema

### Check Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected output:
-- achievements
-- lessons
-- profiles
-- progress
-- streaks
-- user_achievements
```

### Check Lesson Count
```sql
SELECT COUNT(*) AS total_lessons FROM public.lessons;
-- Expected: 87

SELECT quarter, COUNT(*) AS lessons_per_quarter
FROM public.lessons
GROUP BY quarter
ORDER BY quarter;
-- Expected: Q1=19, Q2=22, Q3=23, Q4=23
```

### Check RLS Policies
```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test Progress Functions
```sql
-- Initialize progress for a test user
SELECT public.initialize_user_progress('[user-id-uuid]');

-- Check progress summary
SELECT * FROM public.get_user_progress_summary('[user-id-uuid]');
```

## Helper Functions

The schema includes several helper functions:

### Profiles
- `handle_new_user()` - Auto-creates profile on signup
- `handle_updated_at()` - Auto-updates timestamps

### Lessons
- `get_lessons_by_quarter(quarter_name)` - Get all lessons for a quarter
- `get_lessons_by_standard(std_code)` - Get lessons by standard
- `get_next_lesson(current_lesson)` - Get next lesson
- `get_previous_lesson(current_lesson)` - Get previous lesson

### Progress
- `initialize_user_progress(user_id)` - Set up progress for new user
- `unlock_next_lesson(user_id, current_lesson)` - Unlock next lesson
- `get_user_progress_summary(user_id)` - Get overall stats
- `get_user_lessons_by_status(user_id, status)` - Filter by status

### Achievements
- `award_achievement(user_id, achievement_id)` - Award achievement
- `check_and_award_achievements(user_id)` - Auto-check all achievements
- `get_user_achievements(user_id)` - Get earned achievements
- `get_available_achievements(user_id)` - Get unearned achievements

### Streaks
- `record_daily_activity(user_id, xp, coins, time)` - Log daily activity
- `calculate_current_streak(user_id)` - Calculate streak length
- `get_streak_calendar(user_id, days)` - Get calendar view
- `get_streak_stats(user_id)` - Get streak statistics
- `apply_streak_bonus(user_id)` - Calculate bonus multiplier

## Row Level Security (RLS)

All tables have RLS enabled:

- **profiles**: Users can only read/update their own profile. Public read for leaderboards.
- **lessons**: Public read access. Admin-only writes.
- **progress**: Users can only see/modify their own progress.
- **achievements**: Public read. Admin-only writes.
- **user_achievements**: Users can only see their own earned achievements.
- **streaks**: Users can only see/modify their own streaks.

## Seeding Achievement Data

After running migrations, you can add default achievements:

```sql
-- Example achievements
INSERT INTO public.achievements (achievement_id, name, description, badge_icon, category, requirement_type, requirement_value, xp_reward, coin_reward, rarity) VALUES
('first_lesson', 'First Steps', 'Complete your first lesson', '🎯', 'milestone', 'lessons_completed', 1, 50, 25, 'common'),
('week_streak', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 'streak_days', 7, 100, 50, 'rare'),
('perfect_score', 'Perfectionist', 'Get a perfect score on any lesson', '💯', 'perfect', 'perfect_scores', 1, 75, 40, 'rare'),
('q1_complete', 'Q1 Master', 'Complete all Q1 lessons', '📚', 'completion', 'lessons_completed', 19, 200, 100, 'epic'),
('all_complete', 'Pre-Algebra Champion', 'Complete all 87 lessons', '🏆', 'milestone', 'all_completed', 87, 1000, 500, 'legendary');
```

## Troubleshooting

### Issue: Migrations fail with "relation already exists"
```bash
# Reset the database
supabase db reset

# Or drop tables manually
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.streaks CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

### Issue: RLS policies blocking access
```sql
-- Check which policies exist
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### Issue: Lesson seed data not inserting
```bash
# Check the seed file
cat supabase/migrations/006_seed_lessons.sql | grep "INSERT INTO"

# Run seed file separately
supabase db execute --file supabase/migrations/006_seed_lessons.sql
```

## Backup and Restore

### Backup
```bash
# Backup entire database
supabase db dump -f backup.sql

# Backup specific table
supabase db dump --table lessons -f lessons_backup.sql
```

### Restore
```bash
# Restore from backup
psql -U postgres -h localhost -p 54322 -d postgres -f backup.sql
```

## Next Steps

1. ✅ Run all migrations
2. ✅ Verify schema is correct
3. ✅ Seed achievement data
4. ⬜ Test user signup flow
5. ⬜ Test lesson progress tracking
6. ⬜ Test achievement unlocking
7. ⬜ Test streak calculations
8. ⬜ Deploy to production

## Support

For issues or questions:
- Supabase Docs: https://supabase.com/docs
- Supabase Community: https://github.com/supabase/supabase/discussions
- Florida BEST Standards: https://www.fldoe.org/core/fileparse.php/20653/urlt/6-8-Math.pdf
