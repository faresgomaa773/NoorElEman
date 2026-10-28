-- Recreate questions_public WITHOUT security_invoker so it bypasses the
-- admin-only RLS on the base questions table. The view itself only
-- exposes safe columns (no correct_answer).
DROP VIEW IF EXISTS public.questions_public;

CREATE VIEW public.questions_public AS
SELECT id, category, question_text, option_a, option_b, option_c, option_d, points, explanation
FROM public.questions;

GRANT SELECT ON public.questions_public TO anon, authenticated;

-- Same treatment for leaderboard view so anon users can still see it
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard AS
SELECT id, display_name, total_points
FROM public.profiles;

GRANT SELECT ON public.leaderboard TO anon, authenticated;