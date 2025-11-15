-- ============================================================================
-- Migration: 002_create_lessons.sql
-- Description: Create lessons table for all 87 Pre-Algebra lessons
-- Created: 2025-01-13
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
  standard_code TEXT NOT NULL, -- e.g., "MA.8.NSO.1.1"
  standard_title TEXT NOT NULL,
  strand TEXT NOT NULL, -- e.g., "Number Sense and Operations"

  -- Lesson content
  lesson_topic TEXT NOT NULL,
  learning_objectives JSONB NOT NULL DEFAULT '[]',
  key_vocabulary JSONB NOT NULL DEFAULT '[]',
  materials_needed JSONB NOT NULL DEFAULT '[]',

  -- Gamification
  xp_value INTEGER NOT NULL DEFAULT 100 CHECK (xp_value >= 0),
  coin_value INTEGER NOT NULL DEFAULT 50 CHECK (coin_value >= 0),

  -- Metadata
  cognitive_complexity TEXT, -- e.g., "Level 2: Basic Application of Skills & Concepts"
  integrated_mtr_standards JSONB DEFAULT '[]',
  status TEXT DEFAULT 'NOT CREATED' CHECK (status IN ('NOT CREATED', 'IN PROGRESS', 'COMPLETED')),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Index on lesson_number (primary key already indexed)
-- Index on date for calendar queries
CREATE INDEX IF NOT EXISTS idx_lessons_date ON public.lessons(date);

-- Index on quarter for filtering by quarter
CREATE INDEX IF NOT EXISTS idx_lessons_quarter ON public.lessons(quarter);

-- Index on unit_number for filtering by unit
CREATE INDEX IF NOT EXISTS idx_lessons_unit_number ON public.lessons(unit_number);

-- Index on standard_code for filtering by standard
CREATE INDEX IF NOT EXISTS idx_lessons_standard_code ON public.lessons(standard_code);

-- Composite index for quarter + lesson_number queries
CREATE INDEX IF NOT EXISTS idx_lessons_quarter_lesson ON public.lessons(quarter, lesson_number);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read lessons (lessons are public data)
CREATE POLICY "Lessons are publicly readable"
  ON public.lessons
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert/update lessons (for admin functions)
-- Comment this out if you want to restrict to specific roles
CREATE POLICY "Authenticated users can modify lessons"
  ON public.lessons
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- Trigger to auto-update updated_at timestamp
-- ============================================================================

CREATE TRIGGER set_updated_at_lessons
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Helper function to get lessons by quarter
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_lessons_by_quarter(quarter_name TEXT)
RETURNS SETOF public.lessons AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.lessons
  WHERE quarter = quarter_name
  ORDER BY lesson_number;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Helper function to get lessons by standard
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_lessons_by_standard(std_code TEXT)
RETURNS SETOF public.lessons AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.lessons
  WHERE standard_code = std_code
  ORDER BY lesson_number;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Helper function to get next lesson
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_next_lesson(current_lesson INTEGER)
RETURNS public.lessons AS $$
DECLARE
  next_lesson public.lessons;
BEGIN
  SELECT * INTO next_lesson
  FROM public.lessons
  WHERE lesson_number > current_lesson
  ORDER BY lesson_number
  LIMIT 1;

  RETURN next_lesson;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Helper function to get previous lesson
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_previous_lesson(current_lesson INTEGER)
RETURNS public.lessons AS $$
DECLARE
  prev_lesson public.lessons;
BEGIN
  SELECT * INTO prev_lesson
  FROM public.lessons
  WHERE lesson_number < current_lesson
  ORDER BY lesson_number DESC
  LIMIT 1;

  RETURN prev_lesson;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.lessons IS 'All 87 Pre-Algebra lessons mapped to B-day calendar (2025-2026)';
COMMENT ON COLUMN public.lessons.lesson_number IS 'Lesson number (1-87)';
COMMENT ON COLUMN public.lessons.date IS 'B-day calendar date for this lesson';
COMMENT ON COLUMN public.lessons.day_type IS 'Always "B" (B-day schedule)';
COMMENT ON COLUMN public.lessons.quarter IS 'Quarter (Q1, Q2, Q3, Q4)';
COMMENT ON COLUMN public.lessons.unit_number IS 'Unit number (1-4)';
COMMENT ON COLUMN public.lessons.unit_name IS 'Unit name (e.g., "Number Sense and Operations")';
COMMENT ON COLUMN public.lessons.standard_code IS 'Florida BEST standard code (e.g., MA.8.NSO.1.1)';
COMMENT ON COLUMN public.lessons.standard_title IS 'Full standard description';
COMMENT ON COLUMN public.lessons.strand IS 'Math strand (NSO, AR, GR, DP, FR)';
COMMENT ON COLUMN public.lessons.lesson_topic IS 'Specific lesson topic';
COMMENT ON COLUMN public.lessons.learning_objectives IS 'JSON array of learning objectives';
COMMENT ON COLUMN public.lessons.key_vocabulary IS 'JSON array of vocabulary terms';
COMMENT ON COLUMN public.lessons.materials_needed IS 'JSON array of materials';
COMMENT ON COLUMN public.lessons.xp_value IS 'XP awarded for completing lesson';
COMMENT ON COLUMN public.lessons.coin_value IS 'Coins awarded for completing lesson';
COMMENT ON COLUMN public.lessons.cognitive_complexity IS 'Florida cognitive complexity level';
COMMENT ON COLUMN public.lessons.integrated_mtr_standards IS 'JSON array of MTR standards';
COMMENT ON COLUMN public.lessons.status IS 'Lesson creation status';
COMMENT ON COLUMN public.lessons.notes IS 'Additional notes for teachers';
