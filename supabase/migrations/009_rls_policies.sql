-- 009_rls_policies.sql
-- Row-Level Security policies for the profiles table and placeholder policies
-- for future tables. Ensures users can only access their own data.

-- ============================================================================
-- PROFILES table RLS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: user can read only their own profile
CREATE POLICY select_profiles_owner ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: user can insert only their own profile (trigger handles creation)
CREATE POLICY insert_profiles_owner ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: user can update only their own profile
CREATE POLICY update_profiles_owner ON public.profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: user can delete only their own profile
CREATE POLICY delete_profiles_owner ON public.profiles
  FOR DELETE
  USING (user_id = auth.uid());

-- Helper view: convenient way for frontend to access the current user's profile
CREATE OR REPLACE VIEW public.users AS
  SELECT * FROM public.profiles WHERE user_id = auth.uid();

COMMENT ON VIEW public.users IS 'Convenience view: SELECT * FROM users returns the current authenticated user''s profile.';

-- ============================================================================
-- Placeholder RLS policies for future tables
-- Activate these by uncommenting when the corresponding tables are created.
-- ============================================================================

-- -- workout_plans
-- ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY select_workout_plans_owner ON public.workout_plans FOR SELECT USING (user_id = auth.uid());
-- CREATE POLICY insert_workout_plans_owner ON public.workout_plans FOR INSERT WITH CHECK (user_id = auth.uid());
-- CREATE POLICY update_workout_plans_owner ON public.workout_plans FOR UPDATE USING (user_id = auth.uid());
-- CREATE POLICY delete_workout_plans_owner ON public.workout_plans FOR DELETE USING (user_id = auth.uid());

-- -- exercise_templates
-- ALTER TABLE public.exercise_templates ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY select_exercise_templates_owner ON public.exercise_templates FOR SELECT USING (user_id = auth.uid());
-- CREATE POLICY insert_exercise_templates_owner ON public.exercise_templates FOR INSERT WITH CHECK (user_id = auth.uid());
-- CREATE POLICY update_exercise_templates_owner ON public.exercise_templates FOR UPDATE USING (user_id = auth.uid());
-- CREATE POLICY delete_exercise_templates_owner ON public.exercise_templates FOR DELETE USING (user_id = auth.uid());

-- -- workout_sessions
-- ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY select_workout_sessions_owner ON public.workout_sessions FOR SELECT USING (user_id = auth.uid());
-- CREATE POLICY insert_workout_sessions_owner ON public.workout_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
-- CREATE POLICY update_workout_sessions_owner ON public.workout_sessions FOR UPDATE USING (user_id = auth.uid());
-- CREATE POLICY delete_workout_sessions_owner ON public.workout_sessions FOR DELETE USING (user_id = auth.uid());

-- -- personal_meals
-- ALTER TABLE public.personal_meals ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY select_personal_meals_owner ON public.personal_meals FOR SELECT USING (user_id = auth.uid());
-- CREATE POLICY insert_personal_meals_owner ON public.personal_meals FOR INSERT WITH CHECK (user_id = auth.uid());
-- CREATE POLICY update_personal_meals_owner ON public.personal_meals FOR UPDATE USING (user_id = auth.uid());
-- CREATE POLICY delete_personal_meals_owner ON public.personal_meals FOR DELETE USING (user_id = auth.uid());

-- -- meal_logs
-- ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY select_meal_logs_owner ON public.meal_logs FOR SELECT USING (user_id = auth.uid());
-- CREATE POLICY insert_meal_logs_owner ON public.meal_logs FOR INSERT WITH CHECK (user_id = auth.uid());
-- CREATE POLICY update_meal_logs_owner ON public.meal_logs FOR UPDATE USING (user_id = auth.uid());
-- CREATE POLICY delete_meal_logs_owner ON public.meal_logs FOR DELETE USING (user_id = auth.uid());

-- -- weight_logs
-- ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY select_weight_logs_owner ON public.weight_logs FOR SELECT USING (user_id = auth.uid());
-- CREATE POLICY insert_weight_logs_owner ON public.weight_logs FOR INSERT WITH CHECK (user_id = auth.uid());
-- CREATE POLICY update_weight_logs_owner ON public.weight_logs FOR UPDATE USING (user_id = auth.uid());
-- CREATE POLICY delete_weight_logs_owner ON public.weight_logs FOR DELETE USING (user_id = auth.uid());