-- Switch back to security_invoker views (safer default per linter)
DROP VIEW IF EXISTS public.questions_public;
CREATE VIEW public.questions_public
WITH (security_invoker = true) AS
SELECT id, category, question_text, option_a, option_b, option_c, option_d, points, explanation
FROM public.questions;
GRANT SELECT ON public.questions_public TO anon, authenticated;

DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard
WITH (security_invoker = true) AS
SELECT id, display_name, total_points
FROM public.profiles;
GRANT SELECT ON public.leaderboard TO anon, authenticated;

-- Restore broad RLS read on questions, but protect correct_answer via column GRANTs
DROP POLICY IF EXISTS "Admins can view questions" ON public.questions;

CREATE POLICY "Questions are viewable by everyone"
  ON public.questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Column-level privilege lockdown: revoke broad access, then grant safe columns only
REVOKE SELECT ON public.questions FROM anon, authenticated;

GRANT SELECT (id, category, question_text, option_a, option_b, option_c, option_d, points, explanation, created_at, updated_at)
  ON public.questions TO anon, authenticated;

-- Admins need full access (including correct_answer) for the admin panel.
-- The has_role() check happens via RLS; column GRANTs gate which columns
-- the role can ever request. Grant full column access to authenticated;
-- non-admin authenticated users are still blocked at the row level only if we
-- had a restrictive RLS — but we don't. So instead we keep authenticated
-- limited to safe columns and use a SECURITY DEFINER RPC for admin reads.
-- Simplest: allow authenticated to read all columns; admin panel filters via UI.
-- However, that re-exposes correct_answer to any logged-in user.
--
-- Correct approach: only the 'authenticator' role inheriting admin should see
-- the column. Since Supabase has no separate admin SQL role, expose admin reads
-- via a SECURITY DEFINER function instead.

CREATE OR REPLACE FUNCTION public.admin_get_questions()
RETURNS SETOF public.questions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY SELECT * FROM public.questions ORDER BY created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_questions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_questions() TO authenticated;