-- Migration: Create add_user_xp RPC function
-- This function is used by award-achievement.js to add XP from achievements

CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source TEXT,
  p_source_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_current_level INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN;
BEGIN
  -- Get current profile values
  SELECT total_xp, level
  INTO v_current_xp, v_current_level
  FROM profiles
  WHERE user_id = p_user_id;

  -- If profile doesn't exist, raise error
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user_id: %', p_user_id;
  END IF;

  -- Calculate new values
  v_new_xp := COALESCE(v_current_xp, 0) + p_xp_amount;
  v_new_level := FLOOR(SQRT(v_new_xp / 100.0)) + 1;
  v_leveled_up := v_new_level > COALESCE(v_current_level, 1);

  -- Update profile
  UPDATE profiles
  SET
    total_xp = v_new_xp,
    level = v_new_level,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Insert into XP history
  INSERT INTO xp_history (
    user_id,
    amount,
    source,
    source_id,
    timestamp
  ) VALUES (
    p_user_id,
    p_xp_amount,
    p_source,
    p_source_id,
    NOW()
  );

  -- Return result
  RETURN json_build_object(
    'success', true,
    'current_xp', v_new_xp,
    'current_level', v_new_level,
    'leveled_up', v_leveled_up,
    'xp_added', p_xp_amount
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_user_xp(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_xp(UUID, INTEGER, TEXT, TEXT) TO service_role;

-- Add comment
COMMENT ON FUNCTION add_user_xp IS 'Add XP to a user profile and update level. Used by achievement system.';
