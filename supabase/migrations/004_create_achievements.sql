-- ============================================================================
-- Migration: 004_create_achievements.sql
-- Description: Create achievements and user_achievements tables
-- Created: 2025-01-13
-- ============================================================================

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  achievement_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL, -- URL or emoji/icon identifier
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
  is_hidden BOOLEAN NOT NULL DEFAULT false, -- Secret achievements

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(achievement_id) ON DELETE CASCADE,

  -- Earning details
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_value INTEGER DEFAULT 0, -- For tracking progress toward achievement

  -- Ensure one achievement per user
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Index on achievement category
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);

-- Index on achievement rarity
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON public.achievements(rarity);

-- Index on display_order
CREATE INDEX IF NOT EXISTS idx_achievements_display_order ON public.achievements(display_order);

-- Index on user_id for user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Index on achievement_id for user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- Index on earned_at for recent achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON public.user_achievements(earned_at DESC);

-- Composite index for user + earned_at
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned ON public.user_achievements(user_id, earned_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read achievements (public data)
CREATE POLICY "Achievements are publicly readable"
  ON public.achievements
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can modify achievements (admin only in practice)
CREATE POLICY "Authenticated users can modify achievements"
  ON public.achievements
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS on user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own achievements
CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own achievements (for progress tracking)
CREATE POLICY "Users can update own achievements"
  ON public.user_achievements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Trigger to auto-update updated_at timestamp
-- ============================================================================

CREATE TRIGGER set_updated_at_achievements
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Function to award achievement to user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.award_achievement(
  p_user_id UUID,
  p_achievement_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_achievement public.achievements;
  v_already_earned BOOLEAN;
BEGIN
  -- Check if achievement exists
  SELECT * INTO v_achievement
  FROM public.achievements
  WHERE achievement_id = p_achievement_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Achievement % not found', p_achievement_id;
  END IF;

  -- Check if user already has this achievement
  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
  ) INTO v_already_earned;

  IF v_already_earned THEN
    RETURN false; -- Already earned
  END IF;

  -- Award the achievement
  INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
  VALUES (p_user_id, p_achievement_id, NOW());

  -- Update user profile with XP and coins
  UPDATE public.profiles
  SET
    total_xp = total_xp + v_achievement.xp_reward,
    total_coins = total_coins + v_achievement.coin_reward,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN true; -- Successfully awarded
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to check and award achievements automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_achievement RECORD;
  v_completed_count INTEGER;
  v_current_streak INTEGER;
  v_perfect_scores INTEGER;
BEGIN
  -- Get user stats
  SELECT current_streak INTO v_current_streak
  FROM public.profiles
  WHERE id = p_user_id;

  SELECT COUNT(*) INTO v_completed_count
  FROM public.progress
  WHERE user_id = p_user_id AND status = 'completed';

  SELECT COUNT(*) INTO v_perfect_scores
  FROM public.progress
  WHERE user_id = p_user_id AND score = 100;

  -- Check each achievement
  FOR v_achievement IN
    SELECT * FROM public.achievements
    WHERE achievement_id NOT IN (
      SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id
    )
  LOOP
    -- Check if user meets requirements
    IF v_achievement.requirement_type = 'lessons_completed' AND v_completed_count >= v_achievement.requirement_value THEN
      PERFORM public.award_achievement(p_user_id, v_achievement.achievement_id);
    ELSIF v_achievement.requirement_type = 'streak_days' AND v_current_streak >= v_achievement.requirement_value THEN
      PERFORM public.award_achievement(p_user_id, v_achievement.achievement_id);
    ELSIF v_achievement.requirement_type = 'perfect_scores' AND v_perfect_scores >= v_achievement.requirement_value THEN
      PERFORM public.award_achievement(p_user_id, v_achievement.achievement_id);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to get user's achievements with details
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_achievements(p_user_id UUID)
RETURNS TABLE(
  achievement_id TEXT,
  name TEXT,
  description TEXT,
  badge_icon TEXT,
  category TEXT,
  rarity TEXT,
  xp_reward INTEGER,
  coin_reward INTEGER,
  earned_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.achievement_id,
    a.name,
    a.description,
    a.badge_icon,
    a.category,
    a.rarity,
    a.xp_reward,
    a.coin_reward,
    ua.earned_at
  FROM public.user_achievements ua
  JOIN public.achievements a ON ua.achievement_id = a.achievement_id
  WHERE ua.user_id = p_user_id
  ORDER BY ua.earned_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Function to get available achievements (not yet earned)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_available_achievements(p_user_id UUID)
RETURNS TABLE(
  achievement_id TEXT,
  name TEXT,
  description TEXT,
  badge_icon TEXT,
  category TEXT,
  rarity TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  xp_reward INTEGER,
  coin_reward INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.achievement_id,
    a.name,
    a.description,
    a.badge_icon,
    a.category,
    a.rarity,
    a.requirement_type,
    a.requirement_value,
    a.xp_reward,
    a.coin_reward
  FROM public.achievements a
  WHERE a.is_hidden = false
    AND a.achievement_id NOT IN (
      SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id
    )
  ORDER BY a.display_order, a.rarity;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.achievements IS 'Available achievements that users can earn';
COMMENT ON COLUMN public.achievements.achievement_id IS 'Unique achievement identifier (e.g., "first_lesson", "perfect_week")';
COMMENT ON COLUMN public.achievements.name IS 'Display name of the achievement';
COMMENT ON COLUMN public.achievements.description IS 'Description of how to earn the achievement';
COMMENT ON COLUMN public.achievements.badge_icon IS 'Icon/emoji identifier for the badge';
COMMENT ON COLUMN public.achievements.category IS 'Achievement category: streak, completion, mastery, speed, perfect, milestone';
COMMENT ON COLUMN public.achievements.requirement_type IS 'Type of requirement to earn achievement';
COMMENT ON COLUMN public.achievements.requirement_value IS 'Value needed to earn achievement';
COMMENT ON COLUMN public.achievements.xp_reward IS 'XP awarded when achievement is earned';
COMMENT ON COLUMN public.achievements.coin_reward IS 'Coins awarded when achievement is earned';
COMMENT ON COLUMN public.achievements.rarity IS 'Rarity level: common, rare, epic, legendary';
COMMENT ON COLUMN public.achievements.is_hidden IS 'Whether achievement is hidden (secret achievement)';

COMMENT ON TABLE public.user_achievements IS 'Achievements earned by users';
COMMENT ON COLUMN public.user_achievements.user_id IS 'User who earned the achievement';
COMMENT ON COLUMN public.user_achievements.achievement_id IS 'Achievement that was earned';
COMMENT ON COLUMN public.user_achievements.earned_at IS 'When the achievement was earned';
COMMENT ON COLUMN public.user_achievements.progress_value IS 'Current progress toward achievement (for tracking)';
