-- Drop the security-definer view that the linter flags
DROP VIEW IF EXISTS public.questions_public;

-- Create a stable SQL function that returns quiz questions without correct_answer
-- Using security definer so it can read questions table while keeping that table admin-only
CREATE OR REPLACE FUNCTION public.get_public_questions()
RETURNS TABLE (
  id uuid,
  category text,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  points integer,
  explanation text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.category, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.points, q.explanation
  FROM public.questions q
  ORDER BY random();
$$;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION public.get_public_questions() TO PUBLIC;