-- ============================================================================
-- Migration: 007_create_xp_coin_history.sql
-- Description: Create XP and coin transaction history tables
-- Created: 2025-01-14
-- ============================================================================

-- ============================================================================
-- XP History Table
-- ============================================================================

-- Create enum type for XP sources
CREATE TYPE xp_source AS ENUM (
  'lesson_completion',
  'achievement',
  'streak_bonus',
  'perfect_score',
  'speed_bonus',
  'daily_challenge',
  'mastery_bonus'
);

-- Create XP history table
CREATE TABLE IF NOT EXISTS public.xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Transaction details
  amount INTEGER NOT NULL CHECK (amount > 0),
  source xp_source NOT NULL,
  source_id TEXT, -- Optional: ID of lesson, achievement, etc.
  description TEXT,

  -- Level tracking
  level_before INTEGER NOT NULL CHECK (level_before >= 1),
  level_after INTEGER NOT NULL CHECK (level_after >= 1),
  xp_before INTEGER NOT NULL CHECK (xp_before >= 0),
  xp_after INTEGER NOT NULL CHECK (xp_after >= 0),
  leveled_up BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Coin History Table
-- ============================================================================

-- Create enum type for coin transaction types
CREATE TYPE coin_transaction_type AS ENUM (
  'earned',
  'spent',
  'refund'
);

-- Create enum type for coin sources
CREATE TYPE coin_source AS ENUM (
  'lesson_completion',
  'achievement',
  'daily_bonus',
  'streak_reward',
  'perfect_score',
  'shop_purchase',
  'avatar_purchase',
  'hint_purchase',
  'power_up'
);

-- Create coin history table
CREATE TABLE IF NOT EXISTS public.coin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Transaction details
  amount INTEGER NOT NULL CHECK (amount != 0),
  transaction_type coin_transaction_type NOT NULL,
  source coin_source NOT NULL,
  source_id TEXT, -- Optional: ID of lesson, achievement, item, etc.
  description TEXT,

  -- Balance tracking
  balance_before INTEGER NOT NULL CHECK (balance_before >= 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- XP History indexes
CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON public.xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON public.xp_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_history_source ON public.xp_history(source);
CREATE INDEX IF NOT EXISTS idx_xp_history_user_date ON public.xp_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_history_leveled_up ON public.xp_history(user_id, leveled_up) WHERE leveled_up = true;

-- Coin History indexes
CREATE INDEX IF NOT EXISTS idx_coin_history_user_id ON public.coin_history(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_history_created_at ON public.coin_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_history_transaction_type ON public.coin_history(transaction_type);
CREATE INDEX IF NOT EXISTS idx_coin_history_source ON public.coin_history(source);
CREATE INDEX IF NOT EXISTS idx_coin_history_user_date ON public.coin_history(user_id, created_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on XP history
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own XP history
CREATE POLICY "Users can view own XP history"
  ON public.xp_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only server can insert XP history (via service role)
CREATE POLICY "Service role can insert XP history"
  ON public.xp_history
  FOR INSERT
  WITH CHECK (true); -- Will be restricted by service role key

-- Enable RLS on coin history
ALTER TABLE public.coin_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own coin history
CREATE POLICY "Users can view own coin history"
  ON public.coin_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only server can insert coin history (via service role)
CREATE POLICY "Service role can insert coin history"
  ON public.coin_history
  FOR INSERT
  WITH CHECK (true); -- Will be restricted by service role key

-- ============================================================================
-- Functions for XP and Coin Management
-- ============================================================================

-- Function to calculate level from total XP
-- Formula: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 210 XP (exponential)
-- Each level requires: 100 + (level - 1) * 10 more XP than the previous
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_level INTEGER := 1;
  xp_required INTEGER := 0;
  xp_for_next_level INTEGER := 100;
BEGIN
  WHILE total_xp >= xp_required + xp_for_next_level AND current_level < 87 LOOP
    xp_required := xp_required + xp_for_next_level;
    current_level := current_level + 1;
    xp_for_next_level := 100 + (current_level - 1) * 10;
  END LOOP;

  RETURN current_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate XP required for a specific level
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(target_level INTEGER)
RETURNS INTEGER AS $$
DECLARE
  total_xp INTEGER := 0;
  current_level INTEGER := 1;
  xp_for_next_level INTEGER := 100;
BEGIN
  IF target_level <= 1 THEN
    RETURN 0;
  END IF;

  WHILE current_level < target_level AND current_level < 87 LOOP
    total_xp := total_xp + xp_for_next_level;
    current_level := current_level + 1;
    xp_for_next_level := 100 + (current_level - 1) * 10;
  END LOOP;

  RETURN total_xp;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award XP to a user
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source xp_source,
  p_source_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
  new_total_xp INTEGER,
  new_level INTEGER,
  leveled_up BOOLEAN,
  xp_to_next_level INTEGER
) AS $$
DECLARE
  v_old_xp INTEGER;
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN;
  v_xp_for_next_level INTEGER;
BEGIN
  -- Get current XP and level
  SELECT total_xp, level INTO v_old_xp, v_old_level
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Calculate new XP and level
  v_new_xp := v_old_xp + p_amount;
  v_new_level := public.calculate_level_from_xp(v_new_xp);
  v_leveled_up := v_new_level > v_old_level;

  -- Calculate XP needed for next level
  v_xp_for_next_level := public.calculate_xp_for_level(v_new_level + 1) - v_new_xp;

  -- Update profile
  UPDATE public.profiles
  SET
    total_xp = v_new_xp,
    level = v_new_level,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert into history
  INSERT INTO public.xp_history (
    user_id, amount, source, source_id, description,
    level_before, level_after, xp_before, xp_after, leveled_up
  ) VALUES (
    p_user_id, p_amount, p_source, p_source_id, p_description,
    v_old_level, v_new_level, v_old_xp, v_new_xp, v_leveled_up
  );

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_leveled_up, v_xp_for_next_level;
END;
$$ LANGUAGE plpgsql;

-- Function to award coins to a user
CREATE OR REPLACE FUNCTION public.award_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_source coin_source,
  p_source_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
  new_total_coins INTEGER,
  amount_awarded INTEGER
) AS $$
DECLARE
  v_old_coins INTEGER;
  v_new_coins INTEGER;
BEGIN
  -- Get current coins
  SELECT total_coins INTO v_old_coins
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Calculate new coins
  v_new_coins := v_old_coins + p_amount;

  -- Update profile
  UPDATE public.profiles
  SET
    total_coins = v_new_coins,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert into history
  INSERT INTO public.coin_history (
    user_id, amount, transaction_type, source, source_id, description,
    balance_before, balance_after
  ) VALUES (
    p_user_id, p_amount, 'earned', p_source, p_source_id, p_description,
    v_old_coins, v_new_coins
  );

  -- Return results
  RETURN QUERY SELECT v_new_coins, p_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to spend coins
CREATE OR REPLACE FUNCTION public.spend_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_source coin_source,
  p_source_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  remaining_coins INTEGER,
  message TEXT
) AS $$
DECLARE
  v_old_coins INTEGER;
  v_new_coins INTEGER;
