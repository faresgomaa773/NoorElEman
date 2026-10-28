-- Fix: Prevent users from directly updating their own total_points in profiles
-- total_points should only be updated via server-side quiz submission logic

CREATE OR REPLACE FUNCTION public.prevent_points_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.total_points IS DISTINCT FROM OLD.total_points THEN
    RAISE EXCEPTION 'total_points cannot be modified directly';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_points_self_update_trigger ON public.profiles;

CREATE TRIGGER prevent_points_self_update_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_points_self_update();