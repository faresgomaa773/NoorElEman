-- Fix 1: Restrict questions table SELECT to admins only
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
DROP POLICY IF EXISTS "Admins can view all questions" ON public.questions;

CREATE POLICY "Admins can view all questions"
ON public.questions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Fix 2: Recreate questions_public as security_definer (owner privileges) so public can read via view
CREATE OR REPLACE VIEW public.questions_public AS
SELECT id, category, question_text, option_a, option_b, option_c, option_d, points, explanation
FROM public.questions;

-- Fix 3: Restrict profiles SELECT to own profile only
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);