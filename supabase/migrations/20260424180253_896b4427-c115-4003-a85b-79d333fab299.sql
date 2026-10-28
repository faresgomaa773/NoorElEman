-- RPC: validate a quiz answer server-side and return the correct answer.
-- Works for both authenticated users (records attempt) and guests (validation only).
CREATE OR REPLACE FUNCTION public.submit_quiz_answer(
  _question_id uuid,
  _selected_answer text
)
RETURNS TABLE (
  is_correct boolean,
  points_earned integer,
  correct_answer text,
  explanation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct text;
  v_points integer;
  v_explanation text;
  v_is_correct boolean;
  v_earned integer;
  v_user uuid;
BEGIN
  SELECT q.correct_answer, q.points, q.explanation
    INTO v_correct, v_points, v_explanation
  FROM public.questions q
  WHERE q.id = _question_id;

  IF v_correct IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  v_is_correct := (lower(_selected_answer) = lower(v_correct));
  v_earned := CASE WHEN v_is_correct THEN v_points ELSE 0 END;

  v_user := auth.uid();
  IF v_user IS NOT NULL THEN
    -- Record the attempt; the existing BEFORE INSERT trigger will recompute
    -- is_correct/points_earned authoritatively.
    INSERT INTO public.quiz_attempts (user_id, question_id, selected_answer, is_correct, points_earned)
    VALUES (v_user, _question_id, _selected_answer, v_is_correct, v_earned);
  END IF;

  RETURN QUERY SELECT v_is_correct, v_earned, v_correct, v_explanation;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_quiz_answer(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_answer(uuid, text) TO anon, authenticated;