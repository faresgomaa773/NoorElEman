-- Restrict direct reads on questions: admins only.
-- Public/players use public.questions_public view which excludes correct_answer.
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;

CREATE POLICY "Admins can view questions"
  ON public.questions
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));