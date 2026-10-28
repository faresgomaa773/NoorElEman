-- 1) Remove email from profiles (already in auth.users) and update trigger
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;

-- 2) Tighten profiles SELECT to authenticated only
DROP POLICY IF EXISTS "Profiles are viewable by everyone (leaderboard)" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

-- 3) Public leaderboard view (safe columns only)
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = true) AS
SELECT id, display_name, total_points
FROM public.profiles;
GRANT SELECT ON public.leaderboard TO anon, authenticated;

-- 4) Public questions view that hides correct_answer
CREATE OR REPLACE VIEW public.questions_public
WITH (security_invoker = true) AS
SELECT id, category, question_text, option_a, option_b, option_c, option_d, points, explanation
FROM public.questions;
GRANT SELECT ON public.questions_public TO anon, authenticated;

-- 5) Server-side validation trigger for quiz_attempts
CREATE OR REPLACE FUNCTION public.validate_quiz_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct TEXT;
  v_points INTEGER;
BEGIN
  SELECT correct_answer, points INTO v_correct, v_points
  FROM public.questions WHERE id = NEW.question_id;

  IF v_correct IS NULL THEN
    RAISE EXCEPTION 'Invalid question_id';
  END IF;

  NEW.is_correct := (NEW.selected_answer = v_correct);
  NEW.points_earned := CASE WHEN NEW.is_correct THEN v_points ELSE 0 END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_quiz_attempt_trigger ON public.quiz_attempts;
CREATE TRIGGER validate_quiz_attempt_trigger
  BEFORE INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.validate_quiz_attempt();

-- 6) Recreate auth user trigger (in case it was tied to old function signature)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();