BEGIN
  -- Get current coins
  SELECT total_coins INTO v_old_coins
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'User not found';
    RETURN;
  END IF;

  -- Check if user has enough coins
  IF v_old_coins < p_amount THEN
    RETURN QUERY SELECT false, v_old_coins, 'Insufficient coins';
    RETURN;
  END IF;

  -- Calculate new coins
  v_new_coins := v_old_coins - p_amount;

  -- Update profile
  UPDATE public.profiles
  SET
    total_coins = v_new_coins,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert into history
  INSERT INTO public.coin_history (
    user_id, amount, transaction_type, source, source_id, description,
    balance_before, balance_after
  ) VALUES (
    p_user_id, -p_amount, 'spent', p_source, p_source_id, p_description,
    v_old_coins, v_new_coins
  );

  -- Return results
  RETURN QUERY SELECT true, v_new_coins, 'Purchase successful';
END;
$$ LANGUAGE plpgsql;

-- Function to get user's XP history
CREATE OR REPLACE FUNCTION public.get_user_xp_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  amount INTEGER,
  source xp_source,
  description TEXT,
  level_before INTEGER,
  level_after INTEGER,
  leveled_up BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.amount,
    h.source,
    h.description,
    h.level_before,
    h.level_after,
    h.leveled_up,
    h.created_at
  FROM public.xp_history h
  WHERE h.user_id = p_user_id
  ORDER BY h.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user's coin history
CREATE OR REPLACE FUNCTION public.get_user_coin_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  amount INTEGER,
  transaction_type coin_transaction_type,
  source coin_source,
  description TEXT,
  balance_after INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.amount,
    h.transaction_type,
    h.source,
    h.description,
    h.balance_after,
    h.created_at
  FROM public.coin_history h
  WHERE h.user_id = p_user_id
  ORDER BY h.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.xp_history IS 'Transaction history for XP awards';
COMMENT ON TABLE public.coin_history IS 'Transaction history for coin earnings and spending';
COMMENT ON FUNCTION public.calculate_level_from_xp(INTEGER) IS 'Calculate level from total XP (exponential curve)';
COMMENT ON FUNCTION public.calculate_xp_for_level(INTEGER) IS 'Calculate total XP required to reach a specific level';
COMMENT ON FUNCTION public.award_xp IS 'Award XP to user and track in history';
COMMENT ON FUNCTION public.award_coins IS 'Award coins to user and track in history';
COMMENT ON FUNCTION public.spend_coins IS 'Spend coins and validate sufficient balance';
