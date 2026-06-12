-- 001_users.sql
-- Enables required extensions for the project.
-- Profile creation trigger is in 002_profiles.sql (after the profiles table exists).

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

COMMENT ON EXTENSION "pgcrypto" IS 'Provides gen_random_uuid() for UUID generation across all tables.';