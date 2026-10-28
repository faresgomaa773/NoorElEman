-- Recreate questions_public with security_invoker=true so RLS policies apply per user
DROP VIEW IF EXISTS public.questions_public;

CREATE VIEW public.questions_public
WITH (security_invoker = true) AS
SELECT id, category, question_text, option_a, option_b, option_c, option_d, points, explanation
FROM public.questions;

-- Grant select on the view to public so authenticated users can read
GRANT SELECT ON public.questions_public TO PUBLIC;