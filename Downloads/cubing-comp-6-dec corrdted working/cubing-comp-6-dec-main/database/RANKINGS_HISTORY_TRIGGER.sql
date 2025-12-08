-- =====================================================
-- RANKINGS HISTORY TRIGGER
-- Automatically update student_competition_history when final_scores are recorded
-- This ensures the rankings page always has current data
-- =====================================================

-- Create a function to update student_competition_history from final_scores
CREATE OR REPLACE FUNCTION public.sync_competition_history()
RETURNS TRIGGER AS $$
DECLARE
  v_round_id UUID;
  v_competition_id UUID;
  v_event_type_id UUID;
  v_is_pb_single BOOLEAN := FALSE;
  v_is_pb_average BOOLEAN := FALSE;
  v_prev_pb_single INTEGER;
  v_prev_pb_average INTEGER;
  v_improvement_single DECIMAL(5,2);
  v_improvement_average DECIMAL(5,2);
BEGIN
  -- Get round and competition details
  SELECT r.id, r.competition_id, ce.event_type_id
  INTO v_round_id, v_competition_id, v_event_type_id
  FROM rounds r
  JOIN competition_events ce ON r.competition_event_id = ce.id
  WHERE r.id = NEW.round_id;

  IF v_round_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get previous personal best
  SELECT best_single_milliseconds, best_average_milliseconds
  INTO v_prev_pb_single, v_prev_pb_average
  FROM personal_bests
  WHERE student_id = NEW.student_id
  AND event_type_id = v_event_type_id;

  -- Check if this is a new personal best
  IF v_prev_pb_single IS NULL OR (NEW.best_time_milliseconds > 0 AND NEW.best_time_milliseconds < v_prev_pb_single) THEN
    v_is_pb_single := TRUE;
    IF v_prev_pb_single IS NOT NULL THEN
      v_improvement_single := ((v_prev_pb_single - NEW.best_time_milliseconds) / v_prev_pb_single) * 100;
    END IF;
  END IF;

  IF v_prev_pb_average IS NULL OR (NEW.average_time_milliseconds > 0 AND NEW.average_time_milliseconds < v_prev_pb_average) THEN
    v_is_pb_average := TRUE;
    IF v_prev_pb_average IS NOT NULL THEN
      v_improvement_average := ((v_prev_pb_average - NEW.average_time_milliseconds) / v_prev_pb_average) * 100;
    END IF;
  END IF;

  -- Upsert into student_competition_history
  INSERT INTO student_competition_history (
    student_id,
    competition_id,
    event_type_id,
    final_score_id,
    best_single_milliseconds,
    best_average_milliseconds,
    is_pb_single,
    is_pb_average,
    previous_pb_single_milliseconds,
    previous_pb_average_milliseconds,
    improvement_percent_single,
    improvement_percent_average,
    updated_at
  ) VALUES (
    NEW.student_id,
    v_competition_id,
    v_event_type_id,
    NEW.id,
    CASE WHEN NEW.best_time_milliseconds > 0 THEN NEW.best_time_milliseconds ELSE NULL END,
    CASE WHEN NEW.average_time_milliseconds > 0 THEN NEW.average_time_milliseconds ELSE NULL END,
    v_is_pb_single,
    v_is_pb_average,
    v_prev_pb_single,
    v_prev_pb_average,
    v_improvement_single,
    v_improvement_average,
    NOW()
  )
  ON CONFLICT (student_id, competition_id, event_type_id)
  DO UPDATE SET
    final_score_id = NEW.id,
    best_single_milliseconds = CASE WHEN NEW.best_time_milliseconds > 0 THEN NEW.best_time_milliseconds ELSE student_competition_history.best_single_milliseconds END,
    best_average_milliseconds = CASE WHEN NEW.average_time_milliseconds > 0 THEN NEW.average_time_milliseconds ELSE student_competition_history.best_average_milliseconds END,
    is_pb_single = v_is_pb_single,
    is_pb_average = v_is_pb_average,
    previous_pb_single_milliseconds = v_prev_pb_single,
    previous_pb_average_milliseconds = v_prev_pb_average,
    improvement_percent_single = v_improvement_single,
    improvement_percent_average = v_improvement_average,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_competition_history ON final_scores;

-- Create trigger on final_scores insert/update
CREATE TRIGGER trigger_sync_competition_history
AFTER INSERT OR UPDATE ON final_scores
FOR EACH ROW
EXECUTE FUNCTION public.sync_competition_history();

-- Index for fast lookups in the rankings query
CREATE INDEX IF NOT EXISTS idx_student_comp_history_student_competition
  ON student_competition_history(student_id, competition_id);
CREATE INDEX IF NOT EXISTS idx_student_comp_history_best_times
  ON student_competition_history(best_single_milliseconds, best_average_milliseconds);

COMMIT;
