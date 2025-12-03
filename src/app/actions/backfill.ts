"use server";

import { backfillAllFinalScores, type BackfillResult } from "@/lib/utils/backfill-final-scores";

export async function runBackfillFinalScores(): Promise<BackfillResult> {
  try {
    const result = await backfillAllFinalScores();
    return result;
  } catch (error) {
    console.error("Error in runBackfillFinalScores:", error);
    return {
      total_rounds: 0,
      rounds_with_scores: 0,
      rounds_needing_backfill: 0,
      successfully_backfilled: 0,
      already_has_scores: 0,
      failed_rounds: [
        {
          round_id: "error",
          round_name: "Server action failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ],
      total_students_backfilled: 0,
      completion_time_ms: 0,
    };
  }
}
