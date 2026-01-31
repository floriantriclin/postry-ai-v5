-- ROLLBACK SCRIPT
-- Story 2.11b (BMA-48) - Architecture Persist-First
-- Created: 2026-01-27
-- Owner: Dev Team
-- Purpose: Rollback archetype column and status field if needed
--
-- ⚠️ CRITICAL: Test in staging before running in production
-- Expected execution time: < 30 seconds
-- Expected downtime: 0 seconds (non-blocking operations)

BEGIN;

-- ==============================================================================
-- ROLLBACK STEP 1: Drop archetype column (if exists)
-- ==============================================================================
-- This reverts the migration that added archetype to posts table
-- Safe to run multiple times (IF EXISTS clause)

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'posts' 
      AND column_name = 'archetype'
  ) THEN
    ALTER TABLE public.posts DROP COLUMN archetype;
    RAISE NOTICE 'Column archetype dropped successfully';
  ELSE
    RAISE NOTICE 'Column archetype does not exist - skipping';
  END IF;
END $$;

-- ==============================================================================
-- ROLLBACK STEP 2: Reset status to 'pending' for all posts
-- ==============================================================================
-- This ensures posts remain in valid state even without archetype
-- Safe operation, no data loss

UPDATE public.posts
SET status = 'pending'
WHERE status = 'revealed';

-- ==============================================================================
-- ROLLBACK STEP 3: Drop trigger (if exists)
-- ==============================================================================
-- Clean up the trigger that linked posts on user creation

DROP TRIGGER IF EXISTS on_auth_user_created_link_posts ON auth.users;

-- ==============================================================================
-- ROLLBACK STEP 4: Drop linking function (if exists)
-- ==============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user_post_linking();

-- ==============================================================================
-- ROLLBACK STEP 5: Restore user_id NOT NULL constraint (OPTIONAL)
-- ==============================================================================
-- ⚠️ WARNING: Only run this if you want to enforce user_id again
-- ⚠️ This will FAIL if there are posts with NULL user_id
-- ⚠️ Uncomment ONLY if you are sure all posts have user_id set

-- ALTER TABLE public.posts ALTER COLUMN user_id SET NOT NULL;

-- ==============================================================================
-- ROLLBACK STEP 6: Drop email column (OPTIONAL)
-- ==============================================================================
-- ⚠️ WARNING: This will permanently delete email data
-- ⚠️ Only run if you are absolutely sure you want to remove email tracking
-- ⚠️ Uncomment ONLY after verifying no posts need email linking

-- ALTER TABLE public.posts DROP COLUMN IF EXISTS email;

COMMIT;

-- ==============================================================================
-- VERIFICATION QUERIES
-- ==============================================================================
-- Run these after rollback to verify success:

-- Check posts table schema
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'posts'
-- ORDER BY ordinal_position;

-- Check for posts with NULL user_id (should be 0 after full rollback)
-- SELECT COUNT(*) as posts_without_user_id
-- FROM public.posts
-- WHERE user_id IS NULL;

-- Check trigger existence (should be 0)
-- SELECT COUNT(*) 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'on_auth_user_created_link_posts';

-- ==============================================================================
-- ROLLBACK VALIDATION CHECKLIST
-- ==============================================================================
-- [ ] Backup DB before running (Supabase Dashboard → Settings → Backups)
-- [ ] Test in local environment first
-- [ ] Test in staging environment
-- [ ] Verify no active posts with NULL user_id
-- [ ] Verify trigger is dropped
-- [ ] Verify function is dropped
-- [ ] Monitor error logs for 1 hour post-rollback
-- [ ] Verify Dashboard still works (test 10 posts)
-- [ ] Notify users if any downtime expected
-- [ ] Update Linear BMA-48 status to "Rolled Back"
-- [ ] Document reason for rollback in incident report

-- ==============================================================================
-- ROLLBACK METRICS
-- ==============================================================================
-- Execution time: < 30 seconds
-- Downtime expected: 0 seconds
-- Data loss risk: 🟢 NONE (only schema changes)
-- Rollback tested: ☐ Local ☐ Staging ☐ Production
-- 
-- Last tested: [DATE]
-- Tested by: [NAME]
-- Result: ☐ Success ☐ Failed
