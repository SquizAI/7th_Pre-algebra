-- ============================================================================
-- Migration: 005_create_streaks.sql
-- Description: Create daily streaks tracking table
-- Created: 2025-01-13
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
  time_spent INTEGER NOT NULL DEFAULT 0 CHECK (time_spent >= 0), -- Time in seconds

  -- Streak bonuses
  streak_bonus_applied BOOLEAN NOT NULL DEFAULT false,
  bonus_multiplier NUMERIC(3,2) DEFAULT 1.0 CHECK (bonus_multiplier >= 1.0 AND bonus_multiplier <= 3.0),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one streak record per user per day
  UNIQUE(user_id, streak_date)
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Index on user_id for fast user queries
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);

-- Index on streak_date
CREATE INDEX IF NOT EXISTS idx_streaks_date ON public.streaks(streak_date DESC);

-- Composite index for user + date queries
CREATE INDEX IF NOT EXISTS idx_streaks_user_date ON public.streaks(user_id, streak_date DESC);

-- Index for checking recent streaks
CREATE INDEX IF NOT EXISTS idx_streaks_recent ON public.streaks(user_id, streak_date DESC)
  WHERE streak_date >= CURRENT_DATE - INTERVAL '30 days';

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own streaks
CREATE POLICY "Users can view own streaks"
  ON public.streaks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own streaks
CREATE POLICY "Users can insert own streaks"
  ON public.streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own streaks
CREATE POLICY "Users can update own streaks"
  ON public.streaks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Trigger to auto-update updated_at timestamp
-- ============================================================================

CREATE TRIGGER set_updated_at_streaks
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Function to record daily activity
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_daily_activity(
  p_user_id UUID,
  p_xp_earned INTEGER DEFAULT 0,
  p_coins_earned INTEGER DEFAULT 0,
  p_time_spent INTEGER DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Insert or update today's streak record
  INSERT INTO public.streaks (user_id, streak_date, lessons_completed, xp_earned, coins_earned, time_spent)
  VALUES (p_user_id, v_today, 1, p_xp_earned, p_coins_earned, p_time_spent)
  ON CONFLICT (user_id, streak_date)
  DO UPDATE SET
    lessons_completed = public.streaks.lessons_completed + 1,
    xp_earned = public.streaks.xp_earned + p_xp_earned,
    coins_earned = public.streaks.coins_earned + p_coins_earned,
    time_spent = public.streaks.time_spent + p_time_spent,
    updated_at = NOW();

  -- Update streak counters in profile
  PERFORM public.update_streak_counters(p_user_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to calculate current streak
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak_count INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_found BOOLEAN;
BEGIN
  -- Count consecutive days starting from today
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.streaks
      WHERE user_id = p_user_id
        AND streak_date = v_check_date
        AND lessons_completed > 0
    ) INTO v_found;

    EXIT WHEN NOT v_found;

    v_streak_count := v_streak_count + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;

  RETURN v_streak_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Function to calculate longest streak
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_longest_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_longest_streak INTEGER := 0;
  v_current_streak INTEGER := 0;
  v_date RECORD;
  v_prev_date DATE;
BEGIN
  -- Iterate through all streak dates for this user
  FOR v_date IN
    SELECT streak_date
    FROM public.streaks
    WHERE user_id = p_user_id AND lessons_completed > 0
    ORDER BY streak_date
  LOOP
    -- Check if this date continues the streak
    IF v_prev_date IS NULL OR v_date.streak_date = v_prev_date + INTERVAL '1 day' THEN
      v_current_streak := v_current_streak + 1;
      v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    ELSE
      v_current_streak := 1;
    END IF;

    v_prev_date := v_date.streak_date;
  END LOOP;

  RETURN v_longest_streak;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Function to update streak counters in profile
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_streak_counters(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Calculate current and longest streaks
  v_current_streak := public.calculate_current_streak(p_user_id);
  v_longest_streak := public.calculate_longest_streak(p_user_id);

  -- Update profile
  UPDATE public.profiles
  SET
    current_streak = v_current_streak,
    longest_streak = GREATEST(longest_streak, v_longest_streak),
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to get streak calendar (last 30 days)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_streak_calendar(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  streak_date DATE,
  lessons_completed INTEGER,
  xp_earned INTEGER,
  coins_earned INTEGER,
  has_activity BOOLEAN
) AS $$
DECLARE
  v_start_date DATE := CURRENT_DATE - (p_days || ' days')::INTERVAL;
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      v_start_date,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE AS date
  )
  SELECT
    ds.date AS streak_date,
    COALESCE(s.lessons_completed, 0) AS lessons_completed,
    COALESCE(s.xp_earned, 0) AS xp_earned,
    COALESCE(s.coins_earned, 0) AS coins_earned,
    CASE WHEN s.lessons_completed > 0 THEN true ELSE false END AS has_activity
  FROM date_series ds
  LEFT JOIN public.streaks s ON s.user_id = p_user_id AND s.streak_date = ds.date
  ORDER BY ds.date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Function to get streak statistics
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_streak_stats(p_user_id UUID)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER,
  total_active_days INTEGER,
  average_lessons_per_day NUMERIC(5,2),
  total_xp_all_time INTEGER,
  total_coins_all_time INTEGER,
  total_time_spent INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT current_streak FROM public.profiles WHERE id = p_user_id) AS current_streak,
    (SELECT longest_streak FROM public.profiles WHERE id = p_user_id) AS longest_streak,
    COUNT(*)::INTEGER AS total_active_days,
    COALESCE(AVG(s.lessons_completed), 0)::NUMERIC(5,2) AS average_lessons_per_day,
    COALESCE(SUM(s.xp_earned), 0)::INTEGER AS total_xp_all_time,
    COALESCE(SUM(s.coins_earned), 0)::INTEGER AS total_coins_all_time,
    COALESCE(SUM(s.time_spent), 0)::INTEGER AS total_time_spent
  FROM public.streaks s
  WHERE s.user_id = p_user_id AND s.lessons_completed > 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Function to apply streak bonus
