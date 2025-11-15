-- ============================================================================
-- Migration: 003_create_progress.sql
-- Description: Create user progress tracking table
-- Created: 2025-01-13
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
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100), -- Score as percentage
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  time_spent INTEGER NOT NULL DEFAULT 0 CHECK (time_spent >= 0), -- Time in seconds

  -- Gamification rewards
  xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  coins_earned INTEGER NOT NULL DEFAULT 0 CHECK (coins_earned >= 0),

  -- Completion tracking
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one progress record per user per lesson
  UNIQUE(user_id, lesson_number)
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Index on user_id for fast user queries
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);

-- Index on lesson_number for fast lesson queries
CREATE INDEX IF NOT EXISTS idx_progress_lesson_number ON public.progress(lesson_number);

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_progress_status ON public.progress(status);

-- Composite index for user + lesson queries
CREATE INDEX IF NOT EXISTS idx_progress_user_lesson ON public.progress(user_id, lesson_number);

-- Index on completed_at for recent activity queries
CREATE INDEX IF NOT EXISTS idx_progress_completed_at ON public.progress(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Composite index for user's completed lessons
CREATE INDEX IF NOT EXISTS idx_progress_user_completed ON public.progress(user_id, completed_at DESC) WHERE status = 'completed';

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON public.progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON public.progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON public.progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own progress (for reset functionality)
CREATE POLICY "Users can delete own progress"
  ON public.progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Trigger to auto-update updated_at timestamp
-- ============================================================================

CREATE TRIGGER set_updated_at_progress
  BEFORE UPDATE ON public.progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Trigger to update profile when lesson is completed
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_profile_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Set completed_at if not already set
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at = NOW();
    END IF;

    -- Update user profile with XP and coins
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

-- ============================================================================
-- Function to initialize progress for new user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.initialize_user_progress(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Create locked progress records for all lessons
  INSERT INTO public.progress (user_id, lesson_number, status)
  SELECT p_user_id, lesson_number, 'locked'
  FROM public.lessons
  ON CONFLICT (user_id, lesson_number) DO NOTHING;

  -- Unlock first lesson
  UPDATE public.progress
  SET status = 'available'
  WHERE user_id = p_user_id AND lesson_number = 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to unlock next lesson
-- ============================================================================

CREATE OR REPLACE FUNCTION public.unlock_next_lesson(p_user_id UUID, p_current_lesson INTEGER)
RETURNS VOID AS $$
DECLARE
  next_lesson_number INTEGER;
BEGIN
  -- Find the next lesson number
  SELECT lesson_number INTO next_lesson_number
  FROM public.lessons
  WHERE lesson_number > p_current_lesson
  ORDER BY lesson_number
  LIMIT 1;

  -- If there is a next lesson, unlock it
  IF next_lesson_number IS NOT NULL THEN
    UPDATE public.progress
    SET status = 'available', updated_at = NOW()
    WHERE user_id = p_user_id
      AND lesson_number = next_lesson_number
      AND status = 'locked';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to get user's current progress summary
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_progress_summary(p_user_id UUID)
RETURNS TABLE(
  total_lessons INTEGER,
  completed_lessons INTEGER,
  in_progress_lessons INTEGER,
  available_lessons INTEGER,
  locked_lessons INTEGER,
  total_xp_earned INTEGER,
  total_coins_earned INTEGER,
  average_score NUMERIC(5,2),
  total_time_spent INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_lessons,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed_lessons,
    COUNT(*) FILTER (WHERE status = 'in_progress')::INTEGER AS in_progress_lessons,
    COUNT(*) FILTER (WHERE status = 'available')::INTEGER AS available_lessons,
    COUNT(*) FILTER (WHERE status = 'locked')::INTEGER AS locked_lessons,
    COALESCE(SUM(xp_earned), 0)::INTEGER AS total_xp_earned,
    COALESCE(SUM(coins_earned), 0)::INTEGER AS total_coins_earned,
    COALESCE(AVG(score) FILTER (WHERE score IS NOT NULL), 0)::NUMERIC(5,2) AS average_score,
    COALESCE(SUM(time_spent), 0)::INTEGER AS total_time_spent
  FROM public.progress
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Function to get lessons by status for a user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_lessons_by_status(
  p_user_id UUID,
  p_status lesson_status
)
RETURNS TABLE(
  lesson_number INTEGER,
  lesson_topic TEXT,
  quarter TEXT,
  unit_name TEXT,
  standard_code TEXT,
  xp_value INTEGER,
  coin_value INTEGER,
  score NUMERIC(5,2),
  attempts INTEGER,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.lesson_number,
    l.lesson_topic,
    l.quarter,
    l.unit_name,
    l.standard_code,
    l.xp_value,
    l.coin_value,
    p.score,
    p.attempts,
    p.completed_at
  FROM public.progress p
  JOIN public.lessons l ON p.lesson_number = l.lesson_number
  WHERE p.user_id = p_user_id AND p.status = p_status
  ORDER BY l.lesson_number;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.progress IS 'User progress tracking for each lesson';
COMMENT ON COLUMN public.progress.id IS 'Unique progress record ID';
COMMENT ON COLUMN public.progress.user_id IS 'User ID (references profiles)';
COMMENT ON COLUMN public.progress.lesson_number IS 'Lesson number (references lessons)';
COMMENT ON COLUMN public.progress.status IS 'Current status: locked, available, in_progress, completed';
COMMENT ON COLUMN public.progress.score IS 'Score as percentage (0-100)';
COMMENT ON COLUMN public.progress.attempts IS 'Number of attempts';
COMMENT ON COLUMN public.progress.time_spent IS 'Time spent in seconds';
COMMENT ON COLUMN public.progress.xp_earned IS 'XP earned for this lesson';
COMMENT ON COLUMN public.progress.coins_earned IS 'Coins earned for this lesson';
COMMENT ON COLUMN public.progress.completed_at IS 'Timestamp when lesson was completed';
COMMENT ON COLUMN public.progress.started_at IS 'Timestamp when lesson was first started';
