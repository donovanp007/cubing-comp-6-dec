/**
 * Backfill final_scores for all old completed rounds
 * This fixes historical data where final_scores were never populated
 */

import { createClient } from "@/lib/supabase/client";
import { calculateRanking } from "./ranking";

export interface BackfillResult {
  total_rounds: number;
  rounds_with_scores: number;
  rounds_needing_backfill: number;
  successfully_backfilled: number;
  already_has_scores: number;
  failed_rounds: Array<{
    round_id: string;
    round_name: string;
    error: string;
  }>;
  total_students_backfilled: number;
  completion_time_ms: number;
}

export async function backfillAllFinalScores(): Promise<BackfillResult> {
  const startTime = Date.now();
  const supabase = createClient();

  try {
    // Step 1: Get all completed rounds
    const { data: allRounds, error: roundsError } = await supabase
      .from("rounds")
      .select("id, round_name, round_number, competition_event_id, status")
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (roundsError) {
      return {
        total_rounds: 0,
        rounds_with_scores: 0,
        rounds_needing_backfill: 0,
        successfully_backfilled: 0,
        already_has_scores: 0,
        failed_rounds: [
          {
            round_id: "error",
            round_name: "Failed to fetch rounds",
            error: roundsError.message,
          },
        ],
        total_students_backfilled: 0,
        completion_time_ms: Date.now() - startTime,
      };
    }

    if (!allRounds || allRounds.length === 0) {
      return {
        total_rounds: 0,
        rounds_with_scores: 0,
        rounds_needing_backfill: 0,
        successfully_backfilled: 0,
        already_has_scores: 0,
        failed_rounds: [],
        total_students_backfilled: 0,
        completion_time_ms: Date.now() - startTime,
      };
    }

    console.log(`[Backfill] Found ${allRounds.length} completed rounds`);

    let total_students_backfilled = 0;
    let successfully_backfilled = 0;
    let already_has_scores = 0;
    const failed_rounds: Array<{
      round_id: string;
      round_name: string;
      error: string;
    }> = [];

    // Step 2: For each round, check if final_scores exist
    for (const round of allRounds) {
      try {
        // Check if this round already has final_scores
        const { data: existingScores, error: checkError } = await supabase
          .from("final_scores")
          .select("id")
          .eq("round_id", round.id)
          .limit(1);

        if (checkError) {
          console.error(
            `[Backfill] Error checking final_scores for round ${round.id}:`,
            checkError
          );
          failed_rounds.push({
            round_id: round.id,
            round_name: round.round_name,
            error: checkError.message,
          });
          continue;
        }

        // If final_scores already exist, skip
        if (existingScores && existingScores.length > 0) {
          console.log(`[Backfill] Round ${round.round_name} already has scores`);
          already_has_scores++;
          continue;
        }

        // Step 3: Fetch all results for this round
        const { data: results, error: resultsError } = await supabase
          .from("results")
          .select("student_id, time_milliseconds, is_dnf")
          .eq("round_id", round.id)
          .order("student_id");

        if (resultsError) {
          console.error(
            `[Backfill] Error fetching results for round ${round.id}:`,
            resultsError
          );
          failed_rounds.push({
            round_id: round.id,
            round_name: round.round_name,
            error: resultsError.message,
          });
          continue;
        }

        if (!results || results.length === 0) {
          console.log(
            `[Backfill] Round ${round.round_name} has no results, skipping`
          );
          already_has_scores++;
          continue;
        }

        // Step 4: Group results by student
        const studentResults = new Map<
          string,
          Array<{ time: number | null; isDNF: boolean }>
        >();

        for (const result of results) {
          if (!studentResults.has(result.student_id)) {
            studentResults.set(result.student_id, []);
          }
          studentResults.get(result.student_id)!.push({
            time: result.is_dnf ? null : result.time_milliseconds,
            isDNF: result.is_dnf,
          });
        }

        // Step 5: Calculate final scores for each student
        const finalScoresToUpsert: Array<{
          student_id: string;
          round_id: string;
          best_time_milliseconds: number | null;
          average_time_milliseconds: number | null;
        }> = [];

        for (const [studentId, attempts] of studentResults.entries()) {
          const times = attempts.map((a) => a.time);
          const ranking = calculateRanking(times, "Average of 5");

          finalScoresToUpsert.push({
            student_id: studentId,
            round_id: round.id,
            best_time_milliseconds: ranking.bestTime || null,
            average_time_milliseconds: ranking.averageTime || null,
          });
        }

        // Step 6: Upsert all final_scores at once
        if (finalScoresToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from("final_scores")
            .upsert(finalScoresToUpsert);

          if (upsertError) {
            console.error(
              `[Backfill] Error upserting final_scores for round ${round.id}:`,
              upsertError
            );
            failed_rounds.push({
              round_id: round.id,
              round_name: round.round_name,
              error: upsertError.message,
            });
            continue;
          }

          console.log(
            `✅ [Backfill] Round ${round.round_name}: Backfilled ${finalScoresToUpsert.length} students`
          );
          successfully_backfilled++;
          total_students_backfilled += finalScoresToUpsert.length;
        }
      } catch (error) {
        console.error(
          `[Backfill] Unexpected error processing round ${round.id}:`,
          error
        );
        failed_rounds.push({
          round_id: round.id,
          round_name: round.round_name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const completionTime = Date.now() - startTime;

    console.log(`
[Backfill Summary]
- Total completed rounds: ${allRounds.length}
- Rounds already with scores: ${already_has_scores}
- Rounds successfully backfilled: ${successfully_backfilled}
- Failed rounds: ${failed_rounds.length}
- Total students backfilled: ${total_students_backfilled}
- Completion time: ${completionTime}ms
    `);

    return {
      total_rounds: allRounds.length,
      rounds_with_scores: already_has_scores,
      rounds_needing_backfill: allRounds.length - already_has_scores,
      successfully_backfilled,
      already_has_scores,
      failed_rounds,
      total_students_backfilled,
      completion_time_ms: completionTime,
    };
  } catch (error) {
    console.error("[Backfill] Fatal error:", error);
    return {
      total_rounds: 0,
      rounds_with_scores: 0,
      rounds_needing_backfill: 0,
      successfully_backfilled: 0,
      already_has_scores: 0,
      failed_rounds: [
        {
          round_id: "fatal",
          round_name: "Fatal error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ],
      total_students_backfilled: 0,
      completion_time_ms: Date.now() - startTime,
    };
  }
}