-- ============================================================================

CREATE OR REPLACE FUNCTION public.apply_streak_bonus(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_current_streak INTEGER;
  v_multiplier NUMERIC(3,2) := 1.0;
BEGIN
  -- Get current streak
  SELECT current_streak INTO v_current_streak
  FROM public.profiles
  WHERE id = p_user_id;

  -- Calculate multiplier based on streak
  -- 7+ days: 1.1x, 14+ days: 1.2x, 30+ days: 1.5x
  IF v_current_streak >= 30 THEN
    v_multiplier := 1.5;
  ELSIF v_current_streak >= 14 THEN
    v_multiplier := 1.2;
  ELSIF v_current_streak >= 7 THEN
    v_multiplier := 1.1;
  END IF;

  RETURN v_multiplier;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Function to check if streak is active today
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_activity_today(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.streaks
    WHERE user_id = p_user_id
      AND streak_date = CURRENT_DATE
      AND lessons_completed > 0
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.streaks IS 'Daily streak tracking for user engagement';
COMMENT ON COLUMN public.streaks.user_id IS 'User who created the streak';
COMMENT ON COLUMN public.streaks.streak_date IS 'Date of this streak entry';
COMMENT ON COLUMN public.streaks.lessons_completed IS 'Number of lessons completed on this day';
COMMENT ON COLUMN public.streaks.xp_earned IS 'Total XP earned on this day';
COMMENT ON COLUMN public.streaks.coins_earned IS 'Total coins earned on this day';
COMMENT ON COLUMN public.streaks.time_spent IS 'Total time spent in seconds on this day';
COMMENT ON COLUMN public.streaks.streak_bonus_applied IS 'Whether streak bonus was applied';
COMMENT ON COLUMN public.streaks.bonus_multiplier IS 'Multiplier applied for streak bonus';
