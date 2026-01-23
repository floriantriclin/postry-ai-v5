-- Migration 20260123_update_posts_schema_and_trigger

-- 1. Update posts schema
-- Make user_id optional for pre-persistence
ALTER TABLE public.posts ALTER COLUMN user_id DROP NOT NULL;

-- Add email for pre-auth tracking
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS email text;

-- Add status to distinguish revealed posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

COMMENT ON COLUMN public.posts.email IS 'Utilisé pour lier le post à l''utilisateur avant confirmation de l''auth';
COMMENT ON COLUMN public.posts.status IS 'pending: généré mais non révélé, revealed: associé à un compte confirmé';

-- 2. Create function to link anonymous posts to new user
CREATE OR REPLACE FUNCTION public.handle_new_user_post_linking()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET user_id = NEW.id,
      status = 'revealed'
  WHERE email = NEW.email
    AND status = 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_link_posts ON auth.users;
CREATE TRIGGER on_auth_user_created_link_posts
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_post_linking();
