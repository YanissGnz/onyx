-- 002_profiles.sql
-- Creates the profiles table which stores user preferences, goals, and body metrics.
-- Each auth user has exactly one profile record (1:1 with auth.users).

-- Function: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg       DECIMAL(5,1),
  goal            TEXT CHECK (goal IN ('cut', 'maintain', 'bulk')),
  caloric_target  INTEGER,
  protein_target  INTEGER,
  equipment       TEXT[],
  preferred_split TEXT,
  session_duration INTEGER,  -- minutes
  training_days   INTEGER,   -- days per week
  preferred_ingredients TEXT[],
  excluded_ingredients   TEXT[],
  cuisine_style   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index: enforce 1:1 with auth.users (UNIQUE constraint above serves as index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Trigger: auto-update updated_at on row modification
CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Function: automatically create a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger: fires on INSERT to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TABLE public.profiles IS 'User profile data: goals, body metrics, training & nutrition preferences.';
COMMENT ON COLUMN public.profiles.user_id IS 'References auth.users(id). Unique — one profile per user.';
COMMENT ON COLUMN public.profiles.goal IS 'Fitness goal: cut (lose fat), maintain (recomp), bulk (gain muscle).';
COMMENT ON TRIGGER set_profiles_updated_at ON public.profiles IS 'Auto-sets updated_at on any row modification.';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates a profile row when a new auth user signs up.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Fires handle_new_user() after each auth.users insert.';
