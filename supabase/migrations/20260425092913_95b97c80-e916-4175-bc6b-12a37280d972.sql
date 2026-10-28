DROP VIEW IF EXISTS public.questions_public;

CREATE VIEW public.questions_public AS
SELECT id, category, question_text, option_a, option_b, option_c, option_d, points, explanation
FROM public.questions;

GRANT SELECT ON public.questions_public TO PUBLIC;