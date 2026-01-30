-- Migration 20260128_add_archetype_to_posts
-- BUG-003: Add archetype column to posts table for denormalized access

-- Purpose: Denormalize archetype name from equalizer_settings JSONB to dedicated column
-- Rationale: 
--   - Performance: Direct column access is faster than JSONB extraction
--   - Simplicity: Dashboard queries don't need JSONB parsing
--   - Consistency: Ensures archetype is always available even if JSON structure changes
-- Trade-off: Accepts denormalization for frequently accessed data (archetype displayed on every dashboard view)

-- 1. Add archetype column (nullable, as some posts may not have archetype)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS archetype TEXT;

COMMENT ON COLUMN public.posts.archetype IS 'Dénormalisation du nom de l''archétype depuis equalizer_settings->archetype->name. Utilisé pour affichage rapide dans le dashboard sans parsing JSONB.';

-- 2. Backfill existing posts from equalizer_settings JSONB
-- Idempotent: Only updates posts where archetype IS NULL (safe to re-run)
-- Validates JSON structure before extraction to prevent errors on corrupted data
UPDATE public.posts
SET archetype = (
  CASE 
    WHEN equalizer_settings IS NOT NULL 
      AND jsonb_typeof(equalizer_settings) = 'object'
      AND equalizer_settings::text != 'null'
      AND equalizer_settings::jsonb ? 'archetype'
      AND equalizer_settings::jsonb->'archetype' IS NOT NULL
      AND equalizer_settings::jsonb->'archetype'->>'name' IS NOT NULL
    THEN equalizer_settings::jsonb->'archetype'->>'name'
    ELSE NULL
  END
)
WHERE archetype IS NULL
  AND equalizer_settings IS NOT NULL
  AND jsonb_typeof(equalizer_settings) = 'object'
  AND equalizer_settings::text != 'null';

-- 3. Verify backfill (informational comment - not executed)
-- Run manually if needed: SELECT COUNT(*) FROM posts WHERE archetype IS NOT NULL;
-- Expected: All posts with equalizer_settings containing archetype.name should have archetype populated
